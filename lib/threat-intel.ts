import type { IncidentAnalysis, IntelVerdict, ThreatIntelRecord } from "./types";

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

const COUNTRIES = ["Russia", "China", "Netherlands", "Romania", "Brazil", "Iran", "Vietnam", "United States", "Ukraine", "Singapore"];
const ASNS = ["AS49505 (Selectel)", "AS16276 (OVH)", "AS14061 (DigitalOcean)", "AS9009 (M247)", "AS20473 (Vultr)", "AS8100 (QuadraNet)"];
const MALWARE_FAMILIES = ["Cobalt Strike", "QakBot", "IcedID", "RedLine Stealer", "AsyncRAT", "Emotet", "Sliver C2"];

const KNOWN_PROCESS_VERDICTS: Record<string, { verdict: IntelVerdict; tags: string[] }> = {
  mimikatz: { verdict: "malicious", tags: ["Offensive security tool", "Credential theft"] },
  procdump: { verdict: "suspicious", tags: ["Dual-use sysinternals tool", "LSASS access capable"] },
  psexec: { verdict: "suspicious", tags: ["Dual-use sysinternals tool", "Remote execution"] },
  powershell: { verdict: "unknown", tags: ["Native Windows binary", "Context-dependent"] },
  rundll32: { verdict: "suspicious", tags: ["LOLBin", "Frequently proxy-abused"] },
  mshta: { verdict: "suspicious", tags: ["LOLBin", "Script host abuse"] },
  certutil: { verdict: "suspicious", tags: ["LOLBin", "Download/decode abuse"] },
  wmic: { verdict: "suspicious", tags: ["LOLBin", "Lateral movement capable"] }
};

function verdictFromScore(score: number): IntelVerdict {
  if (score >= 75) return "malicious";
  if (score >= 45) return "suspicious";
  if (score >= 20) return "unknown";
  return "clean";
}

// Deterministic, simulated threat-intel lookups keyed off the incident's own
// hash — clearly labeled as demo data everywhere it's rendered. Scores lean
// toward "malicious" for higher-severity incidents so the enrichment always
// reads as consistent with the rest of the analysis.
export function buildThreatIntel(analysis: IncidentAnalysis): ThreatIntelRecord[] {
  const seed = hashString(analysis.id + analysis.rawAlert);
  const rng = seededRandom(seed);
  const records: ThreatIntelRecord[] = [];
  const severityBias = { critical: 35, high: 22, medium: 8, low: -10 }[analysis.severity];

  for (const ip of analysis.entities.ips) {
    const score = Math.max(4, Math.min(97, Math.round(30 + severityBias + rng() * 40)));
    const verdict = verdictFromScore(score);
    const tags: string[] = [];
    if (verdict === "malicious") {
      tags.push(`Associated with ${MALWARE_FAMILIES[Math.floor(rng() * MALWARE_FAMILIES.length)]} infrastructure`);
      tags.push("Seen in threat intel feeds (last 30 days)");
    } else if (verdict === "suspicious") {
      tags.push("Hosting provider flagged for abuse reports");
    } else {
      tags.push("No prior malicious activity on record");
    }
    if (rng() > 0.6) tags.push("Bulletproof / low-KYC hosting");

    records.push({
      indicator: ip,
      type: "ip",
      verdict,
      maliciousScore: score,
      country: COUNTRIES[Math.floor(rng() * COUNTRIES.length)],
      asn: ASNS[Math.floor(rng() * ASNS.length)],
      firstSeen: `${Math.max(1, Math.floor(rng() * 240))} days ago`,
      tags,
      source: "Simulated threat intel feed (demo data)"
    });
  }

  for (const proc of analysis.entities.processes) {
    const known = KNOWN_PROCESS_VERDICTS[proc];
    const score = known
      ? known.verdict === "malicious"
        ? Math.round(80 + rng() * 15)
        : known.verdict === "suspicious"
          ? Math.round(45 + rng() * 25)
          : Math.round(15 + rng() * 20)
      : Math.round(10 + rng() * 20);
    records.push({
      indicator: `${proc}.exe`,
      type: "process",
      verdict: known?.verdict ?? "unknown",
      maliciousScore: score,
      firstSeen: `${Math.max(1, Math.floor(rng() * 400))} days ago (binary reputation database)`,
      tags: known?.tags ?? ["No specific reputation data — treat by behavior, not name"],
      source: "Simulated binary reputation lookup (demo data)"
    });
  }

  return records.sort((a, b) => b.maliciousScore - a.maliciousScore);
}
