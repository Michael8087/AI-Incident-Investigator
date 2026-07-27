import { INDICATOR_RULES, TECHNIQUES } from "./indicator-rules";
import type {
  ActionPriority,
  EvidenceItem,
  EvidenceStatus,
  Finding,
  Hypothesis,
  IncidentAnalysis,
  MitreTechnique,
  RecommendedAction,
  RiskFactor,
  Severity,
  TimelineEvent
} from "./types";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function extractEntities(text: string) {
  const hosts = new Set<string>();
  const users = new Set<string>();
  const ips = new Set<string>();
  const processes = new Set<string>();

  const hostPattern = /\b(?:endpoint|host|hostname|machine|computer)[:\s]+([A-Za-z0-9][A-Za-z0-9_-]{2,})/gi;
  let m: RegExpExecArray | null;
  while ((m = hostPattern.exec(text))) hosts.add(m[1].replace(/[.,]$/, ""));

  const bareHostPattern = /\b([A-Z]{2,}(?:-[A-Z0-9]+)+)\b/g;
  while ((m = bareHostPattern.exec(text))) hosts.add(m[1]);

  const userPattern = /\b(?:user\s+account|username|user|account)[:\s]+([A-Za-z][A-Za-z0-9._-]{1,})/gi;
  while ((m = userPattern.exec(text))) users.add(m[1].replace(/[.,]$/, ""));

  const namePattern = /\b([a-z]+\.[a-z]+)\b/g;
  while ((m = namePattern.exec(text))) users.add(m[1]);

  const ipPattern = /\b(?:\d{1,3}|xxx)\.(?:\d{1,3}|xxx)\.(?:\d{1,3}|xxx)\.(?:\d{1,3}|xxx)\b/gi;
  while ((m = ipPattern.exec(text))) ips.add(m[0]);

  const knownProcesses = [
    "powershell.exe",
    "powershell",
    "cmd.exe",
    "mshta.exe",
    "rundll32.exe",
    "regsvr32.exe",
    "certutil.exe",
    "bitsadmin.exe",
    "wmic.exe",
    "psexec.exe",
    "wscript.exe",
    "cscript.exe",
    "schtasks.exe",
    "msbuild.exe",
    "procdump.exe",
    "procdump",
    "mimikatz.exe",
    "mimikatz"
  ];
  const lower = text.toLowerCase();
  for (const proc of knownProcesses) {
    if (lower.includes(proc)) processes.add(proc.replace(/\.exe$/, ""));
  }

  return {
    hosts: Array.from(hosts).slice(0, 5),
    users: Array.from(users).slice(0, 5),
    ips: Array.from(ips).slice(0, 5),
    processes: Array.from(processes).slice(0, 6)
  };
}

function severityFromScore(score: number): Severity {
  if (score >= 78) return "critical";
  if (score >= 55) return "high";
  if (score >= 32) return "medium";
  return "low";
}

const EVIDENCE_CHECKLIST: Array<{
  item: string;
  presentIf: RegExp;
  partialIf?: RegExp;
  presentNote: string;
  missingNote: string;
}> = [
  {
    item: "Full process command line & parent/child process tree",
    presentIf: /parent process|process tree|command line:|cmdline/i,
    presentNote: "Referenced in the alert.",
    missingNote: "Alert gives a process name but not the full command line or parent process — needed to confirm intent."
  },
  {
    item: "PowerShell Script Block / Module logging (Event ID 4104/4103)",
    presentIf: /script ?block logging|event id 4104|4103/i,
    partialIf: /powershell/i,
    presentNote: "Script block logging output referenced.",
    missingNote: "PowerShell activity is implicated but the decoded script block content isn't attached — this would confirm exactly what ran."
  },
  {
    item: "EDR process execution timeline for the host",
    presentIf: /edr|crowdstrike|defender for endpoint|carbon black|sentinelone/i,
    presentNote: "EDR telemetry referenced.",
    missingNote: "No EDR/endpoint telemetry cited — needed to see everything the host did around this event, not just the one flagged action."
  },
  {
    item: "DNS query logs for the host",
    presentIf: /dns quer|dns log/i,
    presentNote: "DNS logs referenced.",
    missingNote: "DNS resolution history isn't included — would show what domain(s) resolved to the flagged IP and any other C2 candidates."
  },
  {
    item: "Firewall / proxy logs for the destination",
    presentIf: /firewall log|proxy log|netflow/i,
    partialIf: /external (ip|connection)|outbound/i,
    presentNote: "Network perimeter logs referenced.",
    missingNote: "An external connection is mentioned but perimeter logs (bytes transferred, session duration, destination reputation) aren't attached."
  },
  {
    item: "Authentication logs (sign-in location, MFA status) for the user",
    presentIf: /mfa|sign-?in log|authentication log|conditional access/i,
    partialIf: /user:|username/i,
    presentNote: "Authentication context referenced.",
    missingNote: "A user is named but their recent sign-in/MFA history isn't included — needed to rule out account compromise."
  },
  {
    item: "File and registry modification logs",
    presentIf: /registry (key|modif)|file (creat|modif|writ)/i,
    presentNote: "File/registry activity referenced.",
    missingNote: "No file or registry modification detail is attached — would help establish persistence or staging."
  },
  {
    item: "Memory capture / forensic image of the host",
    presentIf: /memory (dump|capture|image)|forensic image/i,
    presentNote: "Memory forensics referenced.",
    missingNote: "No memory capture is mentioned — important if credential theft or fileless malware is suspected."
  },
  {
    item: "Related alerts on other hosts / lateral scope",
    presentIf: /other (hosts|endpoints)|multiple (hosts|machines)|across the (environment|fleet|network)/i,
    presentNote: "Cross-host correlation referenced.",
    missingNote: "The alert only describes one host — hasn't been checked yet whether the same pattern appears elsewhere in the environment."
  },
  {
    item: "Alert/detection rule metadata (rule name, confidence, data source)",
    presentIf: /detection rule|rule name|alert id|source:/i,
    presentNote: "Detection metadata referenced.",
    missingNote: "The raw detection rule name/ID and its historical false-positive rate aren't included."
  }
];

function buildEvidence(text: string): EvidenceItem[] {
  return EVIDENCE_CHECKLIST.map(({ item, presentIf, partialIf, presentNote, missingNote }) => {
    let status: EvidenceStatus = "missing";
    if (presentIf.test(text)) status = "present";
    else if (partialIf?.test(text)) status = "partial";
    return {
      item,
      status,
      note: status === "present" ? presentNote : status === "partial" ? "Partially implied — not confirmed in the alert." : missingNote
    };
  });
}

function priorityForWeight(weight: number): ActionPriority {
  if (weight >= 24) return "immediate";
  if (weight >= 16) return "high";
  if (weight >= 10) return "medium";
  return "low";
}

const BASE_ACTIONS: RecommendedAction[] = [
  {
    priority: "high",
    action: "Pull the full EDR process execution timeline for the host, 24h before and after the alert.",
    reason: "Establishes what else happened on the endpoint that this single alert doesn't show."
  },
  {
    priority: "medium",
    action: "Check whether the same indicator (hash, command pattern, destination IP) appears on any other host.",
    reason: "Confirms whether this is isolated or part of a wider campaign before scoping the response."
  }
];

function buildRecommendedActions(matched: typeof INDICATOR_RULES, entities: ReturnType<typeof extractEntities>): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const categories = new Set(matched.map((m) => m.category));

  if (categories.has("Impact")) {
    actions.push({
      priority: "immediate",
      action: `Isolate ${entities.hosts[0] ?? "the affected host"} from the network immediately.`,
      reason: "Indicators are consistent with active ransomware — containment stops further encryption spread."
    });
    actions.push({
      priority: "immediate",
      action: "Verify backup integrity and confirm offline/immutable backups exist before touching the host further.",
      reason: "Shadow copy or backup deletion is often bundled with the encryption payload."
    });
  }
  if (categories.has("Credential Access")) {
    actions.push({
      priority: "immediate",
      action: `Force a credential reset for ${entities.users[0] ?? "the affected account"} and any account that logged into this host recently.`,
      reason: "Credential dumping tooling means cached credentials on this host should be treated as compromised."
    });
  }
  if (categories.has("Lateral Movement")) {
    actions.push({
      priority: "immediate",
      action: "Isolate the host and review authentication logs on any systems it connected to via RDP/SMB/WMI.",
      reason: "Lateral movement tooling means the blast radius likely extends beyond this single endpoint."
    });
  }
  if (categories.has("Command and Control") || categories.has("Exfiltration Staging")) {
    actions.push({
      priority: "high",
      action: `Block ${entities.ips[0] ?? "the external destination"} at the firewall/proxy and pivot on it across all network logs.`,
      reason: "Cutting the channel limits further C2 or data loss while the investigation continues."
    });
  }
  if (categories.has("Obfuscated Execution") || categories.has("Scripting Execution")) {
    actions.push({
      priority: "high",
      action: "Retrieve and decode the full PowerShell command line, and pull PowerShell script block logs (4104) for the host.",
      reason: "The decoded payload is the fastest way to confirm intent instead of reasoning from process name alone."
    });
  }
  if (categories.has("Persistence")) {
    actions.push({
      priority: "high",
      action: "Enumerate scheduled tasks, run keys, and services on the host and remove any unauthorized entries.",
      reason: "Persistence mechanisms will re-launch attacker code even after the initial process is killed."
    });
  }
  if (categories.has("Defense Evasion")) {
    actions.push({
      priority: "immediate",
      action: "Confirm endpoint protection and logging are re-enabled and functioning on the host.",
      reason: "An attacker operating with defenses disabled leaves no further telemetry until this is fixed."
    });
  }
  if (categories.has("Initial Access")) {
    actions.push({
      priority: "high",
      action: "Retrieve the source email, check for other recipients, and purge it from other mailboxes if malicious.",
      reason: "Phishing lures are rarely sent to a single target — containment should be mailbox-wide, not host-only."
    });
  }
  if (categories.has("Discovery")) {
    actions.push({
      priority: "medium",
      action: "Review what discovery output the process could have collected and whether it left the host.",
      reason: "Discovery activity indicates the actor was actively orienting themselves — worth understanding what they now know."
    });
  }

  actions.push(...BASE_ACTIONS);

  if (actions.length <= 2) {
    actions.unshift({
      priority: "medium",
      action: "Interview the user or system owner to confirm whether this activity was expected (e.g. sanctioned admin script).",
      reason: "With only weak/ambiguous indicators, the fastest way to resolve this is direct confirmation of intent."
    });
  }

  const order: ActionPriority[] = ["immediate", "high", "medium", "low"];
  return actions
    .filter((a, i, arr) => arr.findIndex((b) => b.action === a.action) === i)
    .sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority));
}

function buildHypotheses(
  matched: typeof INDICATOR_RULES,
  score: number,
  entities: ReturnType<typeof extractEntities>
): Hypothesis[] {
  const categories = new Set(matched.map((m) => m.category));
  const hyps: Hypothesis[] = [];
  const host = entities.hosts[0] ?? "the affected host";
  const user = entities.users[0] ?? "the affected user";

  if (categories.has("Impact")) {
    hyps.push({
      title: "Active ransomware encryption event",
      plausibility: 88,
      narrative: `File-encryption and backup-tampering indicators point to a ransomware payload actively running on ${host}. This should be treated as a live incident, not a suspicious alert to triage later.`
    });
    hyps.push({
      title: "Pre-encryption staging (failed or partial detonation)",
      plausibility: 34,
      narrative: "It's possible the payload was only partially executed or was caught mid-stage — worth confirming scope before assuming full detonation."
    });
    return hyps;
  }

  if (categories.has("Credential Access") && (categories.has("Lateral Movement") || categories.has("Command and Control"))) {
    hyps.push({
      title: "Active intrusion with credential theft and lateral movement",
      plausibility: 82,
      narrative: `The combination of credential access tooling and lateral/C2 activity on ${host} is consistent with a hands-on-keyboard attacker actively expanding access, not an isolated one-off event.`
    });
    hyps.push({
      title: "Authorized red team or penetration test",
      plausibility: 22,
      narrative: "The same technique combination is also produced by an authorized red team exercise — worth a quick check against any active engagement calendar before escalating as a real incident."
    });
    return hyps;
  }

  if (categories.has("Obfuscated Execution") || categories.has("Scripting Execution")) {
    const strongCount = matched.filter((m) => m.strength === "strong").length;
    hyps.push({
      title: "Malicious script execution / early-stage compromise",
      plausibility: Math.min(85, 45 + strongCount * 15 + (categories.has("Command and Control") ? 15 : 0)),
      narrative: `An encoded or hidden-window PowerShell command on ${host}, run by ${user}, is a common pattern for downloader or loader malware immediately after initial access.`
    });
    hyps.push({
      title: "Legitimate but poorly-written admin automation",
      plausibility: Math.max(15, 45 - strongCount * 15),
      narrative: "Some internal tooling is genuinely built with encoded PowerShell one-liners for deployment convenience — this should be ruled out by checking with IT/automation owners before assuming hostile intent."
    });
    return hyps;
  }

  if (categories.has("Initial Access")) {
    hyps.push({
      title: "User-initiated compromise via phishing lure",
      plausibility: 68,
      narrative: `${user || "The user"} appears to have interacted with a phishing lure. Whether this becomes a real compromise depends on what the payload actually did after execution.`
    });
    hyps.push({
      title: "Lure opened but payload blocked or non-functional",
      plausibility: 40,
      narrative: "Many phishing payloads fail silently due to missing dependencies or blocked macros — worth confirming execution actually succeeded."
    });
    return hyps;
  }

  if (score < 32) {
    hyps.push({
      title: "Benign activity or low-fidelity detection",
      plausibility: 60,
      narrative: "The alert contains only weak or generic indicators. This is plausibly a false positive, or genuine activity that a low-specificity detection rule flagged without enough context."
    });
    hyps.push({
      title: "Early reconnaissance preceding a larger attack",
      plausibility: 25,
      narrative: "Low-signal discovery-style activity can also be the first, quiet step of a longer intrusion — it shouldn't be dismissed without a second look at the host's broader activity."
    });
    return hyps;
  }

  hyps.push({
    title: "Suspicious but ambiguous host activity",
    plausibility: 55,
    narrative: `The indicators present in this alert are consistent with malicious activity on ${host}, but no single technique is confirmed strongly enough to be conclusive on its own.`
  });
  hyps.push({
    title: "Legitimate administrative or business activity",
    plausibility: 30,
    narrative: "The described behavior overlaps with some legitimate IT operations patterns — worth a quick confirmation with the system or account owner."
  });
  return hyps;
}

function buildTimeline(
  text: string,
  matched: Array<{ rule: (typeof INDICATOR_RULES)[number]; index: number }>,
  entities: ReturnType<typeof extractEntities>,
  rng: () => number
): TimelineEvent[] {
  const host = entities.hosts[0] ?? "the endpoint";
  const user = entities.users[0] ?? "the user";
  const events: TimelineEvent[] = [];
  let seconds = 0;

  events.push({
    offset: "T+00:00",
    actor: user,
    action: "Session activity begins",
    detail: `Baseline activity for ${user} on ${host} preceding the flagged behavior.`,
    source: "derived"
  });

  const sorted = [...matched].sort((a, b) => a.index - b.index);
  for (const { rule } of sorted) {
    seconds += Math.floor(8 + rng() * 90);
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    events.push({
      offset: `T+${mm}:${ss}`,
      actor: host,
      action: rule.findingTitle,
      detail: rule.findingDetail,
      source: "alert"
    });
  }

  seconds += Math.floor(10 + rng() * 30);
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  events.push({
    offset: `T+${mm}:${ss}`,
    actor: "Detection engine",
    action: "Alert generated",
    detail: "The security platform correlated the above activity and raised this alert for analyst review.",
    source: "derived"
  });

  return events;
}

function buildAnalystReport(analysis: Omit<IncidentAnalysis, "analystReport" | "executiveSummary">): string {
  const { title, severity, severityScore, confidence, entities, summary, findings, hypotheses, techniques, evidence, recommendedActions } =
    analysis;
  const missing = evidence.filter((e) => e.status !== "present");
  const host = entities.hosts[0] ?? "the affected host";

  const lines: string[] = [];
  lines.push(`INCIDENT ANALYSIS REPORT`);
  lines.push(`${title}`);
  lines.push("");
  lines.push(`Severity: ${severity.toUpperCase()} (${severityScore}/100)  |  Confidence: ${confidence}%`);
  lines.push("");
  lines.push(`1. SUMMARY`);
  lines.push(summary);
  lines.push("");
  lines.push(`2. TECHNICAL FINDINGS`);
  findings.forEach((f, i) => {
    lines.push(`  ${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
    lines.push(`     ${f.detail}`);
  });
  lines.push("");
  lines.push(`3. MITRE ATT&CK MAPPING`);
  techniques.forEach((t) => {
    lines.push(`  - ${t.id} ${t.name} (${t.tactic})`);
  });
  lines.push("");
  lines.push(`4. ANALYST HYPOTHESES`);
  hypotheses.forEach((h) => {
    lines.push(`  - (${h.plausibility}% plausible) ${h.title} — ${h.narrative}`);
  });
  lines.push("");
  lines.push(`5. EVIDENCE GAPS (${missing.length} of ${evidence.length} items not fully confirmed)`);
  missing.forEach((e) => lines.push(`  - ${e.item}: ${e.note}`));
  lines.push("");
  lines.push(`6. RECOMMENDED NEXT STEPS`);
  recommendedActions.forEach((a, i) => {
    lines.push(`  ${i + 1}. [${a.priority.toUpperCase()}] ${a.action}`);
    lines.push(`     Why: ${a.reason}`);
  });
  lines.push("");
  lines.push(`7. CONCLUSION`);
  lines.push(
    `Based on the indicators present, this alert warrants a ${severity} response posture. Prioritize closing the evidence gaps above on ${host} before final disposition, and escalate immediately if any "immediate" priority action has not yet been taken.`
  );

  return lines.join("\n");
}

export function analyzeAlert(rawAlert: string): IncidentAnalysis {
  const text = rawAlert.trim();
  const entities = extractEntities(text);
  const seed = hashString(text || "empty-alert");
  const rng = seededRandom(seed);

  const matched: Array<{ rule: (typeof INDICATOR_RULES)[number]; index: number }> = [];
  for (const rule of INDICATOR_RULES) {
    const match = rule.pattern.exec(text);
    if (match) matched.push({ rule, index: match.index });
  }

  const uniqueRules = matched.map((m) => m.rule);
  const strongCount = uniqueRules.filter((r) => r.strength === "strong").length;
  const weakCount = uniqueRules.filter((r) => r.strength !== "strong").length;

  const categorySet = new Set(uniqueRules.map((r) => r.category));
  const distinctCategories = categorySet.size;
  const rawScore = uniqueRules.reduce((sum, r) => sum + r.weight, 0);
  const chainBonus = distinctCategories >= 4 ? 14 : distinctCategories >= 3 ? 8 : 0;

  // Certain attack-chain combinations are severe regardless of raw weight sum —
  // e.g. ransomware or confirmed lateral movement with stolen credentials should
  // never read as "medium" just because only one or two rules matched.
  let severityFloor = 0;
  if (categorySet.has("Impact")) severityFloor = Math.max(severityFloor, 88);
  if (categorySet.has("Credential Access") && categorySet.has("Lateral Movement")) severityFloor = Math.max(severityFloor, 80);
  if (categorySet.has("Credential Access") && categorySet.has("Command and Control")) severityFloor = Math.max(severityFloor, 74);
  if (categorySet.has("Obfuscated Execution") && categorySet.has("Command and Control")) severityFloor = Math.max(severityFloor, 62);
  if (categorySet.has("Initial Access") && categorySet.has("Command and Control")) severityFloor = Math.max(severityFloor, 60);
  if (categorySet.has("Defense Evasion")) severityFloor = Math.max(severityFloor, 58);
  if (categorySet.has("Lateral Movement")) severityFloor = Math.max(severityFloor, 55);

  const severityScore = Math.min(98, Math.max(6, rawScore + chainBonus + (text.length > 0 ? 4 : 0), severityFloor));
  const severity = severityFromScore(severityScore);

  const floorConfidenceBonus = severityFloor >= 80 ? 20 : severityFloor >= 60 ? 10 : 0;
  const confidence = Math.min(96, 32 + strongCount * 14 + weakCount * 5 + (text.length > 40 ? 6 : 0) + floorConfidenceBonus);

  const techniqueIds = Array.from(new Set(uniqueRules.flatMap((r) => r.techniqueIds)));
  const techniques: MitreTechnique[] = techniqueIds.map((id) => TECHNIQUES[id]).filter(Boolean);

  const findings: Finding[] = uniqueRules
    .filter((r, i, arr) => arr.findIndex((x) => x.findingTitle === r.findingTitle) === i)
    .map((r) => ({
      title: r.findingTitle,
      severity: r.strength === "strong" ? (severity === "low" ? "medium" : severity) : "medium",
      detail: r.findingDetail,
      techniqueIds: r.techniqueIds
    }));

  if (findings.length === 0) {
    findings.push({
      title: "No high-confidence attack technique indicators detected",
      severity: "low",
      detail:
        "The parser did not match any known malicious technique pattern in this alert text. This may be a benign event, a technique not covered by this analyzer, or an alert with insufficient technical detail.",
      techniqueIds: []
    });
  }

  const riskFactors: RiskFactor[] = uniqueRules
    .filter((r, i, arr) => arr.findIndex((x) => x.category === r.category) === i)
    .map((r) => ({ label: r.category, weight: r.weight }))
    .sort((a, b) => b.weight - a.weight);
  if (chainBonus > 0) {
    riskFactors.push({ label: "Multiple attack-chain stages present", weight: chainBonus });
  }

  const evidence = buildEvidence(text);
  const missingEvidenceCount = evidence.filter((e) => e.status !== "present").length;

  const hypotheses = buildHypotheses(uniqueRules, severityScore, entities);

  const recommendedActions = buildRecommendedActions(uniqueRules, entities);

  const host = entities.hosts[0] ?? "an unidentified endpoint";
  const user = entities.users[0] ?? "an unidentified user";
  const titleCategory = uniqueRules[0]?.category ?? "Unclassified Activity";
  const title = `${titleCategory} detected on ${host}`;

  const summary = `${text.slice(0, 220)}${text.length > 220 ? "…" : ""}`.trim() || "No alert text was provided.";

  const whyItMatters =
    uniqueRules.length > 0
      ? uniqueRules[0].whyItMatters
      : "Without stronger indicators, the main risk is under-reacting to genuine early-stage activity — evidence collection should proceed regardless of the low score.";

  const timeline = buildTimeline(text, matched, entities, rng);

  const executiveSummary = `On ${host}, activity involving ${user} was flagged as ${severity} severity (confidence ${confidence}%). ${
    uniqueRules.length > 0
      ? `The alert shows signs of ${Array.from(new Set(uniqueRules.map((r) => r.category))).join(", ").toLowerCase()}.`
      : "The alert did not contain strong technical indicators of malicious activity."
  } ${
    severity === "critical" || severity === "high"
      ? "This warrants immediate attention from the security team."
      : "This has been queued for standard analyst review."
  } ${missingEvidenceCount} of ${evidence.length} standard evidence items still need to be collected to fully close this investigation.`;

  const partial: Omit<IncidentAnalysis, "analystReport" | "executiveSummary"> = {
    id: `INC-${seed.toString(36).slice(0, 6).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    rawAlert: text,
    title,
    severity,
    severityScore,
    confidence,
    entities,
    summary,
    whyItMatters,
    timeline,
    findings,
    evidence,
    missingEvidenceCount,
    hypotheses,
    recommendedActions,
    techniques,
    riskFactors
  };

  const analystReport = buildAnalystReport(partial);

  return {
    ...partial,
    executiveSummary,
    analystReport
  };
}
