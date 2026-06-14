"use client";

import { useEffect, useState } from "react";
import { getProteinProperties } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";

interface PhysicochemicalPanelProps {
  proteinAId: string;
  proteinBId: string;
}

export function PhysicochemicalPanel({ proteinAId, proteinBId }: PhysicochemicalPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [propsA, setPropsA] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [propsB, setPropsB] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proteinAId || !proteinBId || proteinAId === proteinBId) {
      setPropsA(null);
      setPropsB(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getProteinProperties(proteinAId),
      getProteinProperties(proteinBId)
    ])
      .then(([dataA, dataB]) => {
        if (isMounted) {
          setPropsA(dataA);
          setPropsB(dataB);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch physicochemical properties", err);
          setError("Failed to calculate physicochemical properties from FASTA sequences.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [proteinAId, proteinBId]);

  if (!proteinAId || !proteinBId || proteinAId === proteinBId) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MetricRow = ({ label, valA, valB, maxVal, unit = "" }: any) => {
    const pctA = Math.min((Math.abs(valA) / maxVal) * 100, 100);
    const pctB = Math.min((Math.abs(valB) / maxVal) * 100, 100);

    return (
      <div className="flex flex-col gap-1.5 mb-5">
        <div className="flex justify-between items-center text-xs text-[#6b7fa3] font-bold uppercase tracking-wide">
          <span className="text-cyan-400">{valA}{unit}</span>
          <span>{label}</span>
          <span className="text-violet-400">{valB}{unit}</span>
        </div>
        <div className="flex w-full items-center gap-1">
          {/* Bar A (Cyan) flowing right-to-left */}
          <div className="flex-1 bg-[#1e2d4a]/30 h-3 rounded-l-full overflow-hidden flex justify-end">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-cyan-400/80 rounded-l-full"
            />
          </div>
          <div className="w-0.5 h-4 bg-[#6b7fa3]/30" />
          {/* Bar B (Violet) flowing left-to-right */}
          <div className="flex-1 bg-[#1e2d4a]/30 h-3 rounded-r-full overflow-hidden flex justify-start">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-violet-400/80 rounded-r-full"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        Physicochemical Properties
      </h2>
      
      {loading ? (
        <GlassCard className="p-10 flex flex-col items-center justify-center gap-4">
          <LoadingSpinner message="Calculating biophysical properties from FASTA sequences..." />
        </GlassCard>
      ) : error ? (
        <GlassCard className="p-6 text-center text-red-400 bg-red-500/10 border-red-500/20">
          {error}
        </GlassCard>
      ) : propsA && propsB ? (
        <GlassCard className="p-6 flex flex-col pt-8">
          <MetricRow 
            label="Molecular Weight" 
            valA={propsA.molecular_weight} 
            valB={propsB.molecular_weight} 
            maxVal={Math.max(propsA.molecular_weight, propsB.molecular_weight) * 1.1}
            unit=" Da"
          />
          <MetricRow 
            label="Isoelectric Point (pI)" 
            valA={propsA.isoelectric_point} 
            valB={propsB.isoelectric_point} 
            maxVal={14}
          />
          <MetricRow 
            label="Hydrophobicity (GRAVY)" 
            valA={propsA.hydrophobicity_index} 
            valB={propsB.hydrophobicity_index} 
            maxVal={Math.max(Math.abs(propsA.hydrophobicity_index), Math.abs(propsB.hydrophobicity_index)) * 1.5 || 2}
          />
          <div className="h-px w-full bg-[#1e2d4a]/50 my-2" />
          <h3 className="text-center text-[10px] text-[#6b7fa3] font-bold uppercase tracking-widest mb-4 mt-2">Secondary Structure Fractions</h3>
          <MetricRow 
            label="Alpha Helix" 
            valA={propsA.helix_fraction} 
            valB={propsB.helix_fraction} 
            maxVal={100}
            unit="%"
          />
          <MetricRow 
            label="Beta Sheet" 
            valA={propsA.sheet_fraction} 
            valB={propsB.sheet_fraction} 
            maxVal={100}
            unit="%"
          />
          <MetricRow 
            label="Turn / Coil" 
            valA={propsA.turn_fraction} 
            valB={propsB.turn_fraction} 
            maxVal={100}
            unit="%"
          />
        </GlassCard>
      ) : null}
    </div>
  );
}
