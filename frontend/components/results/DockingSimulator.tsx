"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

interface DockingSimulatorProps {
  drugName: string;
  affinityScore: number;
  onStateChange?: (state: 'idle' | 'running' | 'success' | 'partial' | 'fail') => void;
}

const STEPS = [
  "Fetching 3D ligand conformers...",
  "Aligning with primary target binding pocket...",
  "Evaluating steric clashes and hydrophobic interfaces...",
  "Calculating electrostatic and hydrogen bond energies...",
  "Minimizing final Binding Energy (ΔG)..."
];

export function DockingSimulator({ drugName, affinityScore, onStateChange }: DockingSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);

  // Map the 0-1 affinity score to realistic kcal/mol
  // High affinity (0.9+) -> -11 to -12 kcal/mol
  // Low affinity (0.2+) -> -3 to -4 kcal/mol
  const kcalMol = (-2.0 - (affinityScore * 10.0)).toFixed(1);
  
  const percent = affinityScore * 100;
  let bindingStrength: 'strong' | 'moderate' | 'weak' = 'weak';
  if (percent >= 75) bindingStrength = 'strong';
  else if (percent >= 50) bindingStrength = 'moderate';

  useEffect(() => {
    if (!isSimulating) return;

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < STEPS.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setIsComplete(true);
          const stateToEmit = bindingStrength === 'strong' ? 'success' : bindingStrength === 'moderate' ? 'partial' : 'fail';
          onStateChange?.(stateToEmit);
        }, 800);
      }
    }, 1200); // 1.2s per step

    return () => clearInterval(interval);
  }, [isSimulating, bindingStrength, onStateChange]);

  const handleStart = () => {
    setIsComplete(false);
    setCurrentStep(-1);
    setIsSimulating(true);
    onStateChange?.('running');
  };

  const handleReset = () => {
    setIsComplete(false);
    setCurrentStep(-1);
    setIsSimulating(false);
    onStateChange?.('idle');
  };

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
        {isComplete && (
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
        {!isSimulating && !isComplete && (
          <div className="text-center text-[#4b5a78] my-auto">
            Ready to simulate docking for <span className="text-cyan-400">{drugName}</span>.
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
          {isComplete && (
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
                  <div className="text-xs text-[#6b7fa3]">Calculated ΔG (kcal/mol)</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
