/* Grand Beau-Rivage Interlaken, Gäste-Funktionen II (Tasty Studios, 11.10.2026): Zimmer-Finder, Preiskalender, Gästekarte, Pass-Berater,
   Abfahrten und Abreisetag, Sprachschalter. Daten kommen aus den JSON-Inseln der Seite (funktionen.py) und von serve.py (/api/kalender, /api/zuege).
   Nichts wird geschätzt: Was der Dienst nicht liefert, bleibt leer mit Hinweis. Bewegung nur über transform und opacity. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var SP = (doc.lang || 'de').slice(0, 2).toLowerCase(); if (['de', 'en', 'fr', 'zh', 'ko', 'ar'].indexOf(SP) < 0) SP = 'en';
  var WURZEL = SP === 'de' ? '' : '../';
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chf = function (n) { var r = Math.round(n * 100) / 100, g = Math.floor(r), rest = Math.round((r - g) * 100); return String(g).replace(/\B(?=(\d{3})+(?!\d))/g, '’') + (rest ? '.' + (rest < 10 ? '0' : '') + rest : ''); };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var daten = function (id) { try { return JSON.parse(($('#' + id) || {}).textContent || 'null'); } catch (e) { return null; } };
  var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar' }[SP];
  /* Wörter der beweglichen Teile in sechs Sprachen (der feste Text der Seite kommt aus sprachen.py) */
  var W = {
    de: { anfrage: 'auf Anfrage', passt: 'Passt am besten', auch: 'Ebenfalls passend', treffer: function (n) { return n === 1 ? 'Ein Zimmer passt' : n + ' Zimmer passen'; }, keine: 'Für diese Wünsche gibt es keine Kategorie, die alles erfüllt. Lassen Sie eine Antwort offen, oder fragen Sie die Rezeption.', pruefen: 'Verfügbarkeit prüfen', seite: 'Zum Zimmer', bis: 'bis', pers: 'Personen', pers1: 'Person',
      ab: 'ab CHF', nacht: 'Nacht', kein: 'nicht frei', beste: 'Günstigste Nacht', stand: 'Buchungssystem des Hauses, Stand', laden: 'wird geladen', fehler: 'Der Preiskalender braucht die Verbindung zum Buchungssystem. Bitte später noch einmal, oder gleich die Buchung öffnen.', vergangen: 'vorbei',
      einzel: 'Einzeltickets', pass: 'Pass', frei: 'enthalten', halb: 'halber Preis', tag: 'Tagespreis', zuschlag: 'Anschlussticket', dazu: 'dazu', mind: 'mindestens', summe: 'Summe der belegten Preise', kindt: 'Kinder 6–15: CHF 30', tage: 'Tage', tag1: 'Tag', nichtdrin: 'nicht im Pass', bestWahl: 'Günstigster belegter Weg', hinweisE: 'Nur Preise, die der Anbieter in CHF nennt. Jungfraujoch, Harder Kulm, Schynige Platte und Schiff haben Tagespreise.', hinweisP: 'Pass für', nurPass: 'Passpreis, ohne Anschlusstickets', keinZiel: 'Wählen Sie mindestens einen Ausflug.',
      gleis: 'Gleis', verspaetung: 'min später', nehmen: 'Diesen Zug', standZ: 'SBB, Stand', fehlerZ: 'Die Abfahrten sind gerade nicht abrufbar. Den Fahrplan finden Sie bei der SBB.', keineZ: 'In der nächsten Stunde meldet die SBB keine Abfahrt.', richtung: 'Richtung',
      zAb: 'Abreise am', zName: 'Name', zZimmer: 'Zimmer', zZug: 'Zug um', zGepaeck: 'Gepäck bis zur Abfahrt aufbewahren', zSpaet: 'Länger im Zimmer bleiben, bitte nachfragen', zTaxi: 'Taxi zum Bahnhof um', zBad: 'Nach dem Auschecken noch ins Bad', zRechnung: 'Rechnung vorab per E-Mail an', zWunsch: 'Wünsche', betreff: 'Abreise', gruss: 'Guten Tag', ende: 'Freundliche Grüsse' },
    en: { anfrage: 'on request', passt: 'Best match', auch: 'Also a good fit', treffer: function (n) { return n === 1 ? 'One room fits' : n + ' rooms fit'; }, keine: 'No category meets all of these wishes. Leave one answer open, or ask reception.', pruefen: 'Check availability', seite: 'See the room', bis: 'up to', pers: 'guests', pers1: 'guest',
      ab: 'from CHF', nacht: 'night', kein: 'not available', beste: 'Lowest rate', stand: 'Hotel booking system, as of', laden: 'loading', fehler: 'The rate calendar needs the connection to the booking system. Please try again later, or open the booking directly.', vergangen: 'past',
      einzel: 'Single tickets', pass: 'Pass', frei: 'included', halb: 'half price', tag: 'day rate', zuschlag: 'add-on ticket', dazu: 'extra', mind: 'at least', summe: 'Sum of published prices', kindt: 'Children 6–15: CHF 30', tage: 'days', tag1: 'day', nichtdrin: 'not in the pass', bestWahl: 'Lowest documented option', hinweisE: 'Only prices the operator publishes in CHF. Jungfraujoch, Harder Kulm, Schynige Platte and the boats have day rates.', hinweisP: 'Pass for', nurPass: 'pass price, without add-on tickets', keinZiel: 'Choose at least one excursion.',
      gleis: 'Platform', verspaetung: 'min late', nehmen: 'Take this train', standZ: 'SBB, as of', fehlerZ: 'Departures are not available right now. Please see the SBB timetable.', keineZ: 'SBB reports no departure in the next hour.', richtung: 'to',
      zAb: 'Departure on', zName: 'Name', zZimmer: 'Room', zZug: 'Train at', zGepaeck: 'Keep luggage until the train leaves', zSpaet: 'Stay in the room longer, please check', zTaxi: 'Taxi to the station at', zBad: 'Use the spa after check-out', zRechnung: 'Invoice in advance by e-mail to', zWunsch: 'Wishes', betreff: 'Departure', gruss: 'Good day', ende: 'Kind regards' },
    fr: { anfrage: 'sur demande', passt: 'Le meilleur choix', auch: 'Convient aussi', treffer: function (n) { return n === 1 ? 'Une chambre convient' : n + ' chambres conviennent'; }, keine: 'Aucune catégorie ne réunit tous ces souhaits. Laissez une réponse ouverte ou demandez à la réception.', pruefen: 'Vérifier les disponibilités', seite: 'Voir la chambre', bis: 'jusqu’à', pers: 'personnes', pers1: 'personne',
      ab: 'dès CHF', nacht: 'nuit', kein: 'complet', beste: 'Nuit la moins chère', stand: 'Système de réservation de l’hôtel, état', laden: 'chargement', fehler: 'Le calendrier des prix a besoin de la liaison avec le système de réservation. Réessayez plus tard ou ouvrez directement la réservation.', vergangen: 'passé',
      einzel: 'Billets individuels', pass: 'Pass', frei: 'inclus', halb: 'demi-tarif', tag: 'prix du jour', zuschlag: 'billet complémentaire', dazu: 'en plus', mind: 'au moins', summe: 'Somme des prix publiés', kindt: 'Enfants 6–15 : CHF 30', tage: 'jours', tag1: 'jour', nichtdrin: 'pas dans le pass', bestWahl: 'Option documentée la moins chère', hinweisE: 'Seuls les prix publiés en CHF par l’exploitant. Jungfraujoch, Harder Kulm, Schynige Platte et les bateaux ont des prix du jour.', hinweisP: 'Pass pour', nurPass: 'prix du pass, sans billets complémentaires', keinZiel: 'Choisissez au moins une excursion.',
      gleis: 'Voie', verspaetung: 'min de retard', nehmen: 'Ce train', standZ: 'CFF, état', fehlerZ: 'Les départs ne sont pas disponibles pour le moment. Consultez l’horaire des CFF.', keineZ: 'Les CFF n’annoncent aucun départ dans l’heure.', richtung: 'direction',
      zAb: 'Départ le', zName: 'Nom', zZimmer: 'Chambre', zZug: 'Train à', zGepaeck: 'Garder les bagages jusqu’au départ', zSpaet: 'Rester plus longtemps dans la chambre, merci de vérifier', zTaxi: 'Taxi pour la gare à', zBad: 'Encore au spa après le départ', zRechnung: 'Facture à l’avance par e-mail à', zWunsch: 'Souhaits', betreff: 'Départ', gruss: 'Bonjour', ende: 'Meilleures salutations' },
    zh: { anfrage: '应要求提供', passt: '最适合您', auch: '同样合适', treffer: function (n) { return n === 1 ? '1 间客房符合' : n + ' 间客房符合'; }, keine: '没有一个房型能满足所有愿望。请放开一个选项，或询问前台。', pruefen: '查看空房', seite: '查看客房', bis: '最多', pers: '位', pers1: '位',
      ab: 'CHF 起', nacht: '晚', kein: '已满', beste: '最优惠的夜晚', stand: '酒店预订系统，更新于', laden: '加载中', fehler: '价格日历需要连接预订系统。请稍后再试，或直接打开预订。', vergangen: '已过',
      einzel: '单程票', pass: '通票', frei: '已包含', halb: '半价', tag: '当日票价', zuschlag: '加票', dazu: '另加', mind: '至少', summe: '已公布价格合计', kindt: '6–15 岁儿童：CHF 30', tage: '天', tag1: '天', nichtdrin: '不含在通票中', bestWahl: '有据可查的最优惠方案', hinweisE: '仅列出运营商以瑞士法郎公布的价格。少女峰、哈德昆、辛尼格观景台和游船为当日票价。', hinweisP: '通票', nurPass: '通票价格，不含加票', keinZiel: '请至少选择一个目的地。',
      gleis: '站台', verspaetung: '分钟延误', nehmen: '选择此列车', standZ: 'SBB，更新于', fehlerZ: '暂时无法获取发车信息，请查看 SBB 时刻表。', keineZ: '未来一小时内 SBB 没有发车。', richtung: '开往',
      zAb: '退房日期', zName: '姓名', zZimmer: '房号', zZug: '列车时间', zGepaeck: '发车前寄存行李', zSpaet: '延迟退房，请确认', zTaxi: '前往车站的出租车', zBad: '退房后使用水疗', zRechnung: '提前将账单发送至', zWunsch: '其他需求', betreff: '退房', gruss: '您好', ende: '谨致问候' },
    ko: { anfrage: '문의', passt: '가장 잘 맞는 객실', auch: '함께 추천', treffer: function (n) { return n + '개 객실이 맞습니다'; }, keine: '모든 조건을 만족하는 객실 유형이 없습니다. 하나를 비워 두시거나 리셉션에 문의해 주세요.', pruefen: '예약 가능 여부 확인', seite: '객실 보기', bis: '최대', pers: '명', pers1: '명',
      ab: 'CHF', nacht: '박', kein: '예약 불가', beste: '가장 저렴한 날', stand: '호텔 예약 시스템, 기준', laden: '불러오는 중', fehler: '요금 캘린더는 예약 시스템 연결이 필요합니다. 잠시 후 다시 시도하거나 바로 예약을 열어 주세요.', vergangen: '지남',
      einzel: '개별 티켓', pass: '패스', frei: '포함', halb: '반값', tag: '당일 요금', zuschlag: '추가 티켓', dazu: '추가', mind: '최소', summe: '공시된 가격 합계', kindt: '6–15세 어린이: CHF 30', tage: '일', tag1: '일', nichtdrin: '패스에 미포함', bestWahl: '확인된 가장 저렴한 방법', hinweisE: '운영사가 스위스 프랑으로 공시한 가격만 표시합니다. 융프라우요흐, 하더쿨름, 쉬니게 플라테, 유람선은 당일 요금입니다.', hinweisP: '패스', nurPass: '패스 가격, 추가 티켓 제외', keinZiel: '최소 한 곳을 선택해 주세요.',
      gleis: '플랫폼', verspaetung: '분 지연', nehmen: '이 열차 선택', standZ: 'SBB, 기준', fehlerZ: '현재 출발 정보를 가져올 수 없습니다. SBB 시간표를 확인해 주세요.', keineZ: '다음 한 시간 동안 SBB 출발 열차가 없습니다.', richtung: '행',
      zAb: '체크아웃 날짜', zName: '이름', zZimmer: '객실 번호', zZug: '열차 시간', zGepaeck: '출발 전까지 짐 보관', zSpaet: '늦은 체크아웃 요청', zTaxi: '역까지 택시', zBad: '체크아웃 후 스파 이용', zRechnung: '청구서를 미리 이메일로', zWunsch: '요청 사항', betreff: '체크아웃', gruss: '안녕하세요', ende: '감사합니다' },
    ar: { anfrage: 'عند الطلب', passt: 'الأنسب لكم', auch: 'مناسب أيضاً', treffer: function (n) { return n === 1 ? 'غرفة واحدة تناسبكم' : n + ' غرف تناسبكم'; }, keine: 'لا توجد فئة تحقق كل هذه الرغبات. اتركوا إجابة واحدة مفتوحة، أو اسألوا الاستقبال.', pruefen: 'التحقق من التوفر', seite: 'عرض الغرفة', bis: 'حتى', pers: 'أشخاص', pers1: 'شخص',
      ab: 'من CHF', nacht: 'ليلة', kein: 'غير متاح', beste: 'أرخص ليلة', stand: 'نظام حجز الفندق، بتاريخ', laden: 'جارٍ التحميل', fehler: 'يحتاج تقويم الأسعار إلى الاتصال بنظام الحجز. حاولوا لاحقاً أو افتحوا الحجز مباشرة.', vergangen: 'انتهى',
      einzel: 'تذاكر فردية', pass: 'بطاقة', frei: 'مشمول', halb: 'نصف السعر', tag: 'سعر اليوم', zuschlag: 'تذكرة إضافية', dazu: 'إضافة', mind: 'على الأقل', summe: 'مجموع الأسعار المنشورة', kindt: 'الأطفال 6–15: CHF 30', tage: 'أيام', tag1: 'يوم', nichtdrin: 'غير مشمول', bestWahl: 'أوفر خيار موثّق', hinweisE: 'فقط الأسعار التي ينشرها المشغّل بالفرنك السويسري. يونغفراويوخ وهاردر كولم وشينيغه بلاته والقوارب لها أسعار يومية.', hinweisP: 'بطاقة لمدة', nurPass: 'سعر البطاقة، دون التذاكر الإضافية', keinZiel: 'اختاروا رحلة واحدة على الأقل.',
      gleis: 'الرصيف', verspaetung: 'دقيقة تأخير', nehmen: 'هذا القطار', standZ: 'SBB، بتاريخ', fehlerZ: 'مواعيد المغادرة غير متاحة حالياً. راجعوا جدول SBB.', keineZ: 'لا تعلن SBB عن أي مغادرة خلال الساعة القادمة.', richtung: 'إلى',
      zAb: 'المغادرة في', zName: 'الاسم', zZimmer: 'الغرفة', zZug: 'القطار في', zGepaeck: 'حفظ الحقائب حتى المغادرة', zSpaet: 'البقاء في الغرفة لوقت أطول، يرجى التحقق', zTaxi: 'سيارة أجرة إلى المحطة في', zBad: 'استخدام السبا بعد تسجيل المغادرة', zRechnung: 'إرسال الفاتورة مسبقاً إلى', zWunsch: 'طلبات', betreff: 'المغادرة', gruss: 'مرحباً', ende: 'مع أطيب التحيات' }
  }[SP];
  var belebe = function (el) { el.classList.remove('dn-los'); requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); }); };
  var schalter = function (wurzel, attr, start, wenn) {
    var w = start;
    $$('[' + attr + ']', wurzel).forEach(function (b) { b.addEventListener('click', function () { w = b.getAttribute(attr); $$('[' + attr + ']', wurzel).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); if (wenn) wenn(w); }); });
    return function () { return w; };
  };
  var oeffneBuchung = function (an, ab) {
    var dlg = $('dialog.buchen'), f = dlg && $('form', dlg);
    if (f && an) { f.elements.an.value = an; f.elements.ab.min = ab; f.elements.ab.value = ab; }
    var k = $('.nav__rechts [data-buchen]') || $('[data-buchen]'); if (k) k.click();
  };

  /* ---------- Sprachschalter: auf dem Handy nur die aktuelle Sprache, ein Tipp klappt die anderen auf ---------- */
  $$('.sprache').forEach(function (s) {
    if ($('.sp-mehr', s)) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sp-mehr'; b.setAttribute('aria-label', 'Sprachen'); b.innerHTML = '<svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>';
    b.addEventListener('click', function () { s.classList.toggle('sp-offen'); });
    s.appendChild(b);
  });

  /* ---------- Zimmer-Finder: drei Auswahllisten in der Leiste, drei 3D-Kacheln wie auf der Startseite, darunter die Miniaturen-Reihe wie
     im Vergleich (Robert 11.10.2026: «genauso wie weiter unten, Antippen tauscht»). Fahrt wie dort: 880 ms, Kurve .36,0,.1,1, nur transform. ---------- */
  $$('[data-zfinder]').forEach(function (fo) {
    var Z = daten('zf-daten') || [], aus = $('[data-zf-aus]', fo.closest('.zf') || document), el = fo.elements;
    var RK = 'cubic-bezier(.36,0,.1,1)', RD = 880, faehrt = false, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pers = function () { return +el.pers.value || 2; }, blick = function () { return el.blick.value; }, merk = function () { return el.merk.value; };
    var wort = function (sel) { var o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; };
    function passt(z) { return z.max >= pers() && (!blick() || z.blick.indexOf(blick()) >= 0) && (!merk() || z.merk.indexOf(merk()) >= 0); }
    function wert(z) { return (z.max - pers()) * 10 + (z.blick.length ? 0 : 1); }
    var flaeche = function (z) { return z.g || W.anfrage; };
    function klein(z) { return [z.g, z.bel].filter(Boolean).concat(z.merkw.slice(0, 2)).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(''); }
    function kachel(z, i) {
      return '<a class="kachel k3 da zf-k" href="' + esc(z.seite) + '" data-zf-k="' + z.id + '" data-r="bild" style="--i:' + i + '"><span class="kachel__b dunst"><img src="' + esc(z.bild) + '" alt="" loading="lazy" decoding="async" style="background:50%/cover url(' + (z.vs || esc(z.mini)) + ');object-position:' + esc(z.pos) + '"></span>' +
        '<span class="kachel__n"><b>' + esc(z.name) + '</b><small>' + klein(z) + '</small></span></a>';
    }
    function mini(z) {
      return '<button type="button" class="vk__gk" data-zf-m="' + z.id + '" title="' + esc(z.name) + '" aria-label="' + esc(z.name) + ', ' + esc(flaeche(z)) + '"><img src="' + esc(z.mini) + '" alt="" width="480" height="320" loading="lazy" decoding="async"><span class="vk__gk-m">' + esc(flaeche(z)) + '</span></button>';
    }
    var byId = {}; Z.forEach(function (z) { byId[z.id] = z; });
    /* Wechsel der Auswahl ohne Flackern (Robert 11.10.2026: «verschwinden, aufploppen, aufflackern … macht das schön»): Kacheln und Miniaturen
       bleiben stehen; wo ein anderes Zimmer hingehört, wird das neue Bild erst fertig geladen und dann weich darübergeblendet (nur opacity). */
    var WEICH = 520;
    function blende(img, src, pos) {
      if (!img) return;
      var box = img.parentNode;
      if (box._blende) box._blende();   // ein laufender Wechsel wird sofort beendet, nie zwei Bilder übereinander im Wechsel
      img = box.querySelector('img'); if (!img) return;
      if (img.getAttribute('src') === src) { if (pos != null) img.style.objectPosition = pos; return; }
      var ob = img.cloneNode(), fertig = false;
      ob.removeAttribute('loading'); ob.decoding = 'sync'; ob.src = src; if (pos != null) ob.style.objectPosition = pos;
      ob.style.position = 'absolute'; ob.style.inset = '0'; ob.style.width = '100%'; ob.style.height = '100%'; ob.style.objectFit = 'cover'; ob.style.opacity = '0';
      var ab = function () {   // das neue Bild bleibt stehen, das alte wird entfernt: kein zweites Laden, kein Aufblitzen
        if (fertig) return; fertig = true; box._blende = null;
        ob.getAnimations && ob.getAnimations().forEach(function (a) { a.cancel(); });
        ob.style.opacity = ''; ob.style.position = ''; ob.style.inset = ''; ob.style.width = ''; ob.style.height = ''; ob.style.objectFit = '';
        if (img.parentNode) img.remove();
      };
      box._blende = function () { if (ob.parentNode) ab(); else { fertig = true; box._blende = null; } };
      var los = function () {
        if (fertig) return;
        img.parentNode === box ? box.insertBefore(ob, img.nextSibling) : box.appendChild(ob);   // direkt über dem alten Bild, unter Beschriftungen
        if (ruhig || !ob.animate) { ab(); return; }
        ob.animate([{ opacity: 0 }, { opacity: 1 }], { duration: WEICH, easing: 'ease', fill: 'forwards' }).onfinish = ab;
      };
      (ob.decode ? ob.decode() : Promise.resolve()).then(los, los);
    }
    function weichText(el, html) { if (el.innerHTML === html) return; if (ruhig || !el.animate) { el.innerHTML = html; return; } el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease' }).onfinish = function () { el.innerHTML = html; el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease' }); }; }
    function einblenden(el) {   // neue Kachel oder Miniatur: unsichtbar, bis ihr Bild fertig ist, dann weich herein
      var im = el.querySelector('img'); if (ruhig || !el.animate || !im) return;
      el.style.opacity = '0'; im.removeAttribute('loading');
      var los = function () { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: WEICH, easing: 'ease' }).onfinish = function () { el.style.opacity = ''; }; el.style.opacity = ''; };
      (im.decode ? im.decode() : Promise.resolve()).then(los, los);
    }
    /* Miniaturen von der Mitte aus (Robert 11.10.2026): die Reihe bleibt mittig, kommen Zimmer dazu oder fallen weg, dann links und rechts gleich viele;
       die übrigen gleiten danach ruhig an ihren neuen Platz (nur transform), die Höhe der Reihe bleibt immer gleich (Platz für alle zehn). */
    var GLEIT = 'cubic-bezier(.22,.61,.36,1)';
    function reiheHoch(gr) {
      var m = $('[data-zf-m]', gr); if (!m) return;
      var gap = parseFloat(getComputedStyle(gr).columnGap) || 10, w = m.offsetWidth, h = w / (parseFloat(getComputedStyle(gr).getPropertyValue('--vk-ar')) || 1.3333);   // Höhe aus dem Seitenverhältnis: unabhängig von Bewegung und Dehnung
      var proReihe = Math.max(1, Math.round((gr.clientWidth + gap) / (w + gap))), reihen = Math.ceil(Math.max(0, Z.length - 3) / proReihe);
      var cs = getComputedStyle(gr), pad = cs.boxSizing === 'border-box' ? (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) : 0;
      gr.style.minHeight = (reihen * h + (reihen - 1) * gap + pad).toFixed(1) + 'px';
    }
    function minisSetzen(gr, rest) {
      gr.style.position = 'relative';
      var ms = $$('[data-zf-m]:not(.zf-m--weg)', gr), vorher = new Map(), gb = gr.getBoundingClientRect();
      ms.forEach(function (m) { vorher.set(m, m.getBoundingClientRect()); });
      var diff = rest.length - ms.length, n;
      if (diff < 0) {   // abwechselnd hinten und vorne heraus, als Abzug an der alten Stelle ausblenden
        for (n = 0; n < -diff; n++) {
          var m = n % 2 === 0 ? ms.pop() : ms.shift(), r = vorher.get(m);
          m.classList.add('zf-m--weg'); m.style.position = 'absolute'; m.style.left = (r.left - gb.left) + 'px'; m.style.top = (r.top - gb.top) + 'px'; m.style.width = r.width + 'px'; m.style.height = r.height + 'px'; m.style.margin = '0';
          (function (mm) { if (ruhig || !mm.animate) mm.remove(); else mm.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 380, easing: 'ease' }).onfinish = function () { mm.remove(); }; })(m);
        }
      }
      var neuM = [];
      if (diff > 0) {   // abwechselnd hinten und vorne dazu
        for (n = 0; n < diff; n++) {
          var t3 = document.createElement('div'); t3.innerHTML = mini(rest[0]); var nm = t3.firstChild;
          if (n % 2 === 0) { gr.appendChild(nm); ms.push(nm); } else { gr.insertBefore(nm, ms[0] || null); ms.unshift(nm); }
          neuM.push(nm);
        }
      }
      // Inhalte: Reihenfolge der Zimmer von links nach rechts
      rest.forEach(function (z, i) {
        var m = ms[i];
        if (neuM.indexOf(m) >= 0) { var t4 = document.createElement('div'); t4.innerHTML = mini(z); var fr = t4.firstChild; gr.replaceChild(fr, m); ms[i] = fr; neuM[neuM.indexOf(m)] = fr; return; }
        if (m.getAttribute('data-zf-m') === z.id) return;
        m.setAttribute('data-zf-m', z.id); m.title = z.name; m.setAttribute('aria-label', z.name + ', ' + flaeche(z));
        blende($('img', m), z.mini, null); weichText($('.vk__gk-m', m), esc(flaeche(z)));
      });
      neuM.forEach(function (m) {   // neue erst zeigen, wenn ihr Bild fertig ist
        var im = $('img', m); im.removeAttribute('loading'); m.style.opacity = '0';
        var los = function () { if (ruhig || !m.animate) { m.style.opacity = ''; return; } m.style.opacity = ''; m.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 560, delay: 160, easing: GLEIT, fill: 'backwards' }); };
        (im.decode ? im.decode() : Promise.resolve()).then(los, los);
      });
      // die gebliebenen gleiten an ihren neuen Platz (kurz verzögert, damit erst das Kommen und Gehen zu sehen ist)
      if (!ruhig) ms.forEach(function (m) {
        var a = vorher.get(m); if (!a || !m.animate) return;
        var b = m.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        m.animate([{ transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)' }, { transform: 'none' }], { duration: 760, delay: 140, easing: GLEIT, fill: 'backwards' });
      });
      reiheHoch(gr);
    }
    function sanft(L) {
      var reihe = $('.zf-reihe', aus), kopf = $('.zf__zeile', aus);
      if (!reihe || !kopf) return false;
      weichText(kopf, '<span class="mono">' + W.treffer(L.length) + '</span><em>' + esc(wort(el.pers)) + (blick() ? ' · ' + esc(wort(el.blick)) : '') + (merk() ? ' · ' + esc(wort(el.merk)) : '') + '</em>');
      var ks = $$('.zf-k', reihe);
      L.slice(0, 3).forEach(function (z, i) {
        var k = ks[i];
        if (!k) { var t = document.createElement('div'); t.innerHTML = kachel(z, i); k = t.firstChild; reihe.appendChild(k); einblenden(k); return; }
        if (k.getAttribute('data-zf-k') === z.id) return;
        k.href = z.seite; k.setAttribute('data-zf-k', z.id); blende($('img', k), z.bild, z.pos);
        weichText($('.kachel__n', k), '<b>' + esc(z.name) + '</b><small>' + klein(z) + '</small>');
      });
      ks.slice(L.length).forEach(function (k) { k.classList.add('zf-k--weg'); k.classList.remove('zf-k--ziel'); if (ruhig || !k.animate) k.remove(); else k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = function () { k.remove(); }; });
      var rest = L.slice(3), gal = $('.zf-minis', aus);
      if (!gal) { var t2 = document.createElement('div'); t2.innerHTML = '<div class="vk__galerie zf-minis"><div class="vk__gr" style="--vk-ar:1.3333"></div></div>'; gal = t2.firstChild; aus.appendChild(gal); }
      minisSetzen($('.vk__gr', gal), rest);
      var ks2 = $$('.zf-k:not(.zf-k--weg)', reihe); if (ks2.length) zielSetzen(ks2[ks2.length - 1]);
      return true;
    }
    function neu() {
      var L = Z.filter(passt).sort(function (a, b) { return wert(a) - wert(b); });
      if (!L.length) { aus.innerHTML = '<p class="zf__leer">' + W.keine + '</p>'; return; }
      if (sanft(L)) return;
      var rest = L.slice(3);
      aus.innerHTML = '<div class="zf__zeile"><span class="mono">' + W.treffer(L.length) + '</span><em>' + esc(wort(el.pers)) + (blick() ? ' · ' + esc(wort(el.blick)) : '') + (merk() ? ' · ' + esc(wort(el.merk)) : '') + '</em></div>' +
        '<div class="k3reihe zf-reihe">' + L.slice(0, 3).map(kachel).join('') + '</div>' +
        '<div class="vk__galerie zf-minis"><div class="vk__gr" style="--vk-ar:1.3333">' + rest.map(mini).join('') + '</div></div>';   // die Reihe steht immer da, auch leer: keine springende Höhe
      var ks = $$('.zf-k', aus); if (ks.length) zielSetzen(ks[ks.length - 1]);
      var gr0 = $('.zf-minis .vk__gr', aus); if (gr0) reiheHoch(gr0);
    }
    function zielSetzen(k) { $$('.zf-k', aus).forEach(function (x) { x.classList.toggle('zf-k--ziel', x === k); }); }
    function fuelleKachel(k, z) {
      k.href = z.seite; k.setAttribute('data-zf-k', z.id); var im = $('img', k); im.src = z.bild; im.style.objectPosition = z.pos;
      $('.kachel__n', k).innerHTML = '<b>' + esc(z.name) + '</b><small>' + klein(z) + '</small>';
    }
    function fuelleMini(m, z) {
      m.setAttribute('data-zf-m', z.id); m.title = z.name; m.setAttribute('aria-label', z.name + ', ' + flaeche(z)); $('img', m).src = z.mini; $('.vk__gk-m', m).textContent = flaeche(z);
    }
    function tausche(m) {
      if (faehrt) return;
      var ziel = $('.zf-k--ziel', aus) || $$('.zf-k', aus).pop(); if (!ziel) return;
      var neuZ = byId[m.getAttribute('data-zf-m')], altZ = byId[ziel.getAttribute('data-zf-k')]; if (!neuZ || !altZ || neuZ === altZ) return;
      var gross = $('.kachel__b', ziel), vor = new Image(); vor.src = neuZ.bild;
      faehrt = true;
      var los = function () {
        var T = m.getBoundingClientRect(), G = gross.getBoundingClientRect();
        fuelleKachel(ziel, neuZ); fuelleMini(m, altZ);
        if (ruhig || !gross.animate) { faehrt = false; return; }
        var fahrt = function (e2, von, nach, zi) {
          e2.style.zIndex = zi; e2.style.transformOrigin = '0 0'; e2.style.position = 'relative';
          return e2.animate([{ transform: 'translate(' + (von.left - nach.left).toFixed(1) + 'px,' + (von.top - nach.top).toFixed(1) + 'px) scale(' + (von.width / nach.width).toFixed(5) + ')' }, { transform: 'none' }], { duration: RD, easing: RK });
        };
        var l1 = fahrt(gross, T, G, 4); fahrt(m, G, T, 3);
        $('.vk__gk-m', m).animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: RD + 200, easing: 'ease-out' });
        l1.onfinish = function () { [gross, m].forEach(function (e2) { e2.style.zIndex = ''; e2.style.transformOrigin = ''; e2.style.position = ''; }); faehrt = false; };
      };
      (vor.decode ? vor.decode() : Promise.resolve()).then(los, los);
    }
    aus.addEventListener('click', function (e) {
      var m = e.target.closest('[data-zf-m]'); if (m) { tausche(m); return; }
      var k = e.target.closest('.zf-k'); if (k && !k.classList.contains('zf-k--ziel')) { e.preventDefault(); zielSetzen(k); }   // erster Tipp wählt die Kachel als Ziel, der zweite öffnet die Zimmerseite
    });
    fo.addEventListener('change', neu);
    var rh = 0; addEventListener('resize', function () { clearTimeout(rh); rh = setTimeout(function () { var g = $('.zf-minis .vk__gr', aus); if (g) reiheHoch(g); }, 200); });
    fo.addEventListener('click', function (e) { if (e.target.closest('[data-zf-buchen]')) oeffneBuchung(); });
    neu();
  });

  /* ---------- Gästekarte: die Karte folgt der Hand (nur transform) ---------- */
  $$('[data-kippt]').forEach(function (w) {
    var k = $('.gka-k', w); if (!k || matchMedia('(hover:none)').matches) return;
    w.addEventListener('pointermove', function (e) { var r = k.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; k.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); k.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg'); });
    w.addEventListener('pointerleave', function () { k.style.setProperty('--ry', '0deg'); k.style.setProperty('--rx', '0deg'); });
  });

  /* ---------- Pass-Berater ---------- */
  $$('[data-pass]').forEach(function (box) {
    var D = daten('pb-daten'); if (!D) return;
    var NAME = {}; D.ziele.forEach(function (z) { NAME[z.id] = z.name; });
    var aus = $('[data-pass-aus]', box), fo = $('form.pb__leiste', box), el = fo.elements, tage = 3, halb = function () { return el.halbtax.value; };
    fo.addEventListener('change', function () { tage = +el.tage.value || 3; neu(); });
    $$('[data-ziel]', box).forEach(function (b) {
      var um = function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); neu(); };
      b.addEventListener('click', um);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); um(); } });
    });
    var gewaehlt = function () { return $$('[data-ziel][aria-pressed="true"]', box).map(function (b) { return b.getAttribute('data-ziel'); }); };
    var heute = iso(new Date());
    var SONDER = { de: '25 % Rabatt', en: '25 % off', fr: '25 % de rabais', zh: '七五折', ko: '25 % 할인', ar: 'خصم 25 %' }[SP];
    function passPreis(p) {   // nächste erhältliche Dauer, die die Tage deckt
      var ks = Object.keys(p.tage).map(Number).sort(function (a, b) { return a - b; }), d = ks.filter(function (k) { return k >= tage; })[0] || ks[ks.length - 1];
      return { tage: d, chf: p.tage[d][halb() === '1' ? 1 : 0] };
    }
    /* Jede Spalte ist ein Billett (Robert 12.10.2026): Kopfzeile mit Nummer, Name und Preis, darunter die Perforation und der Abriss mit den Fahrten. Gestalt in region.css. */
    var nr = 0;
    function spalte(art, name, preis, unter, zeilen, fuss, best, stempel) {
      nr = nr % 3 + 1;
      return '<article class="pb-s' + (best ? ' pb-s--best' : '') + '">' + (stempel ? '<span class="pb-s__stempel">' + stempel + '</span>' : '') +
        '<div class="pb-s__haupt"><p class="pb-s__kopf"><span>Nº 0' + nr + '</span><span>' + esc(D.kopf || art) + '</span></p><h3 class="pb-s__name">' + esc(name) + '</h3>' +
        '<p class="pb-s__preis">' + preis + '</p><p class="pb-s__unter">' + unter + '</p></div>' +
        '<div class="pb-s__abriss"><ul class="pb-s__liste">' + zeilen + '</ul><p class="pb-s__fuss">' + fuss + '</p></div></article>';
    }
    function neu() {
      var Zl = gewaehlt(), h = halb() === '1';
      if (!Zl.length) { aus.innerHTML = '<p class="pb__leer" style="grid-column:1/-1">' + W.keinZiel + '</p>'; return; }
      // Einzeltickets: nur belegte Preise summieren
      var e = 0, offen = 0, ez = Zl.map(function (z) {
        var p = D.einzel[z];
        if (p) { var v = h ? p.halb : p.voll; e += v; return '<li><span>' + esc(NAME[z]) + '</span><b>CHF ' + chf(v) + '</b></li>'; }
        offen++; return '<li><span>' + esc(NAME[z]) + '</span><i>' + W.tag + '</i></li>';
      }).join('');
      var ePreis = e ? '<small>' + W.mind + ' CHF</small>' + chf(e) : '<em>' + W.tag + '</em>';
      // Jungfrau Travel Pass
      var j = D.jtp, jp = passPreis(j), jSumme = jp.chf, jz = Zl.map(function (z) {
        if (z === 'joch') { var s = heute >= j.joch.von && heute <= j.joch.bis ? j.joch.sommer : j.joch.winter; jSumme += s; return '<li class="halb"><span>' + esc(NAME[z]) + '</span><b>+ CHF ' + chf(s) + '</b></li>'; }
        if (j.frei.indexOf(z) >= 0) return '<li class="frei"><span>' + esc(NAME[z]) + '</span><b>' + W.frei + '</b></li>';
        return '<li><span>' + esc(NAME[z]) + '</span><i>' + W.nichtdrin + '</i></li>';
      }).join('');
      // Berner Oberland Pass
      var b = D.bop, bp = passPreis(b), bz = Zl.map(function (z) {
        if (b.frei.indexOf(z) >= 0) return '<li class="frei"><span>' + esc(NAME[z]) + '</span><b>' + W.frei + '</b></li>';
        if (b.halb.indexOf(z) >= 0) return '<li class="halb"><span>' + esc(NAME[z]) + '</span><b>' + W.halb + '</b></li>';
        if ((b.sonder || []).indexOf(z) >= 0) return '<li class="halb"><span>' + esc(NAME[z]) + '</span><b>' + SONDER + '</b></li>';   // Sonderpreis laut Tarif T656.2: rund 25 % Ermässigung (14.10.2026)
        return '<li><span>' + esc(NAME[z]) + '</span><i>' + W.nichtdrin + '</i></li>';
      }).join('');
      // «Günstigster belegter Weg» nur unter Wegen, deren Summe vollständig ist: keine Fahrt «nicht im Pass» oder «halber Preis» ohne belegten Betrag
      var jVoll = Zl.every(function (z) { return z === 'joch' || j.frei.indexOf(z) >= 0; });
      var bVoll = Zl.every(function (z) { return b.frei.indexOf(z) >= 0; });
      var kandidaten = []; if (jVoll) kandidaten.push({ k: 'jtp', v: jSumme }); if (bVoll) kandidaten.push({ k: 'bop', v: bp.chf }); if (!offen && e) kandidaten.push({ k: 'einzel', v: e });
      var best = kandidaten.length ? kandidaten.sort(function (a, c) { return a.v - c.v; })[0].k : '';
      var bUnter = W.hinweisP + ' ' + bp.tage + ' ' + W.tage + ' · ' + (bVoll ? '' : W.nurPass + ' · ') + W.kindt;
      aus.innerHTML = spalte(W.einzel, W.einzel, ePreis, offen ? W.hinweisE : W.summe, ez, D.einzel.schilthorn.quelle + ' · ' + D.stand, best === 'einzel', best === 'einzel' ? W.bestWahl : '') +
        spalte(W.pass, j.name, '<small>CHF</small>' + chf(jSumme), W.hinweisP + ' ' + jp.tage + ' ' + W.tage + (jSumme !== jp.chf ? ' · CHF ' + chf(jp.chf) + ' + ' + W.zuschlag : '') + ' · ' + W.kindt, jz, j.quelle + ' · ' + D.stand, best === 'jtp', best === 'jtp' ? W.bestWahl : '') +
        spalte(W.pass, b.name, '<small>' + (bVoll ? '' : W.mind + ' ') + 'CHF</small>' + chf(bp.chf), bUnter, bz, b.quelle + ' · ' + D.stand, best === 'bop', best === 'bop' ? W.bestWahl : '');
    }
    neu();
    /* Auftritt der Billette: beim ersten Mal steigen sie federnd herauf, sobald sie im Bild sind; bei jeder neuen Wahl danach nur ein leiser Wechsel (nur transform und opacity) */
    var zeig = function () { aus.classList.add('da'); setTimeout(function () { aus.classList.add('ruhig'); }, 2600); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); zeig(); } }, { rootMargin: '0px 0px -14% 0px' }).observe(aus); else zeig();
  });

  /* Einstieg «Lohnt sich ein Pass?» (14.10.2026): zwei feste Billette, die Rechnung steht im Planer. Auftritt wie früher beim Rechner. */
  $$('[data-pass-einstieg]').forEach(function (aus) {
    var zeig = function () { aus.classList.add('da'); setTimeout(function () { aus.classList.add('ruhig'); }, 2600); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); zeig(); } }, { rootMargin: '0px 0px -14% 0px' }).observe(aus); else zeig();
  });

  /* ---------- Abfahrten Interlaken Ost / West ---------- */
  /* Zeiten immer in Schweizer Zeit, egal wo der Gast gerade sitzt (12.10.2026: aus Asien geöffnet stand die Tafel fünf Stunden daneben). */
  var ZH = 'Europe/Zurich';
  var uhr = function (d) { return d.toLocaleTimeString(ORT === 'ar' ? 'ar-u-nu-latn' : ORT, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZH }); };
  var hhmm = function (d) { return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZH }).replace('.', ':'); };
  var PFEIL_Z = '<svg class="ab-pf" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg><svg class="ab-hk" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.5l2.9 2.9 5.9-6.6"/></svg>';
  var ZUG = null;   // gewählter Zug für das Formular
  $$('[data-zuege]').forEach(function (box) {
    var liste = $('[data-zuege-liste]', box), stand = $('[data-zuege-stand]', box), bf = schalter(box, 'data-bf', 'ost', function () { lade(true); });
    var gleich = function (z) { return ZUG && z.ab === ZUG.ab && z.ziel === ZUG.ziel && z.bahnhof === ZUG.bahnhof; };
    function zeile(z, i) {
      var d = new Date(z.ab), v = z.delay ? '<small>+' + z.delay + ' ' + W.verspaetung + '</small>' : '';
      return '<li style="--i:' + i + '"><button class="ab-z' + (gleich(z) ? ' ab-z--gewaehlt' : '') + '" type="button" data-zug="' + i + '"><span class="ab-z__zeit">' + uhr(d) + v + '</span>' +
        '<span class="ab-z__ziel"><b>' + esc(z.ziel) + '</b><small>' + esc(z.linie) + (z.via ? ' · ' + esc(z.via) : '') + '</small></span>' +
        '<span class="ab-z__gleis"><small>' + W.gleis + '</small><b>' + esc(z.gleis || '–') + '</b></span><span class="ab-z__nehmen">' + W.nehmen + '<i>' + PFEIL_Z + '</i></span></button></li>';
    }
    var DATA = [];
    /* frisch = erstes Laden oder anderer Bahnhof: Hinweis zeigen, Zeilen treten nacheinander auf. Die Auffrischung jede Minute tauscht still. */
    function lade(frisch) {
      if (frisch) liste.innerHTML = '<li class="ab__leer">' + W.laden + '</li>';
      fetch(WURZEL + 'api/zuege?bf=' + bf()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
        DATA = d.zuege || [];
        liste.classList.toggle('neu', !!frisch);
        liste.innerHTML = DATA.length ? DATA.map(zeile).join('') : '<li class="ab__leer">' + W.keineZ + '</li>';
        stand.textContent = W.standZ + ' ' + uhr(new Date()) + ' · ' + d.bahnhof;
      }).catch(function () { if (frisch || !DATA.length) liste.innerHTML = '<li class="ab__leer">' + W.fehlerZ + '</li>'; });
    }
    liste.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zug]'); if (!b) return;
      ZUG = DATA[+b.getAttribute('data-zug')]; $$('.ab-z', liste).forEach(function (x) { x.classList.toggle('ab-z--gewaehlt', x === b); });
      document.dispatchEvent(new CustomEvent('gbr:zug', { detail: ZUG }));
      var f = $('#morgen'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.addEventListener('gbr:zug-weg', function () { ZUG = null; $$('.ab-z--gewaehlt', liste).forEach(function (x) { x.classList.remove('ab-z--gewaehlt'); }); });
    lade(true);
    setInterval(function () { lade(false); }, 60000);
  });

  /* ---------- Abreisetag: Wünsche an die Rezeption ---------- */
  /* Fassung 2 (12.10.2026): jeder Wunsch ist eine Foto-Kachel zum Antippen ([data-wunsch], aria-pressed), der gewählte Zug steht als Billett da. Gestalt in abreise.css. */
  $$('form[data-abreise]').forEach(function (fo) {
    var el = fo.elements, mail = ($('#dn-daten') && daten('dn-daten') || {}).mail || 'info@grandbeaurivage.ch';
    var wahl = function (name) {
      var b = $('[data-wunsch="' + name + '"]', fo); if (!b) return function () { return '0'; };
      var um = function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); neu(); };
      b.addEventListener('click', um);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); um(); } });
      return function () { return b.getAttribute('aria-pressed') === 'true' ? '1' : '0'; };
    };
    var gepaeck = wahl('gepaeck'), spaet = wahl('spaet'), taxi = wahl('taxi'), bad = wahl('bad'), rechnung = wahl('rechnung');
    var zz = $('[data-zug-zeile]', fo), teil = function (a, t) { var e = $('[data-zug-' + a + ']', fo); if (e) e.textContent = t; };
    var heute = new Date().toLocaleDateString('sv-SE', { timeZone: ZH }); el.ab.min = heute; el.ab.value = heute; el.ab.dispatchEvent(new Event('change', { bubbles: true }));   // die Datumsanzeige der Seite (main.js) liest den Wert bei «change»
    var stand = [];
    document.addEventListener('gbr:zug', function (e) {
      var z = e.detail, d = new Date(z.ab), hm = hhmm(d); el.zug.value = hm;
      teil('zeit', hm); teil('nach', z.ziel); teil('linie', z.linie); teil('gleis', z.gleis || '–'); teil('bf', z.bahnhof);
      zz.hidden = false; zz.classList.remove('abr-billett--neu'); void zz.offsetWidth; zz.classList.add('abr-billett--neu');
      var t = el.taxizeit; if (t) { var m = (+hm.slice(0, 2) * 60 + +hm.slice(3, 5) - 25 + 1440) % 1440; t.value = ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
      neu();
    });
    $('[data-zug-weg]', fo).addEventListener('click', function () { zz.hidden = true; ZUG = null; document.dispatchEvent(new CustomEvent('gbr:zug-weg')); neu(); var l = $('[data-zuege]'); if (l) l.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    function neu() {
      $$('[data-nur-taxi]', fo).forEach(function (t) { t.hidden = taxi() !== '1'; });
      $$('[data-nur-rechnung]', fo).forEach(function (t) { t.hidden = rechnung() !== '1'; });
      var z = [];
      z.push(W.zAb + ' ' + (el.ab.value ? new Date(el.ab.value + 'T12:00').toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long' }) : '–'));
      if (el.zug.value) z.push(W.zZug + ' ' + el.zug.value + (ZUG ? ' (' + ZUG.linie + ' ' + W.richtung + ' ' + ZUG.ziel + ', ' + ZUG.bahnhof + ')' : ''));
      if (gepaeck() === '1') z.push(W.zGepaeck);
      if (spaet() === '1') z.push(W.zSpaet);
      if (taxi() === '1') z.push(W.zTaxi + ' ' + (el.taxizeit.value || '–'));
      if (bad() === '1') z.push(W.zBad);
      if (rechnung() === '1') z.push(W.zRechnung + ' ' + (el.mail.value || '–'));
      if (el.wunsch.value) z.push(W.zWunsch + ': ' + el.wunsch.value);
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = z;
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [W.zName + ': ' + el.name.value, W.zZimmer + ': ' + (el.zimmer.value || '–')].concat(stand);
      /* in den Eingang von La Réception statt ins Mailprogramm (16.10.2026); Kontakt = Rechnungsadresse oder Zimmer, sonst fragt das Fenster */
      if (window.GBRAnfrage) GBRAnfrage.schicke({ art: 'aufenthalt', betreff: W.betreff, name: el.name.value, datum: el.ab.value,
        kontakt: el.mail.value || (el.zimmer.value ? W.zZimmer + ' ' + el.zimmer.value : ''),
        zeilen: z.slice(1).map(function (x) { var i = x.indexOf(': '); return i > 0 ? [x.slice(0, i), x.slice(i + 2)] : ['', x]; }) });
    });
  });
})();
