"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, StatusPill, TabBar, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { formatINR, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

const FOUNDER_NAV = [
  { href: "/dashboard/founder",           label: "Dashboard", icon: <span>🏠</span> },
  { href: "/dashboard/founder/intros",    label: "Intros",    icon: <span>🤝</span> },
  { href: "/dashboard/founder/documents", label: "Documents", icon: <span>📂</span> },
  { href: "/dashboard/founder/messages",  label: "Messages",  icon: <span>💬</span> },
  { href: "/dashboard/founder/profile",   label: "Profile",   icon: <span>👤</span> },
  { href: "/dashboard/founder/kyc",       label: "KYC",       icon: <span>🪪</span> },
  { href: "/dashboard/founder/billing",   label: "Billing",   icon: <span>💳</span> },
  { href: "/dashboard/founder/settings",  label: "Settings",  icon: <span>⚙️</span> },
];

export function IntrosClient({ intros }: { intros: any[] }) {
  const router  = useRouter();
  const [tab,   setTab]   = useState("pending");
  const [busy,  setBusy]  = useState<string|null>(null);

  const tabs = [
    { id: "pending",   label: "Pending",   badge: intros.filter(i=>i.status==="pending").length },
    { id: "accepted",  label: "Accepted",  badge: 0 },
    { id: "declined",  label: "Declined",  badge: 0 },
    { id: "all",       label: "All",       badge: 0 },
  ];

  const filtered = tab === "all" ? intros : intros.filter(i => i.status === tab);

  const act = async (id: string, action: "accept"|"decline") => {
    setBusy(id);
    const res = await fetch("/api/intros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intro_id: id, action }),
    });
    setBusy(null);
    if (res.ok) {
      toast.success(action === "accept" ? "Introduction accepted! 🎉" : "Declined.");
      router.refresh();
    } else toast.error("Something went wrong.");
  };

  return (
    <DashboardLayout navItems={FOUNDER_NAV} role="founder">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Intro Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">{intros.length} total · {intros.filter(i=>i.status==="pending").length} pending your response</p>
        </div>

        <TabBar tabs={tabs} active={tab} onChange={setTab}/>

        <div className="mt-4 space-y-3">
          {filtered.length === 0
            ? <EmptyState icon="🤝" title={`No ${tab === "all" ? "" : tab} intros`} body="Intro requests from investors will appear here."/>
            : filtered.map(intro => {
                const inv = intro.investor as any;
                const ip  = inv?.investor_profile as any;
                return (
                  <Card key={intro.id} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={inv?.full_name} size={40}/>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800">{inv?.full_name}</div>
                        <div className="text-xs text-slate-500">
                          {ip?.firm_name ?? "Independent"}{ip?.title ? ` · ${ip.title}` : ""}
                        </div>
                        {ip?.ticket_min && (
                          <div className="text-xs text-teal-600 font-semibold mt-0.5">
                            Ticket: {formatINR(ip.ticket_min, true)}–{formatINR(ip.ticket_max, true)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusPill status={intro.status}/>
                        <span className="text-xs text-slate-400">{timeAgo(intro.created_at)}</span>
                      </div>
                    </div>

                    {intro.message && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3 leading-relaxed italic">
                        "{intro.message}"
                      </p>
                    )}

                    {intro.status === "pending" && (
                      <div className="flex gap-2">
                        <Btn variant="primary"   size="sm" loading={busy===intro.id} onClick={() => act(intro.id,"accept")}>Accept</Btn>
                        <Btn variant="secondary" size="sm" loading={busy===intro.id} onClick={() => act(intro.id,"decline")}>Decline</Btn>
                        <Btn variant="ghost"     size="sm" onClick={() => router.push(`/dashboard/founder/messages?with=${inv?.id}`)}>Message</Btn>
                      </div>
                    )}
                    {intro.status === "accepted" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 font-bold">✓ Connected</span>
                        <span className="text-xs text-slate-400">{inv?.email}</span>
                        <Btn variant="ghost" size="sm" onClick={() => router.push(`/dashboard/founder/messages?with=${inv?.id}`)}>Message</Btn>
                      </div>
                    )}
                  </Card>
                );
              })
          }
        </div>
      </div>
    </DashboardLayout>
  );
}
