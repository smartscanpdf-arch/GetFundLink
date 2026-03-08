"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Role = "founder" | "investor" | "partner";
type Step = 1 | 2 | 3;

const ROLES = [
  { id: "founder"  as Role, label: "Founder",          icon: "🚀", desc: "I'm building a startup and seeking funding",     color: "#1FA3A3" },
  { id: "investor" as Role, label: "Investor",          icon: "💼", desc: "I invest in early-stage Indian startups",        color: "#6366F1" },
  { id: "partner"  as Role, label: "Ecosystem Partner", icon: "🤝", desc: "I run events, accelerators, or programs",        color: "#F59E0B" },
];

function pwStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return { score: s, label: ["","Weak","Fair","Good","Strong"][s], color: ["transparent","#EF4444","#F59E0B","#1FA3A3","#10B981"][s] };
}

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [step,     setStep]     = useState<Step>(1);
  const [role,     setRole]     = useState<Role | "">("");
  const [name,     setName]     = useState("");
  const [org,      setOrg]      = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const pw = pwStrength(password);

  const handleCreate = async () => {
    if (!name || !email || !password) { toast.error("Please fill in all required fields"); return; }
    if (!email.includes("@"))          { toast.error("Invalid email address"); return; }
    if (password.length < 8)           { toast.error("Password must be at least 8 characters"); return; }
    if (!agreed)                       { toast.error("Please agree to the Terms of Service"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback`,
        data: { full_name: name, role, org_name: org, phone },
      },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    setStep(3);
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
    if (!role) { toast.error("Please select a role first"); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
        queryParams: { role },
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <Link href="/" className="text-white font-black text-xl tracking-tight">
            Fund<span className="text-teal-400">Link</span>
          </Link>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {[1,2,3].map(s => (
            <div key={s} className="w-6 h-1.5 rounded-full transition-all"
              style={{ background: step >= s ? "#1FA3A3" : "rgba(255,255,255,0.15)" }}/>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* STEP 1 — Role selection */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-white text-2xl font-black tracking-tight mb-2">Join FundLink</h1>
                <p className="text-white/45 text-sm">Choose your role to get started</p>
              </div>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className="w-full p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: role === r.id ? r.color : "rgba(255,255,255,0.1)",
                      background:  role === r.id ? `${r.color}15` : "rgba(255,255,255,0.04)",
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="font-bold text-white text-sm mb-0.5">{r.label}</div>
                        <div className="text-white/45 text-xs">{r.desc}</div>
                      </div>
                      {role === r.id && (
                        <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: r.color }}>
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => { if (!role) { toast.error("Please select a role"); return; } setStep(2); }}
                className="w-full mt-6 py-3 rounded-xl bg-teal-500 text-white font-bold text-sm
                           hover:bg-teal-600 transition-colors active:scale-[0.98]">
                Continue →
              </button>
              <p className="text-center mt-4 text-white/35 text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-400 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2 — Account details */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-white text-2xl font-black tracking-tight mb-1">Create your account</h1>
                <p className="text-white/45 text-sm">
                  Signing up as{" "}
                  <span className="font-bold text-teal-400">{ROLES.find(r => r.id === role)?.label}</span>
                </p>
              </div>

              {/* Social sign-up */}
              <div className="flex gap-2.5 mb-5">
                <button onClick={() => handleOAuth("google")}
                  className="flex-1 py-2.5 rounded-xl bg-white text-gray-800 text-xs font-bold
                             flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
                  <span className="font-black text-sm">G</span> Google
                </button>
                <button onClick={() => handleOAuth("linkedin_oidc")}
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold
                             flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ background: "#0A66C2" }}>
                  <span className="font-black text-sm leading-none">in</span> LinkedIn
                </button>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10"/>
                <span className="text-white/25 text-xs">or sign up with email</span>
                <div className="flex-1 h-px bg-white/10"/>
              </div>

              <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/10 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                               text-white text-sm placeholder-white/25 outline-none focus:border-teal-400 transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wide">
                    {role === "partner" ? "Organisation Name" : "Startup / Company Name"}
                  </label>
                  <input value={org} onChange={e => setOrg(e.target.value)}
                    placeholder={role === "founder" ? "GreenTech Solutions" : role === "partner" ? "NASSCOM Foundation" : "TechBridge Capital"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                               text-white text-sm placeholder-white/25 outline-none focus:border-teal-400 transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wide">Email Address *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                               text-white text-sm placeholder-white/25 outline-none focus:border-teal-400 transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wide">
                    Password * <span className="normal-case font-medium">(min. 8 characters)</span>
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                               text-white text-sm placeholder-white/25 outline-none focus:border-teal-400 transition-colors"/>
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{ background: pw.score >= i ? pw.color : "rgba(255,255,255,0.1)" }}/>
                        ))}
                      </div>
                      <span className="text-xs font-bold" style={{ color: pw.color }}>{pw.label}</span>
                    </div>
                  )}
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-teal-500"/>
                  <span className="text-white/45 text-xs leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-teal-400 hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/60 text-sm font-semibold
                               hover:bg-white/[0.06] transition-colors">
                    ← Back
                  </button>
                  <button onClick={handleCreate} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm
                               hover:bg-teal-600 disabled:opacity-60 transition-colors active:scale-[0.98]">
                    {loading ? "Creating…" : "Create Account →"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Verify email */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">📧</span>
              </div>
              <h1 className="text-white text-2xl font-black tracking-tight mb-2">Check your inbox</h1>
              <p className="text-white/45 text-sm leading-relaxed mb-6">
                We sent a verification link to <strong className="text-white">{email}</strong>.
                Click the link to activate your account.
              </p>
              <p className="text-white/25 text-xs">
                Didn't get it?{" "}
                <button onClick={() => supabase.auth.resend({ type: "signup", email }).then(() => toast.success("Resent!"))}
                  className="text-teal-400 hover:underline">
                  Resend email
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
