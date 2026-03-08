"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, Badge } from "@/components/ui";
import { StatusPill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/dashboard/admin",                label: "Overview",       icon: <span>📊</span> },
  { href: "/dashboard/admin/users",          label: "Users",          icon: <span>👥</span> },
  { href: "/dashboard/admin/approvals",      label: "Approvals",      icon: <span>✅</span> },
  { href: "/dashboard/admin/events",         label: "Events",         icon: <span>📅</span> },
  { href: "/dashboard/admin/moderation",     label: "Moderation",     icon: <span>🛡️</span> },
  { href: "/dashboard/admin/analytics",      label: "Analytics",      icon: <span>📈</span> },
  { href: "/dashboard/admin/revenue",        label: "Revenue",        icon: <span>💰</span> },
  { href: "/dashboard/admin/support",        label: "Support",        icon: <span>🎧</span> },
  { href: "/dashboard/admin/email-templates",label: "Email Templates",icon: <span>✉️</span> },
  { href: "/dashboard/admin/settings",       label: "Settings",       icon: <span>⚙️</span> },
];

interface Props {
  totalUsers:    number;
  byRole:        { founder: number; investor: number; partner: number; admin: number };
  pendingKyc:    number;
  pendingIntros: number;
  openTickets:   number;
  liveEvents:    number;
  recentUsers:   any[];
}

export function AdminDashboardClient({ totalUsers, byRole, pendingKyc, pendingIntros, openTickets, liveEvents, recentUsers }: Props) {
  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">FundLink platform snapshot</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Users"    value={totalUsers}    icon="👥" color="text-indigo-600"/>
          <StatCard label="Pending KYC"    value={pendingKyc}    icon="🪪" color="text-amber-600"/>
          <StatCard label="Open Tickets"   value={openTickets}   icon="🎫" color="text-red-500"/>
          <StatCard label="Live Events"    value={liveEvents}    icon="📅" color="text-teal-600"/>
        </div>

        {/* Role breakdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {(["founder","investor","partner","admin"] as const).map(role => {
            const colors: Record<string, string> = { founder:"text-teal-600", investor:"text-indigo-600", partner:"text-amber-600", admin:"text-slate-600" };
            return <Card key={role} className="p-3 text-center"><div className={`text-xl font-black ${colors[role]}`}>{byRole[role]}</div><div className="text-xs text-slate-500 capitalize mt-0.5">{role}s</div></Card>;
          })}
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { href:"/dashboard/admin/approvals", icon:"✅", label:"Review KYC",        sub:`${pendingKyc} pending`,      badge:pendingKyc },
            { href:"/dashboard/admin/support",   icon:"🎧", label:"Support Queue",     sub:`${openTickets} open tickets`, badge:openTickets },
            { href:"/dashboard/admin/users",     icon:"👥", label:"Manage Users",      sub:`${totalUsers} total`,         badge:0 },
            { href:"/dashboard/admin/analytics", icon:"📈", label:"View Analytics",    sub:"Usage & growth",              badge:0 },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-slate-800 text-sm">{a.label}</div>
                  {a.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{a.badge}</span>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent users */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-slate-800 text-sm">Recent Signups</div>
            <Link href="/dashboard/admin/users" className="text-xs text-teal-600 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 font-mono truncate">{u.id.slice(0,12)}…</div>
                </div>
                <Badge color={u.role==="founder"?"teal":u.role==="investor"?"indigo":u.role==="partner"?"amber":"slate"} >{u.role}</Badge>
                <StatusPill status={u.kyc_status}/>
                <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(u.created_at)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
