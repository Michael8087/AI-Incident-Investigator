import { CheckCircle2, CircleDashed, MinusCircle, Search } from "lucide-react";
import type { EvidenceStatus, IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";

const STATUS_META: Record<EvidenceStatus, { icon: typeof CheckCircle2; label: string; className: string }> = {
  present: { icon: CheckCircle2, label: "Present", className: "text-severity-low" },
  partial: { icon: MinusCircle, label: "Partial", className: "text-severity-medium" },
  missing: { icon: CircleDashed, label: "Missing", className: "text-ink-faint" }
};

export function EvidenceTable({ analysis }: { analysis: IncidentAnalysis }) {
  return (
    <SectionCard
      icon={Search}
      title="Evidence"
      subtitle={`${analysis.evidence.length - analysis.missingEvidenceCount} of ${analysis.evidence.length} confirmed`}
    >
      <div className="divide-y divide-line">
        {analysis.evidence.map((e, i) => {
          const meta = STATUS_META[e.status];
          const Icon = meta.icon;
          return (
            <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.className}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{e.item}</p>
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${meta.className}`}>{meta.label}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{e.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
