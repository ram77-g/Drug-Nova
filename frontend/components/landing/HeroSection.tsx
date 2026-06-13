"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleField } from "./ParticleField";

const STATS = [
  { value: "10+", label: "Disease Models" },
  { value: "50+", label: "Proteins" },
  { value: "100+", label: "Drug Candidates" },
  { value: "3D", label: "Protein Viewer" },
  { value: "Align", label: "Protein Comparison" },
];

const PILLS = [
  "Knowledge Graphs",
  "Confidence Scoring",
  "AlphaFold Integration",
  "AI Rationale",
];

export function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "80px 24px 60px",
      }}
    >
      {/* Backgrounds */}
      <ParticleField />
      <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
      <div
        style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 400, borderRadius: "50%",
          background: "rgba(0,212,255,0.05)", filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "25%", right: "20%",
          width: 350, height: 350, borderRadius: "50%",
          background: "rgba(124,58,237,0.06)", filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Content block */}
      <div
        style={{
          position: "relative", zIndex: 10,
          maxWidth: 760, width: "100%",
          textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999,
            border: "1px solid rgba(0,212,255,0.25)",
            background: "rgba(0,212,255,0.05)",
            color: "#00d4ff", fontSize: 11,
            fontFamily: "monospace", letterSpacing: "0.1em",
            marginBottom: 28,
          }}
        >
          AI-POWERED DRUG REPURPOSING PLATFORM
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: 20,
          }}
        >
          Discover{" "}
          <span className="grad-cyan-violet">New Uses</span>
          <br />
          for Existing{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a855f7, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Drugs
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          style={{
            fontSize: 17,
            color: "#6b7fa3",
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          Drug Nova combines public biomedical databases, explainable AI, and interactive
          knowledge graphs to surface compelling drug repurposing candidates.
        </motion.p>

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{
            display: "flex", flexWrap: "wrap",
            justifyContent: "center", gap: 8,
            marginBottom: 36,
          }}
        >
          {PILLS.map((pill, i) => (
            <span
              key={i}
              style={{
                padding: "5px 14px", borderRadius: 999, fontSize: 12,
                background: "rgba(30,45,74,0.5)",
                border: "1px solid rgba(30,45,74,0.8)",
                color: "#6b7fa3",
              }}
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 56 }}
        >
          <Link href="/search" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 10,
                background: "rgba(0,212,255,0.12)",
                border: "1px solid rgba(0,212,255,0.35)",
                color: "#00d4ff", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Start Exploring
            </button>
          </Link>

          <Link href="/protein" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 10,
                background: "transparent",
                border: "1px solid rgba(30,45,74,0.8)",
                color: "#c8d6f0", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              View Proteins
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.56 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12, width: "100%", maxWidth: 640,
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "16px 8px", borderRadius: 12, textAlign: "center",
                background: "rgba(13,20,37,0.7)",
                border: "1px solid rgba(30,45,74,0.6)",
              }}
            >
              <div
                className="grad-cyan-violet"
                style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginBottom: 2 }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "#4b5a78" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          color: "#4b5a78",
        }}
      >
        <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em" }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 12, height: 12,
            borderBottom: "2px solid #4b5a78",
            borderRight: "2px solid #4b5a78",
            transform: "rotate(45deg)",
          }}
        />
      </motion.div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
