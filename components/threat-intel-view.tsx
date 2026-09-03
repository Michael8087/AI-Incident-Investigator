import { Globe2 } from "lucide-react";
import type { QueueIncident } from "@/lib/types";
import { buildThreatIntel } from "@/lib/threat-intel";
import { ThreatIntelPanel } from "./threat-intel-panel";

export function ThreatIntelView({ incidents }: { incidents: QueueIncident[] }) {
  const seen = new Map<string, ReturnType<typeof buildThreatIntel>[number]>();
  for (const inc of incidents) {
    for (const record of buildThreatIntel(inc.analysis)) {
      const existing = seen.get(record.indicator);
      if (!existing || record.maliciousScore > existing.maliciousScore) seen.set(record.indicator, record);
    }
  }
  const records = Array.from(seen.values()).sort((a, b) => b.maliciousScore - a.maliciousScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
          <Globe2 className="h-5 w-5 text-accent" /> Threat Intelligence
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Aggregated enrichment across every incident currently in the queue — {records.length} unique indicator
          {records.length === 1 ? "" : "s"} observed.
        </p>
      </div>
      <ThreatIntelPanel records={records} />
    </div>
  );
}
