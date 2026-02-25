export type IncidentParse = {
  timestamps: string[];
  errors: string[];
  services: string[];
  impactGuess?: string;
  serviceGuess?: string;
  timeline: Array<{ at: string; event: string }>;
};

const timestampRes = [
  /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/g, // 2026-02-24 12:34:56Z
  /\b\d{2}:\d{2}:\d{2}\b/g, // 12:34:56
];

const errorRes = [
  /\b(5\d\d|4\d\d)\b/g,
  /\b(timeout|timed out|ECONNRESET|ECONNREFUSED|ENOTFOUND)\b/gi,
  /\b(exception|stack trace|error)\b/gi,
];

const serviceRe = /\b(service|svc|app)\s*[:=]\s*([A-Za-z0-9_\-./]+)\b/gi;

export function parseIncident(text: string): IncidentParse {
  const timestamps = new Set<string>();
  for (const re of timestampRes) {
    const m = text.match(re);
    if (m) m.forEach((x) => timestamps.add(x));
  }

  const errors: string[] = [];
  for (const re of errorRes) {
    const m = text.match(re);
    if (m) errors.push(...m.slice(0, 50));
  }

  const services = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = serviceRe.exec(text)) !== null) {
    services.add(match[2]);
  }

  // Build a crude timeline by taking lines that contain a timestamp
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const timeline: Array<{ at: string; event: string }> = [];

  for (const line of lines) {
    const ts = extractFirstTimestamp(line);
    if (ts)
      timeline.push({ at: ts, event: stripTimestamp(line).slice(0, 220) });
  }

  const serviceGuess = services.values().next().value as string | undefined;
  const impactGuess = guessImpact(text);

  return {
    timestamps: Array.from(timestamps).slice(0, 100),
    errors: uniq(errors).slice(0, 80),
    services: Array.from(services).slice(0, 20),
    serviceGuess,
    impactGuess,
    timeline: timeline.slice(0, 30),
  };
}

function extractFirstTimestamp(line: string): string | null {
  for (const re of timestampRes) {
    const m = line.match(re);
    if (m && m[0]) return m[0];
  }
  return null;
}

function stripTimestamp(line: string): string {
  let out = line;
  for (const re of timestampRes) out = out.replace(re, "").trim();
  return out;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

function guessImpact(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes("outage") || t.includes("down")) return "Service outage";
  if (t.includes("degraded") || t.includes("latency"))
    return "Degraded performance / elevated latency";
  if (t.includes("rate limit") || t.includes("429"))
    return "Requests rate-limited";
  if (t.includes("timeout")) return "Timeouts affecting requests";
  if (t.includes("5xx") || t.includes("500") || t.includes("503"))
    return "Server errors (5xx)";
  return undefined;
}
