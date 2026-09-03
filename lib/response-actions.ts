import type { IncidentAnalysis, ResponseActionDef } from "./types";

// SOAR-style automated response actions. These are simulated end-to-end —
// no real endpoint, firewall, or IdP is ever contacted — but the set offered
// and the mock execution log are shaped like a real EDR/XDR playbook.
export function buildResponseActions(analysis: IncidentAnalysis): ResponseActionDef[] {
  const categories = new Set(analysis.riskFactors.map((f) => f.label));
  const host = analysis.entities.hosts[0] ?? "the affected host";
  const user = analysis.entities.users[0] ?? "the affected account";
  const ip = analysis.entities.ips[0] ?? "the external indicator";
  const process = analysis.entities.processes[0] ?? "the flagged process";

  const actions: ResponseActionDef[] = [];

  const wantsIsolation =
    categories.has("Impact") || categories.has("Lateral Movement") || categories.has("Credential Access") || analysis.severity === "critical";

  actions.push({
    id: "isolate-host",
    label: `Isolate ${host}`,
    description: "Cuts network egress on the endpoint while keeping the EDR agent's own management channel alive.",
    category: "containment",
    priority: wantsIsolation ? "immediate" : "medium",
    logLines: [
      `[EDR AGENT] Isolation policy pushed to ${host}...`,
      `[EDR AGENT] Network egress blocked, management channel preserved.`,
      `[EDR AGENT] Host isolation confirmed — ${host} is now quarantined from the network.`
    ]
  });

  actions.push({
    id: "kill-process",
    label: `Kill ${process}`,
    description: "Terminates the flagged process tree on the endpoint and blocks it from relaunching.",
    category: "eradication",
    priority: categories.has("Obfuscated Execution") || categories.has("Impact") ? "immediate" : "high",
    logLines: [
      `[EDR AGENT] Sending terminate signal for process tree rooted at ${process}...`,
      `[EDR AGENT] Process tree terminated (3 child processes included).`,
      `[EDR AGENT] Execution block rule added to prevent relaunch on ${host}.`
    ]
  });

  if (categories.has("Command and Control") || categories.has("Exfiltration Staging")) {
    actions.push({
      id: "block-ip",
      label: `Block ${ip}`,
      description: "Pushes a network block for the indicator across the perimeter firewall and DNS sinkhole.",
      category: "containment",
      priority: "high",
      logLines: [
        `[FIREWALL] Adding deny rule for ${ip} to perimeter policy...`,
        `[DNS] Sinkholing any resolved domains pointing to ${ip}...`,
        `[FIREWALL] Block rule active across all edge nodes.`
      ]
    });
  }

  if (categories.has("Credential Access") || categories.has("Initial Access")) {
    actions.push({
      id: "reset-credentials",
      label: `Force credential reset — ${user}`,
      description: "Expires the account's current session and password, and revokes active OAuth/API tokens.",
      category: "containment",
      priority: "immediate",
      logLines: [
        `[IDENTITY PROVIDER] Revoking active sessions for ${user}...`,
        `[IDENTITY PROVIDER] Password reset forced at next login.`,
        `[IDENTITY PROVIDER] Revoked 2 active OAuth application grants.`
      ]
    });
  }

  actions.push({
    id: "quarantine-file",
    label: "Quarantine associated artifacts",
    description: "Moves the flagged binaries and dropped files into secure quarantine storage for later analysis.",
    category: "eradication",
    priority: "medium",
    logLines: [
      `[EDR AGENT] Locating artifacts associated with ${analysis.id}...`,
      `[EDR AGENT] 2 files moved to quarantine, SHA-256 hashes recorded.`,
      `[EDR AGENT] Quarantine complete — artifacts preserved for forensic review.`
    ]
  });

  actions.push({
    id: "memory-capture",
    label: `Capture forensic image — ${host}`,
    description: "Triggers a full memory and disk snapshot before any further remediation, for later forensic review.",
    category: "investigation",
    priority: categories.has("Credential Access") ? "high" : "low",
    logLines: [
      `[FORENSICS] Requesting memory capture from ${host}...`,
      `[FORENSICS] Snapshot in progress (this normally takes several minutes)...`,
      `[FORENSICS] Capture stored in evidence locker, chain of custody logged.`
    ]
  });

  actions.push({
    id: "escalate",
    label: "Escalate to Tier 2 / IR team",
    description: "Opens a formal incident record and pages the on-call incident responder with this investigation attached.",
    category: "investigation",
    priority: analysis.severity === "critical" || analysis.severity === "high" ? "immediate" : "low",
    logLines: [
      `[ON-CALL] Paging Tier 2 incident response rotation...`,
      `[TICKETING] Incident record created and linked to ${analysis.id}.`,
      `[ON-CALL] Acknowledged — Tier 2 analyst assigned.`
    ]
  });

  const order = { immediate: 0, high: 1, medium: 2, low: 3 } as const;
  return actions.sort((a, b) => order[a.priority] - order[b.priority]);
}
