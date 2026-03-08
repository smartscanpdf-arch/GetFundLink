"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, EmptyState, Skeleton } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { UserRole, Notification } from "@/types";

const TYPE_ICON: Record<string, string> = {
  intro_request: "🤝", intro_accepted: "✅", intro_declined: "❌",
  kyc_approved: "✅", kyc_rejected: "⚠️", message: "💬",
  new_support_ticket: "🎫", support_reply: "🎧", event: "📅",
  default: "🔔",
};

interface Props {
  role:     UserRole;
  navItems: { href: string; label: string; icon: React.ReactNode }[];
}

export function NotificationsPage({ role, navItems }: Props) {
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications ?? []); setLoading(false); });
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ all: true }) });
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <DashboardLayout navItems={navItems} role={role}>
      <div className="max-w-xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-500 mt-0.5">{unread} unread</p>
          </div>
          {unread > 0 && <Btn variant="ghost" size="sm" onClick={markAll}>Mark all read</Btn>}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-2xl"/>)}
          </div>
        ) : notifs.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications yet" body="You're all caught up. Notifications will appear here as activity happens."/>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => (
              <div key={n.id}
                onClick={() => { if (!n.is_read) markRead(n.id); if (n.action_url) window.location.href = n.action_url; }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                  n.is_read
                    ? "bg-white border-slate-200 opacity-70"
                    : "bg-teal-50 border-teal-200 hover:bg-teal-100"
                )}>
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-bold", n.is_read ? "text-slate-600" : "text-slate-900")}>
                    {n.title}
                  </div>
                  {n.body && <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-teal-500"/>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
