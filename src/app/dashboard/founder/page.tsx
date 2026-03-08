import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FounderDashboardClient } from "./client";

export default async function FounderDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: founderProfile }, { data: intros }, { data: recentNotifs }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("founder_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("intro_requests")
        .select("*, investor:investor_id(id, full_name, avatar_url, investor_profile:investor_profiles(firm_name, title))")
        .eq("founder_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("notifications")
        .select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (profile?.role !== "founder") redirect(`/dashboard/${profile?.role ?? "founder"}`);

  return (
    <FounderDashboardClient
      profile={profile}
      founderProfile={founderProfile}
      intros={intros ?? []}
      recentNotifs={recentNotifs ?? []}
    />
  );
}
