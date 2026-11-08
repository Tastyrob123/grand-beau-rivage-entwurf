/* Handy-Reihe «Was Gäste wissen wollen» (rezeption/), Robert 12.10.2026, wie /im-chat/ bei Salt & Silver:
   beim Scrollen wandern Handy 1 und 3 nach unten, 2 und 4 nach oben (nur transform, ein Takt, nur solange die Reihe im Bild ist).
   Beim Überfahren wird ein Handy etwas grösser, die anderen und der Abschnitt dunkler. Das steuert dieses Skript statt :hover,
   weil Safari :hover auch unter ruhender Maus beim Scrollen wechselt: nach jedem Scrollschritt 300 ms keine Zeiger-Ereignisse.
   Quelle: _Rezeption im Chat/galerie/galerie.js (landing.py kopiert nach assets/js/rezeption-galerie.js). */
(function () {
  'use strict';
  var g = document.querySelector('.hg'); if (!g) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var abschnitt = g.closest('.rz-fragen') || g, zuege = [].slice.call(g.querySelectorAll('.hg__zug'));
  var takt = 0, sperre = 0, aktiv = null;
  function lauf() {
    takt = 0;
    var r = g.getBoundingClientRect(), h = innerHeight;
    if (r.bottom < -h * 0.2 || r.top > h * 1.2) return;
    var p = (h / 2 - (r.top + r.height / 2)) / (h / 2 + r.height / 2);   // -1 unten herein … 0 Mitte … 1 oben hinaus
    p = Math.max(-1, Math.min(1, p));
    var weg = Math.min(90, innerWidth * 0.06);
    for (var i = 0; i < zuege.length; i++) zuege[i].style.transform = 'translate3d(0,' + ((i % 2 ? -1 : 1) * p * weg).toFixed(1) + 'px,0)';
  }
  function an() { if (!takt && !ruhig) takt = requestAnimationFrame(lauf); }
  function setze(h) {
    if (h === aktiv) return;
    if (aktiv) aktiv.classList.remove('an');
    aktiv = h; if (h) h.classList.add('an');
    g.classList.toggle('hg-an', !!h); abschnitt.classList.toggle('hg-an', !!h);
  }
  addEventListener('scroll', function () { sperre = performance.now() + 300; if (aktiv) setze(null); an(); }, { passive: true });
  addEventListener('resize', an);
  addEventListener('load', an);
  an();
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    g.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || performance.now() < sperre) return; setze(e.target.closest ? e.target.closest('.hg__h') : null); }, { passive: true });
    g.addEventListener('pointerleave', function () { setze(null); });
  }
})();
