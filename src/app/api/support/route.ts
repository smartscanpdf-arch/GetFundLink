import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendSupportReplyEmail } from "@/lib/email";
import { NextResponse } from "next/server";

// POST /api/support — create ticket
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { category, priority, subject, message } = body;

  if (!subject || !message || !category) {
    return NextResponse.json({ error: "category, subject, and message are required" }, { status: 400 });
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({ user_id: user.id, category, priority: priority ?? "medium", subject })
    .select()
    .single();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });

  // Create first message
  await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    body:      message,
    is_admin:  false,
  });

  // Notify admins
  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (admins?.length) {
    await admin.from("notifications").insert(
      admins.map(a => ({
        user_id:    a.id,
        type:       "new_support_ticket",
        title:      `New ${priority ?? "medium"} priority ticket`,
        body:       subject,
        action_url: `/dashboard/admin?tab=support&ticket=${ticket.id}`,
      }))
    );
  }

  return NextResponse.json({ ticket });
}

// GET /api/support — get user's tickets
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*, messages:support_messages(*, sender:sender_id(full_name, role))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tickets });
}

// PATCH /api/support — admin reply or status change
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { ticket_id, status, reply } = body;

  if (!ticket_id) {
    return NextResponse.json({ error: "ticket_id required" }, { status: 400 });
  }

  // Update status if provided
  if (status) {
    await supabase
      .from("support_tickets")
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", ticket_id);
  }

  // Add reply if provided
  if (reply) {
    await supabase.from("support_messages").insert({
      ticket_id,
      sender_id: user.id,
      body:      reply,
      is_admin:  true,
    });

    // Get ticket + user info for email
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("subject, user:user_id(email, full_name)")
      .eq("id", ticket_id)
      .single();

    const ticketUser = (ticket?.user as any);
    if (ticketUser?.email) {
      await sendSupportReplyEmail({
        to:        ticketUser.email,
        name:      ticketUser.full_name ?? "User",
        ticketId:  ticket_id.slice(0, 8).toUpperCase(),
        subject:   ticket?.subject ?? "",
        replyBody: reply,
      }).catch(console.error);
    }

    // Notify user
    await supabase.from("notifications").insert({
      user_id:    (await supabase.from("support_tickets").select("user_id").eq("id", ticket_id).single()).data?.user_id,
      type:       "support_reply",
      title:      "Support team replied to your ticket",
      body:       reply.slice(0, 80),
      action_url: `/support?ticket=${ticket_id}`,
    });
  }

  return NextResponse.json({ success: true });
}
