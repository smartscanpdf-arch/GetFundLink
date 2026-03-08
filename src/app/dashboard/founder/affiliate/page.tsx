"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { FOUNDER_NAV } from "../client";
import { formatINR, generateReferralCode } from "@/lib/utils";
import toast from "react-hot-toast";

const TIERS = [
  { name: "Starter",  refs: "1–4",   commission: "₹200/referral",  badge: "🌱" },
  { name: "Growth",   refs: "5–14",  commission: "₹350/referral",  badge: "🚀" },
  { name: "Champion", refs: "15+",   commission: "₹500/referral",  badge: "🏆" },
];

export default function FounderAffiliatePage() {
  const { user, profile } = useAuth();
  const [referrals,  setReferrals]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [copied,     setCopied]     = useState(false);

  const code    = user ? generateReferralCode(user.id) : "FL-XXXXXXXX";
  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/signup?ref=${code}`;

  useEffect(() => {
    if (!user) return;
    fetch("/api/referrals")
      .then(r => r.json())
      .then(d => { setReferrals(d.referrals ?? []); setLoading(false); });
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const signedUp    = referrals.filter(r => r.referred_id).length;
  const pending     = referrals.filter(r => !r.referred_id).length;
  const totalEarned = referrals.reduce((a, r) => a + (r.commission ?? 0), 0);
  const paidOut     = referrals.filter(r => r.paid_out).reduce((a, r) => a + (r.commission ?? 0), 0);

  const currentTier = signedUp >= 15 ? TIERS[2] : signedUp >= 5 ? TIERS[1] : TIERS[0];

  return (
    <DashboardLayout navItems={FOUNDER_NAV} role="founder">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Affiliate Program</h1>
          <p className="text-sm text-slate-500 mt-0.5">Earn cash for every founder or investor you refer</p>
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Earned", value: formatINR(totalEarned), color: "text-teal-600" },
            { label: "Paid Out",     value: formatINR(paidOut),     color: "text-emerald-600" },
            { label: "Pending",      value: formatINR(totalEarned - paidOut), color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`text-xl font-black tracking-tight ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Current tier */}
        <div className="card p-5 border-2 border-teal-200 bg-teal-50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentTier.badge}</span>
            <div>
              <div className="font-black text-slate-800">{currentTier.name} Tier</div>
              <div className="text-xs text-slate-500">{signedUp} successful referrals</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-bold text-teal-600">{currentTier.commission}</div>
              <div className="text-xs text-slate-500">your rate</div>
            </div>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min((signedUp / 15) * 100, 100)}%` }}/>
          </div>
          <div className="text-xs text-slate-500 mt-1">{15 - signedUp > 0 ? `${15 - signedUp} more to reach Champion tier` : "Champion tier reached! 🏆"}</div>
        </div>

        {/* Your referral link */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 mb-3">Your Referral Link</h2>
          <div className="flex gap-2">
            <input readOnly value={refLink}
              className="input flex-1 text-xs text-slate-500 bg-slate-50 cursor-default"/>
            <button onClick={copyLink}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${
                copied ? "bg-emerald-500 text-white" : "bg-teal-500 text-white hover:bg-teal-600"
              }`}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Share with founders or investors. Earn when they sign up and become active members.
          </p>
        </div>

        {/* Tier breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 mb-3">Commission Tiers</h2>
          <div className="space-y-2.5">
            {TIERS.map(t => (
              <div key={t.name} className={`flex items-center gap-3 p-3 rounded-xl ${
                currentTier.name === t.name ? "bg-teal-50 border border-teal-200" : "bg-slate-50"
              }`}>
                <span className="text-xl">{t.badge}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.refs} referrals</div>
                </div>
                <div className="font-bold text-teal-600 text-sm">{t.commission}</div>
                {currentTier.name === t.name && (
                  <span className="badge-teal text-xs">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Referral list */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">Your Referrals</h2>
            <span className="badge-slate">{referrals.length} total</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">📤</div>
              <div className="text-sm">No referrals yet. Share your link to get started!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{r.referred_email}</div>
                    <div className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.referred_id
                      ? <span className="badge-green text-xs">Signed up</span>
                      : <span className="badge-amber text-xs">Invited</span>
                    }
                    {r.commission > 0 && (
                      <span className={`text-xs font-bold ${r.paid_out ? "text-emerald-600" : "text-amber-600"}`}>
                        {formatINR(r.commission)} {r.paid_out ? "✓" : "pending"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
