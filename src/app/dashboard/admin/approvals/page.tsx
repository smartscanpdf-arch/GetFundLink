import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminApprovalsClient } from "./client";

export default async function AdminApprovalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: me } = await (supabase.from("profiles") as any).select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard/founder");
  const { data: docs } = await (supabase.from("kyc_documents") as any)
    .select("*, user:user_id(id,full_name,email,role)")
    .eq("status","pending")
    .order("uploaded_at", { ascending: true });
  return <AdminApprovalsClient docs={docs ?? []}/>;
}
