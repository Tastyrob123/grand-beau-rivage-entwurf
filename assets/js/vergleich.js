/* Zimmer im Vergleich, fünfte Fassung (Robert 11.10.2026: im Stil der Seite, ruhig).
   Zwei Karten mit Pfeilen, darunter die Zimmerkarte: je Zeile eine Angabe des Hauses links und rechts.
   Zeilen ohne Angabe auf beiden Seiten fallen weg, gleiche Angaben treten zurück, Fläche und Belegung nennen den Unterschied.
   Bewegung nur über transform/opacity. */
(function () {
  var s = document.querySelector('[data-vergleich]'), q = document.getElementById('vg-daten'); if (!s || !q) return;
  var D = JSON.parse(q.textContent), wq = document.getElementById('vk-worte'), W = wq ? JSON.parse(wq.textContent) : {};
  /* Bilder liegen eine Ebene höher, wenn die Seite in /en/, /fr/ … steht (17.10.2026: Pfeile und Reihe luden dort en/assets/img/… → 404, Bild blieb leer) */
  var WURZEL = (function () { var sk = document.querySelector('script[src*="assets/js/vergleich.js"]'); return sk ? sk.getAttribute('src').split('assets/js/')[0] : ''; })();
  var wahl = { a: +s.querySelector('[data-vk-seite="a"] [data-vk-nr]').textContent - 1, b: +s.querySelector('[data-vk-seite="b"] [data-vk-nr]').textContent - 1 };
  var LEER = '<span class="vk__leer">—</span>';
  var ZEILE = {
    g: { zeig: function (z) { return z.g ? '<b>' + z.g + '</b> m²' : '<i>' + W.anfrage + '</i>'; }, zahl: function (z) { return z.g; } },
    p: { zeig: function (z) { return z.p ? '<b>' + z.p + '</b> ' + (z.p > 1 ? W.personen : W.person) : '<i>' + W.familien + '</i>'; }, zahl: function (z) { return z.p; } },
    bett: { zeig: function (z) { return z.bett || ''; } },
    balkon: { zeig: function (z) { return z.balkon === 2 ? W.ja : z.balkon === 1 ? W.teils : ''; } },
    blick: { zeig: function (z) { return z.blick || ''; } },
    bad: { zeig: function (z) { return z.bad || ''; } },
    klima: { zeig: function (z) { return z.klima ? W.ja : ''; } },
    kaffee: { zeig: function (z) { return z.kaffee ? W.ja : ''; } },
    extra: { zeig: function (z) { return z.extra || ''; } }
  };
  function unterschied(k, a, b) {
    var x = ZEILE[k].zahl(a), y = ZEILE[k].zahl(b); if (x == null || y == null) return '';
    var d = y - x; if (!d) return k === 'g' ? W.gleich_g : W.gleich_p;
    var n = Math.abs(d), seite = d > 0 ? 'b' : 'a';
    var t = k === 'g' ? n + ' ' + W.mehr_g : n + ' ' + (n > 1 ? W.personen : W.person) + ' ' + W.mehr_p;
    return '<span class="vk__pfeil vk__pfeil--' + seite + '" aria-hidden="true"></span>' + t;
  }
  function malen(geaendert) {
    var a = D[wahl.a], b = D[wahl.b];
    Object.keys(ZEILE).forEach(function (k) {
      var r = s.querySelector('[data-vk-zeile="' + k + '"]'); if (!r) return;
      var va = ZEILE[k].zeig(a), vb = ZEILE[k].zeig(b);
      r.hidden = !va && !vb;
      r.classList.toggle('gleich', va === vb);
      [['a', va], ['b', vb]].forEach(function (x) {
        var c = r.querySelector('.vk__w--' + x[0]), h = x[1] || LEER;
        if (c.innerHTML !== h) { c.innerHTML = h; if (geaendert === x[0]) { c.classList.remove('kommt'); void c.offsetWidth; c.classList.add('kommt'); } }
      });
      var em = r.querySelector('[data-vk-diff]');
      if (em) { var u = unterschied(k, a, b); if (em.innerHTML !== u) { em.innerHTML = u; if (geaendert) { em.classList.remove('kommt'); void em.offsetWidth; em.classList.add('kommt'); } } }
    });
  }
  function bild(k) {
    var z = D[wahl[k]], seite = s.querySelector('[data-vk-seite="' + k + '"]'), im = seite.querySelector('img');
    seite.querySelector('[data-vk-name]').textContent = z.n; var kn = s.querySelector('[data-vk-kname="' + k + '"]'); if (kn) kn.textContent = z.n; seite.querySelector('[data-vk-nr]').textContent = wahl[k] + 1;
    if (im.getAttribute('src').indexOf(z.bild + '-m') < 0) {
      im.style.opacity = 0;
      setTimeout(function () { im.onload = function () { im.style.opacity = 1; }; im.src = WURZEL + 'assets/img/' + z.bild + '-m.webp'; im.alt = z.alt; im.style.objectPosition = z.pos; }, 220);
    }
  }
  /* Bildreihe aller übrigen Zimmer (Robert 11.10.2026, «so wie auf der Startseite bei Am Fluss»): Antippen = das kleine Bild fährt an die Stelle
     «Im Vergleich», das bisherige Zimmer fährt in die Lücke. Fahrt wie die Restaurants (880 ms, Kurve .36,0,.1,1), nur transform.
     Die Reihe hat dasselbe Seitenverhältnis wie das grosse Bild, damit nichts verzerrt. Pfeile oben tauschen das Bild in der Reihe still mit. */
  var RK = 'cubic-bezier(.36,0,.1,1)', RD = 880, faehrt = false, gr = s.querySelector('.vk__gr'), ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mini(z) { return WURZEL + 'assets/img/' + z.bild + '-mini.webp'; }
  function flaeche(z) { return z.g ? z.g + ' m²' : W.anfrage; }
  function fuelle(btn, i) {
    var z = D[i]; btn.setAttribute('data-vk-i', i); btn.title = z.n; btn.setAttribute('aria-label', z.n + ', ' + flaeche(z));
    btn.querySelector('img').src = mini(z); btn.querySelector('.vk__gk-m').textContent = flaeche(z);
  }
  function seitenmass() {
    if (!gr) return; var g = s.querySelector('[data-vk-seite="b"] .vk__bild'); if (g && g.offsetHeight) gr.style.setProperty('--vk-ar', (g.offsetWidth / g.offsetHeight).toFixed(4));
  }
  function zeigeGross(k, i, fertig) {
    var z = D[i], seite = s.querySelector('[data-vk-seite="' + k + '"]'), im = seite.querySelector('.vk__bild img'), neu = new Image();
    neu.src = WURZEL + 'assets/img/' + z.bild + '-m.webp';
    var setz = function () { im.src = neu.src; im.alt = z.alt; im.style.objectPosition = z.pos; seite.querySelector('[data-vk-name]').textContent = z.n; seite.querySelector('[data-vk-nr]').textContent = i + 1;
      var kn = s.querySelector('[data-vk-kname="' + k + '"]'); if (kn) kn.textContent = z.n; fertig(); };
    (neu.decode ? neu.decode() : Promise.resolve()).then(setz, setz);
  }
  /* Welche Seite die Reihe füllt (Robert 11.10.2026: «nur rechts füllbar, ich muss den Vergleich selber machen können»):
     Antippen eines grossen Fotos oder seiner Pfeile macht diese Seite zum Ziel (Goldrahmen), die Reihe tauscht dann dort. Anfangs rechts. */
  var ziel = 'b';
  function zielSetzen(k) {
    ziel = k; ['a', 'b'].forEach(function (x) { s.querySelector('[data-vk-seite="' + x + '"]').classList.toggle('vk--ziel', x === k); });
  }
  ['a', 'b'].forEach(function (k) {
    var sei = s.querySelector('[data-vk-seite="' + k + '"]'), bi = sei.querySelector('.vk__bild');
    if (bi) { bi.setAttribute('data-ziel', 'Aus der Reihe wählen'); bi.setAttribute('role', 'button'); bi.setAttribute('tabindex', '0'); bi.setAttribute('aria-label', (k === 'a' ? W.ihre : W.vergl) + ': hier aus der Reihe wählen');
      bi.addEventListener('click', function () { zielSetzen(k); });
      bi.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zielSetzen(k); } }); }
    [].forEach.call(sei.querySelectorAll('[data-vk]'), function (b) { b.addEventListener('click', function () { zielSetzen(k); }); });
  });
  zielSetzen('b');
  function waehle(btn) {
    var k = ziel;
    if (faehrt) return; var i = +btn.getAttribute('data-vk-i'), alt = wahl[k]; if (i === alt) return;
    var gross = s.querySelector('[data-vk-seite="' + k + '"] .vk__bild');
    faehrt = true;
    zeigeGross(k, i, function () {
      var T = btn.getBoundingClientRect(), G = gross.getBoundingClientRect();
      wahl[k] = i; fuelle(btn, alt); malen(k);
      if (ruhig || !gross.animate) { faehrt = false; return; }
      var fahrt = function (el, von, nach, zi) {
        el.style.zIndex = zi; el.style.transformOrigin = '0 0'; el.style.position = 'relative';
        return el.animate([{ transform: 'translate(' + (von.left - nach.left).toFixed(1) + 'px,' + (von.top - nach.top).toFixed(1) + 'px) scale(' + (von.width / nach.width).toFixed(5) + ')' }, { transform: 'none' }], { duration: RD, easing: RK });
      };
      var l1 = fahrt(gross, T, G, 4); fahrt(btn, G, T, 3);
      btn.querySelector('.vk__gk-m').animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: RD + 200, easing: 'ease-out' });
      l1.onfinish = function () { [gross, btn].forEach(function (el) { el.style.zIndex = ''; el.style.transformOrigin = ''; el.style.position = ''; }); faehrt = false; };
    });
  }
  /* Pfeile: das neue Zimmer verlässt die Reihe, das alte nimmt seinen Platz ein */
  function reiheMit(alt, neu) {
    if (!gr) return; var btn = gr.querySelector('[data-vk-i="' + neu + '"]');
    if (btn) fuelle(btn, alt);
  }
  /* Tauschen-Knopf zwischen den Zimmern (Robert 11.10.2026, statt des Zeichens): Ihre Wahl und Im Vergleich wechseln die Seite,
     die zwei Fotos fahren dabei über Kreuz an ihren neuen Platz (gleiche Fahrt wie die Reihe, nur transform). */
  var tk = s.querySelector('[data-vk-tausch]');
  if (tk) tk.addEventListener('click', function () {
    if (faehrt) return; faehrt = true;
    var ga = s.querySelector('[data-vk-seite="a"] .vk__bild'), gb = s.querySelector('[data-vk-seite="b"] .vk__bild'), RA = ga.getBoundingClientRect(), RB = gb.getBoundingClientRect();
    var x = wahl.a; wahl.a = wahl.b; wahl.b = x; var fertig = 0;
    tk.animate && tk.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(180deg)' }], { duration: RD, easing: RK });
    var los = function () {
      if (++fertig < 2) return; malen('a'); malen('b');
      if (ruhig || !ga.animate) { faehrt = false; return; }
      [[ga, RB, RA], [gb, RA, RB]].forEach(function (t, n) {
        t[0].style.position = 'relative'; t[0].style.zIndex = 4 - n;
        var l = t[0].animate([{ transform: 'translate(' + (t[1].left - t[2].left).toFixed(1) + 'px,' + (t[1].top - t[2].top).toFixed(1) + 'px)' }, { transform: 'none' }], { duration: RD, easing: RK });
        l.onfinish = function () { t[0].style.position = ''; t[0].style.zIndex = ''; if (n) faehrt = false; };
      });
    };
    zeigeGross('a', wahl.a, los); zeigeGross('b', wahl.b, los);
  });
  if (gr) {
    gr.addEventListener('click', function (e) { var b = e.target.closest('.vk__gk'); if (b) waehle(b); });
    seitenmass(); window.addEventListener('resize', seitenmass); window.addEventListener('load', seitenmass);
  }
  function neu(k, i) { if (faehrt) return; var n = (i + D.length) % D.length; if (n === wahl[k]) return; var alt = wahl[k]; wahl[k] = n; reiheMit(alt, n); bild(k); malen(k); }
  ['a', 'b'].forEach(function (k) {
    var seite = s.querySelector('[data-vk-seite="' + k + '"]');
    [].forEach.call(seite.querySelectorAll('[data-vk]'), function (bt) { bt.addEventListener('click', function () { neu(k, wahl[k] + +bt.getAttribute('data-vk')); }); });
    seite.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') neu(k, wahl[k] - 1); if (e.key === 'ArrowRight') neu(k, wahl[k] + 1); });
  });
  malen(null);
})();
