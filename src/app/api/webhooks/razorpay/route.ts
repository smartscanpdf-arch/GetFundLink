import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/webhooks/razorpay
// Handles: subscription.activated, payment.captured, subscription.cancelled
export async function POST(request: Request) {
  const body      = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret    = process.env.RAZORPAY_KEY_SECRET;

  // Verify webhook signature
  if (secret && signature) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(body);
  const admin  = createAdminClient();

  const { event: eventType, payload } = event;

  switch (eventType) {
    case "payment.captured": {
      const payment      = payload.payment?.entity;
      const notes        = payment?.notes;
      const userId       = notes?.user_id;
      const plan         = notes?.plan;

      if (!userId || !plan) break;

      // Update subscription
      await (admin.from("subscriptions") as any).upsert({
        user_id:               userId,
        plan,
        status:                "active",
        razorpay_payment_id:   payment.id,
        current_period_start:  new Date().toISOString(),
        current_period_end:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "user_id" });

      // Update profile plan
      await (admin.from("profiles") as any).update({ plan }).eq("id", userId);

      // Record invoice
      await (admin.from("invoices") as any).insert({
        user_id:            userId,
        amount:             payment.amount,
        currency:           payment.currency,
        status:             "paid",
        razorpay_payment_id: payment.id,
        plan_name:          plan,
      });

      // Notify user
      await (admin.from("notifications") as any).insert({
        user_id:    userId,
        type:       "payment_success",
        title:      `${plan} plan activated`,
        body:       `Your FundLink ${plan} subscription is now active.`,
        action_url: "/dashboard/founder/billing",
      });
      break;
    }

    case "subscription.cancelled": {
      const sub    = payload.subscription?.entity;
      const userId = sub?.notes?.user_id;
      if (!userId) break;

      await (admin.from("subscriptions") as any).update({
        status:       "cancelled",
        cancelled_at: new Date().toISOString(),
      }).eq("user_id", userId);

      await (admin.from("profiles") as any).update({ plan: "free" }).eq("id", userId);

      await (admin.from("notifications") as any).insert({
        user_id:    userId,
        type:       "subscription_cancelled",
        title:      "Subscription cancelled",
        body:       "Your FundLink subscription has been cancelled.",
        action_url: "/dashboard/founder/subscription",
      });
      break;
    }

    case "payment.failed": {
      const payment = payload.payment?.entity;
      const userId  = payment?.notes?.user_id;
      if (!userId) break;

      await (admin.from("subscriptions") as any).update({ status: "past_due" }).eq("user_id", userId);

      await (admin.from("notifications") as any).insert({
        user_id:    userId,
        type:       "payment_failed",
        title:      "Payment failed",
        body:       "Your subscription payment failed. Please update your payment method.",
        action_url: "/dashboard/founder/billing",
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
