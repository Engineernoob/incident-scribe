Incident Scribe

Deterministic incident documentation generator for engineering teams.

Incident Scribe converts raw logs, timelines, and notes into structured:

Status Updates

Postmortems

Action Item Lists

Designed for repeatability, testability, and production workflows.

Why This Exists

During incidents, engineers waste time:

Rewriting status updates manually

Building postmortems from scattered logs

Extracting timelines from noisy output

Forgetting to redact sensitive data

Incident Scribe makes incident documentation:

Structured

Repeatable

Deterministic

Testable

No AI randomness. No hallucinations. Just consistent outputs derived from your input.

Features
Deterministic Generation

Produces predictable Markdown output using rule-based parsing and structured templates.

Timeline Extraction

Detects and extracts timestamps from logs to construct incident timelines.

Error Detection

Identifies common error signals such as:

5xx responses

Timeouts

Connection resets

Exception patterns

Secret Redaction

Optionally replaces:

Emails

Bearer tokens

API keys

JWT-like strings

password=, token= style values

With [REDACTED] before document generation.

Markdown Export

Generated documents can be:

Copied

Downloaded as .md

Used directly in GitHub, Notion, or internal tooling

Architecture

app/
api/generate/route.ts → Deterministic document generator
page.tsx → UI

lib/
parse.ts → Log parsing + timeline extraction
redact.ts → Secret redaction
templates.ts → Markdown templates

test/
parse.test.ts
redact.test.ts

API

POST /api/generate

Request body:

{
"type": "status" | "postmortem" | "actions",
"title": "Incident title",
"serviceName": "api",
"customerImpact": "Users experienced latency",
"rawText": "logs or timeline text",
"redact": true
}

Response:

{
"markdown": "...",
"meta": {
"extractedTimestamps": number,
"extractedErrors": number,
"redacted": boolean
}
}

Example Workflow

Paste logs or timeline

Enable redaction if needed

Generate:

Status Update for stakeholders

Postmortem for internal review

Action Items for follow-up

Export Markdown

QA & Testing

Incident Scribe includes:

Unit Tests (Vitest)

Secret redaction correctness

Timeline parsing accuracy

Template rendering integrity

Run:
npm run test:run

E2E Tests (Playwright)

- Generate document from UI

- Validate visible output

Run:
npm run test:e2e

Development

Requirements:

- Node 18+

Install:
npm install

Run locally:
npm run dev

Build:
npm run build

Design Principles

Deterministic output over probabilistic generation

Testable parsing logic

Security-aware redaction

Minimal external dependencies

Clear separation of parsing, transformation, and rendering

Roadmap

Deterministic chaos validation mode

Export to PDF

Incident severity tagging

Structured JSON export

Slack-ready status format

License

MIT
