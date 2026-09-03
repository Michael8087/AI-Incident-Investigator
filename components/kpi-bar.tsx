import { AlertOctagon, Clock, Radar, ShieldCheck } from "lucide-react";

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Clock; label: string; value: string; tone?: "critical" }) {
  return (
    <div className="flex items-center gap-3 border-line px-4 py-3 first:pl-0 md:border-l md:first:border-l-0">
      <span
        className={
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md " +
          (tone === "critical" ? "bg-severity-criticalSoft text-severity-critical" : "bg-accent-soft text-accent")
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
        <p className="font-mono text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export function KpiBar({
  openIncidents,
  criticalToday,
  assetsMonitored,
  avgTriage
}: {
  openIncidents: number;
  criticalToday: number;
  assetsMonitored: number;
  avgTriage: string;
}) {
  return (
    <div className="flex flex-wrap items-stretch divide-line border-b border-line bg-surface/60 px-4 md:flex-nowrap md:px-6">
      <Kpi icon={Radar} label="Open Incidents" value={String(openIncidents)} />
      <Kpi icon={AlertOctagon} label="Critical Today" value={String(criticalToday)} tone={criticalToday > 0 ? "critical" : undefined} />
      <Kpi icon={ShieldCheck} label="Assets Monitored" value={assetsMonitored.toLocaleString()} />
      <Kpi icon={Clock} label="Avg. Time to Triage" value={avgTriage} />
    </div>
  );
}
