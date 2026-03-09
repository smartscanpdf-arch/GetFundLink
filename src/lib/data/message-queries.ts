import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Message, MessageThread } from "@/types";

const PAGE_SIZE = 20;

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
    const { data, error } = await (supabase.from("messages") as any)
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
    const { error } = await (supabase.from("messages") as any)
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
