// All Slovak UI copy (informal "ty"). Never add attractiveness / rating language here.

export const sk = {
  meta: {
    title: "Grooming Studio",
    description:
      "Z 3 fotiek konkrétny plán: inštrukcie pre barbera, farby a strihy oblečenia a jednoduchá starostlivosť o pleť.",
  },

  common: {
    retry: "Skúsiť znova",
    backToForm: "Upraviť fotky",
    restart: "Začať odznova",
    privacyLink: "Ako narábame s fotkami",
    backHome: "Späť na úvod",
  },

  landing: {
    title: "Grooming Studio",
    value:
      "Z 3 fotiek ti pripravíme konkrétny plán: čo povedať barberovi, aké farby a strihy oblečenia ti sedia a ako sa jednoducho starať o pleť.",
    stepsTitle: "Ako to funguje",
    steps: [
      "Odfoť 3 fotky – tvár spredu, z profilu a celú postavu.",
      "Doplň výšku, typ vlasov a štýl, ktorý ti je blízky.",
      "Zhruba do minúty dostaneš Blueprint – 4 karty s konkrétnymi krokmi.",
    ],
    privacyPromise: "Fotky neukladáme. Spracujú sa len počas analýzy a hneď sa zahodia.",
    cta: "Začať",
    note: "Zadarmo, bez registrácie.",
  },

  consent: {
    title: "Skôr než začneš",
    points: [
      "Fotky neukladáme. Spracujú sa len počas analýzy a hneď sa zahodia.",
      "Na analýzu ich odošleme cez náš server AI modelu Claude od spoločnosti Anthropic.",
      "Dostaneš odporúčania (strih, farby, oblečenie, starostlivosť) – nie hodnotenie vzhľadu.",
      "Bez registrácie. Anonymne meriame len kroky v aplikácii, bez cookies a bez fotiek.",
      "Služba je určená len pre ľudí od 18 rokov.",
    ],
    checkbox: "Mám aspoň 18 rokov a súhlasím so spracovaním fotiek",
    confirm: "Pokračovať",
  },

  photo: {
    sectionTitle: "Tvoje 3 fotky",
    add: "Odfotiť alebo vybrať",
    replace: "Vymeniť",
    remove: "Odstrániť",
    processing: "Pripravujeme fotku…",
    decodeError:
      "Túto fotku sa nepodarilo načítať. Skús inú – napríklad JPG z galérie alebo novú fotku priamo z mobilu.",
    slots: {
      front: {
        title: "Tvár spredu",
        tips: [
          "Pri dennom svetle, ideálne čelom k oknu.",
          "Bez okuliarov a čiapky, pozeraj rovno do objektívu.",
        ],
        example: "Príklad: hlava a ramená, tvár rovno, neutrálny výraz.",
      },
      profile: {
        title: "Profil (z boku)",
        tips: [
          "Otoč sa bokom tak, aby bolo vidieť ucho, líniu čeľuste a zátylok.",
          "Bez okuliarov, vlasy nechaj tak, ako ich bežne nosíš.",
        ],
        example: "Príklad: hlava a krk presne z boku.",
      },
      full_body: {
        title: "Celá postava",
        tips: [
          "Priliehavejšie oblečenie, aby bolo vidieť ramená a pás.",
          "Nech ťa odfotí niekto iný z výšky hrudníka, od hlavy po päty.",
        ],
        example: "Príklad: celá postava v stoji, ruky voľne pri tele.",
      },
    },
  },

  inputs: {
    title: "Pár údajov o tebe",
    height: {
      label: "Výška (cm)",
      placeholder: "napr. 180",
      hint: "Celé číslo od 140 do 220.",
    },
    hairType: {
      label: "Typ vlasov",
      options: {
        straight: "Rovné",
        wavy: "Vlnité",
        curly: "Kučeravé",
        thinning: "Riedke / ustupujúce",
      },
    },
    style: {
      label: "Štýl, ktorý ti je blízky",
      options: {
        casual: "Casual",
        smart_casual: "Smart casual",
        streetwear: "Streetwear",
        minimal: "Minimal",
      },
    },
  },

  form: {
    title: "Fotky a pár údajov",
    intro: "Zaberie to asi 3 minúty.",
    submit: "Vytvoriť Blueprint",
    incompleteHint: "Na odoslanie potrebujeme všetky 3 fotky a 3 údaje.",
  },

  loading: {
    title: "Pripravujeme tvoj Blueprint",
    stages: [
      "Kontrolujeme fotky…",
      "Analyzujeme proporcie tváre…",
      "Vyberáme farby a strihy…",
      "Skladáme tvoj Blueprint…",
    ],
    note: "Zvyčajne to trvá do minúty. Nechaj stránku otvorenú.",
  },

  errors: {
    title: "Niečo sa nepodarilo",
    invalidPhotos: "Fotky sa nepodarilo spracovať. Nahraj fotky znova, prosím.",
    refusal:
      "Z týchto fotiek sme Blueprint nevedeli pripraviť. Skús iné fotky – pri dennom svetle, bez okuliarov a podľa tipov pri každej fotke.",
    analysisFailed: "Analýza sa nepodarila. Skús znova.",
    network: "Spojenie zlyhalo. Skontroluj internet a skús znova.",
  },

  photoIssue: {
    title: "Niektoré fotky treba vymeniť",
    intro: "Ostatné údaje ostávajú vyplnené.",
    replace: "Vymeniť fotky",
  },

  result: {
    title: "Tvoj Blueprint",
  },

  cards: {
    whyLabel: "Prečo",
    barber: {
      title: "Barber Cheat Sheet",
      subtitle: "Ukáž to barberovi",
      lengthsLabel: "Dĺžky",
      lengthColumns: { part: "Časť", length: "Dĺžka", guard: "Nástavec" },
      lengths: { top: "Hore", sides: "Boky", back: "Zátylok" },
      transitionLabel: "Prechod",
      necklineLabel: "Línia na krku",
      textureLabel: "Textúra a finish",
      instructionsLabel: "Pre barbera",
      stylingLabel: "Styling",
      beardLabel: "Brada",
      whyToggle: "Prečo práve tento strih",
      scissors: "nožnice",
      copy: "Kopírovať text",
      copied: "Skopírované",
      copyError: "Text sa nepodarilo skopírovať. Označ ho a skopíruj ručne.",
      saveImage: "Uložiť ako obrázok",
      saving: "Ukladáme…",
      saveError: "Obrázok sa nepodarilo uložiť. Skús znova alebo si urob snímku obrazovky.",
      transitions: {
        low_taper: "Low taper (nízky prechod)",
        mid_taper: "Mid taper (stredný prechod)",
        high_taper: "High taper (vysoký prechod)",
        low_fade: "Low fade (nízky fade)",
        mid_fade: "Mid fade (stredný fade)",
        high_fade: "High fade (vysoký fade)",
        scissor_over_comb: "Scissor over comb (nožnicami cez hrebeň)",
        none: "Bez prechodu",
      },
      necklines: {
        natural_tapered: "Natural taper (prirodzene zúžená)",
        rounded: "Rounded (zaoblené rohy)",
        squared: "Squared (rovná hrana)",
        blocked: "Blocked (rovná blokovaná línia)",
      },
      products: {
        matte_clay: "Matná hlina (matte clay)",
        paste: "Pasta (paste)",
        pomade: "Pomáda (pomade)",
        sea_salt_spray: "Sprej s morskou soľou (sea salt spray)",
        cream: "Stylingový krém (cream)",
        none: "Bez produktu",
      },
    },
    style: {
      title: "Farebná paleta & strihy",
      paletteLabel: "Tvoje farby",
      paletteWhyLabel: "Prečo tieto farby",
      keyCutsLabel: "3 kľúčové kúsky",
      fitLabel: "Strih",
      shoppingTipLabel: "Pri kúpe",
      avoidLabel: "Čomu sa vyhnúť",
      whereToWear: {
        top_near_face: "Hore, pri tvári",
        outerwear: "Vrchné oblečenie",
        bottoms: "Nohavice",
        accent: "Doplnok / akcent",
        any: "Kdekoľvek",
      },
    },
    grooming: {
      title: "Grooming & pleť",
      routineLabel: "Rutina v 3 krokoch",
      targetedTipLabel: "Cielený tip",
      when: {
        morning: "Ráno",
        evening: "Večer",
        morning_and_evening: "Ráno aj večer",
      },
      areas: {
        eyebrows: "Obočie",
        under_eyes: "Pod očami",
        beard_line: "Línia brady",
        skin_texture: "Textúra pleti",
        none: "Bez tipu",
      },
    },
    why: {
      title: "Prečo to funguje",
      proportionsLabel: "Tvoje proporcie",
      uncertaintiesLabel: "Čo sme z fotiek nevedeli posúdiť",
    },
    lowConfidence: {
      face: "Tvar tváre sme z fotky neurčili s istotou – strih je zvolený tak, aby fungoval univerzálne.",
      color: "Pri tejto fotke si nie sme istí podtónom pleti – paleta obsahuje bezpečné neutrály.",
      body: "Postavu sme z fotky neurčili s istotou – strihy oblečenia sú zvolené univerzálnejšie.",
    },
  },

  feedback: {
    question: "Bolo to užitočné?",
    yes: "Áno",
    no: "Nie",
    commentLabel: "Chceš niečo dodať? (nepovinné)",
    send: "Odoslať",
    thanks: "Ďakujeme za spätnú väzbu!",
    followUp: "O 7 dní ti pošleme 3 otázky.",
    error: "Odoslanie sa nepodarilo. Skús znova.",
  },

  privacy: {
    title: "Ako narábame s fotkami",
    items: [
      {
        title: "Čo spracúvame",
        text: "3 fotky, ktoré nahráš, a tvoju výšku, typ vlasov a preferovaný štýl. Fotky sa ešte v tvojom zariadení zmenšia a odstránia sa z nich metadáta (vrátane polohy GPS).",
      },
      {
        title: "Kto ich spracuje",
        // TODO(beta): verify against Anthropic's current commercial terms / DPA before launch (ADR 0001).
        text: "Fotky odošleme cez náš server na analýzu AI modelu Claude od spoločnosti Anthropic (poskytovateľ modelu). Podľa svojich obchodných podmienok Anthropic dáta z API nepoužíva na trénovanie modelov.",
      },
      {
        title: "Neukladanie",
        text: "Fotky neukladáme. Spracujú sa len počas analýzy a hneď sa zahodia. Nezapisujeme ich na disk, do databázy ani do logov.",
      },
      {
        title: "Analytika bez cookies",
        text: "Anonymne meriame len kroky v aplikácii (napr. „odoslané“, „výsledok zobrazený“). Bez cookies, bez fotiek a bez tvojich údajov.",
      },
    ],
    contact: {
      title: "Kontakt",
      text: "Otázky alebo žiadosť o informácie:",
      // TODO(beta): placeholder – replace with the real controller contact before launch.
      email: "TODO-kontakt@example.com",
    },
  },
} as const;

export type Dictionary = typeof sk;
