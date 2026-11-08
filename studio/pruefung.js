/* Prüfung des Bureau (Grand Beau-Rivage). Läuft ohne studio.js und auch, wenn der Server-Teil tot ist: dann prüft sie, was der Browser allein sehen kann.
   Drei Seiten: Browser (Netz, Speicher, Fehler des Bureau), Server-Teil (api/pruefung) und jede Seite der Website samt Sprachen, Werkbank, La Carte. */
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SEITEN_NOT = ['index.html', 'zimmer.html', 'essen-trinken.html', 'restaurant-lambiance.html', 'terrasse-la-belle-riviere.html', 'restaurant-la-petite-suisse.html', 'bar-le-vieux-rivage.html', 'spa.html',
  'feiern-tagen.html', 'angebote.html', 'haus.html', 'karriere.html', 'veranstaltungen.html', 'region.html', 'anreise.html', 'abreise.html', 'kontakt.html', 'rechtliches.html'];
const SPR = ['en', 'fr', 'zh', 'ko', 'ar'];
let P = [], SERVER = null;

const LEXIKON = [
  ['verbindung', 'Das Bureau startet nicht oder «Server antwortet nicht»', 'Der Server-Teil (serve.py) läuft nicht oder wurde neu gestartet.', 'Im Projektordner «python3 serve.py 8940» starten, dann die Seite neu laden. Die Website selbst ist davon nicht betroffen.'],
  ['server', 'Meldung beginnt mit SERVER', 'Ein unerwarteter Fehler im Server-Teil. Er steht im Fehlerprotokoll unten.', '«Bericht kopieren» und an Robert schicken. Ihr Entwurf ist gespeichert, nichts ist verloren.'],
  ['beschaedigt', 'Entwurf oder Stand «beschädigt»', 'Die Datei wurde mitten im Schreiben unterbrochen (Strom, Absturz).', 'Reparatur «Letzte gute Fassung zurück». Das Bureau hebt vor jedem Speichern die vorige Fassung als .gut auf; die beschädigte bleibt als .kaputt liegen.'],
  ['grundlage', 'Vorschau zeigt einen alten Stand einer Seite', 'Die Seite wurde ausserhalb des Bureau neu gebaut (La Carte, ein Umbau), die Grundlage noch nicht.', 'Das Bureau baut sie beim Öffnen der Seite selbst neu. Sonst Reparatur «Grundlage aller Seiten erneuern».'],
  ['seite', 'Eine Seite fehlt', 'Eine Seite wurde umbenannt oder entfernt.', 'Robert Bescheid geben. Änderungen auf anderen Seiten sind davon nicht betroffen.'],
  ['stelle', '«Diese Textstelle gibt es nicht mehr»', 'Die Seite wurde umgebaut, während sie im Bureau offen war.', 'Seite im Bureau neu laden (oben eine andere Seite wählen und zurück), dann die Stelle neu anklicken.'],
  ['eingabe', 'Eingabe wird nicht angenommen', 'Etwas fehlt oder hat die falsche Form: leerer Text, E-Mail ohne @, Link ohne https://, Telefon mit Buchstaben.', 'Die Meldung sagt, was fehlt. Korrigieren und noch einmal speichern.'],
  ['bild', 'Foto lässt sich nicht hochladen', 'Datei zu gross (über 25 MB), zu klein (unter 900 Pixel breit) oder kein lesbares Foto (HEIC direkt vom iPhone).', 'Als JPG exportieren, mindestens 900 Pixel breit, besser 2000. Dann noch einmal.'],
  ['bau', 'Veröffentlichen bricht beim Setzen ab', 'Eine Seite liess sich mit dem Entwurf nicht setzen.', 'Die Website ist unverändert. «Bericht kopieren» und an Robert schicken; der Entwurf bleibt liegen.'],
  ['pruefung', 'Veröffentlichen hält bei der Prüfung an', 'Vor dem Übernehmen wird jede Seite geprüft: alte Angabe noch da, Seite viel kleiner, Kennzeichen der Vorschau, Änderung ohne Stelle. Etwas davon traf zu.', 'Die Meldung nennt die Seite. Die Website ist unverändert. Unter «Entwurf» die betroffene Änderung zurücknehmen und neu machen.'],
  ['nachpruefung', 'Nach dem Übernehmen nicht gleich', 'Während des Veröffentlichens hat ein anderes Werkzeug dieselbe Seite geschrieben.', 'Das Bureau stellt alles zurück. Einfach noch einmal veröffentlichen.'],
  ['laeuft', '«Es wird gerade veröffentlicht»', 'Ein Veröffentlichen läuft noch (dauert 10 bis 40 Sekunden).', 'Kurz warten. Das Fenster mit dem Fortschritt kommt beim Neuladen von selbst wieder.'],
  ['verlauf', 'Frühere Fassung nicht mehr da', 'Die Fassung wurde aus dem Verlauf entfernt.', 'Eine andere Fassung wählen. Der ursprüngliche Stand ist immer da.'],
  ['rueckgaengig', '«Rückgängig» geht nicht mehr', 'Aufgehoben werden die letzten 80 Speicherungen.', 'Unter «Entwurf» die einzelne Änderung zurücknehmen.'],
  ['verwaist', 'Eine Änderung findet ihre Stelle nicht', 'Die Seite wurde umgebaut: der Text, an dem die Änderung hängt, steht nicht mehr so da.', 'Unter «Entwurf» die Änderung zurücknehmen und an der neuen Stelle neu machen.'],
  ['abweichung', 'Website zeigt nicht den veröffentlichten Stand', 'Jemand hat Seiten neu gebaut, ohne dass das Bureau angeschlossen war.', 'Reparatur «Grundlage aller Seiten erneuern», dann einmal veröffentlichen. Robert Bescheid geben.'],
  ['anschluss', 'bau.py kennt das Bureau nicht', 'Der Anschluss in bau.py (eine Zeile in schreibe) fehlt.', 'Robert Bescheid geben. Bis dahin gehen veröffentlichte Änderungen verloren, sobald jemand die Website neu baut.'],
  ['angabe', 'Telefon oder Adresse nicht gefunden', 'Die Seite schreibt die Angabe anders als erwartet.', 'Robert Bescheid geben, die Schreibweise wird im Bureau nachgezogen.'],
  ['baurest', 'Reste im Bauordner', 'Ein Veröffentlichen wurde unterbrochen.', 'Reparatur «Bauordner leeren».'],
  ['karten', 'La Carte antwortet nicht', 'Der Teil für die Karten ist nicht erreichbar.', 'La Carte direkt öffnen (/mission-control/). Die Website ist nicht betroffen.'],
  ['vorschau', 'Vorschau bleibt weiss oder dunkel', 'Die Seite wird gesetzt (bis zwei Sekunden), oder das Bild oben lädt noch.', 'Kurz warten. Bleibt sie leer: «Gross öffnen» in der Leiste der Vorschau, dort steht die Meldung.'],
  ['gelb', 'Speichern-Knopf bleibt gelb', 'Es gibt Eingaben, die noch nicht gespeichert sind (auch in einem anderen Bereich).', 'Speichern drücken. Die Leiste unten sagt, wie viele offen sind.'],
  ['sprache', 'Neuer Text steht auf Englisch deutsch da', 'Geänderte Texte und neue Gerichte bleiben deutsch, bis sie übersetzt sind. Geraten wird nichts.', 'Im Bureau unter «Sprachen» übersetzen und speichern, dann veröffentlichen. Für die Karten: La Carte.'],
  ['telefon', 'Neue Telefonnummer steht noch irgendwo alt', 'Die Nummer stand dort in einer anderen Schreibweise.', 'Die Stelle unter «Zeiten & Preise» oder in der Seite direkt ändern.']];

function punkt(gruppe, name, stufe, text = '', wort = '') { P.push({ gruppe, name, stufe, text, stichwort: wort }); }
async function hol(url, opt = {}) { const t0 = performance.now(); const r = await fetch(url, Object.assign({ cache: 'no-store' }, opt)); return { r, ms: Math.round(performance.now() - t0) }; }

async function browser() {
  try { localStorage.setItem('bureau-test', '1'); localStorage.removeItem('bureau-test'); punkt('Browser', 'Speicher im Browser', 'gut', 'nutzbar (merkt sich den letzten Bereich)'); }
  catch (e) { punkt('Browser', 'Speicher im Browser', 'gelb', 'gesperrt (privates Fenster): das Bureau merkt sich den letzten Bereich nicht, sonst geht alles.'); }
  punkt('Browser', 'Cookies', navigator.cookieEnabled ? 'gut' : 'gelb', navigator.cookieEnabled ? 'erlaubt' : 'gesperrt, für das Bureau ohne Folgen');
  let fe = [];
  try { fe = JSON.parse(localStorage.getItem('bureau-fehler') || '[]'); } catch (e) { /* gesperrt */ }
  const neu = fe.filter(f => Date.now() - new Date(f.zeit) < 864e5);
  punkt('Browser', 'Fehler im Bureau (letzte 24 Stunden)', neu.length ? 'gelb' : 'gut', neu.length ? neu.slice(-3).map(f => f.text).join(' · ') : 'keine');
  for (const [d, n] of [['index.html', 'Bureau'], ['studio.js', 'Bureau, Skript'], ['studio.css', 'Bureau, Gestalt']]) {
    try { const { r } = await hol(d); punkt('Browser', n + ' lädt', r.ok ? 'gut' : 'rot', r.ok ? d : `${d}: ${r.status}`, 'verbindung'); }
    catch (e) { punkt('Browser', n + ' lädt', 'rot', 'keine Verbindung', 'verbindung'); }
  }
}
async function server() {
  try {
    const { r, ms } = await hol('api/pruefung');
    if (!r.ok) throw new Error(r.status);
    SERVER = await r.json();
    SERVER.punkte.forEach(p => P.push(p));
    punkt('Server', 'Antwortzeit', ms < 4000 ? 'gut' : 'gelb', ms + ' ms');
  } catch (e) { punkt('Server', 'Server-Teil des Bureau antwortet', 'rot', 'keine Antwort. Die Prüfung läuft mit dem, was der Browser sieht.', 'verbindung'); }
  try { const { r } = await hol('seite/entwurf/index.html'); punkt('Server', 'Vorschau mit dem Entwurf', r.ok ? 'gut' : 'rot', r.ok ? 'Startseite lässt sich setzen' : 'Fehler ' + r.status, 'vorschau'); }
  catch (e) { punkt('Server', 'Vorschau mit dem Entwurf', 'rot', 'keine Antwort', 'verbindung'); }
}
async function website() {
  let seiten = SEITEN_NOT;
  try { const u = await (await fetch('api/ueberblick', { cache: 'no-store' })).json(); seiten = [...new Set(u.bereiche.flatMap(b => b.seiten.map(s => s.datei)))]; } catch (e) { /* Liste von Hand */ }
  const fehlt = [], langsam = [];
  await Promise.all(seiten.map(async s => {
    for (const p of ['../' + s].concat(SPR.map(sp => `../${sp}/${s}`))) {
      try { const { r, ms } = await hol(p, { method: 'HEAD' }); if (!r.ok) fehlt.push(p.slice(3)); if (ms > 3000) langsam.push(p.slice(3)); } catch (e) { fehlt.push(p.slice(3)); }
    }
  }));
  punkt('Website', 'Alle Seiten in sechs Sprachen erreichbar', fehlt.length ? 'rot' : 'gut', fehlt.length ? 'fehlt: ' + fehlt.slice(0, 8).join(', ') : `${seiten.length} Seiten × 6 Sprachen`, 'seite');
  if (langsam.length) punkt('Website', 'Antwortzeit der Seiten', 'gelb', 'langsam: ' + langsam.slice(0, 5).join(', '));
  try {
    const h = await (await fetch('../index.html', { cache: 'no-store' })).text();
    const anker = [...new Set([...h.matchAll(/href="([\w\-]+\.html)(#[\w\-]+)?"/g)].map(m => m[1]))];
    const tot = [];
    await Promise.all(anker.map(async a => { try { const { r } = await hol('../' + a, { method: 'HEAD' }); if (!r.ok) tot.push(a); } catch (e) { tot.push(a); } }));
    punkt('Website', 'Links der Startseite', tot.length ? 'rot' : 'gut', tot.length ? 'führen ins Leere: ' + tot.join(', ') : anker.length + ' Seiten, alle da', 'seite');
    const telefon = (h.match(/tel:\+?\d+/g) || []).length;
    punkt('Website', 'Telefon zum Anrufen auf der Startseite', telefon ? 'gut' : 'gelb', telefon ? telefon + ' Knöpfe' : 'kein tel:-Link gefunden', 'telefon');
  } catch (e) { punkt('Website', 'Links der Startseite', 'rot', 'Startseite nicht lesbar', 'seite'); }
  for (const [u, n] of [['../mission-control/', 'La Carte (Karten)'], ['../werkbank/', 'Werkbank'], ['../unterlagen/', 'Unterlagen (Karten als PDF)']]) {
    try { const { r } = await hol(u, { method: 'HEAD' }); punkt('Website', n, r.ok ? 'gut' : 'rot', r.ok ? 'erreichbar' : 'Fehler ' + r.status, 'karten'); } catch (e) { punkt('Website', n, 'rot', 'keine Verbindung', 'karten'); }
  }
}

function zeige() {
  const r = P.filter(p => p.stufe === 'rot').length, g = P.filter(p => p.stufe === 'gelb').length;
  const a = $('#ampel');
  a.className = 'ampel ' + (r ? 'rot' : g ? 'gelb' : 'gut');
  a.innerHTML = `<b>${r ? r + ' Punkt' + (r > 1 ? 'e brauchen' : ' braucht') + ' Hilfe' : g ? 'Läuft, mit ' + g + ' Hinweis' + (g > 1 ? 'en' : '') : 'Alles in Ordnung.'}</b><span>${P.length} Punkte geprüft${SERVER ? ', Server ' + esc(SERVER.version) : ''}, ${new Date().toLocaleTimeString('de-CH')}</span>`;
  const gruppen = [...new Set(P.map(p => p.gruppe))];
  $('#punkte').innerHTML = gruppen.map(gr => `<div class="gruppe"><h2>${esc(gr)}</h2>${P.filter(p => p.gruppe === gr).sort((x, y) => ({ rot: 0, gelb: 1, gut: 2 })[x.stufe] - ({ rot: 0, gelb: 1, gut: 2 })[y.stufe])
    .map(p => `<div class="pt ${p.stufe}"><b>${esc(p.name)}</b>${p.stufe !== 'gut' && p.stichwort ? `<a href="#${esc(p.stichwort.toLowerCase())}">Was tun?</a>` : '<i></i>'}<span>${esc(p.text)}</span></div>`).join('')}</div>`).join('');
  const RP = [['grundlage', 'Grundlage aller Seiten erneuern', 'Liest jede Seite neu, wie sie gebaut ist. Hilft, wenn die Vorschau Altes zeigt.'],
    ['sicherung', 'Letzte gute Fassung zurück', 'Für Entwurf und Stand, wenn eine Datei beschädigt ist. Die beschädigte bleibt aufgehoben.'],
    ['bauordner', 'Bauordner leeren', 'Räumt Reste abgebrochener Veröffentlichungen weg.'],
    ['fehler_leeren', 'Fehlerprotokoll leeren', 'Wenn alles behoben ist und die alten Meldungen stören.'],
    ['browser', 'Fehler im Browser vergessen', 'Leert die Fehlerliste dieses Browsers.']];
  $('#rp').innerHTML = RP.map(([k, t, s]) => `<div><b>${t}</b><p>${s}</p><button class="kn kn--linie" type="button" data-rp="${k}">Ausführen</button></div>`).join('');
  document.querySelectorAll('[data-rp]').forEach(b => b.onclick = async () => {
    if (!b.dataset.scharf) { b.dataset.scharf = '1'; b.classList.add('kn--scharf'); b.textContent = 'Wirklich? Noch einmal drücken'; setTimeout(() => { delete b.dataset.scharf; b.classList.remove('kn--scharf'); b.textContent = 'Ausführen'; }, 4000); return; }
    b.disabled = true; b.textContent = 'Läuft …';
    try {
      if (b.dataset.rp === 'browser') { localStorage.removeItem('bureau-fehler'); }
      else { const r = await fetch('api/reparatur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was: b.dataset.rp }) }); const d = await r.json(); if (!r.ok) throw new Error(d.fehler); }
      b.textContent = 'Erledigt'; setTimeout(pruefe, 600);
    } catch (e) { b.textContent = 'Ging nicht: ' + String(e.message || e).slice(0, 60); }
  });
  if (SERVER) {
    $('#pr-l').innerHTML = (SERVER.protokoll || []).map(z => `<li>${esc(z)}</li>`).join('') || '<li>noch nichts</li>';
    $('#pr-f').innerHTML = (SERVER.fehler || []).slice().reverse().map(z => `<li>${esc(z)}</li>`).join('') || '<li>keine</li>';
  }
}
function lexikon(q = '') {
  q = q.trim().toLowerCase();
  const ziel = location.hash.slice(1);
  $('#lx').innerHTML = LEXIKON.filter(e => !q || e.join(' ').toLowerCase().includes(q)).map(([k, sehen, grund, tun]) =>
    `<article class="lx${k === ziel ? ' ziel' : ''}" id="${k}"><header><code>${k.toUpperCase()}</code><b>${esc(sehen)}</b></header><dl><dt>Grund</dt><dd>${esc(grund)}</dd><dt>Tun</dt><dd>${esc(tun)}</dd></dl></article>`).join('');
}
async function pruefe() {
  P = []; SERVER = null;
  $('#ampel').className = 'ampel'; $('#ampel').innerHTML = '<b>Prüfung läuft …</b><span></span>';
  await Promise.all([browser(), server(), website()]);
  zeige();
}
$('#neu').onclick = pruefe;
$('#bericht').onclick = async () => {
  const t = `Prüfung Le Bureau · Grand Beau-Rivage · ${new Date().toLocaleString('de-CH')}\n` + P.map(p => `${p.stufe.toUpperCase().padEnd(5)} ${p.gruppe} · ${p.name}: ${p.text}`).join('\n') + (SERVER ? '\n\nFehler:\n' + (SERVER.fehler || []).join('\n') : '');
  try { await navigator.clipboard.writeText(t); $('#bericht').textContent = 'Kopiert'; } catch (e) { prompt('Bericht', t); }
};
$('#lx-q').oninput = e => lexikon(e.target.value);
window.addEventListener('hashchange', () => { lexikon($('#lx-q').value); const z = document.getElementById(location.hash.slice(1)); if (z) z.scrollIntoView({ behavior: 'smooth' }); });
lexikon();
pruefe().then(() => { const z = location.hash && document.getElementById(location.hash.slice(1)); if (z) z.scrollIntoView(); });
