# 🏀 Faith Hoopers — Camp Platform

A full-stack faith-based basketball platform built with **Next.js 14**, **Prisma**, **PostgreSQL**, and **NextAuth.js**.

---

## Features

| Module | Who can use it |
|---|---|
| **Registration** | Players (with parent details), Coaches, Parents |
| **Schedule** | All roles — Admins & Coaches can create sessions |
| **Attendance** | Admins & Coaches mark; Players & Parents view |
| **Devotionals** | Admin creates (with Bible API auto-fetch); all roles read |
| **Announcements** | Admin & Coach post; filtered by role |
| **Messages** | Broadcast (Coach → all) + Direct (any two users) |

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
| Player | david.mukamana@faithhoopers.com | player123 |
| Parent | sarah.mukamana@email.com | parent123 |

---

## Project Structure

```
faith-hoopers/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── register/              # User registration
│   │   ├── sessions/              # CRUD for camp sessions
│   │   │   └── [id]/
│   │   ├── attendance/            # Bulk attendance marking
│   │   ├── devotionals/           # Devotionals + Bible API proxy
│   │   │   └── bible/
│   │   ├── announcements/         # Announcements CRUD
│   │   ├── messages/
│   │   │   ├── broadcast/         # Coach → all messages
│   │   │   └── direct/            # 1-on-1 messages
│   │   └── users/                 # User listing
│   ├── dashboard/
│   │   ├── layout.tsx             # Sidebar + topbar shell
│   │   ├── admin/                 # Admin pages
│   │   ├── coach/                 # Coach pages
│   │   ├── player/                # Player pages
│   │   └── parent/                # Parent pages
│   ├── login/
│   ├── register/
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
│   │   └── helpers.ts             # requireAuth, requireRole
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
| **Player** | ✅ Self | ✅ View | — | ✅ View | ✅ View (player) | ✅ Direct |
| **Parent** | ✅ Self | ✅ View | — | ✅ View | ✅ View (parent) | ✅ Direct |
