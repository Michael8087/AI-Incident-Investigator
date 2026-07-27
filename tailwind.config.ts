import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070b",
        surface: {
          DEFAULT: "#0b0e15",
          raised: "#10141d",
          card: "#12161f",
          hover: "#161b26"
        },
        line: {
          DEFAULT: "rgba(148,163,184,0.12)",
          strong: "rgba(148,163,184,0.22)"
        },
        ink: {
          DEFAULT: "#e6ebf2",
          muted: "#8b96a8",
          faint: "#5b6577"
        },
        accent: {
          DEFAULT: "#22d3ee",
          soft: "rgba(34,211,238,0.12)",
          strong: "#06b6d4"
        },
        severity: {
          critical: "#ef4444",
          criticalSoft: "rgba(239,68,68,0.12)",
          high: "#f97316",
          highSoft: "rgba(249,115,22,0.12)",
          medium: "#eab308",
          mediumSoft: "rgba(234,179,8,0.12)",
          low: "#22c55e",
          lowSoft: "rgba(34,197,94,0.12)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      maxWidth: {
        content: "84rem"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.15), 0 0 24px rgba(34,211,238,0.08)",
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" }
        }
      },
      animation: {
        scan: "scan 2.4s linear infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
