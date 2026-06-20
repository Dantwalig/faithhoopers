import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendEmail, resetPasswordEmailHtml, getAppUrl } from '@/lib/email/send'
import { generateResetToken, newResetExpiry } from '@/lib/auth/verification'

const schema = z.object({ email: z.string().email() })

// POST /api/forgot-password — email a password-reset link.
// Always responds with success, regardless of whether the email exists,
// so this endpoint can't be used to probe which emails have accounts.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }
    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = generateResetToken()
    const expiresAt = newResetExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: token, resetCodeExpiresAt: expiresAt },
    })

    await sendEmail({
      to: user.email,
      subject: 'Reset your password — Faith Hoopers',
      html: resetPasswordEmailHtml({ name: user.name, link: `${getAppUrl()}/reset-password?token=${token}` }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
