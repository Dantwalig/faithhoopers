import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendEmail, verificationEmailHtml } from '@/lib/email/send'
import { generateVerificationCode, newVerificationExpiry } from '@/lib/auth/verification'

const schema = z.object({ email: z.string().email() })

// POST /api/verify-email/resend — issue a fresh code if the old one expired
// or never arrived.
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
    if (!user || (user.emailVerified && user.passwordSet)) {
      return NextResponse.json({ success: true })
    }

    const code = generateVerificationCode()
    const expiresAt = newVerificationExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code, verificationCodeExpiresAt: expiresAt },
    })

    await sendEmail({
      to: user.email,
      subject: 'Your new verification code — Faith Hoopers',
      html: verificationEmailHtml({ name: user.name, code, isParentInvite: !user.passwordSet }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-email/resend]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
