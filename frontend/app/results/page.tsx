"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDisease } from "@/hooks/useDisease";
import { DiseaseOverview } from "@/components/results/DiseaseOverview";
import { DrugCard } from "@/components/results/DrugCard";
import { AIExplanationPanel } from "@/components/results/AIExplanationPanel";
import { PredictionEngine } from "@/components/results/PredictionEngine";
import { DockingSandbox } from "@/components/results/DockingSandbox";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SearchBar } from "@/components/search/SearchBar";
import type { Drug } from "@/types";
import dynamic from "next/dynamic";

const KnowledgeGraph = dynamic(
  () => import("@/components/graph/KnowledgeGraph").then((m) => m.KnowledgeGraph),
  { ssr: false, loading: () => <LoadingSpinner message="Loading graph engine..." /> }
);

type Tab = "overview" | "predict" | "docking" | "drugs" | "graph";

const TAB_STYLES = {
  active: {
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
    color: "#00d4ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    transition: "all 0.2s",
  } as React.CSSProperties,
  inactive: {
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: "transparent", border: "1px solid transparent",
    color: "#6b7fa3", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    transition: "all 0.2s",
  } as React.CSSProperties,
};

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") || "";

  const { results, loading, error, search, suggestions, fetchSuggestions } = useDisease();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // ✅ Use effect for auto-search — never call setState/router during render
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
    // Only run on mount / when query param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = useCallback((query: string) => {
    router.push(`/results?q=${encodeURIComponent(query)}`, { scroll: false });
    search(query);
    setActiveTab("overview");
  }, [router, search]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "predict", label: "Prediction Engine" },
    { id: "docking", label: "Molecular Docking" },
    { id: "drugs", label: results ? `Drug Candidates (${results.drugs.length})` : "Drug Candidates" },
    { id: "graph", label: "Knowledge Graph" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        padding: "0 0 64px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Search bar */}
        <div style={{ padding: "36px 0 28px" }}>
          <SearchBar
            onSearch={handleSearch}
            onSuggestionsFetch={fetchSuggestions}
            suggestions={suggestions}
            loading={loading}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ paddingTop: 48, paddingBottom: 48 }}>
            <LoadingSpinner message="Querying biomedical databases..." size="lg" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: 520, margin: "0 auto" }}
          >
            <div
              style={{
                padding: 28, borderRadius: 14, textAlign: "center",
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <div style={{ fontSize: 18, color: "#f87171", marginBottom: 8 }}>⚠ Search Failed</div>
              <p style={{ fontSize: 13, color: "#6b7fa3", marginBottom: 10 }}>{error}</p>
              <p style={{ fontSize: 11, color: "#4b5a78", fontFamily: "monospace" }}>
                Make sure the FastAPI backend is running on port 8000.
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

            {/* Tab bar */}
            <div
              style={{
                display: "flex", gap: 4, marginBottom: 24,
                padding: 4, borderRadius: 12, width: "fit-content",
                background: "rgba(13,20,37,0.8)",
                border: "1px solid rgba(30,45,74,0.6)",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={activeTab === tab.id ? TAB_STYLES.active : TAB_STYLES.inactive}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && <DiseaseOverview data={results} />}

            {/* Prediction Engine tab */}
            {activeTab === "predict" && <PredictionEngine diseaseName={results.disease.name} />}

            {/* Docking Sandbox tab */}
            {activeTab === "docking" && <DockingSandbox diseaseName={results.disease.name} proteins={results.proteins} />}

            {/* Drugs tab */}
            {activeTab === "drugs" && (
              <div>
                <div
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
                      Drug Repurposing Candidates
                    </h3>
                    <p style={{ fontSize: 13, color: "#6b7fa3" }}>
                      Ranked by multi-factor confidence scoring pipeline
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12,
                      fontFamily: "monospace", color: "#4b5a78",
                      background: "rgba(13,20,37,0.8)",
                      border: "1px solid rgba(30,45,74,0.6)",
                    }}
                  >
                    {results.drugs.length} candidates
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 14,
                  }}
                >
                  {results.drugs.map((drug, i) => (
                    <DrugCard key={drug.id} drug={drug} rank={i + 1} onExplain={setSelectedDrug} />
                  ))}
                </div>
              </div>
            )}

            {/* Graph tab */}
            {activeTab === "graph" && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
                    Knowledge Graph
                  </h3>
                  <p style={{ fontSize: 13, color: "#6b7fa3" }}>
                    Interactive disease-gene-protein-drug network — drag, zoom, explore
                  </p>
                </div>
                <KnowledgeGraph diseaseName={results.disease.name} />
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#4b5a78" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔬</div>
            <p style={{ fontSize: 14 }}>Search a disease above to get started.</p>
          </div>
        )}
      </div>

      {/* AI Explanation modal */}
      <AIExplanationPanel
        drug={selectedDrug}
        diseaseName={results?.disease.name ?? ""}
        onClose={() => setSelectedDrug(null)}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading results..." />}>
      <ResultsContent />
    </Suspense>
  );
}
