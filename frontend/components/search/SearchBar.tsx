"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionsFetch: (query: string) => void;
  suggestions: Array<{ key: string; name: string }>;
  loading: boolean;
}

const POPULAR = [
  "Alzheimer",
  "Parkinson",
  "Breast Cancer",
  "Type 2 Diabetes",
  "COVID-19",
  "Rheumatoid Arthritis",
  "Asthma",
  "Osteoporosis",
  "Major Depressive Disorder",
  "Non-Small Cell Lung Cancer"
];

export function SearchBar({ onSearch, onSuggestionsFetch, suggestions, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((q: string) => onSuggestionsFetch(q), 300),
    [onSuggestionsFetch]
  );

  useEffect(() => {
    if (query.length >= 2) {
      debouncedFetch(query);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [query, debouncedFetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setOpen(false);
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setOpen(false);
    onSearch(name);
  };

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        {/* Input wrapper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(13,20,37,0.9)",
            border: "1px solid rgba(30,45,74,0.8)",
            borderRadius: 12,
            overflow: "visible",
            transition: "border-color 0.2s",
          }}
        >
          {/* Search icon */}
          <div style={{ padding: "0 12px 0 16px", color: "#4b5a78", flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search disease (e.g. Alzheimer, COVID-19...)"
            autoComplete="off"
            style={{
              flex: 1,
              padding: "14px 8px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#c8d6f0",
              fontSize: 14,
              fontFamily: "monospace",
            }}
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              margin: "6px",
              padding: "10px 20px",
              borderRadius: 8,
              background: "rgba(0,212,255,0.12)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "#00d4ff",
              fontSize: 13,
              fontWeight: 600,
              cursor: query.trim() && !loading ? "pointer" : "not-allowed",
              opacity: !query.trim() || loading ? 0.45 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {loading ? (
              <svg
                width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : null}
            Analyze
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0, right: 0,
                background: "#0d1425",
                border: "1px solid rgba(30,45,74,0.8)",
                borderRadius: 10,
                overflow: "hidden",
                zIndex: 100,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onMouseDown={() => handleSelect(s.name)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(30,45,74,0.4)",
                    color: "#c8d6f0",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4b5a78">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {s.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Popular tags */}
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#4b5a78" }}>Quick:</span>
        {POPULAR.map((name) => (
          <button
            key={name}
            onClick={() => { setQuery(name); onSearch(name); }}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              background: "transparent",
              border: "1px solid rgba(30,45,74,0.7)",
              color: "#6b7fa3",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
