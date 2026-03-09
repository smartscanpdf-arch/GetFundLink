# Environment Variables Setup Guide

## Required Environment Variables

Your Supabase integration requires two **public** environment variables to be set in your Vercel project. These are **public** because they're prefixed with `NEXT_PUBLIC_` and are safe to expose to the client.

### 1. NEXT_PUBLIC_SUPABASE_URL
The URL of your Supabase project.

**How to find it:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) in the sidebar
4. Click **API** tab
5. Copy the **Project URL** under "Project API keys"

**Example:**
```
https://your-project-id.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
The public anonymous key for your Supabase project.

**How to find it:**
1. Same location as above (Settings > API)
2. Look for **anon** public key
3. Copy the entire key

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Setting Environment Variables in Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard/projects
2. Click on your **GetFundLink** project
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the sidebar
5. Add both variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Add another for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Save**
7. **Redeploy** your application for changes to take effect

### Option 2: Via v0 Interface

If you're in v0:
1. Click **Settings** (gear icon) in the top right
2. Click **Vars** tab
3. Add the two environment variables
4. Save and redeploy

## Deployment Steps

Once environment variables are set:

1. **Redeploy** your project on Vercel
2. Wait for the build to complete
3. Your app should now have full Supabase integration

## Verifying Setup

After deployment, you should see:
- ✅ No "Missing Supabase environment variables" errors
- ✅ Auth pages loading properly
- ✅ Database queries working
- ✅ Real-time subscriptions functional

## Troubleshooting

### Build Error: "Missing Supabase environment variables"
- Environment variables are not set in Vercel
- Check Settings > Vars in Vercel dashboard
- Ensure both variables are present with exact keys
- Redeploy after adding variables

### Error: "Cannot read property of undefined"
- One of the environment variables is incorrect or missing
- Verify the values match exactly what's in Supabase dashboard
- Make sure there are no extra spaces or characters

### Still have issues?
Refer to the main [QUICK_START.md](./QUICK_START.md) or check the [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for additional configuration steps.
