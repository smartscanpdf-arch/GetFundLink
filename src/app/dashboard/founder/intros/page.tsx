import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntrosClient } from "./client";

export default async function FounderIntrosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: intros } = await supabase
    .from("intro_requests")
    .select("*, investor:investor_id(id,full_name,avatar_url,email,investor_profile:investor_profiles(firm_name,title,sectors,ticket_min,ticket_max))")
    .eq("founder_id", user.id)
    .order("created_at", { ascending: false });

  return <IntrosClient intros={intros ?? []} />;
}
