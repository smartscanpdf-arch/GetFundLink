"use client";
import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { FOUNDER_NAV } from "../client";
import toast from "react-hot-toast";

const PLANS = [
  {
    id: "starter", name: "Starter", price: 999, period: "/mo",
    color: "border-slate-200", badge: null,
    features: ["10 intro requests/month","25 saved startups","Basic profile analytics","Email support"],
  },
  {
    id: "pro", name: "Pro", price: 2499, period: "/mo",
    color: "border-teal-500", badge: "Most Popular",
    features: ["25 intro requests/month","Unlimited saved startups","Deal room access","Priority matching","Priority support"],
  },
  {
    id: "enterprise", name: "Enterprise", price: null, period: "",
    color: "border-indigo-300", badge: null,
    features: ["Unlimited intros","Dedicated manager","Custom events","API access","SLA support"],
  },
];

export default function FounderSubscriptionPage() {
  const { profile } = useAuth();
  const [billing,  setBilling]  = useState<"monthly"|"annual">("monthly");
  const [selected, setSelected] = useState(profile?.plan ?? "starter");
  const [loading,  setLoading]  = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === "enterprise") {
      window.open("mailto:hello@fundlink.in?subject=Enterprise Plan Inquiry", "_blank");
      return;
    }
    setLoading(true);
    toast("Redirecting to payment…");
    // TODO: Integrate Razorpay here
    // const res = await fetch("/api/subscription", { method:"POST", body: JSON.stringify({ plan: planId }) });
    // const { order } = await res.json();
    // Open Razorpay checkout with order
    setTimeout(() => setLoading(false), 1500);
  };

  const discount = billing === "annual" ? 0.8 : 1;

  return (
    <DashboardLayout navItems={FOUNDER_NAV} role="founder">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Choose your plan</h1>
          <p className="text-slate-500">Upgrade to unlock more intros, analytics, and visibility</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 mt-4 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                billing === "monthly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}>Monthly</button>
            <button onClick={() => setBilling("annual")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                billing === "annual" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}>
              Annual <span className="text-emerald-600 font-black ml-1">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const isCurrent = profile?.plan === plan.id;
            const price     = plan.price ? Math.round(plan.price * discount) : null;
            return (
              <div key={plan.id} className={`card p-6 flex flex-col relative border-2 ${plan.color}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-black px-3 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-black px-3 py-0.5 rounded-full">
                    Current
                  </div>
                )}
                <div className="mb-4">
                  <div className="font-black text-slate-900 text-lg mb-1">{plan.name}</div>
                  <div className="flex items-end gap-1">
                    {price
                      ? <><span className="text-3xl font-black text-slate-900">₹{price.toLocaleString("en-IN")}</span><span className="text-slate-400 text-sm mb-1">{plan.period}</span></>
                      : <span className="text-2xl font-black text-slate-900">Custom</span>
                    }
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.id === "pro"
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50"
                  }`}>
                  {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Us" : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-6 text-xs text-slate-400">
          Payments are processed securely via Razorpay. Cancel anytime from <Link href="/dashboard/founder/billing" className="text-teal-600 hover:underline">Billing</Link>.
        </p>
      </div>
    </DashboardLayout>
  );
}
