import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/notifications
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await (supabase.from("notifications") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ notifications: data ?? [] });
}

// PATCH /api/notifications — mark read
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, all } = await request.json();

  if (all) {
    await (supabase.from("notifications") as any).update({ is_read: true }).eq("user_id", user.id);
  } else if (id) {
    await (supabase.from("notifications") as any).update({ is_read: true }).eq("id", id).eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
