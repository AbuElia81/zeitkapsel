import * as THREE from './vendor/three.module.js';
import { SCHICHTEN, anteil, segmentBei, jahrJetzt, jahrText, zeitText, RING_ANKER } from './zyklen.js';

const HG = 0x05070d;

// ---------------------------------------------------------------- Grundgerüst
const buehne = document.getElementById('buehne');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
buehne.appendChild(renderer.domElement);

const szene = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(42, 1, 0.05, 400);
kamera.position.set(0, 0, 14);

const welt = new THREE.Group();      // dreht sich beim Ziehen
szene.add(welt);

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
  agn:         [0.45, 0.95],
  'agn-an':    [0.30, 0.85],
  'agn-aus':   [0.30, 0.85],
  leer:        [0.0, 0.0]
};

// Größte Schriftgröße, mit der der Text noch in die Breite passt
function passend(x, text, breite, basis, minimum, gewicht) {
  if (!text) return basis;
  x.font = `${gewicht} ${basis}px Georgia, serif`;
  const b = x.measureText(text).width;
  if (b <= breite) return basis;
  return Math.max(minimum, Math.floor(basis * breite / b));
}

function bandTextur(schicht, segmente, hoehe, klein) {
  const B = 4096, H = hoehe;
  const c = document.createElement('canvas');
  c.width = B; c.height = H;
  const x = c.getContext('2d');
  const farbe = new THREE.Color(schicht.farbe);
  const rgb = (a) => `rgba(${Math.round(farbe.r * 255)},${Math.round(farbe.g * 255)},${Math.round(farbe.b * 255)},${a})`;

  x.clearRect(0, 0, B, H);
  const gesamt = segmente.reduce((s, g) => s + g.laenge, 0);
  let lauf = 0;

  for (const seg of segmente) {
    const x0 = (lauf / gesamt) * B, br = (seg.laenge / gesamt) * B;
    lauf += seg.laenge;
    const [fuell, linie] = TON[seg.art] || TON.auf;
    if (fuell === 0 && linie === 0) continue;

    x.fillStyle = rgb(fuell * 0.55);
    x.fillRect(x0, 0, br, H);

    // Schraffur für Übergangszeiten
    if (seg.art === 'sandhi') {
      x.save();
      x.beginPath(); x.rect(x0, 0, br, H); x.clip();
      x.strokeStyle = rgb(0.35); x.lineWidth = 2;
      for (let s = -H; s < br + H; s += 14) {
        x.beginPath(); x.moveTo(x0 + s, H); x.lineTo(x0 + s + H, 0); x.stroke();
      }
      x.restore();
    }

    // Trennlinien
    x.strokeStyle = rgb(linie * 0.9); x.lineWidth = 3;
    x.beginPath(); x.moveTo(x0, 0); x.lineTo(x0, H); x.stroke();

    // Beschriftung — die Schrift wird so weit verkleinert, bis sie ins Feld passt
    const gross = klein ? 34 : 52, mittel = klein ? 26 : 38;
    const mx = x0 + br / 2, platz = br - 18;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 10;

    const dauerText = `${String(seg.laenge).replace('.', ',')} ${schicht.einheit}`;

    if (platz >= 52) {
      // Waagerecht: Name oben, Dauer und Richtung darunter
      x.fillStyle = rgb(Math.min(1, linie + 0.25));
      if (seg.name) {
        const gN = passend(x, seg.name, platz, gross, 19, 600);
        x.font = `600 ${gN}px Georgia, "Times New Roman", serif`;
        x.fillText(seg.name, mx, klein ? H / 2 : H * 0.33);
      }
      if (!klein) {
        x.fillStyle = rgb(linie * 0.78);
        const gD = passend(x, dauerText, platz, mittel, 15, 400);
        x.font = `400 ${gD}px Georgia, serif`;
        x.fillText(dauerText, mx, H * 0.63);
        if (seg.zusatz) {
          const gZ = passend(x, seg.zusatz, platz, mittel * 0.86, 14, 400);
          x.font = `400 ${gZ}px Georgia, serif`;
          x.fillStyle = rgb(linie * 0.62);
          x.fillText(seg.zusatz, mx, H * 0.86);
        }
      }
    } else if (platz >= 14 && seg.name) {
      // Schmales Feld (Sandhi): Dauer quer zum Band, wie in der Vorlage
      x.save();
      x.translate(mx, H / 2);
      x.rotate(-Math.PI / 2);
      x.fillStyle = rgb(Math.min(1, linie + 0.25));
      const gQ = Math.min(passend(x, dauerText, H - 26, 30, 14, 400), platz * 1.4);
      x.font = `400 ${gQ}px Georgia, serif`;
      x.fillText(dauerText, 0, 0);
      x.restore();
    }
    x.shadowBlur = 0;
  }
  // Ränder
  x.strokeStyle = rgb(0.55); x.lineWidth = 4;
  x.beginPath(); x.moveTo(0, 2); x.lineTo(B, 2); x.moveTo(0, H - 2); x.lineTo(B, H - 2); x.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
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

// --------------------------------------------------- Gitterkugel (Zwiebelhaut)
function gitterkugel(r, farbe, meridiane = 16, parallelen = 9) {
  const p = [];
  for (let m = 0; m < meridiane; m++) {
    const phi = (m / meridiane) * Math.PI * 2;
    for (let i = 0; i < 96; i++) {
      const t0 = (i / 96) * Math.PI, t1 = ((i + 1) / 96) * Math.PI;
      p.push(r * Math.sin(t0) * Math.cos(phi), r * Math.cos(t0), r * Math.sin(t0) * Math.sin(phi));
      p.push(r * Math.sin(t1) * Math.cos(phi), r * Math.cos(t1), r * Math.sin(t1) * Math.sin(phi));
    }
  }
  for (let k = 1; k <= parallelen; k++) {
    const t = (k / (parallelen + 1)) * Math.PI, rr = r * Math.sin(t), y = r * Math.cos(t);
    for (let i = 0; i < 128; i++) {
      const a0 = (i / 128) * Math.PI * 2, a1 = ((i + 1) / 128) * Math.PI * 2;
      p.push(rr * Math.cos(a0), y, rr * Math.sin(a0));
      p.push(rr * Math.cos(a1), y, rr * Math.sin(a1));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p), 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({
    color: farbe, transparent: true, opacity: 0.16, depthWrite: false
  }));
}

// ------------------------------------------------------------ Schichten bauen
const schalen = SCHICHTEN.map((schicht, i) => {
  const gruppe = new THREE.Group();
  const farbe = new THREE.Color(schicht.farbe);
  const r = schicht.radius;
  const teile = [];

  if (schicht.kern) {
    // Der Kern ist eine leuchtende Vollkugel
    const kernMat = new THREE.MeshBasicMaterial({ color: 0xffd8c4, transparent: true, opacity: 0.95 });
    const kern = new THREE.Mesh(new THREE.SphereGeometry(r * 0.30, 48, 32), kernMat);
    gruppe.add(kern); teile.push({ mat: kernMat, rolle: 'haut' });

    const puls = [kern];
    [[0.46, 0.30], [0.70, 0.13], [1.00, 0.06]].forEach(([g, o]) => {
      const m = new THREE.MeshBasicMaterial({
        color: farbe, transparent: true, opacity: o,
        blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
      });
      const h = new THREE.Mesh(new THREE.SphereGeometry(r * g, 40, 26), m);
      gruppe.add(h); teile.push({ mat: m, rolle: 'haut' });
      puls.push(h);
    });
    const scheinMat = new THREE.SpriteMaterial({
      map: SCHEIN, color: farbe, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const schein = new THREE.Sprite(scheinMat);
    schein.scale.setScalar(r * 3.6);
    gruppe.add(schein); teile.push({ mat: scheinMat, rolle: 'haut' });
    puls.push(schein);

    gruppe.add(gitterkugel(r * 1.25, farbe, 14, 7));
    teile.push({ mat: gruppe.children[gruppe.children.length - 1].material, rolle: 'haut' });
    gruppe.userData.puls = puls;
  } else {
    const gitter = gitterkugel(r, farbe, i < 3 ? 18 : 14, i < 3 ? 9 : 7);
    gruppe.add(gitter); teile.push({ mat: gitter.material, rolle: 'haut' });
    const huelle = new THREE.MeshBasicMaterial({
      color: farbe, transparent: true, opacity: 0.035,
      blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
    });
    gruppe.add(new THREE.Mesh(new THREE.SphereGeometry(r, 40, 26), huelle));
    teile.push({ mat: huelle, rolle: 'haut' });
  }

  // Hauptband am Äquator
  const bandHalb = schicht.kern ? 0.085 : 0.105;
  const bandGeo = new THREE.SphereGeometry(
    schicht.kern ? r * 1.25 : r, 200, 12, 0, Math.PI * 2,
    Math.PI / 2 - bandHalb, bandHalb * 2
  );
  const bandMat = new THREE.MeshBasicMaterial({
    map: bandTextur(schicht, schicht.segmente, 256, false),
    transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 1
  });
  gruppe.add(new THREE.Mesh(bandGeo, bandMat));
  teile.push({ mat: bandMat, rolle: 'band' });

  // Nebenband (nur äußerste Schicht: AGN-Phasen)
  if (schicht.nebenband) {
    const nGeo = new THREE.SphereGeometry(r * 1.035, 200, 8, 0, Math.PI * 2, Math.PI / 2 - 0.20, 0.055);
    const nMat = new THREE.MeshBasicMaterial({
      map: bandTextur(schicht, schicht.nebenband.segmente, 128, true),
      transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 1
    });
    gruppe.add(new THREE.Mesh(nGeo, nMat));
    teile.push({ mat: nMat, rolle: 'band' });
  }

  // Marke „Jetzt“
  const marke = new THREE.Group();
  const mFarbe = new THREE.Color(0xfff2d0);
  const mMat = new THREE.LineBasicMaterial({ color: mFarbe, transparent: true, opacity: 0.95, depthWrite: false });
  const rr = schicht.kern ? r * 1.25 : r;
  const linie = new THREE.BufferGeometry();
  linie.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    rr * 0.86, 0, 0, rr * 1.16, 0, 0
  ]), 3));
  marke.add(new THREE.Line(linie, mMat));
  const kugelMat = new THREE.MeshBasicMaterial({ color: mFarbe, transparent: true, opacity: 1, depthWrite: false });
  const punkt = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.035, r * 0.022), 16, 12), kugelMat);
  punkt.position.x = rr * 1.16;
  marke.add(punkt);
  teile.push({ mat: mMat, rolle: 'marke' }, { mat: kugelMat, rolle: 'marke' });
  gruppe.add(marke);
  gruppe.userData.marke = marke;

  if (schicht.echtzeit && !schicht.kern) gruppe.userData.atem = true;

  welt.add(gruppe);
  teile.forEach(t => { t.grund = t.mat.opacity; });
  return { schicht, gruppe, teile, i };
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

// ------------------------------------------------------------------- Steuerung
let ebene = 0;            // welche Schicht ist aktiv
let versatz = 0;          // schiebt die Kugel bei hochkantem Bild nach oben
let zielAbstand = 14, istAbstand = 14;

function abstandFuer(e) {
  const r = SCHICHTEN[e].radius;
  const grund = r * (e === SCHICHTEN.length - 1 ? 4.4 : 3.15) + 0.7;
  // Bei hochkantem Bild ist das Sichtfeld horizontal enger — dann weiter weg
  return grund / Math.min(1, kamera.aspect || 1);
}

function ebeneSetzen(neu, sanft = true) {
  ebene = Math.max(0, Math.min(SCHICHTEN.length - 1, neu));
  zielAbstand = abstandFuer(ebene);
  if (!sanft) istAbstand = zielAbstand;
  tafelFuellen(SCHICHTEN[ebene]);
  leisteMarkieren();
}

// Zielopazität je Schale abhängig von der aktiven Ebene
function zielOpazitaet(i, rolle) {
  if (i < ebene) return rolle === 'haut' ? 0.055 : 0;       // durchstoßen — nur noch ein Hauch
  if (i === ebene) return 1;                                // aktiv
  if (rolle === 'band') return 0.12;                        // tiefere Bänder nur andeuten
  if (rolle === 'marke') return 0.06;
  return 0.34;                                              // Zwiebelhaut bleibt sichtbar
}

// --------------------------------------------------------------- Drehen (frei)
let ziehend = false, letzteX = 0, letzteY = 0, vX = 0, vY = 0;
const el = renderer.domElement;

function drehen(dx, dy) {
  const laenge = Math.hypot(dx, dy);
  if (laenge < 0.0001) return;
  const achse = new THREE.Vector3(dy, dx, 0).normalize();
  achse.applyQuaternion(kamera.quaternion);          // Achse im Kamerablick
  const q = new THREE.Quaternion().setFromAxisAngle(achse, laenge * 0.0055);
  welt.quaternion.premultiply(q);
}

el.addEventListener('pointerdown', e => {
  ziehend = true; letzteX = e.clientX; letzteY = e.clientY;
  el.setPointerCapture(e.pointerId); el.classList.add('greift');
});
el.addEventListener('pointermove', e => {
  if (!ziehend) return;
  const dx = e.clientX - letzteX, dy = e.clientY - letzteY;
  letzteX = e.clientX; letzteY = e.clientY;
  drehen(dx, dy);
  vX = dx; vY = dy;
});
function loslassen(e) {
  if (!ziehend) return;
  ziehend = false; el.classList.remove('greift');
  try { el.releasePointerCapture(e.pointerId); } catch (_) {}
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

// --------------------------------------------------------- Zeitschieber
const schieber = document.getElementById('schieber');
const zeitAnzeige = document.getElementById('zeitAnzeige');
const zeitleiste = document.getElementById('zeitleiste');

schieber.min = RING_ANKER;
schieber.max = RING_ENDE;
schieber.step = 0.0005;
schieber.value = zeitJahr;

function zeitSetzen(j, jetzt = false, vomSchieber = false) {
  zeitJahr = Math.min(RING_ENDE, Math.max(RING_ANKER, j));
  amJetzt = jetzt;
  if (!vomSchieber) schieber.value = zeitJahr;
  zeitAnzeige.textContent = zeitText(zeitJahr, amJetzt);
  zeitleiste.classList.toggle('verschoben', !amJetzt);
  markenAktualisieren();
  tafelZeitTeil();
}

schieber.addEventListener('input', () => zeitSetzen(parseFloat(schieber.value), false, true));
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
  b.innerHTML = `<span class="punkt"></span><span class="stufeText">
    <em>${s.name}</em><small>${s.dauer}</small></span>`;
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
  const fein = schicht.periode && schicht.periode < 40;
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
      <p class="fliess">${s.text}</p>
      <p class="jetztZeile"></p>
      ${s.termine ? '<p class="terminKopf">Termine</p><ul class="termine"></ul>' : ''}
      <ul class="fakten">${s.fakten.map(f => `<li>${f}</li>`).join('')}</ul>
      ${s.hinweis ? `<p class="hinweis">${s.hinweis}</p>` : ''}
      <p class="quelle">${s.quelle}</p>`;
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
    vX *= 0.94; vY *= 0.94;
    if (Math.abs(vX) > 0.02 || Math.abs(vY) > 0.02) drehen(vX, vY);
    else drehen(0.12, 0);
  }

  // Kamera sanft nachziehen
  istAbstand += (zielAbstand - istAbstand) * Math.min(1, dt * 3.4);
  kamera.position.z = istAbstand;
  const hoehe = 2 * istAbstand * Math.tan((kamera.fov / 2) * Math.PI / 180);
  welt.position.y = versatz * hoehe;

  // Schichten ein- und ausblenden
  schalen.forEach((sch, i) => {
    let wach = false;
    sch.teile.forEach(t => {
      const soll = t.grund * zielOpazitaet(i, t.rolle);
      t.mat.opacity += (soll - t.mat.opacity) * Math.min(1, dt * 4);
      t.mat.visible = t.mat.opacity > 0.004;
      if (t.mat.visible) wach = true;
    });
    sch.gruppe.visible = wach;

    // Marken der schnellen Zyklen laufen mit
    const s = sch.schicht;
    if (s.echtzeit) {
      const ph = (t % s.echtzeit) / s.echtzeit;        // 0 … 1 im laufenden Zyklus
      markeSetzen(sch, ph);
      if (sch.gruppe.userData.puls) {
        // Herzschlag: zwei kurze Stöße je Zyklus — Systole, dann die Klappen
        const p = 1 + 0.11 * Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2)), 6)
                    + 0.055 * Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2 - 0.9)), 6);
        sch.gruppe.userData.puls.forEach(m => m.scale.setScalar(p));
      } else if (sch.gruppe.userData.atem) {
        // Atemzug: ein weiches Weiten und Senken über die ganze Periode
        sch.gruppe.scale.setScalar(1 + 0.055 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2)));
      }
    }
  });

  sterne.rotation.y += dt * 0.004;
  renderer.render(szene, kamera);
}

// -------------------------------------------------------------------- Aufbau
function groesse() {
  const b = buehne.clientWidth, h = buehne.clientHeight;
  renderer.setSize(b, h);
  kamera.aspect = b / h;
  kamera.updateProjectionMatrix();
  zielAbstand = abstandFuer(ebene);
  // Auf schmalen Geräten liegt die Infotafel unten — die Kugel rückt nach oben
  versatz = kamera.aspect < 0.9 ? 0.19 : 0;
}
addEventListener('resize', groesse);
groesse();

welt.rotation.x = -0.34;
ebeneSetzen(0, false);
zeitSetzen(jahrJetzt(), true);
bild();

// Solange der Schieber auf der Gegenwart steht, läuft die Zeit weiter
setInterval(() => { if (amJetzt) zeitSetzen(jahrJetzt(), true); }, 1000);
