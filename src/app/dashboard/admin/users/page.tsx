import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "./client";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");

  const { data: users } = await supabase
    .from("profiles")
    .select("*, founder_profile:founder_profiles(startup_name,sector,stage), investor_profile:investor_profiles(firm_name), partner_profile:partner_profiles(org_name,app_status)")
    .order("created_at", { ascending: false });

  return <AdminUsersClient users={users ?? []} />;
}
