/* La Maison · Gruss, Datum, Auftritte und der Stand je Werkzeug.
   Stand nur aus den Daten der Werkzeuge selbst (nichts geschätzt): Le Bureau und La Carte über ihre Schnittstellen, Le Livre über seine Bildliste (marke/livre.json).
   La Réception über ihren Eingang. L’Imprimerie hat keinen Stand, der sich ehrlich zeigen liesse. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var tag = function (d) { return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  var setze = function (key, html) { $$('[data-stand="' + key + '"]').forEach(function (el) { el.innerHTML = html; }); };
  var zahl = function (key, wert) { $$('[data-zahl="' + key + '"]').forEach(function (el) { el.textContent = wert; }); };

  /* Gruss und Datum */
  var h = new Date().getHours();
  /* Im Laptop der Werkbank lädt La Maison mit ?gruss=tag: derselbe Gruss wie im Standbild dort, damit beim Öffnen kein Wort wechselt (12.10.2026) */
  var fest = { morgen: 8, tag: 13, abend: 20 }[(/[?&]gruss=(morgen|tag|abend)/.exec(location.search) || [])[1]]; if (fest) h = fest;
  $('#gruss').textContent = h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';
  $('#datum').textContent = new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* Name im Auftakt: Buchstabe für Buchstabe aus dem Schlitz (wie der Auftakt der Website) */
  $$('[data-buchstaben]').forEach(function (el) {
    var n = 0;
    el.innerHTML = el.textContent.split(' ').map(function (wort) {
      return '<span class="w" aria-hidden="true">' + wort.split('').map(function (z) { return '<b style="--n:' + (n++) + '">' + esc(z) + '</b>'; }).join('') + '</span>';
    }).join(' ');
    el.setAttribute('data-r', '');
  });
  /* Buchstaben-Rollen nur in den Menüpunkten der Leiste */
  $$('.rl').forEach(function (el) {
    el.innerHTML = el.textContent.split('').map(function (z, i) { return '<b style="--n:' + i + '">' + esc(z) + '</b>'; }).join('');
  });

  /* Auftakt erst los, wenn die Fotos der fünf Tafeln dekodiert sind (16.10.2026), höchstens 1,4 s warten */
  (function () {
    var f5 = document.querySelector('.m-f5'); if (!f5) return;
    var los = function () { f5.classList.add('bereit'); };
    var bilder = [].slice.call(f5.querySelectorAll('.m-f5__k img'));
    var uhr = setTimeout(los, 1400);
    Promise.all(bilder.map(function (im) { return (im.decode ? im.decode() : Promise.resolve()).catch(function () {}); })).then(function () { clearTimeout(uhr); requestAnimationFrame(los); });
  })();
  /* Auftritte: im Blickfeld, nicht darunter */
  var alle = $$('[data-r]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });   /* 16.10.2026 (Robert: «sollen direkt in ihre Position fahren, wenn ich reinkomme»): Start schon am unteren Rand, nicht erst mitten im Bild */
    /* Ein Abschnitt fährt als Ganzes los, sobald er am unteren Rand auftaucht; jedes Stück mit seiner Staffel (--i) */
    var gruppe = function (el) { return el.closest('section, .m-saal, .m-empfang, footer') || el; };
    var gesehen = new Set();
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting || gesehen.has(e.target)) return; gesehen.add(e.target); gio.unobserve(e.target);
        alle.forEach(function (el) { if (gruppe(el) === e.target && !el.closest('.m-fenster')) { el.classList.add('da'); io.unobserve(el); } }); });
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
    alle.forEach(function (el) { if (!el.closest('.m-fenster')) { io.observe(el); var g = gruppe(el); if (!gesehen.has(g) && g !== el) gio.observe(g); } });
    /* Fenster wie auf der Website (main.js .bruch): der Satz steht fest in der Bildschirmmitte und gilt für den Browser deshalb schon
       als sichtbar, bevor das Fenster da ist. Er startet erst, wenn die Oberkante des Fensters ihn zu einem Drittel freigegeben hat. */
    $$('.m-fenster').forEach(function (b) {
      var t = $('.m-f-d2', b), fio = null; if (!t) return;
      var lausche = function () {
        if (fio) fio.disconnect();
        var hh = t.offsetHeight, linie = window.innerHeight / 2 - hh / 2 + hh * 0.68;
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
    /* Goldband läuft nur, solange es im Bild ist */
    var band = $('[data-laufband]');
    if (band) new IntersectionObserver(function (es) { band.classList.toggle('laeuft', es[0].isIntersecting); }).observe(band);
    /* Leiste: der Saal im Blick ist markiert */
    var punkte = {};
    $$('.m-insel__p').forEach(function (a) { punkte[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = punkte[e.target.id]; if (a) a.classList.toggle('an', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(punkte).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  } else {
    alle.forEach(function (el) { el.classList.add('da'); });
  }

  /* Stand: Le Bureau */
  fetch('../studio/api/ueberblick', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (u) {
    var a = u.aenderungen || 0, z = u.zuletzt;
    if (u.bereiche && u.bereiche.length) zahl('bereiche', u.bereiche.length);
    if (u.seiten) zahl('seiten', u.seiten);
    var zul = z && z.zeit ? tag(new Date(String(z.zeit).replace(' ', 'T'))) : '';
    setze('bureau-kurz', a ? '<b>' + a + ' im Entwurf</b>' : (zul ? 'Veröffentlicht ' + esc(zul) : 'Nichts offen'));
    setze('bureau', (a ? '<b>' + a + ' Änderung' + (a > 1 ? 'en' : '') + ' im Entwurf.</b> ' : 'Nichts offen im Entwurf. ') + (zul ? 'Zuletzt veröffentlicht am ' + esc(zul) + '.' : 'Noch nichts veröffentlicht.'));
  }).catch(function () { setze('bureau-kurz', 'Website des Hauses'); setze('bureau', 'Der Stand ist gerade nicht abrufbar.'); });

  /* Stand: La Carte */
  fetch('../mission-control/api/status', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
    var k = d.karten || [], e = k.filter(function (x) { return x.entwurf; }).length;
    var sortier = function (s) { var m = String(s).match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/); return m ? m[3] + m[2] + m[1] + m[4] + m[5] : ''; };
    var pdf = k.map(function (x) { return x.pdf_zeit || ''; }).filter(Boolean).sort(function (a, b) { return sortier(a) < sortier(b) ? 1 : -1; })[0];
    zahl('karten', k.length);
    zahl('entwurf', e);
    if (pdf) zahl('pdf', pdf.split(' ')[0].split('.').slice(0, 2).join('.') + '.');
    setze('carte-kurz', e ? '<b>' + e + ' im Entwurf</b>' : k.length + ' Karten, alle veröffentlicht');
  }).catch(function () { setze('carte-kurz', 'Speise-, Bar- und Weinkarte'); });

  /* Stand: La Réception (Eingang und Fragen aus dem Chat) */
  fetch('../reception/api/ueberblick', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (u) {
    var teile = [];
    if (u.anfragen_neu) teile.push('<b>' + u.anfragen_neu + (u.anfragen_neu === 1 ? ' neue Anfrage' : ' neue Anfragen') + '</b>');
    else if (u.anfragen_offen) teile.push(u.anfragen_offen + (u.anfragen_offen === 1 ? ' Anfrage offen' : ' Anfragen offen'));
    if (u.ohne_antwort) teile.push('<b>' + u.ohne_antwort + (u.ohne_antwort === 1 ? ' Frage ohne Antwort' : ' Fragen ohne Antwort') + '</b>');
    var kurz = teile.length ? teile.join(' · ') : 'Nichts offen';
    setze('reception-kurz', kurz);
    setze('reception', teile.length ? kurz : 'Nichts offen · ' + u.fragen_gesamt + (u.fragen_gesamt === 1 ? ' Frage' : ' Fragen') + ' bisher');
  }).catch(function () { setze('reception-kurz', 'Rezeption im Chat'); setze('reception', '&nbsp;'); });

  /* Stand: Le Livre (aus marke/livre.json, gebaut von _werkbank/livre_bau.py: gezählte Fotos und Dateien) */
  fetch('../marke/livre.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
    var s = d.stand || {};
    setze('livre-kurz', esc(s.fotos) + ' Fotos · ' + esc(s.dateien) + ' Dateien');
    setze('livre', esc(s.fotos) + ' Fotos in fertigen Grössen, davon ' + esc(s.ki) + ' mit KI erzeugt und gekennzeichnet. ' + esc(s.dateien) + ' Dateien für Agenturen und Druckereien, dazu die Markenprüfung.');
  }).catch(function () { setze('livre-kurz', 'Fotos, Dateien, Markenprüfung'); });

  /* Le Registre: sechs Werte der Zählung ohne Cookies (registre.py über /api/registre). Vorführ-Betrieb (Robert 14.10.2026): hier stehen die Beispielwerte,
     als Beispiel beschriftet; die echten Besuche zeigt La Maison erst, wenn das Haus in Betrieb geht (dann &beispiel=1 streichen). */
  if ($('#registre')) fetch('../api/registre?tage=30&beispiel=1', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (m) {
    var n = function (x) { return Number(x || 0).toLocaleString('de-CH'); };
    var datum = function (iso) { var t = String(iso || '').split('-'); return t.length === 3 ? t[2] + '.' + t[1] + '.' + t[0] : ''; };
    var w = m.werte || {};
    var zeige = function (key, klein, leer) {
      var x = w[key] || {}, da = x.von > 0;
      $$('[data-mw="' + key + '"]').forEach(function (el) { el.textContent = da ? Number(x.anteil).toLocaleString('de-CH', { maximumFractionDigits: 1 }) + '\u00a0%' : '\u2013'; });
      $$('[data-mk="' + key + '"]').forEach(function (el) { el.textContent = da ? klein(x) : leer; });
    };
    var besuche = function (z) { return z === 1 ? 'Aufruf' : 'Aufrufen'; };
    zeige('start', function (x) { return n(x.zahl) + ' von ' + n(x.von) + ' ' + besuche(x.von) + ' der Startseite'; }, 'Noch kein Aufruf der Startseite');
    zeige('zimmer', function (x) { return n(x.zahl) + ' von ' + n(x.von) + ' ' + besuche(x.von) + ' der Zimmerseiten'; }, 'Noch kein Aufruf der Zimmerseiten');
    zeige('angebot', function (x) { return n(x.zahl) + ' von ' + n(x.von) + ' ' + besuche(x.von) + ' der Angebote'; }, 'Noch kein Aufruf der Angebote');
    zeige('taste', function (x) { return n(x.zahl) + ' von ' + n(x.von) + ' ' + besuche(x.von) + ' am Handy'; }, 'Noch kein Aufruf am Handy');
    zeige('abbruch', function (x) { return n(x.zahl) + ' von ' + n(x.von) + (x.von === 1 ? ' geöffneten Zimmersuche' : ' geöffneten Zimmersuchen'); }, 'Noch keine Zimmersuche geöffnet');
    zeige('tisch', function (x) { return n(x.zahl) + ' von ' + n(x.von) + ' ' + besuche(x.von) + ', ' + n(x.weiter) + ' weiter zum Tischplan'; }, 'Noch kein Aufruf');
    var u = m.summe || {};
    /* Zahlenzeile im Cover (14.10.2026): «Heute … Besuche · … zur Buchung». Beides vom heutigen Tag (letzter Eintrag in je_tag); vorher stand bei
       «zur Buchung» die Summe aller 30 Tage neben den Besuchen von heute (17.10.2026). Ohne Wert steht «–», nie die Platzhalterzahl der Seite. */
    var jt = Array.isArray(m.je_tag) && m.je_tag.length ? m.je_tag[m.je_tag.length - 1] : null;
    setze('registre-heute', u.heute !== undefined ? n(u.heute) : '–');
    setze('registre-buchung', jt && jt.buchung !== undefined ? n(jt.buchung) : '–');
    setze('besuche', m.leer ? 'Noch keine Besuche gezählt.'
      : (m.beispiel ? 'Beispielwerte · ' : '') + 'Letzte ' + n(m.tage) + ' Tage · ' + n(u.besuche) + (u.besuche === 1 ? ' Besuch' : ' Besuche') + ' · ' + n(u.seiten) + (u.seiten === 1 ? ' angesehene Seite' : ' angesehene Seiten') + (u.laender ? ' · ' + n(u.laender) + (u.laender === 1 ? ' Land' : ' Länder') : ''));
  }).catch(function () { setze('besuche', 'Die Zählung ist gerade nicht abrufbar.'); setze('registre-heute', '–'); setze('registre-buchung', '–'); });
  window.__werkzeugBereit = true;   /* R04: Startfehler-Tür nicht zeigen (17.10.2026) */
})();
