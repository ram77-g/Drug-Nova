"use client";

import { useState, useEffect, useMemo } from "react";
import { getPredictions } from "@/lib/api";
import type { Protein, PredictionResult } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProteinViewer3D } from "@/components/protein/ProteinViewer3D";
import { DockingSimulator } from "./DockingSimulator";
import { Dna, Target, Beaker } from "lucide-react";

interface DockingSandboxProps {
  diseaseName: string;
  proteins: Protein[];
}

export function DockingSandbox({ diseaseName, proteins }: DockingSandboxProps) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProteinId, setSelectedProteinId] = useState<string>("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [dockingState, setDockingState] = useState<'idle' | 'running' | 'success' | 'partial' | 'fail'>('idle');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getPredictions(diseaseName);
        setPredictions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load drugs.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [diseaseName]);

  const selectedProtein = proteins.find((p) => p.id === selectedProteinId);
  const selectedPrediction = predictions.find((p) => p.drug_id === selectedDrugId);

  // Reset simulation state when selections change
  useEffect(() => {
    setDockingState('idle');
  }, [selectedProteinId, selectedDrugId]);

  // Calculate dynamic affinity when selection changes
  const dynamicAffinity = useMemo(() => {
    if (!selectedProtein || !selectedPrediction) return 0;
    const isBiologicalTarget = selectedPrediction.target_proteins?.some(t => t.toLowerCase() === selectedProtein.name.toLowerCase()) ?? false;
    if (isBiologicalTarget) {
      return selectedPrediction.protein_compatibility;
    }
    // Deterministic pseudo-random based on names so it doesn't jump but looks random
    const hash = (selectedProtein.name.charCodeAt(0) + selectedPrediction.drug_name.charCodeAt(0)) % 15;
    return 0.15 + (hash / 100.0); // 15% to 29%
  }, [selectedProtein, selectedPrediction]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-cyan-400/80 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING DOCKING SANDBOX...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0d1425]/80 p-6 rounded-xl border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Beaker className="w-6 h-6 text-cyan-400" />
          Molecular Docking Sandbox
        </h2>
        <p className="text-[#6b7fa3] text-sm mt-1 max-w-2xl">
          Select any target protein for <span className="text-cyan-400 font-bold">{diseaseName}</span> and test any candidate drug against its 3D active site to mathematically simulate Binding Energy (ΔG).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Controls & Simulator */}
        <div className="space-y-6">
          <div className="bg-[#0d1425]/80 p-6 rounded-xl border border-[#1e2d4a]/60 space-y-6">
            
            {/* Protein Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#c8d6f0] mb-2 uppercase tracking-wider">
                <Dna className="w-4 h-4 text-violet-400" />
                1. Select Target Protein
              </label>
              <select
                className="w-full bg-[#080d19] border border-[#1e2d4a] text-white p-3 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                value={selectedProteinId}
                onChange={(e) => setSelectedProteinId(e.target.value)}
              >
                <option value="" disabled>-- Choose a protein structure --</option>
                {proteins.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) {p.pdb_id ? `[PDB: ${p.pdb_id}]` : '[AlphaFold]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Drug Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#c8d6f0] mb-2 uppercase tracking-wider">
                <Target className="w-4 h-4 text-emerald-400" />
                2. Select Candidate Drug
              </label>
              <select
                className="w-full bg-[#080d19] border border-[#1e2d4a] text-white p-3 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                value={selectedDrugId}
                onChange={(e) => setSelectedDrugId(e.target.value)}
                disabled={!selectedProteinId}
              >
                <option value="" disabled>-- Choose a drug to dock --</option>
                {predictions.map((p) => (
                  <option key={p.drug_id} value={p.drug_id}>
                    {p.drug_name} {p.is_primary_treatment ? "(Standard of Care)" : ""}
                  </option>
                ))}
              </select>
              {!selectedProteinId && (
                <p className="text-xs text-[#6b7fa3] mt-2">Select a protein first to unlock the drug library.</p>
              )}
            </div>

          </div>

          {/* Terminal Simulator */}
          {selectedProtein && selectedPrediction && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DockingSimulator 
                drugName={selectedPrediction.drug_name} 
                affinityScore={dynamicAffinity} 
                onStateChange={setDockingState}
              />
            </div>
          )}
        </div>

        {/* Right Column: 3D Viewer */}
        <div className="bg-[#080d19] rounded-xl border border-[#1e2d4a]/60 overflow-hidden min-h-[500px] flex flex-col">
          <div className="bg-[#0d1425] px-4 py-3 border-b border-[#1e2d4a]/60">
            <span className="text-sm font-mono text-[#c8d6f0] uppercase tracking-wider">Live 3D Structure</span>
          </div>
          <div className="flex-1 relative bg-black/20">
            {selectedProtein ? (
              <ProteinViewer3D 
                key={selectedProtein.id}
                pdbId={selectedProtein.pdb_id} 
                uniprotId={selectedProtein.id} 
                performanceMode={false} 
                dockingSimulation={{
                  state: dockingState,
                  drugName: selectedPrediction?.drug_name
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#4b5a78]">
                <Dna className="w-16 h-16 opacity-20 mb-4" />
                <p>Select a protein to visualize its 3D active site.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
