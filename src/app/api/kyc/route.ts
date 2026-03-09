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
  const { doc_id, status, note } = await request.json();

  if (!doc_id || !status) {
    return NextResponse.json({ error: "Missing doc_id or status" }, { status: 400 });
  }

  // Update document
  await admin.from("kyc_documents").update({
    status, reviewer_id: user.id, review_note: note ?? null, reviewed_at: new Date().toISOString(),
  } as Record<string, any>).eq("id", doc_id);

  // Get user info
  const { data: doc } = await admin
    .from("kyc_documents")
    .select("user_id, user:user_id(email, full_name)")
    .eq("id", doc_id)
    .single<{ user_id: string; user: { email: string; full_name: string } }>();

  if (doc) {
    // Update profile kyc_status
    await admin.from("profiles").update({
      kyc_status:      status,
      kyc_reviewed_at: new Date().toISOString(),
      is_verified:     status === "approved",
    } as Record<string, any>).eq("id", doc.user_id);

    // Notify user
    await admin.from("notifications").insert({
      user_id:    doc.user_id,
      type:       `kyc_${status}`,
      title:      `KYC verification ${status}`,
      body:       note ?? (status === "approved" ? "Your identity has been verified." : "Please re-submit your documents."),
      action_url: status === "approved" ? "/dashboard/founder" : "/dashboard/founder/kyc",
    });

    // Send email
    const u = doc.user as any;
    if (u?.email) {
      await sendKycStatusEmail({
        to: u.email, name: u.full_name ?? "User",
        status: status as "approved" | "rejected", note,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true });
}
