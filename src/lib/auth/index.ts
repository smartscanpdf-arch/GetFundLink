import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/utils";

export interface SignUpOptions {
  email: string;
  password: string;
  full_name: string;
  role: "founder" | "investor" | "partner";
  org_name?: string;
  phone?: string;
}

export interface SignInOptions {
  email: string;
  password: string;
}

export interface PasswordResetOptions {
  email: string;
  redirectUrl?: string;
}

export interface PasswordUpdateOptions {
  newPassword: string;
}

export interface OAuthOptions {
  provider: "google" | "linkedin_oidc";
  redirectUrl: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse<T> {
  data?: T;
  error?: AuthError;
}

// ─── Client-side auth functions ───────────────────────────────────────────────

export async function signUp(options: SignUpOptions): Promise<AuthResponse<User>> {
  try {
    if (!options.email || !options.password || !options.full_name) {
      return {
        error: { message: "Email, password, and name are required" }
      };
    }

    if (!isValidEmail(options.email)) {
      return { error: { message: "Invalid email address" } };
    }

    if (options.password.length < 8) {
      return { error: { message: "Password must be at least 8 characters" } };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: options.email,
      password: options.password,
      options: {
        emailRedirectTo: options.org_name 
          ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/callback`
          : `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/callback`,
        data: {
          full_name: options.full_name,
          role: options.role,
          org_name: options.org_name,
          phone: options.phone,
        },
      },
    });

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: data.user || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function signIn(options: SignInOptions): Promise<AuthResponse<User>> {
  try {
    if (!options.email || !options.password) {
      return { error: { message: "Email and password are required" } };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: data.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function signInWithOAuth(options: OAuthOptions): Promise<AuthResponse<{ url?: string }>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: options.provider,
      options: {
        redirectTo: options.redirectUrl,
      },
    });

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: { url: data?.url } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function resetPassword(options: PasswordResetOptions): Promise<AuthResponse<{ message: string }>> {
  try {
    if (!isValidEmail(options.email)) {
      return { error: { message: "Invalid email address" } };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(options.email, {
      redirectTo: options.redirectUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password`,
    });

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return {
      data: { message: "Password reset email sent. Please check your inbox." }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function updatePassword(options: PasswordUpdateOptions): Promise<AuthResponse<User>> {
  try {
    if (!options.newPassword || options.newPassword.length < 8) {
      return { error: { message: "Password must be at least 8 characters" } };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ password: options.newPassword });

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: data.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function signOut(): Promise<AuthResponse<{ message: string }>> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: { message: "Signed out successfully" } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

export async function getSession(): Promise<AuthResponse<{ user: User | null }>> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: { user: session?.user || null } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}

// ─── Server-side auth functions ───────────────────────────────────────────────

export async function getServerSession(): Promise<User | null> {
  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Server session error:", error);
      return null;
    }

    return user || null;
  } catch (err) {
    console.error("Server auth error:", err);
    return null;
  }
}

// ─── Password strength validation ─────────────────────────────────────────────

export interface PasswordStrength {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("At least 8 characters");
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  const labels: ("Weak" | "Fair" | "Good" | "Strong")[] = ["Weak", "Fair", "Fair", "Good", "Good", "Strong"];
  
  return {
    score,
    label: labels[score] || "Weak",
    feedback: feedback.slice(0, 2),
  };
}

// ─── Email validation ─────────────────────────────────────────────────────────

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true };
}

// ─── Session refresh ──────────────────────────────────────────────────────────

export async function refreshSession(): Promise<AuthResponse<{ user: User | null }>> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      return { error: { message: error.message, code: error.code } };
    }

    return { data: { user: session?.user || null } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: { message } };
  }
}
