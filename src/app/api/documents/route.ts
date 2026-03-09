import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/documents
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const owner_id = searchParams.get("owner_id") ?? user.id;

  const { data } = await (supabase.from("documents") as any)
    .select("*")
    .eq("owner_id", owner_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ documents: data ?? [] });
}

// POST /api/documents — create doc record
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await (supabase.from("documents") as any)
    .insert({ ...body, owner_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}

// DELETE /api/documents
export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await (supabase.from("documents") as any).delete().eq("id", id).eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
