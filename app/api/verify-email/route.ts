import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendEmail, welcomeEmailHtml } from '@/lib/email/send'

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
})

// POST /api/verify-email — confirm a user's email with their 6-digit code.
// If the account doesn't have a real password yet (auto-created parent
// accounts), the response says so and the client should call
// /api/set-password next using the same code to finish activation.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }
    const { code } = parsed.data
    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with that email.' }, { status: 404 })
    }

    if (user.emailVerified && user.passwordSet) {
      return NextResponse.json({ success: true, alreadyVerified: true, needsPassword: false })
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: 'Incorrect code. Please check and try again.' }, { status: 400 })
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This code has expired. Request a new one.' }, { status: 400 })
    }

    const needsPassword = !user.passwordSet

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        // Keep the code around if a password still needs to be set — the
        // set-password endpoint re-checks it before letting the password
        // change through. Otherwise, clear it.
        verificationCode: needsPassword ? user.verificationCode : null,
        verificationCodeExpiresAt: needsPassword ? user.verificationCodeExpiresAt : null,
      },
    })

    if (!needsPassword) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Faith Hoopers! 🎉',
        html: welcomeEmailHtml({ name: user.name }),
      })
    }

    return NextResponse.json({ success: true, needsPassword })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
