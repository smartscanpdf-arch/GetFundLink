// src/app/dashboard/founder/settings/page.tsx
"use client";
import { SettingsPage } from "@/components/shared/SettingsPage";
const NAV = [
  { href: "/dashboard/founder",           label: "Dashboard", icon: <span>🏠</span> },
  { href: "/dashboard/founder/intros",    label: "Intros",    icon: <span>🤝</span> },
  { href: "/dashboard/founder/documents", label: "Documents", icon: <span>📂</span> },
  { href: "/dashboard/founder/messages",  label: "Messages",  icon: <span>💬</span> },
  { href: "/dashboard/founder/profile",   label: "Profile",   icon: <span>👤</span> },
  { href: "/dashboard/founder/kyc",       label: "KYC",       icon: <span>🪪</span> },
  { href: "/dashboard/founder/billing",   label: "Billing",   icon: <span>💳</span> },
  { href: "/dashboard/founder/settings",  label: "Settings",  icon: <span>⚙️</span> },
];
export default function FounderSettingsPage() { return <SettingsPage role="founder" navItems={NAV}/>; }
