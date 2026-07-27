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
