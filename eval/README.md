# Offline eval (W1-11)

Runs the real analysis (same prompt, knowledge base, schema and guardrails as production) over a private golden set to calibrate the KB and prompt (W1-13).

## Photos and consent

- Photos are never committed. Keep them outside the repo (local private folder, not in cloud sync) or in the git-ignored `eval/photos/`.
- Only use photos of people who gave explicit consent, or public photos whose licence allows this use. 3 photos per person: front, profile, full body.
- Raw outputs go to `eval/out/` (git-ignored). Reports in `eval/reports/` are committed and contain no photos, photo paths or personal data, so keep case descriptions non-identifying.

## Case file

JSON array, see `cases.example.json`. Each case:

| field | meaning |
|---|---|
| `case_id` | unique, non-identifying id |
| `description` | non-identifying note |
| `photos` | `front`, `profile`, `full_body` file names relative to `--photos` |
| `inputs` | `height_cm` (140-220), `hair_type`, `preferred_style` |
| `expected` | optional: `face_shape`, `contrast_level`, `body_frame`, `status` (`ok` or `photo_issue`) |

## Coverage matrix (backlog W1-02, minimum)

- at least 5 of 7 face shapes
- contrast low / medium / high, each at least 2x
- at least 4 of 5 body frames
- all 4 hair types (including `thinning`)
- at least 1 with a beard, at least 1 with glasses
- height: at least 1 under 172 cm, at least 1 over 186 cm
- at least 1 deliberately unusable set (dark / cropped body) to test `photo_issue`

## Run

```
ANTHROPIC_API_KEY=... npm run eval -- --photos <dir> --cases <file.json> [--out eval/out]
npm run eval -- --help
```

Photos are resized like on the client (EXIF rotation applied, max 1024 px, JPEG q85, metadata dropped). Each case calls the model with a 180 s deadline and one retry on invalid output. Model and effort come from `ANTHROPIC_MODEL` / `ANTHROPIC_EFFORT`.

## Output

- `eval/reports/YYYY-MM-DD-runN.md`: summary (valid JSON %, violations, latency mean/p95, tokens), per-case table with observation matches, generic-pair warnings (Jaccard similarity of barber cut + mm + palette + key cuts >= 0.8 for different inputs), violations.
- Exit code 1 if any case fails schema or guardrails.
