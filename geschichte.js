// Historische Marken zur Zeitkugel. Die Jahreszahlen stehen in der gewohnten
// Zählung: negativ heißt v. Chr. Intern wird in astronomische Jahre umgerechnet
// (dort gibt es ein Jahr null), damit sie zum Zeitschieber passen.
//
// art: 'himmel' = Kometen, Einschläge, Finsternisse, Sternexplosionen
//      'natur'  = Fluten, Ausbrüche, Dürren, Seuchen, Klimastürze
//      'kultur' = Menschenwerk
function astro(j) { return j < 0 ? j + 1 : j; }

const ROH = [
  // ---------------------------------------------------- Ende der Eiszeit
  [-10850, 'himmel', 'Nordamerika, Grönland', 'Die umstrittene These vom Einschlag eines zerbrochenen Kometen: Eine dünne Schicht mit Nanodiamanten und Iridium liegt weltweit genau an dieser Grenze. Belegt ist die Schicht, der Einschlag nicht'],
  [-10800, 'natur',  'Nordhalbkugel', 'Die Jüngere Dryaszeit beginnt — ein Kälterückfall von über tausend Jahren wirft die Erde in die Eiszeit zurück'],
  [-9700,  'natur',  'Grönland, Europa', 'Die Jüngere Dryaszeit endet abrupt: Die Temperaturen springen binnen weniger Jahrzehnte um mehrere Grad nach oben'],
  [-9500,  'kultur', 'Göbekli Tepe, Obermesopotamien', 'Jäger und Sammler richten die ältesten bekannten Heiligtümer auf — Kreise aus tonnenschweren T-Pfeilern mit Tierreliefs'],
  [-9000,  'natur',  'Sahara', 'Die Grüne Sahara beginnt: Monsunregen füllt Seen und Flüsse, wo heute Wüste liegt'],
  [-8000,  'kultur', 'Jericho, Jordantal', 'Eine ummauerte Siedlung mit steinernem Turm, eine der ältesten Städte der Welt'],
  [-7100,  'kultur', 'Çatalhöyük, Anatolien', 'Eine Stadt ohne Gassen: Tausende leben in aneinandergebauten Lehmhäusern und steigen durch das Dach hinein'],
  [-6500,  'kultur', 'Vorderasien', 'Rinder, Schafe und Ziegen sind domestiziert; die Milchwirtschaft beginnt'],
  [-6200,  'natur',  'Norwegische See, Doggerland', 'Die Storegga-Rutschung — der größte bekannte Unterwasser-Bergsturz — löst einen Tsunami aus, der Schottland und das Doggerland überrollt'],
  [-6200,  'natur',  'Nordhalbkugel', 'Das 8,2-ka-Ereignis: Schmelzwasser aus Nordamerika bricht in den Atlantik, die Welt kühlt für zwei bis vier Jahrhunderte ab'],
  [-6000,  'kultur', 'Mitteleuropa', 'Der Ackerbau erreicht Mitteleuropa; die Bandkeramiker roden die ersten Felder'],
  [-5600,  'natur',  'Schwarzes Meer', 'Die umstrittene Schwarzmeerflutung: Mittelmeerwasser bricht durch den Bosporus und hebt den Seespiegel um über hundert Meter. Neuere Datierungen setzen das Ereignis früher an'],
  [-5500,  'kultur', 'Vinča, Balkan', 'Kupferverhüttung und eingeritzte Zeichen, die wie eine frühe Schrift wirken'],
  [-5000,  'natur',  'Nordsee', 'Das Doggerland versinkt endgültig — die Landbrücke zwischen Britannien und dem Festland verschwindet'],
  [-4600,  'kultur', 'Varna, Schwarzes Meer', 'Im Gräberfeld von Varna liegt das älteste verarbeitete Gold der Welt'],
  [-4000,  'kultur', 'Uruk, Sumer', 'Uruk wächst zur ersten Großstadt; Bewässerungsfeldbau ernährt Zehntausende'],
  [-3600,  'kultur', 'Malta', 'Die Megalithtempel von Ġgantija — ältere Steinbauten als die Pyramiden'],
  [-3500,  'natur',  'Sahara', 'Die Grüne Sahara endet: Innerhalb weniger Jahrhunderte trocknen Seen und Weiden aus, die Menschen ziehen an den Nil'],
  [-3500,  'kultur', 'Mesopotamien', 'Das Rad, der Pflug und die ersten Rechenzeichen auf Ton'],
  [-3300,  'kultur', 'Ötztaler Alpen', 'Ötzi stirbt am Tisenjoch — mit Kupferbeil, Bogen und tätowierter Haut'],
  [-3200,  'kultur', 'Sumer und Ägypten', 'Keilschrift und Hieroglyphen — die Schrift beginnt; Ägypten wird zu einem Reich geeint'],
  [-3000,  'kultur', 'Britische Inseln, Irland', 'Die ersten Erdwerke von Stonehenge; Newgrange wird auf den Sonnenaufgang der Wintersonnenwende ausgerichtet'],
  [-2700,  'himmel', 'Henbury, Australien', 'Ein Eisenmeteorit zerbricht über Zentralaustralien und schlägt ein Dutzend Krater; die Aborigines überliefern den Ort als „Feuerteufelsstelle“'],
  [-2600,  'kultur', 'Gizeh und Industal', 'Die Große Pyramide entsteht; Harappa und Mohenjo-Daro blühen mit Rasterstraßen und Kanalisation'],
  [-2500,  'kultur', 'Salisbury Ebene', 'Die Sarsensteine von Stonehenge werden aufgerichtet und auf die Sonnenwenden ausgerichtet'],
  [-2334,  'kultur', 'Akkad, Mesopotamien', 'Sargon gründet das erste Großreich der Geschichte'],
  [-2200,  'natur',  'Vom Nil bis zum Indus', 'Das 4,2-ka-Dürreereignis: Eine jahrhundertelange Trockenheit lässt das Akkadische Reich und das ägyptische Alte Reich zusammenbrechen'],
  [-2200,  'himmel', 'Campo del Cielo, Argentinien', 'Ein Regen aus Eisenmeteoriten schlägt ein Kraterfeld in die Pampa — die Guaraní nennen den Ort „Feld des Himmels“'],
  [-2000,  'kultur', 'Kreta und China', 'Die minoischen Paläste von Knossos; in China beginnt die Bronzezeit'],
  [-1900,  'natur',  'Industal', 'Der Sarasvati-Flusslauf versiegt, die Indus-Städte werden aufgegeben'],
  [-1754,  'kultur', 'Babylon', 'Hammurabi lässt seinen Gesetzeskodex in Stein schlagen'],
  [-1600,  'natur',  'Thera, Ägäis', 'Ein gewaltiger Vulkanausbruch sprengt die Insel; Aschefall und Flutwellen treffen die minoische Welt'],
  [-1500,  'himmel', 'Kaali, Saaremaa', 'Ein Meteorit explodiert über der Ostsee-Insel und schlägt neun Krater; der Wald brennt weithin ab. Die Datierung schwankt zwischen 1530 und 1450 v. Chr.'],
  [-1274,  'kultur', 'Kadesch, Syrien', 'Die größte Streitwagenschlacht der Antike endet im ersten überlieferten Friedensvertrag'],
  [-1200,  'natur',  'Östliches Mittelmeer', 'Der Bronzezeitkollaps: Dürre, Hungersnot und die Seevölker — Hethiterreich, Mykene und Ugarit gehen binnen weniger Jahrzehnte unter'],
  [-1159,  'natur',  'Island und Nordeuropa', 'Der Hekla-3-Ausbruch verdunkelt jahrelang den Himmel; in irischen Baumringen fehlen die Jahresringe'],
  [-800,   'kultur', 'Hallstatt und Griechenland', 'Die Hallstattkultur beginnt; Homer, die ersten Stadtstaaten, das griechische Alphabet'],
  [-763,   'himmel', 'Assyrien', 'Die Sonnenfinsternis von Bur-Sagale wird in den assyrischen Eponymenlisten vermerkt — der älteste sicher datierte Tag der Geschichte'],
  [-753,   'kultur', 'Rom', 'Das überlieferte Gründungsjahr Roms'],
  [-585,   'himmel', 'Halys, Kleinasien', 'Eine totale Sonnenfinsternis unterbricht die Schlacht zwischen Lydern und Medern; Thales soll sie vorhergesagt haben'],
  [-563,   'kultur', 'Indien, China, Persien', 'Achsenzeit: Buddha, Laozi, Konfuzius, die Upanischaden, Zarathustra und die israelitischen Propheten fast gleichzeitig'],
  [-480,   'kultur', 'Griechenland', 'Salamis und das klassische Athen — Sokrates, das Drama, der Beginn der Philosophie'],
  [-336,   'kultur', 'Makedonien bis zum Indus', 'Alexander zieht nach Osten und verbindet die griechische Welt mit Asien'],
  [-300,   'kultur', 'Alexandria', 'Euklid schreibt die Elemente; die Bibliothek sammelt das Wissen der bekannten Welt'],
  [-240,   'himmel', 'China', 'Die erste sichere Aufzeichnung des Halleyschen Kometen'],
  [-221,   'kultur', 'China', 'Qin Shihuangdi einigt China; Große Mauer und Terrakottaarmee entstehen'],
  [-150,   'kultur', 'Antikythera, Ägäis', 'Ein Räderwerk aus Bronze rechnet Sonnen- und Mondstände und Finsternisse voraus'],
  [-44,    'himmel', 'Rom', 'Nach Caesars Tod steht sieben Tage lang ein Komet am Himmel; das Volk sieht darin seine Vergöttlichung'],
  [30,     'kultur', 'Judäa', 'Die Anfänge des Christentums im römischen Osten'],
  [79,     'natur',  'Pompeji, Golf von Neapel', 'Der Vesuv begräbt Pompeji und Herculaneum unter Asche und Glutlawinen'],
  [105,    'kultur', 'China', 'Das Papier wird am Kaiserhof eingeführt'],
  [150,    'himmel', 'Alexandria', 'Ptolemäus schreibt den Almagest — das Handbuch der Astronomie für die nächsten 1400 Jahre'],
  [165,    'natur',  'Römisches Reich', 'Die Antoninische Pest tötet über Jahre Millionen und schwächt das Reich dauerhaft'],
  [250,    'kultur', 'Mesoamerika', 'Die Klassik der Maya beginnt: Stelen, Langzeitkalender, Venustafeln'],
  [476,    'kultur', 'Rom', 'Das weströmische Reich endet; Byzanz führt die Antike im Osten fort'],
  [536,    'natur',  'Weltweit', 'Ein Staubschleier verdunkelt anderthalb Jahre lang die Sonne — Missernten von Irland bis China. Das schlimmste Jahr, um am Leben zu sein'],
  [541,    'natur',  'Mittelmeerraum', 'Die Justinianische Pest — der erste dokumentierte Pestzug der Geschichte'],
  [622,    'kultur', 'Mekka und Medina', 'Die Hidschra — Beginn der islamischen Zeitrechnung'],
  [762,    'kultur', 'Bagdad', 'Die runde Stadt wird gegründet und binnen zweier Generationen zum Zentrum der Wissenschaft'],
  [800,    'kultur', 'Aachen und Bagdad', 'Karl wird zum Kaiser gekrönt; im Haus der Weisheit werden griechische und indische Werke übersetzt'],
  [830,    'himmel', 'Bagdad', 'Abu Maʿšar deutet die Großen Konjunktionen von Jupiter und Saturn als Takt der Dynastien'],
  [1006,   'himmel', 'Weltweit', 'SN 1006 flammt im Wolf auf — der hellste je verzeichnete Stern, bei Nacht konnte man bei seinem Licht lesen'],
  [1054,   'himmel', 'China, Japan, Arabien', 'SN 1054 leuchtet 23 Tage lang am Taghimmel; übrig bleibt der Krebsnebel'],
  [1066,   'himmel', 'England', 'Der Halleysche Komet steht über der Schlacht von Hastings und wird in den Teppich von Bayeux gestickt'],
  [1088,   'kultur', 'Bologna', 'Die erste Universität Europas nimmt den Lehrbetrieb auf'],
  [1206,   'kultur', 'Zentralasien', 'Temüdschin wird Dschingis Khan; das Mongolenreich beginnt'],
  [1215,   'kultur', 'England', 'Die Magna Carta bindet auch den König an das Recht'],
  [1257,   'natur',  'Samalas, Lombok', 'Der größte Vulkanausbruch des Holozäns; in Europa folgen Missernten, in London werden Massengräber angelegt'],
  [1271,   'kultur', 'Venedig bis China', 'Marco Polo bricht auf und bleibt siebzehn Jahre am Hof des Kublai Khan'],
  [1301,   'himmel', 'Padua', 'Giotto sieht den Halleyschen Kometen und malt ihn als Stern von Betlehem über die Krippe'],
  [1325,   'kultur', 'Tenochtitlan', 'Die Azteken gründen ihre Stadt auf einer Insel im Texcoco-See'],
  [1347,   'natur',  'Europa', 'Der Schwarze Tod tötet binnen weniger Jahre etwa ein Drittel Europas'],
  [1450,   'kultur', 'Mainz', 'Gutenberg druckt mit beweglichen Lettern'],
  [1453,   'kultur', 'Konstantinopel', 'Die Stadt fällt; griechische Gelehrte bringen die antiken Texte nach Italien'],
  [1492,   'kultur', 'Atlantik', 'Kolumbus landet in der Karibik; zwei Welten stoßen aufeinander'],
  [1543,   'himmel', 'Frauenburg', 'Kopernikus stellt die Sonne in die Mitte'],
  [1572,   'himmel', 'Dänemark', 'Tychos Supernova erscheint in der Kassiopeia — ein neuer Stern widerlegt die Unveränderlichkeit des Himmels'],
  [1600,   'natur',  'Huaynaputina, Peru', 'Der stärkste Ausbruch Südamerikas; die folgende Kälte löst in Russland eine Hungersnot mit Millionen Toten aus'],
  [1604,   'himmel', 'Prag', 'Keplers Supernova — die letzte in unserer Galaxis, die mit bloßem Auge zu sehen war'],
  [1609,   'himmel', 'Padua', 'Galilei richtet das Fernrohr zum Himmel: Mondberge, Jupitermonde, Venusphasen'],
  [1645,   'himmel', 'Europa', 'Das Maunder-Minimum beginnt: Über Jahrzehnte fast keine Sonnenflecken, die Themse friert regelmäßig zu'],
  [1680,   'himmel', 'Europa', 'Der Große Komet zieht über den Winterhimmel; Newton benutzt ihn, um Kometenbahnen zu berechnen'],
  [1687,   'kultur', 'Cambridge', 'Newtons Principia — Himmel und Erde folgen denselben Gesetzen'],
  [1755,   'natur',  'Lissabon', 'Erdbeben, Flutwelle und Feuerbrunst zerstören die Stadt am Allerheiligentag und erschüttern das Weltbild Europas'],
  [1758,   'himmel', 'Europa', 'Der Halleysche Komet kehrt zurück wie berechnet — der erste Beweis, dass Kometen Gesetzen folgen'],
  [1760,   'kultur', 'England', 'Die Industrielle Revolution beginnt mit Kohle, Dampf und Eisen'],
  [1781,   'himmel', 'Bath', 'Herschel entdeckt den Uranus — der erste Planet, den niemand zuvor gekannt hatte'],
  [1783,   'natur',  'Laki, Island', 'Eine acht Monate lange Spalteneruption vergiftet Islands Weiden und verschleiert Europas Himmel'],
  [1789,   'kultur', 'Paris', 'Die Französische Revolution'],
  [1811,   'himmel', 'Weltweit', 'Der Große Komet steht neun Monate lang am Himmel; man nennt den Jahrgang danach Kometenwein'],
  [1815,   'natur',  'Tambora, Sumbawa', 'Der stärkste Ausbruch der Neuzeit; 1816 gibt es in Europa und Nordamerika kein Sommerhalbjahr'],
  [1833,   'himmel', 'Nordamerika', 'Der Leonidensturm: über hunderttausend Sternschnuppen in der Stunde, viele halten es für das Weltende'],
  [1846,   'himmel', 'Berlin', 'Neptun wird gefunden — vorher errechnet, dann am vorhergesagten Ort erblickt'],
  [1859,   'himmel', 'Weltweit', 'Das Carrington-Ereignis: Der stärkste bekannte Sonnensturm setzt Telegrafenleitungen in Brand, Polarlichter bis in die Tropen'],
  [1859,   'kultur', 'London', 'Darwins „Entstehung der Arten“'],
  [1883,   'natur',  'Krakatau, Sundastraße', 'Die Explosion ist noch in 4.800 Kilometern zu hören; die Flutwelle tötet Zehntausende'],
  [1908,   'himmel', 'Tunguska, Sibirien', 'Ein Körper von etwa sechzig Metern zerplatzt in der Luft und wirft auf 2.000 Quadratkilometern den Wald um'],
  [1910,   'himmel', 'Weltweit', 'Die Erde zieht durch den Schweif des Halleyschen Kometen; Geschäftemacher verkaufen Kometenpillen'],
  [1918,   'natur',  'Weltweit', 'Die Spanische Grippe tötet mehr Menschen als der Weltkrieg zuvor'],
  [1927,   'kultur', 'Löwen', 'Lemaître leitet aus Einsteins Gleichungen ein sich ausdehnendes Universum ab'],
  [1945,   'kultur', 'Weltweit', 'Ende des Zweiten Weltkriegs; das Atomzeitalter beginnt'],
  [1961,   'kultur', 'Baikonur', 'Gagarin umrundet als erster Mensch die Erde'],
  [1969,   'kultur', 'Mond', 'Menschen betreten zum ersten Mal einen anderen Himmelskörper'],
  [1989,   'kultur', 'Berlin', 'Die Mauer fällt; zwei Jahre später wird das World Wide Web öffentlich'],
  [1994,   'himmel', 'Jupiter', 'Der Komet Shoemaker-Levy 9 zerbricht und schlägt in Jupiter ein — erdgroße dunkle Flecken, erstmals live beobachtet'],
  [1997,   'himmel', 'Weltweit', 'Hale-Bopp steht achtzehn Monate am Himmel, der am längsten sichtbare Komet der Neuzeit'],
  [2004,   'natur',  'Indischer Ozean', 'Ein Seebeben vor Sumatra löst eine Flutwelle aus, die über 200.000 Menschen tötet'],
  [2013,   'himmel', 'Tscheljabinsk, Ural', 'Ein zwanzig Meter großer Körper explodiert über der Stadt; die Druckwelle zerbricht Tausende Fenster'],
  [2020,   'himmel', 'Weltweit', 'Am 21. Dezember die Große Konjunktion von Jupiter und Saturn in 0°29′ Wassermann — die Große Mutation von Erde zu Luft'],
  [2020,   'natur',  'Weltweit', 'Eine Pandemie legt die Welt für Monate still'],
  [2024,   'himmel', 'Weltweit', 'Die große Mondwende und das Maximum von Sonnenzyklus 25 fallen zusammen'],
  [2025,   'kultur', 'Nach Misras Rechnung', 'Das absteigende Kali Yuga endet, die Ekpyrosis beginnt']
];

// Die überlieferten Erscheinungen des Halleyschen Kometen. Seine Umlaufzeit
// schwankt zwischen 74 und 79 Jahren, deshalb stehen hier die wirklich
// verzeichneten Jahre statt einer Rechnung.
export const HALLEY = [
  -239, -163, -86, -11, 66, 141, 218, 295, 374, 451, 530, 607, 684, 760, 837,
  912, 989, 1066, 1145, 1222, 1301, 1378, 1456, 1531, 1607, 1682, 1759, 1835,
  1910, 1986, 2061, 2134
].map(astro);

// Welche Erscheinung lag vor diesem Jahr, welche kommt als nächste?
export function halleyUm(jahr) {
  let letzte = null, naechste = null;
  for (const j of HALLEY) {
    if (j <= jahr) letzte = j;
    else { naechste = j; break; }
  }
  return { letzte, naechste };
}

export const EREIGNISSE = ROH
  .map(([j, art, ort, was]) => ({ jahr: astro(j), art, ort, was }))
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
  return EREIGNISSE.slice(von, Math.min(EREIGNISSE.length, i + 1 + danach))
    .map((e, k) => ({ ...e, laufend: von + k === i }));
}
