"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const router = useRouter();
  
  // step 1: Name & Email
  // step 2: OTP & Password
  // step 3: Google Password Completion
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({ name: "", email: "", otp: "", password: "" });
  const [googleCredential, setGoogleCredential] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/\d/.test(password)) return "Password must contain at least one numeric value.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
      setError("Please use a valid @gmail.com email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/request-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");

      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          otp: formData.otp,
          password: formData.password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");

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

      if (data.is_new_user) {
        setFormData({ ...formData, email: data.email, name: data.name });
        setGoogleCredential(credentialResponse.credential);
        setStep(3);
      } else {
        // existing user
        localStorage.setItem("token", data.access_token);
        document.cookie = `token=${data.access_token}; path=/; max-age=604800`;
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/google-complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: googleCredential,
          password: formData.password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to complete Google signup");

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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Create Account</h1>
        <p style={{ color: "#6b7fa3", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          {step === 1 && "Join Drug Nova to start exploring"}
          {step === 2 && "Enter the OTP sent to your email to verify"}
          {step === 3 && "Google verified! Please choose a password"}
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

        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              {loading ? "Sending OTP..." : "Continue"}
            </button>
            
            <div style={{ textAlign: "center", margin: "8px 0", color: "#6b7fa3", fontSize: 13 }}>OR</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="filled_black"
                text="signup_with"
              />
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>OTP from Email</label>
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
              <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Create Password</label>
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
              {loading ? "Verifying..." : "Verify & Sign Up"}
            </button>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: "transparent", border: "none", color: "#6b7fa3", fontSize: 13, cursor: "pointer" }}
              >
                Back to email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleGoogleCompleteSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ color: "#a0aec0", fontSize: 14 }}>Google Account: </span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{formData.email}</span>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Create Password for Drug Nova</label>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {step === 1 && (
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#6b7fa3" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#00d4ff", textDecoration: "none" }}>Log in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
