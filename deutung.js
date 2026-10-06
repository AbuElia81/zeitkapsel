/* ------------------------------------------------------------------------
   deutung.js — die Qualität einer Zeit, gelesen aus allen Schalen zugleich.

   Nichts hiervon ist Befund. Es ist eine Deutung: Aus dem Stand der sechzehn
   Zyklen wird ein Bild zusammengesetzt, in der Sprache, in der die Quellen
   selbst von den Zeitaltern sprechen. Gleiche Zeit ergibt immer dieselbe
   Deutung — gewürfelt wird nichts.
   --------------------------------------------------------------------- */
import { SCHICHTEN, anteil, segmentBei, yugaLicht, jahrText } from './zyklen.js?v=66';
import { epocheVon } from './geschichte.js?v=66';

const S = (name) => SCHICHTEN.find(s => s.name === name);
const SONNENSCHALEN = ['Halstatt-Zyklus', 'Eddy-Zyklus', 'Suess-de-Vries-Zyklus',
                       'Gleißberg-Zyklus', 'Hale-Zyklus'];
const ARTWERT = { hoch: 1, auf: 0.66, ab: 0.34, tief: 0 };
const ZEICHEN = ['Widder', 'Stier', 'Zwillingen', 'Krebs', 'Löwen', 'Jungfrau',
                 'Waage', 'Skorpion', 'Schützen', 'Steinbock', 'Wassermann', 'Fischen'];
const SCHWAERME = [1988, 1995, 1998, 2005, 2015, 2022, 2032];

// --------------------------------------------------------------- Messwerte
function stand(jahr) {
  const yuga = SCHICHTEN[0];
  const { seg } = segmentBei(yuga, jahr);
  const licht = yugaLicht(jahr);

  const sonne = SONNENSCHALEN.reduce((summe, name) => {
    const sch = S(name);
    return summe + (ARTWERT[segmentBei(sch, jahr).seg.art] ?? 0.5);
  }, 0) / SONNENSCHALEN.length;

  const jsA = anteil(S('Jupiter-Saturn-Zyklus'), jahr);
  const knA = anteil(S('Mondknoten-Zyklus'), jahr);

  return {
    licht,
    richtung: seg.zusatz === 'aufsteigend' ? 'auf'
            : seg.zusatz === 'absteigend' ? 'ab' : 'wende',
    yuga: seg.name,
    katastrophe: seg.art === 'katastrophe',
    sonne,
    sonnenSeg: segmentBei(S('Suess-de-Vries-Zyklus'), jahr).seg.name,
    halstatt: segmentBei(S('Halstatt-Zyklus'), jahr).seg.name,
    jsPhase: segmentBei(S('Jupiter-Saturn-Zyklus'), jahr).seg.name,
    entfaltung: (1 - Math.cos(jsA * Math.PI * 2)) / 2,
    mondWeite: (1 + Math.cos(knA * Math.PI * 2)) / 2,
    mondSeg: segmentBei(S('Mondknoten-Zyklus'), jahr).seg.name,
    zeichen: ZEICHEN[Math.min(11, Math.floor(anteil(S('Jupiter-Zyklus'), jahr) * 12))],
    blatt: Math.floor(anteil(S('Venus-Zyklus'), jahr) * 5) + 1,
    schwarm: SCHWAERME.reduce((n, y) => Math.abs(y - jahr) < Math.abs(n - jahr) ? y : n, 9e9),
    epoche: epocheVon(jahr)
  };
}

// ----------------------------------------------------------------- Titel
function titelVon(z) {
  if (z.katastrophe) {
    return z.yuga === 'Ekpyrosis'
      ? 'Die Reinigung durch Feuer' : 'Die Reinigung durch Wasser';
  }
  const auf = z.richtung === 'auf';
  if (z.licht >= 0.92) return 'Das stehende Licht';
  if (z.licht >= 0.68) return auf ? 'Die Rückkehr des Goldes' : 'Das erste Nachlassen';
  if (z.licht >= 0.42) return auf ? 'Der Stoff wird wieder durchlässig' : 'Die Welt wird Stoff';
  if (z.licht >= 0.18) return auf ? 'Das Herz gibt sein Licht nach außen' : 'Das Licht zieht sich nach innen';
  return auf ? 'Der erste Funke nach der Nacht' : 'Die ausgedörrte Zeit';
}

// -------------------------------------------------- Die Qualität der Zeit
function qualitaet(z) {
  if (z.katastrophe) {
    return z.yuga === 'Ekpyrosis'
      ? `Dies ist keine Zeit zwischen zwei Zeitaltern, sondern der Umbruch selbst.
         Was gewachsen ist, wird nicht umgebaut, sondern verbrannt. Die Ordnungen,
         die eben noch selbstverständlich waren, halten nicht mehr; sie werden nicht
         widerlegt, sie zerfallen. Wer in einer solchen Zeit steht, erlebt das Ende
         einer Welt als Gegenwart, nicht als Erzählung — und hat keinen Begriff
         dafür, weil der Begriff erst danach gebildet wird.`
      : `Die Wasser steigen und nehmen, was nicht hoch genug lag. Keine Strafe,
         keine Lehre — nur das Zurücksetzen. Was überdauert, überdauert nicht, weil
         es besser war, sondern weil es weiter oben stand. Danach beginnt die Welt
         noch einmal, und niemand weiß mehr genau, was vorher war.`;
  }
  const auf = z.richtung === 'auf';
  if (z.licht >= 0.92) return `Die Zeit steht am höchsten Punkt. Es gibt nichts zu
    erreichen, weil nichts fehlt. Keine Gesetze, weil niemand sie braucht; keine
    Geschichte, weil nichts sich ändern muss. Das ist zugleich die Schwäche dieser
    Zeit: Sie kann nur fallen.`;
  if (z.licht >= 0.68) return auf
    ? `Das Licht kehrt zurück, und es ist noch ungewohnt. Was lange mühsam war,
       beginnt von selbst zu gehen. Die Menschen merken es zuerst daran, dass die
       Streitigkeiten kleiner werden und niemand mehr genau sagen kann, warum.`
    : `Das erste Nachlassen, und kaum jemand bemerkt es. Noch ist alles da, aber es
       kostet jetzt etwas. Zum ersten Mal muss man den Boden bearbeiten, zum ersten
       Mal ein Dach bauen. Was vorher geschenkt war, wird Arbeit.`;
  if (z.licht >= 0.42) return auf
    ? `Der Stoff wird wieder durchlässig. Die Dinge sind noch schwer, aber sie
       antworten. Was lange nur Material war, zeigt wieder Richtung.`
    : `Die Welt wird Stoff. Was vorher durchschien, ist jetzt undurchsichtig
       geworden — und darum beherrschbar. Dies ist die Zeit der Werkzeuge, der
       Mauern und der ersten großen Reiche. Man gewinnt die Macht über die Dinge in
       genau dem Maß, in dem man aufhört, durch sie hindurchzusehen.`;
  if (z.licht >= 0.18) return auf
    ? `Das Herz gibt sein Licht wieder nach außen. Was in der dunklen Zeit nur noch
       im Innersten brannte, greift zurück in die Glieder. Es geht langsam, und
       man erkennt es eher an dem, was aufhört, als an dem, was beginnt.`
    : `Das Licht zieht sich nach innen zurück. Außen wird es härter, lauter, enger;
       was leuchtet, leuchtet nur noch verborgen. Dies ist die Zeit, in der die
       Lehren aufgeschrieben werden, weil man ihnen nicht mehr traut, sie
       weiterzugeben.`;
  return auf
    ? `Der erste Funke nach der Nacht. Noch sieht die Welt aus wie vorher — dieselbe
       Trockenheit, dieselbe Härte —, aber die Richtung hat sich gedreht. Niemand,
       der darin steht, kann das wissen.`
    : `Die ausgedörrte Zeit. Scham, Wahrheit und Treue weichen, sagt Ovid; Brüder
       erschlagen einander, sagt die Völuspá; der Büffel steht auf einem Bein,
       sagen die Lakota. Was leuchtet, leuchtet nur noch im Herzen, und das Herz
       schlägt unverändert weiter — gleich hell wie im Goldenen Zeitalter.`;
}

// ------------------------------------------------------------- Der Himmel
function himmel(z) {
  const teile = [];
  const lage = `im Zweihundertjahrestakt „${z.sonnenSeg}“, im großen Halstatt-Rhythmus
    „${z.halstatt}“`;
  if (z.sonne >= 0.7) teile.push(`Die Sonne steht kräftig — ${lage}. Warme Jahrhunderte,
    in denen die Ernten tragen und die Zahl der Menschen wächst`);
  else if (z.sonne <= 0.3) teile.push(`Die Sonne ist schwach — ${lage}. Kalte
    Jahrhunderte, kurze Sommer, Missernten; die Zeit, in der Völker wandern`);
  else teile.push(`Die Sonne steht zwischen ihren Ständen — ${lage}. Die großen und die
    kleinen Rhythmen ziehen gerade gegeneinander`);

  teile.push(z.entfaltung > 0.66
    ? `Jupiter und Saturn stehen einander gegenüber — was gesät wurde, zeigt sich jetzt
       ganz, im Guten wie im Schlechten. Die Zeit der Offenbarung, nicht der Pläne`
    : z.entfaltung < 0.33
      ? `Jupiter und Saturn stehen beieinander — ein Anfang, der noch nichts vorzeigen
         kann; der Same liegt unter der Erde`
      : `Jupiter und Saturn stehen im Quadrat („${z.jsPhase}“) — Reibung, an der sich
         entscheidet, was Bestand hat`);

  teile.push(z.mondWeite > 0.6
    ? `Der Mond schwingt weit aus — die große Mondwende. Er geht nördlicher und
       südlicher auf als die Sonne je im Jahr; die Grenzen sind weit, die
       Finsternisse häufen sich`
    : z.mondWeite < 0.4
      ? `Der Mond läuft eng — die kleine Mondwende. Er bleibt innerhalb des
         Sonnenbogens; die Ränder rücken zusammen`
      : `Der Mond ist auf halbem Weg zwischen seinen Wenden`);

  teile.push(`Jupiter steht im ${z.zeichen}, Venus im ${z.blatt}. Blatt ihrer Rose`);
  return teile.join('. ') + '.';
}

// ------------------------------------------------------------- Der Mensch
function mensch(z) {
  if (z.katastrophe) return `Der Mensch lebt in dieser Zeit ohne Maßstab. Die
    Erfahrung der Älteren taugt nicht mehr, weil sie aus einer Welt stammt, die es
    nicht mehr gibt. Wer überlebt, überlebt selten durch Klugheit. Danach wird man
    erzählen, es habe Zeichen gegeben.`;
  const auf = z.richtung === 'auf';
  if (z.licht >= 0.92) return `Der Mensch altert kaum und stirbt wie im Schlaf. Er
    arbeitet nicht, weil die Erde von selbst trägt. Er hat keine Geschichte zu
    erzählen, und das ist kein Mangel.`;
  if (z.licht >= 0.68) return auf
    ? `Der Mensch merkt, dass ihm die Dinge entgegenkommen. Er traut dem noch nicht
       und arbeitet weiter wie bisher — und wundert sich über den Überschuss.`
    : `Der Mensch beginnt zu bauen und zu pflügen. Er erfindet das Haus, weil es
       zum ersten Mal Winter gibt, und das Eigentum, weil es zum ersten Mal knapp
       wird.`;
  if (z.licht >= 0.42) return auf
    ? `Der Mensch beginnt, hinter den Dingen wieder etwas zu vermuten. Er baut
       weiter wie vorher, aber er fragt anders.`
    : `Der Mensch wird Techniker. Er misst, rechnet, befestigt und erobert. Er ist
       stolz, und er hat Grund dazu — nur fällt ihm nicht auf, dass er immer
       schneller laufen muss, um auf der Stelle zu bleiben.`;
  if (z.licht >= 0.18) return auf
    ? `Der Mensch findet wieder zusammen, langsam und ohne Programm. Die großen
       Entwürfe sind verbraucht; was trägt, ist kleiner geworden und hält besser.`
    : `Der Mensch lebt kürzer und schneller. Er weiß mehr und versteht weniger. Die
       Überlieferung wird aufgeschrieben, weil man sie nicht mehr lebt, und
       verschriftlicht hält sie sich — aber sie spricht nicht mehr von selbst.`;
  return auf
    ? `Der Mensch steht noch in der Härte, aber etwas in ihm hat schon gewendet. Er
       nennt es Hoffnung, weil er kein besseres Wort hat.`
    : `Der Mensch ist zäh geworden und dünnhäutig zugleich. Er sticht in See, teilt
       den Boden auf und gräbt nach Erz. Er lebt in einer Welt, die er selbst
       gemacht hat, und findet sie unbewohnbar.`;
}

// ------------------------------------------------------------ Die Dynamik
function dynamik(z, jahr) {
  const yuga = SCHICHTEN[0];
  const { bisJahr } = segmentBei(yuga, jahr);
  const teile = [`Der laufende Abschnitt des großen Zyklus endet ${jahrText(bisJahr)}.`];

  if (Math.abs(z.schwarm - jahr) <= 3 && jahr > 1900 && jahr < 2100) {
    teile.push(`Die Erde steht nahe am verdichteten Tauriden-Schwarm (${Math.round(z.schwarm)}) —
      der Himmel ist in diesen Jahren nicht nur Bild, sondern Material.`);
  }
  teile.push(z.richtung === 'auf'
    ? `Die Richtung weist nach oben. Was jetzt zerfällt, zerfällt nicht mehr in die
       Tiefe, sondern macht Platz.`
    : z.richtung === 'ab'
      ? `Die Richtung weist nach unten. Was jetzt entsteht, entsteht gegen den Zug —
         es hält, solange jemand es hält.`
      : `Die Richtung ist in diesem Augenblick keine. Der Zyklus kehrt um, und an der
         Kehre gibt es weder oben noch unten.`);
  teile.push(`Darunter laufen alle kleineren Zyklen unbeirrt weiter: Das Jahr dreht
    sich, der Mond nimmt zu und ab, und im Innersten schlägt das Herz alle 1,2
    Sekunden — in jedem Zeitalter gleich.`);
  return teile.join(' ');
}

// ----------------------------------------------------------------- Ausgabe
export function deuten(jahr) {
  const z = stand(jahr);
  return {
    titel: titelVon(z),
    epoche: z.epoche,
    messwerte: [
      { name: 'Licht der Welt', wert: z.licht, ton: '#e8b95c' },
      { name: 'Kraft der Sonne', wert: z.sonne, ton: '#d4706a' },
      { name: 'Entfaltung am Himmel', wert: z.entfaltung, ton: '#a163c2' },
      { name: 'Weite des Mondes', wert: z.mondWeite, ton: '#8a68cd' }
    ],
    absaetze: [
      { kopf: 'Die Qualität der Zeit', text: qualitaet(z) },
      { kopf: 'Der Himmel', text: himmel(z) },
      { kopf: 'Der Mensch', text: mensch(z) },
      { kopf: 'Die Dynamik', text: dynamik(z, jahr) }
    ]
  };
}
