"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar } from "@/components/ui/Avatar";
import { formatINR, timeAgo } from "@/lib/utils";
import { INVESTOR_NAV } from "../client";
import toast from "react-hot-toast";

export default function InvestorDealRoomPage() {
  const [docs,    setDocs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/documents?access=granted")
      .then(r => r.json())
      .then(d => { setDocs(d.documents ?? []); setLoading(false); });
  }, []);

  const filtered = docs.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.owner?.founder_profile?.startup_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = async (doc: any) => {
    // Log view, then open
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view", document_id: doc.id }),
    });
    window.open(`/api/documents/download?id=${doc.id}`, "_blank");
  };

  const FILE_ICONS: Record<string, string> = {
    "application/pdf": "📄",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "📊",
    "application/vnd.ms-powerpoint": "📊",
    default: "📁",
  };

  return (
    <DashboardLayout navItems={INVESTOR_NAV} role="investor">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Data Room</h1>
          <p className="text-sm text-slate-500 mt-0.5">Documents shared with you by founders you're connected with</p>
        </div>

        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents or startup names..."
            className="input max-w-sm"/>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"/>
                <div className="h-2 bg-slate-200 rounded w-1/3"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <h3 className="font-black text-slate-800 mb-2">No documents yet</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              Documents are shared when founders grant you access. Accept introductions to unlock data rooms.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map(doc => {
              const startup = doc.owner?.founder_profile?.startup_name;
              const icon    = FILE_ICONS[doc.file_type ?? ""] ?? FILE_ICONS.default;
              return (
                <div key={doc.id} className="card p-4 card-hover flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{doc.title}</div>
                    {startup && <div className="text-xs text-teal-600 font-semibold mt-0.5">{startup}</div>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-400">{doc.view_count} views</span>
                      <span className="text-xs text-slate-400">{timeAgo(doc.created_at)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleView(doc)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold
                               hover:bg-teal-100 transition-colors">
                    View
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info banner */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <div className="font-bold text-indigo-900 text-sm mb-1">Access is controlled by founders</div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Founders decide which investors can view their documents. Accept an intro and the founder may grant you data room access. All views are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
