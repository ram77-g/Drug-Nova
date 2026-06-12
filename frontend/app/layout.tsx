import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Drug Nova — AI-Powered Drug Repurposing Platform",
  description:
    "Explore drug repurposing candidates using AI, biomedical knowledge graphs, and protein structure visualization.",
  keywords: ["drug repurposing", "bioinformatics", "AI", "drug discovery", "proteomics"],
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050810] text-[#c8d6f0] antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"}>
          <Navbar />
          <main className="pt-14">{children}</main>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
