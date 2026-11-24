import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { analyzePhotos } from "../src/lib/analyze/analyze";
import { createAnthropicModel, type ModelOutput, type VisionModel } from "../src/lib/analyze/model-client";
import {
  buildRequest,
  checkCaseIds,
  compareObservations,
  renderReport,
  type EvalCase,
  type EvalCaseResult,
  type EvalRun,
} from "./eval-lib";

const USAGE = `Usage: npm run eval -- --photos <dir> --cases <file.json> [--out eval/out]

  --photos  directory with the golden-set photos (outside the repo or eval/photos/)
  --cases   JSON file with an array of cases (see eval/cases.example.json)
  --out     directory for raw JSON outputs (default eval/out, git-ignored)
  --help    show this help

Writes eval/reports/YYYY-MM-DD-runN.md. Exit code 1 if any case fails schema/guardrails,
2 for missing arguments or an invalid cases file (case_id must be unique, /^[\\w-]+$/).
Credentials come from the SDK environment (ANTHROPIC_API_KEY).`;

const DEADLINE_MS = 180_000;

// Same pipeline as the client: apply EXIF orientation, max 1024 px, JPEG q85 (metadata dropped).
async function prepare(file: string): Promise<string> {
  const buf = await sharp(await readFile(file))
    .rotate()
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return buf.toString("base64");
}

function measuring(inner: VisionModel) {
  const state = { latencyMs: 0, input: 0, output: 0, cacheRead: 0 };
  const model: VisionModel = {
    async generate(input) {
      const t0 = Date.now();
      let out: ModelOutput;
      try {
        out = await inner.generate(input);
      } finally {
        state.latencyMs += Date.now() - t0;
      }
      state.input += out.usage?.input_tokens ?? 0;
      state.output += out.usage?.output_tokens ?? 0;
      state.cacheRead += out.usage?.cache_read_input_tokens ?? 0;
      return out;
    },
  };
  return { model, state };
}

async function runCase(c: EvalCase, photosDir: string, outDir: string, inner: VisionModel): Promise<EvalCaseResult> {
  const { model, state } = measuring(inner);
  const base = { case_id: c.case_id, attempts: 1, violations: [] as string[], observations: [] };
  const usage = () => ({ input: state.input, output: state.output, cacheRead: state.cacheRead });
  try {
    const photos = {
      front: await prepare(path.join(photosDir, c.photos.front)),
      profile: await prepare(path.join(photosDir, c.photos.profile)),
      full_body: await prepare(path.join(photosDir, c.photos.full_body)),
    };
    // Same validation as /api/analyze: a case the app would reject is an input error, not a model result.
    const req = buildRequest(c.inputs, photos);
    if (!req.ok) {
      return { ...base, ok: false, failure: "input_error", errorName: req.error, latencyMs: 0, usage: usage() };
    }
    const result = await analyzePhotos(req.value, model, { deadlineMs: DEADLINE_MS });
    await writeFile(path.join(outDir, `${c.case_id}.json`), JSON.stringify(result, null, 2));
    if (result.ok) {
      return {
        ...base,
        ok: true,
        status: result.response.status,
        attempts: result.attempts,
        latencyMs: state.latencyMs,
        usage: usage(),
        observations: compareObservations(c.expected, result.response),
        blueprint: result.response.blueprint ?? undefined,
      };
    }
    return {
      ...base,
      ok: false,
      failure: result.reason,
      errorName: result.errorName,
      attempts: result.attempts,
      latencyMs: state.latencyMs,
      usage: usage(),
      violations: result.violations ?? [],
    };
  } catch (err) {
    // Only the error class: messages may contain file paths.
    const errorName = (err as { code?: string })?.code ?? (err as Error)?.constructor?.name ?? "Error";
    return { ...base, ok: false, failure: "input_error", errorName, latencyMs: state.latencyMs, usage: usage() };
  }
}

async function nextReportPath(dir: string, date: string): Promise<string> {
  await mkdir(dir, { recursive: true });
  const re = new RegExp(`^${date}-run(\\d+)\\.md$`);
  const used = (await readdir(dir)).map((f) => Number(re.exec(f)?.[1] ?? 0));
  return path.join(dir, `${date}-run${Math.max(0, ...used) + 1}.md`);
}

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: {
      photos: { type: "string" },
      cases: { type: "string" },
      out: { type: "string", default: "eval/out" },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (!values.photos || !values.cases) {
    console.error(`Missing --photos or --cases.\n\n${USAGE}`);
    return 2;
  }

  const loaded: unknown = JSON.parse(await readFile(values.cases, "utf8"));
  const casesError = checkCaseIds(loaded);
  if (casesError) {
    console.error(`Invalid cases file ${values.cases}: ${casesError}`);
    return 2;
  }
  const cases = loaded as EvalCase[];
  const outDir = values.out ?? "eval/out";
  await mkdir(outDir, { recursive: true });

  const inner = createAnthropicModel();
  const run: EvalRun = {
    started_at: new Date().toISOString(),
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
    cases: [],
  };
  for (const c of cases) {
    const r = await runCase(c, values.photos, outDir, inner);
    console.log(`${r.case_id}: ${r.ok ? (r.status ?? "ok") : `FAILED ${r.failure}`} (${r.latencyMs} ms)`);
    run.cases.push(r);
  }

  const reportPath = await nextReportPath("eval/reports", run.started_at.slice(0, 10));
  await writeFile(reportPath, renderReport(run));
  console.log(`Report: ${reportPath}`);
  return run.cases.some((c) => !c.ok) ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`eval failed: ${(err as Error)?.constructor?.name ?? "Error"}`);
    process.exit(1);
  },
);
