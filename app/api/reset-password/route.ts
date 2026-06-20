import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { attachSessionCookie } from '@/lib/auth/session'
import { Role } from '@/lib/enums'

const schema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
})

// POST /api/reset-password — finish a forgot-password flow, OR set the
// first-ever password for an account created on someone else's behalf
// (admin invite from the seed script, or a parent account auto-created
// when their child registered). All three use the same token/link, since
// the underlying action is identical: prove access to the inbox, then
// choose a password. Signs the person in afterward either way.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input: ' + parsed.error.issues[0].message }, { status: 400 })
    }
    const { token, newPassword } = parsed.data

    const user = await prisma.user.findFirst({ where: { resetCode: token } })
    if (!user) {
      return NextResponse.json({ error: 'This link is invalid or has already been used.' }, { status: 404 })
    }
    if (!user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This link has expired. Request a new one.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordSet: true,
        emailVerified: true,
        resetCode: null,
        resetCodeExpiresAt: null,
      },
    })

    const response = NextResponse.json({ success: true })
    return attachSessionCookie(response, {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as Role,
    })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
