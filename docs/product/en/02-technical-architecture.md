> English translation of [the Slovak original](../02-technical-architecture.md). The Slovak version is the source of truth.

# MVP Technical Architecture (Zero-Maintenance Stack)

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Goal** | A working prototype buildable over weekends, ~€0 fixed costs, no database, no photo storage |
| **Related** | [PRD](./01-prd.md) · [Output Contract](./05-blueprint-output-contract.md) |

---

## 1. Principles

1. **Privacy-by-Design is a product feature, not compliance.** Photos live only in memory for the duration of a single request. Trust = conversion (Completion Rate).
2. **Stateless.** No accounts, no DB, no server-side sessions. The browser holds all state for the duration of one visit.
3. **Deterministic UI, non-deterministic model.** The model may return only what the schema allows; UI cards are rendered from fields, not from free text.
4. **Rules are data.** Expert knowledge lives in Markdown files in the repo, versioned in git, testable against a set of photos.
5. **The simplest thing that works.** A new layer (MediaPipe, DB, queue) is added only with evidence that it's needed.

## 2. System Overview

```
┌───────────────────────────── Mobile browser ─────────────────────────────┐
│                                                                          │
│  Landing → Consent 18+ → 3 photos + 3 inputs → Loading → Blueprint       │
│                               │                               │          │
│              resize ≤1024px, strip EXIF          html-to-image (PNG),    │
│              (canvas, client-side)               clipboard copy          │
│                               │                                          │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │ HTTPS POST /api/analyze (multipart / base64 JSON)
                                ▼
┌──────────────── Serverless function (e.g. Vercel / Netlify / CF) ────────┐
│ 1. payload validation (size, count, MIME)                                │
│ 2. prompt assembly: system prompt + KB (*.md) + inputs                   │
│ 3. VLM call with structured output (JSON Schema)                         │
│ 4. response validation (schema + guardrails), max 1 retry                │
│ 5. response JSON → client                                                │
│ ── image data only in request variables; never disk / log / storage ─────│
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ API call (zero/limited retention)
                                ▼
                     Multimodal model (VLM) – provider: see Q1 in the PRD
```

## 3. Components

### 3.1 Frontend

| Decision | Recommendation | Why |
|---|---|---|
| Framework | **Next.js (App Router)** on Vercel | Frontend + API route in one repo, free tier, no server to manage. Alternative: plain HTML/JS + 1 serverless function – equally valid if you don't want to learn Next. |
| Styling | Tailwind CSS | Fast mobile-first UI without a design system. |
| Upload | `<input type="file" accept="image/*" capture>` | On mobile, offers both the camera and the gallery. |
| Preprocessing | `canvas` resize to max 1024 px, JPEG ~0.85, re-encode = EXIF removal | Smaller payload, faster, no GPS metadata. |
| Card export | `html-to-image` (or `dom-to-image-more`) → PNG, Web Share API on mobile | Generated on the client – nothing goes to the server. |
| State | React state in page memory | No `localStorage` for photos. Optionally `sessionStorage` for text inputs only, so a retry doesn't require filling them in again. |
| Analytics | Plausible / Umami / Vercel Analytics (cookieless) | Funnel events without personal data, no cookie banner. |

### 3.2 Backend – `/api/analyze`

- **Runtime:** serverless function (Node.js). Watch the limits: body size (Vercel ~4.5 MB) → hence the client-side resize; set max function duration to ≥ 60 s.
- **Input:**

```jsonc
{
  "photos": {
    "front": "<base64 jpeg>",
    "profile": "<base64 jpeg>",
    "full_body": "<base64 jpeg>"
  },
  "inputs": {
    "height_cm": 182,
    "hair_type": "wavy",          // straight | wavy | curly | thinning
    "preferred_style": "smart_casual" // casual | smart_casual | streetwear | minimal
  },
  "measurements": null,           // P2: MediaPipe ratios (v2), always null for now
  "locale": "sk"
}
```

- **Output:** JSON per the [Output Contract](./05-blueprint-output-contract.md) – either `status: "ok"` with a Blueprint, or `status: "photo_issue"` with a prompt to fix a specific photo.
- **Rate limiting:** a simple per-IP limit (e.g. Upstash free tier or in-memory per instance) + a beta code in the URL (`?ref=`) as a "soft gate" against cost abuse.

### 3.3 Decision Core (Rules + VLM)

```
/knowledge-base
  face-shapes.md         # face shape → hairstyle, beard, glasses; what to avoid
  color-contrast.md      # skin/hair/eye contrast → palette, neutrals, combinations
  body-proportions.md    # height, shoulders/waist, leg length → cuts, fit, lengths
  grooming-basics.md     # skin, eyebrows, under-eye circles, beard – 3-step routines
  barber-terminology.md  # glossary: taper vs. fade, mm ↔ clipper guard numbers, textures
/prompts
  system.md              # role, prohibited behavior, format of justifications
```

**Context injection, not a vector DB.** The 4 – 5 files total a few thousand tokens → they are inserted in full into the system prompt. RAG with embeddings is unnecessary complexity at this size. (Revisit if the KB grows beyond ~30k tokens.)

**Prompt caching:** the system prompt + KB are identical for all requests → if the provider supports prompt caching, turn it on (lower cost and latency).

**System prompt rules (fixed):**
1. Never rate attractiveness – no scores, rankings, "handsome/ugly", or comparisons with others.
2. Every recommendation must have a `why` referring to an **observed feature** and a **KB rule**.
3. If you're unsure about a feature (angle, lighting), say so in `confidence` and choose a safer universal recommendation – don't make things up.
4. If a photo isn't usable, return `photo_issue`, not a Blueprint.
5. Use neutral, factual wording ("your face is more oval"), never talk about "flaws" – talk about "balancing proportions".
6. Assume nothing about ethnicity, sexuality, or health; don't comment on weight unless an output field asks for it.
7. Barber instructions in professional terms (EN term + SK explanation) and in mm.

### 3.4 Post-Response Guardrails

| Check | Action on failure |
|---|---|
| JSON Schema validation (e.g. `zod` / `ajv`) | 1× retry, then `blueprint_error` |
| Prohibited terms (regex: "/10", "skóre" [score], "rating", "atraktív…" [attractive…], "škared…" [ugly…]) | 1× retry with a warning in the prompt |
| Valid hex colors, exactly 6 colors | 1× retry |
| Barber Cheat Sheet has ≥ 3 values in mm | 1× retry |

## 4. Privacy and Security

| Area | Measure |
|---|---|
| Storage | None. Image data exists only in function memory during the request. |
| Logs | Only `request_id`, duration, status, payload size. Middleware that **never** logs the body. Disable request body logging in the platform. |
| Error tracking | If using Sentry or similar: disable capturing of request bodies and breadcrumbs containing data. |
| Model provider | Verify, and state truthfully in the privacy text: API data is not used for training; retention (0 days, or X days for abuse monitoring). If zero-data-retention is available, request it. |
| Transport | HTTPS only. No photos in URL query strings. |
| Client | Photos never in `localStorage`/`IndexedDB`. Once the Blueprint is displayed, `File`/`Blob` references are released. |
| EXIF | Removed by re-encoding via canvas before upload. |
| Abuse | 18+ age gate, rate limit, beta code. |
| GDPR | A facial photo = personal data. Explicit consent, short privacy notice, controller contact, DPA with the model provider (see Q3 in the PRD). |

**Keeping the promise truthful:** don't write "your photos never leave your phone" in the UI – they do leave it (they go to the server and to the model provider). Correct: *"We don't store your photos. They're processed only during the analysis and discarded immediately."* + a link to details about the provider.

## 5. Costs (beta estimate)

| Item | Cost |
|---|---|
| Hosting (Vercel/Netlify free tier) | €0 |
| Domain | ~€10/year (optional) |
| Analytics (Umami self-hosted / Plausible trial / Vercel Analytics free) | €0 |
| VLM calls | `number of analyses × price per analysis` – 3 images + ~5k tokens of context + ~1.5k output tokens. Fill in the exact price after choosing the model (Q1). For 20 testers × ~3 attempts, it's a few euros. |

## 6. Testing and Calibration

- **Golden set:** 10 photos (different face shapes, contrasts, builds, hair types) in a **private** folder outside the repo. Only an anonymized case description + expected output properties go into the repo.
- **Eval script:** runs the analysis over the golden set and reports:
  - % valid JSON,
  - guardrail violations,
  - similarity of outputs across different people (if two Blueprints for different builds are too similar → generic).
- **Manual scoring (1 – 5 rubric):** specificity, correctness against the KB, usability at the barber, tone. Target: average ≥ 4 before the beta.

## 7. v2 Evolution (prepared for, don't build)

| Extension | How it's prepared for |
|---|---|
| **MediaPipe (Face Landmarker + Pose Landmarker) on the client** | `measurements` field in the request; the prompt has a section "If measurements are available, they take precedence over visual estimation". Measurements (face width/length, jaw/forehead, shoulder/hip ratios) are computed in the browser – photos don't go anywhere extra because of it. |
| **Local barbers** | Static `data/barbers.json` (city, address, specialization, verified when). No DB. |
| **Monetization** | Payment (e.g. Stripe Checkout) would only require verifying the payment before the model call – still no accounts. |
