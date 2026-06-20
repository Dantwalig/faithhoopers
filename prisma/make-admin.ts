// One-off CLI script to promote an existing user to Admin.
//
// Usage:
//   npm run admin:promote -- you@example.com
//
// Why this exists instead of editing the Supabase Table Editor by hand:
// promoting someone to Admin actually requires three columns to change
// together (role, emailVerified, passwordSet) — easy to get one wrong by
// hand, and a half-done edit can leave an account stuck unable to log in.
// This script does all three atomically and tells you clearly what happened.
//
// The person must already have an account (they need to have registered
// through /register as a Player, Coach, or Facilitator first) — this script
// only changes their role, it doesn't create a new account from scratch.

import { PrismaClient } from '@prisma/client'
import { Role } from '../lib/enums'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()

  if (!email) {
    console.error('\n❌ Missing email.\n\nUsage:\n  npm run admin:promote -- you@example.com\n')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.error(`\n❌ No account found for "${email}".\n`)
    console.error('They need to register at /register first (any role — Player, Coach,')
    console.error('or Facilitator all work, since this script just changes their role')
    console.error('afterward), then run this script again with that same email.\n')
    process.exit(1)
  }

  if (user.role === Role.ADMIN) {
    console.log(`\n✅ "${user.name}" (${email}) is already an Admin. Nothing to do.\n`)
    process.exit(0)
  }

  const previousRole = user.role

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: Role.ADMIN,
      emailVerified: true,
      passwordSet: true,
    },
  })

  console.log(`\n✅ "${user.name}" (${email}) is now an Admin.`)
  console.log(`   (was: ${previousRole}, also marked email-verified so they can log in immediately)\n`)
}

main()
  .catch((err) => {
    console.error('\n❌ Something went wrong:\n', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
