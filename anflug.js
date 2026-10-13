/* ------------------------------------------------------------------------
   anflug.js — der Weg nach Hause.

   Beim Öffnen der Seite steht man weit außerhalb der Milchstraße. Die Kamera
   fällt durch das Sternfeld, an den nächsten Nachbarsternen vorbei, durch die
   Bahnen des Sonnensystems hindurch, bis die Zeitkugel dasteht.

   Die Entfernungen sind gestaucht — ein ehrlicher Maßstab wäre eine schwarze
   Leinwand mit einem Punkt darin. Die Reihenfolge und die Abstände der Sterne
   zueinander stimmen; die Zahlen stehen in den Beschriftungen.
   --------------------------------------------------------------------- */

// Die nächsten Nachbarn, in Lichtjahren
export const NACHBARN = [
  { name: 'Sirius',            lj: 8.6,  farbe: 0xdfe9ff, gross: 1.5 },
  { name: 'Barnards Pfeilstern', lj: 6.0, farbe: 0xff9b63, gross: 0.8 },
  { name: 'Alpha Centauri',    lj: 4.4,  farbe: 0xffe3b0, gross: 1.3 },
  { name: 'Proxima Centauri',  lj: 4.25, farbe: 0xff7a52, gross: 0.7 }
];

// Die Planeten von außen nach innen, mit ihrem wahren Abstand in AE
export const PLANETEN = [
  { name: 'Neptun',  ae: 30.1, farbe: 0x5a7fd6, gross: 0.52 },
  { name: 'Uranus',  ae: 19.2, farbe: 0x8fd4de, gross: 0.52 },
  { name: 'Saturn',  ae: 9.58, farbe: 0xe3c98a, gross: 0.76, ring: true },
  { name: 'Jupiter', ae: 5.20, farbe: 0xd8a877, gross: 0.92 },
  { name: 'Mars',    ae: 1.52, farbe: 0xc1583a, gross: 0.30 },
  { name: 'Venus',   ae: 0.72, farbe: 0xe8d9a8, gross: 0.44 },
  { name: 'Merkur',  ae: 0.39, farbe: 0x9a9088, gross: 0.26 }
];

// Die vier Abschnitte des Flugs: Anteil am Weg, Überschrift, Unterzeile
export const ABSCHNITTE = [
  { bis: 0.26, titel: 'Die Milchstraße',
    unten: 'Hundert Milliarden Sonnen, ein Umlauf in 225 Millionen Jahren' },
  { bis: 0.52, titel: 'Die Nachbarsterne',
    unten: 'Proxima Centauri, 4,25 Lichtjahre — der nächste von allen' },
  { bis: 0.84, titel: 'Das Sonnensystem',
    unten: 'Von Neptun nach innen, 30 Astronomische Einheiten' },
  { bis: 1.01, titel: 'Die Erde',
    unten: 'Eine Achse, 23,44° schief, und darauf alle Zyklen zugleich' }
];

export function abschnittBei(p) {
  return ABSCHNITTE.find(a => p < a.bis) || ABSCHNITTE[ABSCHNITTE.length - 1];
}

// Weiches Anfahren und Ausrollen, dazwischen zügig
export function weg(p) {
  const x = Math.max(0, Math.min(1, p));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
