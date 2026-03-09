import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Profile, FounderProfile, InvestorProfile } from "@/types";

const PAGE_SIZE = 20;

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("Profile query error:", err);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("Profile update error:", err);
    return null;
  }
}

export async function getPublicFounderProfiles(page = 1, filters?: { sector?: string; stage?: string }): Promise<FounderProfile[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("founder_profiles")
      .select("*, profile:user_id(id, full_name, avatar_url, email, city, linkedin_url, website_url)")
      .eq("is_public", true);

    if (filters?.sector) {
      query = query.eq("sector", filters.sector);
    }

    if (filters?.stage) {
      query = query.eq("stage", filters.stage);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching founder profiles:", error);
      return [];
    }

    return data as FounderProfile[];
  } catch (err) {
    console.error("Founder profiles error:", err);
    return [];
  }
}

export async function getPublicInvestorProfiles(page = 1, filters?: { sector?: string; stage?: string }): Promise<InvestorProfile[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("investor_profiles")
      .select("*, profile:user_id(id, full_name, avatar_url, email, city, linkedin_url, website_url)")
      .eq("is_public", true)
      .eq("open_to_intros", true);

    if (filters?.sector) {
      query = query.contains("sectors", [filters.sector]);
    }

    if (filters?.stage) {
      query = query.contains("stages", [filters.stage]);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching investor profiles:", error);
      return [];
    }

    return data as InvestorProfile[];
  } catch (err) {
    console.error("Investor profiles error:", err);
    return [];
  }
}
