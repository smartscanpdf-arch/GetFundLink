"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Input, Textarea, Select } from "@/components/ui";
import { INVESTOR_NAV } from "../client";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SECTORS, STAGES, STAGE_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

export default function InvestorProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const router   = useRouter();
  const [saving, setSaving] = useState(false);
  const [firmName, setFirmName]   = useState("");
  const [title,    setTitle]      = useState("");
  const [thesis,   setThesis]     = useState("");
  const [ticketMin,setTicketMin]  = useState("");
  const [ticketMax,setTicketMax]  = useState("");
  const [fullName, setFullName]   = useState("");
  const [bio,      setBio]        = useState("");
  const [city,     setCity]       = useState("");
  const [linkedin, setLinkedin]   = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      (supabase.from("investor_profiles") as any).select("*").eq("user_id", user.id).single(),
      (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
    ]).then(([{ data: ip }, { data: p }]) => {
      if (ip) { setFirmName(ip.firm_name??""); setTitle(ip.title??""); setThesis(ip.investment_thesis??""); setTicketMin(ip.ticket_min?String(ip.ticket_min/100):""); setTicketMax(ip.ticket_max?String(ip.ticket_max/100):""); }
      if (p)  { setFullName(p.full_name??""); setBio(p.bio??""); setCity(p.city??""); setLinkedin(p.linkedin_url??""); }
    });
  }, [user?.id]);

  const save = async () => {
    setSaving(true);
    await Promise.all([
      (supabase.from("investor_profiles") as any).upsert({
        user_id: user!.id, firm_name: firmName, title, investment_thesis: thesis,
        ticket_min: ticketMin ? Math.round(parseFloat(ticketMin)*100) : null,
        ticket_max: ticketMax ? Math.round(parseFloat(ticketMax)*100) : null,
      }, { onConflict:"user_id" }),
      (supabase.from("profiles") as any).update({ full_name:fullName, bio, city, linkedin_url:linkedin }).eq("id", user!.id),
    ]);
    setSaving(false);
    toast.success("Profile saved!");
    router.push("/dashboard/investor");
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-slate-900">Investor Profile</h1>
          <Btn variant="primary" loading={saving} onClick={save}>Save</Btn>
        </div>
        <div className="space-y-5">
          <Card className="p-5 space-y-4">
            <div className="font-bold text-slate-700 text-sm">Fund / Firm</div>
            <Input label="Firm Name" value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="e.g. Accel Partners"/>
            <Input label="Your Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Partner, Principal, Angel"/>
            <Textarea label="Investment Thesis" value={thesis} onChange={e => setThesis(e.target.value)} rows={4}
              placeholder="What do you invest in? What stage, sector, geography?"/>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Ticket Size (₹)" type="number" value={ticketMin} onChange={e => setTicketMin(e.target.value)} placeholder="e.g. 2500000"/>
              <Input label="Max Ticket Size (₹)" type="number" value={ticketMax} onChange={e => setTicketMax(e.target.value)} placeholder="e.g. 25000000"/>
            </div>
          </Card>
          <Card className="p-5 space-y-4">
            <div className="font-bold text-slate-700 text-sm">Personal</div>
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}/>
            <Textarea label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Brief background…"/>
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai"/>
            <Input label="LinkedIn URL" type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…"/>
          </Card>
          <Btn variant="primary" full loading={saving} onClick={save}>Save Profile</Btn>
        </div>
      </div>
    </DashboardLayout>
  );
}
