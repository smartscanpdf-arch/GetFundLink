"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavItem {
  href:   string;
  label:  string;
  icon:   React.ReactNode;
  badge?: number | string;
}

interface DashboardLayoutProps {
  children:   React.ReactNode;
  navItems:   NavItem[];
  role:       UserRole;
  title?:     string;
}

export function DashboardLayout({ children, navItems, role, title }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const ROLE_COLORS: Record<UserRole, string> = {
    founder:  "bg-teal-500",
    investor: "bg-indigo-500",
    partner:  "bg-amber-500",
    admin:    "bg-slate-600",
  };

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [profile?.id]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col",
        "transform transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", ROLE_COLORS[role])}>
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              Fund<span className="text-teal-400">Link</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  active
                    ? "bg-teal-500/15 text-teal-400"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                )}>
                <span className={cn("flex-shrink-0", active ? "text-teal-400" : "text-white/40")}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className="bg-teal-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={profile?.full_name} src={profile?.avatar_url} size={36}/>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-bold truncate">{profile?.full_name ?? "User"}</div>
              <div className="text-white/35 text-[11px] capitalize">{role}</div>
            </div>
          </div>
          <button onClick={signOut}
            className="w-full mt-1 px-3 py-2 rounded-lg text-white/35 text-xs font-semibold
                       hover:bg-white/[0.06] hover:text-white/60 transition-colors text-left">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <MenuIcon/>
          </button>

          <div className="flex-1 text-slate-800 font-bold text-base truncate">
            {title ?? navItems.find(n => pathname.startsWith(n.href))?.label ?? "Dashboard"}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button onClick={() => router.push(`/dashboard/${role}/search`)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-500 transition-colors">
              <SearchIcon/>
            </button>

            {/* Notifications */}
            <button onClick={() => router.push(`/dashboard/${role}/notifications`)}
              className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-500 transition-colors">
              <BellIcon/>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"/>
              )}
            </button>

            {/* Help */}
            <button onClick={() => router.push(`/dashboard/${role}/support`)}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 font-bold text-sm
                         hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              ?
            </button>

            <Avatar name={profile?.full_name} src={profile?.avatar_url} size={32}/>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Inline icons (no extra dep needed) ──────────────────────────────────────
const MenuIcon   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const SearchIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const BellIcon   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
