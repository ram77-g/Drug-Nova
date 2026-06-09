"use client";

import { motion } from "framer-motion";
import type { DiseaseSearchResponse } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import Link from "next/link";

interface DiseaseOverviewProps {
  data: DiseaseSearchResponse;
}

export function DiseaseOverview({ data }: DiseaseOverviewProps) {
  const { disease, genes, proteins, drugs } = data;
  const topScore = drugs[0]?.confidence_score ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Disease header card */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#0d1425]/80 backdrop-blur-sm p-6
        shadow-[0_0_40px_rgba(0,212,255,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-mono text-red-400/70 tracking-widest">DISEASE</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{disease.name}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {disease.icd_code && <Badge variant="cyan">ICD: {disease.icd_code}</Badge>}
              {disease.id && <Badge variant="default">{disease.id}</Badge>}
            </div>
            <p className="text-sm text-[#6b7fa3] leading-relaxed max-w-2xl">
              {disease.description}
            </p>
            {disease.prevalence && (
              <p className="text-xs text-[#4b5a78] mt-2 font-mono">
                Prevalence: {disease.prevalence}
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex sm:flex-col gap-3 sm:text-right flex-shrink-0">
            {[
              { label: "Genes", value: genes.length, color: "text-emerald-400" },
              { label: "Proteins", value: proteins.length, color: "text-cyan-400" },
              { label: "Candidates", value: drugs.length, color: "text-violet-400" },
            ].map((s) => (
              <div key={s.label} className="px-4 py-2 rounded-lg bg-[#1e2d4a]/30 border border-[#1e2d4a]/60 text-center">
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-[#4b5a78]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top confidence */}
        <div className="mt-5 pt-4 border-t border-[#1e2d4a]/60">
          <ScoreBar score={topScore} label="Top Repurposing Candidate Confidence" />
        </div>
      </div>

      {/* Genes & Proteins row */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Genes */}
        <div className="rounded-xl border border-emerald-500/15 bg-[#0d1425]/70 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-400 font-mono tracking-wide">
              ASSOCIATED GENES ({genes.length})
            </h3>
          </div>
          <div className="space-y-2">
            {genes.map((gene) => (
              <div
                key={gene.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-semibold text-emerald-400 text-sm flex-shrink-0">
                    {gene.symbol}
                  </span>
                  <span className="text-xs text-[#4b5a78] truncate">{gene.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {gene.chromosome && (
                    <span className="text-[10px] font-mono text-[#4b5a78]">
                      Chr {gene.chromosome.split("q")[0].split("p")[0]}
                    </span>
                  )}
                  <div className="w-16">
                    <ScoreBar score={gene.relevance_score} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proteins */}
        <div className="rounded-xl border border-cyan-500/15 bg-[#0d1425]/70 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-400 font-mono tracking-wide">
              TARGET PROTEINS ({proteins.length})
            </h3>
          </div>
          <div className="space-y-2">
            {proteins.map((protein) => (
              <div
                key={protein.id}
                className="py-2 px-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-[#c8d6f0] leading-snug">
                    {protein.name}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="cyan">{protein.uniprot_id}</Badge>
                    {protein.structure_available && (
                      <Link
                        href={`/protein?id=${protein.uniprot_id}`}
                        className="text-[10px] font-mono text-violet-400 hover:text-violet-300 underline underline-offset-2"
                      >
                        3D
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#4b5a78] leading-relaxed">{protein.function}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
