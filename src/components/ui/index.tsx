"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?:    "sm" | "md" | "lg";
  full?:    boolean;
  loading?: boolean;
}
export function Btn({ variant="primary", size="md", full, loading, className, children, disabled, ...props }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-teal-500 text-white hover:bg-teal-600",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger:    "bg-red-500 text-white hover:bg-red-600",
    ghost:     "text-slate-600 hover:bg-slate-100",
  };
  const sizes = { sm:"px-3 py-1.5 text-xs", md:"px-4 py-2.5 text-sm", lg:"px-5 py-3 text-base" };
  return (
    <button {...props} disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> : children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-card", className)} {...props}>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeColor = "teal"|"indigo"|"amber"|"green"|"red"|"slate"|"purple";
export function Badge({ color="slate", children }: { color?: BadgeColor; children: React.ReactNode }) {
  const colors: Record<BadgeColor, string> = {
    teal:   "bg-teal-100 text-teal-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber:  "bg-amber-100 text-amber-700",
    green:  "bg-emerald-100 text-emerald-700",
    red:    "bg-red-100 text-red-700",
    slate:  "bg-slate-100 text-slate-600",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", colors[color])}>{children}</span>;
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
}
export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>}
      <input
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors",
          error ? "border-red-400" : "border-slate-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>}
      <textarea
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors",
          error ? "border-red-400" : "border-slate-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  options:  { value: string; label: string }[];
  error?:   string;
}
export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>}
      <select
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer",
          error ? "border-red-400" : "border-slate-200",
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }: {
  open:     boolean;
  onClose:  () => void;
  title?:   string;
  children: React.ReactNode;
  wide?:    boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div ref={ref}
        className={cn(
          "bg-white rounded-2xl w-full shadow-modal animate-slide-up",
          wide ? "max-w-2xl" : "max-w-md"
        )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, cta, onCta, href }: {
  icon?:  string;
  title:  string;
  body?:  string;
  cta?:   string;
  onCta?: () => void;
  href?:  string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="font-black text-slate-700 text-base mb-2">{title}</h3>
      {body && <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-5">{body}</p>}
      {cta && onCta && <Btn variant="primary" onClick={onCta}>{cta}</Btn>}
      {cta && href && <a href={href} className="btn-primary inline-flex items-center justify-center">{cta}</a>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)}/>;
}
export function SkeletonCard({ rows=3 }: { rows?: number }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0"/>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3"/>
          <Skeleton className="h-3 w-1/3"/>
        </div>
      </div>
      {Array.from({length: rows}).map((_,i) => <Skeleton key={i} className={`h-3 ${i===rows-1?"w-1/2":"w-full"}`}/>)}
    </Card>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color="text-teal-600", icon }: {
  label:  string; value: string | number;
  sub?:   string; color?: string; icon?: string;
}) {
  return (
    <Card className="p-4">
      {icon && <div className="text-xl mb-2">{icon}</div>}
      <div className={cn("text-2xl font-black tracking-tight", color)}>{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: {
  tabs:     { id: string; label: string; badge?: number }[];
  active:   string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2",
            active === t.id
              ? "text-teal-600 border-teal-500"
              : "text-slate-500 border-transparent hover:text-slate-700"
          )}>
          {t.label}
          {!!t.badge && (
            <span className="bg-teal-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { color: BadgeColor; label: string }> = {
  open:      { color: "red",    label: "Open" },
  pending:   { color: "amber",  label: "Pending" },
  resolved:  { color: "green",  label: "Resolved" },
  accepted:  { color: "green",  label: "Accepted" },
  declined:  { color: "red",    label: "Declined" },
  completed: { color: "teal",   label: "Completed" },
  approved:  { color: "green",  label: "Approved" },
  rejected:  { color: "red",    label: "Rejected" },
  draft:     { color: "slate",  label: "Draft" },
  published: { color: "teal",   label: "Published" },
  cancelled: { color: "red",    label: "Cancelled" },
  free:      { color: "slate",  label: "Free" },
  starter:   { color: "teal",   label: "Starter" },
  pro:       { color: "indigo", label: "Pro" },
  enterprise:{ color: "purple", label: "Enterprise" },
  none:      { color: "slate",  label: "Not Started" },
  active:    { color: "green",  label: "Active" },
};
export function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { color: "slate" as BadgeColor, label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}
