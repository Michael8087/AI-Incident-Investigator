import { ShieldHalf } from "lucide-react";
import { Container } from "./container";

export function Topbar() {
  return (
    <div className="sticky top-0 z-20 border-b border-line bg-void/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-inset ring-accent/30">
            <ShieldHalf className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="font-mono text-[13px] font-semibold leading-tight tracking-tight text-ink">AI Incident Investigator</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">SOC Analyst Console</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted sm:flex">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-severity-low" />
            Engine Online
          </div>
          <div className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            No login required
          </div>
        </div>
      </Container>
    </div>
  );
}
