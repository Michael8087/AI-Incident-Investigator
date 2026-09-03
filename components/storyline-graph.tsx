import { Waypoints } from "lucide-react";
import type { Storyline, StorylineNodeKind, Severity } from "@/lib/types";
import { SectionCard } from "./section-card";

const KIND_COLOR: Record<StorylineNodeKind, string> = {
  user: "#8b96a8",
  host: "#22d3ee",
  process: "#a78bfa",
  network: "#f97316",
  file: "#eab308",
  credential: "#ef4444",
  alert: "#ef4444"
};

const SEVERITY_RING: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

const NODE_W = 168;
const NODE_H = 52;
const COL_GAP = 220;
const ROW_GAP = 76;

function layout(storyline: Storyline) {
  const { nodes, edges } = storyline;
  const childrenOf = new Map<string, string[]>();
  const hasIncoming = new Set<string>();
  for (const e of edges) {
    childrenOf.set(e.from, [...(childrenOf.get(e.from) ?? []), e.to]);
    hasIncoming.add(e.to);
  }
  const roots = nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
  const depth = new Map<string, number>();
  const queue: Array<{ id: string; d: number }> = roots.map((id) => ({ id, d: 0 }));
  const visited = new Set<string>();
  while (queue.length) {
    const { id, d } = queue.shift()!;
    if (visited.has(id) && (depth.get(id) ?? -1) >= d) continue;
    visited.add(id);
    depth.set(id, Math.max(depth.get(id) ?? 0, d));
    for (const child of childrenOf.get(id) ?? []) queue.push({ id: child, d: d + 1 });
  }

  const byDepth = new Map<number, string[]>();
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    byDepth.set(d, [...(byDepth.get(d) ?? []), n.id]);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const maxRows = Math.max(...Array.from(byDepth.values()).map((r) => r.length), 1);
  for (const [d, ids] of byDepth.entries()) {
    const rowCount = ids.length;
    const offset = ((maxRows - rowCount) * ROW_GAP) / 2;
    ids.forEach((id, i) => {
      positions.set(id, { x: d * COL_GAP + NODE_W / 2 + 12, y: offset + i * ROW_GAP + NODE_H / 2 + 12 });
    });
  }

  const width = (Math.max(...Array.from(byDepth.keys())) + 1) * COL_GAP + 24;
  const height = maxRows * ROW_GAP + 24;
  return { positions, width: Math.max(width, 400), height: Math.max(height, 200) };
}

export function StorylineGraph({ storyline }: { storyline: Storyline }) {
  const { positions, width, height } = layout(storyline);

  return (
    <SectionCard icon={Waypoints} title="Storyline" subtitle="Correlated process & network behavior chain">
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="min-w-full" style={{ minWidth: width }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="rgba(148,163,184,0.5)" />
            </marker>
          </defs>

          {storyline.edges.map((e, i) => {
            const from = positions.get(e.from);
            const to = positions.get(e.to);
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={from.x + NODE_W / 2}
                  y1={from.y}
                  x2={to.x - NODE_W / 2 - 6}
                  y2={to.y}
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrow)"
                />
                {e.label && (
                  <text x={midX} y={midY - 6} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="#5b6577">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {storyline.nodes.map((n) => {
            const pos = positions.get(n.id);
            if (!pos) return null;
            const ringColor = n.severity ? SEVERITY_RING[n.severity] : "rgba(148,163,184,0.25)";
            return (
              <g key={n.id} transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  fill="#12161f"
                  stroke={ringColor}
                  strokeWidth={n.severity ? 1.5 : 1}
                />
                <circle cx={14} cy={NODE_H / 2} r={4} fill={KIND_COLOR[n.kind]} />
                <text x={26} y={NODE_H / 2 - 4} fontSize="11" fontWeight={600} fontFamily="ui-monospace, monospace" fill="#e6ebf2">
                  {n.label.length > 20 ? `${n.label.slice(0, 19)}…` : n.label}
                </text>
                {n.sublabel && (
                  <text x={26} y={NODE_H / 2 + 12} fontSize="9" fontFamily="ui-sans-serif, system-ui" fill="#8b96a8">
                    {n.sublabel.length > 24 ? `${n.sublabel.slice(0, 23)}…` : n.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
}
