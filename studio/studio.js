/* Le Bureau · Grand Beau-Rivage (Arbeitstitel). Das Kontrollpanel der Website: Bereiche des Hauses, jede Stelle direkt in der Seite,
   Angaben, Zeiten & Preise, Hinweis, Google-Texte, Sprachen, Entwurf, Veröffentlichen, frühere Fassungen. Server-Teil: studio.py.
   Nichts speichert still: Eingaben warten gelb, «Speichern» legt sie in den Entwurf (Quittung mit Vorher/Nachher und Rückgängig),
   auf die Website kommt erst, was veröffentlicht wird. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const SPR = [['', 'Deutsch'], ['en', 'English'], ['fr', 'Français'], ['zh', '中文'], ['ko', '한국어'], ['ar', 'العربية']];
const SPNAME = { en: 'Englisch', fr: 'Französisch', zh: 'Chinesisch', ko: 'Koreanisch', ar: 'Arabisch' };
const S = { ue: null, ansicht: 'start', bereich: '', seite: '', sp: '', geraet: 'rechner', verz: null, offen: {}, wahl: null, y: 0, bilder: null, zahlenFilter: 'alle', lauf: null };

/* ---------- Server ---------- */
async function api(was, daten) {
  let r;
  try {
    r = await fetch('api/' + was, daten === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
  } catch (e) {
    throw new Error('VERBINDUNG · Der Server-Teil des Bureau antwortet nicht. Läuft serve.py?');
  }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('SERVER · Antwort nicht lesbar (' + r.status + ').'); }
  if (!r.ok) throw new Error(d.fehler || ('SERVER · Fehler ' + r.status));
  return d;
}
function fehler(e) {
  const t = String((e && e.message) || e);
  const m = t.match(/^([A-ZÄÖÜ]+) · (.*)$/);
  const wort = m ? m[1] : 'SERVER';
  window.bureauMerk && window.bureauMerk(t);
  quit(m ? m[2] : t, '', [['Was tun?', () => window.open('pruefung.html#' + wort.toLowerCase(), '_blank')]], true);
}
function quit(titel, text, knoepfe = [], fehl = false, dauer = 9000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  knoepfe.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { f(); q.remove(); }; q.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Schliessen'); x.textContent = '×'; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (dauer) setTimeout(() => q.remove(), dauer);
}
function datum(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Zurich' }) + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }) + ' Uhr';   // immer Schweizer Zeit, auch am Rechner im Ausland
}

/* ---------- Rand ---------- */
function rand() {
  const u = S.ue, an = S.ansicht;
  const nw = (key, name, zahl = 0, extra = '') => `<button class="nw" type="button" data-gehe="${key}" ${an === key || (an === 'bereich' && key === 'b:' + S.bereich) ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<i>${zahl}</i>` : ''}${extra}</button>`;
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="${$('#rand').classList.contains('auf')}">Bereiche<i></i></button>
    <nav class="nav" aria-label="Bereiche">
      ${nw('start', 'Übersicht')}
      <p>Die Website</p>
      ${u.bereiche.map(b => nw('b:' + b.key, b.name, b.offen)).join('')}
      <p>Für alle Seiten</p>
      ${nw('angaben', 'Angaben des Hauses')}${nw('zahlen', 'Zeiten & Preise')}${nw('hinweis', 'Hinweis für Gäste')}${nw('google', 'Google-Texte')}${nw('sprachen', 'Sprachen')}
      <p>Karten</p>
      ${nw('karten', 'La Carte', 0, `<em>${u.karten && u.karten.karten ? u.karten.karten.filter(k => k.entwurf).length ? 'Entwurf' : '4 Karten' : ''}</em>`)}
      <p>Entwurf</p>
      ${nw('entwurf', 'Entwurf & Vergleich', u.aenderungen)}${nw('verlauf', 'Frühere Fassungen')}
    </nav>
    <div class="wege">
      <a href="../index.html" target="_blank" rel="noopener">Website ansehen${PF}</a>
      <a href="../werkbank/anleitung/website/" target="_blank" rel="noopener">Anleitung${PF}</a>
      <a href="pruefung.html" target="_blank" rel="noopener">Prüfung${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => { $('#rand').classList.remove('auf'); gehe(b.dataset.gehe); });   // Handy: Liste nach der Wahl zuklappen (15.10.2026)
  kopfLeiste();
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
}

/* ---------- Leiste unten ---------- */
function offenZahl() { return Object.keys(S.offen).length; }
function leiste(gruen = false) {
  const n = offenZahl(), a = S.ue ? S.ue.aenderungen : 0, z = S.ue && S.ue.zuletzt;
  const klasse = gruen ? 'gruen' : n ? 'gelb' : 'grau';
  $('#leiste').innerHTML = `
    <div class="leiste__t"><b>${n ? `${n} Eingabe${n > 1 ? 'n' : ''} noch nicht gespeichert` : a ? `Entwurf: ${a} Änderung${a > 1 ? 'en warten' : ' wartet'}` : 'Alles ist veröffentlicht'}</b>
      <span>${n ? 'Speichern legt sie in den Entwurf. Auf der Website erscheint erst, was Sie veröffentlichen.' : a ? 'Gespeichert, noch nicht auf der Website.' + (S.ue.entwurf_zeit ? ' Zuletzt ' + datum(S.ue.entwurf_zeit) + '.' : '') : (z ? 'Zuletzt veröffentlicht ' + datum(z.zeit) + (z.notiz ? ' · ' + z.notiz : '') + '.' : 'Die Website zeigt sich wie gebaut.')}</span></div>
    <button class="kn sp ${klasse}" type="button" id="l-sp">${gruen ? 'Gespeichert' : 'Speichern'}<i>${gruen ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>' : PF}</i></button>
    <button class="kn kn--linie" type="button" id="l-vgl" ${a || n ? '' : 'disabled'}>Vorher, nachher<i>${PF}</i></button>
    <button class="kn kn--gold${a && !n ? ' glanz-kn' : ''}" type="button" id="l-raus" ${a && !n ? '' : 'disabled'} title="${n ? 'Erst speichern' : ''}">Veröffentlichen<i>${PF}</i></button>`;
  $('#l-sp').onclick = speichern;
  $('#l-vgl').onclick = () => gehe('entwurf');
  $('#l-raus').onclick = veroeffentlichenFenster;
}

/* ---------- Speichern, Quittung, Rückgängig ---------- */
function vormerken(key, op) {
  S.offen[key] = op;
  leiste();
}
function vergessen(key) { delete S.offen[key]; leiste(); }
async function speichern() {
  const ops = Object.values(S.offen);
  if (ops.some(o => o.art !== 'text')) { S.vorschauNeu = true; const r = document.getElementById('vf-r'); if (r) r.classList.add('laedt'); }   // Foto oder Block: Schleier sofort, nicht erst wenn die Vorschau neu geladen wird (15.10.2026: bis dahin stand 1 bis 2 s das alte Bild ohne Hinweis)
  if (!ops.length) { quit('Nichts geändert, nichts gespeichert.', '', [], false, 4000); return; }
  try {
    const r = await api('speichern', { ops });
    S.offen = {};
    if (!r.geaendert) { quit(r.meldung || 'Nichts geändert, nichts gespeichert.', '', [], false, 4000); await frisch(); return; }
    await frisch();
    leiste(true);
    setTimeout(() => leiste(), 2600);
    quit('Gespeichert', r.was.slice(0, 3).join(' · ') + (r.was.length > 3 ? ` · und ${r.was.length - 3} weitere` : ''), [
      ['Vorher/Nachher ansehen', () => gehe('entwurf')],
      ['Rückgängig', async () => { try { S.vorschauNeu = true; await api('rueckgaengig', { schritt: r.schritt }); await frisch(); quit('Rückgängig gemacht', 'Der Entwurf ist wie vor diesem Speichern.', [], false, 5000); } catch (e) { fehler(e); } }]]);
  } catch (e) { fehler(e); }
}
async function frisch(neuZeichnen = true) {
  S.ue = await api('ueberblick');
  rand();
  leiste();
  if (neuZeichnen) await zeichne(true);
}
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); speichern(); }
  if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu();
});
window.addEventListener('beforeunload', e => { if (offenZahl()) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Navigation ---------- */
function gehe(ziel, extra = {}) {
  if (ziel.startsWith('b:')) { S.ansicht = 'bereich'; S.bereich = ziel.slice(2); const b = bereich(); S.seite = extra.seite || (b.seiten[0] || {}).datei; S.wahl = extra.wahl || null; }
  else S.ansicht = ziel;
  try { localStorage.setItem('bureau-ansicht', JSON.stringify({ a: S.ansicht, b: S.bereich, s: S.seite })); } catch (e) { /* privat */ }
  rand();
  zeichne();
  window.scrollTo(0, 0);
}
function bereich() { return S.ue.bereiche.find(b => b.key === S.bereich) || S.ue.bereiche[0]; }
function bereichVon(seite) { return S.ue.bereiche.find(b => b.seiten.some(s => s.datei === seite)); }
const ZEICHEN = '<img src="../assets/logo/zeichen-gold.webp" width="784" height="777" alt="">';
const KB = { start: 'haus-vorfahrt', angaben: 'halle', zahlen: 'fruehstueck-buffet', karten: 'food-teller', hinweis: 'haus-abend', google: 'haus-luft', sprachen: 'haus-fluss-berge', entwurf: 'halle-2', verlauf: 'haus-sw' };   // Foto der Bühne je Ansicht (studio/buehne.js), Bereiche nehmen ihr eigenes
function kopf(mono, titel, satz, knoepfe = '', knapp = false) {
  const kb = S.ansicht === 'bereich' ? (bereich().foto || '') : (KB[S.ansicht] || ''), kba = kb ? ` data-kb="${kb}"` : '';
  const zier = `<span class="zier"><i></i>${ZEICHEN}<span>${mono}</span><i></i></span>`;
  if (knapp) return `<header class="titel titel--knapp"${kba}><div>${zier.replace('<i></i>' + ZEICHEN, ZEICHEN)}<h1>${titel}</h1>${satz ? `<p class="satz">${satz}</p>` : ''}</div>${knoepfe ? `<div class="titel__kn">${knoepfe}</div>` : ''}</header>`;
  return `<header class="titel"${kba}>${zier}<h1>${titel}</h1>${satz ? `<p class="satz">${satz}</p>` : ''}${knoepfe ? `<div class="titel__kn">${knoepfe}</div>` : ''}</header>`;
}
const TITEL = { start: 'Übersicht', angaben: 'Angaben des Hauses', zahlen: 'Zeiten & Preise', karten: 'La Carte', hinweis: 'Hinweis für Gäste', google: 'Google-Texte', sprachen: 'Sprachen', entwurf: 'Entwurf & Vergleich', verlauf: 'Frühere Fassungen' };
const SYM = {
  pruef: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 2.8 4v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V4z"/><path d="m5.6 8 1.7 1.7 3.2-3.4"/></svg>',
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  welt: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/></svg>' };
/* Kleine Symbole für Kacheln, Angaben und Zeiten (Robert 15.10.2026: «mit Bildmaterial oder kleinen Symbolen arbeiten») */
const IC = {
  stift: '<path d="M10.8 2.6 13.4 5.2 5.6 13H3v-2.6z"/><path d="m9.4 4 2.6 2.6"/>',
  welt: '<circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/>',
  karte: '<path d="M3.5 2.5h7.5l1.5 1.5v9.5h-9z"/><path d="M5.8 6h4.4M5.8 8.4h4.4M5.8 10.8h2.6"/>',
  text: '<path d="M3 4V2.8h10V4M8 2.8v10.4M6.2 13.2h3.6"/>',
  uhr: '<circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.6"/>',
  preis: '<path d="M8.6 2.4h4.9v4.9L7.6 13.2 2.8 8.4z"/><circle cx="11" cy="5" r="1"/>',
  aus: '<path d="M2 8s2.2-4.2 6-4.2S14 8 14 8s-2.2 4.2-6 4.2S2 8 2 8z"/><path d="m3 13 10-10"/>',
  foto: '<rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.6"/><circle cx="5.8" cy="6.6" r="1.2"/><path d="m2.6 11.6 3.4-3 2.6 2.2 2.2-1.8 2.6 2.4"/>',
  hinweis: '<path d="M8 2.2 14 13H2z"/><path d="M8 6.4v3.2M8 11.4v.2"/>',
  karriere: '<rect x="2.4" y="5" width="11.2" height="8" rx="1.4"/><path d="M6 5V3.4h4V5M2.4 8.6h11.2"/>',
  tel: '<path d="M4.2 2.4h2l1 3-1.4 1c.7 1.5 1.7 2.5 3.2 3.2l1-1.4 3 1v2c0 .7-.6 1.3-1.3 1.3C6.6 12.5 3.5 9.4 2.9 3.7c0-.7.6-1.3 1.3-1.3z"/>',
  mail: '<rect x="2.2" y="3.6" width="11.6" height="8.8" rx="1.4"/><path d="m2.6 4.4 5.4 4.2 5.4-4.2"/>',
  ort: '<path d="M8 14s4.6-4.2 4.6-7.6a4.6 4.6 0 0 0-9.2 0C3.4 9.8 8 14 8 14z"/><circle cx="8" cy="6.4" r="1.6"/>',
  link: '<path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.4 6.6a2.6 2.6 0 0 0-3.7 0L3.5 8.8a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/>',
  mass: '<path d="M2.4 10.6 10.6 2.4l3 3-8.2 8.2z"/><path d="m5 8 1.4 1.4M7 6l1 1M9 4l1.4 1.4"/>',
  haus: '<path d="M2.6 7.4 8 2.8l5.4 4.6"/><path d="M4 6.4v6.8h8V6.4M6.6 13.2V9.6h2.8v3.6"/>',
  sprache: '<path d="M2.4 3.4h6.4M5.6 2v1.4M3.6 3.4c.6 2.4 2.2 4.2 4.4 5.2M7.6 3.4C7 5.8 5.4 7.6 3 8.8"/><path d="m8.6 13.6 2.4-6 2.4 6M9.4 11.8h3.2"/>',
  zurueck: '<path d="M3.4 6.2h6.4a3.4 3.4 0 0 1 0 6.8H6"/><path d="M5.8 3.6 3.2 6.2l2.6 2.6"/>'
};
const ic = k => `<svg viewBox="0 0 16 16" aria-hidden="true">${IC[k] || IC.text}</svg>`;
function kopfLeiste() {
  const b = S.ansicht === 'bereich' ? bereich() : null;
  const t = b ? b.name : (TITEL[S.ansicht] || 'Le Bureau');
  const u = S.ue, z = u && u.zuletzt;
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="Zur Übersicht">${ZEICHEN}<span><b>Le Bureau</b><small>Website · Grand Beau-Rivage</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(t)}</div><div class="kopf__stand">${u && u.aenderungen ? u.aenderungen + ' im Entwurf' : z ? 'Veröffentlicht ' + esc(datum(z.zeit).split(',')[0]) : 'Wie gebaut'}</div></div>
    <div class="kopf__werk">
      <a class="rund" href="../maison/" data-tip="La Maison" aria-label="Zurück zu La Maison">${ic('haus')}</a>
      <a class="rund" href="pruefung.html" target="_blank" rel="noopener" data-tip="Prüfung" aria-label="Prüfung">${SYM.pruef}</a>
      <a class="rund" href="../werkbank/anleitung/website/" target="_blank" rel="noopener" data-tip="Anleitung" aria-label="Anleitung">${SYM.buch}</a>
      <span class="kopf__trenn"></span>
      <a class="kn kn--klein" href="../index.html" target="_blank" rel="noopener">Website ansehen<i>${SYM.welt}</i></a>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
}
async function zeichne(still = false) {
  const a = S.ansicht, el = $('#ansicht');
  const zb = $('#zl-blick'); if (zb) zb.classList.remove('auf');
  clearTimeout(S.ladeUhr);
  if (!still && a !== 'start' && a !== 'karten') S.ladeUhr = setTimeout(() => { el.innerHTML = '<div class="lade" style="padding-top:18vh"><div class="lade__r"></div><span class="leise">Wird geladen …</span></div>'; }, 280);
  try {
    if (a === 'start') el.innerHTML = start();
    else if (a === 'bereich') await zeichneBereich(still);
    else if (a === 'angaben') await zeichneAngaben();
    else if (a === 'zahlen') await zeichneZahlen();
    else if (a === 'karten') el.innerHTML = karten();
    else if (a === 'hinweis') await zeichneHinweis();
    else if (a === 'google') await zeichneGoogle();
    else if (a === 'sprachen') await zeichneSprachen();
    else if (a === 'entwurf') await zeichneEntwurf();
    else if (a === 'verlauf') await zeichneVerlauf();
    clearTimeout(S.ladeUhr);
    $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.seite ? { seite: b.dataset.seite } : {}));
    if (!still) { el.classList.remove('ansicht-neu'); void el.offsetWidth; el.classList.add('ansicht-neu'); }
  } catch (e) { fehler(e); }
}

/* ---------- Übersicht ---------- */
function start() {
  const u = S.ue, h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';
  const AUFG = [
    ['b:start', 'Einen Text ändern', 'Auf der Seite anklicken, rechts neu schreiben.', 'text', 'halle'],
    ['zahlen', 'Preis oder Öffnungszeit', 'Alle Zeiten und Preise der Website an einem Ort.', 'uhr', 'fruehstueck-buffet'],
    ['b:angebote', 'Angebot ausblenden', 'Abgelaufenes Package oder Festtag von der Seite nehmen.', 'aus', 'ev-weihnacht'],
    ['b:zimmer', 'Foto tauschen', 'Ein Foto anklicken, aus den Fotos des Hauses wählen oder hochladen.', 'foto', 'z-pyramid'],
    ['karten', 'Gericht oder Preis auf der Karte', 'Die vier Karten pflegt La Carte, mit PDF.', 'karte', 'food-teller'],
    ['hinweis', 'Hinweis für Gäste', 'Ein Satz oben auf jeder Seite, mit Zeitraum.', 'hinweis', 'haus-abend'],
    ['b:karriere', 'Stelle besetzt', 'Stelle ausblenden oder neu beschreiben.', 'karriere', 'halle-gepaeck'],
    ['angaben', 'Telefon oder E-Mail', 'Einmal ändern, auf allen Seiten in allen Sprachen.', 'tel', 'halle-sessel']];
  const mc = (u.karten && u.karten.karten) || [];
  return kopf('Le Bureau · Grand Beau-Rivage Interlaken', `${gruss} <em>Was ändern wir heute?</em>`,
    `Hier pflegen Sie die Website des Hauses: jeden Text, jedes Foto, jede Angabe. Alles wartet zuerst im Entwurf. Auf die Website kommt es erst, wenn Sie veröffentlichen, und jeder frühere Stand lässt sich zurückholen.`,
    `<a class="kn kn--linie" href="../werkbank/anleitung/website/" target="_blank" rel="noopener">Anleitung<i>${PF}</i></a>`) +
    `<div class="lage platte">
      <div class="lg"><i class="lg__z">${ic('stift')}</i><span class="mono">Entwurf</span><b>${u.aenderungen ? u.aenderungen + ' Änderung' + (u.aenderungen > 1 ? 'en warten' : ' wartet') : 'Nichts offen'}</b><span>${u.aenderungen ? 'Gespeichert, noch nicht auf der Website.' : 'Was Sie speichern, sammelt sich hier.'}</span>${u.aenderungen ? '<button type="button" data-gehe="entwurf">Ansehen und veröffentlichen</button>' : ''}</div>
      <div class="lg"><i class="lg__z">${ic('welt')}</i><span class="mono">Website</span><b>${u.zuletzt ? 'Veröffentlicht ' + datum(u.zuletzt.zeit).split(',')[0] : 'Wie gebaut'}</b><span>${u.seiten} Seiten, je in sechs Sprachen.${u.zuletzt && u.zuletzt.notiz ? ' Zuletzt: ' + esc(u.zuletzt.notiz) : ''}</span><a href="../index.html" target="_blank" rel="noopener">Website öffnen</a></div>
      <div class="lg"><i class="lg__z">${ic('karte')}</i><span class="mono">Karten</span><b>${mc.filter(k => k.entwurf).length ? mc.filter(k => k.entwurf).length + ' Karte im Entwurf' : 'Vier Karten aktuell'}</b><span>L’Ambiance, La Petite Suisse, Bar, Wein. PDF und Website aus einer Quelle.</span><button type="button" data-gehe="karten">Zu La Carte</button></div>
    </div>
    <h2 class="zw">Häufig <em>gebraucht</em></h2>
    <div class="aufgaben edel">${AUFG.map(([z, t, s, k, f]) => `<button class="ag ag--foto" type="button" data-gehe="${z}"><span class="ag__b"><img src="../assets/img/${f}-s.webp" alt="" loading="lazy" decoding="async"></span><i class="ag__z">${ic(k)}</i><b>${t}</b><span>${s}</span><em>${PF}</em></button>`).join('')}</div>
    <h2 class="zw">Die Website, <em>Bereich für Bereich</em></h2>
    <div class="bereiche edel">${u.bereiche.map(b => `<button class="bk" type="button" data-gehe="b:${b.key}" title="${esc(b.satz)}"><span class="bk__b"><img src="../assets/img/${b.foto}-s.webp" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../assets/img/${b.foto}.webp'"></span>${b.offen ? `<span class="bk__o">${b.offen} offen</span>` : ''}<span class="bk__n"><b>${esc(b.name)}</b><small>${b.seiten.length} Seite${b.seiten.length > 1 ? 'n' : ''}</small><i>${PF}</i></span></button>`).join('')}</div>`;
}

/* ---------- Bereich: Stellen links, Seite rechts ---------- */
function iframeUrl(z = 'entwurf', seite = S.seite, sp = S.sp, neu = false) {
  return `seite/${z}/${sp ? sp + '/' : ''}${seite}?nomotion=1&t=${Date.now()}${neu ? '&neu=1' : ''}`;
}
function vorschauHtml(id = 'vf', titel = '') {
  return `<section class="vorschau" aria-label="Vorschau der Seite">
    <div class="vorschau__k"><span class="mono" id="${id}-t">${esc(titel)}</span>
      <div class="wahl2 wahl2--dunkel" role="group" aria-label="Gerät"><button type="button" data-geraet="rechner" aria-pressed="${S.geraet === 'rechner'}">Rechner</button><button type="button" data-geraet="handy" aria-pressed="${S.geraet === 'handy'}">Handy</button></div>
      <select class="sel" id="${id}-sp" aria-label="Sprache der Vorschau">${SPR.map(([k, n]) => `<option value="${k}" ${S.sp === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <a href="#" id="${id}-gross" target="_blank" rel="noopener">Gross öffnen</a></div>
    <div class="rahmen${S.geraet === 'handy' ? ' handy' : ''}" id="${id}-r"><iframe id="${id}" title="Seite mit dem Entwurf"></iframe><div class="lade-schleier">Seite wird gesetzt …</div></div>
  </section>`;
}
function rahmenMass(r) {
  if (!r) return;
  const f = r.querySelector('iframe');
  const breite = S.geraet === 'handy' ? 390 : 1440;   // echte Geräte: Rechner 1440 × 900, Handy 390 × 844, verkleinert ohne Verzerrung
  r.style.setProperty('--wz', (r.clientWidth / breite).toFixed(4));
}
function vorschauVerbinden(id, url) {
  const f = $('#' + id), r = $('#' + id + '-r');
  rahmenMass(r);
  r.classList.add('laedt');
  f.onload = () => { r.classList.remove('laedt'); };
  f.dataset.geladen = '';
  requestAnimationFrame(() => setTimeout(() => { f.src = url; }, 40));   // erst die Liste zeichnen, dann die Seite laden (beide teilen sich den Rechner)
  $('#' + id + '-gross').href = url.replace(/[?&]t=\d+/, '');
  $$('[data-geraet]', r.parentElement).forEach(b => b.onclick = () => { S.geraet = b.dataset.geraet; zeichne(true); });
  $('#' + id + '-sp').onchange = e => { S.sp = e.target.value; zeichne(true); };
}
window.addEventListener('resize', () => $$('.rahmen').forEach(rahmenMass));

async function zeichneBereich(still) {
  const b = bereich();
  if (!S.seite || !b.seiten.some(s => s.datei === S.seite)) S.seite = b.seiten[0].datei;
  const yAlt = S.y;
  S.verz = await api('seite?s=' + encodeURIComponent(S.seite));
  const v = S.verz;
  const reiter = b.seiten.length > 1 ? (b.seiten.length > 5
    ? `<select class="sel" id="seitenwahl" aria-label="Seite">${b.seiten.map(s => `<option value="${s.datei}" ${s.datei === S.seite ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`
    : `<div class="wahl2" role="group" aria-label="Seite">${b.seiten.map(s => `<button type="button" data-seite-w="${s.datei}" aria-pressed="${s.datei === S.seite}">${esc(s.name)}</button>`).join('')}</div>`) : '';
  const key = [S.bereich, S.seite, S.sp, S.geraet].join('|');
  if (still && S.vfKey === key && $('#vf') && $('#gruppen')) {   // nach dem Speichern: nur die Liste erneuern, die Seite bleibt stehen (kein Neuladen, kein Springen)
    const offenGr = new Set($$('#gruppen .gr[open]').map(g => g.dataset.g));
    const st = $('.stellen'), sc = st.scrollTop;
    const alt = $('.stellen .ausgeblendet'); if (alt) alt.remove();
    $('#gruppen').insertAdjacentHTML('beforebegin', ausgeblendetHtml(v));
    S.offenGr = offenGr;
    $('#gruppen').innerHTML = v.gruppen.map((g, gi) => gruppeHtml(g, gi)).join('');
    S.offenGr = null;
    verbindeZeigen(); verbindeGruppen(); suche($('#such').value); st.scrollTop = sc;
    const fo = $('.stellen__fotos'); if (fo) { fo.innerHTML = fotosHtml(v); verbindeFotos(); }
    if (S.vorschauNeu) {
      S.vorschauNeu = false;
      const y = S.y;
      S.nachLaden = () => { if (y) senden({ bureau: 'oben', y }); };
      $('#vf-r').classList.add('laedt'); $('#vf').src = iframeUrl();
    }
    if (S.wahl && S.wahl.h) oeffneStelle(S.wahl.h, S.wahl.n, false);
    return;
  }
  S.vfKey = key;
  const extra = S.bereich === 'essen' ? `<button class="kn kn--linie kn--klein" type="button" data-gehe="karten">Karten in La Carte<i>${PF}</i></button>` : '';
  $('#ansicht').innerHTML = kopf('Bereich · ' + esc(b.name), esc(b.name).replace(/^(\S+)(.*)$/, (m, a, c) => c ? `${a}<em>${c}</em>` : `<em>${a}</em>`),
    esc(b.satz) + ' Klicken Sie in der Seite auf einen Text oder ein Foto, oder wählen Sie links.', extra, true) +
    (reiter ? `<div class="reiter">${reiter}<span class="leise">${b.seiten.length} Seiten</span></div>` : '') +
    `<div class="arbeit">
      <div class="platte stellen">
        <div class="wahl2 stellen__w" role="group" aria-label="Texte oder Fotos"><button type="button" data-tab="texte" aria-pressed="${S.tab !== 'fotos'}">${ic('text')}Texte · ${v.gruppen.reduce((a, g) => a + g.stellen.length, 0)}</button><button type="button" data-tab="fotos" aria-pressed="${S.tab === 'fotos'}">${ic('foto')}Fotos · ${fotosVon(v).length}</button></div>
        <div class="stellen__texte"${S.tab === 'fotos' ? ' hidden' : ''}>
        <label class="suche">${LUPE}<input type="search" id="such" placeholder="Text auf dieser Seite suchen" autocomplete="off"></label>
        ${ausgeblendetHtml(v)}
        <div id="gruppen">${v.gruppen.map((g, gi) => gruppeHtml(g, gi)).join('')}</div>
        </div>
        <div class="stellen__fotos"${S.tab === 'fotos' ? '' : ' hidden'}>${fotosHtml(v)}</div>
      </div>
      ${vorschauHtml('vf', v.name)}
    </div>`;
  $$('[data-tab]').forEach(x => x.onclick = () => { S.tab = x.dataset.tab; $$('[data-tab]').forEach(y => y.setAttribute('aria-pressed', y === x)); $('.stellen__texte').hidden = S.tab === 'fotos'; $('.stellen__fotos').hidden = S.tab !== 'fotos'; });
  verbindeFotos();
  $$('[data-seite-w]').forEach(x => x.onclick = () => { S.seite = x.dataset.seiteW; S.wahl = null; S.y = 0; zeichne(); });
  if ($('#seitenwahl')) $('#seitenwahl').onchange = e => { S.seite = e.target.value; S.wahl = null; S.y = 0; zeichne(); };
  $('#such').oninput = e => suche(e.target.value);
  verbindeZeigen();
  verbindeGruppen();
  vorschauVerbinden('vf', iframeUrl());
  S.nachLaden = () => {
    if (still && yAlt) senden({ bureau: 'oben', y: yAlt });
    if (S.wahl) senden(Object.assign({ bureau: 'zeige', still: !!(still && yAlt) }, S.wahl));
    $$('.st.offen').forEach(x => { const st = stelleVon(x.dataset.h, +x.dataset.n); const op = S.offen[`text|${S.seite}|${st.h}|${st.n}`]; if (op) senden({ bureau: 'tippe', h: st.h, n: st.n, html: op.neu }); });
  };
  if (S.wahl && S.wahl.h) oeffneStelle(S.wahl.h, S.wahl.n, false);
}
/* Alle Fotos der Seite auf einen Blick (Robert 15.10.2026: «kann ich bitte auch die Bilder wechseln, aus dem Bilderfundus auswählen»):
   Zeiger darauf zeigt das Foto in der Seite, Klick öffnet die Fotos des Hauses zum Tauschen */
function fotosVon(v) { const g = new Set(); return v.gruppen.flatMap(x => x.fotos.map(f => Object.assign({ gruppe: x.titel }, f))).filter(f => { const k = f.b + '|' + f.n; if (g.has(k)) return false; g.add(k); return true; }); }
function verbindeFotos() {
  $$('.stellen__fotos [data-foto]').forEach(x => { x.onclick = () => { const [b, n] = x.dataset.foto.split('|'); bildFenster(b, +n, []); }; x.onmouseenter = () => { const [b, n] = x.dataset.foto.split('|'); senden({ bureau: 'zeige', b, n: +n, sanft: true }); }; });
}
function fotosHtml(v) {
  const L = fotosVon(v);
  if (!L.length) return '<p class="leise" style="padding:14px 6px">Auf dieser Seite steht kein Foto, das sich tauschen lässt.</p>';
  return `<p class="leise stellen__satz">Zeiger auf ein Foto zeigt es in der Seite. Klick öffnet die Fotos des Hauses: eines wählen oder ein eigenes hochladen.</p>
    <div class="fotoraster">${L.map(f => `<button type="button" class="fr${f.neu || f.alt_neu ? ' geaendert' : ''}" data-foto="${f.b}|${f.n}" title="${esc(f.alt)}"><span class="fr__b"><img src="../assets/img/${f.neu || f.b}-s.webp" alt="" loading="lazy" onerror="this.onerror=null;this.src='../assets/img/${f.neu || f.b}.webp'"></span><span class="fr__n"><small>${esc(f.gruppe || 'Foto')}</small><b>${esc(f.alt || f.b)}</b></span><em>${ic('foto')}Tauschen</em></button>`).join('')}</div>`;
}
function ausgeblendetHtml(v) {
  return v.ausgeblendet.length ? `<div class="ausgeblendet"><b>Ausgeblendet auf dieser Seite</b>${v.ausgeblendet.map(a => `<div><span>${esc(a.t || a.tag)}</span><button class="link" type="button" data-zeigen="${a.h}|${a.n}">Wieder zeigen</button></div>`).join('')}</div>` : '';
}
function verbindeZeigen() {
  $$('[data-zeigen]').forEach(x => x.onclick = () => { const [h, n] = x.dataset.zeigen.split('|'); vormerken(`aus|${S.seite}|${h}|${n}`, { art: 'aus', seite: S.seite, h, n: +n, an: false }); speichern(); });
}
function gruppeHtml(g, gi) {
  if (g.mc) return `<details class="gr gr--mc" data-g="${gi}"><summary><b>${esc(g.titel || 'Karte')}</b><small>La Carte</small></summary>
    <div class="ed" style="border-top:0"><p style="margin:0 0 10px">Gerichte, Preise und Weine dieser Karte kommen aus La Carte, zusammen mit der PDF und allen Sprachen. Dort ändern, dann stimmt alles überein.</p>
    <a class="kn kn--linie kn--klein" href="../mission-control/" target="_blank" rel="noopener">La Carte öffnen<i>${PF}</i></a></div></details>`;
  const geaendert = g.stellen.some(s => s.neu !== undefined) || g.fotos.some(f => f.neu || f.alt_neu);
  const offen = gi < 2 || geaendert || (S.offenGr && S.offenGr.has(String(gi)));
  return `<details class="gr${g.aus ? ' ist-aus' : ''}" ${offen ? 'open' : ''} data-g="${gi}"${offen ? '' : ' data-leer'}><summary><b>${esc(g.titel || 'Abschnitt')}</b><small>${g.stellen.length} Text${g.stellen.length === 1 ? '' : 'e'}${g.fotos.length ? ' · ' + g.fotos.length + ' Foto' + (g.fotos.length > 1 ? 's' : '') : ''}</small></summary>
    ${offen ? gruppeInnen(g) : ''}</details>`;
}
function gruppeInnen(g) {   // Inhalt einer Gruppe; geschlossene Gruppen bekommen ihn erst beim Aufklappen (Liste mit über 400 Stellen sonst auf einen Schlag)
  return `${g.stellen.map(s => stelleHtml(s)).join('')}
    ${g.fotos.length ? `<div class="fotos">${g.fotos.map(f => `<button type="button" class="${f.neu || f.alt_neu ? 'geaendert' : ''}" data-foto="${f.b}|${f.n}" title="${esc(f.alt)}"><img src="../assets/img/${f.neu || f.b}-s.webp" alt="" loading="lazy" onerror="this.onerror=null;this.src='../assets/img/${f.neu || f.b}.webp'"></button>`).join('')}</div>` : ''}
    ${g.h ? `<div class="gr__fuss"><button class="link rot" type="button" data-blk-aus="${g.h}|${g.n}">Ganzen Abschnitt ausblenden</button></div>` : ''}`;
}
function fuelle(det) {
  if (!det || !det.hasAttribute('data-leer')) return;
  det.removeAttribute('data-leer');
  det.insertAdjacentHTML('beforeend', gruppeInnen(S.verz.gruppen[+det.dataset.g]));
  verbindeGruppen();
}
const TAGNAME = { h1: 'Titel', h2: 'Überschrift', h3: 'Zwischentitel', h4: 'Zwischentitel', p: 'Absatz', li: 'Listenpunkt', a: 'Link', button: 'Knopf', span: 'Text', b: 'Text', small: 'Kleingedrucktes', figcaption: 'Bildzeile', dt: 'Begriff', dd: 'Angabe', td: 'Zelle', th: 'Spaltenkopf', label: 'Feld', em: 'Text', strong: 'Text', address: 'Adresse', blockquote: 'Zitat', q: 'Zitat', i: 'Text' };
function stelleHtml(s) {
  const op = S.offen[`text|${S.seite}|${s.h}|${s.n}`];
  const txt = op ? op.vorschau : s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, ' ') : s.t;
  return `<button type="button" class="st${s.neu !== undefined ? ' geaendert' : ''}${op ? ' offen' : ''}" data-h="${s.h}" data-n="${s.n}"><small>${TAGNAME[s.tag] || 'Text'}${s.gleich > 1 ? ` · ${s.gleich}× auf der Seite` : ''}</small><span>${esc(txt)}</span></button>`;
}
function verbindeGruppen() {
  $$('#gruppen .gr[data-leer]').forEach(d => { if (!d.__t) { d.__t = 1; d.addEventListener('toggle', () => { if (d.open) fuelle(d); }); } });
  $$('.st').forEach(x => x.onclick = () => oeffneStelle(x.dataset.h, +x.dataset.n, true));
  $$('[data-foto]').forEach(x => x.onclick = () => { const [b, n] = x.dataset.foto.split('|'); bildFenster(b, +n, []); });
  $$('[data-blk-aus]').forEach(x => x.onclick = () => { const [h, n] = x.dataset.blkAus.split('|'); blockAus(h, +n, x.closest('details').querySelector('summary b').textContent); });
}
function suche(q) {
  q = q.trim().toLowerCase();
  if (q) $$('#gruppen .gr[data-leer]').forEach(fuelle);
  $$('#gruppen .gr').forEach(g => {
    let treffer = 0;
    $$('.st', g).forEach(x => { const ja = !q || x.textContent.toLowerCase().includes(q); x.hidden = !ja; if (ja) treffer++; });
    g.hidden = q && !treffer;
    if (q && treffer) g.open = true;
  });
}
function stelleVon(h, n) {
  for (const g of S.verz.gruppen) for (const s of g.stellen) if (s.h === h && s.n === n) return s;
  return null;
}
function senden(d) { const f = $('#vf'); if (f && f.contentWindow) f.contentWindow.postMessage(d, '*'); }
function oeffneStelle(h, n, zeigen, bloecke) {
  const s = stelleVon(h, n);
  if (!s) return;
  if (s.mc) { quit('Diese Karte pflegt La Carte', 'Gerichte, Preise und Weine dort ändern: dann stimmen PDF, Website und alle Sprachen überein.', [['La Carte öffnen', () => window.open('../mission-control/', '_blank')]], false, 8000); return; }
  S.wahl = { h, n };
  $$('.ed').forEach(x => x.remove());
  $$('.st.aktiv').forEach(x => x.classList.remove('aktiv'));
  const gi = S.verz.gruppen.findIndex(g => g.stellen.includes(s));
  fuelle($(`#gruppen .gr[data-g="${gi}"]`));
  const btn = $(`.st[data-h="${h}"][data-n="${n}"]`);
  if (!btn) return;
  btn.classList.add('aktiv');
  const det = btn.closest('details'); det.open = true;
  const key = `text|${S.seite}|${h}|${n}`;
  const op = S.offen[key];
  const jetzt = op ? op.neu : (s.neu !== undefined ? s.neu : s.html);
  const navi = /Kopf und Leiste/.test(det.querySelector('summary b').textContent) || s.tag === 'a' && s.gleich === 1 && s.t.length < 30;
  const ueberall = op ? op.ueberall : (s.ueberall !== undefined ? s.ueberall : navi);
  const ed = document.createElement('div');
  ed.className = 'ed';
  ed.innerHTML = `<span class="mono">${TAGNAME[s.tag] || 'Text'}${s.art === 'el' && /<(em|i)\b/.test(s.html) ? ' · Kursives bleibt kursiv' : ''}</span>
    <div class="ed__f" contenteditable="${s.art === 'el' ? 'true' : 'plaintext-only'}" spellcheck="true" lang="de-CH">${s.art === 'el' ? jetzt : esc(jetzt.replace(/<[^>]+>/g, ''))}</div>
    <div class="ed__z">
      <label><input type="checkbox" id="ed-ue" ${ueberall ? 'checked' : ''}> Überall ändern, wo genau dieser Text steht (alle Seiten)</label>
      ${(s.neu !== undefined || op) ? '<button class="link" type="button" id="ed-zurueck">Wie ursprünglich</button>' : ''}
      <button class="link" type="button" id="ed-zu">Schliessen</button>
    </div>
    ${s.neu !== undefined || op ? `<p class="ed__vor"><b>Ursprünglich:</b> ${esc(s.t)}</p>` : ''}
    <div class="ed__bl" id="ed-bl" hidden></div>`;
  btn.after(ed);
  const f = $('.ed__f', ed);
  const merk = () => {
    const neu = s.art === 'el' ? f.innerHTML : f.textContent;
    const urs = s.art === 'el' ? s.html : s.t;
    const ue = $('#ed-ue', ed).checked;
    if (neu.trim() === (s.neu !== undefined ? s.neu : urs).trim() && ue === (s.ueberall !== undefined ? s.ueberall : navi)) { vergessen(key); btn.classList.remove('offen'); }
    else { vormerken(key, { art: 'text', seite: S.seite, h, n, neu, ueberall: ue, vorschau: f.textContent }); btn.classList.add('offen'); }
    $('span', btn).textContent = f.textContent;
    senden({ bureau: 'tippe', h, n, html: s.art === 'el' ? neu : esc(neu) });
  };
  f.oninput = merk;
  $('#ed-ue', ed).onchange = merk;
  f.addEventListener('paste', e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  f.addEventListener('keydown', e => { if (e.key === 'Enter' && s.art !== 'el') e.preventDefault(); });
  if ($('#ed-zurueck', ed)) $('#ed-zurueck', ed).onclick = () => {
    const urs = s.art === 'el' ? s.html : esc(s.t);
    f.innerHTML = urs;
    vormerken(key, { art: 'text', seite: S.seite, h, n, neu: s.art === 'el' ? s.html : s.t, ueberall: $('#ed-ue', ed).checked, vorschau: s.t });
    btn.classList.add('offen');
    senden({ bureau: 'tippe', h, n, html: urs });
  };
  $('#ed-zu', ed).onclick = () => { ed.remove(); btn.classList.remove('aktiv'); S.wahl = null; };
  if (bloecke && bloecke.length) zeigeBloecke(bloecke, $('#ed-bl', ed));
  if (zeigen) senden({ bureau: 'zeige', h, n, sanft: true });
  btn.scrollIntoView({ block: 'nearest' });
  setTimeout(() => { f.focus(); }, 30);
}
function zeigeBloecke(bloecke, box) {
  const NAME = { section: 'Abschnitt', article: 'Karte', li: 'Listenpunkt', figure: 'Bild mit Zeile', aside: 'Kasten' };
  bloecke = bloecke.filter(b => NAME[b.tag]);
  if (!bloecke.length) return;
  box.hidden = false;
  box.innerHTML = '<p>Statt den Text zu ändern, etwas ganz von der Seite nehmen:</p>' + bloecke.slice(0, 4).map(b =>
    `<button class="link rot" type="button" data-bl="${b.h}|${b.n}" data-t="${esc(b.t)}">${NAME[b.tag] || 'Block'} ausblenden${b.t ? ': «' + esc(b.t.slice(0, 50)) + (b.t.length > 50 ? '…' : '') + '»' : ''}</button>`).join('');
  $$('[data-bl]', box).forEach(x => {
    x.onmouseenter = () => { const [h, n] = x.dataset.bl.split('|'); senden({ bureau: 'zeige', blk: h, n: +n, still: true }); };
    x.onclick = () => { const [h, n] = x.dataset.bl.split('|'); blockAus(h, +n, x.dataset.t); };
  });
}
function blockAus(h, n, titel) {
  fenster(`<h2>Ausblenden, <em>nicht löschen.</em></h2><p class="satz">«${esc((titel || '').slice(0, 120))}» verschwindet von der Seite, in allen Sprachen. Unter «Entwurf» oder oben auf dieser Seite holen Sie es jederzeit zurück.</p>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Abbrechen</button><button class="kn kn--gefahr" type="button" id="bl-ja">Ausblenden und speichern<i>${PF}</i></button></div>`, true);
  $('#bl-ja').onclick = () => { fensterZu(); vormerken(`aus|${S.seite}|${h}|${n}`, { art: 'aus', seite: S.seite, h, n, an: true }); speichern(); };
}
window.addEventListener('message', ev => {
  const d = ev.data || {};
  if (!d.bureau) return;
  if (d.bureau === 'geladen') { $$('.rahmen.laedt').forEach(x => { const f = x.querySelector('iframe'); if (f && f.contentWindow === ev.source) x.classList.remove('laedt'); }); if (S.nachLaden) S.nachLaden(); }
  if (d.bureau === 'scroll') S.y = d.y;
  if (d.bureau === 'text' && S.ansicht === 'bereich') { oeffneStelle(d.h, d.n, false, d.bloecke); senden({ bureau: 'zeige', h: d.h, n: d.n, still: true }); }
  if (d.bureau === 'bild' && S.ansicht === 'bereich') bildFenster(d.b, d.n, d.bloecke || []);
  if (d.bureau === 'gehe') {
    const b = bereichVon(d.seite);
    if (b && S.ansicht === 'bereich') { S.bereich = b.key; S.seite = d.seite; S.wahl = null; S.y = 0; rand(); zeichne(); }
  }
});

/* ---------- Foto tauschen ---------- */
async function bildFenster(b, n, bloecke) {
  for (const g of S.verz.gruppen) for (const f of g.fotos) if (f.b === b && f.n === n && f.mc) { quit('Dieses Foto gehört zur Karte', 'Die Fotos der Gerichte ordnet La Carte zu.', [], false, 6000); return; }
  if (!S.bilder) S.bilder = (await api('bilder')).bilder;
  let f0 = null;
  for (const g of S.verz.gruppen) for (const f of g.fotos) if (f.b === b && f.n === n) f0 = f;
  f0 = f0 || { b, n, alt: '' };
  const key = `bild|${S.seite}|${b}|${n}`;
  const op = S.offen[key];
  let wahl = op ? op.neu : (f0.neu || b);
  senden({ bureau: 'zeige', b, n, still: true });
  fenster(`<h2>Foto <em>tauschen.</em></h2><p class="satz">Links das Foto, wie es jetzt steht. Rechts die Fotos des Hauses: eines wählen oder ein eigenes hochladen. Mindestens 900 Pixel breit, besser 2000.</p>
    <div class="bild-wahl">
      <div><div class="bild-jetzt"><img id="bw-img" src="../assets/img/${wahl}-s.webp" onerror="this.onerror=null;this.src='../assets/img/${wahl}.webp'" alt=""></div>
        <label class="feld" style="margin-top:16px"><span>Bildbeschreibung (für Blinde und Google)</span><textarea id="bw-alt" rows="2">${esc(op ? op.alt || f0.alt : (f0.alt_neu || f0.alt))}</textarea></label>
        <label class="ed__z"><label><input type="checkbox" id="bw-ue" ${op && op.ueberall ? 'checked' : ''}> Überall tauschen, wo dieses Foto steht</label></label>
        <div class="ed__bl" id="bw-bl" hidden></div></div>
      <div><label class="suche">${LUPE}<input type="search" id="bw-q" placeholder="Fotos suchen: Zimmer, Bar, Spa, Garten …"></label>
        <div style="margin:-4px 0 12px"><label class="kn kn--linie kn--klein" style="cursor:pointer">Eigenes Foto hochladen<i>${PF}</i><input type="file" id="bw-hoch" accept="image/*" hidden></label></div>
        <div class="bibl" id="bw-l"></div></div>
    </div>
    <div class="fenster__kn">${f0.neu ? '<button class="link" type="button" id="bw-urs">Ursprüngliches Foto</button>' : ''}<button class="link" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="bw-ok">Übernehmen<i>${PF}</i></button></div>`);
  const liste = q => {
    q = (q || '').trim().toLowerCase();
    const L = S.bilder.filter(x => !q || (x.b + ' ' + x.alt).toLowerCase().includes(q)).slice(0, 240);
    $('#bw-l').innerHTML = L.map(x => `<button type="button" data-b="${x.b}" aria-pressed="${x.b === wahl}" title="${esc(x.alt || x.b)}"><img src="${x.klein}" alt="" loading="lazy">${x.eigen ? '<span>Eigenes</span>' : ''}</button>`).join('');
    $$('#bw-l [data-b]').forEach(y => y.onclick = () => { wahl = y.dataset.b; $$('#bw-l [data-b]').forEach(z => z.setAttribute('aria-pressed', z === y)); $('#bw-img').src = y.querySelector('img').src; const t = S.bilder.find(z => z.b === wahl); if (t && t.alt && wahl !== b) $('#bw-alt').value = t.alt; });
  };
  liste('');
  $('#bw-q').oninput = e => liste(e.target.value);
  if (bloecke.length) zeigeBloecke(bloecke, $('#bw-bl'));
  $('#bw-hoch').onchange = async e => {
    const datei = e.target.files[0]; if (!datei) return;
    const daten = await new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = nein; r.readAsDataURL(datei); });
    try {
      quit('Foto wird vorbereitet …', datei.name, [], false, 3000);
      const r = await api('hochladen', { name: datei.name, daten });
      S.bilder = (await api('bilder')).bilder;
      wahl = r.b; liste(''); $('#bw-img').src = '..' + r.klein;
      quit('Foto hochgeladen', `${r.w} × ${r.h} Pixel, jetzt unter den Fotos des Hauses.`, [], false, 5000);
    } catch (er) { fehler(er); }
  };
  if ($('#bw-urs')) $('#bw-urs').onclick = () => { wahl = b; $('#bw-img').src = `../assets/img/${b}-s.webp`; $('#bw-alt').value = f0.alt; liste($('#bw-q').value); };
  $('#bw-ok').onclick = () => {
    const alt = $('#bw-alt').value.trim();
    vormerken(key, { art: 'bild', seite: S.seite, b, n, neu: wahl, alt: alt !== f0.alt ? alt : '', ueberall: $('#bw-ue').checked });
    fensterZu();
    speichern();
  };
}

/* ---------- Angaben des Hauses ---------- */
async function zeichneAngaben() {
  const L = (await api('angaben')).angaben;
  const gruppen = [...new Set(L.map(a => a.gruppe))];
  const SATZ = { Kontakt: 'Telefon und E-Mail stehen in der Kopfzeile, im Fuss, auf der Kontaktseite und in den Formularen.', Adresse: 'Die Adresse steht im Fuss jeder Seite, auf Kontakt und Anreise.', Links: 'Wohin die Knöpfe führen. Gebucht und reserviert wird weiter bei den Diensten des Hauses.' };
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Angaben <em>des Hauses.</em>', 'Eine Angabe, jede Stelle: Ändern Sie die Telefonnummer hier, wechselt sie auf allen Seiten, in allen sechs Sprachen und in jedem Knopf zum Anrufen.') +
    gruppen.map(g => `<section class="karte"><div class="kh"><i class="kh__z">${ic({ Kontakt: 'tel', Adresse: 'ort', Links: 'link' }[g] || 'haus')}</i><div><h3>${g}</h3><p>${SATZ[g] || ''}</p></div></div>${L.filter(a => a.gruppe === g).map(a => {
      const op = S.offen['angabe|' + a.key];
      return `<div class="fz${op ? ' offen' : ''}${a.wert !== a.standard ? ' geaendert' : ''}" data-k="${a.key}"><span><i class="fz__z">${ic(a.art === 'tel' ? 'tel' : a.art === 'mail' ? 'mail' : a.art === 'link' ? 'link' : 'ort')}</i><b>${esc(a.label)}</b><small>steht ${a.mal}× auf ${a.seiten} Seite${a.seiten === 1 ? '' : 'n'}</small></span>
        <input type="${a.art === 'mail' ? 'email' : a.art === 'tel' ? 'tel' : a.art === 'link' ? 'url' : 'text'}" value="${esc(op ? op.wert : a.wert)}" data-std="${esc(a.wert)}" spellcheck="false">
        ${a.wert !== a.standard ? `<button class="link" type="button" data-urs="${esc(a.standard)}">Ursprünglich</button>` : '<span></span>'}
        ${a.wert !== a.standard ? `<em>Ursprünglich: ${esc(a.standard)}</em>` : ''}</div>`;
    }).join('')}</section>`).join('');
  $$('.fz[data-k]').forEach(z => {
    const i = $('input', z), k = z.dataset.k;
    i.oninput = () => { if (i.value.trim() === i.dataset.std) { vergessen('angabe|' + k); z.classList.remove('offen'); } else { vormerken('angabe|' + k, { art: 'angabe', key: k, wert: i.value.trim() }); z.classList.add('offen'); } };
    const u = $('[data-urs]', z); if (u) u.onclick = () => { i.value = u.dataset.urs; i.oninput(); };
  });
}

/* ---------- Zeiten & Preise ---------- */
async function zeichneZahlen() {
  const L = (await api('zahlen')).zahlen;
  const F = { alle: () => true, preise: s => /CHF|Fr\./.test(s.t), zeiten: s => /Uhr|\d[.:]\d\d\s?[–-]/.test(s.t), groessen: s => /m²|Person|Nacht|Nächte|Minuten/.test(s.t) };
  const filt = L.filter(F[S.zahlenFilter] || F.alle);
  const nachSeite = {};
  filt.forEach(s => { (nachSeite[s.seite] = nachSeite[s.seite] || []).push(s); });
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Zeiten <em>& Preise.</em>', `Jede Stelle der Website mit einem Preis, einer Uhrzeit, einer Dauer oder einer Grösse, Seite für Seite. Direkt hier ändern oder «In der Seite» öffnen. ${L.length} Stellen.`) +
    `<div class="filter"><div class="wahl2" role="group" aria-label="Filter">${[['alle', 'Alle'], ['preise', 'Preise'], ['zeiten', 'Zeiten'], ['groessen', 'Grössen und Dauer']].map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${S.zahlenFilter === k}">${n}</button>`).join('')}</div></div>` +
    Object.entries(nachSeite).map(([seite, l]) => { const be = bereichVon(seite); return `<section class="karte"><div class="kh">${be && be.foto ? `<img class="kh__b" src="../assets/img/${be.foto}-s.webp" alt="" loading="lazy" onerror="this.onerror=null;this.src='../assets/img/${be.foto}.webp'">` : ''}<div><h3>${esc(l[0].seite_name)}</h3><p>${esc(l[0].bereich)} · ${l.length} Stelle${l.length > 1 ? 'n' : ''}</p></div><button class="kn kn--linie kn--klein" type="button" data-gehe="b:${be ? be.key : ''}" data-seite="${seite}">Seite öffnen<i>${PF}</i></button></div>${l.map(s => {
      const op = S.offen[`text|${seite}|${s.h}|${s.n}`];
      return `<div class="zl${s.neu !== undefined ? ' geaendert' : ''}" data-s="${seite}" data-h="${s.h}" data-n="${s.n}"><i class="zl__z">${ic(/CHF|Fr\./.test(s.t) ? 'preis' : /Uhr|\d[.:]\d\d\s?[–-]/.test(s.t) ? 'uhr' : 'mass')}</i><div><small>${esc(s.gruppe)}${s.vor && s.vor !== s.gruppe ? ' · ' + esc(s.vor) : ''}</small><span contenteditable="plaintext-only" spellcheck="false" class="ed__f" style="min-height:0;padding:8px 10px">${esc(op ? op.vorschau : (s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, '') : s.t))}</span></div>
        <span class="zl__kn"><button class="zl__blick" type="button" data-blick title="Kurz zeigen, wo das auf der Seite steht">${ic('foto')}<span>Zeigen</span></button><button class="link" type="button" data-zeig="${seite}|${s.h}|${s.n}">In der Seite</button></span></div>`;
    }).join('')}</section>`; }).join('');
  $$('[data-f]').forEach(b => b.onclick = () => { S.zahlenFilter = b.dataset.f; zeichne(); });
  $$('.zl').forEach(z => {
    const s = L.find(x => x.seite === z.dataset.s && x.h === z.dataset.h && x.n === +z.dataset.n);
    const f = $('.ed__f', z), key = `text|${s.seite}|${s.h}|${s.n}`;
    f.oninput = () => {
      const t = f.textContent.trim(), alt = (s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, '') : s.t).trim();
      if (t === alt) vergessen(key);
      else if (s.art === 'el' && /<(em|i|b|strong|br|a)\b/.test(s.html)) {   // Auszeichnung im Satz: nur die Ziffern tauschen, Kursives bleibt
        vormerken(key, { art: 'text', seite: s.seite, h: s.h, n: s.n, neu: ersetzeText(s.neu !== undefined ? s.neu : s.html, alt, t), ueberall: false, vorschau: t });
      } else vormerken(key, { art: 'text', seite: s.seite, h: s.h, n: s.n, neu: s.art === 'el' ? esc(t) : t, ueberall: false, vorschau: t });
    };
  });
  $$('[data-zeig]').forEach(b => b.onclick = () => { const [seite, h, n] = b.dataset.zeig.split('|'); const be = bereichVon(seite); gehe('b:' + be.key, { seite, wahl: { h, n: +n } }); });
  blickVorschau();
}
/* Knopf «Zeigen» je Zeile (Robert 16.10.2026: nicht beim Überfahren, «das verrückelt»; stattdessen ein Knopf, der kurz das Bild der Seite zeigt,
   dann hineinzoomt und einen Kreis um die Stelle legt). Ein Fenster für alle Zeilen; eine Seite wird nur einmal geladen. Bewegung nur über transform und opacity. */
function blickVorschau() {
  /* «Zeigen» (Robert 16.10.2026: hell, gross und mittig, ruhig vom ganzen Bild zur Stelle, Stelle hell ausgeleuchtet statt gelber Kreis) */
  let box = $('#zl-blick');
  if (!box) {
    const schl = document.createElement('div'); schl.id = 'zl-schleier'; schl.className = 'zl-schleier'; document.body.appendChild(schl);
    box = document.createElement('div'); box.id = 'zl-blick'; box.className = 'zl-blick';
    box.innerHTML = '<div class="zl-blick__r"><iframe id="zb-f" title="Vorschau der Stelle" tabindex="-1"></iframe><span class="zl-blick__kreis"></span></div><p class="zl-blick__t"><span><small></small><b></b></span><button class="zl-blick__kn" type="button" data-nochmal>Nochmal</button><button class="zl-blick__zu" type="button" data-zu aria-label="Schliessen">×</button></p>';
    document.body.appendChild(box);
    box.__z = { seite: '', ziel: null, bereit: false };
    const zu = () => { box.classList.remove('auf'); schl.classList.remove('auf'); clearTimeout(box.__z.uhr); $('.zl-blick__kreis', box).classList.remove('an'); clearTimeout(box.__weg); box.__weg = setTimeout(() => { if (!box.classList.contains('auf')) box.style.display = 'none'; }, 520); };   // Safari liess das Fenster sonst stehen (16.10.2026)
    window.addEventListener('message', ev => { const f = $('#zb-f'); if (f && ev.source === f.contentWindow && (ev.data || {}).bureau === 'geladen') { box.__z.bereit = true; box.classList.remove('laedt'); setTimeout(blickZeig, 300); } });
    $('[data-zu]', box).onclick = zu; schl.onclick = zu;
    $('[data-nochmal]', box).onclick = () => blickZeig();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') zu(); });
  }
  const Z = box.__z;
  Z.seite = ''; Z.bereit = false;   // jede Ansicht lädt neu: der Entwurf kann sich geändert haben
  $$('.zl [data-blick]').forEach(k => k.onclick = () => {
    const z = k.closest('.zl');
    Z.ziel = { h: z.dataset.h, n: +z.dataset.n };
    $('b', box).textContent = z.closest('section').querySelector('h3').textContent;
    $('small', box).textContent = (z.querySelector('.zl__wo, small, .zl__o') || {}).textContent || 'So steht es auf der Seite';
    $('.zl-blick__kreis', box).classList.remove('an');
    clearTimeout(box.__weg); box.style.display = ''; void box.offsetWidth;
    box.classList.add('auf'); $('#zl-schleier').classList.add('auf');
    const f0 = $('#zb-f'), r0 = $('.zl-blick__r', box); if (Z.seite !== z.dataset.s) { f0.style.transition = 'none'; f0.style.transform = `scale(${r0.clientWidth / 1440})`; }
    if (Z.seite !== z.dataset.s) { Z.seite = z.dataset.s; Z.bereit = false; box.classList.add('laedt'); $('#zb-f').src = iframeUrl('entwurf', Z.seite, ''); } else blickZeig();
  });
}
function blickZeig() {
  const box = $('#zl-blick'), Z = box && box.__z; if (!Z || !Z.bereit || !Z.ziel) return;
  const f = $('#zb-f'), rahmen = $('.zl-blick__r', box), kreis = $('.zl-blick__kreis', box);
  let d, el; try { d = f.contentDocument; el = d.querySelector(`[data-e="${Z.ziel.h}"][data-en="${Z.ziel.n}"]`); } catch (e) { return; }
  if (!el) return;
  // in der Vorschau steht alles still: kein Hereinschweben, kein weiches Scrollen, sonst misst man eine Stelle, die noch unterwegs ist (Safari, 16.10.2026)
  if (!d.getElementById('zb-still')) { const st = d.createElement('style'); st.id = 'zb-still'; st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}html,body{scroll-behavior:auto!important}'; d.head.appendChild(st); }
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  const W = rahmen.clientWidth, H = rahmen.clientHeight, s0 = W / 1440, FH = f.offsetHeight || 900;
  const q = el.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  // nah genug, dass man es lesen kann, weit genug, dass man sieht, wo es steht
  const s1 = Math.min(1, Math.max(s0 * 1.5, Math.min(W * .42 / Math.max(q.width, 80), H * .3 / Math.max(q.height, 30))));
  // Ausschnitt bleibt in der Seite: nie leerer Rand neben der Seite
  const tx = Math.min(0, Math.max(W - 1440 * s1, W / 2 - cx * s1)), ty = Math.min(0, Math.max(H - FH * s1, H / 2 - cy * s1));
  f.style.transition = 'none'; f.style.transform = `translate(0,0) scale(${s0})`; kreis.classList.remove('an'); void f.offsetWidth;
  clearTimeout(Z.uhr);
  Z.uhr = setTimeout(() => {
    f.style.transition = 'transform 2.6s cubic-bezier(.45,0,.2,1)';
    f.style.transform = `translate(${tx}px,${ty}px) scale(${s1})`;
    const kw = q.width * s1 + 28, kh = q.height * s1 + 20;
    kreis.style.width = kw + 'px'; kreis.style.height = kh + 'px'; kreis.style.left = (tx + q.left * s1 - 14) + 'px'; kreis.style.top = (ty + q.top * s1 - 10) + 'px';
    Z.uhr = setTimeout(() => kreis.classList.add('an'), 2500);
  }, 1300);
}

function ersetzeText(html, alt, neu) {
  /* gleicher sichtbarer Text bis auf geänderte Stücke: das erste abweichende Wort-Stück im HTML-Text tauschen */
  const a = alt.split(/(\s+)/), b = neu.split(/(\s+)/);
  if (a.length !== b.length) return esc(neu);
  let h = html;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { if (!h.includes(a[i])) return esc(neu); h = h.replace(a[i], esc(b[i])); }
  return h;
}

/* ---------- Karten (La Carte) ---------- */
function karten() {
  const mc = (S.ue.karten && S.ue.karten.karten) || [];
  return kopf('Karten', 'La <em>Carte.</em>', 'Die vier Karten des Hauses pflegt La Carte: Gerichte, Preise, Weine, mit neuer PDF auf Knopfdruck. Dieselbe Quelle füllt die Karten auf den Restaurant- und Bar-Seiten, in allen Sprachen. Darum steht hier nichts doppelt.',
    `<a class="kn" href="../mission-control/" target="_blank" rel="noopener">La Carte öffnen<i>${PF}</i></a>`) +
    (S.ue.karten && S.ue.karten.fehler ? `<div class="leer-hinweis"><b>La Carte antwortet nicht.</b>${esc(S.ue.karten.fehler)}</div>` : '') +
    `<div class="kt-flaeche">${mc.map((k, i) => {   // die Originalkarten frei auf Papiergrund, wie in L’Imprimerie (Robert 15.10.2026: «so wie auf dem Screenshot, die Originalkarten»)
      const z = String(k.ziel || ''), bild = /mittag/.test(z) ? 'img/karte-mittag.webp' : `../unterlagen/img/n-${/wein/.test(z) ? 'weinkarte' : z}-01.webp`;
      const name = (/«(.+)»/.exec(k.name) || [, k.name.replace(/\s*\(.*\)$/, '')])[1];
      return `<a class="kt" style="--i:${i};--r:${[-2.5, 1.8, -1.2, 2.4, -1.8][i % 5]}deg" href="../mission-control/#${esc(z)}" target="_blank" rel="noopener"><span class="kt__b"><img src="${bild}" alt="Titelseite ${esc(name)}" loading="lazy" decoding="async"></span><b>${esc(name)}</b><small>${esc(k.gruppe || 'Karte')} · PDF vom ${esc((k.pdf_zeit || '–').split(' ')[0])}</small>${k.entwurf ? '<em>Entwurf wartet</em>' : ''}</a>`;
    }).join('')}</div>
    <h2 class="zw">So läuft <em>eine Preisänderung</em></h2>
    <div class="ablauf">${[
      ['preis', 'Ändern', 'In La Carte die Karte wählen, das Gericht anklicken, den Preis ändern. Gespeichert wird in den Entwurf.'],
      ['welt', 'Veröffentlichen', 'Neue PDF, Unterlagen-Seite und die Karte auf der Restaurant-Seite in allen sechs Sprachen, in einem Durchgang. Zwei bis fünf Minuten.'],
      ['sprache', 'Übersetzen', 'Neue Gerichte stehen auf den fremdsprachigen Seiten deutsch, bis sie übersetzt sind.'],
      ['zurueck', 'Zurückholen', 'Jede frühere Fassung holt La Carte unter «Frühere Fassungen» zurück.']].map(([k, t, x], i) => `<div class="ab" style="--i:${i}"><i class="ab__z">${ic(k)}</i><span class="mono">Schritt ${i + 1}</span><b>${t}</b><p>${x}</p></div>`).join('')}</div>
    <div class="karte ablauf__fuss"><p class="leise" style="margin:0">Texte rund um die Karten (Öffnungszeiten, Stimmung, Fotos der Lokale) ändern Sie hier im Bureau unter <button class="link" type="button" data-gehe="b:essen">Restaurants & Bar</button>.</p></div>`;
}

/* ---------- Hinweis für Gäste ---------- */
async function zeichneHinweis() {
  const e = (await api('entwurf')).entwurf;
  const h = (S.offen.hinweis && S.offen.hinweis) || Object.assign({ an: false, text: '', von: '', bis: '', link: '', linktext: '', farbe: 'marine', schrift: 'sans', groesse: 'mittel' }, e.hinweis || {});
  const wahl = (k, liste) => `<div class="wahl2 hw-wahl" role="group" data-hw="${k}">${liste.map(([v, n, f]) => `<button type="button" data-v="${v}" aria-pressed="${(h[k] || liste[0][0]) === v}">${f ? `<i style="background:${f}"></i>` : ''}${n}</button>`).join('')}</div>`;
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Hinweis <em>für Gäste.</em>', 'Ein Satz oben auf jeder Seite, in allen Sprachen: Bauarbeiten im SPA, ein geschlossenes Restaurant, ein besonderer Abend. Mit Zeitraum erscheint und verschwindet er von selbst.') +
    `<div class="hw-stil karte"><h3>Gestaltung des Banners</h3>
      <div class="hw-z"><span class="mono">Farbe</span>${wahl('farbe', [['marine', 'Marine', '#1b2033'], ['gold', 'Gold', '#e6d2a2'], ['creme', 'Creme', '#f7f0e3'], ['rot', 'Bar-Rot', '#8f2f2a']])}</div>
      <div class="hw-z"><span class="mono">Schrift</span>${wahl('schrift', [['sans', 'Klar'], ['serif', 'Elegant'], ['mono', 'Gesperrt']])}</div>
      <div class="hw-z"><span class="mono">Grösse</span>${wahl('groesse', [['klein', 'Klein'], ['mittel', 'Mittel'], ['gross', 'Gross']])}</div></div>
    <div class="hw-vor"><span class="mono">So sieht er aus</span>
      <div class="mini mini--gross" aria-hidden="true"><div class="mini__leiste"><i></i><i></i><i></i><span>grandbeaurivage.ch</span></div>
        <div id="h-probe"></div>
        <div class="mini__seite"><img src="../assets/img/haus-vorfahrt-m.webp" alt=""><div class="mini__nav"><span></span><span></span>${ZEICHEN}<span></span><span></span></div><div class="mini__t"><small>Interlaken · seit 1874</small><b>Grand Beau-Rivage</b></div></div></div>
      <p class="leise" id="h-probe-satz"></p></div>
    <div class="arbeit hw-arbeit"><div class="karte">
      <label class="schalter" style="margin-bottom:18px"><input type="checkbox" id="h-an" ${h.an ? 'checked' : ''}> Hinweis zeigen</label>
      <label class="feld"><span>Text</span><textarea id="h-text" rows="3" placeholder="Das La Vallée SPA ist vom 3. bis 7. November wegen Revision geschlossen.">${esc(h.text)}</textarea></label>
      <div class="zwei"><label class="feld"><span>Ab (freiwillig)</span><input type="date" id="h-von" value="${esc(h.von)}"></label><label class="feld"><span>Bis (freiwillig)</span><input type="date" id="h-bis" value="${esc(h.bis)}"></label></div>
      <div class="zwei"><label class="feld"><span>Link (freiwillig)</span><input type="text" id="h-link" value="${esc(h.link)}" placeholder="spa.html oder https://…"></label><label class="feld"><span>Linktext</span><input type="text" id="h-lt" value="${esc(h.linktext)}" placeholder="Mehr erfahren"></label></div>
      <p class="leise">Übersetzt wird der Hinweis unter «Sprachen», sobald er gespeichert ist. Bis dahin steht er auf allen Sprachen deutsch.</p>
    </div></div>`;
  const zeig = () => {
    const st = k => ($(`[data-hw="${k}"] [aria-pressed="true"]`) || {}).dataset.v;
    const d = { art: 'hinweis', an: $('#h-an').checked, text: $('#h-text').value.trim(), von: $('#h-von').value, bis: $('#h-bis').value, link: $('#h-link').value.trim(), linktext: $('#h-lt').value.trim(), farbe: st('farbe'), schrift: st('schrift'), groesse: st('groesse') };
    const alt = Object.assign({ an: false, text: '', von: '', bis: '', link: '', linktext: '', farbe: 'marine', schrift: 'sans', groesse: 'mittel' }, e.hinweis || {});
    if (['an', 'text', 'von', 'bis', 'link', 'linktext', 'farbe', 'schrift', 'groesse'].every(k => String(d[k]) === String(alt[k]))) vergessen('hinweis'); else vormerken('hinweis', d);
    const bsp = !d.text, txt = d.text || $('#h-text').placeholder;
    const FA = { marine: ['#1b2033', '#f7f0e3', '#E6D2A2'], gold: ['#e6d2a2', '#1b2033', '#1b2033'], creme: ['#f7f0e3', '#1b2033', '#7d6a4f'], rot: ['#8f2f2a', '#fbf4e4', '#f0dfb8'] }[d.farbe] || ['#1b2033', '#f7f0e3', '#E6D2A2'];
    const gr = { klein: 13, mittel: 15, gross: 18 }[d.groesse] || 15;
    const fo = d.schrift === 'serif' ? `font:500 ${gr + 4}px/1.35 'Cormorant Garamond',Georgia,serif` : d.schrift === 'mono' ? `font:400 ${gr - 3}px/1.7 'DM Mono',monospace;letter-spacing:.14em;text-transform:uppercase` : `font:500 ${gr}px/1.5 'Instrument Sans',system-ui,sans-serif`;
    $('#h-probe').innerHTML = `<div class="mini__band${d.an && !bsp ? '' : ' aus'}" style="background:${FA[0]};color:${FA[1]};${fo};--lk:${FA[2]}">${bsp ? '<em>Beispiel</em>' : ''}${esc(txt)}${d.link || bsp ? ` <u>${esc(d.linktext || 'Mehr erfahren')}</u>` : ''}</div>`;
    $('#h-probe-satz').textContent = bsp ? 'Noch kein Text: so sähe ein Hinweis aus. Er steht oben auf jeder Seite, über dem Menü.' : d.an ? (d.von || d.bis ? `Steht oben auf jeder Seite${d.von ? ' ab ' + d.von.split('-').reverse().join('.') : ''}${d.bis ? ' bis ' + d.bis.split('-').reverse().join('.') : ''}.` : 'Steht oben auf jeder Seite, sobald Sie veröffentlichen.') : 'Ausgeschaltet: steht noch nirgends. Oben «Hinweis zeigen» einschalten.';
  };
  $$('#ansicht input, #ansicht textarea').forEach(i => i.oninput = zeig);
  $$('[data-hw] button').forEach(b => b.onclick = () => { $$('button', b.parentNode).forEach(x => x.setAttribute('aria-pressed', x === b)); zeig(); });
  zeig();
}

/* ---------- Google-Texte ---------- */
async function zeichneGoogle() {
  const seiten = S.ue.bereiche.flatMap(b => b.seiten);
  const verz = await Promise.all(seiten.map(s => api('seite?s=' + encodeURIComponent(s.datei)).then(v => [s, v.seo])));
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Google-<em>Texte.</em>', 'Titel und Beschreibung jeder Seite, so wie Google sie in den Suchergebnissen zeigt. Titel bis etwa 60 Zeichen, Beschreibung bis etwa 155.') +
    verz.map(([s, seo]) => {
      const op = S.offen['seo|' + s.datei];
      const t = op ? op.titel : (seo.neu.titel || ''), d = op ? op.beschr : (seo.neu.beschr || '');
      return `<section class="karte" data-s="${s.datei}"><h3>${esc(s.name)}</h3><div class="zwei"><div>
        <label class="feld"><span>Titel <i class="zaehler" data-z="t"></i></span><input type="text" data-f="titel" value="${esc(t)}" placeholder="${esc(seo.titel)}"></label>
        <label class="feld"><span>Beschreibung <i class="zaehler" data-z="d"></i></span><textarea data-f="beschr" rows="3" placeholder="${esc(seo.beschr)}">${esc(d)}</textarea></label>
        <small class="leise">Leer gelassen gilt der Text, der grau im Feld steht.</small></div>
        <div class="google"><small>grandbeaurivage.ch › ${esc(s.datei.replace('.html', ''))}</small><b data-g="t"></b><span data-g="d"></span></div></div></section>`;
    }).join('');
  $$('.karte[data-s]').forEach(k => {
    const t = $('[data-f=titel]', k), d = $('[data-f=beschr]', k), alt = { t: t.value, d: d.value };
    const zeig = () => {
      const tt = t.value.trim() || t.placeholder, dd = d.value.trim() || d.placeholder;
      $('[data-g=t]', k).textContent = tt.length > 62 ? tt.slice(0, 60) + ' …' : tt;
      $('[data-g=d]', k).textContent = dd.length > 158 ? dd.slice(0, 155) + ' …' : dd;
      $('[data-z=t]', k).textContent = tt.length + '/60'; $('[data-z=t]', k).classList.toggle('zu', tt.length > 60);
      $('[data-z=d]', k).textContent = dd.length + '/155'; $('[data-z=d]', k).classList.toggle('zu', dd.length > 155);
    };
    const merk = () => { if (t.value === alt.t && d.value === alt.d) vergessen('seo|' + k.dataset.s); else vormerken('seo|' + k.dataset.s, { art: 'seo', seite: k.dataset.s, titel: t.value.trim(), beschr: d.value.trim() }); zeig(); };
    t.oninput = merk; d.oninput = merk; zeig();
  });
}

/* ---------- Sprachen ---------- */
async function zeichneSprachen() {
  const L = (await api('sprachen')).liste;
  $('#ansicht').innerHTML = kopf('Für alle Seiten', '<em>Sprachen.</em>', 'Die Website steht in Deutsch, Englisch, Französisch, Chinesisch, Koreanisch und Arabisch. Ein Text, den Sie auf Deutsch ändern, steht in den anderen Sprachen deutsch, bis er hier übersetzt ist. Nichts wird geraten.') +
    (L.length ? L.map((e, i) => `<section class="karte ue" data-i="${i}"><span class="mono">${esc(e.wo)}</span><div class="ue__de">${esc(e.de)}</div>${e.vorher_de ? `<div class="ue__vor">Vorher: ${esc(e.vorher_de)}</div>` : ''}
      ${Object.entries(e.sp).map(([sp, x]) => {
        const op = S.offen[`wort|${sp}|${e.de}`];
        return `<div class="ue__sp"><label for="ue-${i}-${sp}">${SPNAME[sp]}</label><input id="ue-${i}-${sp}" type="text" data-sp="${sp}" ${sp === 'ar' ? 'dir="rtl"' : ''} value="${esc(op ? op.ue : x.wert)}" placeholder="${x.haus ? esc(x.haus) : 'steht deutsch, bis hier etwas steht'}">${x.haus ? '<small>Schon übersetzt (aus dem Wörterbuch der Website).</small>' : x.alt ? `<small>Bisher: ${esc(x.alt)}</small>` : ''}</div>`;
      }).join('')}</section>`).join('')
      : `<div class="leer-hinweis"><b>Nichts zu übersetzen.</b>Sobald Sie einen Text auf Deutsch ändern und speichern, steht er hier mit einem Feld je Sprache. So sieht das dann aus:</div>
      <div class="ue-weg">${[['stift', 'Auf Deutsch ändern', 'Im Bureau einen Satz der Website neu schreiben und speichern.'],
        ['sprache', 'Hier übersetzen', 'Der Satz erscheint hier, mit einem Feld für jede der fünf anderen Sprachen.'],
        ['welt', 'Gäste lesen ihn', 'Wer die Website auf Englisch, Französisch, Chinesisch, Koreanisch oder Arabisch öffnet, liest Ihre Übersetzung.']].map(([k, t, x], i) => `<div class="ue-weg__s" style="--i:${i}"><i>${ic(k)}</i><b>${t}</b><span>${x}</span></div>`).join('')}</div>
      <section class="karte ue ue--bsp" aria-label="Beispiel"><div class="ue-wo"><img src="../assets/img/fruehstueck-buffet-s.webp" alt=""><div><small>Steht auf der Website</small><b>Restaurants & Bar · Abschnitt Frühstück</b><span>Gäste, die die Seite in einer anderen Sprache öffnen, lesen die Zeile aus dem Feld ihrer Sprache.</span></div></div><span class="mono">Beispiel · Restaurants & Bar · Frühstück</span><div class="ue__de">Unser Frühstück servieren wir von 6.30 bis 11.00 Uhr.</div><div class="ue__vor">Vorher: Unser Frühstück servieren wir von 7.00 bis 10.30 Uhr.</div>
        ${[['en', 'We serve breakfast from 6.30 to 11.00.'], ['fr', 'Nous servons le petit-déjeuner de 6 h 30 à 11 h.'], ['zh', '早餐供应时间为 6:30 至 11:00。'], ['ko', '조식은 6시 30분부터 11시까지 제공됩니다.'], ['ar', 'نقدّم الفطور من الساعة 6:30 حتى 11:00.']].map(([sp, t]) => `<div class="ue__sp"><label>${SPNAME[sp]}</label><input type="text" value="${t}" ${sp === 'ar' ? 'dir="rtl"' : ''} disabled tabindex="-1"></div>`).join('')}</section>`);
  $$('.ue[data-i]').forEach(k => {
    const e = L[+k.dataset.i];
    $$('input[data-sp]', k).forEach(i => i.oninput = () => {
      const sp = i.dataset.sp, key = `wort|${sp}|${e.de}`;
      if (i.value.trim() === e.sp[sp].wert) vergessen(key); else vormerken(key, { art: 'wort', sp, de: e.de, ue: i.value.trim() });
    });
  });
}

/* ---------- Entwurf & Vergleich ---------- */
function markiere(a, b) {
  const wa = String(a || '').split(/(\s+)/), wb = String(b || '').split(/(\s+)/);
  const gleich = new Set(wa);
  return wb.map(w => /\S/.test(w) && !gleich.has(w) ? `<mark>${esc(w)}</mark>` : esc(w)).join('');
}
async function zeichneEntwurf() {
  const L = (await api('aenderungen')).aenderungen;
  const seiten = [...new Set(L.map(a => a.seite).filter(Boolean))];
  const vglSeite = S.vglSeite || seiten[0] || 'index.html';
  const alle = S.ue.bereiche.flatMap(b => b.seiten);
  const zelle = (a, w) => a.art === 'bild' ? `<img src="../assets/img/${esc(w)}-s.webp" onerror="this.onerror=null;this.src='../assets/img/${esc(w)}.webp'" alt="">` : '';
  $('#ansicht').innerHTML = kopf('Entwurf', 'Vorher, <em>nachher.</em>', L.length ? `${L.length} Änderung${L.length > 1 ? 'en warten' : ' wartet'}. Jede einzeln zurücknehmen, unten Seite für Seite vergleichen, dann veröffentlichen.` : 'Der Entwurf ist gleich wie die Website.',
    L.length ? `<button class="kn kn--linie" type="button" id="e-weg">Entwurf verwerfen<i>${PF}</i></button><button class="kn" type="button" id="e-raus">Veröffentlichen<i>${PF}</i></button>` : '') +
    (L.length ? L.map((a, i) => `<div class="ae"><span class="mono">${esc(a.was)}<br>${esc(a.wo)}</span>
        <div class="vor"><small>Vorher</small>${a.art === 'bild' ? zelle(a, a.vorher) : a.vorher ? `<del>${esc(a.vorher)}</del>` : '<i>leer</i>'}</div>
        <div class="nach"><small>Nachher</small>${a.art === 'bild' ? zelle(a, a.nachher) : a.nachher ? markiere(a.vorher, a.nachher) : '<i>leer</i>'}</div>
        <div class="ae__kn"><button class="link" type="button" data-z="${i}">Zurücknehmen</button>${a.seite && alle.some(s => s.datei === a.seite) ? `<button class="link" type="button" data-v="${a.seite}">Vergleichen</button>` : ''}</div></div>`).join('')
      : `<div class="leer-hinweis"><b>Nichts offen.</b>Was Sie speichern, steht hier mit vorher und nachher, bevor es auf die Website kommt. So sieht das dann aus:</div>
      <div class="ae-bsp" aria-label="Beispiel">${[   // Beispiel, solange nichts offen ist (Robert 15.10.2026: «so ein Beispiel-Case einbauen»)
        ['Text', 'Restaurants & Bar', 'Frühstück täglich von 7.00 bis 10.30 Uhr.', 'Frühstück täglich von 6.30 bis 11.00 Uhr.'],
        ['Preis', 'La Vallée SPA', 'Day Spa, mit Smoothie: CHF 40', 'Day Spa, mit Smoothie: CHF 45'],
        ['Foto', 'Startseite', 'halle-gepaeck', 'halle-sessel']].map(([was, wo, v, n]) => `<div class="ae"><span class="mono">${was}<br>${wo}</span>
          <div class="vor"><small>Vorher</small>${was === 'Foto' ? `<img src="../assets/img/${v}-s.webp" alt="">` : `<del>${v}</del>`}</div>
          <div class="nach"><small>Nachher</small>${was === 'Foto' ? `<img src="../assets/img/${n}-s.webp" alt="">` : markiere(v, n)}</div>
          <div class="ae__kn"><span class="link" aria-disabled="true">Zurücknehmen</span><span class="link" aria-disabled="true">Vergleichen</span></div></div>`).join('')}</div>`) +
    `<h2 class="zw">Seite für Seite <em>vergleichen</em></h2>
    <div class="reiter"><select class="sel" id="vgl-s" aria-label="Seite">${alle.map(s => `<option value="${s.datei}" ${s.datei === vglSeite ? 'selected' : ''}>${esc(s.name)}${seiten.includes(s.datei) ? ' · geändert' : ''}</option>`).join('')}</select>
      <span class="leise">Links die Website, wie sie jetzt ist. Rechts mit dem Entwurf. Gold umrandet: vom Haus geändert.</span></div>
    <div class="vgl2"><div>${vorschauHtml('va', 'Jetzt auf der Website')}</div><div>${vorschauHtml('vb', 'Mit dem Entwurf')}</div></div>`;
  $$('[data-z]').forEach(b => b.onclick = async () => { try { const r = await api('speichern', { ops: [{ art: 'zuruecknehmen', a: L[+b.dataset.z] }] }); await frisch(); quit('Zurückgenommen', (r.was || []).join(' · '), [], false, 5000); } catch (e) { fehler(e); } });
  $$('[data-v]').forEach(b => b.onclick = () => { S.vglSeite = b.dataset.v; zeichne(); setTimeout(() => $('.vgl2').scrollIntoView({ behavior: 'smooth' }), 80); });
  $('#vgl-s').onchange = e => { S.vglSeite = e.target.value; zeichne(); };
  if ($('#e-raus')) $('#e-raus').onclick = veroeffentlichenFenster;
  if ($('#e-weg')) $('#e-weg').onclick = () => {
    fenster(`<h2>Entwurf <em>verwerfen?</em></h2><p class="satz">Alle ${L.length} Änderungen im Entwurf gehen zurück auf den Stand der Website. Der verworfene Entwurf wird aufgehoben: «Rückgängig» in der Quittung holt ihn zurück.</p><div class="fenster__kn"><button class="link" type="button" data-zu>Behalten</button><button class="kn kn--gefahr" type="button" id="w-ja">Verwerfen<i>${PF}</i></button></div>`, true);
    $('#w-ja').onclick = async () => { fensterZu(); try { await api('verwerfen', {}); S.offen = {}; await frisch(); quit('Entwurf verworfen', 'Er ist aufgehoben.', [], false, 5000); } catch (e) { fehler(e); } };
  };
  vorschauVerbinden('va', iframeUrl('stand', vglSeite, S.sp, true));
  vorschauVerbinden('vb', iframeUrl('entwurf', vglSeite, S.sp, true));
  S.nachLaden = null;
}

/* ---------- Veröffentlichen ---------- */
async function veroeffentlichenFenster() {
  if (offenZahl()) { quit('Erst speichern', 'Es gibt Eingaben, die noch nicht gespeichert sind.', [['Jetzt speichern', speichern]], false, 6000); return; }
  const L = (await api('aenderungen')).aenderungen;
  if (!L.length) { quit('Nichts geändert, nichts veröffentlicht.', '', [], false, 4000); return; }
  fenster(`<h2>Auf die <em>Website.</em></h2><p class="satz">${L.length} Änderung${L.length > 1 ? 'en gehen' : ' geht'} live, auf allen Seiten und in allen sechs Sprachen. Vorher wird alles auf einer Probe gesetzt und geprüft. Der jetzige Stand kommt in die früheren Fassungen.</p>
    <div style="max-height:34vh;overflow:auto">${L.map(a => `<div class="zl"><div><small>${esc(a.was)} · ${esc(a.wo)}</small><span>${a.art === 'bild' ? 'Foto ' + esc(a.nachher) : esc(a.nachher || 'entfernt')}</span></div></div>`).join('')}</div>
    <label class="feld" style="margin-top:16px"><span>Notiz für den Verlauf (freiwillig)</span><input type="text" id="r-notiz" placeholder="zum Beispiel: Herbstpreise SPA"></label>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Noch nicht</button><button class="kn" type="button" id="r-ja">Jetzt veröffentlichen<i>${PF}</i></button></div>`);
  $('#r-ja').onclick = async () => {
    try {
      const r = await api('veroeffentlichen', { notiz: $('#r-notiz').value });
      if (!r.laeuft) { fensterZu(); quit(r.meldung || 'Nichts veröffentlicht.', '', [], false, 4000); return; }
      fortschritt();
    } catch (e) { fehler(e); }
  };
}
async function fortschritt() {
  $('#fenster').firstElementChild.innerHTML = `<div class="lade"><div class="lade__r"></div><h2>Wird <em>veröffentlicht …</em></h2><ol class="schritte" id="r-sch"></ol></div>`;
  for (;;) {
    await new Promise(r => setTimeout(r, 700));
    let d;
    try { d = await api('lauf'); } catch (e) { continue; }
    const sch = d.schritte || [];
    if ($('#r-sch')) $('#r-sch').innerHTML = sch.map((x, i) => `<li class="${i < sch.length - 1 || d.fertig ? 'fertig' : 'jetzt'}">${esc(x.t)}</li>`).join('');
    if (!d.aktiv) {
      const k = $('#fenster').firstElementChild;
      if (d.fehler) {
        k.innerHTML = `<h2>Nicht <em>veröffentlicht.</em></h2><p class="satz">${esc(d.fehler.replace(/^[A-ZÄÖÜ]+ · /, ''))}</p><p class="leise">Die Website ist unverändert. Ihr Entwurf ist noch da.</p><div class="fenster__kn"><a class="link" href="pruefung.html#${esc((d.fehler.split(' · ')[0] || 'bau').toLowerCase())}" target="_blank">Was tun?</a><button class="kn" type="button" data-zu>Schliessen<i>${PF}</i></button></div>`;
      } else if (d.fertig) {
        k.innerHTML = `<h2>Ist <em>online.</em></h2><p class="satz">${d.fertig.zahl} Änderung${d.fertig.zahl > 1 ? 'en sind' : ' ist'} auf der Website, ${d.fertig.dateien} Seiten in sechs Sprachen erneuert und geprüft.</p>
          <ol class="schritte">${(d.fertig.aenderungen || []).map(a => `<li class="fertig">${esc(a.was)} · ${esc(a.wo)}</li>`).join('')}</ol>
          <div class="fenster__kn"><a class="kn kn--linie" href="../index.html" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a><button class="kn" type="button" data-zu>Fertig<i>${PF}</i></button></div>`;
      }
      $$('[data-zu]', k).forEach(b => b.onclick = fensterZu);
      await frisch();
      return;
    }
  }
}

/* ---------- Frühere Fassungen ---------- */
async function zeichneVerlauf() {
  const L = (await api('verlauf')).verlauf;
  $('#ansicht').innerHTML = kopf('Entwurf', 'Frühere <em>Fassungen.</em>', 'Jede Veröffentlichung wird aufgehoben. Eine frühere Fassung kommt zuerst in den Entwurf: Sie sehen vorher und nachher und veröffentlichen dann.') +
    (L.length ? L.map(v => `<div class="vl"><div><b>${datum(v.zeit)}</b><span>${v.zahl} Änderung${v.zahl === 1 ? '' : 'en'}${v.notiz ? ' · ' + esc(v.notiz) : ''}</span></div><button class="kn kn--linie kn--klein" type="button" data-id="${v.id}">In den Entwurf holen<i>${PF}</i></button></div>`).join('')
      : `<div class="leer-hinweis"><b>Noch nichts veröffentlicht.</b>Nach der ersten Veröffentlichung steht hier jede Fassung, die neueste oben. So sieht das dann aus:</div>
        <div class="vl-bsp" aria-label="Beispiel">${[   // Beispiel, solange nichts veröffentlicht ist (Robert 15.10.2026: «dass man versteht, was gemeint ist»)
          ['Dienstag, 4. November, 16.20 Uhr', '3 Änderungen · Winterpreise im La Vallée SPA, Hinweis zur Revision', 'Neueste'],
          ['Freitag, 24. Oktober, 09.05 Uhr', '1 Änderung · Foto der Halle getauscht', ''],
          ['Montag, 20. Oktober, 11.40 Uhr', '5 Änderungen · Frühstückszeiten, Telefon Bankett', '']].map(([z, t, m], i) => `<div class="vl"><i class="vl__z">${ic(i ? 'zurueck' : 'welt')}</i><div><b>${z}</b><span>${t}</span></div>${m ? `<em class="vl__m">${m}</em>` : ''}<span class="kn kn--linie kn--klein" aria-disabled="true">In den Entwurf holen<i>${PF}</i></span></div>`).join('')}
          <p class="leise vl-bsp__satz">Eine ältere Fassung zurückholen: Sie kommt zuerst in den Entwurf. Dort sehen Sie vorher und nachher und veröffentlichen erst, wenn alles stimmt.</p></div>`) +
    `<div class="vl vl--ursprung"><div><b>Ursprünglicher Stand</b><span>Die Website, wie Tasty Studios sie gebaut hat, ohne jede Änderung im Bureau.</span></div><button class="kn kn--linie kn--klein" type="button" data-id="ursprung">In den Entwurf holen<i>${PF}</i></button></div>`;
  $$('[data-id]').forEach(b => b.onclick = async () => {
    try { const r = await api('zurueckholen', { id: b.dataset.id }); S.offen = {}; await frisch(false); gehe('entwurf'); quit('Im Entwurf', `${r.offen} Änderung${r.offen === 1 ? '' : 'en'} gegenüber der Website. Prüfen, dann veröffentlichen.`, [], false, 6000); } catch (e) { fehler(e); }
  });
}

/* ---------- Fenster ---------- */
function fenster(html, schmal = false) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Schliessen">${ZU}</button>${html}</div>`;
  f.hidden = false;
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
}
function fensterZu() { $('#fenster').hidden = true; $('#fenster').innerHTML = ''; }

/* ---------- Start ---------- */
(async function () {
  try {
    S.ue = await api('ueberblick');
  } catch (e) {
    $('#tuer').hidden = false;
    $('#tuer-t').textContent = String(e.message || e).replace(/^[A-ZÄÖÜ]+ · /, '');
    window.bureauMerk && window.bureauMerk('Start: ' + (e.message || e));
    return;
  }
  /* Aus La Maison geöffnet: immer auf der Übersicht anfangen (Robert 16.10.2026), beim Neuladen bleibt die letzte Ansicht */
  if ((/\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload'))) try { localStorage.removeItem('bureau-ansicht'); } catch (e) { /* privat */ }
  else try { const m = JSON.parse(localStorage.getItem('bureau-ansicht') || 'null'); if (m) { S.ansicht = m.a || 'start'; S.bereich = m.b || ''; S.seite = m.s || ''; } } catch (e) { /* privat */ }
  if (S.ansicht === 'bereich' && !S.ue.bereiche.some(b => b.key === S.bereich)) S.ansicht = 'start';
  rand();
  leiste();
  zeichne();
  if (S.ue.lauf && S.ue.lauf.aktiv) { fenster('<div></div>'); fortschritt(); }
})();
