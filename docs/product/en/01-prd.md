> English translation of [the Slovak original](../01-prd.md). The Slovak version is the source of truth.

# PRD: Grooming Studio v1 (MVP)

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Owner** | Product (solo founder) |
| **Date** | 2026-11-22 |
| **Scope** | v1 = closed beta, 15 – 20 testers, €0 additional operating cost |
| **Related** | [Technical Architecture](./02-technical-architecture.md) · [Implementation Plan](./03-implementation-plan.md) · [Beta & Metrics](./04-beta-validation-plan.md) · [Output Contract](./05-blueprint-output-contract.md) |

---

## 1. Problem Statement

Men who want to improve their appearance (most often for dating apps) have no **objective, actionable** guide tailored to their proportions. Fashion content is generic ("wear what's in"), written for a different audience, and can't be used directly at the barber or in a store. The result: bad haircuts, clothes that don't fit, and money wasted on trial and error.

**Cost of not solving it:** the user either does nothing (status quo) or spends money on things that don't suit him, and loses confidence that this can be improved systematically.

**Evidence (still a hypothesis):** the problem is derived from the founder and his circle. The beta (Phase 3) must confirm whether people actually **use the output offline** – that is the main risk, not the technology.

## 2. Core Job-to-be-Done

> **"When I want to improve my appearance and my chances on dating apps, I need a clear, objective guide tailored to my proportions that I can show straight to my barber or use in a store, so I don't waste money on things that don't suit me."**

Breaking the JTBD down into output criteria (the requirements below derive from these):

| JTBD part | What it means for the product |
|---|---|
| *clear* | No free text – fixed cards, step 1 / 2 / 3. |
| *objective* | No beauty rating; always a "why" tied to proportions. |
| *tailored to my proportions* | Input = 3 photos + height + hair type + style; output must reference his specific features. |
| *show straight to my barber* | Barber Cheat Sheet in professional terms and millimeters, exportable as an image. |
| *use in a store* | Specific colors (hex + name) and specific clothing cuts, not "wear slim fit". |
| *not waste money* | Explicitly also what to **avoid**. |

## 3. Target Persona (v1)

**"Analytical Martin"** – male, 20 – 32 years old, SK/CZ.

- Analytically minded (IT, finance, engineering, technical-field student).
- Doesn't read fashion magazines and doesn't want to learn the terminology; wants an **execution plan**.
- Uses dating apps; feels his photos / appearance are his weak spot.
- Sensitive about photo privacy – trust is a precondition, not a bonus.
- Willing to give feedback in exchange for free output.

**Out of scope for v1:** women, teenagers (< 18 – hard age gate), professional stylists as B2B users.

## 4. Goals

| # | Goal | Type | How we'll know it worked |
|---|---|---|---|
| G1 | User completes the whole flow without worrying about the photos | User | Completion Rate **> 60%** |
| G2 | The output has value outside the app | User | Save / Copy Rate **> 40%** |
| G3 | The output leads to real offline action | User / Business | **≥ 5 of 20** testers use it at a barber or in a store within 7 days |
| G4 | The advice doesn't feel generic | Quality | ≥ 80% of testers answer "yes" to "Did you understand the recommendations?"; in internal testing ≤ 1 of 10 outputs flagged as generic |
| G5 | Near-zero operating costs | Business | Fixed costs ≈ €0 / month (free tiers); variable cost only for model calls |

## 5. Non-Goals (Strictly Out of Scope for MVP)

| Non-goal | Why not |
|---|---|
| **User accounts, registration, history database** | Adds friction and trust risk. The user saves the result themselves (image / text). |
| **AI generation of a "new hairstyle on your photo"** | Results often look unnatural and undermine the credibility of the entire output. |
| **Custom CV math (MediaPipe) in v1** | Validate value first; MediaPipe comes in Phase 4 only if the VLM demonstrably hallucinates proportions. |
| **Payment gateway** | v1 is 100% free in exchange for feedback. Monetization is a question only after validation. |
| **Attractiveness rating (1 – 10 score, "rating")** | Ethical risk, damages trust, and it's not the job the user wants done. |
| **Specific product recommendations / affiliate links** | Premature; skews objectivity. Possibly after validation. |

## 6. User Stories

Ordered by priority.

**Onboarding and trust**
1. As *Analytical Martin*, I want to see clearly what will happen to my photos before I upload them, so I'm not worried they'll end up stored somewhere.
2. As *Analytical Martin*, I want to know exactly which photos to take (with an example), so the result isn't skewed by a bad angle.
3. As *Analytical Martin*, I want to enter only the minimum data (height, hair type, preferred style), so it takes no more than ~3 minutes.

**Output (Blueprint)**
4. As *Analytical Martin*, I want precise instructions for the barber in his language (mm, *low taper*, *textured crop*), so I can just show them and not have to explain anything.
5. As *Analytical Martin*, I want to know the 6 colors that suit me and 3 key clothing cuts, so I know what to pick up and what to leave in the store.
6. As *Analytical Martin*, I want a simple 3-step grooming routine, so I know what to do every day without studying cosmetics.
7. As *Analytical Martin*, I want to understand **why** these things suit me (given my proportions), so I trust it and can apply it to future purchases.
8. As *Analytical Martin*, I want to save the Barber Cheat Sheet as an image or copy it as text, so I have it on my phone at the barber.

**Edge cases**
9. As a user whose photo is unsuitable (dark, multiple people, cropped body, not a person), I want a specific prompt to fix it, not a generic or made-up output.
10. As a user on a slow connection, I want to see processing progress, so I don't leave before the result arrives.
11. As a user whose analysis failed (timeout, model error), I want to be able to retry without filling in the form again.
12. As a user with very short hair / balding / a beard, I want relevant advice (e.g. buzz cut, beard grooming), not a recommendation for a hairstyle I can't pull off.

**Feedback (business)**
13. As the founder, I want to know whether a tester used the output offline, so I can decide on scaling.

## 7. Requirements

### P0 – Must-Have (v1 doesn't launch without these)

**P0-1 Privacy-by-Design photo processing**
- Photos are processed only in memory during the API call and discarded immediately.
- No writes to disk, object storage, logs, or analytics.
- *Acceptance criteria:*
  - [ ] Server code contains no writes of image data (code review checklist).
  - [ ] Logs contain only metadata (request id, duration, status), never base64 or photo URLs.
  - [ ] The model provider used has a documented policy: API data is not used for training and retention is zero or minimal – and the consent screen text describes this **truthfully**.
  - [ ] Photos are downscaled on the client before upload (e.g. max 1024 px on the longer side) and EXIF metadata (including GPS) is stripped.

**P0-2 Consent and age gate**
- Before upload: a short, clear text (what happens to the photos, who processes them, that this is a recommendation, not a rating) + a checkbox "I am 18+ and I agree".
- *Acceptance criteria:*
  - [ ] Photos cannot be uploaded without checking the box.
  - [ ] The text can be read in < 30 seconds (max ~5 bullet points).

**P0-3 Onboarding: 3 photos + 3 inputs**
- Photos: face from the front, profile, full body. Each with an example illustration and 1 – 2 tips (daylight, no glasses, more fitted clothing, photo taken by someone else from chest height).
- Inputs: height (cm), hair type (straight / wavy / curly / thinning-receding), preferred style (e.g. casual / smart-casual / streetwear / minimal).
- *Acceptance criteria:*
  - [ ] On mobile, both taking a photo and picking from the gallery work.
  - [ ] Submission is possible only with all 3 photos and 3 inputs.
  - [ ] Median time from opening to submission < 3 min (measured in the beta).

**P0-4 Input photo validation**
- The model (or a lightweight check) first verifies the photos are usable. For an unsuitable photo it returns a structured error with a specific prompt ("The body photo is cropped below the waist – take a full-length photo").
- *Acceptance criteria:*
  - [ ] For a photo with no person / multiple people / too dark, a Blueprint is **not** generated.
  - [ ] The error message says which of the 3 photos needs replacing, and the other inputs stay filled in.

**P0-5 Decision core: Knowledge Base + VLM with structured output**
- 4 – 5 Markdown rule files (face-shapes, color-contrast, body-proportions, grooming-basics, barber-terminology) injected as system context.
- Output is enforced by a JSON Schema (see [Output Contract](./05-blueprint-output-contract.md)) – no free text outside the defined fields.
- *Acceptance criteria:*
  - [ ] 100% of responses pass schema validation; an invalid response is retried automatically once, then an error state.
  - [ ] The output never contains an attractiveness score or evaluative adjectives ("unattractive", "problematic").
  - [ ] Every recommendation has a `why` field tied to a specific observed feature.

**P0-6 Blueprint – 4 cards**
- **Card 1: Barber Cheat Sheet** – lengths in mm per zone (top, sides, back), transition type (e.g. *low taper*), line shape, texture/finish, recommended styling product; **Copy text** and **Save as image** buttons.
- **Card 2: Color Palette & Cuts** – 6 colors (name + hex + where to wear), 3 key clothing cuts, 2 – 3 things to avoid.
- **Card 3: Grooming & Skin** – 3-step routine (morning/evening), 1 tip on eyebrows / under-eye circles, optionally beard.
- **Card 4: Why It Works** – a short explanation of his proportions and the logic behind the recommendations.
- *Acceptance criteria:*
  - [ ] All 4 cards are readable at 360 px width without horizontal scrolling.
  - [ ] "Save as image" generates a PNG of Card 1 on the client (without sending it to the server).
  - [ ] The Barber Cheat Sheet contains at least 3 numeric values in mm.

**P0-7 Processing states and errors**
- Loading with stages (e.g. "Analyzing facial proportions…"), timeout with the option to retry without losing inputs (inputs held only in page memory).
- *Acceptance criteria:*
  - [ ] p95 time from submission to Blueprint < 45 s.
  - [ ] A "Try again" button is available on error.

**P0-8 Measurement without personal data**
- Privacy-friendly, cookieless analytics (e.g. Plausible / Umami / Vercel Analytics) with funnel events. No photos, no input values linkable to a person.
- *Acceptance criteria:*
  - [ ] Tracked events: `landing_view`, `consent_given`, `photos_completed`, `submit`, `blueprint_rendered`, `blueprint_error`, `cheatsheet_copy`, `cheatsheet_save_image`, `feedback_submitted`.
  - [ ] Each beta invitation has its own anonymous code (`?ref=t07`) for matching with the survey without a name.

**P0-9 In-product feedback**
- Below the Blueprint: "Was this useful?" (👍/👎) + optional short text + a note "In 7 days we'll send you 3 questions".

### P1 – Nice-to-Have (fast follow)

| ID | Requirement | Note |
|---|---|---|
| P1-1 | **Save the whole Blueprint as an image / PDF** (not just Card 1) | If the beta shows people screenshot the colors too. |
| P1-2 | **Shopping list** – Card 2 as a copyable checklist | Supports "use in a store". |
| P1-3 | **Hairstyle reference images** (licensed / drawn illustrations, not generated on his photo) | Barbers work visually; must stay consistent with the non-goal on generation. |
| P1-4 | **CZ localization** | The beta is SK/CZ; v1 can be SK only. |
| P1-5 | **Client-side photo quality self-check** (brightness, resolution) before upload | Saves model calls. |

### P2 – Future Considerations (design so these remain possible later)

| ID | Requirement | Implication for today's architecture |
|---|---|---|
| P2-1 | **Client-side MediaPipe** – face and shoulder ratios as hard numbers in the prompt | The request payload should already have an optional `measurements` object. |
| P2-2 | **"Verified places in your city"** – a curated list of ~5 barbers (Prague, Bratislava) | Static JSON/Markdown, no DB; Card 1 should have room for a CTA. |
| P2-3 | **Monetization** (one-time payment for a Premium Blueprint, B2B for barbers) | No decisions that would require accounts in v1. |
| P2-4 | **Re-analysis after a change** (before/after) | Requires storing the Blueprint locally on the device, not on the server. |

## 8. Success Metrics

### Leading (days – 1 week)

| Metric | Definition | Target | Stretch |
|---|---|---|---|
| **Completion Rate** | `blueprint_rendered` / `consent_given` (unique sessions) | **> 60%** | > 75% |
| **Save / Copy Rate** | sessions with `cheatsheet_copy` or `cheatsheet_save_image` / `blueprint_rendered` | **> 40%** | > 55% |
| Upload Drop-off | 1 − `photos_completed` / `consent_given` | < 25% | < 15% |
| Error Rate | `blueprint_error` / `submit` | < 10% | < 5% |
| Quick satisfaction | 👍 / (👍 + 👎) | > 70% | > 85% |

> The system can't reliably capture screenshots in the browser. We track the Copy/Save buttons **and** ask in the survey "Did you take a screenshot?" – the resulting Save Rate = analytics ∪ self-report.

### Lagging (7 – 14 days)

| Metric | Definition | Target |
|---|---|---|
| **Real-World Execution** | Testers who showed the card to a barber **or** bought something based on it (D+7 survey) | **≥ 5 of 20** |
| Comprehension | "Did you understand the recommendations?" = yes | ≥ 80% of respondents |
| Referral intent | "Would you send this to a friend?" = yes | ≥ 50% of respondents |

**Scaling decision:** see [Beta & Metrics](./04-beta-validation-plan.md#5-decision-rules-go--iterate--kill).

## 9. Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| Q1 | Which multimodal model / provider? Criteria: vision quality, native structured outputs (JSON Schema), zero/limited data retention, price per 3 photos, latency < 45 s. | Engineering | **Yes** (Week 1) |
| Q2 | Is a photo in arbitrary lighting enough to assess color contrast, or should onboarding require daylight / a white wall? | Engineering + Product | Yes (calibration in W1) |
| Q3 | Legal basis and consent text for processing facial photos (GDPR) – is explicit consent + a short privacy notice enough? Do we need a DPA with the model provider? | Legal | **Yes**, before the beta |
| Q4 | Recommendations in mm – calibrate to SK/CZ barber practice (clipper guard numbers 1 – 8 vs. mm)? Show both? | Product (consultation with a barber) | No |
| Q5 | How to handle glasses, beards, tattoos, excess weight – sensitive, non-evaluative wording? | Product / Content | No (handled by the system prompt) |
| Q6 | Is height a sufficient proxy for body measurements, or should we add optional weight / clothing size? | Product | No |
| Q7 | Where will the rules come from – who is the "expert source" for the KB (barber/stylist consultant for 1 – 2 hours)? | Product | No, but it raises quality |

## 10. Timeline Considerations

- **Phasing (4 weeks, weekend capacity):** W1 brain & calibration → W2 thin prototype → W3 closed beta → W4+ iteration, MediaPipe, local connection. Details in the [Implementation Plan](./03-implementation-plan.md).
- **Hard dependencies:** model choice (Q1) and the privacy text (Q3) must be closed **before** the beta goes out.
- **No hard external deadlines.** The only "deadline" is the timebox: if the quality gate isn't met in W3, the beta moves instead of the scope expanding.
- **Scope rule:** any new requirement during the 4 weeks must replace an existing P0/P1; otherwise it goes to the parking lot (P2).
