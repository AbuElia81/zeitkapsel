/* ------------------------------------------------------------------------
   weltalter.js — wo die eingestellte Zeit in den anderen Überlieferungen liegt.

   Die Vergleichstafeln nennen die Zeitalter; hier wird ausgerechnet, in
   welchem davon man gerade steht. Gerechnet wird in astronomischen Jahren
   (das Jahr 0 gibt es), darum steht hinter jedem Anker die Jahreszahl in
   der üblichen Zählung als Kommentar.

   Jede Zahl stammt aus dem Anker, der in der zugehörigen Vergleichstafel
   genannt ist — nichts hiervon ist hier erfunden.
   --------------------------------------------------------------------- */

import { jahrText } from './zyklen.js?v=122';

const CHALDAEISCH = ['Saturn', 'Jupiter', 'Mars', 'Sonne', 'Venus', 'Merkur', 'Mond'];
const TIERKREIS_AB_KREBS = ['Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze',
  'Steinbock', 'Wassermann', 'Fische', 'Widder', 'Stier', 'Zwillinge'];

// Zahlwerte mit Tausenderpunkt — Jahreszahlen dagegen ohne, wie überall sonst
const z = (n) => Math.round(n).toLocaleString('de-DE');
const jahr = (g) => jahrText(Math.round(g));

export function weltalterStand(j) {
  const stand = [];

  // ---------------------------------------------------------------- Maya
  // Großer Zyklus = 13 Baktun = 1.872.000 Tage. Der letzte endete am
  // 21. Dezember 2012, der davor begann am 11. August 3114 v. Chr.
  const MAYA_LANG = 1872000 / 365.2422;        // 5.125,37 Jahre
  const MAYA_ENDE = 2012.97;
  const mk = Math.floor((j - MAYA_ENDE) / MAYA_LANG);
  const mVon = MAYA_ENDE + mk * MAYA_LANG;
  const mBak = Math.floor(((j - mVon) / MAYA_LANG) * 13) + 1;
  stand.push({
    name: 'Maya, Lange Zählung',
    lage: `${mBak}. Baktun von 13`,
    note: `Großer Zyklus ${jahr(mVon)} bis ${jahr(mVon + MAYA_LANG)}`
  });

  // -------------------------------------------------------------- Azteken
  // Kalenderrunde zu 52 Jahren; das letzte Neue Feuer brannte im Januar 1507.
  const AZT_FEUER = 1507, AZT_RUNDE = 52;
  const ak = Math.floor((j - AZT_FEUER) / AZT_RUNDE);
  stand.push({
    name: 'Azteken, Fünfte Sonne',
    lage: `Jahr ${Math.floor(j - (AZT_FEUER + ak * AZT_RUNDE)) + 1} der Kalenderrunde`,
    note: `Neues Feuer zuletzt ${jahr(AZT_FEUER + ak * AZT_RUNDE)}, wieder ${jahr(AZT_FEUER + (ak + 1) * AZT_RUNDE)}`
  });

  // ------------------------------------------------------ Indien, Siddhanta
  // Das Kali Yuga der Siddhantas beginnt am 18. Februar 3102 v. Chr.
  const KALI_START = -3101.13, KALI_LANG = 432000;
  const kv = j - KALI_START;
  stand.push({
    name: 'Indien, Kali Yuga der Siddhantas',
    lage: kv < 0 ? 'noch vor seinem Beginn' : `Jahr ${z(kv)} von ${z(KALI_LANG)}`,
    note: `beginnt 3102 v. Chr., endet ${jahr(KALI_START + KALI_LANG)}`
  });

  // ------------------------------------------------------------- Persien
  // Bundahischn: 12.000 Jahre in vier Teilen zu 3.000, verankert an
  // Zarathustra 588 v. Chr. — daraus 9588 v. Chr. bis 2413 n. Chr.
  const B_START = -9587, B_TEIL = 3000;
  const BT = ['die geistige Schöpfung (mēnōg)', 'die stoffliche Schöpfung (gētīg)',
              'die Vermischung (gumēzišn)', 'der Kampf bis zur Erneuerung'];
  const bi = Math.floor((j - B_START) / B_TEIL);
  stand.push({
    name: 'Persien, die 12.000 Jahre',
    lage: bi < 0 ? 'vor dem Anfang' : bi > 3 ? 'nach Frashokereti' : `${bi + 1}. Teil — ${BT[bi]}`,
    note: bi > 3 ? 'der Strom aus flüssigem Metall ist durch'
        : bi === 3 ? `Frashokereti ${jahr(B_START + 4 * B_TEIL)}`
        : `bis ${jahr(B_START + (bi + 1) * B_TEIL)}, Ende ${jahr(B_START + 4 * B_TEIL)}`
  });

  // --------------------------------------------------------------- Jainas
  // Das 5. Ara der absteigenden Hälfte: 21.000 Jahre ab Mahaviras
  // Nirvana 527 v. Chr., danach das 6. Ara zu ebenfalls 21.000 Jahren.
  const ARA_START = -526, ARA_LANG = 21000;
  const av = j - ARA_START;
  stand.push({
    name: 'Jainas, das Rad',
    lage: av < 0 ? '4. Ara, Dukhama-sukhama'
        : av < ARA_LANG ? `5. Ara (Dukhama), Jahr ${z(av)} von ${z(ARA_LANG)}`
        : `6. Ara (Dukhama-dukhama), Jahr ${z(av - ARA_LANG)} von ${z(ARA_LANG)}`,
    note: `absteigende Hälfte (Avasarpiṇī), 5. Ara ab 527 v. Chr.`
  });

  // ---------------------------------------------------------- Tibet, Rabjung
  // Sechzigjährige Zyklen ab 1027, dem Feuer-Hase-Jahr.
  const RAB_START = 1027, RAB_LANG = 60;
  const ri = Math.floor((j - RAB_START) / RAB_LANG);
  stand.push({
    name: 'Tibet, Kālacakra',
    lage: ri < 0 ? 'vor dem ersten Rabjung'
                 : `${ri + 1}. Rabjung, Jahr ${Math.floor(j - (RAB_START + ri * RAB_LANG)) + 1} von 60`,
    note: ri < 0 ? 'die Zählung beginnt 1027'
                 : `begann ${jahr(RAB_START + ri * RAB_LANG)}`
  });

  // --------------------------------------------------------- Mighty Fardār
  // 360 Jahre je Zeichen ab 3381 v. Chr., Planeten in chaldäischer Folge.
  const F_START = -3380, F_LANG = 360;
  const fi = Math.floor((j - F_START) / F_LANG);
  stand.push({
    name: 'Mighty Fardār',
    lage: fi < 0 ? 'vor der Epoche'
        : `${fi + 1}. Periode — ${CHALDAEISCH[fi % 7]} in ${TIERKREIS_AB_KREBS[fi % 12]}`,
    note: fi < 0 ? 'die Zählung beginnt 3381 v. Chr.'
                 : `${jahr(F_START + fi * F_LANG)} bis ${jahr(F_START + (fi + 1) * F_LANG)}`
  });

  // ------------------------------------------------------- Ägypten, Sothis
  // 1.461 Jahre; Censorinus verankert eine Periode an 139 n. Chr.
  const S_START = 139, S_LANG = 1461;
  const si = Math.floor((j - S_START) / S_LANG);
  stand.push({
    name: 'Ägypten, Sothis-Zyklus',
    lage: `Jahr ${Math.floor(j - (S_START + si * S_LANG)) + 1} von ${z(S_LANG)}`,
    note: `laufende Periode ${jahr(S_START + si * S_LANG)} bis ${jahr(S_START + (si + 1) * S_LANG)}`
  });

  return stand;
}
