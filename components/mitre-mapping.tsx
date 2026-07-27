import { Crosshair } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";

export function MitreMapping({ analysis }: { analysis: IncidentAnalysis }) {
  if (analysis.techniques.length === 0) {
    return (
      <SectionCard icon={Crosshair} title="MITRE ATT&CK Mapping" subtitle="No techniques matched">
        <p className="text-sm text-ink-faint">No known ATT&CK technique pattern was matched against this alert text.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={Crosshair} title="MITRE ATT&CK Mapping" subtitle={`${analysis.techniques.length} technique(s) mapped`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.techniques.map((t) => (
          <a
            key={t.id}
            href={`https://attack.mitre.org/techniques/${t.id.replace(".", "/")}/`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border border-line bg-surface p-3.5 transition hover:border-accent/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent">{t.id}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t.tactic}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-ink group-hover:text-accent">{t.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t.rationale}</p>
          </a>
        ))}
      </div>
    </SectionCard>
  );
}
