# 🚀 Faith Hoopers Camp — Deployment Guide

Complete step-by-step instructions for deploying the Faith Hoopers platform. Total cost: **$0** using free tiers.

---

## What You'll Set Up

| Service | Purpose | Cost |
|---|---|---|
| **Supabase** | PostgreSQL database | Free |
| **GitHub** | Code hosting | Free |
| **Vercel** | App hosting + deployment | Free |
| **api.bible** | Bible verse fetching | Free |

Estimated time: **30–45 minutes**

---

## STEP 1 — Prepare Your Computer

You need Node.js installed to push the database schema.

1. Download Node.js from **nodejs.org** → choose "LTS" version → install it
2. Open a terminal (Mac: Terminal app, Windows: Command Prompt or PowerShell)
3. Verify installation:
   ```bash
   node --version   # should show v18 or higher
   npm --version    # should show a number
   ```

---

## STEP 2 — Set Up Supabase (Database)

1. Go to **[supabase.com](https://supabase.com)** → click **Start your project**
2. Sign up with GitHub (recommended) or email
3. Click **New project** and fill in:
   - **Name:** `faith-hoopers`
   - **Database password:** create a strong password — write it down, you'll need it
   - **Region:** `West EU (Ireland)` — closest to Rwanda
4. Click **Create new project** — wait ~2 minutes for setup
5. Once ready, click the **Connect** button near the top of the project dashboard
6. In the dialog, switch to the **ORMs** tab and select **Prisma** — Supabase shows you two connection strings, already filled in with your project's host:
   - **Transaction pooler** (ends in `:6543`) — this is your `DATABASE_URL`
   - **Direct connection** (ends in `:5432`) — this is your `DIRECT_URL`
7. Copy both strings somewhere safe, then replace `[YOUR-PASSWORD]` in each with your actual database password from step 3
8. To the end of the `:6543` string, add `&connection_limit=1` (right after the existing `?pgbouncer=true`) — this keeps each serverless function from hogging more than one pooled connection
9. **Save both strings** — you'll need them in Step 4 and Step 6

This project needs *both* strings, not just one: the app itself talks to the database through the
pooled `:6543` connection at runtime (required on Vercel, since serverless functions can open many
connections at once), but pushing the schema with Prisma needs the direct `:5432` connection — the
pooled one alone makes `prisma db push` hang or time out.

---

## STEP 3 — Push Code to GitHub

1. Go to **[github.com](https://github.com)** → sign up or sign in
2. Click **New repository** → name it `faith-hoopers` → set to **Private** → click **Create repository**
3. Unzip the `faith-hoopers.zip` file on your computer
4. Open a terminal inside the `hoops` folder (the one with `package.json` in it)
5. Run these commands one at a time:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Faith Hoopers"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/faith-hoopers.git
   git push -u origin main
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username

---

## STEP 4 — Set Up the Database

Still in the terminal inside the `hoops` folder:

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in any text editor (Notepad, VS Code, etc.) and fill in your values:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxxxxx:YOUR-PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.xxxxxxxx:YOUR-PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   NEXTAUTH_SECRET="paste-a-random-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   BIBLE_API_KEY="get-free-key-at-scripture.api.bible"
   ```
   Use the two strings you saved in Step 2 — `DATABASE_URL` is the `:6543` one, `DIRECT_URL` is the `:5432` one.

   > **Generating NEXTAUTH_SECRET:** Open your terminal and run:
   > - Mac/Linux: `openssl rand -base64 32`
   > - Windows: go to **[generate-secret.vercel.app](https://generate-secret.vercel.app/32)** and copy the result

3. Install project dependencies:
   ```bash
   npm install
   ```
4. Generate the database client:
   ```bash
   npm run db:generate
   ```
5. Push the database schema to Supabase:
   ```bash
   npm run db:push
   ```
   When prompted `Do you want to continue? › (y/N)` — type `y` and press Enter. This step uses
   `DIRECT_URL` automatically — if it hangs for more than a minute or times out, double check
   you used the `:5432` string here and not the `:6543` one.
6. Load demo data:
   ```bash
   npm run db:seed
   ```
   You should see:
   ```
   ✅ Seed complete!
   Admin:       admin@faithhoopers.com / admin123
   Coach:       coach.james@faithhoopers.com / coach123
   Facilitator: facilitator.grace@faithhoopers.com / facilitator123
   Player:      david.mukamana@faithhoopers.com / player123
   Parent:      sarah.mukamana@email.com / parent123
   ```

7. **Test locally** before deploying:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser and sign in with the demo accounts to confirm everything works. Press `Ctrl+C` when done.

---

## STEP 5 — Get a Free Bible API Key (Optional but Recommended)

Without this, devotional verse text must be entered manually. With it, the verse auto-fetches.

1. Go to **[scripture.api.bible](https://scripture.api.bible)**
2. Click **Get API Key** → create a free account
3. Once logged in, click **+ Add App** → fill in a name (e.g. "Faith Hoopers") → Submit
4. Copy your **API Key**
5. Update the `BIBLE_API_KEY` value in your `.env` file

---

## STEP 5B — Set Up Email (Required for Signup Verification)

When someone registers, they get an email with a 6-digit code to verify their address —
without this set up, that email never sends and nobody can finish signing up.

1. Go to **[resend.com](https://resend.com)** → sign up (free tier: 100 emails/day, 3,000/month)
2. Add and verify a sending domain under **Domains** (follow their DNS instructions — takes a few minutes to a few hours to verify)
   - No domain yet? You can test with their shared `onboarding@resend.dev` address, but real users' emails may land in spam — verify your own domain before a real launch.
3. Go to **API Keys** → create a new key → copy it
4. Add to your `.env` (and later, Vercel environment variables):
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   EMAIL_FROM="Faith Hoopers <hello@yourdomain.com>"
   ```

---

## STEP 6 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → sign up with GitHub
2. Click **Add New…** → **Project**
3. Find your `faith-hoopers` repository → click **Import**
4. Vercel auto-detects it as Next.js — **don't change** the build settings
5. Before clicking Deploy, scroll to **Environment Variables** and add these:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your pooled (`:6543`) Supabase connection string from Step 2 |
   | `DIRECT_URL` | Your direct (`:5432`) Supabase connection string from Step 2 |
   | `NEXTAUTH_SECRET` | The random string you generated in Step 4 |
   | `NEXTAUTH_URL` | Leave **blank for now** — you'll add it after first deploy |
   | `BIBLE_API_KEY` | Your api.bible key (or leave blank if skipping) |
   | `BIBLE_API_BASE` | `https://api.scripture.api.bible/v1` |
   | `BIBLE_VERSION_ID` | `de4e12af7f28f599-01` |
   | `RESEND_API_KEY` | Your Resend API key from Step 5B |
   | `EMAIL_FROM` | e.g. `Faith Hoopers <hello@yourdomain.com>` |

6. Click **Deploy** — wait ~2 minutes
7. Once deployed, Vercel gives you a URL like `https://faith-hoopers-abc123.vercel.app`
8. Go to **Settings** → **Environment Variables** → find `NEXTAUTH_URL` → set its value to your Vercel URL:
   ```
   https://faith-hoopers-abc123.vercel.app
   ```
9. Go to **Deployments** tab → click the **⋯** next to your latest deployment → click **Redeploy** → confirm

Your app is now **live** 🎉

---

## STEP 7 — Set a Custom Domain (Optional)

If you have a domain like `faithhoopers.com`:

1. In Vercel → your project → **Settings** → **Domains**
2. Type your domain and click **Add**
3. Vercel shows you DNS records to add — log in to your domain registrar (GoDaddy, Namecheap, etc.) and add those records
4. Once propagated (up to 24 hours), go back to **Environment Variables** and update `NEXTAUTH_URL` to `https://faithhoopers.com`
5. Redeploy once more

---

## Making Updates After Launch

When you want to update the app:

1. Make your code changes locally in the `hoops` folder
2. Test with `npm run dev`
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "describe your change here"
   git push
   ```
4. Vercel **automatically redeploys** within ~1 minute of every push — no manual steps needed

### This update specifically (gender/age/health fields, facilitators, email verification)

This update changes the database schema (new fields + a new `Facilitator` table), so there's one
extra step beyond a normal code push — **run this once, locally, against your live database**,
before or right after pushing:

```bash
npm run db:push
```

It will show a short summary of the new columns/tables and ask `Do you want to continue? › (y/N)` —
type `y`. This does **not** delete or touch any existing rows, it only adds the new fields. Then
push your code as usual — Vercel will pick it up.

You'll also need to add `RESEND_API_KEY` and `EMAIL_FROM` to Vercel's environment variables (see
Step 5B above) for the new verification emails to actually send — without it, signups still work
but the email step is skipped (logged to the server console instead), so nobody can verify and log in.

---

## Adding Real Users

Once deployed, tell your coaches, facilitators, players, and parents to:

1. Go to `https://your-vercel-url.vercel.app/register`
2. Select their role (Player, Coach, or Facilitator) and fill in the form

Parents don't register themselves — there's no "Parent" option on the form. When a player
signs up, they enter their parent's name/email/phone right there in the same form, and a parent
account is created automatically. The parent gets an email to verify and set their own password.
This also means a parent never needs a separate signup: if a second child later registers with
the same parent email, they're linked to the same parent account instead of creating a duplicate.
3. Check their email for a 6-digit verification code and enter it at `/verify`
4. Log in at `/login`

If a player adds a parent's email during signup and that parent doesn't already have an account,
one is created automatically — the parent gets their own email with a code, and sets their own
password the first time they verify. If a sibling registers later with the same parent email,
they're automatically linked to that same parent account (no duplicate parent accounts).

### Creating your first real Admin

There's no "Admin" option on the signup form on purpose — it's not something anyone should be able
to grant themselves. To make someone an admin:

1. Have that person register normally at `/register` (any role — Player, Coach, or Facilitator all
   work, since the next step changes their role anyway) and verify their email as usual
2. On your computer, in the project folder, with your `.env` pointed at the **live** database
   (same `DATABASE_URL`/`DIRECT_URL` you put in Vercel):
   ```bash
   npm run admin:promote -- their-email@example.com
   ```
3. You'll see a confirmation like `✅ "Josh Kacyira" (josh@...) is now an Admin.` — they can log in
   immediately, no need to wait on anything else

This is safer than editing the Supabase Table Editor by hand — becoming an Admin actually requires
three columns to change together (`role`, `emailVerified`, `passwordSet`), and the script does all
three atomically instead of risking a half-finished edit that locks someone out.

### Removing the demo accounts

Once you have at least one real admin set up (above), clean out the test data:
1. Go to your Supabase dashboard → **Table Editor** → `users` table
2. Delete the rows for `admin@faithhoopers.com`, `coach.james@faithhoopers.com`,
   `facilitator.grace@faithhoopers.com`, `david.mukamana@faithhoopers.com`,
   `esther.mukamana@faithhoopers.com`, and `sarah.mukamana@email.com` — these all have
   publicly-known passwords (they're sitting in this repo's `seed.ts`) and shouldn't stay live
   once real people are registering

---

## Troubleshooting

**"Invalid credentials" on login**
→ Make sure `npm run db:seed` ran successfully and you're using the exact demo email/password

**"Application error" after deploying**
→ Go to Vercel → your project → **Functions** tab → click any error to see the log. Most likely a missing environment variable.

**Database connection error**
→ Double-check `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables — make sure you
replaced `[YOUR-PASSWORD]` with your actual password in both, and that you didn't accidentally
paste the same string into both fields (they need different ports: `:6543` for `DATABASE_URL`,
`:5432` for `DIRECT_URL`).

**`npm run db:push` hangs or times out**
→ This means `DIRECT_URL` is missing, wrong, or pointed at the `:6543` pooled string instead of
the `:5432` direct one. Supabase's pooler doesn't support the kind of connection `prisma db push`
needs — only the direct connection does.

**`NEXTAUTH_URL` mismatch error**
→ Make sure `NEXTAUTH_URL` in Vercel matches your exact Vercel URL (no trailing slash).

**Bible verses not loading**
→ Check your `BIBLE_API_KEY` is correct. You can leave it blank and enter verse text manually instead.

**Verification email never arrives**
→ Check `RESEND_API_KEY` and `EMAIL_FROM` are set in Vercel's environment variables, that your sending domain is verified in Resend, and check the spam folder. Until a domain is verified, some inboxes (especially Gmail) may silently filter emails from Resend's shared `onboarding@resend.dev` address.

**"Please verify your email before signing in"**
→ The account hasn't entered its 6-digit code yet. Go to `/verify`, enter the email, and use "Resend code" if the original email didn't arrive.

---

## Support

For technical help or questions about the platform, contact the developer or open an issue on the GitHub repository.

*Faith Hoopers Camp — Where Faith Meets Basketball*
