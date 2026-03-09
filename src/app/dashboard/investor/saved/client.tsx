"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Badge, Btn, EmptyState, Modal, Textarea } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { INVESTOR_NAV } from "../client";
import { formatINR, STAGE_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function SavedClient({ saved: initialSaved, investorId }: { saved: any[]; investorId: string }) {
  const supabase    = createClient();
  const router      = useRouter();
  const [items,     setItems]     = useState(initialSaved);
  const [introModal,setIntroModal]= useState<any|null>(null);
  const [message,   setMessage]   = useState("");
  const [sending,   setSending]   = useState(false);

  const unsave = async (founderId: string) => {
    await (supabase.from("saved_startups") as any).delete().eq("investor_id", investorId).eq("founder_id", founderId);
    setItems(p => p.filter(s => s.founder_id !== founderId));
    toast.success("Removed from saved");
  };

  const sendIntro = async () => {
    if (!introModal) return;
    setSending(true);
    const res = await fetch("/api/intros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ founder_id: introModal.founder.id, message }),
    });
    setSending(false);
    if (res.ok) { toast.success("Intro sent! 🚀"); setIntroModal(null); setMessage(""); }
    else toast.error("Failed to send intro");
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Saved Startups</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} saved</p>
        </div>

        {items.length === 0 ? (
          <EmptyState icon="🔖" title="Nothing saved yet" body="Bookmark startups while browsing and they'll appear here." cta="Browse Startups" href="/dashboard/investor/browse"/>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const f  = item.founder as any;
              const fp = f?.founder_profile as any;
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={fp?.startup_name ?? f?.full_name} size={40}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">{fp?.startup_name}</span>
                        {f?.is_verified && <Badge color="teal">✓</Badge>}
                        {fp?.sector && <Badge color="indigo">{fp.sector}</Badge>}
                        {fp?.stage && <Badge color="slate">{STAGE_LABELS[fp.stage]??fp.stage}</Badge>}
                      </div>
                      {fp?.tagline && <p className="text-xs text-slate-500 mb-2">{fp.tagline}</p>}
                      <div className="flex gap-3 text-xs text-slate-400">
                        {fp?.ask_amount && <span>{formatINR(fp.ask_amount, true)} raising</span>}
                        {fp?.mrr       && <span>{formatINR(fp.mrr, true)} MRR</span>}
                        {f?.city       && <span>📍 {f.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Btn variant="primary"   size="sm" onClick={() => setIntroModal(item)}>Request Intro</Btn>
                    <Btn variant="secondary" size="sm" onClick={() => unsave(f?.id)}>Remove</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!introModal} onClose={() => setIntroModal(null)} title="Request Introduction">
        <div className="space-y-4">
          <Textarea label="Message (optional)" value={message} onChange={e => setMessage(e.target.value)} rows={4}
            placeholder="Why are you interested in this startup?"/>
          <div className="flex gap-2">
            <Btn variant="secondary" full onClick={() => setIntroModal(null)}>Cancel</Btn>
            <Btn variant="primary"   full loading={sending} onClick={sendIntro}>Send Request</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
