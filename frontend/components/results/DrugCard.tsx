"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Drug } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Badge } from "@/components/ui/Badge";
import { formatScore, scoreColor } from "@/lib/utils";

interface DrugCardProps {
  drug: Drug;
  rank: number;
  onExplain?: (drug: Drug) => void;
}

function approvalBadgeVariant(status: string): "green" | "cyan" | "yellow" | "red" | "default" {
  const s = status.toLowerCase();
  if (s.includes("fda approved")) return "green";
  if (s.includes("ema") || s.includes("approved")) return "cyan";
  if (s.includes("otc")) return "yellow";
  if (s.includes("withdrawn")) return "red";
  return "default";
}

export function DrugCard({ drug, rank, onExplain }: DrugCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.4 }}
      className="rounded-xl border border-[#1e2d4a]/60 bg-[#0d1425]/80 backdrop-blur-sm
        hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.06)]
        transition-all duration-300 overflow-hidden"
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Rank + name */}
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1e2d4a]/60 border border-[#1e2d4a]
              text-xs font-mono text-[#6b7fa3] flex items-center justify-center">
              #{rank}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-base truncate">{drug.name}</h3>
              <p className="text-xs text-[#4b5a78] font-mono mt-0.5">{drug.generic_name}</p>
            </div>
          </div>

          {/* Score badge */}
          <div className="flex-shrink-0 text-center">
            <div className={`text-2xl font-bold font-mono ${scoreColor(drug.confidence_score)}`}>
              {formatScore(drug.confidence_score)}
            </div>
            <div className="text-[10px] text-[#4b5a78] mt-0.5">confidence</div>
          </div>
        </div>

        {/* Score bar */}
        <ScoreBar score={drug.confidence_score} size="sm" />

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant={approvalBadgeVariant(drug.approval_status)}>
            {drug.approval_status.replace("FDA Approved", "✓ FDA").replace("EMA Approved", "✓ EMA")}
          </Badge>
          <Badge variant="default">{drug.original_indication}</Badge>
        </div>

        {/* Mechanism */}
        <p className="text-sm text-[#6b7fa3] mt-3 leading-relaxed line-clamp-2">
          {drug.mechanism}
        </p>

        {/* Target proteins */}
        <div className="flex flex-wrap gap-1.5 mt-4 mb-2">
          {drug.target_proteins.map((p) => (
            <span key={p} className="px-2 py-1 text-[10px] rounded font-mono bg-cyan-500/5 border border-cyan-500/15 text-cyan-400/80">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#1e2d4a]/60 pt-4 space-y-4">
              {/* Rationale */}
              <div>
                <h4 className="text-xs font-mono text-violet-400 mb-1.5 tracking-wide">
                  SCIENTIFIC RATIONALE
                </h4>
                <p className="text-sm text-[#6b7fa3] leading-relaxed">{drug.rationale}</p>
              </div>

              {/* Side effects */}
              <div>
                <h4 className="text-xs font-mono text-yellow-400/80 mb-1.5 tracking-wide">
                  POTENTIAL SIDE EFFECTS
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drug.side_effects.map((se) => (
                    <Badge key={se} variant="yellow">{se}</Badge>
                  ))}
                </div>
              </div>

              {/* PubMed refs */}
              {drug.pubmed_refs.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-[#4b5a78] mb-1.5 tracking-wide">
                    LITERATURE REFERENCES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {drug.pubmed_refs.map((ref) => (
                      <a
                        key={ref}
                        href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace("PMID:", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-cyan-400/70 hover:text-cyan-400 underline underline-offset-2"
                      >
                        {ref}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div className="px-5 pb-5 pt-1 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 py-2 text-xs rounded-lg border border-[#1e2d4a] text-[#6b7fa3]
            hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          {expanded ? "Hide Details" : "Show Details"}
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {onExplain && (
          <button
            onClick={() => onExplain(drug)}
            className="py-2 px-3 text-[11px] font-medium rounded-lg border border-violet-500/30 bg-violet-500/5
              text-violet-400 hover:bg-violet-500/15 hover:border-violet-500/50 transition-all duration-200
              flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Explain
          </button>
        )}
      </div>
    </motion.div>
  );
}
