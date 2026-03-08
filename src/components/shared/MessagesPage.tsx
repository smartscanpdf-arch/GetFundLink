"use client";
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, EmptyState, Skeleton } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface Props {
  role:    UserRole;
  navItems: { href: string; label: string; icon: React.ReactNode }[];
}

export function MessagesPage({ role, navItems }: Props) {
  const { user } = useAuth();
  const [threads, setThreads]   = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string|null>(null);
  const [msgs, setMsgs]         = useState<any[]>([]);
  const [body, setBody]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => { setThreads(d.threads ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    // fetch messages for thread
    fetch(`/api/messages?thread_id=${activeId}`)
      .then(r => r.json())
      .then(d => setMsgs(d.messages ?? []));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!body.trim() || !activeId) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: activeId, body }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMsgs(p => [...p, { ...message, sender: { id: user?.id } }]);
      setBody("");
    }
    setSending(false);
  };

  const activeThread = threads.find(t => t.id === activeId);
  const otherUser    = activeThread?.other_user;

  return (
    <DashboardLayout navItems={navItems} role={role}>
      <div className="flex h-[calc(100vh-56px)]">
        {/* Thread list */}
        <div className={cn("w-full sm:w-72 border-r border-slate-200 flex flex-col flex-shrink-0", activeId && "hidden sm:flex")}>
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-black text-slate-800 text-sm">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl"/>)}
              </div>
            ) : threads.length === 0 ? (
              <EmptyState icon="💬" title="No messages yet" body="Start a conversation by messaging a founder or investor."/>
            ) : (
              threads.map(t => (
                <button key={t.id} onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 transition-colors",
                    activeId === t.id ? "bg-teal-50" : "hover:bg-slate-50"
                  )}>
                  <Avatar name={t.other_user?.full_name} size={36}/>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{t.other_user?.full_name ?? "User"}</div>
                    <div className="text-xs text-slate-400 truncate">{t.last_message ?? "Start a conversation"}</div>
                  </div>
                  {t.last_message_at && (
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(t.last_message_at)}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        {activeId ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
              <button onClick={() => setActiveId(null)} className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-lg">←</button>
              <Avatar name={otherUser?.full_name} size={34}/>
              <div>
                <div className="font-bold text-slate-800 text-sm">{otherUser?.full_name ?? "User"}</div>
                <div className="text-xs text-slate-400 capitalize">{otherUser?.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m,i) => {
                const mine = m.sender_id === user?.id || m.sender?.id === user?.id;
                return (
                  <div key={m.id ?? i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    {!mine && <Avatar name={otherUser?.full_name} size={28} className="mr-2 mt-1 flex-shrink-0"/>}
                    <div className={cn(
                      "max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      mine
                        ? "bg-teal-500 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                    )}>
                      {m.body}
                      <div className={cn("text-[11px] mt-1", mine ? "text-teal-200" : "text-slate-400")}>
                        {timeAgo(m.sent_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex gap-2">
              <input value={body} onChange={e => setBody(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message…"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 transition-colors"/>
              <button onClick={send} disabled={sending || !body.trim()}
                className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center disabled:opacity-50 transition-opacity hover:bg-teal-600">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center">
            <EmptyState icon="💬" title="Select a conversation" body="Choose a thread on the left to start messaging."/>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
