"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Btn, Badge, Modal, Select, Input, EmptyState } from "@/components/ui";
import toast from "react-hot-toast";

const FOUNDER_NAV = [
  { href: "/dashboard/founder",           label: "Dashboard", icon: <span>🏠</span> },
  { href: "/dashboard/founder/intros",    label: "Intros",    icon: <span>🤝</span> },
  { href: "/dashboard/founder/documents", label: "Documents", icon: <span>📂</span> },
  { href: "/dashboard/founder/messages",  label: "Messages",  icon: <span>💬</span> },
  { href: "/dashboard/founder/profile",   label: "Profile",   icon: <span>👤</span> },
  { href: "/dashboard/founder/kyc",       label: "KYC",       icon: <span>🪪</span> },
  { href: "/dashboard/founder/billing",   label: "Billing",   icon: <span>💳</span> },
  { href: "/dashboard/founder/settings",  label: "Settings",  icon: <span>⚙️</span> },
];

const FOLDER_ICON: Record<string, string> = { general:"📄", financials:"📊", legal:"⚖️", deck:"📋", other:"📁" };

export function DocumentsClient({ documents: init, deckUrl, deckName }: { documents: any[]; deckUrl: string|null; deckName: string|null }) {
  const router = useRouter();
  const [docs, setDocs] = useState(init);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [file,     setFile]         = useState<File|null>(null);
  const [title,    setTitle]        = useState("");
  const [folder,   setFolder]       = useState("general");
  const [access,   setAccess]       = useState("private");

  const [deckFile, setDeckFile] = useState<File|null>(null);
  const [deckUploading, setDeckUploading] = useState(false);

  const uploadDeck = async () => {
    if (!deckFile) return;
    setDeckUploading(true);
    const fd = new FormData();
    fd.append("file", deckFile); fd.append("type", "deck");
    const res = await fetch("/api/upload", { method:"POST", body:fd });
    setDeckUploading(false);
    if (res.ok) { toast.success("Pitch deck uploaded!"); router.refresh(); }
    else toast.error("Upload failed");
  };

  const uploadDoc = async () => {
    if (!file || !title) { toast.error("Title and file required"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file); fd.append("type", "document");
    const uploadRes = await fetch("/api/upload", { method:"POST", body:fd });
    if (!uploadRes.ok) { setUploading(false); toast.error("Upload failed"); return; }
    const { path, fileName } = await uploadRes.json();
    const docRes = await fetch("/api/documents", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ title, file_path: path, file_name: fileName, folder, access_level: access, file_size: file.size, file_type: file.type }),
    });
    setUploading(false);
    if (docRes.ok) {
      const { document } = await docRes.json();
      setDocs(p => [document, ...p]);
      setUploadOpen(false); setFile(null); setTitle("");
      toast.success("Document uploaded!");
    } else toast.error("Failed to save document record");
  };

  const deleteDoc = async (id: string) => {
    await fetch("/api/documents", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    setDocs(p => p.filter(d => d.id !== id));
    toast.success("Document deleted");
  };

  const folders = Array.from(new Set(docs.map(d => d.folder).filter(Boolean)));

  return (
    <DashboardLayout navItems={FOUNDER_NAV} role="founder">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-slate-900">Data Room</h1>
          <Btn variant="primary" size="sm" onClick={() => setUploadOpen(true)}>+ Upload Doc</Btn>
        </div>

        <Card className="p-5 mb-5 border-teal-200 bg-teal-50/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <div className="font-bold text-slate-800 mb-1">Pitch Deck</div>
              {deckUrl
                ? <div className="text-sm text-emerald-700 font-semibold mb-2">✓ {deckName ?? "Deck uploaded"}</div>
                : <p className="text-xs text-slate-500 mb-3">Upload your pitch deck (PDF or PPTX, max 10 MB)</p>
              }
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) setDeckFile(f); }}/>
                {deckFile
                  ? <Btn variant="primary" size="sm" loading={deckUploading} onClick={uploadDeck}>Upload {deckFile.name}</Btn>
                  : <Btn variant="secondary" size="sm">{deckUrl ? "Replace Deck" : "Choose File"}</Btn>
                }
              </label>
            </div>
          </div>
        </Card>

        {docs.length === 0 ? (
          <EmptyState icon="📂" title="No documents yet" body="Upload financial models, legal docs, or other data room materials." cta="Upload Document" onCta={() => setUploadOpen(true)}/>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <Card key={doc.id} className="p-4 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{FOLDER_ICON[doc.folder] ?? "📄"}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm truncate">{doc.title}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{doc.file_name}</span>
                    <Badge color={doc.access_level==="public"?"teal":doc.access_level==="on_request"?"amber":"slate"}>{doc.access_level}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => deleteDoc(doc.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Delete</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        <div className="space-y-4">
          <Input label="Document Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Financial Model Q1 2025"/>
          <Select label="Folder" value={folder} onChange={e => setFolder(e.target.value)} options={[
            {value:"general",label:"General"},{value:"financials",label:"Financials"},{value:"legal",label:"Legal"},{value:"deck",label:"Deck"},{value:"other",label:"Other"}
          ]}/>
          <Select label="Access Level" value={access} onChange={e => setAccess(e.target.value)} options={[
            {value:"private",label:"Private (only you)"},{value:"on_request",label:"On Request (granted per investor)"},{value:"public",label:"Public (all verified investors)"}
          ]}/>
          <label className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm font-semibold ${file?"border-teal-300 bg-teal-50 text-teal-700":"border-slate-200 hover:border-teal-300 text-slate-500"}`}>
            <input type="file" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) setFile(f); }}/>
            {file ? `✓ ${file.name}` : "Choose file to upload"}
          </label>
          <div className="flex gap-2 pt-1">
            <Btn variant="secondary" full onClick={() => setUploadOpen(false)}>Cancel</Btn>
            <Btn variant="primary"   full loading={uploading} onClick={uploadDoc}>Upload</Btn>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default DocumentsClient;
