import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendEmail, welcomeEmailHtml } from '@/lib/email/send'
import { attachSessionCookie } from '@/lib/auth/session'
import { Role } from '@/lib/enums'

const schema = z.object({ token: z.string().min(10) })

// POST /api/verify-email — confirm a self-registered account's email using
// the token from their verification link. On success, also signs them in
// (their password was already set during registration) so the client can
// take them straight to their dashboard.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'This link is invalid.' }, { status: 400 })
    }
    const { token } = parsed.data

    const user = await prisma.user.findFirst({ where: { verificationCode: token } })
    if (!user) {
      return NextResponse.json({ error: 'This link is invalid or has already been used.' }, { status: 404 })
    }

    if (user.emailVerified) {
      // Already verified (e.g. the link was clicked twice, or a tab was
      // left open) — still sign them in so the link keeps working.
      const response = NextResponse.json({ success: true, alreadyVerified: true })
      return attachSessionCookie(response, { id: user.id, name: user.name, email: user.email, role: user.role as Role })
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This link has expired.', email: user.email }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    })

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Faith Hoopers! 🎉',
      html: welcomeEmailHtml({ name: user.name }),
    })

    const response = NextResponse.json({ success: true })
    return attachSessionCookie(response, { id: user.id, name: user.name, email: user.email, role: user.role as Role })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
