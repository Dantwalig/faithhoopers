# 🏀 Faith Hoopers — Camp Platform

A full-stack faith-based basketball platform built with **Next.js 14**, **Prisma**, **PostgreSQL**, and **NextAuth.js**.

---

## Features

| Module | Who can use it |
|---|---|
| **Registration** | Players (gender, age 13–19, health notes, auto-creates linked parent account), Coaches, Facilitators — there's no standalone Parent signup |
| **Email verification** | Everyone — 6-digit code by email after signup; auto-created parent accounts set their password during verification |
| **Schedule** | All roles — Admins, Coaches & Facilitators can create sessions |
| **Attendance** | Admins, Coaches & Facilitators mark; Players & Parents view |
| **Devotionals** | Admin creates (with Bible API auto-fetch); all roles read |
| **Announcements** | Admin, Coach & Facilitator post; filtered by role |
| **Messages** | Broadcast (Coach/Facilitator → all) + Direct (any two users) |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4 (credentials + JWT, role-based)
- **Styling:** Tailwind CSS (custom design system)
- **Bible API:** api.bible (free key at scripture.api.bible)
- **Deployment:** Vercel + Neon (or Supabase) recommended

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd faith-hoopers
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# PostgreSQL — free options:
# → Neon:     https://neon.tech  (serverless Postgres, free tier)
# → Supabase: https://supabase.com (free tier, 500MB)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/faith_hoopers"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Free Bible API key: https://scripture.api.bible
BIBLE_API_KEY="your-api-bible-key"
BIBLE_API_BASE="https://api.scripture.api.bible/v1"
BIBLE_VERSION_ID="de4e12af7f28f599-01"   # KJV — change if preferred

# Resend (https://resend.com) — sends verification-code & welcome emails.
# Without it, emails are skipped (logged to console) and nobody can verify their account.
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Faith Hoopers <hello@yourdomain.com>"
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your database (dev only — use db:migrate for production)
npm run db:push

# Seed with demo data and test accounts
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@faithhoopers.com | admin123 |
| Coach | coach.james@faithhoopers.com | coach123 |
| Facilitator | facilitator.grace@faithhoopers.com | facilitator123 |
| Player | david.mukamana@faithhoopers.com | player123 |
| Player (David's sibling, same parent) | esther.mukamana@faithhoopers.com | player123 |
| Parent | sarah.mukamana@email.com | parent123 |

All seeded accounts are pre-verified (`emailVerified: true`) so you can sign in immediately without going through `/verify`.

---

## Project Structure

```
faith-hoopers/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── register/              # User registration
│   │   ├── verify-email/          # Email verification (+ resend/ for new codes)
│   │   ├── set-password/          # Password setup for auto-created parent accounts
│   │   ├── sessions/              # CRUD for camp sessions
│   │   │   └── [id]/
│   │   ├── attendance/            # Bulk attendance marking
│   │   ├── devotionals/           # Devotionals + Bible API proxy
│   │   │   └── bible/
│   │   ├── announcements/         # Announcements CRUD
│   │   ├── messages/
│   │   │   ├── broadcast/         # Coach/Facilitator → all messages
│   │   │   └── direct/            # 1-on-1 messages
│   │   └── users/                 # User listing
│   ├── dashboard/
│   │   ├── layout.tsx             # Sidebar + topbar shell
│   │   ├── admin/                 # Admin pages
│   │   ├── coach/                 # Coach + Facilitator pages
│   │   ├── player/                # Player pages
│   │   └── parent/                # Parent pages
│   ├── login/
│   ├── register/
│   ├── verify/                    # Enter verification code / set password
│   └── page.tsx                   # Landing page
├── components/
│   ├── layout/
│   │   ├── SidebarNav.tsx
│   │   └── TopBar.tsx
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   └── SessionTypeBadge.tsx
│   └── dashboard/
│       ├── ScheduleView.tsx        # Shared schedule (all roles)
│       ├── DevotionalsView.tsx     # Shared devotionals
│       ├── AnnouncementsView.tsx   # Shared announcements
│       ├── MessagesView.tsx        # Broadcast + direct messages
│       └── MessagesViewWrapper.tsx
├── lib/
│   ├── auth/
│   │   ├── auth-options.ts        # NextAuth config
│   │   ├── helpers.ts             # requireAuth, requireRole, dashboardPath
│   │   └── verification.ts        # Verification code generation
│   ├── email/
│   │   └── send.ts                # Resend-based email sending + templates
│   ├── db/
│   │   └── prisma.ts              # Prisma singleton
│   └── bible-api/
│       └── fetch-passage.ts       # Bible API integration
├── prisma/
│   ├── schema.prisma              # Full data model
│   └── seed.ts                    # Demo data
├── types/
│   └── index.ts                   # Shared TypeScript types
├── middleware.ts                   # Route protection
└── .env.example
```

---

## Deployment (Vercel + Neon)

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/faith-hoopers.git
git push -u origin main
```

### 2. Create a free Neon database

- Go to [neon.tech](https://neon.tech) → New Project
- Copy the connection string (it looks like `postgresql://...`)

### 3. Deploy to Vercel

- Go to [vercel.com](https://vercel.com) → Import your GitHub repo
- Add environment variables:
  - `DATABASE_URL` — your Neon connection string
  - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
  - `NEXTAUTH_URL` — your Vercel domain (e.g. `https://hoops-camp.vercel.app`)
  - `BIBLE_API_KEY` — from scripture.api.bible
- Click Deploy

### 4. Run migrations on production

```bash
# In your terminal, with the production DATABASE_URL set
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

---

## Adding a New Bible Version

In your `.env`, change `BIBLE_VERSION_ID` to any version from [api.bible](https://api.bible). Popular options:
- `de4e12af7f28f599-01` — KJV (King James Version)
- `06125adad2d5898a-01` — ASV (American Standard)
- `55212e3cf5d04d49-01` — WEB (World English Bible, open license)

---

## Roles Reference

| Role | Registration | Schedule | Attendance | Devotionals | Announcements | Messages |
|---|---|---|---|---|---|---|
| **Admin** | ✅ Create all | ✅ Create/view | ✅ Mark/view all | ✅ Create/view | ✅ Create/delete | ✅ All |
| **Coach** | — | ✅ Create/view | ✅ Mark assigned | ✅ View | ✅ Post | ✅ Broadcast + direct |
| **Facilitator** | — | ✅ Create/view | ✅ Mark assigned | ✅ View | ✅ Post | ✅ Broadcast + direct |
| **Player** | ✅ Self | ✅ View | — | ✅ View | ✅ View (player) | ✅ Direct |
| **Parent** | ✅ Self | ✅ View | — | ✅ View | ✅ View (parent) | ✅ Direct |

Facilitators currently share the Coach dashboard and permissions one-for-one — they're a distinct
role (separate `Facilitator` table) for reporting purposes, but use the same screens.

## Households & Siblings

There's no separate "household" model — a household *is* a `Parent` record, and any number of
`Player` records can point at the same `parentId`. Parents never sign up on their own; the only
way a `Parent` account is created is automatically, the moment a player enters that parent's email
during the player's own signup. When a player registers with a parent email that already belongs
to an existing parent account (created earlier by a sibling), they're automatically linked to that
same parent — no duplicates, no second invite email. The Admin → Players page shows a "+N
sibling(s)" badge next to the parent's name when more than one child shares that parent.
Email matching is case-insensitive and trimmed, so "Mom@Gmail.com" and "mom@gmail.com " both
resolve to the same account.
