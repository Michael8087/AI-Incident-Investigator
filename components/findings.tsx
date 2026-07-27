import { ListChecks } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";
import { SeverityBadge } from "./severity-badge";

export function Findings({ analysis }: { analysis: IncidentAnalysis }) {
  return (
    <SectionCard icon={ListChecks} title="Findings" subtitle={`${analysis.findings.length} technical finding(s)`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.findings.map((f, i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-ink">{f.title}</h3>
              <SeverityBadge severity={f.severity} className="shrink-0" />
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">{f.detail}</p>
            {f.techniqueIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.techniqueIds.map((id) => (
                  <span key={id} className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
