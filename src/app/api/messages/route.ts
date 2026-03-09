import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/messages — list threads for current user
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: threads } = await (supabase.from("message_threads") as any)
    .select("*, participant_a_profile:participant_a(id,full_name,avatar_url,role), participant_b_profile:participant_b(id,full_name,avatar_url,role)")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  // Attach unread counts and other_user
  const enriched = (threads ?? []).map((t: any) => {
    const other = t.participant_a === user.id ? t.participant_b_profile : t.participant_a_profile;
    return { ...t, other_user: other };
  });

  return NextResponse.json({ threads: enriched });
}

// POST /api/messages — send message (creates thread if needed)
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to_user_id, body, thread_id } = await request.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message body required" }, { status: 400 });

  let tid = thread_id;

  // Create thread if it doesn't exist
  if (!tid && to_user_id) {
    const a = user.id < to_user_id ? user.id : to_user_id;
    const b = user.id < to_user_id ? to_user_id : user.id;

    const { data: existing } = await supabase
      .from("message_threads")
      .select("id")
      .eq("participant_a", a)
      .eq("participant_b", b)
      .single<{ id: string }>();

    if (existing) {
      tid = existing.id;
    } else {
      const { data: newThread } = await (supabase.from("message_threads") as any)
        .insert({ participant_a: a, participant_b: b })
        .select("id")
        .single();
      tid = newThread?.id;
    }
  }

  if (!tid) return NextResponse.json({ error: "Could not resolve thread" }, { status: 400 });

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({ thread_id: tid, sender_id: user.id, body: body.trim() })
    .select()
    .single<any>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify recipient
  if (to_user_id) {
    const { data: sender } = await supabase.from("profiles").select("full_name").eq("id", user.id).single<{ full_name: string }>();
    await supabase.from("notifications").insert({
      user_id:    to_user_id,
      type:       "message",
      title:      `New message from ${sender?.full_name ?? "someone"}`,
      body:       body.trim().slice(0, 80),
      action_url: `/dashboard/messages`,
    });
  }

  return NextResponse.json({ message: msg, thread_id: tid });
}
