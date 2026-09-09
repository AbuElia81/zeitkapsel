# Die Zeitkapsel

## Die Zeitkugel

Ein Zwiebelmodell der Zeit: fünfzehn ineinander liegende Schalen, jede ein Zyklus,
von außen nach innen immer kürzer. Die Kugel lässt sich mit der Maus frei in
jede Richtung drehen; Scrollen, die Pfeiltasten oder die Leiste am Rand tauchen
Schicht für Schicht nach innen — bis zum Kern.

| # | Schicht | Dauer |
|---|---------|-------|
| 1 | Yuga-Zyklus | 25.800 Jahre |
| 2 | Halstatt-Zyklus | 2.400 Jahre |
| 3 | Eddy-Zyklus | 1.000 Jahre |
| 4 | Suess-de-Vries-Zyklus | 208 Jahre |
| 5 | Gleißberg-Zyklus | 88 Jahre |
| 6 | Hale-Zyklus | 22 Jahre |
| 7 | Jupiter-Saturn-Zyklus | 19,86 Jahre |
| 8 | Mondknoten-Zyklus | 18,61 Jahre |
| 9 | Jupiter-Zyklus | 11,86 Jahre |
| 10 | Venus-Zyklus | 8 Jahre |
| 11 | Das Jahr | 365,2422 Tage |
| 12 | Der Mondmonat | 29,53 Tage |
| 13 | Der Tag | 23 h 56 min 4 s |
| 14 | Der Atemzug | rund 4 Sekunden |
| 15 | Der Herzschlag | rund 0,9 Sekunden |

## Der Zeitschieber

Oben sitzt ein Schieber über die volle Länge des Yuga-Zyklus: von der
Kataklysmos-Flut 10876 v. Chr. bis zum Ende des aufsteigenden Satya Yuga
14925 n. Chr. Er verschiebt die Zeit für alle Schalen zugleich — jede Marke
wandert mit, und die Infotafel zeigt, in welchem Abschnitt seines Zyklus man
gerade steht und von wann bis wann der läuft. Die Schrittknöpfe springen um
1, 10, 100 und 1.000 Jahre, „Jetzt" holt die Gegenwart zurück.

Atemzug und Herzschlag folgen dem Schieber nicht — sie laufen in Echtzeit.

## Der Mensch im Kern

Im Innersten steht kein Punkt mehr, sondern ein Mensch mit leuchtendem Herzen.
Er wandelt sich mit dem Stand des Yuga-Zyklus: im Goldenen Zeitalter strahlend,
aus Licht gebaut, mit blühendem Herzen — im Kali Yuga kahl, ausgedörrt, die Haut
rissig wie trockene Erde, und nur noch ein winziger Funke an der Stelle des
Herzens. Vier gemalte Zustände (Satya, Treta, Dwapara, Kali) blenden stufenlos
ineinander, wenn man den Zeitschieber bewegt. Das Herz schlägt dabei weiter,
alle 1,2 Sekunden.

Die vier Bilder sind mit `gemini-3-pro-image` erzeugt: das Satya-Bild zuerst,
die drei anderen mit ihm als Referenz, damit Haltung, Bildausschnitt und die
Lage des Herzens gleich bleiben.

## Die Zwiebel öffnet sich

Jede Schale besteht aus zwei Halbschalen. Taucht man eine Ebene tiefer, springen
sie nach links und rechts auseinander und geben den Blick auf die nächste frei;
geht man wieder hinaus, setzen sie sich zusammen. Was man durchstoßen hat, bleibt
blass an den Rändern stehen.

Die äußerste Schale folgt der Rekonstruktion des Yuga-Zyklus von Bibhu Dev Misra
(*Yuga Shift*): acht Yugas zu je 2.700 Jahren, sechs Übergänge (Sandhi) zu je
300 Jahren und zwei Katastrophenzeiten zu je 1.200 Jahren — Ekpyrosis und
Kataklysmos — ergeben zusammen die 25.800 Jahre der Präzession. Zwei der acht
300-Jahr-Übergänge stecken dabei bereits in den beiden Katastrophenzeiten.
Ein zweites, schmales Band darüber zeigt Misras Zuordnung der AGN-Phasen von
Sgr A*, dem schwarzen Loch im Zentrum der Milchstraße.

Die Schalen 7 bis 10 sind die Planetenzyklen: die Große Konjunktion von Jupiter
und Saturn (der „Große Chronokrator" — Abu Maʿšar rechnete mit 240 Jahren je
Trigon und 960 Jahren für die volle Runde, die moderne Mundanastrologie mit rund
200 und 800; die Große Mutation von Erde zu Luft fiel auf den 21. Dezember 2020),
der Mondknoten-Zyklus mit großer und kleiner Mondwende (Dezember 2024, dann 2034,
2043), Jupiters Lauf durch die zwölf Zeichen und die Rose der Venus, deren fünf
Blätter in acht Jahren aufgehen.

Die weiße Marke auf jedem Band zeigt, wo wir gerade stehen. Bei Jahr, Mondmonat
und Tag wird sie aus der aktuellen Uhrzeit gerechnet, bei Atem und Herzschlag
läuft sie in Echtzeit mit.

## Aufbau

Statische Seiten, kein Build.

- `index.html`, `stil.css` — Seite und Gestaltung
- `zyklen.js` — die fünfzehn Schichten mit Anker, Periode, Texten und Terminen
- `kugel.js` — die Szene (Three.js): Schalen, Bänder, Drehung, Eintauchen
- `vendor/three.module.js` — Three.js r169, mitgeliefert
- `bilder/milchstrasse.jpg` — Hintergrund, erzeugt mit `gemini-3-pro-image`

Veröffentlichung über GitHub Pages (Quelle `main` / Root):
https://abuelia81.github.io/zeitkapsel/

## Lokal ansehen

Statischer Server auf Port 8919 (Eintrag `zeitkapsel` in `~/.claude/launch.json`).

## Nach Änderungen an CSS oder JS

    ./bump.sh

hebt die Versionsnummern der eingebundenen Dateien an, damit der Browser nicht
gecachte Dateien ausliefert.
