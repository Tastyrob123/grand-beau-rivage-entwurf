/* Mission Control · Satz der Karten. Eine Datei für drei Stellen: die Vorschau im Panel, die Druckseite (PDF) und den Bau der Werkbank
   (_werkbank/satz_daten.py über _werkbank/karten_bau.js). Aus den Daten einer Karte (_karten/stand/<ziel>.json) entstehen die Bausteine,
   sie werden im Browser mit dem echten Stylesheet gemessen und ausgeglichen auf volle Seiten verteilt.
   Die Bausteine entsprechen Zeichen für Zeichen dem Satz vom 11.10.2026 (satz_auto._posten, satz_kern.rubrik), damit nichts springt. */
(function (G) {
  'use strict';
  var LUFT = 6.0;   // mm, höchstens so viel zusätzliche Luft je Zwischenraum (Robert 11.10.2026: «viel zu viele Leerräume»)
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); }
  function at(o, pfad) { return pfad ? ' data-k="' + pfad + '"' : ''; }

  /* ein Baustein → HTML. k: Pfad für das freie Bearbeiten (data-k an jedem Text), sonst leer */
  function baustein(u, k, lk) {
    var L = u.lage || {}, mitLin = !!(lk || L.lin);   // Linie als eigenes Element: beim Bearbeiten immer, im Druck nur, wenn sie gestaltet ist
    var lin = function (kl) { return mitLin ? linie('<i class="' + kl + '"></i>', L.lin, lk ? lk + ':lin' : '') : ''; };
    var ml = mitLin ? ' mit-lin' : '';
    var p = function (f) { return k ? at(null, k + '.' + f) : ''; };
    var w = function (f, t) { return k ? '<span' + at(null, k + '.' + f) + '>' + t + '</span>' : t; };   // Text mit Pfad nur beim Bearbeiten
    switch (u.t) {
      case 'rubrik':
        return '<h2 class="rubrik' + ml + '"><span>' + w('titel', esc(u.titel)) + (u.en ? '<small> ' + w('en', esc(u.en)) + '</small>' : '') + '</span>' +
          (u.koepfe && u.koepfe.length ? '<span class="rk">' + u.koepfe.map(function (x, i) { return '<b' + p('koepfe.' + i) + '>' + esc(x) + '</b>'; }).join('') + '</span>' : '') + lin('lin') + '</h2>';
      case 'land': return '<h3 class="zw zw--land' + ml + '"' + p('text') + '>' + esc(u.text) + lin('lin lin--u') + '</h3>';
      case 'zw': return '<h3 class="zw"' + p('text') + '>' + esc(u.text) + '</h3>';
      case 'kopf': return '<p class="tkopf"' + p('text') + '>' + esc(u.text) + '</p>';
      case 'zeile': return '<div class="tz' + ml + '"><span' + p('name') + '>' + esc(u.name) + '</span><b' + p('preis') + '>' + esc(u.preis) + '</b>' + lin('lin lin--u') + '</div>';
      case 'notiz': return '<p class="tnote' + (u.en ? ' fr' : '') + '"' + p('text') + '>' + esc(u.text) + '</p>';
      case 'gericht': case 'frei': {
        var zl = (u.zeilen || []).map(function (z, i) {
          var zp = z.preise || [], kl = (z.en && !zp.length ? 'fr' : '') + (zp.length ? ' mp' : '') + (z.fett ? ' halb' : '');
          return '<p class="' + kl + '"><span' + p('zeilen.' + i + '.text') + '>' + esc(z.text) + '</span>' + zp.map(function (x, j) { return '<b' + p('zeilen.' + i + '.preise.' + j) + '>' + esc(x) + '</b>'; }).join('') + '</p>';
        }).join('');
        var pr = (u.preise || []).map(function (x, i) { return '<span class="pz"><b' + p('preise.' + i) + '>' + esc(x) + '</b></span>'; }).join('');
        var kopf = u.name ? '<h4>' + w('name', esc(u.name)) + (u.zusatz ? ' <small' + p('zusatz') + '>' + esc(u.zusatz) + '</small>' : '') + '</h4>' : '';
        return '<div class="po' + (u.name ? '' : ' po--frei') + ml + '"><div class="po__t">' + kopf + zl + '</div><div class="po__p' + ((u.preise || []).length > 1 ? ' po__p--reihe' : '') + '">' + pr + '</div>' + lin('lin lin--u') + '</div>';
      }
    }
    return '';
  }
  /* Freie Anordnung (Robert 15.10.2026, La Carte «Fortgeschritten»: «Elemente hin und her schieben … gross, klein, alles so Canva-mässig»).
     Jede Abweichung steht in den Daten am Element: u.lage = {x, y, s} (mm und Faktor) bei Einträgen, t.lage[schluessel] beim Deckblatt und je Seite
     bei Zeichen und Fusszeile («zeichen.0», «fuss.0» = erste Seite dieses Teils). Verschoben wird per transform, der Satz bleibt unberührt,
     deshalb stehen Vorschau, Druckseite und PDF gleich. l: data-l für das Anfassen im Panel (nur beim Bearbeiten). */
  function lageStil(l) {
    if (!l) return '';
    var x = +l.x || 0, y = +l.y || 0, s = +l.s || 1;
    if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05 && Math.abs(s - 1) < 0.005) return '';
    return 'transform:translate(' + x.toFixed(2) + 'mm,' + y.toFixed(2) + 'mm)' + (Math.abs(s - 1) >= 0.005 ? ' scale(' + s.toFixed(3) + ')' : '') + ';transform-origin:0 0';
  }
  /* Gestalten (Robert 16.10.2026: «Schriftarten, Schriftgrösse und Textart ändern … kleine Striche bearbeiten»). Weitere Felder in lage:
     f Schrift, t Schriftgrösse als Faktor (bei Einträgen über --s, der Satz bricht neu um und verteilt neu), a Textart, c Farbe, al Ausrichtung,
     z Zeilenabstand, mt/mb Abstand davor/danach (mm), aus ausgeblendet. Linien: b Länge, d Stärke (mm), c Farbe. Regeln dazu am Ende von satz.css. */
  var SCHRIFT = { cormorant: "'Cormorant Garamond',Georgia,serif", instrument: "'Instrument Sans',Arial,sans-serif", mono: "'DM Mono',Menlo,monospace", cinzel: "'Cinzel',Georgia,serif" };
  var FARBE = { marine: '#1b2033', tinte: '#14161d', grau: '#5c5f6b', gold: '#9c8451', goldtief: '#826c35', goldhell: '#d2bf98', taupe: '#81704d', creme: '#f7f0e3', weiss: '#ffffff', rot: '#8f2f2a' };
  var ALIGN = { links: ['left', 'flex-start'], mitte: ['center', 'center'], rechts: ['right', 'flex-end'] };
  function zahl(x) { return Math.round(x * 100) / 100; }
  function gestalt(l) {   // [style, attribute] eines Elements
    var st = [], at = '';
    if (!l) return [st, at];
    var tr = lageStil(l); if (tr) st.push(tr);
    if (l.aus) st.push('visibility:hidden');
    if (SCHRIFT[l.f]) { st.push('--gf:' + SCHRIFT[l.f]); at += ' data-gf=""'; }
    if (FARBE[l.c]) { st.push('--gc:' + FARBE[l.c]); at += ' data-gc=""'; }
    if (/^(normal|kursiv|versal|medium)$/.test(l.a || '')) at += ' data-ga="' + l.a + '"';
    if (ALIGN[l.al]) { st.push('--gal:' + ALIGN[l.al][0] + ';--gai:' + ALIGN[l.al][1]); at += ' data-gal=""'; }
    if (+l.z) { st.push('--gz:' + zahl(+l.z)); at += ' data-gz=""'; }
    if (+l.t && Math.abs(+l.t - 1) > 0.004) st.push('--s:' + zahl(+l.t));
    if (l.mt != null && l.mt !== '') st.push('margin-top:' + zahl(+l.mt) + 'mm');
    if (l.mb != null && l.mb !== '') st.push('margin-bottom:' + zahl(+l.mb) + 'mm');
    return [st, at];
  }
  function einfuegen(html, st, at, schluessel) {
    if (!st.length && !at && !schluessel) return html;
    return html.replace(/^<(\w+)/, function (m, t) { return '<' + t + (schluessel ? ' data-l="' + schluessel + '"' : '') + at + (st.length ? ' style="' + st.join(';').replace(/"/g, "'") + '"' : ''); });
  }
  function mitLage(html, l, schluessel) { var g = gestalt(l); return einfuegen(html, g[0], g[1], schluessel); }
  function linie(html, l, schluessel) {   // Strich: Länge, Stärke, Farbe, Lage, ausgeblendet
    var st = [];
    if (l) {
      var tr = lageStil({ x: l.x, y: l.y }); if (tr) st.push(tr);
      if (+l.b) st.push('--lb:' + zahl(+l.b) + 'mm;width:' + zahl(+l.b) + 'mm');
      if (+l.d) st.push('height:' + zahl(+l.d) + 'mm');
      if (FARBE[l.c]) st.push('background:' + FARBE[l.c]);
      if (l.aus) st.push('visibility:hidden');
    }
    return einfuegen(html, st, schluessel ? ' data-lin=""' : '', schluessel);
  }

  /* ohne Bearbeiten-Spannen: genau das Markup des Satzes (für Druck und Bau) */
  function rein(html) { return html.replace(/<span data-k="[^"]*">([^<]*)<\/span>/g, '$1').replace(/ data-k="[^"]*"/g, ''); }

  function blatt(meta, innen, kl, attr) {
    var f = meta.format || [210, 297];
    return '<section' + (attr || '') + ' class="blatt ' + kl + '" data-b="' + f[0] + '" data-h="' + f[1] + '" style="width:' + f[0] + 'mm;height:' + f[1] + 'mm">' + innen + '</section>';
  }
  function deckel(meta, d, zeichen, k, ti) {
    var p = function (f) { return k ? at(null, k + '.' + f) : ''; };
    var L = d.lage || {}, l = function (html, f) { return mitLage(html, L[f], k && ti !== undefined ? 't:' + ti + ':' + f : ''); };
    var z = (d.zeilen || []).map(function (x, i) { return l('<p' + p('zeilen.' + i) + '>' + esc(x) + '</p>', 'zeilen.' + i); }).join('');
    return blatt(meta, '<div class="inhalt"><div class="udeck">' + l('<span class="udeck__z">' + zeichen + '</span>', 'zeichen') + l('<h1' + p('titel') + '>' + esc(d.titel) + '</h1>', 'titel') + linie('<i></i>', L.linie, k && ti !== undefined ? 't:' + ti + ':linie' : '') +
      (d.unter ? l('<p class="udeck__u"' + p('unter') + '>' + esc(d.unter) + '</p>', 'unter') : '') + z + '</div></div>', 'deckel ' + (meta.kl || ''), ' data-fest="1"');
  }
  /* S: Anordnung je Seite (lage des Teils, Seitennummer im Teil, Teil); fehlt beim Messen */
  function innenblatt(meta, inhalt, zeichen, k, S) {
    var l = function (html, f) { return S ? mitLage(html, S.lage[f + '.' + S.n], k ? 't:' + S.ti + ':' + f + '.' + S.n : '') : html; };
    var fuss = meta.fuss ? l('<p class="ab fuss"' + (k ? at(null, 'fuss') : '') + '>' + esc(meta.fuss) + '</p>', 'fuss') : '';
    return blatt(meta, '<header class="uleiste">' + l('<span>' + zeichen + '</span>', 'zeichen') + '</header><div class="inhalt"><div class="fluss">' + inhalt + '</div>' + fuss + '</div>', meta.kl || '', ' data-max="1"');
  }

  function istKopf(u) { return u.t === 'rubrik' || u.t === 'land' || u.t === 'zw' || u.t === 'kopf'; }

  /* Verteilen (Python satz_daten.packe bis 11.10.2026, unverändert übertragen) */
  function packe(units, masse, budget) {
    function hoehe(k, erste) { var m = masse[k]; return m[0] + (erste ? 0 : m[1]) + m[2]; }
    function kette(k) {
      var j = k;
      while (j < units.length && istKopf(units[j])) j++;
      if (j < units.length) { j++; if (j < units.length && units[j - 1].t === 'zeile' && units[j].t === 'zeile') j++; }
      return j;
    }
    /* Das letzte Gericht einer Rubrik rückt nie allein auf die nächste Seite (Robert 12.10.2026, L’Ambiance: «Creamy Risotto muss rüber unter
       Green Curry»). Gilt nur für den Ausgleichs-Umbruch; ist die Seite wirklich voll, wird weiter umgebrochen. */
    function schluss(k) { return k > 0 && !istKopf(units[k]) && !istKopf(units[k - 1]) && (k + 1 >= units.length || istKopf(units[k + 1])); }
    /* Ebenso bleibt das erste Gericht nicht allein unter seiner Rubrik am Seitenende, während der Rest auf der nächsten Seite beginnt. */
    function zweites(k) { return k > 1 && !istKopf(units[k]) && !istKopf(units[k - 1]) && istKopf(units[k - 2]); }
    var gesamt = 0; for (var q = 0; q < units.length; q++) gesamt += hoehe(q, false);
    function lauf(n) {
      var ziel = gesamt / n, seiten = [], akt = [], voll = 0, gesetzt = 0, k = 0;
      while (k < units.length) {
        var j = istKopf(units[k]) ? kette(k) : k + 1, h = 0;
        for (var i = k; i < j; i++) h += hoehe(i, (!akt.length) && i === k);
        if (akt.length && voll + h > budget) { seiten.push(akt); akt = []; voll = 0; continue; }
        var restPasst = (gesamt - gesetzt) <= (n - seiten.length - 1) * budget * 0.96;
        if (akt.length && seiten.length < n - 1 && voll + h > ziel && voll >= ziel * 0.8 && restPasst && !schluss(k) && !zweites(k)) { seiten.push(akt); akt = []; voll = 0; continue; }
        for (i = k; i < j; i++) akt.push(i);
        voll += h; gesetzt += h; k = j;
      }
      if (akt.length) seiten.push(akt);
      return seiten;
    }
    var n = Math.max(1, Math.ceil(Math.trunc(gesamt) / Math.trunc(budget))), seiten = [];
    for (var r = 0; r < 6; r++) { seiten = lauf(n); if (seiten.length <= n) break; n = seiten.length; }
    return seiten.map(function (sp) {
      var voll = 0; sp.forEach(function (i) { voll += hoehe(i, i === sp[0]); });
      return { i: sp, rest: Math.max(0, budget - voll) };
    });
  }

  /* Messen im Browser: eine leere Seite (freie Höhe) und eine Seite mit allen Bausteinen in voller Höhe, wie Python messe() */
  function messe(meta, units, ort, zeichen) {
    var mm = function (x) { return x / 96 * 25.4; };
    var leer = innenblatt(Object.assign({}, meta, { fuss: 'Alle Preise' }), '', zeichen).replace('<section ', '<section data-leer="1" ');
    var voll = innenblatt(Object.assign({}, meta, { fuss: '' }), units.map(function (u) { return mitLage(baustein(u), u.lage, ''); }).join(''), zeichen)
      .replace('class="fluss"', 'class="fluss" style="justify-content:flex-start"').replace('<section ', '<section data-mess="1" ').replace(/height:\d+mm"/, 'height:auto;overflow:visible"');
    ort.innerHTML = leer + voll;
    var budget = mm(ort.querySelector('[data-leer] .fluss').getBoundingClientRect().height);
    var masse = [].map.call(ort.querySelector('[data-mess] .fluss').children, function (x) {
      var c = getComputedStyle(x); return [mm(x.getBoundingClientRect().height), mm(parseFloat(c.marginTop)), mm(parseFloat(c.marginBottom))];
    });
    ort.innerHTML = '';
    return { budget: budget, masse: masse };
  }

  /* Alle Seiten einer Karte. ort: unsichtbarer Kasten zum Messen (im Dokument, ohne transform). bearbeiten: data-k an jedem Text.
     Rückgabe: { seiten: [html], alt: [Seite des Originals je Seite], teile: [[Teil, Index der Bausteine je Seite]] } */
  function setze(daten, zeichen, ort, bearbeiten) {
    var meta = daten, aus = [], alt = [], wo = [];
    (daten.teile || []).forEach(function (t, ti) {
      if (t.art === 'deckel') { aus.push(deckel(meta, t, zeichen, bearbeiten ? 'teile.' + ti : '', ti)); alt.push(t.s || 1); wo.push({ teil: ti, i: [] }); return; }
      var units = (t.posten || []).filter(function (u) { return !u.aus; }), idx = [];
      (t.posten || []).forEach(function (u, i) { if (!u.aus) idx.push(i); });
      if (!units.length) return;
      var m = messe(meta, units, ort, zeichen);
      packe(units, m.masse, m.budget).forEach(function (sp, n) {
        var luft = Math.min(sp.rest, LUFT * Math.max(1, sp.i.length - 1)), rest = sp.rest - luft;
        var halter = rest > 0.5 ? '<i class="rest" style="flex:0 0 ' + rest.toFixed(1) + 'mm"></i>' : '';
        var innen = sp.i.map(function (i) { return mitLage(baustein(units[i], bearbeiten ? 'teile.' + ti + '.posten.' + idx[i] : '', bearbeiten ? 'p:' + ti + ':' + idx[i] : ''), units[i].lage, bearbeiten ? 'p:' + ti + ':' + idx[i] : ''); }).join('') + halter;
        aus.push(innenblatt(meta, innen, zeichen, bearbeiten, { lage: t.lage || {}, n: n, ti: ti }));
        var erster = sp.i.filter(function (i) { return !istKopf(units[i]); })[0]; if (erster === undefined) erster = sp.i[0];
        alt.push(units[erster].s || 1);
        wo.push({ teil: ti, i: sp.i.map(function (i) { return idx[i]; }) });
      });
    });
    return { seiten: aus, alt: alt, wo: wo };
  }

  /* Schriften laden, bevor gemessen wird: alles einmal unsichtbar setzen, dann auf die Schriften warten */
  function vorbereiten(daten, zeichen, ort) {
    var alle = [];
    (daten.teile || []).forEach(function (t) { if (t.art === 'deckel') alle.push(deckel(daten, t, zeichen)); else alle.push(innenblatt(daten, (t.posten || []).map(function (u) { return mitLage(baustein(u), u.lage, ''); }).join(''), zeichen, '', { lage: t.lage || {}, n: 0, ti: 0 })); });
    ort.innerHTML = alle.join('');
    ort.getBoundingClientRect();
    return document.fonts.ready.then(function () { ort.innerHTML = ''; });
  }

  G.KARTE = { vorbereiten: vorbereiten, esc: esc, baustein: baustein, rein: rein, deckel: deckel, innenblatt: innenblatt, packe: packe, setze: setze, istKopf: istKopf, lageStil: lageStil, SCHRIFT: SCHRIFT, FARBE: FARBE, LUFT: LUFT };
})(typeof window !== 'undefined' ? window : globalThis);
