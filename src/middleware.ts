import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check environment variables exist before attempting auth
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Skip auth middleware if Supabase is not configured
    return NextResponse.next({ request });
  }

  // Only load Supabase middleware if env vars are present
  const { updateSession } = await import("@/lib/supabase/middleware");
  
  try {
    return await updateSession(request);
  } catch (error) {
    // Silently fail and pass through request if middleware errors
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
