import { Gauge } from "lucide-react";
import type { IncidentAnalysis, Severity } from "@/lib/types";
import { SectionCard } from "./section-card";

const COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

function Ring({ score, severity }: { score: number; severity: Severity }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-36 w-36 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={COLOR[severity]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-ink">{score}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">/ 100</span>
      </div>
    </div>
  );
}

export function RiskScore({ analysis }: { analysis: IncidentAnalysis }) {
  const maxWeight = Math.max(...analysis.riskFactors.map((f) => f.weight), 1);
  return (
    <SectionCard icon={Gauge} title="Risk Score" subtitle="Composite of matched indicator weights">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <Ring score={analysis.severityScore} severity={analysis.severity} />
          <p className="mt-2 font-mono text-xs uppercase tracking-widest" style={{ color: COLOR[analysis.severity] }}>
            {analysis.severity} severity
          </p>
        </div>
        <div className="flex-1 space-y-2.5">
          {analysis.riskFactors.length === 0 && <p className="text-sm text-ink-faint">No contributing risk factors identified.</p>}
          {analysis.riskFactors.map((f) => (
            <div key={f.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-ink-muted">{f.label}</span>
                <span className="font-mono text-ink-faint">+{f.weight}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(f.weight / maxWeight) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
