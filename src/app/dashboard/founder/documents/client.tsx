"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Inline icons — must be declared before FOUNDER_NAV uses them
const HomeIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LinkIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const FileIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const MsgIcon  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const UserIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CardIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const GearIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const StarIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
import { Avatar } from "@/components/ui/Avatar";
import { formatINR, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile, FounderProfile, IntroRequest, Notification } from "@/types";

interface Props {
  profile:       Profile;
  founderProfile: FounderProfile | null;
  intros:        IntroRequest[];
  recentNotifs:  Notification[];
}

export const FOUNDER_NAV = [
  { href: "/dashboard/founder",              label: "Dashboard",  icon: <HomeIcon/> },
  { href: "/dashboard/founder/intros",       label: "Intros",     icon: <LinkIcon/> },
  { href: "/dashboard/founder/documents",    label: "Documents",  icon: <FileIcon/> },
  { href: "/dashboard/founder/messages",     label: "Messages",   icon: <MsgIcon/> },
  { href: "/dashboard/founder/profile",      label: "My Profile", icon: <UserIcon/> },
  { href: "/dashboard/founder/affiliate",    label: "Affiliate",  icon: <StarIcon/> },
  { href: "/dashboard/founder/billing",      label: "Billing",    icon: <CardIcon/> },
  { href: "/dashboard/founder/settings",     label: "Settings",   icon: <GearIcon/> },
];
const NAV_ITEMS = FOUNDER_NAV;

export function FounderDashboardClient({ profile, founderProfile, intros, recentNotifs }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const pendingIntros   = intros.filter(i => i.status === "pending");
  const acceptedIntros  = intros.filter(i => i.status === "accepted");
  const isOnboarded     = !!founderProfile;
  const isKycDone       = profile.kyc_status === "approved";

  const checklist = [
    { id: "profile",  label: "Complete your profile",       done: isOnboarded,               href: "/dashboard/founder/profile"  },
    { id: "kyc",      label: "Verify your identity (KYC)",  done: isKycDone,                  href: "/dashboard/founder/kyc"      },
    { id: "deck",     label: "Upload your pitch deck",      done: !!founderProfile?.deck_url, href: "/dashboard/founder/documents"},
    { id: "verified", label: "Get the Verified badge",      done: profile.is_verified,        href: "/dashboard/founder/kyc"      },
  ];
  const checklistDone = checklist.filter(c => c.done).length;

  const handleIntroAction = async (introId: string, action: "accept" | "decline") => {
    setRespondingTo(introId);
    const res = await fetch("/api/intros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intro_id: introId, action }),
    });
    setRespondingTo(null);
    if (res.ok) {
      toast.success(action === "accept" ? "Introduction accepted! 🎉" : "Introduction declined.");
      router.refresh();
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="founder">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-20">

        {/* Welcome header */}
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Hey, {profile.full_name?.split(" ")[0] ?? "Founder"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {founderProfile?.startup_name
              ? `Here's what's happening at ${founderProfile.startup_name}`
              : "Let's get your startup profile set up"}
          </p>
        </div>

        {/* Onboarding checklist */}
        {checklistDone < checklist.length && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-slate-800 text-sm">Get started</div>
              <div className="text-xs font-bold text-teal-600">{checklistDone}/{checklist.length} done</div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${(checklistDone / checklist.length) * 100}%` }}/>
            </div>
            <div className="space-y-2">
              {checklist.map(c => (
                <Link key={c.id} href={c.href}
                  className="flex items-center gap-3 py-1.5 group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${c.done ? "border-teal-500 bg-teal-500" : "border-slate-300 group-hover:border-teal-400"}`}>
                    {c.done && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <span className={`text-sm ${c.done ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-teal-600"}`}>
                    {c.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        {founderProfile && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Intro Requests", value: intros.length,                          color: "text-teal-600"   },
              { label: "Accepted",       value: acceptedIntros.length,                   color: "text-emerald-600"},
              { label: "MRR",            value: formatINR(founderProfile.mrr, true),     color: "text-indigo-600" },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pending intro requests */}
        {pendingIntros.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800">Intro Requests</div>
              <span className="badge-teal">{pendingIntros.length} pending</span>
            </div>
            <div className="space-y-3">
              {pendingIntros.map(intro => {
                const investor = intro.investor as any;
                const loading  = respondingTo === intro.id;
                return (
                  <div key={intro.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={investor?.full_name} size={36}/>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm">{investor?.full_name}</div>
                        <div className="text-xs text-slate-500">
                          {investor?.investor_profile?.firm_name ?? "Independent investor"}
                          {investor?.investor_profile?.title && ` · ${investor.investor_profile.title}`}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(intro.created_at)}</span>
                    </div>
                    {intro.message && (
                      <p className="text-sm text-slate-600 bg-white rounded-lg p-3 border border-slate-200 mb-3 leading-relaxed">
                        "{intro.message}"
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleIntroAction(intro.id, "accept")} disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-teal-500 text-white text-xs font-bold
                                   hover:bg-teal-600 disabled:opacity-60 transition-colors">
                        {loading ? "…" : "Accept"}
                      </button>
                      <button onClick={() => handleIntroAction(intro.id, "decline")} disabled={loading}
                        className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold
                                   hover:bg-slate-100 disabled:opacity-60 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KYC alert */}
        {profile.kyc_status === "none" && (
          <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">🪪</span>
            <div className="flex-1">
              <div className="font-bold text-amber-900 text-sm mb-0.5">Verify your identity</div>
              <p className="text-xs text-amber-700 leading-relaxed mb-2">
                KYC verification unlocks investor visibility and intro requests. Takes 1–3 days.
              </p>
              <Link href="/dashboard/founder/kyc"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline">
                Start verification →
              </Link>
            </div>
          </div>
        )}

        {profile.kyc_status === "pending" && (
          <div className="rounded-2xl p-4 border border-blue-200 bg-blue-50 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⏳</span>
            <div>
              <div className="font-bold text-blue-900 text-sm mb-0.5">KYC under review</div>
              <p className="text-xs text-blue-700">Your documents are being reviewed. Typically 1–3 business days.</p>
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recentNotifs.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800 text-sm">Recent Activity</div>
              <Link href="/dashboard/founder/notifications" className="text-xs text-teal-600 font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotifs.map(n => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.is_read ? "bg-slate-300" : "bg-teal-500"}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                    {n.body && <div className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</div>}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — no profile yet */}
        {!founderProfile && checklistDone === 0 && (
          <div className="card p-8 text-center">
            <span className="text-4xl block mb-3">🚀</span>
            <h3 className="font-black text-slate-800 text-lg mb-2">Set up your founder profile</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
              Tell investors about your startup. It takes about 5 minutes and unlocks intro requests.
            </p>
            <Link href="/dashboard/founder/profile" className="btn-primary">
              Create Profile →
            </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}



