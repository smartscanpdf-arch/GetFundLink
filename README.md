# FundLink — Production Setup Guide

India's curated startup–investor network. Built with Next.js 14, Supabase, Resend, and Razorpay.

---

## Stack

| Layer       | Technology                |
|-------------|---------------------------|
| Frontend    | Next.js 14 (App Router)   |
| Backend     | Next.js API Routes        |
| Database    | Supabase (PostgreSQL)     |
| Auth        | Supabase Auth             |
| Storage     | Supabase Storage          |
| Email       | Resend                    |
| Payments    | Razorpay (add later)      |
| Deployment  | Vercel                    |
| Styles      | Tailwind CSS              |

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/YOUR_ORG/fundlink.git
cd fundlink
npm install
```

---

## Step 2 — Supabase Setup

### 2a. Create project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `fundlink`, pick a region close to India (Singapore / Mumbai)
3. Wait for it to provision (~2 minutes)

### 2b. Run the schema
1. In Supabase dashboard → **SQL Editor** → New Query
2. Open `supabase/migrations/001_initial_schema.sql`
3. Paste the entire file → **Run**

### 2c. Create Storage buckets
In Supabase dashboard → **Storage** → New bucket, create these five:

| Bucket name   | Public? |
|---------------|---------|
| `avatars`     | ✅ Yes  |
| `kyc-docs`    | ❌ No   |
| `pitch-decks` | ❌ No   |
| `documents`   | ❌ No   |
| `event-covers`| ✅ Yes  |

### 2d. Configure Auth
In Supabase → **Authentication** → **Settings**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: add `https://your-app.vercel.app/api/auth/callback`

For Google OAuth (optional):
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create OAuth 2.0 credentials, add Supabase callback URL
- Paste Client ID + Secret in Supabase → Auth → Providers → Google

For LinkedIn OAuth (optional):
- Go to [linkedin.com/developers](https://linkedin.com/developers)
- Create app, add Supabase callback URL
- Paste Client ID + Secret in Supabase → Auth → Providers → LinkedIn

### 2e. Get your keys
Supabase → **Settings** → **API**:
- Copy `Project URL`
- Copy `anon public` key
- Copy `service_role` key (keep this secret — server only)

---

## Step 3 — Resend Setup

1. Go to [resend.com](https://resend.com) → API Keys → Create Key
2. Add your domain (e.g. `fundlink.in`) → follow DNS verification steps
3. Copy your API key

---

## Step 4 — Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fundlink.in

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FundLink
```

---

## Step 5 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6 — Create first admin user

1. Sign up normally via `/auth/signup` with your email
2. In Supabase → SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```
3. Sign out and sign back in — you'll land on the admin dashboard

---

## Step 7 — Deploy to Vercel

### 7a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial FundLink setup"
git remote add origin https://github.com/YOUR_ORG/fundlink.git
git push -u origin main
```

### 7b. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local` (use your production Supabase URL)
5. Deploy

### 7c. Update Supabase with production URL
After Vercel gives you a URL (e.g. `https://fundlink.vercel.app`):
- Supabase → Authentication → Settings → Site URL → update to production URL
- Add `https://fundlink.vercel.app/api/auth/callback` to Redirect URLs

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/callback/     # OAuth callback handler
│   │   ├── intros/            # Intro request + accept/decline
│   │   ├── support/           # Ticket CRUD + admin replies
│   │   └── upload/            # File uploads to Supabase Storage
│   ├── auth/
│   │   ├── login/             # Login page
│   │   ├── signup/            # 3-step signup with role selection
│   │   ├── forgot-password/   # Password reset request
│   │   └── reset-password/    # Password reset form
│   └── dashboard/
│       ├── founder/           # Founder dashboard
│       ├── investor/          # Investor dashboard
│       ├── partner/           # Partner dashboard
│       └── admin/             # Admin dashboard
├── components/
│   ├── layout/
│   │   └── DashboardLayout    # Shared sidebar + topbar
│   └── ui/
│       └── Avatar             # User avatar component
├── hooks/
│   └── useAuth.ts             # Auth state hook
├── lib/
│   ├── email/                 # Resend email templates
│   ├── supabase/              # Browser + server clients
│   └── utils/                 # Formatting, helpers
├── store/
│   └── index.ts               # Zustand global state
└── types/
    └── index.ts               # All TypeScript types
```

---

## Adding Razorpay (when ready)

1. Create account at [razorpay.com](https://razorpay.com)
2. Add to `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
```
3. Create plans in Razorpay dashboard matching your pricing tiers
4. Add `src/app/api/webhooks/razorpay/route.ts` to handle payment confirmations

---

## Database: Key Tables

| Table                  | Purpose                            |
|------------------------|------------------------------------|
| `profiles`             | One row per user, extends auth     |
| `founder_profiles`     | Startup info, deck URL, metrics    |
| `investor_profiles`    | Thesis, sectors, ticket size       |
| `partner_profiles`     | Org info, approval status          |
| `intro_requests`       | Investor → Founder connections     |
| `saved_startups`       | Investor bookmarks                 |
| `events`               | Partner/admin events               |
| `documents`            | Data room files with access control|
| `support_tickets`      | User tickets + admin replies       |
| `notifications`        | In-app notification feed           |
| `subscriptions`        | Plan + Razorpay subscription link  |
| `invoices`             | Payment history                    |

---

## Common Issues

**"Invalid JWT" error on API calls**
→ Your `SUPABASE_SERVICE_ROLE_KEY` is wrong or using the anon key by mistake.

**Emails not sending**
→ Check that your domain is verified in Resend. In dev, use Resend's sandbox.

**Storage upload 400 error**
→ Make sure all 5 buckets are created and bucket policies are set correctly.

**OAuth redirect not working**
→ Add `http://localhost:3000/api/auth/callback` to Supabase redirect URLs for local dev.

**User lands on wrong dashboard after login**
→ The `handle_new_user` trigger auto-assigns the role from signup metadata. If the trigger didn't run, manually update `profiles.role` in Supabase SQL editor.
