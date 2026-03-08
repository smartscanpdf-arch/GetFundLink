"use client";
import Link from "next/link";
import { useState } from "react";

const STATS = [
  { value: "2,400+", label: "Verified Founders" },
  { value: "340+",   label: "Active Investors" },
  { value: "₹180Cr", label: "Capital Connected" },
  { value: "94%",    label: "Intro Accept Rate" },
];

const FEATURES = [
  { icon: "🛡", title: "Verified Profiles Only",       desc: "Every founder and investor goes through KYC. No fake profiles, no time-wasters." },
  { icon: "🤝", title: "Warm Introductions",            desc: "We facilitate every intro. Context is set, both sides are prepped. No cold outreach." },
  { icon: "📂", title: "Secure Data Room",              desc: "Share pitch decks and financials with access controls. Track who views what." },
  { icon: "🎯", title: "Sector-Matched Discovery",      desc: "Investors see startups in their thesis. Founders surface to the right people." },
  { icon: "📅", title: "Ecosystem Events",              desc: "Demo days, meet-ups, and summits run by vetted partners across India." },
  { icon: "⚡", title: "Fast-Track KYC",                desc: "Our team reviews documents within 1–3 business days. Start raising faster." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma",   role: "Founder, AgroLink",        text: "Closed our seed round in 6 weeks. Three of our investors came through FundLink intros.",   avatar: "PS" },
  { name: "Arjun Mehta",    role: "Partner, Kalaari Capital", text: "The quality of founders is genuinely higher. Everyone is pre-vetted and serious.",         avatar: "AM" },
  { name: "Sunita Krishnan", role: "Founder, HealthPath",     text: "The warm intro process is a game-changer. No ghosting, no cold emails into the void.",      avatar: "SK" },
];

const PRICING = [
  {
    name: "Starter", price: "₹999", period: "/mo", color: "border-slate-200",
    features: ["10 intro requests/month", "25 saved startups", "Basic analytics", "Email support"],
    cta: "Get Started", ctaStyle: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
  },
  {
    name: "Pro", price: "₹2,499", period: "/mo", color: "border-teal-500", badge: "Most Popular",
    features: ["25 intro requests/month", "Unlimited saved startups", "Deal room access", "Priority matching", "Priority support"],
    cta: "Start Free Trial", ctaStyle: "bg-teal-500 text-white hover:bg-teal-600",
  },
  {
    name: "Enterprise", price: "Custom", period: "", color: "border-slate-200",
    features: ["Unlimited intros", "Dedicated relationship manager", "Custom events", "API access", "SLA support"],
    cta: "Contact Us", ctaStyle: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
  },
];

function AvatarCircle({ initials, color }: { initials: string; color: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ background: color }}>{initials}</div>
  );
}

const COLORS = ["#1FA3A3","#6366F1","#F59E0B"];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">
              Fund<span className="text-teal-500">Link</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features"     className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How it works</a>
            <a href="#pricing"      className="hover:text-teal-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"  className="hidden md:block text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 70% 50%, rgba(31,163,163,0.3) 0%, transparent 60%)" }}/>
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-3 py-1.5 text-teal-400 text-xs font-bold mb-6">
              🇮🇳 India's most curated startup funding network
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              Raise your round with <span className="text-teal-400">warm intros</span>, not cold emails
            </h1>
            <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-xl">
              FundLink connects verified founders with serious investors through curated introductions. No noise. No gatekeeping. Just the right meetings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/signup?role=founder" className="btn-primary text-base px-6 py-3">
                I'm a Founder →
              </Link>
              <Link href="/auth/signup?role=investor"
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/10 transition-colors">
                I'm an Investor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-white/40 text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Everything you need to raise faster
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built for the Indian ecosystem. Designed to remove the friction from early-stage fundraising.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">How it works</h2>
            <p className="text-slate-500 text-lg">From signup to funded in four steps</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-black text-teal-600 mb-6">For Founders</h3>
              <div className="space-y-5">
                {[
                  { step:"01", title:"Create your profile",   desc:"Set up your startup profile with metrics, pitch deck, and team details." },
                  { step:"02", title:"Get verified (KYC)",    desc:"Submit identity + company documents. Our team reviews within 1–3 days." },
                  { step:"03", title:"Get matched",            desc:"Investors who match your sector and stage start seeing your profile." },
                  { step:"04", title:"Receive warm intros",    desc:"Accept or decline intro requests. We set context before every introduction." },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0">{s.step}</div>
                    <div>
                      <div className="font-bold text-slate-800 mb-0.5">{s.title}</div>
                      <div className="text-slate-500 text-sm leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-600 mb-6">For Investors</h3>
              <div className="space-y-5">
                {[
                  { step:"01", title:"Apply & get verified",    desc:"Tell us your thesis, sectors, and check size. We verify your identity." },
                  { step:"02", title:"Browse curated deal flow", desc:"Filter startups by sector, stage, and metrics. All founders are KYC-verified." },
                  { step:"03", title:"Request introductions",    desc:"Send a personalized message. Our team facilitates the warm introduction." },
                  { step:"04", title:"Access the data room",     desc:"Approved investors can access pitch decks, financials, and cap tables." },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0">{s.step}</div>
                    <div>
                      <div className="font-bold text-slate-800 mb-0.5">{s.title}</div>
                      <div className="text-slate-500 text-sm leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight mb-12">What our community says</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <AvatarCircle initials={t.avatar} color={COLORS[i]}/>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 ${p.color} p-7 flex flex-col relative`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-black px-3 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div className="mb-5">
                  <div className="font-black text-slate-800 text-lg mb-2">{p.name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{p.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="text-teal-500 font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center py-2.5 rounded-xl text-sm font-bold transition-colors ${p.ctaStyle}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background:"radial-gradient(circle at 30% 50%, rgba(31,163,163,0.4) 0%, transparent 60%)" }}/>
        <div className="max-w-2xl mx-auto text-center px-4 relative">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to raise your round?
          </h2>
          <p className="text-white/45 text-lg mb-8">
            Join 2,400+ founders and 340+ investors on India's most trusted funding network.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/signup?role=founder" className="btn-primary text-base px-7 py-3">
              Start as Founder →
            </Link>
            <Link href="/auth/signup?role=investor"
              className="px-7 py-3 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/10 transition-colors">
              Join as Investor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white/40 text-sm py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">F</span>
            </div>
            <span className="font-bold text-white/60">FundLink</span>
            <span>· India's startup funding network</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <a href="mailto:hello@fundlink.in" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
          <div>© {new Date().getFullYear()} FundLink. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
