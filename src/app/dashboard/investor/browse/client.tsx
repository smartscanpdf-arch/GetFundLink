"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge, Modal, Textarea, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { INVESTOR_NAV } from "../client";
import { formatINR, SECTORS, STAGES, STAGE_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function BrowseClient({ startups, savedIds: initialSaved, introMap: initialIntros, investorId }: {
  startups:   any[];
  savedIds:   Set<string>;
  introMap:   Record<string, string>;
  investorId: string;
}) {
  const supabase = createClient();
  const router   = useRouter();
  const [search,     setSearch]     = useState("");
  const [sector,     setSector]     = useState("");
  const [stage,      setStage]      = useState("");
  const [saved,      setSaved]      = useState<Set<string>>(initialSaved);
  const [intros,     setIntros]     = useState<Record<string,string>>(initialIntros);
  const [introModal, setIntroModal] = useState<any|null>(null);
  const [message,    setMessage]    = useState("");
  const [sending,    setSending]    = useState(false);

  const filtered = useMemo(() => {
    return startups.filter(s => {
      const q = search.toLowerCase();
      const match = !q || s.startup_name?.toLowerCase().includes(q) || s.tagline?.toLowerCase().includes(q) || s.sector?.toLowerCase().includes(q) || (s.profile as any)?.city?.toLowerCase().includes(q);
      const secMatch  = !sector || s.sector === sector;
      const stageMatch = !stage  || s.stage  === stage;
      return match && secMatch && stageMatch;
    });
  }, [startups, search, sector, stage]);

  const toggleSave = async (founderId: string) => {
    const isSaved = saved.has(founderId);
    setSaved(p => { const n = new Set(p); isSaved ? n.delete(founderId) : n.add(founderId); return n; });
    if (isSaved) {
      await supabase.from("saved_startups").delete().eq("investor_id", investorId).eq("founder_id", founderId);
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_startups").insert({ investor_id: investorId, founder_id: founderId });
      toast.success("Saved! ✓");
    }
  };

  const sendIntro = async () => {
    if (!introModal) return;
    setSending(true);
    const res = await fetch("/api/intros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ founder_id: introModal.profile.id, message }),
    });
    setSending(false);
    if (res.ok) {
      setIntros(p => ({ ...p, [introModal.profile.id]: "pending" }));
      toast.success("Intro request sent! 🚀");
      setIntroModal(null);
      setMessage("");
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Failed to send intro");
    }
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {/* Header + filters */}
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight mb-4">Browse Startups</h1>
          <div className="flex flex-wrap gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search startups, sectors, cities…"
              className="flex-1 min-w-48 px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 transition-colors bg-white"/>
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer focus:border-teal-400">
              <option value="">All Sectors</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer focus:border-teal-400">
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </div>
          {(search || sector || stage) && (
            <p className="text-xs text-slate-400 mt-2">{filtered.length} results</p>
          )}
        </div>

        {/* Startup cards */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No startups found" body="Try adjusting your filters." cta="Clear filters" onCta={() => { setSearch(""); setSector(""); setStage(""); }}/>
        ) : (
          <div className="space-y-4">
            {filtered.map(s => {
              const p = s.profile as any;
              const founderId   = p?.id;
              const isSaved     = saved.has(founderId);
              const introStatus = intros[founderId];

              return (
                <Card key={s.id} className="p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={s.startup_name ?? p?.full_name} size={44}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-black text-slate-900">{s.startup_name}</span>
                        {p?.is_verified && <Badge color="teal">✓ Verified</Badge>}
                        {s.sector && <Badge color="indigo">{s.sector}</Badge>}
                        {s.stage && <Badge color="slate">{STAGE_LABELS[s.stage] ?? s.stage}</Badge>}
                      </div>
                      <p className="text-sm text-slate-500">{s.tagline}</p>
                      {p?.city && <p className="text-xs text-slate-400 mt-0.5">📍 {p.city}</p>}
                    </div>
                    <button onClick={() => toggleSave(founderId)}
                      className={`p-2 rounded-xl border transition-all ${isSaved ? "border-teal-300 bg-teal-50 text-teal-600" : "border-slate-200 text-slate-400 hover:border-teal-300"}`}>
                      {isSaved ? "🔖" : "🔖"}
                    </button>
                  </div>

                  {/* Metrics row */}
                  <div className="flex gap-4 flex-wrap mb-4">
                    {s.ask_amount  && <div className="text-center"><div className="text-sm font-black text-slate-900">{formatINR(s.ask_amount, true)}</div><div className="text-[11px] text-slate-400">Raising</div></div>}
                    {s.mrr         && <div className="text-center"><div className="text-sm font-black text-slate-900">{formatINR(s.mrr, true)}</div><div className="text-[11px] text-slate-400">MRR</div></div>}
                    {s.team_size   && <div className="text-center"><div className="text-sm font-black text-slate-900">{s.team_size}</div><div className="text-[11px] text-slate-400">Team</div></div>}
                    {s.growth_rate && <div className="text-center"><div className="text-sm font-black text-emerald-600">{s.growth_rate}%</div><div className="text-[11px] text-slate-400">MoM Growth</div></div>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!introStatus ? (
                      <Btn variant="primary" size="sm" onClick={() => setIntroModal(s)}>Request Intro</Btn>
                    ) : (
                      <Badge color={introStatus==="accepted"?"green":introStatus==="pending"?"amber":"red"}>
                        {introStatus==="accepted"?"✓ Connected":introStatus==="pending"?"Intro Pending":"Declined"}
                      </Badge>
                    )}
                    <Btn variant="secondary" size="sm" onClick={() => toggleSave(founderId)}>
                      {isSaved ? "Unsave" : "Save"}
                    </Btn>
                    {s.deck_url && (
                      <Btn variant="ghost" size="sm">View Deck</Btn>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Intro modal */}
      <Modal open={!!introModal} onClose={() => setIntroModal(null)} title={`Request intro — ${introModal?.startup_name}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Your intro request will be reviewed by the FundLink team before being forwarded to the founder.
            Include a brief message about why you're interested.
          </p>
          <Textarea label="Message (optional)" value={message} onChange={e => setMessage(e.target.value)} rows={4}
            placeholder="e.g. I've been investing in AgriTech for 5 years and believe your approach to irrigation management is innovative. I'd love to learn more…"/>
          <div className="flex gap-2 pt-1">
            <Btn variant="secondary" full onClick={() => setIntroModal(null)}>Cancel</Btn>
            <Btn variant="primary"   full loading={sending} onClick={sendIntro}>Send Request</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
