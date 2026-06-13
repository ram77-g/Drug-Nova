"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProteinComparePanel } from "@/components/compare/ProteinComparePanel";
import { SharedDrugsPanel } from "@/components/compare/SharedDrugsPanel";
import { SequenceAlignmentPanel } from "@/components/compare/SequenceAlignmentPanel";
import { listProteins } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProteinListItem {
  uniprot_id: string;
  name: string;
  pdb_id: string | null;
}

export default function ComparePage() {
  const [proteins, setProteins] = useState<ProteinListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [proteinAId, setProteinAId] = useState<string>("");
  const [proteinBId, setProteinBId] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    listProteins()
      .then((data) => {
        if (isMounted) {
          setProteins(data);
          if (data.length >= 2) {
            setProteinAId(data[0].uniprot_id);
            setProteinBId(data[1].uniprot_id);
          } else if (data.length === 1) {
            setProteinAId(data[0].uniprot_id);
            setProteinBId(data[0].uniprot_id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError("Failed to load protein list. Make sure backend is running.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#050810]">
      <Navbar />

      <main className="container-xl pb-20 relative z-10">
        {/* Bulletproof spacer to clear the fixed navbar */}
        <div style={{ height: "100px", width: "100%" }} aria-hidden="true"></div>
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Protein Structure Comparison
          </h1>
          <p className="text-[#6b7fa3] text-lg max-w-3xl">
            Select two proteins from the database to compare their 3D structures, surface topologies, and binding pockets side-by-side.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
             <LoadingSpinner message="Loading database..." />
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        ) : proteins.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#1e2d4a]/20 border border-[#1e2d4a]/60 text-[#6b7fa3]">
            No proteins found in the database.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProteinComparePanel 
                panelId="A" 
                proteins={proteins} 
                selectedId={proteinAId}
                onSelect={setProteinAId}
                labelColor="cyan"
              />
              
              <ProteinComparePanel 
                panelId="B" 
                proteins={proteins} 
                selectedId={proteinBId}
                onSelect={setProteinBId}
                labelColor="violet"
              />
            </div>
            
            <SequenceAlignmentPanel proteinAId={proteinAId} proteinBId={proteinBId} />
            <SharedDrugsPanel proteinAId={proteinAId} proteinBId={proteinBId} />
          </>
        )}
      </main>
    </div>
  );
}
