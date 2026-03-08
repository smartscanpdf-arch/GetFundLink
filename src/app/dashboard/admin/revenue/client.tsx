"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, Badge, EmptyState } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import { formatINR, timeAgo } from "@/lib/utils";

export function AdminRevenueClient({ invoices, subscriptions }: { invoices: any[]; subscriptions: any[] }) {
  const totalRevenue  = invoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const activePayingCount = subscriptions.filter(s => s.status === "active").length;

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">Revenue</h1>
          <p className="text-sm text-slate-500">Subscription and payment overview</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Total Revenue"    value={formatINR(totalRevenue, true)} color="text-emerald-600" icon="💰"/>
          <StatCard label="Active Paying"    value={activePayingCount}             color="text-indigo-600"  icon="💳"/>
          <StatCard label="Total Invoices"   value={invoices.length}               color="text-teal-600"    icon="📄"/>
        </div>

        {invoices.length === 0 ? (
          <EmptyState icon="💳" title="No invoices yet" body="Revenue data will appear here once users upgrade to paid plans. Connect Razorpay to enable payments."/>
        ) : (
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-800 text-sm">Invoice History</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["User","Plan","Amount","Date","Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><div className="font-semibold text-slate-800 text-xs truncate max-w-[120px]">{(inv.user as any)?.full_name ?? "—"}</div></td>
                    <td className="px-4 py-3"><Badge color="indigo">{inv.plan_name ?? "plan"}</Badge></td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatINR(inv.amount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(inv.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3"><Badge color="green">Paid</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
