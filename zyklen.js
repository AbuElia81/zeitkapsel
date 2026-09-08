// Die Schichten der Zeitkugel — von der äußersten (größter Zyklus) bis zum Kern.
// Jede Schicht: Name, Dauer, Segmente des Zyklus und die Stelle, an der wir gerade stehen.

const TAG = 86400000;

// Anteil des laufenden Jahres, mondgenau bzw. tagesgenau berechnet
function jahresAnteil(d) {
  const j0 = Date.UTC(d.getUTCFullYear(), 0, 1);
  const j1 = Date.UTC(d.getUTCFullYear() + 1, 0, 1);
  return (d.getTime() - j0) / (j1 - j0);
}
function mondAnteil(d) {
  const neumond = Date.UTC(2000, 0, 6, 18, 14); // bekannter Neumond
  const synodisch = 29.530588853 * TAG;
  return (((d.getTime() - neumond) % synodisch) + synodisch) % synodisch / synodisch;
}
function tagesAnteil(d) {
  return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
}
// Phase eines langen Zyklus aus einem Ankerjahr heraus
function langAnteil(jahr, anker, dauer) {
  return (((jahr - anker) % dauer) + dauer) % dauer / dauer;
}

const jetzt = new Date();
const jahr = jetzt.getUTCFullYear() + jahresAnteil(jetzt);

export const SCHICHTEN = [
  {
    name: 'Yuga-Zyklus',
    dauer: '25.800 Jahre',
    untertitel: 'Die Präzession der Erdachse',
    quelle: 'nach Bibhu Dev Misra, „Yuga Shift“',
    radius: 5.0,
    farbe: '#e8b95c',
    einheit: 'Jahre',
    text: `Die äußerste Schicht ist der große Weltenzyklus: 25.800 Jahre, genau die Zeit,
      in der die Erdachse einmal um den Himmelspol kreist. Bibhu Dev Misra rekonstruiert
      darin die vier Yugas der indischen Überlieferung — jedes 2.700 Jahre lang, getrennt
      durch 300-jährige Übergänge (Sandhi). Der Zyklus fällt vom Goldenen Zeitalter herab
      bis zum Eisernen und steigt auf der anderen Hälfte wieder auf. An den beiden Wendepunkten
      stehen zwei 1.200-jährige Katastrophenzeiten, für die er die griechischen Namen benutzt:
      Ekpyrosis, die Reinigung durch Feuer, und Kataklysmos, die Reinigung
      durch Wasser.`,
    fakten: [
      '8 Yugas × 2.700 + 6 Sandhis × 300 + 2 × 1.200 Jahre = 25.800 Jahre',
      'Zwei der acht 300-Jahr-Übergänge stecken bereits in den Katastrophenzeiten',
      'Das absteigende Kali Yuga läuft nach Misra von 676 v. Chr. bis 2025 n. Chr.',
      'Das schmale Band darüber: der Kern der Milchstraße schaltet ein, ist aktiv, schaltet ab',
      'Ekpyrosis heißt Weltenbrand, Kataklysmos Überflutung — beide reinigen',
      'Die 25.800 Jahre sind astronomisch belegt — die Yuga-Zuordnung ist Misras These'
    ],
    hinweis: `Die Präzession ist gemessene Astronomie. Die Einteilung in Yugas und die Kopplung
      an das galaktische Zentrum sind Misras Deutung und keine gesicherte Wissenschaft —
      alle tieferen Schichten dieser Kugel dagegen sind messbare Zyklen.`,
    segmente: [
      { name: 'Kataklysmos', laenge: 1200, art: 'katastrophe', zeit: '10876 – 9676 v. Chr.' },
      { name: 'Satya', laenge: 2700, art: 'yuga', zeit: '9676 – 6976 v. Chr.', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '6976 – 6676 v. Chr.' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zeit: '6676 – 3976 v. Chr.', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '3976 – 3676 v. Chr.' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zeit: '3676 – 976 v. Chr.', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '976 – 676 v. Chr.' },
      { name: 'Kali', laenge: 2700, art: 'yuga', zeit: '676 v. Chr. – 2025 n. Chr.', zusatz: 'absteigend' },
      { name: 'Ekpyrosis', laenge: 1200, art: 'katastrophe', zeit: '2025 – 3225 n. Chr.' },
      { name: 'Kali', laenge: 2700, art: 'yuga', zeit: '3225 – 5925 n. Chr.', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '5925 – 6225 n. Chr.' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zeit: '6225 – 8925 n. Chr.', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '8925 – 9225 n. Chr.' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zeit: '9225 – 11925 n. Chr.', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi', zeit: '11925 – 12225 n. Chr.' },
      { name: 'Satya', laenge: 2700, art: 'yuga', zeit: '12225 – 14925 n. Chr.', zusatz: 'aufsteigend' }
    ],
    // Zweites, schmales Band: die AGN-Phasen des galaktischen Zentrums
    nebenband: {
      titel: 'Der galaktische Kern — Sgr A*',
      segmente: [
        { name: 'Galaktischer Kern schaltet ein', laenge: 3900, art: 'agn-an' },
        { name: '', laenge: 5100, art: 'leer' },
        { name: 'Galaktischer Kern aktiv', laenge: 8100, art: 'agn' },
        { name: 'Galaktischer Kern schaltet ab', laenge: 3900, art: 'agn-aus' },
        { name: '', laenge: 4800, art: 'leer' }
      ]
    },
    // 12.900 Jahre liegen vor der Ekpyrosis; sie beginnt mit dem Ende
    // des absteigenden Kali Yuga im Jahr 2025.
    jetzt: (12900 + Math.max(0, jahr - 2025)) / 25800,
    jetztText: `Wir stehen am Ende des absteigenden Kali Yuga und am Beginn der
      Ekpyrosis — der Reinigung durch Feuer.`
  },

  {
    name: 'Halstatt-Zyklus',
    dauer: '2.400 Jahre',
    untertitel: 'Der große Sonnenrhythmus, auch Bray-Zyklus',
    quelle: 'aus ¹⁴C- und ¹⁰Be-Reihen in Baumringen und Eisbohrkernen',
    radius: 4.45,
    farbe: '#e39a52',
    einheit: 'Jahre',
    text: `Unter dem Weltenzyklus liegt der längste Rhythmus, den wir in der Sonne wirklich
      messen können. In den Radiokohlenstoff-Kurven von Baumringen und im Beryllium der
      Eisbohrkerne kehrt alle rund 2.400 Jahre eine Zeit schwacher Sonne wieder. Jedes
      dieser Halstatt-Minima fällt mit einer Kältephase und mit Umbrüchen in den frühen
      Hochkulturen zusammen.`,
    fakten: [
      'Benannt nach der Halstatt-Kälteperiode um 800 v. Chr.',
      'Sichtbar in ¹⁴C-Reihen über die letzten 10.000 Jahre',
      'Das jüngste Minimum fällt in die Kleine Eiszeit um 1500',
      'Rund elf Halstatt-Zyklen passen in einen Yuga-Zyklus'
    ],
    segmente: [
      { name: 'Minimum', laenge: 300, art: 'tief' },
      { name: 'Anstieg', laenge: 900, art: 'auf' },
      { name: 'Maximum', laenge: 300, art: 'hoch' },
      { name: 'Rückgang', laenge: 900, art: 'ab' }
    ],
    jetzt: langAnteil(jahr, 1500, 2400),
    jetztText: 'Etwa ein Fünftel nach dem Minimum der Kleinen Eiszeit — ungefähre Lage.'
  },

  {
    name: 'Eddy-Zyklus',
    dauer: '1.000 Jahre',
    untertitel: 'Warmzeiten und Kaltzeiten',
    quelle: 'Klimaproxys des Holozäns',
    radius: 3.95,
    farbe: '#dd7f5e',
    einheit: 'Jahre',
    text: `Der Eddy-Zyklus trägt die Wärmeschaukel der letzten Jahrtausende: die römische
      Warmzeit, die Kälte der Völkerwanderung, das mittelalterliche Klimaoptimum, die
      Kleine Eiszeit. Rund tausend Jahre von einem Wärmegipfel zum nächsten — der Takt,
      in dem Kulturen wachsen und sich zurückziehen.`,
    fakten: [
      'Benannt nach dem Sonnenforscher John A. Eddy',
      'Römisches Optimum, Mittelalterliches Optimum, Kleine Eiszeit als Marken',
      'Etwa 2,4 Eddy-Zyklen bilden einen Halstatt-Zyklus'
    ],
    segmente: [
      { name: 'Kaltphase', laenge: 250, art: 'tief' },
      { name: 'Erwärmung', laenge: 250, art: 'auf' },
      { name: 'Warmphase', laenge: 250, art: 'hoch' },
      { name: 'Abkühlung', laenge: 250, art: 'ab' }
    ],
    jetzt: langAnteil(jahr, 1500, 1000),
    jetztText: 'Gut die Hälfte nach dem Tiefpunkt der Kleinen Eiszeit — ungefähre Lage.'
  },

  {
    name: 'Suess-de-Vries-Zyklus',
    dauer: '208 Jahre',
    untertitel: 'Die großen Sonnenminima',
    quelle: 'Sonnenfleckenrekonstruktion und ¹⁴C',
    radius: 3.50,
    farbe: '#d4677a',
    einheit: 'Jahre',
    text: `Alle gut zweihundert Jahre schläft die Sonne für einige Jahrzehnte fast ein.
      Das Spörer-Minimum, das Maunder-Minimum mit seinen fleckenlosen Jahren um 1670,
      das Dalton-Minimum um 1810 — sie folgen diesem Takt. In den Jahren des Maunder-Minimums
      fror die Themse regelmäßig zu.`,
    fakten: [
      'Spörer-Minimum 1460–1550, Maunder-Minimum 1645–1715, Dalton-Minimum 1790–1830',
      'Im Maunder-Minimum wurden über Jahrzehnte fast keine Sonnenflecken gezählt',
      'Rund 19 Schwabe-Zyklen ergeben einen Suess-de-Vries-Zyklus'
    ],
    segmente: [
      { name: 'Großes Minimum', laenge: 60, art: 'tief' },
      { name: 'Erholung', laenge: 44, art: 'auf' },
      { name: 'Großes Maximum', laenge: 60, art: 'hoch' },
      { name: 'Abklingen', laenge: 44, art: 'ab' }
    ],
    jetzt: langAnteil(jahr, 1810, 208),
    jetztText: 'Kurz nach dem Dalton-Minimum gerechnet — ungefähre Lage.'
  },

  {
    name: 'Gleißberg-Zyklus',
    dauer: '88 Jahre',
    untertitel: 'Die Hüllkurve der Sonnenflecken',
    quelle: 'Sonnenfleckenzählung seit 1749',
    radius: 3.10,
    farbe: '#c05fa0',
    einheit: 'Jahre',
    text: `Die elfjährigen Sonnenzyklen sind nicht alle gleich stark. Ihre Höhe schwankt
      selbst wieder — in einer Welle von rund 88 Jahren, die Wolfgang Gleißberg in den
      Zählreihen fand. Acht Sonnenzyklen bilden eine solche Welle: erst schwache, dann
      immer kräftigere Maxima, dann wieder abnehmende.`,
    fakten: [
      'Benannt nach Wolfgang Gleißberg, 1944 beschrieben',
      'Umfasst rund acht Schwabe-Zyklen',
      'Erklärt, warum Zyklus 19 (1957) riesig und Zyklus 24 (2014) schwach war'
    ],
    segmente: [
      { name: 'Schwache Zyklen', laenge: 22, art: 'tief' },
      { name: 'Zunahme', laenge: 22, art: 'auf' },
      { name: 'Starke Zyklen', laenge: 22, art: 'hoch' },
      { name: 'Abnahme', laenge: 22, art: 'ab' }
    ],
    jetzt: langAnteil(jahr, 1900, 88),
    jetztText: 'Rund vier Jahrzehnte nach dem letzten schwachen Abschnitt.'
  },

  {
    name: 'Hale-Zyklus',
    dauer: '22 Jahre',
    untertitel: 'Das Magnetfeld der Sonne kehrt sich um',
    quelle: 'gemessen seit George Ellery Hale, 1908',
    radius: 2.74,
    farbe: '#9d63c4',
    einheit: 'Jahre',
    text: `Erst nach zwei Sonnenfleckenzyklen ist die Sonne wieder ganz sie selbst. Bei
      jedem Maximum klappt ihr Magnetfeld um: Nordpol wird Südpol. Nach elf Jahren ist
      die Polarität vertauscht, nach zweiundzwanzig wieder hergestellt. Der sichtbare
      Fleckenzyklus von elf Jahren ist also nur die halbe Wahrheit.`,
    fakten: [
      'Zwei Schwabe-Zyklen von je 11 Jahren bilden einen Hale-Zyklus',
      'Beim Maximum vertauschen sich die magnetischen Pole der Sonne',
      'Sonnenzyklus 25 hatte sein Maximum im Herbst 2024',
      'Steuert Polarlichter, Satellitenausfälle und Funkstörungen'
    ],
    segmente: [
      { name: 'Anstieg', laenge: 4.5, art: 'auf' },
      { name: 'Maximum', laenge: 2, art: 'hoch' },
      { name: 'Abfall', laenge: 4.5, art: 'ab' },
      { name: 'Anstieg', laenge: 4.5, art: 'auf', zusatz: 'umgekehrte Polarität' },
      { name: 'Maximum', laenge: 2, art: 'hoch', zusatz: 'umgekehrte Polarität' },
      { name: 'Abfall', laenge: 4.5, art: 'ab', zusatz: 'umgekehrte Polarität' }
    ],
    jetzt: langAnteil(jahr, 2008.96, 22),
    jetztText: 'Im absteigenden Ast von Sonnenzyklus 25, nach dem Maximum von 2024.'
  },

  {
    name: 'Jupiter-Saturn-Zyklus',
    dauer: '19,86 Jahre',
    untertitel: 'Die Große Konjunktion — der Große Chronokrator',
    quelle: 'Abu Maʿšar, „Buch der Religionen und Dynastien“ (9. Jh.); Raymond Merriman, „Forecast 2020“',
    radius: 2.40,
    farbe: '#8869cb',
    einheit: 'Jahre',
    text: `Die beiden langsamsten Planeten, die das bloße Auge sieht, treffen sich alle
      knapp zwanzig Jahre am Himmel. Die arabisch-persische Astrologie nannte dieses Paar
      den Großen Chronokrator, den Zeitmarkierer, und baute darauf ihre gesamte
      Geschichtsdeutung: Abu Maʿšar las aus den Großen Konjunktionen den Aufstieg und Fall
      von Dynastien. Jede Konjunktion springt rund 243 Grad weiter — acht Zeichen und drei
      Grad — und bleibt so über Jahrhunderte im selben Element, bis sie in das nächste
      wechselt. Diesen Wechsel nennt man die Große Mutation.`,
    fakten: [
      'Am 21. Dezember 2020, zur Wintersonnenwende, in 0°29′ Wassermann',
      'Damit begann die Große Mutation von Erde zu Luft — die erste Luftreihe seit 1226',
      'Abu Maʿšar: alle 240 Jahre ein neues Trigon, nach 960 Jahren beginnt alles von vorn',
      'Moderne Zählung: rund 200 Jahre je Element, rund 800 Jahre für die volle Runde',
      'Der Stern von Betlehem gilt als die Konjunktion von 7 v. Chr. in den Fischen',
      'Die nächste Große Konjunktion fällt auf den 31. Oktober 2040',
      'Rund 1.300 dieser Zyklen füllen einen Yuga-Zyklus'
    ],
    hinweis: `Die 19,86 Jahre sind reine Himmelsmechanik. Was Abu Maʿšar und die moderne
      Mundanastrologie daraus für Dynastien, Wirtschaft und Zeitgeist lesen, ist Deutung —
      die beiden Zählungen widersprechen sich sogar: 240 und 960 Jahre in der klassischen,
      200 und 800 Jahre in der neueren Lesart.`,
    segmente: [
      { name: 'Konjunktion', laenge: 4.97, art: 'hoch', zusatz: 'Neubeginn' },
      { name: 'Zunehmendes Quadrat', laenge: 4.97, art: 'auf', zusatz: 'Aufbau' },
      { name: 'Opposition', laenge: 4.96, art: 'hoch', zusatz: 'volle Entfaltung' },
      { name: 'Abnehmendes Quadrat', laenge: 4.96, art: 'ab', zusatz: 'Abbau' }
    ],
    jetzt: langAnteil(jahr, 2020.97, 19.86),
    jetztText: `Gut fünf Jahre nach der Großen Mutation von 2020 — im zweiten Viertel
      des Zyklus, kurz nach dem zunehmenden Quadrat.`
  },

  {
    name: 'Das Jahr',
    dauer: '365,2422 Tage',
    untertitel: 'Ein Umlauf der Erde um die Sonne',
    quelle: 'tropisches Jahr',
    radius: 2.08,
    farbe: '#7b76d0',
    einheit: 'Tage',
    text: `Der Zyklus, in dem wir zu Hause sind. Weil die Erdachse um 23,4 Grad geneigt
      ist, wandert die Sonne im Lauf eines Umlaufs am Himmel auf und ab — daraus werden
      die Jahreszeiten. Die vier Abschnitte sind nicht gleich lang: im Nordsommer steht
      die Erde weiter von der Sonne entfernt und wird langsamer, deshalb dauert der
      Sommer knapp fünf Tage länger als der Winter.`,
    fakten: [
      'Neigung der Erdachse: 23,44 Grad',
      'Frühling 92,8 · Sommer 93,6 · Herbst 89,8 · Winter 89,0 Tage',
      'Der Rest von 0,2422 Tagen wird alle vier Jahre als Schalttag nachgeholt',
      'Rund 25.800 dieser Jahre ergeben die äußerste Schicht dieser Kugel'
    ],
    segmente: [
      { name: 'Frühling', laenge: 92.8, art: 'auf' },
      { name: 'Sommer', laenge: 93.6, art: 'hoch' },
      { name: 'Herbst', laenge: 89.8, art: 'ab' },
      { name: 'Winter', laenge: 89.0, art: 'tief' }
    ],
    // Frühlingsanfang liegt rund 79 Tage nach Jahresbeginn
    jetzt: ((jahresAnteil(jetzt) * 365.2422 - 79) % 365.2422 + 365.2422) % 365.2422 / 365.2422,
    jetztText: 'Die Marke steht auf dem heutigen Tag.',
    lebend: true
  },

  {
    name: 'Der Mondmonat',
    dauer: '29,53 Tage',
    untertitel: 'Von Neumond zu Neumond',
    quelle: 'synodischer Monat',
    radius: 1.78,
    farbe: '#57a0d8',
    einheit: 'Tage',
    text: `Der älteste Kalender der Menschheit. Der Mond braucht 27,3 Tage für einen Umlauf
      um die Erde — bis er wieder in derselben Stellung zur Sonne steht und die Phasen sich
      wiederholen, vergehen aber 29,53 Tage, weil die Erde inzwischen weitergewandert ist.
      Aus diesem Unterschied ist jeder Mondkalender gebaut.`,
    fakten: [
      'Siderischer Umlauf 27,32 Tage — synodischer Monat 29,53 Tage',
      'Zwölf Mondmonate ergeben 354 Tage, elf weniger als ein Sonnenjahr',
      '235 Mondmonate entsprechen fast genau 19 Jahren: der Meton-Zyklus',
      'Der Mond entfernt sich jährlich 3,8 cm von der Erde'
    ],
    segmente: [
      { name: 'Neumond', laenge: 3.69, art: 'tief' },
      { name: 'Zunehmende Sichel', laenge: 3.69, art: 'auf' },
      { name: 'Erstes Viertel', laenge: 3.69, art: 'auf' },
      { name: 'Zunehmender Mond', laenge: 3.69, art: 'hoch' },
      { name: 'Vollmond', laenge: 3.69, art: 'hoch' },
      { name: 'Abnehmender Mond', laenge: 3.69, art: 'ab' },
      { name: 'Letztes Viertel', laenge: 3.69, art: 'ab' },
      { name: 'Abnehmende Sichel', laenge: 3.69, art: 'tief' }
    ],
    jetzt: mondAnteil(jetzt),
    jetztText: 'Die Marke steht auf der heutigen Mondphase.',
    lebend: true
  },

  {
    name: 'Der Tag',
    dauer: '23 h 56 min 4 s',
    untertitel: 'Eine Drehung der Erde',
    quelle: 'siderischer Tag',
    radius: 1.48,
    farbe: '#3fb8b2',
    einheit: 'Stunden',
    text: `Eine volle Drehung der Erde dauert nicht vierundzwanzig Stunden, sondern
      drei Minuten und sechsundfünfzig Sekunden weniger. Die fehlende Zeit ist der
      Weg, den die Erde in einem Tag um die Sonne zurückgelegt hat — sie muss sich
      ein Stück weiterdrehen, bis die Sonne wieder am selben Punkt steht. Der
      bürgerliche Tag von 24 Stunden ist der Sonnentag, der Sterntag ist kürzer.`,
    fakten: [
      'Siderischer Tag 23 h 56 min 4,1 s — Sonnentag 24 h',
      'Die Erdrotation bremst um rund 1,8 Millisekunden pro Jahrhundert',
      'Vor 600 Millionen Jahren hatte ein Tag nur 21 Stunden',
      'Die innere Uhr des Menschen läuft frei mit etwa 24,2 Stunden'
    ],
    segmente: [
      { name: 'Nacht', laenge: 6, art: 'tief' },
      { name: 'Morgen', laenge: 6, art: 'auf' },
      { name: 'Nachmittag', laenge: 6, art: 'hoch' },
      { name: 'Abend', laenge: 6, art: 'ab' }
    ],
    jetzt: tagesAnteil(jetzt),
    jetztText: 'Die Marke läuft mit der Uhr mit.',
    lebend: true
  },

  {
    name: 'Der Atemzug',
    dauer: 'rund 4 Sekunden',
    untertitel: 'Zwölf bis achtzehn Mal in der Minute',
    quelle: 'Ruheatmung eines Erwachsenen',
    radius: 1.12,
    farbe: '#5ec98b',
    einheit: 'Sekunden',
    text: `Der erste Zyklus, den wir selbst steuern können. In Ruhe atmet ein Mensch
      zwölf- bis achtzehnmal in der Minute; das Ausatmen dauert länger als das Einatmen.
      Zwischen Atem und Herzschlag besteht eine feste Kopplung — der Puls beschleunigt
      beim Einatmen und verlangsamt sich beim Ausatmen.`,
    fakten: [
      'Rund 20.000 Atemzüge an einem Tag',
      'Ausatmen dauert etwa doppelt so lang wie Einatmen',
      'Respiratorische Sinusarrhythmie: der Herzschlag folgt dem Atem',
      'Etwa vier bis fünf Herzschläge auf einen Atemzug'
    ],
    segmente: [
      { name: 'Einatmen', laenge: 1.6, art: 'auf' },
      { name: 'Pause', laenge: 0.4, art: 'hoch' },
      { name: 'Ausatmen', laenge: 1.8, art: 'ab' },
      { name: 'Pause', laenge: 0.2, art: 'tief' }
    ],
    jetzt: 0,
    jetztText: 'Die Marke atmet in Echtzeit mit.',
    lebend: true,
    periode: 4
  },

  {
    name: 'Der Herzschlag',
    dauer: 'rund 0,9 Sekunden',
    untertitel: 'Der Kern der Zeitkugel',
    quelle: 'Ruhepuls von etwa 70 Schlägen je Minute',
    radius: 0.70,
    farbe: '#f0654f',
    kern: true,
    einheit: 'Sekunden',
    text: `Im Innersten schlägt der kleinste Zyklus, den wir unmittelbar spüren. Er ist
      der Maßstab, an dem alle anderen gemessen werden: rund 2,5 Milliarden Schläge in
      einem Menschenleben, etwa 900 Millionen in einem Yuga-Jahr — und knapp neunhundert
      Billionen in einem einzigen Umlauf der äußersten Schale. Von hier aus gesehen ist
      die Präzession der Erdachse nur ein sehr langsamer Herzschlag.`,
    fakten: [
      'Etwa 100.000 Schläge an einem Tag, 2,5 Milliarden in einem Leben',
      'Systole 0,3 s, Diastole 0,6 s',
      'Ein Yuga-Zyklus fasst rund 900 Billionen Herzschläge',
      'Der Sinusknoten taktet ohne jeden Nervenimpuls von außen'
    ],
    segmente: [
      { name: 'Systole', laenge: 0.3, art: 'hoch' },
      { name: 'Diastole', laenge: 0.6, art: 'tief' }
    ],
    jetzt: 0,
    jetztText: 'Die Marke schlägt in Echtzeit.',
    lebend: true,
    periode: 0.9
  }
];

export { jahresAnteil, mondAnteil, tagesAnteil };
