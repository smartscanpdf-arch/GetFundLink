"use client";
import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge, Modal, StatusPill } from "@/components/ui";
import { formatINR } from "@/lib/utils";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

const PLAN_FEATURES: Record<string, { price: string; features: string[] }> = {
  free:       { price:"₹0/mo",    features:["3 intro requests/mo","10 saved startups","Basic profile","Email support"] },
  starter:    { price:"₹999/mo",  features:["10 intro requests/mo","25 saved startups","Verified badge","Priority support","Data room access"] },
  pro:        { price:"₹2,499/mo",features:["25 intro requests/mo","100 saved startups","Analytics dashboard","Dedicated account manager","API access"] },
  enterprise: { price:"Custom",   features:["Unlimited intros","Unlimited saved","Custom integrations","SLA guarantee","Onboarding support"] },
};

interface Props {
  profile:      any;
  subscription: any;
  invoices:     any[];
  role?:        UserRole;
  navItems?:    { href:string; label:string; icon:React.ReactNode }[];
}

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

export function BillingClient({ profile, subscription, invoices, role="founder", navItems=FOUNDER_NAV }: Props) {
  const plan = profile?.plan ?? "free";
  const pf   = PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;
  const [cancelOpen,  setCancelOpen]  = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <DashboardLayout navItems={navItems} role={role}>
      <div className="max-w-xl mx-auto px-4 py-8 pb-20 space-y-5">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Billing</h1>

        {/* Current plan */}
        <Card className="p-5 bg-navy border-0 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-wide mb-1">Current Plan</div>
              <div className="text-2xl font-black capitalize tracking-tight">{plan}</div>
              <div className="text-teal-400 font-bold text-lg mt-0.5">{pf.price}</div>
            </div>
            <Badge color={plan==="free"?"slate":plan==="pro"?"indigo":"teal"}>{plan}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {pf.features.map(f => (
              <div key={f} className="text-xs text-white/60 flex items-center gap-1.5">
                <span className="text-teal-400 text-xs">✓</span> {f}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {plan === "free"
              ? <Btn variant="primary" size="sm" onClick={() => setUpgradeOpen(true)}>Upgrade Plan</Btn>
              : <Btn variant="secondary" size="sm" onClick={() => setCancelOpen(true)}>Cancel Subscription</Btn>
            }
          </div>
        </Card>

        {/* Subscription status */}
        {subscription && (
          <Card className="p-5">
            <div className="font-bold text-slate-800 text-sm mb-3">Subscription Details</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusPill status={subscription.status ?? "active"}/></div>
              {subscription.current_period_end && (
                <div className="flex justify-between"><span className="text-slate-500">Next billing</span><span className="font-semibold">{new Date(subscription.current_period_end).toLocaleDateString("en-IN")}</span></div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Your subscription is cancelled and will expire on {new Date(subscription.current_period_end).toLocaleDateString("en-IN")}.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Invoice history */}
        {invoices.length > 0 && (
          <Card className="p-5">
            <div className="font-bold text-slate-800 text-sm mb-4">Invoice History</div>
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 text-sm capitalize">{inv.plan_name ?? plan}</div>
                    <div className="text-xs text-slate-400">{new Date(inv.created_at).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                  <div className="font-bold text-slate-900">{formatINR(inv.amount, true)}</div>
                  <Badge color="green">Paid</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {plan === "free" && (
          <Card className="p-5 border-teal-200 bg-teal-50/40">
            <div className="font-bold text-teal-900 mb-2">Unlock more with Pro</div>
            <p className="text-xs text-teal-700 leading-relaxed mb-3">Get 25 intro requests/month, analytics, and a dedicated account manager.</p>
            <Btn variant="primary" size="sm" onClick={() => setUpgradeOpen(true)}>View Plans →</Btn>
          </Card>
        )}
      </div>

      {/* Upgrade modal */}
      <Modal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title="Choose a Plan" wide>
        <div className="grid grid-cols-3 gap-3">
          {(["starter","pro","enterprise"] as const).map(p => {
            const pf2 = PLAN_FEATURES[p];
            return (
              <div key={p} className={`p-4 rounded-2xl border-2 ${p==="pro"?"border-teal-500 bg-teal-50":"border-slate-200"}`}>
                <div className="font-black text-slate-900 capitalize text-lg mb-0.5">{p}</div>
                <div className="text-teal-600 font-bold mb-3">{pf2.price}</div>
                <div className="space-y-1 mb-4">
                  {pf2.features.slice(0,3).map(f => <div key={f} className="text-xs text-slate-600">✓ {f}</div>)}
                </div>
                <Btn variant={p==="pro"?"primary":"secondary"} full size="sm"
                  onClick={() => { toast.success("Razorpay integration coming soon!"); setUpgradeOpen(false); }}>
                  {p==="enterprise"?"Contact Sales":"Choose "+p.charAt(0).toUpperCase()+p.slice(1)}
                </Btn>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center text-slate-400 mt-4">Payments powered by Razorpay. Cancel anytime.</p>
      </Modal>

      {/* Cancel modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Subscription">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Your subscription will remain active until the end of the billing period. After that, your account will revert to the free plan and intro requests will be paused.
        </p>
        <div className="flex gap-2">
          <Btn variant="secondary" full onClick={() => setCancelOpen(false)}>Keep Subscription</Btn>
          <Btn variant="danger"    full onClick={() => { toast.success("Cancellation scheduled"); setCancelOpen(false); }}>Confirm Cancellation</Btn>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
