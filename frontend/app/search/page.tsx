"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { useDisease } from "@/hooks/useDisease";

const DISEASES = [
  { name: "Alzheimer's Disease", desc: "Amyloid plaques · tau tangles · neurodegeneration", emoji: "🧠", accent: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.2)" },
  { name: "Parkinson's Disease", desc: "Dopaminergic neuron loss · alpha-synuclein", emoji: "⚡", accent: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.2)" },
  { name: "Breast Cancer", desc: "HER2 amplification · BRCA mutations", emoji: "🎗️", accent: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.2)" },
  { name: "Type 2 Diabetes", desc: "Insulin resistance · PPARG · GLP-1 axis", emoji: "🩸", accent: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.2)" },
  { name: "COVID-19", desc: "SARS-CoV-2 · ACE2 receptor · cytokine storm", emoji: "🦠", accent: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.2)" },
  { name: "Rheumatoid Arthritis", desc: "TNF-alpha · JAK-STAT · autoimmune synovitis", emoji: "🦴", accent: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.2)" },
];

export default function SearchPage() {
  const router = useRouter();
  const { loading, suggestions, fetchSuggestions } = useDisease();

  const handleSearch = (query: string) => {
    router.push(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.25 }} />
      <div
        style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "rgba(0,212,255,0.04)", filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 860, margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 44 }}
        >
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 14px", borderRadius: 999,
              border: "1px solid rgba(0,212,255,0.2)",
              background: "rgba(0,212,255,0.04)",
              color: "#00d4ff", fontSize: 11,
              fontFamily: "monospace", letterSpacing: "0.1em",
              marginBottom: 20,
            }}
          >
            BIOMEDICAL SEARCH ENGINE
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700, color: "#ffffff",
              lineHeight: 1.15, marginBottom: 12,
            }}
          >
            Search a{" "}
            <span className="grad-cyan-violet">Disease</span>
          </h1>

          <p style={{ color: "#6b7fa3", fontSize: 15, maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Enter a disease name to retrieve genes, proteins, and AI-ranked drug repurposing candidates.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 52 }}
        >
          <SearchBar
            onSearch={handleSearch}
            onSuggestionsFetch={fetchSuggestions}
            suggestions={suggestions}
            loading={loading}
          />
        </motion.div>

        {/* Featured diseases */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <p
            style={{
              fontSize: 11, fontFamily: "monospace",
              color: "#4b5a78", letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            FEATURED DISEASES
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {DISEASES.map((d, i) => (
              <motion.button
                key={d.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => handleSearch(d.name)}
                style={{
                  textAlign: "left",
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: d.accent,
                  border: `1px solid ${d.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{d.emoji}</div>
                <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14, marginBottom: 4 }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 12, color: "#6b7fa3", lineHeight: 1.5 }}>
                  {d.desc}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 36, padding: "14px 18px", borderRadius: 10,
            background: "rgba(13,20,37,0.6)",
            border: "1px solid rgba(30,45,74,0.5)",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(0,212,255,0.4)" style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontSize: 12, color: "#4b5a78", lineHeight: 1.6 }}>
            Drug Nova uses curated biomedical data from{" "}
            <span style={{ color: "rgba(0,212,255,0.6)" }}>DisGeNET</span>,{" "}
            <span style={{ color: "rgba(0,212,255,0.6)" }}>ChEMBL</span>,{" "}
            <span style={{ color: "rgba(0,212,255,0.6)" }}>OpenFDA</span>, and{" "}
            <span style={{ color: "rgba(0,212,255,0.6)" }}>AlphaFold</span>.
            Results are for research exploration only and do not constitute medical advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
