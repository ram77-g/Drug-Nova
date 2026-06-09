"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Drug, AIExplanationResponse } from "@/types";
import { getAIExplanation } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GlassCard } from "@/components/ui/GlassCard";

interface AIExplanationPanelProps {
  drug: Drug | null;
  diseaseName: string;
  onClose: () => void;
}

export function AIExplanationPanel({
  drug,
  diseaseName,
  onClose,
}: AIExplanationPanelProps) {
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchExplanation = async () => {
    if (!drug || fetched) return;
    setLoading(true);
    try {
      const data = await getAIExplanation({
        disease_name: diseaseName,
        drug_name: drug.name,
        mechanism: drug.mechanism,
        target_proteins: drug.target_proteins,
        rationale: drug.rationale,
      });
      setExplanation(data);
      setFetched(true);
    } catch {
      setExplanation({
        explanation: "Unable to generate explanation. Please ensure the backend is running.",
        pathways: [],
        confidence: "Unknown",
        disclaimer: "This is a research tool only.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  if (drug && !fetched && !loading) {
    fetchExplanation();
  }

  return (
    <AnimatePresence>
      {drug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-2xl"
          >
            <GlassCard glow="violet" className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-xs font-mono text-violet-400 tracking-widest">
                      AI ANALYSIS
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{drug.name}</h3>
                  <p className="text-sm text-[#6b7fa3]">for {diseaseName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#4b5a78] hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading ? (
                <LoadingSpinner message="Generating AI explanation..." size="sm" />
              ) : explanation ? (
                <div className="space-y-5">
                  {/* Explanation */}
                  <div>
                    <h4 className="text-xs font-mono text-violet-400 mb-2 tracking-wide">
                      SCIENTIFIC EXPLANATION
                    </h4>
                    <p className="text-sm text-[#c8d6f0] leading-relaxed">
                      {explanation.explanation}
                    </p>
                  </div>

                  {/* Pathways */}
                  {explanation.pathways.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-cyan-400 mb-2 tracking-wide">
                        MOLECULAR PATHWAYS
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {explanation.pathways.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg
                              bg-cyan-500/5 border border-cyan-500/15 text-sm text-[#6b7fa3]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 flex-shrink-0" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confidence */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono text-[#4b5a78] mb-1 tracking-wide">
                        CONFIDENCE ASSESSMENT
                      </h4>
                      <span
                        className={`text-sm font-semibold ${
                          explanation.confidence === "High"
                            ? "text-emerald-400"
                            : explanation.confidence === "Moderate"
                            ? "text-yellow-400"
                            : "text-orange-400"
                        }`}
                      >
                        {explanation.confidence}
                      </span>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="pt-4 border-t border-[#1e2d4a]/60">
                    <p className="text-[11px] text-[#4b5a78] leading-relaxed">
                      ⚠️ {explanation.disclaimer}
                    </p>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
