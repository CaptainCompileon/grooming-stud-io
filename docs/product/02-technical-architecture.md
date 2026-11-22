# Technická architektúra MVP (Zero-Maintenance Stack)

| | |
|---|---|
| **Stav** | Draft v0.1 |
| **Cieľ** | Funkčný prototyp postaviteľný za víkendy, ~0 € fixné náklady, žiadna databáza, žiadne ukladanie fotiek |
| **Súvisiace** | [PRD](./01-prd.md) · [Output kontrakt](./05-blueprint-output-contract.md) |

---

## 1. Princípy

1. **Privacy-by-Design je produktová funkcia, nie compliance.** Fotky žijú len v pamäti počas jedného requestu. Dôvera = konverzia (Completion Rate).
2. **Stateless.** Žiadne účty, žiadna DB, žiadne sessions na serveri. Všetok stav drží prehliadač počas jednej návštevy.
3. **Deterministické UI, nedeterministický model.** Model smie vrátiť len to, čo schéma dovolí; UI karty sa renderujú z polí, nie z voľného textu.
4. **Pravidlá sú dáta.** Expertné znalosti sú v Markdown súboroch v repe, verzionované cez git, testovateľné na sade fotiek.
5. **Najjednoduchšia vec, ktorá funguje.** Nová vrstva (MediaPipe, DB, fronta) sa pridá len s dôkazom, že ju treba.

## 2. Prehľad systému

```
┌─────────────────────────── Mobilný prehliadač ───────────────────────────┐
│                                                                          │
│  Landing → Súhlas 18+ → 3 fotky + 3 vstupy → Loading → Blueprint         │
│                               │                               │          │
│              resize ≤1024px, strip EXIF          html-to-image (PNG),    │
│              (canvas, na klientovi)              clipboard copy          │
│                               │                                          │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │ HTTPS POST /api/analyze (multipart / base64 JSON)
                                ▼
┌──────────────── Serverless funkcia (napr. Vercel / Netlify / CF) ────────┐
│ 1. validácia payloadu (veľkosť, počet, MIME)                             │
│ 2. zostavenie promptu: system prompt + KB (*.md) + vstupy                │
│ 3. volanie VLM so štruktúrovaným výstupom (JSON Schema)                  │
│ 4. validácia odpovede (schema + guardrails), max 1 retry                 │
│ 5. response JSON → klient                                                │
│ ── obrazové dáta len v premenných requestu; nikdy disk / log / storage ──│
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ API call (zero/limited retention)
                                ▼
                     Multimodálny model (VLM) – poskytovateľ: viď Q1 v PRD
```

## 3. Komponenty

### 3.1 Frontend

| Rozhodnutie | Odporúčanie | Prečo |
|---|---|---|
| Framework | **Next.js (App Router)** na Verceli | Frontend + API route v jednom repe, free tier, bez správy servera. Alternatíva: čisté HTML/JS + 1 serverless funkcia – rovnako platné, ak sa nechceš učiť Next. |
| Styling | Tailwind CSS | Rýchle mobile-first UI bez dizajnového systému. |
| Upload | `<input type="file" accept="image/*" capture>` | Na mobile ponúkne kameru aj galériu. |
| Predspracovanie | `canvas` resize na max 1024 px, JPEG ~0.85, re-encode = odstránenie EXIF | Menší payload, rýchlejšie, žiadne GPS metadáta. |
| Export karty | `html-to-image` (alebo `dom-to-image-more`) → PNG, Web Share API na mobile | Generuje sa na klientovi – nič neodchádza na server. |
| Stav | React state v pamäti stránky | Žiadny `localStorage` pre fotky. Voliteľne `sessionStorage` len pre textové vstupy, aby retry nevyžadoval nové vyplnenie. |
| Analytika | Plausible / Umami / Vercel Analytics (bez cookies) | Funnel udalosti bez osobných údajov, bez cookie bannera. |

### 3.2 Backend – `/api/analyze`

- **Runtime:** serverless funkcia (Node.js). Pozor na limity: veľkosť body (Vercel ~4.5 MB) → preto resize na klientovi; max. trvanie funkcie nastaviť na ≥ 60 s.
- **Vstup:**

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
  "measurements": null,           // P2: MediaPipe pomery (v2), dnes vždy null
  "locale": "sk"
}
```

- **Výstup:** JSON podľa [Output kontraktu](./05-blueprint-output-contract.md) – buď `status: "ok"` s Blueprintom, alebo `status: "photo_issue"` s výzvou na opravu konkrétnej fotky.
- **Rate limiting:** jednoduchý limit podľa IP (napr. Upstash free tier alebo in-memory na inštanciu) + beta kód v URL (`?ref=`) ako „soft gate“ proti zneužitiu nákladov.

### 3.3 Rozhodovacie jadro (Rules + VLM)

```
/knowledge-base
  face-shapes.md         # tvar tváre → účes, brada, okuliare; čomu sa vyhnúť
  color-contrast.md      # kontrast pleť/vlasy/oči → paleta, neutrálne farby, kombinácie
  body-proportions.md    # výška, ramená/pás, dĺžka nôh → strihy, fit, dĺžky
  grooming-basics.md     # pleť, obočie, kruhy pod očami, brada – 3-krokové rutiny
  barber-terminology.md  # slovník: taper vs. fade, mm ↔ čísla nástavcov, textúry
/prompts
  system.md              # rola, zakázané správanie, formát zdôvodnení
```

**Kontextová injekcia, nie vektorová DB.** 4 – 5 súborov má spolu jednotky tisíc tokenov → vložia sa celé do systémového promptu. RAG s embeddingmi je pri tejto veľkosti zbytočná komplexita. (Ak KB prerastie ~30k tokenov, prehodnotiť.)

**Prompt caching:** systémový prompt + KB sú pre všetky requesty rovnaké → ak poskytovateľ podporuje prompt caching, zapnúť ho (nižšia cena aj latencia).

**Pravidlá systémového promptu (nemenné):**
1. Nikdy nehodnoť atraktivitu – žiadne skóre, poradie, „pekný/škaredý“, porovnanie s inými.
2. Každé odporúčanie musí mať `why` odkazujúce na **pozorovanú črtu** a **pravidlo z KB**.
3. Ak si črtou nie si istý (uhol, svetlo), uveď to v `confidence` a zvoľ bezpečnejšie univerzálne odporúčanie – nevymýšľaj.
4. Ak fotka nie je použiteľná, vráť `photo_issue`, nie Blueprint.
5. Formuluj neutrálne a vecne („tvoja tvár je skôr oválna“), nikdy o „nedostatkoch“ – hovor o „vyvážení proporcií“.
6. Nepredpokladaj nič o etnicite, sexualite ani zdraví; nekomentuj váhu, ak sa na to nepýta výstupné pole.
7. Barberské inštrukcie v profesionálnych pojmoch (EN termín + SK vysvetlenie) a v mm.

### 3.4 Guardrails po odpovedi modelu

| Kontrola | Akcia pri zlyhaní |
|---|---|
| JSON Schema validácia (napr. `zod` / `ajv`) | 1× retry, potom `blueprint_error` |
| Zakázané výrazy (regex: „/10“, „skóre“, „rating“, „atraktív…“, „škared…“) | 1× retry s upozornením v prompte |
| Hex farby validné, presne 6 farieb | 1× retry |
| Barber Cheat Sheet má ≥ 3 hodnoty v mm | 1× retry |

## 4. Súkromie a bezpečnosť

| Oblasť | Opatrenie |
|---|---|
| Úložisko | Žiadne. Obrazové dáta existujú len v pamäti funkcie počas requestu. |
| Logy | Len `request_id`, trvanie, status, veľkosť payloadu. Middleware, ktorý **nikdy** neloguje body. Vypnúť request body logging v platforme. |
| Error tracking | Ak Sentry / podobné: vypnúť zachytávanie request body a breadcrumbs s dátami. |
| Poskytovateľ modelu | Overiť a v privacy texte pravdivo uviesť: API dáta sa nepoužívajú na tréning; retencia (0 dní alebo X dní pre abuse monitoring). Ak je k dispozícii zero-data-retention, požiadať o ňu. |
| Prenos | Len HTTPS. Žiadne fotky v URL query. |
| Klient | Fotky nikdy v `localStorage`/`IndexedDB`. Po zobrazení Blueprintu sa `File`/`Blob` referencie uvoľnia. |
| EXIF | Odstránené re-enkódovaním cez canvas pred odoslaním. |
| Zneužitie | Veková brána 18+, rate limit, beta kód. |
| GDPR | Fotka tváre = osobný údaj. Výslovný súhlas, krátka privacy notice, kontakt na správcu, DPA s poskytovateľom modelu (viď Q3 v PRD). |

**Pravdivosť sľubu:** v UI nepísať „fotky nikdy neopustia tvoj telefón“ – opúšťajú ho (idú na server a k poskytovateľovi modelu). Správne: *„Fotky neukladáme. Spracujú sa len počas analýzy a hneď sa zahodia.“* + odkaz na podrobnosti o poskytovateľovi.

## 5. Náklady (odhad pre betu)

| Položka | Náklad |
|---|---|
| Hosting (Vercel/Netlify free tier) | 0 € |
| Doména | ~10 €/rok (voliteľné) |
| Analytika (Umami self-host / Plausible trial / Vercel Analytics free) | 0 € |
| VLM volania | `počet analýz × cena za 1 analýzu` – 3 obrázky + ~5k tokenov kontextu + ~1.5k tokenov výstupu. Presnú cenu doplniť po výbere modelu (Q1). Pre 20 testerov × ~3 pokusy ide o jednotky €. |

## 6. Testovanie a kalibrácia

- **Golden set:** 10 fotiek (rôzne tvary tváre, kontrasty, postavy, typy vlasov) v **privátnom** priečinku mimo repa. Do repa ide len anonymizovaný popis prípadu + očakávané vlastnosti výstupu.
- **Eval skript:** spustí analýzu nad golden setom a vypíše:
  - % validných JSON,
  - porušenia guardrails,
  - podobnosť výstupov medzi rôznymi ľuďmi (ak sú si dva Blueprinty pre odlišné postavy príliš podobné → generické).
- **Ručné hodnotenie (rubrika 1 – 5):** konkrétnosť, správnosť voči KB, použiteľnosť u barbera, tón. Cieľ: priemer ≥ 4 pred betou.

## 7. Evolúcia v2 (pripravené, nestavať)

| Rozšírenie | Ako je pripravené |
|---|---|
| **MediaPipe (Face Landmarker + Pose Landmarker) na klientovi** | Pole `measurements` v requeste; prompt má sekciu „Ak sú dostupné merania, majú prednosť pred vizuálnym odhadom“. Merania (pomery šírka/dĺžka tváre, čeľusť/čelo, ramená/bedrá) sa počítajú v prehliadači – fotky kvôli tomu neodchádzajú nikam navyše. |
| **Lokálni barberi** | Statický `data/barbers.json` (mesto, adresa, špecializácia, overené kedy). Bez DB. |
| **Monetizácia** | Platba (napr. Stripe Checkout) by vyžadovala len overenie platby pred volaním modelu – stále bez účtov. |
