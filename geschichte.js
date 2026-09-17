// Historische Marken zur Zeitkugel. Die Jahreszahlen stehen in der gewohnten
// Zählung: negativ heißt v. Chr. Intern wird in astronomische Jahre umgerechnet
// (dort gibt es ein Jahr null), damit sie zum Zeitschieber passen.
function astro(j) { return j < 0 ? j + 1 : j; }

const ROH = [
  [-10800, 'Nordatlantik', 'Die Jüngere Dryaszeit beginnt — ein Kälteeinbruch von über tausend Jahren wirft die Erde in die Eiszeit zurück'],
  [-9700,  'Grönland, Europa', 'Die Jüngere Dryaszeit endet abrupt: Die Temperaturen springen binnen weniger Jahrzehnte um mehrere Grad nach oben'],
  [-9500,  'Göbekli Tepe, Obermesopotamien', 'Jäger und Sammler richten die ältesten bekannten Heiligtümer auf — Kreise aus tonnenschweren T-Pfeilern mit Tierreliefs'],
  [-8000,  'Jericho, Jordantal', 'Eine ummauerte Siedlung mit steinernem Turm, eine der ältesten Städte der Welt'],
  [-7100,  'Çatalhöyük, Anatolien', 'Eine Stadt ohne Gassen: Tausende leben in aneinandergebauten Lehmhäusern und steigen durch das Dach hinein'],
  [-6000,  'Mitteleuropa', 'Der Ackerbau erreicht Mitteleuropa; die Bandkeramiker roden die ersten Felder'],
  [-5500,  'Vinča, Balkan', 'Kupferverhüttung und eingeritzte Zeichen, die wie eine frühe Schrift wirken'],
  [-4600,  'Varna, Schwarzes Meer', 'Im Gräberfeld von Varna liegt das älteste verarbeitete Gold der Welt'],
  [-4000,  'Uruk, Sumer', 'Uruk wächst zur ersten Großstadt; Bewässerungsfeldbau ernährt Zehntausende'],
  [-3500,  'Mesopotamien', 'Das Rad, der Pflug und die ersten Rechenzeichen auf Ton'],
  [-3200,  'Sumer und Ägypten', 'Keilschrift und Hieroglyphen — die Schrift beginnt; Ägypten wird zu einem Reich geeint'],
  [-3000,  'Britische Inseln, Irland', 'Die ersten Erdwerke von Stonehenge; Newgrange wird auf den Sonnenaufgang der Wintersonnenwende ausgerichtet'],
  [-2600,  'Gizeh und Industal', 'Die Große Pyramide entsteht; Harappa und Mohenjo-Daro blühen mit Rasterstraßen und Kanalisation'],
  [-2334,  'Akkad, Mesopotamien', 'Sargon gründet das erste Großreich der Geschichte'],
  [-2000,  'Kreta und China', 'Die minoischen Paläste von Knossos; in China beginnt die Bronzezeit'],
  [-1754,  'Babylon', 'Hammurabi lässt seinen Gesetzeskodex in Stein schlagen'],
  [-1600,  'Thera, Ägäis', 'Ein gewaltiger Vulkanausbruch verwüstet die Inselwelt und trifft die minoische Kultur'],
  [-1200,  'Östliches Mittelmeer', 'Der Bronzezeitkollaps: Hethiterreich, Mykene und Ugarit gehen binnen weniger Jahrzehnte unter'],
  [-800,   'Hallstatt und Griechenland', 'Die Hallstattkultur beginnt; Homer, die ersten Stadtstaaten, das griechische Alphabet'],
  [-563,   'Indien, China, Persien', 'Achsenzeit: Buddha, Laozi, Konfuzius, die Upanischaden, Zarathustra und die israelitischen Propheten fast gleichzeitig'],
  [-480,   'Griechenland', 'Salamis und das klassische Athen — Sokrates, das Drama, der Beginn der Philosophie'],
  [-336,   'Makedonien bis zum Indus', 'Alexander zieht nach Osten und verbindet die griechische Welt mit Asien'],
  [-221,   'China', 'Qin Shihuangdi einigt China; Große Mauer und Terrakottaarmee entstehen'],
  [-44,    'Rom', 'Caesars Tod; aus der Republik wird das Kaiserreich'],
  [30,     'Judäa', 'Die Anfänge des Christentums im römischen Osten'],
  [150,    'Alexandria', 'Ptolemäus schreibt den Almagest — das Handbuch der Astronomie für die nächsten 1400 Jahre'],
  [476,    'Rom', 'Das weströmische Reich endet; Byzanz führt die Antike im Osten fort'],
  [622,    'Mekka und Medina', 'Die Hidschra — Beginn der islamischen Zeitrechnung'],
  [800,    'Aachen und Bagdad', 'Karl wird zum Kaiser gekrönt; in Bagdad blüht das Haus der Weisheit'],
  [830,    'Bagdad', 'Abu Maʿšar deutet die Großen Konjunktionen von Jupiter und Saturn als Takt der Dynastien'],
  [1000,   'Nordatlantik und China', 'Nordmänner erreichen Amerika; die Song-Dynastie kennt Buchdruck, Papiergeld und Kompass'],
  [1206,   'Zentralasien', 'Temüdschin wird Dschingis Khan; das Mongolenreich beginnt'],
  [1215,   'England', 'Die Magna Carta bindet auch den König an das Recht'],
  [1347,   'Europa', 'Der Schwarze Tod tötet binnen weniger Jahre etwa ein Drittel Europas'],
  [1450,   'Mainz', 'Gutenberg druckt mit beweglichen Lettern'],
  [1492,   'Atlantik', 'Kolumbus landet in der Karibik; zwei Welten stoßen aufeinander'],
  [1543,   'Frauenburg', 'Kopernikus stellt die Sonne in die Mitte'],
  [1600,   'Prag und Padua', 'Kepler findet die Ellipsenbahnen, Galilei richtet das Fernrohr zum Himmel'],
  [1645,   'Europa', 'Das Maunder-Minimum beginnt: Über Jahrzehnte fast keine Sonnenflecken, die Themse friert regelmäßig zu'],
  [1687,   'Cambridge', 'Newtons Principia — Himmel und Erde folgen denselben Gesetzen'],
  [1760,   'England', 'Die Industrielle Revolution beginnt mit Kohle, Dampf und Eisen'],
  [1789,   'Paris', 'Die Französische Revolution'],
  [1859,   'London und weltweit', 'Darwins „Entstehung der Arten“; das Carrington-Ereignis, der stärkste bekannte Sonnensturm der Neuzeit'],
  [1945,   'Weltweit', 'Ende des Zweiten Weltkriegs; das Atomzeitalter beginnt'],
  [1969,   'Mond', 'Menschen betreten zum ersten Mal einen anderen Himmelskörper'],
  [1989,   'Berlin', 'Die Mauer fällt; zwei Jahre später wird das World Wide Web öffentlich'],
  [2020,   'Weltweit', 'Eine Pandemie legt die Welt still; am 21. Dezember die Große Konjunktion in 0°29′ Wassermann'],
  [2025,   'Nach Misras Rechnung', 'Das absteigende Kali Yuga endet, die Ekpyrosis beginnt']
];

export const EREIGNISSE = ROH
  .map(([j, ort, was]) => ({ jahr: astro(j), ort, was }))
  .sort((a, b) => a.jahr - b.jahr);

const EPOCHEN = [
  [-12000, 'Jüngere Dryaszeit — das Ende der Eiszeit'],
  [-9699,  'Frühe Jungsteinzeit'],
  [-8999,  'Jungsteinzeit'],
  [-3199,  'Bronzezeit'],
  [-1199,  'Eisenzeit'],
  [-499,   'Antike'],
  [501,    'Mittelalter'],
  [1501,   'Frühe Neuzeit'],
  [1801,   'Industriezeitalter'],
  [1946,   'Gegenwart']
];

export function epocheVon(jahr) {
  if (jahr > 2035) return 'Jenseits der Überlieferung';
  let name = EPOCHEN[0][1];
  for (const [ab, n] of EPOCHEN) if (jahr >= ab) name = n;
  return name;
}

// Das jüngste Ereignis bis zu diesem Jahr und die nächsten danach
export function ereignisseUm(jahr, davor = 1, danach = 2) {
  let i = -1;
  for (let k = 0; k < EREIGNISSE.length; k++) if (EREIGNISSE[k].jahr <= jahr) i = k;
  const von = Math.max(0, i - davor);
  const liste = EREIGNISSE.slice(von, Math.min(EREIGNISSE.length, i + 1 + danach));
  return liste.map(e => ({ ...e, laufend: EREIGNISSE.indexOf(e) === i }));
}
