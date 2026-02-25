import { NextRequest } from "next/server";
import { redactSecrets } from "@/lib/redact";
import { parseIncident } from "@/lib/parse";
import {
  renderActionItems,
  renderPostmortem,
  renderStatusUpdate,
} from "@/lib/templates";

export const runtime = "nodejs";

type DocType = "status" | "postmortem" | "actions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    type,
    title,
    rawText,
    redact = true,
    serviceName,
    customerImpact,
  } = body as {
    type?: DocType;
    title?: string;
    rawText?: string;
    redact?: boolean;
    serviceName?: string;
    customerImpact?: string;
  };

  if (!type || !rawText) {
    return Response.json(
      { error: "Missing required fields: type, rawText" },
      { status: 400 },
    );
  }

  const input = redact ? redactSecrets(rawText) : rawText;
  const parsed = parseIncident(input);

  const context = {
    title: title?.trim() || "Incident",
    serviceName:
      serviceName?.trim() || parsed.serviceGuess || "Unknown service",
    customerImpact:
      customerImpact?.trim() || parsed.impactGuess || "Under investigation",
    parsed,
    redactionEnabled: redact,
  };

  let markdown = "";
  if (type === "status") markdown = renderStatusUpdate(context);
  if (type === "postmortem") markdown = renderPostmortem(context);
  if (type === "actions") markdown = renderActionItems(context);

  return Response.json({
    markdown,
    meta: {
      extractedTimestamps: parsed.timestamps.length,
      extractedErrors: parsed.errors.length,
      redacted: redact,
    },
  });
}
