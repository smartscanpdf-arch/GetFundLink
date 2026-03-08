import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminRevenueClient } from "./client";

export default async function AdminRevenuePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");
  const { data: invoices } = await supabase.from("invoices").select("*,user:user_id(full_name,email,plan)").order("created_at", { ascending: false }).limit(50);
  const { data: subs }     = await supabase.from("subscriptions").select("*,user:user_id(full_name,email)").neq("plan","free");
  return <AdminRevenueClient invoices={invoices??[]} subscriptions={subs??[]}/>;
}
