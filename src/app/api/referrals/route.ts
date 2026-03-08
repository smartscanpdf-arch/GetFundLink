import { createClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/referrals — get user's referrals
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: referrals } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ referrals: referrals ?? [] });
}

// POST /api/referrals — track a referral invite
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referred_email } = await request.json();
  if (!referred_email) return NextResponse.json({ error: "referred_email required" }, { status: 400 });

  const code = generateReferralCode(user.id);

  const { data, error } = await supabase
    .from("referrals")
    .upsert({ referrer_id: user.id, referred_email, code }, { onConflict: "code" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ referral: data });
}
