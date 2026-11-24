import { analyzePhotos } from "@/lib/analyze/analyze";
import { getVisionModel } from "@/lib/analyze/model-client";
import { parseAnalyzeRequest } from "@/lib/analyze/request";
import { logRequest } from "@/lib/server/log";

export const maxDuration = 60;
export const runtime = "nodejs";

// Our own limit for self-hosted / local runs. On Vercel the platform rejects
// bodies over 4.5 MB before this handler runs, with a non-JSON 413 that the
// client maps to invalid_request (src/app/analyze/page.tsx).
const MAX_BODY_BYTES = 6_000_000;
const TOTAL_BUDGET_MS = 55_000;

export async function POST(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  let payloadBytes = 0;

  const respond = (
    body: unknown,
    status: number,
    extra: { attempts?: number; reason?: string; errorName?: string } = {},
  ): Response => {
    logRequest({
      route: "/api/analyze",
      requestId,
      status,
      durationMs: Date.now() - startedAt,
      payloadBytes,
      ...extra,
    });
    return Response.json(body, {
      status,
      headers: { "x-request-id": requestId },
    });
  };

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    payloadBytes = declared;
    return respond({ error: "payload_too_large" }, 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch (err) {
    return respond({ error: "invalid_request", code: "unreadable_body" }, 400, {
      errorName: nameOf(err),
    });
  }
  payloadBytes = Buffer.byteLength(raw);
  if (payloadBytes > MAX_BODY_BYTES)
    return respond({ error: "payload_too_large" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return respond({ error: "invalid_request", code: "invalid_json" }, 400);
  }

  const parsed = parseAnalyzeRequest(body);
  if (!parsed.ok)
    return respond({ error: "invalid_request", code: parsed.error }, 400, {
      reason: parsed.error,
    });

  let result;
  try {
    result = await analyzePhotos(parsed.value, getVisionModel(), {
      deadlineMs: TOTAL_BUDGET_MS - (Date.now() - startedAt),
    });
  } catch (err) {
    // A bug on our side (model factory, prompt assembly): log only the error
    // class, since the message may echo request content.
    return respond({ error: "analysis_failed", reason: "server_error" }, 500, {
      reason: "server_error",
      errorName: nameOf(err),
    });
  }
  if (result.ok)
    return respond(result.response, 200, { attempts: result.attempts });
  return respond({ error: "analysis_failed", reason: result.reason }, 502, {
    attempts: result.attempts,
    reason: result.reason,
    errorName: result.errorName,
  });
}

function nameOf(err: unknown): string {
  return err instanceof Error ? err.name : "Error";
}
