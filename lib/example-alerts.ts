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
  },
  {
    label: "DNS tunneling / covert C2",
    category: "Command and Control",
    text: "Unusual DNS query volume detected from host SRV-APP04: over 900 TXT record lookups to a single external domain in 5 minutes, each query encoding a small chunk of data. External connection established to 91.xxx.xxx.xxx shortly after. User account: svc_monitoring."
  },
  {
    label: "Web shell on public server",
    category: "Persistence",
    text: "A new file 'cache_helper.aspx' was written to the wwwroot directory of public-facing server WEB-EDGE01 by w3wp.exe. The file contains obfuscated code consistent with a web shell. Multiple POST requests followed from external IP 45.xxx.xxx.xxx, each triggering process creation under the IIS worker process."
  },
  {
    label: "Brute force → successful login",
    category: "Credential Access",
    text: "Authentication logs show 340 failed login attempts against account admin_svc from external IP 103.xxx.xxx.xxx over 8 minutes, followed by a successful login. Immediately after, net user and net localgroup administrators commands were run on host DC-PRIMARY."
  },
  {
    label: "Insider data staging",
    category: "Exfiltration Staging",
    text: "User contractor_temp3 copied 14GB from the shared finance drive to a local folder on LAPTOP-778, then ran 7z to compress it into a single password-protected archive at 11:47PM, outside normal working hours. No ticket or change request is associated with this activity."
  },
  {
    label: "Cloud account compromise",
    category: "Initial Access",
    text: "AWS CloudTrail shows a new access key created for IAM user deploy-bot from an unrecognized source IP 178.xxx.xxx.xxx, followed by console login without MFA. Within 2 minutes, the same session called DescribeInstances, CreateUser, and AttachUserPolicy with AdministratorAccess across 3 regions."
  },
  {
    label: "Supply-chain package compromise",
    category: "Initial Access",
    text: "Build server CI-RUNNER-02 installed an updated version of a third-party npm dependency during a routine pipeline run. Immediately after install, a postinstall script executed powershell.exe with an encoded command that attempted an external connection to 194.xxx.xxx.xxx. No developer-initiated activity was logged in the same window."
  }
];
