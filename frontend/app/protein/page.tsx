"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getProteinStructure } from "@/lib/api";
import type { ProteinStructureResponse } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProteinViewer3D } from "@/components/protein/ProteinViewer3D";

// ─── Protein list ────────────────────────────────────────────────────────────
const FEATURED_PROTEINS = [
  { id: "P02649", name: "Apolipoprotein E",        pdb: "1NFN", disease: "Alzheimer's" },
  { id: "P37840", name: "Alpha-synuclein",          pdb: "1XQ8", disease: "Parkinson's" },
  { id: "Q9BYF1", name: "ACE2 Receptor",            pdb: "6M0J", disease: "COVID-19" },
  { id: "P04626", name: "HER2 / ErbB2",             pdb: "1N8Z", disease: "Breast Cancer" },
  { id: "P01375", name: "TNF-alpha",                pdb: "2AZ5", disease: "Rheumatoid Arthritis" },
  { id: "P23458", name: "JAK1",                     pdb: "3EYG", disease: "Rheumatoid Arthritis" },
  { id: "P05231", name: "Interleukin-6",            pdb: "1IL6", disease: "COVID-19 / RA" },
  { id: "P05067", name: "Amyloid Precursor Protein",pdb: "1AAP", disease: "Alzheimer's" },
];

// ─── PDB Viewer ──────────────────────────────────────────────────────────────
// Uses the RCSB PDB Mol* viewer — fast, lightweight, no login needed
// Falls back to NGL viewer if PDB id unavailable
function MolStarViewer({ pdbId, uniprotId }: { pdbId: string | null; uniprotId: string }) {
  const [key, setKey] = useState(0); // force remount on change

  useEffect(() => {
    setKey((k) => k + 1);
  }, [pdbId, uniprotId]);

  // Primary: RCSB PDB Mol* embed (loads in ~2s)
  if (pdbId) {
    const src = `https://www.rcsb.org/3d-view/${pdbId}?preset=default`;
    return (
      <div
        key={key}
        style={{
          width: "100%", height: 460,
          borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(0,212,255,0.2)",
          background: "#050810",
          position: "relative",
        }}
      >
        <iframe
          key={`${pdbId}-${key}`}
          src={src}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={`3D structure of ${pdbId}`}
          allow="fullscreen"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: AlphaFold Mol* direct viewer URL (lighter than the full entry page)
  const afSrc = `https://molstar.org/viewer/?pdb-dev=https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.cif`;
  return (
    <div
      key={key}
      style={{
        width: "100%", height: 460,
        borderRadius: 14, overflow: "hidden",
        border: "1px solid rgba(0,212,255,0.2)",
        background: "#050810",
      }}
    >
      <iframe
        src={afSrc}
        style={{ width: "100%", height: "100%", border: "none" }}
        title={`AlphaFold structure ${uniprotId}`}
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  );
}

// ─── Page content ────────────────────────────────────────────────────────────
function ProteinViewerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "P37840";

  const [selectedId, setSelectedId] = useState(initialId);
  const [protein, setProtein] = useState<ProteinStructureResponse | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [customId, setCustomId] = useState("");

  // Current PDB id derived from featured list or fetched protein
  const currentPdb =
    FEATURED_PROTEINS.find((p) => p.id === selectedId)?.pdb ??
    protein?.pdb_id ??
    null;

  useEffect(() => {
    if (!selectedId) return;
    setMetaLoading(true);
    getProteinStructure(selectedId)
      .then(setProtein)
      .catch(() =>
        setProtein({
          uniprot_id: selectedId,
          protein_name: FEATURED_PROTEINS.find((p) => p.id === selectedId)?.name ?? "Protein",
          alphafold_url: `https://alphafold.ebi.ac.uk/entry/${selectedId}`,
          pdb_id: FEATURED_PROTEINS.find((p) => p.id === selectedId)?.pdb ?? null,
          description: "Structure data via AlphaFold / RCSB PDB.",
        })
      )
      .finally(() => setMetaLoading(false));
  }, [selectedId]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customId.trim()) {
      setSelectedId(customId.trim().toUpperCase());
      setCustomId("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        padding: "0 0 64px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 0" }}>

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#00d4ff", display: "inline-block",
                animation: "blink 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 11, fontFamily: "monospace",
                color: "rgba(0,212,255,0.6)", letterSpacing: "0.12em",
              }}
            >
              3D PROTEIN STRUCTURE VIEWER
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              fontWeight: 700, color: "#ffffff",
              marginBottom: 8, lineHeight: 1.2,
            }}
          >
            Protein Structure Explorer
          </h1>
          <p style={{ fontSize: 14, color: "#6b7fa3", maxWidth: 520, lineHeight: 1.65 }}>
            Interactive 3D protein structures via RCSB PDB and AlphaFold.
            Select a protein or enter a UniProt ID.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* UniProt search */}
            <div
              style={{
                padding: 16, borderRadius: 12,
                background: "rgba(13,20,37,0.8)",
                border: "1px solid rgba(30,45,74,0.6)",
              }}
            >
              <p
                style={{
                  fontSize: 10, fontFamily: "monospace",
                  color: "#4b5a78", letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                SEARCH BY UNIPROT ID
              </p>
              <form onSubmit={handleCustomSearch} style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="e.g. P02649"
                  style={{
                    flex: 1, padding: "8px 10px",
                    borderRadius: 8, fontSize: 12,
                    background: "rgba(30,45,74,0.3)",
                    border: "1px solid rgba(30,45,74,0.7)",
                    color: "#c8d6f0", outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    color: "#00d4ff", fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
              </form>
            </div>

            {/* Protein list */}
            <div
              style={{
                borderRadius: 12,
                background: "rgba(13,20,37,0.8)",
                border: "1px solid rgba(30,45,74,0.6)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px 8px",
                  fontSize: 10, fontFamily: "monospace",
                  color: "#4b5a78", letterSpacing: "0.1em",
                  borderBottom: "1px solid rgba(30,45,74,0.4)",
                }}
              >
                FEATURED PROTEINS
              </div>
              {FEATURED_PROTEINS.map((p) => {
                const active = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 14px",
                      background: active ? "rgba(0,212,255,0.07)" : "transparent",
                      borderTop: "none",
                      borderRight: "none",
                      borderLeft: active ? "2px solid #00d4ff" : "2px solid transparent",
                      borderBottom: "1px solid rgba(30,45,74,0.3)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13, fontWeight: 500,
                        color: active ? "#00d4ff" : "#c8d6f0",
                        marginBottom: 2,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 10, fontFamily: "monospace",
                          color: active ? "rgba(0,212,255,0.6)" : "#4b5a78",
                        }}
                      >
                        {p.id}
                      </span>
                      <span style={{ fontSize: 10, color: "#2d3f5a" }}>·</span>
                      <span style={{ fontSize: 10, color: "#4b5a78" }}>{p.disease}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Main viewer ── */}
          <div>
            {metaLoading ? (
              <LoadingSpinner message="Loading protein data..." size="sm" />
            ) : protein ? (
              <motion.div
                key={protein.uniprot_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Protein info bar */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "rgba(13,20,37,0.8)",
                    border: "1px solid rgba(0,212,255,0.15)",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 20, fontWeight: 700,
                        color: "#ffffff", marginBottom: 8,
                      }}
                    >
                      {protein.protein_name}
                    </h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {/* UniProt badge */}
                      <span
                        style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: 11,
                          fontFamily: "monospace",
                          background: "rgba(0,212,255,0.08)",
                          border: "1px solid rgba(0,212,255,0.2)",
                          color: "#00d4ff",
                        }}
                      >
                        {protein.uniprot_id}
                      </span>
                      {/* PDB badge */}
                      {currentPdb && (
                        <span
                          style={{
                            padding: "3px 10px", borderRadius: 6, fontSize: 11,
                            fontFamily: "monospace",
                            background: "rgba(168,85,247,0.08)",
                            border: "1px solid rgba(168,85,247,0.2)",
                            color: "#a855f7",
                          }}
                        >
                          PDB: {currentPdb}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7fa3", lineHeight: 1.6, maxWidth: 520 }}>
                      {protein.description}
                    </p>
                  </div>

                  {/* External links */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <a
                      href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprot_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "7px 14px", borderRadius: 8,
                        background: "rgba(0,212,255,0.06)",
                        border: "1px solid rgba(0,212,255,0.2)",
                        color: "#00d4ff", fontSize: 12,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      AlphaFold ↗
                    </a>
                    {currentPdb && (
                      <a
                        href={`https://www.rcsb.org/structure/${currentPdb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "7px 14px", borderRadius: 8,
                          background: "rgba(168,85,247,0.06)",
                          border: "1px solid rgba(168,85,247,0.2)",
                          color: "#a855f7", fontSize: 12,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        RCSB PDB ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 3D Viewer */}
                <ProteinViewer3D pdbId={currentPdb} uniprotId={protein.uniprot_id} />

                {/* Source note */}
                <p
                  style={{
                    fontSize: 11, color: "#2d3f5a",
                    textAlign: "center", marginTop: 10,
                    fontFamily: "monospace",
                  }}
                >
                  Structure predictions sourced from{" "}
                  <a
                    href="https://alphafold.ebi.ac.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "rgba(0,212,255,0.4)", textDecoration: "underline" }}
                  >
                    AlphaFold Protein Structure Database
                  </a>
                  {" "}(DeepMind / EMBL-EBI) &{" "}
                  <a
                    href="https://www.rcsb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "rgba(0,212,255,0.4)", textDecoration: "underline" }}
                  >
                    RCSB PDB
                  </a>
                </p>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @media (max-width: 768px) {
          .protein-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function ProteinPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading protein viewer..." />}>
      <ProteinViewerContent />
    </Suspense>
  );
}
