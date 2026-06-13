"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Analyzing biomedical data...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {/* Layered spinning rings */}
      <div className="relative" style={{ width: s, height: s }}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent border-t-violet-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-cyan-500/20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400"
          style={{ boxShadow: "0 0 8px rgba(0,212,255,0.8)" }}
        />
      </div>

      {/* Scanning bars */}
      <div className="flex gap-1 items-end h-6">
        {[0.3, 0.6, 1, 0.7, 0.4].map((h, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-cyan-500/60"
            animate={{ scaleY: [h, 1, h] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            style={{ originY: 1, height: "100%" }}
          />
        ))}
      </div>

      {message && (
        <motion.p
          className="text-sm text-[#6b7fa3] font-mono tracking-wide"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
