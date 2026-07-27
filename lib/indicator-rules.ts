import type { MitreTechnique } from "./types";

export interface IndicatorRule {
  id: string;
  category: string;
  pattern: RegExp;
  weight: number;
  strength: "strong" | "moderate" | "weak";
  techniqueIds: string[];
  findingTitle: string;
  findingDetail: string;
  whyItMatters: string;
}

export const TECHNIQUES: Record<string, MitreTechnique> = {
  "T1059.001": {
    id: "T1059.001",
    name: "Command and Scripting Interpreter: PowerShell",
    tactic: "Execution",
    rationale: "PowerShell was invoked to run attacker-supplied or obfuscated logic."
  },
  T1059: {
    id: "T1059",
    name: "Command and Scripting Interpreter",
    tactic: "Execution",
    rationale: "A command-line or scripting interpreter executed logic outside normal user workflow."
  },
  T1027: {
    id: "T1027",
    name: "Obfuscated Files or Information",
    tactic: "Defense Evasion",
    rationale: "Content was encoded (e.g. Base64) to hide the true command from casual inspection and static detection."
  },
  T1218: {
    id: "T1218",
    name: "System Binary Proxy Execution",
    tactic: "Defense Evasion",
    rationale: "A trusted, signed Windows binary was used to proxy execution of attacker logic, a common AV/allow-list bypass."
  },
  T1071: {
    id: "T1071",
    name: "Application Layer Protocol",
    tactic: "Command and Control",
    rationale: "Outbound traffic used a standard application protocol to blend in with legitimate network activity."
  },
  "T1071.004": {
    id: "T1071.004",
    name: "Application Layer Protocol: DNS",
    tactic: "Command and Control",
    rationale: "DNS queries were used as a covert channel, a known tunneling technique that evades traditional egress filtering."
  },
  T1041: {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    tactic: "Exfiltration",
    rationale: "Data appears to have left the environment over the same channel used for command and control."
  },
  T1003: {
    id: "T1003",
    name: "OS Credential Dumping",
    tactic: "Credential Access",
    rationale: "Tooling or process access consistent with harvesting credentials directly from memory or the OS."
  },
  T1021: {
    id: "T1021",
    name: "Remote Services",
    tactic: "Lateral Movement",
    rationale: "A remote administration protocol was used to move between hosts, which is how intrusions spread laterally."
  },
  T1053: {
    id: "T1053",
    name: "Scheduled Task/Job",
    tactic: "Persistence",
    rationale: "A scheduled task can re-launch attacker code automatically, surviving reboots and logoffs."
  },
  T1547: {
    id: "T1547",
    name: "Boot or Logon Autostart Execution",
    tactic: "Persistence",
    rationale: "Autostart locations (registry run keys, startup folder) let code survive a reboot without user action."
  },
  T1562: {
    id: "T1562",
    name: "Impair Defenses",
    tactic: "Defense Evasion",
    rationale: "Security tooling or logging appears to have been disabled or bypassed, reducing visibility into follow-on activity."
  },
  T1082: {
    id: "T1082",
    name: "System Information Discovery",
    tactic: "Discovery",
    rationale: "Commands gathered host configuration data, typically used to plan next steps after initial access."
  },
  T1087: {
    id: "T1087",
    name: "Account Discovery",
    tactic: "Discovery",
    rationale: "Local or domain account enumeration is a common precursor to privilege escalation or lateral movement."
  },
  T1560: {
    id: "T1560",
    name: "Archive Collected Data",
    tactic: "Collection",
    rationale: "Data was compressed/archived before transfer, typically to stage it for exfiltration."
  },
  T1486: {
    id: "T1486",
    name: "Data Encrypted for Impact",
    tactic: "Impact",
    rationale: "File encryption consistent with a ransomware payload was observed."
  },
  T1566: {
    id: "T1566",
    name: "Phishing",
    tactic: "Initial Access",
    rationale: "A malicious email lure or attachment appears to be the initial access vector."
  },
  T1110: {
    id: "T1110",
    name: "Brute Force",
    tactic: "Credential Access",
    rationale: "Repeated authentication failures are consistent with password guessing or credential stuffing."
  },
  T1078: {
    id: "T1078",
    name: "Valid Accounts",
    tactic: "Defense Evasion",
    rationale: "Activity relies on a legitimate account, which blends attacker actions in with normal user behavior."
  },
  T1105: {
    id: "T1105",
    name: "Ingress Tool Transfer",
    tactic: "Command and Control",
    rationale: "A secondary tool or payload appears to have been downloaded onto the host post-compromise."
  },
  "T1505.003": {
    id: "T1505.003",
    name: "Server Software Component: Web Shell",
    tactic: "Persistence",
    rationale: "A web shell gives an attacker durable, browser-reachable remote code execution on the server."
  },
  T1490: {
    id: "T1490",
    name: "Inhibit System Recovery",
    tactic: "Impact",
    rationale: "Deletion of backups or shadow copies removes the victim's ability to recover without paying a ransom."
  }
};

export const INDICATOR_RULES: IndicatorRule[] = [
  {
    id: "encoded-powershell",
    category: "Obfuscated Execution",
    pattern: /-enc\b|-encodedcommand|encoded ?command|frombase64string|invoke-expression|iex\s*\(/i,
    weight: 22,
    strength: "strong",
    techniqueIds: ["T1059.001", "T1027"],
    findingTitle: "Encoded PowerShell command execution",
    findingDetail:
      "The alert describes a PowerShell command that was Base64-encoded or otherwise obfuscated before execution. Legitimate admin scripts are rarely encoded; this is one of the highest-signal indicators of an attempt to hide command content from logging and AV signature matching.",
    whyItMatters:
      "Attackers encode commands to defeat simple string-matching detections and to make manual triage harder — it is a deliberate evasion step, not an accident."
  },
  {
    id: "powershell-generic",
    category: "Scripting Execution",
    pattern: /powershell(\.exe)?/i,
    weight: 8,
    strength: "moderate",
    techniqueIds: ["T1059.001"],
    findingTitle: "PowerShell process execution",
    findingDetail:
      "PowerShell was launched on the endpoint. PowerShell is a dual-use tool — heavily used by IT for legitimate automation, and equally by attackers for living-off-the-land execution.",
    whyItMatters:
      "PowerShell has deep access to the OS, .NET, and the network stack, making it a favorite post-exploitation tool. Context (parent process, arguments, encoding) determines intent."
  },
  {
    id: "hidden-window",
    category: "Defense Evasion",
    pattern: /-w(indowstyle)?\s*hidden|-nop\b|-noprofile/i,
    weight: 14,
    strength: "strong",
    techniqueIds: ["T1562", "T1027"],
    findingTitle: "Execution flags tuned to avoid user visibility",
    findingDetail:
      "Flags such as a hidden window style or a stripped profile were used, which are common when a script is meant to run without alerting the logged-in user.",
    whyItMatters: "Legitimate scheduled automation rarely needs to hide its window from an interactive user session."
  },
  {
    id: "living-off-the-land",
    category: "System Binary Proxy Execution",
    pattern: /\b(mshta|rundll32|regsvr32|certutil|bitsadmin|wmic|msbuild|installutil)(\.exe)?\b/i,
    weight: 18,
    strength: "strong",
    techniqueIds: ["T1218"],
    findingTitle: "Living-off-the-land binary (LOLBin) usage",
    findingDetail:
      "A signed Windows system binary not normally used for this purpose appears in the execution chain. These binaries are frequently abused to proxy-execute attacker code because they are trusted and often allow-listed.",
    whyItMatters:
      "LOLBins let an attacker execute code while appearing as a native, digitally-signed Windows process — a well-documented AV and application-control bypass."
  },
  {
    id: "external-connection",
    category: "Command and Control",
    pattern: /external (ip|connection|address|domain)|outbound connection|connection (was )?established to/i,
    weight: 16,
    strength: "moderate",
    techniqueIds: ["T1071"],
    findingTitle: "Outbound connection to an external address",
    findingDetail:
      "The endpoint established a network connection to an address outside the corporate network. Combined with suspicious process activity, this pattern is consistent with command-and-control check-in or data exfiltration.",
    whyItMatters:
      "Unexplained outbound connections from a workstation — especially paired with script execution — are a primary way analysts first spot a live C2 channel."
  },
  {
    id: "dns-tunnel",
    category: "Command and Control",
    pattern: /dns tunnel|txt record|unusual dns quer/i,
    weight: 16,
    strength: "moderate",
    techniqueIds: ["T1071.004"],
    findingTitle: "Possible DNS-based covert channel",
    findingDetail: "DNS query patterns described in the alert are consistent with tunneling data or C2 traffic inside DNS requests/responses.",
    whyItMatters: "DNS tunneling routinely bypasses proxy and firewall egress controls that only inspect HTTP(S) traffic."
  },
  {
    id: "credential-dumping",
    category: "Credential Access",
    pattern: /mimikatz|lsass|sekurlsa|procdump.*lsass|credential dump/i,
    weight: 30,
    strength: "strong",
    techniqueIds: ["T1003"],
    findingTitle: "Credential dumping tooling or LSASS access",
    findingDetail:
      "The alert references tooling or process access patterns associated with dumping credentials from the LSASS process or similar in-memory credential stores.",
    whyItMatters:
      "Successful credential dumping typically precedes lateral movement and privilege escalation across the environment — this is a high-urgency indicator."
  },
  {
    id: "lateral-movement",
    category: "Lateral Movement",
    pattern: /psexec|admin\$|\bwmic\b.*process call create|remote desktop|\brdp\b|smb.*(lateral|remote exec)/i,
    weight: 20,
    strength: "strong",
    techniqueIds: ["T1021"],
    findingTitle: "Lateral movement tooling or remote service abuse",
    findingDetail:
      "The alert describes remote execution or remote session activity (e.g. PsExec, WMI process creation, RDP) consistent with moving from one host to another.",
    whyItMatters: "Lateral movement is the stage where a single-host incident becomes a network-wide compromise."
  },
  {
    id: "persistence-task",
    category: "Persistence",
    pattern: /scheduled task|schtasks|wmi (event )?subscription/i,
    weight: 16,
    strength: "moderate",
    techniqueIds: ["T1053"],
    findingTitle: "Scheduled task or WMI subscription created",
    findingDetail: "A new scheduled task or WMI event subscription was created, which is a common way to keep code running after a reboot or logoff.",
    whyItMatters: "Persistence mechanisms are what let an attacker survive a simple reboot or password reset."
  },
  {
    id: "persistence-registry",
    category: "Persistence",
    pattern: /run key|\\currentversion\\run|startup folder/i,
    weight: 16,
    strength: "moderate",
    techniqueIds: ["T1547"],
    findingTitle: "Autostart registry key or startup folder modified",
    findingDetail: "A registry Run key or the Startup folder was modified, which is a classic autostart persistence mechanism.",
    whyItMatters: "Autostart entries are one of the first things responders check when scoping how long an attacker has had a foothold."
  },
  {
    id: "defense-evasion",
    category: "Defense Evasion",
    pattern: /disabl(e|ed).*(defender|antivirus|logging|firewall)|amsi bypass|stop-service.*(defender|sense)/i,
    weight: 22,
    strength: "strong",
    techniqueIds: ["T1562"],
    findingTitle: "Security tooling or logging appears to have been disabled",
    findingDetail: "The alert indicates that endpoint protection, logging, or AMSI was tampered with or disabled.",
    whyItMatters: "Disabling defenses is almost never something a benign process does — it's one of the strongest signals of malicious intent available."
  },
  {
    id: "discovery",
    category: "Discovery",
    pattern: /\bwhoami\b|systeminfo|net (user|group|view|localgroup)|nltest|ipconfig \/all/i,
    weight: 10,
    strength: "weak",
    techniqueIds: ["T1082", "T1087"],
    findingTitle: "Host or account discovery commands",
    findingDetail: "Enumeration commands gathering system, network, or account information were observed.",
    whyItMatters: "Discovery commands are how an attacker orients themselves after landing on a host — common but low-signal on their own."
  },
  {
    id: "exfiltration-archive",
    category: "Exfiltration Staging",
    pattern: /\b7z(ip)?\b|\bwinrar\b|compress(ed)? and (upload|transfer)|staged for (exfil|upload)/i,
    weight: 18,
    strength: "moderate",
    techniqueIds: ["T1560", "T1041"],
    findingTitle: "Data archived and staged for transfer",
    findingDetail: "Files were compressed/archived in a way consistent with staging data for exfiltration.",
    whyItMatters: "Archiving unrelated files together right before network transfer is a strong exfiltration-staging pattern."
  },
  {
    id: "ransomware",
    category: "Impact",
    pattern: /ransom|\.locked\b|\.encrypted\b|decrypt.*instructions|readme.*(decrypt|ransom)|shadow ?copies? (deleted|removed)|vssadmin delete/i,
    weight: 34,
    strength: "strong",
    techniqueIds: ["T1486", "T1490"],
    findingTitle: "Indicators consistent with active ransomware",
    findingDetail:
      "Mass file encryption, ransom-note artifacts, or shadow-copy/backup deletion were referenced — the signature pattern of a ransomware encryption event.",
    whyItMatters: "This is a business-continuity emergency, not just a security alert — every minute of delay increases the number of encrypted files."
  },
  {
    id: "phishing",
    category: "Initial Access",
    pattern: /phishing|malicious attachment|enable(d)? (macro|content)|suspicious email/i,
    weight: 16,
    strength: "moderate",
    techniqueIds: ["T1566"],
    findingTitle: "Phishing-consistent initial access",
    findingDetail: "The alert references an email attachment or macro-enabled document, consistent with a phishing delivery vector.",
    whyItMatters: "Phishing remains the single most common initial-access vector — identifying the lure helps stop it from reaching other users."
  },
  {
    id: "brute-force",
    category: "Credential Access",
    pattern: /multiple failed (login|logon)|brute.?force|account lockout|password spray/i,
    weight: 14,
    strength: "moderate",
    techniqueIds: ["T1110"],
    findingTitle: "Repeated authentication failures",
    findingDetail: "A pattern of failed authentication attempts consistent with brute force or password spraying was observed.",
    whyItMatters: "Brute force attempts that eventually succeed give an attacker a valid account, which is far harder to detect than malware."
  },
  {
    id: "c2-tooling",
    category: "Command and Control",
    pattern: /cobalt ?strike|meterpreter|empire\b|beacon(ing)?|c2 (server|traffic|channel)/i,
    weight: 28,
    strength: "strong",
    techniqueIds: ["T1071", "T1105"],
    findingTitle: "Named C2 framework or beacon pattern referenced",
    findingDetail: "The alert references tooling or traffic patterns associated with a known command-and-control framework.",
    whyItMatters: "Confirmed C2 tooling means an attacker very likely has interactive, hands-on-keyboard access to the host right now."
  },
  {
    id: "ingress-tool-transfer",
    category: "Command and Control",
    pattern: /download(ed)?\s+(a\s+|the\s+)?(second(ary)?|additional)\s+payload|download.*payload from/i,
    weight: 18,
    strength: "moderate",
    techniqueIds: ["T1105"],
    findingTitle: "Secondary payload download attempted",
    findingDetail:
      "After initial execution, the host attempted to retrieve an additional payload from an external location — a common second stage after a dropper or macro runs.",
    whyItMatters: "A successful secondary download usually means the attacker now has a more capable, purpose-built tool running on the host, not just the initial lure."
  },
  {
    id: "web-shell",
    category: "Persistence",
    pattern: /web ?shell|\.aspx.*(shell|cmd)|jsp ?shell/i,
    weight: 22,
    strength: "strong",
    techniqueIds: ["T1505.003"],
    findingTitle: "Possible web shell on a server",
    findingDetail: "A file or request pattern consistent with a web shell was described, giving an attacker durable remote code execution on the server.",
    whyItMatters: "Web shells are frequently reused across long-running intrusions and often survive routine patching if not explicitly found and removed."
  }
];
