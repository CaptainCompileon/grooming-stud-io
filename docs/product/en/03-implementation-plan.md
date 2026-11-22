> English translation of [the Slovak original](../03-implementation-plan.md). The Slovak version is the source of truth.

# Implementation Plan (4 Weeks, Weekend Capacity)

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Capacity** | ~2 days/week (weekends) + evenings as needed |
| **Related** | [PRD](./01-prd.md) · [Architecture](./02-technical-architecture.md) · [Beta & Metrics](./04-beta-validation-plan.md) |

Each phase has a **deliverable** and a **gate (exit criteria)**. If the gate isn't met, the next phase doesn't start – time moves, not quality and not scope.

---

## Phase 1 – The "Brain" and Rule Calibration (Week 1)

**Goal:** Assemble the expert rules and verify the output isn't generic – still without a UI.

| # | Task | Deliverable | Priority |
|---|---|---|---|
| 1.1 | Decide on the model/provider (PRD Q1): test 2 candidates on 3 photos | Short ADR: choice + rationale + cost per analysis + data retention | P0 |
| 1.2 | Write `face-shapes.md` (oval, round, square, oblong, heart, diamond → hairstyle, beard, what to avoid; e.g. *round face = volume on top, sharper edges on the sides*) | KB file | P0 |
| 1.3 | Write `color-contrast.md` (low/medium/high contrast, undertone → 6 colors + neutrals) | KB file | P0 |
| 1.4 | Write `body-proportions.md` (height, shoulders vs. waist, legs → fit and cuts; e.g. *broad shoulders + narrow waist = avoid padding and skinny cuts*) | KB file | P0 |
| 1.5 | Write `grooming-basics.md` (3-step routines by skin type, eyebrows, under-eye circles, beard) | KB file | P0 |
| 1.6 | Write `barber-terminology.md` (taper/fade, low/mid/high, scissor-over-comb, texture, mm ↔ clipper guards) | KB file | P0 |
| 1.7 | System prompt: ban on beauty rating, mandatory `why`, `photo_issue`, tone | `prompts/system.md` | P0 |
| 1.8 | Output JSON Schema | per the [Output Contract](./05-blueprint-output-contract.md) | P0 |
| 1.9 | Offline eval script (CLI): photos from a local folder → JSON → validation + guardrails | `scripts/eval` | P0 |
| 1.10 | Test on 10 photos (own, friends with consent, public photos of different body types), 2 – 3 rule iterations | Eval report (table: case → rubric score → note) | P0 |
| 1.11 | 30-min consultation with a barber: are the Card 1 instructions actionable? | Notes + updates to `barber-terminology.md` | P1 |

**Phase 1 Gate:**
- [ ] 10/10 outputs pass JSON Schema validation.
- [ ] 0 violations of the beauty-rating ban.
- [ ] Average rubric score (specificity, correctness, usability, tone) ≥ 4/5.
- [ ] No two people with different faces/builds get an interchangeable Blueprint.
- [ ] A barber (or you playing the barber) can tell from Card 1 exactly what to cut.

## Phase 2 – "Thin" Prototype and Output UI (Week 2)

**Goal:** Wrap the working prompt in a usable mobile interface.

| # | Task | Priority |
|---|---|---|
| 2.1 | Next.js project, deploy to Vercel (preview + production), domain/subdomain | P0 |
| 2.2 | Landing: 1-sentence value proposition, 3 steps, privacy promise, CTA | P0 |
| 2.3 | Consent + 18+ age gate (PRD P0-2) | P0 |
| 2.4 | Onboarding: 3 photo slots with example and tips, client-side resize + EXIF strip | P0 |
| 2.5 | Onboarding: height, hair type, preferred style | P0 |
| 2.6 | `/api/analyze`: KB injection, VLM call, schema validation, guardrails, retry, no body logging | P0 |
| 2.7 | Loading with stages + error states + "Try again" without losing inputs | P0 |
| 2.8 | `photo_issue` screen: which photo to replace and why | P0 |
| 2.9 | **Card 1: Barber Cheat Sheet** + Copy text + Save as image (PNG, Web Share) | P0 |
| 2.10 | **Card 2: Color Palette & Cuts** (6 swatches with hex + 3 cuts + what to avoid) | P0 |
| 2.11 | **Card 3: Grooming & Skin** (3 steps + eyebrow/under-eye tip) | P0 |
| 2.12 | **Card 4: Why It Works** | P0 |
| 2.13 | Analytics: funnel events + `ref` code (PRD P0-8) | P0 |
| 2.14 | In-app feedback 👍/👎 + text | P0 |
| 2.15 | Privacy notice page | P0 |
| 2.16 | Rate limit + beta code | P1 |
| 2.17 | Shopping list (copy) from Card 2 | P1 |

**Phase 2 Gate:**
- [ ] Full flow completed on a real iPhone (Safari) and Android (Chrome).
- [ ] p95 analysis time < 45 s over 5 test runs.
- [ ] Verified in platform logs: no image data or base64.
- [ ] The saved Card 1 PNG is readable on a phone screen (test: show it to someone with no context).
- [ ] 3 people other than you complete the flow without your help (hallway test).

## Phase 3 – Closed Beta and Real-World Validation (Week 3)

**Goal:** Find out whether people **actually use** the advice in the offline world.

| # | Task | Priority |
|---|---|---|
| 3.1 | List of 20 – 25 candidates (friends, colleagues, local communities / Discord) matching the persona | P0 |
| 3.2 | Invitation with a unique `?ref=` code (the code ↔ contact mapping is held offline by the founder only) | P0 |
| 3.3 | D0 – D2 monitoring: errors, drop-off at the photo step, processing time | P0 |
| 3.4 | Hotfixes for blocking bugs (no new features) | P0 |
| 3.5 | D+7: 3-question survey (+ 2 optional) – see the [Beta Plan](./04-beta-validation-plan.md) | P0 |
| 3.6 | 3 – 5 short interviews (10 min) with those who used the output and those who didn't | P1 |

**Phase 3 Gate:** evaluation per the [decision rules](./04-beta-validation-plan.md#5-decision-rules-go--iterate--kill).

## Phase 4 – Iteration, MediaPipe, and Local Connection (Week 4+)

**Goal:** Add technical precision and a first link to the local market – **only once interest is confirmed**.

| # | Task | Trigger (when to do it) |
|---|---|---|
| 4.1 | Fix the top 3 issues from the beta (content and UX) | Always |
| 4.2 | **Client-side MediaPipe** (Face Landmarker, Pose Landmarker) → face and shoulder ratios as hard numbers in the prompt | Only if the beta / eval shows the VLM hallucinates proportions (e.g. ≥ 2 of 20 with the wrong face shape or build due to camera angle) |
| 4.3 | Eval: compare the golden set with vs. without MediaPipe | Together with 4.2 |
| 4.4 | **"Verified places in your city"** – a curated list of ~5 barbers (Prague or Bratislava), personally vetted against the Card 1 parameters | Only if Real-World Execution ≥ 5/20 |
| 4.5 | Decision on monetization / next cohort | After the beta evaluation |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Outputs sound generic | Medium | High | Phase 1 gate, mandatory `why` with an observed feature, output similarity check |
| VLM misjudges face shape/build (angle, lighting) | High | Medium | Photo instructions, `confidence` field, `photo_issue`, MediaPipe in Phase 4 |
| People are afraid to upload photos | Medium | High | Truthful, short privacy promise, no accounts, track drop-off at the photo step |
| Color palette skewed by photo lighting | High | Medium | "Daylight" tip, prompt cautious about undertone, also recommend safe neutrals |
| Exceeding serverless limits (payload, timeout) | Medium | Medium | Client-side resize, max duration 60 s, p95 monitoring |
| Abuse / API costs | Low | Medium | Beta code, rate limit, budget alert at the provider |
| Scope creep (accounts, AI visualizations) | Medium | Medium | Non-goals in the PRD, "new replaces old" rule |
