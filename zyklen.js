// Die Schichten der Zeitkugel — von der äußersten (größter Zyklus) bis zum Kern.
// Jede Schicht kennt einen Anker (ein Jahr, in dem der Zyklus bei null steht)
// und ihre Periode in Jahren. Daraus wird für jede beliebige Zeit die Stelle
// im Zyklus gerechnet — der Zeitschieber verschiebt nur dieses eine Jahr.

const TAG_IM_JAHR = 365.2422;

// Dezimaljahr aus einem Zeitpunkt: 2026,687 = 8. September 2026
export function jahrAus(d) {
  const j = d.getUTCFullYear();
  const j0 = Date.UTC(j, 0, 1), j1 = Date.UTC(j + 1, 0, 1);
  return j + (d.getTime() - j0) / (j1 - j0);
}
export function jahrJetzt() { return jahrAus(new Date()); }

// Zeitpunkt aus einem Dezimaljahr — auch für Jahre weit vor unserer Zeitrechnung
export function datumAus(j) {
  const g = Math.floor(j);
  const a = new Date(0); a.setUTCFullYear(g, 0, 1); a.setUTCHours(0, 0, 0, 0);
  const b = new Date(0); b.setUTCFullYear(g + 1, 0, 1); b.setUTCHours(0, 0, 0, 0);
  return new Date(a.getTime() + (j - g) * (b.getTime() - a.getTime()));
}

// Datum, wenn es nah genug an unserer Zeit liegt, sonst nur die Jahreszahl
export function zeitText(j, mitTag) {
  if (Math.abs(j) > 3000) return jahrText(j);
  const d = datumAus(j);
  // Den Monatsnamen holen und die Jahreszahl selbst anhängen — sonst schreibt
  // die Ortsformatierung negative Jahre als „-2500“ statt „2501 v. Chr.“
  const monat = d.toLocaleDateString('de-DE', { month: 'long', timeZone: 'UTC' });
  const jt = jahrText(d.getUTCFullYear(), true);
  return mitTag ? `${d.getUTCDate()}. ${monat} ${jt}` : `${monat} ${jt}`;
}

// „2026 n. Chr.“ / „10876 v. Chr.“
// Jahre werden ohne Tausenderpunkt geschrieben. Astronomisch gibt es ein Jahr null,
// die Zeitrechnung kennt keines — deshalb ist das Jahr 0 das Jahr 1 v. Chr.
export function jahrText(j, kurz = false) {
  const g = Math.round(j);
  return g <= 0 ? `${1 - g} v. Chr.` : (kurz ? `${g}` : `${g} n. Chr.`);
}

// Stelle im Zyklus, 0 … 1
export function anteil(schicht, jahr) {
  const p = schicht.periode;
  return (((jahr - schicht.anker) % p) + p) % p / p;
}

// In welchem Segment stehen wir, und von wann bis wann läuft es?
export function segmentBei(schicht, jahr) {
  const a = anteil(schicht, jahr);
  const gesamt = schicht.segmente.reduce((s, g) => s + g.laenge, 0);
  let lauf = 0;
  for (const seg of schicht.segmente) {
    const von = lauf / gesamt, bis = (lauf + seg.laenge) / gesamt;
    if (a >= von && a < bis) {
      const start = schicht.anker + Math.floor((jahr - schicht.anker) / schicht.periode) * schicht.periode;
      return {
        seg,
        vonJahr: start + von * schicht.periode,
        bisJahr: start + bis * schicht.periode
      };
    }
    lauf += seg.laenge;
  }
  return { seg: schicht.segmente[0], vonJahr: jahr, bisJahr: jahr };
}

const ZEICHEN = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
                 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];

// Hilfsfunktion: die nächsten Wiederkehrungen eines Ereignisses um ein Jahr herum
function reihe(anker, schritt, jahr, anzahl, benenner) {
  const n = Math.floor((jahr - anker) / schritt);
  const liste = [];
  for (let k = n; k < n + anzahl; k++) liste.push({ jahr: anker + k * schritt, was: benenner(k) });
  return liste;
}

// Der Ring der äußersten Schicht beginnt mit dem Kataklysmos
export const RING_ANKER = -10875;

export const SCHICHTEN = [
  {
    name: 'Yuga-Zyklus',
    dauer: '25.800 Jahre',
    untertitel: 'Die Präzession der Erdachse',
    quelle: 'nach Bibhu Dev Misra, „Yuga Shift“',
    radius: 5.00,
    farbe: '#e8b95c',
    einheit: 'Jahre',
    anker: RING_ANKER,
    periode: 25800,
    text: `Die äußerste Schicht ist der große Weltenzyklus: 25.800 Jahre, genau die Zeit,
      in der die Erdachse einmal um den Himmelspol kreist. Bibhu Dev Misra rekonstruiert
      darin die vier Yugas der indischen Überlieferung — jedes 2.700 Jahre lang, getrennt
      durch 300-jährige Übergänge (Sandhi). Der Zyklus fällt vom Goldenen Zeitalter herab
      bis zum Eisernen und steigt auf der anderen Hälfte wieder auf. An den beiden Wendepunkten
      stehen zwei 1.200-jährige Katastrophenzeiten, für die er die griechischen Namen benutzt:
      Ekpyrosis, die Reinigung durch Feuer, und Kataklysmos, die Reinigung durch Wasser.`,
    fakten: [
      '8 Yugas × 2.700 + 6 Sandhis × 300 + 2 × 1.200 Jahre = 25.800 Jahre',
      'Zwei der acht 300-Jahr-Übergänge stecken bereits in den Katastrophenzeiten',
      'Das absteigende Kali Yuga läuft nach Misra von 676 v. Chr. bis 2025 n. Chr.',
      'Das schmale Band darüber: der Kern der Milchstraße schaltet ein, ist aktiv, schaltet ab',
      'Die 25.800 Jahre sind astronomisch belegt — die Yuga-Zuordnung ist Misras These'
    ],
    hinweis: `Die Präzession ist gemessene Astronomie. Die Einteilung in Yugas und die Kopplung
      an das galaktische Zentrum sind Misras Deutung und keine gesicherte Wissenschaft —
      alle tieferen Schichten dieser Kugel dagegen sind messbare Zyklen.`,
    segmente: [
      { name: 'Kataklysmos', laenge: 1200, art: 'katastrophe' },
      { name: 'Satya', laenge: 2700, art: 'yuga', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zusatz: 'absteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Kali', laenge: 2700, art: 'yuga', zusatz: 'absteigend' },
      { name: 'Ekpyrosis', laenge: 1200, art: 'katastrophe' },
      { name: 'Kali', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend' },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Satya', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend' }
    ],
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
    jetztText: `Wir stehen am Ende des absteigenden Kali Yuga und am Beginn der
      Ekpyrosis — der Reinigung durch Feuer.`
  },

  {
    name: 'Halstatt-Zyklus',
    dauer: '2.400 Jahre',
    untertitel: 'Der große Sonnenrhythmus, auch Bray-Zyklus',
    quelle: 'aus ¹⁴C- und ¹⁰Be-Reihen in Baumringen und Eisbohrkernen',
    radius: 4.58,
    farbe: '#e2a054',
    einheit: 'Jahre',
    anker: 1500,
    periode: 2400,
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
    jetztText: 'Etwa ein Fünftel nach dem Minimum der Kleinen Eiszeit — ungefähre Lage.'
  },

  {
    name: 'Eddy-Zyklus',
    dauer: '1.000 Jahre',
    untertitel: 'Warmzeiten und Kaltzeiten',
    quelle: 'Klimaproxys des Holozäns',
    radius: 4.20,
    farbe: '#dc8757',
    einheit: 'Jahre',
    anker: 1500,
    periode: 1000,
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
    jetztText: 'Gut die Hälfte nach dem Tiefpunkt der Kleinen Eiszeit — ungefähre Lage.'
  },

  {
    name: 'Suess-de-Vries-Zyklus',
    dauer: '208 Jahre',
    untertitel: 'Die großen Sonnenminima',
    quelle: 'Sonnenfleckenrekonstruktion und ¹⁴C',
    radius: 3.85,
    farbe: '#d4706a',
    einheit: 'Jahre',
    anker: 1810,
    periode: 208,
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
    jetztText: 'Kurz nach dem Dalton-Minimum gerechnet — ungefähre Lage.'
  },

  {
    name: 'Gleißberg-Zyklus',
    dauer: '88 Jahre',
    untertitel: 'Die Hüllkurve der Sonnenflecken',
    quelle: 'Sonnenfleckenzählung seit 1749',
    radius: 3.53,
    farbe: '#c9628a',
    einheit: 'Jahre',
    anker: 1900,
    periode: 88,
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
    jetztText: 'Rund vier Jahrzehnte nach dem letzten schwachen Abschnitt.'
  },

  {
    name: 'Hale-Zyklus',
    dauer: '22 Jahre',
    untertitel: 'Das Magnetfeld der Sonne kehrt sich um',
    quelle: 'gemessen seit George Ellery Hale, 1908',
    radius: 3.23,
    farbe: '#b85fa8',
    einheit: 'Jahre',
    anker: 2008.96,
    periode: 22,
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
    termine: (j) => reihe(2008.96, 11, j, 4, k => `Sonnenzyklus ${24 + k} beginnt`),
    jetztText: 'Im absteigenden Ast von Sonnenzyklus 25, nach dem Maximum von 2024.'
  },

  {
    name: 'Jupiter-Saturn-Zyklus',
    dauer: '19,86 Jahre',
    untertitel: 'Die Große Konjunktion — der Große Chronokrator',
    quelle: 'Abu Maʿšar, „Buch der Religionen und Dynastien“ (9. Jh.); Raymond Merriman, „Forecast 2020“',
    radius: 2.96,
    farbe: '#a163c2',
    einheit: 'Jahre',
    anker: 2020.97,
    periode: 19.86,
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
    termine: (j) => reihe(2020.97, 19.86, j, 4, () => 'Große Konjunktion'),
    jetztText: `Gut fünf Jahre nach der Großen Mutation von 2020 — im zweiten Viertel
      des Zyklus, kurz nach dem zunehmenden Quadrat.`
  },

  {
    name: 'Mondknoten-Zyklus',
    dauer: '18,61 Jahre',
    untertitel: 'Große und kleine Mondwende',
    quelle: 'Rückläufigkeit der Mondknoten; Griffith Observatory zur Mondwende 2024/25',
    radius: 2.71,
    farbe: '#8a68cd',
    einheit: 'Jahre',
    anker: 2024.96,
    periode: 18.6130,
    text: `Die Bahn des Mondes ist gegen die Erdbahn um gut fünf Grad geneigt. Die beiden
      Punkte, an denen sie sich kreuzen — die Mondknoten — wandern rückwärts durch den
      Tierkreis und brauchen dafür 18,61 Jahre. In dieser Zeit schwingt der Mond zwischen
      zwei Extremen: Bei der großen Mondwende geht er weiter im Norden und im Süden auf
      als die Sonne je im Jahr, bei der kleinen bleibt er innerhalb ihres Bogens. Nur an
      den Knoten kann es Finsternisse geben — deshalb heißt der Aufsteigende Knoten in
      der Überlieferung Drachenkopf und der Absteigende Drachenschwanz.`,
    fakten: [
      'Große Mondwende: der Mond erreicht ±28,7° Deklination',
      'Kleine Mondwende: nur noch ±18,1° — zehn Grad weniger Spielraum',
      'Die jüngste große Mondwende fiel auf Dezember 2024 und reicht in 2025 hinein',
      'Die letzte kleine lag im Oktober 2015, die nächste kommt um 2034',
      'Stonehenge und die Steinreihen von Callanish sind auf die große Mondwende ausgerichtet',
      'Finsternisse gibt es nur, wenn Neu- oder Vollmond nahe an einem Knoten steht'
    ],
    segmente: [
      { name: 'Große Mondwende', laenge: 2.3, art: 'hoch' },
      { name: 'Rückgang', laenge: 7.0, art: 'ab' },
      { name: 'Kleine Mondwende', laenge: 2.3, art: 'tief' },
      { name: 'Anstieg', laenge: 7.0, art: 'auf' }
    ],
    termine: (j) => reihe(2024.96, 18.6130 / 2, j, 4,
      k => (((k % 2) + 2) % 2 === 0) ? 'Große Mondwende' : 'Kleine Mondwende'),
    jetztText: 'Mitten in der großen Mondwende, die von Dezember 2024 bis in das Jahr 2026 reicht.'
  },

  {
    name: 'Jupiter-Zyklus',
    dauer: '11,86 Jahre',
    untertitel: 'Ein Umlauf durch den Tierkreis, ein Zeichen je Jahr',
    quelle: 'siderische Umlaufzeit; chinesischer Jahresstern Suìxīng',
    radius: 2.48,
    farbe: '#7772d4',
    einheit: 'Jahre',
    anker: 2022.54,
    periode: 11.8618,
    text: `Jupiter braucht knapp zwölf Jahre für eine Runde um die Sonne und steht damit
      rund ein Jahr lang in jedem Tierkreiszeichen. Diese Regelmäßigkeit hat ganze
      Kalender geprägt: Die chinesische Astronomie nannte ihn Suìxīng, den Jahresstern,
      und teilte den Himmel in zwölf Jupiter-Stationen — daraus wurde der Zwölf-Tiere-Zyklus.
      In der abendländischen Astrologie ist die Rückkehr Jupiters an seinen Geburtsort
      alle zwölf Jahre eine der wenigen Wiederkehrungen, die ein Mensch mehrfach erlebt.`,
    fakten: [
      'Siderische Umlaufzeit 11,862 Jahre — rund 361 Tage je Tierkreiszeichen',
      'Der chinesische Zwölfjahreszyklus geht auf den Jahresstern Suìxīng zurück',
      'Sechs Jupiter-Umläufe entsprechen fast genau fünf Jupiter-Saturn-Konjunktionen',
      'Ein Mensch erlebt seine Jupiter-Rückkehr mit 12, 24, 36, 48, 60, 72 Jahren'
    ],
    hinweis: `Die Zeichenwechsel sind Mittelwerte. Jupiter läuft jedes Jahr für einige
      Monate rückläufig und überquert eine Zeichengrenze dann bis zu dreimal — die
      wirklichen Eintrittsdaten weichen um Wochen ab.`,
    segmente: ZEICHEN.map(z => ({ name: z, laenge: 11.8618 / 12, art: 'auf', anzeige: 'rund 1 Jahr' })),
    termine: (j) => reihe(2022.54, 11.8618 / 12, j, 4,
      k => `Jupiter tritt in ${ZEICHEN[((k % 12) + 12) % 12]}`),
    jetztText: 'Jupiter steht im Löwen — gut vier Jahre nach seinem Eintritt in den Widder.'
  },

  {
    name: 'Venus-Zyklus',
    dauer: '8 Jahre',
    untertitel: 'Die Rose der Venus — fünf Blätter in acht Jahren',
    quelle: 'synodische Periode 583,92 Tage; Venustafeln des Dresdner Kodex',
    radius: 2.27,
    farbe: '#6683d8',
    einheit: 'Jahre',
    anker: 2025.22,
    periode: 7.9933,
    text: `Alle 584 Tage schiebt sich Venus zwischen Erde und Sonne. Fünf solcher Umläufe
      dauern fast genau acht Jahre — deshalb kehrt Venus alle acht Jahre an dieselbe
      Stelle des Himmels zurück, und wenn man ihre fünf Begegnungspunkte verbindet,
      entsteht ein Fünfstern: die Rose der Venus. Die Maya haben diesen Takt in den
      Venustafeln des Dresdner Kodex über Jahrhunderte fortgeschrieben, und in Babylon
      wurde Inanna als Morgenstern und Abendstern an genau diesem Rhythmus abgelesen.`,
    fakten: [
      'Synodische Periode 583,92 Tage — fünf davon sind 2.919,6 Tage',
      'Acht Jahre sind 2.921,9 Tage: die Rose verschiebt sich um gut zwei Tage je Runde',
      '13 Venusumläufe entsprechen 8 Erdjahren',
      'Die Venustafeln des Dresdner Kodex rechnen mit 584 Tagen je Venusrunde',
      'Morgenstern und Abendstern sind derselbe Planet — die Babylonier wussten es',
      'Rund 3.200 Venus-Rosen füllen einen Yuga-Zyklus'
    ],
    segmente: [
      { name: 'Erstes Blatt', laenge: 1.5987, art: 'hoch' },
      { name: 'Zweites Blatt', laenge: 1.5987, art: 'auf' },
      { name: 'Drittes Blatt', laenge: 1.5987, art: 'hoch' },
      { name: 'Viertes Blatt', laenge: 1.5987, art: 'auf' },
      { name: 'Fünftes Blatt', laenge: 1.5987, art: 'hoch' }
    ],
    termine: (j) => reihe(2025.22, 7.9933 / 5, j, 5, () => 'Untere Konjunktion — Venus zwischen Erde und Sonne'),
    jetztText: 'Im ersten Blatt der laufenden Rose, gerechnet ab der Konjunktion vom März 2025.'
  },

  {
    name: 'Das Jahr',
    dauer: '365,2422 Tage',
    untertitel: 'Ein Umlauf der Erde um die Sonne',
    quelle: 'tropisches Jahr',
    radius: 2.05,
    farbe: '#5696d9',
    einheit: 'Tage',
    anker: 2000.216,
    periode: 1,
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
    jetztText: 'Die Marke steht auf dem eingestellten Tag.'
  },

  {
    name: 'Der Mondmonat',
    dauer: '29,53 Tage',
    untertitel: 'Von Neumond zu Neumond',
    quelle: 'synodischer Monat',
    radius: 1.80,
    farbe: '#48a8d2',
    einheit: 'Tage',
    anker: 2000.01851,
    periode: 29.530588853 / TAG_IM_JAHR,
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
    hinweis: `Steht der Zeitschieber weit von heute entfernt, ist die angezeigte Phase
      eine reine Fortschreibung des heutigen Rhythmus. Weil sich der Mond langsam
      entfernt und die Erde bremst, weicht die wirkliche Phase über Jahrtausende ab.`,
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
    jetztText: 'Die Marke steht auf der Mondphase des eingestellten Tages.'
  },

  {
    name: 'Der Tag',
    dauer: '23 h 56 min 4 s',
    untertitel: 'Eine Drehung der Erde',
    quelle: 'siderischer Tag',
    radius: 1.52,
    farbe: '#3fb8b2',
    einheit: 'Stunden',
    anker: 2000.0,
    periode: 1 / TAG_IM_JAHR,
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
    jetztText: 'Die Marke läuft mit der Uhr mit.'
  },

  {
    name: 'Der Atemzug',
    dauer: 'rund 4 Sekunden',
    untertitel: 'Zwölf bis achtzehn Mal in der Minute',
    quelle: 'Ruheatmung eines Erwachsenen',
    radius: 1.18,
    farbe: '#5ec98b',
    einheit: 'Sekunden',
    echtzeit: 4,
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
    jetztText: 'Die Schale weitet und senkt sich in Echtzeit — der Zeitschieber gilt hier nicht.'
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
    echtzeit: 0.9,
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
    jetztText: 'Der Kern schlägt in Echtzeit — der Zeitschieber gilt hier nicht.'
  }
];
