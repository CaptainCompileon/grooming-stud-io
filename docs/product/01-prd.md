# PRD: Grooming Studio v1 (MVP)

| | |
|---|---|
| **Stav** | Draft v0.1 |
| **Vlastník** | Product (solo founder) |
| **Dátum** | 2026-11-22 |
| **Rozsah** | v1 = uzavretá beta, 15 – 20 testerov, 0 € prevádzkové náklady navyše |
| **Súvisiace** | [Technická architektúra](./02-technical-architecture.md) · [Implementačný plán](./03-implementation-plan.md) · [Beta & metriky](./04-beta-validation-plan.md) · [Output kontrakt](./05-blueprint-output-contract.md) |

---

## 1. Problem Statement

Muži, ktorí chcú zlepšiť svoj vzhľad (najčastejšie kvôli zoznamkám), nemajú **objektívny a vykonateľný** návod šitý na ich proporcie. Módny obsah je generický („nos to, čo je in“), písaný pre iné publikum a nedá sa priamo použiť u barbera ani v obchode. Výsledkom sú zlé strihy, oblečenie, ktoré nesedí, a peniaze vyhodené na pokus-omyl.

**Cena nevyriešenia:** používateľ buď nerobí nič (status quo), alebo míňa peniaze na veci, ktoré mu nesedia, a stráca dôveru, že sa to dá zlepšiť systematicky.

**Dôkazy (zatiaľ hypotéza):** problém je odvodený od zakladateľa a jeho okolia. Beta (Fáza 3) má potvrdiť, či ľudia výstup reálne **použijú offline** – to je hlavné riziko, nie technológia.

## 2. Core Job-to-be-Done

> **„Keď chcem zlepšiť svoj vzhľad a šance na zoznamkách, potrebujem jasný, objektívny návod šitý na moje proporcie, ktorý môžem rovno ukázať barberovi alebo použiť v obchode, aby som nevyhadzoval peniaze za veci, ktoré mi nesedia.“**

Rozklad JTBD na kritériá výstupu (z nich vychádzajú požiadavky nižšie):

| Časť JTBD | Čo to znamená pre produkt |
|---|---|
| *jasný* | Žiadny voľný text – fixné karty, krok 1 / 2 / 3. |
| *objektívny* | Žiadne hodnotenie krásy, vždy zdôvodnenie „prečo“ naviazané na proporcie. |
| *šitý na moje proporcie* | Vstup = 3 fotky + výška + typ vlasov + štýl; výstup musí referencovať jeho konkrétne črty. |
| *rovno ukázať barberovi* | Barber Cheat Sheet v profesionálnych pojmoch a milimetroch, exportovateľný ako obrázok. |
| *použiť v obchode* | Konkrétne farby (hex + názov) a konkrétne strihy oblečenia, nie „nos slim fit“. |
| *nevyhadzovať peniaze* | Explicitne aj čomu sa **vyhnúť**. |

## 3. Cieľová persona (v1)

**„Analytický Martin“** – muž, 20 – 32 rokov, SK/CZ.

- Analyticky zmýšľajúci (IT, financie, inžinierstvo, študent technického smeru).
- Nečíta módne magazíny a nechce sa učiť terminológiu; chce **exekučný plán**.
- Používa zoznamky, má pocit, že fotky / vzhľad sú jeho slabé miesto.
- Je citlivý na súkromie fotiek – dôvera je podmienka, nie bonus.
- Ochotný dať spätnú väzbu výmenou za bezplatný výstup.

**Mimo v1:** ženy, tínedžeri (< 18 rokov – tvrdá veková brána), profesionálni stylisti ako B2B používatelia.

## 4. Goals

| # | Cieľ | Typ | Ako zistíme, že sa podaril |
|---|---|---|---|
| G1 | Používateľ prejde celým flowom bez obáv z fotiek | User | Completion Rate **> 60 %** |
| G2 | Výstup má hodnotu aj mimo appky | User | Save / Copy Rate **> 40 %** |
| G3 | Výstup vedie k reálnej akcii offline | User / Business | **≥ 5 z 20** testerov ho použije u barbera alebo v obchode do 7 dní |
| G4 | Rady nepôsobia genericky | Quality | ≥ 80 % testerov odpovie „áno“ na „Pochopil si odporúčania?“; pri internom teste ≤ 1 z 10 výstupov označený ako generický |
| G5 | Takmer nulové prevádzkové náklady | Business | Fixné náklady ≈ 0 € / mes. (free tiers); variabilný náklad len za volania modelu |

## 5. Non-Goals (Strict Out-of-Scope pre MVP)

| Non-goal | Prečo nie |
|---|---|
| **Používateľské účty, registrácia, databáza histórie** | Zvyšuje trenie aj riziko pri dôvere. Výsledok si používateľ uloží sám (obrázok / text). |
| **AI generovanie „nového účesu na fotke“** | Výsledky často vyzerajú neprirodzene a podkopávajú dôveryhodnosť celého výstupu. |
| **Vlastná CV matematika (MediaPipe) vo v1** | Najprv overiť hodnotu; MediaPipe prichádza vo Fáze 4 len ak VLM preukázateľne halucinuje proporcie. |
| **Platobná brána** | v1 je 100 % zadarmo výmenou za spätnú väzbu. Monetizácia je otázka až po validácii. |
| **Hodnotenie atraktivity (skóre 1 – 10, „rating“)** | Etické riziko, poškodzuje dôveru a nie je to job, ktorý používateľ chce vykonať. |
| **Odporúčania konkrétnych produktov / affiliate odkazy** | Predčasné; skresľuje objektivitu. Prípadne po validácii. |

## 6. User Stories

Zoradené podľa priority.

**Onboarding a dôvera**
1. Ako *Analytický Martin* chcem pred nahraním fotiek jasne vidieť, čo sa s nimi stane, aby som sa nebál, že skončia niekde uložené.
2. Ako *Analytický Martin* chcem vedieť, aké presne fotky mám odfotiť (s príkladom), aby výsledok nebol skreslený zlým uhlom.
3. Ako *Analytický Martin* chcem zadať len minimum údajov (výška, typ vlasov, preferovaný štýl), aby mi to nezabralo viac ako ~3 minúty.

**Výstup (Blueprint)**
4. Ako *Analytický Martin* chcem dostať presné inštrukcie pre barbera v jeho jazyku (mm, *low taper*, *textured crop*), aby som mu ich mohol len ukázať a nemusel nič vysvetľovať.
5. Ako *Analytický Martin* chcem vedieť 6 farieb, ktoré mi sedia, a 3 kľúčové strihy oblečenia, aby som v obchode vedel, čo vziať a čo nechať.
6. Ako *Analytický Martin* chcem jednoduchú 3-krokovú grooming rutinu, aby som vedel, čo robiť každý deň bez toho, aby som študoval kozmetiku.
7. Ako *Analytický Martin* chcem pochopiť, **prečo** mi dané veci sedia (vzhľadom na moje proporcie), aby som tomu veril a vedel to aplikovať aj na ďalšie nákupy.
8. Ako *Analytický Martin* chcem si Barber Cheat Sheet uložiť ako obrázok alebo skopírovať ako text, aby som ho mal v mobile u barbera.

**Edge cases**
9. Ako používateľ, ktorého fotka je nevhodná (tma, viac ľudí, odrezaná postava, nejde o človeka), chcem dostať konkrétnu výzvu na opravu, nie generický alebo vymyslený výstup.
10. Ako používateľ s pomalým pripojením chcem vidieť priebeh spracovania, aby som neodišiel, kým výsledok nepríde.
11. Ako používateľ, ktorému analýza zlyhala (timeout, chyba modelu), chcem môcť skúsiť znova bez opätovného vyplnenia formulára.
12. Ako používateľ s veľmi krátkymi vlasmi / plešinou / bradou chcem relevantné rady (napr. buzz cut, úprava brady), nie odporúčanie účesu, ktorý si nemôžem dovoliť.

**Spätná väzba (business)**
13. Ako zakladateľ chcem vedieť, či tester výstup použil offline, aby som vedel rozhodnúť o škálovaní.

## 7. Requirements

### P0 – Must-Have (bez toho sa v1 nespúšťa)

**P0-1 Privacy-by-Design spracovanie fotiek**
- Fotky sa spracujú len v operačnej pamäti počas API volania a hneď sa zahodia.
- Žiadny zápis na disk, do object storage, do logov ani do analytiky.
- *Akceptačné kritériá:*
  - [ ] Serverový kód neobsahuje žiadny zápis obrazových dát (code review checklist).
  - [ ] Logy obsahujú len metadáta (request id, trvanie, stav), nikdy base64 ani URL fotiek.
  - [ ] Použitý poskytovateľ modelu má zdokumentovanú politiku: dáta z API sa nepoužívajú na tréning a retencia je nulová alebo minimálna – a text na obrazovke súhlasu to **pravdivo** popisuje.
  - [ ] Fotky sa pred odoslaním zmenšia na klientovi (napr. max 1024 px dlhšia strana) a odstránia sa EXIF metadáta (vrátane GPS).

**P0-2 Súhlas a veková brána**
- Pred nahraním: krátky, zrozumiteľný text (čo sa deje s fotkami, kto ich spracuje, že ide o odporúčanie, nie hodnotenie) + checkbox „Mám 18+ a súhlasím“.
- *Akceptačné kritériá:*
  - [ ] Bez zaškrtnutia nie je možné nahrať fotky.
  - [ ] Text je čitateľný za < 30 sekúnd (max ~5 bodov).

**P0-3 Onboarding: 3 fotky + 3 vstupy**
- Fotky: tvár spredu, profil, celá postava. Každá s ukážkovou ilustráciou a 1 – 2 tipmi (denné svetlo, bez okuliarov, priliehavejšie oblečenie, fotka od niekoho iného z výšky hrudníka).
- Vstupy: výška (cm), typ vlasov (rovné / vlnité / kučeravé / riedke-ustupujúce), preferovaný štýl (napr. casual / smart-casual / streetwear / minimal).
- *Akceptačné kritériá:*
  - [ ] Na mobile funguje odfotenie aj výber z galérie.
  - [ ] Odoslanie je možné len so všetkými 3 fotkami a 3 vstupmi.
  - [ ] Medián času od otvorenia po odoslanie < 3 min (meria sa v bete).

**P0-4 Validácia vstupných fotiek**
- Model (alebo ľahká kontrola) najprv overí použiteľnosť fotiek. Pri nevhodnej fotke vráti strukturovanú chybu s konkrétnou výzvou („Fotka postavy je odrezaná pod pásom – odfoť sa celý“).
- *Akceptačné kritériá:*
  - [ ] Pri fotke bez človeka / s viacerými ľuďmi / príliš tmavej sa **nevygeneruje** Blueprint.
  - [ ] Chybová hláška hovorí, ktorú z 3 fotiek treba nahradiť, a ostatné vstupy zostanú vyplnené.

**P0-5 Rozhodovacie jadro: Knowledge Base + VLM so štruktúrovaným výstupom**
- 4 – 5 Markdown súborov s pravidlami (face-shapes, color-contrast, body-proportions, grooming-basics, hair-terminology) injektovaných ako systémový kontext.
- Výstup je vynútený JSON Schemou (viď [Output kontrakt](./05-blueprint-output-contract.md)) – žiadny voľný text mimo definovaných polí.
- *Akceptačné kritériá:*
  - [ ] 100 % odpovedí prejde validáciou schémy; nevalidná odpoveď sa raz automaticky zopakuje, potom chybový stav.
  - [ ] Výstup nikdy neobsahuje skóre atraktivity ani hodnotiace prívlastky („nepekný“, „problémový“).
  - [ ] Každé odporúčanie má pole `why` naviazané na konkrétnu pozorovanú črtu.

**P0-6 Blueprint – 4 karty**
- **Karta 1: Barber Cheat Sheet** – dĺžky v mm pre zóny (hore, boky, zátylok), typ prechodu (napr. *low taper*), tvar línií, textúra/finish, odporúčaný stylingový produkt; tlačidlá **Kopírovať text** a **Uložiť ako obrázok**.
- **Karta 2: Farebná paleta & Strihy** – 6 farieb (názov + hex + kde nosiť), 3 kľúčové strihy oblečenia, 2 – 3 veci, ktorým sa vyhnúť.
- **Karta 3: Grooming & Pleť** – 3-kroková rutina (ráno/večer), 1 tip na obočie / kruhy pod očami, voliteľne brada.
- **Karta 4: Prečo to funguje** – krátke vysvetlenie jeho proporcií a logiky odporúčaní.
- *Akceptačné kritériá:*
  - [ ] Všetky 4 karty sú čitateľné na šírke 360 px bez horizontálneho scrollu.
  - [ ] „Uložiť ako obrázok“ vytvorí PNG Karty 1 na klientovi (bez odoslania na server).
  - [ ] Barber Cheat Sheet obsahuje min. 3 číselné hodnoty v mm.

**P0-7 Stavy spracovania a chyby**
- Loading so štádiami (napr. „Analyzujem proporcie tváre…“), timeout s možnosťou skúsiť znova bez straty vstupov (vstupy držané len v pamäti stránky).
- *Akceptačné kritériá:*
  - [ ] p95 čas od odoslania po Blueprint < 45 s.
  - [ ] Pri chybe je k dispozícii tlačidlo „Skúsiť znova“.

**P0-8 Meranie bez osobných údajov**
- Privacy-friendly analytika bez cookies (napr. Plausible / Umami / Vercel Analytics) s udalosťami funnelu. Žiadne fotky, žiadne vstupné hodnoty viažuce sa na osobu.
- *Akceptačné kritériá:*
  - [ ] Merané udalosti: `landing_view`, `consent_given`, `photos_completed`, `submit`, `blueprint_rendered`, `blueprint_error`, `cheatsheet_copy`, `cheatsheet_save_image`, `feedback_submitted`.
  - [ ] Každá beta pozvánka má vlastný anonymný kód (`?ref=t07`) na spárovanie s dotazníkom bez mena.

**P0-9 Spätná väzba v produkte**
- Pod Blueprintom: „Bolo to užitočné?“ (👍/👎) + voliteľný krátky text + výzva „O 7 dní ti pošleme 3 otázky“.

### P1 – Nice-to-Have (fast follow)

| ID | Požiadavka | Poznámka |
|---|---|---|
| P1-1 | **Uložiť celý Blueprint ako obrázok / PDF** (nie len Kartu 1) | Ak beta ukáže, že ľudia screenshotujú aj farby. |
| P1-2 | **Nákupný zoznam** – Karta 2 ako checklist na skopírovanie | Podporuje „použiť v obchode“. |
| P1-3 | **Referenčné obrázky účesov** (licencované / kreslené ilustrácie, nie generované na jeho fotke) | Barberi pracujú vizuálne; musí ostať v súlade s non-goal o generovaní. |
| P1-4 | **Lokalizácia CZ** | Beta je SK/CZ; v1 môže byť len SK. |
| P1-5 | **Self-check kvality fotky na klientovi** (jas, rozlíšenie) pred odoslaním | Šetrí volania modelu. |

### P2 – Future Considerations (navrhovať tak, aby to neskôr šlo)

| ID | Požiadavka | Dôsledok pre architektúru dnes |
|---|---|---|
| P2-1 | **Klientsky MediaPipe** – pomery tváre a ramien ako tvrdé čísla do promptu | Request payload má mať voliteľný objekt `measurements` už teraz. |
| P2-2 | **„Overené miesta v tvojom meste“** – kurátorovaný zoznam ~5 barberov (Praha, Bratislava) | Statický JSON/Markdown, žiadna DB; Karta 1 má mať miesto na CTA. |
| P2-3 | **Monetizácia** (jednorazová platba za Premium Blueprint, B2B pre barberov) | Žiadne rozhodnutia, ktoré by vyžadovali účty už vo v1. |
| P2-4 | **Re-analýza po zmene** (pred/po) | Vyžaduje lokálne uloženie Blueprintu na zariadení, nie na serveri. |

## 8. Success Metrics

### Leading (dni – 1 týždeň)

| Metrika | Definícia | Cieľ | Stretch |
|---|---|---|---|
| **Completion Rate** | `blueprint_rendered` / `consent_given` (unikátne relácie) | **> 60 %** | > 75 % |
| **Save / Copy Rate** | relácie s `cheatsheet_copy` alebo `cheatsheet_save_image` / `blueprint_rendered` | **> 40 %** | > 55 % |
| Upload Drop-off | 1 − `photos_completed` / `consent_given` | < 25 % | < 15 % |
| Error Rate | `blueprint_error` / `submit` | < 10 % | < 5 % |
| Quick satisfaction | 👍 / (👍 + 👎) | > 70 % | > 85 % |

> Screenshoty systém v prehliadači nevie spoľahlivo zachytiť. Meriame tlačidlá Kopírovať/Uložiť **a** v dotazníku sa pýtame „Urobil si si screenshot?“ – výsledná Save Rate = analytika ∪ self-report.

### Lagging (7 – 14 dní)

| Metrika | Definícia | Cieľ |
|---|---|---|
| **Real-World Execution** | Testeri, ktorí ukázali kartu barberovi **alebo** podľa nej niečo kúpili (dotazník D+7) | **≥ 5 z 20** |
| Comprehension | „Pochopil si odporúčania?“ = áno | ≥ 80 % respondentov |
| Referral intent | „Poslal by si to kamarátovi?“ = áno | ≥ 50 % respondentov |

**Rozhodnutie o škálovaní:** viď [Beta & metriky](./04-beta-validation-plan.md#5-rozhodovacie-pravidlá-go--iterate--kill).

## 9. Open Questions

| # | Otázka | Kto | Blokuje? |
|---|---|---|---|
| Q1 | Ktorý multimodálny model / poskytovateľ? Kritériá: kvalita vision, natívne štruktúrované výstupy (JSON Schema), zero/limited data retention, cena za 3 fotky, latencia < 45 s. | Engineering | **Áno** (Týždeň 1) |
| Q2 | Stačí na posúdenie farebného kontrastu fotka pri ľubovoľnom svetle, alebo treba v onboardingu vyžiadať denné svetlo / bielu stenu? | Engineering + Product | Áno (kalibrácia v T1) |
| Q3 | Právny základ a text súhlasu pre spracovanie fotiek tváre (GDPR) – stačí výslovný súhlas + krátke privacy notice? Potrebujeme DPA s poskytovateľom modelu? | Legal | **Áno** pred betou |
| Q4 | Odporúčania v mm – kalibrovať podľa SK/CZ barberskej praxe (čísla nástavcov 1 – 8 vs. mm)? Uvádzať oboje? | Product (konzultácia s barberom) | Nie |
| Q5 | Ako zaobchádzať s okuliarmi, bradou, tetovaniami, nadváhou – citlivé formulácie bez hodnotenia? | Product / Content | Nie (rieši system prompt) |
| Q6 | Je výška dostatočná náhrada za meranie postavy, alebo pridať voliteľnú váhu / veľkosť oblečenia? | Product | Nie |
| Q7 | Kde budú žiť pravidlá – kto je „expertný zdroj“ pre KB (barber/stylista konzultant na 1 – 2 hodiny)? | Product | Nie, ale zvyšuje kvalitu |

## 10. Timeline Considerations

- **Fázovanie (4 týždne, víkendová kapacita):** T1 mozog & kalibrácia → T2 tenký prototyp → T3 uzavretá beta → T4+ iterácia, MediaPipe, lokálne napojenie. Detail v [Implementačnom pláne](./03-implementation-plan.md).
- **Tvrdé závislosti:** výber modelu (Q1) a privacy text (Q3) musia byť uzavreté **pred** rozoslaním bety.
- **Bez tvrdých externých deadlinov.** Jediný „deadline“ je časový box: ak v T3 nebude splnená brána kvality, beta sa posúva namiesto rozšírenia scope.
- **Pravidlo pre scope:** každá nová požiadavka počas 4 týždňov musí nahradiť existujúcu P0/P1, inak ide do parking lotu (P2).
