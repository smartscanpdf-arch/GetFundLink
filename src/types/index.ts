// ─── Hand-written types matching our schema ──────────────────────────────────
// Run `npm run db:generate` to regenerate from Supabase after schema changes

export type UserRole       = "founder" | "investor" | "partner" | "admin";
export type KycStatus      = "none" | "pending" | "approved" | "rejected";
export type IntroStatus    = "pending" | "accepted" | "declined" | "completed";
export type EventStatus    = "draft" | "published" | "cancelled" | "completed";
export type TicketStatus   = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type TicketCategory = "kyc" | "billing" | "account" | "intro" | "docs" | "other";
export type PlanType       = "free" | "starter" | "pro" | "enterprise";
export type AppStatus      = "pending" | "approved" | "rejected";
export type DocAccessLevel = "private" | "on_request" | "public";

export interface Profile {
  id:              string;
  role:            UserRole;
  email:           string;
  full_name:       string | null;
  avatar_url:      string | null;
  phone:           string | null;
  bio:             string | null;
  city:            string | null;
  linkedin_url:    string | null;
  website_url:     string | null;
  is_verified:     boolean;
  kyc_status:      KycStatus;
  kyc_reviewed_at: string | null;
  plan:            PlanType;
  plan_expires_at: string | null;
  onboarding_done: boolean;
  created_at:      string;
  updated_at:      string;
}

export interface FounderProfile {
  id:            string;
  user_id:       string;
  startup_name:  string;
  tagline:       string | null;
  sector:        string | null;
  stage:         string | null;
  ask_amount:    number | null;
  use_of_funds:  string | null;
  mrr:           number | null;
  arr:           number | null;
  growth_rate:   number | null;
  team_size:     number | null;
  founded_year:  number | null;
  website:       string | null;
  deck_url:      string | null;
  deck_name:     string | null;
  pitch_video_url: string | null;
  is_public:     boolean;
  tags:          string[] | null;
  created_at:    string;
  updated_at:    string;
  // joined
  profile?:      Profile;
}

export interface InvestorProfile {
  id:               string;
  user_id:          string;
  firm_name:        string | null;
  title:            string | null;
  investment_thesis: string | null;
  sectors:          string[] | null;
  stages:           string[] | null;
  ticket_min:       number | null;
  ticket_max:       number | null;
  portfolio_count:  number;
  total_deployed:   number | null;
  is_public:        boolean;
  open_to_intros:   boolean;
  created_at:       string;
  updated_at:       string;
  profile?:         Profile;
}

export interface PartnerProfile {
  id:          string;
  user_id:     string;
  org_name:    string;
  org_type:    string | null;
  description: string | null;
  focus_areas: string[] | null;
  website:     string | null;
  logo_url:    string | null;
  app_status:  AppStatus;
  approved_at: string | null;
  created_at:  string;
  updated_at:  string;
  profile?:    Profile;
}

export interface IntroRequest {
  id:             string;
  investor_id:    string;
  founder_id:     string;
  message:        string | null;
  status:         IntroStatus;
  facilitator_id: string | null;
  founder_note:   string | null;
  meeting_date:   string | null;
  completed_at:   string | null;
  created_at:     string;
  updated_at:     string;
  investor?:      Profile;
  founder?:       Profile & { founder_profile?: FounderProfile };
}

export interface SavedStartup {
  id:          string;
  investor_id: string;
  founder_id:  string;
  note:        string | null;
  tags:        string[] | null;
  saved_at:    string;
  founder?:    Profile & { founder_profile?: FounderProfile };
}

export interface MessageThread {
  id:              string;
  participant_a:   string;
  participant_b:   string;
  last_message:    string | null;
  last_message_at: string | null;
  created_at:      string;
  other_user?:     Profile;
  unread_count?:   number;
}

export interface Message {
  id:        string;
  thread_id: string;
  sender_id: string;
  body:      string;
  is_read:   boolean;
  sent_at:   string;
  sender?:   Profile;
}

export interface Event {
  id:           string;
  organizer_id: string;
  title:        string;
  description:  string | null;
  event_type:   string | null;
  venue:        string | null;
  city:         string | null;
  is_virtual:   boolean;
  event_date:   string;
  event_end:    string | null;
  capacity:     number | null;
  price:        number;
  cover_url:    string | null;
  status:       EventStatus;
  tags:         string[] | null;
  created_at:   string;
  updated_at:   string;
  organizer?:   Profile;
  registration_count?: number;
  is_registered?: boolean;
}

export interface SupportTicket {
  id:          string;
  user_id:     string;
  category:    TicketCategory;
  priority:    TicketPriority;
  subject:     string;
  status:      TicketStatus;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at:  string;
  updated_at:  string;
  user?:       Profile;
  messages?:   SupportMessage[];
}

export interface SupportMessage {
  id:        string;
  ticket_id: string;
  sender_id: string;
  body:      string;
  is_admin:  boolean;
  sent_at:   string;
  sender?:   Profile;
}

export interface Notification {
  id:         string;
  user_id:    string;
  type:       string;
  title:      string;
  body:       string | null;
  action_url: string | null;
  is_read:    boolean;
  created_at: string;
}

export interface Subscription {
  id:                   string;
  user_id:              string;
  plan:                 PlanType;
  status:               string;
  razorpay_sub_id:      string | null;
  current_period_start: string | null;
  current_period_end:   string | null;
  cancel_at_period_end: boolean;
  cancelled_at:         string | null;
  created_at:           string;
  updated_at:           string;
}

// Placeholder for generated Supabase types
export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views:  Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}

// Plan limits
export const PLAN_LIMITS: Record<PlanType, {
  intros_per_month: number;
  saved_startups: number;
  messages_per_month: number;
  data_room_views: number;
}> = {
  free:       { intros_per_month: 3,   saved_startups: 10,  messages_per_month: 10,  data_room_views: 5  },
  starter:    { intros_per_month: 10,  saved_startups: 25,  messages_per_month: 50,  data_room_views: 10 },
  pro:        { intros_per_month: 25,  saved_startups: 100, messages_per_month: 100, data_room_views: 20 },
  enterprise: { intros_per_month: 999, saved_startups: 999, messages_per_month: 999, data_room_views: 999 },
};
