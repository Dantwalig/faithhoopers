import { PrismaClient } from '@prisma/client'
import { Role } from '../lib/enums'
import bcrypt from 'bcryptjs'
import { sendEmail, setPasswordEmailHtml, getAppUrl } from '../lib/email/send'
import { generateResetToken, newInviteExpiry } from '../lib/auth/verification'

const prisma = new PrismaClient()

// The three real admin accounts for the people who'll actually run the platform.
// These get created with no usable password — instead they're emailed a
// "set password" link and use it to choose their own password. Re-running
// the seed will NOT resend the email to an admin who has already set their
// password (passwordSet: true), so it's safe to run this multiple times.
const REAL_ADMINS = [
  { name: 'Joshua Kacyira', email: 'joshuakacyira@gmail.com' },
  { name: 'Faith Hoopers', email: 'faithhooperscamp@gmail.com' },
  { name: 'Daniel G. Ntwali', email: 'danielgntwali@gmail.com' },
]

async function main() {
  console.log('🌱 Seeding database...')

  const appUrl = getAppUrl()

  for (const { name, email: rawEmail } of REAL_ADMINS) {
    const email = rawEmail.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing?.passwordSet) {
      console.log(`  ↪ Admin ${email} already has a password set — skipping invite.`)
      continue
    }

    const token = generateResetToken()
    const expiresAt = newInviteExpiry()
    const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10)

    await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        emailVerified: true,
        resetCode: token,
        resetCodeExpiresAt: expiresAt,
      },
      create: {
        name,
        email,
        password: placeholderPassword,
        role: Role.ADMIN,
        emailVerified: true,
        passwordSet: false,
        resetCode: token,
        resetCodeExpiresAt: expiresAt,
      },
    })

    const link = `${appUrl}/reset-password?token=${token}&context=invite`

    const { sent } = await sendEmail({
      to: email,
      subject: 'Set up your Faith Hoopers admin account',
      html: setPasswordEmailHtml({ name, link, reason: 'admin' }),
    })

    console.log(`  ↪ Admin invite ${sent ? 'sent ✓' : 'NOT sent (check GMAIL_USER / GMAIL_APP_PASSWORD)'} to ${email}`)
    if (!sent) console.log(`    Setup link: ${link}`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\n👤 Admin accounts:')
  for (const { email } of REAL_ADMINS) {
    console.log(`  ${email.trim().toLowerCase()}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
