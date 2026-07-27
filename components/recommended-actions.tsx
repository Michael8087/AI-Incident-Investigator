import { ClipboardList } from "lucide-react";
import type { ActionPriority, IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";

const PRIORITY_STYLE: Record<ActionPriority, string> = {
  immediate: "text-severity-critical bg-severity-criticalSoft ring-severity-critical/30",
  high: "text-severity-high bg-severity-highSoft ring-severity-high/30",
  medium: "text-severity-medium bg-severity-mediumSoft ring-severity-medium/30",
  low: "text-severity-low bg-severity-lowSoft ring-severity-low/30"
};

export function RecommendedActions({ analysis }: { analysis: IncidentAnalysis }) {
  return (
    <SectionCard icon={ClipboardList} title="Recommended Actions" subtitle="Ordered by priority">
      <ol className="space-y-3">
        {analysis.recommendedActions.map((a, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-line bg-surface p-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover font-mono text-[11px] text-ink-faint">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${PRIORITY_STYLE[a.priority]}`}
                >
                  {a.priority}
                </span>
                <p className="text-sm font-medium text-ink">{a.action}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{a.reason}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
