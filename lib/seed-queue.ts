import { EXAMPLE_ALERTS } from "./example-alerts";
import { analyzeAlert } from "./analysis-engine";
import type { IncidentStatus, QueueIncident } from "./types";

let liveCounter = 0;

// Used for alerts added after the initial render (live feed injections, or a
// manually submitted alert) — these only ever run client-side inside event
// handlers/effects, so a mutable counter is safe here and guarantees a
// unique id even if the same alert text is picked twice.
export function makeQueueIncident(rawAlert: string, opts?: { minutesAgo?: number; status?: IncidentStatus }): QueueIncident {
  liveCounter += 1;
  const analysis = analyzeAlert(rawAlert);
  const minutesAgo = opts?.minutesAgo ?? 0;
  return {
    id: `${analysis.id}-live${liveCounter}`,
    rawAlert,
    receivedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    status: opts?.status ?? "new",
    analysis
  };
}

const SEED_SPECS: Array<{ minutesAgo: number; status: IncidentStatus }> = [
  { minutesAgo: 2, status: "new" },
  { minutesAgo: 11, status: "new" },
  { minutesAgo: 26, status: "investigating" },
  { minutesAgo: 48, status: "investigating" },
  { minutesAgo: 83, status: "resolved" },
  { minutesAgo: 131, status: "resolved" },
  { minutesAgo: 197, status: "resolved" },
  { minutesAgo: 264, status: "resolved" }
];

// Pure and deterministic — same output on every call, server or client — so
// it's safe to use as a useState lazy initializer without risking a
// hydration mismatch (no shared mutable state, no Date.now()-derived ids).
export function buildSeedQueue(): QueueIncident[] {
  return EXAMPLE_ALERTS.slice(0, SEED_SPECS.length).map((alert, i) => {
    const analysis = analyzeAlert(alert.text);
    const spec = SEED_SPECS[i];
    return {
      id: `${analysis.id}-seed${i}`,
      rawAlert: alert.text,
      receivedAt: new Date(Date.now() - spec.minutesAgo * 60_000).toISOString(),
      status: spec.status,
      analysis
    };
  });
}
