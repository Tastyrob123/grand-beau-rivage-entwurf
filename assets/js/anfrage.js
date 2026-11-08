/* Anfrage-Fenster (Robert 16.10.2026): Knöpfe mit data-anfrage öffnen das Fenster, «Anfrage senden» legt die Anfrage in den Eingang von La Réception.
   Kein mailto. Öffnen wie das Buchen-Fenster mit show() und eigenem Hintergrund (showModal macht die Seite inert und kostet einen Takt). Quelle inhalt/anfrage_fenster.py. */
(function () {
  var dlg = document.querySelector('dialog.anfr'), hinter = document.querySelector('.anfr__hinter'), el = document.getElementById('anfr-daten');
  if (!dlg || !hinter || !el || !dlg.show) return;
  var D = JSON.parse(el.textContent), T = D.t, f = dlg.querySelector('form'), E = f.elements, art = dlg.getAttribute('data-anfrage-fenster');
  var eingabe = dlg.querySelector('[data-seite=eingabe]'), danke = dlg.querySelector('[data-seite=danke]'), meldung = dlg.querySelector('.anfr__meldung'), senden = f.querySelector('button[type=submit]');
  var SP = (document.documentElement.lang || 'de').slice(0, 2), ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar' }[SP] || 'de-CH';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var heute = new Date(); E.tag.min = iso(heute); if (!E.tag.value) E.tag.value = iso(new Date(heute.getTime() + 864e5));
  var vorher = null;
  var taste = function (e) { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); zu(); } };
  function auf(wahl) {
    eingabe.hidden = false; danke.hidden = true; meldung.hidden = true;
    if (wahl) { for (var i = 0; i < E.wahl.options.length; i++) if (E.wahl.options[i].value === wahl) { E.wahl.selectedIndex = i; break; } }
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0;
    document.documentElement.classList.add('anfr-offen'); document.addEventListener('keydown', taste);
    E.tag.dispatchEvent(new Event('change'));   /* die Datumszeile der Seite (main.js, dt-anz) misst sich erst im offenen Fenster */
    setTimeout(function () { E.wahl.focus({ preventScroll: true }); }, 60);
  }
  function zu() { dlg.close(); }
  dlg.addEventListener('close', function () { hinter.hidden = true; document.documentElement.classList.remove('anfr-offen'); document.removeEventListener('keydown', taste); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
  hinter.addEventListener('click', zu);
  dlg.querySelector('.anfr__zu').addEventListener('click', zu);
  dlg.querySelector('[data-zu]').addEventListener('click', zu);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-anfrage]'); if (!b || b.getAttribute('data-anfrage') !== art) return;
    e.preventDefault(); auf(b.getAttribute('data-wahl') || '');
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = E.name.value.trim(), kontakt = E.kontakt.value.trim();
    E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (!name || !kontakt) { meldung.textContent = T.pflicht; meldung.hidden = false; (name ? E.kontakt : E.name).focus(); return; }
    var t = new Date(E.tag.value + 'T12:00'), tag = isNaN(t) ? '' : t.toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var datum = tag + (tag && E.zeit.value ? ', ' + T.um + ' ' + E.zeit.value + ' ' + T.uhr : '');
    var anliegen = E.wahl.value + (datum ? ' · ' + datum : '') + ' · ' + E.personen.value + ' ' + (E.personen.value === '1' ? T.person : T.personen) + (E.wunsch.value.trim() ? ' · ' + T.wunsch + ': ' + E.wunsch.value.trim() : '');
    senden.disabled = true; var knText = senden.firstChild.nodeValue; senden.firstChild.nodeValue = T.sendet; meldung.hidden = true;
    fetch('/reception/api/formular', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ art: art, name: name, kontakt: kontakt, datum: datum, personen: +E.personen.value, anliegen: anliegen, sprache: SP, website: E.website.value })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.fehler || r.status); return d; }); })
      .then(function () {
        dlg.querySelector('[data-danke]').textContent = T.danke.replace('{name}', ', ' + name.split(' ')[0]);
        dlg.querySelector('[data-zettel]').innerHTML = [[E.wahl.closest('label').querySelector('span').textContent, E.wahl.value], [T.tag, datum], [T.personen, E.personen.value]]
          .filter(function (z) { return z[1]; }).map(function (z) { return '<dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd>'; }).join('');
        eingabe.hidden = true; danke.hidden = false; dlg.scrollTop = 0; f.reset(); E.tag.value = iso(new Date(heute.getTime() + 864e5)); E.tag.dispatchEvent(new Event('change'));
      })
      .catch(function () { meldung.innerHTML = esc(T.fehler) + ' <a href="tel:' + esc(D.tel.replace(/[^+\d]/g, '')) + '"><bdi>' + esc(D.tel) + '</bdi></a>'; meldung.hidden = false; })
      .then(function () { senden.disabled = false; senden.firstChild.nodeValue = knText; });
  });
})();

/* ---------- Allgemein: window.GBRAnfrage.schicke() für alle Formulare der Website (Robert 16.10.2026: «überall, wo noch das Mailprogramm aufgeht») ----------
   Formulare (Kontakt, Feiern, Planer, Karriere, Newsletter, Anreise, Abreise, Tagungsrechner, Packages, Concierge) rufen schicke({art, titel, zeilen, name, kontakt, …}).
   Sind Name und Kontakt da, geht die Anfrage sofort in den Eingang von La Réception und das Fenster zeigt den Dank; fehlt etwas, fragt das Fenster danach.
   Das Fenster baut sich selbst (Briefbogen wie die Spa-Anfrage, Stil in anfrage.css), Auftritt nur transform. Kein mailto mehr. */
(function () {
  var SP = (document.documentElement.lang || 'de').slice(0, 2);
  var TX = {
    de: { marke: 'Grand Beau-Rivage · Interlaken', angaben: 'Ihre <em>Angaben.</em>', satz: 'Damit wir Ihnen antworten können, brauchen wir noch Ihren Namen und eine E-Mail-Adresse oder Telefonnummer.', name: 'Ihr Name', kontakt: 'E-Mail oder Telefon', wunsch: 'Was wir noch wissen sollten', senden: 'Anfrage senden', sendet: 'Wird gesendet …', danke: 'Danke{n}.', dankeSatz: 'Ihre Anfrage liegt beim Team des Grand Beau-Rivage. Wir melden uns persönlich bei Ihnen.', zu: 'Schliessen', pflicht: 'Bitte Name und E-Mail oder Telefon angeben.', fehler: 'Die Anfrage ging gerade nicht durch. Bitte versuchen Sie es noch einmal oder rufen Sie uns an:', tel: 'Lieber telefonisch?' },
    en: { marke: 'Grand Beau-Rivage · Interlaken', angaben: 'Your <em>details.</em>', satz: 'So that we can reply, we just need your name and an e-mail address or phone number.', name: 'Your name', kontakt: 'E-mail or phone', wunsch: 'Anything else we should know', senden: 'Send request', sendet: 'Sending …', danke: 'Thank you{n}.', dankeSatz: 'Your request is with the team of the Grand Beau-Rivage. We will get back to you personally.', zu: 'Close', pflicht: 'Please enter your name and an e-mail or phone number.', fehler: 'Your request could not be sent just now. Please try again or call us:', tel: 'Prefer to call?' },
    fr: { marke: 'Grand Beau-Rivage · Interlaken', angaben: 'Vos <em>coordonnées.</em>', satz: 'Pour vous répondre, il nous faut encore votre nom et une adresse e-mail ou un numéro de téléphone.', name: 'Votre nom', kontakt: 'E-mail ou téléphone', wunsch: 'Autre chose à nous dire', senden: 'Envoyer la demande', sendet: 'Envoi …', danke: 'Merci{n}.', dankeSatz: 'Votre demande est transmise à l’équipe du Grand Beau-Rivage. Nous reviendrons vers vous personnellement.', zu: 'Fermer', pflicht: 'Merci d’indiquer votre nom et un e-mail ou un téléphone.', fehler: 'La demande n’a pas pu être envoyée. Veuillez réessayer ou nous appeler :', tel: 'Plutôt par téléphone ?' },
    zh: { marke: 'Grand Beau-Rivage · Interlaken', angaben: '您的<em>信息</em>', satz: '为便于回复，请留下您的姓名以及电子邮箱或电话号码。', name: '您的姓名', kontakt: '电子邮箱或电话', wunsch: '其他需要我们了解的事项', senden: '发送咨询', sendet: '正在发送 …', danke: '谢谢{n}。', dankeSatz: '您的咨询已转交 Grand Beau-Rivage 团队，我们会亲自与您联系。', zu: '关闭', pflicht: '请填写姓名以及电子邮箱或电话。', fehler: '咨询暂时无法发送，请重试或致电：', tel: '更想电话联系？' },
    ko: { marke: 'Grand Beau-Rivage · Interlaken', angaben: '고객 <em>정보</em>', satz: '답변을 드릴 수 있도록 성함과 이메일 주소 또는 전화번호를 알려 주세요.', name: '성함', kontakt: '이메일 또는 전화', wunsch: '추가로 알려 주실 내용', senden: '문의 보내기', sendet: '보내는 중 …', danke: '감사합니다{n}.', dankeSatz: '문의하신 내용은 Grand Beau-Rivage 팀에 전달되었으며, 저희가 직접 연락드리겠습니다.', zu: '닫기', pflicht: '성함과 이메일 또는 전화번호를 입력해 주세요.', fehler: '지금은 문의를 보낼 수 없습니다. 다시 시도하시거나 전화 주세요:', tel: '전화가 편하신가요?' },
    ar: { marke: 'Grand Beau-Rivage · Interlaken', angaben: '<em>بياناتكم</em>', satz: 'لكي نتمكن من الرد، نحتاج إلى اسمكم وعنوان بريد إلكتروني أو رقم هاتف.', name: 'الاسم', kontakt: 'البريد الإلكتروني أو الهاتف', wunsch: 'ما الذي ينبغي أن نعرفه أيضًا', senden: 'إرسال الطلب', sendet: 'جارٍ الإرسال …', danke: 'شكرًا{n}.', dankeSatz: 'طلبكم الآن لدى فريق Grand Beau-Rivage، وسنتواصل معكم شخصيًا.', zu: 'إغلاق', pflicht: 'يرجى إدخال الاسم والبريد الإلكتروني أو الهاتف.', fehler: 'تعذّر إرسال الطلب الآن. يرجى المحاولة مرة أخرى أو الاتصال بنا:', tel: 'تفضلون الهاتف؟' }
  }[SP] || null;
  var T = TX || { marke: 'Grand Beau-Rivage · Interlaken', angaben: 'Ihre <em>Angaben.</em>', satz: '', name: 'Name', kontakt: 'E-Mail / Telefon', wunsch: '', senden: 'Senden', sendet: '…', danke: 'Danke{n}.', dankeSatz: '', zu: '×', pflicht: '', fehler: '', tel: '' };
  var TEL = '+41 33 826 70 07', TELH = 'tel:+41338267007';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
  var PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>';
  var MARKE = esc(T.marke).replace(' · ', '<span class="anfr__haus"> · ') + '</span>';
  var dlg, hinter, auftrag = null, vorher = null;
  function baue() {
    if (dlg) return;
    hinter = document.createElement('div'); hinter.className = 'anfr__hinter'; hinter.hidden = true;
    dlg = document.createElement('dialog'); dlg.className = 'anfr anfr--frei'; dlg.setAttribute('aria-label', T.senden);
    dlg.innerHTML = '<form class="anfr__brief anf__brief" novalidate><button class="anfr__zu" type="button" aria-label="' + esc(T.zu) + '">' + KREUZ + '</button><div class="anf__rand">' +
      '<div class="anfr__seite" data-seite="eingabe"><p class="anf__marke">' + MARKE + '</p><h2 class="anf__titel" data-titel></h2><p class="anfr__satz">' + esc(T.satz) + '</p>' +
      '<dl class="anfr__zettel" data-zettel-ein></dl><div class="anf__felder">' +
      '<label class="anf__f"><span>' + esc(T.name) + '</span><input type="text" name="name" autocomplete="name"></label>' +
      '<label class="anf__f"><span>' + esc(T.kontakt) + '</span><input type="text" name="kontakt" autocomplete="email" inputmode="email"></label>' +
      '<label class="anf__f anf__f--ganz" data-wunschfeld><span>' + esc(T.wunsch) + '</span><textarea name="wunsch" rows="2"></textarea></label>' +
      '<label class="anfr__fang" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<p class="anfr__meldung" role="alert" hidden></p><div class="kn-reihe anf__kn"><button class="kn" type="submit">' + esc(T.senden) + '<i>' + PF + '</i></button></div>' +
      '<p class="anf__fuss">' + esc(T.tel) + ' <a href="' + TELH + '"><bdi>' + TEL + '</bdi></a></p></div>' +
      '<div class="anfr__seite anfr__danke" data-seite="danke" hidden><p class="anf__marke">' + MARKE + '</p><h2 class="anf__titel" data-danke></h2><p class="anfr__satz">' + esc(T.dankeSatz) + '</p>' +
      '<dl class="anfr__zettel" data-zettel></dl><div class="kn-reihe anf__kn"><button class="kn kn--linie" type="button" data-zu>' + esc(T.zu) + '<i>' + PF + '</i></button></div></div></div></form>';
    document.body.appendChild(hinter); document.body.appendChild(dlg);
    var f = dlg.querySelector('form');
    var zu = function () { dlg.close(); };
    hinter.addEventListener('click', zu); dlg.querySelector('.anfr__zu').addEventListener('click', zu); dlg.querySelector('[data-zu]').addEventListener('click', zu);
    var taste = function (e) { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); zu(); } };
    dlg._taste = taste;
    dlg.addEventListener('close', function () { hinter.hidden = true; document.removeEventListener('keydown', taste); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (!auftrag) return;
      var E = f.elements, n = E.name.value.trim(), k = E.kontakt.value.trim();
      E.name.parentNode.classList.toggle('falsch', !n); E.kontakt.parentNode.classList.toggle('falsch', !k);
      var m = dlg.querySelector('.anfr__meldung');
      if (!n || !k) { m.textContent = T.pflicht; m.hidden = false; (n ? E.kontakt : E.name).focus(); return; }
      auftrag.name = n; auftrag.kontakt = k; auftrag.website = E.website.value;
      if (E.wunsch.value.trim()) auftrag.zeilen = (auftrag.zeilen || []).concat([[T.wunsch, E.wunsch.value.trim()]]);
      sende(auftrag);
    });
  }
  function zeige(seite) {
    dlg.querySelector('[data-seite=eingabe]').hidden = seite !== 'eingabe'; dlg.querySelector('[data-seite=danke]').hidden = seite !== 'danke';
    if (!dlg.open) { vorher = document.activeElement; hinter.hidden = false; dlg.show(); document.addEventListener('keydown', dlg._taste); }
    dlg.scrollTop = 0;
  }
  var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-u-nu-latn' }[SP] || 'de-CH';
  var wert = function (v) { v = String(v).trim(); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00').toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : v; };
  function zettel(z) { return (z || []).filter(function (x) { return x && x[1] && !/^[-–]$/.test(String(x[1]).trim()); }).map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(wert(x[1])) + '</dd>'; }).join(''); }
  function sende(a) {
    baue();
    var kn = dlg.querySelector('button[type=submit]'), m = dlg.querySelector('.anfr__meldung'), alt = kn.firstChild.nodeValue;
    kn.disabled = true; kn.firstChild.nodeValue = T.sendet; m.hidden = true;
    var anliegen = [a.betreff].concat((a.zeilen || []).filter(function (x) { return x && x[1] && x[1] !== a.betreff; }).map(function (x) { return x[0] ? x[0] + ': ' + x[1] : x[1]; })).filter(Boolean).join(' · ');
    return fetch('/reception/api/formular', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ art: a.art, name: a.name, kontakt: a.kontakt, datum: a.datum || '', personen: a.personen || null, anliegen: anliegen, sprache: SP, website: a.website || '' }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.fehler || r.status); }); })
      .then(function () {
        dlg.querySelector('[data-danke]').textContent = T.danke.replace('{n}', a.name && a.name !== a.kontakt && !a.ohneName ? (SP === 'zh' || SP === 'ko' ? '' : ', ') + a.name.split(' ')[0] : '');
        dlg.querySelector('[data-zettel]').innerHTML = zettel((a.zeilen || []).slice(0, 6));
        dlg.querySelector('form').reset(); zeige('danke'); if (a.fertig) a.fertig(); auftrag = null;
      })
      .catch(function () { m.innerHTML = esc(T.fehler) + ' <a href="' + TELH + '"><bdi>' + TEL + '</bdi></a>'; m.hidden = false; zeige('eingabe'); })
      .then(function () { kn.disabled = false; kn.firstChild.nodeValue = alt; });
  }
  /* a: { art, titel (HTML), betreff, zeilen: [[Bezeichnung, Wert]], name, kontakt, datum, personen, wunsch (true = Feld zeigen), fertig() } */
  function schicke(a) {
    baue(); auftrag = a;
    var E = dlg.querySelector('form').elements;
    E.name.value = a.name || ''; E.kontakt.value = a.kontakt || ''; E.wunsch.value = '';
    dlg.querySelector('[data-titel]').innerHTML = a.titel || T.angaben;
    dlg.querySelector('[data-zettel-ein]').innerHTML = zettel(a.zeilen);
    dlg.querySelector('[data-wunschfeld]').hidden = !a.wunsch;
    if (a.name && a.kontakt) { zeige('danke'); dlg.querySelector('[data-danke]').textContent = T.sendet; dlg.querySelector('[data-zettel]').innerHTML = ''; return sende(a); }
    zeige('eingabe'); dlg.querySelector('.anfr__meldung').hidden = true;
    setTimeout(function () { (a.name ? E.kontakt : E.name).focus({ preventScroll: true }); }, 60);
  }
  window.GBRAnfrage = { schicke: schicke };
  /* Knöpfe ohne eigenes Formular (Concierge fragen …): data-gbr-anfrage="programm" data-betreff="…" */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-gbr-anfrage]'); if (!b) return; e.preventDefault();
    schicke({ art: b.getAttribute('data-gbr-anfrage'), betreff: b.getAttribute('data-betreff') || '', titel: b.getAttribute('data-titel') || '', zeilen: b.getAttribute('data-betreff') ? [['', b.getAttribute('data-betreff')]] : [], wunsch: true });
  });
})();
