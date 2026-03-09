import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/events
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine");

  let query = supabase
    .from("events")
    .select("*, organizer:organizer_id(id,full_name,avatar_url,role,partner_profile:partner_profiles(org_name,logo_url))")
    .order("event_date", { ascending: true });

  if (mine) {
    query = query.eq("organizer_id", user.id);
  } else {
    query = query.eq("status", "published").gte("event_date", new Date().toISOString());
  }

  const { data } = await query;
  return NextResponse.json({ events: data ?? [] });
}

// POST /api/events — create event
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await (supabase.from("events") as any).insert({ ...body, organizer_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

// PATCH /api/events — update event
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await request.json();
  const { data, error } = await (supabase.from("events") as any).update(updates).eq("id", id).eq("organizer_id", user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}
