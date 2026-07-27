"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import type { IncidentAnalysis } from "@/lib/types";
import { SectionCard } from "./section-card";
import clsx from "clsx";

export function AnalystReport({ analysis }: { analysis: IncidentAnalysis }) {
  const [tab, setTab] = useState<"executive" | "detailed">("executive");
  const [copied, setCopied] = useState(false);

  const content = tab === "executive" ? analysis.executiveSummary : analysis.analystReport;

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <SectionCard
      icon={FileText}
      title="Analyst Report"
      subtitle={`Generated ${new Date(analysis.generatedAt).toLocaleString()}`}
      action={
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-muted transition hover:border-line-strong hover:text-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-severity-low" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      }
    >
      <div className="mb-4 inline-flex rounded-lg border border-line bg-surface p-1">
        {(["executive", "detailed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              tab === t ? "bg-accent-soft text-accent" : "text-ink-muted hover:text-ink"
            )}
          >
            {t === "executive" ? "Executive Summary" : "Detailed Report"}
          </button>
        ))}
      </div>

      {tab === "executive" ? (
        <p className="text-sm leading-relaxed text-ink-muted">{content}</p>
      ) : (
        <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-4 font-mono text-xs leading-relaxed text-ink-muted">
          {content}
        </pre>
      )}
    </SectionCard>
  );
}
