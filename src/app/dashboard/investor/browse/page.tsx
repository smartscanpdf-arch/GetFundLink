import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrowseClient } from "./client";

export default async function BrowsePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: startups }, { data: savedRaw }, { data: introsRaw }] = await Promise.all([
    supabase.from("founder_profiles").select("*, profile:user_id(id,full_name,avatar_url,is_verified,kyc_status,city)").eq("is_public", true).order("created_at", { ascending: false }),
    supabase.from("saved_startups").select("founder_id").eq("investor_id", user.id),
    supabase.from("intro_requests").select("founder_id,status").eq("investor_id", user.id),
  ]);

  const savedIds  = new Set((savedRaw ?? []).map(s => s.founder_id));
  const introMap  = Object.fromEntries((introsRaw ?? []).map(i => [i.founder_id, i.status]));

  return <BrowseClient startups={startups ?? []} savedIds={savedIds} introMap={introMap} investorId={user.id}/>;
}
