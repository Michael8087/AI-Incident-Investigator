"use client";

import { useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import { EXAMPLE_ALERTS } from "@/lib/example-alerts";

export function AlertInput({
  onSubmit,
  isAnalyzing,
  initialValue
}: {
  onSubmit: (text: string) => void;
  isAnalyzing: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");

  function handleFile(file: File | null) {
    if (!file) return;
    file.text().then((text) => setValue(text.slice(0, 4000)));
  }

  return (
    <div className="rounded-xl border border-line bg-surface-card shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Security Alert Intake</h2>
        <p className="mt-1 text-sm text-ink-muted">Paste a raw alert, SIEM detection, or EDR notification. The engine parses it below.</p>
      </div>

      <div className="p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`e.g. "PowerShell executed an encoded command from endpoint LAPTOP-154. User: john.smith. External connection established to 185.xxx.xxx.xxx."`}
          rows={5}
          className="w-full resize-y rounded-lg border border-line bg-surface px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink">
            <Upload className="h-3.5 w-3.5" />
            Upload alert file
            <input type="file" accept=".txt,.log,.json,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>

          <button
            onClick={() => onSubmit(value)}
            disabled={isAnalyzing || value.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-void shadow-glow transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? "Investigating…" : "Investigate Alert"}
          </button>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Or load a sample alert</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_ALERTS.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setValue(ex.text)}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
