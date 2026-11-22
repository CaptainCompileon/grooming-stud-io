# Grooming Studio – produktová dokumentácia (v1 / MVP)

> **JTBD:** „Keď chcem zlepšiť svoj vzhľad a šance na zoznamkách, potrebujem jasný, objektívny návod šitý na moje proporcie, ktorý môžem rovno ukázať barberovi alebo použiť v obchode, aby som nevyhadzoval peniaze za veci, ktoré mi nesedia.“

Mobilná webová appka: 3 fotky + 3 vstupy → **Blueprint** zo 4 kariet (Barber Cheat Sheet, Farebná paleta & Strihy, Grooming & Pleť, Prečo to funguje). Bez účtov, bez databázy, fotky sa neukladajú.

| # | Dokument | Pre koho / na čo |
|---|---|---|
| 1 | [PRD](./01-prd.md) | Problém, persona, ciele, non-goals, user stories, P0/P1/P2 požiadavky s akceptačnými kritériami, otvorené otázky |
| 2 | [Technická architektúra](./02-technical-architecture.md) | Zero-maintenance stack, privacy-by-design, Rules + VLM jadro, guardrails, náklady, evolúcia v2 |
| 3 | [Implementačný plán](./03-implementation-plan.md) | 4 fázy / 4 týždne, úlohy, brány kvality, riziká |
| 4 | [Beta & metriky](./04-beta-validation-plan.md) | Hypotézy, nábor, dotazník D+7, rozhodovacie pravidlá Go / Iterate / Kill |
| 5 | [Output kontrakt](./05-blueprint-output-contract.md) + [`blueprint.schema.json`](./blueprint.schema.json) | JSON Schema výstupu modelu a mapovanie polí na UI karty |

## Metriky úspechu MVP (skratka)

| Metrika | Cieľ | Čo to dokazuje |
|---|---|---|
| Completion Rate | > 60 % | Ľudia sa neboja nahrať fotky a proces nie je príliš zložitý. |
| Save / Screenshot Rate | > 40 % | Výstup si uložili na neskôr. |
| Real-World Execution | ≥ 5 z 20 testerov | Niekto reálne išiel k barberovi alebo do obchodu a použil výstup. |

## Blokujúce otvorené otázky

1. **Výber modelu / poskytovateľa** (vision kvalita, štruktúrovaný výstup, retencia dát, cena) – Týždeň 1.
2. **GDPR text súhlasu a DPA s poskytovateľom** – pred betou.
