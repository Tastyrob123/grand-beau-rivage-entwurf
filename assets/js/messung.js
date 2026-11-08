/* Le Registre: das Haus sieht, wer seine Website besucht (Tasty Studios 13.10.2026; vorher «Messung», 12.10.2026).
   Je Seite geht eine Zeile an /api/registre (registre.py; lokal über serve.py, online dieselbe Adresse):
       r1 <seitenaufruf> <datei> <sprache> <geraet> <sekunden> <ereignisse|-> <herkunft|->
   einmal beim Öffnen (0 Sekunden), bei jedem Klick zur Buchung und beim Verlassen (Sekunden, in denen die Seite sichtbar war).
   Ohne Cookies und ohne Kennung im Gerät: «seitenaufruf» ist eine Zufallsfolge, die nur in dieser Variablen lebt und mit der Seite endet.
   Dass die Seiten eines Besuchs zusammenfinden, Land und Ort bestimmt der Server aus der Verbindung (siehe registre.py); die Adresse speichert er nicht.
   «herkunft» ist nur der Name der Website, von der der Gast kam (zum Beispiel www.google.com), nie die ganze Adresse.
   Nicht gezählt: automatische Browser (Prüfläufe), Seiten im Rahmen, die Werkzeuge des Hauses und Geräte, auf denen das Team in Le Registre
   «Dieses Gerät nicht mitzählen» gewählt hat (das Einzige, was je in einem Gerät steht, und nur dort).
   Das Buchungssystem (SimpleBooking), der Tischplan (aleno) und der Gutscheinshop bleiben unberührt: gezählt wird nur der Klick dorthin.
   Ereignisse: suche (Zimmersuche geöffnet) · weiter (aus der Zimmersuche zu SimpleBooking) · buchung (ins Buchungssystem, gleich auf welchem Weg,
   auch aus dem Chat) · taste («Buchen» in der Leiste oben oder die Taste in der Ecke) · tisch_auf («Tisch reservieren» geklickt) · tisch (weiter zum Tischplan). */
(function () {
  'use strict';
  var n = navigator, d = document, w = window;
  if (!n.sendBeacon || n.webdriver || w.self !== w.top) return;
  try { if (w.localStorage.getItem('gbr-nicht-zaehlen') === '1') return; } catch (e) { /* privat: zählt normal */ }
  var teile = location.pathname.split('/'), datei = teile.pop() || 'index.html';
  if (/^(studio|mission-control|werkbank|maison|marke|reception|rezeption|registre|imprimerie)$/.test(teile[1] || '')) return;
  if (!/^[a-z0-9-]{1,60}\.html$/.test(datei)) return;
  var sp = (d.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  if (' de en fr zh ko ar '.indexOf(' ' + sp + ' ') < 0) sp = 'en';
  var breit = function (px) { return !!(w.matchMedia && w.matchMedia('(max-width:' + px + 'px)').matches); };
  var geraet = breit(700) ? 'handy' : breit(1060) ? 'tablet' : 'rechner';
  var her = '-';
  try { var r = d.referrer ? new URL(d.referrer).hostname.toLowerCase() : ''; if (r && r !== location.hostname && /^[a-z0-9.-]{3,60}$/.test(r)) her = r; } catch (e) {}
  var pv, war, liste, sichtbar, seit, gesendet;
  function neu() {
    pv = (Math.random().toString(36) + '000000').slice(2, 8);
    war = {}; liste = []; sichtbar = 0; gesendet = '';
    seit = d.visibilityState === 'hidden' ? 0 : Date.now();
    sende();
  }
  function sek() { return Math.min(1800, Math.round((sichtbar + (seit ? Date.now() - seit : 0)) / 1000)); }
  function sende() {
    var zeile = 'r1 ' + pv + ' ' + datei + ' ' + sp + ' ' + geraet + ' ' + sek() + ' ' + (liste.length ? liste.join(',') : '-') + ' ' + her;
    if (zeile === gesendet) return;
    gesendet = zeile;
    try { n.sendBeacon('/api/registre', zeile); } catch (e) {}   /* wartet auf keine Antwort */
  }
  function zaehle(was) {
    if (war[was]) return;
    war[was] = 1; liste.push(was);
    sende();
  }
  function weg() { if (seit) { sichtbar += Date.now() - seit; seit = 0; } sende(); }
  neu();
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') weg(); else if (!seit) seit = Date.now(); });
  w.addEventListener('pagehide', weg);
  w.addEventListener('pageshow', function (e) { if (e.persisted) neu(); });   /* zurück aus dem Seitenspeicher des Browsers: neuer Aufruf */
  d.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('[data-buchen]');
    if (b) {
      if (e.isTrusted && b.closest('.nav__rechts,.eckknopf')) { war.taste || (war.taste = 1, liste.push('taste')); }   /* nur echte Klicks: andere Wege öffnen die Zimmersuche über dieselbe Taste */
      zaehle('suche'); sende();
      return;
    }
    var a = t.closest('a[href]');
    if (a) {
      var h = a.href;
      if (h.indexOf('simplebooking.it') > -1) { if (a.closest('dialog.buchen:not(.tisch)') && !war.weiter) { war.weiter = 1; liste.push('weiter'); } zaehle('buchung'); sende(); }
      else if (h.indexOf('mytools.aleno.me') > -1) {
        if (a.closest('dialog.tisch')) zaehle('tisch');
        else {   /* Tea Time und neue Tabs gehen ohne Fenster direkt zum Tischplan */
          if ((/shifts=/.test(h) || e.metaKey || e.ctrlKey || e.shiftKey || !d.querySelector('dialog.tisch')) && !war.tisch) { war.tisch = 1; liste.push('tisch'); }
          zaehle('tisch_auf'); sende();
        }
      }
      return;
    }
    if (t.closest('.gast__m-los')) zaehle('buchung');   /* Rezeption im Chat: die Taste unter der Zimmerwahl öffnet das Buchungssystem */
  }, true);
})();
