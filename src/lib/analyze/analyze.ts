import schema from "../../../docs/product/blueprint.schema.json";
import type { BlueprintResponse } from "../blueprint/types";
import { toModelSchema } from "../blueprint/model-schema";
import { checkBlueprint } from "../guardrails";
import { buildSystemBlocks, buildUserContent } from "../prompt/assemble";
import type { VisionModel } from "./model-client";
import type { AnalyzeRequest } from "./request";

export type AnalyzeResult =
  | { ok: true; response: BlueprintResponse; attempts: 1 | 2 }
  | {
      ok: false;
      reason: "refusal" | "invalid_output" | "model_error";
      attempts: 1 | 2;
      violations?: string[];
    };

type AttemptOutcome =
  | { kind: "ok"; response: BlueprintResponse }
  | { kind: "refusal" }
  | { kind: "model_error" }
  | { kind: "invalid"; violations: string[] };

const OUTPUT_SCHEMA = toModelSchema(schema as Record<string, unknown>);

export const DEFAULT_DEADLINE_MS = 55_000;
/** A retry is only started when at least this much of the deadline is left. */
export const MIN_RETRY_BUDGET_MS = 15_000;

export interface AnalyzeOptions {
  deadlineMs?: number;
  now?: () => number;
}

// Violation strings never include request content (photos).
async function attempt(
  req: AnalyzeRequest,
  model: VisionModel,
  timeoutMs: number,
  corrections?: string[],
): Promise<AttemptOutcome> {
  let output;
  try {
    output = await model.generate({
      system: buildSystemBlocks(req.locale),
      content: buildUserContent(req, corrections),
      outputSchema: OUTPUT_SCHEMA,
      timeoutMs,
    });
  } catch {
    return { kind: "model_error" };
  }

  if (output.stopReason === "refusal") return { kind: "refusal" };
  if (output.stopReason === "max_tokens") {
    return { kind: "invalid", violations: ["PARSE: output was cut off at max_tokens"] };
  }
  if (output.text === null) {
    return { kind: "invalid", violations: ["PARSE: output contained no text"] };
  }

  let data: unknown;
  try {
    data = JSON.parse(output.text);
  } catch {
    return { kind: "invalid", violations: ["PARSE: output is not valid JSON"] };
  }

  const checked = checkBlueprint(data);
  return checked.ok ? { kind: "ok", response: checked.data } : { kind: "invalid", violations: checked.violations };
}

export async function analyzePhotos(
  req: AnalyzeRequest,
  model: VisionModel,
  opts: AnalyzeOptions = {},
): Promise<AnalyzeResult> {
  const now = opts.now ?? Date.now;
  const deadline = now() + (opts.deadlineMs ?? DEFAULT_DEADLINE_MS);

  const first = await attempt(req, model, deadline - now());
  if (first.kind === "ok") return { ok: true, response: first.response, attempts: 1 };
  if (first.kind === "refusal") return { ok: false, reason: "refusal", attempts: 1 };

  const remaining = deadline - now();
  if (remaining < MIN_RETRY_BUDGET_MS) {
    return first.kind === "model_error"
      ? { ok: false, reason: "model_error", attempts: 1 }
      : { ok: false, reason: "invalid_output", attempts: 1, violations: first.violations };
  }

  const corrections = first.kind === "invalid" ? first.violations : undefined;
  const second = await attempt(req, model, remaining, corrections);
  switch (second.kind) {
    case "ok":
      return { ok: true, response: second.response, attempts: 2 };
    case "refusal":
      return { ok: false, reason: "refusal", attempts: 2 };
    case "model_error":
      return { ok: false, reason: "model_error", attempts: 2 };
    case "invalid":
      return { ok: false, reason: "invalid_output", attempts: 2, violations: second.violations };
  }
}
