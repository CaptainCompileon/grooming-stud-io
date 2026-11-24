# Grooming Studio

Mobile web app: 3 photos (front, profile, full body) + height, hair type and preferred style produce a **Blueprint** of 4 cards (Barber Cheat Sheet, Colour palette & cuts, Grooming & skin, Why it works). No accounts, no database, photos are not stored. UI copy is Slovak.

Product docs (PRD, architecture, output contract, backlog): [`docs/product/README.md`](docs/product/README.md). Model choice: [`docs/adr/0001-model-provider.md`](docs/adr/0001-model-provider.md).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
```

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Server-side API key. Required unless mock mode is on. |
| `ANTHROPIC_MODEL` | Model for `/api/analyze` (default `claude-opus-5-5`). |
| `ANTHROPIC_EFFORT` | Effort level (default `medium`). |
| `ANALYZE_MOCK` | `fixture` returns a canned blueprint without calling the API. Dev only, ignored when `NODE_ENV=production`. |
| `FEEDBACK_WEBHOOK_URL` | Optional webhook receiving feedback submissions. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional Plausible analytics domain. |

## Run

```bash
npm run dev                       # needs ANTHROPIC_API_KEY in .env.local
ANALYZE_MOCK=fixture npm run dev  # mock mode, no API key or cost
npm run build && npm start        # production build (mock mode is ignored here)
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server |
| `npm test` | Unit and component tests (vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run eval -- --photos <dir> --cases <file.json> [--out eval/out]` | Offline eval over a private golden set, see [`eval/README.md`](eval/README.md) |
| `node scripts/smoke.cjs [baseUrl] [screenshotPath]` | Mobile smoke test (see below) |

### Mobile smoke test

Drives the whole flow at 360x780 in mock mode with Playwright (a Playwright install must already be available to Node; it is not a project dependency):

```bash
ANALYZE_MOCK=fixture npm run dev &      # wait until it answers
node scripts/smoke.cjs http://localhost:3000 smoke-result.png
```

It exits 0 when the 4 cards render and the page has no horizontal scroll, otherwise exits 1 and names the failing step.

## Privacy guarantees and where they are enforced

Photos go from the phone through our server to Anthropic's Claude model; the copy never claims otherwise. We do not store them.

- **Client resize / re-encode:** every photo is scaled to max 1024 px and re-encoded as JPEG 0.85, which strips EXIF (`src/lib/client/image.ts`).
- **No logging of bodies:** server logs contain only request id, duration, status and payload size (`src/lib/server/log.ts` and the routes in `src/app/api/`).
- **No browser storage:** photos and form state live in memory only, no `localStorage` / `IndexedDB`.
- **Request validation:** JPEG only, size and field limits, `measurements` must be null (`src/lib/analyze/request.ts`).
- **Prompt and knowledge base shipped with the server bundle:** `next.config.ts` (`outputFileTracingIncludes` for `prompts/` and `knowledge-base/`).
- **Save as image** is generated on the client only.

## Project structure

```
src/app/            pages (landing, analyze flow, privacy) and API routes (analyze, feedback)
src/components/     onboarding (consent, photo slots, inputs) and blueprint cards
src/i18n/sk.ts      all Slovak UI copy
src/lib/analyze/    request validation, model client (single provider swap point), retry orchestration
src/lib/guardrails/ schema + business-rule validation of model output
src/lib/blueprint/  types, schema for the model, formatting
src/lib/prompt/     prompt + knowledge-base assembly
src/lib/client/     image prep, analytics
src/lib/server/     logging
prompts/, knowledge-base/   decision core read by the model
scripts/            eval CLI and smoke test
eval/               eval docs, example cases, committed reports
docs/               product docs and ADRs
```

## Before the beta

- Verify Anthropic API data retention / training policy and put the accurate text on the privacy page (TODO in `src/i18n/sk.ts`).
- Replace the placeholder contact on the privacy page (`TODO-kontakt@example.com`).
- Choose the analytics domain (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`).
- Run the eval on the golden set with a real API key; record cost and p95 latency, and finalise the ADR.
- Check save-as-image and share on a real iPhone.
