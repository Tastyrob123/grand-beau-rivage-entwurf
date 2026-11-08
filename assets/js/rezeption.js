/* Seite «Rezeption im Chat»: Einblenden beim Hereinscrollen, Knöpfe öffnen den Chat, 3D-Handy erst nachladen, wenn es naht,
   am Handy statt des 3D-Modells den flachen Rahmen mit demselben Film einmal abspielen.
   Ausgelöst wird über die Lage im Fenster, geprüft beim Scrollen (einmal je Bild) und beim Laden: das läuft in jedem Browser,
   auch dort, wo ein IntersectionObserver nicht anspringt. */
(function () {
  'use strict';
  var d = document.documentElement; d.classList.add('js');
  var ziele = [].slice.call(document.querySelectorAll('[data-r]'));
  ziele.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 90 + 'ms'; });
  var block = document.getElementById('s-telefon3d');
  var mobil = matchMedia('(max-width:900px) and (orientation:portrait),(max-width:700px)').matches;
  var film = document.getElementById('m-tel-film');
  var dreiD = false, filmLos = false, wartet = false, flach = false;

  /* Ausweg ohne 3D (14.10.2026): Kann der Browser kein WebGL (Grafikbeschleunigung aus, Fernzugriff, alter Büro-Rechner) oder kommt das
     3D-Skript nicht an, blieb der Abschnitt bei «Wird geladen» stehen und der Text unsichtbar. Dann steht der flache Rahmen mit demselben
     Film da wie am Handy, der Text daneben. Das 3D-Skript ruft window.__telefonFehler selbst, wenn es scheitert. */
  function kannWebGL() {   /* auch «nein», wenn WebGL nur in Software gerechnet wird (Fernzugriff, Grafikbeschleunigung aus): gemessen 8 Bilder je Sekunde und Pausen bis 1,5 s */
    try {
      var c = document.createElement('canvas'), o = { failIfMajorPerformanceCaveat: true }, g = c.getContext('webgl2', o) || c.getContext('webgl', o);
      if (!g) return false;
      var e = g.getExtension('WEBGL_debug_renderer_info'), r = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL) || '') : '';
      var x = g.getExtension('WEBGL_lose_context'); if (x) x.loseContext();
      return !/swiftshader|llvmpipe|softpipe|software|basic render|warp/i.test(r);
    } catch (e) { return false; }
  }
  window.__telefonFehler = function () {
    if (flach || mobil || !block) return; flach = true;
    block.classList.add('flach');
    var t = document.getElementById('telefon3d-text'); if (t) t.classList.add('da');
    bald();
  };
  function laden3d() {
    if (dreiD) return; dreiD = true;
    if (!kannWebGL()) { window.__telefonFehler(); return; }
    var v = ((document.querySelector('script[src*="rezeption.js"]') || {}).src || '').split('v=')[1] || '';
    var s = document.createElement('script'); s.src = ((document.querySelector('script[src*="assets/js/rezeption.js"]') || {}).src || '../assets/js/rezeption.js').replace(/rezeption\.js.*$/, 'rezeption3d.js?v=') + v;   /* Weg vom eigenen Skript aus, damit es auch unter rezeption/<sprache>/ lädt */ s.onerror = function () { window.__telefonFehler(); }; document.body.appendChild(s);
  }
  function filmStart() {
    if (filmLos || !film) return; filmLos = true;
    film.preload = 'auto'; film.load();
    film.addEventListener('canplay', function () { var p = film.play(); if (p && p.catch) p.catch(function () {}); }, { once: true });
  }
  function pruefe() {
    wartet = false;
    var h = innerHeight;
    for (var i = ziele.length - 1; i >= 0; i--) {
      var r = ziele[i].getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) { ziele[i].classList.add('da'); ziele.splice(i, 1); }
    }
    if (block && !mobil && !dreiD && block.getBoundingClientRect().top < h * 3) laden3d();
    if (film && (mobil || flach) && !filmLos) { var f = film.getBoundingClientRect(); if (f.top < h * 0.6 && f.bottom > h * 0.3) filmStart(); }
  }
  function bald() { if (!wartet) { wartet = true; requestAnimationFrame(pruefe); } }
  addEventListener('scroll', bald, { passive: true });
  addEventListener('resize', bald);
  addEventListener('load', bald);
  pruefe();
  setTimeout(pruefe, 400);

  if (film) film.addEventListener('click', function () { filmStart(); var p = film.play(); if (p && p.catch) p.catch(function () {}); });   // Antippen startet den Film, falls der Browser das Abspielen ohne Berührung verweigert
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-chat]'); if (!b) return;
    var k = document.querySelector('.gast-knopf');
    if (k && !d.classList.contains('gast-offen')) k.click();
  });
})();
