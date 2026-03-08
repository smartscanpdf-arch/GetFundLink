import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerEventsClient } from "./client";

export default async function PartnerEventsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: events } = await supabase
    .from("events")
    .select("*, registrations:event_registrations(id,user_id,registered_at)")
    .eq("organizer_id", user.id)
    .order("event_date", { ascending: false });
  return <PartnerEventsClient events={events ?? []} organizerId={user.id}/>;
}
