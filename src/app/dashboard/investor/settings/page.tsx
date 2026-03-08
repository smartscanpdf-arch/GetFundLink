"use client";
import { SettingsPage } from "@/components/shared/SettingsPage";
import { INVESTOR_NAV } from "../client";
export default function InvestorSettingsPage() {
  return <SettingsPage role="investor" navItems={INVESTOR_NAV}/>;
}
