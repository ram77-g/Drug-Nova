import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "cyan" | "violet" | "green" | "red" | "yellow" | "default";
  className?: string;
}

const variants = {
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  default: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
