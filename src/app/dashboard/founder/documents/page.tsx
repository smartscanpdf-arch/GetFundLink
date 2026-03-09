import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "./client";

export default async function FounderDocumentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: docs } = await (supabase.from("documents") as any).select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
  const { data: fp } = await (supabase.from("founder_profiles") as any).select("deck_url,deck_name").eq("user_id", user.id).single();
  return <DocumentsClient documents={docs ?? []} deckUrl={fp?.deck_url ?? null} deckName={fp?.deck_name ?? null}/>;
}
