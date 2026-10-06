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

// Wie hell ist der Mensch im Kern? 1 = Goldenes Zeitalter, 0 = erloschen.
// Zwischen den Yugas wird linear überblendet, die Sandhis halten den Stand.
export function yugaLicht(jahr) {
  const y = SCHICHTEN[0];
  const a = anteil(y, jahr) * 25800;
  let lauf = 0, letztes = 1;
  for (const seg of y.segmente) {
    if (a < lauf + seg.laenge) {
      if (!seg.licht) return letztes;
      const f = (a - lauf) / seg.laenge;
      return seg.licht[0] + (seg.licht[1] - seg.licht[0]) * f;
    }
    lauf += seg.laenge;
    if (seg.licht) letztes = seg.licht[1];
  }
  return letztes;
}

// Wie der Zustand heißt, in dem der Mensch gerade steht
export function menschZustand(licht) {
  if (licht >= 0.92) return 'strahlend — das Goldene Zeitalter';
  if (licht >= 0.68) return 'licht, aber schon zurückgenommen';
  if (licht >= 0.42) return 'stofflich geworden, das Leuchten zieht sich zurück';
  if (licht >= 0.18) return 'verdunkelt, das Licht sammelt sich im Herzen';
  return 'ausgedörrt und erloschen — nur das Herz glimmt noch';
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
    farbe: '#9b5fd0',
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
      'Die 25.800 Jahre sind astronomisch belegt — die Yuga-Zuordnung ist Misras These',
      'Ovid erzählt dieselbe Abfolge: Gold, Silber, Erz, Eisen — und beide Katastrophen',
      '432.000 Jahre: die babylonischen Könige vor der Flut und das Kali Yuga tragen dieselbe Zahl'
    ],
    vergleiche: [{
      titel: 'Ovid, Metamorphosen',
      quelle: 'Buch I, 89–150 und I, 253–415; Buch II, 1–400 (8 n. Chr.)',
      einleitung: `Ovid schreibt achtzehn Jahrhunderte vor Misra dieselbe Folge nieder —
        vier absteigende Weltalter, benannt nach denselben vier Metallen, und danach
        beide Katastrophen: erst die Flut, dann der Weltenbrand.`,
      zeilen: [
        ['Satya', 'Goldenes Zeitalter', 'aurea aetas'],
        ['Treta', 'Silbernes Zeitalter', 'argentea'],
        ['Dwapara', 'Ehernes Zeitalter', 'aenea'],
        ['Kali', 'Eisernes Zeitalter', 'ferrea'],
        ['Kataklysmos', 'Deukalions Flut', 'I, 253–415'],
        ['Ekpyrosis', 'Phaethons Fahrt', 'II, 1–400']
      ],
      nachsatz: `Zwei Unterschiede bleiben: Ovid nennt keine Jahreszahlen, und bei ihm
        geht es nur abwärts — der aufsteigende Bogen fehlt. Seine Vorlage, Hesiods
        „Werke und Tage“, kennt sogar fünf Geschlechter: zwischen Erz und Eisen steht
        dort noch das der Heroen. Ovid lässt es weg und kommt damit auf genau vier —
        dieselbe Zahl wie die Yugas.`
    },
    {
      titel: 'Hesiod, Werke und Tage',
      quelle: 'Verse 106–201, um 700 v. Chr. — die älteste Fassung der Weltalter',
      einleitung: `Ovids Vorlage, siebenhundert Jahre älter. Hesiod zählt fünf
        Geschlechter statt vier: zwischen Erz und Eisen schiebt er das Geschlecht der
        Heroen ein, das aus der Metallreihe herausfällt.`,
      zeilen: [
        ['Satya', 'Goldenes Geschlecht', '109–126'],
        ['Treta', 'Silbernes Geschlecht', '127–142'],
        ['Dwapara', 'Ehernes Geschlecht', '143–155'],
        ['—', 'Geschlecht der Heroen', '156–173'],
        ['Kali', 'Eisernes Geschlecht', '174–201']
      ],
      nachsatz: `Das Heldengeschlecht hat in keiner Yuga-Stufe eine Entsprechung — es
        ist besser und gerechter als das eherne vor ihm und bricht damit den Abstieg.
        Erst Ovid streicht es und erhält die glatte Viererreihe. Katastrophen zwischen
        den Zeitaltern kennt Hesiod nicht; wohl aber einen Hoffnungsschimmer: er wünscht
        sich, später geboren zu sein — als könnte nach dem Eisen etwas anderes kommen.`
    },
    {
      titel: 'Mesoamerika: Maya und Azteken',
      quelle: 'Popol Vuh der Kʼicheʼ-Maya; Leyenda de los Soles der Nahua; Lange Zählung',
      einleitung: `Jenseits des Atlantiks dieselbe Grundfigur: nicht eine Schöpfung,
        sondern eine Reihe von Welten, von denen jede untergeht. Und auch hier stehen
        Feuer und Flut unter den Untergängen.`,
      zeilen: [
        ['Popol Vuh', 'die jetzige ist die vierte Welt', ''],
        ['2. Welt', 'durch die Flut vernichtet', ''],
        ['3. Welt', 'durch Feuer vernichtet', ''],
        ['3. Sonne', 'Regen aus Feuer — Tlaloc', 'Azteken'],
        ['4. Sonne', 'die große Flut — Chalchiuhtlicue', 'Azteken'],
        ['Großer Zyklus', '13 Baktun = 5.125 Jahre', 'Lange Zählung'],
        ['Beginn', '11. August 3114 v. Chr.', ''],
        ['Ende', '21. Dezember 2012', '']
      ],
      nachsatz: `Eine Zahl fällt auf: Fünf Große Zyklen der Langen Zählung ergeben
        25.627 Jahre und kommen damit der Präzession von rund 25.800 Jahren auf
        0,7 Prozent nahe. Das ist eine moderne Beobachtung, keine Maya-Lehre — in den
        Inschriften steht nichts davon. Und der Aufbau ist ein anderer: kein Abstieg
        durch Metalle, sondern abgeschlossene Welten, die enden und ersetzt werden.
        Bemerkenswert bleibt, dass drei Überlieferungen unabhängig voneinander auf
        dieselben zwei Untergangsarten kommen — Wasser und Feuer — und dass das Ende
        des 13. Baktun 2012 und Misras Ende des Kali Yuga 2025 nur dreizehn Jahre
        auseinanderliegen.`
    },
    {
      titel: 'Babylon: Berossos und die Könige vor der Flut',
      quelle: 'Sumerische Königsliste (um 2100 v. Chr.); Berossos, Babyloniaka (um 290 v. Chr.), überliefert bei Seneca, Naturales quaestiones III, 29',
      einleitung: `Hier wird es auffällig. Babylon kennt beides — eine Urzeit vor der Flut
        mit unmenschlich langen Regierungen, und eine astronomische Lehre, nach der die
        Welt abwechselnd durch Feuer und durch Wasser untergeht.`,
      zeilen: [
        ['Vor der Flut', 'zehn Könige, 432.000 Jahre', 'Berossos'],
        ['', 'acht Könige, 241.200 Jahre', 'Königsliste'],
        ['Die Flut', 'danach beginnt das Königtum neu', ''],
        ['danach', 'Regierungen von menschlichem Maß', ''],
        ['Weltenbrand', 'wenn alle Planeten im Krebs stehen', 'Seneca III, 29'],
        ['Sintflut', 'wenn alle Planeten im Steinbock stehen', 'Seneca III, 29']
      ],
      nachsatz: `Zwei Dinge springen ins Auge. Erstens die Zahl: Die 432.000 Jahre der
        zehn Könige vor der Flut sind genau die Länge des Kali Yuga in der klassischen
        indischen Rechnung. Zweitens die Lehre bei Seneca — Berossos sagt den Weltenbrand
        für eine Planetenkonjunktion im Krebs voraus und die Flut für eine im Steinbock.
        Das ist Ekpyrosis und Kataklysmos als astronomische Lehre, achtzehn Jahrhunderte
        vor Misra. Nüchtern betrachtet: 432.000 ist 120 × 3.600, und 3.600 ist die
        Grundzahl des babylonischen Sechzigersystems. Die Zahl kann aus derselben
        Rechenkultur stammen statt aus einer gemeinsamen Überlieferung — ein Weg von
        Babylon nach Indien ist über die hellenistische Astronomie aber belegbar.`
    },
    {
      titel: 'Ägypten: Zep Tepi und die Götterdynastien',
      quelle: 'Turiner Königspapyrus (13. Jh. v. Chr.); Manetho, Aigyptiaka (3. Jh. v. Chr.)',
      einleitung: `Ägypten kennt keine Metallalter, aber dieselbe Grundfigur: eine Erste
        Zeit, in der die Götter selbst regierten, danach Halbgötter, dann erst Menschen —
        und eine Ordnung, die seither beständig gegen den Verfall verteidigt werden muss.`,
      zeilen: [
        ['Zep Tepi', 'die Erste Zeit, die Götter regieren selbst', ''],
        ['danach', 'Halbgötter und die Horusgefolgschaft', 'Turiner Papyrus'],
        ['dann', 'die menschlichen Pharaonen', ''],
        ['Maat', 'die Ordnung, immer wieder herzustellen', ''],
        ['Isfet', 'die Unordnung, beständig vordringend', ''],
        ['Sothis-Zyklus', '1.461 Jahre', 'Kalender']
      ],
      nachsatz: `Der Turiner Königspapyrus führt vor den menschlichen Königen ein Register
        der Götter — Ägypten datierte seine Geschichte also ausdrücklich in eine Zeit
        zurück, in der keine Menschen herrschten. Was fehlt, ist die Einteilung in gleich
        lange Zeitalter und jede Zahl, die sich mit den Yugas vergleichen ließe. Der
        einzige große Zyklus, den Ägypten wirklich rechnete, ist der Sothis-Zyklus von
        1.461 Jahren, nach dem der Frühaufgang des Sirius wieder auf denselben Kalendertag
        fällt. Er misst den Kalender, nicht den Verfall der Welt.`
    },
    {
      titel: 'Anden: Pachakuti und die fünf Menschengeschlechter',
      quelle: 'Felipe Guamán Poma de Ayala, Nueva corónica y buen gobierno (1615)',
      einleitung: `Südamerika zählt fünf Zeitalter wie Hesiod — und hat ein eigenes Wort
        für den Umbruch dazwischen: pachakuti, die Umwälzung von Raum und Zeit.`,
      zeilen: [
        ['1.', 'Wari Wira Qucha Runa', ''],
        ['2.', 'Wari Runa', ''],
        ['3.', 'Purun Runa', ''],
        ['4.', 'Auca Runa', ''],
        ['5.', 'Inca Runa', 'die Zeit der Inka'],
        ['Pachakuti', 'rund 500 Jahre je Umbruch', '']
      ],
      nachsatz: `Pachakuti heißt wörtlich „Umkehrung der Welt und der Zeit“. Am Ende jedes
        Zyklus steht eine Katastrophe, zwei Pachakuti bilden ein Großes Jahr. In der
        Struktur trifft sich das mit der Yuga-Figur — Zeitalter, durch Umbrüche getrennt —,
        in den Zahlen nicht: 500 Jahre gegen 2.700.`
    },
    {
      titel: 'Südlich der Sahara: ein Befund ohne Entsprechung',
      quelle: 'Dogon (Mali), Sigui-Zeremonie; die Griaule-Überlieferung mit Vorbehalt',
      einleitung: `Hier fällt das Ergebnis anders aus, und das gehört genauso dazu:
        Außerhalb Ägyptens findet sich in Afrika kein absteigendes Weltalterschema.`,
      zeilen: [
        ['Dogon', 'Sigui alle 60 Jahre', 'Erneuerung'],
        ['zuletzt', '1967 bis 1973', ''],
        ['nächste', '2032', ''],
        ['Richtung', 'Erneuerung statt Verfall', '']
      ],
      nachsatz: `Die Dogon begehen alle sechzig Jahre die Sigui, eine Zeremonie, die sich
        über Jahre hinzieht und die Erneuerung des Kosmos darstellt. Das ist ein echter
        Zyklus, aber kein Weltalterschema: Es geht nicht abwärts, sondern immer wieder von
        vorn. Die oft zitierte Verbindung zu Sirius B gilt heute als Fehldeutung; die
        sechzig Jahre sind als Menschenleben gemeint, damit jeder die Sigui einmal erlebt.
        Verbreitet sind südlich der Sahara dagegen Flutgeschichten und die Vorstellung
        einer Urzeit, in der Himmel und Erde noch nahe beieinanderlagen — Bausteine
        derselben Figur, aber nicht zu vier Zeitaltern geordnet.`
    },
    {
      titel: 'Germanen: Ragnarök und die goldenen Spielsteine',
      quelle: 'Völuspá (Lieder-Edda); Snorri Sturluson, Gylfaginning (um 1220)',
      einleitung: `Von allen hier verglichenen Überlieferungen kommt diese der Yuga-Figur
        am nächsten — weil sie als einzige neben Indien den Wiederaufstieg kennt.`,
      zeilen: [
        ['Am Anfang', 'die Asen spielen mit goldenen Steinen auf Idavoll', 'Völuspá 8'],
        ['Abstieg', 'Beilzeit, Schwertzeit, Windzeit, Wolfszeit', 'Völuspá 45'],
        ['Fimbulwinter', 'drei Winter ohne Sommer dazwischen', ''],
        ['Ragnarök', 'Surts Feuer verbrennt die Welt', ''],
        ['', 'die Erde sinkt ins Meer', ''],
        ['Danach', 'die Erde steigt grün wieder auf', 'Völuspá 59'],
        ['', 'die goldenen Spielsteine liegen wieder im Gras', 'Völuspá 61'],
        ['Überlebende', 'Lif und Lifthrasir', '']
      ],
      nachsatz: `Hier stimmt fast alles: ein goldener Anfang, ein moralischer Zerfall, in
        dem Brüder einander erschlagen, beide Untergangsarten — Surts Feuer und das
        Versinken im Meer — und danach eine neue grüne Erde, auf der die Überlebenden die
        goldenen Spielsteine der Anfangszeit wiederfinden. Zwei Menschen, Lif und
        Lifthrasir, überdauern und bevölkern sie neu. Was fehlt, sind Zahlen: Die Edda
        nennt keine Jahre. Der Fimbulwinter hat womöglich einen realen Kern — der
        Staubschleier von 536 traf Skandinavien hart, und Gräslund und Price halten ihn
        für den Ursprung des Motivs.`
    },
    {
      titel: 'China: der Yuan und der Abstieg vom Dao',
      quelle: 'Shao Yong, Huangji Jingshi (11. Jh.); Liji, Kapitel Liyun; Laozi, Daodejing 18 und 38',
      einleitung: `China rechnet groß, aber anders. Shao Yong legt im 11. Jahrhundert einen
        kosmischen Zyklus fest, in dem die Welt entsteht, blüht, verfällt und vergeht —
        und seine Zahlen führen auf dieselbe Reihe wie in Indien.`,
      zeilen: [
        ['1 Yuan', '129.600 Jahre', 'Shao Yong'],
        ['= 12 Hui', 'je 10.800 Jahre', ''],
        ['= 360 Yun', 'je 360 Jahre', ''],
        ['= 4.320 Shi', 'je 30 Jahre', ''],
        ['Datong', 'die Große Einheit, als die Welt allen gehörte', 'Liji'],
        ['Xiaokang', 'der Kleine Wohlstand, jeder für die eigene Familie', 'Liji'],
        ['Sechzigerzyklus', '10 Stämme × 12 Zweige', 'Kalender']
      ],
      nachsatz: `Die Zahl 4.320 fällt auf: So viele Generationen bilden einen Yuan — und
        4.320.000 Jahre misst das indische Mahayuga. Beide Systeme rechnen mit 60 und 360
        als Grundzahlen; das erklärt die Nähe wahrscheinlich ohne Entlehnung. Der Verfall
        selbst steht im Liji: Einst herrschte Datong, die Große Einheit, als die Welt
        allen gehörte; darauf folgte Xiaokang, als jeder nur noch für die eigene Familie
        sorgte. Laozi sagt es knapper: Als das große Dao verfiel, entstanden Menschlichkeit
        und Pflicht. Aus Indien kam später noch das buddhistische Mofa dazu, das Zeitalter
        des verfallenden Dharma. Was fehlt, sind vier benannte Weltalter — der chinesische
        Blick geht im Zweifel auf den Dynastiezyklus, nicht auf das Weltalter.`
    },
    {
      titel: 'Etrusker: die zehn Saecula',
      quelle: 'Etrusca disciplina, Libri fatales; Censorinus, De die natali 17 (238 n. Chr.)',
      einleitung: `Die Etrusker maßen die Zeit nicht in gleichen Abschnitten, sondern am
        Menschenleben — und wussten, dass ihrem Volk nur zehn davon zugeteilt waren.`,
      zeilen: [
        ['Ein Saeculum', 'das längste Leben der bei Beginn Geborenen', ''],
        ['Zugeteilt', 'zehn Saecula, dann ist das Volk vorbei', 'Libri fatales'],
        ['Erkennbar', 'an Vorzeichen, nicht am Kalender', ''],
        ['44 v. Chr.', 'ein Komet kündigt das zehnte an', 'Censorinus 17']
      ],
      nachsatz: `Das ist die unheimlichste Fassung: kein Rad, das sich dreht, sondern eine
        gezählte Frist. Als 44 v. Chr. nach Caesars Tod der Komet erschien, trat der
        Haruspex Vulcatius öffentlich auf und erklärte, dieser Komet zeige das Ende des
        neunten und den Beginn des zehnten — des letzten — etruskischen Saeculum an. Weil
        er damit gegen den Willen der Götter ein Geheimnis preisgegeben habe, werde er auf
        der Stelle sterben; und noch während der Rede fiel er tot um. Rom übernahm das
        Saeculum als Maß, aber ohne die Frist, und Vergil drehte es in der vierten Ekloge
        ins Gegenteil: „magnus ab integro saeclorum nascitur ordo“ — die große Ordnung der
        Zeitalter wird neu geboren, die Jungfrau kehrt zurück, Saturns Reich beginnt
        wieder. Derselbe Satz steht in dieser Kugel beim aufsteigenden Satya Yuga.`
    },
    {
      titel: 'Kelten: Feuer und Wasser bei den Druiden',
      quelle: 'Strabon, Geographika IV, 4, 4; Kalender von Coligny (2. Jh.); Lebor Gabála Érenn (11. Jh.)',
      einleitung: `Die Kelten haben nichts aufgeschrieben — die Druiden lernten zwanzig
        Jahre lang auswendig und misstrauten der Schrift. Was wir haben, steht bei
        römischen Beobachtern und in irischen Handschriften, die ein Jahrtausend jünger
        sind. Umso bemerkenswerter ist, was Strabon notiert.`,
      zeilen: [
        ['Strabon', 'Seelen und Weltall sind unzerstörbar', 'IV, 4, 4'],
        ['', 'doch zuweilen gewinnen Feuer und Wasser', ''],
        ['Coligny', 'Fünfjahreszyklus aus 62 Monaten', '2. Jh.'],
        ['Lebor Gabála', 'sechs Landnahmen Irlands', '11. Jh.'],
        ['1. Landnahme', 'Cessair — geht in der Sintflut unter', ''],
        ['2.', 'Partholón — stirbt an der Pest', ''],
        ['5.', 'Tuatha Dé Danann — das Göttergeschlecht', '']
      ],
      nachsatz: `Der Satz bei Strabon ist der Fund: „Nicht nur die Druiden, auch andere
        sagen, dass die Seelen der Menschen und das Weltall unzerstörbar sind, obwohl
        zuweilen Feuer und Wasser die Oberhand gewinnen werden.“ Dasselbe Paar —
        Ekpyrosis und Kataklysmos — aus keltischem Mund, aufgeschrieben um das Jahr 20.
        Ob es druidische Lehre ist oder Strabons stoische Brille, lässt sich nicht
        entscheiden: Die Stoiker lehrten genau das. Das Lebor Gabála ordnet die irische
        Vorgeschichte in sechs Landnahmen, deren erste in der Sintflut untergeht und
        deren fünfte das Göttergeschlecht der Tuatha Dé Danann ist, das den Menschen
        voranging — dieselbe Figur wie in Ägypten. Nur ist es eine christliche Synthese
        des 11. Jahrhunderts, in die biblische Chronologie eingepasst. Zahlen für
        Weltalter gibt es nirgends.`
    },
    {
      titel: 'Slawen: ein zweiter Befund ohne Entsprechung',
      quelle: 'Nestorchronik und christliche Polemiken; Ivanov und Toporov (1974); byzantinische Weltära',
      einleitung: `Wie südlich der Sahara: Hier gibt es kein Weltalterschema — und bei
        kaum einer anderen Überlieferung ist so viel im Umlauf, das nachweislich
        erfunden ist.`,
      zeilen: [
        ['Weltbild', 'Weltenbaum mit drei Ebenen', 'räumlich'],
        ['Krone', 'Himmel und himmlische Götter', ''],
        ['Stamm', 'die Welt der Sterblichen', ''],
        ['Wurzeln', 'Unterwelt und Totenreich', ''],
        ['Weltära', '5508 Jahre von der Schöpfung bis Christus', 'byzantinisch'],
        ['bis 1700', 'in Russland in Gebrauch', '']
      ],
      nachsatz: `Die slawische Kosmologie ordnet den Raum, nicht die Zeit: ein Weltenbaum
        mit dem Himmel in der Krone, der Menschenwelt im Stamm und dem Totenreich in den
        Wurzeln. Starke Jahreszyklen gibt es — Koliada zur Winter-, Kupala zur
        Sommersonnenwende —, aber keine Folge von Weltaltern. Zwei Warnungen gehören
        dazu. Das „Buch des Veles“, das angeblich slawische Weltalter überliefert, ist
        eine Fälschung des 20. Jahrhunderts; seine Sprache ist ein Gemisch moderner
        slawischer Formen ohne regelmäßige Grammatik. Und der oft erzählte kosmische
        Zweikampf zwischen Perun und Veles ist keine Quelle, sondern eine Rekonstruktion
        von Ivanov und Toporov aus dem Jahr 1974; die Deutung des Veles als Schlange gilt
        inzwischen als widerlegt. Die einzige Weltära, die slawische Länder wirklich
        gerechnet haben, ist die byzantinische: 5508 Jahre von der Schöpfung bis Christi
        Geburt. Peter I. schaffte sie 1700 ab — aus dem Jahr 7208 wurde das Jahr 1700.`
    },
    {
      titel: 'Nordamerika: vier Welten und der Büffel auf vier Beinen',
      quelle: 'Hopi-Überlieferung (mit Vorbehalt); Diné Bahaneʼ; Lakota-Überlieferung der Weißen Büffelkalbfrau',
      einleitung: `Hier steht die auffälligste Einzelheit des ganzen Vergleichs — ein Bild,
        das bei den Lakota und in Indien fast gleich lautet.`,
      zeilen: [
        ['Hopi', 'die jetzige ist die vierte Welt', ''],
        ['1. Welt', 'durch Feuer vernichtet', ''],
        ['2. Welt', 'durch Eis und Kälte', ''],
        ['3. Welt', 'durch die Flut', ''],
        ['Diné', 'Aufstieg durch vier Welten', 'Diné Bahaneʼ'],
        ['Lakota', 'der Büffel steht auf vier Beinen', ''],
        ['', 'je Zeitalter verliert er ein Bein', ''],
        ['', 'je Jahr ein Haar', '']
      ],
      nachsatz: `Die Hopi zählen vier Welten; die ersten drei vergingen durch Feuer, Eis
        und Flut, und die vierte endet im Feuer, wenn Koyaanisqatsi — das Leben aus dem
        Gleichgewicht — anhält. Dazu gehört ein Vorbehalt: Die bekannte Fassung stammt aus
        Frank Waters’ „Book of the Hopi“ (1963), und die Forschung hält die dortige Deutung
        der Prophezeiungen für stark von der Gegenkultur der sechziger Jahre gefärbt; auch
        war die Veröffentlichung geschützten Zeremonialwissens unter den Hopi selbst
        umstritten. Das Bild der Lakota dagegen steht für sich: Der Büffel trägt die Welt
        auf vier Beinen, verliert in jedem Zeitalter ein Bein und in jedem Jahr ein Haar;
        fällt das letzte Bein, kehrt die Weiße Büffelkalbfrau wieder. In Indien steht genau
        dasselbe Bild — der Stier des Dharma steht im Satya Yuga auf vier Beinen, im Treta
        auf drei, im Dwapara auf zwei und im Kali auf einem. Vier Zeitalter, ein
        vierbeiniges Rind, je ein Bein weniger. Eine Verbindung ist nicht denkbar, und die
        Übereinstimmung bleibt trotzdem die engste des ganzen Vergleichs.`
    },
    {
      titel: 'Australien: kein Zeitalter, aber das längste Gedächtnis',
      quelle: 'W. E. H. Stanner zum Begriff der Traumzeit; Patrick Nunn und Nicholas Reid (2016)',
      einleitung: `Hier fällt die Frage selbst weg — und dafür steht etwas anderes da, das
        in diesem Vergleich einzig ist.`,
      zeilen: [
        ['Traumzeit', 'kein Damals, sondern „everywhen“', 'Stanner'],
        ['Richtung', 'keine, auch kein Verfall', ''],
        ['Erneuerung', 'durch Zeremonie, nicht durch Umbruch', ''],
        ['Küstenfluten', 'an der ganzen Küste erzählt', 'Nunn & Reid'],
        ['datierbar auf', '13.000 bis 7.000 Jahre vor heute', ''],
        ['bisher angenommen', 'mündliche Überlieferung trägt rund 800 Jahre', '']
      ],
      nachsatz: `Die Traumzeit ist kein vergangenes Zeitalter. W. E. H. Stanner prägte
        dafür das Wort „everywhen“: Sie ist nicht damals, sondern immer, und wird in der
        Zeremonie nicht erinnert, sondern gegenwärtig gehalten. Damit fehlt die Grundfigur
        dieses ganzen Vergleichs — es gibt keinen Abstieg, weil es keine Reihe gibt.
        Dafür steht hier etwas, das keine andere Überlieferung hat: Patrick Nunn und
        Nicholas Reid haben 2016 gezeigt, dass entlang der gesamten australischen Küste
        Geschichten von Land erzählt werden, das das Meer verschlang — und dass diese
        Geschichten sich auf den nacheiszeitlichen Meeresspiegelanstieg zwischen etwa
        13.000 und 7.000 Jahren vor heute beziehen lassen. Bis dahin galt, dass mündliche
        Überlieferung höchstens achthundert Jahre trägt. Wenn es stimmt, ist hier nicht
        die Figur eines Weltalters überliefert, sondern die Katastrophe selbst.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Indien: der Kalpa der Siddhantas',
      quelle: 'Surya Siddhanta; über Brahmaguptas Brahmasphutasiddhanta als Zij as-Sindhind nach Bagdad, um 770',
      einleitung: `Die äußerste Schale dieser Kugel zeigt Misras rekonstruierten Zyklus von
        25.800 Jahren. Die klassische indische Astronomie rechnet ganz anders — in Zahlen,
        neben denen die Präzession verschwindet.`,
      zeilen: [
        ['1 Mahayuga', '4.320.000 Jahre', '12.000 Götterjahre'],
        ['Satya', '1.728.000 Jahre', '4 Teile'],
        ['Treta', '1.296.000 Jahre', '3 Teile'],
        ['Dwapara', '864.000 Jahre', '2 Teile'],
        ['Kali', '432.000 Jahre', '1 Teil'],
        ['1 Kalpa', '1.000 Mahayugas', '4,32 Milliarden Jahre'],
        ['', 'ein Tag im Leben Brahmas', ''],
        ['Kali Yuga beginnt', '18. Februar 3102 v. Chr.', 'um Mitternacht']
      ],
      nachsatz: `Hier stehen die Yugas im Verhältnis 4:3:2:1 — jedes Zeitalter ein Viertel
        kürzer als das vorige. Ein Götterjahr zählt 360 Menschenjahre, zwölftausend davon
        ergeben die 4.320.000. Tausend Mahayugas sind ein Kalpa, ein Tag im Leben Brahmas:
        4,32 Milliarden Jahre — dieselbe Größenordnung wie das Alter der Erde, das die
        Geologie mit 4,54 Milliarden angibt. Und darin steckt die Zahl, die in Babylon
        wiederkehrt: Das Kali Yuga misst 432.000 Jahre, genau so viel wie die
        Regierungszeit der zehn Könige vor der Flut bei Berossos. Misras 25.800 Jahre sind
        eine Rekonstruktion gegen diese Überlieferung, nicht aus ihr. In den frühen 770er
        Jahren ließ Kalif al-Mansur in Bagdad Brahmaguptas Werke übersetzen: aus dem
        Brahmasphutasiddhanta wurde der Zij as-Sindhind, aus dem Khandakhadyaka der Zij
        al-Arkand. Mit ihnen kamen diese Zahlen — und die indischen Ziffern — in die
        arabische Wissenschaft.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Aryabhata: vier gleiche Viertel',
      quelle: 'Aryabhatiya, 499 n. Chr.',
      einleitung: `Aryabhata rechnet mit derselben Gesamtlänge, teilt sie aber anders — und
        seine Planetenwerte sind so genau, dass man sie heute noch nachrechnen kann.`,
      zeilen: [
        ['1 Mahayuga', '4.320.000 Jahre', 'wie bei den Siddhantas'],
        ['aber geteilt in', 'vier gleiche Viertel', 'je 1.080.000 Jahre'],
        ['Jupiter', '364.224 Umläufe je Mahayuga', '= 11,8608 Jahre'],
        ['Saturn', '146.564 Umläufe je Mahayuga', '= 29,4749 Jahre'],
        ['Kali Yuga beginnt', '3102 v. Chr.', ''],
        ['Aryabhatiya geschrieben', 'im Kali-Jahr 3600', '= 499 n. Chr.']
      ],
      nachsatz: `Der Unterschied ist grundsätzlich: Bei den Siddhantas fallen die Yugas im
        Verhältnis 4:3:2:1 ab, bei Aryabhata sind alle vier gleich lang — je 1.080.000
        Jahre. Der Abstieg steckt dann nicht mehr in der Dauer. Dafür sind seine
        Planetenwerte erstaunlich: Aus 364.224 Jupiter-Umläufen je Mahayuga folgt eine
        Umlaufzeit von 11,8608 Jahren (heute gemessen 11,862), aus 146.564 Saturn-Umläufen
        29,4749 Jahre (heute 29,457). Das Datum seines Buches gibt er selbst an — im
        Kali-Jahr 3600, im Alter von dreiundzwanzig; daraus ergibt sich 499 n. Chr. und
        rückwärts der Beginn des Kali Yuga 3102 v. Chr.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Persien: das Weltjahr von 360.000 Jahren',
      quelle: 'Zij al-Arkand (aus Brahmaguptas Khandakhadyaka, Bagdad um 770); Abu Maʿšar, Kitāb al-ulūf; David Pingree (1968)',
      einleitung: `Aus den indischen Zahlen bauten die persisch-arabischen Astronomen ein
        eigenes Maß — und es ist genau so gewählt, dass Jupiter und Saturn glatt aufgehen.`,
      zeilen: [
        ['1 Weltjahr', '360.000 Jahre', 'ein Zwölftel des Mahayuga'],
        ['Saturn bei Abu Maʿšar', '12.000 Umläufe', 'je 30 Jahre'],
        ['Jupiter bei Abu Maʿšar', '30.000 Umläufe', 'je 12 Jahre'],
        ['Saturn bei Aryabhata', '12.214 Umläufe', 'je 29,47 Jahre'],
        ['Jupiter bei Aryabhata', '30.352 Umläufe', 'je 11,86 Jahre'],
        ['Die Flut', 'Große Konjunktion 3101 v. Chr.', 'Kitāb al-ulūf'],
        ['Weltanfang', 'alle Planeten im Widder', ''],
        ['Weltende', 'alle Planeten in den Fischen', '']
      ],
      nachsatz: `Das Weltjahr ist kein beobachteter Zeitraum, sondern ein konstruierter:
        360.000 Jahre sind genau zwölftausend Saturnumläufe zu dreißig Jahren und
        dreißigtausend Jupiterumläufe zu zwölf Jahren — bei beiden geht die Rechnung glatt
        auf. Rechnet man dagegen mit Aryabhatas genaueren Werten, kommen 12.214 und 30.352
        heraus: nah dran, aber nicht rund. In dieser Spannung zwischen der idealen und der
        gemessenen Zahl steckt die ganze Konstruktion. Abu Maʿšar legte in seinem „Buch der
        Tausende“ die Große Konjunktion aller Planeten auf das Jahr 3101 v. Chr. — und
        erklärte sie zur Sintflut. Das ist derselbe Zeitpunkt, den die indische Astronomie
        als Beginn des Kali Yuga führt, nur anders gedeutet: Was in Indien ein Zeitalter
        eröffnet, wird im Islam und im Christentum zur Flut Noahs. Die Welt, so Abu Maʿšar,
        sei entstanden, als die sieben Planeten im Widder zusammenstanden, und werde enden,
        wenn sie in den Fischen zusammentreten.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Māshāʾallāh: die Geschichte aus Konjunktionen',
      quelle: 'Kitāb fī l-qirānāt wa-l-adyān wa-l-milal (um 800); Gründungshoroskop Bagdads, 762',
      einleitung: `Eine Generation vor Abu Maʿšar legte Māshāʾallāh ibn Atharī, persischer
        Jude in Bagdad, das Verfahren fest, nach dem die ganze spätere
        Konjunktionsastrologie arbeitet.`,
      zeilen: [
        ['Māshāʾallāh', 'um 740 bis 815, Bagdad', ''],
        ['762', 'stellt mit al-Nawbacht das Gründungshoroskop Bagdads', ''],
        ['Sein Buch', 'über Konjunktionen, Religionen und Völker', ''],
        ['Methode', 'Weltgeschichte aus Jupiter-Saturn-Konjunktionen', ''],
        ['alle 20 Jahre', 'eine Große Konjunktion', ''],
        ['rund 200 Jahre', 'dasselbe Trigon', ''],
        ['Trigonwechsel', 'bedeutet den Umbruch', '']
      ],
      nachsatz: `Māshāʾallāh war einer der beiden Astrologen, die 762 den Zeitpunkt für die
        Grundsteinlegung Bagdads wählten — die Stadt wurde nach einem Horoskop gegründet.
        Sein „Buch über Konjunktionen, Religionen und Völker“ ist der erste Versuch, die
        ganze Weltgeschichte aus den Großen Konjunktionen abzuleiten: alle zwanzig Jahre
        eine Konjunktion, rund zweihundert Jahre im selben Trigon, und der Wechsel in ein
        neues Trigon bedeutet den Umbruch von Reichen und Religionen. Abu Maʿšar baute das
        eine Generation später aus. Was in dieser Kugel als Jupiter-Saturn-Schale steht,
        geht auf diese beiden zurück.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Die Fardār und die Planetenjahre',
      quelle: 'Abu Maʿšar zu den Fardār-Perioden; al-Qabīsī und al-Bīrūnī zu den Planetenjahren',
      einleitung: `Neben den Konjunktionen läuft ein zweites Verfahren: Jedem Planeten
        gehört eine Zeitspanne, und diese Spannen werden zu Leitern gestapelt — von
        dreihundertsechzig Jahren bis hinauf zum Weltjahr.`,
      zeilen: [
        ['Fardār-Leiter', '360 Jahre', ''],
        ['', '3.600 Jahre', ''],
        ['', '36.000 Jahre', 'das Große Jahr'],
        ['', '360.000 Jahre', 'das Weltjahr'],
        ['Kleine Jahre', 'Saturn 30 · Jupiter 12 · Mars 15', ''],
        ['', 'Sonne 19 · Venus 8 · Merkur 20 · Mond 25', ''],
        ['Mittlere Jahre', 'Saturn 43,5 · Jupiter 45,5 · Mars 40,5', ''],
        ['', 'Sonne 69,5 · Venus 45 · Merkur 48 · Mond 66,5', ''],
        ['Große Jahre', 'Saturn 57 · Jupiter 79 · Mars 66', ''],
        ['', 'Sonne 120 · Venus 82 · Merkur 76 · Mond 108', '']
      ],
      nachsatz: `Die Leiter ist dezimal gebaut: 360, 3.600, 36.000, 360.000 — vier Stufen
        astrologischer Wirksamkeit, von denen die dritte genau das Große Jahr ist, das
        Hipparch und Ptolemaios für die Präzession ansetzten, und die vierte das persische
        Weltjahr. Im mundanen Gebrauch zählt dabei das Jahr zu 360 Tagen, nicht zu 365.
        Die kleinen Jahre sind keine Erfindung, sondern Umlaufzeiten: Saturn 30 und Jupiter
        12 sind ihre Bahnen, Venus 8 ist die Rose der Venus, und die 19 Jahre der Sonne
        sind der Meton-Zyklus, nach dem Sonnen- und Mondkalender wieder zusammenfallen.
        Vier dieser Zahlen sind in dieser Kugel eigene Schalen. Die mittleren Jahre sind
        das Mittel aus kleinen und großen, die großen die Summe der Grenzen eines Planeten
        über den Tierkreis. Eine vierte Reihe, die „größten Jahre“, geben die Quellen
        widersprüchlich an — für den Mond nennt Lilly 320, Bonatti 420, al-Qabīsī und
        al-Bīrūnī dagegen 520.`
    },
    {
      gruppe: 'rechnung',
      titel: 'Saturn und Mars im Krebs',
      quelle: 'al-Kindī; Abu Maʿšar; Thema Mundi der hellenistischen Astrologie',
      einleitung: `Die kürzeste und zugleich unheimlichste dieser Lehren — und sie trifft
        sich mit Berossos auf denselben Punkt des Himmels.`,
      zeilen: [
        ['Treffen', 'Saturn und Mars im Krebs', ''],
        ['Wiederkehr', 'rund alle 30 Jahre', ''],
        ['al-Kindī', 'zur Dauer der arabischen Herrschaft', 'früheste Erwähnung'],
        ['Abu Maʿšar', 'macht die Lehre bekannt', ''],
        ['Thema Mundi', 'der Krebs steigt auf, bei 15 Grad', 'Geburtsbild der Welt'],
        ['Berossos', 'Weltenbrand bei Konjunktion im Krebs', 'Seneca III, 29']
      ],
      nachsatz: `Saturn und Mars sind in der klassischen Lehre die beiden Übeltäter; treffen
        sie sich ausgerechnet im Krebs, gilt das als Zeichen für Dürre, Krieg und den Sturz
        von Herrschaft. Weil Saturn knapp dreißig Jahre für einen Umlauf braucht, kehrt
        diese Stellung rund alle dreißig Jahre wieder — dieselbe Zahl, die auch als kleines
        Jahr des Saturn in der Tafel darüber steht. Die früheste Erwähnung findet sich bei
        al-Kindī, der damit die Dauer der arabischen Herrschaft zu bestimmen suchte; Abu
        Maʿšar machte sie bekannt. Warum gerade der Krebs? Im Thema Mundi, dem Geburtsbild
        der Welt in der hellenistischen Astrologie, steigt der Krebs auf — er ist der
        Aszendent der Welt selbst. Und Berossos nennt bei Seneca denselben Ort für den
        Weltenbrand: wenn alle Planeten im Krebs zusammentreten. Drei Überlieferungen, ein
        Zeichen.`
    }],
    hinweis: `Die Präzession ist gemessene Astronomie. Die Einteilung in Yugas und die Kopplung
      an das galaktische Zentrum sind Misras Deutung und keine gesicherte Wissenschaft —
      alle tieferen Schichten dieser Kugel dagegen sind messbare Zyklen.`,
    segmente: [
      { name: 'Kataklysmos', laenge: 1200, art: 'katastrophe', licht: [1, 1],
        ovid: { alter: 'Deukalions Flut', stelle: 'Metamorphosen I, 253–415',
          was: `Jupiter ertränkt das eiserne Geschlecht. Nur Deukalion und Pyrrha
            überleben auf dem Parnass und werfen die Gebeine der großen Mutter —
            Steine — hinter sich, aus denen neue Menschen wachsen.` } },
      { name: 'Satya', laenge: 2700, art: 'yuga', zusatz: 'absteigend', licht: [1, 0.75],
        ovid: { alter: 'Goldenes Zeitalter', latein: 'aurea aetas', stelle: 'Metamorphosen I, 89–112',
          was: `Unter Saturns Herrschaft. Kein Gesetz, kein Richter, kein Krieg — die
            Menschen tun das Rechte aus freien Stücken. Ewiger Frühling, die Erde gibt
            ungepflügt, in den Bächen fließen Milch und Nektar.` },
        hesiod: { alter: 'Goldenes Geschlecht', stelle: 'Werke und Tage 109–126',
          was: `Unter Kronos. Sie lebten wie Götter, ohne Mühsal und Kummer, alterten
            nicht und starben wie im Schlaf; die Erde trug von selbst. Nach ihrem Tod
            wurden sie zu wohlwollenden Geistern über der Erde.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zusatz: 'absteigend', licht: [0.75, 0.5],
        ovid: { alter: 'Silbernes Zeitalter', latein: 'argentea', stelle: 'Metamorphosen I, 113–124',
          was: `Jupiter stürzt Saturn und zerbricht den ewigen Frühling in vier
            Jahreszeiten. Zum ersten Mal suchen die Menschen Schutz in Häusern und
            müssen den Acker pflügen.` },
        hesiod: { alter: 'Silbernes Geschlecht', stelle: 'Werke und Tage 127–142',
          was: `Hundert Jahre Kindheit, dann ein kurzes, unbeherrschtes Mannesalter.
            Sie ließen die Altäre leer; Zeus verbarg sie unter der Erde.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zusatz: 'absteigend', licht: [0.5, 0.25],
        ovid: { alter: 'Ehernes Zeitalter', latein: 'aenea', stelle: 'Metamorphosen I, 125–127',
          was: `Schärfer im Sinn und schneller bei den Waffen — aber noch nicht
            ruchlos.` },
        hesiod: { alter: 'Ehernes Geschlecht', stelle: 'Werke und Tage 143–155',
          was: `Aus Eschen gemacht, furchtbar und stark — eherne Waffen, eherne Häuser,
            ehernes Gerät. Sie rieben sich selbst auf und gingen namenlos in den Hades.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Kali', laenge: 2700, art: 'yuga', zusatz: 'absteigend', licht: [0.25, 0],
        ovid: { alter: 'Eisernes Zeitalter', latein: 'ferrea', stelle: 'Metamorphosen I, 127–150',
          was: `Scham, Wahrheit und Treue weichen; an ihre Stelle treten List, Gewalt
            und Habgier. Man sticht in See, teilt den Boden auf, gräbt nach Erz. Als
            letzte der Götter verlässt Astraea, die Gerechtigkeit, die Erde.` },
        hesiod: { alter: 'Eisernes Geschlecht', stelle: 'Werke und Tage 174–201',
          was: `Hesiods eigene Zeit: kein Ende der Mühsal bei Tag, kein Ende der Sorge
            bei Nacht. Zuletzt verlassen Aidos und Nemesis — Scham und Vergeltung — die
            Erde. Hesiod wünscht, er wäre früher gestorben oder später geboren.` } },
      { name: 'Ekpyrosis', laenge: 1200, art: 'katastrophe', licht: [0, 0],
        ovid: { alter: 'Phaethons Fahrt', stelle: 'Metamorphosen II, 1–400',
          was: `Der Sonnenwagen gerät außer Kontrolle und setzt die Erde in Brand.
            Schon vorher erinnert sich Jupiter, es sei vom Schicksal bestimmt, dass
            einst Meer, Land und Himmelsburg brennen werden (I, 256–258).` } },
      { name: 'Kali', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend', licht: [0, 0.25],
        ovid: { alter: 'Eisernes Zeitalter', latein: 'ferrea', stelle: 'Metamorphosen I, 127–150',
          was: `Bei Ovid endet die Reihe hier. Dass es nach dem Eisen wieder aufwärts
            geht, steht nicht bei ihm — das ist der entscheidende Unterschied zum
            Yuga-Zyklus.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Dwapara', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend', licht: [0.25, 0.5],
        ovid: { alter: 'Ehernes Zeitalter', latein: 'aenea', stelle: 'Metamorphosen I, 125–127',
          was: `Dieselbe Stufe, nun aufwärts gelesen: schon wieder Erz statt Eisen.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Treta', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend', licht: [0.5, 0.75],
        ovid: { alter: 'Silbernes Zeitalter', latein: 'argentea', stelle: 'Metamorphosen I, 113–124',
          was: `Die Jahreszeiten mildern sich wieder, das Silber kehrt zurück.` } },
      { name: 'Sandhi', laenge: 300, art: 'sandhi' },
      { name: 'Satya', laenge: 2700, art: 'yuga', zusatz: 'aufsteigend', licht: [0.75, 1],
        ovid: { alter: 'Goldenes Zeitalter', latein: 'aurea aetas', stelle: 'Metamorphosen I, 89–112',
          was: `Saturns Zeit kehrt wieder — was Vergil in der vierten Ekloge der
            Menschheit verheißt: „iam redit et Virgo, redeunt Saturnia regna“.` } }
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
    farbe: '#7b5bca',
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
    farbe: '#5b58c3',
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
    farbe: '#4b66c5',
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
    farbe: '#4a87ce',
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
    farbe: '#4aa8d8',
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
    farbe: '#4baba9',
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
    farbe: '#4cae7a',
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
    farbe: '#6db358',
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
    farbe: '#aebc45',
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
    name: 'Der Tauriden-Schwarm',
    dauer: '3,3 Jahre',
    untertitel: 'Der Umlauf des Kometen Encke',
    quelle: 'Asher & Clube zur 7:2-Resonanz; Clube & Napier, „The Cosmic Winter“',
    radius: 2.09,
    farbe: '#f0c431',
    einheit: 'Jahre',
    anker: 2023.81,
    periode: 3.30,
    text: `Der kürzeste Kometenzyklus, den wir kennen: 2P/Encke braucht nur 3,3 Jahre
      für einen Umlauf. Auf seiner Bahn zieht er eine Spur aus Staub und Brocken hinter
      sich her — die Tauriden, durch die die Erde jedes Jahr von Ende Oktober bis Anfang
      Dezember fliegt. Sieben Umläufe Enckes dauern 23,1 Jahre und damit fast genau so
      lang wie zwei Jupiterjahre. Diese 7:2-Resonanz ballt das Material zu einem
      dichteren Schwarm zusammen, den die Erde nur alle drei bis sieben Jahre trifft.`,
    fakten: [
      'Encke hat mit 3,3 Jahren die kürzeste Umlaufzeit aller bekannten Kometen',
      '7 Umläufe Enckes = 23,1 Jahre ≈ 2 Jupiterjahre = 23,7 Jahre — die 7:2-Resonanz',
      'Verdichtete Schwarmbegegnungen: 1998, 2005, 2015, 2022 — 2032 besonders günstig',
      'Die Tunguska-Explosion von 1908 fiel in die Zeit der Beta-Tauriden',
      'Clube und Napier führen den ganzen Komplex auf einen Riesenkometen zurück, der vor rund 20.000 Jahren zerbrach',
      'Rund 7.800 Encke-Umläufe füllen einen Yuga-Zyklus'
    ],
    hinweis: `Genau auf diesen Schwarm stützt Misra seinen Kataklysmos: wiederkehrende
      Einschläge aus dem Tauriden-Komplex. Der Schwarm ist gemessen, der Zusammenhang
      mit den Katastrophenzeiten des Yuga-Zyklus ist seine These.`,
    segmente: [
      { name: 'Perihel', laenge: 0.4, art: 'hoch', zusatz: 'sonnennah' },
      { name: 'Auswärts', laenge: 1.25, art: 'ab' },
      { name: 'Aphel', laenge: 0.4, art: 'tief', zusatz: 'jenseits des Jupiter' },
      { name: 'Einwärts', laenge: 1.25, art: 'auf' }
    ],
    termine: (j) => {
      const schwaerme = [1988, 1995, 1998, 2005, 2015, 2022, 2032];
      const nah = schwaerme.filter(y => y >= j - 12).slice(0, 4);
      if (!nah.length) return [{ jahr: 1998, grob: true, was: 'Erste gut vermessene Schwarmbegegnung' }];
      return nah.map(y => ({ jahr: y, grob: true, was: y === 2032 ? 'Schwarmbegegnung — besonders günstig' : 'Schwarmbegegnung' }));
    },
    jetztText: 'Encke lief im Oktober 2023 durch sein Perihel; die nächste Annäherung folgt 2027.'
  },

  {
    name: 'Das Jahr',
    dauer: '365,2422 Tage',
    untertitel: 'Ein Umlauf der Erde um die Sonne',
    quelle: 'tropisches Jahr',
    radius: 1.91,
    farbe: '#efa82f',
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
    radius: 1.73,
    farbe: '#ee8d2e',
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
    farbe: '#eb7330',
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
    radius: 1.16,
    farbe: '#e65a35',
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
      'Etwa drei bis vier Herzschläge auf einen Atemzug'
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
    dauer: 'rund 1,2 Sekunden',
    untertitel: 'Der Kern der Zeitkugel',
    quelle: 'ruhiger Puls von etwa 50 Schlägen je Minute',
    radius: 0.68,
    farbe: '#e0423a',
    kern: true,
    einheit: 'Sekunden',
    echtzeit: 1.2,
    text: `Im Innersten schlägt der kleinste Zyklus, den wir unmittelbar spüren — und in
      ihm steht der Mensch. Bei einem ruhigen Puls von fünfzig Schlägen in der Minute sind
      das rund 26 Millionen Schläge in einem Jahr, gut zwei Milliarden in einem langen
      Leben und etwa 680 Milliarden in einem einzigen Umlauf der äußersten Schale. Von
      hier aus gesehen ist die Präzession der Erdachse nur ein sehr langsamer Herzschlag.`,
    fakten: [
      'Bei 50 Schlägen in der Minute rund 72.000 an einem Tag',
      'Der normale Ruhepuls liegt zwischen 50 und 100 Schlägen',
      'Systole 0,4 s, Diastole 0,8 s',
      'Ein Yuga-Zyklus fasst rund 680 Milliarden Herzschläge',
      'Der Sinusknoten taktet ohne jeden Nervenimpuls von außen'
    ],
    segmente: [
      { name: 'Systole', laenge: 0.4, art: 'hoch' },
      { name: 'Diastole', laenge: 0.8, art: 'tief' }
    ],
    jetztText: 'Der Kern schlägt in Echtzeit — der Zeitschieber gilt hier nicht.'
  }
];
