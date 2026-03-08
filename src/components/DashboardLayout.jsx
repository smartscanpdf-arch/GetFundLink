import { useState } from "react";

export function DashboardLayout({ navigate, role, sidebarItems, bottomNavItems, children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(bottomNavItems?.[0]?.id || sidebarItems?.[0]?.id);

  const roleColors = {
    founder: "#1FA3A3",
    investor: "#3B82F6",
    partner: "#A855F7",
    admin: "#F59E0B",
  };
  const accent = roleColors[role] || "#1FA3A3";

  const notifications = [
    { id: 1, msg: "New intro request from Sequoia India", time: "2m ago", unread: true },
    { id: 2, msg: "Your profile was viewed by 12 investors", time: "1h ago", unread: true },
    { id: 3, msg: "Demo Day registration confirmed", time: "3h ago", unread: false },
  ];

  return (
    <div className="bg-[#0a1929] min-h-screen text-white flex flex-col">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B1C2D]/95 backdrop-blur border-b border-white/10 h-14 flex items-center px-4 gap-3">
        <button className="lg:hidden p-1.5 text-white/60 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="w-4 h-0.5 bg-current mb-1"></div>
          <div className="w-4 h-0.5 bg-current mb-1"></div>
          <div className="w-4 h-0.5 bg-current"></div>
        </button>
        <button onClick={() => navigate("landing")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: accent }}>F</div>
          <span className="font-bold text-sm hidden sm:block">FundLink</span>
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-[#132338] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 font-bold text-sm">Notifications</div>
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${n.unread ? "" : "opacity-60"}`}>
                  <div className="flex items-start gap-3">
                    {n.unread && <div className="w-2 h-2 rounded-full mt-1.5 flex-none" style={{ background: accent }}></div>}
                    {!n.unread && <div className="w-2 h-2 rounded-full mt-1.5 flex-none bg-transparent border border-white/20"></div>}
                    <div>
                      <div className="text-xs text-white/80">{n.msg}</div>
                      <div className="text-xs text-white/30 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 text-center">
                <button className="text-xs font-semibold" style={{ color: accent }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
          {role === "founder" ? "JD" : role === "investor" ? "RK" : role === "partner" ? "TS" : "SA"}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0B1C2D] border-r border-white/10 z-40 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} pt-14`}>
        <div className="p-4">
          <div className="bg-white/5 rounded-xl p-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${accent}30`, color: accent }}>
                {role === "founder" ? "JD" : role === "investor" ? "RK" : role === "partner" ? "TS" : "SA"}
              </div>
              <div>
                <div className="font-semibold text-sm">{role === "founder" ? "John Doe" : role === "investor" ? "Rahul Kumar" : role === "partner" ? "TechSpark" : "Super Admin"}</div>
                <div className="text-xs capitalize" style={{ color: accent }}>{role}</div>
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeNav === item.id ? "text-white font-semibold" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
                style={activeNav === item.id ? { background: `${accent}20`, color: accent } : {}}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">{item.badge}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={() => navigate("landing")} className="w-full text-white/40 text-xs text-left px-3 py-2 hover:text-white/60 transition-colors flex items-center gap-2">
            <span>←</span> Back to home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 sm:p-6">
          {/* Render active section */}
          {children({ activeNav, setActiveNav, accent })}
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
      {bottomNavItems && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1C2D] border-t border-white/10 flex lg:hidden z-30">
          {bottomNavItems.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${activeNav === item.id ? "" : "text-white/40"}`}
              style={activeNav === item.id ? { color: accent } : {}}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-[#132338] border border-white/10 rounded-2xl ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub, color = "#1FA3A3", icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-white/50 text-xs mb-2">{label}</div>
          <div className="text-2xl font-black" style={{ color }}>{value}</div>
          {sub && <div className="text-white/40 text-xs mt-1">{sub}</div>}
        </div>
        {icon && <div className="text-2xl opacity-50">{icon}</div>}
      </div>
    </Card>
  );
}

export function VerifiedBadge({ size = "sm" }) {
  const s = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-1 bg-[#1FA3A3]/15 text-[#1FA3A3] rounded-full font-semibold ${s}`}>
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0L7.5 2.5L10.5 2L10 5L12 6L10 7L10.5 10L7.5 9.5L6 12L4.5 9.5L1.5 10L2 7L0 6L2 5L1.5 2L4.5 2.5L6 0Z"/>
      </svg>
      Verified
    </span>
  );
}

export function SkeletonLoader({ lines = 3, className = "" }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className="h-3 bg-white/5 rounded-lg" style={{ width: `${60 + Math.random() * 30}%` }}></div>
        ))}
      </div>
    </Card>
  );
}

export function EmptyState({ icon, title, desc, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <div className="font-bold text-white/70 mb-2">{title}</div>
      <div className="text-white/40 text-sm mb-6 max-w-xs">{desc}</div>
      {action && <button onClick={onAction} className="bg-[#1FA3A3] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1a8e8e] transition-colors">{action}</button>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#132338] border border-white/10 rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
