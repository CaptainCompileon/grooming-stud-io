> English translation of [the Slovak original](../06-week1-backlog.md). The Slovak version is the source of truth.

# Backlog – Week 1: The "Brain" and Rule Calibration

| | |
|---|---|
| **Week goal** | Prompt + knowledge base produce outputs on 10 different photos that aren't generic and pass the Phase 1 gate |
| **Capacity** | ~20 h (weekend + 2 – 3 evenings) |
| **Related** | [Implementation Plan – Phase 1](./03-implementation-plan.md#phase-1--the-brain-and-rule-calibration-week-1) · [Knowledge base](../../../knowledge-base/README.md) · [System prompt](../../../prompts/system.md) · [Schema](../blueprint.schema.json) |

**Status legend:** ✅ done · 📝 draft v0.1 is in the repo, needs review · ⬜ todo
**Estimate:** in hours (h). Total ⬜ + 📝 ≈ 19 h.

---

## Overview

| ID | Ticket | Status | Estimate | Depends on | Blocks the gate? |
|---|---|---|---|---|---|
| W1-01 | ADR: model / provider choice | 📝 | 3 h | – | **Yes** |
| W1-02 | Golden set: 10 photos + coverage matrix | ⬜ | 2 h | – | **Yes** |
| W1-03 | KB review: `face-shapes.md` | 📝 | 1 h | – | Yes |
| W1-04 | KB review: `color-contrast.md` | 📝 | 1 h | – | Yes |
| W1-05 | KB review: `body-proportions.md` | 📝 | 1 h | – | Yes |
| W1-06 | KB review: `grooming-basics.md` | 📝 | 0.5 h | – | Yes |
| W1-07 | KB review: `barber-terminology.md` | 📝 | 0.5 h | – | Yes |
| W1-08 | System prompt review | 📝 | 1 h | W1-03…07 | Yes |
| W1-09 | Output JSON Schema v1.0 | ✅ | – | – | – |
| W1-10 | Guardrails module | ✅ | 2 h | W1-09 | **Yes** |
| W1-11 | Offline eval CLI | ✅ | 3 h | W1-01, W1-10 | **Yes** |
| W1-12 | Scoring rubric + sheet | ⬜ | 0.5 h | – | Yes |
| W1-13 | Calibration: 2 – 3 rule iterations | ⬜ | 3 h | W1-11, W1-12 | **Yes** |
| W1-14 | Barber consultation (30 min) | ⬜ | 1 h | W1-13 (round 1) | No (P1) |
| W1-15 | Cost and latency measurement | ⬜ | 0.5 h | W1-11 | No |
| W1-16 | GDPR: get Q3 moving (consent, DPA) | ⬜ | 1 h | W1-01 | Not in W1, yes before the beta |

**Critical path:** W1-01 → W1-11 → W1-13. W1-02, W1-10, and the KB reviews run in parallel.

---

## Tickets

### W1-01 · ADR: model / provider choice
**Status:** 📝 provisional ADR (`docs/adr/0001-model-provider.md`, `src/lib/analyze/model-client.ts`); comparison, cost and p95 await an eval run with a real key.

Resolve PRD Q1. Test 2 candidates on 3 photos from the golden set with the same prompt and KB.
- **Comparison criteria:** vision quality (correct face shape/build vs. your own assessment), native support for JSON Schema output, API data retention and whether data is used for training, cost per analysis (3 images + ~8k tokens of context + ~1.5k output), p95 latency, prompt caching support.
- **Acceptance criteria:**
  - [ ] `docs/adr/0001-model-provider.md`: context, candidates, comparison table, decision, consequences.
  - [ ] Documented data-retention policy of the chosen provider (with a link to the source) – input for the privacy text.
  - [ ] Cost per analysis and p95 latency from real runs.

### W1-02 · Golden set: 10 photos + coverage matrix
- Photos (3 per person) from you and friends **with explicit consent**, or public photos with a license that permits use. Stored **outside the repo** (local private folder, outside cloud sync).
- In the repo only `eval/cases.yaml`: `case_id`, description without identifying details, inputs (height, hair type, style), your expected observations (face shape, contrast, build).
- **Coverage matrix (minimum):**
  - [ ] ≥ 5 of the 7 face shapes
  - [ ] contrast low / medium / high – each ≥ 2×
  - [ ] ≥ 4 of the 5 body types
  - [ ] all 4 hair types (including `thinning`)
  - [ ] ≥ 1 with a beard, ≥ 1 with glasses
  - [ ] height: ≥ 1 under 172 cm, ≥ 1 over 186 cm
  - [ ] ≥ 1 deliberately unusable set (dark / cropped body) → tests `photo_issue`

### W1-03 – W1-07 · Knowledge base review (📝 draft v0.1)
The drafts are in `knowledge-base/`. During review:
- [ ] Every rule is actionable (a number, a cut name, a color, a fitting-room check) and has a reason.
- [ ] Covers all enum values from the schema (`face_shape`, `body_frame`, `contrast_level`, `undertone`, `transition`, `neckline`, `styling_product.type`, `targeted_tip.area`).
- [ ] No evaluative language, no brands.
- [ ] mm values match the clipper guard table in `barber-terminology.md`.
- [ ] Hex colors in `color-contrast.md` checked visually (render the swatches).
- [ ] For W1-07: check how SK/CZ barbers actually talk about clipper guards (input for W1-14).

### W1-08 · System prompt review (📝 draft v0.1)
`prompts/system.md`
- [ ] Order of steps: photo check first, then observations, then rules.
- [ ] Prohibited behavior is explicit (beauty rating, weight, ethnicity, medical advice, brands).
- [ ] The self-check list matches the guardrails from W1-10.
- [ ] The `{{locale_name}}` and `{{locale}}` variables are substituted in code.

### W1-09 · Output JSON Schema v1.0 ✅
`docs/product/blueprint.schema.json` + [contract](./05-blueprint-output-contract.md). The example output passes validation.
- During W1-01, verify which constructs the chosen provider **does not support** in structured output (`minItems`, `pattern`, `anyOf`, `$ref`…). If needed, prepare a simplified variant for the model; keep the full schema for server-side validation.

### W1-10 · Guardrails module
**Status:** ✅ `src/lib/guardrails/index.ts`.

A standalone module (TypeScript), to be used later in `/api/analyze`.
- **Acceptance criteria:**
  - [ ] Validation against `blueprint.schema.json` (e.g. `ajv` with draft 2020-12).
  - [ ] `status` ↔ `blueprint` / `photo_issues` consistency.
  - [ ] Exact counts: palette 6, key_cuts 3, avoid 2 – 3, routine 3 with step 1 – 3, instructions 3 – 5, ≥ 2 colors `top_near_face`.
  - [ ] Blacklist of evaluative terms SK / CZ / EN (e.g. `/10`, `skóre` [score], `hodnotenie` [rating], `atraktív*` [attractive*], `škared*` [ugly*, SK], `pekn*` [pretty/handsome*, SK], `oškliv*` [ugly*, CZ], `handsome`, `ugly`, `flaw`, `problém s pleťou` [skin problem]).
  - [ ] Output: `{ ok: boolean, violations: string[] }`.
  - [ ] Unit tests: 1 valid example (from the contract) + ≥ 5 invalid ones (one per rule).

### W1-11 · Offline eval CLI
**Status:** ✅ `scripts/eval.ts`, `scripts/eval-lib.ts`, usage in `eval/README.md`.

`scripts/eval` – runs the analysis over the golden set.
- **Acceptance criteria:**
  - [ ] Input: path to the private photo folder + `eval/cases.yaml`.
  - [ ] For each case: downscale photos as on the client (max 1024 px, no EXIF), call the model, run guardrails.
  - [ ] Compare `observations` with the expected values in `cases.yaml` (match on face shape, contrast, build).
  - [ ] **Genericness check:** for every pair of cases, compare `card_barber` (cut + mm) and `palette` (hex). If they're nearly identical for different inputs → warning.
  - [ ] Report `eval/reports/YYYY-MM-DD-runN.md` (no photos, no personal data): validity, violations, observation match, genericness warnings, cost, latency.
  - [ ] JSON outputs are stored locally only (`eval/out/` in `.gitignore`).

### W1-12 · Scoring rubric + sheet
A sheet (CSV/spreadsheet) with a row per case and columns (1 – 5):
| Criterion | 1 | 5 |
|---|---|---|
| Specificity | "wear what suits you" | mm, hex, cut with fit |
| Correctness against the KB | recommendation contradicts a rule | recommendation matches the rules for the observation |
| Usability at the barber / in the store | needs explaining | can be shown / bought as is |
| Tone | evaluative, generic | neutral, like an expert friend |
| Personalization (`why`) | fits anyone | refers to this person's features |

### W1-13 · Calibration: 2 – 3 iterations
Cycle: eval → rubric scoring → KB / prompt changes → eval.
- [ ] Every KB / prompt change is in a separate commit with a link to the eval report.
- [ ] **Phase 1 gate met:** 10/10 valid JSON · 0 beauty-rating violations · rubric average ≥ 4 · no interchangeable Blueprints · Card 1 is actionable.

### W1-14 · Barber consultation (P1)
30 min with a barber, showing 3 – 4 Card 1s.
- [ ] Does he understand the instructions without follow-up questions?
- [ ] Does he talk in mm or clipper guard numbers? Which clipper brands does he use?
- [ ] What would be missing from / get in the way on the card?
- [ ] Changes written into `barber-terminology.md` + notes in the eval report.

### W1-15 · Cost and latency measurement
- [ ] From eval runs: average and p95 latency, cost per analysis, effect of prompt caching.
- [ ] Add to the [architecture doc, section 5 Costs](./02-technical-architecture.md#5-costs-beta-estimate).

### W1-16 · GDPR: get Q3 moving
- [ ] Draft privacy notice (≤ 5 bullet points) and consent text, truthful per W1-01.
- [ ] Find out whether the provider offers a DPA and how to sign it.
- [ ] Decide whether a self-review is enough or a short consultation with a lawyer is needed (by the end of W2).

---

## Definition of Done for Week 1
- [ ] W1-01, W1-02, W1-10, W1-11, W1-13 done.
- [ ] KB and prompt are at version ≥ v0.2 (after calibration).
- [ ] The latest eval report meets the Phase 1 gate.
- [ ] Open questions from calibration are recorded in the PRD (section 9).
