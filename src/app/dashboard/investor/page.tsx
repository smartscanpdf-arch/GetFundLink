import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvestorDashboardClient } from "./client";

export default async function InvestorDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: investorProfile }, { data: savedCount }, { data: introsSent }, { data: recentNotifs }] =
    await Promise.all([
      (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
      (supabase.from("investor_profiles") as any).select("*").eq("user_id", user.id).single(),
      (supabase.from("saved_startups") as any).select("id", { count: "exact", head: true }).eq("investor_id", user.id),
      (supabase.from("intro_requests") as any).select("id,status,created_at,founder:founder_id(full_name,founder_profile:founder_profiles(startup_name,sector,stage))").eq("investor_id", user.id).order("created_at", { ascending: false }).limit(5),
      (supabase.from("notifications") as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    ]);

  if (profile?.role !== "investor") redirect(`/dashboard/${profile?.role ?? "investor"}`);

  return (
    <InvestorDashboardClient
      profile={profile}
      investorProfile={investorProfile}
      savedCount={(savedCount as any)?.count ?? 0}
      introsSent={introsSent ?? []}
      recentNotifs={recentNotifs ?? []}
    />
  );
}
