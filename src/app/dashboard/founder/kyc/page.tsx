"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge } from "@/components/ui";
import toast from "react-hot-toast";

const FOUNDER_NAV = [
  { href: "/dashboard/founder",            label: "Dashboard",  icon: "🏠" },
  { href: "/dashboard/founder/intros",     label: "Intros",     icon: "🤝" },
  { href: "/dashboard/founder/documents",  label: "Documents",  icon: "📂" },
  { href: "/dashboard/founder/messages",   label: "Messages",   icon: "💬" },
  { href: "/dashboard/founder/profile",    label: "Profile",    icon: "👤" },
  { href: "/dashboard/founder/kyc",        label: "KYC",        icon: "🪪" },
  { href: "/dashboard/founder/billing",    label: "Billing",    icon: "💳" },
  { href: "/dashboard/founder/settings",   label: "Settings",   icon: "⚙️" },
];

const DOC_TYPES = [
  { id: "aadhaar",     label: "Aadhaar Card",          desc: "Front + back, PDF or image",  icon: "🪪" },
  { id: "pan",         label: "PAN Card",               desc: "Clear scan, PDF or image",    icon: "📄" },
  { id: "company_reg", label: "Company Registration",   desc: "Certificate of incorporation", icon: "🏢" },
];

export default function KycPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Record<string, { file: File; status: "ready"|"uploading"|"done"|"error" }>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (docType: string, file: File) => {
    setUploads(p => ({ ...p, [docType]: { file, status: "ready" } }));
  };

  const handleSubmit = async () => {
    const ready = Object.entries(uploads).filter(([, v]) => v.status === "ready");
    if (ready.length === 0) { toast.error("Please upload at least one document"); return; }
    setSubmitting(true);

    for (const [docType, { file }] of ready) {
      setUploads(p => ({ ...p, [docType]: { ...p[docType], status: "uploading" } }));
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "kyc");
      fd.append("doc_type", docType);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      setUploads(p => ({ ...p, [docType]: { ...p[docType], status: res.ok ? "done" : "error" } }));
    }

    setSubmitting(false);
    toast.success("Documents submitted for review! We'll notify you within 1–3 business days.");
    setTimeout(() => router.push("/dashboard/founder"), 1500);
  };

  const allDone = Object.values(uploads).every(u => u.status === "done");

  return (
    <DashboardLayout navItems={FOUNDER_NAV.map(n => ({ ...n, icon: <span>{n.icon}</span> }))} role="founder">
      <div className="max-w-xl mx-auto px-4 py-8 pb-20">
        <div className="mb-6">
          <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1">Identity Verification (KYC)</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload your documents to get verified. Verification typically takes 1–3 business days.
            All documents are encrypted and stored securely.
          </p>
        </div>

        {/* Status banner */}
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 flex items-start gap-3 mb-6">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div>
            <div className="font-bold text-blue-900 text-sm mb-0.5">Bank-grade security</div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your documents are encrypted with AES-256 and only accessible to our compliance team.
              We never share documents with investors.
            </p>
          </div>
        </div>

        {/* Doc upload cards */}
        <div className="space-y-4 mb-6">
          {DOC_TYPES.map(doc => {
            const u = uploads[doc.id];
            return (
              <Card key={doc.id} className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{doc.label}</div>
                    <div className="text-xs text-slate-400">{doc.desc}</div>
                  </div>
                  {u && (
                    <div className="ml-auto">
                      {u.status === "done"      && <Badge color="green">✓ Uploaded</Badge>}
                      {u.status === "uploading" && <Badge color="teal">Uploading…</Badge>}
                      {u.status === "error"     && <Badge color="red">Failed</Badge>}
                      {u.status === "ready"     && <Badge color="slate">Ready</Badge>}
                    </div>
                  )}
                </div>
                <label className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm font-semibold
                  ${u ? "border-teal-300 bg-teal-50 text-teal-700" : "border-slate-200 hover:border-teal-300 text-slate-500 hover:text-teal-600"}`}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(doc.id, f); }}/>
                  {u ? `✓ ${u.file.name}` : "Click to upload or drag & drop"}
                </label>
              </Card>
            );
          })}
        </div>

        <Btn variant="primary" full loading={submitting} onClick={handleSubmit}
          className="mb-4">
          Submit for Review
        </Btn>
        <p className="text-center text-xs text-slate-400 leading-relaxed">
          By submitting, you confirm these documents are genuine. False submissions may result in account suspension.
        </p>
      </div>
    </DashboardLayout>
  );
}
