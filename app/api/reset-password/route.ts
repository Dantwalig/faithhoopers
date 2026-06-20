import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  newPassword: z.string().min(8),
})

// POST /api/reset-password — finish a forgot-password flow, or set the
// initial password for an account that was created for someone else (e.g.
// an admin account set up via the seed script). Requires the code emailed
// by /api/forgot-password (or the admin-invite email).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input: ' + parsed.error.issues[0].message }, { status: 400 })
    }
    const { code, newPassword } = parsed.data
    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with that email.' }, { status: 404 })
    }
    if (!user.resetCode || user.resetCode !== code) {
      return NextResponse.json({ error: 'Incorrect or expired code. Request a new one.' }, { status: 400 })
    }
    if (!user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This code has expired. Request a new one.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordSet: true,
        emailVerified: true,
        resetCode: null,
        resetCodeExpiresAt: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
