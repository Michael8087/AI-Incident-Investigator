import { History, Radio, Sparkle } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";

export function AiTimeline({ analysis }: { analysis: IncidentAnalysis }) {
  return (
    <SectionCard icon={History} title="AI Timeline" subtitle="Reconstructed sequence of events">
      <ol className="relative space-y-0">
        {analysis.timeline.map((event, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {i !== analysis.timeline.length - 1 && (
              <span className="absolute left-[13px] top-6 h-full w-px bg-line" aria-hidden />
            )}
            <span
              className={`z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-surface-card ${
                event.source === "derived" ? "bg-surface-hover text-ink-faint" : "bg-accent-soft text-accent"
              }`}
            >
              {event.source === "derived" ? <Sparkle className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-xs font-semibold text-accent">{event.offset}</span>
                <span className="font-mono text-xs text-ink-faint">{event.actor}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-ink">{event.action}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
