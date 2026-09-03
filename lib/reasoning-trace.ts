import type { IncidentAnalysis, ReasoningStep } from "./types";

// Renders the engine's own pipeline as a step-by-step chain-of-thought trace.
// Every number here is read straight off the analysis object — nothing is
// invented — so the trace stays true to what the engine actually did.
export function buildReasoningTrace(analysis: IncidentAnalysis): ReasoningStep[] {
  const { entities, techniques, riskFactors, findings, hypotheses, evidence, missingEvidenceCount, severity, severityScore, confidence } =
    analysis;

  const entityCount = entities.hosts.length + entities.users.length + entities.ips.length + entities.processes.length;
  const categories = riskFactors.filter((f) => f.label !== "Multiple attack-chain stages present").map((f) => f.label);
  const tactics = Array.from(new Set(techniques.map((t) => t.tactic)));
  const leading = hypotheses[0];

  const steps: ReasoningStep[] = [
    {
      id: "parse",
      title: "Parse raw alert",
      detail: `Read ${analysis.rawAlert.length} characters of alert text and normalized it for pattern matching.`
    },
    {
      id: "entities",
      title: "Extract entities",
      detail:
        entityCount > 0
          ? `Identified ${entities.hosts.length} host(s), ${entities.users.length} user(s), ${entities.ips.length} IP(s), and ${entities.processes.length} process(es) referenced in the text.`
          : "No structured entities (host, user, IP, process) could be confidently extracted from the text."
    },
    {
      id: "match",
      title: "Match indicator patterns",
      detail:
        categories.length > 0
          ? `Matched ${findings.length} distinct technical indicator(s) spanning ${categories.length} categor${categories.length === 1 ? "y" : "ies"}: ${categories.join(", ")}.`
          : "No known malicious technique pattern matched this alert text — treated as low-signal by default."
    },
    {
      id: "mitre",
      title: "Correlate to MITRE ATT&CK",
      detail:
        techniques.length > 0
          ? `Mapped matched indicators to ${techniques.length} ATT&CK technique(s) across ${tactics.length} tactic(s): ${tactics.join(", ")}.`
          : "No ATT&CK techniques could be confidently mapped from the available indicators."
    },
    {
      id: "score",
      title: "Score severity & confidence",
      detail: `Combined indicator weights, attack-chain bonuses, and category floors into a severity score of ${severityScore}/100 (${severity.toUpperCase()}), with ${confidence}% confidence based on indicator strength and specificity.`
    },
    {
      id: "hypothesize",
      title: "Generate ranked hypotheses",
      detail: leading
        ? `Leading hypothesis: "${leading.title}" at ${leading.plausibility}% plausibility, weighed against ${hypotheses.length - 1} alternative(s).`
        : "Insufficient signal to generate a ranked hypothesis set."
    },
    {
      id: "evidence",
      title: "Audit evidence completeness",
      detail: `Checked ${evidence.length} standard SOC evidence items against the alert text — ${evidence.length - missingEvidenceCount} confirmed present, ${missingEvidenceCount} still need to be collected.`
    },
    {
      id: "synthesize",
      title: "Synthesize report",
      detail: "Compiled findings, hypotheses, evidence gaps, and recommended actions into an executive summary and a full analyst report."
    }
  ];

  return steps;
}
