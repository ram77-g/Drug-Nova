"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/protein", label: "Proteins" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status on load and route changes
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

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

        {/* Status / Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "8px" }}>
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

          <div style={{ height: "24px", width: "1px", background: "rgba(255,255,255,0.1)" }}></div>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13.5px",
                  fontWeight: 500, color: "#ffffff", textDecoration: "none",
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s",
                }}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13.5px",
                  fontWeight: 500, color: "#f87171", cursor: "pointer",
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)",
                  transition: "all 0.2s",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13.5px",
                  fontWeight: 500, color: "#c8d6f0", textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13.5px",
                  fontWeight: 500, color: "#00d4ff", textDecoration: "none",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
                  transition: "all 0.2s",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
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
