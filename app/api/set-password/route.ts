import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendEmail, welcomeEmailHtml } from '@/lib/email/send'

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  newPassword: z.string().min(8),
})

// POST /api/set-password — last step for accounts that were auto-created on
// someone else's behalf (e.g. a parent created automatically when their
// child registered). Requires the same verification code used to confirm
// the email, so this only works right after a successful /api/verify-email
// call that returned needsPassword: true.
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
    if (user.passwordSet) {
      return NextResponse.json({ error: 'A password is already set for this account.' }, { status: 409 })
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email first.' }, { status: 400 })
    }
    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: 'Incorrect or expired code. Please verify again.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordSet: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    })

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Faith Hoopers! 🎉',
      html: welcomeEmailHtml({ name: user.name }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[set-password]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
