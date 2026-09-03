"use client";

import { AlertTriangle, BookOpen, LayoutGrid, ShieldHalf } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "./theme-toggle";

export type ConsoleView = "command-center" | "threat-intel" | "playbooks";

const NAV: Array<{ id: ConsoleView; label: string; icon: typeof LayoutGrid }> = [
  { id: "command-center", label: "Command Center", icon: LayoutGrid },
  { id: "threat-intel", label: "Threat Intel", icon: AlertTriangle },
  { id: "playbooks", label: "Playbooks", icon: BookOpen }
];

export function Sidebar({ view, onChange }: { view: ConsoleView; onChange: (view: ConsoleView) => void }) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-inset ring-accent/30">
          <ShieldHalf className="h-4.5 w-4.5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[13px] font-semibold leading-tight tracking-tight text-ink">Incident Investigator</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">SOC Console</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={clsx(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
              view === id ? "bg-accent-soft text-accent ring-1 ring-inset ring-accent/25" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="space-y-2 border-t border-line p-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-severity-low" />
          Engine online
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-ink-faint">No login required. Nothing leaves your browser unless the AI Copilot is active.</p>
      </div>
    </aside>
  );
}
