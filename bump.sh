#!/bin/bash
# Hebt die Versionsnummer aller eingebundenen Dateien an, damit der Browser neu laedt.
cd "$(dirname "$0")"
N=$(( $(grep -ho '?v=[0-9]*' *.html 2>/dev/null | head -1 | tr -d '?v=') + 1 ))
[ -z "$N" ] && N=1
for f in *.html; do
  perl -pi -e "s/\?v=\d+//g; s/(href=\"(?:stil\.css)|src=\"(?:[a-z]+\.js))\"/\$1?v=$N\"/g" "$f"
done
echo "Version $N"
