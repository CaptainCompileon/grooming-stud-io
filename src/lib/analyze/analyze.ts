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

// Violation strings never include request content (photos).
async function attempt(
  req: AnalyzeRequest,
  model: VisionModel,
  corrections?: string[],
): Promise<AttemptOutcome> {
  let output;
  try {
    output = await model.generate({
      system: buildSystemBlocks(req.locale),
      content: buildUserContent(req, corrections),
      outputSchema: OUTPUT_SCHEMA,
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

export async function analyzePhotos(req: AnalyzeRequest, model: VisionModel): Promise<AnalyzeResult> {
  const first = await attempt(req, model);
  if (first.kind === "ok") return { ok: true, response: first.response, attempts: 1 };
  if (first.kind === "refusal") return { ok: false, reason: "refusal", attempts: 1 };

  const corrections = first.kind === "invalid" ? first.violations : undefined;
  const second = await attempt(req, model, corrections);
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
