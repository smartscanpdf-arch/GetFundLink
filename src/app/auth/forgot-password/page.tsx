"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) { toast.error("Enter your email address"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <div className="px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">Fund<span className="text-teal-400">Link</span></span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">📧</span>
              </div>
              <h1 className="text-white text-2xl font-black mb-2">Check your inbox</h1>
              <p className="text-white/45 text-sm leading-relaxed mb-6">
                We sent a password reset link to <strong className="text-white">{email}</strong>.
              </p>
              <Link href="/auth/login" className="text-teal-400 text-sm font-semibold hover:underline">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-white text-2xl font-black mb-2">Reset your password</h1>
                <p className="text-white/45 text-sm">Enter your email and we'll send a reset link</p>
              </div>
              <div className="bg-white/[0.04] rounded-2xl p-7 border border-white/10 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                               text-white text-sm placeholder-white/30 outline-none focus:border-teal-400 transition-colors"/>
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold text-sm
                             hover:bg-teal-600 disabled:opacity-60 transition-colors">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </div>
              <p className="text-center mt-5 text-white/35 text-sm">
                <Link href="/auth/login" className="text-teal-400 font-semibold hover:underline">← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
