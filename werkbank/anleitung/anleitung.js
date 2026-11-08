/* Anleitung zum Studio: Hereinkommen wie auf der Werkbank, Filme und Bilder werden per Klick gross (Kino aus dem Werkbank-Kit, hier auch für Standbilder). */
(function () {
  'use strict';
  var doc = document, ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $ = function (s, e) { return (e || doc).querySelector(s); }, $$ = function (s, e) { return [].slice.call((e || doc).querySelectorAll(s)); };

  /* Hereinkommen */
  var alle = $$('[data-a], .zt');
  if (ruhig || !('IntersectionObserver' in window)) alle.forEach(function (e) { e.classList.add('da'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('da'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alle.forEach(function (e) { io.observe(e); });
  }
  setTimeout(function () { doc.body.classList.add('da'); $$('.auftakt [data-a], .auftakt .zt').forEach(function (e) { e.classList.add('da'); }); }, 80);

  /* Filme: kurz bevor ein Film ins Bild kommt, schon laden, damit er beim Klick sofort läuft */
  if ('IntersectionObserver' in window) $$('.kino video').forEach(function (v) {
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { v.preload = 'auto'; o.disconnect(); } }, { rootMargin: '80% 0px' }).observe(v);
  });

  /* Kino: Klick macht gross und dunkel, zweiter Klick, Esc, Klick ins Dunkle oder Filmende bringen es zurück (nur transform, nativer Scroll bleibt) */
  var dunkel = doc.createElement('div'); dunkel.className = 'kinodunkel'; doc.body.appendChild(dunkel);
  var offen = null, lauf = false;
  function gross(k) {
    if (offen === k || lauf) return;
    var v = k.querySelector('video'), vor = k.getBoundingClientRect();
    var platz = doc.createElement('div'); platz.className = 'kinoplatz'; platz.style.height = vor.height + 'px'; platz.style.width = vor.width + 'px';
    k.parentNode.insertBefore(platz, k); k.__platz = platz;
    k.classList.add('kino--gross'); doc.body.classList.add('kino-offen'); dunkel.classList.add('an');
    var nach = k.getBoundingClientRect(), sx = vor.width / nach.width, sy = vor.height / nach.height;
    k.style.transformOrigin = '0 0'; k.style.transition = 'none';
    k.style.transform = 'translate(' + (vor.left - nach.left) + 'px,' + (vor.top - nach.top) + 'px) scale(' + sx + ',' + sy + ')';
    offen = k; lauf = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      k.style.transition = ruhig ? 'none' : 'transform .7s cubic-bezier(.16,1,.3,1)'; k.style.transform = 'translate(-50%,-50%)';
      setTimeout(function () { lauf = false; }, ruhig ? 0 : 720);
    }); });
    if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  function klein(k, sofort) {
    if (offen !== k) return;
    var v = k.querySelector('video'), platz = k.__platz;
    offen = null;
    if (v && !v.paused) v.pause();
    dunkel.classList.remove('an'); doc.body.classList.remove('kino-offen');
    var vor = k.getBoundingClientRect(), ziel = platz.getBoundingClientRect(), sx = ziel.width / vor.width, sy = ziel.height / vor.height;
    k.style.transition = (ruhig || sofort) ? 'none' : 'transform .6s cubic-bezier(.16,1,.3,1)';
    k.style.transform = 'translate(calc(-50% + ' + (ziel.left - vor.left) + 'px),calc(-50% + ' + (ziel.top - vor.top) + 'px)) scale(' + sx + ',' + sy + ')';
    var fertig = function () { k.style.transition = 'none'; k.style.transform = ''; k.classList.remove('kino--gross'); if (platz.parentNode) platz.parentNode.removeChild(platz); k.__platz = null; };
    if (ruhig || sofort) fertig(); else setTimeout(fertig, 620);
  }
  function zu() { if (!offen) return; var v = offen.querySelector('video'); if (v && !v.paused) v.pause(); else klein(offen); }
  doc.addEventListener('click', function (e) {
    var ziel = e.target.closest('.kino__s, .kino__play'); if (!ziel) return;
    var k = ziel.closest('.kino'), v = k && k.querySelector('video');
    if (!k || (!v && !k.classList.contains('kino--bild'))) return;
    e.preventDefault();
    if (offen === k) { zu(); return; }
    gross(k);
  });
  doc.addEventListener('pause', function (e) { var k = e.target.closest && e.target.closest('.kino'); if (k) { k.classList.remove('kino--laeuft'); if (offen === k) klein(k); } }, true);
  doc.addEventListener('ended', function (e) { var k = e.target.closest && e.target.closest('.kino'); if (k && offen === k) klein(k); }, true);
  doc.addEventListener('play', function (e) { var k = e.target.closest && e.target.closest('.kino'); if (k) k.classList.add('kino--laeuft'); }, true);
  dunkel.addEventListener('click', zu);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  addEventListener('resize', function () { if (offen && !lauf) { var k = offen; klein(k, true); gross(k); } });
})();
