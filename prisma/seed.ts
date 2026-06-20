import { PrismaClient } from '@prisma/client'
import { Role, SessionType } from '../lib/enums'
import bcrypt from 'bcryptjs'
import { sendEmail, adminInviteEmailHtml } from '../lib/email/send'
import { generateResetCode, newVerificationExpiry } from '../lib/auth/verification'

const prisma = new PrismaClient()

// Real admin accounts for the people who'll actually run the platform.
// These get created with no usable password — instead they're emailed a
// setup code and use the "Forgot password" flow (/forgot-password) to set
// their own password. Re-running the seed will NOT resend the email to an
// admin who has already set their password (passwordSet: true), so it's
// safe to run this multiple times.
const REAL_ADMINS = [
  { name: 'Joshua Kacyira', email: 'joshuakacyira@gmail.com' },
  { name: 'Faith Hoopers', email: 'faithhoopers@gmail.com' },
  { name: 'Daniel G. Ntwali', email: 'danielgntwali@gmail.com' },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create/invite the real admin accounts.
  for (const { name, email: rawEmail } of REAL_ADMINS) {
    const email = rawEmail.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing?.passwordSet) {
      console.log(`  ↪ Admin ${email} already has a password set — skipping invite.`)
      continue
    }

    const code = generateResetCode()
    const expiresAt = newVerificationExpiry() // 24h — this is a one-time setup link
    const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10)

    await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        emailVerified: true,
        resetCode: code,
        resetCodeExpiresAt: expiresAt,
      },
      create: {
        name,
        email,
        password: placeholderPassword,
        role: Role.ADMIN,
        emailVerified: true,
        passwordSet: false,
        resetCode: code,
        resetCodeExpiresAt: expiresAt,
      },
    })

    const { sent } = await sendEmail({
      to: email,
      subject: 'Set up your Faith Hoopers admin account',
      html: adminInviteEmailHtml({ name, code }),
    })

    console.log(`  ↪ Admin invite ${sent ? 'sent' : 'NOT sent (RESEND_API_KEY not set)'} to ${email} — code: ${code}`)
  }

  // Demo/test admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@faithhoopers.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'Faith Hoopers Admin',
      email: 'admin@faithhoopers.com',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      passwordSet: true,
    },
  })

  // Create coach
  const coachPassword = await bcrypt.hash('coach123', 12)
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach.james@faithhoopers.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'Coach James',
      email: 'coach.james@faithhoopers.com',
      password: coachPassword,
      role: Role.COACH,
      emailVerified: true,
      passwordSet: true,
      coach: {
        create: { specialty: 'Point Guard Training' },
      },
    },
    include: { coach: true },
  })

  // Create facilitator
  const facilitatorPassword = await bcrypt.hash('facilitator123', 12)
  const facilitatorUser = await prisma.user.upsert({
    where: { email: 'facilitator.grace@faithhoopers.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'Grace Uwase',
      email: 'facilitator.grace@faithhoopers.com',
      password: facilitatorPassword,
      role: Role.FACILITATOR,
      emailVerified: true,
      passwordSet: true,
      facilitator: {
        create: { specialty: 'Camp Operations' },
      },
    },
    include: { facilitator: true },
  })

  // Create parent
  const parentPassword = await bcrypt.hash('parent123', 12)
  const parentUser = await prisma.user.upsert({
    where: { email: 'sarah.mukamana@email.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'Sarah Mukamana',
      email: 'sarah.mukamana@email.com',
      password: parentPassword,
      role: Role.PARENT,
      emailVerified: true,
      passwordSet: true,
      parent: { create: {} },
    },
    include: { parent: true },
  })

  // Create player
  const playerPassword = await bcrypt.hash('player123', 12)
  const playerUser = await prisma.user.upsert({
    where: { email: 'david.mukamana@faithhoopers.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'David Mukamana',
      email: 'david.mukamana@faithhoopers.com',
      password: playerPassword,
      role: Role.PLAYER,
      emailVerified: true,
      passwordSet: true,
      player: {
        create: {
          jerseyNumber: 23,
          position: 'Point Guard',
          gender: 'MALE',
          age: 16,
          parentId: parentUser.parent!.id,
        },
      },
    },
  })

  // Create a sibling for David, sharing the same parent — demonstrates
  // household/sibling grouping (multiple children -> one Parent record).
  const siblingPassword = await bcrypt.hash('player123', 12)
  await prisma.user.upsert({
    where: { email: 'esther.mukamana@faithhoopers.com' },
    update: { emailVerified: true, passwordSet: true },
    create: {
      name: 'Esther Mukamana',
      email: 'esther.mukamana@faithhoopers.com',
      password: siblingPassword,
      role: Role.PLAYER,
      emailVerified: true,
      passwordSet: true,
      player: {
        create: {
          gender: 'FEMALE',
          age: 14,
          parentId: parentUser.parent!.id,
        },
      },
    },
  })

  // Create sessions
  const now = new Date()
  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        title: 'Morning Drills & Conditioning',
        type: SessionType.TRAINING,
        description: 'Footwork, layups, and defensive positioning',
        location: 'Main Court',
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        coachId: coachUser.coach!.id,
      },
    }),
    prisma.session.create({
      data: {
        title: 'Intra-Camp Scrimmage',
        type: SessionType.GAME,
        description: 'Team A vs Team B — full game rules',
        location: 'Main Court',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        coachId: coachUser.coach!.id,
      },
    }),
    prisma.session.create({
      data: {
        title: 'Morning Bible Study: Running the Race',
        type: SessionType.BIBLE_STUDY,
        description: 'Hebrews 12:1 — perseverance and purpose in sport and faith',
        location: 'Chapel Room',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create devotional
  await prisma.devotional.create({
    data: {
      title: 'Playing for an Audience of One',
      weekTheme: 'Identity & Purpose',
      bibleReference: 'Colossians 3:23',
      bibleText: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
      commentary: 'Every dribble, every pass, every sprint — done unto the Lord becomes worship. This week we explore what it means to compete not for the approval of the crowd, but for the glory of God. When your motivation shifts from performance to purpose, the game transforms.',
      application: 'Before each practice this week, take 30 seconds to silently dedicate your effort to God.',
      publishedAt: new Date(),
    },
  })

  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to Faith Hoopers Camp 2025!',
        body: 'We\'re so excited to have you here. Please check the schedule and make sure your emergency contact info is up to date with your coach.',
        targetRoles: [Role.ADMIN, Role.COACH, Role.FACILITATOR, Role.PLAYER, Role.PARENT],
        urgent: false,
        publishedAt: new Date(),
      },
      {
        title: 'Reminder: Bring Water Bottles Tomorrow',
        body: 'High temperatures expected. All players must bring a full water bottle to morning drills. Parents dropping off before 8am, please use the east gate.',
        targetRoles: [Role.PLAYER, Role.PARENT],
        urgent: true,
        publishedAt: new Date(),
      },
    ],
  })

  console.log('✅ Seed complete!')
  console.log('\n👤 Real admin accounts (setup email sent, no password yet):')
  for (const { email } of REAL_ADMINS) {
    console.log(`  ${email.trim().toLowerCase()} — check inbox, use "Forgot password" with the code to set a password`)
  }
  console.log('\n🔑 Test accounts (all pre-verified, ready to sign in):')
  console.log('  Admin:       admin@faithhoopers.com / admin123')
  console.log('  Coach:       coach.james@faithhoopers.com / coach123')
  console.log('  Facilitator: facilitator.grace@faithhoopers.com / facilitator123')
  console.log('  Player:      david.mukamana@faithhoopers.com / player123')
  console.log('  Player (sibling of David): esther.mukamana@faithhoopers.com / player123')
  console.log('  Parent:      sarah.mukamana@email.com / parent123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
