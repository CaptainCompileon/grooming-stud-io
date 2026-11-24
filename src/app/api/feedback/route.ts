import { logRequest } from "@/lib/server/log";

export const runtime = "nodejs";

const MAX_TEXT = 1000;
// Same shape as the client-side `ref` URL param; anything else is dropped, not rejected.
const REF = /^[a-z0-9_-]{1,16}$/i;

interface Feedback {
  value: "up" | "down";
  text?: string;
  ref?: string;
}

function parseFeedback(body: unknown): Feedback | null {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return null;
  const { value, text, ref } = body as Record<string, unknown>;
  if (value !== "up" && value !== "down") return null;
  if (
    text !== undefined &&
    (typeof text !== "string" || text.length > MAX_TEXT)
  )
    return null;
  return {
    value,
    text,
    ref: typeof ref === "string" && REF.test(ref) ? ref : undefined,
  };
}

// The webhook is usually Slack or Discord: keep user text from pinging the
// channel (<!channel>, <!here>, @everyone, <@U123>).
function neutraliseMentions(text: string): string {
  return text.replaceAll("<!", "< !").replaceAll("@", "@\u200b");
}

export async function POST(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  let payloadBytes = 0;

  const finish = (status: number, reason?: string): Response => {
    logRequest({
      route: "/api/feedback",
      requestId,
      status,
      durationMs: Date.now() - startedAt,
      payloadBytes,
      reason,
    });
    return new Response(
      status === 204 ? null : JSON.stringify({ error: "invalid_request" }),
      {
        status,
        headers:
          status === 204
            ? { "x-request-id": requestId }
            : { "x-request-id": requestId, "content-type": "application/json" },
      },
    );
  };

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return finish(400, "unreadable_body");
  }
  payloadBytes = Buffer.byteLength(raw);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return finish(400, "invalid_json");
  }
  const feedback = parseFeedback(body);
  if (!feedback) return finish(400, "invalid_feedback");

  const payload = {
    value: feedback.value,
    text:
      feedback.text === undefined
        ? undefined
        : neutraliseMentions(feedback.text),
    ref: feedback.ref,
  };
  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Webhook failures are swallowed by design.
    }
  } else {
    console.info("[feedback]", JSON.stringify(payload));
  }
  return finish(204);
}
