"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Globe2, LayoutGrid } from "lucide-react";
import clsx from "clsx";
import { Sidebar, type ConsoleView } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { KpiBar } from "@/components/kpi-bar";
import { IncidentQueue } from "@/components/incident-queue";
import { NewAlertModal } from "@/components/new-alert-modal";
import { IncidentOverview } from "@/components/incident-overview";
import { StorylineGraph } from "@/components/storyline-graph";
import { RiskScore } from "@/components/risk-score";
import { ReasoningTracePanel } from "@/components/reasoning-trace-panel";
import { AiTimeline } from "@/components/ai-timeline";
import { Findings } from "@/components/findings";
import { ThreatIntelPanel } from "@/components/threat-intel-panel";
import { MitreMapping } from "@/components/mitre-mapping";
import { AiReasoning } from "@/components/ai-reasoning";
import { EvidenceTable } from "@/components/evidence-table";
import { RecommendedActions } from "@/components/recommended-actions";
import { ResponseActionsPanel } from "@/components/response-actions-panel";
import { AnalystReport } from "@/components/analyst-report";
import { CopilotChat } from "@/components/copilot-chat";
import { ThreatIntelView } from "@/components/threat-intel-view";
import { PlaybooksView } from "@/components/playbooks-view";
import { buildStoryline } from "@/lib/storyline";
import { buildThreatIntel } from "@/lib/threat-intel";
import { buildResponseActions } from "@/lib/response-actions";
import { buildReasoningTrace } from "@/lib/reasoning-trace";
import { buildSeedQueue, makeQueueIncident } from "@/lib/seed-queue";
import { EXAMPLE_ALERTS } from "@/lib/example-alerts";
import type { QueueIncident } from "@/lib/types";

const LIVE_FEED_INTERVAL_MS = 45_000;
const MAX_QUEUE_SIZE = 14;
const ASSETS_MONITORED = 214;

const MOBILE_NAV: Array<{ id: ConsoleView; label: string; icon: typeof LayoutGrid }> = [
  { id: "command-center", label: "Console", icon: LayoutGrid },
  { id: "threat-intel", label: "Intel", icon: Globe2 },
  { id: "playbooks", label: "Playbooks", icon: BookOpen }
];

export default function HomePage() {
  const [view, setView] = useState<ConsoleView>("command-center");
  // Seeded empty and filled in a client-only effect below — the seed queue
  // renders relative timestamps (Date.now()-derived), which would mismatch
  // between the server-rendered static HTML and the client's hydration pass
  // if computed eagerly. Populating post-mount sidesteps that entirely.
  const [queue, setQueue] = useState<QueueIncident[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAnalyzingNew, setIsAnalyzingNew] = useState(false);

  const selected = useMemo(() => queue.find((i) => i.id === selectedId) ?? queue[0] ?? null, [queue, selectedId]);

  useEffect(() => {
    const seed = buildSeedQueue();
    setQueue(seed);
    setSelectedId(seed[0]?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!liveFeed) return;
    const interval = window.setInterval(() => {
      const text = EXAMPLE_ALERTS[Math.floor(Math.random() * EXAMPLE_ALERTS.length)].text;
      const incident = makeQueueIncident(text, { minutesAgo: 0, status: "new" });
      setQueue((prev) => [incident, ...prev].slice(0, MAX_QUEUE_SIZE));
    }, LIVE_FEED_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [liveFeed]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setQueue((prev) => prev.map((inc) => (inc.id === id && inc.status === "new" ? { ...inc, status: "investigating" } : inc)));
  }

  function handleResolve() {
    if (!selected) return;
    setQueue((prev) => prev.map((inc) => (inc.id === selected.id ? { ...inc, status: "resolved" } : inc)));
  }

  function handleSubmitNewAlert(text: string) {
    if (!text.trim()) return;
    setIsAnalyzingNew(true);
    window.setTimeout(() => {
      const incident = makeQueueIncident(text, { minutesAgo: 0, status: "investigating" });
      setQueue((prev) => [incident, ...prev].slice(0, MAX_QUEUE_SIZE));
      setSelectedId(incident.id);
      setIsAnalyzingNew(false);
      setModalOpen(false);
    }, 1900);
  }

  const openIncidents = queue.filter((i) => i.status !== "resolved").length;
  const criticalToday = queue.filter((i) => i.analysis.severity === "critical").length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar view={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5 md:hidden">
          <span className="font-mono text-xs font-semibold text-ink">Incident Investigator</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {MOBILE_NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px]",
                    view === id ? "bg-accent-soft text-accent" : "text-ink-faint"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="shrink-0">
          <KpiBar openIncidents={openIncidents} criticalToday={criticalToday} assetsMonitored={ASSETS_MONITORED} avgTriage="4m 12s" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {view === "command-center" && !ready && (
            <div className="flex h-[60vh] items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Loading incident queue…</p>
            </div>
          )}
          {view === "command-center" && ready && selected && (
            <div className="mx-auto grid max-w-[1680px] items-start gap-6 lg:grid-cols-[280px_1fr_360px]">
              <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-8rem)]">
                <IncidentQueue
                  incidents={queue}
                  selectedId={selected.id}
                  onSelect={handleSelect}
                  liveFeed={liveFeed}
                  onToggleLiveFeed={() => setLiveFeed((v) => !v)}
                  onNewAlert={() => setModalOpen(true)}
                />
              </div>

              <div className="min-w-0 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                    {selected.id} · received {new Date(selected.receivedAt).toLocaleTimeString()}
                  </p>
                  {selected.status !== "resolved" ? (
                    <button
                      onClick={handleResolve}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-muted transition hover:border-severity-low/40 hover:text-severity-low"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-severity-lowSoft px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-severity-low">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                    </span>
                  )}
                </div>

                <IncidentOverview analysis={selected.analysis} />
                <StorylineGraph storyline={buildStoryline(selected.analysis)} />

                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="lg:col-span-2">
                    <RiskScore analysis={selected.analysis} />
                  </div>
                  <div className="lg:col-span-3">
                    <ReasoningTracePanel steps={buildReasoningTrace(selected.analysis)} />
                  </div>
                </div>

                <AiTimeline analysis={selected.analysis} />
                <Findings analysis={selected.analysis} />
                <ThreatIntelPanel records={buildThreatIntel(selected.analysis)} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <MitreMapping analysis={selected.analysis} />
                  <AiReasoning analysis={selected.analysis} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <EvidenceTable analysis={selected.analysis} />
                  <RecommendedActions analysis={selected.analysis} />
                </div>

                <ResponseActionsPanel actions={buildResponseActions(selected.analysis)} />
                <AnalystReport analysis={selected.analysis} />
              </div>

              <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-8rem)]">
                <CopilotChat analysis={selected.analysis} />
              </div>
            </div>
          )}

          {view === "threat-intel" && <ThreatIntelView incidents={queue} />}
          {view === "playbooks" && <PlaybooksView />}
        </main>
      </div>

      {modalOpen && <NewAlertModal onClose={() => setModalOpen(false)} onSubmit={handleSubmitNewAlert} isAnalyzing={isAnalyzingNew} />}
    </div>
  );
}
