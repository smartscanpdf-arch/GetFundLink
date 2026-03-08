"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, formatINR } from "@/lib/utils";
import { INVESTOR_NAV } from "../client";
import toast from "react-hot-toast";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "bg-amber-100",   color: "text-amber-700",   label: "Pending" },
  accepted:  { bg: "bg-emerald-100", color: "text-emerald-700", label: "Accepted" },
  declined:  { bg: "bg-red-100",     color: "text-red-700",     label: "Declined" },
  completed: { bg: "bg-indigo-100",  color: "text-indigo-700",  label: "Completed" },
};

export default function InvestorIntrosPage() {
  const [intros,    setIntros]    = useState<any[]>([]);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/intros")
      .then(r => r.json())
      .then(d => { setIntros(d.intros ?? []); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? intros : intros.filter(i => i.status === filter);

  const counts = {
    all:       intros.length,
    pending:   intros.filter(i => i.status === "pending").length,
    accepted:  intros.filter(i => i.status === "accepted").length,
    declined:  intros.filter(i => i.status === "declined").length,
    completed: intros.filter(i => i.status === "completed").length,
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Introduction Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all intro requests you've sent to founders</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {(["all","pending","accepted","declined","completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {f} {counts[f] > 0 && <span className="ml-1 opacity-60">({counts[f]})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3"/>
                    <div className="h-2 bg-slate-200 rounded w-1/2"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-black text-slate-800 mb-2">
              {filter === "all" ? "No intro requests yet" : `No ${filter} intros`}
            </h3>
            <p className="text-slate-500 text-sm">
              {filter === "all" ? "Browse startups and send your first intro request." : "Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(intro => {
              const founder = intro.founder as any;
              const fp      = founder?.founder_profile;
              const ss      = STATUS_STYLE[intro.status] ?? STATUS_STYLE.pending;

              return (
                <div key={intro.id} className="card p-5 card-hover">
                  <div className="flex items-start gap-3">
                    <Avatar name={founder?.full_name} size={44}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800">{fp?.startup_name ?? founder?.full_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {fp?.sector && <span className="mr-2">{fp.sector}</span>}
                            {fp?.stage  && <span className="capitalize">{fp.stage.replace("-"," ")}</span>}
                            {fp?.ask_amount && <span className="ml-2 font-semibold text-teal-600">Raising {formatINR(fp.ask_amount, true)}</span>}
                          </div>
                        </div>
                        <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${ss.bg} ${ss.color}`}>
                          {ss.label}
                        </span>
                      </div>

                      {intro.message && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-xs font-bold text-slate-400 mb-1">Your message</div>
                          <p className="text-sm text-slate-600 leading-relaxed">{intro.message}</p>
                        </div>
                      )}

                      {intro.founder_note && (
                        <div className="mt-2 p-3 rounded-xl bg-teal-50 border border-teal-200">
                          <div className="text-xs font-bold text-teal-600 mb-1">Founder's note</div>
                          <p className="text-sm text-teal-800 leading-relaxed">{intro.founder_note}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400">{timeAgo(intro.created_at)}</span>
                        {intro.status === "accepted" && founder?.email && (
                          <a href={`mailto:${founder.email}`}
                            className="text-xs font-bold text-teal-600 hover:underline">
                            Send email →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
