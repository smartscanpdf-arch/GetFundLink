"use client";
import { SettingsPage } from "@/components/shared/SettingsPage";
import { PARTNER_NAV } from "../client";
export default function PartnerSettingsPage() {
  return <SettingsPage role="partner" navItems={PARTNER_NAV}/>;
}
