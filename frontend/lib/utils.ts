import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format confidence score as percentage string */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Map confidence score to a color class */
export function scoreColor(score: number): string {
  if (score >= 0.85) return "text-emerald-400";
  if (score >= 0.70) return "text-cyan-400";
  if (score >= 0.55) return "text-yellow-400";
  return "text-orange-400";
}

/** Map confidence score to a glow color */
export function scoreGlow(score: number): string {
  if (score >= 0.85) return "shadow-[0_0_12px_rgba(52,211,153,0.4)]";
  if (score >= 0.70) return "shadow-[0_0_12px_rgba(0,212,255,0.4)]";
  if (score >= 0.55) return "shadow-[0_0_12px_rgba(251,191,36,0.4)]";
  return "shadow-[0_0_12px_rgba(251,146,60,0.4)]";
}

/** Map node type to color */
export function nodeTypeColor(type: string): string {
  const map: Record<string, string> = {
    disease: "#ef4444",
    gene: "#22c55e",
    protein: "#00d4ff",
    drug: "#a855f7",
  };
  return map[type] ?? "#6b7fa3";
}

/** Map node type to background class */
export function nodeTypeBg(type: string): string {
  const map: Record<string, string> = {
    disease: "bg-red-500/10 border-red-500/30 text-red-400",
    gene: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    protein: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    drug: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };
  return map[type] ?? "bg-slate-500/10 border-slate-500/30 text-slate-400";
}

/** Truncate long strings */
export function truncate(str: string, maxLen = 100): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/** Debounce a function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
