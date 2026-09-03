import type { Metadata } from "next";
import { inter, mono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Investigator",
  description:
    "An AI security analyst that triages raw alerts into a full investigation: severity, MITRE ATT&CK mapping, hypotheses, evidence gaps, and an analyst-ready report."
};

// Runs before hydration so the page never flashes the wrong theme on load:
// reads the saved choice (or the OS preference on a first visit) and applies
// the `.light` class synchronously, ahead of first paint. Dark is the
// default look (no class needed) — see the CSS variables in globals.css.
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}if(t==="light"){document.documentElement.classList.add("light");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-void font-sans text-ink antialiased transition-colors duration-200">
        <div className="pointer-events-none fixed inset-0 bg-grid bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_10%,transparent_70%)]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
