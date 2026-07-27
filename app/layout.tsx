import type { Metadata } from "next";
import { inter, mono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Investigator",
  description:
    "An AI security analyst that triages raw alerts into a full investigation: severity, MITRE ATT&CK mapping, hypotheses, evidence gaps, and an analyst-ready report."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-void font-sans text-ink antialiased">
        <div className="pointer-events-none fixed inset-0 bg-grid bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_10%,transparent_70%)]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
