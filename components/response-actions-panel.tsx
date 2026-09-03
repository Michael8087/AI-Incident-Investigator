"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import clsx from "clsx";
import type { ActionPriority, ResponseActionDef, ResponseActionState } from "@/lib/types";
import { SectionCard } from "./section-card";

const PRIORITY_STYLE: Record<ActionPriority, string> = {
  immediate: "text-severity-critical bg-severity-criticalSoft ring-severity-critical/30",
  high: "text-severity-high bg-severity-highSoft ring-severity-high/30",
  medium: "text-severity-medium bg-severity-mediumSoft ring-severity-medium/30",
  low: "text-severity-low bg-severity-lowSoft ring-severity-low/30"
};

function ActionRow({ action }: { action: ResponseActionDef }) {
  const [state, setState] = useState<ResponseActionState>("idle");
  const [visibleLines, setVisibleLines] = useState(0);

  function execute() {
    if (state !== "idle") return;
    setState("running");
    action.logLines.forEach((_, i) => {
      window.setTimeout(() => setVisibleLines((v) => Math.max(v, i + 1)), 450 + i * 480);
    });
    window.setTimeout(() => setState("done"), 450 + action.logLines.length * 480 + 200);
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${PRIORITY_STYLE[action.priority]}`}
            >
              {action.priority}
            </span>
            <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
              {action.category}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink">{action.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{action.description}</p>
        </div>

        <button
          onClick={execute}
          disabled={state !== "idle"}
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            state === "idle" && "bg-accent text-void hover:bg-accent-strong",
            state === "running" && "cursor-wait bg-surface-hover text-ink-faint",
            state === "done" && "bg-severity-lowSoft text-severity-low ring-1 ring-inset ring-severity-low/30"
          )}
        >
          {state === "idle" && (
            <>
              <Zap className="h-3.5 w-3.5" /> Execute
            </>
          )}
          {state === "running" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running
            </>
          )}
          {state === "done" && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
            </>
          )}
        </button>
      </div>

      {state !== "idle" && (
        <div className="mt-3 space-y-1 rounded-md border border-black/40 bg-black/85 p-2.5 font-mono text-[10px] leading-relaxed text-emerald-400">
          {action.logLines.slice(0, visibleLines).map((line, i) => (
            <p key={i} className="animate-fade-in-up">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResponseActionsPanel({ actions }: { actions: ResponseActionDef[] }) {
  return (
    <SectionCard icon={Zap} title="Automated Response (SOAR)" subtitle="Simulated playbook execution — no real infrastructure is touched">
      <div className="space-y-3">
        {actions.map((a) => (
          <ActionRow key={a.id} action={a} />
        ))}
      </div>
    </SectionCard>
  );
}
