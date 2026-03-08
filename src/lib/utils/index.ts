import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format paise to readable INR string
export function formatINR(paise: number | null | undefined, compact = false): string {
  if (!paise) return "₹0";
  const rupees = paise / 100;
  if (compact) {
    if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(1)}Cr`;
    if (rupees >= 100_000)    return `₹${(rupees / 100_000).toFixed(1)}L`;
    if (rupees >= 1_000)      return `₹${(rupees / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(rupees);
}

// Convert rupees string like "₹2.5 Cr" to paise
export function parseToPaise(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (value.toLowerCase().includes("cr"))  return Math.round(n * 10_000_000 * 100);
  if (value.toLowerCase().includes("l"))   return Math.round(n * 100_000 * 100);
  return Math.round(n * 100);
}

// Initials from name
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
}

// Deterministic avatar color from name
export function avatarColor(name: string | null | undefined): string {
  const colors = ["#1FA3A3","#6366F1","#F59E0B","#10B981","#EF4444","#8B5CF6","#EC4899","#0EA5E9"];
  if (!name) return colors[0];
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

// Relative time
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

// Truncate text
export function truncate(str: string, len = 100): string {
  return str.length <= len ? str : str.slice(0, len).trimEnd() + "…";
}

// Stage display label
export const STAGE_LABELS: Record<string, string> = {
  "pre-seed":     "Pre-Seed",
  "seed":         "Seed",
  "pre-series-a": "Pre-Series A",
  "series-a":     "Series A",
  "series-b":     "Series B",
  "series-c":     "Series C+",
};

// Sector options
export const SECTORS = [
  "FinTech", "HealthTech", "CleanTech", "EdTech", "AgriTech",
  "LogiTech", "SaaS", "D2C", "DeepTech", "Infrastructure", "Other",
];

// Stage options
export const STAGES = [
  "pre-seed", "seed", "pre-series-a", "series-a", "series-b", "series-c",
];

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate referral code from user ID
export function generateReferralCode(userId: string): string {
  return "FL-" + userId.slice(0, 8).toUpperCase();
}
