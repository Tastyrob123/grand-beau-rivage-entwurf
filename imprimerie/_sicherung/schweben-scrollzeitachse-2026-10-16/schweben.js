/* Kopie von Grand Beau-Rivage/website/studio/schweben.js (16.10.2026), für L’Imprimerie des Hauses. Bei Änderungen dort hier nachziehen. */
/* Schweben für die Werkzeuge (Gefühl der Carlton-Seiten, wie in Le Registre). Gehört zu schweben.css.
   Einbinden am Ende der Seite: <script src="../studio/schweben.js" data-wurzel="#ansicht" data-blaetter="…" data-kacheln="…" data-zeilen="…" data-zahlen="…"></script>
   blaetter: einzelne Blätter, kacheln: Reihen von Kacheln (Staffel), zeilen: viele gleiche Zeilen (nur einblenden), zahlen: grosse Zahlen (Zoom).
   Tut etwas nur kurz nach dem Laden und nach einem Klick (Ansichtswechsel); alles, was beim Tippen oder Neuzeichnen später dazukommt, steht sofort ruhig da. */
(function () {
  'use strict';
  var me = document.currentScript, d = me ? me.dataset : {};
  var wurzel = d.wurzel || 'body';
  var B = d.blaetter || '', K = d.kacheln || '', Z = d.zeilen || '', N = d.zahlen || '';
  var ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches, hat = 'IntersectionObserver' in window;
  var offen = performance.now() + 2500, io = null, plan = 0, erst = false;
  function arm() { offen = performance.now() + 1500; }
  ['click', 'keydown', 'hashchange', 'popstate'].forEach(function (e) { addEventListener(e, function (ev) { if (e !== 'keydown' || ev.key === 'Enter') arm(); }, true); });
  function tag(el, art, i) {
    if (el.hasAttribute('data-sw') || el.hasAttribute('data-swz')) return null;
    el.setAttribute(art === 'n' ? 'data-swz' : 'data-sw', art === 'z' ? 'z' : '1');
    el.style.setProperty('--i', i || 0);
    return el;
  }
  function lauf() {
    plan = 0;
    var jetzt = performance.now() <= offen || !erst, neu = [];
    var nimm = function (sel, art, reihe) {
      if (!sel) return;
      document.querySelectorAll(sel).forEach(function (x) {
        if (x.hasAttribute('data-sw') || x.hasAttribute('data-swz')) return;
        var t = tag(x, art, reihe ? Math.min(Array.prototype.indexOf.call(x.parentNode.children, x), 8) : 0);
        if (t) neu.push(t);
      });
    };
    nimm(B, '1', false); nimm(K, '1', true); nimm(Z, 'z', true); nimm(N, 'n', true);
    if (!neu.length) return;
    if (!erst) { erst = true; offen = performance.now() + 1500; }
    if (ruhig || !hat || !jetzt) { neu.forEach(function (x) { x.classList.add('sw-da'); if (!ruhig) x.classList.add('sw-ruhig'); }); return; }
    if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('sw-da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    neu.forEach(function (x) { io.observe(x); });
  }
  function plane() { if (!plan) plan = requestAnimationFrame(lauf); }
  function los() {
    var w = document.querySelector(wurzel) || document.body;
    new MutationObserver(plane).observe(w, { childList: true, subtree: true });
    lauf();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
