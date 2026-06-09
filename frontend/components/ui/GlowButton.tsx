"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "cyan" | "violet" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function GlowButton({
  children,
  variant = "cyan",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-200 select-none overflow-hidden";

  const variants = {
    cyan: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/70 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]",
    violet: "bg-violet-500/10 border-violet-500/40 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/70 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]",
    outline: "bg-transparent border-[#1e2d4a] text-[#c8d6f0] hover:border-cyan-500/40 hover:text-cyan-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
