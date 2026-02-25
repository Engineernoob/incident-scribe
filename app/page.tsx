"use client";

import { useMemo, useState } from "react";

type DocType = "status" | "postmortem" | "actions";

type Meta = {
  extractedTimestamps: number;
  extractedErrors: number;
  redacted: boolean;
};

type GenerateResponse =
  | {
      markdown: string;
      meta: Meta;
    }
  | {
      error: string;
    };

const cardClass =
  "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm";
const fieldClass =
  "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600";
const btnPrimary =
  "rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60";
const btnGhost =
  "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60 disabled:opacity-60";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeFileSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export default function Home() {
  const [title, setTitle] = useState("API Latency Incident");
  const [serviceName, setServiceName] = useState("api");
  const [customerImpact, setCustomerImpact] = useState(
    "Some requests may be slow or intermittently failing.",
  );
  const [rawText, setRawText] = useState(
    `2026-02-24 12:01:02Z service=api latency degraded p95=2400ms
2026-02-24 12:06:40Z service=api error 503 upstream timeout
2026-02-24 12:12:10Z service=api mitigation: scaled replicas + restarted gateway
2026-02-24 12:22:55Z service=api latency improving p95=650ms`,
  );
  const [redact, setRedact] = useState(true);

  const [activeType, setActiveType] = useState<DocType>("postmortem");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string>("");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string>("");

  const filename = useMemo(() => {
    const slug = safeFileSlug(title || "incident");
    const t =
      activeType === "status"
        ? "status"
        : activeType === "actions"
          ? "actions"
          : "postmortem";
    return `${slug || "incident"}-${t}.md`;
  }, [title, activeType]);

  const canGenerate = rawText.trim().length > 0 && !loading;

  const generate = async (type: DocType) => {
    setActiveType(type);
    setLoading(true);
    setError("");
    setMeta(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          rawText,
          redact,
          serviceName,
          customerImpact,
        }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || "error" in data) {
        setMarkdown("");
        setError(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Request failed",
        );
        return;
      }

      setMarkdown(data.markdown);
      setMeta(data.meta);
    } catch (e: unknown) {
      setMarkdown("");
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
      {/* Left: Inputs */}
      <section className={cardClass}>
        <h2 className="text-lg font-medium">Inputs</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Paste logs or a timeline. We’ll extract timestamps/errors and generate
          deterministic docs.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="text-sm text-zinc-300" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="Incident title"
          />

          <label className="text-sm text-zinc-300" htmlFor="service">
            Service
          </label>
          <input
            id="service"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className={fieldClass}
            placeholder="api / gateway / payments"
          />

          <label className="text-sm text-zinc-300" htmlFor="impact">
            Customer impact
          </label>
          <input
            id="impact"
            value={customerImpact}
            onChange={(e) => setCustomerImpact(e.target.value)}
            className={fieldClass}
            placeholder="What did users experience?"
          />

          <div className="mt-2 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div>
              <p className="text-sm text-zinc-200">Redact secrets</p>
              <p className="text-xs text-zinc-400">
                Replaces tokens/emails/keys-like strings with [REDACTED].
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRedact((v) => !v)}
              className={`rounded-full px-3 py-1 text-xs ${
                redact
                  ? "bg-zinc-100 text-zinc-900"
                  : "border border-zinc-700 bg-zinc-950 text-zinc-200"
              }`}
            >
              {redact ? "ON" : "OFF"}
            </button>
          </div>

          <label className="mt-2 text-sm text-zinc-300" htmlFor="raw">
            Logs / timeline
          </label>
          <textarea
            id="raw"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className={`${fieldClass} min-h-55 resize-y font-mono text-xs`}
            placeholder="Paste logs, timeline events, Slack notes, etc."
          />

          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => generate("status")}
              disabled={!canGenerate}
              className={btnPrimary}
            >
              {loading && activeType === "status"
                ? "Generating…"
                : "Status Update"}
            </button>
            <button
              onClick={() => generate("postmortem")}
              disabled={!canGenerate}
              className={btnPrimary}
            >
              {loading && activeType === "postmortem"
                ? "Generating…"
                : "Postmortem"}
            </button>
            <button
              onClick={() => generate("actions")}
              disabled={!canGenerate}
              className={btnPrimary}
            >
              {loading && activeType === "actions"
                ? "Generating…"
                : "Action Items"}
            </button>
          </div>

          {error && (
            <div className="mt-2 rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {meta && (
            <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Extracted timestamps</span>
                <span className="text-zinc-200">
                  {meta.extractedTimestamps}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Extracted errors</span>
                <span className="text-zinc-200">{meta.extractedErrors}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Redaction</span>
                <span className="text-zinc-200">
                  {meta.redacted ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Middle: Output controls */}
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Output</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Deterministic markdown (easy to review, easy to test).
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={copy} disabled={!markdown} className={btnGhost}>
              Copy
            </button>
            <button
              onClick={() => markdown && downloadText(filename, markdown)}
              disabled={!markdown}
              className={btnGhost}
            >
              Download
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <p className="text-xs text-zinc-400">Filename</p>
          <p className="mt-1 text-sm text-zinc-200">{filename}</p>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
          Recommended workflow:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Generate Status Update for stakeholders</li>
            <li>Generate Postmortem for internal review</li>
            <li>Generate Action Items for follow-through</li>
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
          QA hint: your deterministic generator makes it easy to snapshot-test
          templates and parsing.
        </div>
      </section>

      {/* Right: Preview */}
      <section className={cardClass}>
        <h2 className="text-lg font-medium">Preview</h2>

        {!markdown ? (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Generate a document to preview markdown here.
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <pre className="max-h-160 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">
              {markdown}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
