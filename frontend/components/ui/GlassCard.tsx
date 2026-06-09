import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "violet" | "none";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = false,
}: GlassCardProps) {
  const glowStyles = {
    none: "",
    cyan: "border-cyan-500/20 shadow-[0_0_20px_rgba(0,212,255,0.08)]",
    violet: "border-violet-500/20 shadow-[0_0_20px_rgba(124,58,237,0.08)]",
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-[#0d1425]/80 backdrop-blur-md",
        "border-[#1e2d4a]/60",
        glowStyles[glow],
        hover && "transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_24px_rgba(0,212,255,0.12)] hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
