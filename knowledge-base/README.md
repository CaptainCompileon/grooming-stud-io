# Knowledge Base (model context)

These files are injected **in full** into the system context of `/api/analyze` (no vector DB – total size is a few thousand tokens). They are written in English because they are model-facing; the model answers in the user's `locale`.

| File | Covers | Feeds output fields |
|---|---|---|
| [`face-shapes.md`](./face-shapes.md) | Face shape recognition → haircut, beard, glasses; hair-type and hairline modifiers | `observations.face_shape`, `card_barber.*` |
| [`barber-terminology.md`](./barber-terminology.md) | Vocabulary, mm ↔ clipper guards, how to phrase instructions for a barber | `card_barber.*` |
| [`color-contrast.md`](./color-contrast.md) | Contrast level + undertone → 6-colour palette, placement, colours to avoid | `observations.contrast_level/undertone`, `card_style.palette*` |
| [`body-proportions.md`](./body-proportions.md) | Height + body frame → fit, key cuts, what to avoid, fitting-room checks | `observations.body_frame`, `card_style.key_cuts/avoid` |
| [`grooming-basics.md`](./grooming-basics.md) | 3-step skin routines, eyebrows, under-eyes, beard line | `card_grooming.*` |

## Editing rules

- **Rule IDs are stable** (`FS-ROUND-1`, `CC-HIGH-2` …). Change the text, keep the ID; add new IDs for new rules. Eval reports reference these IDs.
- Every rule must be **actionable** (a number, a named cut, a named colour, a concrete check) and carry a **reason** grounded in proportions/contrast. A rule without a reason is not a rule.
- No attractiveness language anywhere. Write about *balancing proportions*, never about *flaws*.
- No brands, no shops (v1 non-goal).
- After any edit: run the offline eval on the golden set and compare against the last report before merging.
