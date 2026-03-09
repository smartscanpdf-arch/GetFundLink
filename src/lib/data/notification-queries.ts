import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/types";

const PAGE_SIZE = 20;

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
