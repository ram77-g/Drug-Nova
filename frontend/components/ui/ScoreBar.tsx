"use client";

import { useEffect, useRef } from "react";
import { formatScore } from "@/lib/utils";

interface ScoreBarProps {
  score: number; // 0–1
  label?: string;
  size?: "sm" | "md";
}

export function ScoreBar({ score, label, size = "md" }: ScoreBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.round(score * 100);

  const color =
    score >= 0.85
      ? "from-emerald-500 to-teal-400"
      : score >= 0.70
      ? "from-cyan-500 to-blue-400"
      : score >= 0.55
      ? "from-yellow-500 to-amber-400"
      : "from-orange-500 to-red-400";

  const textColor =
    score >= 0.85
      ? "text-emerald-400"
      : score >= 0.70
      ? "text-cyan-400"
      : score >= 0.55
      ? "text-yellow-400"
      : "text-orange-400";

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty("--score-width", `${pct}%`);
    }
  }, [pct]);

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6b7fa3]">{label}</span>
          <span className={`font-mono font-semibold ${textColor}`}>
            {formatScore(score)}
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden bg-[#1e2d4a]/60 ${
          size === "sm" ? "h-1.5" : "h-2.5"
        }`}
      >
        <div
          ref={barRef}
          className={`h-full rounded-full bg-gradient-to-r ${color} score-bar-fill`}
          style={{ "--score-width": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
