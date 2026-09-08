# Die Zeitkapsel

Neues Projekt, angelegt am 2026-09-08.

Statische Seiten ohne Build. Veröffentlichung über GitHub Pages
(Quelle `main` / Root): https://abuelia81.github.io/zeitkapsel/

## Lokal ansehen

Statischer Server auf Port 8919 (Eintrag `zeitkapsel` in `~/.claude/launch.json`).

## Nach Änderungen an CSS oder JS

    ./bump.sh

hebt die Versionsnummern der eingebundenen Dateien an, damit der Browser nicht
gecachte Dateien ausliefert.
