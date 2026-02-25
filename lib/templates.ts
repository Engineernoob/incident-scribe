import type { IncidentParse } from "./parse";

type Ctx = {
  title: string;
  serviceName: string;
  customerImpact: string;
  parsed: IncidentParse;
  redactionEnabled: boolean;
};

export function renderStatusUpdate(ctx: Ctx): string {
  const now = new Date().toISOString();
  return `# Status Update — ${ctx.title}

**Service:** ${ctx.serviceName}  
**Status:** Investigating / Mitigating  
**Customer Impact:** ${ctx.customerImpact}  
**Last Updated:** ${now}

## Summary
We are investigating an issue affecting **${ctx.serviceName}**. Initial signals indicate: **${ctx.parsed.impactGuess ?? "unknown impact"}**.

## What we know
- Detected timestamps: ${ctx.parsed.timestamps.length}
- Notable errors: ${ctx.parsed.errors.slice(0, 8).join(", ") || "None detected"}
- Redaction: ${ctx.redactionEnabled ? "Enabled" : "Disabled"}

## Next update
We will provide another update within **30 minutes**, or sooner if we identify the cause.

`;
}

export function renderPostmortem(ctx: Ctx): string {
  return `# Postmortem — ${ctx.title}

## Overview
**Service:** ${ctx.serviceName}  
**Customer Impact:** ${ctx.customerImpact}  
**Primary Symptoms:** ${ctx.parsed.impactGuess ?? "TBD"}  
**Redaction:** ${ctx.redactionEnabled ? "Enabled" : "Disabled"}

## Timeline (extracted)
${ctx.parsed.timeline.length ? ctx.parsed.timeline.map((t) => `- **${t.at}** — ${t.event}`).join("\n") : "_No timeline items detected. Paste a timeline or include timestamps in logs._"}

## Root Cause
_TBD (what failed and why)_

## Trigger
_TBD (what changed)_

## Detection
- How did we learn about the incident?
- What signals/alerts fired (or didn’t)?

## Resolution
_TBD (what fixed it)_

## Impact
- Who was affected?
- Duration:
- Scope:

## What went well
- 

## What didn’t go well
- 

## Action items
- [ ] Add monitoring/alerting improvements
- [ ] Add runbook updates
- [ ] Add automated rollback / safer deploys

`;
}

export function renderActionItems(ctx: Ctx): string {
  return `# Action Items — ${ctx.title}

## Immediate (0–24h)
- [ ] Add temporary mitigations / feature flag / throttling
- [ ] Capture evidence (logs, dashboards, deploy hashes)

## Short-term (1–7d)
- [ ] Add alerting for ${ctx.parsed.impactGuess ?? "incident symptoms"}
- [ ] Add integration tests for the failure mode
- [ ] Update runbook with diagnosis steps

## Long-term (1–4w)
- [ ] Improve resiliency (timeouts, retries, circuit breaker)
- [ ] Reduce blast radius (rate limiting, isolation, queues)
- [ ] Perform load test / chaos test

## Notes (extracted signals)
- Services seen: ${ctx.parsed.services.join(", ") || "None detected"}
- Errors seen: ${ctx.parsed.errors.slice(0, 12).join(", ") || "None detected"}

`;
}
