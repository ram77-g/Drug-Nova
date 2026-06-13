"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/protein", label: "Proteins" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="glass-nav fixed top-0 left-0 right-0 z-50"
    >
      <div className="container-xl flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="url(#ng)" strokeWidth="1.5" />
            <path
              d="M8 8c2 2 4 2 6 0s4-2 6 0M8 14c2 2 4 2 6 0s4-2 6 0M8 20c2 2 4 2 6 0s4-2 6 0"
              stroke="url(#ng)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ng" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00d4ff" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.3px" }}>
            <span style={{ color: "#ffffff" }}>Drug</span>
            <span className="grad-cyan-violet">Nova</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  position: "relative",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#00d4ff" : "#6b7fa3",
                  background: active ? "rgba(0,212,255,0.08)" : "transparent",
                  border: active ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
            <span
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "#22c55e", opacity: 0.6,
                animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "block" }} />
          </span>
          <span style={{ fontSize: "12px", color: "#1ebeebff", fontFamily: "monospace" }}>
            QUAD Agents
          </span>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </motion.header>
  );
}
