"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/auth/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        localStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: profile.name }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7fa3" }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%", maxWidth: 500, padding: 32, borderRadius: 16,
          background: "rgba(30,45,74,0.3)", border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>My Profile</h1>
        <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 24 }}>Manage your personal information.</p>

        {error && (
          <div style={{ padding: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, color: "#22c55e", fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Full Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 14, outline: "none", transition: "border 0.2s"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>Email (Cannot be changed)</label>
            <input
              type="email"
              readOnly
              value={profile.email}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)",
                color: "#6b7fa3", fontSize: 14, outline: "none", cursor: "not-allowed"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 16, padding: 12, borderRadius: 8,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => { if (!saving) (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)" }}
            onMouseOut={(e) => { if (!saving) (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
