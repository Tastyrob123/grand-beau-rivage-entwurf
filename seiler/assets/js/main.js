/* Hotel Seiler au Lac — ein Takt (Grundlage: Grand Beau-Rivage, dazu die eigenen Module des Seiler am Ende), nativer Scroll, Bewegung nur über transform/opacity (Bausteine nach dem Referenzbau Salt & Silver) */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  /* Sprache der Seite (de, en, fr): Sätze, die das Skript selbst schreibt, und der Weg zu den Bildern aus en/ und fr/ */
  var SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../';
  var W = {
    de: { lupe: 'Bild in gross', zu: 'Schliessen', vor: 'Vorheriges Bild', nach: 'Nächstes Bild',
      saal1: 'Ein Raum ist gross genug. Am genauesten passt: ', saalN: ' Räume sind gross genug. Am genauesten passt: ', saalE: 'Dafür ist ein Raum gross genug: ',
      bleibt1: 'Es bleibt', bleibtN: 'Es bleiben', von: ' von ', keine: 'Diese Mischung gibt es im Haus nicht. <i>Einen Wunsch weniger</i>, und es passt wieder.' },
    en: { lupe: 'Enlarged picture', zu: 'Close', vor: 'Previous picture', nach: 'Next picture',
      saal1: 'One room is large enough. The closest fit: ', saalN: ' rooms are large enough. The closest fit: ', saalE: 'One room is large enough for this: ',
      bleibt1: 'That leaves', bleibtN: 'That leaves', von: ' of ', keine: 'The house does not have this combination. <i>One wish fewer</i>, and it fits again.' },
    fr: { lupe: 'Image agrandie', zu: 'Fermer', vor: 'Image précédente', nach: 'Image suivante',
      saal1: 'Une salle est assez grande. La plus adaptée\u00a0: ', saalN: ' salles sont assez grandes. La plus adaptée\u00a0: ', saalE: 'Une salle est assez grande pour cela\u00a0: ',
      bleibt1: 'Il reste', bleibtN: 'Il reste', von: ' sur ', keine: 'Cette combinaison n’existe pas dans la maison. <i>Un souhait de moins</i>, et cela convient à nouveau.' }
  }[SP] || {};
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  try { sessionStorage.setItem('sal-da', '1'); } catch (e) {}

  /* ---------- Einblenden ---------- */
  var ziele = $$('[data-r]');
  if (ruhig || !('IntersectionObserver' in window)) {
    ziele.forEach(function (el) { el.classList.add('da'); });
    $$('.z').forEach(function (el) { el.classList.add('da'); });
  } else {
    /* Bilder erst zeigen, wenn sie geladen und entpackt sind – sonst blitzen sie beim Einblenden auf */
    var wennBereit = function (el, dann) {
      var offen = $$('img', el).filter(function (im) { return im.offsetParent !== null; }), n = offen.length, los = false;
      var fertig = function () { if (los) return; los = true; dann(); };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      offen.forEach(function (im) {
        var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth) return entpackt();
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 120);   /* höchstens kurz warten: die Bilder sind vorgeladen (unten), Robert 11.10.2026: «nicht warten, direkt rein» */
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0 });   /* startet im Fenster (wie Salt & Silver, Robert 11.10.2026): man sieht es aufsteigen, statt dass es unter dem Rand schon vorbei ist */
    /* Knopfreihen (Robert 11.10.2026): immer sichtbar, schweben ohne Verzögerung an ihren Platz, sobald sie unten ins Fenster kommen */
    var kio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); kio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0 });
    /* grosse Bilder kommen früher: sobald die Oberkante unten ins Fenster rückt */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, { rootMargin: '0px 0px 2% 0px', threshold: 0 });
    /* Bilderwand (Startseite «Bad», Robert 11.10.2026: «Erscheinen der Bilder wie auf der Salt-&-Silver-Karte»): jedes Bild blendet erst auf,
       wenn es gut im Bild ist, und steigt dabei sacht hoch; in einer Reihe nacheinander von links (Staffel aus --i im CSS) */
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { mio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, { rootMargin: '0px 0px 4% 0px', threshold: 0 });   /* Robert 11.10.2026: untere Reihen «ploppen später auf» — jetzt beim Erreichen des Rands, im Fluss */
    /* Bilder der Wand lange vorher holen und entpacken, damit beim Erscheinen nichts mehr wartet */
    var mvor = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; mvor.unobserve(e.target); $$('img', e.target).forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); }); });
    }, { rootMargin: '0px 0px 150% 0px', threshold: 0 });
    $$('.wand').forEach(function (w) { mvor.observe(w); });
    /* alle Bilder, die beim Scrollen hereinfahren, anderthalb Bildschirme vorher holen und entpacken: beim Erscheinen wartet nichts mehr */
    $$('[data-r] img, [data-gruppe] img, .drei img').forEach(function (im) { if (!im.closest('.wand')) mvor.observe(im.closest('[data-r]') || im); });
    /* Fenster: der Satz steht fest in der Bildschirmmitte, der Ausschnitt wandert darüber. Der Satz startet erst,
       wenn die Oberkante des Ausschnitts ihn zu einem Drittel freigegeben hat. */
    $$('.bruch').forEach(function (b) {
      var t = $('.in', b), fio = null; if (!t) return;   /* Schlussleiste auf dem Bild (.bruch.ausklang) hat keinen festen Satz */
      var lausche = function () {
        if (fio) fio.disconnect();
        var r = t.getBoundingClientRect(), linie = r.top + r.height * 0.68;
        fio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            fio.disconnect(); fio = null; window.removeEventListener('resize', lausche);
            $$('[data-r]', b).forEach(function (k) { k.classList.add('da'); });
          });
        }, { rootMargin: '0px 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
        fio.observe(b);
      };
      lausche();
      window.addEventListener('resize', lausche, { passive: true });
    });
    /* Gruppen, deren Bilder gemeinsam starten und nacheinander aufsteigen (Dreiklang, Reihen) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        dio.unobserve(e.target);
        /* nacheinander starten (nicht alle im selben Augenblick): so verteilt sich das Zeichnen der Karten auf mehrere Bilder */
        /* alle gemeinsam und sofort (Robert 11.10.2026: «nicht nacheinander hochploppen, direkt flüssig rein») */
        wennBereit(e.target, function () { $$('[data-r]', e.target).forEach(function (k) { k.style.transitionDelay = '0s'; k.classList.add('da'); }); });
      });
    }, { rootMargin: '0px 0px 4% 0px', threshold: 0 });
    $$('.drei,[data-gruppe]').forEach(function (d) { dio.observe(d); });
    ziele.forEach(function (el) {
      if (el.closest('.hero')) { requestAnimationFrame(function () { el.classList.add('da'); }); }
      else if (!(el.closest('.bruch') && !el.closest('.ausklang')) && !el.closest('.drei') && !el.closest('[data-gruppe]')) {
        var art = el.getAttribute('data-r');
        if (art === 'mauer') mio.observe(el); else if (art === 'bild' || art === 'schweb') bio.observe(el); else if (el.classList.contains('kn-reihe')) kio.observe(el); else io.observe(el);
      }
    });
  }

  /* ---------- Während gescrollt wird, reagieren die Zimmerfotos nicht auf die Maus (sonst hebt sich jedes Foto, das unter dem stehenden Zeiger durchläuft) ---------- */
  if (document.querySelector('.gz__b')) {
    var rollZeit = 0, rollt = false, rollAus = function () { rollt = false; document.documentElement.classList.remove('rollt'); };
    window.addEventListener('scroll', function () { if (!rollt) { rollt = true; document.documentElement.classList.add('rollt'); } clearTimeout(rollZeit); rollZeit = setTimeout(rollAus, 180); }, { passive: true });
  }

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  var zuege = $$('[data-laufband]');
  if (zuege.length && !ruhig && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '80px 0px' });
    zuege.forEach(function (z) { lio.observe(z); });
  }

  /* ---------- Grosse Zahlen: hochzählen, sobald sie im Bild sind ---------- */
  var zahlen = $$('[data-zahl]');
  if (zahlen.length && !ruhig && 'IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        zio.unobserve(e.target);
        var el = e.target, roh = el.getAttribute('data-zahl'), ziel = +roh, komma = (roh.split('.')[1] || '').length, nach = el.getAttribute('data-nach') || '';
        var gross = ziel > 5000, von = gross ? 0 : (ziel > 1000 ? ziel - 24 : 0), t0 = null, dauer = ziel > 1000 ? 2100 : 1500;
        var tsd = function (s) { return gross ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '’') : s; };
        if (ziel <= 3) return;
        var tLetzt = 0;
        function schritt(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4);
          if (p < 1 && t - tLetzt < 45) { requestAnimationFrame(schritt); return; }   /* höchstens alle 45 ms neu schreiben: der Zähler kostet beim Scrollen kein Bild (Seiler 11.10.2026) */
          tLetzt = t;
          el.textContent = tsd((von + (ziel - von) * w).toFixed(komma)) + nach;
          if (p < 1) requestAnimationFrame(schritt);
        }
        el.textContent = tsd(von.toFixed(komma)) + nach;
        setTimeout(function () { requestAnimationFrame(schritt); }, 250);
      });
    }, { threshold: 0.3 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  /* ---------- Bad als Ritual (Robert 11.10.2026): der Moment in der Bildschirmmitte leuchtet auf, das Bild links blendet zum passenden Foto ---------- */
  $$('[data-ritual]').forEach(function (r) {
    var mm = $$('.ritual__m', r), bb = $$('.ritual__buehne img', r), zg = $('.ritual__zeiger', r), akt = 0;
    if (zg) zg.style.setProperty('--n', mm.length);
    var setze = function (n) {
      if (n === akt) return; akt = n;
      mm.forEach(function (m, i) { m.classList.toggle('an', i === n); });
      bb.forEach(function (b, i) { b.classList.toggle('an', i === n); });
      if (zg) zg.style.setProperty('--zn', n);
    };
    bb.forEach(function (b) { b.loading = 'eager'; });
    if (!('IntersectionObserver' in window)) return;
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setze(+e.target.getAttribute('data-n')); });
    }, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
    mm.forEach(function (m) { rio.observe(m); });
  });

  /* ---------- Restaurants: kleines Bild antippen = es fährt an die Stelle des grossen, das grosse in die Reihe (Robert 11.10.2026,
     Fahrt wie die Anlass-Karten beim Carlton: 880 ms, Kurve .36,0,.1,1, nur transform; beide Bilder 4:3, also unverzerrt) ---------- */
  var RK = 'cubic-bezier(.36,0,.1,1)', RD = 880;
  $$('[data-tausch]').forEach(function (reihe) {
    var buehne = reihe.parentNode, faehrt = false;
    var bereit = function () { $$('.foto', reihe).forEach(function (f) { f.style.cursor = 'pointer'; f.setAttribute('role', 'button'); f.setAttribute('tabindex', '0'); });
      var g = buehne.querySelector(':scope > .foto'); if (g) { g.style.cursor = ''; g.removeAttribute('role'); g.removeAttribute('tabindex'); } };
    bereit();
    var tausche = function (klein) {
      var gross = buehne.querySelector(':scope > .foto'); if (!gross || faehrt) return;
      if (ruhig || !klein.animate) { var p0 = klein.nextSibling; buehne.replaceChild(klein, gross); reihe.insertBefore(gross, p0); bereit(); return; }
      faehrt = true;
      var a = gross.getBoundingClientRect(), b = klein.getBoundingClientRect(), naechst = klein.nextSibling;
      buehne.replaceChild(klein, gross); reihe.insertBefore(gross, naechst);
      var A = klein.getBoundingClientRect(), B = gross.getBoundingClientRect();
      var fahrt = function (el, von, nach, z) {
        el.style.zIndex = z; el.style.transformOrigin = '0 0';
        return el.animate([{ transform: 'translate(' + (von.left - nach.left).toFixed(1) + 'px,' + (von.top - nach.top).toFixed(1) + 'px) scale(' + (von.width / nach.width).toFixed(5) + ')' }, { transform: 'none' }], { duration: RD, easing: RK });
      };
      var l1 = fahrt(klein, b, A, 3), l2 = fahrt(gross, a, B, 2);
      [klein, gross].forEach(function (f) { var c = $('figcaption', f); if (c) c.animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: RD + 200, easing: 'ease-out' }); });
      l1.onfinish = function () { [klein, gross].forEach(function (f) { f.style.zIndex = ''; f.style.transformOrigin = ''; }); faehrt = false; bereit(); };
    };
    reihe.addEventListener('click', function (e) { var f = e.target.closest('.foto'); if (f && reihe.contains(f)) tausche(f); });
    reihe.addEventListener('keydown', function (e) { var f = e.target.closest('.foto'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tausche(f); } });
  });

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    $$('.menue a,.menue button').forEach(function (a) { a.addEventListener('click', function () { doc.classList.remove('offen'); document.body.style.overflow = ''; }); });
  }

  /* Hinweis für Gäste (Carlton Control): Leiste und Eck-Knöpfe rücken um die Höhe des Streifens nach unten */
  var band = $('.hinweisband');
  if (band && !band.hidden) { var bandMass = function () { doc.style.setProperty('--band', band.offsetHeight + 'px'); }; bandMass(); addEventListener('resize', bandMass); }

  /* ---------- Buchen: Fenster mit Datum und Gästen. Die Angaben gehen mit ins Buchungssystem des Hauses ---------- */
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var dlg = $('dialog.buchen');
  if (dlg && dlg.showModal) {
    var f = $('form', dlg), an = f.elements.an, ab = f.elements.ab, heute = new Date();
    an.min = iso(heute); an.value = iso(heute); ab.min = iso(new Date(heute.getTime() + 864e5)); ab.value = iso(new Date(heute.getTime() + 2 * 864e5));
    an.addEventListener('change', function () { var t = new Date(an.value); if (isNaN(t)) return; var n = new Date(t.getTime() + 864e5); ab.min = iso(n); if (ab.value <= an.value) ab.value = iso(n); });
    $$('[data-buchen]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        doc.classList.remove('offen'); document.body.style.overflow = '';
        f.dataset.ziel = b.getAttribute('data-buchen') || '';
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('.zu', dlg).addEventListener('click', function () { dlg.close(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = []; for (var i = 0; i < +f.elements.gaeste.value; i++) g.push('A');
      var basis = f.dataset.ziel || doc.getAttribute('data-buchung') || 'https://www.simplebooking.it/ibe2/hotel/9477';
      window.open(basis + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
      dlg.close();
    });
  }
  /* Buchungsleiste auf der Seite: dieselbe Übergabe wie im Fenster */
  $$('form[data-leiste]').forEach(function (f) {
    var an = f.elements.an, ab = f.elements.ab, heute = new Date();
    an.min = iso(heute); an.value = iso(heute); ab.min = iso(new Date(heute.getTime() + 864e5)); ab.value = iso(new Date(heute.getTime() + 2 * 864e5));
    an.addEventListener('change', function () { var t = new Date(an.value); if (isNaN(t)) return; var n = new Date(t.getTime() + 864e5); ab.min = iso(n); if (ab.value <= an.value) ab.value = iso(n); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = []; for (var i = 0; i < +f.elements.gaeste.value; i++) g.push('A');
      window.open((doc.getAttribute('data-buchung') || 'https://www.simplebooking.it/ibe2/hotel/9477') + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
    });
  });
  /* Ein Zimmer einzeln aufgemacht: Bühne mit Fotos, Daumenreihe, Pfeile und Pfeiltasten */
  $$('dialog.zb').forEach(function (d) {
    var bi = $$('.zb__bilder img', d), da = $$('.zb__daumen button', d), leg = $('[data-leg].kerbe', d), n = 0;
    var zeig = function (i) {
      n = (i + bi.length) % bi.length;
      bi.forEach(function (b, j) { b.classList.toggle('an', j === n); });
      da.forEach(function (b, j) { b.setAttribute('aria-pressed', j === n); });
      if (leg) leg.textContent = bi[n].getAttribute('data-leg') || '';
    };
    $$('[data-zb]', d).forEach(function (b) { b.addEventListener('click', function () { zeig(n + (+b.getAttribute('data-zb'))); }); });
    da.forEach(function (b, j) { b.addEventListener('click', function () { zeig(j); }); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $('.zu', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') zeig(n + 1); else if (e.key === 'ArrowLeft') zeig(n - 1); });
    d.addEventListener('close', function () { document.body.style.overflow = ''; });
    zeig(0); d._zeig = zeig; d._bilder = bi;
  });
  $$('[data-zimmer]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var d = document.getElementById('zb-' + a.getAttribute('data-zimmer'));
      if (d && d.showModal) {
        e.preventDefault(); var k = a.getAttribute('data-foto');
        if (k && d._bilder) for (var i = 0; i < d._bilder.length; i++) if (d._bilder[i].getAttribute('src').indexOf('/' + k + '-') > -1) { d._zeig(i); break; }
        d.showModal(); document.body.style.overflow = 'hidden';
      }
    });
    if (a.getAttribute('role') === 'button') a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); } });
  });
  /* Anfragen (Bankett, Gutschein, Kontakt): öffnen das Mailprogramm mit den Angaben */
  /* Formulare: öffnen das Mailprogramm des Gastes. Hat das Haus in Carlton Control den Eingang eingeschaltet (data-formulare="eingang"),
     geht die Nachricht stattdessen an /control/api/formular und liegt im Eingang von Carlton Control; scheitert das, öffnet sich wieder die Mail. */
  var MAILAN = (function () { var a = $('.fuss__unten a[href^="mailto:"]'); return a ? a.getAttribute('href').slice(7) : 'info@grandbeaurivage.ch'; })();
  var DANKE = { de: 'Vielen Dank, Ihre Nachricht ist bei uns angekommen.', en: 'Thank you, your message has reached us.', fr: 'Merci, votre message nous est bien parvenu.' };
  $$('form[data-post]').forEach(function (fo) {
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [], felder = {};
      $$('input,select,textarea', fo).forEach(function (x) { if (x.value && x.dataset.name) { z.push(x.dataset.name + ': ' + x.value); felder[x.dataset.name] = x.value; } });
      var mail = function () { location.href = 'mailto:' + (fo.dataset.an || MAILAN) + '?subject=' + encodeURIComponent(fo.dataset.post) + '&body=' + encodeURIComponent(z.join('\n')); };
      if (doc.getAttribute('data-formulare') !== 'eingang' || !window.fetch || !fo.dataset.formular) { mail(); return; }
      var fd = new FormData(); Object.keys(felder).forEach(function (k) { fd.append(k, felder[k]); }); fd.append('betreff', fo.dataset.post);
      var kn = $('button[type=submit]', fo); if (kn) kn.disabled = true;
      fetch(WURZEL + 'control/api/formular?f=' + encodeURIComponent(fo.dataset.formular) + '&seite=' + encodeURIComponent(location.pathname), { method: 'POST', body: fd })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () { fo.reset(); var d = doc.createElement('p'); d.className = 'lauf formular__danke'; d.setAttribute('role', 'status'); d.textContent = DANKE[SP] || DANKE.de; fo.appendChild(d); if (kn) kn.disabled = false; })
        .catch(function () { if (kn) kn.disabled = false; mail(); });
    });
  });

  /* ---------- Reiter: eine Bühne wechselt mit dem Reiter (Text über hidden, Bilder über Deckkraft) ---------- */
  /* «Wie viel Zeit haben Sie?»: die gewählte Karte wird gross und rutscht nach unten, die anderen werden klein.
     Den Übergang rechnet der Browser (View Transitions); ohne diese Technik wechselt die Ansicht ohne Fahrt. */
  $$('[data-zs]').forEach(function (zs) {
    var ks = $$('.zs__k', zs), text = $('.zs__text', zs), felder = $$('[data-feld]', text), zu = $('.zs__zu', zs), offen = -1;
    function setze(i) {
      offen = i; zs.classList.toggle('zs--offen', i >= 0);
      ks.forEach(function (k, j) {
        k.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      felder.forEach(function (f, j) { f.hidden = j !== i; });
      text.hidden = zu.hidden = i < 0;
    }
    /* wohin die Seite fahren muss, damit die offene Ansicht ganz im Fenster steht (null: sie steht schon richtig) */
    function sichtZiel() {
      var r = zs.getBoundingClientRect(), h = window.innerHeight;
      if (r.top >= 96 && r.bottom <= h - 12) return null;
      var y = Math.max(0, r.top + window.pageYOffset - (r.height > h - 130 ? 104 : (h - r.height) / 2));
      return Math.min(y, Math.max(0, document.documentElement.scrollHeight - h));
    }
    function inSicht() { var y = sichtZiel(); if (y !== null) window.scrollTo(0, y); }
    /* Wechsel ohne Wartezeit: Lage vorher messen, Anordnung sofort umstellen, Lage nachher messen und jede Karte samt Bild
       über transform von der alten zur neuen Lage fahren lassen. Nichts wird eingefroren, der Klick wirkt sofort.
       Das Bild bleibt dabei unverzerrt: Rahmen, Bildfeld und Foto bekommen je ihre eigene, aufeinander abgestimmte Fahrt. */
    var DAUER = 880, SCHRITTE = 44, lauf = [], geist = null;
    /* der Name jeder Karte bekommt eine eigene Hülle: so kann die Schrift während der Fahrt unverzerrt von der alten zur neuen Grösse wachsen */
    ks.forEach(function (k) { var nm = $('.zs__n', k); if (!nm || $('.zs__nt', nm)) return; var sp = document.createElement('span'); sp.className = 'zs__nt'; while (nm.firstChild) sp.appendChild(nm.firstChild); nm.appendChild(sp); });
    var schrift = function (k) { return parseFloat(getComputedStyle($('.zs__n', k)).fontSize) || 16; };
    var lage = function (e) { var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    var misch = function (a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t }; };
    var fuell = function (b, a) { var w = Math.max(b.w, b.h * a), h = w / a; return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w: w, h: h }; };
    /* weiche Fahrt: läuft sanft an und kommt lang und ruhig an (Kurve wie cubic-bezier(.36,0,.1,1)); vorher sprang die Karte
       in den ersten 100 ms schon die halbe Strecke */
    var kurve = function (x1, y1, x2, y2) { return function (t) { var a = 0, b = 1, s = t, i, x; for (i = 0; i < 24; i++) { s = (a + b) / 2; x = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s; if (x < t) a = s; else b = s; } return 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s; }; };
    var weich = kurve(0.36, 0, 0.1, 1);
    /* transform, das ein Stück (Endlage L) an die Lage R bringt, wenn sein Träger (Endlage PL) gerade bei PR steht */
    var bezug = function (R, L, PR, PL) {
      var sx = PR.w / PL.w, sy = PR.h / PL.h;
      return 'translate(' + ((R.x - (PR.x + (L.x - PL.x) * sx)) / sx).toFixed(2) + 'px,' + ((R.y - (PR.y + (L.y - PL.y) * sy)) / sy).toFixed(2) + 'px) scale(' + (R.w / (L.w * sx)).toFixed(5) + ',' + (R.h / (L.h * sy)).toFixed(5) + ')';
    };
    /* Abschnitt, in dem die Karten stehen: er wird beim Öffnen höher. Damit nichts springt, gleitet alles darunter im Takt der Karten
       an seinen neuen Platz (nur transform), und die Seite fährt im selben Takt mit, egal auf welcher Scrollhöhe geklickt wird. */
    var sec = zs.closest('section') || zs.parentElement, rollt = 0, flick = null;
    var gleite = function (von, weg, uhr) {
      var nr = ++rollt, t0 = performance.now(), halt = function () { if (nr === rollt) rollt++; };
      ['wheel', 'touchstart', 'keydown'].forEach(function (n) { window.addEventListener(n, halt, { passive: true, once: true }); });
      (function f() {
        if (nr !== rollt) return;
        var z = uhr ? uhr.currentTime : performance.now() - t0;
        if (z === null || z === undefined) { window.scrollTo(0, von + weg); return; }
        var p = Math.max(0, Math.min(1, z / DAUER));
        window.scrollTo(0, von + weg * weich(p));
        if (p < 1) requestAnimationFrame(f);
      })();
    };
    var raeume = function () { if (flick) { flick.remove(); flick = null; } lauf.forEach(function (a) { try { a.cancel(); } catch (e) {} }); lauf = []; ks.forEach(function (k) { var b = $('.zs__b', k), im = $('img', k); k.style.transformOrigin = b.style.transformOrigin = $('.zs__n', k).style.transformOrigin = ''; if (im) im.style.cssText = im.dataset.st || ''; }); };
    function wechsle(i) {
      if (i === offen) { if (i < 0) return; i = -1; }
      zs.classList.add('zs--bereit'); ks.forEach(function (k) { k.classList.add('da'); });
      if (ruhig || !zs.animate) { setze(i); if (i >= 0) inSicht(); return; }
      rollt++; raeume();
      var h0 = sec.getBoundingClientRect().height;
      var vor = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)), n: lage($('.zs__n', k)), f: schrift(k) }; });
      /* der bisherige Text bleibt als Abzug stehen und blendet weich aus, statt mit dem Klick zu verschwinden */
      if (geist) { geist.remove(); geist = null; }
      if (!text.hidden) {
        var tr = text.getBoundingClientRect(), zr = zs.getBoundingClientRect(), g = text.cloneNode(true);
        g.setAttribute('aria-hidden', 'true'); g.classList.add('zs__geist');
        g.style.cssText = 'display:block;position:absolute;grid-column:auto;grid-row:auto;box-sizing:border-box;margin:0;pointer-events:none;z-index:2;left:' + (tr.left - zr.left).toFixed(1) + 'px;top:' + (tr.top - zr.top).toFixed(1) + 'px;width:' + tr.width.toFixed(1) + 'px';
        zs.appendChild(g); geist = g;
        g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { g.remove(); if (geist === g) geist = null; };
      }
      /* Ziellage ohne Anheben unter der Maus messen und das Anheben während der Fahrt abstellen: sonst endet die Fahrt
         ein paar Pixel neben der wahren Lage und die Karte rastet danach sichtbar ein */
      zs.classList.add('zs--faehrt'); setze(i);
      var nach = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)), n: lage($('.zs__n', k)), f: schrift(k) }; }), zeit = { duration: DAUER, easing: 'linear' };
      ks.forEach(function (k, j) {
        var b = $('.zs__b', k), im = $('img', k), F = vor[j], L = nach[j], a = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1.5;
        if (Math.abs(F.k.x - L.k.x) < 1 && Math.abs(F.k.y - L.k.y) < 1 && Math.abs(F.k.w - L.k.w) < 1 && Math.abs(F.k.h - L.k.h) < 1) return;
        /* das Foto für die Fahrt als ganzes Bild ins Feld legen (sieht in Ruhe gleich aus wie vorher), damit es beim Wachsen nichts nachschneiden muss */
        var CL = fuell(L.b, a);
        if (im) { if (im.dataset.st === undefined) im.dataset.st = im.style.cssText; im.style.cssText += ';inset:auto;left:' + (CL.x - L.b.x).toFixed(2) + 'px;top:' + (CL.y - L.b.y).toFixed(2) + 'px;width:' + CL.w.toFixed(2) + 'px;height:' + CL.h.toFixed(2) + 'px;max-width:none;object-fit:fill;transform-origin:0 0;transition:none'; }
        var nm = $('.zs__n', k), gleich = Math.abs(F.k.w - L.k.w) < 1 && Math.abs(F.k.h - L.k.h) < 1;
        k.style.transformOrigin = b.style.transformOrigin = nm.style.transformOrigin = '0 0';
        var fk = [], fb = [], fi = [], fn = [], ft = [], nt = $('.zs__nt', nm), u0 = F.f / L.f;
        for (var n = 0; n <= SCHRITTE; n++) {
          var t = weich(n / SCHRITTE), Rk = misch(F.k, L.k, t), Rb = misch(F.b, L.b, t);
          fk.push({ transform: 'translate(' + (Rk.x - L.k.x).toFixed(2) + 'px,' + (Rk.y - L.k.y).toFixed(2) + 'px) scale(' + (Rk.w / L.k.w).toFixed(5) + ',' + (Rk.h / L.k.h).toFixed(5) + ')' });
          fb.push({ transform: bezug(Rb, L.b, Rk, L.k) });
          fi.push({ transform: bezug(fuell(Rb, a), CL, Rb, L.b) });
          var Rn = misch(F.n, L.n, t), u = u0 + (1 - u0) * t;
          fn.push({ transform: bezug(Rn, L.n, Rk, L.k) });
          ft.push({ transform: 'scale(' + (u * L.n.w / Rn.w).toFixed(5) + ',' + (u * L.n.h / Rn.h).toFixed(5) + ')' });
        }
        lauf.push(k.animate(fk, zeit), b.animate(fb, zeit)); if (im) lauf.push(im.animate(fi, zeit));
        /* das Namensfeld fährt als Feld mit, die Schrift darin bleibt unverzerrt und wächst gleichmässig von der alten zur neuen Grösse (nichts blendet aus) */
        if (!gleich) { lauf.push(nm.animate(fn, zeit)); if (nt) lauf.push(nt.animate(ft, zeit)); }
        k.style.zIndex = j === i ? 3 : 1;
      });
      if (i >= 0) {
        lauf.push(text.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 300, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
        lauf.push(zu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 520, fill: 'backwards' }));
      }
      var meins = lauf, ende = function () {
        if (lauf !== meins) return; raeume(); zs.classList.remove('zs--faehrt');
        /* die Bilder liegen von Anfang an in der grossen Datei vor (sizes im Markup): nach der Fahrt wird nichts getauscht, also rastet nichts ein */
        ks.forEach(function (k) { k.style.zIndex = ''; });
      };
      /* Höhe des Abschnitts vorher und nachher: alles darunter gleitet um diesen Unterschied nach (beim Öffnen von oben her, beim Schliessen von unten her) */
      var dh = sec.getBoundingClientRect().height - h0, y0 = window.pageYOffset, ziel = i >= 0 ? sichtZiel() : null, ds = ziel === null ? 0 : ziel - y0, uhr = lauf[0] || null;
      if (Math.abs(dh) > 1) {
        var H = window.innerHeight, e = sec, n, nb = [];
        while (e && e !== document.body) { n = e; while ((n = n.nextElementSibling)) nb.push(n); e = e.parentElement; }
        nb.forEach(function (n) {
          var c = getComputedStyle(n); if (c.display === 'none' || c.position === 'fixed' || /^(DIALOG|SCRIPT|STYLE)$/.test(n.tagName)) return;
          var o = n.getBoundingClientRect().top; if (Math.min(o - dh, o - ds) > H + 140) return;      /* bleibt die ganze Fahrt unter dem Fensterrand */
          var m = c.transform && c.transform !== 'none' ? ' ' + c.transform : '';
          lauf.push(n.animate([{ transform: 'translateY(' + (-dh).toFixed(1) + 'px)' + m }, { transform: m ? m.slice(1) : 'none' }], { duration: DAUER, easing: 'cubic-bezier(.36,0,.1,1)' }));
        });
        if (dh < 0) {
          /* beim Schliessen: der Grund des Abschnitts bleibt unter dem nachgleitenden Teil stehen, Muster im selben Lauf */
          var cs = getComputedStyle(sec), f = document.createElement('div'); f.setAttribute('aria-hidden', 'true');
          f.style.cssText = 'position:absolute;left:0;right:0;top:100%;pointer-events:none;height:' + (-dh).toFixed(1) + 'px';
          f.style.backgroundColor = cs.backgroundColor; f.style.backgroundImage = cs.backgroundImage; f.style.backgroundSize = cs.backgroundSize; f.style.backgroundRepeat = cs.backgroundRepeat;
          f.style.backgroundPosition = cs.backgroundPositionX + ' ' + (-(h0 + dh)).toFixed(1) + 'px';
          sec.appendChild(f); flick = f;
        }
      }
      if (!uhr) { uhr = zs.animate([], { duration: DAUER }); lauf.push(uhr); }
      setTimeout(ende, DAUER + 60);
      if (Math.abs(ds) > 1) gleite(y0, ds, uhr);
    }
    ks.forEach(function (k, i) { k.addEventListener('click', function () { if (i !== offen) wechsle(i); }); });
    zu.addEventListener('click', function () { wechsle(-1); });
    zs.addEventListener('pointerenter', function () { zs.classList.add('zs--bereit'); }, { once: true });
  });
  /* Lupe: Bilder ohne eigenes Ziel lassen sich anklicken, wachsen an ihrem Platz zur grossen Ansicht und lassen sich durchblättern */
  /* die grossen Bilder hinter einer Tafel (.ort__b) sind nur Bild: kein Rahmen unter der Maus, kein Vergrössern */
  var lupen = $$('.frei,[data-lupe]').filter(function (f) { return !$('a', f) && $('img', f) && !f.closest('a,button,[data-zimmer],dialog,.ort__b') && !(window.innerWidth > 900 && f.offsetWidth > window.innerWidth * 0.58); });   /* Bilder über mehr als die halbe Breite sind schon gross: kein Anheben, kein Öffnen */
  if (lupen.length) {
    var lu = document.createElement('div'); lu.className = 'lupe'; lu.hidden = true; lu.setAttribute('role', 'dialog'); lu.setAttribute('aria-modal', 'true'); lu.setAttribute('aria-label', W.lupe);
    var pf = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5') + '"/></svg>'; };
    lu.innerHTML = '<button class="lupe__zu" type="button" aria-label="' + W.zu + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg></button><button class="lupe__pf lupe__pf--l" type="button" aria-label="' + W.vor + '">' + pf(-1) + '</button><figure><img alt=""><figcaption></figcaption></figure><button class="lupe__pf lupe__pf--r" type="button" aria-label="' + W.nach + '">' + pf(1) + '</button>';
    document.body.appendChild(lu);
    var lim = $('img', lu), lcap = $('figcaption', lu), lsatz = [], lpos = 0, lvon = null, lvt = !ruhig && !!document.startViewTransition;
    var gross = function (f) { var im = $('img', f); return (im.getAttribute('src') || '').replace(/-s\.webp/, '-l.webp'); };
    var fuelle = function (i) { lpos = (i + lsatz.length) % lsatz.length; var f = lsatz[lpos], im = $('img', f), c = $('figcaption', f); lim.src = gross(f); lim.alt = im.alt; lcap.textContent = c ? c.textContent : im.alt; lu.classList.toggle('lupe--eins', lsatz.length < 2); };
    var auf = function (f) {
      lsatz = $$('.frei,[data-lupe]', f.closest('[data-gruppe]') || f.parentNode).filter(function (x) { return lupen.indexOf(x) > -1; }); if (lsatz.indexOf(f) < 0) lsatz = [f]; lvon = f; var i = lsatz.indexOf(f), k = $('.rahmen__k', f) || $('.karte__b', f) || $('img', f), pre = new Image();
      var tu = function () { k.style.viewTransitionName = ''; fuelle(i); lu.hidden = false; lim.style.viewTransitionName = 'lupe'; document.body.style.overflow = 'hidden'; $('.lupe__zu', lu).focus(); };
      var los = function () { if (lvt) { k.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { lim.style.viewTransitionName = ''; }, function () { lim.style.viewTransitionName = ''; }); } else tu(); };
      pre.src = gross(f); (pre.decode ? pre.decode() : Promise.resolve()).then(los, los);
    };
    var zu = function () {
      if (lu.hidden) return; var f = lsatz[lpos], k = $('.rahmen__k', f) || $('.karte__b', f) || $('img', f);
      var tu = function () { lim.style.viewTransitionName = ''; lu.hidden = true; k.style.viewTransitionName = 'lupe'; document.body.style.overflow = ''; };
      if (lvt) { lim.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { k.style.viewTransitionName = ''; }, function () { k.style.viewTransitionName = ''; }); } else tu();
      if (lvon) lvon.focus({ preventScroll: true });
    };
    lupen.forEach(function (f) {
      f.classList.add('frei--lupe'); f.setAttribute('role', 'button'); f.setAttribute('tabindex', '0');
      f.addEventListener('click', function () { auf(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auf(f); } });
    });
    $('.lupe__zu', lu).addEventListener('click', zu);
    $('.lupe__pf--l', lu).addEventListener('click', function (e) { e.stopPropagation(); fuelle(lpos - 1); });
    $('.lupe__pf--r', lu).addEventListener('click', function (e) { e.stopPropagation(); fuelle(lpos + 1); });
    lu.addEventListener('click', function (e) { if (e.target === lu || e.target.tagName === 'FIGURE') zu(); });
    document.addEventListener('keydown', function (e) { if (lu.hidden) return; if (e.key === 'Escape') zu(); else if (e.key === 'ArrowRight') fuelle(lpos + 1); else if (e.key === 'ArrowLeft') fuelle(lpos - 1); });
  }
  /* Grundriss: beim Überfahren (oder Antippen) eines Raums zeigt die Karte unten rechts, welcher Raum es ist */
  $$('[data-plan]').forEach(function (pl) {
    var info = $('.gplan__info', pl), zs = $$('[data-z]', pl), ruhe = info.innerHTML, akt = null;
    zs.forEach(function (z) { var b = z.getAttribute('data-b'); if (b) { z._bild = new Image(); z._vor = function () { if (!z._bild.src) z._bild.src = WURZEL + 'assets/img/' + b + '-s.webp'; }; } });
    pl.addEventListener('pointerenter', function () { zs.forEach(function (z) { if (z._vor) z._vor(); }); }, { once: true });
    var zeig = function (z) {
      if (z === akt) return; akt = z; zs.forEach(function (x) { x.classList.toggle('an', x === z); });
      if (!z) { info.innerHTML = ruhe; info.classList.remove('voll'); return; }
      var b = z.getAttribute('data-b'), a = z.getAttribute('data-a'), c = z.getAttribute('data-c'); if (z._vor) z._vor();
      info.innerHTML = (b ? '<span class="gplan__ib"><img src="' + WURZEL + 'assets/img/' + b + '-s.webp" alt=""></span>' : '') + '<b></b>' + (a ? '<span></span>' : '') + (c ? '<small></small>' : '');
      $('b', info).textContent = z.getAttribute('data-n'); if (a) $('span:not(.gplan__ib)', info).textContent = a; if (c) $('small', info).textContent = c; info.classList.add('voll');
    };
    zs.forEach(function (z) {
      z.addEventListener('pointerenter', function () { zeig(z); }); z.addEventListener('click', function () { zeig(z); }); z.addEventListener('focus', function () { zeig(z); });
    });
    pl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') zeig(null); });
  });
  /* Säle: der Regler stellt die Gästezahl, zu kleine Säle treten zurück, die Bühne zeigt den Saal, der am genauesten passt */
  $$('[data-saalwahl]').forEach(function (w) {
    var r = $('input[type=range]', w), zahl = $('[data-personen]', w), tr = $('[data-treffer]', w), ps = $$('[data-saal]', w), bs = $$('.sbuehne__bild', w), ts = $$('.sth', w), akt = -1;
    ps.forEach(function (p, j) { if (!p.hidden) akt = j; });
    function zeige(i) {
      if (i === akt) return; akt = i;
      ps.forEach(function (p, j) { p.hidden = j !== i; }); ts.forEach(function (t, j) { t.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      var im = $('img', bs[i]), an = function () { if (akt === i) bs.forEach(function (b, j) { b.classList.toggle('an', j === i); }); };
      if (im && im.decode) { im.loading = 'eager'; im.decode().then(an, an); } else an();
    }
    function rechne(waehle) {
      var n = +r.value, best = -1, anz = 0; zahl.textContent = n; r.style.setProperty('--p', ((n - r.min) / (r.max - r.min) * 100) + '%');
      ps.forEach(function (p, j) { if (!p.hasAttribute('data-max')) return; /* Raum ohne Angabe (Meeting@BeauRivage): bleibt wählbar, zählt nicht */ var m = +p.getAttribute('data-max'), ok = m >= n; ts[j].classList.toggle('matt', !ok); if (ok) { anz++; if (best < 0 || m < +ps[best].getAttribute('data-max')) best = j; } });
      tr.innerHTML = (anz === 1 ? W.saal1 : anz + W.saalN) + '<b>' + ps[best].getAttribute('data-name') + '.</b>';
      if (waehle) zeige(best);
    }
    r.addEventListener('input', function () { rechne(true); });
    ts.forEach(function (t, j) { t.addEventListener('click', function () { zeige(j); }); });
    rechne(false);
  });
  $$('[data-reiter]').forEach(function (leiste) {
    var tabs = $$('.tab', leiste), ziel = document.getElementById(leiste.getAttribute('data-reiter'));
    var felder = ziel ? $$('[data-feld]', ziel) : [], bilder = ziel ? $$('[data-bilder] img', ziel) : [];
    var zeig = function (i) {
      tabs.forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); });
      felder.forEach(function (x, j) { x.hidden = j !== i; });
      bilder.forEach(function (x, j) { x.classList.toggle('an', j === i); });
    };
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { zeig(i); }); });
    var start = tabs.findIndex(function (t) { return t.getAttribute('aria-pressed') === 'true'; });   /* vorausgewählter Reiter aus dem Markup (Speisekarte: Vorspeisen, Robert 11.10.2026) */
    zeig(start < 0 ? 0 : start);
  });

  /* ---------- Grosse Liste mit Bildstapel ---------- */
  $$('.wahl').forEach(function (wl) {
    var li = $$('.wahl__l li', wl), bi = $$('.wahl__b img', wl), fein = matchMedia('(hover:hover) and (pointer:fine)').matches;
    var zeig = function (i) { li.forEach(function (x, j) { x.classList.toggle('an', j === i); }); bi.forEach(function (x, j) { x.classList.toggle('an', j === i); }); };
    li.forEach(function (x, i) {
      if (fein) x.addEventListener('mouseenter', function () { zeig(i); });
      var k = $('a,button', x); if (k) k.addEventListener('focus', function () { zeig(i); });
      if (k && k.tagName === 'BUTTON') k.addEventListener('click', function () { zeig(i); });
    });
    zeig(0);
  });

  /* ---------- Auswahl nach Wünschen: was nicht passt, tritt zurück ---------- */
  $$('[data-finder]').forEach(function (fd) {
    var opts = $$('.opt', fd), ziele = $$('[data-merk]', fd), satz = $('[data-treffer]', fd), neuB = $('[data-reset]', fd);
    var zeig = function () {
      var w = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; }).map(function (o) { return o.dataset.wert; }), pass = [];
      ziele.forEach(function (z) { var m = z.dataset.merk.split(' '), ok = w.every(function (x) { return m.indexOf(x) > -1; }); z.classList.toggle('matt', !ok); if (ok) pass.push(z); });
      satz.innerHTML = !w.length ? (satz.dataset.leer || '') : pass.length ? (pass.length === 1 ? W.bleibt1 : W.bleibtN) + ' <i>' + pass.length + W.von + ziele.length + '</i>' + (SP === 'fr' ? '\u00a0: ' : ': ') + pass.map(function (z) { return z.dataset.name; }).join(', ') + '.' : W.keine;
      if (neuB) neuB.style.visibility = w.length ? 'visible' : 'hidden';
    };
    opts.forEach(function (o) { o.addEventListener('click', function () { o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') !== 'true'); zeig(); }); });
    if (neuB) neuB.addEventListener('click', function () { opts.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); zeig(); });
    zeig();
  });
  
  /* ---------- Regler ---------- */
  $$('[data-stufen]').forEach(function (st) {
    var reg = $('.regler,.wahlfeld', st), bi = $$('.stufe__b img', st), daten = JSON.parse($('script[type="application/json"]', st).textContent);
    var nr = $('.stufe__nr', st), name = $('h3', st), text = $('.lauf', st), mit = $('.stufe__mit', st), kn = $('[data-stufe-kn]', st);
    var zeig = function (i) {
      var x = daten[i], bn = x.b !== undefined ? x.b : i; bi.forEach(function (b, j) { b.classList.toggle('an', j === bn); });
      nr.classList.toggle('stufe__nr--ohne', !x.gross); if (!x.gross && name && nr.previousElementSibling !== name) name.after(nr); nr.innerHTML = (x.gross || '') + (x.klein ? '<small>' + x.klein + '</small>' : '');
      if (name) name.textContent = x.name; if (text) text.textContent = x.text; if (mit) mit.textContent = x.mit || '';
      if (kn && x.ziel !== undefined) kn.setAttribute('data-buchen', x.ziel);
      reg.setAttribute('aria-valuetext', x.name);
    };
    reg.addEventListener('input', function () { zeig(+reg.value); }); zeig(+reg.value);
    /* Jahresband: zwölf Säulen (Höhe = Preis) und ein Regler darunter, beide stellen den Monat */
    var mt = $$('.jahr__m', st), rg = $('.jahr__regler', st);
    var monat = function (j) { reg.value = j; if (rg) { rg.value = j; rg.style.setProperty('--p', (j / (mt.length - 1) * 100) + '%'); } mt.forEach(function (x, k) { x.setAttribute('aria-pressed', k === j ? 'true' : 'false'); }); zeig(j); };
    mt.forEach(function (b, j) { b.addEventListener('click', function () { monat(j); }); });
    if (rg) { rg.addEventListener('input', function () { monat(+rg.value); }); monat(+reg.value); }
    else if (mt.length) monat(+reg.value);
  });
  /* Säle nach Personenzahl: was zu klein ist, tritt zurück; das Band rückt zum ersten passenden Saal */
  $$('[data-saele]').forEach(function (s) {
    var reg = $('.regler,.wahlfeld', s), zahl = $('[data-personen]', s), satz = $('[data-treffer]', s), karten = $$('[data-max]', s), band = $('.band', s);
    var zeig = function () {
      var n = +reg.value, k = 0, kl = null; zahl.textContent = n;
      karten.forEach(function (x) { var max = +x.dataset.max, ok = max >= n; x.style.opacity = ok ? '' : '.28'; if (ok) { k++; if (!kl || max < +kl.dataset.max) kl = x; } });
      satz.textContent = k === 1 ? W.saalE + $('h3', kl).textContent + '.' : k + W.saalN + $('h3', kl).textContent + '.';
    };
    reg.addEventListener('input', zeig); zeig();
  });

  /* ---------- Band: blättern mit Pfeilen, Laufbalken, Ziehen mit der Maus (das Blättern selbst bleibt nativ) ---------- */
  function richte(g) {
    if (g.classList.contains('gang--fliess')) return;   /* Rundgang (Das Haus) steuert seine Pfeile selbst, endloser Kreis */
    var band = $('.band', g), balken = $('.laufbalken', g), pf = $$('.pfeile button', g); if (!band) return;
    var weg = band.scrollWidth - band.clientWidth, teil = band.scrollWidth ? Math.min(1, band.clientWidth / band.scrollWidth) : 1, p = weg > 0 ? band.scrollLeft / weg : 0;
    if (balken) { var strich = $('i', balken); strich.style.width = (teil * 100).toFixed(1) + '%'; balken.style.visibility = weg > 4 ? 'visible' : 'hidden'; strich.style.transform = 'translateX(' + (p * (balken.clientWidth * (1 - teil))).toFixed(1) + 'px)'; }
    if (pf.length) { pf[0].disabled = band.scrollLeft < 4; pf[1].disabled = band.scrollLeft > weg - 4; }
  }
  var gaenge = $$('.gang');
  gaenge.forEach(function (g) {
    var band = $('.band', g), frei = true; if (!band) return;
    band.addEventListener('scroll', function () { if (!frei) return; frei = false; requestAnimationFrame(function () { frei = true; richte(g); }); }, { passive: true });
    $$('.pfeile button', g).forEach(function (b) {
      b.addEventListener('click', function () { if (g.classList.contains('gang--fliess')) return; var k = band.firstElementChild; if (!k) return; band.scrollBy({ left: (+b.getAttribute('data-richtung')) * (k.offsetWidth + 20), behavior: ruhig ? 'auto' : 'smooth' }); });
    });
    richte(g);
  });
  if (gaenge.length) { var ra = function () { gaenge.forEach(richte); }; window.addEventListener('resize', ra); window.addEventListener('load', ra); }
  $$('.band').forEach(function (b) {
    var unten = false, x0 = 0, s0 = 0, weit = false;
    b.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; unten = true; weit = false; x0 = e.clientX; s0 = b.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!unten) return; var d = e.clientX - x0; if (Math.abs(d) > 4) { weit = true; b.classList.add('zieht'); } b.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { unten = false; b.classList.remove('zieht'); });
    b.addEventListener('click', function (e) { if (weit) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Rechtsseiten: im Inhaltsfeld den Abschnitt markieren, der gerade gelesen wird ---------- */
  (function () {
    var feld = $('.recht__inhalt'); if (!feld || !('IntersectionObserver' in window)) return;
    var punkte = {}, jetzt = null;
    $$('a', feld).forEach(function (l) { punkte[l.getAttribute('href').slice(1)] = l; });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting || !punkte[e.target.id]) return; if (jetzt) jetzt.classList.remove('an'); jetzt = punkte[e.target.id]; jetzt.classList.add('an'); });
    }, { rootMargin: '-10% 0px -72% 0px' });
    Object.keys(punkte).forEach(function (id) { var h = document.getElementById(id); if (h) rio.observe(h); });
  })();

  /* ---------- Scroll-Takt: Leiste, Auftaktbild, Dreiklang, Bühne ---------- */
  var heroBild = $('.hero__bild'), hero = $('.hero');
  var strecke = $('.buehne__strecke'), haeuser = $$('.buehne .haus'), bilder = $$('.buehne__bilder .polas');
  var abzuege = bilder.map(function (b) { return $$('.pola', b); }), liegt = bilder.map(function () { return 0; });
  var etagen = $$('.lift li'), kabine = $('.lift .kabine');
  var breit = matchMedia('(min-width: 861px)');
  var schweb = $$('.schweb'), drei = $('.drei');
  var paare = $$('.paar .klein > .rahmen'), pZiel = [], pIst = [], pLaeuft = false;
  function paarlauf() { var weiter = false; for (var i = 0; i < paare.length; i++) { if (pZiel[i] === undefined) continue; pIst[i] = (pIst[i] || 0) + (pZiel[i] - (pIst[i] || 0)) * 0.12; if (Math.abs(pZiel[i] - pIst[i]) > 0.2) weiter = true; else pIst[i] = pZiel[i]; paare[i].style.transform = 'translate3d(0,' + pIst[i].toFixed(1) + 'px,0)'; } if (weiter) requestAnimationFrame(paarlauf); else pLaeuft = false; }
  var sZiel = 0, sIst = 0, sLaeuft = false;
  function schwebe() {
    sIst += (sZiel - sIst) * 0.12;
    if (Math.abs(sZiel - sIst) < 0.15) { sIst = sZiel; sLaeuft = false; }
    for (var i = 0; i < schweb.length; i++) schweb[i].style.transform = 'translate3d(0,' + (sIst * (+schweb[i].getAttribute('data-tempo'))).toFixed(1) + 'px,0)';
    if (sLaeuft) requestAnimationFrame(schwebe);
  }
  var yAlt = window.scrollY, navRicht = 0, navAnker = yAlt, ziel = 0, ist = 0, laeuft = false, aktiv = -1;
  function setze(n) {
    if (n === aktiv) return; aktiv = n;
    haeuser.forEach(function (h, i) { h.classList.toggle('an', i === n); });
    bilder.forEach(function (b, i) { b.classList.toggle('an', i === n); });
    etagen.forEach(function (t, i) { t.classList.toggle('an', i === n); });
    /* die Kabine fährt nach oben: Keller steht unten in der Anzeige */
    if (kabine && etagen.length) kabine.style.transform = 'translateY(' + ((etagen.length - 1 - n) * 40) + 'px)';
  }
  if (haeuser.length) setze(0);
  function lege(n, wieviel) {
    for (var i = 0; i < bilder.length; i++) {
      var soll = i === n ? wieviel : 0;
      if (soll === liegt[i]) continue;
      var neu = 0;
      for (var k = 0; k < abzuege[i].length; k++) {
        var an2 = k < soll, war = k < liegt[i];
        if (an2 && !war) { abzuege[i][k].style.transitionDelay = (i === n ? 0.1 + neu * 0.14 + (k === 4 ? 0.12 : 0) : 0) + 's'; neu++; }
        else if (i === n) abzuege[i][k].style.transitionDelay = '0s';
        else abzuege[i][k].style.transitionDelay = '';
        abzuege[i][k].classList.toggle('da', an2);
      }
      liegt[i] = soll;
    }
  }
  if (bilder.length) {
    if (ruhig || !('IntersectionObserver' in window)) lege(0, 5);
    else {
      var erst = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { erst.disconnect(); if (aktiv === 0) lege(0, 5); } }, { threshold: 0.25 }); erst.observe($('.buehne__bilder'));
      /* Fotos der Abzüge vorab entpacken, damit das Hochfliegen nur noch Bewegung ist */
      var vor = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; vor.disconnect(); $$('.buehne__bilder img').forEach(function (b) { b.loading = 'eager'; if (b.decode) b.decode().catch(function () {}); }); }, { rootMargin: '120% 0px' });
      vor.observe(strecke);
    }
  }
  /* Handy: der Stapel je Etage fliegt ein, sobald er im Bild ist */
  var mpolas = $$('.polas--m');
  if (mpolas.length) {
    if (ruhig || !('IntersectionObserver' in window)) mpolas.forEach(function (m) { m.classList.add('an'); });
    else { var mio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('an'); mio.unobserve(e.target); } }); }, { threshold: 0.35 }); mpolas.forEach(function (m) { mio.observe(m); }); }
  }
  /* Gleiten: das Bild wandert beim Scrollen sacht in seinem Rahmen und kommt in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach (0,1 je Bild). */
  var gl = [], glLaeuft = false, tf = [], breit = matchMedia('(min-width: 861px)');
  if (!ruhig && 'IntersectionObserver' in window) {
    /* GBR (Robert 10.10.2026, «die Motion in den Bildern wie beim Carlton»): auch die Rahmen dieses Hauses — Foto, Kachel, Karte, Trio, Frei, Stapel, Zimmer */
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, .zk__b img, .lk__b img, .foto.dunst > img, .kachel__b > img, .karte__b > img, .frei__b > img, .trio__b > img, .st__b > img, .gz__k > img, .abf__f > img, .sb__f > img, .sb__ab > img, .sp__b > img, .ak__b > img').forEach(function (im) {   /* .ak__b: vier Kacheln über der Schlusskarte gleiten wie die Zimmer (Robert 11.10.2026) */
      if (im.closest('[data-bilder],.wahl__b,.zeitreihe,.zs,.zmos,.dienst,.pakete__b,.stufe__b,.betrieb:not(.rz),.bd')) return;   /* .rz (Spa: Day Spa, Rituale) gleitet wie die Zimmer (Robert 11.10.2026) */   /* .bd: Bänder laufen selbst. Ballsaal/Ausflüge gleiten wieder (Robert 11.10.2026); das Wackeln kam vom Filter beim Überfahren, der ist raus */   /* .betrieb: Restaurantbilder gleiten nicht (Robert 11.10.2026: «hängt beim Hochscrollen hinterher und springt») */
      if (im.parentNode.querySelectorAll('img').length > 1) return;
      var fig = im.closest('[data-r]');
      im.classList.add('gleit'); gl.push({ el: im, rahmen: im.parentNode, fig: fig, da: false, ziel: 0, ist: 0, zs: 1.16, is: 1.16,
        auf: fig && !fig.classList.contains('da') ? 0 : -1, az: 0.08, ad: 2800 });   /* sanfter: weniger Vergrösserung, längere Zeit (Robert 11.10.2026) */
    });
    /* Auftritt wie beim Carlton (Robert 11.10.2026, «dass sich die Bilder so setzen»): sobald das Bild auftaucht, zoomt das Foto von selbst
       aus der Vergrösserung in seine Ruhe, nach der Uhr und nicht nach dem Scrollen. Danach gleitet es wie bisher. */
    if ('MutationObserver' in window) {
      var glMO = new MutationObserver(function (ms) {
        ms.forEach(function (m) { for (var i = 0; i < gl.length; i++) { var g = gl[i];
          if (g.fig === m.target && g.auf === 0 && g.fig.classList.contains('da')) {
            g.auf = performance.now() + (parseFloat(getComputedStyle(g.fig).transitionDelay) || 0) * 1000;
            if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
          } } });
      });
      gl.forEach(function (g) { if (g.auf === 0) glMO.observe(g.fig, { attributes: true, attributeFilter: ['class'] }); });
    } else gl.forEach(function (g) { g.auf = -1; });
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting;
        for (var j = 0; j < tf.length; j++) if (tf[j].ref === e.target) tf[j].da = e.isIntersecting; });
      gleitLies();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { glIO.observe(g.rahmen); });
    /* Tiefe (Robert 11.10.2026, «Perspektive, dass die so ein bisschen mitscrollen»): Bilder einer Gruppe ziehen verschieden schnell nach oben,
       das vordere schneller als das hintere — wie bei Salt & Silver. Gemessen wird an der ruhenden Gruppe, bewegt über «translate»,
       damit es sich mit dem Auftritt (transform) nicht in die Quere kommt. Nur auf breiten Fenstern. */
    var tiefe = function (ref, el, f) { if (!f || !ref || !el) return; el.classList.add('tief'); tf.push({ ref: ref, el: el, f: f, da: false, ziel: 0, ist: 0 }); };
    var reihe = function (sel, fs) { $$(sel).forEach(function (g) { [].forEach.call(g.children, function (k, n) { tiefe(g, k, fs[n % fs.length]); }); }); };
    reihe('#halle .hl__b', [0.3, 0.65, 1, 0.5]);
    /* Reihen nebeneinander (Zimmer-Drei, Tafel) bleiben auf einer Linie (Robert 11.10.2026: mittleres Bild tiefer «sieht scheisse aus») */
    reihe('.trio', [0.35, 0.75, 1]);
    reihe('.stapel', [0.3, 0.7, 1, 0.55]);
    $$('.zwei>.b').forEach(function (b) { if (!b.querySelector('.trio,.stapel') && !b.classList.contains('filmwand') && !b.classList.contains('gz__bilder')) tiefe(b.parentNode, b, 0.4); });   /* Zimmerübersicht: Bildgruppe wandert nicht mehr mit, nur die Fotos gleiten in ihren Rahmen (Robert 11.10.2026: «flackern und wackeln») */
    /* Seitenköpfe: das Bild bleibt beim Scrollen etwas zurück wie im Auftakt der Startseite (0,16) */
    $$('.sk .sk__bg, .sk .sk__h > img').forEach(function (im) { tf.push({ ref: im.closest('.sk'), el: im, f: 0.16, kopf: true, da: true, ziel: 0, ist: 0 }); });
    /* Öffnen (Startseite «Bad», Robert 11.10.2026): die Bühne wächst beim Hereinscrollen von 0,86 auf ihre volle Grösse, gekoppelt an den Scrollweg */
    $$('[data-oeffnen]').forEach(function (el) { var a0 = breit.matches ? 0.86 : 0.93; el.style.scale = a0; tf.push({ ref: el, el: el, oeffnen: true, da: false, ziel: a0, ist: a0 }); });
    var refs = []; tf.forEach(function (t) { if (!t.kopf && refs.indexOf(t.ref) < 0) { refs.push(t.ref); glIO.observe(t.ref); } });
    if (breit.addEventListener) breit.addEventListener('change', gleitLies);
  }
  function gleitLies() {
    if (!gl.length && !tf.length) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.16; }   /* feste Grösse beim Gleiten (Robert 11.10.2026: Zimmerbilder «flackern und wackeln»): wechselnde Vergrösserung liess den Browser jedes Bild bei jedem Scrollschritt neu zeichnen, jetzt wird nur noch verschoben */
    for (var j = 0; j < tf.length; j++) { var t = tf[j];
      if (t.kopf) { var kr = t.ref.getBoundingClientRect(); t.da = kr.bottom > -40; if (t.da) t.ziel = Math.max(0, Math.min(-kr.top, kr.height)) * t.f; continue; }
      if (t.oeffnen) { if (!t.da) continue; var orr = t.ref.getBoundingClientRect(), po = Math.max(0, Math.min(1, (vh - orr.top) / (vh * 0.72))), a0 = breit.matches ? 0.86 : 0.93;
        t.ziel = a0 + (1 - a0) * (1 - Math.pow(1 - po, 2)); continue; }
      if (!t.da) continue;
      if (!breit.matches) { t.ziel = 0; continue; }
      var q = t.ref.getBoundingClientRect(), pq = (q.top + q.height / 2 - vh / 2) / (vh / 2 + q.height / 2);
      t.ziel = Math.max(-1, Math.min(1, pq)) * 70 * t.f; }
    if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  function gleitLauf() {
    var weiter = false, jetzt = performance.now();
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da && g.auf <= 0) continue;
      g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
      if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true;
      var e = 1;
      if (g.auf === 0) e = 1 + g.az;
      else if (g.auf > 0) { var t = (jetzt - g.auf) / g.ad;
        if (t >= 1) g.auf = -1; else { weiter = true; t = Math.max(0, t); e = 1 + g.az * (1 - (1 - Math.pow(2, -10 * t)) / 0.99902); } }
      g.el.style.transform = 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) scale(' + (g.is * e).toFixed(4) + ')'; }
    for (var j = 0; j < tf.length; j++) { var d = tf[j]; if (!d.da && Math.abs(d.ziel - d.ist) < 0.12) continue;
      d.ist += (d.ziel - d.ist) * (d.kopf ? 0.14 : 0.1);
      if (d.oeffnen) { if (Math.abs(d.ziel - d.ist) > 0.0004) weiter = true; d.el.style.scale = d.ist.toFixed(4); continue; }
      if (Math.abs(d.ziel - d.ist) > 0.12) weiter = true;
      d.el.style.translate = '0 ' + d.ist.toFixed(2) + 'px'; }
    if (weiter) requestAnimationFrame(gleitLauf); else glLaeuft = false;
  }
  function lies() {
    gleitLies();
    var y = window.scrollY;
    /* Leiste weg beim Runterscrollen, zurück beim Hochscrollen. Gezählt wird der Weg seit dem letzten Richtungswechsel, nicht je Bild:
       bei 120 Bildern/s (Stromsparmodus aus) ist ein Scrollschritt oft kleiner als 6 px, dann verschwand die Leiste nie (Robert 11.10.2026). */
    if (nav && !doc.classList.contains('offen')) {
      if ((y - yAlt) * navRicht < 0) { navRicht = y > yAlt ? 1 : -1; navAnker = yAlt; }
      else if (!navRicht && y !== yAlt) { navRicht = y > yAlt ? 1 : -1; navAnker = yAlt; }
      if (y < 140) nav.classList.remove('weg');
      else if (navRicht > 0 && y - navAnker > 24) nav.classList.add('weg');
      else if (navRicht < 0 && navAnker - y > 24) nav.classList.remove('weg');
    }
    yAlt = y;
    if (heroBild && !ruhig) ziel = Math.min(y, hero.offsetHeight) * 0.16;
    if (drei && !ruhig && breit.matches) {
      var dr = drei.getBoundingClientRect(), vh = window.innerHeight;
      if (dr.bottom > -100 && dr.top < vh + 100) {
        sZiel = Math.max(-1, Math.min(1, (dr.top + dr.height / 2 - vh / 2) / vh)) * 70;
        if (!sLaeuft && Math.abs(sZiel - sIst) > 0.15) { sLaeuft = true; requestAnimationFrame(schwebe); }
      }
    }
    if (paare.length && !ruhig && breit.matches) {
      var vh2 = window.innerHeight, los = false;
      for (var pi = 0; pi < paare.length; pi++) { var pr = paare[pi].closest('.paar').getBoundingClientRect(); if (pr.bottom > -80 && pr.top < vh2 + 80) { pZiel[pi] = Math.max(-1, Math.min(1, (pr.top + pr.height / 2 - vh2 / 2) / vh2)) * 46; los = true; } }
      if (los && !pLaeuft) { pLaeuft = true; requestAnimationFrame(paarlauf); }
    }
    if (strecke && breit.matches) {
      var r = strecke.getBoundingClientRect(), weg = r.height - window.innerHeight;
      var p = weg > 0 ? Math.min(1, Math.max(0, -r.top / weg)) : 0;
      var hn = Math.min(haeuser.length - 1, Math.floor(p * haeuser.length * 0.999));
      setze(hn);
      if (r.top < window.innerHeight * 0.72) lege(hn, 5);
    }
  }
  function bild() {
    ist += (ziel - ist) * 0.12;
    if (Math.abs(ziel - ist) < 0.2) { ist = ziel; laeuft = false; }
    if (heroBild) heroBild.style.transform = 'translate3d(0,' + ist.toFixed(1) + 'px,0)';
    if (laeuft) requestAnimationFrame(bild);
  }
  var wartet = false;
  window.addEventListener('scroll', function () {
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () {
      wartet = false; lies();
      if (heroBild && !ruhig && !laeuft && Math.abs(ziel - ist) > 0.2 && window.scrollY < hero.offsetHeight * 1.1) { laeuft = true; requestAnimationFrame(bild); }
    });
  }, { passive: true });
  lies();
  /* Etagen im Plan und in der Lift-Anzeige führen an die richtige Stelle der Bühne */
  $$('[data-etage]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!strecke) return; e.preventDefault();
      var n = +a.getAttribute('data-etage'), r = strecke.getBoundingClientRect();
      var y = breit.matches ? r.top + window.scrollY + (r.height - window.innerHeight) * ((n + 0.4) / haeuser.length) : haeuser[n].getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: ruhig ? 'auto' : 'smooth' });
    });
  });
  /* ---------- Sonnenlauf: die Sonne wandert am rechten Rand mit der Seite von Morgen zu Nacht (ein Takt, nur transform) ---------- */
  var sl = $('[data-sonnenlauf]');
  if (sl && !ruhig) {
    var slSonne = $('i', sl), slMarken = $$('li', sl), slH = 0, slP = -1, slWartet = false;
    var slMass = function () { slH = sl.getBoundingClientRect().height; };
    var slLies = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      if (Math.abs(p - slP) < 0.0005) return; slP = p;
      slSonne.style.transform = 'translate3d(0,' + (p * slH).toFixed(1) + 'px,0)';
      var k = p < 0.17 ? 0 : p < 0.5 ? 1 : p < 0.84 ? 2 : 3;
      slMarken.forEach(function (m, i) { m.classList.toggle('an', i === k); });
    };
    slMass(); slLies();
    window.addEventListener('resize', function () { slMass(); slP = -1; slLies(); }, { passive: true });
    window.addEventListener('scroll', function () { if (slWartet) return; slWartet = true; requestAnimationFrame(function () { slWartet = false; slLies(); }); }, { passive: true });
  }
  /* ---------- Horizont: das Schiff kommt von rechts und legt an der Ländte an (einmal, sobald die Linie im Bild ist) ---------- */
  $$('[data-horizont]').forEach(function (h) {
    var s = $('.schiff', h); if (!s) return;
    var richte = function () { var r = h.getBoundingClientRect(), sr = s.getBoundingClientRect(); h.style.setProperty('--weg', (r.right - sr.left + 40).toFixed(0) + 'px'); };
    richte();
    if (ruhig || !('IntersectionObserver' in window)) { h.classList.add('da'); return; }
    var hio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { hio.unobserve(h); richte(); requestAnimationFrame(function () { h.classList.add('da'); }); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    hio.observe(h);
  });
  /* ---------- Feiern / Tagen: der Schalter hebt in der Raum-Tafel die Spalte hervor, die gilt ---------- */
  $$('[data-zaehlweise]').forEach(function (w) {
    var tabs = $$('.tab', w), ziel = document.getElementById(w.getAttribute('data-zaehlweise')); if (!ziel) return;
    var zeig = function (i) { tabs.forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); }); ziel.classList.toggle('zw-tagen', i === 1); };
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { zeig(i); }); });
    zeig(0);
  });
  /* ---------- Fragen an den Gast: eine Antwort je Wahl ---------- */
  $$('[data-frage]').forEach(function (fr) {
    var ks = $$('[data-wahl]', fr), felder = $$('[data-antwort]', fr);
    var zeig = function (i) { ks.forEach(function (k, j) { k.setAttribute('aria-pressed', j === i); }); felder.forEach(function (f, j) { f.hidden = false; f.classList.toggle('an', j === i); }); };
    ks.forEach(function (k, i) { k.addEventListener('click', function () { zeig(i); }); });
  });
})();

/* ---------- Buchungsleiste: Kalender und Gäste im Stil des Hauses (Robert 11.10.2026: «egal ob ich die Personenzahl oder den
   Kalender aufklappe, alles im Stil der Seite») ----------
   Die echten Felder bleiben im Formular (Übergabe an SimpleBooking und die Zimmer-Abfrage lesen sie unverändert), sichtbar sind
   eigene Knöpfe. Ein Kalender für An- und Abreise als Zeitraum, eine Liste für die Gäste. Das Fenster hängt am Body (der Auftakt
   schneidet ab), steht über oder unter der Leiste, je nachdem wo Platz ist, und folgt ihr beim Scrollen nur über transform. */
(function () {
  var forms = document.querySelectorAll('form[data-leiste]'); if (!forms.length) return;
  var doc = document.documentElement, LANG = doc.lang || 'de-CH', SP = LANG.slice(0, 2);
  var W = ({
    de: { tage: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], vor: 'Nächster Monat', zur: 'Vorheriger Monat', an: 'Anreise wählen', ab: 'Abreise wählen', n1: 'Nacht', nn: 'Nächte', kal: 'Kalender', gaeste: 'Gäste' },
    en: { tage: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], vor: 'Next month', zur: 'Previous month', an: 'Choose arrival', ab: 'Choose departure', n1: 'night', nn: 'nights', kal: 'Calendar', gaeste: 'Guests' },
    fr: { tage: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'], vor: 'Mois suivant', zur: 'Mois précédent', an: 'Choisir l’arrivée', ab: 'Choisir le départ', n1: 'nuit', nn: 'nuits', kal: 'Calendrier', gaeste: 'Personnes' }
  })[SP] || null;
  if (!W) return;
  var fKurz = new Intl.DateTimeFormat(LANG, { day: 'numeric', month: 'short', year: 'numeric' });
  var fKurzOJ = new Intl.DateTimeFormat(LANG, { day: 'numeric', month: 'short' });
  var fMonat = new Intl.DateTimeFormat(LANG, { month: 'long' });
  var fLang = new Intl.DateTimeFormat(LANG, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var lies = function (s) { var p = (s || '').split('-'); return p.length === 3 ? new Date(+p[0], p[1] - 1, +p[2]) : null; };
  var plus = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  var heute = new Date(); heute = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  var grenze = plus(heute, 730);
  var schmal = function () { return window.innerWidth <= 860; };

  var fenster = document.createElement('div'); fenster.className = 'lw-fenster'; fenster.hidden = true;
  fenster.innerHTML = '<div class="lw-innen"></div>'; document.body.appendChild(fenster);
  var innen = fenster.firstChild, offen = null, rahmen = null, oben = false, takt = 0;

  function lage() {
    takt = 0; if (!offen) return;
    var r = rahmen.getBoundingClientRect(), b = offen.feld.getBoundingClientRect();
    var w = innen.offsetWidth, h = innen.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var x = offen.art === 'kal' ? (schmal() ? (vw - w) / 2 : Math.min(b.left - 12, r.left + 8)) : b.left - 12;
    var bez = r;
    if (offen.nah) {   /* Kalender mittig unter den beiden Datumsfeldern, Gästeliste genau unter ihrem Feld und so breit wie es */
      bez = b;
      if (offen.art === 'kal' && !schmal()) { var p1 = offen.s.knAn.getBoundingClientRect(), p2 = offen.s.knAb.getBoundingClientRect(); x = (p1.left + p2.right) / 2 - w / 2; }
      if (offen.art !== 'kal') x = b.left;
    }
    x = Math.max(16, Math.min(x, vw - w - 16));
    var ueber = bez.top - 14, unter = vh - bez.bottom - 14;
    oben = h <= ueber && (ueber >= unter || h > unter);
    var y = oben ? bez.top - 10 - h : bez.bottom + 10;
    /* Felder in einer Karte (Zimmerseiten): Fenster liegt fest auf der Seite und scrollt mit ihr, statt hinterherzurücken */
    if (offen.nah) { x += window.scrollX; y += window.scrollY; }
    fenster.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
    fenster.classList.toggle('lw-oben', oben);
  }
  var folge = function () {
    if (!offen) return;
    /* Karte: erst nach einem guten Stück Scrollen sanft schliessen, ein kleiner Ruck lässt es offen (Robert 11.10.2026) */
    if (offen.nah) { if (Math.abs(window.scrollY - offen.y0) > Math.min(220, window.innerHeight * .25)) zu(false, true); return; }
    if (!takt) takt = requestAnimationFrame(lage);
  };
  window.addEventListener('scroll', folge, { passive: true });
  window.addEventListener('resize', function () { if (offen) { if (offen.art === 'kal') kalender(offen); lage(); } });

  function zu(fokus, sanft) {
    if (!offen) return;
    var o = offen; offen = null;
    fenster.classList.toggle('lw-sanft', !!sanft);
    fenster.classList.remove('offen'); o.feld.setAttribute('aria-expanded', 'false');
    o.form.classList.remove('lw-aktiv');
    setTimeout(function () { if (!offen) fenster.hidden = true; }, sanft ? 900 : 380);
    if (fokus) o.feld.focus();
  }
  function auf(o) {
    if (offen && offen.feld === o.feld) { zu(true); return; }
    if (offen) zu(false);
    offen = o; rahmen = o.form;
    o.nah = o.form.classList.contains('zbu__f'); o.y0 = window.scrollY;
    fenster.classList.toggle('lw-fest', o.nah); fenster.classList.remove('lw-sanft');
    fenster.classList.toggle('lw-hell', false);   /* aus der hellen Buchkarte: Kalender und Gästewahl hell im Stil der Karte (Robert 11.10.2026) */
    fenster.hidden = false; fenster.classList.remove('offen');
    o.feld.setAttribute('aria-expanded', 'true'); o.form.classList.add('lw-aktiv');
    if (o.art === 'kal') kalender(o); else gaesteListe(o);
    innen.style.minWidth = o.nah && o.art !== 'kal' ? o.feld.getBoundingClientRect().width + 'px' : '';
    lage();
    /* die Leiste kann beim Öffnen noch aufsteigen (Auftritt) – eine Sekunde lang mitgehen */
    var bis = Date.now() + 1200; (function mit() { if (offen === o && Date.now() < bis) { lage(); requestAnimationFrame(mit); } })();
    requestAnimationFrame(function () { requestAnimationFrame(function () { fenster.classList.add('offen'); }); });
    var f = innen.querySelector('[aria-selected="true"]:not([disabled]), .lw-tag--an, .lw-tag--ab');
    var ziel = o.art === 'kal' ? innen.querySelector(o.modus === 'ab' && o.s.ab.value ? '.lw-tag--ab' : '.lw-tag--an') : f;
    if (ziel) ziel.focus({ preventScroll: true });
  }
  document.addEventListener('pointerdown', function (e) { if (offen && !fenster.contains(e.target) && !offen.feld.contains(e.target)) zu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) { e.preventDefault(); zu(true); } });
  fenster.addEventListener('focusout', function (e) { if (offen && e.relatedTarget && !fenster.contains(e.relatedTarget) && !offen.feld.contains(e.relatedTarget)) zu(false); });

  /* Kalender: Zeitraum in einem Zug, erst Anreise, dann Abreise; zwei Monate am Rechner, einer am Handy */
  function kalender(o) {
    var s = o.s, an = lies(s.an.value), ab = lies(s.ab.value), n = schmal() ? 1 : 2;
    if (!o.blick) { var bz = o.modus === 'ab' && ab && !(n === 2 && an && ab.getMonth() === (an.getMonth() + 1) % 12) ? ab : (an || heute); o.blick = new Date(bz.getFullYear(), bz.getMonth(), 1); }
    var erst = new Date(heute.getFullYear(), heute.getMonth(), 1), letzt = new Date(grenze.getFullYear(), grenze.getMonth() - n + 1, 1);
    if (o.blick < erst) o.blick = erst; if (o.blick > letzt) o.blick = letzt;
    var h = '<div class="lw-kal" role="dialog" aria-label="' + W.kal + '">'
      + '<button type="button" class="lw-pfeil" data-schritt="-1" aria-label="' + W.zur + '"' + (o.blick <= erst ? ' disabled' : '') + '>' + PF + '</button>'
      + '<button type="button" class="lw-pfeil lw-pfeil--vor" data-schritt="1" aria-label="' + W.vor + '"' + (o.blick >= letzt ? ' disabled' : '') + '>' + PF + '</button><div class="lw-monate' + (o.richtung ? ' lw-neu' + (o.richtung > 0 ? 'r' : 'l') : '') + '">';
    for (var m = 0; m < n; m++) {
      var erster = new Date(o.blick.getFullYear(), o.blick.getMonth() + m, 1), tage = new Date(erster.getFullYear(), erster.getMonth() + 1, 0).getDate();
      h += '<div class="lw-monat"><p class="lw-mname"><b>' + fMonat.format(erster) + '</b> ' + erster.getFullYear() + '</p><div class="lw-raster" role="grid">';
      W.tage.forEach(function (t) { h += '<span class="lw-wt" aria-hidden="true">' + t + '</span>'; });
      var vorn = (erster.getDay() + 6) % 7;
      for (var l = vorn; l > 0; l--) h += '<span></span>';
      for (var d = 1; d <= tage; d++) {
        var t = new Date(erster.getFullYear(), erster.getMonth(), d), k = 'lw-tag', ist = iso(t), weg = t < heute || t > grenze, sp = (vorn + d - 1) % 7;
        if (sp === 0 || d === 1) k += ' lw-rs';
        if (sp === 6 || d === tage) k += ' lw-re';
        if (an && ist === iso(an)) k += ' lw-tag--an';
        if (ab && ist === iso(ab)) k += ' lw-tag--ab';
        if (an && ab && t > an && t < ab) k += ' lw-tag--zw';
        if (ist === iso(heute)) k += ' lw-tag--heute';
        h += '<button type="button" class="' + k + '" data-tag="' + ist + '" aria-label="' + fLang.format(t) + '"' + (weg ? ' disabled' : '') + ' tabindex="-1">' + d + '</button>';
      }
      h += '</div></div>';
    }
    var nae = an && ab ? Math.round((ab - an) / 864e5) : 0;
    h += '</div><p class="lw-fuss"><span class="lw-hinweis">' + (o.modus === 'ab' ? W.ab : W.an) + '</span><b>' + (an ? fKurzOJ.format(an) : '') + ' <i></i> ' + (ab ? fKurz.format(ab) : '') + '</b><span>' + nae + ' ' + (nae === 1 ? W.n1 : W.nn) + '</span></p></div>';
    innen.innerHTML = h; o.richtung = 0;
    var fok = innen.querySelector('.lw-tag:not([disabled])'); if (fok) fok.tabIndex = 0;
    var gew = innen.querySelector(o.modus === 'ab' ? '.lw-tag--ab' : '.lw-tag--an'); if (gew) { if (fok) fok.tabIndex = -1; gew.tabIndex = 0; }
  }
  function waehle(o, t) {
    var s = o.s, an = lies(s.an.value);
    if (o.modus === 'an' || !an || t <= an) {
      s.an.value = iso(t); s.an.dispatchEvent(new Event('change', { bubbles: true }));
      if (lies(s.ab.value) <= t) s.ab.value = iso(plus(t, 1));
      s.ab.min = iso(plus(t, 1));
      o.modus = 'ab'; zeige(o.s); kalender(o);
      var f = innen.querySelector('[data-tag="' + iso(plus(t, 1)) + '"]'); if (f) { f.tabIndex = 0; f.focus({ preventScroll: true }); }
      o.feld = s.knAb; offen.feld.setAttribute('aria-expanded', 'true'); s.knAn.setAttribute('aria-expanded', 'false');
      return;
    }
    s.ab.value = iso(t); s.ab.dispatchEvent(new Event('change', { bubbles: true }));
    zeige(o.s); kalender(o);
    setTimeout(function () { zu(true); }, 260);
  }
  innen.addEventListener('click', function (e) {
    if (!offen) return;
    var p = e.target.closest('.lw-pfeil'), t = e.target.closest('.lw-tag'), g = e.target.closest('.lw-wahl');
    if (p && !p.disabled) { var sc = +p.getAttribute('data-schritt'); offen.blick = new Date(offen.blick.getFullYear(), offen.blick.getMonth() + sc, 1); offen.richtung = sc; kalender(offen); var q = innen.querySelector('.lw-pfeil[data-schritt="' + sc + '"]'); if (q && !q.disabled) q.focus({ preventScroll: true }); else { var tt = innen.querySelector('.lw-tag:not([disabled])'); if (tt) tt.focus({ preventScroll: true }); } lage(); }
    else if (t && !t.disabled) waehle(offen, lies(t.getAttribute('data-tag')));
    else if (g) { offen.s.g.value = g.getAttribute('data-wert'); offen.s.g.dispatchEvent(new Event('change', { bubbles: true })); zeige(offen.s); gaesteListe(offen); setTimeout(function () { zu(true); }, 220); }
  });
  /* Vorschau des Zeitraums, solange die Abreise gesucht wird */
  innen.addEventListener('mouseover', function (e) {
    if (!offen || offen.art !== 'kal' || offen.modus !== 'ab') return;
    var t = e.target.closest('.lw-tag'), an = lies(offen.s.an.value);
    innen.querySelectorAll('.lw-tag--vor').forEach(function (x) { x.classList.remove('lw-tag--vor'); });
    if (!t || t.disabled || !an) return;
    var z = lies(t.getAttribute('data-tag')); if (z <= an) return;
    innen.querySelectorAll('.lw-tag').forEach(function (x) { var d = lies(x.getAttribute('data-tag')); if (d > an && d <= z) x.classList.add('lw-tag--vor'); });
  });
  innen.addEventListener('keydown', function (e) {
    if (!offen) return;
    if (offen.art === 'kal') {
      var t = e.target.closest('.lw-tag'); if (!t) return;
      var sp = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key], d = lies(t.getAttribute('data-tag'));
      if (e.key === 'PageUp' || e.key === 'PageDown') sp = e.key === 'PageUp' ? -30 : 30;
      if (!sp) return; e.preventDefault();
      var z = plus(d, sp); if (z < heute || z > grenze) return;
      var x = innen.querySelector('[data-tag="' + iso(z) + '"]');
      if (!x) { offen.blick = new Date(z.getFullYear(), z.getMonth() - (sp > 0 && !schmal() ? 1 : 0), 1); offen.richtung = sp > 0 ? 1 : -1; kalender(offen); lage(); x = innen.querySelector('[data-tag="' + iso(z) + '"]'); }
      if (x) { innen.querySelectorAll('.lw-tag[tabindex="0"]').forEach(function (y) { y.tabIndex = -1; }); x.tabIndex = 0; x.focus({ preventScroll: true }); }
    } else {
      var a = e.target.closest('.lw-wahl'); if (!a) return;
      var alle = [].slice.call(innen.querySelectorAll('.lw-wahl')), i = alle.indexOf(a);
      var j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? alle.length - 1 : -2;
      if (j === -2) return; e.preventDefault(); j = Math.max(0, Math.min(alle.length - 1, j)); alle[j].focus({ preventScroll: true });
    }
  });

  /* Gäste: die Wahl aus dem echten Feld, als Liste im Stil der Leiste */
  function gaesteListe(o) {
    var h = '<div class="lw-gaeste" role="listbox" aria-label="' + W.gaeste + '">';
    [].forEach.call(o.s.g.options, function (op, i) {
      var ja = op.value === o.s.g.value;
      h += '<button type="button" class="lw-wahl" role="option" data-wert="' + op.value + '" aria-selected="' + ja + '" style="--i:' + i + '"><b>' + op.value + '</b><span>' + op.textContent.replace(/^\s*\d+\s*/, '') + '</span></button>';
    });
    innen.innerHTML = h + '</div>';
  }

  function zeige(s) {
    var an = lies(s.an.value), ab = lies(s.ab.value);
    s.knAn.textContent = an ? fKurz.format(an) : '';
    s.knAb.textContent = ab ? fKurz.format(ab) : '';
    var op = s.g.options[s.g.selectedIndex]; s.knG.textContent = op ? op.textContent : '';
  }
  function knopf(feld, art) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'lw';
    b.setAttribute('aria-haspopup', art === 'g' ? 'listbox' : 'dialog'); b.setAttribute('aria-expanded', 'false');
    feld.classList.add('lw-nativ'); feld.tabIndex = -1; feld.setAttribute('aria-hidden', 'true');
    feld.parentNode.insertBefore(b, feld.nextSibling);
    var lab = feld.closest('label'), sp = lab && lab.querySelector('span');
    if (sp) { sp.id = sp.id || 'lw-' + Math.random().toString(36).slice(2, 8); b.setAttribute('aria-labelledby', sp.id + ' ' + (b.id = sp.id + '-w')); }
    if (lab) lab.addEventListener('click', function (e) { e.preventDefault(); if (e.target !== b) b.click(); });
    return b;
  }
  forms.forEach(function (f) {
    var s = { an: f.elements.an, ab: f.elements.ab, g: f.elements.gaeste }; if (!s.an || !s.ab || !s.g) return;
    s.knAn = knopf(s.an, 'an'); s.knAb = knopf(s.ab, 'ab'); s.knG = knopf(s.g, 'g');
    f.addEventListener('transitionend', function (e) { if (e.target === f) folge(); });
    zeige(s);
    s.knAn.addEventListener('click', function () { auf({ art: 'kal', modus: 'an', feld: s.knAn, form: f, s: s }); });
    s.knAb.addEventListener('click', function () { auf({ art: 'kal', modus: 'ab', feld: s.knAb, form: f, s: s }); });
    s.knG.addEventListener('click', function () { auf({ art: 'g', feld: s.knG, form: f, s: s }); });
    [s.knAn, s.knAb, s.knG].forEach(function (b) { b.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' && !offen) { e.preventDefault(); b.click(); } }); });
    /* Werte, die main.js beim Laden setzt, erst danach anzeigen */
    setTimeout(function () { zeige(s); }, 0);
  });
})();

/* Startseite Zimmer: Bild neigt sich zur Maus (Robert 11.10.2026). Nur Rechner mit Maus, nicht bei «weniger Bewegung». */
(function () {
  if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var MAX = 1.6;
  [].forEach.call(document.querySelectorAll('#zimmer .drei .kachel, #weitere .drei .kachel, #bad .wand__k, #hochzeit .stapel figure, #pauschalen .tp, #pauschalen .tpd, #raeume .ent__k, .k3, .k3t'), function (k) {
    var b = k.querySelector('.kachel__b, .st__b, .k3t__p'), rahmen = null, uhr = 0, mx = 0, my = 0;
    if (!b) return;
    var setze = function () {
      uhr = 0;
      var x = (mx - rahmen.left) / rahmen.width - 0.5, y = (my - rahmen.top) / rahmen.height - 0.5;
      x = Math.max(-0.5, Math.min(0.5, x)); y = Math.max(-0.5, Math.min(0.5, y));
      k.style.setProperty('--ry', (x * MAX * 2).toFixed(2) + 'deg');
      k.style.setProperty('--rx', (-y * MAX * 2).toFixed(2) + 'deg');
      k.style.setProperty('--gx', (x * 60).toFixed(1) + '%');
      k.style.setProperty('--gy', (y * 60).toFixed(1) + '%');
    };
    k.addEventListener('pointerenter', function () { rahmen = b.getBoundingClientRect(); k.classList.add('kipp'); });
    k.addEventListener('pointermove', function (e) {
      if (!rahmen) rahmen = b.getBoundingClientRect();
      mx = e.clientX; my = e.clientY;
      if (!uhr) uhr = requestAnimationFrame(setze);
    });
    k.addEventListener('pointerleave', function () {
      if (uhr) { cancelAnimationFrame(uhr); uhr = 0; }
      rahmen = null; k.classList.remove('kipp');
      ['--rx', '--ry', '--gx', '--gy'].forEach(function (v) { k.style.removeProperty(v); });
    });
    window.addEventListener('scroll', function () { rahmen = null; }, { passive: true });
  });
})();

/* ---------- Grosse Fensterbilder in der Ruhe vorbereiten (11.10.2026, Messung Startseite) ----------
   Ein Fensterbild (.bruch, bis 2560 px) steht fest über dem ganzen Schirm und wird erst sichtbar geschaltet, wenn sein Abschnitt naht
   (bilder.js, Klasse nah). In genau dem Moment musste der Browser es entpacken, mitten im Scrollen: ein einzelnes langes Bild
   (Spur: ImageDecodeTask 31–37 ms; ohne Fensterbilder kein langes Bild mehr). Jetzt wird es vorher geholt und, sobald die Seite
   einen Augenblick stillsteht, vorher sichtbar geschaltet (am Rechner alle gleich nach dem Laden, am Handy bis sechs Bildschirme
   voraus): Das Entpacken fällt in die Ruhe.
   Kein Eingriff in den Scroll, keine Arbeit im Takt. Ändert nichts am Aussehen. */
(function () {
  var fenster = [].slice.call(document.querySelectorAll('.bruch')); if (!fenster.length) return;
  var ruhe = 0;
  var bereit = function () {
    var h = window.innerHeight;
    fenster = fenster.filter(function (b) {
      if (b.classList.contains('nah')) return false;
      var weit = window.innerWidth > 860 ? 1e9 : 7, nahe = window.innerWidth > 860 ? 1e9 : 6;   /* am Rechner alle gleich nach dem Laden, am Handy sechs Bildschirme voraus */
      var r = b.getBoundingClientRect(); if (r.top > h * weit || r.bottom < -h * weit) return true;
      var im = b.querySelector('img'); if (!im) return false;
      if (!(im.complete && im.naturalWidth)) { im.loading = 'eager'; im.addEventListener('load', function () { clearTimeout(ruhe); ruhe = setTimeout(bereit, 350); }, { once: true }); return true; }
      if (r.top < h * nahe && r.bottom > -h * nahe) { b.classList.add('nah'); return false; }
      return true;
    });
  };
  /* Fensterbilder, die weit hinter einem liegen (über drei Bildschirme oben), wieder ausblenden: so hält der Browser nie mehr als
     ein, zwei grosse Bilder bereit und muss keines mitten im Scrollen neu entpacken, weil der Speicher voll ist. Höchstens alle 400 ms. */
  var alle = [].slice.call(document.querySelectorAll('.bruch')), zuletzt = 0;
  var hinten = function () {
    if (window.innerWidth > 860) return;   /* nur am Handy: Speicher knapper, Bilder dort klein (1200 px) */
    var h = window.innerHeight;
    alle.forEach(function (b) { if (b.classList.contains('nah') && b.getBoundingClientRect().bottom < -h * 3) { b.classList.remove('nah'); if (fenster.indexOf(b) < 0) fenster.push(b); } });
  };
  window.addEventListener('scroll', function () {
    clearTimeout(ruhe); ruhe = setTimeout(bereit, 350);
    var t = Date.now(); if (t - zuletzt > 400) { zuletzt = t; hinten(); }
  }, { passive: true });
  window.addEventListener('load', function () { setTimeout(bereit, 600); });
})();

/* ---------- Ausflüge: Bildgruppen und Reisebuch (Robert 11.10.2026, vierte Fassung) ----------
   Ein Ziel in der Zeile wählen (überfahren, antippen, Tastatur) oder die Pfeile wechseln Bildgruppe und Text. Von selbst blättert es
   alle sieben Sekunden weiter, nur solange es im Bild ist und die Maus nicht darauf liegt; die Goldlinie unter dem Namen läuft als
   Zeiger. Gewechselt wird nur über Deckkraft. Die Fotos werden vorher geladen und entpackt. */
(function () {
  document.querySelectorAll('[data-abf]').forEach(function (a) {
    var gruppen = [].slice.call(a.querySelectorAll('.abf__gruppe')), blaetter = [].slice.call(a.querySelectorAll('.abf__blatt')), wahl = [].slice.call(a.querySelectorAll('.abf__wahl')), n = wahl.length;
    if (!n || gruppen.length !== n || blaetter.length !== n) return;
    var DAUER = 7000, jetzt = 0, uhr = 0, sicht = false, halt = false, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    a.style.setProperty('--dauer', DAUER / 1000 + 's');
    var neuZeiger = function () { var z = wahl[jetzt]; z.classList.remove('ist'); void z.offsetWidth; z.classList.add('ist'); };
    var takt = function () { clearTimeout(uhr); if (!sicht || halt || ruhig) return; uhr = setTimeout(function () { zeig(jetzt + 1); }, DAUER); };
    function zeig(i) {
      i = (i + n) % n; if (i === jetzt) return;
      [gruppen, blaetter, wahl].forEach(function (l) { l[jetzt].classList.remove('ist'); l[i].classList.add('ist'); });
      gruppen[jetzt].setAttribute('aria-hidden', 'true'); gruppen[i].removeAttribute('aria-hidden');
      wahl[jetzt].setAttribute('aria-pressed', 'false'); wahl[i].setAttribute('aria-pressed', 'true');
      jetzt = i; takt();
    }
    wahl.forEach(function (z, i) {
      z.addEventListener('mouseenter', function () { zeig(i); });
      z.addEventListener('click', function () { zeig(i); });
      z.addEventListener('focus', function () { zeig(i); });
    });
    (a.parentElement || a).querySelectorAll('[data-abf-schritt]').forEach(function (b) { b.addEventListener('click', function () { zeig(jetzt + (+b.getAttribute('data-abf-schritt'))); }); });
    a.addEventListener('mouseenter', function () { halt = true; a.classList.add('halt'); clearTimeout(uhr); });
    a.addEventListener('mouseleave', function () { halt = false; a.classList.remove('halt'); neuZeiger(); takt(); });
    new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; if (sicht) { neuZeiger(); takt(); } else clearTimeout(uhr); }, { threshold: .25 }).observe(a);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      a.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
    }, { rootMargin: '150% 0px' }).observe(a);
  });
})();

/* ---------- Restaurants: «Am Kamin» färbt den Abschnitt nachtblau (Robert 11.10.2026) ---------- */
(function () {
  var s = document.getElementById('tafel'), leiste = document.querySelector('[data-reiter="jahreszeit"]'); if (!s || !leiste) return;
  [].forEach.call(leiste.querySelectorAll('.tab'), function (t, i) {
    t.addEventListener('click', function () { s.classList.toggle('kamin', i === 1); s.classList.toggle('dunkel', i === 1); });
  });
})();

/* Ausflüge (Robert 11.10.2026): Auftritt erst, wenn der Block gut im Bild ist (dann steigen die Kacheln weit herauf); danach
   kürzerer Weg bei jedem Wechsel. Der Wechsel selbst läuft in CSS (erst gehen die alten Kacheln, dann kommen die neuen). */
(function () {
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-abf]').forEach(function (a) {
    if (ruhig || !('IntersectionObserver' in window)) { a.classList.add('auf'); return; }
    a.querySelectorAll('.abf__f img').forEach(function (im) { im.loading = 'eager'; });
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      a.classList.add('auf', 'erst'); setTimeout(function () { a.classList.remove('erst'); }, 2600);
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0 }).observe(a);
  });
})();

/* ---------- Ballsaal als Bühne (Robert 11.10.2026) ----------
   Abzug wählen (überfahren, antippen, Tastatur) wechselt Bühnenfoto und Zahlen; von selbst alle acht Sekunden, nur solange die Bühne
   im Bild ist und die Maus nicht darauf liegt. Fotos vorher laden und entpacken. Der Bild-Vorhang (108 % → 100 %) startet mit .da. */
(function () {
  document.querySelectorAll('[data-sb]').forEach(function (s) {
    var f = [].slice.call(s.querySelectorAll('.sb__f')), t = [].slice.call(s.querySelectorAll('.sb__satz')), a = [].slice.call(s.querySelectorAll('.sb__abzug')), n = a.length;
    if (!n || f.length !== n || t.length !== n) return;
    var jetzt = 0, uhr = 0, sicht = false, halt = false, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var takt = function () { clearTimeout(uhr); if (!sicht || halt || ruhig) return; uhr = setTimeout(function () { zeig(jetzt + 1); }, 8000); };
    function zeig(i) {
      i = (i + n) % n; if (i === jetzt) return;
      [f, t, a].forEach(function (l) { l[jetzt].classList.remove('ist'); l[i].classList.add('ist'); });
      a[jetzt].setAttribute('aria-pressed', 'false'); a[i].setAttribute('aria-pressed', 'true'); jetzt = i; takt();
    }
    a.forEach(function (b, i) { b.addEventListener('mouseenter', function () { zeig(i); }); b.addEventListener('click', function () { zeig(i); }); b.addEventListener('focus', function () { zeig(i); }); });
    s.addEventListener('mouseenter', function () { halt = true; clearTimeout(uhr); });
    s.addEventListener('mouseleave', function () { halt = false; takt(); });
    new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; if (sicht) takt(); else clearTimeout(uhr); }, { threshold: .3 }).observe(s);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      s.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
    }, { rootMargin: '150% 0px' }).observe(s);
  });
})();


/* Filmwand im Salon (Robert 11.10.2026): die Streifen laufen nur, solange sie zu sehen sind */
(function () {
  var fw = document.querySelectorAll('.film'); if (!fw.length) return;
  if (!('IntersectionObserver' in window)) { [].forEach.call(fw, function (f) { f.classList.add('laeuft'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '80px 0px' });
  [].forEach.call(fw, function (f) { io.observe(f); });
})();

/* ---------- Strich auf der Naht: die Tapete läuft vom Abschnitt davor ohne Sprung weiter (Robert 11.10.2026) ---------- */
(function () {
  var s = document.querySelector('.fl:has(>.strich--naht)') || document.getElementById('saal'); if (!s || !s.previousElementSibling) return;   /* auch ohne Strich (Robert 11.10.2026: Strich entfernt), sonst springt das Muster */
  var vor = s.previousElementSibling, k = new Image();
  var setze = function () { var h = 340 * k.naturalHeight / k.naturalWidth; if (!h) return; s.style.setProperty('--tapete-y', (-(vor.offsetHeight % h)).toFixed(1) + 'px'); };
  k.onload = setze; k.src = (((document.querySelector('script[src*="assets/js/main.js"]') || {}).src || '').replace(/assets\/js\/main\.js.*$/, '')) + 'assets/img/tapete-hell.webp';   /* Pfad auch aus en/ und fr/ */
  window.addEventListener('resize', setze); window.addEventListener('load', setze);
})();

/* Naht-Zeichen über dem Ballsaal (Robert 11.10.2026): ist «Am Kamin» an und der Abschnitt darüber nachtblau, wird die obere Hälfte des Zeichens weiss.
   Eine zweite, weisse Kopie liegt genau darüber und zeigt nur die obere Hälfte. */
(function () {
  [].forEach.call(document.querySelectorAll('.strich--naht'), function (n) {
    var sv = n.querySelector('svg'); if (!sv || n.querySelector('.naht-oben')) return;
    var k = sv.cloneNode(true); k.setAttribute('class', 'naht-oben'); k.setAttribute('aria-hidden', 'true'); n.appendChild(k);
  });
})();

/* Package-Karten: die Mini-Animation rechts startet, sobald die Karte gut im Bild ist (auch beim Blättern im Band) */
(function () {
  var kk = document.querySelectorAll('#angebote .lk'); if (!kk.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { kk.forEach(function (k) { k.classList.add('zeig'); }); return; }
  var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('zeig'); o.unobserve(e.target); } }); }, { threshold: .45 });
  kk.forEach(function (k) { o.observe(k); });
})();

/* Gäste-Urkunde: alles startet, sobald die Platte gut im Bild ist */
(function () {
  var u = document.querySelectorAll('[data-urk]'); if (!u.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { u.forEach(function (k) { k.classList.add('zeig'); }); return; }
  var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('zeig'); o.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  u.forEach(function (k) { o.observe(k); });
})();

/* ---------- Ballsaal: zwei Bildbänder (Robert 11.10.2026, Vorschlag 12) ----------
   Die Bänder laufen per CSS-Animation (nur transform). Hier nur: ausserhalb des Bildes anhalten, Bilder vorher laden und entpacken. */
(function () {
  document.querySelectorAll('[data-bd]').forEach(function (b) {
    /* Anhalten und Wiederanlaufen nur weit ausserhalb des Bildes (einen Bildschirm Abstand): sonst hakt das Band beim Hereinkommen
       einmal ein, bevor es läuft (Robert 11.10.2026). Bilder laden und entpacken noch früher, damit beim Anlaufen alles bereitliegt. */
    new IntersectionObserver(function (es) { b.classList.toggle('ruht', !es[0].isIntersecting); }, { rootMargin: '100% 0px' }).observe(b);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      b.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
    }, { rootMargin: '300% 0px' }).observe(b);
    /* Auftritt je Reihe wie die übrigen Bilder der Seite: von unten herein, sobald die Reihe im Fenster ist. Gestaffelt wird nur, was gerade
       im Bild steht (von links nach rechts); Karten ausserhalb sind sofort da und laufen normal herein. */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    b.classList.add('ein');
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; rio.unobserve(e.target);
        var r = e.target, sicht = [];
        [].forEach.call(r.querySelectorAll('.bd__k'), function (k) {
          var q = k.getBoundingClientRect();
          if (q.right > 0 && q.left < innerWidth) sicht.push({ k: k, x: q.left }); else k.style.transition = 'none';
        });
        sicht.sort(function (p, q) { return p.x - q.x; });
        sicht.forEach(function (s, i) { s.k.style.setProperty('--i', i); });
        r.classList.add('da');
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0 });
    b.querySelectorAll('.bd__reihe').forEach(function (r) { rio.observe(r); });
  });
})();

/* Gäste-Noten zählen beim Ankommen von 0 bis zur Note hoch, mit Komma (Robert 11.10.2026) */
(function () {
  var zz = document.querySelectorAll('.stimme__z[data-wert]'); if (!zz.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  zz.forEach(function (z) { z.textContent = '0,0'; });
  var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; o.unobserve(e.target);
    var z = e.target, ziel = +z.getAttribute('data-wert'), t0 = null, d = 1800, i = [].indexOf.call(zz, z);
    var tLetzt = 0;
    setTimeout(function () { requestAnimationFrame(function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / d), w = 1 - Math.pow(1 - p, 4);
      if (p < 1 && t - tLetzt < 45) { requestAnimationFrame(f); return; } tLetzt = t;
      z.textContent = (ziel * w).toFixed(1).replace('.', ','); if (p < 1) requestAnimationFrame(f); }); }, 250 + i * 160);
  }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  zz.forEach(function (z) { o.observe(z); });
})();

/* ---------- Abschied als Ticket (Robert 11.10.2026): aufsteigen, sobald ein Viertel im Bild ist; Perforation an die echte Lage setzen ---------- */
(function () {
  var t = document.querySelector('[data-ticket]'); if (!t) return;
  var k = t.querySelector('.abschied__karte'), r = t.querySelector('.ticket__riss');
  var lege = function () { if (r && k.offsetHeight) k.style.setProperty('--perf', (r.offsetTop + 1) + 'px'); };
  lege(); window.addEventListener('resize', lege); window.addEventListener('load', lege);
  /* schon beim Betreten des Abschnitts losfahren, nicht erst wenn die Karte im Bild ist (Robert 11.10.2026) */
  new IntersectionObserver(function (es, o) { if (!es[0].isIntersecting) return; o.disconnect(); lege(); t.classList.add('da'); }, { threshold: 0, rootMargin: '0px 0px -10% 0px' }).observe(t.closest('.abschied') || t);
})();

/* ---------- Zimmerseite «Gut zu wissen» als Bühne (Robert 11.10.2026) ----------
   Frage wählen (überfahren, antippen, Tastatur) wechselt Foto und Antwort; von selbst alle acht Sekunden, nur solange die Bühne im Bild ist
   und die Maus nicht darauf liegt. Auftritt einmal, wenn der Block gut im Bild ist. Fotos vorher laden und entpacken. */
(function () {
  document.querySelectorAll('[data-gw]').forEach(function (g) {
    var f = [].slice.call(g.querySelectorAll('.gw__f')), t = [].slice.call(g.querySelectorAll('.gw__a')), q = [].slice.call(g.querySelectorAll('.gw__q')), n = q.length;
    if (!n || f.length !== n || t.length !== n) return;
    var DAUER = 8000, jetzt = 0, uhr = 0, sicht = false, halt = false, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    g.style.setProperty('--dauer', DAUER / 1000 + 's');
    var neuZeiger = function () { var z = q[jetzt]; z.classList.remove('ist'); void z.offsetWidth; z.classList.add('ist'); };
    var takt = function () { clearTimeout(uhr); if (!sicht || halt || ruhig || !g.classList.contains('auf')) return; uhr = setTimeout(function () { zeig(jetzt + 1); }, DAUER); };
    function zeig(i) {
      i = (i + n) % n; if (i === jetzt) return;
      [f, t, q].forEach(function (l) { l[jetzt].classList.remove('ist'); l[i].classList.add('ist'); });
      q[jetzt].setAttribute('aria-pressed', 'false'); q[i].setAttribute('aria-pressed', 'true'); jetzt = i; takt();
    }
    q.forEach(function (b, i) {
      b.addEventListener('mouseenter', function () { zeig(i); }); b.addEventListener('click', function () { zeig(i); }); b.addEventListener('focus', function () { zeig(i); });
    });
    g.addEventListener('mouseenter', function () { halt = true; g.classList.add('halt'); clearTimeout(uhr); });
    g.addEventListener('mouseleave', function () { halt = false; g.classList.remove('halt'); neuZeiger(); takt(); });
    new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; if (sicht) takt(); else clearTimeout(uhr); }, { threshold: .3 }).observe(g);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      g.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
    }, { rootMargin: '150% 0px' }).observe(g);
    if (ruhig || !('IntersectionObserver' in window)) { g.classList.add('auf'); return; }
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      g.classList.add('auf', 'erst'); setTimeout(function () { g.classList.remove('erst'); }, 3200); takt();
    }, { rootMargin: '0px 0px -22% 0px', threshold: 0 }).observe(g);
  });
})();


/* Seitenkopf: Text gleitet beim Wegscrollen langsamer nach oben und blendet aus, während die Platte darüberfährt (ein Takt, nur translate/opacity) */
(function () {
  var sk = document.querySelector('.sk:is(.sk--mitte,.sk--fakten,.sk--halb,.sk--abzuege,.sk--tafel)'); if (!sk) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  /* Wo der Browser die Scroll-Zeitachse kann, macht das CSS (_gbr.css «Seitenköpfe beim Wegscrollen»): kein Ausblenden, gestaffeltes Gleiten (Robert 11.10.2026) */
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  var tx = sk.querySelectorAll('.sk__in, .sk > .raum'), h = sk.offsetHeight, offen = false;
  function zug() { offen = false; var y = Math.min(scrollY, h);
    for (var i = 0; i < tx.length; i++) { tx[i].style.translate = '0 ' + (y * .3).toFixed(1) + 'px'; } }
  addEventListener('scroll', function () { if (!offen && scrollY < h * 1.1) { offen = true; requestAnimationFrame(zug); } }, { passive: true });
  addEventListener('resize', function () { h = sk.offsetHeight; });
  zug();
})();

/* «Gut zu wissen»: Karte antippen lässt die Antwort aufsteigen, der Knauf auf dem Blatt schliesst sie wieder */
(function () {
  document.querySelectorAll('[data-gk] .gk__k').forEach(function (k) {
    var vor = k.querySelector('.gk__auf'), zu = k.querySelector('.gk__zu'), r = k.querySelector('.gk__r');
    function setz(auf, taste) {
      k.classList.toggle('auf', auf); vor.setAttribute('aria-expanded', auf ? 'true' : 'false'); r.setAttribute('aria-hidden', auf ? 'false' : 'true');
      vor.tabIndex = auf ? -1 : 0; zu.tabIndex = auf ? 0 : -1; r.querySelectorAll('a').forEach(function (a) { a.tabIndex = auf ? 0 : -1; });
      /* Fokus nur für die Tastatur weiterreichen und erst, wenn das Blatt steht: sonst schiebt der Browser den Karteninhalt zum Knauf (Robert 11.10.2026: «Kachel verlässt ihre Position») */
      if (taste) setTimeout(function () { (auf ? zu : vor).focus({ preventScroll: true }); }, auf ? 950 : 0);
      k.scrollTop = 0; k.scrollLeft = 0;
    }
    vor.addEventListener('click', function (e) { setz(true, e.detail === 0); });
    zu.addEventListener('click', function (e) { setz(false, e.detail === 0); });
  });
})();

/* Fuss: «Nach oben» (Robert 11.10.2026) */
(function () {
  document.querySelectorAll('[data-hoch]').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  });
})();

/* Kachel-Effekt wie die Zimmer der Startseite (Robert 11.10.2026): Band «Aus den Zimmern und Suiten» und Raumbühne auf Feiern & Tagen.
   Bild neigt sich zur Maus, hebt sich, Licht wandert mit. Nur Rechner mit Maus, nicht bei «weniger Bewegung»; nur transform. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var MAX = 1.6;
  [['#zimmer .zi-blicke .eb', '.rahmen__k'], ['#raeume .sbuehne', '.sbuehne__b'], ['.ak__vier .ak__k', '.ak__b']].forEach(function (p) {   /* .ak__k: vier Kacheln über der Schlusskarte */
    [].forEach.call(document.querySelectorAll(p[0]), function (k) {
      var b = k.querySelector(p[1]), rahmen = null, uhr = 0, mx = 0, my = 0;
      if (!b) return;
      k.classList.add('k3'); b.classList.add('k3b');
      var setze = function () {
        uhr = 0; if (!rahmen) return;
        var x = (mx - rahmen.left) / rahmen.width - 0.5, y = (my - rahmen.top) / rahmen.height - 0.5;
        x = Math.max(-0.5, Math.min(0.5, x)); y = Math.max(-0.5, Math.min(0.5, y));
        k.style.setProperty('--ry', (x * MAX * 2).toFixed(2) + 'deg');
        k.style.setProperty('--rx', (-y * MAX * 2).toFixed(2) + 'deg');
        k.style.setProperty('--gx', (x * 60).toFixed(1) + '%');
        k.style.setProperty('--gy', (y * 60).toFixed(1) + '%');
      };
      b.addEventListener('pointerenter', function () { rahmen = b.getBoundingClientRect(); k.classList.add('kipp'); });
      b.addEventListener('pointermove', function (e) {
        if (!rahmen) rahmen = b.getBoundingClientRect();
        mx = e.clientX; my = e.clientY;
        if (!uhr) uhr = requestAnimationFrame(setze);
      });
      b.addEventListener('pointerleave', function () {
        if (uhr) { cancelAnimationFrame(uhr); uhr = 0; }
        rahmen = null; k.classList.remove('kipp');
        ['--rx', '--ry', '--gx', '--gy'].forEach(function (v) { k.style.removeProperty(v); });
      });
      window.addEventListener('scroll', function () { rahmen = null; }, { passive: true });
    });
  });
})();

/* Speisekarte mit Bögen (Robert 11.10.2026): beim Wechsel des Gangs stehen die Karten sofort da und Pfeile/Laufbalken rechnen neu */
(function () {
  document.querySelectorAll('[data-mkb] [data-reiter] .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      var mkb = t.closest('[data-mkb]');
      setTimeout(function () {
        mkb.querySelectorAll('[data-feld]:not([hidden]) .mg').forEach(function (m, i) { setTimeout(function () { m.classList.add('da'); }, i * 70); });
        mkb.querySelectorAll('[data-feld]:not([hidden]) .band').forEach(function (b) { b.scrollLeft = 0; });
        window.dispatchEvent(new Event('resize'));
      }, 20);
    });
  });
})();


/* «Ein Rundgang durchs Haus» (Das Haus): grosses Bild mittig, Nachbarn leise daneben (Robert 11.10.2026: «grösser», «flüssiger»;
   2. Fassung: «sehr langsam und stockt» → kein Scrollen mehr, das Band fährt per transform mit CSS-Übergang auf dem Grafikchip;
   3. Fassung: «links ein Bild, aus der Luft, dass sich der Kreis schliesst» → endloser Kreis: vor und hinter den Bildern liegt je eine
   Kopie der Reihe, nach jeder Fahrt springt das Band unsichtbar zurück in die Mitte).
   Pfeile, Klick aufs Nachbarbild, Wischen und Ziehen mit der Maus (folgt dem Finger, rastet beim Loslassen). */
(function () {
  [].forEach.call(document.querySelectorAll('.gang--fliess'), function (g) {
    var band = g.querySelector('.band'); if (!band) return;
    var echt = [].slice.call(band.querySelectorAll('.k3')), n = echt.length; if (!n) return;
    var kopie = function (k) { var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('data-lupe'); [].forEach.call(c.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); }); return c; };
    echt.slice().reverse().forEach(function (k) { band.insertBefore(kopie(k), band.firstChild); });
    echt.forEach(function (k) { band.appendChild(kopie(k)); });
    var karten = [].slice.call(band.querySelectorAll('.k3')), jetzt = n, x = 0, pf = g.querySelectorAll('.pfeile button'), uhr = 0;
    var lage = function (i) { var k = karten[i]; return band.clientWidth / 2 - (k.offsetLeft + k.offsetWidth / 2); };
    var setze = function (i) {
      jetzt = i; x = lage(i);
      band.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      karten.forEach(function (k, m) { k.classList.toggle('an', m === i); });
    };
    var still = function (i) { band.classList.add('still'); setze(i); band.offsetWidth; band.classList.remove('still'); };
    var heim = function () { uhr = 0; if (jetzt < n) still(jetzt + n); else if (jetzt >= 2 * n) still(jetzt - n); };
    var zeig = function (i) {
      i = Math.max(0, Math.min(karten.length - 1, i)); setze(i);
      clearTimeout(uhr); uhr = setTimeout(heim, 700);
    };
    [].forEach.call(pf, function (b) { b.disabled = false; b.addEventListener('click', function () { zeig(jetzt + (+b.getAttribute('data-richtung'))); }); });
    var unten = false, x0 = 0, y0 = 0, dx = 0, quer = null, gezogen = false;
    band.addEventListener('pointerdown', function (e) { unten = true; gezogen = false; quer = null; x0 = e.clientX; y0 = e.clientY; dx = 0; });
    window.addEventListener('pointermove', function (e) {
      if (!unten) return; dx = e.clientX - x0; var dy = e.clientY - y0;
      if (quer === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) quer = Math.abs(dx) > Math.abs(dy);
      if (!quer) return; gezogen = true; band.classList.add('still');
      band.style.transform = 'translate3d(' + (x + dx * .9).toFixed(1) + 'px,0,0)';
    }, { passive: true });
    var los = function () {
      if (!unten) return; unten = false; band.classList.remove('still');
      if (gezogen) { var w = karten[jetzt].offsetWidth; zeig(jetzt + (dx < -w * .12 ? 1 : dx > w * .12 ? -1 : 0)); }
    };
    window.addEventListener('pointerup', los); window.addEventListener('pointercancel', los);
    karten.forEach(function (k, m) { k.addEventListener('click', function (e) { if (gezogen || m !== jetzt) { e.preventDefault(); e.stopPropagation(); if (!gezogen) zeig(m); } }, true); });
    still(n);
    window.addEventListener('load', function () { still(jetzt); });
    window.addEventListener('resize', function () { still(jetzt); });
  });
})();

/* Galerie «Weitere Zimmer & Suiten»: die Pfeile gleiten ruhig zur nächsten Kachel (1,1 s, weich an- und auslaufend) statt des harten
   Browser-Sprungs (Robert 11.10.2026: «Übergänge zwischen den Bildern eleganter»). Ziehen und Wischen bleiben nativ. */
(function () {
  var g = document.querySelector('#weitere .zd-band'); if (!g) return;
  var b = g.querySelector('.band'), pf = g.querySelector('.pfeile'); if (!b || !pf) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches, lauf = 0, ziel = null;
  var weich = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  pf.addEventListener('click', function (e) {
    var btn = e.target.closest('button'); if (!btn) return; e.stopPropagation();
    var ks = [].slice.call(b.children); if (!ks.length) return;
    var p0 = ks[0].offsetLeft, pos = ks.map(function (k) { return k.offsetLeft - p0; }), max = b.scrollWidth - b.clientWidth;
    var von = ziel !== null ? ziel : b.scrollLeft, i = 0;
    pos.forEach(function (p, j) { if (p <= von + 8) i = j; });
    var n = Math.max(0, Math.min(pos.length - 1, i + (+btn.getAttribute('data-richtung'))));
    ziel = Math.min(max, pos[n]);
    if (ruhig) { b.scrollLeft = ziel; ziel = null; return; }
    cancelAnimationFrame(lauf); b.style.scrollSnapType = 'none';
    var start = b.scrollLeft, weg = ziel - start, t0 = performance.now(), d = 1100;
    var schritt = function (t) {
      var f = Math.min(1, (t - t0) / d); b.scrollLeft = start + weg * weich(f);
      if (f < 1) lauf = requestAnimationFrame(schritt); else { b.style.scrollSnapType = ''; ziel = null; }
    };
    lauf = requestAnimationFrame(schritt);
  }, true);
})();

/* Speisekarte: sobald die Karte in die Nähe kommt, laden alle Bilder des offenen Gangs sofort (im seitlichen Band greift «lazy» sonst erst beim Blättern) */
(function () {
  var los = function (mkb) { mkb.querySelectorAll('[data-feld]:not([hidden]) img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; }); };
  document.querySelectorAll('[data-mkb]').forEach(function (mkb) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { los(mkb); io.disconnect(); } }); }, { rootMargin: '900px 0px' });
      io.observe(mkb);
    } else los(mkb);
    mkb.querySelectorAll('[data-reiter] .tab').forEach(function (t) { t.addEventListener('click', function () { setTimeout(function () { los(mkb); }, 0); }); });
  });
})();

/* ---------- Schlussleiste (Robert 11.10.2026, «3D-Effekt»): unter der Maus neigt sich die Leiste leicht mit (höchstens 4°), ein Glanz folgt dem Zeiger.
   Gerechnet nur bei Mausbewegung über der Leiste, ein Takt je Bild, nur transform. Auf Touch und bei «weniger Bewegung» aus. ---------- */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-akl]').forEach(function (l) {
    var inn = l.querySelector('.akl__in'), gl = l.querySelector('.akl__glanz'), x = 0, y = 0, takt = 0;
    function rechne() { takt = 0; var r = inn.getBoundingClientRect(), px = (x - r.left) / r.width, py = (y - r.top) / r.height;
      inn.style.setProperty('--ry', ((px - .5) * 6).toFixed(2) + 'deg'); inn.style.setProperty('--rx', ((.5 - py) * 8).toFixed(2) + 'deg');
      if (gl) gl.style.setProperty('--gx', ((px * 3.4 - 1) * 100).toFixed(0) + '%'); }
    l.addEventListener('pointerenter', function () { l.classList.add('folgt'); });
    l.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!takt) takt = requestAnimationFrame(rechne); });
    l.addEventListener('pointerleave', function () { l.classList.remove('folgt'); inn.style.setProperty('--rx', '0deg'); inn.style.setProperty('--ry', '0deg'); });
  });
})();


/* Angebote: kleines Bild antippen = es fährt an die Stelle des grossen, das grosse in seinen Platz (Robert 11.10.2026: «genau denselben
   Effekt wie auf der Landingpage, dass sie sich tauschen»). Gleiche Fahrt wie [data-tausch] (880 ms, Kurve .36,0,.1,1, nur transform).
   Die Plätze haben verschiedene Formate: der Rahmen fährt mit getrennter Breite/Höhe, das Foto darin wird gegengerechnet, damit es nicht
   verzerrt. Das grosse Bild öffnet weiter die Lupe. */
(function () {
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  [].forEach.call(document.querySelectorAll('[data-tausch-gf]'), function (gf) {
    var plaetze = [].slice.call(gf.querySelectorAll(':scope > .ag-g')); if (plaetze.length < 2) return;
    var faehrt = false;
    var bereit = function () { plaetze.forEach(function (p, i) { var f = p.querySelector('.foto'); if (!f) return;
      if (i) { f.style.cursor = 'pointer'; f.setAttribute('role', 'button'); f.setAttribute('tabindex', '0'); } else { f.style.cursor = ''; f.removeAttribute('role'); f.removeAttribute('tabindex'); } }); };
    bereit();
    var tausche = function (klein) {
      var pk = klein.parentNode, pg = plaetze[0], gross = pg.querySelector('.foto'); if (!gross || faehrt || pk === pg) return;
      var a = gross.getBoundingClientRect(), b = klein.getBoundingClientRect();
      pg.appendChild(klein); pk.appendChild(gross);
      if (ruhig || !klein.animate) { bereit(); return; }
      faehrt = true;
      var A = klein.getBoundingClientRect(), B = gross.getBoundingClientRect();
      var fahrt = function (el, von, nach, z) {
        var sx = von.width / nach.width, sy = von.height / nach.height, k = Math.max(sx, sy), im = el.querySelector('img');
        el.style.zIndex = z; el.style.transformOrigin = '0 0';
        if (im) { var t0 = im.style.transform && im.style.transform !== 'none' ? im.style.transform : '';   /* Gleiten hält das Foto leicht vergrössert: Fahrt endet genau dort, sonst ploppt es am Ende (Robert 11.10.2026) */
          im.animate([{ transform: (t0 ? t0 + ' ' : '') + 'scale(' + (k / sx).toFixed(4) + ',' + (k / sy).toFixed(4) + ')' }, { transform: t0 || 'none' }], { duration: 880, easing: 'cubic-bezier(.36,0,.1,1)' }); }
        return el.animate([{ transform: 'translate(' + (von.left - nach.left).toFixed(1) + 'px,' + (von.top - nach.top).toFixed(1) + 'px) scale(' + sx.toFixed(5) + ',' + sy.toFixed(5) + ')' }, { transform: 'none' }], { duration: 880, easing: 'cubic-bezier(.36,0,.1,1)' });
      };
      var l1 = fahrt(klein, b, A, 4); fahrt(gross, a, B, 3);
      [klein, gross].forEach(function (f) { var c = f.querySelector('figcaption'); if (c) c.animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: 1080, easing: 'ease-out' }); });
      l1.onfinish = function () { [klein, gross].forEach(function (f) { f.style.zIndex = ''; f.style.transformOrigin = ''; }); faehrt = false; bereit(); };
    };
    gf.addEventListener('click', function (e) { var f = e.target.closest('.foto'); if (!f || !gf.contains(f) || f.parentNode === plaetze[0]) return; e.preventDefault(); e.stopPropagation(); tausche(f); }, true);
    gf.addEventListener('keydown', function (e) { var f = e.target.closest('.foto'); if (f && f.parentNode !== plaetze[0] && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tausche(f); } });
  });
})();

/* ---------- Erster Abschnitt «Am Fluss» (Robert 11.10.2026): das Aare-Bild gleitet im Ausschnitt gegen die Scrollrichtung, höchstens 8 % der Höhe.
   Ein Takt, rechnet nur, solange der Rahmen zu sehen ist, schreibt nur transform (Regel 55) ---------- */
(function () {
  var g = document.querySelectorAll('[data-gleiten]'); if (!g.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].forEach.call(g, function (el) {
    var r = el.parentElement, an = false, faellig = false;
    var takt = function () { faellig = false; if (!an) return; var b = r.getBoundingClientRect(), h = innerHeight, p = (h - b.top) / (h + b.height); p = p < 0 ? 0 : p > 1 ? 1 : p; el.style.setProperty('--g', ((0.5 - p) * b.height * 0.16).toFixed(1) + 'px'); };
    var los = function () { if (!faellig) { faellig = true; requestAnimationFrame(takt); } };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { an = es[0].isIntersecting; los(); }, { rootMargin: '20% 0px' }).observe(r); else an = true;
    addEventListener('scroll', los, { passive: true }); addEventListener('resize', los); los();
  });
})();

/* Zimmerkarte als Ticket: die Kerben sitzen auf der Abrisslinie über dem Zusatz (Höhe je Karte verschieden) */
(function () {
  var kk = document.querySelectorAll('.gz__karte'); if (!kk.length) return;
  function lege() { kk.forEach(function (k) { var d = k.querySelector('.gz__dazu'); if (d && d.offsetHeight) k.style.setProperty('--ky', d.offsetTop + 'px'); }); }
  lege(); window.addEventListener('resize', lege); window.addEventListener('load', lege); if (document.fonts && document.fonts.ready) document.fonts.ready.then(lege);
})();

/* Siegel im Fuss: Antippen öffnet das Fenster mit der Erklärung, nur der passende Teil steht offen (Robert 11.10.2026 abends) */
(function () {
  var d = document.querySelector('dialog.sgf'); if (!d || !d.showModal) return;
  var teile = d.querySelectorAll('[data-s]');
  document.querySelectorAll('[data-siegel]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-siegel');
      teile.forEach(function (t) { t.hidden = t.getAttribute('data-s') !== k; });
      d.showModal(); document.body.style.overflow = 'hidden';
    });
  });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  d.querySelector('.sgf__zu').addEventListener('click', function () { d.close(); });
  d.addEventListener('close', function () { document.body.style.overflow = ''; });

  /* ===== Eigene Module des Seiler au Lac ===== */
  /* ---------- Sonnenlauf: die Sonne wandert am rechten Rand mit der Seite von Morgen zu Nacht (ein Takt, nur transform) ---------- */
  var sl = $('[data-sonnenlauf]');
  if (sl && !ruhig) {
    var slSonne = $('i', sl), slMarken = $$('li', sl), slH = 0, slP = -1, slWartet = false;
    var slMass = function () { slH = sl.getBoundingClientRect().height; };
    var slLies = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      if (Math.abs(p - slP) < 0.0005) return; slP = p;
      slSonne.style.transform = 'translate3d(0,' + (p * slH).toFixed(1) + 'px,0)';
      var k = p < 0.17 ? 0 : p < 0.5 ? 1 : p < 0.84 ? 2 : 3;
      slMarken.forEach(function (m, i) { m.classList.toggle('an', i === k); });
    };
    slMass(); slLies();
    window.addEventListener('resize', function () { slMass(); slP = -1; slLies(); }, { passive: true });
    window.addEventListener('scroll', function () { if (slWartet) return; slWartet = true; requestAnimationFrame(function () { slWartet = false; slLies(); }); }, { passive: true });
  }
  /* ---------- Horizont: das Schiff kommt von rechts und legt an der Ländte an (einmal, sobald die Linie im Bild ist) ---------- */
  $$('[data-horizont]').forEach(function (h) {
    var s = $('.schiff', h); if (!s) return;
    var richte = function () { var r = h.getBoundingClientRect(), sr = s.getBoundingClientRect(); h.style.setProperty('--weg', (r.right - sr.left + 40).toFixed(0) + 'px'); };
    richte();
    if (ruhig || !('IntersectionObserver' in window)) { h.classList.add('da'); return; }
    var hio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { hio.unobserve(h); richte(); requestAnimationFrame(function () { h.classList.add('da'); }); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    hio.observe(h);
  });
  /* ---------- Feiern / Tagen: der Schalter hebt in der Raum-Tafel die Spalte hervor, die gilt ---------- */
  $$('[data-zaehlweise]').forEach(function (w) {
    var tabs = $$('.tab', w), ziel = document.getElementById(w.getAttribute('data-zaehlweise')); if (!ziel) return;
    var zeig = function (i) { tabs.forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); }); ziel.classList.toggle('zw-tagen', i === 1); };
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { zeig(i); }); });
    zeig(0);
  });
  /* ---------- Fragen an den Gast: eine Antwort je Wahl ---------- */
  $$('[data-frage]').forEach(function (fr) {
    var ks = $$('[data-wahl]', fr), felder = $$('[data-antwort]', fr);
    var zeig = function (i) { ks.forEach(function (k, j) { k.setAttribute('aria-pressed', j === i); }); felder.forEach(function (f, j) { f.hidden = false; f.classList.toggle('an', j === i); }); };
    ks.forEach(function (k, i) { k.addEventListener('click', function () { zeig(i); }); });
  });
  /* ---------- «Ein Tag am See» (Fassung 2h, Robert 10.10.2026): links das Foto, rechts Titel, Uhrzeit, Text; unten die Linie.
     Wechsel: das neue Foto hebt sich wie ein Vorhang von unten (Rahmen fährt hoch, Bild darin gegenläufig, nur transform),
     das alte gleitet dabei ein Stück nach oben weg; die Uhrzeit rollt Ziffer für Ziffer; der Text wechselt nach dem Ausblenden;
     Licht und Sonne gehen mit. Zurück läuft alles in die Gegenrichtung. ---------- */
  $$('[data-tagwerk]').forEach(function (w) {
    var sl = $$('.tw__s', w), zt = $$('.tw__z', w), fe = $$('.tw__feld', w), ha = $$('.tw__h', w), N = sl.length, n = 0, aufr = null, laeuft = [];
    var sec = w.closest('section'), licht = sec ? $$('.tl-licht i', sec) : [], linie = $('.tw__linie', w), sonne = $('.tw__sonne', w), gold = $('.tw__gold', w);
    var VORHANG = 'cubic-bezier(.77,0,.18,1)';
    function linieSetzen(i) {
      var bw = linie.offsetWidth / N;
      sonne.style.transform = 'translateX(' + (i * bw).toFixed(1) + 'px)';
      gold.style.transform = 'scaleX(' + (N > 1 ? i / (N - 1) : 0).toFixed(4) + ')';
    }
    function zeig(i, vor) {
      i = (i + N) % N; if (i === n) return;
      var alt = n; n = i; if (vor === undefined) vor = i > alt;
      ha.forEach(function (h, j) { h.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      fe.forEach(function (f, j) { f.classList.toggle('an', j === i); });
      licht.forEach(function (l, j) { if (j) l.classList.toggle('an', j === i + 1); });
      if (sec) sec.classList.toggle('tw-hell', i < 4);
      linieSetzen(i);
      /* Uhrzeit: die alte rollt hinaus, die neue herein */
      zt.forEach(function (z, j) { if (j !== i && j !== alt) { z.classList.add('still'); z.setAttribute('data-lage', 'u'); } });
      var nz = zt[i]; nz.classList.add('still'); nz.setAttribute('data-lage', vor ? 'u' : 'o'); void nz.offsetWidth; nz.classList.remove('still'); nz.setAttribute('data-lage', 'an');
      zt[alt].classList.remove('still'); zt[alt].setAttribute('data-lage', vor ? 'o' : 'u');
      /* Foto: weiches Überblenden. Das neue kommt über dem alten herein, steigt dabei ein wenig auf und kommt zur Ruhe,
         das alte bleibt deckend darunter, bis das neue steht (kein Durchscheinen, keine harte Kante) */
      laeuft.forEach(function (a) { try { a.finish(); } catch (e) {} }); laeuft = [];
      var neu = sl[i], weg = sl[alt], img = $('img', neu), zahl = $('.tw__zahl b', w);
      if (zahl) zahl.textContent = ('0' + (i + 1)).slice(-2);
      var los = function () {
        if (n !== i) return;
        sl.forEach(function (s) { if (s !== neu && s !== weg) s.classList.remove('an', 'war'); });
        weg.classList.remove('an'); weg.classList.add('war'); neu.classList.remove('war'); neu.classList.add('an');
        if (ruhig || !neu.animate) { weg.classList.remove('war'); return; }
        var d = vor ? 1 : -1;
        laeuft.push(neu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)' }));
        laeuft.push($('.tw__si', neu).animate([{ transform: 'translateY(' + (d * 3) + '%) scale(1.08)' }, { transform: 'none' }], { duration: 2000, easing: 'cubic-bezier(.16,1,.3,1)' }));
        laeuft.push($('.tw__si', weg).animate([{ transform: 'none' }, { transform: 'translateY(' + (-d * 2) + '%) scale(1.03)' }], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)' }));
        clearTimeout(aufr); aufr = setTimeout(function () { sl.forEach(function (s) { if (s !== sl[n]) s.classList.remove('war'); }); }, 1200);
      };
      if (img && !(img.complete && img.naturalWidth)) { img.loading = 'eager'; var go = function () { (img.decode ? img.decode() : Promise.resolve()).then(los, los); }; if (img.complete) go(); else img.addEventListener('load', go, { once: true }); }
      else if (img && img.decode) img.decode().then(los, los); else los();
    }
    $$('.tw__pf', w).forEach(function (p) { p.addEventListener('click', function () { var d = +p.getAttribute('data-schritt'); zeig(n + d, d > 0); }); });
    ha.forEach(function (h, j) { h.addEventListener('click', function () { zeig(j); }); });
    w.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { zeig(n + 1, true); e.preventDefault(); } else if (e.key === 'ArrowLeft') { zeig(n - 1, false); e.preventDefault(); } });
    var bild = $('.tw__bild', w), x0 = null, y0 = 0;
    bild.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    bild.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) zeig(n + (dx < 0 ? 1 : -1), dx < 0); });
    bild.addEventListener('pointercancel', function () { x0 = null; });
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { fio.disconnect(); $$('img', bild).forEach(function (f) { f.loading = 'eager'; }); } }); }, { rootMargin: '0px 0px 100% 0px' });
      fio.observe(w);
    }
    linieSetzen(0);
    window.addEventListener('resize', function () { requestAnimationFrame(function () { linieSetzen(n); }); }, { passive: true });
  });

})();
