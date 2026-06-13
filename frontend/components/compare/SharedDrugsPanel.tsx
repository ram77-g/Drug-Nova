"use client";

import { useEffect, useState } from "react";
import { getSharedDrugs } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SharedDrugsPanelProps {
  proteinAId: string;
  proteinBId: string;
}

export function SharedDrugsPanel({ proteinAId, proteinBId }: SharedDrugsPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!proteinAId || !proteinBId || proteinAId === proteinBId) {
      setDrugs([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getSharedDrugs(proteinAId, proteinBId)
      .then((data) => {
        if (isMounted) setDrugs(data);
      })
      .catch((err) => {
        console.error("Failed to fetch shared drugs", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [proteinAId, proteinBId]);

  if (!proteinAId || !proteinBId) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        Polypharmacology Intersect
        {drugs.length > 0 && !loading && (
           <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
             {drugs.length} MATCH{drugs.length > 1 ? "ES" : ""}
           </span>
        )}
      </h2>
      
      {proteinAId === proteinBId ? (
        <GlassCard className="p-6 text-center text-[#6b7fa3]">
          Select two different proteins to find intersecting drugs.
        </GlassCard>
      ) : loading ? (
        <GlassCard className="p-10 flex justify-center">
          <LoadingSpinner message="Scanning database for shared drugs..." />
        </GlassCard>
      ) : drugs.length === 0 ? (
        <GlassCard className="p-6 text-center text-[#6b7fa3]">
          No known drugs in the database hit both of these targets simultaneously.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drugs.map((drug) => (
            <GlassCard key={drug.id} glow="violet" className="p-5 flex flex-col gap-2 border-[#a855f7]/30 bg-[#a855f7]/5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">{drug.name}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-1 bg-[#1e2d4a]/60 rounded text-[#00d4ff]">
                  {drug.approval_status}
                </span>
              </div>
              <p className="text-sm text-[#c8d6f0] mt-1">{drug.mechanism}</p>
              <div className="mt-3 pt-3 border-t border-[#1e2d4a]/60 flex flex-wrap gap-2">
                <span className="text-xs text-[#6b7fa3]">Targets:</span>
                {drug.target_proteins.map((t: string, i: number) => (
                  <span key={i} className="text-xs font-mono text-[#a855f7] bg-[#a855f7]/10 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
