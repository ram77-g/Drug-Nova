"use client";

import { useEffect, useRef, useState } from "react";
import { getBindingSites } from "@/lib/api";

interface ProteinViewer3DProps {
  pdbId: string | null;
  uniprotId: string;
  performanceMode?: boolean;
}

// NGL viewer type stubs (loaded from CDN at runtime)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NGL: any;
  }
}

export function ProteinViewer3D({ pdbId, uniprotId, performanceMode = false }: ProteinViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [viewMode, setViewMode] = useState<"cartoon" | "surface" | "stick">("cartoon");
  const previousViewMode = useRef(viewMode);
  
  const [colorScheme, setColorScheme] = useState<"default" | "bfactor" | "hydrophobicity">("default");
  const previousColorScheme = useRef(colorScheme);
  
  const [autoRotate, setAutoRotate] = useState(false);
  const [showBindingSite, setShowBindingSite] = useState(false);
  const previousShowBindingSite = useRef(showBindingSite);
  const [realBindingSites, setRealBindingSites] = useState("");
  const previousRealBindingSites = useRef(realBindingSites);

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
      
      getBindingSites(uniprotId).then(res => {
        if (!cancelled) setRealBindingSites(res);
      }).catch(console.error);

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
          quality: performanceMode ? "low" : "medium",
          impostor: !performanceMode,
          fog: false,
        });
        stageRef.current = stage;

        // Handle resize
        const handleResize = () => stage.handleResize();
        window.addEventListener("resize", handleResize);

        // Build the data URL — prefer local downloaded files first, then fallback to online APIs
        let component = null;
        let loaded = false;

        const localOptions: { url: string, ext: string }[] = [
          { url: `/structures/${uniprotId}.pdb`, ext: "pdb" },
          { url: `/structures/${uniprotId}.cif`, ext: "cif" },
          { url: `/structures/AF-${uniprotId}-F1-model_v6.pdb`, ext: "pdb" },
          { url: `/structures/AF-${uniprotId}-F1-model_v6.cif`, ext: "cif" },
          { url: `/structures/AF-${uniprotId}-F1-model_v4.pdb`, ext: "pdb" },
          { url: `/structures/AF-${uniprotId}-F1-model_v4.cif`, ext: "cif" },
        ];

        for (let i = 2; i <= 10; i++) {
          localOptions.push({ url: `/structures/AF-${uniprotId}-${i}-F1-model_v6.pdb`, ext: "pdb" });
          localOptions.push({ url: `/structures/AF-${uniprotId}-${i}-F1-model_v6.cif`, ext: "cif" });
          localOptions.push({ url: `/structures/AF-${uniprotId}-${i}-F1-model_v4.pdb`, ext: "pdb" });
          localOptions.push({ url: `/structures/AF-${uniprotId}-${i}-F1-model_v4.cif`, ext: "cif" });
        }

        for (const opt of localOptions) {
          try {
            const check = await fetch(opt.url, { method: "HEAD" });
            if (check.ok) {
              component = await stage.loadFile(opt.url, { ext: opt.ext });
              loaded = true;
              break;
            }
          } catch {
            // Silently fail and check next local option
          }
        }

        if (!loaded) {
          let dataUrl: string;
          let ext: string;
          if (pdbId) {
            dataUrl = `rcsb://${pdbId}`;
            ext = "pdb";
          } else {
            dataUrl = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.cif`;
            ext = "cif";
          }
          component = await stage.loadFile(dataUrl, { ext });
        }

        if (cancelled) {
          stage.dispose();
          return;
        }

        let cs = colorScheme === "default" ? "residueindex" : colorScheme;
        if (viewMode === "surface" && colorScheme === "default") cs = "electrostatic";
        if (viewMode === "stick" && colorScheme === "default") cs = "element";

        if (viewMode === "cartoon") {
          component.addRepresentation("cartoon", {
            colorScheme: cs,
            ...(cs === "residueindex" ? { colorScale: "RdYlBu" } : {}),
            roughness: 0.5,
            metalness: 0.1,
          });
        } else if (viewMode === "surface") {
          component.addRepresentation("surface", {
            opacity: 0.8,
            colorScheme: cs,
          });
        } else {
          component.addRepresentation("ball+stick", {
            colorScheme: cs,
          });
        }

        if (showBindingSite && realBindingSites) {
          component.addRepresentation("ball+stick", {
            sele: realBindingSites,
            color: "#f43f5e",
            opacity: 0.9,
            roughness: 0.2,
            metalness: 0.5,
          });
          component.addRepresentation("surface", {
            sele: realBindingSites,
            color: "#f43f5e",
            opacity: 0.4,
          });
        }

        component.autoView();
        if (autoRotate) stage.setSpin(true);
        compRef.current = component;
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

  useEffect(() => {
    if (compRef.current && status === "ready" && (
      previousViewMode.current !== viewMode || 
      previousColorScheme.current !== colorScheme || 
      previousShowBindingSite.current !== showBindingSite ||
      previousRealBindingSites.current !== realBindingSites
    )) {
      previousViewMode.current = viewMode;
      previousColorScheme.current = colorScheme;
      previousShowBindingSite.current = showBindingSite;
      previousRealBindingSites.current = realBindingSites;
      compRef.current.removeAllRepresentations();

      let cs = colorScheme === "default" ? "residueindex" : colorScheme;
      if (viewMode === "surface" && colorScheme === "default") cs = "electrostatic";
      if (viewMode === "stick" && colorScheme === "default") cs = "element";

      if (viewMode === "cartoon") {
        compRef.current.addRepresentation("cartoon", {
          colorScheme: cs,
          ...(cs === "residueindex" ? { colorScale: "RdYlBu" } : {}),
          roughness: 0.5,
          metalness: 0.1,
        });
      } else if (viewMode === "surface") {
        compRef.current.addRepresentation("surface", {
          opacity: 0.8,
          colorScheme: cs,
        });
      } else {
        compRef.current.addRepresentation("ball+stick", {
          colorScheme: cs,
        });
      }

      if (showBindingSite && realBindingSites) {
        compRef.current.addRepresentation("ball+stick", {
          sele: realBindingSites,
          color: "#f43f5e",
          opacity: 0.9,
          roughness: 0.2,
          metalness: 0.5,
        });
        compRef.current.addRepresentation("surface", {
          sele: realBindingSites,
          color: "#f43f5e",
          opacity: 0.4,
        });
        compRef.current.autoView(realBindingSites);
      } else {
        compRef.current.autoView();
      }
    }
  }, [viewMode, colorScheme, showBindingSite, status, realBindingSites]);

  useEffect(() => {
    if (stageRef.current && status === "ready") {
      stageRef.current.setSpin(autoRotate);
    }
  }, [autoRotate, status]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          
          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(13,20,37,0.8)",
              border: "1px solid rgba(30,45,74,0.6)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("cartoon")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.2s",
                color: viewMode === "cartoon" ? "#00d4ff" : "#6b7fa3",
                background: viewMode === "cartoon" ? "rgba(0,212,255,0.1)" : "transparent",
              }}
            >
              Cartoon
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("surface")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", borderLeft: "1px solid rgba(30,45,74,0.6)", cursor: "pointer", transition: "all 0.2s",
                color: viewMode === "surface" ? "#00d4ff" : "#6b7fa3",
                background: viewMode === "surface" ? "rgba(0,212,255,0.1)" : "transparent",
              }}
            >
              Surface
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("stick")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", borderLeft: "1px solid rgba(30,45,74,0.6)", cursor: "pointer", transition: "all 0.2s",
                color: viewMode === "stick" ? "#00d4ff" : "#6b7fa3",
                background: viewMode === "stick" ? "rgba(0,212,255,0.1)" : "transparent",
              }}
            >
              Ball & Stick
            </button>
          </div>

          {/* Color scheme toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(13,20,37,0.8)",
              border: "1px solid rgba(30,45,74,0.6)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              suppressHydrationWarning
              onClick={() => setColorScheme("default")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.2s",
                color: colorScheme === "default" ? "#a855f7" : "#6b7fa3",
                background: colorScheme === "default" ? "rgba(168,85,247,0.1)" : "transparent",
              }}
            >
              Default Colors
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setColorScheme("bfactor")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", borderLeft: "1px solid rgba(30,45,74,0.6)", cursor: "pointer", transition: "all 0.2s",
                color: colorScheme === "bfactor" ? "#a855f7" : "#6b7fa3",
                background: colorScheme === "bfactor" ? "rgba(168,85,247,0.1)" : "transparent",
              }}
            >
              pLDDT Confidence
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setColorScheme("hydrophobicity")}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", borderLeft: "1px solid rgba(30,45,74,0.6)", cursor: "pointer", transition: "all 0.2s",
                color: colorScheme === "hydrophobicity" ? "#a855f7" : "#6b7fa3",
                background: colorScheme === "hydrophobicity" ? "rgba(168,85,247,0.1)" : "transparent",
              }}
            >
              Hydrophobicity
            </button>
          </div>

          {/* Predicted Pocket Toggle */}
          <button
            onClick={() => setShowBindingSite(!showBindingSite)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              border: "1px solid",
              borderColor: showBindingSite ? "rgba(244,63,94,0.4)" : "rgba(30,45,74,0.6)",
              background: showBindingSite ? "rgba(244,63,94,0.1)" : "rgba(13,20,37,0.8)",
              color: showBindingSite ? "#f43f5e" : "#6b7fa3",
              borderRadius: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {showBindingSite ? "⏺ Reset View" : "⚬ Target Binding Pockets"}
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              border: "1px solid",
              borderColor: autoRotate ? "rgba(34,197,94,0.4)" : "rgba(30,45,74,0.6)",
              background: autoRotate ? "rgba(34,197,94,0.1)" : "rgba(13,20,37,0.8)",
              color: autoRotate ? "#22c55e" : "#6b7fa3",
              borderRadius: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {autoRotate ? "⏹ Stop Spin" : "⟳ Auto Spin"}
          </button>
        </div>
      </div>
    </div>
  );
}
