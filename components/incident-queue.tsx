"use client";

import { Plus, Radio } from "lucide-react";
import clsx from "clsx";
import type { QueueIncident } from "@/lib/types";
import { SeverityBadge } from "./severity-badge";

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function IncidentQueue({
  incidents,
  selectedId,
  onSelect,
  liveFeed,
  onToggleLiveFeed,
  onNewAlert
}: {
  incidents: QueueIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  liveFeed: boolean;
  onToggleLiveFeed: () => void;
  onNewAlert: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-card shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Incident Queue</h2>
          <p className="font-mono text-[10px] text-ink-faint">{incidents.length} in queue</p>
        </div>
        <button
          onClick={onToggleLiveFeed}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition",
            liveFeed ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-ink-faint hover:text-ink-muted"
          )}
        >
          <Radio className={clsx("h-3 w-3", liveFeed && "animate-pulseDot")} />
          {liveFeed ? "Live" : "Paused"}
        </button>
      </div>

      <button
        onClick={onNewAlert}
        className="mx-4 mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 py-2 text-xs font-medium text-ink-muted transition hover:border-accent/40 hover:text-accent"
      >
        <Plus className="h-3.5 w-3.5" />
        Submit new alert
      </button>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto p-3 pt-0">
        {incidents.map((inc) => (
          <button
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className={clsx(
              "w-full rounded-lg border px-3 py-2.5 text-left transition",
              selectedId === inc.id ? "border-accent/40 bg-accent-soft" : "border-line bg-surface hover:border-line-strong"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <SeverityBadge severity={inc.analysis.severity} />
              <span className="font-mono text-[10px] text-ink-faint">{timeAgo(inc.receivedAt)}</span>
            </div>
            <p className="mt-1.5 truncate text-xs font-medium text-ink">{inc.analysis.title}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[10px] text-ink-faint">{inc.id}</span>
              <span
                className={clsx(
                  "font-mono text-[10px] uppercase tracking-wide",
                  inc.status === "new" && "text-accent",
                  inc.status === "investigating" && "text-severity-medium",
                  inc.status === "resolved" && "text-severity-low"
                )}
              >
                {inc.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
