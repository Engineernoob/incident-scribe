const patterns: Array<{ name: string; re: RegExp }> = [
  // Generic API keys / tokens-ish strings
  { name: "api_key", re: /\b([A-Za-z0-9_\-]{24,})\b/g },

  // AWS Access Key ID
  { name: "aws_access_key_id", re: /\bAKIA[0-9A-Z]{16}\b/g },

  // JWT (very rough but effective)
  { name: "jwt", re: /\beyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\b/g },

  // Emails
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },

  // Bearer tokens
  { name: "bearer", re: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g },

  // Common secret=... patterns
  { name: "secret_kv", re: /\b(password|passwd|secret|token|api_key)\s*=\s*([^\s]+)/gi },
];

export function redactSecrets(input: string): string {
  let out = input;

  // secret=VALUE -> secret=[REDACTED]
  out = out.replace(patterns.find(p => p.name === "secret_kv")!.re, (_m, k) => `${k}=[REDACTED]`);

  for (const p of patterns) {
    if (p.name === "secret_kv") continue;
    out = out.replace(p.re, "[REDACTED]");
  }

  return out;
}