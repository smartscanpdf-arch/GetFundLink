"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "../client";
import { Card, Btn, Badge, StatusPill, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export function AdminApprovalsClient({ docs: init }: { docs: any[] }) {
  const [docs, setDocs] = useState(init);
  const [acting, setActing] = useState<string|null>(null);

  const act = async (docId: string, status: "approved"|"rejected") => {
    setActing(docId);
    const res = await fetch("/api/kyc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, status }),
    });
    setActing(null);
    if (res.ok) {
      setDocs(p => p.filter(d => d.id !== docId));
      toast.success(`KYC ${status}`);
    } else toast.error("Action failed");
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">KYC Approvals</h1>
          <p className="text-sm text-slate-500">{docs.length} pending review</p>
        </div>
        {docs.length === 0
          ? <EmptyState icon="✅" title="All caught up!" body="No pending KYC documents."/>
          : (
            <div className="space-y-4">
              {docs.map(doc => {
                const u = doc.user as any;
                return (
                  <Card key={doc.id} className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar name={u?.full_name} size={40}/>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{u?.full_name ?? "Unknown"}</div>
                        <div className="text-xs text-slate-400">{u?.email}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge color={u?.role==="founder"?"teal":"indigo"}>{u?.role}</Badge>
                          <Badge color="amber">{doc.doc_type}</Badge>
                          <span className="text-xs text-slate-400">{timeAgo(doc.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                      <div className="text-xs text-slate-500 mb-1 font-semibold">Document: {doc.file_name}</div>
                      <div className="text-xs text-slate-400">File uploaded to secure storage. Click to view (requires admin access).</div>
                    </div>
                    <div className="flex gap-2">
                      <Btn variant="primary" loading={acting===doc.id} onClick={() => act(doc.id,"approved")}>✓ Approve</Btn>
                      <Btn variant="danger"  loading={acting===doc.id} onClick={() => act(doc.id,"rejected")}>✗ Reject</Btn>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        }
      </div>
    </DashboardLayout>
  );
}
