import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Get user role to redirect to correct dashboard
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_done, kyc_status")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "founder";

        // New user — send to KYC/onboarding if not done
        if (!profile?.onboarding_done) {
          return NextResponse.redirect(`${origin}/dashboard/${role}?onboarding=true`);
        }

        return NextResponse.redirect(`${origin}/dashboard/${role}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
