"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.15)",
    title: "Knowledge Graph",
    desc: "Visualize disease-gene-protein-drug relationships as an interactive animated network.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
    title: "AI Explanations",
    desc: "Structured scientific rationales for each repurposing candidate, powered by LLMs.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.15)",
    title: "3D Protein Structures",
    desc: "Explore AlphaFold protein structures with interactive 3D molecular visualization.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
    title: "Confidence Scoring",
    desc: "Multi-factor weighted pipeline ranks candidates by pharmacological relevance and evidence.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.15)",
    title: "Public Biomedical Data",
    desc: "Integrates OpenFDA, ChEMBL, DisGeNET, and AlphaFold — peer-reviewed open data.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
    title: "Literature References",
    desc: "Every drug candidate is backed by curated PubMed citations for scientific validation.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      style={{
        padding: "80px 24px",
        position: "relative",
        background: "linear-gradient(180deg, transparent 0%, rgba(8,13,26,0.4) 50%, transparent 100%)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <span
            style={{
              display: "block", fontSize: 11, fontFamily: "monospace",
              color: "rgba(0,212,255,0.6)", letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            CAPABILITIES
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700, color: "#ffffff",
              marginBottom: 12, lineHeight: 1.2,
            }}
          >
            Scientific AI at Every Step
          </h2>
          <p style={{ color: "#6b7fa3", maxWidth: 480, margin: "0 auto", fontSize: 15, lineHeight: 1.6 }}>
            From disease search to molecular visualization — an end-to-end bioinformatics workflow.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{
                padding: "24px",
                borderRadius: 14,
                background: "rgba(13,20,37,0.7)",
                border: "1px solid rgba(30,45,74,0.6)",
                transition: "border-color 0.2s, transform 0.2s",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  display: "inline-flex", padding: 10, borderRadius: 10,
                  background: f.bg, border: `1px solid ${f.border}`,
                  color: f.color, marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 15, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ color: "#6b7fa3", fontSize: 13.5, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
