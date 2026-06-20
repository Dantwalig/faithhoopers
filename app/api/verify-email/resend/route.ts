import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendEmail, verificationEmailHtml, getAppUrl } from '@/lib/email/send'
import { generateVerificationToken, newVerificationExpiry } from '@/lib/auth/verification'

const schema = z.object({ email: z.string().email() })

// POST /api/verify-email/resend — issue a fresh verification link if the
// old one expired or never arrived. Only applies to self-registered
// accounts (players/coaches/facilitators) — auto-created parent/admin
// accounts use the "set password" link instead (see /forgot-password).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }
    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })
    // Don't reveal whether the email exists — respond the same either way.
    // Also skip accounts that don't use this flow (already verified, or no
    // password set yet, which means they should use the set-password link).
    if (!user || user.emailVerified || !user.passwordSet) {
      return NextResponse.json({ success: true })
    }

    const token = generateVerificationToken()
    const expiresAt = newVerificationExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: token, verificationCodeExpiresAt: expiresAt },
    })

    await sendEmail({
      to: user.email,
      subject: 'Your new verification link — Faith Hoopers',
      html: verificationEmailHtml({ name: user.name, link: `${getAppUrl()}/verify?token=${token}` }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-email/resend]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
