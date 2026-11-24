# ADR 0001: Model / provider choice

- **Status:** Provisional. The choice is made for the MVP build; it has not yet been validated by an eval run on the golden set.
- **Date:** 2026-11-24
- **Backlog:** W1-01 (see `docs/product/06-week1-backlog.md`), PRD Q1

## Context

Grooming Studio turns 3 photos (front, profile, full body) plus 3 inputs (height, hair type, preferred style) into a structured Blueprint (4 cards). The analysis needs vision capability, output that conforms to `docs/product/blueprint.schema.json`, and a data-handling story we can state truthfully in the privacy text ("Fotky neukladáme. Spracujú sa len počas analýzy a hneď sa zahodia."). The photos do leave the phone: they go through our server to the model provider, and the UI copy says so.

Selection criteria (from W1-01): vision quality, native structured-output support, provider data retention and training use, cost per analysis, p95 latency, prompt caching support.

## Candidates

| Candidate | Status |
|---|---|
| Claude Opus 5.5 (`claude-opus-5-5`) | **Chosen, provisional** |
| Claude Sonnet 5.5 / Haiku 5.5 | To compare in eval |

## Comparison

Only what is verified in code or documentation is filled in. Everything that needs a real run is marked `TBD (eval)`.

| Criterion | Opus 5.5 | Sonnet 5.5 / Haiku 5.5 |
|---|---|---|
| Vision quality vs. golden-set expectations | TBD (eval) | TBD (eval) |
| Structured output (JSON schema) | Used in `model-client.ts` via `output_config.format` | Same call path; to confirm in eval |
| Prompt caching | Used on the system prompt + knowledge-base block | Same call path; to confirm in eval |
| Cost per analysis | TBD (eval) | TBD (eval) |
| p95 latency | TBD (eval) | TBD (eval) |
| Data retention / training policy | TBD (verify against Anthropic's current policy pages) | same provider |

## Decision

Use Claude Opus 5.5 at `medium` effort as the default model for `/api/analyze`, provisionally. Model and effort are configuration (`ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT`), so the decision can be changed without code changes. The decision becomes final (or is replaced) after the W1-11 eval run on the golden set and the W1-15 cost/latency measurement, run with a real API key.

## Consequences

- **Single swap point:** all provider access is in `src/lib/analyze/model-client.ts`. Replacing the model within the Claude family is an env change; replacing the provider means rewriting that one file.
- **Structured output:** the model-facing schema is derived from `blueprint.schema.json` and passed as `output_config.format` (json_schema). The full schema and the guardrails (`src/lib/guardrails`) still validate every response on the server; on failure there is exactly one app-level retry with guardrail feedback (`src/lib/analyze/analyze.ts`).
- **Prompt caching:** the system prompt and the knowledge-base block are marked cacheable. Whether this lowers real cost is unmeasured.
- **Reliability settings:** `maxRetries` 0 with a per-attempt timeout inside a 55 s budget (route `maxDuration` is 60 s); server-side refusal fallback beta (`fallbacks: "default"`).
- **Privacy text dependency:** the retention and training policy of the Anthropic API must be verified against the provider's current documentation and then reflected in the privacy page. The page currently carries a TODO for this (`src/i18n/sk.ts`). Until then the copy only states what we control: we do not store photos, and photos are sent via our server to Anthropic's Claude model.
- **Open work:** run the eval with a real key, record cost per analysis and p95 latency in `eval/reports/`, compare Sonnet 5.5 / Haiku 5.5, then update this ADR's table and status.
