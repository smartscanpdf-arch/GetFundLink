"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, StatCard, Badge, Modal, Input, Select, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { INVESTOR_NAV } from "../client";
import { formatINR, SECTORS, STAGES, STAGE_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function PortfolioClient({ investments: init, investorId }: { investments: any[]; investorId: string }) {
  const supabase = createClient();
  const [items,    setItems]   = useState(init);
  const [addOpen,  setAddOpen] = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [form, setForm] = useState({ company_name:"", sector:"", stage:"", amount:"", equity_pct:"", notes:"" });

  const totalInvested = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const sectors = Array.from(new Set(items.map(i => i.sector).filter(Boolean)));

  const saveInvestment = async () => {
    if (!form.company_name) { toast.error("Company name required"); return; }
    setSaving(true);
    const { data, error } = await (supabase.from("portfolio_investments") as any).insert({
      investor_id: investorId,
      company_name: form.company_name,
      sector: form.sector || null,
      stage: form.stage || null,
      amount: form.amount ? Math.round(parseFloat(form.amount) * 100) : null,
      equity_pct: form.equity_pct ? parseFloat(form.equity_pct) : null,
      notes: form.notes || null,
      invested_at: new Date().toISOString().split("T")[0],
    }).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setItems(p => [data, ...p]);
    setAddOpen(false);
    setForm({ company_name:"", sector:"", stage:"", amount:"", equity_pct:"", notes:"" });
    toast.success("Investment added!");
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Portfolio</h1>
          <Btn variant="primary" size="sm" onClick={() => setAddOpen(true)}>+ Add Investment</Btn>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Companies"      value={items.length}                   color="text-indigo-600"/>
          <StatCard label="Total Deployed" value={formatINR(totalInvested, true)} color="text-teal-600"/>
          <StatCard label="Sectors"        value={sectors.length}                 color="text-amber-600"/>
        </div>

        {items.length === 0 ? (
          <EmptyState icon="📊" title="No investments yet" body="Track your portfolio by adding investments." cta="Add Investment" onCta={() => setAddOpen(true)}/>
        ) : (
          <div className="space-y-3">
            {items.map(inv => {
              const f  = inv.founder as any;
              const fp = f?.founder_profile as any;
              const name = fp?.startup_name ?? inv.company_name;
              return (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={name} size={40}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 text-sm">{name}</span>
                        {inv.sector && <Badge color="indigo">{inv.sector}</Badge>}
                        {inv.stage  && <Badge color="slate">{STAGE_LABELS[inv.stage]??inv.stage}</Badge>}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        {inv.amount     && <span className="font-bold text-slate-700">{formatINR(inv.amount, true)} invested</span>}
                        {inv.equity_pct && <span>{inv.equity_pct}% equity</span>}
                        {inv.invested_at && <span>{new Date(inv.invested_at).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</span>}
                      </div>
                      {inv.notes && <p className="text-xs text-slate-400 mt-1.5">{inv.notes}</p>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Investment">
        <div className="space-y-4">
          <Input label="Company Name *" value={form.company_name} onChange={e => setForm(p=>({...p,company_name:e.target.value}))} placeholder="e.g. GreenTech Solutions"/>
          <Select label="Sector" value={form.sector} onChange={e => setForm(p=>({...p,sector:e.target.value}))} options={[{value:"",label:"Select…"},...SECTORS.map(s=>({value:s,label:s}))]}/>
          <Select label="Stage at Entry" value={form.stage} onChange={e => setForm(p=>({...p,stage:e.target.value}))} options={[{value:"",label:"Select…"},...STAGES.map(s=>({value:s,label:STAGE_LABELS[s]??s}))]}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount Invested (₹)" type="number" value={form.amount} onChange={e => setForm(p=>({...p,amount:e.target.value}))} placeholder="e.g. 5000000"/>
            <Input label="Equity %" type="number" step="0.01" value={form.equity_pct} onChange={e => setForm(p=>({...p,equity_pct:e.target.value}))} placeholder="e.g. 5.5"/>
          </div>
          <Input label="Notes" value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} placeholder="Brief notes about this investment"/>
          <div className="flex gap-2 pt-1">
            <Btn variant="secondary" full onClick={() => setAddOpen(false)}>Cancel</Btn>
            <Btn variant="primary"   full loading={saving} onClick={saveInvestment}>Add Investment</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
