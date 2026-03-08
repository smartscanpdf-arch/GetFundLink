"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Input, Textarea, Select } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { SECTORS, STAGES, STAGE_LABELS } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const FOUNDER_NAV = [
  { href: "/dashboard/founder",           label: "Dashboard", icon: <span>🏠</span> },
  { href: "/dashboard/founder/intros",    label: "Intros",    icon: <span>🤝</span> },
  { href: "/dashboard/founder/documents", label: "Documents", icon: <span>📂</span> },
  { href: "/dashboard/founder/messages",  label: "Messages",  icon: <span>💬</span> },
  { href: "/dashboard/founder/profile",   label: "Profile",   icon: <span>👤</span> },
  { href: "/dashboard/founder/kyc",       label: "KYC",       icon: <span>🪪</span> },
  { href: "/dashboard/founder/billing",   label: "Billing",   icon: <span>💳</span> },
  { href: "/dashboard/founder/settings",  label: "Settings",  icon: <span>⚙️</span> },
];

export default function FounderProfilePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const router   = useRouter();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"startup"|"personal">("startup");

  // Startup fields
  const [startupName,  setStartupName]  = useState("");
  const [tagline,      setTagline]      = useState("");
  const [sector,       setSector]       = useState("");
  const [stage,        setStage]        = useState("");
  const [askAmount,    setAskAmount]    = useState("");
  const [useOfFunds,   setUseOfFunds]   = useState("");
  const [mrr,          setMrr]          = useState("");
  const [teamSize,     setTeamSize]     = useState("");
  const [foundedYear,  setFoundedYear]  = useState("");
  const [website,      setWebsite]      = useState("");

  // Personal fields
  const [fullName,     setFullName]     = useState("");
  const [bio,          setBio]          = useState("");
  const [city,         setCity]         = useState("");
  const [linkedin,     setLinkedin]     = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from("founder_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]).then(([{ data: fp }, { data: p }]) => {
      if (fp) {
        setStartupName(fp.startup_name ?? "");
        setTagline(fp.tagline ?? "");
        setSector(fp.sector ?? "");
        setStage(fp.stage ?? "");
        setAskAmount(fp.ask_amount ? String(fp.ask_amount / 100) : "");
        setUseOfFunds(fp.use_of_funds ?? "");
        setMrr(fp.mrr ? String(fp.mrr / 100) : "");
        setTeamSize(fp.team_size ? String(fp.team_size) : "");
        setFoundedYear(fp.founded_year ? String(fp.founded_year) : "");
        setWebsite(fp.website ?? "");
      }
      if (p) {
        setFullName(p.full_name ?? "");
        setBio(p.bio ?? "");
        setCity(p.city ?? "");
        setLinkedin(p.linkedin_url ?? "");
      }
    });
  }, [user?.id]);

  const save = async () => {
    if (!startupName) { toast.error("Startup name is required"); return; }
    setSaving(true);
    const { error: fpErr } = await supabase.from("founder_profiles").upsert({
      user_id:      user!.id,
      startup_name: startupName,
      tagline,
      sector,
      stage,
      ask_amount:   askAmount   ? Math.round(parseFloat(askAmount) * 100)   : null,
      use_of_funds: useOfFunds,
      mrr:          mrr         ? Math.round(parseFloat(mrr) * 100)         : null,
      team_size:    teamSize    ? parseInt(teamSize)                         : null,
      founded_year: foundedYear ? parseInt(foundedYear)                     : null,
      website,
    }, { onConflict: "user_id" });

    const { error: pErr } = await supabase.from("profiles").update({
      full_name: fullName, bio, city, linkedin_url: linkedin,
    }).eq("id", user!.id);

    setSaving(false);
    if (fpErr || pErr) { toast.error("Save failed. Please try again."); return; }
    toast.success("Profile saved!");
    router.push("/dashboard/founder");
  };

  return (
    <DashboardLayout navItems={FOUNDER_NAV} role="founder">
      <div className="max-w-xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">This is what investors see when they browse startups</p>
          </div>
          <Btn variant="primary" loading={saving} onClick={save}>Save</Btn>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          {(["startup","personal"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all
                ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {t === "startup" ? "🚀 Startup" : "👤 Personal"}
            </button>
          ))}
        </div>

        {tab === "startup" && (
          <Card className="p-5 space-y-5">
            <Input label="Startup Name *" value={startupName} onChange={e => setStartupName(e.target.value)} placeholder="e.g. GreenTech Solutions"/>
            <Input label="One-line Tagline" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Helping farmers reduce water usage by 40%"/>
            <Select label="Sector" value={sector} onChange={e => setSector(e.target.value)}
              options={[{value:"",label:"Select sector…"}, ...SECTORS.map(s=>({value:s,label:s}))]}/>
            <Select label="Stage" value={stage} onChange={e => setStage(e.target.value)}
              options={[{value:"",label:"Select stage…"}, ...STAGES.map(s=>({value:s,label:STAGE_LABELS[s]??s}))]}/>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Funding Ask (₹)" type="number" value={askAmount} onChange={e => setAskAmount(e.target.value)} placeholder="e.g. 5000000"/>
              <Input label="Monthly Revenue (₹)" type="number" value={mrr} onChange={e => setMrr(e.target.value)} placeholder="e.g. 150000"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Team Size" type="number" value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="e.g. 8"/>
              <Input label="Founded Year" type="number" value={foundedYear} onChange={e => setFoundedYear(e.target.value)} placeholder="e.g. 2022"/>
            </div>
            <Input label="Website" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com"/>
            <Textarea label="Use of Funds" value={useOfFunds} onChange={e => setUseOfFunds(e.target.value)} rows={3}
              placeholder="How will you use this funding round?"/>
          </Card>
        )}

        {tab === "personal" && (
          <Card className="p-5 space-y-5">
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Priya Sharma"/>
            <Textarea label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Brief background — your experience, why you started this, what drives you"/>
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bangalore"/>
            <Input label="LinkedIn URL" type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname"/>
          </Card>
        )}

        <div className="mt-5">
          <Btn variant="primary" full loading={saving} onClick={save}>Save Profile</Btn>
        </div>
      </div>
    </DashboardLayout>
  );
}
