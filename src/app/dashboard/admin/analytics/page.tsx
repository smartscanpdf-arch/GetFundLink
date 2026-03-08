import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminAnalyticsClient } from "./client";

export default async function AdminAnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");

  // Fetch aggregated stats
  const [usersRes, introsRes, eventsRes, ticketsRes] = await Promise.all([
    supabase.from("profiles").select("id,role,plan,created_at"),
    supabase.from("intro_requests").select("id,status,created_at"),
    supabase.from("events").select("id,status,event_date,event_type"),
    supabase.from("support_tickets").select("id,status,priority,created_at"),
  ]);

  return (
    <AdminAnalyticsClient
      users   = {usersRes.data ?? []}
      intros  = {introsRes.data ?? []}
      events  = {eventsRes.data ?? []}
      tickets = {ticketsRes.data ?? []}
    />
  );
}
