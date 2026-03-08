"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, Modal, Input, Textarea, Select, Btn, StatusPill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export const PARTNER_NAV = [
  { href: "/dashboard/partner",               label: "Dashboard",    icon: <span>🏠</span> },
  { href: "/dashboard/partner/events",        label: "Events",       icon: <span>📅</span> },
  { href: "/dashboard/partner/analytics",     label: "Analytics",    icon: <span>📈</span> },
  { href: "/dashboard/partner/profile",       label: "Profile",      icon: <span>🏢</span> },
  { href: "/dashboard/partner/notifications", label: "Notifications",icon: <span>🔔</span> },
  { href: "/dashboard/partner/settings",      label: "Settings",     icon: <span>⚙️</span> },
];

export function PartnerDashboardClient({ profile, partnerProfile, events, notifs }: any) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:"", event_type:"demo_day", description:"", event_date:"", city:"", is_virtual:false, capacity:"" });

  const isApproved = partnerProfile?.app_status === "approved";
  const upcoming = events.filter((e: any) => new Date(e.event_date) > new Date()).length;

  const createEvent = async () => {
    if (!form.title || !form.event_date) { toast.error("Title and date required"); return; }
    setSaving(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, capacity: form.capacity ? parseInt(form.capacity) : null, status: "draft" }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Event created!"); setCreateOpen(false); router.refresh(); }
    else toast.error("Failed to create event");
  };

  return (
    <DashboardLayout navItems={PARTNER_NAV} role="partner">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Hey, {profile?.full_name?.split(" ")[0] ?? "Partner"} 👋</h1>
            <p className="text-sm text-slate-500">{partnerProfile?.org_name ?? "Partner dashboard"}</p>
          </div>
          {isApproved && <Btn variant="primary" size="sm" onClick={() => setCreateOpen(true)}>+ New Event</Btn>}
        </div>

        {/* Approval pending */}
        {!isApproved && (
          <div className="card p-5 border-amber-200 bg-amber-50">
            <div className="flex gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <div className="font-bold text-amber-900 text-sm mb-1">Application under review</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Your partner application is being reviewed by our team. You'll be able to create events and access analytics once approved (typically 2–3 business days).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Events" value={events.length}                                       color="text-teal-600"/>
          <StatCard label="Upcoming"     value={upcoming}                                             color="text-indigo-600"/>
          <StatCard label="Total Reg."   value={events.reduce((s:number,e:any) => s+(e.registrations?.length??0),0)} color="text-amber-600"/>
        </div>

        {/* Recent events */}
        {events.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800 text-sm">Recent Events</div>
              <Link href="/dashboard/partner/events" className="text-xs text-teal-600 font-semibold hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {events.slice(0,4).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">{e.title}</div>
                    <div className="text-xs text-slate-400">{new Date(e.event_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · {e.registrations?.length??0} registered</div>
                  </div>
                  <StatusPill status={e.status}/>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent notifs */}
        {notifs.length > 0 && (
          <Card className="p-5">
            <div className="font-bold text-slate-800 text-sm mb-3">Recent Activity</div>
            <div className="space-y-2">
              {notifs.map((n: any) => (
                <div key={n.id} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${n.is_read?"bg-slate-300":"bg-teal-500"}`}/>
                  <div className="flex-1 text-sm text-slate-700">{n.title}</div>
                  <span className="text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
        <div className="space-y-4">
          <Input label="Event Title *" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. FundLink Demo Day Q2 2025"/>
          <Select label="Type" value={form.event_type} onChange={e => setForm(p=>({...p,event_type:e.target.value}))} options={[
            {value:"demo_day",label:"Demo Day"},{value:"meetup",label:"Meetup"},{value:"summit",label:"Summit"},{value:"workshop",label:"Workshop"},{value:"cohort",label:"Cohort"}
          ]}/>
          <Textarea label="Description" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Tell attendees what to expect…"/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date & Time *" type="datetime-local" value={form.event_date} onChange={e => setForm(p=>({...p,event_date:e.target.value}))}/>
            <Input label="City" value={form.city} onChange={e => setForm(p=>({...p,city:e.target.value}))} placeholder="e.g. Bangalore"/>
          </div>
          <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))} placeholder="Leave blank for unlimited"/>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_virtual} onChange={e => setForm(p=>({...p,is_virtual:e.target.checked}))} className="accent-teal-500"/>
            <span className="text-sm text-slate-700">This is a virtual/online event</span>
          </label>
          <div className="flex gap-2 pt-1">
            <Btn variant="secondary" full onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn variant="primary"   full loading={saving} onClick={createEvent}>Create Event</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
