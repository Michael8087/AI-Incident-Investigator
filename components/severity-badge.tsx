import clsx from "clsx";
import type { Severity } from "@/lib/types";

const STYLES: Record<Severity, string> = {
  critical: "text-severity-critical bg-severity-criticalSoft ring-1 ring-inset ring-severity-critical/30",
  high: "text-severity-high bg-severity-highSoft ring-1 ring-inset ring-severity-high/30",
  medium: "text-severity-medium bg-severity-mediumSoft ring-1 ring-inset ring-severity-medium/30",
  low: "text-severity-low bg-severity-lowSoft ring-1 ring-inset ring-severity-low/30"
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide",
        STYLES[severity],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}
