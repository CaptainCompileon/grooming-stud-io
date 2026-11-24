import Anthropic from "@anthropic-ai/sdk";
import okFixture from "../blueprint/__fixtures__/blueprint-ok.sk.json";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

const EFFORTS: readonly string[] = ["low", "medium", "high", "xhigh", "max"];

function envEffort(): Effort {
  const value = process.env.ANTHROPIC_EFFORT;
  return value && EFFORTS.includes(value) ? (value as Effort) : "medium";
}

export interface ModelInput {
  system: Anthropic.TextBlockParam[];
  content: Anthropic.ContentBlockParam[];
  outputSchema: Record<string, unknown>;
  /** Request timeout for this call; the caller derives it from its overall deadline. */
  timeoutMs?: number;
}

export interface ModelOutput {
  text: string | null;
  stopReason: string | null;
  usage?: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null };
}

export interface VisionModel {
  generate(input: ModelInput): Promise<ModelOutput>;
}

const MAX_TOKENS = 16000;
// Server-side refusal fallback; `fallbacks: "default"` requires this beta version.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export function createAnthropicModel(
  opts: { model?: string; effort?: Effort; client?: Anthropic } = {},
): VisionModel {
  const model = opts.model || process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
  const effort = opts.effort ?? envEffort();
  // Created on first use so that building the model never needs credentials.
  let client = opts.client;

  return {
    async generate({ system, content, outputSchema, timeoutMs }) {
      client ??= new Anthropic();
      // Retries are owned by analyzePhotos (one retry within the deadline), not the SDK.
      const requestOptions = timeoutMs === undefined ? { maxRetries: 0 } : { timeout: timeoutMs, maxRetries: 0 };
      const response = await client.beta.messages.create(
        {
          model,
          max_tokens: MAX_TOKENS,
          betas: [FALLBACK_BETA],
          fallbacks: "default",
          system,
          messages: [{ role: "user", content }],
          output_config: { effort, format: { type: "json_schema", schema: outputSchema } },
        },
        requestOptions,
      );
      const stopReason = response.stop_reason;
      const textBlock = response.content.find((b) => b.type === "text");
      return {
        text: textBlock?.type === "text" ? textBlock.text : null,
        stopReason,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          cache_read_input_tokens: response.usage.cache_read_input_tokens,
        },
      };
    },
  };
}

const fixtureModels = new WeakSet<VisionModel>();

export function createFixtureModel(opts: { delayMs?: number } = {}): VisionModel {
  const delayMs = opts.delayMs ?? 1500;
  const model: VisionModel = {
    async generate() {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return { text: JSON.stringify(okFixture), stopReason: "end_turn" };
    },
  };
  fixtureModels.add(model);
  return model;
}

export function isFixtureModel(model: VisionModel): boolean {
  return fixtureModels.has(model);
}

export function getVisionModel(): VisionModel {
  if (process.env.ANALYZE_MOCK === "fixture" && process.env.NODE_ENV !== "production") {
    return createFixtureModel();
  }
  return createAnthropicModel();
}
