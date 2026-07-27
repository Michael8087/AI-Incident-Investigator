import type { ExampleAlert } from "./types";

export const EXAMPLE_ALERTS: ExampleAlert[] = [
  {
    label: "Encoded PowerShell + external connection",
    category: "Suspicious Execution",
    text: "PowerShell executed an encoded command (-enc) with a hidden window style from endpoint LAPTOP-154. User: john.smith. Parent process: outlook.exe. External connection established to 185.xxx.xxx.xxx on port 443 within 40 seconds of execution."
  },
  {
    label: "Credential dumping + lateral movement",
    category: "Active Intrusion",
    text: "EDR flagged procdump.exe accessing lsass.exe memory on host WIN-FIN02. Minutes later, PsExec was used to establish a remote session from WIN-FIN02 to WIN-FIN07 and WIN-FIN11 using the account svc_backup. Multiple hosts in the finance VLAN show the same command pattern within a 10 minute window."
  },
  {
    label: "Ransomware in progress",
    category: "Critical Impact",
    text: "Mass file rename activity detected on file server FS-PROD-03: over 4,000 files renamed to .locked extension in the last 3 minutes. A file named README_DECRYPT.txt was created in each affected directory. vssadmin delete shadows /all executed immediately prior to the encryption activity. User account: helpdesk_admin."
  },
  {
    label: "Phishing → macro execution",
    category: "Initial Access",
    text: "User jane.doe opened an email attachment 'Invoice_4471.docm' and enabled macro content. Within 12 seconds, winword.exe spawned powershell.exe which attempted to download a secondary payload from an external domain. Host: LAPTOP-A22."
  },
  {
    label: "Low-signal / ambiguous",
    category: "Needs Triage",
    text: "Endpoint DESKTOP-9F1 ran whoami and systeminfo shortly after user login. No further activity observed in the last hour. User: contractor_temp3."
  }
];
