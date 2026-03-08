// Saved Startups
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedClient } from "./client";

export default async function SavedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("saved_startups")
    .select("*, founder:founder_id(id,full_name,avatar_url,is_verified,city,founder_profile:founder_profiles(startup_name,tagline,sector,stage,ask_amount,mrr))")
    .eq("investor_id", user.id)
    .order("saved_at", { ascending: false });

  return <SavedClient saved={data ?? []} investorId={user.id}/>;
}
