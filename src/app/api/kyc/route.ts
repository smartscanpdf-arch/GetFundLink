import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendKycStatusEmail } from "@/lib/email";
import { NextResponse } from "next/server";

// GET /api/kyc — list pending KYC docs (admin only)
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("kyc_documents")
    .select("*, user:user_id(id, full_name, email, role)")
    .eq("status", "pending")
    .order("uploaded_at", { ascending: true });

  return NextResponse.json({ docs: data ?? [] });
}

// PATCH /api/kyc — approve or reject a KYC doc
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const admin = createAdminClient();
  const body = await request.json();
  const { doc_id, status, note, user_id } = body;

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const reviewNote = note ?? null;
  let userId: string | null = null;

  if (doc_id) {
    // Update document
    await (admin.from("kyc_documents") as any).update({
      status, 
      reviewer_id: user.id, 
      review_note: reviewNote, 
      reviewed_at: new Date().toISOString(),
    }).eq("id", doc_id);

    // Get user info
    const { data: doc } = await (admin.from("kyc_documents") as any)
      .select("user_id, user:user_id(email, full_name)")
      .eq("id", doc_id)
      .single();

    userId = doc?.user_id || null;
  } else if (user_id) {
    // Direct profile update without document
    userId = user_id;
  } else {
    return NextResponse.json({ error: "Missing doc_id or user_id" }, { status: 400 });
  }

  if (userId) {
    // Update profile kyc_status
    await (admin.from("profiles") as any).update({
      kyc_status:      status,
      kyc_reviewed_at: new Date().toISOString(),
      is_verified:     status === "approved",
    }).eq("id", userId);

    // Get user info for notification
    const { data: userProfile } = await (admin.from("profiles") as any)
      .select("email, full_name")
      .eq("id", userId)
      .single();

    // Notify user
    if (userProfile?.email) {
      await (admin.from("notifications") as any).insert({
        user_id:    userId,
        type:       `kyc_${status}`,
        title:      `KYC verification ${status}`,
        body:       reviewNote ?? (status === "approved" ? "Your identity has been verified." : "Please re-submit your documents."),
        action_url: status === "approved" ? "/dashboard/founder" : "/dashboard/founder/kyc",
      });

      // Send email
      await sendKycStatusEmail({
        to: userProfile.email, 
        name: userProfile.full_name ?? "User",
        status: status as "approved" | "rejected", 
        note: reviewNote,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true });
}
