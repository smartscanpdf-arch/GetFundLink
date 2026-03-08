"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);

  const handleReset = async () => {
    if (!password || !confirm)    { toast.error("Fill in both fields"); return; }
    if (password !== confirm)     { toast.error("Passwords don't match"); return; }
    if (password.length < 8)      { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-black mb-2">Set new password</h1>
          <p className="text-white/45 text-sm">Choose a strong password for your account</p>
        </div>
        <div className="bg-white/[0.04] rounded-2xl p-7 border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1.5">New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                         text-white text-sm placeholder-white/30 outline-none focus:border-teal-400 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 mb-1.5">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleReset()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                         text-white text-sm placeholder-white/30 outline-none focus:border-teal-400 transition-colors"/>
          </div>
          <button onClick={handleReset} disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold text-sm
                       hover:bg-teal-600 disabled:opacity-60 transition-colors">
            {loading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
