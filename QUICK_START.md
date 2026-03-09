# Supabase Integration Quick Start

Get FundLink running with Supabase authentication and real-time features in minutes.

## 5-Minute Setup

### 1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to initialize

### 2. Get Credentials

In Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon Key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push Database Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (creates supabase folder)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

### 5. Start Development Server

```bash
npm install
npm run dev
```

Visit **http://localhost:3000/auth/signup** to test authentication!

---

## Core Features Overview

### Authentication

Users can:
- Sign up with email/password
- Sign in with Google or LinkedIn
- Reset forgotten passwords
- Manage profile information

**Files:**
- `/src/app/auth/login/page.tsx` — Login page
- `/src/app/auth/signup/page.tsx` — Signup with role selection
- `/src/lib/auth/index.ts` — Auth utilities and validation

### Real-Time Messaging

Instant messaging between users with real-time updates.

```typescript
import { useMessageSubscription } from "@/hooks/useRealtime";

const { messages, isLoading } = useMessageSubscription(threadId);
```

**Files:**
- `/src/hooks/useRealtime.ts` — Real-time subscription hooks
- `/src/lib/data/queries.ts` — Message query functions

### Intro Requests

Investors can request introductions to founders.

**Key endpoints:**
- `POST /api/intros` — Create intro request
- `PATCH /api/intros` — Accept/decline intro

### User Roles

- **Founder** — Seeking funding
- **Investor** — Making investments
- **Partner** — Ecosystem partner (accelerators, VCs)
- **Admin** — Platform administration

---

## Essential Files

### Authentication

| File | Purpose |
|------|---------|
| `src/lib/auth/index.ts` | Auth functions, validation |
| `src/hooks/useAuth.ts` | Client auth state hook |
| `src/middleware.ts` | Session refresh, redirects |
| `src/lib/supabase/client.ts` | Browser client setup |
| `src/lib/supabase/server.ts` | Server client setup |

### Data Access

| File | Purpose |
|------|---------|
| `src/lib/data/queries.ts` | Centralized query functions |
| `src/hooks/useRealtime.ts` | Real-time subscription hooks |
| `src/lib/api/index.ts` | API response builders, validation |

### Pages

| URL | File | Purpose |
|-----|------|---------|
| `/auth/login` | `src/app/auth/login/page.tsx` | Email/password login |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | New user signup |
| `/dashboard/:role` | `src/app/dashboard/[role]/page.tsx` | Role-specific dashboard |

---

## Common Tasks

### Add a New API Endpoint

Create `src/app/api/my-feature/route.ts`:

```typescript
import { requireAuth, validateRequestBody, successResponse, errorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

const schema = {
  email: { type: "email" as const, required: true },
};

export async function POST(request: Request) {
  // Check auth
  const authCheck = await requireAuth(request);
  if (authCheck instanceof Response) return authCheck;
  const { user } = authCheck;

  // Validate input
  const body = await request.json();
  const { valid, errors } = validateRequestBody(body, schema);
  if (!valid) return errorResponse("Validation failed", 422);

  // Do work
  const supabase = createClient();
  // ... your logic ...

  return successResponse(data);
}
```

### Get Current User Data

In a server component:

```typescript
import { getServerSession } from "@/lib/auth";
import { getProfile } from "@/lib/data/queries";

export default async function Page() {
  const user = await getServerSession();
  const profile = await getProfile(user.id);

  return <div>{profile.full_name}</div>;
}
```

In a client component:

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function Component() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return <div>{profile?.full_name}</div>;
}
```

### Subscribe to Real-Time Updates

```typescript
"use client";
import { useMessageSubscription } from "@/hooks/useRealtime";

export default function Messages({ threadId }: { threadId: string }) {
  const { messages, isLoading } = useMessageSubscription(threadId, (newMsg) => {
    console.log("New message received:", newMsg);
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.body}</div>
      ))}
    </div>
  );
}
```

### Query Data from Server

```typescript
import { getIntroRequests } from "@/lib/data/queries";

// Get intros for founder
const intros = await getIntroRequests(userId, "founder", page);

intros.forEach((intro) => {
  console.log(intro.investor?.full_name);
});
```

---

## Testing Setup

### Run Unit Tests

```bash
npm test
```

Tests in `__tests__/` directory using Jest.

### Run E2E Tests

```bash
npm run test:e2e
```

Tests in `e2e/` directory using Playwright.

### Test Authentication Manually

1. Go to `/auth/signup`
2. Create account with role selection
3. Check email for verification link
4. Verify email
5. Should redirect to dashboard

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Production Checklist

Before deploying:

- [ ] All environment variables set
- [ ] Database schema pushed (`supabase db push`)
- [ ] RLS policies enabled
- [ ] Email service configured (Resend)
- [ ] OAuth providers configured
- [ ] Backup enabled in Supabase
- [ ] HTTPS enforced
- [ ] Security headers configured

---

## Debugging

### "Unauthorized" Errors

```typescript
// Check if user is authenticated
const { user } = await getServerSession();
console.log("User:", user?.email);

// Check profile exists
const profile = await getProfile(user.id);
console.log("Profile:", profile);
```

### "RLS Policy Violation"

```sql
-- Check if row exists and user has access
SELECT * FROM profiles WHERE id = 'user-id';

-- Test RLS policy manually
SELECT * FROM profiles 
WHERE auth.uid() = 'user-id';
```

### Real-Time Not Working

1. Check Realtime is enabled: Supabase Dashboard → Realtime
2. Verify subscription has correct filter
3. Check user has read permissions
4. View browser console for errors

### API Returns 500

```typescript
// Add logging
console.log("[API] Starting request", { method, url });
console.log("[API] User:", user?.email);
console.log("[API] Processing:", data);
console.error("[API] Error:", error);
```

---

## Database Management

### View Data in Supabase

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Write queries or use Table Editor

### Common Queries

```sql
-- Find user by email
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Get intro requests for a founder
SELECT * FROM intro_requests 
WHERE founder_id = 'user-id'
ORDER BY created_at DESC;

-- Count unread messages
SELECT COUNT(*) FROM messages 
WHERE thread_id = 'thread-id' 
AND is_read = false;
```

### Reset Data (Development)

```bash
# Clear all tables
supabase db reset

# This re-runs all migrations with fresh data
```

---

## Next Steps

1. **Customize signup** — Modify `/src/app/auth/signup/page.tsx`
2. **Build dashboards** — Create role-specific dashboards in `/src/app/dashboard/`
3. **Add features** — Create new tables and API routes
4. **Deploy** — Follow deployment checklist

## Documentation

- **[SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)** — Complete API reference
- **[IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)** — Code examples
- **[TESTING_AND_SECURITY.md](./TESTING_AND_SECURITY.md)** — Testing & security guide
- **[Supabase Docs](https://supabase.com/docs)** — Official documentation

## Support

- Check documentation files in project root
- Review example implementations
- Check Supabase logs for errors
- Read test files for usage patterns

---

## Summary

You now have:

✅ Complete authentication system with email/OAuth  
✅ Real-time messaging and notifications  
✅ Role-based access control with RLS  
✅ Data query utilities with pagination  
✅ Secure API route patterns  
✅ Comprehensive documentation  
✅ Testing strategies  
✅ Production-ready code  

Start building! 🚀
