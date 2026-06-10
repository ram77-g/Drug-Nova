"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to sign up");

      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%", maxWidth: 400, padding: 32, borderRadius: 16,
          background: "rgba(30,45,74,0.3)", border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Create Account</h1>
        <p style={{ color: "#6b7fa3", fontSize: 14, textAlign: "center", marginBottom: 24 }}>Join Drug Nova to start exploring</p>

        {error && (
          <div style={{ padding: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 14, outline: "none",
              }}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Email (Gmail ID)</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 14, outline: "none",
              }}
              placeholder="you@gmail.com"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 14, outline: "none",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: 12, borderRadius: 8,
              background: "linear-gradient(135deg, #00d4ff, #a855f7)", color: "#fff",
              fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              border: "none", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s"
            }}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#6b7fa3" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#00d4ff", textDecoration: "none" }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
