> English translation of [the Slovak original](../README.md). The Slovak version is the source of truth.

# Grooming Studio – Product Documentation (v1 / MVP)

> **JTBD:** "When I want to improve my appearance and my chances on dating apps, I need a clear, objective guide tailored to my proportions that I can show straight to my barber or use in a store, so I don't waste money on things that don't suit me."

Mobile web app: 3 photos + 3 inputs → a **Blueprint** of 4 cards (Barber Cheat Sheet, Color Palette & Cuts, Grooming & Skin, Why It Works). No accounts, no database, photos are not stored.

| # | Document | Audience / purpose |
|---|---|---|
| 1 | [PRD](./01-prd.md) | Problem, persona, goals, non-goals, user stories, P0/P1/P2 requirements with acceptance criteria, open questions |
| 2 | [Technical Architecture](./02-technical-architecture.md) | Zero-maintenance stack, privacy-by-design, Rules + VLM core, guardrails, costs, v2 evolution |
| 3 | [Implementation Plan](./03-implementation-plan.md) | 4 phases / 4 weeks, tasks, quality gates, risks |
| 4 | [Beta & Metrics](./04-beta-validation-plan.md) | Hypotheses, recruiting, D+7 survey, Go / Iterate / Kill decision rules |
| 5 | [Output Contract](./05-blueprint-output-contract.md) + [`blueprint.schema.json`](../blueprint.schema.json) | JSON Schema of the model output and mapping of fields to UI cards |
| 6 | [Backlog – Week 1](./06-week1-backlog.md) | 16 tickets with estimates, dependencies and acceptance criteria |

**Decision core (outside `docs/`):**
- [`knowledge-base/`](../../../knowledge-base/README.md) – 5 rule files with stable IDs (face, barber terminology, colour, body, grooming)
- [`prompts/system.md`](../../../prompts/system.md) – system prompt v0.1

## MVP Success Metrics (summary)

| Metric | Target | What it proves |
|---|---|---|
| Completion Rate | > 60% | People aren't afraid to upload photos, and the process isn't too complicated. |
| Save / Screenshot Rate | > 40% | Users saved the output for later. |
| Real-World Execution | ≥ 5 of 20 testers | Someone actually went to a barber or a store and used the output. |

## Blocking Open Questions

1. **Model / provider choice** (vision quality, structured output, data retention, price) – Week 1.
2. **GDPR consent text and DPA with the provider** – before the beta.
