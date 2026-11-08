/* Le Registre · Grand Beau-Rivage. Das Haus sieht, wer seine Website besucht (Robert 13.10.2026: «dass man das als Tool noch mitgibt»).
   Je Besuch: Ort, Tag und Uhrzeit, Gerät, Sprache, woher der Gast kam, der Weg durch die Seiten mit der Zeit je Seite, und ob er zur Buchung ging.
   Server-Teil: ../registre.py über /api/registre (lokal serve.py, online api/registre.py). Hier wird nur gelesen.
   Beispielwerte (?beispiel=1 oder der Knopf) sind erfunden und überall als Beispiel gekennzeichnet. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZEICHEN = '<img src="../assets/logo/zeichen-gold.webp" width="784" height="777" alt="">';
const SYM = {
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  haus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.2 8 2.8l5.5 4.4V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z"/><path d="M6.5 13.5v-4h3v4"/></svg>',
  neu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.8h-2.8"/></svg>',
  auge: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8z"/><circle cx="8" cy="8" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8z"/><path d="M3 13 13 3"/></svg>' };
const SPRACHE = { de: 'Deutsch', en: 'Englisch', fr: 'Französisch', zh: 'Chinesisch', ko: 'Koreanisch', ar: 'Arabisch' };
const GERAET = { handy: 'Handy', tablet: 'Tablet', rechner: 'Rechner' };
const EREIGNIS = { suche: 'Zimmersuche geöffnet', taste: '«Buchen» in der Leiste', weiter: 'Aus der Zimmersuche weiter', buchung: 'Ins Buchungssystem', tisch_auf: '«Tisch reservieren» geklickt', tisch: 'Weiter zum Tischplan' };
const REIHE = ['taste', 'suche', 'weiter', 'buchung', 'tisch_auf', 'tisch'];
const TITEL = { start: 'Übersicht', besuche: 'Besuche', herkunft: 'Herkunft', seiten: 'Seiten', buchung: 'Zur Buchung' };
const MERK = 'gbr-nicht-zaehlen';
/* Vorführ-Betrieb (Robert 14.10.2026): Der Kunde sieht nur Beispielwerte, kein Knopf führt zu den echten Besuchen. Die echten zeigt nur die Adresse
   mit ?k=<Schlüssel> (api/registre.py). Geht das Haus in Betrieb: VORFUEHRUNG = false hier und in api/registre.py. */
const VORFUEHRUNG = true;
const SCHL = (location.search.match(/[?&]k=([\w-]+)/) || [])[1] || '';
const ECHT_DA = !VORFUEHRUNG || !!SCHL;
const S = { d: null, namen: {}, ansicht: 'start', tage: 30, beispiel: !ECHT_DA || /[?&]beispiel=1/.test(location.search), wahl: 0, filter: 'alle', zeige: 40 };

/* ---------- Helfer ---------- */
const n = x => Number(x || 0).toLocaleString('de-CH');
const mal = (z, eins, viele) => z === 1 ? eins : n(z) + ' ' + viele;
let LAND; try { LAND = new Intl.DisplayNames(['de-CH'], { type: 'region' }); } catch (e) { LAND = null; }
const LAND_EIGEN = { CN: 'China', HK: 'Hongkong', MO: 'Macau', GB: 'Grossbritannien', US: 'USA', AE: 'Vereinigte Arabische Emirate' };   /* kurz und in jedem Browser gleich */
function land(code) { if (!code || code === '??') return ''; if (LAND_EIGEN[code]) return LAND_EIGEN[code]; try { return (LAND && LAND.of(code)) || code; } catch (e) { return code; } }
function ort(b) { const l = land(b.l); return b.o ? (l ? b.o + ', ' + l : b.o) : (l || 'Ort nicht bekannt'); }
function seite(datei) { return S.namen[datei] || datei.replace(/\.html$/, ''); }
function dauer(sek, kurz) {
  if (sek == null) return '–';
  if (sek < 60) return sek + (kurz ? ' Sek.' : (sek === 1 ? ' Sekunde' : ' Sekunden'));
  const m = Math.floor(sek / 60), s = sek % 60;
  if (kurz || m < 10) return m + ' Min.' + (s ? ' ' + s + ' Sek.' : '');
  return m + ' Minuten';
}
function tagWort(iso, lang) {
  const d = new Date(iso + 'T12:00:00'), h = new Date(S.d.bis + 'T12:00:00'), diff = Math.round((h - d) / 864e5);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return d.toLocaleDateString('de-CH', lang ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: '2-digit', month: '2-digit' });
}
const datum = iso => { const t = String(iso || '').split('-'); return t.length === 3 ? t[2] + '.' + t[1] + '.' + t[0] : ''; };
function nicht() { try { return localStorage.getItem(MERK) === '1'; } catch (e) { return false; } }
function quit(titel, text, fehl = false, zeit = 5000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Schliessen'); x.textContent = '×'; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (zeit) setTimeout(() => q.remove(), zeit);
}

/* ---------- Server ---------- */
async function lade() {
  let r;
  try { r = await fetch('../api/registre?tage=' + S.tage + (S.beispiel ? '&beispiel=1' : SCHL ? '&k=' + SCHL : ''), { cache: 'no-store' }); }
  catch (e) { throw new Error('Der Server-Teil antwortet nicht.'); }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('Die Antwort war nicht lesbar (' + r.status + ').'); }
  if (!r.ok) throw new Error(String(d.fehler || ('Fehler ' + r.status)).replace(/^[A-ZÄÖÜ]+ · /, ''));
  S.d = d;
}

/* ---------- Rahmen: Kopf, Rand, Leiste ---------- */
function kopfLeiste() {
  const u = S.d.summe;
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="Zur Übersicht">${ZEICHEN}<span><b>Le Registre</b><small>Besuche der Website · Grand Beau-Rivage</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(TITEL[S.ansicht] || 'Le Registre')}</div><div class="kopf__stand">${S.beispiel ? 'Beispielwerte · keine echten Besuche' : u.heute ? mal(u.heute, 'Ein Besuch heute', 'Besuche heute') : 'Heute noch kein Besuch'}</div></div>
    <div class="kopf__werk">
      <a class="rund" href="../werkbank/anleitung/registre/" target="_blank" rel="noopener" data-tip="Anleitung" aria-label="Anleitung">${SYM.buch}</a>
      <a class="rund" href="../maison/" data-tip="La Maison" aria-label="La Maison">${SYM.haus}</a>
      <span class="kopf__trenn"></span>
      <a class="kn kn--klein" href="../index.html" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
}
function rand() {
  const u = S.d.summe, an = S.ansicht;
  const nw = (key, name, zahl = 0) => `<button class="nw" type="button" data-gehe="${key}" ${an === key ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<i>${n(zahl)}</i>` : ''}</button>`;
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="false">Bereiche<i></i></button>
    <nav class="nav" aria-label="Bereiche">
      ${nw('start', 'Übersicht')}
      <p>Die Gäste</p>
      ${nw('besuche', 'Besuche', u.heute)}${nw('herkunft', 'Herkunft')}
      <p>Die Website</p>
      ${nw('seiten', 'Seiten')}${nw('buchung', 'Zur Buchung')}
    </nav>
    <div class="wege">
      <a href="../index.html" target="_blank" rel="noopener">Website${PF}</a>
      <a href="../rechtliches.html#messung" target="_blank" rel="noopener">Was gezählt wird${PF}</a>
      <a href="../werkbank/anleitung/registre/" target="_blank" rel="noopener">Anleitung${PF}</a>
      <a href="../maison/">La Maison${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
  kopfLeiste();
}
function leiste() {
  const d = S.d, u = d.summe, aus = nicht();
  const satz = d.leer ? 'In den letzten ' + n(d.tage) + ' Tagen wurde noch kein Besuch gezählt.'
    : 'Letzte ' + n(d.tage) + ' Tage: ' + mal(u.besuche, 'ein Besuch', 'Besuche') + (u.laender ? ' aus ' + mal(u.laender, 'einem Land', 'Ländern') : '') + ', ' + (u.buchung === 1 ? 'einer' : u.buchung ? n(u.buchung) : 'keiner') + ' weiter zur Buchung.';
  $('#leiste').innerHTML = `
    <div class="leiste__t"><b>${S.beispiel ? 'Sie sehen Beispielwerte' : u.heute ? mal(u.heute, 'Ein Besuch heute', 'Besuche heute') : 'Heute noch kein Besuch'}</b>
      <span>${S.beispiel ? 'Erfunden, damit Sie sehen, wie Le Registre mit Besuchen aussieht.' : esc(satz)}</span></div>
    <button class="kn kn--linie rg-geraet${aus ? ' an' : ''}" type="button" id="l-geraet" aria-pressed="${aus}" title="Besuche von diesem Gerät erscheinen dann nicht in Le Registre">${aus ? 'Dieses Gerät zählt nicht' : 'Dieses Gerät nicht mitzählen'}<i>${aus ? SYM.augezu : SYM.auge}</i></button>
    <button class="kn kn--linie" type="button" id="l-tabelle" title="Alle Besuche des Zeitraums als Tabelle für Excel oder Numbers">Als Tabelle sichern<i>${SYM.neu}</i></button>
    ${S.beispiel ? (ECHT_DA ? `<button class="kn kn--gold glanz-kn" type="button" id="l-echt">Zu den echten Besuchen<i>${PF}</i></button>` : '')
      : `<button class="kn" type="button" id="l-neu">Neu laden<i>${SYM.neu}</i></button>`}`;
  $('#l-geraet').onclick = () => {
    try {
      if (nicht()) { localStorage.removeItem(MERK); quit('Dieses Gerät zählt wieder mit', 'Ihre Besuche der Website erscheinen wieder in Le Registre.'); }
      else { localStorage.setItem(MERK, '1'); quit('Dieses Gerät zählt nicht mehr mit', 'Gilt für diesen Browser. Auf anderen Geräten des Teams bitte ebenfalls einmal wählen.'); }
    } catch (e) { quit('Das liess sich nicht merken', 'Dieser Browser erlaubt es nicht, die Wahl zu speichern.', true); }
    leiste();
  };
  $('#l-tabelle').onclick = sichern;
  if ($('#l-neu')) $('#l-neu').onclick = () => frisch(true);
  if ($('#l-echt')) $('#l-echt').onclick = () => beispiel(false);
}
/* ---------- Als Tabelle sichern (G12, 17.10.2026): alle Besuche des Zeitraums als CSV für Excel/Numbers. Semikolon, UTF-8 mit BOM, keine Formeln
   (Zellen, die mit = + - @ beginnen, bekommen ein Hochkomma: Schutz vor CSV-Einschleusung). Beispielwerte im Dateinamen und in der ersten Spalte. ---------- */
async function sichern() {
  const k = $('#l-tabelle'); if (k.disabled) return; k.disabled = true;
  try {
    let r;
    try { r = await fetch('../api/registre?tage=' + S.tage + '&export=1' + (S.beispiel ? '&beispiel=1' : SCHL ? '&k=' + SCHL : ''), { cache: 'no-store' }); }
    catch (e) { throw new Error('Der Server-Teil antwortet nicht.'); }
    let d = {};
    try { d = await r.json(); } catch (e) { throw new Error('Die Antwort war nicht lesbar (' + r.status + ').'); }
    if (!r.ok) throw new Error(String(d.fehler || ('Fehler ' + r.status)).replace(/^[A-ZÄÖÜ]+ · /, ''));
    const bsp = !!d.beispiel, zelle = v => { let t = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const KLICKS = ['taste', 'suche', 'weiter', 'buchung', 'tisch'];
    const kopfZ = ['Art', 'Tag', 'Uhrzeit', 'Land', 'Ort', 'Region', 'Gerät', 'Sprache', 'Gekommen über', 'Dauer (Sekunden)', 'Seiten', 'Weg (Seite: Sekunden)'].concat(KLICKS.map(x => EREIGNIS[x]));
    const zeilen = (d.besuche || []).map(b => {
      const e = new Set((b.weg || []).flatMap(x => x.e || [])); if (e.has('tisch_auf')) e.add('tisch');
      return [bsp ? 'Beispielwert' : 'Besuch', b.tag, b.z, b.l, b.o, b.r, GERAET[b.g] || b.g, (b.sp || '').toUpperCase(), b.h || 'direkt', b.dauer, b.seiten,
        (b.weg || []).map(x => seite(x.s) + ': ' + (x.sek || 0)).join(' → ')].concat(KLICKS.map(x => e.has(x) ? 'ja' : ''));
    });
    const csv = '﻿' + [kopfZ].concat(zeilen).map(z => z.map(zelle).join(';')).join('\r\n') + '\r\n';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'le-registre-besuche-' + d.von + '-bis-' + d.bis + (bsp ? '-beispielwerte' : '') + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    quit('Tabelle gesichert', mal(zeilen.length, 'Ein Besuch', 'Besuche') + (bsp ? ' (Beispielwerte)' : '') + ' in ' + a.download + '.');
  } catch (e) { quit('Die Tabelle liess sich nicht sichern', e.message, true); }
  finally { k.disabled = false; }
}
function kopf(mono, titel, satz) {
  return `<header class="titel"><span class="zier"><i></i>${ZEICHEN}<span>${mono}</span><i></i></span><h1>${titel}</h1>${satz ? `<p class="satz">${satz}</p>` : ''}</header>`;
}
function zeitraum() {
  const k = t => `<button type="button" data-tage="${t}" aria-pressed="${S.tage === t}">${t === 7 ? '7 Tage' : t === 30 ? '30 Tage' : '90 Tage'}</button>`;
  return `<div class="filter"><div class="wahl2" role="group" aria-label="Zeitraum">${k(7)}${k(30)}${k(90)}</div></div>`;
}
function hinweisBeispiel() {
  return S.beispiel ? `<p class="rg-bsp"><b>Beispielwerte.</b> Diese Zahlen sind erfunden und zeigen, wie Le Registre mit Besuchen aussieht.${ECHT_DA ? ' <button class="link" type="button" data-echt>Zu den echten Besuchen</button>' : ''}</p>` : '';
}
function gehe(ziel, wahl) {
  /* Besuch in der Liste wählen (Robert 15.10.2026: «springe immer wieder nach oben»): nur die Karte rechts wechselt, die Seite bleibt, wo sie ist */
  const fach = $('#ansicht .rg-detail');
  if (ziel === 'besuche' && S.ansicht === 'besuche' && wahl !== undefined && fach && S.d.besuche[+wahl]) {
    S.wahl = +wahl;
    $$('#ansicht .rg-liste .rg-a').forEach(a => a.classList.toggle('aktiv', +a.dataset.wahl === S.wahl));
    fach.innerHTML = detail(S.d.besuche[S.wahl]);
    $('#rand').classList.remove('auf');
    if (matchMedia('(max-width:1180px)').matches && fach.getBoundingClientRect().top < 0) window.scrollTo(0, scrollY + fach.getBoundingClientRect().top - 90);   /* schmal steht die Karte über der Liste */
    return;
  }
  const neu = ziel !== S.ansicht;
  S.ansicht = ziel;
  if (wahl !== undefined) S.wahl = +wahl || 0;
  if (location.hash.slice(1) !== ziel) history.replaceState(null, '', location.pathname + location.search + '#' + ziel);
  rand(); zeichne(); if (neu) window.scrollTo(0, 0);
  $('#rand').classList.remove('auf');
}
async function frisch(sagen = false) {
  try {
    await lade();
    if (S.wahl >= S.d.besuche.length) S.wahl = 0;
    rand(); leiste(); zeichne();
    if (sagen) quit('Neu geladen', '', false, 2500);
  } catch (e) { quit('Le Registre ist gerade nicht abrufbar', e.message, true, 0); }
}
function beispiel(an) {
  if (!an && !ECHT_DA) return;
  S.beispiel = an; S.wahl = 0; S.zeige = 40;
  history.replaceState(null, '', location.pathname + ([an ? 'beispiel=1' : '', SCHL ? 'k=' + SCHL : ''].filter(Boolean).join('&').replace(/^(?=.)/, '?')) + '#' + S.ansicht);   /* gruss=tag fällt dabei weg, gewollt */
  frisch();
}

/* ---------- Bausteine ---------- */
function balken(liste, name, klein, gesamt) {   /* Rangliste: Name, Balken, Zahl. Der Balken wächst nur über transform. */
  if (!liste.length) return '<p class="rg-nichts">Noch nichts gezählt.</p>';
  /* Anteil an allen Besuchen (bzw. allen Aufrufen), nicht nur an den gezeigten Plätzen (F30, 17.10.2026) */
  const max = Math.max(...liste.map(x => x.n)), ges = gesamt || liste.reduce((a, x) => a + x.n, 0);
  return `<ol class="rg-rang">${liste.map((x, i) => `<li style="--i:${i}"><span class="rg-rang__n">${name(x)}${klein ? `<small>${klein(x)}</small>` : ''}</span>
    <span class="rg-rang__b"><i style="width:${Math.max(2, 100 * x.n / max).toFixed(1)}%"></i></span><b>${n(x.n)}</b><em>${Math.round(100 * x.n / ges)}&nbsp;%</em></li>`).join('')}</ol>`;
}
function karteBesuch(b, i, aktiv) {
  return `<button class="rg-a${b.buchung ? ' gold' : ''}${aktiv ? ' aktiv' : ''}" type="button" data-gehe="besuche" data-wahl="${i}">
    <span class="rg-a__l">${esc(b.l && b.l !== '??' ? b.l : '–')}</span>
    <span class="rg-a__n"><b>${esc(ort(b))}</b><small>${esc(tagWort(b.tag))}, ${esc(b.z)} Uhr · ${mal(b.seiten, 'eine Seite', 'Seiten')}${b.dauer ? ' · ' + dauer(b.dauer, true) : ''}</small></span>
    <span class="rg-a__z">${b.buchung ? 'Zur Buchung' : b.tisch ? 'Tisch' : esc(GERAET[b.g] || '')}<small>${esc(SPRACHE[b.sp] || b.sp)}</small></span></button>`;
}
function leer() {
  return `<div class="rg-leer platte">${ZEICHEN}<b>Noch kein Besuch gezählt.</b>
    <p>Sobald jemand die Website öffnet, steht der Besuch hier: mit Ort, Uhrzeit, den Seiten und der Zeit darauf.</p>
    <button class="kn kn--linie" type="button" data-bsp>Beispiel ansehen<i>${PF}</i></button></div>`;
}

/* ---------- Ansichten ---------- */
function zeichne() {
  const el = $('#ansicht'), d = S.d;
  el.innerHTML = S.ansicht === 'besuche' ? besuche() : S.ansicht === 'herkunft' ? herkunft() : S.ansicht === 'seiten' ? seiten() : S.ansicht === 'buchung' ? buchung() : start();
  $$('[data-gehe]', el).forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl));
  $$('[data-tage]', el).forEach(b => b.onclick = () => { S.tage = +b.dataset.tage; S.wahl = 0; S.zeige = 40; try { localStorage.setItem('registre-tage', S.tage); } catch (e) { /* privat */ } frisch(); });
  $$('[data-bsp]', el).forEach(b => b.onclick = () => beispiel(true));
  $$('[data-echt]', el).forEach(b => b.onclick = () => beispiel(false));
  $$('[data-filter]', el).forEach(b => b.onclick = () => { S.filter = b.dataset.filter; S.wahl = -1; S.zeige = 40; zeichne(); });
  $$('[data-mehr]', el).forEach(b => b.onclick = () => { S.zeige += 60; zeichne(); });
  schweben(el);
  document.title = (TITEL[S.ansicht] || 'Le Registre') + ' · Le Registre · Grand Beau-Rivage';
}

/* Schweben: jedes Blatt bekommt data-r und eine Staffel --i; im Bild kommt .rg-da dazu (Federn, Zahlen-Zoom, Balken wachsen). */
let IO = null, IO_LOS = null;
function schweben(el) {
  if (IO) IO.disconnect();
  const ziele = [];
  const nimm = (sel, reihe) => $$(sel, el).forEach(x => { if (x.dataset.r) return; x.dataset.r = '1'; x.style.setProperty('--i', reihe ? Math.min([...x.parentNode.children].indexOf(x), 8) : 0); ziele.push(x); });
  nimm('.rg-bsp, .rg-zahlen, .rg-tage, .rg-tafel, .rg-leer, .rg-block--breit, h2.zw, .rg-mehr', false);
  nimm('.rg-zwei > .rg-block, .rg-stapel > .rg-block, .rg-werte > .rg-w, .rg-liste .rg-a', true);
  const ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (ruhig || !('IntersectionObserver' in window)) { ziele.forEach(x => x.classList.add('rg-da', 'rg-los')); return; }
  IO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rg-da'); IO.unobserve(e.target); } }), { rootMargin: '0px 0px 8% 0px' });
  /* Balken wachsen erst, wenn ihre Tafel gut zur Hälfte im Bild ist (Robert 16.10.2026: «die Animation ist schon vorbei, sie soll mit meinem Reinkommen losgehen») */
  if (IO_LOS) IO_LOS.disconnect();
  IO_LOS = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rg-los'); IO_LOS.unobserve(e.target); } }), { threshold: .45 });
  ziele.filter(x => x.querySelector('.rg-s i,.rg-rang__b i,.rg-rang li')).forEach(x => IO_LOS.observe(x));
  ziele.forEach(x => IO.observe(x));
}

function start() {
  const d = S.d, u = d.summe, h = new Date().getHours();
  const gruss = /[?&]gruss=tag/.test(location.search) ? 'Guten Tag.' : h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';   /* gruss=tag: fester Gruss für die Bildschirmfotos der Werkbank */
  let aus = kopf('Le Registre · Grand Beau-Rivage Interlaken', `${gruss} <em>Wer war zu Besuch?</em>`,
    'Hier sehen Sie, wer Ihre Website besucht: woher die Gäste kommen, welche Seiten sie ansehen, wie lange sie bleiben und wie viele weiter zur Buchung gehen. Gezählt ohne Cookies, nie mit Namen.') + zeitraum() + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const max = Math.max(1, ...d.je_tag.map(t => t.besuche)), viele = d.je_tag.length;
  const schritt = viele <= 7 ? 1 : viele <= 31 ? 5 : 15;
  aus += `<div class="rg-zahlen platte">
      <div><b>${n(u.besuche)}</b><span>${u.besuche === 1 ? 'Besuch' : 'Besuche'}</span><small>${u.heute ? mal(u.heute, 'einer heute', 'heute') : 'heute noch keiner'}</small></div>
      <div><b>${n(u.seiten)}</b><span>Angesehene Seiten</span><small>${u.seiten_je_besuch != null ? n(u.seiten_je_besuch) + ' je Besuch' : '&nbsp;'}</small></div>
      <div><b>${u.dauer_mittel != null ? Math.floor(u.dauer_mittel / 60) + ':' + String(u.dauer_mittel % 60).padStart(2, '0') : '\u2013'}</b><span>Minuten je Besuch</span><small>im Schnitt</small></div>
      <div><b>${n(u.buchung)}</b><span>Weiter zur Buchung</span><small>${u.besuche ? Math.round(1000 * u.buchung / u.besuche) / 10 + '&nbsp;% der Besuche' : '&nbsp;'}</small></div>
    </div>
    <section class="rg-tage platte">
      <header><h3>Besuche je Tag</h3><p>${esc(datum(d.von))} bis ${esc(datum(d.bis))}</p></header>
      <div class="rg-saeulen" style="--n:${viele}" role="img" aria-label="Besuche je Tag, höchster Wert ${n(max)}">
        ${d.je_tag.map((t, i) => `<div class="rg-s" style="--i:${Math.round(i * 30 / viele)}" data-t="${esc(tagWort(t.tag))}: ${mal(t.besuche, 'ein Besuch', 'Besuche')}"><i style="height:${t.besuche ? Math.max(2.5, 100 * t.besuche / max).toFixed(1) : 0}%"></i>${(viele - 1 - i) % schritt === 0 ? `<span>${esc(t.tag.slice(8) + '.' + t.tag.slice(5, 7) + '.')}</span>` : ''}</div>`).join('')}
      </div>
    </section>
    <div class="zwei rg-zwei">
      <section class="rg-block platte"><header><h3>Woher die Gäste kommen</h3><button class="link" type="button" data-gehe="herkunft">Alle Länder und Orte</button></header>
        ${balken(d.laender.slice(0, 6), x => esc(land(x.k) || 'Ort nicht bekannt'), null, u.besuche)}</section>
      <section class="rg-block platte"><header><h3>Am meisten angesehen</h3><button class="link" type="button" data-gehe="seiten">Alle Seiten</button></header>
        ${balken(d.seiten.slice(0, 6), x => esc(seite(x.s)), x => x.sek != null ? dauer(x.sek, true) + ' im Schnitt' : '', u.seiten)}</section>
    </div>
    <h2 class="zw">Zuletzt <em>zu Besuch</em></h2>
    <div class="rg-liste rg-liste--start">${d.besuche.slice(0, 5).map((b, i) => karteBesuch(b, i, false)).join('')}</div>
    <p class="rg-mehr"><button class="kn kn--linie kn--hellrand" type="button" data-gehe="besuche">Alle Besuche<i>${PF}</i></button></p>`;
  if (!S.beispiel && u.besuche < 8) aus += `<p class="rg-wenig">Noch wenig zu sehen? <button class="link" type="button" data-bsp>Beispiel ansehen</button></p>`;
  return aus;
}

function besuche() {
  const d = S.d;
  let aus = kopf('Besuche', 'Jeder Besuch, <em>Schritt für Schritt.</em>', 'Wann jemand kam, von wo, was er sich ansah und wie lange. Ohne Namen: ein Besuch ist ein Ort, eine Uhrzeit und ein Weg durch die Seiten.') + zeitraum() + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const alle = d.besuche.map((b, i) => [b, i]), l = S.filter === 'buchung' ? alle.filter(x => x[0].buchung) : S.filter === 'tisch' ? alle.filter(x => x[0].tisch) : alle;
  if (!l.some(x => x[1] === S.wahl)) S.wahl = l.length ? l[0][1] : -1;
  const b = d.besuche[S.wahl];
  const zahl = k => k === 'buchung' ? alle.filter(x => x[0].buchung).length : alle.filter(x => x[0].tisch).length;
  aus += `<div class="filter rg-filter2"><div class="wahl2" role="group" aria-label="Auswahl">
      <button type="button" data-filter="alle" aria-pressed="${S.filter === 'alle'}">Alle · ${n(alle.length)}</button>
      <button type="button" data-filter="buchung" aria-pressed="${S.filter === 'buchung'}">Zur Buchung · ${n(zahl('buchung'))}</button>
      <button type="button" data-filter="tisch" aria-pressed="${S.filter === 'tisch'}">Tisch · ${n(zahl('tisch'))}</button></div></div>`;
  if (!l.length) return aus + `<div class="leer-hinweis"><b>Kein Besuch in dieser Auswahl.</b>In diesem Zeitraum ging noch niemand diesen Weg.</div>`;
  let letzter = '';
  const liste = l.slice(0, S.zeige).map(([x, i]) => { const kopfzeile = x.tag !== letzter ? `<p class="rg-tag">${esc(tagWort(x.tag, true))}</p>` : ''; letzter = x.tag; return kopfzeile + karteBesuch(x, i, i === S.wahl); }).join('');
  aus += `<div class="rg-eingang">
    <div class="rg-liste">${liste}${l.length > S.zeige ? `<button class="link rg-weitere" type="button" data-mehr>Weitere ${n(Math.min(60, l.length - S.zeige))} zeigen</button>` : ''}
      ${d.summe.besuche > d.besuche.length ? `<p class="rg-tag">Gezeigt werden die neuesten ${n(d.besuche.length)} Besuche.</p>` : ''}</div>
    <div class="rg-detail">${b ? detail(b) : ''}</div></div>`;
  return aus;
}
function detail(b) {
  const schritte = b.weg.map((x, i) => {
    const e = REIHE.filter(k => x.e.indexOf(k) > -1);
    return `<li style="--i:${Math.min(i, 12)}"><time>${esc(x.z)}</time><div><b>${esc(seite(x.s))}</b>${x.sp !== b.sp ? `<small>${esc(SPRACHE[x.sp] || x.sp)}</small>` : ''}
      ${e.length ? `<p>${e.map(k => `<span class="rg-e${k === 'buchung' || k === 'tisch' ? ' gold' : ''}">${esc(EREIGNIS[k])}</span>`).join('')}</p>` : ''}</div><em>${x.sek ? dauer(x.sek, true) : '–'}</em></li>`;
  }).join('');
  return `<article class="rg-d platte">
    <div class="rg-d__kopf"><div><span class="mono">Besuch · ${esc(tagWort(b.tag, true))}</span><h2>${esc(ort(b))}</h2></div>
      ${b.buchung ? '<span class="rg-siegel">Weiter zur Buchung</span>' : b.tisch ? '<span class="rg-siegel">Tisch reservieren</span>' : ''}</div>
    <div class="rg-angaben">
      <div><span>Gekommen</span><b>${esc(b.z)} Uhr</b></div>
      <div><span>Geblieben</span><b>${b.dauer ? dauer(b.dauer, true) : '–'}</b></div>
      <div><span>Seiten</span><b>${n(b.seiten)}</b></div>
      <div><span>Gerät</span><b>${esc(GERAET[b.g] || b.g)}</b></div>
      <div><span>Sprache</span><b>${esc(SPRACHE[b.sp] || b.sp)}</b></div>
      <div><span>Gekommen über</span><b>${esc(b.h)}</b></div>
    </div>
    <h3 class="rg-wegtitel">Der Weg durch die Website</h3>
    <ol class="rg-weg">${schritte}</ol>
    <p class="rg-hinweis">Die Zeit zählt nur, solange die Seite im Vordergrund war. Die Uhrzeit ist die von Interlaken.${b.r ? ' Region: ' + esc(b.r) + '.' : ''}</p>
  </article>`;
}

function herkunft() {
  const d = S.d;
  let aus = kopf('Herkunft', 'Woher <em>die Gäste kommen.</em>', 'Land und Ort nennt die Verbindung, die Sprache ist die der gelesenen Seite. «Gekommen über» zeigt, von welcher Website der Gast zu Ihnen fand.') + zeitraum() + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const max = Math.max(1, ...d.stunden), ges = d.summe.besuche;
  aus += `<div class="zwei rg-zwei">
      <div class="rg-stapel">
        <section class="rg-block platte"><header><h3>Länder</h3></header>${balken(d.laender.slice(0, 10), x => esc(land(x.k) || 'Ort nicht bekannt'), null, ges)}</section>
        <section class="rg-block platte"><header><h3>Gekommen über</h3></header>${balken(d.herkunft.slice(0, 8), x => esc(x.k), null, ges)}</section>
      </div>
      <section class="rg-block platte"><header><h3>Orte</h3></header>${balken(d.orte.slice(0, 14), x => esc(x.k), x => esc(land(x.l)), ges)}</section>
    </div>
    <div class="zwei rg-zwei">
      <section class="rg-block platte"><header><h3>Sprache</h3></header>${balken(d.sprachen, x => esc(SPRACHE[x.k] || x.k), null, ges)}</section>
      <section class="rg-block platte"><header><h3>Gerät</h3></header>${balken(d.geraete, x => esc(GERAET[x.k] || x.k), null, ges)}</section>
    </div>
    <section class="rg-tage platte">
      <header><h3>Zu welcher Uhrzeit</h3><p>Beginn des Besuchs, Uhrzeit von Interlaken</p></header>
      <div class="rg-saeulen rg-saeulen--uhr" style="--n:24" role="img" aria-label="Besuche nach Uhrzeit">
        ${d.stunden.map((z, i) => `<div class="rg-s" style="--i:${i}" data-t="${i} bis ${i + 1} Uhr: ${mal(z, 'ein Besuch', 'Besuche')}"><i style="height:${z ? Math.max(2.5, 100 * z / max).toFixed(1) : 0}%"></i>${i % 3 === 0 ? `<span>${i} Uhr</span>` : ''}</div>`).join('')}
      </div>
    </section>`;
  return aus;
}

function seiten() {
  const d = S.d;
  let aus = kopf('Seiten', 'Was sich Gäste <em>ansehen.</em>', 'Jede Seite der Website mit der Zahl der Aufrufe, der Zeit, die Gäste im Schnitt darauf bleiben, und den Klicks von dort ins Buchungssystem.') + zeitraum() + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const max = Math.max(1, ...d.seiten.map(x => x.n));
  aus += `<section class="rg-tafel platte">
    <div class="rg-zeile rg-zeile--kopf"><span>Seite</span><span>Aufrufe</span><span></span><span>Zeit im Schnitt</span><span>Zur Buchung</span></div>
    ${d.seiten.map((x, i) => `<div class="rg-zeile" style="--i:${Math.min(i, 20)}"><span class="rg-zeile__n"><b>${esc(seite(x.s))}</b></span><span class="rg-zeile__z">${n(x.n)}</span>
      <span class="rg-rang__b"><i style="width:${Math.max(2, 100 * x.n / max).toFixed(1)}%"></i></span><span>${x.sek != null ? dauer(x.sek, true) : '–'}</span><span>${x.buchung ? n(x.buchung) : '–'}</span></div>`).join('')}
  </section>
  <p class="rg-fuss">Nicht aufgeführte Seiten wurden in diesem Zeitraum nicht geöffnet.</p>`;
  return aus;
}

function buchung() {
  const d = S.d, w = d.werte;
  let aus = kopf('Zur Buchung', 'Wie oft ein Besuch <em>weiterführt.</em>', 'Gezählt wird der Klick ins Buchungssystem und zum Tischplan. Was danach dort geschieht, sehen nur SimpleBooking und aleno.') + zeitraum() + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const k = (key, name, text, ohne) => { const x = w[key] || {}, da = x.von > 0;
    return `<div class="rg-w platte"><span class="mono">${name}</span><b>${da ? Number(x.anteil).toLocaleString('de-CH', { maximumFractionDigits: 1 }) + '&nbsp;%' : '–'}</b><p>${da ? text(x) : ohne}</p></div>`; };
  const auf = z => z === 1 ? 'Aufruf' : 'Aufrufen';
  aus += `<div class="rg-werte">
    ${k('start', 'Startseite zur Buchung', x => n(x.zahl) + ' von ' + n(x.von) + ' ' + auf(x.von) + ' der Startseite', 'Die Startseite wurde noch nicht geöffnet.')}
    ${k('zimmer', 'Zimmerseiten zur Buchung', x => n(x.zahl) + ' von ' + n(x.von) + ' ' + auf(x.von) + ' der Zimmerseiten', 'Noch keine Zimmerseite geöffnet.')}
    ${k('angebot', 'Angebote zur Buchung', x => n(x.zahl) + ' von ' + n(x.von) + ' ' + auf(x.von) + ' der Angebote', 'Die Angebote wurden noch nicht geöffnet.')}
    ${k('taste', '«Buchen» in der Leiste am Handy', x => n(x.zahl) + ' von ' + n(x.von) + ' ' + auf(x.von) + ' am Handy', 'Noch kein Aufruf am Handy.')}
    ${k('abbruch', 'Zimmersuche ohne Klick weiter', x => n(x.zahl) + ' von ' + n(x.von) + (x.von === 1 ? ' geöffneten Zimmersuche' : ' geöffneten Zimmersuchen'), 'Noch keine Zimmersuche geöffnet.')}
    ${k('tisch', 'Tisch reservieren', x => n(x.zahl) + ' von ' + n(x.von) + ' ' + auf(x.von) + ', ' + n(x.weiter) + ' weiter zum Tischplan', 'Noch kein Aufruf.')}
  </div>
  <h2 class="zw">Von welcher Seite <em>gebucht wird</em></h2>
  <section class="rg-block platte rg-block--breit">${balken(d.seiten.filter(x => x.buchung).sort((a, b) => b.buchung - a.buchung).slice(0, 10).map(x => ({ k: x.s, n: x.buchung })), x => esc(seite(x.k)), null, d.seiten.reduce((a, x) => a + (x.buchung || 0), 0))}</section>`;
  return aus;
}

/* ---------- Start ---------- */
(async function () {
  try { const t = +localStorage.getItem('registre-tage'); if (t === 7 || t === 30 || t === 90) S.tage = t; } catch (e) { /* privat */ }
  const h = location.hash.slice(1); if (TITEL[h]) S.ansicht = h;
  try { const r = await fetch('seiten.json', { cache: 'no-store' }); if (r.ok) S.namen = await r.json(); } catch (e) { /* dann stehen die Dateinamen da */ }
  try { await lade(); }
  catch (e) { $('#tuer').hidden = false; $('#tuer-t').textContent = e.message; return; }
  rand(); leiste(); zeichne();
})();
