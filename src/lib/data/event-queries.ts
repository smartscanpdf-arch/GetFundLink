import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Event } from "@/types";

const PAGE_SIZE = 20;

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
