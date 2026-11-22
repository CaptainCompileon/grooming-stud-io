> English translation of [the Slovak original](../04-beta-validation-plan.md). The Slovak version is the source of truth.

# Closed Beta & Success Metrics

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Cohort** | 15 – 20 men aged 20 – 32 (target: 20 active) |
| **Duration** | D0 invitation → D+7 survey → D+10 evaluation |
| **Related** | [PRD](./01-prd.md) · [Implementation Plan](./03-implementation-plan.md) |

For this product we don't just track traffic – we track the **rate of real-world action**.

---

## 1. Hypotheses

| # | Hypothesis | Validated by |
|---|---|---|
| H1 | People aren't afraid to upload 3 photos if the privacy promise is clear and the flow is short. | Completion Rate, Upload Drop-off |
| H2 | The output has value beyond the screen – people save it. | Save / Copy Rate |
| H3 | A specific Blueprint leads to action (barber, purchase) within 7 days. | Real-World Execution |
| H4 | The advice feels like it comes from a stylist, not a generic article. | Comprehension + qualitative feedback |

## 2. Metrics and Targets

| Metric | Definition (source) | MVP target | What it proves |
|---|---|---|---|
| **Completion Rate** | `blueprint_rendered` / `consent_given` (analytics) | **> 60%** | People aren't afraid to upload photos, and the process isn't too complicated. |
| **Save / Screenshot Rate** | sessions with `cheatsheet_copy` ∪ `cheatsheet_save_image` / `blueprint_rendered` (analytics) **∪** "Did you take a screenshot?" = yes (survey) | **> 40%** | Users saved the Barber Cheat Sheet or shopping list for later. |
| **Real-World Execution** | "Did you show the card to a barber or buy something based on it?" = yes (D+7 survey) | **≥ 5 of 20 testers** | Someone actually went to a barber or a store and used the output from the app. |

**Diagnostic (non-target) metrics:** Upload Drop-off, Error Rate, p95 analysis time, share of `photo_issue`, 👍/👎.

> **Small sample:** with 20 testers, 1 person = 5 pp. We treat the numbers as directional, not statistically certain. Qualitative answers carry the same weight as percentages.

## 3. Recruiting

- **Sources:** friends and colleagues (max 50% of the cohort – they're too nice), local communities, Discord servers (fitness, self-improvement, SK/CZ IT communities).
- **Filter:** male, 20 – 32, uses or plans to use dating apps, doesn't work in fashion/barbering.
- **Invitation (template):**

  > Hi, I'm building a small app that turns 3 photos into a concrete guide: what to tell your barber (in mm), which colors and clothing cuts suit you, and a simple grooming routine. Photos aren't stored – they're processed and discarded immediately. It's free, in exchange for 3 short questions in a week. Link: `https://…/?ref=t07`

  (Send in Slovak/Czech to the actual cohort; see the Slovak original.)

- **Matching without personal data:** each tester gets a `ref` code; the code ↔ contact table is kept offline by the founder and deleted after the evaluation.

## 4. Schedule and Survey

| Day | Action |
|---|---|
| D0 | Send invitations (in 2 waves of ~10, to catch bugs) |
| D0 – D2 | Funnel and error monitoring, hotfixes |
| D+3 | Reminder to those who haven't completed the flow yet (once, no more) |
| D+7 | Survey |
| D+8 – D+10 | 3 – 5 interviews, evaluation |

**D+7 survey (3 required + 2 optional, ≤ 2 min):**

1. **Did you understand the recommendations?** (Yes / Partly / No) + "What wasn't clear?"
2. **Did you show the card to a barber or buy something based on it?** (Barber / Purchase / Both / Not yet, but I plan to / No) + "If yes, how did it go?"
3. **What was missing from the guide?** (open-ended)
4. *(optional)* Did you save the output (screenshot, image, copied text)? (Yes / No)
5. *(optional)* Would you send this to a friend? (Yes / Maybe / No)

## 5. Decision Rules (Go / Iterate / Kill)

| Outcome | Conditions | Next step |
|---|---|---|
| **GO – scale** | Real-World Execution ≥ 5/20 **and** Completion > 60% **and** Save > 40% | Phase 4: local barbers, larger cohort (50 – 100), willingness-to-pay test |
| **ITERATE – funnel** | Real-World ≥ 5/20, but Completion < 60% | The problem is trust/UX, not value → simplify the photos, rewrite the privacy text, repeat with a new cohort |
| **ITERATE – content** | Completion > 60%, but Save < 40% or Real-World < 5/20 | The problem is output quality/actionability → rework the KB and Cards 1 – 2, consider MediaPipe, repeat |
| **KILL / pivot** | Real-World ≤ 2/20 **and** feedback says "interesting, but I don't need it" | The job isn't painful enough in this form → consider a different format (e.g. Barber Cheat Sheet only) or a different segment |

## 6. Evaluation Template

```markdown
## Beta evaluation – cohort 1
- Invited / opened / consented / completed: __ / __ / __ / __
- Completion Rate: __ % (target > 60 %)
- Save / Copy Rate: __ % (target > 40 %)
- Real-World Execution: __ / __ (target ≥ 5 / 20)
- Comprehension: __ % yes
- Top 3 "what was missing":
- Top 3 bugs / UX issues:
- Cases of hallucinated proportions: __ (→ MediaPipe trigger at ≥ 2)
- Decision: GO / ITERATE (funnel | content) / KILL
```
