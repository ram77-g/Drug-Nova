"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 1.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#050810",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: "24px" }}
            >
              {/* Logo SVG container with gradient border */}
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
                  padding: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#050810",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* 3 Wavy lines */}
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#splash-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <path d="M4 7c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
                    <path d="M4 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
                    <path d="M4 17c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}
              >
                <span style={{ color: "#ffffff" }}>Drug</span>
                <span
                  style={{
                    background: "linear-gradient(90deg, #00d4ff, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Nova
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.7, delay: showSplash ? 0 : 0.2 }}
        style={{
          pointerEvents: showSplash ? "none" : "auto",
          height: showSplash ? "100vh" : "auto",
          overflow: showSplash ? "hidden" : "visible"
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
