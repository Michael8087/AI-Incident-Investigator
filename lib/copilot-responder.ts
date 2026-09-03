import type { ChatMessage, IncidentAnalysis } from "./types";

// Local fallback "brain" for the copilot chat — used whenever the real
// Claude-backed /api/copilot endpoint isn't reachable (e.g. running locally,
// or the ANTHROPIC_API_KEY secret hasn't been configured on the deployed
// Worker yet). Pattern-matches common analyst questions and answers them
// grounded entirely in the current incident's own analysis object, so the
// chat is always useful even with zero external dependencies.
export function answerLocally(question: string, analysis: IncidentAnalysis): string {
  const q = question.toLowerCase();
  const host = analysis.entities.hosts[0] ?? "the host";
  const user = analysis.entities.users[0] ?? "the user";

  if (/why.*(critical|severe|high|bad)|severity/.test(q)) {
    const top = analysis.riskFactors.slice(0, 3).map((f) => `${f.label} (+${f.weight})`).join(", ");
    return `This is scored ${analysis.severity.toUpperCase()} (${analysis.severityScore}/100) mainly because of: ${top || "the overall pattern of indicators"}. ${analysis.whyItMatters}`;
  }

  if (/what should i do|next step|recommend|do now/.test(q)) {
    const top = analysis.recommendedActions.slice(0, 3);
    return `Top priorities right now:\n${top.map((a, i) => `${i + 1}. [${a.priority.toUpperCase()}] ${a.action}`).join("\n")}`;
  }

  if (/false positive|benign|legit|not malicious/.test(q)) {
    const alt = analysis.hypotheses.find((h) => h.title.toLowerCase().includes("legitimate") || h.title.toLowerCase().includes("benign"));
    if (alt) {
      return `It's possible — "${alt.title}" is on the hypothesis list at ${alt.plausibility}% plausibility. ${alt.narrative} I'd still confirm with the system/account owner before closing this as benign.`;
    }
    return `Based on the current indicators, a benign explanation is unlikely — the leading hypothesis ("${analysis.hypotheses[0]?.title}") sits at ${analysis.hypotheses[0]?.plausibility}% plausibility. I wouldn't close this without collecting the missing evidence first.`;
  }

  if (/mitre|att&?ck|technique/.test(q)) {
    if (analysis.techniques.length === 0) return "No ATT&CK techniques were confidently mapped for this alert — the indicators present weren't specific enough.";
    return `Mapped techniques: ${analysis.techniques.map((t) => `${t.id} (${t.name}, ${t.tactic})`).join("; ")}.`;
  }

  if (/summar(y|ize).*(manager|exec|boss|leadership)|executive/.test(q)) {
    return analysis.executiveSummary;
  }

  if (/evidence|missing|gap|what.*need/.test(q)) {
    const missing = analysis.evidence.filter((e) => e.status !== "present").slice(0, 4);
    if (missing.length === 0) return "All standard evidence items are already accounted for in this alert.";
    return `Still missing:\n${missing.map((e) => `- ${e.item}: ${e.note}`).join("\n")}`;
  }

  if (/confiden(t|ce)/.test(q)) {
    return `Confidence is ${analysis.confidence}% — based on how many strong, specific indicators matched versus weaker/generic ones. Higher confidence means the pattern match is more unambiguous, independent of how severe the underlying activity is.`;
  }

  if (/timeline|when|sequence|order/.test(q)) {
    const events = analysis.timeline.slice(0, 4);
    return `Reconstructed sequence:\n${events.map((e) => `${e.offset} — ${e.action} (${e.actor})`).join("\n")}`;
  }

  if (/who|user|account/.test(q)) {
    return `The account involved is ${user}${host !== "the host" ? ` on ${host}` : ""}. ${
      analysis.entities.users.length > 1 ? `Other accounts referenced: ${analysis.entities.users.slice(1).join(", ")}.` : ""
    }`;
  }

  return `On ${host}: ${analysis.title}. Severity is ${analysis.severity.toUpperCase()} at ${analysis.confidence}% confidence. Ask me about severity, next steps, MITRE mapping, evidence gaps, the timeline, or whether this could be a false positive — I'll answer from this incident's data.`;
}

export function newMessage(role: ChatMessage["role"], content: string, source?: ChatMessage["source"]): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    role,
    content,
    source
  };
}
