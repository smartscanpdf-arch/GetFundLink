# Supabase Integration Guide — FundLink

Complete guide to the Supabase authentication, database, and real-time features integrated into FundLink.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Authentication](#authentication)
3. [Database Structure](#database-structure)
4. [Row-Level Security](#row-level-security)
5. [Real-Time Features](#real-time-features)
6. [Data Services](#data-services)
7. [API Routes](#api-routes)
8. [Security Best Practices](#security-best-practices)
9. [Environment Variables](#environment-variables)

---

## Project Setup

### Prerequisites

- Supabase Project created (https://app.supabase.com)
- Next.js 16+ installed
- Node.js 18+

### Installation

The project uses:

```json
{
  "@supabase/auth-helpers-nextjs": "^0.7.4",
  "@supabase/ssr": "^0.0.10",
  "@supabase/supabase-js": "^2.38.0"
}
```

Install dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Initialize Supabase in Project

1. Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Push the database schema:

```bash
supabase db push
```

3. Start the development server:

```bash
npm run dev
```

---

## Authentication

### Overview

The authentication system uses Supabase Auth with email/password and OAuth (Google, LinkedIn) support.

### Client-Side Authentication

#### Sign Up

```typescript
import { signUp } from "@/lib/auth";

const handleSignUp = async () => {
  const result = await signUp({
    email: "user@example.com",
    password: "SecurePass123!",
    full_name: "John Doe",
    role: "founder",
    org_name: "My Startup",
  });

  if (result.error) {
    console.error(result.error.message);
  } else {
    console.log("Signed up successfully");
  }
};
```

**Key Features:**

- Email verification required before activation
- Password strength validation (8+ chars, uppercase, numbers, special chars)
- Role-based signup (founder, investor, partner)
- Auto-create profile on signup via database trigger

#### Sign In

```typescript
import { signIn } from "@/lib/auth";

const handleSignIn = async () => {
  const result = await signIn({
    email: "user@example.com",
    password: "SecurePass123!",
  });

  if (result.error) {
    console.error(result.error.message);
  } else {
    // User authenticated, redirect to dashboard
  }
};
```

#### OAuth Sign In

```typescript
import { signInWithOAuth } from "@/lib/auth";

const handleGoogleSignIn = async () => {
  const result = await signInWithOAuth({
    provider: "google",
    redirectUrl: `${window.location.origin}/api/auth/callback`,
  });

  if (result.data?.url) {
    window.location.href = result.data.url;
  }
};
```

**Supported Providers:**

- Google
- LinkedIn (OIDC)

### Server-Side Authentication

Get authenticated user in server components:

```typescript
import { getServerSession } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/login");
  }

  return <div>Welcome {user.email}</div>;
}
```

### Password Recovery

```typescript
import { resetPassword, updatePassword } from "@/lib/auth";

// Send reset email
const sendReset = async (email: string) => {
  const result = await resetPassword({ email });
  // User checks email for reset link
};

// Update password (user must be authenticated)
const updatePass = async (newPassword: string) => {
  const result = await updatePassword({ newPassword });
};
```

### Auth Hook

Use the `useAuth` hook in client components:

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not authenticated</p>;

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>{profile?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## Database Structure

### Core Tables

#### `profiles`

User account information (extends `auth.users`):

```typescript
{
  id: string;              // UUID, foreign key to auth.users
  role: UserRole;          // 'founder' | 'investor' | 'partner' | 'admin'
  email: string;           // User email
  full_name: string;       // User display name
  avatar_url: string;      // Profile picture URL
  phone: string;           // Contact phone
  bio: string;             // User bio
  city: string;            // Location
  kyc_status: KycStatus;   // KYC verification status
  is_verified: boolean;    // Email verified
  plan: PlanType;          // Subscription plan
  onboarding_done: boolean; // Onboarding completed
  created_at: timestamptz; // Account creation date
  updated_at: timestamptz; // Last update
}
```

#### `founder_profiles`

Extended profile for founders:

```typescript
{
  id: string;
  user_id: string;         // Reference to profiles.id
  startup_name: string;
  tagline: string;
  sector: string;          // FinTech, HealthTech, etc.
  stage: string;           // pre-seed, seed, series-a, etc.
  ask_amount: bigint;      // Seeking amount (in paise)
  mrr: bigint;             // Monthly recurring revenue
  team_size: int;
  deck_url: string;        // Pitch deck path (Supabase Storage)
  is_public: boolean;      // Visible to investors
  tags: string[];          // Category tags
  created_at: timestamptz;
  updated_at: timestamptz;
}
```

#### `investor_profiles`

Extended profile for investors:

```typescript
{
  id: string;
  user_id: string;
  firm_name: string;       // Investment firm name
  investment_thesis: string; // Investment strategy
  sectors: string[];       // Focus sectors
  stages: string[];        // Investment stages
  ticket_min: bigint;      // Minimum check size (paise)
  ticket_max: bigint;      // Maximum check size (paise)
  portfolio_count: int;    // Companies invested in
  open_to_intros: boolean; // Accepting introductions
  is_public: boolean;      // Visible to founders
  created_at: timestamptz;
  updated_at: timestamptz;
}
```

#### `intro_requests`

Connection requests between investors and founders:

```typescript
{
  id: string;
  investor_id: string;     // Reference to profiles.id
  founder_id: string;      // Reference to profiles.id
  message: string;         // Intro message
  status: IntroStatus;     // pending, accepted, declined, completed
  founder_note: string;    // Founder's response
  meeting_date: timestamptz; // When meeting occurred
  completed_at: timestamptz; // When marked complete
  created_at: timestamptz;
  updated_at: timestamptz;
}
```

#### `message_threads`

Private messaging between users:

```typescript
{
  id: string;
  participant_a: string;
  participant_b: string;
  last_message: string;    // Preview of last message
  last_message_at: timestamptz;
  created_at: timestamptz;
}
```

#### `messages`

Individual messages in a thread:

```typescript
{
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  sent_at: timestamptz;
}
```

#### `notifications`

User notifications:

```typescript
{
  id: string;
  user_id: string;
  type: string;            // 'intro_request', 'intro_accepted', 'message', etc.
  title: string;
  body: string;
  action_url: string;      // Link to relevant page
  is_read: boolean;
  created_at: timestamptz;
}
```

#### `events`

Networking events and webinars:

```typescript
{
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  event_date: timestamptz;
  venue: string;
  city: string;
  is_virtual: boolean;
  capacity: int;
  status: EventStatus;     // draft, published, completed
  price: bigint;           // 0 for free (in paise)
  created_at: timestamptz;
}
```

---

## Row-Level Security

All tables have RLS enabled to protect user data. The system uses:

- **`auth.uid()`** — Current user ID
- **`auth.role()`** — Current user role (authenticated or anonymous)
- **Custom functions** — `is_admin()` to check admin status

### Profile Policies

**View Own Profile:**

```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
```

**View Other Profiles (Limited):**

```sql
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');
```

**Update Own Profile:**

```sql
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Intro Request Policies

**Investors create intros:**

```sql
CREATE POLICY "Investors can create intros"
  ON intro_requests FOR INSERT WITH CHECK (auth.uid() = investor_id);
```

**Founders see their intros:**

```sql
CREATE POLICY "Founders view intros to them"
  ON intro_requests FOR SELECT USING (auth.uid() = founder_id);
```

**Founders respond to intros:**

```sql
CREATE POLICY "Founders update intros to them"
  ON intro_requests FOR UPDATE USING (auth.uid() = founder_id);
```

---

## Real-Time Features

### Real-Time Subscriptions

The system supports real-time updates using Supabase Realtime. Hook into changes instantly:

#### Message Subscription Hook

Subscribe to new messages in a thread:

```typescript
"use client";
import { useMessageSubscription } from "@/hooks/useRealtime";

export default function ChatThread({ threadId }) {
  const { messages, isLoading } = useMessageSubscription(threadId, (newMsg) => {
    console.log("New message:", newMsg);
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

#### Notification Subscription Hook

Real-time notifications for the current user:

```typescript
"use client";
import { useNotificationSubscription } from "@/hooks/useRealtime";

export default function Notifications({ userId }) {
  const { notifications, unreadCount, markAsRead } = useNotificationSubscription(userId);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h3>{notif.title}</h3>
          <p>{notif.body}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Message Thread Subscription

Monitor all message threads for a user:

```typescript
const { threads } = useMessageThreadSubscription(userId);
```

#### Intro Request Subscription

Real-time intro request updates:

```typescript
const { intros } = useIntroSubscription(userId, userRole);
```

---

## Data Services

### Query Functions

Centralized data access layer with server-side only functions:

#### Get Profile

```typescript
import { getProfile } from "@/lib/data/queries";

const profile = await getProfile(userId);
```

#### Get Intro Requests

```typescript
import { getIntroRequests } from "@/lib/data/queries";

// For founder
const intros = await getIntroRequests(userId, "founder", page);

// For investor
const intros = await getIntroRequests(userId, "investor", page);
```

#### Get Message Threads

```typescript
import { getMessageThreads } from "@/lib/data/queries";

const threads = await getMessageThreads(userId, page);
```

#### Create Message

```typescript
import { createMessage } from "@/lib/data/queries";

const message = await createMessage(threadId, senderId, "Hello!");
```

#### Get Notifications

```typescript
import { getNotifications } from "@/lib/data/queries";

const notifications = await getNotifications(userId, page);
const unreadCount = await getUnreadNotificationCount(userId);
```

---

## API Routes

### Standard Response Format

All API routes return consistent JSON:

```typescript
// Success
{ "success": true, "data": { /* ... */ } }

// Error
{ "success": false, "error": { "message": "...", "code": "...", "status": 400 } }
```

### Authentication Middleware

All protected routes check authentication:

```typescript
import { requireAuth } from "@/lib/api";

export async function POST(request: Request) {
  const authCheck = await requireAuth(request);
  if (authCheck instanceof NextResponse) return authCheck;
  const { user } = authCheck;

  // User is authenticated, proceed
}
```

### Role-Based Authorization

Restrict endpoints to specific roles:

```typescript
import { requireRole } from "@/lib/api";

export async function POST(request: Request) {
  const authCheck = await requireRole(request, ["admin"]);
  if (authCheck instanceof NextResponse) return authCheck;
  const { user } = authCheck;

  // Only admins reach here
}
```

### Request Validation

Validate incoming request bodies:

```typescript
import { validateRequestBody, validationErrorResponse } from "@/lib/api";

const schema = {
  email: { type: "email" as const, required: true },
  message: { type: "string" as const, required: true, min: 1, max: 500 },
};

const { valid, errors } = validateRequestBody(body, schema);
if (!valid) return validationErrorResponse(JSON.stringify(errors));
```

### Creating an Intro Request

```
POST /api/intros
Content-Type: application/json

{
  "founder_id": "user-uuid",
  "message": "I'd love to invest in your company"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "intro-uuid",
    "investor_id": "...",
    "founder_id": "...",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Responding to an Intro

```
PATCH /api/intros
Content-Type: application/json

{
  "intro_id": "intro-uuid",
  "action": "accept",
  "note": "Great to connect with you!"
}
```

---

## Security Best Practices

### 1. Row-Level Security (RLS)

Always use RLS to protect user data. Never query tables without proper RLS policies.

✅ **Good:**

```typescript
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId); // RLS enforces user can only access their own
```

❌ **Bad:**

```typescript
const { data } = await supabase
  .from("profiles")
  .select("*"); // RLS will block this, only founder can access their own
```

### 2. Email Verification

Users must verify their email before creating data:

```typescript
// Auto-create profile on signup only works after email verification
// RLS prevents operations until verified
```

### 3. Service Role for Admin Operations

Use service role key only on the server for admin operations:

```typescript
import { createAdminClient } from "@/lib/supabase/server";

export const adminClient = createAdminClient();
// Only use on server-side
```

❌ **Never expose service role key to client**

### 4. Environment Variables

Store secrets in `.env.local` and never commit:

```env
# Public (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Secret (never expose)
SUPABASE_SERVICE_ROLE_KEY=... # Server-only
```

### 5. Input Validation

Always validate user input before database operations:

```typescript
const { valid, errors } = validateRequestBody(body, {
  email: { type: "email", required: true },
  message: { type: "string", required: true, max: 500 },
});

if (!valid) return validationErrorResponse(JSON.stringify(errors));
```

### 6. CORS Headers

APIs include proper CORS headers:

```typescript
import { withCORS } from "@/lib/api";

let response = successResponse(data);
response = withCORS(response);
return response;
```

### 7. Rate Limiting

Basic rate limiting for brute-force protection:

```typescript
import { checkRateLimit } from "@/lib/api";

const { allowed, remaining } = checkRateLimit(userId, 10, 60000); // 10 requests per minute
if (!allowed) return errorResponse("Too many requests", 429);
```

### 8. SQL Injection Prevention

Always use parameterized queries (Supabase does this automatically):

```typescript
// ✅ Safe - parameterized
await supabase.from("table").select("*").eq("id", userId);

// ❌ Unsafe - concatenated SQL
// (not possible with Supabase SDK)
```

### 9. XSS Prevention

Sanitize displayed user content:

```typescript
// React automatically escapes text content
<div>{userData.text}</div> // Safe

// Use dangerouslySetInnerHTML only for trusted HTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> // Requires sanitization
```

---

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional, for email notifications)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@fundlink.in

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payment (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## Troubleshooting

### "User not authenticated"

Ensure:

1. Email is verified (check inbox)
2. Session cookie is set (check browser dev tools)
3. User exists in `auth.users`

### "RLS policy violation"

Check:

1. User is logged in (`auth.uid()` is set)
2. RLS policy allows the operation
3. User owns the resource (for restrictive policies)

### Real-time not updating

Ensure:

1. Realtime is enabled in Supabase dashboard
2. User has permissions to read the table
3. Row changes match your filter conditions

### Slow queries

Use:

1. Indexed columns (created_at, user_id, status)
2. Pagination (limit results)
3. Select only needed columns

---

## Next Steps

1. ✅ Deploy to production (Vercel + Supabase)
2. ✅ Enable two-factor authentication
3. ✅ Set up email notifications
4. ✅ Configure OAuth for production
5. ✅ Enable backups in Supabase
6. ✅ Monitor database usage

For more information, visit [Supabase Docs](https://supabase.com/docs).
