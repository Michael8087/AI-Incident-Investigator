import { Globe2 } from "lucide-react";
import type { IntelVerdict, ThreatIntelRecord } from "@/lib/types";
import { SectionCard } from "./section-card";

const VERDICT_STYLE: Record<IntelVerdict, string> = {
  malicious: "text-severity-critical bg-severity-criticalSoft ring-severity-critical/30",
  suspicious: "text-severity-high bg-severity-highSoft ring-severity-high/30",
  unknown: "text-ink-faint bg-surface-hover ring-line-strong",
  clean: "text-severity-low bg-severity-lowSoft ring-severity-low/30"
};

export function ThreatIntelPanel({ records }: { records: ThreatIntelRecord[] }) {
  if (records.length === 0) {
    return (
      <SectionCard icon={Globe2} title="Threat Intelligence" subtitle="Simulated enrichment">
        <p className="text-sm text-ink-faint">No IPs or process indicators were extracted from this alert to enrich.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={Globe2} title="Threat Intelligence" subtitle="Simulated enrichment — demo data, not a real feed">
      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.indicator} className="rounded-lg border border-line bg-surface p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  {r.type}
                </span>
                <span className="font-mono text-sm font-semibold text-ink">{r.indicator}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${VERDICT_STYLE[r.verdict]}`}
              >
                {r.verdict} · {r.maliciousScore}/100
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-ink-faint">
              {r.country && <span>Geo: {r.country}</span>}
              {r.asn && <span>ASN: {r.asn}</span>}
              <span>First seen: {r.firstSeen}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.tags.map((tag) => (
                <span key={tag} className="rounded border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-ink-faint">{r.source}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
