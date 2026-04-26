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
5. Once ready, go to the left sidebar → **Project Settings** (gear icon) → **Database**
6. Scroll to **Connection string** → select the **URI** tab
7. Copy the full connection string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
8. Replace `[YOUR-PASSWORD]` in the string with your actual password from step 3
9. **Save this string** — you'll need it in Step 4 and Step 6

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
   DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   NEXTAUTH_SECRET="paste-a-random-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   BIBLE_API_KEY="get-free-key-at-scripture.api.bible"
   ```

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
   When prompted `Do you want to continue? › (y/N)` — type `y` and press Enter
6. Load demo data:
   ```bash
   npm run db:seed
   ```
   You should see:
   ```
   ✅ Seed complete!
   Admin:  admin@faithhoopers.com / admin123
   Coach:  coach.james@faithhoopers.com / coach123
   Player: david.mukamana@faithhoopers.com / player123
   Parent: sarah.mukamana@email.com / parent123
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

## STEP 6 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → sign up with GitHub
2. Click **Add New…** → **Project**
3. Find your `faith-hoopers` repository → click **Import**
4. Vercel auto-detects it as Next.js — **don't change** the build settings
5. Before clicking Deploy, scroll to **Environment Variables** and add these:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your full Supabase connection string from Step 2 |
   | `NEXTAUTH_SECRET` | The random string you generated in Step 4 |
   | `NEXTAUTH_URL` | Leave **blank for now** — you'll add it after first deploy |
   | `BIBLE_API_KEY` | Your api.bible key (or leave blank if skipping) |
   | `BIBLE_API_BASE` | `https://api.scripture.api.bible/v1` |
   | `BIBLE_VERSION_ID` | `de4e12af7f28f599-01` |

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

---

## Adding Real Users

Once deployed, tell your coaches, players, and parents to:

1. Go to `https://your-vercel-url.vercel.app/register`
2. Select their role and fill in the form
3. Log in at `/login`

To **remove the demo accounts** from production:
1. Go to your Supabase dashboard → **Table Editor** → `users` table
2. Delete the rows with `admin@faithhoopers.com`, `coach.james@faithhoopers.com`, etc.
3. Create your real admin account through `/register` (selecting Player role first, then manually changing it to Admin in the Supabase `users` table → `role` column)

---

## Troubleshooting

**"Invalid credentials" on login**
→ Make sure `npm run db:seed` ran successfully and you're using the exact demo email/password

**"Application error" after deploying**
→ Go to Vercel → your project → **Functions** tab → click any error to see the log. Most likely a missing environment variable.

**Database connection error**
→ Double-check your `DATABASE_URL` in Vercel environment variables. Make sure you replaced `[YOUR-PASSWORD]` with your actual password.

**`NEXTAUTH_URL` mismatch error**
→ Make sure `NEXTAUTH_URL` in Vercel matches your exact Vercel URL (no trailing slash).

**Bible verses not loading**
→ Check your `BIBLE_API_KEY` is correct. You can leave it blank and enter verse text manually instead.

---

## Support

For technical help or questions about the platform, contact the developer or open an issue on the GitHub repository.

*Faith Hoopers Camp — Where Faith Meets Basketball*
