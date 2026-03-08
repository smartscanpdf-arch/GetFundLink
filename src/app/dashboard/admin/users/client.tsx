"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Badge, Btn, StatusPill, Modal, EmptyState } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export function AdminUsersClient({ users: init }: { users: any[] }) {
  const supabase  = createClient();
  const [users,   setUsers]   = useState(init);
  const [search,  setSearch]  = useState("");
  const [roleF,   setRoleF]   = useState("");
  const [kycF,    setKycF]    = useState("");
  const [detail,  setDetail]  = useState<any|null>(null);
  const [acting,  setActing]  = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const m = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
      return m && (!roleF || u.role === roleF) && (!kycF || u.kyc_status === kycF);
    });
  }, [users, search, roleF, kycF]);

  const updateKyc = async (userId: string, status: "approved"|"rejected") => {
    setActing(true);
    // Find any pending KYC doc for this user and update
    const { data: doc } = await supabase.from("kyc_documents").select("id").eq("user_id", userId).eq("status","pending").limit(1).single();
    if (doc) {
      await fetch("/api/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_id: doc.id, status }),
      });
    } else {
      // Direct profile update if no doc
      await supabase.from("profiles").update({ kyc_status: status, is_verified: status==="approved" }).eq("id", userId);
    }
    setUsers(p => p.map(u => u.id === userId ? { ...u, kyc_status: status, is_verified: status==="approved" } : u));
    if (detail?.id === userId) setDetail((p: any) => ({ ...p, kyc_status: status }));
    setActing(false);
    toast.success(`KYC ${status}`);
  };

  const ROLE_COLOR: Record<string, any> = { founder:"teal", investor:"indigo", partner:"amber", admin:"slate" };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-black text-slate-900">Users <span className="text-slate-400 font-normal text-base">({filtered.length})</span></h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="flex-1 min-w-48 px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 bg-white"/>
          <select value={roleF} onChange={e => setRoleF(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer focus:border-teal-400">
            <option value="">All Roles</option>
            {["founder","investor","partner","admin"].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <select value={kycF} onChange={e => setKycF(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer focus:border-teal-400">
            <option value="">All KYC</option>
            {["none","pending","approved","rejected"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" body="Try adjusting your search or filters."/>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Name","Role","KYC","Plan","Joined","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 truncate max-w-[140px]">{u.full_name ?? "—"}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge color={ROLE_COLOR[u.role]}>{u.role}</Badge></td>
                    <td className="px-4 py-3"><StatusPill status={u.kyc_status}/></td>
                    <td className="px-4 py-3"><Badge color={u.plan==="free"?"slate":u.plan==="pro"?"indigo":"teal"}>{u.plan}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Btn variant="ghost" size="sm" onClick={() => setDetail(u)}>View</Btn>
                        {u.kyc_status === "pending" && (
                          <>
                            <Btn variant="primary"   size="sm" loading={acting} onClick={() => updateKyc(u.id,"approved")}>✓</Btn>
                            <Btn variant="danger"    size="sm" loading={acting} onClick={() => updateKyc(u.id,"rejected")}>✗</Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* User detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="User Detail" wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["User ID", detail.id],
                ["Email", detail.email],
                ["Role", detail.role],
                ["KYC", detail.kyc_status],
                ["Plan", detail.plan],
                ["Verified", detail.is_verified ? "Yes" : "No"],
                ["City", detail.city ?? "—"],
                ["Joined", new Date(detail.created_at).toLocaleDateString("en-IN")],
              ].map(([k,v]) => (
                <div key={k as string}>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{k}</div>
                  <div className="text-sm font-semibold text-slate-800 truncate">{v}</div>
                </div>
              ))}
            </div>
            {detail.founder_profile && (
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Startup</div>
                <div className="text-sm font-bold text-slate-800">{(detail.founder_profile as any).startup_name}</div>
                <div className="text-xs text-slate-400">{(detail.founder_profile as any).sector} · {(detail.founder_profile as any).stage}</div>
              </div>
            )}
            {detail.kyc_status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Btn variant="primary" full loading={acting} onClick={() => updateKyc(detail.id,"approved")}>✓ Approve KYC</Btn>
                <Btn variant="danger"  full loading={acting} onClick={() => updateKyc(detail.id,"rejected")}>✗ Reject KYC</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
