import { createClient as createServerClient } from "@/lib/supabase/server";
import type { IntroRequest } from "@/types";

const PAGE_SIZE = 20;

export async function getIntroRequests(userId: string, role: "founder" | "investor", page = 1): Promise<IntroRequest[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("intro_requests")
      .select(
        `*,
        investor:investor_id(id, full_name, avatar_url, email),
        founder:founder_id(id, full_name, avatar_url, email, founder_profiles(startup_name))`
      );

    if (role === "founder") {
      query = query.eq("founder_id", userId);
    } else {
      query = query.eq("investor_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching intros:", error);
      return [];
    }

    return data as IntroRequest[];
  } catch (err) {
    console.error("Intro queries error:", err);
    return [];
  }
}

export async function updateIntroStatus(introId: string, status: "accepted" | "declined" | "completed"): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { error } = await (supabase.from("intro_requests") as any)
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", introId);

    if (error) {
      console.error("Error updating intro:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Intro update error:", err);
    return false;
  }
}
