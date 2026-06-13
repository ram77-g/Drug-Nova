"use client";

import { useState, useEffect } from "react";
import { ProteinViewer3D } from "@/components/protein/ProteinViewer3D";
import { getProteinStructure } from "@/lib/api";
import type { ProteinStructureResponse } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchableSelect } from "./SearchableSelect";

interface ProteinListItem {
  uniprot_id: string;
  name: string;
  pdb_id: string | null;
}

interface ProteinComparePanelProps {
  proteins: ProteinListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  panelId: string;
}

export function ProteinComparePanel({ 
  proteins, 
  selectedId, 
  onSelect,
  panelId, 
  labelColor = "cyan" 
}: ProteinComparePanelProps & { labelColor?: "cyan" | "violet" }) {
  const [details, setDetails] = useState<ProteinStructureResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // We removed the internal default setter since it's controlled now

  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      return;
    }
    
    let isMounted = true;
    setLoading(true);
    getProteinStructure(selectedId)
      .then((data) => {
        if (isMounted) setDetails(data);
      })
      .catch((err) => console.error("Failed to fetch protein details:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedId]);

  return (
    <div className="flex flex-col gap-4 bg-[#0d1425]/40 p-4 rounded-2xl border border-[#1e2d4a]/40">
      {/* Header and Dropdown Selector */}
      <div className="flex flex-col gap-2 relative z-20">
        <div className="flex items-center gap-2">
           <span className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider font-bold ${
             labelColor === "cyan" ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20" 
                                   : "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20"
           }`}>
             Structure {panelId}
           </span>
        </div>
        <div className="relative z-50">
          <SearchableSelect 
            options={proteins.map(p => ({ value: p.uniprot_id, label: `${p.name} (${p.uniprot_id})` }))}
            value={selectedId}
            onChange={onSelect}
            placeholder="Select a protein..."
          />
        </div>
      </div>

      {/* 3D Viewer Area */}
      <div className="relative flex flex-col">
        {selectedId ? (
          <div className="min-h-[520px] flex flex-col">
            <ProteinViewer3D 
              key={selectedId}
              uniprotId={selectedId} 
              pdbId={proteins.find(p => p.uniprot_id === selectedId)?.pdb_id || null} 
              performanceMode={true}
            />
          </div>
        ) : (
          <div className="min-h-[520px] rounded-xl border border-[#1e2d4a]/60 bg-[#050810] flex items-center justify-center">
            <span className="text-sm text-[#4b5a78]">Select a protein to visualize</span>
          </div>
        )}
      </div>

      {/* Molecule Details Panel */}
      <GlassCard glow="cyan" className="p-5 mt-2 transition-all min-h-[140px]">
        {loading ? (
          <LoadingSpinner size="sm" message="Fetching molecule details..." />
        ) : details ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{details.protein_name}</h3>
              <span className="px-2.5 py-1 rounded-md bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-xs font-mono text-[#00d4ff]">
                {details.uniprot_id}
              </span>
            </div>
            
            <p className="text-sm text-[#c8d6f0] leading-relaxed mt-1">
              {details.description || "No specific function description available."}
            </p>
            
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#1e2d4a]/60">
               <a 
                 href={details.alphafold_url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="text-xs text-[#00d4ff] hover:underline"
               >
                 View AlphaFold Database ↗
               </a>
            </div>
          </div>
        ) : (
           <div className="flex items-center justify-center h-full text-sm text-[#4b5a78]">
             Details will appear here
           </div>
        )}
      </GlassCard>
    </div>
  );
}
