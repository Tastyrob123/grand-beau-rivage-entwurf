/* La Carte · Mittagsmenü (Robert 14.10.2026: «dass man da die Tageskarte des Mittagslunch ausfüllen kann»; dann: «es braucht pro Tag eine
   Tageskarte: Vorspeise Salat oder Suppe, Hauptgang vegetarisch, Fleisch, Fisch und ein Dessert»).
   Das Haus füllt jede Woche ein Formular aus (woche: Montag, je Tag Salat, Suppe, Vegetarisch, Fleisch, Fisch, Dessert, Zeiten, Preis).
   Daraus entsteht hier je Tag ein eigener Teil der Karte, also eine eigene Seite in der PDF: die Tageskarte. Gesetzt und gedruckt wird wie
   jede Karte mit karte.js. Eine Datei für das Panel (mc.js) und für Node. Was leer bleibt, steht nicht auf der Karte. */
(function (G) {
  'use strict';
  var TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  // Gänge der Tageskarte: Feld, Beschriftung im Formular, Gang auf der Karte
  var FELDER = [['salat', 'Salat', 'Vorspeise'], ['suppe', 'Suppe', 'Vorspeise'], ['vegi', 'Vegetarisch', 'Hauptgang'], ['fleisch', 'Fleisch', 'Hauptgang'], ['fisch', 'Fisch', 'Hauptgang'], ['dessert', 'Dessert', 'Dessert']];

  function datum(ab, plus) {   // ab: «JJJJ-MM-TT», mittags gerechnet, damit Sommerzeit nie einen Tag verschiebt
    var t = String(ab || '').split('-').map(Number);
    return new Date(t[0], (t[1] || 1) - 1, (t[2] || 1) + (plus || 0), 12);
  }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function montag(ab) { var d = datum(ab); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
  function tagName(ab, i) { var d = datum(ab, i); return TAGE[i] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()]; }
  function tagVoll(ab, i) { return tagName(ab, i) + ' ' + datum(ab, i).getFullYear(); }
  function spanne(ab, n) {
    var a = datum(ab), b = datum(ab, n - 1);
    if (a.getFullYear() !== b.getFullYear()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' ' + a.getFullYear() + ' – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    if (a.getMonth() !== b.getMonth()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    return a.getDate() + '. – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
  }
  var leer = function (s) { return !String(s || '').trim(); };
  function tagLeer(t) { return !t.zu && FELDER.every(function (f) { return leer(t[f[0]]); }); }
  function leererTag() { var t = { zu: false, hinweis: '' }; FELDER.forEach(function (f) { t[f[0]] = ''; }); return t; }

  /* woche → { teile, fuss }: je Tag ein Teil (eine Seite).
     q (wahlweise): sammelt je Text der Karte, aus welchem Feld der Woche er stammt { 'teile.0.posten.2.zeilen.0.text': ['tage.0.vegi', 'Vegetarisch · '] },
     damit «Fortgeschritten» direkt in der Karte schreiben kann und das Geschriebene im Formular landet (Robert 15.10.2026). */
  /* Freie Anordnung und Gestalten (16.10.2026, wie bei den anderen Karten): die Tageskarten entstehen bei jeder Eingabe neu, deshalb steht
     die lage nicht an den Teilen, sondern in der Woche: w.lage['t<Tag>.<Rolle>'] je Eintrag (titel, zeiten, heute, vorspeise, hauptgang,
     dessert, preis, zusatz, spruch), w.lage['t<Tag>#'] für Zeichen und Fusszeile der Seite. r (wahlweise): Pfad der Karte → Schlüssel. */
  function teile(w, q, r) {
    var n = Math.max(1, Math.min(7, w.tage.length)), aus = [], WL = w.lage || {};
    var m = function (pfad, feld, vor) { if (q) q[pfad] = [feld, vor || '']; };
    var kopie = function (x) { return x ? JSON.parse(JSON.stringify(x)) : x; };
    var mitLage = function (teil, tag, rollen) {
      teil.posten.forEach(function (u, j) { var key = 't' + tag + '.' + rollen[j]; if (r) r['teile.' + aus.length + '.posten.' + j] = key; if (WL[key]) u.lage = kopie(WL[key]); });
      if (r) r['teile.' + aus.length] = 't' + tag + '#';
      if (WL['t' + tag + '#']) teil.lage = kopie(WL['t' + tag + '#']);
      return teil;
    };
    w.tage.slice(0, n).forEach(function (t, i) {
      if (tagLeer(t)) return;
      var k = 'teile.' + aus.length + '.posten.', ro = ['titel'];
      var p = [{ t: 'rubrik', titel: w.titel || 'Mittagsmenü', en: tagVoll(w.ab, i) }];
      m(k + '0.titel', 'titel');
      if (!leer(w.zeiten)) { m(k + p.length + '.text', 'zeiten'); p.push({ t: 'notiz', text: w.zeiten.trim() }); ro.push('zeiten'); }
      if (t.zu) { m(k + p.length + '.zeilen.0.text', 'tage.' + i + '.hinweis'); ro.push('heute'); p.push({ t: 'gericht', name: 'Heute', zeilen: [{ text: leer(t.hinweis) ? 'An diesem Tag gibt es kein Mittagsmenü.' : t.hinweis.trim() }], preise: [] }); }
      else {
        ['Vorspeise', 'Hauptgang', 'Dessert'].forEach(function (gang) {
          var z = FELDER.filter(function (f) { return f[2] === gang && !leer(t[f[0]]); }).map(function (f, j) {
            var vor = gang === 'Dessert' ? '' : f[1] + ' · ';
            m(k + p.length + '.zeilen.' + j + '.text', 'tage.' + i + '.' + f[0], vor);
            return { text: vor + t[f[0]].trim() };
          });
          if (z.length) { p.push({ t: 'gericht', name: gang, zeilen: z, preise: [] }); ro.push(gang.toLowerCase()); }
        });
        if (!leer(w.preis)) { m(k + p.length + '.text', 'preis'); p.push({ t: 'zw', text: w.preis.trim() }); ro.push('preis'); }   // Preis und Zusatz getrennt, damit beide eigen gesetzt werden (Robert 14.10.2026: «mittig, in schwarz und edler»)
        if (!leer(w.zusatz)) { m(k + p.length + '.text', 'zusatz'); p.push({ t: 'notiz', text: w.zusatz.trim() }); ro.push('zusatz'); }
      }
      if (!leer(w.spruch)) { m(k + p.length + '.text', 'spruch'); p.push({ t: 'notiz', text: w.spruch.trim(), en: true }); ro.push('spruch'); }
      aus.push(mitLage({ art: 'inhalt', posten: p }, i, ro));
    });
    if (!aus.length) { m('teile.0.posten.0.titel', 'titel'); aus.push({ art: 'inhalt', posten: [{ t: 'rubrik', titel: w.titel || 'Mittagsmenü', en: spanne(w.ab, n) }, { t: 'notiz', text: 'Die Gerichte dieser Woche folgen.' }] }); }
    m('fuss', 'fuss');
    return { teile: aus, fuss: (w.fuss || '').trim() };
  }
  function quellen(w) { var q = {}; teile(w, q); return q; }
  function rollen(w) { var r = {}; teile(w, null, r); return r; }

  /* Daten der Karte aus der Woche neu bilden (alles andere an der Karte bleibt) */
  function anwenden(d) { var r = teile(d.woche); d.teile = r.teile; d.fuss = r.fuss; return d; }

  G.MITTAG = { TAGE: TAGE, MONATE: MONATE, FELDER: FELDER, datum: datum, iso: iso, montag: montag, tagName: tagName, spanne: spanne, teile: teile, quellen: quellen, rollen: rollen, anwenden: anwenden, leererTag: leererTag, tagLeer: tagLeer };
  if (typeof module !== 'undefined') module.exports = G.MITTAG;
})(typeof window !== 'undefined' ? window : globalThis);
