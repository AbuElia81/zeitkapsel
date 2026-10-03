/* ------------------------------------------------------------------------
   spende.js — der Spendenknopf in der linken Spalte.

   Wie beim Oracle: PayPal.Me nimmt den Betrag im Pfad entgegen, .../7EUR
   führt direkt auf sieben Euro. Der letzte Knopf lässt den Betrag offen.
   Ist PAYPAL leer, zeigt die Seite nichts davon.
   --------------------------------------------------------------------- */
const PAYPAL = "https://paypal.me/scholaastronomica";

const BETRAEGE = [
  { summe: "7EUR",  schrift: "7 €",  titel: "Sieben Euro — die Zahl der Wandelsterne" },
  { summe: "14EUR", schrift: "14 €", titel: "Vierzehn Euro — doppelt so viel" }
];

const TEXT = "Diese Seite kostet nichts, zeigt keine Werbung und sammelt keine Daten. " +
             "Wer mag, wirft etwas in den Hut — für den Erhalt oder einfach als Dank.";

(function spendenknopf() {
  if (!PAYPAL) return;
  const spalte = document.getElementById("linkeSpalte");
  if (!spalte) return;

  const kasten = document.createElement("aside");
  kasten.className = "spende";

  const titel = document.createElement("p");
  titel.className = "spendeTitel";
  titel.textContent = "Etwas dalassen";
  kasten.appendChild(titel);

  const reihe = document.createElement("div");
  reihe.className = "spendeReihe";

  BETRAEGE.forEach(b => {
    const a = document.createElement("a");
    a.className = "spendeKnopf";
    a.href = `${PAYPAL}/${b.summe}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = b.titel;
    a.textContent = b.schrift;
    reihe.appendChild(a);
  });

  const frei = document.createElement("a");
  frei.className = "spendeKnopf frei";
  frei.href = PAYPAL;
  frei.target = "_blank";
  frei.rel = "noopener noreferrer";
  frei.title = "Betrag selbst wählen";
  frei.textContent = "anderer Betrag";
  reihe.appendChild(frei);

  kasten.appendChild(reihe);

  const p = document.createElement("p");
  p.className = "spendeNot";
  p.textContent = TEXT;
  kasten.appendChild(p);

  spalte.appendChild(kasten);
})();
