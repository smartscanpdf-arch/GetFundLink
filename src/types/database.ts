export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          role: "founder" | "investor" | "partner" | "admin";
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          linkedin_url: string | null;
          kyc_status: "pending" | "approved" | "rejected";
          kyc_reviewed_at: string | null;
          is_verified: boolean;
          plan: "free" | "pro" | "enterprise" | null;
          onboarding_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name?: string | null;
          email: string;
          role?: "founder" | "investor" | "partner" | "admin";
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          linkedin_url?: string | null;
          kyc_status?: "pending" | "approved" | "rejected";
          kyc_reviewed_at?: string | null;
          is_verified?: boolean;
          plan?: "free" | "pro" | "enterprise" | null;
          onboarding_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
          role?: "founder" | "investor" | "partner" | "admin";
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          linkedin_url?: string | null;
          kyc_status?: "pending" | "approved" | "rejected";
          kyc_reviewed_at?: string | null;
          is_verified?: boolean;
          plan?: "free" | "pro" | "enterprise" | null;
          onboarding_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      founder_profiles: {
        Row: {
          id: string;
          user_id: string;
          startup_name: string;
          tagline: string | null;
          sector: string | null;
          stage: string | null;
          ask_amount: number | null;
          use_of_funds: string | null;
          mrr: number | null;
          team_size: number | null;
          founded_year: number | null;
          website: string | null;
          deck_url: string | null;
          deck_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          startup_name: string;
          tagline?: string | null;
          sector?: string | null;
          stage?: string | null;
          ask_amount?: number | null;
          use_of_funds?: string | null;
          mrr?: number | null;
          team_size?: number | null;
          founded_year?: number | null;
          website?: string | null;
          deck_url?: string | null;
          deck_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          startup_name?: string;
          tagline?: string | null;
          sector?: string | null;
          stage?: string | null;
          ask_amount?: number | null;
          use_of_funds?: string | null;
          mrr?: number | null;
          team_size?: number | null;
          founded_year?: number | null;
          website?: string | null;
          deck_url?: string | null;
          deck_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      investor_profiles: {
        Row: {
          id: string;
          user_id: string;
          firm_name: string | null;
          title: string | null;
          investment_thesis: string | null;
          ticket_min: number | null;
          ticket_max: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          firm_name?: string | null;
          title?: string | null;
          investment_thesis?: string | null;
          ticket_min?: number | null;
          ticket_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          firm_name?: string | null;
          title?: string | null;
          investment_thesis?: string | null;
          ticket_min?: number | null;
          ticket_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      partner_profiles: {
        Row: {
          id: string;
          user_id: string;
          org_name: string | null;
          org_type: string | null;
          description: string | null;
          website: string | null;
          focus_areas: string[] | null;
          app_status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_name?: string | null;
          org_type?: string | null;
          description?: string | null;
          website?: string | null;
          focus_areas?: string[] | null;
          app_status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_name?: string | null;
          org_type?: string | null;
          description?: string | null;
          website?: string | null;
          focus_areas?: string[] | null;
          app_status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
      };
      intro_requests: {
        Row: {
          id: string;
          investor_id: string;
          founder_id: string;
          message: string | null;
          status: "pending" | "accepted" | "declined" | "completed";
          founder_note: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          investor_id: string;
          founder_id: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "completed";
          founder_note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          investor_id?: string;
          founder_id?: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "completed";
          founder_note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      saved_startups: {
        Row: {
          id: string;
          investor_id: string;
          founder_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          investor_id: string;
          founder_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          investor_id?: string;
          founder_id?: string;
          created_at?: string;
        };
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          document_url: string;
          document_type: string;
          status: "pending" | "approved" | "rejected";
          reviewer_id: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_url: string;
          document_type: string;
          status?: "pending" | "approved" | "rejected";
          reviewer_id?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_url?: string;
          document_type?: string;
          status?: "pending" | "approved" | "rejected";
          reviewer_id?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          uploaded_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          body?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      message_threads: {
        Row: {
          id: string;
          participant_a: string;
          participant_b: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_a: string;
          participant_b: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_a?: string;
          participant_b?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          action_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          priority: "low" | "medium" | "high";
          subject: string;
          status: "open" | "in_progress" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          priority?: "low" | "medium" | "high";
          subject: string;
          status?: "open" | "in_progress" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          priority?: "low" | "medium" | "high";
          subject?: string;
          status?: "open" | "in_progress" | "closed";
          created_at?: string;
          updated_at?: string;
        };
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          body: string;
          is_admin: boolean;
          sent_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          body: string;
          is_admin?: boolean;
          sent_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          body?: string;
          is_admin?: boolean;
          sent_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      portfolio_investments: {
        Row: {
          id: string;
          investor_id: string;
          company_name: string;
          sector: string | null;
          stage: string | null;
          amount: number | null;
          equity_pct: number | null;
          notes: string | null;
          invested_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          investor_id: string;
          company_name: string;
          sector?: string | null;
          stage?: string | null;
          amount?: number | null;
          equity_pct?: number | null;
          notes?: string | null;
          invested_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          investor_id?: string;
          company_name?: string;
          sector?: string | null;
          stage?: string | null;
          amount?: number | null;
          equity_pct?: number | null;
          notes?: string | null;
          invested_at?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          status: "draft" | "published" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          status?: "draft" | "published" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          status?: "draft" | "published" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "enterprise";
          status: "active" | "cancelled" | "past_due";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "cancelled" | "past_due";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "cancelled" | "past_due";
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_email: string;
          code: string;
          status: "pending" | "accepted" | "expired";
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_email: string;
          code: string;
          status?: "pending" | "accepted" | "expired";
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_email?: string;
          code?: string;
          status?: "pending" | "accepted" | "expired";
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
