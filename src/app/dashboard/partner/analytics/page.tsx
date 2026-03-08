"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PARTNER_NAV } from "../client";

const MOCK_STATS = {
  totalEvents:      12,
  totalAttendees:   847,
  avgNPS:           72,
  leadsGenerated:   134,
  conversionRate:   "18.4%",
  topEvent:         "Demo Day Spring 2025",
};

const MOCK_EVENTS = [
  { name: "Demo Day Spring 2025", date: "Mar 1", attendees: 210, capacity: 250, nps: 78, leads: 42, conversion: "22%" },
  { name: "FinTech Founders Meetup", date: "Feb 15", attendees: 98,  capacity: 100, nps: 71, leads: 18, conversion: "19%" },
  { name: "AgriTech Summit",         date: "Feb 2",  attendees: 185, capacity: 200, nps: 69, leads: 31, conversion: "17%" },
  { name: "Investor Q&A: Seed Stage",date: "Jan 20", attendees: 72,  capacity: 75,  nps: 74, leads: 14, conversion: "19%" },
  { name: "Women in Startups",       date: "Jan 10", attendees: 145, capacity: 150, nps: 76, leads: 22, conversion: "15%" },
];

const TREND = [62, 78, 55, 91, 88, 110, 98, 120, 145, 130, 160, 185, 210];

function sparkPath(data: number[], w = 300, h = 60) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / (max - min + 1)) * (h - 8) - 4,
  ]);
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

export default function PartnerAnalyticsPage() {
  const [tab, setTab] = useState<"events"|"trend"|"sources">("events");

  const path = sparkPath(TREND);

  return (
    <DashboardLayout navItems={PARTNER_NAV} role="partner">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance insights for your events and programs</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Events",     value: MOCK_STATS.totalEvents,    color: "text-teal-600"   },
            { label: "Total Attendees",  value: MOCK_STATS.totalAttendees,  color: "text-indigo-600" },
            { label: "Avg NPS Score",    value: MOCK_STATS.avgNPS,          color: "text-emerald-600"},
            { label: "Leads Generated",  value: MOCK_STATS.leadsGenerated,  color: "text-amber-600"  },
            { label: "Conversion Rate",  value: MOCK_STATS.conversionRate,  color: "text-teal-600"   },
            { label: "Top Event",        value: "Demo Day",                 color: "text-indigo-600" },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-xs text-slate-500 font-semibold mb-1">{s.label}</div>
              <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 bg-slate-100 p-1 rounded-xl">
          {(["events","trend","sources"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {t === "events" ? "Event Table" : t === "trend" ? "Attendance Trend" : "Lead Sources"}
            </button>
          ))}
        </div>

        {/* Event Table */}
        {tab === "events" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Event","Date","Attendees","NPS","Leads","Conv."].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EVENTS.map((e, i) => {
                    const fillPct = Math.round((e.attendees / e.capacity) * 100);
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{e.name}</td>
                        <td className="px-4 py-3 text-slate-500">{e.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{e.attendees}</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${fillPct}%` }}/>
                            </div>
                            <span className="text-xs text-slate-400">{fillPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${e.nps >= 70 ? "text-emerald-600" : "text-amber-600"}`}>{e.nps}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600">{e.leads}</td>
                        <td className="px-4 py-3">
                          <span className="badge-teal">{e.conversion}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Trend */}
        {tab === "trend" && (
          <div className="card p-6">
            <div className="text-sm font-bold text-slate-700 mb-4">Monthly Attendance (Last 13 months)</div>
            <svg viewBox="0 0 300 70" className="w-full" style={{ height: 120 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1FA3A3" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#1FA3A3" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={`${path} L300,64 L0,64 Z`} fill="url(#ag)"/>
              <path d={path} fill="none" stroke="#1FA3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>13 months ago</span>
              <span>This month</span>
            </div>
          </div>
        )}

        {/* Lead Sources */}
        {tab === "sources" && (
          <div className="card p-6">
            <div className="text-sm font-bold text-slate-700 mb-4">Lead Sources</div>
            <div className="space-y-3">
              {[
                { source: "FundLink Platform",  leads: 58, pct: 43 },
                { source: "LinkedIn",            leads: 32, pct: 24 },
                { source: "Email Newsletter",    leads: 21, pct: 16 },
                { source: "Referral",            leads: 14, pct: 10 },
                { source: "Other",               leads: 9,  pct: 7  },
              ].map(s => (
                <div key={s.source} className="flex items-center gap-3">
                  <div className="w-32 text-xs font-semibold text-slate-700 flex-shrink-0">{s.source}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${s.pct}%` }}/>
                  </div>
                  <div className="w-12 text-xs text-slate-500 text-right flex-shrink-0">{s.leads} leads</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
