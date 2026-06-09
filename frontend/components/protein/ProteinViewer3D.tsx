"use client";

import { useEffect, useRef, useState } from "react";

interface ProteinViewer3DProps {
  pdbId: string | null;
  uniprotId: string;
}

// NGL viewer type stubs (loaded from CDN at runtime)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NGL: any;
  }
}

export function ProteinViewer3D({ pdbId, uniprotId }: ProteinViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadNGL = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.NGL) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/ngl@2.3.1/dist/ngl.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load NGL"));
        document.head.appendChild(script);
      });
    };

    const initViewer = async () => {
      if (!containerRef.current) return;
      setStatus("loading");

      try {
        await loadNGL();
        if (cancelled) return;

        // Dispose previous stage
        if (stageRef.current) {
          stageRef.current.dispose();
          stageRef.current = null;
        }

        const stage = new window.NGL.Stage(containerRef.current, {
          backgroundColor: "#050810",
          quality: "medium",
          impostor: true,
          fog: false,
        });
        stageRef.current = stage;

        // Handle resize
        const handleResize = () => stage.handleResize();
        window.addEventListener("resize", handleResize);

        // Build the data URL — prefer PDB, fallback to AlphaFold CIF
        let dataUrl: string;
        let ext: string;

        if (pdbId) {
          dataUrl = `rcsb://${pdbId}`;
          ext = "pdb";
        } else {
          dataUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.cif`;
          ext = "cif";
        }

        const component = await stage.loadFile(dataUrl, { ext });
        if (cancelled) { stage.dispose(); return; }

        // Cartoon representation with cyan/violet coloring
        component.addRepresentation("cartoon", {
          colorScheme: "residueindex",
          colorScale: "RdYlBu",
          roughness: 0.5,
          metalness: 0.1,
        });

        // Surface (subtle)
        component.addRepresentation("surface", {
          opacity: 0.08,
          colorScheme: "electrostatic",
        });

        component.autoView();
        setStatus("ready");

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load structure");
          setStatus("error");
        }
      }
    };

    initViewer();

    return () => {
      cancelled = true;
      if (stageRef.current) {
        stageRef.current.dispose();
        stageRef.current = null;
      }
    };
  }, [pdbId, uniprotId]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 460,
        borderRadius: 14,
        overflow: "hidden",
        background: "#050810",
        border: "1px solid rgba(0,212,255,0.2)",
      }}
    >
      {/* NGL mounts here */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Loading overlay */}
      {status === "loading" && (
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "#050810", gap: 16,
          }}
        >
          {/* Spinner */}
          <div style={{ position: "relative", width: 48, height: 48 }}>
            <div
              style={{
                position: "absolute", inset: 0,
                border: "2px solid transparent",
                borderTopColor: "#00d4ff",
                borderRadius: "50%",
                animation: "spin3d 0.9s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute", inset: 4,
                border: "2px solid transparent",
                borderTopColor: "#a855f7",
                borderRadius: "50%",
                animation: "spin3d 1.4s linear infinite reverse",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#00d4ff",
                boxShadow: "0 0 8px rgba(0,212,255,0.8)",
              }}
            />
          </div>
          <p
            style={{
              fontSize: 12, color: "#4b5a78",
              fontFamily: "monospace", letterSpacing: "0.05em",
              animation: "blink3d 2s ease-in-out infinite",
            }}
          >
            Rendering 3D structure...
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "#050810", gap: 12, padding: 24, textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32 }}>⚠</div>
          <p style={{ fontSize: 13, color: "#f87171" }}>Could not load 3D structure</p>
          <p style={{ fontSize: 11, color: "#4b5a78", maxWidth: 300 }}>{errorMsg}</p>
          {pdbId && (
            <a
              href={`https://www.rcsb.org/3d-view/${pdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 8, padding: "7px 16px", borderRadius: 8,
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "#00d4ff", fontSize: 12, textDecoration: "none",
              }}
            >
              View on RCSB PDB ↗
            </a>
          )}
        </div>
      )}

      {/* Controls hint */}
      {status === "ready" && (
        <div
          style={{
            position: "absolute", bottom: 12, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 12,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(5,8,16,0.7)",
            border: "1px solid rgba(30,45,74,0.5)",
          }}
        >
          {[
            { icon: "🖱", text: "Drag to rotate" },
            { icon: "⚲", text: "Scroll to zoom" },
            { icon: "⇧", text: "Right-drag to pan" },
          ].map((h, i) => (
            <span key={i} style={{ fontSize: 10, color: "#4b5a78", whiteSpace: "nowrap" }}>
              {h.icon} {h.text}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin3d { to { transform: rotate(360deg); } }
        @keyframes blink3d { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
