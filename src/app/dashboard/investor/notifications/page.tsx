"use client";
import { NotificationsPage } from "@/components/shared/NotificationsPage";
import { INVESTOR_NAV } from "../client";
export default function InvestorNotificationsPage() {
  return <NotificationsPage role="investor" navItems={INVESTOR_NAV}/>;
}
