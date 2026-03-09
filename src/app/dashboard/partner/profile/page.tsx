"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { PARTNER_NAV } from "../client";
import toast from "react-hot-toast";
import { SECTORS } from "@/lib/utils";

export default function PartnerProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [orgName,  setOrgName]  = useState("");
  const [orgType,  setOrgType]  = useState("");
  const [desc,     setDesc]     = useState("");
  const [website,  setWebsite]  = useState("");
  const [focuses,  setFocuses]  = useState<string[]>([]);
  const [bio,      setBio]      = useState("");
  const [city,     setCity]     = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      (supabase.from("partner_profiles") as any).select("*").eq("user_id", user.id).single(),
    ]).then(([{ data: pp }]) => {
      if (pp) {
        setOrgName(pp.org_name ?? "");
        setOrgType(pp.org_type ?? "");
        setDesc(pp.description ?? "");
        setWebsite(pp.website ?? "");
        setFocuses(pp.focus_areas ?? []);
      }
      if (profile) {
        setBio(profile.bio ?? "");
        setCity(profile.city ?? "");
        setLinkedin(profile.linkedin_url ?? "");
      }
      setLoading(false);
    });
  }, [user, profile]);

  const toggleFocus = (s: string) =>
    setFocuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const [r1, r2] = await Promise.all([
      (supabase.from("partner_profiles") as any).upsert({
        user_id: user.id, org_name: orgName, org_type: orgType,
        description: desc, website, focus_areas: focuses,
      }, { onConflict: "user_id" }),
      (supabase.from("profiles") as any).update({
        bio, city, linkedin_url: linkedin, full_name: profile?.full_name,
      }).eq("id", user.id),
    ]);
    setSaving(false);
    if (r1.error || r2.error) { toast.error("Save failed"); return; }
    toast.success("Profile saved!");
    refreshProfile();
  };

  if (loading) return (
    <DashboardLayout navItems={PARTNER_NAV} role="partner">
      <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="card p-6 h-24 bg-slate-100"/>)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={PARTNER_NAV} role="partner">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Partner Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your organisation's presence on FundLink</p>
        </div>

        {/* Organisation details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800">Organisation</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">Organisation Name *</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} className="input" placeholder="NASSCOM Foundation"/>
            </div>
            <div>
              <label className="label">Type</label>
              <select value={orgType} onChange={e => setOrgType(e.target.value)} className="input">
                <option value="">Select type</option>
                {["Accelerator","Incubator","VC Fund","Corporate","NGO","Government","Other"].map(t => (
                  <option key={t} value={t.toLowerCase().replace(" ","_")}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="input resize-none"
              placeholder="Tell founders and investors about your organisation..."/>
          </div>
          <div>
            <label className="label">Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} className="input" placeholder="https://yourorg.com"/>
          </div>
        </div>

        {/* Focus areas */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-3">Focus Areas</h2>
          <p className="text-xs text-slate-500 mb-3">Select the sectors your organisation works with</p>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(s => (
              <button key={s} onClick={() => toggleFocus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  focuses.includes(s)
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Personal details */}
        <div className="card p-6 space-y-3">
          <h2 className="font-bold text-slate-800">Your Details</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="input" placeholder="Bangalore"/>
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="input" placeholder="https://linkedin.com/in/yourname"/>
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="input resize-none"
              placeholder="Brief bio about yourself..."/>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-3">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </DashboardLayout>
  );
}
