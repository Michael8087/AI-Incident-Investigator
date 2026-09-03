"use client";

import { useEffect, useState } from "react";
import { Workflow } from "lucide-react";
import type { ReasoningStep } from "@/lib/types";
import { SectionCard } from "./section-card";

export function ReasoningTracePanel({ steps }: { steps: ReasoningStep[] }) {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    setVisible(1);
    const timers = steps.map((_, i) => window.setTimeout(() => setVisible((v) => Math.max(v, i + 1)), i * 160));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [steps]);

  return (
    <SectionCard icon={Workflow} title="AI Reasoning Trace" subtitle="Step-by-step pipeline, grounded in this incident's own data">
      <ol className="space-y-3">
        {steps.slice(0, visible).map((step, i) => (
          <li key={step.id} className="flex gap-3 animate-fade-in-up">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[10px] font-semibold text-accent">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
