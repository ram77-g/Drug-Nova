"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [formData, setFormData] = useState({ email: "", otp: "", new_password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to request OTP");

      setSuccess("OTP has been sent to your email!");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      formData.new_password.length < 8 ||
      !/\d/.test(formData.new_password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)
    ) {
      setError("Password must be 8 letters long, contain one numeric value, and one special character.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Reset Password</h1>
        <p style={{ color: "#6b7fa3", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          {step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP sent to your email and a new password"}
        </p>

        {error && (
          <div style={{ padding: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: 12, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, color: "#34d399", fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>OTP</label>
              <input
                type="text"
                required
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 14, outline: "none", letterSpacing: "2px", textAlign: "center"
                }}
                placeholder="123456"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>New Password</label>
              <input
                type="password"
                required
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login" style={{ color: "#6b7fa3", fontSize: 13, textDecoration: "none" }}>Back to Log In</Link>
        </div>
      </motion.div>
    </div>
  );
}
