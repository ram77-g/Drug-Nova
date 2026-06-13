"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPredictions } from "@/lib/api";
import type { PredictionResult } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Target, Activity, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface PredictionEngineProps {
  diseaseName: string;
}

export function PredictionEngine({ diseaseName }: PredictionEngineProps) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getPredictions(diseaseName);
        setPredictions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load predictions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [diseaseName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-cyan-400/80 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING PREDICTION ENGINE...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#0d1425]/80 p-6 rounded-xl border border-violet-500/30">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-violet-400" />
            AI Repurposing Engine
          </h2>
          <p className="text-[#6b7fa3] text-sm mt-1 max-w-2xl">
            Scanning the <span className="text-violet-400">entire DrugNova database</span> for <span className="text-cyan-400 font-bold">{diseaseName}</span>. 
            Standard treatments are verified, while other drugs are evaluated mathematically for repurposing viability based on pathway overlap, toxicity, and pocket compatibility.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-violet-400 font-bold">{predictions.length}</div>
          <div className="text-xs text-[#4b5a78] uppercase tracking-wider">Total Drugs Evaluated</div>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((pred, index) => {
          const isExpanded = expandedId === pred.drug_id;
          
          return (
            <motion.div 
              key={pred.drug_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                index === 0 ? "border-violet-500/50 bg-[#161f36]/80 shadow-[0_0_30px_rgba(139,92,246,0.1)]" : "border-[#1e2d4a]/60 bg-[#0d1425]/60 hover:border-violet-500/30"
              }`}
            >
              {/* Header / Summary Row */}
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
                onClick={() => setExpandedId(isExpanded ? null : pred.drug_id)}
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-4 flex-shrink-0 md:w-1/4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-lg border ${
                    index === 0 ? "bg-violet-500/20 text-violet-300 border-violet-500/50" : "bg-[#1e2d4a]/50 text-[#6b7fa3] border-[#1e2d4a]"
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#c8d6f0]">{pred.drug_name}</h3>
                    <p className="text-xs text-[#4b5a78]">{pred.generic_name}</p>
                  </div>
                </div>

                {/* Primary Score */}
                <div className="md:w-1/4">
                  <ScoreBar score={pred.repurposing_score} label="Repurposing Score" />
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap flex-1 justify-end items-center">
                  {pred.is_primary_treatment ? (
                    <Badge variant="violet">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Standard of Care
                    </Badge>
                  ) : (
                    <Badge variant="yellow">
                      <Activity className="w-3 h-3 mr-1" />
                      Repurposing Candidate
                    </Badge>
                  )}
                  <Badge variant={pred.toxicity_risk_label === "Low" ? "green" : pred.toxicity_risk_label === "Medium" ? "yellow" : "red"}>
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    {pred.toxicity_risk_label} Toxicity
                  </Badge>
                  <Badge variant="cyan">
                    <Target className="w-3 h-3 mr-1" />
                    {Math.round(pred.protein_compatibility * 100)}% Compat
                  </Badge>
                  <button className="ml-2 p-2 hover:bg-[#1e2d4a]/80 rounded-full text-[#6b7fa3] transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#1e2d4a]/60 bg-[#080d19]/50"
                  >
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        
                        {/* Left Column: Score Breakdown */}
                        <div>
                          <h4 className="text-sm font-mono text-cyan-400 mb-4 tracking-wider font-semibold">SCORE BREAKDOWN</h4>
                          <div className="space-y-3">
                            {pred.contributing_factors.map((factor, i) => (
                              <div key={i} className="flex justify-between items-center text-sm border-b border-[#1e2d4a]/40 pb-2 last:border-0">
                                <span className="text-[#c8d6f0]">{factor.feature}:</span>
                                <span className="font-mono text-white font-medium">
                                  {Math.round(factor.score_value * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Column: Final Summary */}
                        <div className="flex flex-col justify-center space-y-6 bg-[#0d1425]/50 p-6 rounded-xl border border-[#1e2d4a]/50">
                          <div>
                            <div className="text-[#6b7fa3] text-sm uppercase tracking-wider mb-1 font-mono">Final Weighted Score</div>
                            <div className="text-4xl font-mono font-bold text-violet-400">
                              {Math.round(pred.repurposing_score * 100)}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-[#6b7fa3] text-sm uppercase tracking-wider mb-1 font-mono">Confidence</div>
                            <div className="text-3xl font-mono font-bold text-emerald-400">
                              {Math.round(pred.confidence_score * 100)}%
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
