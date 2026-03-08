"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, TabBar } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import { useState, useMemo } from "react";

function MiniBar({ data, color="#1FA3A3" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height:`${(v/max)*100}%`, background:color, opacity: i===data.length-1 ? 1 : 0.5+0.5*(i/data.length) }}/>
      ))}
    </div>
  );
}

export function AdminAnalyticsClient({ users, intros, events, tickets }: { users:any[]; intros:any[]; events:any[]; tickets:any[] }) {
  const [tab, setTab] = useState("overview");

  // Group signups by last 7 days
  const last7 = useMemo(() => {
    const days = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i);
      return d.toISOString().split("T")[0];
    });
    return days.map(day => users.filter(u => u.created_at?.startsWith(day)).length);
  }, [users]);

  const introsByStatus = useMemo(() => ({
    pending:   intros.filter(i=>i.status==="pending").length,
    accepted:  intros.filter(i=>i.status==="accepted").length,
    declined:  intros.filter(i=>i.status==="declined").length,
    completed: intros.filter(i=>i.status==="completed").length,
  }), [intros]);

  const convRate = intros.length ? Math.round((introsByStatus.accepted / intros.length) * 100) : 0;

  const byRole = useMemo(() => ({
    founder:  users.filter(u=>u.role==="founder").length,
    investor: users.filter(u=>u.role==="investor").length,
    partner:  users.filter(u=>u.role==="partner").length,
  }), [users]);

  const byPlan = useMemo(() => ({
    free:       users.filter(u=>u.plan==="free").length,
    starter:    users.filter(u=>u.plan==="starter").length,
    pro:        users.filter(u=>u.plan==="pro").length,
    enterprise: users.filter(u=>u.plan==="enterprise").length,
  }), [users]);

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Platform performance overview</p>
        </div>

        <TabBar tabs={[{id:"overview",label:"Overview"},{id:"users",label:"Users"},{id:"intros",label:"Intros"},{id:"revenue",label:"Revenue"}]} active={tab} onChange={setTab}/>

        <div className="mt-5 space-y-5">
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Users"   value={users.length}   icon="👥" color="text-indigo-600"/>
                <StatCard label="Total Intros"  value={intros.length}  icon="🤝" color="text-teal-600"/>
                <StatCard label="Events"        value={events.length}  icon="📅" color="text-amber-600"/>
                <StatCard label="Intro Conv. %" value={`${convRate}%`} icon="📈" color="text-emerald-600"/>
              </div>
              <Card className="p-5">
                <div className="font-bold text-slate-800 text-sm mb-3">Signups — Last 7 Days</div>
                <MiniBar data={last7}/>
                <div className="flex justify-between mt-1">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                    <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
                  ))}
                </div>
              </Card>
            </>
          )}

          {tab === "users" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Founders"  value={byRole.founder}  color="text-teal-600"/>
                <StatCard label="Investors" value={byRole.investor} color="text-indigo-600"/>
                <StatCard label="Partners"  value={byRole.partner}  color="text-amber-600"/>
              </div>
              <Card className="p-5">
                <div className="font-bold text-slate-800 text-sm mb-4">Plans Breakdown</div>
                <div className="space-y-3">
                  {Object.entries(byPlan).map(([plan, count]) => {
                    const pct = users.length ? Math.round((count/users.length)*100) : 0;
                    const colors: Record<string,string> = { free:"#94A3B8", starter:"#1FA3A3", pro:"#6366F1", enterprise:"#8B5CF6" };
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 capitalize">{plan}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:colors[plan] }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {tab === "intros" && (
            <>
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Pending"   value={introsByStatus.pending}   color="text-amber-500"/>
                <StatCard label="Accepted"  value={introsByStatus.accepted}  color="text-emerald-600"/>
                <StatCard label="Declined"  value={introsByStatus.declined}  color="text-red-500"/>
                <StatCard label="Conv. Rate" value={`${convRate}%`}          color="text-teal-600"/>
              </div>
              <Card className="p-5">
                <div className="font-bold text-slate-800 text-sm mb-4">Intro Funnel</div>
                {[
                  ["Requests Sent",    intros.length,                "#6366F1"],
                  ["Accepted",         introsByStatus.accepted,       "#10B981"],
                  ["Meetings Booked",  introsByStatus.completed,      "#1FA3A3"],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-800">{val}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${intros.length?((val as number)/intros.length)*100:0}%`, background:color as string }}/>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === "revenue" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Paying Users" value={users.filter(u=>u.plan!=="free").length} color="text-emerald-600" icon="💳"/>
                <StatCard label="Free Users"   value={byPlan.free}                              color="text-slate-600"  icon="👤"/>
                <StatCard label="Paid Conv. %" value={users.length?`${Math.round(((users.filter(u=>u.plan!=="free").length)/users.length)*100)}%`:"0%"} color="text-teal-600" icon="📈"/>
              </div>
              <Card className="p-5">
                <div className="font-bold text-slate-800 text-sm mb-2">Revenue module</div>
                <p className="text-sm text-slate-500">Full revenue analytics including MRR, churn, and LTV will be available once Razorpay integration is configured.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
