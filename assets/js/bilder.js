/* Grand Beau-Rivage — Lader mit Reihenfolge (12.10.2026, Fassung 3): Fotos sind da, bevor man sie sieht, und zwar in der Reihenfolge, in der man sie sieht.
   Neu gegenüber Fassung 2: Bilder unter dem ersten Bildschirm stehen im HTML als «gehalten» (data-src/data-srcset statt src/srcset, ein durchsichtiges
   Platzbild als src). Der Browser holt sie also nie von sich aus (Chromium holte mit loading="lazy" bis 2500 px voraus, auf Roberts Leitung rund 1 MB,
   bevor das Hauptskript überhaupt da war). Dieses Skript entscheidet allein, was wann geholt wird:
   1. Zuerst gehört die Leitung dem ersten Bildschirm (Kopfbild und was daneben steht, diese stehen nicht gehalten im HTML). Solange der nicht scharf ist, startet nichts anderes.
   2. Was sich dem Fenster nähert (gut eine Fensterhöhe voraus), kommt sofort und wird entpackt, an der Schlange vorbei.
   3. Alles Übrige der Seite kommt danach der Reihe nach, das Nächstliegende zuerst, nie mehr als GLEICH gleichzeitig.
   Wer ein gehaltenes Bild braucht, setzt wie bisher im.loading = 'eager' (main.js, feiern.js …): das Skript sieht die Änderung und gibt die Adresse frei.
   Fenster (.bruch): ihr Bild steht fest über dem ganzen Schirm und gilt für den Browser deshalb immer als sichtbar. Es bleibt aus dem Bild
   (CSS: .bruch:not(.nah)>img), bis der Abschnitt naht. Kein Eingriff in den Scroll, keine Arbeit im Takt: nur Beobachter und eine Merkzahl.
   26.10.2026 (Robert, Safari: «alle Bilder laden so langsam»): Gemessen lief dieses Skript erst mit DOMContentLoaded (4 bis 12 s auf langsamer Leitung),
   und bis dahin durfte kein gehaltenes Bild starten. Jetzt gibt ein kleiner Vorlader im <head> (bau.py) Bilder im Umkreis einer Fensterhöhe schon
   beim Einlesen frei (sie sind dann eager und stehen nicht mehr in dieser Schlange; mit DOMContentLoaded zieht er sich zurück). Hier dazu:
   wer scrollt, wartet nicht mehr auf den scharfen ersten Bildschirm; Fotos in unsichtbaren Folien (Galerie: nur die aktive Folie ist zu sehen,
   die anderen liegen mit opacity 0 darunter) zählen nicht als nah, sondern kommen danach aus der Schlange (vorher luden fünf Folien à 180 kB
   zugleich, 2,8 s bis die sichtbare scharf war); ferne Fotos tragen fetchpriority low, nahe high (Schlange bleibt bei zwei: mehr zugleich nahm dem Sichtbaren Leitung weg). */
(function () {
  'use strict';
  var doc = document, W = window;
  /* gehalten: Adresse freigeben */
  function frei(im) {
    if (!im.hasAttribute('data-src') && !im.hasAttribute('data-srcset')) return;
    var ss = im.getAttribute('data-srcset'), s = im.getAttribute('data-src'), jetzt = im.getAttribute('src') || '';
    im.removeAttribute('data-srcset'); im.removeAttribute('data-src');
    if (jetzt && jetzt.indexOf('data:') !== 0) { im.__frei = 1; return; }   /* ein Skript hat schon selbst eine Adresse gesetzt (Zimmer-Finder): die gilt */
    if (ss) im.setAttribute('srcset', ss);
    if (s) im.setAttribute('src', s);
    im.__frei = 1;
  }
  function gehalten(im) { return im.hasAttribute('data-src') || im.hasAttribute('data-srcset'); }
  function da(im) { return !gehalten(im) && im.complete && im.naturalWidth > 1; }
  function hole(im) { if (im.__h) return; im.__h = 1; frei(im); im.loading = 'eager'; }
  function entpacke(im) {
    if (im.__e || !im.decode) return; im.__e = 1;
    var los = function () { im.decode().catch(function () {}); };
    if (da(im)) los(); else im.addEventListener('load', los, { once: true });
  }
  /* wer irgendwo im.loading = 'eager' setzt, bekommt sein Bild (Beobachter auf dem Attribut, damit kein anderes Skript umgebaut werden muss) */
  var lauscher = ('MutationObserver' in W) ? new MutationObserver(function (ms) { ms.forEach(function (m) { var im = m.target; if (im.loading !== 'lazy' && gehalten(im)) hole(im); }); }) : null;
  function melde(im) { if (im.__m) return; im.__m = 1; if (lauscher) lauscher.observe(im, { attributes: true, attributeFilter: ['loading'] }); }
  var alle = [].slice.call(doc.querySelectorAll('img[loading="lazy"]'));
  var fenster = [].slice.call(doc.querySelectorAll('.bruch'));
  alle.forEach(melde);
  W.__bilderFrei = frei;   /* für Skripte, die eine Adresse sofort brauchen (Lupe) */
  if (!('IntersectionObserver' in W)) { fenster.forEach(function (b) { b.classList.add('nah'); }); alle.forEach(hole); return; }
  if (!alle.length) { fenster.forEach(function (b) { b.classList.add('nah'); }); return; }
  var netz = navigator.connection || {}, sparsam = !!netz.saveData || /2g/.test(netz.effectiveType || '');

  /* ---------- die Schlange: höchstens GLEICH Fotos unterwegs, Dringendes zählt mit und geht vor ---------- */
  /* GLEICH: höchstens so viele Fotos aus der Schlange zugleich. nahLaeuft: Fotos, die gleich im Blick stehen (nahe/bald) und noch unterwegs sind;
     solange eines davon läuft, startet die Schlange nichts Fernes, damit die Leitung dem Nahen gehört (Messung 12.10.2026, 1,5 Mbit/s:
     drei ferne Fotos zugleich hielten das nahe bis 2,8 s auf). */
  var GLEICH = 2, laeuft = 0, nahLaeuft = 0, frei_ = false, schlange = alle.slice(), neu = true;
  /* Firefox (und teils Safari) zählt jedes Foto, das vor dem load-Ereignis startet, zum Ladevorgang der Seite: die Schlange hielt ihn offen, bis das
     letzte ferne Foto da war (Aussen-Prüfung 14.10.2026: Firefox 28 bis 49 s, Chrome 4 bis 6 s). Fernes startet deshalb erst nach load,
     spätestens 3 s nachdem der erste Bildschirm steht. Nahes kommt wie bisher sofort. */
  var geladen = doc.readyState === 'complete';
  function nachLoad() { if (geladen) return; geladen = true; neu = true; weiter(); }
  if (!geladen) W.addEventListener('load', nachLoad, { once: true });
  function starte(im, nah) {
    if (im.__h || da(im)) { hole(im); return; }
    laeuft++; if (nah) { nahLaeuft++; im.__n = 1; }
    var fertig = function () { if (im.__w) return; im.__w = 1; laeuft--; if (im.__n) nahLaeuft--; weiter(); };
    im.addEventListener('load', fertig, { once: true });
    im.addEventListener('error', fertig, { once: true });
    setTimeout(fertig, 8000);
    if ('fetchPriority' in im) im.fetchPriority = nah ? 'high' : 'low';
    hole(im);
    if (da(im)) fertig();
  }
  function abstand(im) {
    var el = im.closest('.bruch') || im;
    if (el === im && im.offsetParent === null) return 1e7;
    var r = el.getBoundingClientRect(), h = W.innerHeight, w = W.innerWidth;
    var dy = r.bottom < 0 ? -r.bottom * 1.5 : (r.top > h ? r.top - h : 0);
    var dx = r.left > w ? r.left - w : (r.right < 0 ? -r.right : 0);
    return dy + dx * 2;
  }
  function weiter() {
    if (!frei_ || !geladen || sparsam || nahLaeuft > 0) return;
    while (laeuft < GLEICH && schlange.length) {
      if (neu) {
        neu = false;
        schlange = schlange.filter(function (im) { return !im.__h && !da(im); });
        schlange.forEach(function (im) { im.__a = abstand(im); });
        schlange.sort(function (a, b) { return a.__a - b.__a; });
        if (!schlange.length) return;
      }
      var im = schlange.shift();
      if (im.__h || da(im)) continue;
      starte(im);
    }
  }
  W.addEventListener('scroll', function () { neu = true; if (!frei_ && W.scrollY > W.innerHeight * .5) los(); }, { passive: true });   /* gescrollt: der erste Bildschirm ist nicht mehr das, was man ansieht */
  /* für «Vorholen» unten: solange ein Kopfbild der nächsten Seite unterwegs ist, startet die Schlange nichts Fernes (es zählt wie ein nahes Foto);
     __bilderStand: steht der erste Bildschirm, wie viele nahe Fotos sind unterwegs, wie viele ferne stehen noch aus */
  W.__bilderNah = function (d) { nahLaeuft = Math.max(0, nahLaeuft + d); if (d < 0) weiter(); };
  W.__bilderStand = function () { return { erster: frei_, nah: nahLaeuft, fern: laeuft + schlange.filter(function (im) { return !im.__h && !da(im); }).length }; };

  /* ---------- was sich dem Fenster nähert: sofort ---------- */
  var gruppen = [], ziel = function (im) { return im.closest('.bruch,.band,.polas,.wahl__b,.stufe__b,.pakete__b') || im; };
  function fotos(el) { return el.tagName === 'IMG' ? [el] : [].slice.call(el.querySelectorAll('img[loading]')); }
  var wartet = [];
  function zuSehen(im) {   /* opacity 0 am Bild oder einem nahen Vorfahren (Folie, die nicht dran ist); [data-r] wartet nur auf sein Erscheinen und zählt als sichtbar */
    for (var e = im, k = 0; e && e.nodeType === 1 && k < 6; e = e.parentNode, k++) { if (!e.hasAttribute('data-r') && getComputedStyle(e).opacity === '0') return false; }
    return true;
  }
  function nahe(z) {
    if (z.classList.contains('bruch')) {
      var fi = z.querySelector('img'), an = function () { z.classList.add('nah'); };
      if (!fi || !fi.decode || z.classList.contains('nah')) an();
      else { starte(fi, true); var dec = function () { fi.decode().then(an, an); }; if (da(fi)) dec(); else { fi.addEventListener('load', dec, { once: true }); fi.addEventListener('error', an, { once: true }); } }
    }
    var hinten = [];
    fotos(z).forEach(function (im) {
      var sichtbar = (z === im || im.getBoundingClientRect().left < W.innerWidth * 1.25) && zuSehen(im);
      if (sichtbar && abstand(im) < W.innerHeight * .25) { starte(im, true); entpacke(im); }
      else if (!im.__h && !da(im)) { hinten.push(im); if (sichtbar) { entpackeSpaeter(im); bald.observe(im); } }
    });
    if (hinten.length) { schlange = hinten.concat(schlange.filter(function (im) { return hinten.indexOf(im) < 0; })); neu = true; weiter(); }
  }
  var bald = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) return; bald.unobserve(e.target); starte(e.target, true); entpacke(e.target); });
  }, { rootMargin: '25% 10% 25% 10%' });
  function entpackeSpaeter(im) { if (im.__e || !im.decode) return; im.addEventListener('load', function () { entpacke(im); }, { once: true }); }
  W.__bilderVor = function (im) {
    if (da(im)) { entpacke(im); return; }
    if (im.__h) { entpackeSpaeter(im); return; }
    if (schlange.indexOf(im) < 0) schlange.unshift(im);
    neu = true; entpackeSpaeter(im); bald.observe(im); weiter();
  };
  var gleich = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var z = e.target; gleich.unobserve(z);
      if (!frei_ && W.scrollY < W.innerHeight * .5 && z.getBoundingClientRect().top >= W.innerHeight) { wartet.push(z); return; }
      nahe(z);
    });
  }, { rootMargin: '120% 25% 120% 25%' });
  function anmelden(im) {
    melde(im);
    var z = ziel(im);
    if (z !== im) { if (gruppen.indexOf(z) > -1) return; gruppen.push(z); }
    gleich.observe(z);
  }
  alle.forEach(anmelden);
  /* später eingefügte Bilder (Kopien fürs Rundgang-Band, Fenster-Inhalte): auch anmelden und in die Schlange */
  if ('MutationObserver' in W) new MutationObserver(function (ms) {
    var neue = [];
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') neue.push(n); else [].push.apply(neue, n.querySelectorAll ? n.querySelectorAll('img[loading="lazy"],img[data-src]') : []); }); });
    neue.forEach(function (im) { if (im.__m || !(im.loading === 'lazy' || gehalten(im))) return; alle.push(im); schlange.push(im); anmelden(im); neu = true; });
    if (neue.length) weiter();
  }).observe(doc.body || doc.documentElement, { childList: true, subtree: true });

  /* ---------- erst der erste Bildschirm, dann der Rest ---------- */
  function los() { if (frei_) return; frei_ = true; neu = true; if (!geladen) setTimeout(nachLoad, 3000); wartet.splice(0).forEach(nahe); weiter(); }
  function erster() {
    var h = W.innerHeight, w = W.innerWidth;
    var vorn = [].slice.call(doc.images).filter(function (im) {
      if (da(im) || gehalten(im) || im.offsetParent === null || im.closest('.bruch')) return false;
      var r = im.getBoundingClientRect();
      return r.width > 40 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
    });
    if (!vorn.length) { los(); return; }
    var offen = vorn.length, eins = function () { if (--offen <= 0) los(); };
    vorn.forEach(function (im) {
      var f = function () { if (im.__v) return; im.__v = 1; eins(); };
      im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true });
      if (da(im)) f();
    });
    setTimeout(los, 6000);
  }
  erster();
})();

/* ---------- Vorholen (12.10.2026 abends): das Kopfbild der nächsten Seite liegt bereit, bevor man sie öffnet ----------
   Robert (Zimmerseiten, Chrome): «die Heroes sind für einen Moment komplett blur und nicht erkennbar, kommen erst nach ein, zwei Sekunden».
   Das Kopfbild einer Seite (70 bis 480 kB) wurde erst geholt, wenn man die Seite öffnete, und teilte sich die Leitung dann mit Stylesheet,
   Schriften und Skripten (gemessen 1,0 bis 2,3 s Platzhalter nach dem ersten Anstrich). Jetzt holt die Seite davor es schon:
   1. sofort für den Verweis, auf dem die Maus ruht, den man antippt oder mit der Tastatur erreicht;
   2. für jeden Verweis im Blick oder kurz davor (ausserhalb von Navigation, Menü, Sprachwahl und Fuss), einer nach dem anderen;
   3. wenn die eigene Seite ganz geladen ist, für die übrigen Verweise der Seite, der nächste zuerst (höchstens MAX je Seitenaufruf).
   Welche Bilder eine Seite im ersten Bildschirm zeigt, steht in KARTE (aus den <link rel="preload" as="image"> der fertigen Seiten, schreibt
   koepfe.py beim Hochladen in die Online-Kopie; hier in der Quelle bleibt sie leer). Kennt die Karte eine Seite nicht, wird die Seite gelesen
   und ihr Kopf ausgewertet. Bestellt wird dasselbe Bild in derselben Grösse wie später auf der Seite; es liegt dann ein Jahr im Speicher des
   Browsers. Solange ein Kopfbild unterwegs ist, startet der Lader oben nichts Fernes. Kein Eingriff in den Scroll, keine Arbeit im Takt. */
(function () {
  'use strict';
  var doc = document, W = window, netz = navigator.connection || {};
  if (!W.fetch || !W.URL || netz.saveData || /2g/.test(netz.effectiveType || '')) return;
  var KARTE = /*KOEPFE*/{"abreise.html":[["assets/img/kd-haus-abend-600.webp?v=8da5bad6 600w, assets/img/kd-haus-abend-s.webp?v=12eff6b0 1000w, assets/img/kd-haus-abend-1400.webp?v=8da5bad6 1400w, assets/img/kd-haus-abend.webp?v=8da5bad6 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-aus-aare-ufer-600.webp?v=ca748b3a 600w, assets/img/kd-aus-aare-ufer-s.webp?v=877c023b 1000w, assets/img/kd-aus-aare-ufer-1400.webp?v=ca748b3a 1400w, assets/img/kd-aus-aare-ufer.webp?v=ca748b3a 1920w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"angebote.html":[["assets/img/kd-terrasse-lounge-600.webp?v=66885d6e 600w, assets/img/kd-terrasse-lounge-s.webp?v=ce86742b 1000w, assets/img/kd-terrasse-lounge.webp?v=66885d6e 1500w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-spa-pool-4-600.webp?v=f63abcc9 600w, assets/img/kd-spa-pool-4-s.webp?v=21ec1631 1000w, assets/img/kd-spa-pool-4-1400.webp?v=f63abcc9 1400w, assets/img/kd-spa-pool-4.webp?v=f63abcc9 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"anreise.html":[["assets/img/kd-haus-aare-600.webp?v=a69df4b9 600w, assets/img/kd-haus-aare-s.webp?v=28f7bd6d 1000w, assets/img/kd-haus-aare-1400.webp?v=a69df4b9 1400w, assets/img/kd-haus-aare.webp?v=a69df4b9 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"bar-le-vieux-rivage.html":[["assets/img/kd-bar-3-600.webp?v=96764807 600w, assets/img/kd-bar-3-s.webp?v=d1a845d9 1000w, assets/img/kd-bar-3-1400.webp?v=96764807 1400w, assets/img/kd-bar-3.webp?v=96764807 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"essen-trinken.html":[["assets/img/kd-terrasse-aare-600.webp?v=00494cdc 600w, assets/img/kd-terrasse-aare-s.webp?v=3aa403f3 1000w, assets/img/kd-terrasse-aare-1400.webp?v=00494cdc 1400w, assets/img/kd-terrasse-aare.webp?v=00494cdc 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-bar-theke-600.webp?v=3aa0f409 600w, assets/img/kd-bar-theke-s.webp?v=c3c79308 1000w, assets/img/kd-bar-theke-1400.webp?v=3aa0f409 1400w, assets/img/kd-bar-theke.webp?v=3aa0f409 1856w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"feiern-tagen.html":[["assets/img/kd-hochzeit-schleppe-600.webp?v=4efa2e0f 600w, assets/img/kd-hochzeit-schleppe-s.webp?v=1b1bd5e0 1000w, assets/img/kd-hochzeit-schleppe-1400.webp?v=4efa2e0f 1400w, assets/img/kd-hochzeit-schleppe.webp?v=4efa2e0f 1913w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-raum-jungfrau-2-600.webp?v=1dc358aa 600w, assets/img/kd-raum-jungfrau-2-s.webp?v=b0bb4fb2 1000w, assets/img/kd-raum-jungfrau-2-1400.webp?v=1dc358aa 1400w, assets/img/kd-raum-jungfrau-2.webp?v=1dc358aa 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"haus.html":[["assets/img/kd-haus-fluss-berge-600.webp?v=6e6fb117 600w, assets/img/kd-haus-fluss-berge-s.webp?v=390345d1 1000w, assets/img/kd-haus-fluss-berge-1400.webp?v=6e6fb117 1400w, assets/img/kd-haus-fluss-berge.webp?v=6e6fb117 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-halle-600.webp?v=4fd6603f 600w, assets/img/kd-halle-s.webp?v=cb4afdce 1000w, assets/img/kd-halle-1400.webp?v=4fd6603f 1400w, assets/img/kd-halle.webp?v=4fd6603f 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"index.html":[["assets/img/hero-l-600.webp?v=3f4cd471 600w, assets/img/hero-s.webp?v=f3ce6d99 1000w, assets/img/hero-m.webp?v=f5b775a9 1600w, assets/img/hero-l-1920.webp?v=3f4cd471 1920w, assets/img/hero-l.webp?v=3f4cd471 2560w","(-webkit-min-device-pixel-ratio:1.5) 62vw, 100vw","(min-width:701px)",""],["assets/img/hero-hoch-780.webp?v=db704641 780w, assets/img/hero-hoch.webp?v=56ae5ea2 1000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","(max-width:700px)",""]],"karriere.html":[["assets/img/probe/kr-halle-gepaeck-600.webp?v=1 600w, assets/img/probe/kr-halle-gepaeck-s.webp?v=1 1000w, assets/img/probe/kr-halle-gepaeck-1400.webp?v=1 1400w, assets/img/probe/kr-halle-gepaeck.webp?v=1 2200w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"kontakt.html":[["assets/img/kd-haus-aare-600.webp?v=a69df4b9 600w, assets/img/kd-haus-aare-s.webp?v=28f7bd6d 1000w, assets/img/kd-haus-aare-1400.webp?v=a69df4b9 1400w, assets/img/kd-haus-aare.webp?v=a69df4b9 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"planer.html":[["assets/img/kd-aus-brienzersee-600.webp?v=41cc62d0 600w, assets/img/kd-aus-brienzersee-s.webp?v=ff4938f6 1000w, assets/img/kd-aus-brienzersee-1400.webp?v=41cc62d0 1400w, assets/img/kd-aus-brienzersee.webp?v=41cc62d0 1920w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"restaurant-la-petite-suisse.html":[["assets/img/kd-rest-suisse-2-600.webp?v=67b56917 600w, assets/img/kd-rest-suisse-2-s.webp?v=f477bc34 1000w, assets/img/kd-rest-suisse-2-1400.webp?v=67b56917 1400w, assets/img/kd-rest-suisse-2.webp?v=67b56917 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"restaurant-lambiance.html":[["assets/img/kd-rest-ambiance-2-600.webp?v=ba8d2609 600w, assets/img/kd-rest-ambiance-2-s.webp?v=76e3b740 1000w, assets/img/kd-rest-ambiance-2-1400.webp?v=ba8d2609 1400w, assets/img/kd-rest-ambiance-2.webp?v=ba8d2609 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"spa.html":[["assets/img/kd-spa-pool-hell-600.webp?v=889b262f 600w, assets/img/kd-spa-pool-hell-s.webp?v=6a44f34a 1000w, assets/img/kd-spa-pool-hell-1400.webp?v=889b262f 1400w, assets/img/kd-spa-pool-hell.webp?v=889b262f 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-spa-beauty-2-600.webp?v=2288f816 600w, assets/img/kd-spa-beauty-2-s.webp?v=2a6317fd 1000w, assets/img/kd-spa-beauty-2-1400.webp?v=2288f816 1400w, assets/img/kd-spa-beauty-2.webp?v=2288f816 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]],"terrasse-la-belle-riviere.html":[["assets/img/kd-terrasse-schirme-600.webp?v=4353fb43 600w, assets/img/kd-terrasse-schirme-s.webp?v=ef1aacd2 1000w, assets/img/kd-terrasse-schirme-1400.webp?v=4353fb43 1400w, assets/img/kd-terrasse-schirme.webp?v=4353fb43 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"veranstaltungen.html":[["assets/img/probe/ve-kopf-600.webp?v=4 600w, assets/img/probe/ve-kopf-s.webp?v=4 1000w, assets/img/probe/ve-kopf-1400.webp?v=4 1400w, assets/img/probe/ve-kopf.webp?v=4 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""],["assets/img/probe/fh-fenster-saal-600.webp?v=1 600w, assets/img/probe/fh-fenster-saal-s.webp?v=1 1000w, assets/img/probe/fh-fenster-saal-1400.webp?v=1 1400w, assets/img/probe/fh-fenster-saal.webp?v=1 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-doppelzimmer-comfort.html":[["assets/img/kd-z-comfort-600.webp?v=7d4cc315 600w, assets/img/kd-z-comfort-s.webp?v=4481baa5 1000w, assets/img/kd-z-comfort-1400.webp?v=7d4cc315 1400w, assets/img/kd-z-comfort.webp?v=7d4cc315 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-doppelzimmer-first-class.html":[["assets/img/kd-z-first-600.webp?v=849ae7a5 600w, assets/img/kd-z-first-s.webp?v=1307c24f 1000w, assets/img/kd-z-first-1400.webp?v=849ae7a5 1400w, assets/img/kd-z-first.webp?v=849ae7a5 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-doppelzimmer-flussblick.html":[["assets/img/kd-z-fluss-600.webp?v=ea4d14e1 600w, assets/img/kd-z-fluss-s.webp?v=e108d196 1000w, assets/img/kd-z-fluss-1400.webp?v=ea4d14e1 1400w, assets/img/kd-z-fluss.webp?v=ea4d14e1 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-doppelzimmer-king-size.html":[["assets/img/kd-z-king-600.webp?v=c085f5df 600w, assets/img/kd-z-king-s.webp?v=eb038715 1000w, assets/img/kd-z-king-1400.webp?v=c085f5df 1400w, assets/img/kd-z-king.webp?v=c085f5df 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-doppelzimmer-queen-size.html":[["assets/img/kd-z-queen-600.webp?v=11c55984 600w, assets/img/kd-z-queen-s.webp?v=c8e51057 1000w, assets/img/kd-z-queen-1400.webp?v=11c55984 1400w, assets/img/kd-z-queen.webp?v=11c55984 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-einzelzimmer.html":[["assets/img/kd-z-einzel-600.webp?v=c1836cc5 600w, assets/img/kd-z-einzel-s.webp?v=692fe5e0 1000w, assets/img/kd-z-einzel-1400.webp?v=c1836cc5 1400w, assets/img/kd-z-einzel.webp?v=c1836cc5 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-familienzimmer.html":[["assets/img/kd-z-familie-600.webp?v=c87d0bdc 600w, assets/img/kd-z-familie-s.webp?v=a2984216 1000w, assets/img/kd-z-familie-1400.webp?v=c87d0bdc 1400w, assets/img/kd-z-familie.webp?v=c87d0bdc 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-interlaken-suite.html":[["assets/img/kd-z-interlaken-600.webp?v=ea4af440 600w, assets/img/kd-z-interlaken-s.webp?v=6490ec56 1000w, assets/img/kd-z-interlaken-1400.webp?v=ea4af440 1400w, assets/img/kd-z-interlaken.webp?v=ea4af440 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-junior-suite-first-class.html":[["assets/img/kd-z-jsfc-600.webp?v=8ac94010 600w, assets/img/kd-z-jsfc-s.webp?v=6a16e473 1000w, assets/img/kd-z-jsfc-1400.webp?v=8ac94010 1400w, assets/img/kd-z-jsfc.webp?v=8ac94010 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-junior-suite.html":[["assets/img/kd-z-js-neu-600.webp?v=c3721f5c 600w, assets/img/kd-z-js-neu-s.webp?v=791c795e 1000w, assets/img/kd-z-js-neu-1400.webp?v=c3721f5c 1400w, assets/img/kd-z-js-neu.webp?v=c3721f5c 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-pyramid-suite.html":[["assets/img/kd-z-pyramid-600.webp?v=3028f686 600w, assets/img/kd-z-pyramid-s.webp?v=d8389937 1000w, assets/img/kd-z-pyramid-1400.webp?v=3028f686 1400w, assets/img/kd-z-pyramid.webp?v=3028f686 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-royal-suite.html":[["assets/img/kd-z-royal-600.webp?v=a36013f2 600w, assets/img/kd-z-royal-s.webp?v=495d938f 1000w, assets/img/kd-z-royal-1400.webp?v=a36013f2 1400w, assets/img/kd-z-royal.webp?v=a36013f2 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer-spa-junior-suite.html":[["assets/img/kd-z-spa-600.webp?v=f0cd3da7 600w, assets/img/kd-z-spa-s.webp?v=0c7511fe 1000w, assets/img/kd-z-spa-1400.webp?v=f0cd3da7 1400w, assets/img/kd-z-spa.webp?v=f0cd3da7 2000w","(-webkit-min-device-pixel-ratio:1.5) 75vw, 100vw","",""]],"zimmer.html":[["assets/img/kd-zh-jsfc-2-600.webp?v=1d5ddc6d 600w, assets/img/kd-zh-jsfc-2-s.webp?v=bf039557 1000w, assets/img/kd-zh-jsfc-2-1400.webp?v=1d5ddc6d 1400w, assets/img/kd-zh-jsfc-2.webp?v=1d5ddc6d 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""],["assets/img/kd-zh-king-600.webp?v=9f91cf65 600w, assets/img/kd-zh-king-s.webp?v=1843b771 1000w, assets/img/kd-zh-king-1400.webp?v=9f91cf65 1400w, assets/img/kd-zh-king.webp?v=9f91cf65 2000w","(-webkit-min-device-pixel-ratio:1.5) and (max-width:860px) 75vw, (-webkit-min-device-pixel-ratio:1.5) 37.5vw, (max-width:860px) 100vw, 50vw","",""]]}/*KOEPFE*/;
  var wurzel = ((doc.currentScript || {}).src || '').split('assets/js/')[0];
  var stand = {}, reihe = [], rest = [], halte = [], laeuft = 0, gestartet = 0, MAX = 18, uhr = 0, runden = 0;
  function ziel(a) {
    try {
      if (!a || !a.href || a.hasAttribute('download')) return '';
      var u = new URL(a.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return '';
      if (!/\.html$/.test(u.pathname) && !/^\/(?:[a-z]{2}\/)?$/.test(u.pathname)) return '';
      return u.origin + u.pathname;
    } catch (e) { return ''; }
  }
  function attr(l, n) { var m = l.match(new RegExp('\\s' + n + '="([^"]*)"')); return m ? m[1].replace(/&amp;/g, '&') : ''; }
  function ganz(ss, basis) { return ss.split(',').map(function (k) { k = k.trim().split(/\s+/); k[0] = new URL(k[0], basis).href; return k.join(' '); }).join(', '); }
  function nah(d) { if (W.__bilderNah) W.__bilderNah(d); }
  function lage() { return W.__bilderStand ? W.__bilderStand() : { erster: doc.readyState === 'complete', nah: laeuft, fern: 0 }; }
  /* liste: [[srcset, sizes, media, href], …] mit Adressen bezogen auf basis */
  function bestelle(liste, basis, eilig, ende) {
    var offen = 0;
    liste.forEach(function (e) {
      if ((e[2] && W.matchMedia && !W.matchMedia(e[2]).matches) || (!e[0] && !e[3])) return;
      var im = new Image(), f = function () { if (--offen <= 0) ende(); };
      offen++; halte.push(im);
      im.onload = im.onerror = f; im.decoding = 'async';
      if ('fetchPriority' in im) im.fetchPriority = eilig ? 'high' : 'low';   /* eilig: Verweis im Blick oder unter Maus/Finger; sonst Vorrat */
      if (e[0]) { im.sizes = e[1] || '100vw'; im.srcset = ganz(e[0], basis); }
      else im.src = new URL(e[3], basis).href;
    });
    if (!offen) ende();
  }
  function hole(adr, eilig) {
    if (stand[adr] === 2) return; stand[adr] = 2;
    reihe = reihe.filter(function (a) { return a.__ziel !== adr; });
    laeuft++; gestartet++; nah(1);
    var zu = false, ende = function () { if (zu) return; zu = true; laeuft--; nah(-1); weiter(); };
    setTimeout(ende, 9000);
    var name = adr.slice(adr.lastIndexOf('/') + 1) || 'index.html';
    if (wurzel && KARTE[name]) { bestelle(KARTE[name], wurzel, eilig, ende); return; }
    var wie = { credentials: 'same-origin' }; if (!eilig) wie.priority = 'low';
    fetch(adr, wie).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var links = t.slice(0, Math.max(0, t.indexOf('</head>'))).match(/<link\b[^>]*\srel="preload"[^>]*>/g) || [];
      bestelle(links.filter(function (l) { return attr(l, 'as') === 'image'; }).map(function (l) { return [attr(l, 'imagesrcset'), attr(l, 'imagesizes'), attr(l, 'media'), attr(l, 'href')]; }), adr, eilig, ende);
    }).catch(ende);
  }
  /* der Verweis, der dem Blick am nächsten ist: im Fenster zählt die Nähe zur Mitte, darunter und darüber der Abstand zum Fenster */
  function naechster(l) {
    var h = W.innerHeight, best = l[0], b = 1e9;
    l.forEach(function (a) { var r = a.getBoundingClientRect(), m = (r.top + r.bottom) / 2, w = r.top > h ? h + (r.top - h) * 2 : (r.bottom < 0 ? h - r.bottom * 3 : Math.abs(m - h / 2)); if (w < b) { b = w; best = a; } });
    return best;
  }
  function weiter() {
    clearTimeout(uhr);
    if (gestartet >= MAX || (!reihe.length && !rest.length)) return;
    var l = lage();
    if (laeuft < 1 && l.erster) {
      if (reihe.length) { hole(naechster(reihe).__ziel, true); return; }
      /* die übrigen Verweise erst, wenn die eigene Seite fertig ist: kein nahes und kein fernes Foto mehr offen */
      if (doc.readyState === 'complete' && l.nah - laeuft <= 0 && !l.fern) {
        rest = rest.filter(function (a) { return stand[a.__ziel] !== 2 && a.offsetParent !== null; });
        if (!rest.length) return;
        hole(naechster(rest).__ziel); return;
      }
    }
    if (++runden < 400) uhr = setTimeout(weiter, laeuft ? 1500 : 500);   /* höchstens ein paar Minuten nachsehen, dann Ruhe */
  }
  /* Verweise im Blick oder kurz davor */
  if ('IntersectionObserver' in W) {
    var blick = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = e.target, i = reihe.indexOf(a);
        if (stand[a.__ziel] === 2) { blick.unobserve(a); return; }
        if (e.isIntersecting) { if (i < 0) reihe.push(a); }
        else if (i > -1) reihe.splice(i, 1);
      });
      weiter();
    }, { rootMargin: '0px 0px 150% 0px' });
    var melde = function () {
      [].forEach.call(doc.querySelectorAll('a[href]'), function (a) {
        if (a.__ziel || a.closest('.nav,.menue,.fuss,footer,.sprache,[hidden]')) return;
        var adr = ziel(a); if (!adr) return;
        a.__ziel = adr; rest.push(a); blick.observe(a);
      });
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', melde); else melde();
  }
  /* Maus ruht auf einem Verweis (nicht beim Scrollen: Safari meldet dann jeden Verweis, der unter dem Zeiger durchläuft), Finger, Tastatur: sofort */
  var ruhe = 0;
  doc.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var a = e.target.closest && e.target.closest('a[href]'), adr = ziel(a);
    clearTimeout(ruhe);
    if (!adr || stand[adr] === 2 || doc.documentElement.classList.contains('rollt')) return;
    ruhe = setTimeout(function () { hole(adr, true); }, 70);
  }, { passive: true });
  doc.addEventListener('pointerout', function () { clearTimeout(ruhe); }, { passive: true });
  var gleich = function (e) { var a = e.target.closest && e.target.closest('a[href]'), adr = ziel(a); if (adr) hole(adr, true); };
  doc.addEventListener('touchstart', gleich, { passive: true });
  doc.addEventListener('focusin', gleich);
})();
