import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioClient } from "./client";

export default async function PortfolioPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data } = await supabase.from("portfolio_investments").select("*, founder:founder_id(full_name,avatar_url,founder_profile:founder_profiles(startup_name,sector,stage))").eq("investor_id", user.id).order("invested_at", { ascending: false });
  return <PortfolioClient investments={data ?? []} investorId={user.id}/>;
}
