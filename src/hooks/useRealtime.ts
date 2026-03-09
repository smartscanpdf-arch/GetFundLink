"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Message, MessageThread, Notification } from "@/types";

// ─── Real-time messages hook ──────────────────────────────────────────────────

export function useMessageSubscription(threadId: string, onNewMessage?: (message: Message) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  let subscription: RealtimeChannel | null = null;

  useEffect(() => {
    if (!threadId) return;

    // Initial fetch
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from("messages")
          .select("*, sender:sender_id(id, full_name, avatar_url)")
          .eq("thread_id", threadId)
          .order("sent_at", { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setMessages(data as Message[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    subscription = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          onNewMessage?.(newMessage);
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [threadId, supabase, onNewMessage]);

  return { messages, isLoading, error };
}

// ─── Real-time notifications hook ────────────────────────────────────────────

export function useNotificationSubscription(userId: string, onNewNotification?: (notification: Notification) => void) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  let subscription: RealtimeChannel | null = null;

  const updateUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error && count) {
      setUnreadCount(count);
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) {
          console.error("Error fetching notifications:", fetchError);
          return;
        }

        setNotifications(data as Notification[]);
        await updateUnreadCount();
      } catch (err) {
        console.error("Notification fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    subscription = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          onNewNotification?.(newNotification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await updateUnreadCount();
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, supabase, updateUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [supabase]);

  return { notifications, unreadCount, isLoading, markAsRead };
}

// ─── Real-time thread updates hook ──────────────────────────────────────────

export function useMessageThreadSubscription(userId: string) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  let subscription: RealtimeChannel | null = null;

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("message_threads")
          .select("*")
          .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
          .order("last_message_at", { ascending: false, nullsFirst: false });

        if (!error) {
          setThreads(data as MessageThread[]);
        }
      } catch (err) {
        console.error("Thread fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();

    // Subscribe to thread updates
    subscription = supabase
      .channel(`user-threads:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message_threads",
          filter: `participant_a=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as MessageThread;
          setThreads((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t)).sort((a, b) =>
              new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message_threads",
          filter: `participant_b=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as MessageThread;
          setThreads((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t)).sort((a, b) =>
              new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
            )
          );
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, supabase]);

  return { threads, isLoading };
}

// ─── Real-time intro requests hook ──────────────────────────────────────────

export function useIntroSubscription(userId: string, userRole: "founder" | "investor") {
  const [intros, setIntros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  let subscription: RealtimeChannel | null = null;

  useEffect(() => {
    if (!userId || !userRole) return;

    // Initial fetch
    const fetchIntros = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("intro_requests")
          .select(`*,
            investor:investor_id(id, full_name, avatar_url),
            founder:founder_id(id, full_name, avatar_url, founder_profiles(startup_name))
          `);

        if (userRole === "founder") {
          query = query.eq("founder_id", userId);
        } else {
          query = query.eq("investor_id", userId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (!error) {
          setIntros(data || []);
        }
      } catch (err) {
        console.error("Intro fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntros();

    // Subscribe to intro updates
    const filterCondition = userRole === "founder" 
      ? `founder_id=eq.${userId}`
      : `investor_id=eq.${userId}`;

    subscription = supabase
      .channel(`user-intros:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intro_requests",
          filter: filterCondition,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch full record with relations
            const { data } = await supabase
              .from("intro_requests")
              .select(`*,
                investor:investor_id(id, full_name, avatar_url),
                founder:founder_id(id, full_name, avatar_url, founder_profiles(startup_name))
              `)
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setIntros((prev) => [data, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setIntros((prev) =>
              prev.map((i) => (i.id === payload.new.id ? payload.new : i))
            );
          } else if (payload.eventType === "DELETE") {
            setIntros((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, userRole, supabase]);

  return { intros, isLoading };
}
