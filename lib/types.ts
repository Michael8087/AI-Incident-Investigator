export type Severity = "critical" | "high" | "medium" | "low";

export type EvidenceStatus = "present" | "partial" | "missing";

export type ActionPriority = "immediate" | "high" | "medium" | "low";

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  rationale: string;
}

export interface TimelineEvent {
  offset: string;
  actor: string;
  action: string;
  detail: string;
  source: "alert" | "derived";
}

export interface Finding {
  title: string;
  severity: Severity;
  detail: string;
  techniqueIds: string[];
}

export interface EvidenceItem {
  item: string;
  status: EvidenceStatus;
  note: string;
}

export interface RecommendedAction {
  priority: ActionPriority;
  action: string;
  reason: string;
}

export interface Hypothesis {
  title: string;
  plausibility: number;
  narrative: string;
}

export interface RiskFactor {
  label: string;
  weight: number;
}

export interface Entities {
  hosts: string[];
  users: string[];
  ips: string[];
  processes: string[];
}

export interface IncidentAnalysis {
  id: string;
  generatedAt: string;
  rawAlert: string;
  title: string;
  severity: Severity;
  severityScore: number;
  confidence: number;
  entities: Entities;
  summary: string;
  whyItMatters: string;
  timeline: TimelineEvent[];
  findings: Finding[];
  evidence: EvidenceItem[];
  missingEvidenceCount: number;
  hypotheses: Hypothesis[];
  recommendedActions: RecommendedAction[];
  techniques: MitreTechnique[];
  riskFactors: RiskFactor[];
  executiveSummary: string;
  analystReport: string;
}

export interface ExampleAlert {
  label: string;
  category: string;
  text: string;
}

// --- Storyline (process-tree correlation, SentinelOne-style) ---

export type StorylineNodeKind = "user" | "host" | "process" | "network" | "file" | "credential" | "alert";

export interface StorylineNode {
  id: string;
  kind: StorylineNodeKind;
  label: string;
  sublabel?: string;
  severity?: Severity;
}

export interface StorylineEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Storyline {
  nodes: StorylineNode[];
  edges: StorylineEdge[];
}

// --- Threat intelligence enrichment (simulated) ---

export type IntelVerdict = "malicious" | "suspicious" | "unknown" | "clean";

export interface ThreatIntelRecord {
  indicator: string;
  type: "ip" | "process" | "file";
  verdict: IntelVerdict;
  maliciousScore: number;
  country?: string;
  asn?: string;
  firstSeen: string;
  tags: string[];
  source: string;
}

// --- SOAR / automated response ---

export type ResponseActionCategory = "containment" | "eradication" | "investigation" | "recovery";
export type ResponseActionState = "idle" | "running" | "done";

export interface ResponseActionDef {
  id: string;
  label: string;
  description: string;
  category: ResponseActionCategory;
  priority: ActionPriority;
  logLines: string[];
}

// --- AI reasoning trace (chain-of-thought style explainability) ---

export interface ReasoningStep {
  id: string;
  title: string;
  detail: string;
}

// --- Copilot chat ---

export type ChatSource = "claude" | "engine";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: ChatSource;
}

// --- Incident queue (multi-alert SOC console) ---

export type IncidentStatus = "new" | "investigating" | "resolved";

export interface QueueIncident {
  id: string;
  rawAlert: string;
  receivedAt: string;
  status: IncidentStatus;
  analysis: IncidentAnalysis;
}
