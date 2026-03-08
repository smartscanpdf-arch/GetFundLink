"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Textarea } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import toast from "react-hot-toast";

const TEMPLATES = [
  { id:"welcome",      name:"Welcome Email",           desc:"Sent when a new user signs up",          subject:"Welcome to FundLink, {{name}}!" },
  { id:"intro_req",    name:"Intro Request",            desc:"Sent to founders when investor requests", subject:"{{investor}} wants to connect with you" },
  { id:"intro_accept", name:"Intro Accepted",           desc:"Sent to investor when founder accepts",   subject:"{{founder}} accepted your intro request!" },
  { id:"kyc_approved", name:"KYC Approved",             desc:"Sent when identity is verified",          subject:"Your FundLink KYC verification was approved ✅" },
  { id:"kyc_rejected", name:"KYC Rejected",             desc:"Sent when documents are rejected",        subject:"Your FundLink KYC needs attention" },
  { id:"support_reply",name:"Support Reply",            desc:"Sent when admin replies to a ticket",     subject:"Re: [{{ticket_id}}] {{subject}}" },
  { id:"password_reset",name:"Password Reset",          desc:"Sent for password reset requests",        subject:"Reset your FundLink password" },
];

export default function AdminEmailTemplatesPage() {
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [subject,  setSubject]  = useState(TEMPLATES[0].subject);
  const [preview,  setPreview]  = useState(false);

  const select = (t: typeof TEMPLATES[0]) => { setSelected(t); setSubject(t.subject); setPreview(false); };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500">Transactional emails sent by FundLink. Edit via src/lib/email/index.ts</p>
        </div>

        <div className="flex gap-4">
          {/* Template list */}
          <div className="w-56 flex-shrink-0 space-y-1.5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => select(t)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm transition-all ${selected.id===t.id?"bg-teal-50 border border-teal-200 font-bold text-teal-800":"text-slate-600 hover:bg-slate-100"}`}>
                {t.name}
              </button>
            ))}
          </div>

          {/* Template editor */}
          <div className="flex-1 min-w-0">
            <Card className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-black text-slate-900 text-base">{selected.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selected.desc}</p>
                </div>
                <div className="flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => setPreview(p=>!p)}>{preview?"Edit":"Preview"}</Btn>
                  <Btn variant="primary" size="sm" onClick={() => toast.success("Template saved (implement persistence via DB)")}>Save</Btn>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Subject Line</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Template Body — edit in <code className="bg-slate-100 px-1 rounded text-xs">src/lib/email/index.ts</code>
                  </label>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono leading-relaxed">
                    Email templates are coded in React-compatible HTML in <strong>src/lib/email/index.ts</strong>.<br/>
                    Variables use <code className="bg-white px-1 rounded">{"{{name}}"}</code> syntax in subject lines.<br/>
                    To edit template HTML, open the file and modify the corresponding function.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="text-xs font-bold text-teal-800 mb-2">Available variables</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["{{name}}","{{email}}","{{startup_name}}","{{investor_name}}","{{ticket_id}}","{{action_url}}"].map(v => (
                      <code key={v} className="bg-white px-1.5 py-0.5 rounded border border-teal-200 text-xs text-teal-700">{v}</code>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
