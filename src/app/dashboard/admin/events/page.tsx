import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminEventsClient } from "./client";

export default async function AdminEventsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");
  const { data: events } = await supabase
    .from("events")
    .select("*, organizer:organizer_id(full_name,email,partner_profile:partner_profiles(org_name)), registrations:event_registrations(id)")
    .order("event_date", { ascending: false });
  return <AdminEventsClient events={events ?? []}/>;
}
