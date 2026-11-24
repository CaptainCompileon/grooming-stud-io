import { type AnalyzeRequest, type ParseResult, parseAnalyzeRequest } from "../src/lib/analyze/request";
import type { Blueprint, BlueprintResponse, PhotoKey } from "../src/lib/blueprint/types";

export interface EvalCase {
  case_id: string;
  description: string;
  /** File names relative to the photos directory. */
  photos: { front: string; profile: string; full_body: string };
  inputs: AnalyzeRequest["inputs"];
  expected?: {
    face_shape?: string;
    contrast_level?: string;
    body_frame?: string;
    status?: "ok" | "photo_issue";
  };
}

export interface ObservationComparison {
  field: string;
  expected: string;
  actual: string;
  match: boolean;
}

export interface EvalCaseResult {
  case_id: string;
  /** True when analysis passed schema + guardrails (a photo_issue answer counts as ok). */
  ok: boolean;
  status?: "ok" | "photo_issue";
  /** Failure reason from analyzePhotos when !ok. */
  failure?: string;
  /** Constructor name of a model error, never a message. */
  errorName?: string;
  attempts: number;
  latencyMs: number;
  usage: { input: number; output: number; cacheRead: number };
  violations: string[];
  observations: ObservationComparison[];
  blueprint?: Blueprint;
}

export interface EvalRun {
  started_at: string;
  model: string;
  cases: EvalCaseResult[];
}

// case_id becomes a file name in the out directory: no separators, dots or spaces.
const CASE_ID = /^[\w-]+$/;

/** Checks a loaded cases file; returns a message for the first problem, or null. */
export function checkCaseIds(cases: unknown): string | null {
  if (!Array.isArray(cases)) return "the cases file must contain a JSON array of cases";
  const seen = new Map<string, number>();
  for (const [i, c] of cases.entries()) {
    const id = (c as { case_id?: unknown } | null)?.case_id;
    if (typeof id !== "string" || !CASE_ID.test(id)) {
      return `case ${i + 1}: case_id must match ${CASE_ID} (letters, digits, _ and -), got ${JSON.stringify(id) ?? "nothing"}`;
    }
    const first = seen.get(id);
    if (first !== undefined) return `duplicate case_id "${id}" (cases ${first} and ${i + 1})`;
    seen.set(id, i + 1);
  }
  return null;
}

/** Builds the request exactly as /api/analyze would accept it, so eval never runs inputs the app rejects. */
export function buildRequest(inputs: unknown, photos: Record<PhotoKey, string>): ParseResult {
  return parseAnalyzeRequest({ photos, inputs, measurements: null, locale: "sk" });
}

function features(b: Blueprint): Set<string> {
  const s = new Set<string>();
  const c = b.card_barber;
  s.add(`cut:${c.cut_name}`);
  s.add(`transition:${c.transition}`);
  s.add(`mm:${c.top_length_mm}/${c.sides_length_mm}/${c.back_length_mm}`);
  for (const p of b.card_style.palette) s.add(`hex:${p.hex.toLowerCase()}`);
  for (const k of b.card_style.key_cuts) s.add(`cut_item:${k.item.toLowerCase()}`);
  return s;
}

/** Jaccard index over barber-cut and palette features, 0..1. */
export function blueprintSimilarity(a: Blueprint, b: Blueprint): number {
  const fa = features(a);
  const fb = features(b);
  let inter = 0;
  for (const f of fa) if (fb.has(f)) inter++;
  const union = fa.size + fb.size - inter;
  return union === 0 ? 1 : inter / union;
}

export function findGenericPairs(
  results: { case_id: string; blueprint: Blueprint }[],
  threshold = 0.8,
): { a: string; b: string; similarity: number }[] {
  const pairs: { a: string; b: string; similarity: number }[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const similarity = blueprintSimilarity(results[i].blueprint, results[j].blueprint);
      if (similarity >= threshold) {
        pairs.push({ a: results[i].case_id, b: results[j].case_id, similarity });
      }
    }
  }
  return pairs;
}

export function compareObservations(
  expected: EvalCase["expected"],
  actual: BlueprintResponse,
): ObservationComparison[] {
  if (!expected) return [];
  const obs = actual.blueprint?.observations;
  const rows: [string, string | undefined, string | undefined][] = [
    ["face_shape", expected.face_shape, obs?.face_shape],
    ["contrast_level", expected.contrast_level, obs?.contrast_level],
    ["body_frame", expected.body_frame, obs?.body_frame],
    ["status", expected.status, actual.status],
  ];
  return rows
    .filter(([, e]) => e !== undefined)
    .map(([field, e, a]) => ({
      field,
      expected: e as string,
      actual: a ?? "-",
      match: e === a,
    }));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ");

/** Markdown report. Only whitelisted fields are printed: no photo data, no photo paths. */
export function renderReport(run: EvalRun): string {
  const cases = run.cases;
  const okCount = cases.filter((c) => c.ok).length;
  const okPct = cases.length ? Math.round((okCount / cases.length) * 100) : 0;
  const violationCount = cases.reduce((n, c) => n + c.violations.length, 0);
  const lat = cases.map((c) => c.latencyMs).sort((a, b) => a - b);
  const mean = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : 0;
  const p95 = percentile(lat, 0.95);
  const sum = (f: (c: EvalCaseResult) => number) => cases.reduce((n, c) => n + f(c), 0);

  const out: string[] = [];
  out.push(`# Eval report ${run.started_at}`, "", `Model: ${run.model}`, "");
  out.push("## Summary", "");
  out.push(`- Cases: ${cases.length}`);
  out.push(`- OK: ${okCount}`);
  out.push(`- OK rate: ${okPct} %`);
  out.push(`- Guardrail violations: ${violationCount}`);
  out.push(`- Latency mean / p95: ${mean} ms / ${p95} ms`);
  out.push(`- Tokens input: ${sum((c) => c.usage.input)}`);
  out.push(`- Tokens output: ${sum((c) => c.usage.output)}`);
  out.push(`- Tokens cache-read: ${sum((c) => c.usage.cacheRead)}`, "");

  out.push("## Per case", "");
  out.push("| case_id | status | attempts | latency ms | observations |");
  out.push("|---|---|---|---|---|");
  for (const c of cases) {
    const status = c.ok ? (c.status ?? "ok") : `FAILED (${c.failure ?? "unknown"}${c.errorName ? `: ${c.errorName}` : ""})`;
    const matches = c.observations.length
      ? c.observations.map((o) => `${o.field} ${o.match ? "OK" : `MISMATCH (expected ${o.expected}, got ${o.actual})`}`).join("; ")
      : "-";
    out.push(`| ${cell(c.case_id)} | ${cell(status)} | ${c.attempts} | ${c.latencyMs} | ${cell(matches)} |`);
  }
  out.push("");

  const withBp = cases.flatMap((c) => (c.blueprint ? [{ case_id: c.case_id, blueprint: c.blueprint }] : []));
  const pairs = findGenericPairs(withBp);
  out.push("## Generic pairs", "");
  if (pairs.length === 0) out.push("None.");
  else for (const p of pairs) out.push(`- ${p.a} ~ ${p.b}: similarity ${p.similarity.toFixed(2)}`);
  out.push("");

  out.push("## Violations", "");
  const bad = cases.filter((c) => c.violations.length > 0);
  if (bad.length === 0) out.push("None.");
  else for (const c of bad) for (const v of c.violations) out.push(`- ${c.case_id}: ${v}`);
  out.push("");
  return out.join("\n");
}
