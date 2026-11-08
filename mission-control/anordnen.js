/* La Carte · Freie Anordnung im Modus «Fortgeschritten» (Robert 15.10.2026, Karte L’Ambiance: «Bitte auch einstellen, dass man die Elemente hin
   und her schieben kann. Und auch groß, klein, alles so Canva-mäßig.»)
   Ein Klick wählt ein Element der Seite (Rubrik, Gericht, Zeile, Zwischentitel, Spaltenkopf, Hinweis, Zeichen, Fusszeile, Teile des Deckblatts).
   Ziehen verschiebt es, mit Einrasten an Seitenmitte, Satzspiegel, Seitenrand und den anderen Elementen (Hilfslinien; Alt hält das Einrasten an).
   Die vier Ecken machen es grösser oder kleiner, im Verhältnis. Doppelklick schreibt wie bisher direkt in den Text. Pfeiltasten schieben um 0,5 mm
   (mit Umschalt 5 mm). ⌘Z / ⌘⇧Z nimmt zurück und wiederholt, auch Geschriebenes. «Anordnung zurücksetzen» unter jeder Seite.
   Gespeichert wird die Abweichung je Element in den Kartendaten (karte.js, lage = {x, y, s}); Entwurf, Probe-PDF und Veröffentlichen nehmen sie mit.
   Nichts verlässt das Blatt: alles bleibt innerhalb der Seite, damit die PDF genau so aussieht. Vorbild für Ziehen, Griffe und Einrasten:
   L’Imprimerie (_Drucksachen-Studio/studio.js). Ohne Bibliothek. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const FANG = 6;                 // px am Bildschirm, ab da rastet es ein
const S_MIN = 0.4, S_MAX = 3;   // kleiner als 40 % ist auf Papier nicht mehr lesbar
const HIST = [], ZUK = [];
let SEL = null, zug = null, schreibVor = null;

const an = () => window.MCK && MCK.an();
const sc = () => $('#seiten');
const elVon = l => l && sc().querySelector(`[data-l="${CSS.escape(l)}"]`);
const rund = (x, n) => Math.round(x * n) / n;

/* lage lesen und schreiben: «p:<teil>:<eintrag>» am Eintrag, «p:<teil>:<eintrag>:lin» seine Linie, «t:<teil>:<schluessel>» am Teil */
function ort(l) {
  const D = MCK.d(), [a, ti, r1, r2] = l.split(':'), t = D.teile[+ti]; if (!t) return null;
  if (D.woche && window.MITTAG) return ortWoche(D, l);
  if (a === 'p') {
    const u = (t.posten || [])[+r1]; if (!u) return null;
    if (r2 === 'lin') return { u, lies: () => (u.lage || {}).lin, setz: v => { if (v) { u.lage = u.lage || {}; u.lage.lin = v; } else if (u.lage) { delete u.lage.lin; if (!Object.keys(u.lage).length) delete u.lage; } } };
    return { u, lies: () => { const x = Object.assign({}, u.lage || {}); delete x.lin; return x; },
      setz: v => { const lin = (u.lage || {}).lin, n = Object.assign({}, v || {}); if (lin) n.lin = lin; if (Object.keys(n).length) u.lage = n; else delete u.lage; } };
  }
  const key = l.split(':').slice(2).join(':');
  return { lies: () => (t.lage || {})[key], setz: v => { if (v) { t.lage = t.lage || {}; t.lage[key] = v; } else if (t.lage) { delete t.lage[key]; if (!Object.keys(t.lage).length) delete t.lage; } } };
}
/* Mittagsmenü: die Tageskarten entstehen aus der Woche neu, die lage steht deshalb in D.woche.lage (mittag.js) */
function ortWoche(D, l) {
  const [a, ti, r1, r2] = l.split(':'), R = MITTAG.rollen(D.woche), neu = () => MITTAG.anwenden(D);
  const WL = () => (D.woche.lage = D.woche.lage || {}), weg = () => { if (D.woche.lage && !Object.keys(D.woche.lage).length) delete D.woche.lage; };
  if (a === 'p') {
    const key = R[`teile.${ti}.posten.${r1}`]; if (!key) return null;
    if (r2 === 'lin') return { lies: () => ((D.woche.lage || {})[key] || {}).lin, setz: v => { const w = WL(); if (v) { w[key] = w[key] || {}; w[key].lin = v; } else if (w[key]) { delete w[key].lin; if (!Object.keys(w[key]).length) delete w[key]; } weg(); neu(); } };
    return { lies: () => { const x = Object.assign({}, (D.woche.lage || {})[key] || {}); delete x.lin; return x; },
      setz: v => { const w = WL(), lin = (w[key] || {}).lin, n = Object.assign({}, v || {}); if (lin) n.lin = lin; if (Object.keys(n).length) w[key] = n; else delete w[key]; weg(); neu(); } };
  }
  const tk = R[`teile.${ti}`], key = l.split(':').slice(2).join(':'); if (!tk) return null;
  return { lies: () => ((D.woche.lage || {})[tk] || {})[key],
    setz: v => { const w = WL(); if (v) { w[tk] = w[tk] || {}; w[tk][key] = v; } else if (w[tk]) { delete w[tk][key]; if (!Object.keys(w[tk]).length) delete w[tk]; } weg(); neu(); } };
}
function roh(l) { const o = ort(l); return Object.assign({}, (o && o.lies()) || {}); }
function lies(l) { const v = roh(l); return Object.assign(v, { x: +v.x || 0, y: +v.y || 0, s: +v.s || 1 }); }
function setz(l, patch) {   // Felder ändern, alles Neutrale fällt weg (null/leer = wie in der Vorlage)
  const o = ort(l); if (!o) return;
  const n = Object.assign(roh(l), patch);
  if (n.x != null) n.x = rund(+n.x, 10); if (n.y != null) n.y = rund(+n.y, 10);
  if (n.s != null) n.s = rund(+n.s, 100); if (n.t != null) n.t = rund(+n.t, 1000);
  [['b', 10], ['d', 100], ['z', 100], ['mt', 10], ['mb', 10]].forEach(([f, r]) => { if (n[f] != null && n[f] !== '') n[f] = rund(+n[f], r); });
  if (Math.abs(n.x || 0) < 0.05) delete n.x; if (Math.abs(n.y || 0) < 0.05) delete n.y;
  if (n.s != null && Math.abs(n.s - 1) < 0.005) delete n.s; if (n.t != null && Math.abs(n.t - 1) < 0.002) delete n.t;
  Object.keys(n).forEach(k => { if (n[k] == null || n[k] === '' || n[k] === false) delete n[k]; });
  o.setz(Object.keys(n).length ? n : null);
}
function zeige(el, v) { el.style.transform = KARTE.lageStil(v).replace(/^transform:|;transform-origin:0 0$/g, '') || ''; el.style.transformOrigin = '0 0'; }

/* Sichtbarer Inhalt eines Elements: Texte, Zeichen, Linien und Kästen mit Rand oder Fläche. Einträge sind im Satz so breit wie die Spalte,
   eine Rubrik «Vorspeisen» steht aber nur in der Mitte: Rahmen, Einrasten und die Grenze des Blatts richten sich nach dem, was man sieht. */
function inhalt(el) {
  let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
  const nimm = r => { if (r.width < 0.5 && r.height < 0.5) return; L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); };
  const rg = document.createRange(), w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = w.currentNode; n; n = w.nextNode()) {
    if (n.nodeType === 3) { if (n.textContent.trim()) { rg.selectNodeContents(n); [...rg.getClientRects()].forEach(nimm); } continue; }
    if (n.namespaceURI === 'http://www.w3.org/2000/svg') { if (n.tagName === 'svg') nimm(n.getBoundingClientRect()); continue; }
    const c = getComputedStyle(n);
    if (n.tagName === 'IMG' || (n.tagName === 'I' && !n.firstChild) || parseFloat(c.borderTopWidth) || parseFloat(c.borderBottomWidth) || parseFloat(c.borderLeftWidth) || parseFloat(c.borderRightWidth)
      || (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || c.backgroundImage !== 'none') nimm(n.getBoundingClientRect());
  }
  if (L === Infinity) return el.getBoundingClientRect();
  return { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T };
}

function merken(vor) { HIST.push(vor); if (HIST.length > 200) HIST.shift(); ZUK.length = 0; }
function zurueck() { if (!HIST.length) return MCK.sag('Nichts zum Zurücknehmen'); ZUK.push(JSON.stringify(MCK.d())); MCK.setzeD(JSON.parse(HIST.pop())); }
function vor() { if (!ZUK.length) return MCK.sag('Nichts zum Wiederholen'); HIST.push(JSON.stringify(MCK.d())); MCK.setzeD(JSON.parse(ZUK.pop())); }

/* ---------- Auswahl, Griffe, Hilfslinien (im Dokument über der Vorschau, folgen dem Scrollen von selbst) ---------- */
function ebene() {
  let a = $('#anr');
  if (!a) {
    a = document.createElement('div'); a.id = 'anr'; a.className = 'anr'; a.hidden = true;
    a.innerHTML = ['nw', 'ne', 'se', 'sw', 'w', 'e'].map(g => `<i class="anr__g anr__g--${g}" data-g="${g}"></i>`).join('') + '<b class="anr__m"></b>';
    document.body.appendChild(a);
    a.addEventListener('pointerdown', griffAn);
  }
  return a;
}
function box(a, r) { a.style.left = r.left + scrollX + 'px'; a.style.top = r.top + scrollY + 'px'; a.style.width = r.width + 'px'; a.style.height = r.height + 'px'; }
function zeichne(mass) {
  const a = ebene(), el = an() && elVon(SEL);
  if (!el || !el.getBoundingClientRect().width || el.isContentEditable) { a.hidden = true; return; }
  const r = inhalt(el);
  a.classList.toggle('anr--lin', el.hasAttribute('data-lin'));
  a.hidden = false; box(a, { left: r.left - 3, top: r.top - 3, width: r.width + 6, height: r.height + 6 });
  const m = $('.anr__m', a); m.textContent = mass || ''; m.hidden = !mass;
}
function linien(xs, ys, B) {
  $$('.anr-hl').forEach(n => n.remove());
  xs.forEach(x => { const d = document.createElement('i'); d.className = 'anr-hl'; box(d, { left: x, top: B.top, width: 1, height: B.height }); document.body.appendChild(d); });
  ys.forEach(y => { const d = document.createElement('i'); d.className = 'anr-hl'; box(d, { left: B.left, top: y, width: B.width, height: 1 }); document.body.appendChild(d); });
}
function waehle(l) { const neu = l !== SEL; SEL = l; zeichne(); schwebe(null); if (neu) { if (!!l !== OFFEN && (an() || !l)) { OFFEN = !!l; document.body.classList.toggle('gst-offen', OFFEN); MCK.zoom(); } seitenleiste(); } }   // Leiste öffnet beim Wählen, schliesst mit Klick ins Leere, ×, Esc
function schwebe(el) {   // dünner Rahmen um das Element unter dem Zeiger
  let h = $('#anr-h');
  if (!h) { h = document.createElement('div'); h.id = 'anr-h'; h.className = 'anr-h'; document.body.appendChild(h); }
  if (!el || el.dataset.l === SEL || zug || el.isContentEditable) { h.hidden = true; return; }
  const r = inhalt(el); h.hidden = false; box(h, { left: r.left - 3, top: r.top - 3, width: r.width + 6, height: r.height + 6 });
}

/* Unter jeder Seite «Anordnung zurücksetzen», sobald dort etwas verschoben ist */
function knoepfe() {
  $$('.sw', sc()).forEach((f, i) => {
    let k = $('.anr-zu', f);
    const hat = an() && $$('[data-l]', f).some(el => { const v = lies(el.dataset.l); return v.x || v.y || v.s !== 1 || v.b; });
    if (!hat) { if (k) k.remove(); return; }
    if (!k) { k = document.createElement('button'); k.type = 'button'; k.className = 'anr-zu'; k.textContent = 'Anordnung zurücksetzen'; f.appendChild(k); }
    k.dataset.seite = i;
  });
}

/* ---------- Ziehen ---------- */
function ziele(el, blatt) {   // Kanten und Mitten zum Einrasten: Seite, Satzspiegel, alle anderen Elemente der Seite
  // Seite und Satzspiegel haben Vorrang vor den anderen Elementen (die Seitenmitte gewinnt wie in L’Imprimerie)
  const B = blatt.getBoundingClientRect(), xs = [B.left, B.left + B.width / 2, B.right], ys = [B.top, B.top + B.height / 2, B.bottom], exs = [], eys = [];
  const inh = blatt.querySelector('.fluss') || blatt.querySelector('.inhalt');
  if (inh) { const r = inh.getBoundingClientRect(); xs.push(r.left, r.right); ys.push(r.top, r.bottom); }
  $$('[data-l]', blatt).forEach(o => {
    if (o === el || o.contains(el) || el.contains(o)) return;
    if (!o.getBoundingClientRect().width) return;
    const r = inhalt(o);
    exs.push(r.left, r.left + r.width / 2, r.right); eys.push(r.top, r.top + r.height / 2, r.bottom);
  });
  return { xs, ys, exs, eys, B };
}
function fang(werte, ziel) {   // kleinste Verschiebung, mit der eine der Kanten auf ein Ziel fällt
  let best = null;
  for (const w of werte) for (const z of ziel) { const d = z - w; if (Math.abs(d) <= FANG && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, z }; }
  return best;
}
function start(ev, art, el) {
  const blatt = el.closest('.blatt'), R = el.getBoundingClientRect(), C = inhalt(el), k = blatt.getBoundingClientRect().width / parseFloat(blatt.dataset.b);
  const v = lies(SEL);
  // Bei transform-origin 0 0 steht die linke obere Ecke des Kastens bei NL + x·k, der Inhalt um cl·s weiter rechts (alles in Bildschirm-px)
  const M = { NL: R.left - v.x * k, NT: R.top - v.y * k, cl: (C.left - R.left) / v.s, ct: (C.top - R.top) / v.s, cw: C.width / v.s, ch: C.height / v.s };
  zug = { art, el, l: SEL, px: ev.clientX, py: ev.clientY, R: C, M, k, v, cx: v.x, blatt, Z: ziele(el, blatt), vorher: JSON.stringify(MCK.d()), bewegt: false };
  schwebe(null);
  addEventListener('pointermove', zieh); addEventListener('pointerup', ende); addEventListener('pointercancel', ende);
}
function zieh(ev) {
  if (!zug) return;
  let dx = ev.clientX - zug.px, dy = ev.clientY - zug.py;
  if (!zug.bewegt && Math.hypot(dx, dy) < 3) return;
  zug.bewegt = true; ev.preventDefault();
  const { R, k, v, Z } = zug, B = Z.B;
  let n;
  if (zug.art === 'zieh') {
    const lx = [], ly = [];
    if (!ev.altKey) {
      const wx = [R.left + dx, R.left + R.width / 2 + dx, R.right + dx], wy = [R.top + dy, R.top + R.height / 2 + dy, R.bottom + dy];
      const fx = fang(wx, Z.xs) || fang(wx, Z.exs), fy = fang(wy, Z.ys) || fang(wy, Z.eys);
      if (fx) { dx += fx.d; lx.push(fx.z); }
      if (fy) { dy += fy.d; ly.push(fy.z); }
    }
    dx = Math.min(B.right - R.right, Math.max(B.left - R.left, dx)); dy = Math.min(B.bottom - R.bottom, Math.max(B.top - R.top, dy));   // bleibt auf dem Blatt
    linien(lx.filter(x => Math.abs(x - (R.left + dx)) < 1 || Math.abs(x - (R.left + R.width / 2 + dx)) < 1 || Math.abs(x - (R.right + dx)) < 1),
      ly.filter(y => Math.abs(y - (R.top + dy)) < 1 || Math.abs(y - (R.top + R.height / 2 + dy)) < 1 || Math.abs(y - (R.bottom + dy)) < 1), B);
    n = { x: v.x + dx / k, y: v.y + dy / k, s: v.s };
    zeige(zug.el, n); zug.n = n;
    zeichne(`${n.x >= 0 ? '+' : ''}${n.x.toFixed(1)} · ${n.y >= 0 ? '+' : ''}${n.y.toFixed(1)} mm`);
  } else if (zug.art === 'w' || zug.art === 'e') {   // Linie: Länge, die andere Kante bleibt stehen
    const g = zug.art, el = zug.el;
    const w = Math.max(2 * k, Math.min(B.width, R.width + (g === 'e' ? dx : -dx))), b = w / k;
    el.style.setProperty('--lb', b.toFixed(2) + 'mm'); el.style.width = b.toFixed(2) + 'mm';
    const r2 = el.getBoundingClientRect(), fest = g === 'e' ? R.left : R.right, jetzt = g === 'e' ? r2.left : r2.right;
    zug.cx += (fest - jetzt) / k;
    n = { x: zug.cx, y: v.y, s: 1, b: rund(b, 10) };
    zeige(el, n); zug.n = n;
    zeichne(b.toFixed(1) + ' mm');
  } else {
    const g = zug.art, sx = g.includes('e') ? 1 : -1, sy = g.includes('s') ? 1 : -1, M = zug.M;   // die gegenüberliegende Ecke bleibt stehen
    const s1 = (R.width + sx * dx) / M.cw, s2 = (R.height + sy * dy) / M.ch;
    let s = Math.abs(s1 - v.s) > Math.abs(s2 - v.s) ? s1 : s2;
    const maxW = sx > 0 ? B.right - R.left : R.right - B.left, maxH = sy > 0 ? B.bottom - R.top : R.bottom - B.top;
    s = Math.max(S_MIN, Math.min(S_MAX, s, maxW / M.cw, maxH / M.ch));
    const links = sx > 0 ? R.left : R.right - M.cw * s, oben = sy > 0 ? R.top : R.bottom - M.ch * s;
    n = { x: (links - M.NL - M.cl * s) / k, y: (oben - M.NT - M.ct * s) / k, s };
    zeige(zug.el, n); zug.n = n;
    zeichne(Math.round(s * 100) + ' %');
  }
}
function ende() {
  removeEventListener('pointermove', zieh); removeEventListener('pointerup', ende); removeEventListener('pointercancel', ende);
  const z = zug; zug = null; linien([], [], {});
  if (!z) return;
  if (z.bewegt && z.n) { merken(z.vorher); setz(z.l, z.n); MCK.geaendert(); knoepfe(); }
  zeichne();
}
function griffAn(ev) {
  const g = ev.target.closest('[data-g]'); if (!g || !SEL) return;
  const el = elVon(SEL); if (!el) return;
  ev.preventDefault(); ev.stopPropagation();
  start(ev, g.dataset.g, el);
}
/* ---------- Seitenleiste «Gestalten» (Robert 16.10.2026: «Schriftarten, Schriftgrösse und Textart ändern … so ein kleines Side-Menü»).
   Gleiches Aussehen und dieselben Begriffe wie die Leiste in L’Imprimerie. Öffnet beim Wählen, bleibt offen, bis man sie schliesst. ---------- */
const SCHRIFTEN = [['cormorant', 'Cormorant'], ['instrument', 'Instrument Sans'], ['mono', 'DM Mono'], ['cinzel', 'Cinzel']];
const TEXTART = [['normal', 'Normal'], ['kursiv', 'Kursiv'], ['versal', 'Versalien'], ['medium', 'Medium']];
const AUSR = [['links', 'Links'], ['mitte', 'Mitte'], ['rechts', 'Rechts']];
const FNAME = { cormorant: 'Cormorant Garamond', mono: 'DM Mono', instrument: 'Instrument Sans', cinzel: 'Cinzel' };
let OFFEN = false;
const mmVon = px => px * 25.4 / 96;
function art(l, el) {
  if (el.hasAttribute('data-lin')) return 'linie';
  if (/:zeichen/.test(l)) return 'zeichen';
  if (/^p:\d+:\d+$/.test(l)) return 'eintrag';
  return 'text';
}
function hauptText(el) {   // Element mit dem ersten sichtbaren Text: daran wird die Schriftgrösse abgelesen
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent.trim()) return n.parentElement;
  return el;
}
function name(l, el) {
  const a = art(l, el), o = a === 'eintrag' && ort(l), u = o && o.u;
  const t = ((u && (u.name || u.titel || u.text || ((u.zeilen || [])[0] || {}).text)) || hauptText(el).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34);
  return a === 'linie' ? 'Linie' : a === 'zeichen' ? 'Zeichen des Hauses' : (/fuss/.test(l) ? 'Fusszeile' : '«' + t + (t.length >= 34 ? '…' : '') + '»');
}
function pt(el, l) {   // Schriftgrösse, wie sie auf dem Papier steht
  const px = parseFloat(getComputedStyle(hauptText(el)).fontSize) || 12;
  return px * 0.75 * (art(l, el) === 'eintrag' ? 1 : lies(l).s);
}
const segment = (feld, liste, an, kl = '') => `<div class="gst-seg ${kl}">${liste.map(([k, t]) => `<button type="button" data-feld="${feld}" data-wert="${k}" class="${an === k ? 'an' : ''}"${feld === 'f' ? ` style="font-family:${KARTE.SCHRIFT[k].replace(/"/g, "'")}"` : ''}>${t}</button>`).join('')}</div>`;
const groesse = (feld, wert, einheit) => `<div class="gst-gr"><button type="button" data-schritt="${feld}" data-r="-1" aria-label="Kleiner">−</button><input type="text" inputmode="decimal" data-zahl="${feld}" value="${wert}"><span>${einheit}</span><button type="button" data-schritt="${feld}" data-r="1" aria-label="Grösser">+</button></div>`;
const farben = an => `<div class="gst-farben">${Object.entries(KARTE.FARBE).map(([k, v]) => `<button type="button" data-feld="c" data-wert="${k}" title="${k}" style="background:${v}" class="${an === k ? 'an' : ''}"></button>`).join('')}</div>`;
const gruppe = (titel, html) => `<div class="gst-gruppe"><label>${titel}</label>${html}</div>`;
function seitenleiste() {
  let g = $('#gst');
  if (!g) {
    g = document.createElement('aside'); g.id = 'gst'; g.className = 'gst'; g.setAttribute('aria-label', 'Gestalten'); document.body.appendChild(g);
    g.addEventListener('click', klickLeiste); g.addEventListener('change', zahlLeiste);
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('[data-zahl]')) { ev.preventDefault(); ev.target.blur(); } });
  }
  const el = an() && elVon(SEL);
  if (!an()) { OFFEN = false; document.body.classList.remove('gst-offen'); }
  g.hidden = !OFFEN;
  if (!OFFEN) return;
  const kopf = `<div class="gst-kopf"><b>Gestalten</b><button type="button" class="gst-zu" data-tu="zu" aria-label="Leiste schliessen"><svg viewBox="0 0 14 14"><path d="m3 3 8 8M11 3l-8 8"/></svg></button></div>`;
  if (!el) { g.innerHTML = kopf + '<p class="gst-leer">Ein Element der Karte anklicken: Rubrik, Gericht, Zeile, Hinweis, Linie, Zeichen oder ein Teil des Deckblatts.</p>'; return; }
  const a = art(SEL, el), v = lies(SEL), cs = getComputedStyle(el), blatt = el.closest('.blatt'), k = blatt.getBoundingClientRect().width / parseFloat(blatt.dataset.b);
  let h = kopf + `<p class="gst-name">${name(SEL, el).replace(/[<>&]/g, '')}</p>`;
  if (a === 'linie') {
    const r = el.getBoundingClientRect();
    h += gruppe('Stärke', groesse('d', mmVon(parseFloat(cs.height)).toFixed(2), 'mm')) + gruppe('Länge', groesse('b', (r.width / k).toFixed(1), 'mm')) + gruppe('Farbe', farben(v.c));
  } else if (a === 'zeichen') {
    h += gruppe('Grösse', groesse('s', Math.round(v.s * 100), '%')) + gruppe('Farbe', farben(v.c));
  } else {
    const ht = getComputedStyle(hauptText(el)), lh = ht.lineHeight === 'normal' ? 1.2 : parseFloat(ht.lineHeight) / parseFloat(ht.fontSize);
    h += gruppe('Schriftart', segment('f', SCHRIFTEN, v.f, 'gst-seg--schrift')) + gruppe('Schriftgrösse', groesse('pt', pt(el, SEL).toFixed(1), 'pt'))
      + gruppe('Textart', segment('a', TEXTART, v.a)) + gruppe('Farbe', farben(v.c)) + gruppe('Ausrichtung', segment('al', AUSR, v.al))
      + gruppe('Zeilenabstand', groesse('z', (v.z || lh).toFixed(2), '×'));
    if (a === 'eintrag') h += gruppe('Abstand davor', groesse('mt', mmVon(parseFloat(cs.marginTop)).toFixed(1), 'mm')) + gruppe('Abstand danach', groesse('mb', mmVon(parseFloat(cs.marginBottom)).toFixed(1), 'mm'));
  }
  h += `<div class="gst-fuss"><button type="button" class="gst-kn" data-tu="aus">Entfernen</button><button type="button" class="gst-kn" data-tu="vorlage">Teil zurücksetzen</button></div><p class="gst-tipp">Ziehen verschiebt, die Ecken ändern die Grösse${a === 'linie' ? ', die Enden die Länge' : ''}. Entf entfernt, Esc schliesst, ⌘Z nimmt zurück.</p>`;
  g.innerHTML = h;
}
function aendern(patch, schrift) {   // eine Änderung aus der Leiste: merken, setzen, neu setzen (Schriftgrösse und Abstände verteilen die Seiten neu)
  if (!SEL) return;
  merken(JSON.stringify(MCK.d())); setz(SEL, patch);
  const neu = () => MCK.setzeD(MCK.d());
  if (schrift) document.fonts.load('16px ' + KARTE.SCHRIFT[schrift]).then(neu, neu); else neu();
}
function wertNeu(feld, zahl) {
  const el = elVon(SEL); if (!el || !isFinite(zahl)) return;
  const v = lies(SEL), a = art(SEL, el);
  if (feld === 'pt') { const alt = pt(el, SEL), nz = Math.max(4, Math.min(80, zahl)); if (Math.abs(nz - alt) < 0.05) return; return aendern(a === 'eintrag' ? { t: (+v.t || 1) * nz / alt } : { s: Math.max(S_MIN, Math.min(S_MAX, v.s * nz / alt)) }); }
  if (feld === 's') return aendern({ s: Math.max(S_MIN, Math.min(S_MAX, zahl / 100)) });
  if (feld === 'z') return aendern({ z: Math.max(0.8, Math.min(3, zahl)) });
  if (feld === 'mt' || feld === 'mb') return aendern({ [feld]: Math.max(-20, Math.min(60, zahl)) });
  if (feld === 'b') return aendern({ b: Math.max(2, Math.min(parseFloat(el.closest('.blatt').dataset.b), zahl)) });
  if (feld === 'd') return aendern({ d: Math.max(0.1, Math.min(3, zahl)) });
}
const SCHRITT = { pt: 0.5, s: 10, z: 0.05, mt: 0.5, mb: 0.5, b: 1, d: 0.1 };
function klickLeiste(ev) {
  const b = ev.target.closest('button'); if (!b) return;
  if (b.dataset.tu === 'zu') { OFFEN = false; SEL = null; document.body.classList.remove('gst-offen'); $('#gst').hidden = true; MCK.zoom(); return zeichne(); }
  if (b.dataset.tu === 'aus') return entf();
  if (b.dataset.tu === 'vorlage') { const o = SEL && ort(SEL); if (!o) return; merken(JSON.stringify(MCK.d())); o.setz(null); MCK.setzeD(MCK.d()); return MCK.sag('Wie in der Vorlage', '⌘Z holt die Gestaltung zurück.'); }
  if (b.dataset.feld) { const f = b.dataset.feld, w = b.dataset.wert, an = lies(SEL)[f] === w; return aendern({ [f]: an ? null : w }, f === 'f' && !an ? w : ''); }
  if (b.dataset.schritt) { const f = b.dataset.schritt, i = $(`#gst [data-zahl="${f}"]`); return wertNeu(f, parseFloat(String(i.value).replace(',', '.')) + (+b.dataset.r) * SCHRITT[f]); }
}
function zahlLeiste(ev) { const i = ev.target.closest('[data-zahl]'); if (i) wertNeu(i.dataset.zahl, parseFloat(String(i.value).replace(',', '.'))); }
function entf() {   // Entf: Einträge gehen von der Karte (wie «Ausblenden» im Modus Einfach), Linien, Zeichen und Teile des Deckblatts werden unsichtbar
  const el = elVon(SEL); if (!el) return;
  merken(JSON.stringify(MCK.d()));
  const o = ort(SEL); if (!o) return;
  if (art(SEL, el) === 'eintrag' && o.u) o.u.aus = true; else setz(SEL, { aus: true });
  SEL = null; MCK.setzeD(MCK.d()); MCK.sag('Ausgeblendet', '⌘Z holt es zurück.');
}

function schreibtGerade() { const a = document.activeElement; return a && a.isContentEditable && a.closest('#seiten'); }

/* ---------- Ereignisse ---------- */
function verbinden() {
  const S = sc();
  S.addEventListener('pointerdown', ev => {
    if (!an() || ev.button !== 0 || ev.target.closest('.anr-zu')) return;
    const e = schreibtGerade(); if (e && e.contains(ev.target)) return;   // beim Schreiben setzt ein Klick den Zeiger in den Text
    const el = ev.target.closest('[data-l]');
    if (!el) { if (SEL) waehle(null); return; }
    ev.preventDefault();
    if (e) e.blur();
    waehle(el.dataset.l);
    start(ev, 'zieh', el);
  });
  S.addEventListener('dblclick', ev => {   // wie bisher: direkt in den Text schreiben
    if (!an()) return;
    const t = ev.target.closest('[data-k]'); if (!t || t.querySelector('[data-k]')) return;
    if (MCK.d().woche && !t.dataset.q) return;   // Mittagsmenü: nur Texte, die aus einem Feld der Woche kommen
    schreibVor = JSON.stringify(MCK.d());
    t.contentEditable = 'true'; t.spellcheck = true; t.focus();
    let r = null;
    if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(ev.clientX, ev.clientY);
    else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(ev.clientX, ev.clientY); if (p) { r = document.createRange(); r.setStart(p.offsetNode, p.offset); } }
    if (r && t.contains(r.startContainer)) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    $('#anr') && ($('#anr').hidden = true);
  });
  S.addEventListener('focusout', ev => {   // Geschriebenes kommt in den Verlauf für ⌘Z
    if (!an() || !ev.target.isContentEditable || schreibVor == null) return;
    if (JSON.stringify(MCK.d()) !== schreibVor) merken(schreibVor);
    schreibVor = null;
  });
  S.addEventListener('pointermove', ev => { if (an() && !zug) schwebe(ev.target.closest('[data-l]')); });
  S.addEventListener('pointerleave', () => schwebe(null));
  S.addEventListener('scroll', () => zeichne(), { passive: true });
  addEventListener('resize', () => zeichne());
  document.addEventListener('pointerdown', ev => {
    if (!SEL || ev.target.closest('#seiten,#anr,#gst,.leiste,#fenster')) return;
    // F21 (16.10.2026): auf einem Knopf erst nach dem Klick abwählen, sonst verschiebt das Schliessen der Leiste den Knopf und der Klick geht verloren
    if (ev.target.closest('button,a,[data-akt],[data-z],[data-m],[data-zoom],[data-ansicht]')) return addEventListener('pointerup', () => setTimeout(() => waehle(null), 0), { once: true });
    waehle(null);
  });
  document.addEventListener('click', ev => {
    const b = ev.target.closest('.anr-zu'); if (!b || !an()) return;
    const f = $$('.sw', sc())[+b.dataset.seite]; if (!f) return;
    const vor = JSON.stringify(MCK.d());
    $$('[data-l]', f).forEach(el => setz(el.dataset.l, { x: 0, y: 0, s: 1 }));
    if (JSON.stringify(MCK.d()) === vor) return;
    merken(vor); SEL = null; MCK.setzeD(MCK.d()); MCK.sag('Anordnung zurückgesetzt', `Seite ${+b.dataset.seite + 1} steht wieder wie gesetzt. ⌘Z holt sie zurück.`);
  });
  document.addEventListener('keydown', ev => {
    if (!an() || schreibtGerade() || zug) return;
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || !$('#fenster').hidden) return;
    const cmd = ev.metaKey || ev.ctrlKey, k = ev.key.toLowerCase();
    if (cmd && k === 'z') { ev.preventDefault(); return ev.shiftKey ? vor() : zurueck(); }
    if (cmd && k === 'y') { ev.preventDefault(); return vor(); }
    if (!SEL) return;
    if (ev.key === 'Escape') { if (OFFEN) { OFFEN = false; document.body.classList.remove('gst-offen'); $('#gst').hidden = true; MCK.zoom(); } return waehle(null); }
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); return entf(); }
    const st = ev.shiftKey ? 5 : 0.5, p = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[ev.key];
    const el = elVon(SEL); if (!p || !el) return;
    ev.preventDefault();
    const blatt = el.closest('.blatt'), B = blatt.getBoundingClientRect(), R = inhalt(el), kk = B.width / parseFloat(blatt.dataset.b);
    const dx = Math.min((B.right - R.right) / kk, Math.max((B.left - R.left) / kk, p[0])), dy = Math.min((B.bottom - R.bottom) / kk, Math.max((B.top - R.top) / kk, p[1]));
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
    const v = lies(SEL); merken(JSON.stringify(MCK.d()));
    const n = { x: v.x + dx, y: v.y + dy, s: v.s }; setz(SEL, n); zeige(el, lies(SEL)); MCK.geaendert(); knoepfe(); zeichne();
  });
}

/* Beim Öffnen einer Karte federn die Seiten einmal herein (Schweben wie Le Bureau, Robert 16.10.2026); beim Bearbeiten, Neusetzen und
   Zoomen bewegt sich nichts nach. Nur translate und scale, nichts blendet aus dem Unsichtbaren ein. */
let AUF = false, aufUhr = 0;
function auftritt() {
  const S = sc(); if (!AUF || !S || S.hidden) return;
  const f = $$('.sw', S); if (!f.length) return;
  AUF = false;
  f.forEach((x, i) => x.style.setProperty('--i', Math.min(i, 6)));
  S.classList.remove('kt-auf'); void S.offsetWidth; S.classList.add('kt-auf');
  clearTimeout(aufUhr); aufUhr = setTimeout(() => { S.classList.remove('kt-auf'); zeichne(); }, 2400);
}

window.ANORDNEN = {
  gesetzt() { auftritt(); document.body.classList.toggle('anr-an', !!an()); if (!an()) SEL = null; else if (SEL && !elVon(SEL)) SEL = null; knoepfe(); zeichne(); if (!zug) seitenleiste(); },
  neu() { HIST.length = 0; ZUK.length = 0; SEL = null; schreibVor = null; AUF = true; },
  zurueck, vor, inhalt,
};
verbinden();
})();
