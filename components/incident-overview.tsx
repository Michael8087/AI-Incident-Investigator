import { FileWarning, Laptop, Network, User } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";
import { SeverityBadge } from "./severity-badge";

function Chip({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">{label}</p>
        <p className="truncate font-mono text-xs text-ink">{value}</p>
      </div>
    </div>
  );
}

export function IncidentOverview({ analysis }: { analysis: IncidentAnalysis }) {
  const { entities } = analysis;
  return (
    <SectionCard icon={FileWarning} title="Incident Overview" subtitle={analysis.id}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity={analysis.severity} />
            <span className="font-mono text-[11px] text-ink-faint">confidence {analysis.confidence}%</span>
          </div>
          <h3 className="text-lg font-semibold leading-snug text-ink">{analysis.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{analysis.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Chip icon={Laptop} label="Host" value={entities.hosts[0] ?? "Unknown"} />
        <Chip icon={User} label="User" value={entities.users[0] ?? "Unknown"} />
        <Chip icon={Network} label="External IP" value={entities.ips[0] ?? "None observed"} />
        <Chip icon={FileWarning} label="Process" value={entities.processes[0] ?? "Unspecified"} />
      </div>

      <div className="mt-4 rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Why this matters</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{analysis.whyItMatters}</p>
      </div>
    </SectionCard>
  );
}
