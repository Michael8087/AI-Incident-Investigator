"use client";

import { useEffect, useState } from "react";
import { BrainCircuit } from "lucide-react";

const STEPS = [
  "Parsing raw alert text…",
  "Extracting hosts, users, and network indicators…",
  "Matching known attack technique patterns…",
  "Mapping findings to MITRE ATT&CK…",
  "Scoring severity and confidence…",
  "Reconstructing likely event timeline…",
  "Drafting analyst hypotheses…",
  "Compiling investigation report…"
];

export function AnalyzingLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 260);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface-card p-8 shadow-card">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-inset ring-accent/30">
          <BrainCircuit className="h-6 w-6 animate-pulseDot" strokeWidth={2} />
        </span>
        <div>
          <p className="font-mono text-sm font-semibold text-ink">{STEPS[stepIndex]}</p>
          <p className="mt-1 text-xs text-ink-faint">AI Incident Investigator is correlating indicators…</p>
        </div>
        <div className="h-1 w-64 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
