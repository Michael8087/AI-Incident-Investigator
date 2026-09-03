export interface Playbook {
  id: string;
  name: string;
  trigger: string;
  category: "containment" | "eradication" | "investigation" | "recovery";
  steps: string[];
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: "ransomware",
    name: "Ransomware Containment",
    trigger: "Mass file encryption, shadow-copy deletion, or ransom-note artifacts detected",
    category: "containment",
    steps: [
      "Isolate the affected host(s) from the network immediately",
      "Verify offline/immutable backup integrity before any recovery attempt",
      "Identify patient zero and initial access vector",
      "Capture a forensic image before remediation destroys evidence",
      "Rotate credentials for any account active on the affected host(s)"
    ]
  },
  {
    id: "credential-theft",
    name: "Credential Theft Response",
    trigger: "LSASS access, credential dumping tooling, or mimikatz-style activity",
    category: "eradication",
    steps: [
      "Force a credential reset for every account with a session on the host",
      "Revoke active tokens/sessions at the identity provider",
      "Hunt for the same tooling signature across the fleet",
      "Review authentication logs for anomalous logins using the affected credentials"
    ]
  },
  {
    id: "lateral-movement",
    name: "Lateral Movement Containment",
    trigger: "PsExec, WMI remote execution, or unexpected RDP/SMB sessions between hosts",
    category: "containment",
    steps: [
      "Isolate the source host and any confirmed targets",
      "Map the full blast radius via authentication and network logs",
      "Disable the account used to authenticate the remote sessions",
      "Review segmentation rules that allowed the lateral hop"
    ]
  },
  {
    id: "cloud-identity",
    name: "Cloud Identity Compromise",
    trigger: "New IAM access keys, privilege escalation, or console logins without MFA",
    category: "containment",
    steps: [
      "Revoke the access key/session immediately",
      "Enumerate every resource and policy touched during the session",
      "Enforce MFA and rotate credentials for the affected identity",
      "Review CloudTrail/audit logs for every region, not just the one flagged"
    ]
  },
  {
    id: "phishing",
    name: "Phishing Response",
    trigger: "Malicious attachment, macro execution, or user-reported suspicious email",
    category: "investigation",
    steps: [
      "Pull the source email and check for other recipients",
      "Purge the message from any other inbox it reached",
      "Sandbox-detonate the attachment/link to confirm payload behavior",
      "Brief the affected user and reset credentials if they entered anything"
    ]
  },
  {
    id: "web-shell",
    name: "Web Shell Eradication",
    trigger: "Unexpected file written to a public-facing web root, or IIS/Apache worker spawning shells",
    category: "eradication",
    steps: [
      "Isolate the server at the network layer, keep it running for forensics",
      "Identify and remove the web shell file and any dropped payloads",
      "Patch the vulnerability that allowed the upload",
      "Review access logs for every request the shell served"
    ]
  }
];
