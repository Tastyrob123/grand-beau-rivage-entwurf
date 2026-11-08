/* Feiern & Tagen, neue Abschnitte (Robert 11.10.2026): Tagungsrechner als Bühne und Anfrage. Bau: feiern_neu.py.
   Gerechnet wird weiter in dienste.js (form[data-tagung]); hier nur, was man sieht: Raumfoto wechselt über Deckkraft,
   Summe zählt hoch, Personen gross, Tage mit Plus und Minus, Schalter Ganztag/Halbtag. Bewegung nur über transform und opacity. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chf = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '’'); };

  $$('form[data-trform]').forEach(function (f) {
    var R = {}; try { R = JSON.parse(f.getAttribute('data-raeume')); } catch (e) {}
    var el = f.elements, summe = $('[data-summe]', f), saal = $('[data-saal]', f), zeigS = $('[data-trsumme]', f), zeigP = $('[data-trpers]', f), zeigT = $('[data-trtage]', f),
        zeigR = $('[data-trraum]', f), zeigL = $('[data-trlage]', f), art = $('.tr__art', f), fotos = $$('.tr__f', f), ist = 0, uhr = 0, sichtbar = ruhig || !('IntersectionObserver' in window);
    var anzeigen = function (ziel) {
      if (ruhig) { zeigS.textContent = chf(ziel); ist = ziel; return; }
      var von = ist, t0 = performance.now(); cancelAnimationFrame(uhr);
      var schritt = function (t) { var p = Math.min(1, (t - t0) / 700), k = 1 - Math.pow(1 - p, 3); zeigS.textContent = chf(von + (ziel - von) * k); if (p < 1) uhr = requestAnimationFrame(schritt); else ist = ziel; };
      uhr = requestAnimationFrame(schritt);
    };
    /* Passender Raum: der kleinste, der alle fasst (dieselbe Regel wie in dienste.js). Name und Lage stehen als Text in der Seite (.tr__texte),
       damit sie auf den Sprachseiten übersetzt sind; vorher wurde über den deutschen Namen gesucht, in den Sprachen stand immer «Mehrere Räume» (12.10.2026). */
    var raum = function () {
      var p = +el.pers.value || 1, n = Object.keys(R).filter(function (k) { return R[k].max >= p; }).sort(function (a, b) { return R[a].max - R[b].max; })[0] || '';
      var t = $$('.tr__texte i', f).filter(function (i) { return i.getAttribute('data-raum') === n; })[0], tb = t && $('b', t), ts = t && $('small', t);
      if (tb) zeigR.textContent = tb.textContent;
      zeigL.textContent = ts ? ts.textContent : (saal ? saal.textContent : '');
      if (!n) n = 'Ballsaal La Belle Epoque';
      fotos.forEach(function (s) { var an = s.getAttribute('data-raum') === n; if (an) { var im = $('img', s); if (im) im.loading = 'eager'; } s.classList.toggle('ist', an); });
    };
    var neu = function () {
      var p = +el.pers.value || 1; zeigP.textContent = p; zeigT.textContent = el.tage.value;
      el.pers.style.setProperty('--p', ((p - el.pers.min) / (el.pers.max - el.pers.min) * 100).toFixed(1) + '%');
      var z = +String(summe.textContent).replace(/[^\d]/g, ''); if (z && sichtbar) anzeigen(z);
      raum();
    };
    /* dienste.js schreibt Summe und Raum, sobald gerechnet ist: danach zeigen */
    if ('MutationObserver' in window) new MutationObserver(neu).observe(summe, { childList: true, characterData: true, subtree: true });
    f.addEventListener('input', function () { setTimeout(neu, 0); });
    $$('[data-tage]', f).forEach(function (b) {
      b.addEventListener('click', function () {
        el.tage.value = Math.max(1, Math.min(10, (+el.tage.value || 1) + (+b.getAttribute('data-tage'))));
        f.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    $$('[data-pauschale]', f).forEach(function (b) { b.addEventListener('click', function () { art.setAttribute('data-art', b.getAttribute('data-pauschale')); setTimeout(neu, 0); }); });
    /* Summe zählt erst hoch, wenn der Rechner ins Bild kommt */
    if ('IntersectionObserver' in window && !ruhig) {
      zeigS.textContent = '0';
      var io = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; io.disconnect(); sichtbar = true; ist = 0; neu(); }, { rootMargin: '0px 0px -20% 0px' });
      io.observe(zeigS);
    } else setTimeout(neu, 0);
  });

  /* Raumfotos lange vorher holen und entpacken, damit der Wechsel beim Scrollen nicht stockt */
  if ('IntersectionObserver' in window) {
    var vor = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; vor.unobserve(e.target);
      $$('img', e.target).forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); }); }); }, { rootMargin: '0px 0px 150% 0px' });
    $$('.tr__fotos, .fm2__b, .anf__bild').forEach(function (x) { vor.observe(x); });
  }

  /* «Hochzeit anfragen»: Anlass im Anfrageformular vorwählen */
  $$('[data-anlass]').forEach(function (a) {
    a.addEventListener('click', function () {
      var s = $('#anfrage select[data-name="Anlass"]'); if (!s) return;
      [].forEach.call(s.options, function (o) { if (o.text === a.getAttribute('data-anlass')) s.value = o.value; });
    });
  });
})();
