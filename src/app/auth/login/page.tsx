"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") ?? "/dashboard/founder";
  const supabase     = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<"founder"|"investor"|"partner"|"admin">("founder");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Get actual role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single<{ role: string }>();

    toast.success("Welcome back!");
    router.push(`/dashboard/${profile?.role ?? role}`);
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
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
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
          <span className="text-white font-black text-sm">F</span>
        </div>
        <Link href="/" className="text-white font-black text-xl tracking-tight">
          Fund<span className="text-teal-400">Link</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-black tracking-tight mb-2">Welcome back</h1>
            <p className="text-white/45 text-sm">Sign in to your FundLink account</p>
          </div>

          <div className="bg-white/[0.04] rounded-2xl p-7 border border-white/10 space-y-4">
            {/* Email / Password */}
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                           text-white text-sm placeholder-white/30 outline-none
                           focus:border-teal-400 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleLogin()}/>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-white/60">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-teal-400 font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.07]
                           text-white text-sm placeholder-white/30 outline-none
                           focus:border-teal-400 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleLogin()}/>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-white/55 mb-2">Sign in as</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["founder","investor","partner","admin"] as const).map(r => {
                  const colors: Record<string, string> = {
                    founder:"#1FA3A3", investor:"#6366F1", partner:"#F59E0B", admin:"#94A3B8"
                  };
                  const c = colors[r];
                  return (
                    <button key={r} onClick={() => setRole(r)}
                      className="py-2 rounded-lg text-xs font-bold capitalize transition-all"
                      style={{
                        border:     `1.5px solid ${role === r ? c : "rgba(255,255,255,0.1)"}`,
                        background: role === r ? `${c}20` : "rgba(255,255,255,0.04)",
                        color:      role === r ? c : "rgba(255,255,255,0.38)",
                      }}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold text-sm
                         hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors active:scale-[0.98]">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10"/>
            <span className="text-white/25 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10"/>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => handleOAuth("google")}
              className="flex-1 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-bold
                         flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="font-black">G</span> Google
            </button>
            <button onClick={() => handleOAuth("linkedin_oidc")}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold
                         flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "#0A66C2" }}>
              <span className="font-black text-base leading-none">in</span> LinkedIn
            </button>
          </div>

          <p className="text-center mt-5 text-white/35 text-sm">
            No account?{" "}
            <Link href="/auth/signup" className="text-teal-400 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
