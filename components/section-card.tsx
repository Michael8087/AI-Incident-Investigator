import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx("rounded-xl border border-line bg-surface-card shadow-card", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{title}</h2>
            {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={clsx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
