"use client";
import { SettingsPage } from "@/components/shared/SettingsPage";
import { ADMIN_NAV } from "../client";
export default function AdminSettingsPage() {
  return <SettingsPage role="admin" navItems={ADMIN_NAV}/>;
}
