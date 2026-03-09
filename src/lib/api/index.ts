import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ─── HTTP Response builders ───────────────────────────────────────────────────

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, code?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: { message, code, status } },
    { status }
  );
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

export function forbiddenResponse(message = "Forbidden"): NextResponse<ApiResponse> {
  return errorResponse(message, 403, "FORBIDDEN");
}

export function notFoundResponse(message = "Not found"): NextResponse<ApiResponse> {
  return errorResponse(message, 404, "NOT_FOUND");
}

export function conflictResponse(message = "Conflict"): NextResponse<ApiResponse> {
  return errorResponse(message, 409, "CONFLICT");
}

export function validationErrorResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 422, "VALIDATION_ERROR");
}

export function internalServerErrorResponse(error?: any): NextResponse<ApiResponse> {
  console.error("Internal server error:", error);
  return errorResponse("Internal server error", 500, "INTERNAL_SERVER_ERROR");
}

// ─── Authentication ───────────────────────────────────────────────────────────

export async function getAuthUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
      return null;
    }

    return user;
  } catch (err) {
    console.error("Get auth user error:", err);
    return null;
  }
}

export async function requireAuth(request: Request): Promise<{ user: User } | NextResponse<ApiResponse>> {
  const user = await getAuthUser();

  if (!user) {
    return unauthorizedResponse("Authentication required");
  }

  return { user };
}

export async function requireRole(request: Request, allowedRoles: string[]): Promise<{ user: User } | NextResponse<ApiResponse>> {
  const user = await getAuthUser();

  if (!user) {
    return unauthorizedResponse("Authentication required");
  }

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (error || !profile) {
    return forbiddenResponse("Profile not found");
  }

  if (!allowedRoles.includes(profile.role)) {
    return forbiddenResponse("Insufficient permissions");
  }

  return { user };
}

// ─── Request validation ───────────────────────────────────────────────────────

export interface ValidationRule {
  type: "string" | "number" | "boolean" | "email" | "uuid";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateRequestBody(
  body: Record<string, any>,
  schema: ValidationSchema
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [key, rule] of Object.entries(schema)) {
    const value = body[key];

    // Check required
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors[key] = rule.message || `${key} is required`;
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    // Check type
    if (rule.type === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[key] = rule.message || `${key} must be a valid email`;
      }
    } else if (rule.type === "uuid") {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        errors[key] = rule.message || `${key} must be a valid UUID`;
      }
    } else if (rule.type === "string") {
      if (typeof value !== "string") {
        errors[key] = rule.message || `${key} must be a string`;
        continue;
      }
      if (rule.min && value.length < rule.min) {
        errors[key] = rule.message || `${key} must be at least ${rule.min} characters`;
      }
      if (rule.max && value.length > rule.max) {
        errors[key] = rule.message || `${key} must be at most ${rule.max} characters`;
      }
    } else if (rule.type === "number") {
      if (typeof value !== "number") {
        errors[key] = rule.message || `${key} must be a number`;
        continue;
      }
      if (rule.min !== undefined && value < rule.min) {
        errors[key] = rule.message || `${key} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[key] = rule.message || `${key} must be at most ${rule.max}`;
      }
    } else if (rule.type === "boolean") {
      if (typeof value !== "boolean") {
        errors[key] = rule.message || `${key} must be a boolean`;
      }
    }

    // Check pattern
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors[key] = rule.message || `${key} format is invalid`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ─── Request body parsing ─────────────────────────────────────────────────────

export async function parseRequestBody<T = any>(request: Request): Promise<{ data?: T; error?: string }> {
  try {
    const data = await request.json();
    return { data };
  } catch (err) {
    return { error: "Invalid JSON body" };
  }
}

// ─── Rate limiting (basic implementation) ──────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.reset < now) {
    rateLimitStore.set(identifier, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  
  // Cleanup old entries if needed (every 60 seconds)
  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    const keys = Array.from(rateLimitStore.keys());
    for (const key of keys) {
      const e = rateLimitStore.get(key);
      if (e && e.reset < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return { allowed: true, remaining: limit - entry.count };
}

// ─── CORS headers ─────────────────────────────────────────────────────────────

export function withCORS(response: NextResponse, options?: { origin?: string; methods?: string[]; headers?: string[] }): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", options?.origin || process.env.NEXT_PUBLIC_APP_URL || "*");
  response.headers.set("Access-Control-Allow-Methods", (options?.methods || ["GET", "POST", "PATCH", "DELETE"]).join(", "));
  response.headers.set("Access-Control-Allow-Headers", (options?.headers || ["Content-Type", "Authorization"]).join(", "));
  return response;
}

// ─── Error handling wrapper ────────────────────────────────────────────────────

export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API handler error:", error);
      return internalServerErrorResponse(error);
    }
  }) as T;
}

// ─── Logging middleware ───────────────────────────────────────────────────────

export function logRequest(method: string, path: string, status: number, duration: number) {
  const timestamp = new Date().toISOString();
  const statusColor = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";
  console.log(`[${timestamp}] ${statusColor} ${method} ${path} - ${status} (${duration}ms)`);
}

// ─── Data serialization ───────────────────────────────────────────────────────

export function safeSerialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
