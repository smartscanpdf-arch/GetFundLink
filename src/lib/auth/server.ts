import { createClient as createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getServerSession(): Promise<User | null> {
  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Server session error:", error);
      return null;
    }

    return user || null;
  } catch (err) {
    console.error("Server auth error:", err);
    return null;
  }
}
