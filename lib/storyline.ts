import type { IncidentAnalysis, Storyline, StorylineNode } from "./types";

// Builds a SentinelOne "Storyline"-style process/behavior correlation graph
// out of the entities and matched-indicator categories already present on an
// IncidentAnalysis. Purely derived — no new randomness, so it's stable for a
// given analysis.
export function buildStoryline(analysis: IncidentAnalysis): Storyline {
  const categories = new Set(analysis.riskFactors.map((f) => f.label));
  const { entities, severity } = analysis;
  const user = entities.users[0] ?? "unknown-user";
  const host = entities.hosts[0] ?? "unknown-host";
  const process = entities.processes[0] ?? "unknown.exe";

  const nodes: StorylineNode[] = [];
  const edges: Storyline["edges"] = [];

  nodes.push({ id: "user", kind: "user", label: user, sublabel: "Session owner" });
  nodes.push({ id: "host", kind: "host", label: host, sublabel: "Endpoint" });
  edges.push({ from: "user", to: "host", label: "logged into" });

  let leadId = "host";

  if (categories.has("Initial Access")) {
    nodes.push({ id: "lure", kind: "file", label: "Email attachment", sublabel: "Initial access vector" });
    edges.push({ from: "host", to: "lure", label: "opened" });
    nodes.push({ id: "parent", kind: "process", label: "winword.exe", sublabel: "Office parent process" });
    edges.push({ from: "lure", to: "parent", label: "spawned" });
    leadId = "parent";
  }

  nodes.push({
    id: "process",
    kind: "process",
    label: process,
    sublabel: "Flagged process",
    severity
  });
  edges.push({ from: leadId, to: "process", label: categories.has("Initial Access") ? "spawned" : "executed" });
  leadId = "process";

  if (categories.has("Obfuscated Execution") || categories.has("Scripting Execution")) {
    nodes.push({ id: "exec", kind: "process", label: "Encoded command block", sublabel: "Base64 / hidden window", severity });
    edges.push({ from: "process", to: "exec", label: "decoded & ran" });
  }

  if (categories.has("Credential Access")) {
    nodes.push({ id: "cred", kind: "credential", label: "lsass.exe memory", sublabel: "Credential material accessed", severity: "critical" });
    edges.push({ from: leadId, to: "cred", label: "accessed" });
  }

  if (categories.has("Persistence")) {
    nodes.push({ id: "persist", kind: "file", label: "Scheduled task / Run key", sublabel: "Persistence mechanism" });
    edges.push({ from: leadId, to: "persist", label: "created" });
  }

  if (categories.has("Lateral Movement")) {
    const remoteHost = entities.hosts[1] ?? "additional hosts";
    nodes.push({ id: "lateral", kind: "host", label: remoteHost, sublabel: "Remote session target", severity: "high" });
    edges.push({ from: leadId, to: "lateral", label: "PsExec / WMI / RDP" });
  }

  if (categories.has("Command and Control") || categories.has("Exfiltration Staging")) {
    const ip = entities.ips[0] ?? "external host";
    nodes.push({ id: "network", kind: "network", label: ip, sublabel: "Outbound connection", severity: "high" });
    edges.push({ from: leadId, to: "network", label: "connected to" });
  }

  if (categories.has("Impact")) {
    nodes.push({ id: "impact", kind: "file", label: "Mass file encryption", sublabel: "Ransomware payload", severity: "critical" });
    edges.push({ from: leadId, to: "impact", label: "triggered" });
    leadId = "impact";
  }

  nodes.push({ id: "alert", kind: "alert", label: "Alert generated", sublabel: analysis.id, severity });
  edges.push({ from: leadId, to: "alert", label: "correlated by detection engine" });

  return { nodes, edges };
}
