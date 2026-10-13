import * as THREE from './vendor/three.module.js';
import { SCHICHTEN, anteil, segmentBei, jahrJetzt, jahrText, zeitText,
         yugaLicht, menschZustand, masstab, kernStand, schiefe,
         SCHIEFE_SICHER, RING_ANKER } from './zyklen.js?v=120';
import { ereignisseUm, epocheVon, halleyUm } from './geschichte.js?v=120';
import { deuten } from './deutung.js?v=120';
import { weltalterStand } from './weltalter.js?v=120';

const HG = 0x05070d;

// ---------------------------------------------------------------- Grundgerüst
const buehne = document.getElementById('buehne');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
buehne.appendChild(renderer.domElement);

const szene = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(42, 1, 0.05, 400);
kamera.position.set(0, 0, 14);

// Die Kugel steht fest in ihrer Achse und dreht sich nur um sie — wie ein
// Globus im Gestell. Die Neigung ist die der Erde: 23,44 Grad.
// Die Neigung steht nicht fest: Sie folgt der wirklichen Schiefe der Erdachse
// zum eingestellten Jahr — dem Milanković-Zyklus von 41.000 Jahren. Wahr sind
// davon nur 1,6 Grad über die ganze Spanne, und das sieht man kaum. Die Kugel
// zeigt den Ausschlag darum dreifach überhöht, gespiegelt an der Mitte der
// physikalischen Spanne. Die Zahl in der Tafel bleibt die wahre.
const NEIGUNG_MITTE = 23.3;          // Mitte zwischen 22,1° und 24,5°
const NEIGUNG_MASS = 3;

function neigungFuer(jahr) {
  return (NEIGUNG_MITTE + (schiefe(jahr) - NEIGUNG_MITTE) * NEIGUNG_MASS)
    * Math.PI / 180;
}

let zielNeigung = 23.4392811 * Math.PI / 180;
let istNeigung = zielNeigung;
const buehneWelt = new THREE.Group();   // nimmt den Versatz nach oben auf
szene.add(buehneWelt);
const blick = new THREE.Group();        // man schaut leicht von oben darauf
blick.rotation.x = -0.17;
buehneWelt.add(blick);
const achse = new THREE.Group();        // die Erdneigung, sichtbar in der Bildebene
achse.rotation.z = -istNeigung;
blick.add(achse);
const welt = new THREE.Group();         // dreht sich beim Anschieben um die Achse
achse.add(welt);

// ------------------------------------------------------------------ Sternfeld
function sternfeld() {
  const n = 2600, pos = new Float32Array(n * 3), grau = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 90 + Math.random() * 130;
    const t = Math.acos(2 * Math.random() - 1), p = Math.random() * Math.PI * 2;
    pos[i * 3] = r * Math.sin(t) * Math.cos(p);
    pos[i * 3 + 1] = r * Math.cos(t);
    pos[i * 3 + 2] = r * Math.sin(t) * Math.sin(p);
    const h = 0.45 + Math.random() * 0.55, w = 0.9 + Math.random() * 0.1;
    grau[i * 3] = h; grau[i * 3 + 1] = h * w; grau[i * 3 + 2] = h * (0.85 + Math.random() * 0.15);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(grau, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({
    size: 1.05, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: 0.85, depthWrite: false
  }));
}
const sterne = sternfeld();
szene.add(sterne);

// --------------------------------------------------- Textur für ein Zyklusband
const TON = {
  yuga:        [0.30, 0.92],
  sandhi:      [0.09, 0.45],
  katastrophe: [0.62, 1.00],
  hoch:        [0.42, 0.95],
  auf:         [0.24, 0.80],
  ab:          [0.16, 0.68],
  tief:        [0.07, 0.42],
  agn:          [0.45, 0.95],
  'agn-an':     [0.30, 0.85],
  'agn-aus':    [0.30, 0.85],
  'agn-dunkel': [0.05, 0.34],
  leer:        [0.0, 0.0]
};

// Wie viel vom Band oben der Name des Zyklus einnimmt
const KOPF_HOCH = 0.235;

// Größte Schriftgröße, mit der der Text noch in die Breite passt
function passend(x, text, breite, basis, minimum, gewicht) {
  if (!text) return basis;
  x.font = `${gewicht} ${basis}px Georgia, serif`;
  const b = x.measureText(text).width;
  if (b <= breite) return basis;
  return Math.max(minimum, Math.floor(basis * breite / b));
}

function bandTextur(schicht, segmente, hoehe, klein, felder) {
  const B = 4096, H = hoehe;
  // Das Band ist jetzt deutlich höher als früher. Damit die Schrift nicht in
  // die Länge gezogen wird, wächst die Leinwand mit — und alle Schriftgrade
  // wachsen im selben Maß mit ihr.
  const k = H / (klein ? 128 : 256);
  // Die Schrift waechst voll mit dem Band mit — die Namen duerfen ihr Feld
  // ausfuellen; passend() faengt ab, was nicht hineinpasst.
  const kf = k * 0.98;
  const c = document.createElement('canvas');
  c.width = B; c.height = H;
  const x = c.getContext('2d');
  const farbe = new THREE.Color(schicht.farbe);
  const rgb = (a) => `rgba(${Math.round(farbe.r * 255)},${Math.round(farbe.g * 255)},${Math.round(farbe.b * 255)},${a})`;

  x.clearRect(0, 0, B, H);
  // Das beschriftete Band bekommt einen dunklen Grund, damit die Namen auch
  // vor den kräftigen Feldern der ganzen Kugel noch zu lesen sind.
  if (!felder) { x.fillStyle = 'rgba(5,7,13,0.62)'; x.fillRect(0, 0, B, H); }
  const gesamt = segmente.reduce((s, g) => s + g.laenge, 0);
  let lauf = 0;

  for (const seg of segmente) {
    const x0 = (lauf / gesamt) * B, br = (seg.laenge / gesamt) * B;
    lauf += seg.laenge;
    const [fuell, linie] = TON[seg.art] || TON.auf;
    if (fuell === 0 && linie === 0) continue;

    x.fillStyle = rgb(fuell * (felder ? 0.62 : 0.80));
    x.fillRect(x0, 0, br, H);

    // Schraffur für Übergangszeiten
    if (seg.art === 'sandhi') {
      x.save();
      x.beginPath(); x.rect(x0, 0, br, H); x.clip();
      x.strokeStyle = rgb(0.35); x.lineWidth = 2 * k;
      for (let s = -H; s < br + H; s += 14 * k) {
        x.beginPath(); x.moveTo(x0 + s, H); x.lineTo(x0 + s + H, 0); x.stroke();
      }
      x.restore();
    }

    // Trennlinien
    x.strokeStyle = rgb(linie * 0.9); x.lineWidth = 3 * k;
    x.beginPath(); x.moveTo(x0, 0); x.lineTo(x0, H); x.stroke();

    if (felder) { continue; }

    // Beschriftung — die Schrift wird so weit verkleinert, bis sie ins Feld passt
    const gross = (klein ? 34 : 52) * kf, mittel = (klein ? 26 : 38) * kf;
    const mx = x0 + br / 2, platz = br - 12;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 10;

    const dauerText = `${String(seg.laenge).replace('.', ',')} ${schicht.einheit}`;

    if (platz >= 52) {
      // Waagerecht: Name oben, Dauer und Richtung darunter
      x.fillStyle = `rgba(255,243,221,${Math.min(0.97, 0.45 + linie * 0.55)})`;
      if (seg.name) {
        const gN = passend(x, seg.name, platz, gross, 19 * kf, 600);
        x.font = `600 ${gN}px Georgia, "Times New Roman", serif`;
        x.fillText(seg.name, mx, klein ? H / 2 : H * 0.475);
      }
      if (!klein) {
        x.fillStyle = `rgba(233,223,203,${Math.min(0.88, 0.35 + linie * 0.5)})`;
        const gD = passend(x, dauerText, platz, mittel, 15 * kf, 400);
        x.font = `400 ${gD}px Georgia, serif`;
        x.fillText(dauerText, mx, H * 0.665);
        if (seg.zusatz) {
          const gZ = passend(x, seg.zusatz, platz, mittel * 0.86, 14 * kf, 400);
          x.font = `400 ${gZ}px Georgia, serif`;
          x.fillStyle = `rgba(255,243,221,${Math.min(0.8, 0.28 + linie * 0.45)})`;
          x.fillText(seg.zusatz, mx, H * 0.815);
        }
      }
    } else if (platz >= 14 && seg.name) {
      // Schmales Feld (Sandhi): Dauer quer zum Band, wie in der Vorlage
      x.save();
      x.translate(mx, H * 0.63);
      x.rotate(-Math.PI / 2);
      x.fillStyle = rgb(Math.min(1, linie + 0.25));
      x.fillStyle = `rgba(255,243,221,${Math.min(0.95, 0.45 + linie * 0.55)})`;
      const gQ = Math.min(passend(x, dauerText, H * 0.62, 30 * kf, 14 * kf, 400), platz * 1.4);
      x.font = `400 ${gQ}px Georgia, serif`;
      x.fillText(dauerText, 0, 0);
      x.restore();
    }
    x.shadowBlur = 0;
  }
  // Der Name des Zyklus läuft als Kopfzeile rund um das Band — sechsmal, damit
  // er aus jeder Blickrichtung dasteht. Ein Tipp darauf öffnet die Erklärung.
  if (!felder && !klein) {
    const kopf = `${schicht.name.toUpperCase()}  ·  ${schicht.dauer.toUpperCase()}`;
    const WIE_OFT = 4;                       // viermal rund herum
    const kg = passend(x, kopf, (B / WIE_OFT) * 0.76, 26 * k, 10 * k, 600);
    x.save();
    x.beginPath(); x.rect(0, 0, B, H * KOPF_HOCH); x.clip();
    x.fillStyle = rgb(0.30);
    x.fillRect(0, 0, B, H * KOPF_HOCH);
    x.strokeStyle = rgb(0.75); x.lineWidth = 2.5 * k;
    x.beginPath(); x.moveTo(0, H * KOPF_HOCH); x.lineTo(B, H * KOPF_HOCH); x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 8 * k;
    x.font = `600 ${kg}px Georgia, "Times New Roman", serif`;
    x.fillStyle = 'rgba(255,243,221,0.92)';
    for (let i = 0; i < WIE_OFT; i++)
      x.fillText(kopf, (i + 0.5) * B / WIE_OFT, H * KOPF_HOCH * 0.52);
    x.shadowBlur = 0;
    x.restore();
  }

  // Ränder
  if (felder) { const t0 = fertig(c); return t0; }
  x.strokeStyle = rgb(0.55); x.lineWidth = 4 * k;
  x.beginPath(); x.moveTo(0, 2 * k); x.lineTo(B, 2 * k);
  x.moveTo(0, H - 2 * k); x.lineTo(B, H - 2 * k); x.stroke();

  return fertig(c);
}

function fertig(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

// ------------------------------------------------------- Weicher Lichtschein
function scheinTextur() {
  const N = 256, c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0.00, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.40, 'rgba(255,255,255,0.17)');
  g.addColorStop(0.70, 'rgba(255,255,255,0.04)');
  g.addColorStop(1.00, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, N, N);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const SCHEIN = scheinTextur();

// Die Textur läuft einmal ganz um die Kugel. Eine Halbschale zeigt nur ihren
// Ausschnitt davon — dafür werden die U-Koordinaten umgerechnet.
function uvAusschnitt(geo, phiVon, phiLang) {
  const uv = geo.attributes.uv;
  const faktor = phiLang / (Math.PI * 2), versatz = phiVon / (Math.PI * 2);
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * faktor + versatz);
  uv.needsUpdate = true;
  return geo;
}

// --------------------------------------------------- Gitterkugel (Zwiebelhaut)
function gitterkugel(r, farbe, meridiane = 16, parallelen = 9, phiVon = 0, phiLang = Math.PI * 2) {
  const p = [];
  for (let m = 0; m <= meridiane; m++) {
    const phi = phiVon + (m / meridiane) * phiLang;
    for (let i = 0; i < 96; i++) {
      const t0 = (i / 96) * Math.PI, t1 = ((i + 1) / 96) * Math.PI;
      p.push(r * Math.sin(t0) * Math.cos(phi), r * Math.cos(t0), r * Math.sin(t0) * Math.sin(phi));
      p.push(r * Math.sin(t1) * Math.cos(phi), r * Math.cos(t1), r * Math.sin(t1) * Math.sin(phi));
    }
  }
  for (let k = 1; k <= parallelen; k++) {
    const t = (k / (parallelen + 1)) * Math.PI, rr = r * Math.sin(t), y = r * Math.cos(t);
    for (let i = 0; i < 96; i++) {
      const a0 = phiVon + (i / 96) * phiLang, a1 = phiVon + ((i + 1) / 96) * phiLang;
      p.push(rr * Math.cos(a0), y, rr * Math.sin(a0));
      p.push(rr * Math.cos(a1), y, rr * Math.sin(a1));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p), 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({
    color: farbe, transparent: true, opacity: 0.62, depthWrite: false
  }));
}

// -------------------------------------------------------- Der Mensch im Kern
// Vier Zustände vom Goldenen Zeitalter bis zum Kali Yuga. Zwischen ihnen wird
// überblendet, je nachdem, wo der Zeitschieber im Yuga-Zyklus steht.
const STUFEN = ['kali', 'dwapara', 'treta', 'satya'];
const HERZ_VERSATZ = { x: 0.01, y: -0.165 };   // Lage des Herzens im Bild
let menschTeile = [], herzSchein = null, menschGrund = 1.55, menschBuehne = null;

function mensch(gruppe, r, teile) {
  const lader = new THREE.TextureLoader();
  menschGrund = r * 2.1;
  // Eigene Gruppe unmittelbar in der Szene: der Mensch steht still und aufrecht,
  // während sich die Zwiebelschalen um ihn drehen.
  const buehneMensch = new THREE.Group();
  szene.add(buehneMensch);
  menschBuehne = buehneMensch;

  STUFEN.forEach((name, k) => {
    const tex = lader.load(`bilder/mensch-${name}.jpg`);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: k === 0 ? 1 : 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    // Ganz nah am Kern wuerde man sonst den rechteckigen Bildrand sehen.
    // Ein schmaler weicher Saum loest die Figur in den Sternenhimmel auf.
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <alphatest_fragment>',
        `float saum =
           smoothstep(0.0, 0.115, vMapUv.x) * smoothstep(1.0, 0.885, vMapUv.x) *
           smoothstep(0.0, 0.075, vMapUv.y) * smoothstep(1.0, 0.925, vMapUv.y);
         float licht = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
         diffuseColor.rgb = max(diffuseColor.rgb - 0.055, 0.0) * 1.058 * saum;
         diffuseColor.a *= saum * clamp(licht * 3.2, 0.0, 1.0);
         #include <alphatest_fragment>`);
    };
    const sp = new THREE.Sprite(mat);
    sp.scale.setScalar(menschGrund);
    // So verschoben, dass das Herz der Figur genau im Mittelpunkt der Kugel liegt
    sp.position.y = -menschGrund * HERZ_VERSATZ.y;
    sp.position.x = -menschGrund * HERZ_VERSATZ.x;
    buehneMensch.add(sp);
    teile.push({ mat, rolle: 'mensch' });
    menschTeile.push({ mat, sprite: sp });
  });

  // Der Herzschein sitzt auf dem Herzen der Figur und schlägt
  const hMat = new THREE.SpriteMaterial({
    map: SCHEIN, color: 0xffcf7a, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  herzSchein = new THREE.Sprite(hMat);
  herzSchein.scale.setScalar(menschGrund * 0.42);
  herzSchein.position.set(0, 0, 0.02);
  buehneMensch.add(herzSchein);
  teile.push({ mat: hMat, rolle: 'herz' });
  gruppe.userData.herz = herzSchein;
}

// Blendet die vier Zustände nach dem Yuga-Stand (1 = golden, 0 = erloschen)
function menschSetzen(licht) {
  const u = Math.max(0, Math.min(3, licht * 3));
  const k = Math.min(2, Math.floor(u)), f = u - k;
  menschTeile.forEach((t, j) => {
    t.mat.userData.ziel = j === k ? 1 - f : (j === k + 1 ? f : 0);
  });
  if (herzSchein) {
    // Das Herz ist die Quelle und brennt in jedem Zeitalter gleich stark.
    // Nur seine Farbe wandert: von tiefer Glut im Kali Yuga zu goldenem Licht.
    herzSchein.material.color.setHSL(0.035 + 0.085 * licht, 0.92 - 0.30 * licht, 0.50 + 0.20 * licht);
    herzSchein.material.userData.ziel = 0.90 + 0.10 * licht;
  }
}

// ------------------------------------------------------------ Schichten bauen
// Wie hoch das beschriftete Band um jede Schale steht. Ein breites Band laesst
// den Zyklus auch auf dem Handy lesen — die Schrift waechst im selben Mass mit.
const BAND_K = 3.4;
const bandNetze = [];        // alle beschrifteten Bänder — zum Antippen
const nebenHoch = 0.055 * BAND_K;

const schalen = SCHICHTEN.map((schicht, i) => {
  const gruppe = new THREE.Group();
  const farbe = new THREE.Color(schicht.farbe);
  const r = schicht.radius;
  const teile = [];
  const haelften = [];

  // Der Kernring waechst nur wenig mit: aus naechster Naehe wuerde er sonst
  // als rote Flaeche vor der Figur stehen.
  const bandHalb = schicht.kern ? 0.085 * 1.25 : 0.105 * BAND_K;
  const bandRadius = schicht.kern ? r * 1.72 : r;
  const bandTief = schicht.kern ? -1.0 : 0;    // der Kernring liegt unter der Figur
  const bandMat = new THREE.MeshBasicMaterial({
    map: bandTextur(schicht, schicht.segmente, Math.round(256 * BAND_K), false),
    transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 1
  });
  teile.push({ mat: bandMat, rolle: 'band' });

  // Dieselben Felder, aber über die ganze Kugel gezogen: Die Schale ist damit
  // nicht mehr nur ein Reifen, sondern eine in Segmente geteilte Zwiebelhaut.
  const feldMat = schicht.kern ? null : new THREE.MeshBasicMaterial({
    map: bandTextur(schicht, schicht.segmente, 96, false, true),
    transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 0.46
  });
  if (feldMat) teile.push({ mat: feldMat, rolle: 'feld' });

  let nebenMat = null;
  if (schicht.nebenband) {
    nebenMat = new THREE.MeshBasicMaterial({
      map: bandTextur(schicht, schicht.nebenband.segmente, Math.round(128 * BAND_K), true),
      transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 1
    });
    teile.push({ mat: nebenMat, rolle: 'band' });
  }

  // Jede Schale besteht aus zwei Halbschalen. Beim Eintauchen springen sie
  // nach links und rechts auseinander wie eine aufgeschnittene Zwiebel.
  [[-1, -Math.PI / 2], [1, Math.PI / 2]].forEach(([vorz, phiVon]) => {
    const halb = new THREE.Group();
    const lang = Math.PI;

    if (!schicht.kern) {
      const gitter = gitterkugel(r, farbe, i < 3 ? 9 : 7, i < 3 ? 9 : 7, phiVon, lang);
      halb.add(gitter);
      teile.push({ mat: gitter.material, rolle: 'haut' });

      const huelle = new THREE.MeshBasicMaterial({
        color: farbe, transparent: true, opacity: 0.12,
        blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
      });
      halb.add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 26, phiVon, lang), huelle));
      teile.push({ mat: huelle, rolle: 'haut' });

      halb.add(new THREE.Mesh(uvAusschnitt(
        new THREE.SphereGeometry(r * 0.997, 128, 48, phiVon, lang, 0, Math.PI),
        phiVon, lang), feldMat));
    }

    // Das beschriftete Band bleibt greifbar: Ein Tipp darauf taucht eine
    // Schale tiefer, wie ein Tipp auf die Punkte.
    const bandNetz = new THREE.Mesh(uvAusschnitt(
      new THREE.SphereGeometry(bandRadius, 110, 24, phiVon, lang, Math.PI / 2 - bandHalb, bandHalb * 2),
      phiVon, lang).translate(0, bandTief, 0), bandMat);
    bandNetz.userData.schicht = i;
    bandNetze.push(bandNetz);
    halb.add(bandNetz);

    if (nebenMat) {
      halb.add(new THREE.Mesh(uvAusschnitt(
        new THREE.SphereGeometry(r * 1.035, 110, 8, phiVon, lang,
          Math.PI / 2 - bandHalb - 0.045 - nebenHoch, nebenHoch),
        phiVon, lang), nebenMat));
    }

    gruppe.add(halb);
    haelften.push({ gruppe: halb, vorz });
  });

  if (schicht.kern) mensch(gruppe, r, teile);

  // Marke „Jetzt“ — sie bleibt in der Mitte und wandert nicht mit den Hälften
  const marke = new THREE.Group();
  const mFarbe = new THREE.Color(0xfff2d0);
  const mMat = new THREE.LineBasicMaterial({ color: mFarbe, transparent: true, opacity: 0.95, depthWrite: false });
  const linie = new THREE.BufferGeometry();
  linie.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    bandRadius * 0.86, 0, 0, bandRadius * 1.16, 0, 0
  ]), 3));
  marke.add(new THREE.Line(linie, mMat));
  const kugelMat = new THREE.MeshBasicMaterial({ color: mFarbe, transparent: true, opacity: 1, depthWrite: false });
  const punkt = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.035, r * 0.022), 16, 12), kugelMat);
  punkt.position.x = bandRadius * 1.16;
  marke.add(punkt);
  teile.push({ mat: mMat, rolle: 'marke' }, { mat: kugelMat, rolle: 'marke' });
  marke.position.y = bandTief;
  gruppe.add(marke);
  gruppe.userData.marke = marke;

  if (schicht.echtzeit && !schicht.kern) gruppe.userData.atem = true;

  welt.add(gruppe);
  teile.forEach(t => { t.grund = t.mat.opacity; });
  return { schicht, gruppe, teile, haelften, i, oeffnung: 0 };
});

// Marke auf ihre Position im Zyklus drehen
function markeSetzen(schale, anteil) {
  // Die Textur beginnt bei phi = 0, und three.js legt diesen Punkt auf -x.
  // Deshalb die halbe Umdrehung Versatz und der positive Umlaufsinn.
  schale.gruppe.userData.marke.rotation.y = Math.PI + anteil * Math.PI * 2;
}
// ------------------------------------------------------------------ Die Zeit
const RING_ENDE = RING_ANKER + 25800;
let zeitJahr = jahrJetzt();
let amJetzt = true;

function markenAktualisieren() {
  schalen.forEach(sch => {
    if (sch.schicht.echtzeit) return;      // Atem und Herz laufen in Echtzeit
    markeSetzen(sch, anteil(sch.schicht, zeitJahr));
  });
}
markenAktualisieren();

// ----------------------------------------------------------- Der Planet
// Damit die Zeitkugel als Planet zu lesen ist und nicht als Drahtgitter:
// ein Körper mit angedeuteter Oberfläche, ein Atmosphärenrand und die Achse
// mit ihren beiden Polen. Alles wächst mit der gerade gewählten Schale.

// Fester Zufall — dieselbe Welt bei jedem Aufruf
function wuerfel(saat) {
  let z = saat >>> 0;
  return () => { z = (z * 1664525 + 1013904223) >>> 0; return z / 4294967296; };
}

function planetTextur() {
  const B = 1024, H = 512, c = document.createElement('canvas');
  c.width = B; c.height = H;
  const x = c.getContext('2d');
  const r = wuerfel(20261013);

  const tief = x.createLinearGradient(0, 0, 0, H);
  tief.addColorStop(0.00, '#0a1e33');
  tief.addColorStop(0.32, '#10314f');
  tief.addColorStop(0.50, '#143a5c');
  tief.addColorStop(0.68, '#10314f');
  tief.addColorStop(1.00, '#0a1e33');
  x.fillStyle = tief; x.fillRect(0, 0, B, H);

  // Landmassen: weiche Flecken, die sich zu Kontinenten zusammenlegen
  const land = ['#1d3d2a', '#24462c', '#2e4a2d', '#3a4630', '#2a3f33'];
  for (let i = 0; i < 120; i++) {
    const mx = r() * B, my = H * (0.12 + r() * 0.76);
    const br = 24 + r() * 120, ho = 18 + r() * 70;
    x.save();
    x.globalAlpha = 0.30 + r() * 0.42;
    x.fillStyle = land[Math.floor(r() * land.length)];
    x.beginPath(); x.ellipse(mx, my, br, ho, r() * Math.PI, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  // Eis an den Polen
  const eis = (y0, y1) => {
    const g = x.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, 'rgba(226,238,248,0.72)');
    g.addColorStop(1, 'rgba(226,238,248,0)');
    x.fillStyle = g; x.fillRect(0, Math.min(y0, y1), B, Math.abs(y1 - y0));
  };
  eis(0, H * 0.14); eis(H, H * 0.87);

  // Wolkenzüge, waagerecht gestreckt wie in den Westwindbändern
  for (let i = 0; i < 90; i++) {
    const my = H * (0.06 + r() * 0.88);
    x.save();
    x.globalAlpha = 0.05 + r() * 0.13;
    x.fillStyle = '#eef4ff';
    x.beginPath();
    x.ellipse(r() * B, my, 40 + r() * 190, 5 + r() * 16, 0, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function randTextur() {
  const N = 512, c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0.000, 'rgba(120,180,255,0)');
  g.addColorStop(0.760, 'rgba(120,180,255,0)');
  g.addColorStop(0.880, 'rgba(130,186,255,0.30)');
  g.addColorStop(0.945, 'rgba(176,214,255,0.62)');
  g.addColorStop(0.985, 'rgba(120,180,255,0.14)');
  g.addColorStop(1.000, 'rgba(120,180,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, N, N);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Der Körper dreht sich mit der Kugel
const planetMat = new THREE.MeshBasicMaterial({
  map: planetTextur(), transparent: true, opacity: 0.22,
  side: THREE.FrontSide, depthWrite: false
});
const planet = new THREE.Mesh(new THREE.SphereGeometry(0.985, 64, 48), planetMat);
welt.add(planet);

// Der Atmosphärenrand steht still und schaut immer zum Betrachter
const randMat = new THREE.SpriteMaterial({
  map: randTextur(), transparent: true, opacity: 0.85,
  blending: THREE.AdditiveBlending, depthWrite: false
});
const atmosphaere = new THREE.Sprite(randMat);
achse.add(atmosphaere);

// Die Achse selbst: eine dünne Spindel mit zwei Polen, wie beim Globus
const achsMat = new THREE.LineBasicMaterial({
  color: 0xcfe2ff, transparent: true, opacity: 0.34, depthWrite: false
});
const achsLinie = new THREE.BufferGeometry();
achsLinie.setAttribute('position', new THREE.BufferAttribute(
  new Float32Array([0, -1.17, 0, 0, 1.17, 0]), 3));
const spindel = new THREE.Line(achsLinie, achsMat);
achse.add(spindel);

const polMat = new THREE.SpriteMaterial({
  map: SCHEIN, color: 0xdceaff, transparent: true, opacity: 0.75,
  blending: THREE.AdditiveBlending, depthWrite: false
});
const pole = [1, -1].map(v => {
  const p = new THREE.Sprite(polMat);
  p.position.y = v * 1.02;
  p.scale.setScalar(0.3);
  achse.add(p);
  return p;
});

function planetSetzen() {
  const r = SCHICHTEN[ebene].radius;
  planet.scale.setScalar(r);
  atmosphaere.scale.setScalar(r * 2.42);
  spindel.scale.setScalar(r);
  pole.forEach(p => { p.position.y = Math.sign(p.position.y) * 1.02 * r; p.scale.setScalar(0.3 * r); });
}

// ------------------------------------------- Der Strahl aus dem galaktischen Kern
// Solange Sgr A* nach Misra in seiner AGN-Phase steht, fällt von dort ein Strahl
// auf die Kugel. Er kommt aus der Richtung, in der im Hintergrundbild der Kern
// der Milchstraße leuchtet, und wird mit dem Wert aus kernStand() gedimmt.
const QUELLE = new THREE.Vector3(0.80, -0.42, 0.43).normalize();

function strahlTextur() {
  const B = 8, H = 256, c = document.createElement('canvas');
  c.width = B; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0.00, 'rgba(255,255,255,0.00)');   // fern, am Kern
  g.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  g.addColorStop(0.82, 'rgba(255,255,255,0.52)');
  g.addColorStop(1.00, 'rgba(255,255,255,0.95)');   // dicht an der Kugel
  x.fillStyle = g; x.fillRect(0, 0, B, H);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const kernStrahl = new THREE.Group();
buehneWelt.add(kernStrahl);

const kegelMat = new THREE.MeshBasicMaterial({
  map: strahlTextur(), color: 0xbfd6ff, transparent: true, opacity: 0,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
});
const kegel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.62, 0.15, 3.4, 28, 1, true), kegelMat);
kegel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), QUELLE);
kegel.position.copy(QUELLE).multiplyScalar(0.98 + 1.7);
kernStrahl.add(kegel);

const treffMat = new THREE.SpriteMaterial({
  map: SCHEIN, color: 0xdce9ff, transparent: true, opacity: 0,
  blending: THREE.AdditiveBlending, depthWrite: false
});
const treffPunkt = new THREE.Sprite(treffMat);
treffPunkt.scale.setScalar(1.05);
treffPunkt.position.copy(QUELLE).multiplyScalar(0.96);
kernStrahl.add(treffPunkt);

function strahlSetzen(t) {
  const feuer = kernStand(zeitJahr).feuer;
  kernStrahl.visible = feuer > 0.004;
  if (!kernStrahl.visible) return;
  kernStrahl.scale.setScalar(SCHICHTEN[ebene].radius);
  // Ein langsames Pulsen, damit der Strahl lebt und nicht als Balken steht
  const puls = 0.86 + 0.14 * Math.sin(t * 0.55) + 0.06 * Math.sin(t * 1.9);
  kegelMat.opacity = 0.42 * feuer * puls;
  treffMat.opacity = 0.80 * feuer * puls;
}

// ------------------------------------------------------------------- Steuerung
let ebene = 0;            // welche Schicht ist aktiv
let versatz = 0, istVersatz = 0;   // schiebt die Kugel bei hochkantem Bild nach oben
let zielAbstand = 14, istAbstand = 14;

let tafelFrei = false;    // am Handy steht unten ein Pop-up — die Kugel rueckt hoch

function abstandFuer(e) {
  const schmal = kamera.aspect < 0.9;
  // Pop-up unten: die Kugel muss in die obere Haelfte passen. Die hohe Figur
  // im Kern braucht dafuer mehr Abstand als die breite Schale.
  const platz = tafelFrei && schmal ? (SCHICHTEN[e].kern ? 1.9 : 1.18) : 1;
  if (SCHICHTEN[e].kern) {
    // Im Kern zaehlt nicht mehr die Schale, sondern die Figur. Sie ist hoch und
    // nicht breit — darum wird hier auf die Hoehe eingepasst statt auf die
    // Breite. Der Mensch rueckt damit ganz nah heran.
    const sicht = menschGrund / 0.66;
    return platz * sicht / (2 * Math.tan((kamera.fov / 2) * Math.PI / 180));
  }
  const r = SCHICHTEN[e].radius;
  const grund = r * 3.15 + 0.55;
  // Bei hochkantem Bild ist das Sichtfeld horizontal enger — dann weiter weg
  return platz * grund / Math.min(1, kamera.aspect || 1);
}

// Wie viel Platz die Kugel bekommt: steht unten ein Pop-up, schiebt sie sich in
// die obere Haelfte des Bildschirms, damit nichts von ihr verdeckt wird.
function raumSetzen() {
  const schmal = kamera.aspect < 0.9;
  if (!schmal) versatz = 0;
  else if (!tafelFrei) versatz = 0.10;      // unter den Punkten, über dem Streifen
  else versatz = SCHICHTEN[ebene].kern ? 0.195 : 0.245;
  zielAbstand = abstandFuer(ebene);
}

function ebeneSetzen(neu, sanft = true) {
  ebene = Math.max(0, Math.min(SCHICHTEN.length - 1, neu));
  raumSetzen();
  if (!sanft) { istAbstand = zielAbstand; istVersatz = versatz; }
  ausrichten = true;
  tafelFuellen(SCHICHTEN[ebene]);
  streifenFuellen();
  leisteMarkieren();
  linealMarkieren();
}

// Zielopazität je Schale abhängig von der aktiven Ebene
function zielOpazitaet(i, rolle) {
  // Durchstoßene Schalen springen auf und bleiben als offene Hälften am Rand
  // stehen — je weiter man eingetaucht ist, desto blasser werden sie.
  if (i < ebene) {
    if (rolle === 'haut') return Math.max(0.09, 0.42 - 0.08 * (ebene - i));
    if (rolle === 'band') return Math.max(0, 0.45 - 0.11 * (ebene - i));
    if (rolle === 'feld') return Math.max(0, 0.30 - 0.08 * (ebene - i));
    return 0;
  }
  if (i === ebene) return 1;                                // aktiv — voll und dicht
  if (rolle === 'band') return 0.10;                        // tiefere Bänder nur andeuten
  if (rolle === 'feld') return 0.07;                        // tiefere Felder nur als Hauch
  if (rolle === 'marke') return 0.06;
  if (rolle === 'mensch') return 0.42;                      // die Figur scheint durch
  return 0.16;                                              // Zwiebelhaut bleibt sichtbar
}

// ------------------------------------------------- Die Jetzt-Marke nach vorn
// Nach jedem Wechsel von Schicht oder Zeit dreht sich die Kugel um ihre
// Hochachse, bis die Marke zum Betrachter zeigt. Sobald jemand selbst zieht,
// hört sie damit auf und bleibt stehen, wo sie steht.
let ausrichten = true;

function markeNachVorn(dt) {
  const sch = schalen[ebene];
  if (sch.schicht.echtzeit) { ausrichten = false; return; }
  // Die Marke sitzt bei psi auf dem Ring; um sie nach vorn zu holen, muss die
  // Kugel auf -(psi + 90 Grad) stehen. Der kuerzere Weg dorthin wird gewaehlt.
  const psi = Math.PI + anteil(sch.schicht, zeitJahr) * Math.PI * 2;
  const ziel = -(psi + Math.PI / 2);
  let weg = (ziel - welt.rotation.y) % (Math.PI * 2);
  if (weg > Math.PI) weg -= Math.PI * 2;
  if (weg < -Math.PI) weg += Math.PI * 2;
  if (Math.abs(weg) < 0.004) { ausrichten = false; return; }
  welt.rotation.y += weg * Math.min(1, dt * 3.2);
}

// --------------------------------------------------------------- Drehen (frei)
let ziehend = false, letzteX = 0, letzteY = 0, vX = 0, vY = 0;
const el = renderer.domElement;

// Anschieben: nur waagerecht, nur um die eigene Achse. Die Neigung bleibt.
function drehen(dx) {
  if (Math.abs(dx) < 0.0001) return;
  welt.rotation.y += dx * 0.0055;
}

// Zwei Finger kneifen: auseinander taucht ein, zusammen fuehrt hinaus.
// Solange die Finger liegen, folgt die Kamera ihnen unmittelbar; beim Ueber-
// schreiten der Schwelle springt die naechste Schale ein.
const zeiger = new Map();
let kneif0 = 0;

function fingerAbstand() {
  const [a, b] = [...zeiger.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function kneifen() {
  const d = fingerAbstand();
  if (!kneif0) { kneif0 = d; return; }
  const f = d / kneif0;
  ausrichten = false;
  zielAbstand = istAbstand = abstandFuer(ebene) / Math.max(0.6, Math.min(1.75, f));
  if (f > 1.34) { ebeneSetzen(ebene + 1); kneif0 = d; }
  else if (f < 0.75) { ebeneSetzen(ebene - 1); kneif0 = d; }
}

// --------------------------------------------------- Tippen auf ein Band
// Ein kurzer Tipp auf das beschriftete Band taucht eine Schale tiefer — derselbe
// Griff wie auf die Punkte. Trifft der Tipp eine schon durchstoßene Schale, die
// als offene Hälfte am Rand steht, führt er dorthin zurück.
const strahl = new THREE.Raycaster();
const tipp = new THREE.Vector2();
let tippVon = null;

function bandGetroffen(e) {
  const r = el.getBoundingClientRect();
  tipp.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  tipp.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  strahl.setFromCamera(tipp, kamera);
  const treffer = strahl.intersectObjects(bandNetze, false)
    .filter(t => t.object.material.opacity > 0.08);
  if (!treffer.length) return false;
  const i = treffer[0].object.userData.schicht;
  // Die Kopfzeile mit dem Namen liegt oben im Band (v nahe 1): Sie führt zur
  // Erklärung. Der Rest des Bandes taucht eine Schale tiefer.
  // Die Kopfzeile ist am Bildschirm nur ein schmaler Streifen, weil das Band
  // sich dort wegkrümmt — der Griffbereich reicht darum etwas tiefer als die
  // Schrift. Bis zum Namen des Abschnitts (bei 0,51) bleibt Abstand.
  const v = treffer[0].uv ? treffer[0].uv.y : 0;
  if (v > 0.62) {
    if (i !== ebene) ebeneSetzen(i);
    erklaerungOeffnen();
    return true;
  }
  ebeneSetzen(i < ebene ? i : ebene + 1);
  return true;
}

el.addEventListener('pointerdown', e => {
  if (zeiger.size === 0) tippVon = { x: e.clientX, y: e.clientY, t: performance.now() };
  else tippVon = null;
  zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
  el.setPointerCapture(e.pointerId);
  if (zeiger.size >= 2) {                  // zweiter Finger: ab jetzt wird gezoomt
    ziehend = false; vX = 0; vY = 0;
    el.classList.remove('greift');
    kneif0 = fingerAbstand();
    return;
  }
  ziehend = true; ausrichten = false; letzteX = e.clientX; letzteY = e.clientY;
  el.classList.add('greift');
});

el.addEventListener('pointermove', e => {
  const p = zeiger.get(e.pointerId);
  if (p) { p.x = e.clientX; p.y = e.clientY; }
  if (zeiger.size >= 2) { tippVon = null; kneifen(); return; }
  if (!ziehend) return;
  if (tippVon && Math.hypot(e.clientX - tippVon.x, e.clientY - tippVon.y) > 9) tippVon = null;
  const dx = e.clientX - letzteX, dy = e.clientY - letzteY;
  letzteX = e.clientX; letzteY = e.clientY;
  drehen(dx);
  vX = dx; vY = dy;
});

function loslassen(e) {
  zeiger.delete(e.pointerId);
  try { el.releasePointerCapture(e.pointerId); } catch (_) {}
  if (zeiger.size === 0 && tippVon && performance.now() - tippVon.t < 500
      && Math.hypot(e.clientX - tippVon.x, e.clientY - tippVon.y) <= 9) {
    bandGetroffen(e);
  }
  if (zeiger.size === 0) tippVon = null;
  if (zeiger.size < 2) { kneif0 = 0; zielAbstand = abstandFuer(ebene); }
  if (zeiger.size === 1) {
    // Ein Finger bleibt liegen — von hier an wird wieder gedreht, ohne Sprung
    const [p] = [...zeiger.values()];
    letzteX = p.x; letzteY = p.y; vX = 0; vY = 0; ziehend = true;
    el.classList.add('greift');
  }
  if (zeiger.size === 0) { ziehend = false; el.classList.remove('greift'); }
}
el.addEventListener('pointerup', loslassen);
el.addEventListener('pointercancel', loslassen);

// Rad: eintauchen und auftauchen
let radSperre = 0;
el.addEventListener('wheel', e => {
  e.preventDefault();
  const jetzt = performance.now();
  if (jetzt - radSperre < 340) return;
  radSperre = jetzt;
  ebeneSetzen(ebene + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === '+') { ebeneSetzen(ebene + 1); e.preventDefault(); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === '-') { ebeneSetzen(ebene - 1); e.preventDefault(); }
  if (e.key === 'Home') ebeneSetzen(0);
  if (e.key === 'End') ebeneSetzen(SCHICHTEN.length - 1);
});

// ------------------------------------------------------------------- Bedienung
document.getElementById('tiefer').onclick = () => ebeneSetzen(ebene + 1);
document.getElementById('hoeher').onclick = () => ebeneSetzen(ebene - 1);

// ------------------------------------------------------------------ Chronik
// Was zu der eingestellten Zeit geschah — das jüngste Ereignis davor,
// hervorgehoben, und die nächsten beiden danach.
const chronik = document.getElementById('chronik');
const chronikListe = document.getElementById('chronikListe');
const epocheFeld = document.getElementById('epoche');
const halleyFeld = document.getElementById('halley');
let chronikUhr = null;

function chronikFuellen() {
  epocheFeld.textContent = epocheVon(zeitJahr);
  const liste = ereignisseUm(zeitJahr);
  chronikListe.innerHTML = liste.map(e => `
    <li class="${e.laufend ? 'laufend' : ''} ${e.art}">
      <b><i class="art"></i>${jahrText(e.jahr)}</b>
      <span><em>${e.ort}</em>${e.was}</span>
    </li>`).join('') ||
    '<li><span>Vor dieser Zeit reicht keine Überlieferung zurück.</span></li>';

  if (zeitJahr > 2035) {
    chronikListe.insertAdjacentHTML('beforeend',
      '<li class="laufend"><b>—</b><span>Hier endet die Überlieferung. Was folgt, steht nur noch im Zyklus.</span></li>');
  }

  // Der Komet, der als einziger in ein Menschenleben zweimal passt
  const h = halleyUm(zeitJahr);
  halleyFeld.innerHTML = h.letzte === null
    ? `Halleyscher Komet — erste überlieferte Erscheinung ${jahrText(h.naechste)}`
    : `Halleyscher Komet — zuletzt ${jahrText(h.letzte)}` +
      (h.naechste ? `, wieder ${jahrText(h.naechste)}` : '');
  // kurz aufleuchten, damit man den Wechsel bemerkt
  chronik.classList.add('regt');
  clearTimeout(chronikUhr);
  chronikUhr = setTimeout(() => chronik.classList.remove('regt'), 700);
}

// ------------------------------------------------------------------- Lineal
// Ein logarithmischer Maßstab von der Sekunde bis zum Yuga-Zyklus. Er zeigt,
// was die Zwiebel verbirgt: Sechs Schalen drängen sich zwischen drei und
// zweiundzwanzig Jahren, während rechts und links davon Lücken klaffen.
const JAHR_IN_S = 365.2422 * 86400;
const L_MIN = Math.log10(0.6 / JAHR_IN_S);
const L_MAX = Math.log10(40000);
const linealOrt = (jahre) => (Math.log10(jahre) - L_MIN) / (L_MAX - L_MIN) * 100;

// Jahrhundert und Jahrtausend lägen nur acht Prozent auseinander und würden sich
// überschreiben — das Jahrhundert ist hier der nützlichere Anker.
const LINEAL_TEXTE = [
  [1 / JAHR_IN_S, 'Sekunde'], [3600 / JAHR_IN_S, 'Stunde'], [1 / 365.2422, 'Tag'],
  [1, 'Jahr'], [100, 'Jahrhundert']
];

(function linealBauen() {
  const achse = document.getElementById('linealAchse');
  const texte = document.getElementById('linealTexte');
  SCHICHTEN.forEach((sch, i) => {
    const d = sch.dauerJahre ?? sch.periode;
    const m = document.createElement('button');
    m.type = 'button';
    m.className = 'linealMarke';
    m.style.left = linealOrt(d).toFixed(2) + '%';
    m.style.setProperty('--ton', sch.farbe);
    m.title = `${sch.name} — ${sch.dauer}`;
    m.onclick = () => ebeneSetzen(i);
    achse.appendChild(m);
  });
  LINEAL_TEXTE.forEach(([d, name]) => {
    const t = document.createElement('span');
    t.style.left = linealOrt(d).toFixed(2) + '%';
    t.textContent = name;
    texte.appendChild(t);
  });
})();

function linealMarkieren() {
  [...document.getElementById('linealAchse').children]
    .forEach((m, i) => m.classList.toggle('aktiv', i === ebene));
}

// -------------------------------------------- Die linke Spalte am Handy
// Auf schmalen Geräten nimmt die Spalte aus Chronik, Schicht-Tafel und
// Spendenknopf zu viel Platz weg. Dort wird sie zum Pop-up.
const spalte = document.getElementById('linkeSpalte');
const streifen = document.getElementById('streifen');

function spalteZu() {
  spalte.classList.remove('auf');
  streifen.classList.remove('an');
}
document.getElementById('spalteZuKnopf').onclick = spalteZu;
// Am Handy läuft unter der Kugel ein schmaler Streifen mit. Ein Tipp darauf
// klappt dieselbe Tafel auf, die am Rechner ohnehin links steht.
streifen.onclick = () => {
  if (spalte.classList.contains('auf')) spalteZu(); else erklaerungOeffnen();
};

// Die Tafel zur laufenden Schicht aufschlagen — vom Streifen oder vom Namen
// im Band aus. Am Rechner steht sie ohnehin offen; dort wird nur gescrollt.
function erklaerungOeffnen() {
  deutungFeld.hidden = true;
  document.getElementById('deutungKnopf').classList.remove('an');
  if (innerWidth <= 900) {
    spalte.classList.add('auf');
    streifen.classList.add('an');
  }
  tafel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Was im Streifen steht: laufende Schicht, laufender Abschnitt, nächstes Ereignis
const streifenSchicht = document.getElementById('streifenSchicht');
const streifenStand = document.getElementById('streifenStand');
const streifenChronik = document.getElementById('streifenChronik');

function streifenFuellen() {
  const s = SCHICHTEN[ebene];
  streifen.style.setProperty('--ton', s.farbe);
  streifenSchicht.textContent =
    `Schicht ${ebene + 1} von ${SCHICHTEN.length} · ${s.name}`;
  if (s.echtzeit) {
    streifenStand.textContent = s.dauer;
  } else {
    const { seg } = segmentBei(s, zeitJahr);
    streifenStand.textContent =
      `${seg.name}${seg.zusatz ? ', ' + seg.zusatz : ''} · ${s.dauer}`;
  }
  if (zeitJahr > 2035) {
    streifenChronik.textContent = 'Jenseits der Überlieferung — es bleibt der Zyklus';
  } else {
    const liste = ereignisseUm(zeitJahr);
    const lauf = liste.find(e => e.laufend) || liste[0];
    streifenChronik.textContent = lauf ? `${jahrText(lauf.jahr, true)} — ${lauf.was}` : '';
  }
  hoehenMelden();
}

// ----------------------------------------------------------------- Einstieg
// Beim ersten Besuch kurz erklären, was das hier ist. Danach nur noch über das
// Fragezeichen neben dem Titel.
const einstiegFeld = document.getElementById('einstieg');
const EINSTIEG_SCHLUESSEL = 'zeitkugel-einstieg-gesehen';

function einstiegSchliessen() {
  einstiegFeld.hidden = true;
  try { localStorage.setItem(EINSTIEG_SCHLUESSEL, '1'); } catch (_) {}
}
document.getElementById('einstiegKnopf').onclick = () => { einstiegFeld.hidden = false; };
document.getElementById('einstiegZu').onclick = einstiegSchliessen;
document.getElementById('losKnopf').onclick = einstiegSchliessen;

try {
  if (!localStorage.getItem(EINSTIEG_SCHLUESSEL)) einstiegFeld.hidden = false;
} catch (_) { einstiegFeld.hidden = false; }

// ---------------------------------------------------------------- Weltalter
// Die Vergleichstafeln stehen in einer eigenen Ansicht, damit die Schicht-Tafel
// bei ihrer Sache bleibt.
// Die Weltalter sind kein eigenes Fenster mehr: Sie gehören zur äußersten
// Schale und stehen deshalb unten in deren Tafel.
function weltalterHtml(s) {
  if (!s.vergleiche) return '';
  return `
    <p class="terminKopf weltalterKopfZeile">Die Weltalter</p>
    <div class="weltalterTafel"></div>
    ${['figur', 'rechnung'].map(g => {
      const teil = s.vergleiche.filter(v => (v.gruppe || 'figur') === g);
      if (!teil.length) return '';
      return `<p class="terminKopf">${g === 'figur'
        ? 'Dieselbe Figur anderswo' : 'Die großen Rechnungen'}</p>
      ${teil.map(v => `
        <details class="vergleichsBlock">
          <summary>${v.titel}</summary>
          <p class="fliess klein">${v.einleitung}</p>
          <table class="vergleich">${v.zeilen.map(([a, b, c]) =>
            `<tr><td>${a}</td><td>${b}</td><td><i>${c}</i></td></tr>`).join('')}</table>
          <p class="hinweis">${v.nachsatz}</p>
          <p class="quelle quelleKlein">${v.quelle}</p>
        </details>`).join('')}`;
    }).join('')}
    <p class="hinweis">Ausführlich im Arbeitspapier <a href="https://github.com/AbuElia81/zeitkapsel/blob/main/WELTALTER.md"
      target="_blank" rel="noopener noreferrer">WELTALTER.md</a> im Repo.</p>`;
}

// Wo die eingestellte Zeit in den Überlieferungen liegt — der Yuga-Zyklus
// zuerst, dann die anderen. Die Liste wandert mit dem Schieber.
function weltalterZeitTeil() {
  const wo = tafel.querySelector('.weltalterTafel');
  if (!wo) return;
  const y = SCHICHTEN.find(x => x.vergleiche);
  const { seg, vonJahr, bisJahr } = segmentBei(y, zeitJahr);
  const namen = [];
  if (seg.ovid) namen.push(`bei Ovid <b>${seg.ovid.alter}</b>`);
  if (seg.hesiod) namen.push(`bei Hesiod <b>${seg.hesiod.alter}</b>`);

  const zeilen = [{
    name: 'Yuga-Zyklus nach Misra',
    lage: `${seg.name}${seg.zusatz ? ', ' + seg.zusatz : ''}`,
    note: `${jahrText(vonJahr)} bis ${jahrText(bisJahr)}`
         + (namen.length ? ` · ${namen.join(' · ')}` : '')
  }, ...weltalterStand(zeitJahr)];

  wo.innerHTML = zeilen.map(e => `
    <div class="weltalterZeile">
      <span class="waName">${e.name}</span>
      <span class="waLage">${e.lage}</span>
      <span class="waNote">${e.note}</span>
    </div>`).join('');
}



// ------------------------------------------------------------------ Deutung
// Liest aus allen Schalen zugleich und setzt daraus ein Bild der Zeit zusammen.
const deutungFeld = document.getElementById('deutung');
const deutungInhalt = document.getElementById('deutungInhalt');

function deutungFuellen() {
  if (deutungFeld.hidden) return;
  const d = deuten(zeitJahr);
  deutungInhalt.innerHTML = `
    <p class="deutungEpoche">${d.epoche} · ${zeitText(zeitJahr, amJetzt)}</p>
    <h2>${d.titel}</h2>
    <div class="messwerte">${d.messwerte.map(m => `
      <div class="messwert">
        <span class="messName">${m.name}</span>
        <span class="messBalken"><i style="width:${Math.round(m.wert * 100)}%;
          background:${m.ton}"></i></span>
        <span class="messZahl">${Math.round(m.wert * 100)}</span>
      </div>`).join('')}</div>
    ${d.absaetze.map(a => `
      <p class="deutungKopf">${a.kopf}</p>
      <p class="deutungText">${a.text}</p>`).join('')}
    <p class="hinweis">Dies ist eine Deutung, kein Befund. Sie wird aus dem Stand der
      sechzehn Schalen zusammengesetzt, in der Sprache, in der die Quellen selbst von
      den Zeitaltern sprechen. Gewürfelt wird nichts: Dieselbe Zeit ergibt immer
      dieselbe Lesart.</p>`;
}

document.getElementById('deutungKnopf').onclick = () => {
  spalteZu();
  deutungFeld.hidden = !deutungFeld.hidden;
  document.getElementById('deutungKnopf').classList.toggle('an', !deutungFeld.hidden);
  deutungFuellen();
};
document.getElementById('deutungZu').onclick = () => {
  deutungFeld.hidden = true;
  document.getElementById('deutungKnopf').classList.remove('an');
};

// --------------------------------------------------------- Zeitschieber
const schieber = document.getElementById('schieber');
const zeitAnzeige = document.getElementById('zeitAnzeige');
const zeitleiste = document.getElementById('zeitleiste');

// Die Punktleiste steht am Handy oben unter dem Titel; frueher hing sie in der
// Zeitleiste. Sie wird hier nur noch an ihren Platz im Hauptfeld zurueckgesetzt,
// falls eine aeltere Fassung sie verschoben hat.
const leisteFeld = document.getElementById('leiste');
const leisteHeimat = leisteFeld.parentNode;
const leisteNachbar = leisteFeld.nextSibling;
// Streifen und Tafeln richten sich nach der wirklichen Höhe der Zeitleiste,
// damit sie nicht überlappen, wenn deren Knöpfe wachsen.
function hoehenMelden() {
  const w = document.documentElement.style;
  w.setProperty('--zeitHoehe', Math.round(zeitleiste.getBoundingClientRect().height) + 'px');
  w.setProperty('--streifenHoehe', Math.round(streifen.getBoundingClientRect().height || 62) + 'px');
}
addEventListener('resize', hoehenMelden);

function leisteEinhaengen() {
  if (leisteFeld.parentNode !== leisteHeimat)
    leisteHeimat.insertBefore(leisteFeld, leisteNachbar);
}
leisteEinhaengen();
addEventListener('resize', leisteEinhaengen);

schieber.min = RING_ANKER;
schieber.max = RING_ENDE;
schieber.step = 0.0005;
schieber.value = zeitJahr;

function zeitSetzen(j, jetzt = false, vomSchieber = false, richten = true) {
  zeitJahr = Math.min(RING_ENDE, Math.max(RING_ANKER, j));
  amJetzt = jetzt;
  if (!vomSchieber) schieber.value = zeitJahr;
  zeitAnzeige.textContent = zeitText(zeitJahr, amJetzt);
  zeitleiste.classList.toggle('verschoben', !amJetzt);
  markenAktualisieren();
  chronikFuellen();
  deutungFuellen();
  streifenFuellen();
  if (richten) ausrichten = true;
  menschSetzen(yugaLicht(zeitJahr));
  zielNeigung = neigungFuer(zeitJahr);
  tafelZeitTeil();
}

schieber.addEventListener('input', () => zeitSetzen(parseFloat(schieber.value), false, true));

// Die ganze Leiste ist ein Schieber: Wer irgendwo auf ihr nach links oder rechts
// zieht, wandert durch die Zeit — genauso weit, wie der Knopf selbst wandern
// wuerde. Knoepfe und der Schieber selbst behalten ihre eigene Bedienung.
// Viermal feiner als der Knopf selbst: eine Fingerbreite sind rund zwanzig
// Jahre, eine Wischbewegung ueber den Bildschirm ein Viertel des Zyklus.
const ZIEH_FEIN = 4;
let zeitZieht = false, zeitLetztesX = 0;

zeitleiste.addEventListener('pointerdown', e => {
  if (e.target.closest('button, input, a')) return;
  zeitZieht = true; zeitLetztesX = e.clientX;
  zeitleiste.classList.add('zieht');
  try { zeitleiste.setPointerCapture(e.pointerId); } catch (_) {}
});

zeitleiste.addEventListener('pointermove', e => {
  if (!zeitZieht) return;
  const dx = e.clientX - zeitLetztesX;
  zeitLetztesX = e.clientX;
  const breite = Math.max(1, schieber.getBoundingClientRect().width);
  zeitSetzen(zeitJahr + dx * (RING_ENDE - RING_ANKER) / (breite * ZIEH_FEIN), false);
});

function zeitLosLassen(e) {
  if (!zeitZieht) return;
  zeitZieht = false; zeitleiste.classList.remove('zieht');
  try { zeitleiste.releasePointerCapture(e.pointerId); } catch (_) {}
}
zeitleiste.addEventListener('pointerup', zeitLosLassen);
zeitleiste.addEventListener('pointercancel', zeitLosLassen);
document.getElementById('jetztKnopf').onclick = () => zeitSetzen(jahrJetzt(), true);
document.querySelectorAll('#zeitSchritte button').forEach(b => {
  b.onclick = () => zeitSetzen(zeitJahr + parseFloat(b.dataset.schritt), false);
});

// Tiefenleiste
const leiste = document.getElementById('leiste');
SCHICHTEN.forEach((s, i) => {
  const b = document.createElement('button');
  b.className = 'stufe';
  b.style.setProperty('--ton', s.farbe);
  // Außen der größte Punkt, innen der kleinste — die Zwiebel von oben gesehen
  b.style.setProperty('--punktMass',
    (1.35 - 0.75 * (i / (SCHICHTEN.length - 1))).toFixed(3));
  b.innerHTML = `<span class="punktFeld"><span class="punkt"></span></span>
    <span class="stufeText"><em>${s.name}</em><small>${s.dauer}</small></span>`;
  b.onclick = () => ebeneSetzen(i);
  leiste.appendChild(b);
});
function leisteMarkieren() {
  [...leiste.children].forEach((b, i) => {
    b.classList.toggle('aktiv', i === ebene);
    b.classList.toggle('durch', i < ebene);
  });
}

// ----------------------------------------------------------------- Infotafel
const tafel = document.getElementById('tafel');
let tafelUhr = null;

// Formatiert einen Termin je nach Länge des Zyklus grob oder auf den Monat genau
function terminZeile(e, schicht) {
  const fein = schicht.periode && schicht.periode < 40 && !e.grob;
  return `<li><b>${fein ? zeitText(e.jahr, false) : jahrText(e.jahr)}</b>${e.was}</li>`;
}

// Nur die zeitabhängigen Teile der Tafel erneuern
function tafelZeitTeil() {
  const s = SCHICHTEN[ebene];
  const feld = tafel.querySelector('.jetztZeile');
  if (feld) {
    if (s.echtzeit) {
      feld.innerHTML = `<span class="jetztPunkt"></span>${s.jetztText}`;
    } else {
      const { seg, vonJahr, bisJahr } = segmentBei(s, zeitJahr);
      const spanne = s.periode >= 40
        ? ` <em>${jahrText(vonJahr)} bis ${jahrText(bisJahr)}</em>` : '';
      feld.innerHTML = `<span class="jetztPunkt"></span><span>
        <b>${seg.name}</b>${seg.zusatz ? ', ' + seg.zusatz : ''}${spanne}
        ${amJetzt ? `<br><i>${s.jetztText}</i>` : ''}</span>`;
    }
  }
  const ov = tafel.querySelector('.ovidZeile');
  if (ov) {
    const { seg } = segmentBei(s, zeitJahr);
    const block = (kopf, q) => !q ? '' : `
      <span class="ovidKopf">${kopf}</span>
      <b>${q.alter}</b>${q.latein ? ` <i>${q.latein}</i>` : ''}
      <span class="ovidStelle">${q.stelle}</span>
      <span class="ovidText">${q.was}</span>`;
    const inhalt = block('Bei Ovid', seg.ovid) + block('Bei Hesiod', seg.hesiod);
    ov.innerHTML = inhalt;
    ov.style.display = inhalt ? '' : 'none';
  }

  weltalterZeitTeil();

  const sz = tafel.querySelector('.schiefeZeile');
  if (sz) {
    const g = schiefe(zeitJahr);
    const vorher = schiefe(zeitJahr - 100);
    const weit = Math.abs(zeitJahr - 2000) > SCHIEFE_SICHER;
    sz.innerHTML = `Die Achse der Kugel steht so schief wie die der Erde in diesem
      Jahr: <b>${g.toFixed(2).replace('.', ',')}°</b> — ${g > vorher ? 'sie richtet sich auf'
      : 'sie neigt sich weiter'}. Im Milanković-Zyklus von 41.000 Jahren wandert sie
      zwischen 22,1° und 24,5°; am Zeitschieber kippt die Kugel mit.
      <em>Die Kugel zeigt den Ausschlag dreifach überhöht, damit er zu sehen ist —
      die Zahl ist die wahre.</em>
      ${weit ? '<em>So weit draußen ist der Wert fortgeschrieben, nicht gerechnet.</em>' : ''}`;
  }

  const mz = tafel.querySelector('.menschZeile');
  if (mz) {
    const l = yugaLicht(zeitJahr);
    mz.innerHTML = `Der Mensch im Kern steht auf dem Stand des Yuga-Zyklus:
      <b>${menschZustand(l)}</b>. Am Zeitschieber wandelt er sich mit.`;
  }
  const liste = tafel.querySelector('.termine');
  if (liste && s.termine) {
    liste.innerHTML = s.termine(zeitJahr).map(e => terminZeile(e, s)).join('');
  }
}

function tafelFuellen(s) {
  tafel.classList.remove('ein');
  clearTimeout(tafelUhr);
  tafelUhr = setTimeout(() => {
    tafel.style.setProperty('--ton', s.farbe);
    tafel.innerHTML = `
      <p class="stufeNr">Schicht ${String(SCHICHTEN.indexOf(s) + 1).padStart(2, '0')} von ${SCHICHTEN.length}</p>
      <h2>${s.name}</h2>
      <p class="dauer">${s.dauer}</p>
      <p class="unter">${s.untertitel}</p>
      <p class="masstab">${masstab(SCHICHTEN.indexOf(s))}</p>
      <p class="fliess">${s.text}</p>
      <p class="jetztZeile"></p>
      ${s.vergleiche ? '<p class="schiefeZeile"></p><div class="ovidZeile"></div>' : ''}
      ${s.kern ? '<p class="menschZeile"></p>' : ''}
      ${s.termine ? '<p class="terminKopf">Termine</p><ul class="termine"></ul>' : ''}
      <ul class="fakten">${s.fakten.map(f => `<li>${f}</li>`).join('')}</ul>
      ${s.hinweis ? `<p class="hinweis">${s.hinweis}</p>` : ''}
      <p class="quelle">${s.quelle}</p>
      ${weltalterHtml(s)}`;
    tafelZeitTeil();
    tafel.classList.add('ein');
  }, 160);
}

// ----------------------------------------------------------------- Bildschleife
const uhr = new THREE.Clock();
function bild() {
  requestAnimationFrame(bild);
  const dt = Math.min(uhr.getDelta(), 0.05);
  const t = uhr.getElapsedTime();

  // Nachlauf und ruhige Eigendrehung
  if (!ziehend) {
    vX *= 0.972; vY *= 0.972;
    if (Math.abs(vX) > 0.015) drehen(vX);
    else { vX = 0; vY = 0; if (ausrichten) markeNachVorn(dt); }
  }

  // Steht unten ein Pop-up? Dann raeumt die Kugel die untere Haelfte.
  const popOffen = !deutungFeld.hidden
    || !einstiegFeld.hidden || spalte.classList.contains('auf');
  if (popOffen !== tafelFrei) { tafelFrei = popOffen; raumSetzen(); }

  // Kamera sanft nachziehen
  istAbstand += (zielAbstand - istAbstand) * Math.min(1, dt * 3.4);
  kamera.position.z = istAbstand;
  const hoehe = 2 * istAbstand * Math.tan((kamera.fov / 2) * Math.PI / 180);
  // Die Achse folgt der Schiefe des eingestellten Jahres, weich nachgezogen
  istNeigung += (zielNeigung - istNeigung) * Math.min(1, dt * 4.5);
  achse.rotation.z = -istNeigung;

  istVersatz += (versatz - istVersatz) * Math.min(1, dt * 3.4);
  buehneWelt.position.y = istVersatz * hoehe;
  // Der Mensch steht ausserhalb der Weltgruppe — er rueckt eigens mit
  if (menschBuehne) menschBuehne.position.y = istVersatz * hoehe;

  // Schichten ein- und ausblenden
  schalen.forEach((sch, i) => {
    let wach = false;
    sch.teile.forEach(t => {
      if (t.rolle === 'herz') { wach = true; return; }   // schlägt unten im Takt
      const basis = t.rolle === 'mensch' ? (t.mat.userData.ziel ?? 0) : t.grund;
      const soll = basis * zielOpazitaet(i, t.rolle);
      t.mat.opacity += (soll - t.mat.opacity) * Math.min(1, dt * 4);
      t.mat.visible = t.mat.opacity > 0.004;
      if (t.mat.visible) wach = true;
    });
    sch.gruppe.visible = wach;

    // Aufspringen: die beiden Halbschalen weichen nach links und rechts
    const aufZiel = i < ebene ? 1 : 0;
    sch.oeffnung += (aufZiel - sch.oeffnung) * Math.min(1, dt * 4.4);
    const weg = sch.schicht.radius * 1.9 * sch.oeffnung;
    sch.haelften.forEach(h => { h.gruppe.position.x = h.vorz * weg; });

    // Marken der schnellen Zyklen laufen mit
    const s = sch.schicht;
    if (s.echtzeit) {
      const ph = (t % s.echtzeit) / s.echtzeit;        // 0 … 1 im laufenden Zyklus
      markeSetzen(sch, ph);
      if (sch.gruppe.userData.herz) {
        // Herzschlag: zwei Stöße je Zyklus — Systole, dann die Klappen.
        // Größe und Helligkeit schlagen zusammen, damit der Takt deutlich wird.
        const hz = sch.gruppe.userData.herz;
        const st1 = Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2)), 6);
        const st2 = Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2 - 0.9)), 6);
        const schlag = st1 + 0.5 * st2;
        hz.scale.setScalar(menschGrund * 0.42 * (1 + 0.55 * schlag));
        hz.material.opacity = Math.min(1, (hz.material.userData.ziel ?? 1)
          * zielOpazitaet(i, 'mensch') * (0.60 + 0.55 * schlag));
        hz.material.visible = hz.material.opacity > 0.004;
      } else if (sch.gruppe.userData.atem) {
        // Atemzug: ein weiches Weiten und Senken über die ganze Periode
        sch.gruppe.scale.setScalar(1 + 0.055 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2)));
      }
    }
  });

  planetSetzen();
  strahlSetzen(t);
  sterne.rotation.y += dt * 0.004;
  renderer.render(szene, kamera);
}

// -------------------------------------------------------------------- Aufbau
function groesse() {
  const b = buehne.clientWidth, h = buehne.clientHeight;
  renderer.setSize(b, h);
  kamera.aspect = b / h;
  kamera.updateProjectionMatrix();
  raumSetzen();
}
addEventListener('resize', groesse);
groesse();

ebeneSetzen(0, false);
zeitSetzen(jahrJetzt(), true);
bild();

// Solange der Schieber auf der Gegenwart steht, läuft die Zeit weiter
setInterval(() => { if (amJetzt) zeitSetzen(jahrJetzt(), true, false, false); }, 1000);
