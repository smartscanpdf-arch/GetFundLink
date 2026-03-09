import { createClient } from "@/lib/supabase/server";
import { sendIntroRequestEmail, sendIntroAcceptedEmail } from "@/lib/email";
import { NextResponse } from "next/server";

// POST /api/intros — create intro request
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { founder_id, message } = body;

  if (!founder_id) {
    return NextResponse.json({ error: "founder_id is required" }, { status: 400 });
  }

  // Check investor profile
  const { data: investorProfile } = await supabase
    .from("investor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single<{ id: string }>();

  if (!investorProfile) {
    return NextResponse.json({ error: "Investor profile not found" }, { status: 403 });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("intro_requests")
    .select("id, status")
    .eq("investor_id", user.id)
    .eq("founder_id", founder_id)
    .single<{ id: string; status: string }>();

  if (existing) {
    return NextResponse.json({ error: "Intro request already exists", status: existing.status }, { status: 409 });
  }

  // Create intro request
  const { data: intro, error } = await (supabase.from("intro_requests") as any)
    .insert({ investor_id: user.id, founder_id, message })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for founder
  await (supabase.from("notifications") as any).insert({
    user_id:    founder_id,
    type:       "intro_request",
    title:      "New introduction request",
    body:       message ?? "An investor wants to connect with you.",
    action_url: "/dashboard/founder?tab=intros",
  });

  // Send email to founder
  const { data: founderProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", founder_id)
    .single<{ email: string; full_name: string }>();

  const { data: investorData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single<{ full_name: string }>();

  const { data: investorExtra } = await supabase
    .from("investor_profiles")
    .select("firm_name")
    .eq("user_id", user.id)
    .single<{ firm_name: string }>();

  if (founderProfile?.email) {
    await sendIntroRequestEmail({
      founderEmail: founderProfile.email,
      founderName:  founderProfile.full_name ?? "Founder",
      investorName: investorData?.full_name ?? "An investor",
      investorFirm: investorExtra?.firm_name ?? "",
      message:      message ?? "",
      introId:      intro.id,
    }).catch(console.error);
  }

  return NextResponse.json({ intro });
}

// PATCH /api/intros — accept or decline
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { intro_id, action, note } = body; // action: 'accept' | 'decline'

  if (!intro_id || !action) {
    return NextResponse.json({ error: "intro_id and action required" }, { status: 400 });
  }

  // Verify this founder owns the intro
  const { data: intro } = await supabase
    .from("intro_requests")
    .select("*, investor:investor_id(email, full_name), founder:founder_id(email, full_name, founder_profile:founder_profiles(startup_name))")
    .eq("id", intro_id)
    .eq("founder_id", user.id)
    .single<any>();

  if (!intro) {
    return NextResponse.json({ error: "Intro not found" }, { status: 404 });
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  const { error } = await supabase
    .from("intro_requests")
    .update({ status: newStatus, founder_note: note ?? null } as Record<string, any>)
    .eq("id", intro_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify investor
  await supabase.from("notifications").insert({
    user_id:    intro.investor_id,
    type:       `intro_${newStatus}`,
    title:      `Introduction ${newStatus}`,
    body:       `Your intro request was ${newStatus}`,
    action_url: "/dashboard/investor?tab=intros",
  });

  // Email investor if accepted
  if (action === "accept") {
    const founderData = intro.founder as any;
    const investorData = intro.investor as any;
    if (investorData?.email) {
      await sendIntroAcceptedEmail({
        investorEmail: investorData.email,
        investorName:  investorData.full_name ?? "Investor",
        founderName:   founderData?.full_name ?? "Founder",
        startupName:   founderData?.founder_profile?.startup_name ?? "their startup",
        founderEmail:  founderData?.email ?? "",
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
