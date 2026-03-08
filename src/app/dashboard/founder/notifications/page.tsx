"use client";
import { NotificationsPage } from "@/components/shared/NotificationsPage";

const NAV = [
  { href: "/dashboard/founder",              label: "Dashboard",     icon: <span>🏠</span> },
  { href: "/dashboard/founder/intros",       label: "Intros",        icon: <span>🤝</span> },
  { href: "/dashboard/founder/documents",    label: "Documents",     icon: <span>📂</span> },
  { href: "/dashboard/founder/messages",     label: "Messages",      icon: <span>💬</span> },
  { href: "/dashboard/founder/profile",      label: "Profile",       icon: <span>👤</span> },
  { href: "/dashboard/founder/kyc",          label: "KYC",           icon: <span>🪪</span> },
  { href: "/dashboard/founder/billing",      label: "Billing",       icon: <span>💳</span> },
  { href: "/dashboard/founder/notifications",label: "Notifications", icon: <span>🔔</span> },
  { href: "/dashboard/founder/settings",     label: "Settings",      icon: <span>⚙️</span> },
];

export default function FounderNotificationsPage() {
  return <NotificationsPage role="founder" navItems={NAV}/>;
}
