import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/portfolio
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: investments } = await supabase
    .from("portfolio_investments")
    .select("*, founder:founder_id(id, full_name, avatar_url, founder_profile:founder_profiles(startup_name, sector, stage))")
    .eq("investor_id", user.id)
    .order("invested_at", { ascending: false });

  return NextResponse.json({ investments: investments ?? [] });
}

// POST /api/portfolio — add investment
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { company_name, sector, stage, amount, equity_pct, invested_at, notes, founder_id } = body;

  if (!company_name) return NextResponse.json({ error: "company_name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("portfolio_investments")
    .insert({
      investor_id: user.id,
      company_name, sector, stage, amount, equity_pct,
      invested_at: invested_at || new Date().toISOString(),
      notes, founder_id: founder_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ investment: data });
}

// DELETE /api/portfolio?id=xxx
export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("portfolio_investments")
    .delete()
    .eq("id", id)
    .eq("investor_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
