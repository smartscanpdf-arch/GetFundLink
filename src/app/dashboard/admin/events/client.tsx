"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge, StatusPill, EmptyState } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export function AdminEventsClient({ events: init }: { events: any[] }) {
  const [events, setEvents] = useState(init);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setEvents(p => p.map(e => e.id === id ? { ...e, status } : e));
      toast.success(`Event ${status}`);
    } else toast.error("Action failed");
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-xl font-black text-slate-900 mb-5">Events <span className="text-slate-400 font-normal text-base">({events.length})</span></h1>
        {events.length === 0
          ? <EmptyState icon="📅" title="No events yet" body="Partners create events which appear here for review and publishing."/>
          : (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Event","Organiser","Date","Reg.","Status","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map(e => {
                    const org = e.organizer as any;
                    return (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 text-xs truncate max-w-[180px]">{e.title}</div>
                          {e.event_type && <Badge color="slate">{e.event_type.replace("_"," ")}</Badge>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{org?.partner_profile?.org_name ?? org?.full_name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(e.event_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{e.registrations?.length ?? 0}</td>
                        <td className="px-4 py-3"><StatusPill status={e.status}/></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {e.status === "draft"      && <Btn variant="primary"    size="sm" onClick={() => updateStatus(e.id,"published")}>Publish</Btn>}
                            {e.status === "published"  && <Btn variant="secondary"  size="sm" onClick={() => updateStatus(e.id,"cancelled")}>Cancel</Btn>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )
        }
      </div>
    </DashboardLayout>
  );
}
