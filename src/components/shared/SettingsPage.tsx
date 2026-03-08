"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Input, Modal } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export function SettingsPage({ role, navItems }: { role: UserRole; navItems: { href:string; label:string; icon:React.ReactNode }[] }) {
  const { profile, signOut } = useAuth();
  const supabase = createClient();
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);

  const changePassword = async () => {
    if (!newPw || newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  return (
    <DashboardLayout navItems={navItems} role={role}>
      <div className="max-w-xl mx-auto px-4 py-8 pb-20 space-y-5">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Settings</h1>

        {/* Account info */}
        <Card className="p-5">
          <h2 className="font-bold text-slate-800 mb-4">Account</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-800">{profile?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="font-semibold text-slate-800 capitalize">{profile?.role}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-semibold text-slate-800 capitalize">{profile?.plan}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">KYC</span><span className="font-semibold text-slate-800 capitalize">{profile?.kyc_status}</span></div>
          </div>
        </Card>

        {/* Change password */}
        <Card className="p-5">
          <h2 className="font-bold text-slate-800 mb-4">Change Password</h2>
          <div className="space-y-3">
            <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••"/>
            <Input label="Confirm Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••"/>
            <Btn variant="primary" loading={saving} onClick={changePassword}>Update Password</Btn>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-5">
          <h2 className="font-bold text-slate-800 mb-4">Notifications</h2>
          <div className="space-y-3">
            {[
              { label: "Email — intro requests",    key: "email_intros" },
              { label: "Email — platform updates",  key: "email_updates" },
              { label: "Email — weekly digest",     key: "email_digest" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-700">{item.label}</span>
                <input type="checkbox" defaultChecked className="accent-teal-500"/>
              </label>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red-200">
          <h2 className="font-bold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-xs text-slate-500 mb-3">These actions are permanent and cannot be undone.</p>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={signOut}>Sign Out</Btn>
            <Btn variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete Account</Btn>
          </div>
        </Card>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          This will permanently delete your account, profile, and all associated data. This cannot be undone.
          Please contact <strong>support@fundlink.in</strong> to proceed with account deletion.
        </p>
        <Btn variant="secondary" full onClick={() => setDeleteOpen(false)}>Cancel</Btn>
      </Modal>
    </DashboardLayout>
  );
}
