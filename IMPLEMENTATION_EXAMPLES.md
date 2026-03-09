# Implementation Examples

Real-world examples showing how to use FundLink's Supabase integration.

## Authentication Examples

### Example 1: Sign Up with Email Verification

```typescript
"use client";
import { useState } from "react";
import { signUp, validateEmail, validatePasswordStrength } from "@/lib/auth";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const passwordStrength = validatePasswordStrength(password);
  const emailValid = validateEmail(email).valid;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setMessage(emailCheck.message || "Invalid email");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const result = await signUp({
      email,
      password,
      full_name: name,
      role: "founder",
    });

    if (result.error) {
      setMessage(`Error: ${result.error.message}`);
    } else {
      setMessage("Check your email to verify your account!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {password && (
        <div>
          <div>Strength: {passwordStrength.label}</div>
          {passwordStrength.feedback.map((f) => (
            <small key={f}>{f}</small>
          ))}
        </div>
      )}
      <button type="submit" disabled={loading || !emailValid}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### Example 2: Protected Dashboard with useAuth

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    redirect("/auth/login");
  }

  const dashboardUrl = `/dashboard/${profile?.role || "founder"}`;

  return (
    <div>
      <h1>Welcome, {profile?.full_name}!</h1>
      <p>Role: {profile?.role}</p>
      <p>Email: {profile?.email}</p>
      <a href={dashboardUrl}>Go to dashboard →</a>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## Real-Time Messaging

### Example 3: Real-Time Chat Thread

```typescript
"use client";
import { useState } from "react";
import { useMessageSubscription } from "@/hooks/useRealtime";
import { createMessage } from "@/lib/data/queries";
import toast from "react-hot-toast";

export function ChatThread({ threadId, userId }: { threadId: string; userId: string }) {
  const { messages, isLoading } = useMessageSubscription(threadId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await createMessage(threadId, userId, newMessage);

    if (result) {
      setNewMessage("");
      toast.success("Message sent");
    } else {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.sender_id === userId ? "ml-auto" : ""}>
            <div className="font-semibold text-sm text-gray-600">
              {msg.sender?.full_name}
            </div>
            <div className="bg-blue-100 rounded p-2">{msg.body}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.sent_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={handleSend} disabled={sending} className="bg-blue-500 text-white px-4 py-2 rounded">
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
```

### Example 4: Real-Time Notifications

```typescript
"use client";
import { useNotificationSubscription } from "@/hooks/useRealtime";
import { useEffect, useState } from "react";

export function NotificationBell({ userId }: { userId: string }) {
  const { unreadCount, notifications, markAsRead } = useNotificationSubscription(userId);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b font-bold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  !notif.is_read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <h3 className="font-semibold text-sm">{notif.title}</h3>
                <p className="text-sm text-gray-600">{notif.body}</p>
                <a href={notif.action_url || "#"} className="text-xs text-blue-500">
                  View →
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

---

## API Route Examples

### Example 5: Create Intro Request API

```typescript
// src/app/api/intros/route.ts
import { requireAuth, validateRequestBody, validationErrorResponse, successResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/data/queries";
import { sendIntroRequestEmail } from "@/lib/email";

const schema = {
  founder_id: { type: "uuid" as const, required: true },
  message: { type: "string" as const, max: 500 },
};

export async function POST(request: Request) {
  // Check authentication
  const authCheck = await requireAuth(request);
  if (authCheck instanceof Response) return authCheck;
  const { user } = authCheck;

  // Parse and validate request
  const body = await request.json();
  const { valid, errors } = validateRequestBody(body, schema);
  if (!valid) return validationErrorResponse(JSON.stringify(errors));

  const { founder_id, message } = body;
  const supabase = createClient();

  // Check investor profile exists
  const { data: investorProfile } = await supabase
    .from("investor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!investorProfile) {
    return Response.json(
      { error: "Investor profile not found" },
      { status: 403 }
    );
  }

  // Create intro request
  const { data: intro, error } = await supabase
    .from("intro_requests")
    .insert({ investor_id: user.id, founder_id, message })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Create notification
  await createNotification(
    founder_id,
    "intro_request",
    "New introduction request",
    `An investor wants to connect with you`,
    `/dashboard/founder?tab=intros`
  );

  // Send email (fire and forget)
  const { data: founder } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", founder_id)
    .single();

  if (founder?.email) {
    sendIntroRequestEmail({
      founderEmail: founder.email,
      founderName: founder.full_name || "Founder",
      investorName: user.email || "Investor",
      investorFirm: "",
      message: message || "",
      introId: intro.id,
    }).catch(console.error);
  }

  return successResponse(intro);
}
```

### Example 6: Get Profile with Server Action

```typescript
// src/app/actions.ts
"use server";
import { getProfile } from "@/lib/data/queries";
import { getServerSession } from "@/lib/auth";

export async function getCurrentUserProfile() {
  const user = await getServerSession();
  if (!user) return null;

  return await getProfile(user.id);
}

export async function updateUserProfile(updates: any) {
  const user = await getServerSession();
  if (!user) throw new Error("Not authenticated");

  // Add server-side validation here
  const { getProfile, updateProfile } = await import("@/lib/data/queries");
  return await updateProfile(user.id, updates);
}
```

---

## Data Query Examples

### Example 7: Browse Founders (with Filters)

```typescript
"use client";
import { useEffect, useState } from "react";
import { getPublicFounderProfiles } from "@/lib/data/queries";
import type { FounderProfile } from "@/types";

export function FounderBrowser() {
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadFounders = async () => {
      setLoading(true);
      const data = await getPublicFounderProfiles(page, { sector: sector || undefined });
      setFounders(data);
      setLoading(false);
    };

    loadFounders();
  }, [sector, page]);

  return (
    <div>
      <select value={sector} onChange={(e) => setSector(e.target.value)}>
        <option value="">All sectors</option>
        <option value="FinTech">FinTech</option>
        <option value="HealthTech">HealthTech</option>
        <option value="SaaS">SaaS</option>
      </select>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {founders.map((founder) => (
            <div key={founder.id} className="border p-4 rounded">
              <h3>{founder.startup_name}</h3>
              <p>{founder.tagline}</p>
              <p>Stage: {founder.stage}</p>
              <p>Asking: ₹{founder.ask_amount}</p>
              <a href={`/founder/${founder.id}`}>View profile →</a>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          ← Prev
        </button>
        <button onClick={() => setPage(p => p + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
```

### Example 8: Intro Request Management

```typescript
"use client";
import { useIntroSubscription } from "@/hooks/useRealtime";
import { updateIntroStatus } from "@/lib/data/queries";
import toast from "react-hot-toast";

export function IntroRequests({ userId, userRole }: { userId: string; userRole: "founder" | "investor" }) {
  const { intros, isLoading } = useIntroSubscription(userId, userRole);

  const handleResponse = async (introId: string, action: "accepted" | "declined") => {
    const success = await updateIntroStatus(introId, action);
    if (success) {
      toast.success(`Intro ${action}`);
    } else {
      toast.error("Failed to update intro");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {intros.length === 0 ? (
        <p className="text-gray-500">No intro requests</p>
      ) : (
        intros.map((intro) => (
          <div key={intro.id} className="border p-4 rounded">
            {userRole === "founder" && (
              <div>
                <h3>{intro.investor?.full_name}</h3>
                <p>{intro.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(intro.id, "accepted")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(intro.id, "declined")}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
            {userRole === "investor" && (
              <div>
                <h3>{intro.founder?.full_name}</h3>
                <p>Status: {intro.status}</p>
                <p>{intro.founder?.founder_profiles?.[0]?.startup_name}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

---

## Advanced Patterns

### Example 9: Secure Data Room Access

```typescript
// Check if user has access to a document
async function checkDocumentAccess(userId: string, documentId: string) {
  const supabase = createClient();

  // Check if owner
  const { data: doc } = await supabase
    .from("documents")
    .select("owner_id, access_level")
    .eq("id", documentId)
    .single();

  if (!doc) return false;
  if (doc.owner_id === userId) return true;
  if (doc.access_level === "public") return true;

  // Check explicit access
  const { data: access } = await supabase
    .from("document_access")
    .select("id")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .single();

  return !!access;
}
```

### Example 10: Transaction-Like Operations

```typescript
// Multi-step operation with error handling
async function acceptIntroAndCreateThread(introId: string, userId: string) {
  const supabase = createClient();

  try {
    // 1. Update intro status
    const { error: introError } = await supabase
      .from("intro_requests")
      .update({ status: "accepted" })
      .eq("id", introId);

    if (introError) throw introError;

    // 2. Get intro details
    const { data: intro } = await supabase
      .from("intro_requests")
      .select("investor_id, founder_id")
      .eq("id", introId)
      .single();

    if (!intro) throw new Error("Intro not found");

    // 3. Create message thread
    const { data: thread } = await supabase
      .from("message_threads")
      .insert({
        participant_a: userId,
        participant_b: userId === intro.investor_id ? intro.founder_id : intro.investor_id,
      })
      .select()
      .single();

    return thread;
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
}
```

---

## Summary

These examples demonstrate:

- ✅ Email/password and OAuth authentication
- ✅ Real-time subscriptions (messages, notifications)
- ✅ Server-side queries with proper auth checks
- ✅ API routes with validation and error handling
- ✅ Complex data operations with RLS
- ✅ Type-safe TypeScript patterns

For complete API documentation, see `SUPABASE_INTEGRATION.md`.
