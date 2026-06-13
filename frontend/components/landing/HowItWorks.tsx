"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Search a Disease",
    desc: "Enter a disease name. Drug Nova retrieves associated genes and proteins from biomedical databases.",
    accent: "#00d4ff",
    accentBg: "rgba(0,212,255,0.06)",
    accentBorder: "rgba(0,212,255,0.18)",
  },
  {
    num: "02",
    title: "Analyze Target Network",
    desc: "The knowledge graph maps disease-gene-protein interactions and identifies druggable targets.",
    accent: "#a855f7",
    accentBg: "rgba(168,85,247,0.06)",
    accentBorder: "rgba(168,85,247,0.18)",
  },
  {
    num: "03",
    title: "Score Repurposing Candidates",
    desc: "Approved drugs are ranked by a multi-factor confidence pipeline combining pharmacological evidence.",
    accent: "#00d4ff",
    accentBg: "rgba(0,212,255,0.06)",
    accentBorder: "rgba(0,212,255,0.18)",
  },
  {
    num: "04",
    title: "Generate AI Explanations",
    desc: "LLM-generated scientific rationales explain why each drug may work and which pathways are involved.",
    accent: "#a855f7",
    accentBg: "rgba(168,85,247,0.06)",
    accentBorder: "rgba(168,85,247,0.18)",
  },
];

export function HowItWorks() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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
              color: "rgba(168,85,247,0.6)", letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            WORKFLOW
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700, color: "#ffffff",
              marginBottom: 12, lineHeight: 1.2,
            }}
          >
            How Drug Nova Works
          </h2>
          <p style={{ color: "#6b7fa3", maxWidth: 440, margin: "0 auto", fontSize: 15, lineHeight: 1.6 }}>
            A four-stage AI pipeline turning disease context into ranked repurposing insights.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{
                position: "relative",
                padding: "28px 24px",
                borderRadius: 14,
                background: step.accentBg,
                border: `1px solid ${step.accentBorder}`,
                overflow: "hidden",
              }}
            >
              {/* Background number */}
              <div
                style={{
                  position: "absolute", top: 12, right: 16,
                  fontFamily: "monospace", fontSize: 48, fontWeight: 900,
                  color: step.accent, opacity: 0.08, lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              {/* Step indicator */}
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: step.accentBg,
                    border: `1px solid ${step.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                    color: step.accent,
                  }}
                >
                  {step.num}
                </div>
              </div>

              <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 16, marginBottom: 10 }}>
                {step.title}
              </h3>
              <p style={{ color: "#6b7fa3", fontSize: 13.5, lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
