/* La Carte · Die Karten des Grand Beau-Rivage selbst pflegen (Robert 11.10.2026).
   Zwei Wege: «Einfach» (Liste mit Fenstern: hinzufügen, ändern, ausblenden, entfernen, verschieben) und «Fortgeschritten» (direkt in der Karte schreiben,
   dazu die Daten der Karte als Text). Jede Änderung landet zuerst im Entwurf; «Veröffentlichen» macht daraus die neue PDF.
   Satz und Vorschau: karte.js (dieselbe Datei setzt auch die PDF). Server: mission_control.py über serve.py. Ohne Bibliothek. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kopie = x => JSON.parse(JSON.stringify(x));
const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const SYM = {
  hoch: '<svg viewBox="0 0 14 14"><path d="m2.5 9 4.5-4.5L11.5 9"/></svg>', runter: '<svg viewBox="0 0 14 14"><path d="m2.5 5 4.5 4.5L11.5 5"/></svg>',
  zu: '<svg viewBox="0 0 14 14"><path d="m3 3 8 8M11 3l-8 8"/></svg>', auge: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><circle cx="8" cy="7" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><path d="m3 1 10 12"/></svg>',
  korb: '<svg viewBox="0 0 14 14"><path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4l.6 7.5h5.8L10.5 4"/></svg>', stift: '<svg viewBox="0 0 14 14"><path d="M9.5 2.5 11.5 4.5 5 11H3V9z"/></svg>',
  plus: '<svg viewBox="0 0 14 14"><path d="M7 2.5v9M2.5 7h9"/></svg>', haken: '<svg viewBox="0 0 14 14"><path d="m2.5 7.5 3 3 6-7"/></svg>',
};
const ART = { gericht: 'Gericht', zeile: 'Zeile', rubrik: 'Rubrik', land: 'Zwischentitel', zw: 'Kleiner Zwischentitel', kopf: 'Spaltenkopf', notiz: 'Hinweis', frei: 'Textblock' };

const GESCHRIEBEN = new Set();
let ANSICHT = 'karte';   // Vorschau: Karte (wie die PDF) oder Website (Restaurant-Seite mit dem gespeicherten Entwurf)   // im Modus Fortgeschritten seit dem letzten Speichern geschriebene Stellen
let LISTE = [], Z = '', STAND = null, D = null, BASIS = '', MODUS = 'einfach', ZEICHEN = '', OFFEN = false, UNDO = [], BLITZ = null, SETZ = 0, ONLINE = false;   // ONLINE: Vercel-Funktion statt serve.py (status liefert «online»): Veröffentlichen druckt die PDF, legt PDF und Stand in den Speicher und setzt die Restaurant-Seiten in sechs Sprachen (seit 15.10.2026; vorher nur PDF und Stand)
const ZM = { einfach: 0.6, frei: 0.78 };   // Grösse der Vorschau je Modus
try { MODUS = localStorage.getItem('mc-modus') || 'einfach'; ZM.einfach = +(localStorage.getItem('mc-zoom-einfach') || 0.6); ZM.frei = +(localStorage.getItem('mc-zoom-frei') || 0.78); } catch (e) { /* ohne Speicher geht es auch */ }

// ---------------------------------------------------------------- Verbindung
async function api(was, daten) {
  const o = daten === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) };
  let r;
  try { r = await fetch('/mission-control/api/' + was, o); } catch (e) { throw new Error('Keine Verbindung zum Server. Läuft die Vorschau auf diesem Rechner (python3 serve.py 8940)?'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.fehler || 'Das hat nicht geklappt.').replace(/^[A-Z]+ · /, ''));
  return j;
}

// ---------------------------------------------------------------- Meldungen
function sag(titel, text = '', knoepfe = [], fehl = false) {
  const m = document.createElement('div');
  m.className = 'quit' + (fehl ? ' fehl' : '');
  m.innerHTML = `<div style="flex:1;min-width:0"><b>${h(titel)}</b>${text ? `<span>${h(text)}</span>` : ''}</div>` + knoepfe.map((k, i) => k.href ? `<a href="${h(k.href)}" target="_blank" rel="noopener">${h(k.t)}</a>` : `<button type="button" data-i="${i}">${h(k.t)}</button>`).join('');
  m.addEventListener('click', ev => { const b = ev.target.closest('button[data-i]'); if (b) { knoepfe[+b.dataset.i].f(); m.remove(); } });
  const ort = $('#meldung'); ort.appendChild(m);
  while (ort.children.length > 2) ort.firstElementChild.remove();   // höchstens zwei Quittungen auf einmal, die neueste unten
  setTimeout(() => m.remove(), fehl ? 12000 : 6000);
}

// ---------------------------------------------------------------- Daten-Hilfen
const teile = () => D.teile;
const geaendert = () => JSON.stringify({ t: D.teile, f: D.fuss }) !== JSON.stringify({ t: STAND.teile, f: STAND.fuss });
function setzePfad(o, pfad, wert) {
  const k = pfad.split('.'); let x = o;
  for (let i = 0; i < k.length - 1; i++) x = x[/^\d+$/.test(k[i]) ? +k[i] : k[i]];
  const l = k[k.length - 1]; x[/^\d+$/.test(l) ? +l : l] = wert;
}
function liesPfad(o, pfad) { return pfad.split('.').reduce((x, k) => x == null ? x : x[/^\d+$/.test(k) ? +k : k], o); }
/* Preis in der Schreibweise der Karte: «18» → «CHF 18», «12» → «CHF 12.00», «4,9» → «4.90», je nach den Nachbarn */
function preisForm(ein, nachbarn) {
  const t = String(ein || '').trim();
  if (!/^\d{1,4}([.,]\d{1,2})?$/.test(t)) return t.replace(/^chf\s*/i, 'CHF ');
  const bsp = nachbarn.filter(Boolean);
  const chf = bsp.length ? bsp.filter(x => /^CHF /.test(x)).length * 2 >= bsp.length : true;
  const rappen = bsp.some(x => /\d\.\d\d$/.test(x));
  let z = t.replace(',', '.');
  if (rappen || /\.\d$/.test(z)) z = (+z).toFixed(2); else if (/\.00$/.test(z)) z = z.slice(0, -3);
  return (chf ? 'CHF ' : '') + z;
}
function nachbarPreise(ti) { return teile()[ti].posten.flatMap(u => u.t === 'gericht' ? u.preise : u.t === 'zeile' ? [u.preis] : []).slice(0, 12); }
/* Rubrik-Blöcke eines Teils: [start, ende) je Rubrik (Einträge vor der ersten Rubrik zählen zum Block davor) */
function bloecke(ti) {
  const p = teile()[ti].posten, aus = [];
  p.forEach((u, i) => { if (u.t === 'rubrik') aus.push([i, p.length]); });
  aus.forEach((b, j) => { if (aus[j + 1]) b[1] = aus[j + 1][0]; });
  return aus;
}
function rubrikVon(ti, i) { const p = teile()[ti].posten; for (let j = i; j >= 0; j--) if (p[j].t === 'rubrik') return p[j]; return null; }

// ---------------------------------------------------------------- Vergleich Stand ↔ Entwurf
function eintraege(daten) {
  const aus = [];
  (daten.teile || []).forEach((t, ti) => {
    if (t.art === 'deckel') { aus.push({ key: 'deckel|' + ti, ort: 'Deckblatt', u: t, art: 'deckel' }); return; }
    let rub = '';
    t.posten.forEach((u, i) => {
      if (u.t === 'rubrik') rub = u.titel;
      aus.push({ key: u.t + '|' + (u.name || u.titel || u.text || (u.zeilen && u.zeilen[0] && u.zeilen[0].text) || ''), ort: u.t === 'rubrik' ? 'Rubrik' : rub, u, art: u.t, ti, i });
    });
  });
  if ((daten.fuss || '') !== '') aus.push({ key: 'fuss|', ort: 'Fusszeile', u: { t: 'notiz', text: daten.fuss }, art: 'fuss' });
  return aus;
}
function vergleich(a, b) {
  const A = eintraege(a), B = eintraege(b), n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].key === B[j].key ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const aus = [], wegA = [], neuB = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i].key === B[j].key) { const x = JSON.stringify(ohneS(A[i].u)), y = JSON.stringify(ohneS(B[j].u)); if (x !== y) aus.push({ art: 'anders', a: A[i], b: B[j] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) wegA.push(A[i++]); else neuB.push(B[j++]);
  }
  while (i < n) wegA.push(A[i++]); while (j < m) neuB.push(B[j++]);
  // gleicher Name an anderer Stelle: verschoben (und vielleicht geändert)
  wegA.slice().forEach(x => { const k = neuB.findIndex(y => y.key === x.key); if (k >= 0) { const y = neuB.splice(k, 1)[0]; wegA.splice(wegA.indexOf(x), 1); aus.push({ art: JSON.stringify(ohneS(x.u)) === JSON.stringify(ohneS(y.u)) ? 'verschoben' : 'anders', a: x, b: y }); } });
  wegA.forEach(x => aus.push({ art: 'weg', a: x })); neuB.forEach(y => aus.push({ art: 'neu', b: y }));
  const na = lageAnders(a, b); if (na) aus.push({ art: 'anordnung', n: na, b: { ort: 'Auf den Seiten' } });
  return aus;
}
function ohneS(u) { const x = { ...u }; delete x.s; delete x.lage; return x; }   // lage: freie Anordnung, zählt als eigene Zeile «Anordnung»
function lagen(daten) {   // Anordnung je Element, Schlüssel wie im Vergleich (gleiche Namen durchgezählt)
  const m = {}, n = {};
  const nimm = (k, l) => { n[k] = (n[k] || 0) + 1; if (l && Object.keys(l).length) m[k + '#' + n[k]] = JSON.stringify(l); };
  (daten.teile || []).forEach((t, ti) => {
    Object.entries(t.lage || {}).forEach(([k, l]) => nimm('teil' + ti + '|' + k, l));
    (t.posten || []).forEach(u => nimm(u.t + '|' + (u.name || u.titel || u.text || ''), u.lage));
  });
  return m;
}
function lageAnders(a, b) { const A = lagen(a), B = lagen(b); return new Set([...Object.keys(A), ...Object.keys(B)].filter(k => A[k] !== B[k])).size; }
function zustand() {   // je Eintrag im Entwurf: neu / anders
  const st = {};
  if (!STAND) return st;
  vergleich(STAND, D).forEach(v => { if (v.b && v.b.ti !== undefined) st[v.b.ti + '.' + v.b.i] = v.art; });
  return st;
}

// ---------------------------------------------------------------- Rand
const FOTO = { ambiance: 'rest-ambiance-6', 'petite-suisse': 'rest-suisse-3', 'vieux-rivage': 'bar-2', weinkarte: 'food-glaeser', mittag: 'z-fluss-balkon' };   // mittag: gedeckter Tisch über der Aare   // Säulensaal, Kamin, Bar am Kamin, zwei Gläser
function rand() {
  $('#rand').innerHTML = `
    <div class="marke"><span class="marke__z">${ZEICHEN}</span><b>La Carte</b><span>Die Karten des<br>Grand Beau-Rivage</span></div>
    <div class="karten"><p class="kap"><span>Ihre Karten</span></p>${LISTE.map(k => `<button class="kw" type="button" data-z="${k.ziel}" aria-current="${k.ziel === Z}"><span class="kw__f" style="background-image:url('../assets/img/${FOTO[k.ziel] || 'rest-ambiance-6'}-s.webp')"></span><b>${h(k.name.replace(/^Karte |^Barkarte /, '').replace(/[«»]/g, ''))}</b><small><em>${h(k.gruppe)}</em>${k.pdf_zeit ? '<span>PDF vom ' + h(k.pdf_zeit) + '</span>' : ''}</small>${k.entwurf || (k.ziel === Z && D && geaendert()) ? '<i>Entwurf</i>' : ''}</button>`).join('')}</div>
    ${Z === 'mittag' ? `<div class="modus" role="group" aria-label="Art der Bearbeitung"><button type="button" data-m="einfach" aria-pressed="${MODUS === 'einfach'}">Einfach</button><button type="button" data-m="frei" aria-pressed="${MODUS === 'frei'}">Fortgeschritten</button></div>
    <p class="modus__t">${MODUS === 'einfach' ? 'Jede Woche ein Formular: Montag wählen, je Tag Salat oder Suppe, Vegetarisch, Fleisch, Fisch und ein Dessert. Jeder Tag wird eine eigene Tageskarte, rechts steht sie sofort.' : 'Sie gestalten direkt in den Tageskarten: jedes Element verschieben, grösser oder kleiner ziehen, Gerichte, Zeiten, Preis und die Zeile am Schluss ändern. Was Sie hier ändern, steht auch im Formular unter «Einfach».'}</p>` : `<div class="modus" role="group" aria-label="Art der Bearbeitung"><button type="button" data-m="einfach" aria-pressed="${MODUS === 'einfach'}">Einfach</button><button type="button" data-m="frei" aria-pressed="${MODUS === 'frei'}">Fortgeschritten</button></div>
    <p class="modus__t">${MODUS === 'einfach' ? 'Gerichte und Getränke in einer Liste: hinzufügen, ändern, ausblenden, entfernen, verschieben. Ein Klick zeigt den Eintrag links und rechts auf derselben Höhe.' : 'Sie gestalten direkt in der Karte: jedes Element verschieben, grösser oder kleiner ziehen, jeden Text ändern, auch Überschriften, Hinweise und das Deckblatt. Dazu die Daten der Karte als Text.'}</p>`}
    <div class="wege"><p class="kap"><span>Wege</span></p>
      <button type="button" data-akt="verlauf">Frühere Fassungen <span>↺</span></button>
      <a href="../unterlagen/index.html" target="_blank" rel="noopener">Unterlagen ansehen <span>↗</span></a>
      <a href="../werkbank/index.html" target="_blank" rel="noopener">Zur Werkbank <span>↗</span></a>
      <a href="../essen-trinken.html" target="_blank" rel="noopener">Restaurants auf der Website <span>↗</span></a></div>`;
  oben();
}
// Kopfleiste wie in Le Bureau (Robert 12.10.2026): Zeichen und Name, in der Mitte die Karte, rechts Anleitung, Le Bureau, Website
function oben() {
  const el = $('#oben'); if (!el) return;
  const k = LISTE.find(x => x.ziel === Z) || {}, g = D && geaendert();
  const BUCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>';
  const PULT = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="8.5" rx="1.4"/><path d="M5.5 14h5M8 11.5V14"/></svg>';
  const WELT = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/></svg>';
  el.innerHTML = `<a class="oben__marke" href="./"><span class="oben__z">${ZEICHEN}</span><span><b>La Carte</b><small>Karten · Grand Beau-Rivage</small></span></a>
    <div class="oben__mitte"><div class="oben__titel">${h(k.name || 'La Carte')}</div><div class="oben__stand">${OFFEN ? 'Nicht gespeichert' : g ? 'Entwurf wartet' : k.pdf_zeit ? 'PDF vom ' + h(k.pdf_zeit) : 'Wie veröffentlicht'}</div></div>
    <div class="oben__werk"><a class="rund" href="../maison/" data-tip="La Maison" aria-label="Zurück zu La Maison"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.6 7.4 8 2.8l5.4 4.6"/><path d="M4 6.4v6.8h8V6.4M6.6 13.2V9.6h2.8v3.6"/></svg></a><a class="rund" href="../werkbank/anleitung/karten/" target="_blank" rel="noopener" data-tip="Anleitung" aria-label="Anleitung">${BUCH}</a><a class="rund" href="../studio/" target="_blank" rel="noopener" data-tip="Le Bureau" aria-label="Le Bureau">${PULT}</a><span class="oben__trenn"></span><a class="kn kn--klein" href="../essen-trinken.html" target="_blank" rel="noopener">Website ansehen<i>${WELT}</i></a></div>`;
}

// ---------------------------------------------------------------- Kopf
function kopf() {
  const k = LISTE.find(x => x.ziel === Z) || {};
  const nm = (k.name || '').match(/^(.*?)\s*«(.*)»\s*$/);
  $('#kopf').innerHTML = `<div class="kopf__in"><span class="kopf__z">${ZEICHEN}</span><h1>${nm ? `${h(nm[1])} <em>${h(nm[2])}.</em>` : h(k.name || '')}</h1><p class="kopf__u"><span>${h(k.gruppe || '')}</span><i></i><span>${MODUS === 'einfach' ? 'Einfach' : 'Fortgeschritten'}</span></p>
    <p class="satz">${Z === 'mittag' && MODUS === 'frei' ? 'Ein Klick wählt ein Element der Tageskarte. Ziehen verschiebt es, die Ecken machen es grösser oder kleiner, ein Doppelklick schreibt in den Text. ⌘Z nimmt zurück. Gespeichert wird mit dem Knopf unten. Ist ein Feld leer, verschwindet die Zeile von der Karte; einen neuen Gang tragen Sie im Modus «Einfach» ein. Auf der Website erscheint die neue Woche erst, wenn Sie unten auf «Veröffentlichen» drücken.' : Z === 'mittag' ? 'Tragen Sie für jeden Tag die Gerichte ein, jeder Tag wird eine eigene Tageskarte. Jede Eingabe wird als Entwurf gespeichert, sobald Sie das Feld verlassen, und steht rechts in der Karte. Auf der Website erscheint die neue Woche erst, wenn Sie unten auf «Veröffentlichen» drücken.' : MODUS === 'einfach' ? 'Ein Klick auf einen Eintrag zeigt ihn links und rechts auf derselben Höhe und lässt ihn kurz aufblinken; Doppelklick oder der Stift öffnet ihn. Jede Änderung wird sofort als Entwurf gespeichert und steht rechts in der Karte, unter «Website» auch auf der Restaurant-Seite. PDF und Website bleiben, wie sie sind, bis Sie unten auf «Veröffentlichen» drücken.'
      : 'Ein Klick wählt ein Element der Karte. Ziehen verschiebt es, die Ecken machen es grösser oder kleiner, ein Doppelklick schreibt in den Text. ⌘Z nimmt zurück. Gespeichert wird mit dem Knopf unten. Neue Gerichte und Rubriken legen Sie im Modus «Einfach» an, oder Sie ändern die Daten der Karte direkt.'}</p></div>
    <div class="kopf__kn">${Z === 'mittag' ? `<button class="kn kn--linie kn--ohne" type="button" data-akt="mw-vor">Woche davor</button><button class="kn" type="button" data-akt="mw-neu">Nächste Woche<i>${SYM.plus}</i></button>` : MODUS === 'einfach' ? `<button class="kn" type="button" data-akt="neu">Neuer Eintrag<i>${SYM.plus}</i></button>` : `<button class="kn kn--linie" type="button" data-akt="daten">Daten der Karte<i>${PF}</i></button>`}</div>`;
}

// ---------------------------------------------------------------- Liste (Einfach)
function zeileHTML(u, ti, i, st) {
  const chip = st === 'neu' ? '<i class="marke-chip">Neu</i>' : st === 'anders' ? '<i class="marke-chip">Geändert</i>' : st === 'verschoben' ? '<i class="marke-chip grau">Verschoben</i>' : '';
  const aus = u.aus ? '<i class="marke-chip grau">Ausgeblendet</i>' : '';
  const k = (zus = '') => `<div class="r__k"><button class="rund" type="button" data-akt="edit" title="Bearbeiten" aria-label="Bearbeiten">${SYM.stift}</button>${zus}<button class="rund" type="button" data-akt="hoch" title="Nach oben" aria-label="Nach oben">${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" title="Nach unten" aria-label="Nach unten">${SYM.runter}</button><button class="rund gefahr" type="button" data-akt="weg" title="Entfernen" aria-label="Entfernen">${SYM.korb}</button></div>`;
  const d = `data-ti="${ti}" data-i="${i}"`;
  if (u.t === 'rubrik') return `<div class="r r--rubrik" ${d}><div class="r__t" data-akt="waehle"><b>${h(u.titel)}</b>${u.en ? `<small>${h(u.en)}</small>` : ''}${chip}</div>${k(`<button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="neu-hier">Eintrag hinzufügen</button>`)}</div>`;
  if (u.t === 'land' || u.t === 'zw' || u.t === 'kopf') return `<div class="r r--klein ${u.t === 'land' ? 'r--land' : ''}" ${d}><div class="r__t" data-akt="waehle"><b>${h(u.text)}</b>${chip}</div>${k()}</div>`;
  if (u.t === 'notiz' || u.t === 'frei') return `<div class="r r--klein r--notiz" ${d}><div class="r__t" data-akt="waehle"><b>${h(u.t === 'frei' ? u.zeilen.map(z => z.text).join(' ') : u.text)}</b>${chip}</div>${k()}</div>`;
  const name = u.name, z = u.t === 'gericht' ? (u.zeilen || []).filter(x => !x.en).map(x => x.text).join(' · ') : '', p = u.t === 'gericht' ? (u.preise || []).join(' · ') : u.preis;
  return `<div class="r${u.aus ? ' aus' : ''}" ${d}><div class="r__t" data-akt="waehle"><b>${h(name)}</b>${u.zusatz ? `<small>${h(u.zusatz)}</small>` : ''}${chip}${aus}${z ? `<span>${h(z)}</span>` : ''}</div><span class="r__p">${h(p || '')}</span>
    ${k(`<button class="rund" type="button" data-akt="aus" title="${u.aus ? 'Wieder zeigen' : 'Vorübergehend ausblenden'}" aria-label="${u.aus ? 'Wieder zeigen' : 'Ausblenden'}">${u.aus ? SYM.augezu : SYM.auge}</button>`)}</div>`;
}
/* Mittagsmenü der Woche: Formular statt Liste (mittag.js bildet daraus die Karte) */
function wocheHTML() {
  const w = D.woche, n = w.tage.length;
  const f = (pfad, titel, wert, ph = '') => `<label class="feld"><span>${titel}</span><textarea class="mw-t" rows="1" data-mw="${pfad}"${ph ? ` placeholder="${h(ph)}"` : ''}>${h(wert)}</textarea></label>`;
  const tage = w.tage.map((t, i) => `<div class="teil mw-tag${t.zu ? ' mw-tag--zu' : ''}"><div class="mw-in">
      <p class="mw-name">${h(MITTAG.tagName(w.ab, i))}</p>
      ${t.zu ? f(`tage.${i}.hinweis`, 'Hinweis auf der Karte', t.hinweis, 'An diesem Tag gibt es kein Mittagsmenü.') : `
      <p class="mw-gang">Vorspeise</p><div class="feld zw2">${f(`tage.${i}.salat`, 'Salat', t.salat)}${f(`tage.${i}.suppe`, 'oder Suppe', t.suppe)}</div>
      <p class="mw-gang">Hauptgang</p><div class="feld zw3">${f(`tage.${i}.vegi`, 'Vegetarisch', t.vegi)}${f(`tage.${i}.fleisch`, 'Fleisch', t.fleisch)}${f(`tage.${i}.fisch`, 'Fisch', t.fisch)}</div>
      <p class="mw-gang">Dessert</p>${f(`tage.${i}.dessert`, 'Dessert', t.dessert)}`}
      <label class="mw-zu"><input type="checkbox" data-mw="tage.${i}.zu"${t.zu ? ' checked' : ''}> An diesem Tag kein Mittagsmenü</label>
    </div></div>`).join('');
  return `<div class="teil"><div class="mw-in">
      <div class="feld zw2"><label class="feld"><span>Woche ab Montag</span><input type="date" data-mw="ab" value="${h(w.ab)}"></label><label class="feld"><span>Auf der Karte</span><input value="${h(MITTAG.spanne(w.ab, n))}" disabled></label></div>
    </div></div>${tage}
    <div class="teil"><div class="mw-in"><p class="mw-name">Für jede Woche gleich</p>
      ${f('zeiten', 'Zeiten', w.zeiten)}<div class="feld zw2">${f('preis', 'Preis', w.preis)}${f('zusatz', 'Dazu', w.zusatz)}</div>${f('spruch', 'Zeile am Schluss', w.spruch)}${f('fuss', 'Fusszeile', w.fuss)}
    </div></div>`;
}
/* Felder der Woche wachsen mit dem Text (kein Abschneiden nach rechts), Enter schreibt keine neue Zeile */
function mwWachsen(el) { (el ? [el] : document.querySelectorAll('#liste textarea.mw-t')).forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }); }
document.addEventListener('input', ev => { if (ev.target.matches && ev.target.matches('textarea.mw-t')) mwWachsen(ev.target); });
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('textarea.mw-t')) ev.preventDefault(); });
window.addEventListener('resize', () => mwWachsen());
function wocheSetzen(pfad, wert) {
  if (pfad === 'ab') wert = MITTAG.montag(wert || D.woche.ab);
  setzePfad(D.woche, pfad, wert);
  MITTAG.anwenden(D);
}
function wocheSchieben(r) {   // r = +1 nächste Woche (leere Tage), -1 Woche davor (nur das Datum)
  const neu = MITTAG.iso(MITTAG.datum(D.woche.ab, 7 * r));
  if (r < 0) return tun(() => wocheSetzen('ab', neu), 'Woche davor', 'Nur das Datum ist eine Woche früher, die Gerichte bleiben.');
  frage('Nächste Woche <em>anlegen?</em>', `Die Karte gilt dann ab ${MITTAG.tagName(neu, 0)}. Die Gerichte werden geleert, Zeiten und Preis bleiben. Die bisherige Woche bleibt unter «Frühere Fassungen».`, 'Nächste Woche',
    () => tun(() => { D.woche.tage = D.woche.tage.map(() => MITTAG.leererTag()); wocheSetzen('ab', neu); }, 'Nächste Woche angelegt', 'Jetzt die Gerichte eintragen.'));
}

function liste() {
  if (Z === 'mittag') { $('#liste').innerHTML = wocheHTML(); mwWachsen(); return; }
  const st = zustand();
  $('#liste').innerHTML = teile().map((t, ti) => {
    if (t.art === 'deckel') return `<div class="teil"><div class="r r--deckel" data-ti="${ti}"><span class="r__z">${ZEICHEN}</span><div class="r__t" data-akt="edit-deckel"><b>${h(t.titel)}</b><span>${h(t.unter || 'Deckblatt')}${t.zeilen && t.zeilen.length ? ' · ' + h(t.zeilen.join(' · ')) : ''}</span></div><div class="r__k"><button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="edit-deckel">Deckblatt ändern</button></div></div></div>`;
    return `<div class="teil" data-teil="${ti}">${t.posten.map((u, i) => zeileHTML(u, ti, i, st[ti + '.' + i])).join('')}
      <div class="neu-zeile"><button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="neu-ende" data-ti="${ti}">Eintrag am Ende</button><button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="rubrik-neu" data-ti="${ti}">Neue Rubrik</button></div></div>`;
  }).join('');
  if (BLITZ) { const r = $(`.r[data-ti="${BLITZ[0]}"][data-i="${BLITZ[1]}"]`); if (r) { r.classList.add('blitz'); r.scrollIntoView({ block: 'nearest' }); } BLITZ = null; }
}

// ---------------------------------------------------------------- Vorschau
function vorschau() {
  const nr = ++SETZ;
  requestAnimationFrame(() => {
    if (nr !== SETZ) return;
    const sc = $('#seiten'), oben = sc.scrollTop, fensterOben = window.scrollY;
    const r = KARTE.setze(D, ZEICHEN, $('#mess'), true);
    sc.innerHTML = r.seiten.map((s, i) => `<figure class="sw">${s}<figcaption class="nr">Seite ${i + 1} von ${r.seiten.length}</figcaption></figure>`).join('');
    $("#v-zahl").textContent = `${r.seiten.length} ${r.seiten.length === 1 ? "Seite" : "Seiten"}, wie in der PDF`;
    zoomAlle();
    const Q = Z === 'mittag' ? MITTAG.quellen(D.woche) : null;   // Mittagsmenü: nur Texte, die aus einem Feld der Woche kommen (Datum und Gänge setzt die Woche)
    const anr = MODUS === 'frei' && window.ANORDNEN;   // freie Anordnung (anordnen.js): Klick wählt, Ziehen schiebt, Doppelklick schreibt
    if (MODUS === 'frei') $$('[data-k]', sc).forEach(el => { if (Q) { if (!Q[el.dataset.k] || el.querySelector('[data-k]')) return; el.dataset.q = Q[el.dataset.k][0]; el.dataset.vor = Q[el.dataset.k][1]; } if (!anr) { el.contentEditable = 'true'; el.spellcheck = true; } if (GESCHRIEBEN.has(el.dataset.k)) el.classList.add('geaendert'); });
    sc.scrollTop = oben; if (MODUS === 'frei') window.scrollTo(0, fensterOben);
    if (window.ANORDNEN) ANORDNEN.gesetzt();
  });
}

/* Verkleinern per transform statt zoom: Safari bricht unter zoom die Zeilen anders um als beim Messen, dann rutschte das Seitenende aus dem Blatt
   (Weinkarte S. 7, 8, 10, Robert 15.10.2026). Der Platz im Fluss wird über negative Ränder auf die verkleinerte Grösse gebracht. */
function zoomAlle() {
  const sc = $('#seiten');
  $$('.blatt', sc).forEach(b => {
    const w = parseFloat(b.dataset.b) * 96 / 25.4, hh = parseFloat(b.dataset.h) * 96 / 25.4;
    const z = Math.min(ZM[MODUS], Math.max(.3, (sc.clientWidth - 24) / w));   // am Handy nie breiter als die Vorschau (12.10.2026)
    b.style.transform = `scale(${z})`; b.style.marginRight = (w * (z - 1)).toFixed(2) + 'px'; b.style.marginBottom = (hh * (z - 1)).toFixed(2) + 'px';
  });
  if (window.ANORDNEN) ANORDNEN.gesetzt();
}
/* Klick links oder rechts: die andere Seite springt auf dieselbe Höhe und blinkt kurz (wie beim Carlton, Robert 15.10.2026) */
function zeigeLinks(ti, i) {
  $$('#liste .r.gewaehlt').forEach(x => x.classList.remove('gewaehlt'));
  const r = $(`#liste .r[data-ti="${ti}"][data-i="${i}"]`); if (!r) return null;
  r.classList.add('gewaehlt'); r.classList.remove('blitz'); void r.offsetWidth; r.classList.add('blitz');
  return r;
}
function blitzRechts(ti, i, y) {   // y: Höhe im Fenster, auf der die Zeile links steht (oder stehen wird)
  if (ANSICHT === 'website') return;
  const sc = $('#seiten'), pf = `teile.${ti}.posten.${i}`;
  const t = $$(`[data-k="${pf}"],[data-k^="${pf}."]`, sc); if (!t.length) return;
  const r0 = t[0].getBoundingClientRect(), s0 = sc.getBoundingClientRect();
  sc.scrollTo({ top: Math.max(0, sc.scrollTop + r0.top + r0.height / 2 - y), behavior: 'smooth' });
  t.forEach(el => { el.classList.remove('blitz'); void el.offsetWidth; el.classList.add('blitz'); });
}
function linksMitte(r) {           // Zeile links mittig ins Fenster; liefert die Höhe, auf der sie danach steht
  const rr = r.getBoundingClientRect(), max = document.documentElement.scrollHeight - innerHeight;
  const ziel = Math.min(max, Math.max(0, scrollY + rr.top + rr.height / 2 - innerHeight / 2));
  window.scrollTo({ top: ziel, behavior: 'smooth' });
  return rr.top + rr.height / 2 - (ziel - scrollY);
}
function waehle(ti, i) {           // aus der Liste: Karte rechts springt auf dieselbe Höhe
  const r = zeigeLinks(ti, i); if (!r) return;
  const rr = r.getBoundingClientRect(); blitzRechts(ti, i, rr.top + rr.height / 2);
}
function waehleAusVorschau(ti, i) { // aus der Karte: Liste links springt hin, Karte zieht auf dieselbe Höhe nach
  const r = zeigeLinks(ti, i); if (!r) return;
  blitzRechts(ti, i, linksMitte(r));
}

// ---------------------------------------------------------------- Website-Vorschau
const WEBSEITE = { ambiance: ['restaurant-lambiance.html', 'karte'], 'petite-suisse': ['restaurant-la-petite-suisse.html', 'karte'], 'vieux-rivage': ['bar-le-vieux-rivage.html', 'karte'], weinkarte: ['restaurant-lambiance.html', 'getraenke'], mittag: ['restaurant-lambiance.html', 'karte'] };
function website(neu) {
  const an = ANSICHT === 'website';
  $('#seiten').hidden = an; $('#web').hidden = !an;
  $$('.ansicht button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ansicht === ANSICHT));
  if (!an) return vorschau();
  const [seite, anker] = WEBSEITE[Z], f = $('#web-f'), r = $('.web__rahmen');
  r.style.setProperty('--wz', (r.clientWidth / 1280).toFixed(4));
  $('#v-zahl').textContent = (OFFEN ? 'Website ohne die ungespeicherten Eingaben' : 'Website mit dem Entwurf');
  const url = `/mission-control/website?z=${Z}&seite=${seite}&t=${Date.now()}`;
  if (neu || !f.dataset.z || f.dataset.z !== Z) { f.dataset.z = Z; f.src = url; f.onload = () => { try { const d = f.contentDocument, el = d.getElementById(anker); d.querySelectorAll('[data-r]').forEach(x => x.classList.add('da')); if (el) el.scrollIntoView({ block: 'start' }); } catch (e) { /* gleiche Herkunft, sollte gehen */ } }; }
}
window.addEventListener('resize', () => { const r = $('.web__rahmen'); if (r) r.style.setProperty('--wz', (r.clientWidth / 1280).toFixed(4)); });

// ---------------------------------------------------------------- Leiste
function leiste() {
  oben();
  const g = geaendert(), n = g ? vergleich(STAND, D).length : 0;
  const sp = OFFEN ? 'gelb' : (leiste.gruen ? 'gruen' : 'grau');
  $('#leiste').innerHTML = `<div class="leiste__t"><b>${OFFEN ? 'Nicht gespeicherte Änderungen' : g ? `Entwurf: ${n} ${n === 1 ? 'Änderung' : 'Änderungen'}` : 'PDF und Website sind auf dem neuesten Stand.'}</b>
      <span>${OFFEN ? 'Speichern legt sie im Entwurf ab. PDF und Website ändern sich erst beim Veröffentlichen.' : g ? 'Noch nicht in PDF und Website. Vorher und nachher ansehen, Probe drucken, dann veröffentlichen.' : 'Jede Änderung wartet zuerst als Entwurf.'}</span></div>
    ${g ? '<button class="link" type="button" data-akt="verwerfen">Entwurf verwerfen</button>' : ''}
    <button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="vgl"${g ? '' : ' disabled'}>Vorher / nachher</button>
    <button class="kn kn--klein kn--ohne kn--linie" type="button" data-akt="probe">Probe-PDF</button>
    <button class="kn kn--klein sp ${sp}" type="button" data-akt="speichern">${OFFEN ? 'Speichern' : sp === 'gruen' ? 'Gespeichert' : 'Alles gespeichert'}<i>${sp === 'gruen' ? SYM.haken : PF}</i></button>
    <button class="kn${g && !OFFEN ? ' glanz-kn' : ''}" type="button" data-akt="veroeffentlichen"${g || OFFEN ? '' : ' disabled'}>Veröffentlichen<i>${PF}</i></button>`;
}
function alles() { kartenCss(); rand(); kopf(); document.body.classList.toggle('frei', MODUS === 'frei'); if (MODUS === 'einfach') liste(); vorschau(); website(true); leiste(); }

// ---------------------------------------------------------------- Speichern
async function speichern(was, text, ohneUndo) {
  const vorher = BASIS;
  let r;
  try { r = await api('entwurf', { z: Z, daten: D, was }); } catch (e) { sag('Nicht gespeichert', e.message, [], true); return false; }
  OFFEN = false; GESCHRIEBEN.clear(); $$('#seiten .geaendert').forEach(x => x.classList.remove('geaendert'));
  if (!r.geaendert) { sag('Nichts geändert, nichts gespeichert.'); leiste(); return true; }
  if (!ohneUndo) UNDO.push(vorher);
  BASIS = JSON.stringify(D);
  leiste.gruen = true; setTimeout(() => { leiste.gruen = false; if (!OFFEN) leiste(); }, 2600);
  const k = LISTE.find(x => x.ziel === Z); if (k) k.entwurf = geaendert();
  rand(); leiste(); if (MODUS === 'einfach') liste();
  if (ANSICHT === 'website') website(true);
  sag(was || 'Im Entwurf gespeichert', text || 'PDF und Website ändern sich erst beim Veröffentlichen.', [{ t: 'Rückgängig', f: rueckgaengig }, { t: 'Vorher / nachher', f: vglFenster }]);
  return true;
}
async function rueckgaengig() {
  if (!UNDO.length) return sag('Nichts zum Zurücknehmen.');
  D = JSON.parse(UNDO.pop());
  if (await speichern('Zurückgenommen', 'Der Entwurf steht wieder wie vor der letzten Änderung.', true)) alles();
}
async function tun(fn, was, text, blitz) {   // Änderung im Einfach-Modus: anwenden, sofort speichern, neu zeichnen
  const alt = JSON.stringify(D);
  fn();
  if (JSON.stringify(D) === alt) return sag('Nichts geändert, nichts gespeichert.');
  BLITZ = blitz || null;
  liste(); vorschau();
  await speichern(was, text);
}

// ---------------------------------------------------------------- Fenster
function fenster(html, schmal) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Schliessen">${SYM.zu}</button>${html}</div>`;
  f.hidden = false;
  f.onclick = ev => { if (ev.target === f || ev.target.closest('[data-zu]')) zu(); };
  const erst = $('input,textarea,select', f); if (erst) setTimeout(() => erst.focus(), 30);
}
function zu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; f.oninput = null; }
function frage(titel, text, ja, f) {
  fenster(`<h2>${titel}</h2><p class="satz">${h(text)}</p><div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="ja">${h(ja)}<i>${PF}</i></button></div>`, true);
  $('#ja').addEventListener('click', () => { zu(); f(); });
}
function mini(u) {   // ein Eintrag so, wie er auf der Karte steht
  return `<section class="blatt ${h(D.kl || '')}" style="width:${D.format[0]}mm"><div class="inhalt"><div class="fluss">${KARTE.baustein(u)}</div></div></section>`;
}

/* Eintrag bearbeiten oder neu anlegen. ort: { ti, i } (bearbeiten) oder { ti, nach } (neu nach Index, -1 = ganz oben) */
function eintragFenster(ort) {
  const neu = ort.i === undefined;
  const p = teile()[ort.ti].posten;
  let u = neu ? null : kopie(p[ort.i]);
  let art = neu ? (ort.art || vermutlich(ort.ti, ort.nach)) : u.t;
  if (neu) u = leer(art);
  const rub = rubrikVon(ort.ti, neu ? Math.max(ort.nach, 0) : ort.i);
  const arten = neu ? ['gericht', 'zeile', 'notiz', 'land'] : [art];
  const feld = (id, titel, wert, hilfe = '', mehr = false) => `<label class="feld"><span>${titel}</span>${mehr ? `<textarea id="${id}" rows="2">${h(wert)}</textarea>` : `<input id="${id}" value="${h(wert)}">`}${hilfe ? `<small>${hilfe}</small>` : ''}</label>`;
  const felder = () => {
    if (art === 'gericht') {
      const de = (u.zeilen || []).filter(z => !z.en && !(z.preise || []).length).map(z => z.text).join('\n'), en = (u.zeilen || []).filter(z => z.en).map(z => z.text).join('\n');
      const mp = (u.zeilen || []).some(z => (z.preise || []).length);
      return feld('f-name', 'Name', u.name, '', false) + `<div class="feld zw2">${feld('f-zusatz', 'Zusatz hinter dem Namen', u.zusatz || '', 'Klein, z. B. «4cl» oder «1 dl.». Darf leer bleiben.')}${feld('f-preis', 'Preis', (u.preise || []).join(' · '), 'Mehrere Preise mit · trennen. «18» wird zu «' + h(preisForm('18', nachbarPreise(ort.ti))) + '».')}</div>`
        + feld('f-de', 'Beschreibung', de, 'Zutaten oder Herkunft, wie auf der Karte. Eine neue Zeile mit Enter.', true) + feld('f-en', 'Englisch', en, 'Steht kursiv und etwas heller darunter.', true)
        + (mp ? '<p class="feld"><small>Dieser Eintrag hat Zeilen mit eigenem Preis. Die ändern Sie im Modus «Fortgeschritten» direkt in der Karte.</small></p>' : '');
    }
    if (art === 'zeile') return feld('f-name', 'Name', u.name, 'So, wie es in der Zeile steht, mit Herkunft oder Prozent.') + feld('f-preis', 'Preis', u.preis, 'Nur die Zahl genügt. «9» wird zu «' + h(preisForm('9', nachbarPreise(ort.ti))) + '».');
    if (art === 'rubrik') return feld('f-titel', 'Titel', u.titel) + feld('f-en', 'Englisch', u.en || '', 'Steht kleiner unter dem Titel. Darf leer bleiben.');
    if (art === 'frei') return feld('f-de', 'Text', (u.zeilen || []).filter(z => !z.en).map(z => z.text).join('\n'), '', true) + feld('f-en', 'Englisch', (u.zeilen || []).filter(z => z.en).map(z => z.text).join('\n'), '', true);
    if (art === 'notiz') return feld('f-text', 'Hinweis', u.text, '', true) + `<label class="feld"><span>Sprache</span><select id="f-sprache"><option value="de"${u.en ? '' : ' selected'}>Deutsch (normal)</option><option value="en"${u.en ? ' selected' : ''}>Englisch (kursiv)</option></select></label>`;
    return feld('f-text', ART[art], u.text);
  };
  const lese = () => {
    const v = id => { const el = $('#' + id); return el ? el.value : ''; };
    const np = nachbarPreise(ort.ti);
    if (art === 'gericht') {
      const alt = u.zeilen || [], deA = alt.filter(z => !z.en && !(z.preise || []).length).map(z => z.text).join('\n'), enA = alt.filter(z => z.en).map(z => z.text).join('\n');
      const de = v('f-de').split('\n').map(x => x.trim()).filter(Boolean), en = v('f-en').split('\n').map(x => x.trim()).filter(Boolean);
      const zeilen = (de.join('\n') === deA && en.join('\n') === enA) ? alt : alt.filter(z => (z.preise || []).length).concat(de.map(text => ({ text })), en.map(text => ({ text, en: true })));
      const x = { ...u, name: v('f-name').trim(), zeilen, preise: v('f-preis').split(/\s*[·|]\s*/).map(x => x.trim()).filter(Boolean).map(x => preisForm(x, np)) };
      if (v('f-zusatz').trim()) x.zusatz = v('f-zusatz').trim(); else delete x.zusatz;
      return x;
    }
    if (art === 'zeile') return { ...u, name: v('f-name').trim(), preis: preisForm(v('f-preis'), np) };
    if (art === 'rubrik') return { ...u, titel: v('f-titel').trim(), en: v('f-en').trim() };
    if (art === 'frei') return { ...u, zeilen: v('f-de').split('\n').filter(x => x.trim()).map(text => ({ text: text.trim() })).concat(v('f-en').split('\n').filter(x => x.trim()).map(text => ({ text: text.trim(), en: true }))) };
    if (art === 'notiz') return { ...u, text: v('f-text').trim(), en: v('f-sprache') === 'en' };
    return { ...u, text: v('f-text').trim() };
  };
  const zeichne = () => {
    fenster(`<h2>${neu ? 'Neu auf <em>die Karte.</em>' : `${ART[art]} <em>bearbeiten.</em>`}</h2>
      <p class="satz">${rub ? `Rubrik «${h(rub.titel)}»` : 'Am Anfang der Karte'}. Rechts steht der Eintrag so, wie er in der PDF erscheint.</p>
      ${neu ? `<div class="feld"><span>Art</span><div class="chips" id="f-art">${arten.map(a => `<button type="button" data-a="${a}" aria-pressed="${a === art}">${ART[a]}</button>`).join('')}</div></div>` : ''}
      <div class="zwei"><div id="f-felder">${felder()}</div><div><p class="mono" style="margin:0 0 8px">So steht es auf der Karte</p><div class="mini" id="f-mini">${mini(u)}</div>
        ${neu ? '' : `<label class="feld" style="margin-top:16px;flex-direction:row;align-items:center;gap:10px"><input type="checkbox" id="f-aus" style="width:auto"${u.aus ? '' : ' checked'}><span style="letter-spacing:.1em">Auf der Karte zeigen</span></label>`}</div></div>
      <p class="fehler" id="f-fehler" role="alert"></p>
      <div class="fenster__kn">${neu ? '' : '<button class="link" type="button" id="f-weg" style="margin-right:auto">Von der Karte nehmen</button>'}<button class="kn kn--linie kn--ohne" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="f-ok">${neu ? 'Auf die Karte setzen' : 'Speichern'}<i>${PF}</i></button></div>`);
    const f = $('#fenster');
    f.oninput = () => { u = lese(); if ($('#f-aus')) u.aus = !$('#f-aus').checked; if (!u.aus) delete u.aus; $('#f-mini').innerHTML = mini(u); $('#f-fehler').textContent = ''; };
    const ch = $('#f-art'); if (ch) ch.addEventListener('click', ev => { const b = ev.target.closest('[data-a]'); if (!b) return; art = b.dataset.a; u = leer(art); zeichne(); });
    const weg = $('#f-weg'); if (weg) weg.addEventListener('click', () => entfernen(ort.ti, ort.i));
    $('#f-ok').addEventListener('click', async () => {
      const x = lese(); if ($('#f-aus') && !$('#f-aus').checked) x.aus = true; else delete x.aus;
      const fehlt = (art === 'gericht' || art === 'zeile') && !x.name ? 'Bitte einen Namen eintragen.' : art === 'rubrik' && !x.titel ? 'Bitte einen Titel eintragen.' : (['notiz', 'land', 'zw', 'kopf'].includes(art) && !x.text) ? 'Bitte einen Text eintragen.' : '';
      if (fehlt) { $('#f-fehler').textContent = fehlt; return; }
      if (!neu && JSON.stringify(x) === JSON.stringify(p[ort.i])) { zu(); return sag('Nichts geändert, nichts gespeichert.'); }
      zu();
      const name = x.name || x.titel || x.text || '';
      if (neu) { x.s = (p[Math.max(ort.nach, 0)] || {}).s || 1; await tun(() => p.splice(ort.nach + 1, 0, x), `${ART[art]} auf der Karte`, `«${name}» steht jetzt im Entwurf.`, [ort.ti, ort.nach + 1]); }
      else await tun(() => { p[ort.i] = x; }, `${ART[art]} gespeichert`, `«${name}»`, [ort.ti, ort.i]);
    });
  };
  zeichne();
}
function leer(art) { return art === 'gericht' ? { t: 'gericht', name: '', zeilen: [], preise: [] } : art === 'zeile' ? { t: 'zeile', name: '', preis: '' } : art === 'rubrik' ? { t: 'rubrik', titel: '', en: '' } : art === 'frei' ? { t: 'frei', zeilen: [] } : art === 'notiz' ? { t: 'notiz', text: '', en: false } : { t: art, text: '' }; }
function vermutlich(ti, nach) {   // was in diesem Abschnitt üblich ist: Zeilen in Tafeln, sonst Gerichte
  const p = teile()[ti].posten;
  for (let j = Math.max(nach, 0); j < p.length && j <= nach + 3; j++) if (p[j] && (p[j].t === 'zeile' || p[j].t === 'gericht')) return p[j].t;
  for (let j = nach; j >= 0; j--) if (p[j].t === 'zeile' || p[j].t === 'gericht') return p[j].t;
  return 'gericht';
}
function deckelFenster(ti) {
  const t = teile()[ti];
  fenster(`<h2>Deckblatt <em>ändern.</em></h2><p class="satz">Titel und Zweitzeile auf dem dunklen Deckblatt. Weitere Zeilen stehen klein darunter.</p>
    <label class="feld"><span>Titel</span><input id="d-t" value="${h(t.titel)}"></label><label class="feld"><span>Zweitzeile</span><input id="d-u" value="${h(t.unter || '')}"></label>
    <label class="feld"><span>Weitere Zeilen</span><textarea id="d-z" rows="3">${h((t.zeilen || []).join('\n'))}</textarea><small>Eine Zeile je Absatz.</small></label>
    <p class="fehler" id="d-f"></p><div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="d-ok">Speichern<i>${PF}</i></button></div>`, true);
  $('#d-ok').addEventListener('click', async () => {
    const titel = $('#d-t').value.trim(); if (!titel) { $('#d-f').textContent = 'Das Deckblatt braucht einen Titel.'; return; }
    zu(); await tun(() => { t.titel = titel; t.unter = $('#d-u').value.trim(); t.zeilen = $('#d-z').value.split('\n').map(x => x.trim()).filter(Boolean); }, 'Deckblatt gespeichert', titel);
  });
}
function rubrikNeu(ti, nach) {
  fenster(`<h2>Neue <em>Rubrik.</em></h2><p class="satz">Zum Beispiel «Für Kinder» oder «Raritäten». Danach legen Sie die Einträge darunter an.</p>
    <label class="feld"><span>Titel</span><input id="r-t" placeholder="z. B. Für Kinder"></label><label class="feld"><span>Englisch</span><input id="r-e" placeholder="z. B. For Children"></label>
    <p class="fehler" id="r-f"></p><div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="r-ok">Anlegen<i>${PF}</i></button></div>`, true);
  $('#r-ok').addEventListener('click', async () => {
    const titel = $('#r-t').value.trim(); if (!titel) { $('#r-f').textContent = 'Bitte einen Titel eintragen.'; return; }
    const p = teile()[ti].posten, at = nach === undefined ? p.length : nach;
    zu(); await tun(() => p.splice(at, 0, { t: 'rubrik', titel, en: $('#r-e').value.trim(), s: (p[at - 1] || p[0] || {}).s || 1 }), 'Rubrik angelegt', `«${titel}». Jetzt Einträge darunter hinzufügen.`, [ti, at]);
  });
}
function entfernen(ti, i) {
  const p = teile()[ti].posten, u = p[i];
  if (u.t === 'rubrik') {
    const b = bloecke(ti).find(x => x[0] === i), n = b ? b[1] - b[0] - 1 : 0;
    return frage('Rubrik <em>entfernen?</em>', n ? `«${u.titel}» und die ${n} Einträge darunter verschwinden aus der Karte. Bis zum Veröffentlichen holen Sie alles mit «Rückgängig» oder «Entwurf verwerfen» zurück.` : `«${u.titel}» verschwindet aus der Karte.`, 'Entfernen',
      () => tun(() => p.splice(i, b ? b[1] - b[0] : 1), 'Rubrik entfernt', u.titel));
  }
  const name = u.name || u.titel || u.text || 'Eintrag';
  frage('Von der Karte <em>nehmen?</em>', `«${name}» verschwindet aus der Karte. Wenn es nur vorübergehend ist, blenden Sie es lieber aus (Auge). Bis zum Veröffentlichen lässt es sich zurückholen.`, 'Von der Karte nehmen',
    () => tun(() => p.splice(i, 1), 'Von der Karte genommen', name));
}
function schiebe(ti, i, r) {
  const p = teile()[ti].posten, u = p[i];
  if (u.t === 'rubrik') {   // ganze Rubrik mit ihren Einträgen gegen die Nachbar-Rubrik tauschen
    const b = bloecke(ti), k = b.findIndex(x => x[0] === i), n = b[k + r];
    if (!n) return;
    const [a, c] = r < 0 ? [n, b[k]] : [b[k], n];
    return tun(() => { const vorn = p.slice(a[0], a[1]), hinten = p.slice(c[0], c[1]); p.splice(a[0], c[1] - a[0], ...hinten, ...vorn); }, 'Reihenfolge gespeichert', `«${u.titel}» steht jetzt weiter ${r < 0 ? 'oben' : 'unten'}`, [ti, r < 0 ? a[0] : a[0] + (c[1] - c[0])]);
  }
  const j = i + r; if (j < 0 || j >= p.length) return;
  tun(() => { [p[i], p[j]] = [p[j], p[i]]; }, 'Reihenfolge gespeichert', `«${u.name || u.text || u.titel}» steht jetzt weiter ${r < 0 ? 'oben' : 'unten'}`, [ti, j]);
}
function neuGlobal() {
  const opts = [];
  teile().forEach((t, ti) => { if (t.art !== 'inhalt') return; t.posten.forEach((u, i) => { if (u.t === 'rubrik') opts.push([ti, i, u.titel]); }); });
  fenster(`<h2>Neuer <em>Eintrag.</em></h2><p class="satz">In welche Rubrik? Der Eintrag kommt an ihr Ende, verschieben lässt er sich danach mit den Pfeilen.</p>
    <div class="chips" id="g-r" style="margin-bottom:6px">${opts.map(([ti, i, t], k) => `<button type="button" data-k="${k}" aria-pressed="false">${h(t)}</button>`).join('')}</div>`, false);
  $('#g-r').addEventListener('click', ev => { const b = ev.target.closest('[data-k]'); if (!b) return; const [ti, i] = opts[+b.dataset.k]; const bl = bloecke(ti).find(x => x[0] === i); eintragFenster({ ti, nach: (bl ? bl[1] : i + 1) - 1 }); });
}

// ---------------------------------------------------------------- Vorher / nachher, Verlauf, Daten
function text(u) {
  if (!u) return '';
  if (u.t === 'gericht' || u.t === 'frei') return `${u.name ? `<b>${h(u.name)}${u.zusatz ? ' <small>' + h(u.zusatz) + '</small>' : ''}</b>` : ''}${(u.zeilen || []).map(z => z.en ? `<em>${h(z.text)}</em>` : `<span>${h(z.text)}${(z.preise || []).length ? ' · ' + h(z.preise.join(' · ')) : ''}</span><br>`).join('')}${(u.preise || []).length ? `<span class="mono" style="letter-spacing:.06em">${h(u.preise.join(' · '))}</span>` : ''}${u.aus ? '<br><i class="marke-chip grau">Ausgeblendet</i>' : ''}`;
  if (u.t === 'zeile') return `<b>${h(u.name)}</b><span class="mono" style="letter-spacing:.06em">${h(u.preis)}</span>`;
  if (u.t === 'rubrik') return `<b>${h(u.titel)}</b>${u.en ? `<em>${h(u.en)}</em>` : ''}`;
  if (u.art === 'deckel' || u.titel) return `<b>${h(u.titel)}</b><em>${h(u.unter || '')}</em>${(u.zeilen || []).map(x => `<span>${h(x)}</span>`).join('<br>')}`;
  return `<span>${h(u.text)}</span>`;
}
function markiere(a, b) {   // gleiche Wörter normal, andere hervorgehoben
  const wa = new Set(a.replace(/<[^>]+>/g, ' ').split(/\s+/));
  return b.replace(/>([^<]+)</g, (m, t) => '>' + t.split(/(\s+)/).map(w => w.trim() && !wa.has(w) ? `<mark>${w}</mark>` : w).join('') + '<');
}
function vglFenster() {
  const v = vergleich(STAND, D);
  const W = { neu: 'Neu', weg: 'Entfernt', anders: 'Geändert', verschoben: 'Verschoben', anordnung: 'Anordnung' };
  fenster(`<h2>Vorher <em>und nachher.</em></h2><p class="satz">${v.length ? `${v.length} ${v.length === 1 ? 'Stelle' : 'Stellen'} im Entwurf. Links steht, was heute in der PDF steht, rechts der Entwurf. Was neu ist, ist markiert.` : 'Der Entwurf ist gleich wie die PDF.'}</p>
    <div class="vgl__k"><span></span><span class="mono">Heute in der PDF</span><span class="mono">Im Entwurf</span></div>
    <div class="vgl">${v.map(x => { if (x.art === 'anordnung') return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:rgba(26,29,40,.6)">${h(x.b.ort)}</small></span><div>Wie gesetzt</div><div>${x.n} ${x.n === 1 ? 'Element verschoben oder in der Grösse geändert' : 'Elemente verschoben oder in der Grösse geändert'}</div></div>`; const a = x.a ? text(x.a.u) : '', b = x.b ? text(x.b.u) : ''; return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:rgba(26,29,40,.6)">${h((x.b || x.a).ort || '')}</small></span><div class="${a ? '' : 'leer'}">${a ? (x.art === 'weg' ? `<del>${a}</del>` : a) : 'stand noch nicht da'}</div><div class="${b ? '' : 'leer'}">${b ? (x.art === 'anders' ? markiere(a, b) : b) : 'nicht mehr auf der Karte'}</div></div>`; }).join('')}</div>
    <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Schliessen</button>${v.length ? `<button class="kn" type="button" id="v-ok">Veröffentlichen<i>${PF}</i></button>` : ''}</div>`);
  const ok = $('#v-ok'); if (ok) ok.addEventListener('click', veroeffentlichen);
}
async function verlaufFenster() {
  let l = [];
  try { l = (await api('verlauf?z=' + Z)).liste; } catch (e) { return sag('Verlauf nicht lesbar', e.message, [], true); }
  fenster(`<h2>Frühere <em>Fassungen.</em></h2><p class="satz">Jede veröffentlichte Fassung bleibt aufbewahrt, dazu jeder verworfene Entwurf. Eine Fassung zurückholen legt sie in den Entwurf; PDF und Website ändern sich erst beim Veröffentlichen.</p>
    <div class="verlauf">${l.length ? l.map(x => `<div class="verlauf__z"><div><b style="font-family:var(--serif);font-size:19px;font-weight:500">${x.art === 'verworfen' ? 'Verworfener Entwurf' : 'Veröffentlicht'}</b><br><span class="mono" style="letter-spacing:.08em">${h(x.zeit)} · ${x.posten} Einträge</span></div><button class="kn kn--klein kn--ohne kn--linie" type="button" data-d="${h(x.datei)}">In den Entwurf holen</button></div>`).join('') : '<p>Noch keine früheren Fassungen. Die erste entsteht beim ersten Veröffentlichen.</p>'}</div>
    <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Schliessen</button></div>`);
  $('#fenster').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-d]'); if (!b) return;
    try { await api('zurueckholen', { z: Z, datei: b.dataset.d }); } catch (e) { return sag('Nicht geholt', e.message, [], true); }
    zu(); await lade(Z); sag('Fassung im Entwurf', 'Prüfen Sie vorher und nachher, dann veröffentlichen.', [{ t: 'Vorher / nachher', f: vglFenster }]);
  });
}
function datenFenster() {
  fenster(`<h2>Daten <em>der Karte.</em></h2><p class="satz">Für Fortgeschrittene: die ganze Karte als Text. Jeder Eintrag hat eine Art (t): rubrik, gericht, zeile, land, zw, kopf, notiz, frei. «aus»: true blendet einen Eintrag aus. Nach «Übernehmen» steht die Karte rechts, gespeichert wird mit dem Knopf unten.</p>
    <textarea class="daten" id="j-t" spellcheck="false">${h(JSON.stringify({ fuss: D.fuss, teile: D.teile }, null, 1))}</textarea><p class="fehler" id="j-f"></p>
    <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="j-ok">Übernehmen<i>${PF}</i></button></div>`);
  $('#j-ok').addEventListener('click', () => {
    let x; try { x = JSON.parse($('#j-t').value); } catch (e) { $('#j-f').textContent = 'Der Text ist kein gültiges Format: ' + e.message; return; }
    if (!Array.isArray(x.teile)) { $('#j-f').textContent = 'Es fehlen die Teile der Karte.'; return; }
    const ok = x.teile.every(t => t.art === 'deckel' || (t.art === 'inhalt' && Array.isArray(t.posten) && t.posten.every(u => ART[u.t])));
    if (!ok) { $('#j-f').textContent = 'Ein Teil oder Eintrag hat eine unbekannte Art.'; return; }
    D.teile = x.teile; D.fuss = x.fuss || ''; OFFEN = JSON.stringify(D) !== BASIS; zu(); vorschau(); leiste();
    sag('Übernommen', 'Noch nicht gespeichert. Mit «Speichern» unten landet es im Entwurf.');
  });
}

// ---------------------------------------------------------------- Probe, Veröffentlichen, Verwerfen
async function probe() {
  if (OFFEN && !(await speichern('Im Entwurf gespeichert', 'Vor der Probe gespeichert.'))) return;
  sag('Probe-PDF wird gedruckt', 'Einen Moment.');
  try {
    const r = await api('probe', { z: Z, daten: { teile: D.teile, fuss: D.fuss } });   // Teile und Fusszeile gehen mit: im Vorführ-Betrieb online kennt die PDF-Funktion den Entwurf sonst nicht
    const adr = r.pdf ? URL.createObjectURL(new Blob([Uint8Array.from(atob(r.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' })) : r.url;   // dort kommt die PDF in der Antwort (14.10.2026)
    sag('Probe-PDF fertig', `${r.seiten} Seiten, ${r.art === 'entwurf' ? 'aus dem Entwurf' : 'wie veröffentlicht'}. Die echte PDF bleibt unverändert.`, [{ t: 'Probe öffnen', href: adr }]);
  }
  catch (e) { sag('Keine Probe-PDF', e.message, [], true); }
}
async function veroeffentlichen() {
  if (OFFEN && !(await speichern('Im Entwurf gespeichert', 'Vor dem Veröffentlichen gespeichert.'))) return;
  if (!geaendert()) { zu(); return sag('Nichts geändert, nichts veröffentlicht.'); }
  const LEICHT = Z === 'mittag' || ONLINE;   // online: PDF und Stand in den Speicher, danach die Restaurant-Seiten in sechs Sprachen (Schritte kommen vom Server, carte_pdf.js)
  const SCHRITTE = ONLINE ? ['Die Karte wird gesetzt', 'Die PDF wird gedruckt', 'PDF und Stand kommen in den Speicher der Website', 'Im Speicher nachgeprüft'].concat(Z === 'mittag' ? [] : ['Die Restaurant-Seiten werden gesetzt, in sechs Sprachen']) : LEICHT ? ['Die Karte wird gesetzt', 'Die PDF wird gedruckt', 'Die neue Fassung wird übernommen'] : ['Eine Probe-Kopie wird angelegt', 'Die Karte wird gesetzt', 'Die PDF wird gedruckt', 'Die Website-Seiten werden gebaut', 'Unterlagen und Werkbank werden erneuert', 'PDF und Website werden geprüft', 'Die neue Fassung wird übernommen'];
  fenster(`<div class="lade"><div class="lade__r"></div><h2>${Z === 'mittag' ? 'Die Karte der Woche <em>entsteht.</em>' : 'PDF und Website <em>entstehen.</em>'}</h2><p class="satz" style="margin:0">${ONLINE && Z !== 'mittag' ? 'Die PDF wird gedruckt, geprüft und in den Speicher der Website gelegt, danach bekommen die Restaurant- und Bar-Seiten in sechs Sprachen die neue Karte. Erst dann gilt sie. Das dauert etwa eine Minute.' : ONLINE ? 'Die PDF wird gedruckt, geprüft und in den Speicher der Website gelegt, erst dann gilt sie. Das dauert etwa eine halbe Minute.' : LEICHT ? 'Die PDF wird gedruckt und geprüft, erst dann tauscht die Website sie aus. Das dauert etwa eine halbe Minute.' : 'Alles wird zuerst in einer Probe gebaut und geprüft. Erst wenn PDF und Website-Seiten stimmen, wird umgeschaltet; sonst bleibt alles, wie es ist. Das dauert etwa drei Minuten.'}</p><ol id="l-s">${SCHRITTE.map(s => `<li>${h(s)}</li>`).join('')}</ol></div>`, true);
  $('#fenster').onclick = null;
  let r0;
  try { r0 = await api('veroeffentlichen', { z: Z }); } catch (e) { zu(); return sag('Nicht veröffentlicht', e.message, [], true); }
  if (r0 && r0.geaendert === false) { zu(); await lade(Z, true); return sag('Nichts geändert, nichts veröffentlicht.', 'Der Entwurf ist gleich wie die PDF.'); }
  if (r0 && r0.fehler) { zu(); await lade(Z); return sag('Nicht veröffentlicht', 'PDF und Website sind unverändert, Ihr Entwurf ist noch da. ' + String(r0.fehler).replace(/^[^:]*: /, '').slice(0, 160), [], true); }
  const t0 = Date.now();
  while (true) {
    await new Promise(r => setTimeout(r, 1000));
    let s; try { s = (await api('status')).bau; } catch (e) { continue; }
    const L = s.schritte && s.schritte.length ? s.schritte : SCHRITTE, k = L.indexOf(s.schritt);
    $$('#l-s li').forEach((li, i) => { li.className = s.laeuft ? (i < k ? 'fertig' : i === k ? 'jetzt' : '') : 'fertig'; });
    if (!s.laeuft) {
      if (s.fehler) { zu(); await lade(Z); return sag('Nicht veröffentlicht', 'PDF und Website sind unverändert, Ihr Entwurf ist noch da. ' + s.fehler.replace(/^[^:]*: /, '').slice(0, 160), [], true); }
      await lade(Z, true);
      const [seite, anker] = WEBSEITE[Z];
      if (ONLINE && Z !== 'mittag' && s.seiten_fehler) return fenster(`<h2>Veröffentlicht. <em>Die PDF steht.</em></h2><p class="satz">${h(s.fertig || 'PDF und Stand liegen im Speicher der Website')}. Die PDF der Karte ist ab sofort die neue, unter «Unterlagen» und überall, wo die Website auf sie verweist. Die Restaurant-Seiten liessen sich diesmal nicht setzen (${h(String(s.seiten_fehler).replace(/^[^:]*: /, '').slice(0, 160))}); sie zeigen die neue Karte, sobald Sie noch einmal veröffentlichen. Die vorige Fassung liegt unter «Frühere Fassungen».</p>
        <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Schliessen</button><a class="kn kn--linie" href="../${seite}#${anker}" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a><a class="kn" href="../unterlagen/pdf/${Z}.pdf?t=${Date.now()}" target="_blank" rel="noopener">PDF öffnen<i>${PF}</i></a></div>`, true);
      if (Z === 'mittag') return fenster(`<h2>Veröffentlicht. <em>Die neue Woche steht.</em></h2><p class="satz">${h(s.fertig)}. Auf den Seiten von Restaurant «L’Ambiance» und Terrasse «La Belle Rivière» führt «Mittagsmenü der Woche» jetzt zu dieser Karte, in allen Sprachen. Die vorige Woche liegt unter «Frühere Fassungen».</p>
        <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Schliessen</button><a class="kn kn--linie" href="../${seite}#${anker}" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a><a class="kn" href="../unterlagen/pdf/${Z}.pdf?t=${Date.now()}" target="_blank" rel="noopener">PDF öffnen<i>${PF}</i></a></div>`, true);
      fenster(`<h2>Veröffentlicht. <em>PDF und Website stehen.</em></h2><p class="satz">${h(s.fertig)}. ${ONLINE ? 'Die Restaurant- und Bar-Seiten in allen sechs Sprachen und die PDF zeigen die neue Fassung.' : 'Die Restaurant-Seiten in allen Sprachen, die Karten in allen Sprachen, die Seite «Unterlagen» und die Werkbank zeigen die neue Fassung.'} Die vorige liegt unter «Frühere Fassungen».</p>
        <div class="fenster__kn"><button class="kn kn--linie kn--ohne" type="button" data-zu>Schliessen</button><a class="kn kn--linie" href="../${seite}#${anker}" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a><a class="kn" href="../unterlagen/pdf/${Z}.pdf?t=${Date.now()}" target="_blank" rel="noopener">PDF öffnen<i>${PF}</i></a></div>`, true);
      return;
    }
    if (Date.now() - t0 > 900000) { zu(); return sag('Das dauert ungewöhnlich lange', 'Bitte die Seite später neu laden.', [], true); }
  }
}
function verwerfen() {
  frage('Entwurf <em>verwerfen?</em>', 'Alle Änderungen seit der letzten PDF fallen weg. Der verworfene Entwurf bleibt unter «Frühere Fassungen» aufbewahrt.', 'Verwerfen', async () => {
    try { await api('verwerfen', { z: Z }); } catch (e) { return sag('Nicht verworfen', e.message, [], true); }
    await lade(Z); sag('Entwurf verworfen', 'Die Karte steht wieder wie in der PDF.');
  });
}

function kartenCss() {   // Zusatz-Gestaltung einer Karte (d.css, z. B. Mittagsmenü) gilt in der Vorschau wie in der PDF (druck.html)
  let st = document.getElementById('karten-css');
  if (!st) { st = document.createElement('style'); st.id = 'karten-css'; document.head.appendChild(st); }
  st.textContent = (D && D.css) || '';
}

// ---------------------------------------------------------------- Laden
async function lade(z, still) {
  const r = await api('karte?z=' + encodeURIComponent(z));
  Z = z; STAND = r.stand; D = kopie(r.entwurf || r.stand); BASIS = JSON.stringify(D); OFFEN = false; UNDO = []; GESCHRIEBEN.clear(); if (window.ANORDNEN) ANORDNEN.neu();
  try { const st = await api('status'); LISTE = st.karten; ONLINE = !!st.online; } catch (e) { /* Liste bleibt */ }
  try { localStorage.setItem('mc-karte', z); } catch (e) { /* egal */ }
  history.replaceState(null, '', '#' + z);
  alles();
  if (!still && r.entwurf) sag('Entwurf geöffnet', `Gespeichert am ${r.entwurf_zeit}, noch nicht in der PDF.`);
}
async function wechsel(z) {
  if (z === Z) return;
  if (OFFEN) return frage('Nicht <em>gespeichert.</em>', 'Sie haben in dieser Karte Änderungen, die noch nicht gespeichert sind.', 'Verwerfen und wechseln', () => lade(z));
  await lade(z);
}

// ---------------------------------------------------------------- Ereignisse
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-akt],[data-z],[data-m],[data-zoom],[data-ansicht]');
  if (!b || b.closest('#fenster') || !D) return;   // vor dem Laden der Karte tut kein Knopf etwas (Firefox unter Last, 14.10.2026: «daten is null»)
  if (b.dataset.ansicht) { ANSICHT = b.dataset.ansicht; return website(true); }
  if (b.dataset.z) return wechsel(b.dataset.z);
  if (b.dataset.m) { if (OFFEN && b.dataset.m === 'einfach') return frage('Nicht <em>gespeichert.</em>', 'Erst speichern, dann wechseln?', 'Speichern', async () => { if (await speichern('Im Entwurf gespeichert')) { MODUS = 'einfach'; alles(); } }); MODUS = b.dataset.m; try { localStorage.setItem('mc-modus', MODUS); } catch (e) { /* egal */ } return alles(); }
  if (b.dataset.zoom) { ZM[MODUS] = Math.min(1.3, Math.max(.35, +(ZM[MODUS] + (+b.dataset.zoom) * .1).toFixed(2))); try { localStorage.setItem('mc-zoom-' + MODUS, ZM[MODUS]); } catch (e) { /* egal */ } return zoomAlle(); }
  const a = b.dataset.akt, r = b.closest('.r'), ti = r ? +r.dataset.ti : +(b.dataset.ti ?? -1), i = r && r.dataset.i !== undefined ? +r.dataset.i : -1;
  if (a === 'speichern') return OFFEN ? speichern('Im Entwurf gespeichert') : sag(leiste.gruen ? 'Gespeichert.' : 'Alles ist gespeichert.', 'Offene Eingaben gibt es gerade nicht.');
  if (a === 'veroeffentlichen') return OFFEN || geaendert() ? (OFFEN ? speichern('Im Entwurf gespeichert').then(ok => ok && vglFenster()) : vglFenster()) : null;
  if (a === 'vgl') return vglFenster();
  if (a === 'probe') return probe();
  if (a === 'verwerfen') return verwerfen();
  if (a === 'verlauf') return verlaufFenster();
  if (a === 'daten') return datenFenster();
  if (a === 'neu') return neuGlobal();
  if (a === 'mw-neu') return wocheSchieben(1);
  if (a === 'mw-vor') return wocheSchieben(-1);
  if (a === 'edit-deckel') return deckelFenster(ti);
  if (a === 'waehle') return waehle(ti, i);
  if (a === 'edit') return eintragFenster({ ti, i });
  if (a === 'neu-hier') { const bl = bloecke(ti).find(x => x[0] === i); return eintragFenster({ ti, nach: (bl ? bl[1] : i + 1) - 1 }); }
  if (a === 'neu-ende') return eintragFenster({ ti, nach: teile()[ti].posten.length - 1 });
  if (a === 'rubrik-neu') return rubrikNeu(ti);
  if (a === 'hoch') return schiebe(ti, i, -1);
  if (a === 'runter') return schiebe(ti, i, 1);
  if (a === 'weg') return entfernen(ti, i);
  if (a === 'aus') { const u = teile()[ti].posten[i], wird = !u.aus; return tun(() => { if (wird) u.aus = true; else delete u.aus; }, wird ? 'Ausgeblendet' : 'Wieder auf der Karte', wird ? `«${u.name}» steht vorerst nicht in der PDF.` : `«${u.name}»`, [ti, i]); }
});
/* Mittagsmenü: Eingaben gehen sofort in die Karte rechts, gespeichert wird beim Verlassen des Feldes */
$('#liste').addEventListener('input', ev => {
  const el = ev.target.closest('[data-mw]'); if (!el || Z !== 'mittag' || el.type === 'checkbox' || el.type === 'date') return;
  wocheSetzen(el.dataset.mw, el.value); OFFEN = JSON.stringify(D) !== BASIS; vorschau(); leiste();
});
$('#liste').addEventListener('change', ev => {
  const el = ev.target.closest('[data-mw]'); if (!el || Z !== 'mittag') return;
  if (el.type === 'checkbox') return tun(() => wocheSetzen(el.dataset.mw, el.checked), el.checked ? 'Tag ohne Mittagsmenü' : 'Tag wieder mit Mittagsmenü');
  if (el.type === 'date') return tun(() => wocheSetzen('ab', el.value), 'Woche geändert', `Die Karte gilt ab ${MITTAG.tagName(MITTAG.montag(el.value), 0)}.`);
  wocheSetzen(el.dataset.mw, el.value);
  if (JSON.stringify(D) !== BASIS) speichern('Im Entwurf gespeichert');
});
/* Vorschau im Modus Einfach: Klick zeigt den Eintrag links auf derselben Höhe, Doppelklick öffnet ihn */
function ortInKarte(ev) {
  if (MODUS !== 'einfach' || Z === 'mittag') return null;
  const el = ev.target.closest('[data-k]'); if (!el) return null;
  const m = el.dataset.k.match(/^teile\.(\d+)(?:\.posten\.(\d+))?/); return m ? [+m[1], m[2] === undefined ? -1 : +m[2]] : null;
}
$('#seiten').addEventListener('click', ev => { const o = ortInKarte(ev); if (o && o[1] >= 0) waehleAusVorschau(o[0], o[1]); });
$('#seiten').addEventListener('dblclick', ev => { const o = ortInKarte(ev); if (!o) return; if (o[1] < 0) return deckelFenster(o[0]); eintragFenster({ ti: o[0], i: o[1] }); });
/* Mittagsmenü im Modus Einfach, wie die anderen Karten (Robert 16.10.2026): Klick in der Tageskarte springt ins passende Feld der Woche, markiert es
   und setzt den Zeiger hinein; ein Feld zeigt beim Hineinklicken seine Zeile rechts auf derselben Höhe. */
function mwRechts(feld) {
  if (Z !== 'mittag' || MODUS !== 'einfach' || ANSICHT !== 'karte') return;
  const Q = MITTAG.quellen(D.woche), k = Object.keys(Q).find(x => Q[x][0] === feld), sc = $('#seiten'), t = $(`#liste [data-mw="${feld}"]`);
  const el = k && $(`[data-k="${k}"]`, sc); if (!el || !t) return;
  const r = t.getBoundingClientRect(), r0 = el.getBoundingClientRect();
  sc.scrollTo({ top: Math.max(0, sc.scrollTop + r0.top + r0.height / 2 - (r.top + r.height / 2)), behavior: 'smooth' });
  el.classList.remove('blitz'); void el.offsetWidth; el.classList.add('blitz');
}
$('#seiten').addEventListener('click', ev => {
  if (MODUS !== 'einfach' || Z !== 'mittag') return;
  const el = ev.target.closest('[data-k]'), box = ev.target.closest('[data-l]') || el; if (!box) return;
  const Q = MITTAG.quellen(D.woche), k = el && Q[el.dataset.k] ? el.dataset.k : $$('[data-k]', box).map(x => x.dataset.k).find(x => Q[x]);
  const t = k && $(`#liste [data-mw="${Q[k][0]}"]`); if (!t) return;
  const f = t.closest('label.feld') || t;
  $$('#liste .mw-an').forEach(x => x.classList.remove('mw-an', 'mw-blitz'));
  f.classList.add('mw-an'); void f.offsetWidth; f.classList.add('mw-blitz');
  linksMitte(f);
  setTimeout(() => { t.focus({ preventScroll: true }); const n = t.value.length; try { t.setSelectionRange(n, n); } catch (e) { /* egal */ } }, 450);
});
$('#liste').addEventListener('focusin', ev => {
  const t = ev.target.closest && ev.target.closest('textarea.mw-t'); if (!t || Z !== 'mittag') return;
  $$('#liste .mw-an').forEach(x => { if (!x.contains(t)) x.classList.remove('mw-an', 'mw-blitz'); });
  (t.closest('label.feld') || t).classList.add('mw-an');
  mwRechts(t.dataset.mw);
});
$('#liste').addEventListener('dblclick', ev => { const t = ev.target.closest('.r__t[data-akt="waehle"]'); const r = t && t.closest('.r'); if (r) eintragFenster({ ti: +r.dataset.ti, i: +r.dataset.i }); });
/* Modus Fortgeschritten: direkt in der Karte schreiben */
$('#seiten').addEventListener('input', ev => {
  const el = ev.target.closest('[data-k]'); if (!el || MODUS !== 'frei') return;
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  if (Z === 'mittag') {   // zurück ins Formular der Woche; die Karte wird beim Verlassen des Textes neu gesetzt
    if (!el.dataset.q) return;   // Feld beim Setzen der Karte festgehalten: leert man beim Schreiben eine Zeile, verschieben sich die Pfade sonst auf den nächsten Gang
    const vor = (el.dataset.vor || '').replace(/[\s·]+$/, '');
    wocheSetzen(el.dataset.q, vor && text.startsWith(vor) ? text.slice(vor.length).replace(/^\s*·?\s*/, '') : text);
  } else setzePfad(D, el.dataset.k, text);
  GESCHRIEBEN.add(el.dataset.k); el.classList.add('geaendert');
  OFFEN = JSON.stringify(D) !== BASIS; leiste();
});
$('#seiten').addEventListener('keydown', ev => { if (ev.target.closest('[data-k]') && ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); } });
$('#seiten').addEventListener('paste', ev => { const el = ev.target.closest('[data-k]'); if (!el) return; ev.preventDefault(); document.execCommand('insertText', false, (ev.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' ')); });
$('#seiten').addEventListener('focusout', ev => { if (MODUS === 'frei' && ev.target.closest('[data-k]')) setTimeout(() => { if (!document.activeElement || !document.activeElement.closest('#seiten [data-k]')) vorschau(); }, 120); });
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && !$('#fenster').hidden && $('#fenster [data-zu]')) zu();
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); if (OFFEN) speichern('Im Entwurf gespeichert'); }
});
window.addEventListener('beforeunload', ev => { if (OFFEN) { ev.preventDefault(); ev.returnValue = ''; } });

/* Freie Anordnung (anordnen.js, 15.10.2026): Zugriff auf den Entwurf, ohne die Abläufe hier zu kennen */
window.MCK = {
  d: () => D,
  an: () => MODUS === 'frei' && ANSICHT === 'karte',   // seit 16.10.2026 auch beim Mittagsmenü (Robert: «alle Attribute gleich wie bei den anderen vier»)
  setzeD: x => { D = x; OFFEN = JSON.stringify(D) !== BASIS; leiste(); vorschau(); },
  geaendert: () => { OFFEN = JSON.stringify(D) !== BASIS; leiste(); },
  sag: (t, x) => sag(t, x),
  zoom: () => zoomAlle(),
};

// ---------------------------------------------------------------- Start
(async () => {
  try {
    ZEICHEN = await (await fetch('../_karten/zeichen.svg', { cache: 'no-store' })).text();
    const st0 = await api('status'); LISTE = st0.karten; ONLINE = !!st0.online;
    let z = location.hash.slice(1); if (!LISTE.some(k => k.ziel === z)) { try { z = (/\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload')) ? '' : localStorage.getItem('mc-karte'); }   /* Aus La Maison geöffnet: immer auf der Übersicht anfangen (Robert 16.10.2026), beim Neuladen bleibt die letzte Ansicht */
    catch (e) { z = ''; } }
    if (!LISTE.some(k => k.ziel === z)) z = LISTE[0].ziel;
    const probeDaten = await (async () => { const d = await (await fetch('../_karten/stand/' + z + '.json', { cache: 'no-store' })).json(); return d; })();
    await KARTE.vorbereiten(probeDaten, ZEICHEN, $('#mess'));
    await lade(z);
  } catch (e) {
    if (window.werkzeugTuer) window.werkzeugTuer(e.message); else document.body.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#11141f;color:#f7f0e3;font-family:system-ui,sans-serif;text-align:center"><div><p style="font-size:1.4rem;margin:0 0 10px">La Carte startet nicht.</p><p style="margin:0;color:rgba(247,240,227,.7)">${h(e.message)}</p><p><a href="../studio/pruefung.html" style="color:#f0e3c2">Prüfung öffnen</a></p></div></div>`;   /* R04 mit «Prüfung öffnen» (17.10.2026) */
  }
})();
})();
