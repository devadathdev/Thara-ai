export type ThreatSignal = {
  source:string; indicator:string; severity:"low"|"medium"|"high"|"critical";
  confidence:number; recommendation:string;
};

const riskyPatterns = [
  {re:/credential|password|api.?key|token|secret/i, severity:"high" as const, recommendation:"Treat exposed credentials as compromised; rotate them and remove them from source/history."},
  {re:/phishing|verify your account|urgent payment|suspicious link/i, severity:"high" as const, recommendation:"Do not click or submit credentials. Verify the sender and destination independently."},
  {re:/ransomware|encrypt(ed|ion).*files|extortion/i, severity:"critical" as const, recommendation:"Isolate affected systems, preserve evidence, and begin incident-response procedures."},
  {re:/malware|trojan|keylogger|stealer/i, severity:"high" as const, recommendation:"Disconnect the affected endpoint from untrusted networks and run trusted security tooling."},
];

export function analyzeThreat(text:string):ThreatSignal[] {
  return riskyPatterns.filter(x=>x.re.test(text)).map(x=>({
    source:"THARA Security AI",
    indicator:text.slice(0,180),
    severity:x.severity,
    confidence:0.78,
    recommendation:x.recommendation
  }));
}

export function earlyPrecautions():string[] {
  return [
    "Use unique passwords and passkeys where available.",
    "Keep OS, browser, dependencies and security tools patched.",
    "Never place API keys in client bundles or public repositories.",
    "Enable MFA/App Check and least-privilege access.",
    "Keep encrypted, tested backups with at least one offline/isolated copy.",
    "Log authentication, privilege and unusual network events for review."
  ];
}