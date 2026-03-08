"use client";
import { NotificationsPage } from "@/components/shared/NotificationsPage";
import { PARTNER_NAV } from "../client";
export default function PartnerNotificationsPage() {
  return <NotificationsPage role="partner" navItems={PARTNER_NAV}/>;
}
