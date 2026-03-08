"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, EmptyState } from "@/components/ui";
import { StatusPill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import type { Profile, InvestorProfile, Notification } from "@/types";

export const INVESTOR_NAV = [
  { href: "/dashboard/investor",              label: "Dashboard",  icon: <span>🏠</span> },
  { href: "/dashboard/investor/browse",       label: "Browse",     icon: <span>🔍</span> },
  { href: "/dashboard/investor/saved",        label: "Saved",      icon: <span>🔖</span> },
  { href: "/dashboard/investor/intros",       label: "Intros",     icon: <span>🤝</span> },
  { href: "/dashboard/investor/messages",     label: "Messages",   icon: <span>💬</span> },
  { href: "/dashboard/investor/portfolio",    label: "Portfolio",  icon: <span>📊</span> },
  { href: "/dashboard/investor/deal-room",    label: "Data Room",  icon: <span>📂</span> },
  { href: "/dashboard/investor/profile",      label: "Profile",    icon: <span>👤</span> },
  { href: "/dashboard/investor/billing",      label: "Billing",    icon: <span>💳</span> },
  { href: "/dashboard/investor/notifications",label: "Alerts",     icon: <span>🔔</span> },
  { href: "/dashboard/investor/settings",     label: "Settings",   icon: <span>⚙️</span> },
];

interface Props {
  profile:         Profile;
  investorProfile: InvestorProfile | null;
  savedCount:      number;
  introsSent:      any[];
  recentNotifs:    Notification[];
}

export function InvestorDashboardClient({ profile, investorProfile, savedCount, introsSent, recentNotifs }: Props) {
  const pendingIntros   = introsSent.filter(i => i.status === "pending").length;
  const acceptedIntros  = introsSent.filter(i => i.status === "accepted").length;

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-20">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Hey, {profile.full_name?.split(" ")[0] ?? "Investor"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's your deal flow overview</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/investor/browse"
            className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow cursor-pointer">
            <span className="text-2xl">🔍</span>
            <div><div className="font-bold text-slate-800 text-sm">Browse Startups</div><div className="text-xs text-slate-400">Discover new deals</div></div>
          </Link>
          <Link href="/dashboard/investor/saved"
            className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow cursor-pointer">
            <span className="text-2xl">🔖</span>
            <div><div className="font-bold text-slate-800 text-sm">Saved</div><div className="text-xs text-slate-400">{savedCount} startups</div></div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Intros Sent"   value={introsSent.length}  color="text-indigo-600"/>
          <StatCard label="Accepted"      value={acceptedIntros}     color="text-emerald-600"/>
          <StatCard label="Pending"       value={pendingIntros}      color="text-amber-600"/>
        </div>

        {/* Setup profile nudge */}
        {!investorProfile && (
          <div className="card p-5 border-indigo-200 bg-indigo-50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💼</span>
              <div className="flex-1">
                <div className="font-bold text-indigo-900 text-sm mb-1">Complete your investor profile</div>
                <p className="text-xs text-indigo-700 leading-relaxed mb-3">
                  Add your investment thesis, sectors, and ticket size so founders know you're serious.
                </p>
                <Link href="/dashboard/investor/profile" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 hover:underline">
                  Set up profile →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent intros */}
        {introsSent.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800 text-sm">Recent Intro Requests</div>
              <Link href="/dashboard/investor/browse" className="text-xs text-teal-600 font-semibold hover:underline">Browse more →</Link>
            </div>
            <div className="space-y-3">
              {introsSent.map(intro => {
                const fp = (intro.founder as any)?.founder_profile as any;
                return (
                  <div key={intro.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">{fp?.startup_name ?? "Unknown"}</div>
                      <div className="text-xs text-slate-400">{fp?.sector ?? ""}{fp?.stage ? ` · ${fp.stage}` : ""}</div>
                    </div>
                    <StatusPill status={intro.status}/>
                    <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(intro.created_at)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent notifications */}
        {recentNotifs.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800 text-sm">Recent Activity</div>
              <Link href="/dashboard/investor/notifications" className="text-xs text-teal-600 font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentNotifs.map(n => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-slate-300" : "bg-teal-500"}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                    {n.body && <div className="text-xs text-slate-400 truncate">{n.body}</div>}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {introsSent.length === 0 && !investorProfile && (
          <EmptyState icon="🚀" title="Start exploring startups" body="Browse verified founders and send intro requests to the ones you're excited about." cta="Browse Startups" href="/dashboard/investor/browse"/>
        )}
      </div>
    </DashboardLayout>
  );
}
