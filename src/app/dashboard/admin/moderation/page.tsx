"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, EmptyState } from "@/components/ui";
import { ADMIN_NAV } from "../client";

export default function AdminModerationPage() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-xl font-black text-slate-900 mb-5">Moderation</h1>
        <Card className="p-5">
          <div className="font-bold text-slate-800 mb-2">Report Queue</div>
          <p className="text-sm text-slate-500 mb-4">User-reported profiles and content appear here for review.</p>
          <EmptyState icon="🛡️" title="No active reports" body="All user reports have been reviewed. Reports come in when users flag profiles, messages, or content."/>
        </Card>
      </div>
    </DashboardLayout>
  );
}
