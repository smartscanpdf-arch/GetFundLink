-- ============================================================
-- FundLink — Complete Database Schema
-- Run this in Supabase SQL editor or via supabase db push
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fuzzy search

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type user_role        as enum ('founder', 'investor', 'partner', 'admin');
create type kyc_status       as enum ('none', 'pending', 'approved', 'rejected');
create type intro_status     as enum ('pending', 'accepted', 'declined', 'completed');
create type event_status     as enum ('draft', 'published', 'cancelled', 'completed');
create type ticket_status    as enum ('open', 'pending', 'resolved');
create type ticket_priority  as enum ('low', 'medium', 'high');
create type ticket_category  as enum ('kyc', 'billing', 'account', 'intro', 'docs', 'other');
create type plan_type        as enum ('free', 'starter', 'pro', 'enterprise');
create type app_status       as enum ('pending', 'approved', 'rejected');
create type doc_access_level as enum ('private', 'on_request', 'public');

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- One row per user, extends auth.users

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role        not null default 'founder',
  email           text             not null,
  full_name       text,
  avatar_url      text,
  phone           text,
  bio             text,
  city            text,
  linkedin_url    text,
  website_url     text,
  is_verified     boolean          not null default false,
  kyc_status      kyc_status       not null default 'none',
  kyc_reviewed_at timestamptz,
  plan            plan_type        not null default 'free',
  plan_expires_at timestamptz,
  onboarding_done boolean          not null default false,
  created_at      timestamptz      not null default now(),
  updated_at      timestamptz      not null default now()
);

-- ─── FOUNDER PROFILES ────────────────────────────────────────────────────────

create table founder_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade unique,
  startup_name    text not null,
  tagline         text,
  sector          text,
  stage           text,   -- 'pre-seed' | 'seed' | 'pre-series-a' | 'series-a'
  ask_amount      bigint, -- in paise (₹1 = 100 paise)
  use_of_funds    text,
  mrr             bigint, -- monthly recurring revenue in paise
  arr             bigint,
  growth_rate     numeric(5,2), -- percent MoM
  team_size       int,
  founded_year    int,
  website         text,
  deck_url        text,   -- Supabase Storage path
  deck_name       text,
  pitch_video_url text,
  is_public       boolean not null default true,
  tags            text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── INVESTOR PROFILES ───────────────────────────────────────────────────────

create table investor_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade unique,
  firm_name        text,
  title            text,
  investment_thesis text,
  sectors          text[],
  stages           text[],
  ticket_min        bigint,  -- in paise
  ticket_max        bigint,
  portfolio_count   int      default 0,
  total_deployed    bigint,  -- in paise
  is_public         boolean  not null default true,
  open_to_intros    boolean  not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── PARTNER PROFILES ────────────────────────────────────────────────────────

create table partner_profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade unique,
  org_name     text not null,
  org_type     text,  -- 'accelerator' | 'incubator' | 'vc_fund' | 'corporate' | 'ngo' | 'other'
  description  text,
  focus_areas  text[],
  website      text,
  logo_url     text,
  app_status   app_status not null default 'pending',
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── KYC DOCUMENTS ───────────────────────────────────────────────────────────

create table kyc_documents (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  doc_type     text not null,  -- 'aadhaar' | 'pan' | 'passport' | 'company_reg'
  file_path    text not null,  -- Supabase Storage path
  file_name    text not null,
  status       kyc_status not null default 'pending',
  reviewer_id  uuid references profiles(id),
  review_note  text,
  reviewed_at  timestamptz,
  uploaded_at  timestamptz not null default now()
);

-- ─── INTRO REQUESTS ──────────────────────────────────────────────────────────

create table intro_requests (
  id              uuid primary key default uuid_generate_v4(),
  investor_id     uuid not null references profiles(id) on delete cascade,
  founder_id      uuid not null references profiles(id) on delete cascade,
  message         text,
  status          intro_status not null default 'pending',
  facilitator_id  uuid references profiles(id),  -- partner or admin who facilitates
  founder_note    text,    -- founder's response note
  meeting_date    timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(investor_id, founder_id)
);

-- ─── SAVED STARTUPS ──────────────────────────────────────────────────────────

create table saved_startups (
  id          uuid primary key default uuid_generate_v4(),
  investor_id uuid not null references profiles(id) on delete cascade,
  founder_id  uuid not null references profiles(id) on delete cascade,
  note        text,
  tags        text[],
  saved_at    timestamptz not null default now(),
  unique(investor_id, founder_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────

create table message_threads (
  id            uuid primary key default uuid_generate_v4(),
  participant_a uuid not null references profiles(id) on delete cascade,
  participant_b uuid not null references profiles(id) on delete cascade,
  last_message  text,
  last_message_at timestamptz,
  created_at    timestamptz not null default now(),
  unique(participant_a, participant_b)
);

create table messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references message_threads(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  is_read    boolean not null default false,
  sent_at    timestamptz not null default now()
);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────

create table events (
  id            uuid primary key default uuid_generate_v4(),
  organizer_id  uuid not null references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  event_type    text,  -- 'demo_day' | 'meetup' | 'summit' | 'workshop' | 'cohort'
  venue         text,
  city          text,
  is_virtual    boolean not null default false,
  event_date    timestamptz not null,
  event_end     timestamptz,
  capacity      int,
  price         bigint default 0,  -- in paise, 0 = free
  cover_url     text,
  status        event_status not null default 'draft',
  tags          text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table event_registrations (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  attended   boolean default false,
  registered_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ─── DATA ROOM DOCUMENTS ─────────────────────────────────────────────────────

create table documents (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  title        text not null,
  description  text,
  file_path    text not null,
  file_name    text not null,
  file_size    bigint,
  file_type    text,
  access_level doc_access_level not null default 'private',
  folder       text default 'general',
  view_count   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table document_access (
  id          uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  granted_by  uuid references profiles(id),
  expires_at  timestamptz,
  granted_at  timestamptz not null default now(),
  unique(document_id, user_id)
);

create table document_views (
  id          uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  viewer_id   uuid not null references profiles(id) on delete cascade,
  viewed_at   timestamptz not null default now()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,  -- 'intro_request' | 'intro_accepted' | 'kyc_approved' | 'message' | 'event' etc
  title      text not null,
  body       text,
  action_url text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────

create table support_tickets (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  category     ticket_category  not null default 'other',
  priority     ticket_priority  not null default 'medium',
  subject      text not null,
  status       ticket_status    not null default 'open',
  assigned_to  uuid references profiles(id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table support_messages (
  id        uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body      text not null,
  is_admin  boolean not null default false,
  sent_at   timestamptz not null default now()
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

create table subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade unique,
  plan                plan_type not null default 'free',
  status              text not null default 'active',  -- 'active' | 'cancelled' | 'past_due'
  razorpay_sub_id     text unique,
  razorpay_plan_id    text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table invoices (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  subscription_id     uuid references subscriptions(id),
  amount              bigint not null,  -- in paise
  currency            text not null default 'INR',
  status              text not null default 'paid',
  razorpay_payment_id text,
  plan_name           text,
  period_start        timestamptz,
  period_end          timestamptz,
  created_at          timestamptz not null default now()
);

-- ─── PORTFOLIO ───────────────────────────────────────────────────────────────

create table portfolio_investments (
  id           uuid primary key default uuid_generate_v4(),
  investor_id  uuid not null references profiles(id) on delete cascade,
  founder_id   uuid references profiles(id),  -- null if not on platform
  company_name text not null,
  sector       text,
  stage        text,
  invested_at  date,
  amount       bigint,  -- in paise
  equity_pct   numeric(5,2),
  valuation    bigint,  -- at entry, in paise
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── AFFILIATE / REFERRALS ───────────────────────────────────────────────────

create table referrals (
  id            uuid primary key default uuid_generate_v4(),
  referrer_id   uuid not null references profiles(id) on delete cascade,
  referred_email text not null,
  referred_id   uuid references profiles(id),
  code          text not null unique,
  commission    bigint default 0,  -- in paise
  paid_out      boolean not null default false,
  signed_up_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ─── PROFILE VIEWS ───────────────────────────────────────────────────────────

create table profile_views (
  id         uuid primary key default uuid_generate_v4(),
  viewer_id  uuid not null references profiles(id) on delete cascade,
  viewed_id  uuid not null references profiles(id) on delete cascade,
  viewed_at  timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Profiles
create index idx_profiles_role      on profiles(role);
create index idx_profiles_kyc       on profiles(kyc_status);
create index idx_profiles_plan      on profiles(plan);

-- Founder profiles
create index idx_founder_sector     on founder_profiles(sector);
create index idx_founder_stage      on founder_profiles(stage);
create index idx_founder_public     on founder_profiles(is_public) where is_public = true;

-- Full-text search on startups
create index idx_founder_search on founder_profiles
  using gin(to_tsvector('english', coalesce(startup_name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(sector,'')));

-- Intro requests
create index idx_intros_investor    on intro_requests(investor_id);
create index idx_intros_founder     on intro_requests(founder_id);
create index idx_intros_status      on intro_requests(status);

-- Messages
create index idx_messages_thread    on messages(thread_id);
create index idx_messages_sender    on messages(sender_id);

-- Notifications
create index idx_notifs_user        on notifications(user_id);
create index idx_notifs_unread      on notifications(user_id, is_read) where is_read = false;

-- Saved startups
create index idx_saved_investor     on saved_startups(investor_id);

-- Events
create index idx_events_organizer   on events(organizer_id);
create index idx_events_status      on events(status);
create index idx_events_date        on events(event_date);

-- Support tickets
create index idx_tickets_user       on support_tickets(user_id);
create index idx_tickets_status     on support_tickets(status);
create index idx_tickets_priority   on support_tickets(priority);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table profiles                enable row level security;
alter table founder_profiles        enable row level security;
alter table investor_profiles       enable row level security;
alter table partner_profiles        enable row level security;
alter table kyc_documents           enable row level security;
alter table intro_requests          enable row level security;
alter table saved_startups          enable row level security;
alter table message_threads         enable row level security;
alter table messages                enable row level security;
alter table events                  enable row level security;
alter table event_registrations     enable row level security;
alter table documents               enable row level security;
alter table document_access         enable row level security;
alter table document_views          enable row level security;
alter table notifications           enable row level security;
alter table support_tickets         enable row level security;
alter table support_messages        enable row level security;
alter table subscriptions           enable row level security;
alter table invoices                enable row level security;
alter table portfolio_investments   enable row level security;
alter table referrals               enable row level security;
alter table profile_views           enable row level security;

-- Helper: is current user an admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ──
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Public profiles visible to all authenticated users"
  on profiles for select using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can do anything with profiles"
  on profiles for all using (is_admin());

-- ── founder_profiles ──
create policy "Public founder profiles viewable by authenticated users"
  on founder_profiles for select
  using (is_public = true and auth.role() = 'authenticated');

create policy "Founders can manage own profile"
  on founder_profiles for all
  using (auth.uid() = user_id);

create policy "Admins can manage all founder profiles"
  on founder_profiles for all using (is_admin());

-- ── investor_profiles ──
create policy "Public investor profiles viewable"
  on investor_profiles for select
  using (is_public = true and auth.role() = 'authenticated');

create policy "Investors can manage own profile"
  on investor_profiles for all
  using (auth.uid() = user_id);

create policy "Admins can manage all investor profiles"
  on investor_profiles for all using (is_admin());

-- ── kyc_documents ──
create policy "Users can view and upload own KYC docs"
  on kyc_documents for all using (auth.uid() = user_id);

create policy "Admins can manage all KYC documents"
  on kyc_documents for all using (is_admin());

-- ── intro_requests ──
create policy "Investors can create and view own intros"
  on intro_requests for all using (auth.uid() = investor_id);

create policy "Founders can view intros addressed to them"
  on intro_requests for select using (auth.uid() = founder_id);

create policy "Founders can update intros (accept/decline)"
  on intro_requests for update using (auth.uid() = founder_id);

create policy "Admins can manage all intros"
  on intro_requests for all using (is_admin());

-- ── saved_startups ──
create policy "Investors manage own saved list"
  on saved_startups for all using (auth.uid() = investor_id);

-- ── message_threads ──
create policy "Participants can view their threads"
  on message_threads for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Authenticated users can create threads"
  on message_threads for insert with check (auth.role() = 'authenticated');

-- ── messages ──
create policy "Thread participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from message_threads t
      where t.id = thread_id
      and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- ── events ──
create policy "Published events visible to all authenticated users"
  on events for select
  using (status = 'published' and auth.role() = 'authenticated');

create policy "Organizers manage own events"
  on events for all using (auth.uid() = organizer_id);

create policy "Admins manage all events"
  on events for all using (is_admin());

-- ── notifications ──
create policy "Users see own notifications"
  on notifications for all using (auth.uid() = user_id);

-- ── support_tickets ──
create policy "Users can manage own tickets"
  on support_tickets for all using (auth.uid() = user_id);

create policy "Admins can manage all tickets"
  on support_tickets for all using (is_admin());

-- ── support_messages ──
create policy "Ticket participants can view messages"
  on support_messages for select
  using (
    auth.uid() = sender_id
    or exists (select 1 from support_tickets where id = ticket_id and user_id = auth.uid())
    or is_admin()
  );

create policy "Users and admins can send support messages"
  on support_messages for insert with check (auth.uid() = sender_id);

-- ── subscriptions ──
create policy "Users see own subscription"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Admins manage all subscriptions"
  on subscriptions for all using (is_admin());

-- ── invoices ──
create policy "Users see own invoices"
  on invoices for select using (auth.uid() = user_id);

create policy "Admins see all invoices"
  on invoices for all using (is_admin());

-- ── documents ──
create policy "Owners manage own documents"
  on documents for all using (auth.uid() = owner_id);

create policy "Public documents visible to all authenticated users"
  on documents for select
  using (access_level = 'public' and auth.role() = 'authenticated');

create policy "Users with access can view on_request docs"
  on documents for select
  using (
    access_level = 'on_request'
    and exists (
      select 1 from document_access
      where document_id = id and user_id = auth.uid()
      and (expires_at is null or expires_at > now())
    )
  );

-- ── portfolio ──
create policy "Investors manage own portfolio"
  on portfolio_investments for all using (auth.uid() = investor_id);

-- ── referrals ──
create policy "Referrers manage own referrals"
  on referrals for all using (auth.uid() = referrer_id);

-- ─── FUNCTIONS & TRIGGERS ────────────────────────────────────────────────────

-- Auto-update updated_at timestamps
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger trg_founder_updated_at
  before update on founder_profiles
  for each row execute function handle_updated_at();

create trigger trg_investor_updated_at
  before update on investor_profiles
  for each row execute function handle_updated_at();

create trigger trg_partner_updated_at
  before update on partner_profiles
  for each row execute function handle_updated_at();

create trigger trg_intro_updated_at
  before update on intro_requests
  for each row execute function handle_updated_at();

create trigger trg_event_updated_at
  before update on events
  for each row execute function handle_updated_at();

create trigger trg_ticket_updated_at
  before update on support_tickets
  for each row execute function handle_updated_at();

create trigger trg_subscription_updated_at
  before update on subscriptions
  for each row execute function handle_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'founder')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update message thread's last_message
create or replace function handle_new_message()
returns trigger language plpgsql as $$
begin
  update message_threads
  set last_message = new.body, last_message_at = new.sent_at
  where id = new.thread_id;
  return new;
end;
$$;

create trigger trg_message_thread_update
  after insert on messages
  for each row execute function handle_new_message();

-- Increment document view count
create or replace function handle_document_view()
returns trigger language plpgsql as $$
begin
  update documents set view_count = view_count + 1 where id = new.document_id;
  return new;
end;
$$;

create trigger trg_document_view_count
  after insert on document_views
  for each row execute function handle_document_view();

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
-- Run these separately in Supabase Storage dashboard OR via supabase CLI

-- insert into storage.buckets (id, name, public) values ('avatars',   'avatars',   true);
-- insert into storage.buckets (id, name, public) values ('kyc-docs',  'kyc-docs',  false);
-- insert into storage.buckets (id, name, public) values ('pitch-decks','pitch-decks',false);
-- insert into storage.buckets (id, name, public) values ('documents',  'documents', false);
-- insert into storage.buckets (id, name, public) values ('event-covers','event-covers',true);

-- ─── SEED DATA (dev only) ────────────────────────────────────────────────────
-- Uncomment to insert test admin user after first signup

-- update profiles set role = 'admin' where email = 'admin@fundlink.in';
