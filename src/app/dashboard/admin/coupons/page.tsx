"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "../client";
import toast from "react-hot-toast";

interface Coupon {
  id:          string;
  code:        string;
  discount:    number;
  type:        "percent" | "fixed";
  plan:        string;
  uses:        number;
  max_uses:    number;
  expires_at:  string | null;
  active:      boolean;
}

const MOCK_COUPONS: Coupon[] = [
  { id:"1", code:"LAUNCH50",   discount:50, type:"percent", plan:"pro",       uses:47,  max_uses:100, expires_at:"2025-12-31", active:true  },
  { id:"2", code:"PARTNER20",  discount:20, type:"percent", plan:"all",       uses:12,  max_uses:50,  expires_at:"2025-06-30", active:true  },
  { id:"3", code:"FLAT500",    discount:500,type:"fixed",   plan:"starter",   uses:8,   max_uses:200, expires_at:null,         active:true  },
  { id:"4", code:"OLDPROMO",   discount:30, type:"percent", plan:"pro",       uses:100, max_uses:100, expires_at:"2024-12-31", active:false },
];

export default function AdminCouponsPage() {
  const [coupons,  setCoupons]  = useState<Coupon[]>(MOCK_COUPONS);
  const [creating, setCreating] = useState(false);
  const [newCode,  setNewCode]  = useState("");
  const [discount, setDiscount] = useState("");
  const [type,     setType]     = useState<"percent"|"fixed">("percent");
  const [plan,     setPlan]     = useState("all");
  const [maxUses,  setMaxUses]  = useState("100");
  const [expires,  setExpires]  = useState("");

  const handleCreate = () => {
    if (!newCode || !discount) { toast.error("Fill in code and discount"); return; }
    const c: Coupon = {
      id:         Date.now().toString(),
      code:       newCode.toUpperCase(),
      discount:   Number(discount),
      type,
      plan,
      uses:       0,
      max_uses:   Number(maxUses),
      expires_at: expires || null,
      active:     true,
    };
    setCoupons(p => [c, ...p]);
    setCreating(false);
    setNewCode(""); setDiscount(""); setMaxUses("100"); setExpires("");
    toast.success(`Coupon ${c.code} created!`);
  };

  const toggleActive = (id: string) => {
    setCoupons(p => p.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast("Coupon status updated", { icon: "✓" });
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Coupon Codes</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create and manage promotional discount codes</p>
          </div>
          <button onClick={() => setCreating(p => !p)} className="btn-primary">
            {creating ? "Cancel" : "+ Create Coupon"}
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className="card p-5 mb-5 border-2 border-teal-200 bg-teal-50">
            <h2 className="font-bold text-slate-800 mb-4">New Coupon</h2>
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="label">Code *</label>
                <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="input"
                  placeholder="SUMMER25"/>
              </div>
              <div>
                <label className="label">Discount *</label>
                <div className="flex gap-2">
                  <input value={discount} onChange={e => setDiscount(e.target.value)} type="number" className="input flex-1"
                    placeholder={type === "percent" ? "25" : "500"}/>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="input w-20 flex-shrink-0">
                    <option value="percent">%</option>
                    <option value="fixed">₹</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Applies to</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="input">
                  <option value="all">All plans</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="label">Max Uses</label>
                <input value={maxUses} onChange={e => setMaxUses(e.target.value)} type="number" className="input" placeholder="100"/>
              </div>
              <div>
                <label className="label">Expires (optional)</label>
                <input value={expires} onChange={e => setExpires(e.target.value)} type="date" className="input"/>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary">Create Coupon</button>
              <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {/* Coupon table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Code","Discount","Plan","Usage","Expires","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const usePct  = Math.round((c.uses / c.max_uses) * 100);
                  const expired = c.expires_at && new Date(c.expires_at) < new Date();
                  return (
                    <tr key={c.id} className={`border-b border-slate-100 transition-colors ${c.active ? "hover:bg-slate-50" : "opacity-50"}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">{c.code}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-600">
                        {c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`} off
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">{c.plan}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${usePct >= 90 ? "bg-red-500" : "bg-teal-500"}`}
                              style={{ width: `${usePct}%` }}/>
                          </div>
                          <span className="text-xs text-slate-500">{c.uses}/{c.max_uses}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {c.expires_at
                          ? <span className={expired ? "text-red-500 font-semibold" : ""}>{c.expires_at}</span>
                          : <span className="text-slate-400">No expiry</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-${c.active && !expired ? "green" : "red"} text-xs`}>
                          {!c.active ? "Disabled" : expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(c.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
