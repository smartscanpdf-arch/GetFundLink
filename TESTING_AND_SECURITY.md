# Testing & Security Guide

Comprehensive testing strategies and security best practices for FundLink's Supabase integration.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Authentication Testing](#authentication-testing)
3. [RLS Testing](#rls-testing)
4. [API Testing](#api-testing)
5. [Security Checklist](#security-checklist)
6. [Performance Testing](#performance-testing)

---

## Testing Strategy

### Unit Tests

Test individual functions in isolation:

```typescript
// __tests__/lib/auth/index.test.ts
import { validatePasswordStrength, validateEmail } from "@/lib/auth";

describe("Auth Utilities", () => {
  describe("validatePasswordStrength", () => {
    it("should return Weak for short password", () => {
      const result = validatePasswordStrength("pass");
      expect(result.label).toBe("Weak");
    });

    it("should return Strong for complex password", () => {
      const result = validatePasswordStrength("SecurePass123!");
      expect(result.label).toBe("Strong");
    });
  });

  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      const result = validateEmail("user@example.com");
      expect(result.valid).toBe(true);
    });

    it("should reject invalid emails", () => {
      const result = validateEmail("invalid-email");
      expect(result.valid).toBe(false);
    });
  });
});
```

### Integration Tests

Test auth flows with Supabase:

```typescript
// __tests__/integration/auth.test.ts
import { createClient } from "@/lib/supabase/client";

describe("Authentication Flow", () => {
  it("should sign up new user", async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "TestPass123!",
    });

    expect(error).toBeNull();
    expect(data.user?.email).toBe("test@example.com");
  });

  it("should not sign in with wrong password", async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "WrongPassword",
    });

    expect(error).toBeDefined();
  });
});
```

### E2E Tests

Test complete user flows with Playwright:

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should complete signup flow", async ({ page }) => {
    await page.goto("/auth/signup");

    // Select role
    await page.click("button:has-text('Founder')");
    await page.click("button:has-text('Continue')");

    // Fill form
    await page.fill('input[type="text"]', "John Doe");
    await page.fill('input[type="email"]', "john@example.com");
    await page.fill('input[type="password"]', "SecurePass123!");
    await page.click('input[type="checkbox"]');
    await page.click("button:has-text('Create Account')");

    // Check email verification message
    await expect(page.locator("text=Check your inbox")).toBeVisible();
  });

  test("should login and redirect to dashboard", async ({ page }) => {
    // Create user first (via API or signup)
    
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "john@example.com");
    await page.fill('input[type="password"]', "SecurePass123!");
    await page.click("button:has-text('Sign In')");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard/founder");
  });
});
```

---

## Authentication Testing

### Test User Accounts

Create test accounts for different roles:

```sql
-- Insert test users with different roles
INSERT INTO auth.users (email, password_hash, confirmed_at)
VALUES
  ('founder@test.com', 'hash1', now()),
  ('investor@test.com', 'hash2', now()),
  ('partner@test.com', 'hash3', now());

-- Insert corresponding profiles
INSERT INTO profiles (id, email, role, full_name)
SELECT id, email, 'founder', 'Founder Test'
FROM auth.users WHERE email = 'founder@test.com';
```

### Test Sessions

```typescript
// Test session management
async function testSessionHandling() {
  const supabase = createClient();

  // Sign in
  const { data: { session } } = await supabase.auth.signIn({
    email: "test@example.com",
    password: "password123",
  });

  expect(session).toBeDefined();

  // Check session is available
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  expect(currentSession?.user?.id).toBe(session?.user?.id);

  // Sign out
  await supabase.auth.signOut();

  // Session should be cleared
  const { data: { session: nullSession } } = await supabase.auth.getSession();
  expect(nullSession).toBeNull();
}
```

### Test OAuth Flows

```typescript
// Mock OAuth flow
async function testOAuthLogin() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/api/auth/callback",
    },
  });

  expect(error).toBeNull();
  expect(data.url).toContain("accounts.google.com");
}
```

---

## RLS Testing

### Test Profile Policies

```typescript
async function testProfileRLS() {
  const supabase = createClient();

  // User should see own profile
  const { data: ownProfile, error: ownError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUserId)
    .single();

  expect(ownError).toBeNull();
  expect(ownProfile).toBeDefined();

  // User should see other authenticated users' profiles
  const { data: otherProfile, error: otherError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", anotherUserId)
    .single();

  expect(otherError).toBeNull();
  expect(otherProfile).toBeDefined();
}
```

### Test Intro Request Policies

```typescript
async function testIntroRLS() {
  // Investor should create intro
  const { data: intro, error: createError } = await supabase
    .from("intro_requests")
    .insert({
      investor_id: investorId,
      founder_id: founderId,
      message: "Test message",
    })
    .select()
    .single();

  expect(createError).toBeNull();
  expect(intro).toBeDefined();

  // Founder should see intro
  const { data: founderSees, error: founderError } = await supabase
    .from("intro_requests")
    .select("*")
    .eq("id", intro.id);

  expect(founderError).toBeNull();

  // Founder should be able to update
  const { error: updateError } = await supabase
    .from("intro_requests")
    .update({ status: "accepted" })
    .eq("id", intro.id)
    .eq("founder_id", founderId);

  expect(updateError).toBeNull();
}
```

### Test Message Policies

```typescript
async function testMessageRLS() {
  const supabase = createClient();

  // Only thread participants can see messages
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId);

  expect(error).toBeNull();

  // Non-participant should get empty result
  // (RLS blocks without error, just no results)
  const { data: restrictedMessages } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId);

  expect(restrictedMessages?.length).toBe(0);
}
```

---

## API Testing

### Test Protected Endpoints

```typescript
async function testProtectedAPI() {
  // Test without auth
  let response = await fetch("/api/intros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ founder_id: "123" }),
  });

  expect(response.status).toBe(401);

  // Test with auth token
  const token = (await getSession()).session?.access_token;
  response = await fetch("/api/intros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ founder_id: founderId }),
  });

  expect(response.status).toBe(200);
}
```

### Test Validation

```typescript
async function testAPIValidation() {
  const token = getAuthToken();

  // Missing required field
  let response = await fetch("/api/intros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ message: "Test" }), // missing founder_id
  });

  expect(response.status).toBe(422); // Validation error
  const error = await response.json();
  expect(error.error.code).toBe("VALIDATION_ERROR");

  // Invalid UUID format
  response = await fetch("/api/intros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ founder_id: "not-a-uuid" }),
  });

  expect(response.status).toBe(422);
}
```

### Test Rate Limiting

```typescript
async function testRateLimit() {
  const token = getAuthToken();

  // Make 11 requests (limit is 10 per minute)
  for (let i = 0; i < 11; i++) {
    const response = await fetch("/api/messages", {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (i < 10) {
      expect(response.status).toBe(200);
    } else {
      expect(response.status).toBe(429); // Too many requests
    }
  }
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] CORS headers properly set
- [ ] RLS enabled on all tables
- [ ] Service role key never exposed to client
- [ ] Email verification required for new accounts
- [ ] Password reset emails configured
- [ ] OAuth providers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all API routes
- [ ] HTTPS enforced in production
- [ ] Database backups enabled
- [ ] Audit logging enabled

### Authentication Security

- [ ] Password minimum 8 characters enforced
- [ ] Password strength feedback shown
- [ ] Session timeout configured
- [ ] Secure session cookies (HttpOnly, Secure, SameSite)
- [ ] CSRF tokens implemented
- [ ] Two-factor authentication available (optional)
- [ ] Login attempt limits
- [ ] Suspicious activity alerts

### Data Security

- [ ] RLS policies tested and verified
- [ ] User can only access own data
- [ ] Admin operations use service role only
- [ ] Sensitive data encrypted at rest
- [ ] Data encrypted in transit (HTTPS)
- [ ] Regular security audits scheduled
- [ ] Data retention policies defined
- [ ] GDPR compliance reviewed

### API Security

- [ ] All endpoints authenticated
- [ ] Role-based access control implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info

### Infrastructure Security

- [ ] Supabase project behind firewall
- [ ] IP whitelist configured
- [ ] Backup encryption enabled
- [ ] Monitoring and alerts enabled
- [ ] Incident response plan documented
- [ ] Regular security updates applied
- [ ] Dependency vulnerabilities scanned
- [ ] Secret rotation schedule established

---

## Performance Testing

### Load Testing

```bash
# Install load testing tool
npm install -g artillery

# Create loadtest.yml
```

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 60
      arrivalRate: 20
      name: 'Ramp up'
    - duration: 60
      arrivalRate: 50
      name: 'Spike'

scenarios:
  - name: 'Get messages'
    flow:
      - get:
          url: '/api/messages?threadId={{ threadId }}'

  - name: 'Send message'
    flow:
      - post:
          url: '/api/messages'
          json:
            threadId: '{{ threadId }}'
            body: 'Test message'

  - name: 'Get profile'
    flow:
      - get:
          url: '/api/profile'
```

```bash
# Run load test
artillery run loadtest.yml
```

### Database Performance

```typescript
// Test query performance
async function testQueryPerformance() {
  const supabase = createClient();

  console.time("Fetch 100 profiles");
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .limit(100);
  console.timeEnd("Fetch 100 profiles");

  console.time("Fetch intros with relations");
  const { data: intros } = await supabase
    .from("intro_requests")
    .select(
      `*,
      investor:investor_id(id, full_name),
      founder:founder_id(id, full_name, founder_profiles(startup_name))`
    )
    .limit(50);
  console.timeEnd("Fetch intros with relations");
}
```

### Real-Time Performance

```typescript
// Test real-time subscription latency
async function testRealtimeLatency() {
  const supabase = createClient();

  let messageLatency: number[] = [];

  const subscription = supabase
    .channel(`test-thread`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const receivedAt = Date.now();
        const sentAt = (payload.new as any).sent_at;
        const latency = receivedAt - new Date(sentAt).getTime();
        messageLatency.push(latency);
      }
    )
    .subscribe();

  // Send 10 messages and measure latency
  for (let i = 0; i < 10; i++) {
    await supabase.from("messages").insert({
      thread_id: "test-thread",
      sender_id: userId,
      body: `Test ${i}`,
    });
    await new Promise((r) => setTimeout(r, 100));
  }

  const avgLatency = messageLatency.reduce((a, b) => a + b) / messageLatency.length;
  console.log(`Average real-time latency: ${avgLatency}ms`);

  subscription.unsubscribe();
}
```

---

## Monitoring

### Set Up Alerts

In Supabase dashboard → Logs → Alerts:

1. **High Error Rate**: > 5% of requests failing
2. **Slow Queries**: Query time > 1000ms
3. **Authentication Failures**: > 10 failed logins per hour
4. **Rate Limit Exceeded**: > 100 requests per minute

### Key Metrics to Track

- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Real-time latency
- Authentication success rate
- Data storage usage
- API bandwidth usage

### Log Monitoring

```sql
-- Find slow queries
SELECT
  execution_time,
  query,
  role
FROM postgres_logs
WHERE execution_time > 1000
ORDER BY execution_time DESC
LIMIT 10;

-- Find errors
SELECT
  timestamp,
  message,
  status_code
FROM postgres_logs
WHERE severity = 'ERROR'
ORDER BY timestamp DESC
LIMIT 20;
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:lint

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Summary

- ✅ Comprehensive testing at all levels (unit, integration, E2E)
- ✅ RLS policies thoroughly tested before deployment
- ✅ Security checklist for pre-deployment
- ✅ Performance monitoring and load testing
- ✅ Continuous integration setup
- ✅ Alerting and monitoring recommendations

For deployment, complete the security checklist before going live.
