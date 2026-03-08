import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerDashboardClient } from "./client";

export default async function PartnerDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "partner") redirect(`/dashboard/${profile?.role ?? "founder"}`);
  const { data: partnerProfile } = await supabase.from("partner_profiles").select("*").eq("user_id", user.id).single();
  const { data: events } = await supabase.from("events").select("*, registrations:event_registrations(id)").eq("organizer_id", user.id).order("event_date", { ascending: false }).limit(5);
  const { data: notifs } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4);
  return <PartnerDashboardClient profile={profile} partnerProfile={partnerProfile} events={events ?? []} notifs={notifs ?? []} />;
}
