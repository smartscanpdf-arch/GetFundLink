import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/subscription — get current subscription + invoices
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: subscription }, { data: invoices }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase.from("invoices").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(12),
  ]);

  return NextResponse.json({ subscription, invoices: invoices ?? [] });
}

// POST /api/subscription — create/upgrade subscription (Razorpay integration point)
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json();
  if (!plan) return NextResponse.json({ error: "plan required" }, { status: 400 });

  // TODO: When Razorpay is set up:
  // 1. Create Razorpay order or subscription
  // 2. Return order_id for frontend to open Razorpay checkout
  // 3. Handle webhook confirmation in /api/webhooks/razorpay

  // For now: create free subscription record (Razorpay placeholder)
  const PLAN_PRICES: Record<string, number> = {
    starter:    99900,   // ₹999 in paise
    pro:        249900,  // ₹2,499 in paise
    enterprise: 0,
  };

  const amount = PLAN_PRICES[plan] ?? 0;

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id:               user.id,
      plan,
      status:                "active",
      current_period_start:  new Date().toISOString(),
      current_period_end:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update profile plan
  await supabase.from("profiles").update({ plan }).eq("id", user.id);

  return NextResponse.json({
    subscription: data,
    // razorpay_order_id: order.id,  // Add when Razorpay is integrated
    message: "Subscription updated. Razorpay integration pending.",
  });
}

// DELETE /api/subscription — cancel subscription
export async function DELETE() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      cancelled_at:         new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: "Subscription will cancel at period end" });
}
