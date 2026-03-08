import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./client";

export default async function FounderBillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: profile }, { data: sub }, { data: invoices }] = await Promise.all([
    supabase.from("profiles").select("plan,plan_expires_at").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);
  return <BillingClient profile={profile} subscription={sub} invoices={invoices ?? []} />;
}
