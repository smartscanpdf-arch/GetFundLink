import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSupportClient } from "./client";

export default async function AdminSupportPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await (supabase.from("profiles") as any).select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");

  const { data: tickets } = await (supabase.from("support_tickets") as any)
    .select("*, user:user_id(id,full_name,email,role), messages:support_messages(id,body,is_admin,sent_at,sender:sender_id(full_name))")
    .order("created_at", { ascending: false });

  return <AdminSupportClient tickets={tickets ?? []} adminId={user.id}/>;
}
