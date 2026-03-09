import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/search?q=keyword&type=founders|investors|events
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q    = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "all";

  if (q.length < 2) return NextResponse.json({ founders: [], investors: [], events: [] });

  const results: { founders: any[]; investors: any[]; events: any[] } = {
    founders:  [],
    investors: [],
    events:    [],
  };

  if (type === "all" || type === "founders") {
    const { data } = await (supabase.from("founder_profiles") as any)
      .select("*, profile:user_id(id, full_name, avatar_url, city, is_verified)")
      .or(`startup_name.ilike.%${q}%,tagline.ilike.%${q}%,sector.ilike.%${q}%`)
      .eq("is_public", true)
      .limit(8);
    results.founders = data ?? [];
  }

  if (type === "all" || type === "investors") {
    const { data } = await (supabase.from("investor_profiles") as any)
      .select("*, profile:user_id(id, full_name, avatar_url, city, is_verified)")
      .or(`firm_name.ilike.%${q}%,investment_thesis.ilike.%${q}%`)
      .eq("is_public", true)
      .limit(8);
    results.investors = data ?? [];
  }

  if (type === "all" || type === "events") {
    const { data } = await (supabase.from("events") as any)
      .select("*, organizer:organizer_id(full_name, avatar_url)")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%`)
      .eq("status", "published")
      .gte("event_date", new Date().toISOString())
      .limit(5);
    results.events = data ?? [];
  }

  return NextResponse.json(results);
}
