# Die Zeitkapsel

## Die Zeitkugel

Ein Zwiebelmodell der Zeit: zwölf ineinander liegende Schalen, jede ein Zyklus,
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
| 8 | Das Jahr | 365,2422 Tage |
| 9 | Der Mondmonat | 29,53 Tage |
| 10 | Der Tag | 23 h 56 min 4 s |
| 11 | Der Atemzug | rund 4 Sekunden |
| 12 | Der Herzschlag | rund 0,9 Sekunden |

Die äußerste Schale folgt der Rekonstruktion des Yuga-Zyklus von Bibhu Dev Misra
(*Yuga Shift*): acht Yugas zu je 2.700 Jahren, sechs Übergänge (Sandhi) zu je
300 Jahren und zwei Katastrophenzeiten zu je 1.200 Jahren — Ekpyrosis und
Kataklysmos — ergeben zusammen die 25.800 Jahre der Präzession. Zwei der acht
300-Jahr-Übergänge stecken dabei bereits in den beiden Katastrophenzeiten.
Ein zweites, schmales Band darüber zeigt Misras Zuordnung der AGN-Phasen von
Sgr A*, dem schwarzen Loch im Zentrum der Milchstraße.

Die siebte Schale ist die Große Konjunktion von Jupiter und Saturn, der „Große
Chronokrator" der arabisch-persischen Astrologie. Abu Maʿšar rechnete mit
240 Jahren je Trigon und 960 Jahren für die volle Runde, die moderne
Mundanastrologie mit rund 200 und 800 Jahren; die Große Mutation von Erde zu
Luft fiel auf den 21. Dezember 2020.

Die weiße Marke auf jedem Band zeigt, wo wir gerade stehen. Bei Jahr, Mondmonat
und Tag wird sie aus der aktuellen Uhrzeit gerechnet, bei Atem und Herzschlag
läuft sie in Echtzeit mit.

## Aufbau

Statische Seiten, kein Build.

- `index.html`, `stil.css` — Seite und Gestaltung
- `zyklen.js` — die zwölf Schichten mit Texten, Segmenten und Zeitrechnung
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
