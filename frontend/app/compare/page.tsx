"use client";

import { useEffect, useState } from "react";
import { ProteinComparePanel } from "@/components/compare/ProteinComparePanel";
import { SharedDrugsPanel } from "@/components/compare/SharedDrugsPanel";
import { SequenceAlignmentPanel } from "@/components/compare/SequenceAlignmentPanel";
import { PhysicochemicalPanel } from "@/components/compare/PhysicochemicalPanel";
import { listProteins } from "@/lib/api";
import { getReportDownloadUrl, getPdfReportDownloadUrl } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Download, FileText } from "lucide-react";

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
      <main className="container-xl pb-20 relative z-10">
        <div className="mb-10" style={{ paddingTop: '100px' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Protein Structure Comparison
            </h1>
            {proteins.length >= 2 && !loading && !error && proteinAId && proteinBId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(getPdfReportDownloadUrl(proteinAId, proteinBId), '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 font-bold text-sm rounded-lg border border-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <FileText size={16} />
                  Download as PDF
                </button>
                <button
                  onClick={() => window.open(getReportDownloadUrl(proteinAId, proteinBId), '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e2d4a]/80 hover:bg-[#1e2d4a] text-[#00d4ff] font-bold text-sm rounded-lg border border-[#00d4ff]/20 transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                >
                  <Download size={16} />
                  Download as MD
                </button>
              </div>
            )}
          </div>
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
            <PhysicochemicalPanel proteinAId={proteinAId} proteinBId={proteinBId} />
            <SharedDrugsPanel proteinAId={proteinAId} proteinBId={proteinBId} />
          </>
        )}
      </main>
    </div>
  );
}
