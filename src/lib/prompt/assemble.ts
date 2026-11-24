import fs from "node:fs";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import type { AnalyzeRequest } from "../analyze/request";
import type { Locale, PhotoKey } from "../blueprint/types";

export const LOCALE_NAMES: Record<Locale, string> = { sk: "Slovak" };

const PROMPT_MARKER = /^=== PROMPT ===$/m;
const PHOTO_ORDER: PhotoKey[] = ["front", "profile", "full_body"];

const cache = new Map<Locale, Anthropic.TextBlockParam[]>();

function readPrompt(locale: Locale): string {
  const raw = fs.readFileSync(path.join(process.cwd(), "prompts", "system.md"), "utf8");
  const match = PROMPT_MARKER.exec(raw);
  if (!match) throw new Error("prompts/system.md is missing the === PROMPT === marker line");
  return raw
    .slice(match.index + match[0].length)
    .trim()
    .replaceAll("{{locale_name}}", LOCALE_NAMES[locale])
    .replaceAll("{{locale}}", locale);
}

function readKnowledgeBase(): string {
  const dir = path.join(process.cwd(), "knowledge-base");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
  const body = files
    .map((f) => `<file name="${f}">${fs.readFileSync(path.join(dir, f), "utf8")}</file>\n`)
    .join("");
  return `<knowledge_base>\n${body}</knowledge_base>`;
}

export function buildSystemBlocks(locale: Locale): Anthropic.TextBlockParam[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  const blocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: readPrompt(locale) },
    { type: "text", text: readKnowledgeBase(), cache_control: { type: "ephemeral" } },
  ];
  cache.set(locale, blocks);
  return blocks;
}

export function buildUserContent(req: AnalyzeRequest, corrections?: string[]): Anthropic.ContentBlockParam[] {
  const content: Anthropic.ContentBlockParam[] = [];
  for (const key of PHOTO_ORDER) {
    content.push({ type: "text", text: `Photo: ${key}` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: req.photos[key] },
    });
  }
  content.push({
    type: "text",
    text: "Inputs:\n" + JSON.stringify({ inputs: req.inputs, measurements: req.measurements }, null, 2),
  });
  if (corrections?.length) {
    content.push({
      type: "text",
      text:
        "Your previous answer failed validation:\n" +
        corrections.map((c) => `- ${c}`).join("\n") +
        "\nReturn a corrected answer.",
    });
  }
  return content;
}
