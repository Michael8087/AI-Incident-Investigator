import { BrainCircuit } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";

export function AiReasoning({ analysis }: { analysis: IncidentAnalysis }) {
  return (
    <SectionCard icon={BrainCircuit} title="AI Reasoning" subtitle="Ranked investigation hypotheses">
      <div className="space-y-4">
        {analysis.hypotheses.map((h, i) => (
          <div key={i}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {i === 0 ? "Leading hypothesis" : "Alternative hypothesis"} — {h.title}
              </p>
              <span className="font-mono text-xs text-accent">{h.plausibility}%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div
                className={i === 0 ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-ink-faint"}
                style={{ width: `${h.plausibility}%` }}
              />
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">{h.narrative}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
