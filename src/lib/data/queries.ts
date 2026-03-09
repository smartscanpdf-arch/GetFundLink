import { createClient } from "@/lib/supabase/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Profile, IntroRequest, Message, MessageThread, Notification, Event, FounderProfile, InvestorProfile } from "@/types";

const PAGE_SIZE = 20;

// ─── Profile queries ──────────────────────────────────────────────────────────

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

// ─── Intro request queries ────────────────────────────────────────────────────

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
    const { error } = await supabase
      .from("intro_requests")
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

// ─── Message queries ──────────────────────────────────────────────────────────

export async function getMessageThreads(userId: string, page = 1): Promise<MessageThread[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase
      .from("message_threads")
      .select("*")
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching threads:", error);
      return [];
    }

    return data as MessageThread[];
  } catch (err) {
    console.error("Thread query error:", err);
    return [];
  }
}

export async function getMessages(threadId: string, page = 1): Promise<Message[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:sender_id(id, full_name, avatar_url)")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data as Message[];
  } catch (err) {
    console.error("Message query error:", err);
    return [];
  }
}

export async function createMessage(threadId: string, senderId: string, body: string): Promise<Message | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("messages")
      .insert([{ thread_id: threadId, sender_id: senderId, body }])
      .select("*, sender:sender_id(id, full_name, avatar_url)")
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return null;
    }

    return data as Message;
  } catch (err) {
    console.error("Message creation error:", err);
    return null;
  }
}

export async function markMessagesAsRead(threadId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("thread_id", threadId)
      .not("sender_id", "eq", userId);

    if (error) {
      console.error("Error marking as read:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Mark read error:", err);
    return false;
  }
}

// ─── Notification queries ─────────────────────────────────────────────────────

export async function getNotifications(userId: string, page = 1): Promise<Notification[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data as Notification[];
  } catch (err) {
    console.error("Notification query error:", err);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = createServerClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error counting notifications:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Notification count error:", err);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Notification update error:", err);
    return false;
  }
}

export async function createNotification(userId: string, type: string, title: string, body?: string, actionUrl?: string): Promise<Notification | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("notifications")
      .insert([{ user_id: userId, type, title, body, action_url: actionUrl }])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return data as Notification;
  } catch (err) {
    console.error("Notification creation error:", err);
    return null;
  }
}

// ─── Event queries ────────────────────────────────────────────────────────────

export async function getPublishedEvents(page = 1): Promise<Event[]> {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, avatar_url)")
      .eq("status", "published")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return data as Event[];
  } catch (err) {
    console.error("Event query error:", err);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, avatar_url, email)")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    return data as Event;
  } catch (err) {
    console.error("Event detail error:", err);
    return null;
  }
}

// ─── Founder profile queries ──────────────────────────────────────────────────

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

// ─── Investor profile queries ─────────────────────────────────────────────────

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
