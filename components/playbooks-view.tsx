import { BookOpen } from "lucide-react";
import { PLAYBOOKS } from "@/lib/playbooks";
import { SectionCard } from "./section-card";

const CATEGORY_COLOR: Record<string, string> = {
  containment: "text-severity-critical bg-severity-criticalSoft ring-severity-critical/30",
  eradication: "text-severity-high bg-severity-highSoft ring-severity-high/30",
  investigation: "text-accent bg-accent-soft ring-accent/30",
  recovery: "text-severity-low bg-severity-lowSoft ring-severity-low/30"
};

export function PlaybooksView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Response Playbooks</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Reference library the SOAR actions on each incident are drawn from. Real deployments would trigger these automatically based on
          matched technique categories.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PLAYBOOKS.map((pb) => (
          <SectionCard key={pb.id} icon={BookOpen} title={pb.name}>
            <span
              className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${CATEGORY_COLOR[pb.category]}`}
            >
              {pb.category}
            </span>
            <p className="mt-2 text-xs text-ink-faint">Trigger: {pb.trigger}</p>
            <ol className="mt-3 space-y-1.5">
              {pb.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-ink-muted">
                  <span className="font-mono text-ink-faint">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
