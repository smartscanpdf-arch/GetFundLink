import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./client";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect(`/dashboard/${profile?.role ?? "founder"}`);

  const [usersRes, kycRes, introsRes, ticketsRes, eventsRes] = await Promise.all([
    supabase.from("profiles").select("id,role,created_at,kyc_status,plan", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("kyc_status", "pending"),
    supabase.from("intro_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  const users    = usersRes.data ?? [];
  const byRole   = { founder: 0, investor: 0, partner: 0, admin: 0 };
  users.forEach(u => { byRole[(u.role as keyof typeof byRole)]++; });

  return (
    <AdminDashboardClient
      totalUsers   = {usersRes.count ?? 0}
      byRole       = {byRole}
      pendingKyc   = {(kycRes.count as number) ?? 0}
      pendingIntros= {(introsRes.count as number) ?? 0}
      openTickets  = {(ticketsRes.count as number) ?? 0}
      liveEvents   = {(eventsRes.count as number) ?? 0}
      recentUsers  = {users.slice(0, 8)}
    />
  );
}
