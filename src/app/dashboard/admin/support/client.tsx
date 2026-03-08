"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, Btn, Badge, StatusPill, EmptyState } from "@/components/ui";
import { ADMIN_NAV } from "../client";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PRIO_COLOR: Record<string, string> = { high:"bg-red-500", medium:"bg-amber-400", low:"bg-slate-300" };
const ROLE_COLOR: Record<string, any>    = { founder:"teal", investor:"indigo", partner:"amber", admin:"slate" };

export function AdminSupportClient({ tickets: init, adminId }: { tickets: any[]; adminId: string }) {
  const [tickets,    setTickets]   = useState(init);
  const [active,     setActive]    = useState<string|null>(null);
  const [reply,      setReply]     = useState("");
  const [sending,    setSending]   = useState(false);
  const [filterStat, setFilterStat]= useState("all");
  const [filterPrio, setFilterPrio]= useState("all");
  const [srch,       setSrch]      = useState("");

  const filtered = useMemo(() => tickets.filter(t =>
    (filterStat === "all" || t.status === filterStat) &&
    (filterPrio === "all" || t.priority === filterPrio) &&
    (!srch || t.subject?.toLowerCase().includes(srch.toLowerCase()) || (t.user as any)?.full_name?.toLowerCase().includes(srch.toLowerCase()))
  ), [tickets, filterStat, filterPrio, srch]);

  const sendReply = async (ticketId: string) => {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, reply }),
    });
    setSending(false);
    if (res.ok) {
      setTickets(p => p.map(t => t.id === ticketId
        ? { ...t, status:"pending", messages: [...(t.messages??[]), { id: Date.now(), body: reply, is_admin: true, sent_at: new Date().toISOString(), sender: { full_name: "You" } }] }
        : t));
      setReply("");
      toast.success("Reply sent");
    } else toast.error("Failed to send reply");
  };

  const changeStatus = async (ticketId: string, status: string) => {
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, status }),
    });
    setTickets(p => p.map(t => t.id === ticketId ? { ...t, status } : t));
    if (status === "resolved") setActive(null);
    toast.success(`Ticket marked ${status}`);
  };

  const openCount  = tickets.filter(t => t.status === "open").length;
  const pendCount  = tickets.filter(t => t.status === "pending").length;
  const highCount  = tickets.filter(t => t.priority === "high" && t.status !== "resolved").length;

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage user issues and requests</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Open"          value={openCount}       color="text-red-500"   icon="🔴"/>
          <StatCard label="Pending"       value={pendCount}       color="text-amber-500" icon="🟡"/>
          <StatCard label="High Priority" value={highCount}       color="text-red-600"   icon="🚨"/>
          <StatCard label="Total"         value={tickets.length}  color="text-slate-700" icon="🎫"/>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Search tickets or users…"
            className="flex-1 min-w-48 px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 bg-white"/>
          <select value={filterStat} onChange={e => setFilterStat(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none cursor-pointer">
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🎫" title="No tickets match" body="Try adjusting your filters."/>
        ) : (
          <div className="space-y-3">
            {filtered.map(t => {
              const u = t.user as any;
              const isActive = active === t.id;
              return (
                <Card key={t.id} className={cn("overflow-hidden", t.priority==="high"&&t.status!=="resolved"&&"border-red-200")}>
                  <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setActive(isActive ? null : t.id)}>
                    <div className={cn("w-1 self-stretch rounded-full flex-shrink-0", PRIO_COLOR[t.priority])}/>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm mb-1">{t.subject}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400">{t.id?.slice(0,8)?.toUpperCase()}</span>
                        {u && <Badge color={ROLE_COLOR[u.role]}>{u.role}</Badge>}
                        {u && <span className="text-xs text-slate-500">{u.full_name}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <StatusPill status={t.status}/>
                      <span className="text-xs text-slate-400 font-bold uppercase" style={{ color: PRIO_COLOR[t.priority]?.replace("bg-","text-")?.includes("bg") ? undefined : "#888" }}>{t.priority}</span>
                      <span className="text-xs text-slate-400">{timeAgo(t.created_at)}</span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                      {/* Messages */}
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {(t.messages ?? []).map((m: any) => (
                          <div key={m.id} className={cn("flex", m.is_admin ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                              m.is_admin ? "bg-slate-800 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                            )}>
                              <div className={cn("text-[10px] font-bold mb-1", m.is_admin ? "text-slate-400" : "text-slate-400")}>
                                {m.is_admin ? "🛡 Support Team" : u?.full_name} · {timeAgo(m.sent_at)}
                              </div>
                              {m.body}
                            </div>
                          </div>
                        ))}
                      </div>

                      {t.status !== "resolved" && (
                        <div className="flex gap-2 mb-3">
                          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
                            placeholder="Type your reply…"
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 resize-none"/>
                          <Btn variant="primary" size="sm" loading={sending} onClick={() => sendReply(t.id)}>Reply</Btn>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {t.status !== "resolved" && <>
                          <Btn variant="secondary" size="sm" onClick={() => changeStatus(t.id,"pending")}>Mark Pending</Btn>
                          <Btn variant="primary"   size="sm" onClick={() => changeStatus(t.id,"resolved")}>✓ Resolve</Btn>
                        </>}
                        {t.status === "resolved" && <Btn variant="secondary" size="sm" onClick={() => changeStatus(t.id,"open")}>Reopen</Btn>}
                        <button onClick={() => toast.success("Escalated to senior team")}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
                          ⚡ Escalate
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
