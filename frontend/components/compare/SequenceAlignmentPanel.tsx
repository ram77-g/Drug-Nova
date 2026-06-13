"use client";

import { useEffect, useState } from "react";
import { getProteinAlignment } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SequenceAlignmentPanelProps {
  proteinAId: string;
  proteinBId: string;
}

export function SequenceAlignmentPanel({ proteinAId, proteinBId }: SequenceAlignmentPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alignment, setAlignment] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proteinAId || !proteinBId || proteinAId === proteinBId) {
      setAlignment(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getProteinAlignment(proteinAId, proteinBId)
      .then((data) => {
        if (isMounted) setAlignment(data);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch sequence alignment", err);
          setError("Failed to calculate sequence alignment.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [proteinAId, proteinBId]);

  if (!proteinAId || !proteinBId || proteinAId === proteinBId) return null;

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        Sequence Alignment & Similarity
        {alignment && !loading && (
           <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">
             {alignment.similarity_score}% SIMILARITY
           </span>
        )}
      </h2>
      
      {loading ? (
        <GlassCard className="p-10 flex flex-col items-center justify-center gap-4">
          <LoadingSpinner message="Fetching live amino acid sequences from UniProt..." />
        </GlassCard>
      ) : error ? (
        <GlassCard className="p-6 text-center text-red-400 bg-red-500/10 border-red-500/20">
          {error}
        </GlassCard>
      ) : alignment ? (
        <GlassCard glow="cyan" className="p-6 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-end mb-1">
               <span className="text-sm font-mono text-[#00d4ff]">Alignment Score</span>
               <span className="text-2xl font-bold text-white">{alignment.similarity_score}%</span>
             </div>
             
             {/* Glowing Progress Bar */}
             <div className="w-full bg-[#1e2d4a]/50 h-3 rounded-full overflow-hidden border border-[#1e2d4a]">
               <div 
                 className="h-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7] transition-all duration-1000 ease-out relative"
                 style={{ width: `${alignment.similarity_score}%` }}
               >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
               </div>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-[#1e2d4a]/60 pt-4">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase text-[#6b7fa3] font-bold tracking-wider">Structure A Length</span>
               <span className="text-lg font-mono text-[#00d4ff]">{alignment.seq_a_length} aa</span>
             </div>
             <div className="flex flex-col border-l border-[#1e2d4a]/60 pl-4">
               <span className="text-[10px] uppercase text-[#6b7fa3] font-bold tracking-wider">Structure B Length</span>
               <span className="text-lg font-mono text-[#a855f7]">{alignment.seq_b_length} aa</span>
             </div>
             <div className="flex flex-col border-l border-[#1e2d4a]/60 pl-4">
               <span className="text-[10px] uppercase text-[#6b7fa3] font-bold tracking-wider">Identical Residues</span>
               <span className="text-lg font-mono text-green-400">{alignment.identical_residues} aa</span>
             </div>
          </div>

        </GlassCard>
      ) : null}
    </div>
  );
}
