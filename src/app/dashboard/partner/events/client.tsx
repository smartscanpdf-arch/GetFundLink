"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge, StatusPill, Modal, Input, Textarea, Select, EmptyState } from "@/components/ui";
import { PARTNER_NAV } from "../client";
import toast from "react-hot-toast";

export function PartnerEventsClient({ events: init, organizerId }: { events: any[]; organizerId: string }) {
  const router  = useRouter();
  const [events, setEvents] = useState(init);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({ title:"", event_type:"demo_day", description:"", event_date:"", city:"", is_virtual:false, capacity:"" });

  const create = async () => {
    if (!form.title || !form.event_date) { toast.error("Title and date required"); return; }
    setSaving(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, capacity: form.capacity ? parseInt(form.capacity) : null, status: "draft" }),
    });
    setSaving(false);
    if (res.ok) {
      const { event } = await res.json();
      setEvents(p => [{ ...event, registrations:[] }, ...p]);
      setCreateOpen(false);
      toast.success("Event created as draft. Pending admin approval to publish.");
    } else toast.error("Failed to create event");
  };

  const publish = async (id: string) => {
    toast.success("Publish request sent to admin for review.");
  };

  return (
    <DashboardLayout navItems={PARTNER_NAV} role="partner">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-black text-slate-900">My Events</h1>
          <Btn variant="primary" size="sm" onClick={() => setCreateOpen(true)}>+ New Event</Btn>
        </div>

        {events.length === 0 ? (
          <EmptyState icon="📅" title="No events yet" body="Create your first event to engage with the FundLink community." cta="Create Event" onCta={() => setCreateOpen(true)}/>
        ) : (
          <div className="space-y-4">
            {events.map(e => (
              <Card key={e.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{e.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(e.event_date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
                      {e.city && ` · ${e.city}`}
                      {e.is_virtual && " · Virtual"}
                    </div>
                  </div>
                  <StatusPill status={e.status}/>
                </div>
                {e.description && <p className="text-sm text-slate-500 mb-3 leading-relaxed">{e.description.slice(0,120)}{e.description.length>120?"…":""}</p>}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">{e.registrations?.length ?? 0} registered</span>
                  {e.capacity && <span className="text-xs text-slate-400">of {e.capacity} capacity</span>}
                  {e.status === "draft" && <Btn variant="primary" size="sm" onClick={() => publish(e.id)}>Request Publish</Btn>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
        <div className="space-y-4">
          <Input label="Event Title *" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. FundLink Demo Day Q2 2025"/>
          <Select label="Type" value={form.event_type} onChange={e => setForm(p=>({...p,event_type:e.target.value}))} options={[
            {value:"demo_day",label:"Demo Day"},{value:"meetup",label:"Meetup"},{value:"summit",label:"Summit"},{value:"workshop",label:"Workshop"},{value:"cohort",label:"Cohort"}
          ]}/>
          <Textarea label="Description" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={3}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date & Time *" type="datetime-local" value={form.event_date} onChange={e => setForm(p=>({...p,event_date:e.target.value}))}/>
            <Input label="City" value={form.city} onChange={e => setForm(p=>({...p,city:e.target.value}))} placeholder="e.g. Bangalore"/>
          </div>
          <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))}/>
          <div className="flex gap-2 pt-1">
            <Btn variant="secondary" full onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn variant="primary"   full loading={saving} onClick={create}>Create Event</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
