"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

interface DockingSimulatorProps {
  drugName: string;
  uniprotId: string;   // target protein, e.g. "P00533" for EGFR
  smiles: string;       // drug SMILES string
  onStateChange?: (state: 'idle' | 'running' | 'success' | 'partial' | 'fail') => void;
}

interface DockResult {
  predicted_delta_g: number;
  binding_strength: "STRONG" | "MODERATE" | "WEAK";
  binding_score: number;
}

const STEPS = [
  "Fetching 3D ligand conformers...",
  "Aligning with primary target binding pocket...",
  "Evaluating steric clashes and hydrophobic interfaces...",
  "Calculating electrostatic and hydrogen bond energies...",
  "Minimizing final Binding Energy (ΔG)..."
];

export function DockingSimulator({ drugName, uniprotId, smiles, onStateChange }: DockingSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<DockResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drive the terminal animation off wall-clock time while the real
  // request is in flight, so the UI doesn't just sit frozen if the
  // API is faster or slower than the old fixed 1.2s/step timing.
  useEffect(() => {
    if (!isSimulating) return;

    let stepIndex = 0;
    const stepTimer = setInterval(() => {
      if (stepIndex < STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }
    }, 900);

    (async () => {
      setCurrentStep(0);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/predict/dock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uniprot_id: uniprotId, smiles, drug_name: drugName }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || "Docking request failed");
        }

        const data: DockResult = await res.json();

        // let the animation reach the final step before revealing the result
        clearInterval(stepTimer);
        setCurrentStep(STEPS.length - 1);
        await new Promise((r) => setTimeout(r, 500));

        setResult(data);
        setIsSimulating(false);
        setIsComplete(true);

        const stateToEmit =
          data.binding_strength === "STRONG" ? "success" :
          data.binding_strength === "MODERATE" ? "partial" : "fail";
        onStateChange?.(stateToEmit);
      } catch (e: any) {
        clearInterval(stepTimer);
        setError(e.message || "Docking failed — please try again");
        setIsSimulating(false);
        onStateChange?.("fail");
      }
    })();

    return () => clearInterval(stepTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulating]);

  const handleStart = () => {
    setIsComplete(false);
    setResult(null);
    setError(null);
    setCurrentStep(-1);
    setIsSimulating(true);
    onStateChange?.('running');
  };

  const handleReset = () => {
    setIsComplete(false);
    setResult(null);
    setError(null);
    setCurrentStep(-1);
    setIsSimulating(false);
    onStateChange?.('idle');
  };

  const bindingStrength = result
    ? (result.binding_strength.toLowerCase() as 'strong' | 'moderate' | 'weak')
    : 'weak';
  const percent = result ? result.binding_score * 100 : 0;
  const kcalMol = result ? result.predicted_delta_g.toFixed(1) : null;

  return (
    <div className="bg-[#080d19] rounded-xl border border-[#1e2d4a]/60 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0d1425] px-4 py-3 border-b border-[#1e2d4a]/60 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-sm font-mono text-[#c8d6f0] uppercase tracking-wider">Live Molecular Docking</span>
        </div>
        {!isSimulating && !isComplete && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 text-xs font-bold font-mono bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 px-3 py-1.5 rounded transition-colors"
          >
            <Play className="w-3 h-3" />
            RUN SIMULATION
          </button>
        )}
        {(isComplete || error) && (
          <button
            onClick={handleReset}
            className="text-xs text-[#6b7fa3] hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Terminal Area */}
      <div className="p-4 font-mono text-sm h-[200px] flex flex-col justify-end bg-gradient-to-b from-[#080d19] to-[#0a1120]">
        {!isSimulating && !isComplete && !error && (
          <div className="text-center text-[#4b5a78] my-auto">
            Ready to simulate docking for <span className="text-cyan-400">{drugName}</span>.
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 my-auto">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {isSimulating && STEPS.map((step, index) => (
              index <= currentStep && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {index === currentStep ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className={index === currentStep ? "text-violet-300" : "text-[#6b7fa3]"}>
                    {step}
                  </span>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Final Result */}
        <AnimatePresence>
          {isComplete && result && kcalMol && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded bg-[#0d1425] border ${
                bindingStrength === 'strong' ? "border-emerald-500/30" : bindingStrength === 'moderate' ? "border-yellow-500/30" : "border-red-500/30"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {bindingStrength === 'strong' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : bindingStrength === 'moderate' ? (
                    <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <div className={`font-bold ${bindingStrength === 'strong' ? "text-emerald-400" : bindingStrength === 'moderate' ? "text-yellow-400" : "text-red-400"}`}>
                      {bindingStrength === 'strong' ? "STABLE CONFORMATION FOUND" : bindingStrength === 'moderate' ? "MODERATE BINDING AFFINITY" : "WEAK/UNSTABLE BINDING"}
                    </div>
                    <div className="text-[#6b7fa3] text-xs">Target Compatibility: <span className="text-white font-bold">{percent.toFixed(1)}%</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${bindingStrength === 'strong' ? "text-emerald-400" : bindingStrength === 'moderate' ? "text-yellow-400" : "text-red-400"}`}>
                    {kcalMol}
                  </div>
                  <div className="text-xs text-[#6b7fa3]">GNN-Predicted ΔG (kcal/mol)</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}