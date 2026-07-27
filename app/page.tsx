"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/container";
import { Topbar } from "@/components/topbar";
import { AlertInput } from "@/components/alert-input";
import { AnalyzingLoader } from "@/components/analyzing-loader";
import { IncidentOverview } from "@/components/incident-overview";
import { RiskScore } from "@/components/risk-score";
import { AiTimeline } from "@/components/ai-timeline";
import { Findings } from "@/components/findings";
import { EvidenceTable } from "@/components/evidence-table";
import { RecommendedActions } from "@/components/recommended-actions";
import { MitreMapping } from "@/components/mitre-mapping";
import { AiReasoning } from "@/components/ai-reasoning";
import { AnalystReport } from "@/components/analyst-report";
import { analyzeAlert } from "@/lib/analysis-engine";
import type { IncidentAnalysis } from "@/lib/types";

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [lastAlertText, setLastAlertText] = useState("");

  function handleSubmit(text: string) {
    if (!text.trim()) return;
    setLastAlertText(text);
    setIsAnalyzing(true);
    setAnalysis(null);
    window.setTimeout(() => {
      const result = analyzeAlert(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 2100);
  }

  function handleReset() {
    setAnalysis(null);
    setLastAlertText("");
  }

  return (
    <>
      <Topbar />
      <Container className="py-8 sm:py-10">
        {!analysis && !isAnalyzing && (
          <div className="mb-8 max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Turn a raw alert into a full investigation.</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Paste any security alert — EDR, SIEM, or a one-line SOC ticket — and the engine below reconstructs the timeline, maps it to
              MITRE ATT&CK, scores severity and confidence, flags missing evidence, and drafts both an executive summary and a full
              analyst report.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {!isAnalyzing && (
            <AlertInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} initialValue={analysis ? lastAlertText : undefined} />
          )}

          {isAnalyzing && <AnalyzingLoader />}

          {analysis && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">Investigation results</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-muted transition hover:border-line-strong hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New investigation
                </button>
              </div>

              <IncidentOverview analysis={analysis} />

              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <RiskScore analysis={analysis} />
                </div>
                <div className="lg:col-span-3">
                  <AiTimeline analysis={analysis} />
                </div>
              </div>

              <Findings analysis={analysis} />

              <div className="grid gap-6 lg:grid-cols-2">
                <MitreMapping analysis={analysis} />
                <AiReasoning analysis={analysis} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <EvidenceTable analysis={analysis} />
                <RecommendedActions analysis={analysis} />
              </div>

              <AnalystReport analysis={analysis} />
            </div>
          )}
        </div>
      </Container>

      <footer className="border-t border-line py-6">
        <Container>
          <p className="text-center font-mono text-[11px] text-ink-faint">
            AI Incident Investigator — demo analysis engine, entirely client-side. No data leaves your browser.
          </p>
        </Container>
      </footer>
    </>
  );
}
