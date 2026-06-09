import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ background: "#050810" }}>
      <HeroSection />

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)",
          maxWidth: 900, margin: "0 auto",
        }}
      />

      <FeaturesSection />

      <div
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)",
          maxWidth: 900, margin: "0 auto",
        }}
      />

      <HowItWorks />

      {/* CTA Section */}
      <section
        style={{
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500, height: 250, borderRadius: "50%",
            background: "rgba(0,212,255,0.04)", filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 640, margin: "0 auto",
            textAlign: "center", position: "relative", zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 700, color: "#ffffff",
              marginBottom: 14, lineHeight: 1.25,
            }}
          >
            Ready to Explore?
          </h2>
          <p
            style={{
              color: "#6b7fa3", marginBottom: 32,
              lineHeight: 1.7, fontSize: 15,
            }}
          >
            Search a disease and discover AI-ranked drug repurposing candidates with
            interactive knowledge graphs and molecular visualizations.
          </p>
          <Link href="/search" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 32px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))",
                border: "1px solid rgba(0,212,255,0.35)",
                color: "#00d4ff", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Launch Drug Nova
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(30,45,74,0.5)",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200, margin: "0 auto",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4b5a78" }}>
            <span style={{ fontWeight: 700, color: "#6b7fa3" }}>DrugNova</span>
            <span>·</span>
            <span>AI-Powered Drug Repurposing Research Platform</span>
          </div>
          <div style={{ fontSize: 12, color: "#4b5a78" }}>
            Data: OpenFDA · ChEMBL · DisGeNET · AlphaFold
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: "rgba(248,113,113,0.7)" }}>Not medical advice.</span>
            <span style={{ color: "#4b5a78" }}> Research use only.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
