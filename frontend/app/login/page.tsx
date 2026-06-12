"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
      setError("Please use a valid @gmail.com email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to log in");

      localStorage.setItem("token", data.access_token);
      document.cookie = `token=${data.access_token}; path=/; max-age=604800`;
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Google authentication failed");

      localStorage.setItem("token", data.access_token);
      document.cookie = `token=${data.access_token}; path=/; max-age=604800`;
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Welcome Back</h1>
        <p style={{ color: "#6b7fa3", fontSize: 14, textAlign: "center", marginBottom: 24 }}>Log in to Drug Nova</p>

        {error && (
          <div style={{ padding: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Email</label>
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


          <div style={{ textAlign: "right", marginTop: "-8px" }}>
            <Link href="/forgot-password" style={{ color: "#00d4ff", fontSize: 12, textDecoration: "none" }}>Forgot Password?</Link>
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
            {loading ? "Logging in..." : "Log In"}
          </button>
          
          <div style={{ textAlign: "center", margin: "8px 0", color: "#6b7fa3", fontSize: 13 }}>OR</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="filled_black"
            />
          </div>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#6b7fa3" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#00d4ff", textDecoration: "none" }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
