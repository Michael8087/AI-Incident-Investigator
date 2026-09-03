import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base tokens are wired to CSS variables (see globals.css) so the
        // whole palette can be re-themed at runtime by toggling a class on
        // <html> — the ones that ever appear with a Tailwind opacity
        // modifier (e.g. bg-accent/40) use the "rgb(var(..) / <alpha-value>)"
        // form; the rest (already-composited "soft" tints, borders) just
        // reference a precomputed color string per theme.
        void: "rgb(var(--color-void) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "var(--color-surface-raised)",
          card: "var(--color-surface-card)",
          hover: "var(--color-surface-hover)"
        },
        line: {
          DEFAULT: "var(--color-line)",
          strong: "var(--color-line-strong)"
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          faint: "var(--color-ink-faint)"
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "var(--color-accent-soft)",
          strong: "var(--color-accent-strong)"
        },
        severity: {
          critical: "rgb(var(--color-severity-critical) / <alpha-value>)",
          criticalSoft: "var(--color-severity-critical-soft)",
          high: "rgb(var(--color-severity-high) / <alpha-value>)",
          highSoft: "var(--color-severity-high-soft)",
          medium: "rgb(var(--color-severity-medium) / <alpha-value>)",
          mediumSoft: "var(--color-severity-medium-soft)",
          low: "rgb(var(--color-severity-low) / <alpha-value>)",
          lowSoft: "var(--color-severity-low-soft)"
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
