/* Tisch reservieren: erst ein Fenster im Stil des Hauses, dann der Tischplan des Hauses (aleno) (Robert 11.10.2026:
   «ich will noch auswählen, in welchem Restaurant, ob es einen besonderen Anlass gibt, vielleicht ein Zimmer dazu»).
   Gebucht wird weiter nur in aleno. Anlass und Restaurant gehen nicht automatisch mit (aleno nimmt sie nicht als Angabe in der Adresse), das sagt das Fenster auch so.
   Tea Time öffnet direkt die Tea-Time-Reservierung (shifts=Tea Time), wie bisher auf der Barseite. */
(function () {
  var doc = document, ALENO = 'mytools.aleno.me';
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var basis = (function () { var a = $('a[href*="' + ALENO + '"]:not([href*="shifts="])'); return a ? a.href : ''; })();
  if (!basis || !window.HTMLDialogElement) return;
  /* Sechs Sprachen wie funktionen.js (Robert 12.10.2026: die Website fertig übersetzen); Bilder liegen eine Ebene höher, wenn die Seite in /en/, /fr/ … steht */
  var SP = (doc.documentElement.lang || 'de').slice(0, 2).toLowerCase(); if (['de', 'en', 'fr', 'zh', 'ko', 'ar'].indexOf(SP) < 0) SP = 'en';
  var WURZEL = SP === 'de' ? '' : '../';
  var T = {
    de: { orte: ['Restaurant «L’Ambiance»', 'Terrasse «La Belle Rivière»', 'Restaurant «La Petite Suisse»', 'Tea Time in der Bar'], zeit: ['Mai bis Oktober · Frühstück, Mittag und Abend', 'Mai bis September · Mittag und Abend an der Aare', 'November bis April · Käsefondue am Kamin', 'Täglich 15.00 bis 17.00 Uhr'],
      anlass: ['Einfach so', 'Geburtstag', 'Jahrestag', 'Geschäftsessen', 'Etwas anderes'], aria: 'Tisch reservieren', zu: 'Schliessen', titel: 'Wo dürfen wir <em>für Sie decken?</em>', rest: 'Restaurant', frage: 'Gibt es einen Anlass?', anlassA: 'Anlass',
      zimmer: 'Ein Zimmer dazu?', zimmerS: 'Nach dem Tisch zeigen wir Ihnen die freien Zimmer für den Abend.', los: 'Tag und Uhrzeit wählen',
      hinweis: function (a, t) { return 'Im nächsten Schritt wählen Sie Tag, Uhrzeit und Personen im Tischplan des Hauses. ' + (a ? 'Den Anlass (' + a + ') und Ihr Restaurant nennen Sie bei der Reservierung' : 'Ihr Restaurant nennen Sie bei der Reservierung') + (t ? ' oder telefonisch unter ' + t + '.' : '.'); } },
    en: { orte: ['Restaurant «L’Ambiance»', 'Terrace «La Belle Rivière»', 'Restaurant «La Petite Suisse»', 'Tea Time in the bar'], zeit: ['May to October · Breakfast, lunch and dinner', 'May to September · Lunch and dinner by the Aare', 'November to April · Cheese fondue by the fireplace', 'Daily 15.00 to 17.00'],
      anlass: ['Just because', 'Birthday', 'Anniversary', 'Business dinner', 'Something else'], aria: 'Reserve a table', zu: 'Close', titel: 'Where may we <em>set your table?</em>', rest: 'Restaurant', frage: 'Is there an occasion?', anlassA: 'Occasion',
      zimmer: 'A room as well?', zimmerS: 'After the table we will show you the rooms that are free that night.', los: 'Choose day and time',
      hinweis: function (a, t) { return 'In the next step you choose the day, time and number of guests in the hotel’s table plan. ' + (a ? 'Please mention the occasion (' + a + ') and your restaurant when you reserve' : 'Please mention your restaurant when you reserve') + (t ? ', or call ' + t + '.' : '.'); } },
    fr: { orte: ['Restaurant «L’Ambiance»', 'Terrasse «La Belle Rivière»', 'Restaurant «La Petite Suisse»', 'Tea Time au bar'], zeit: ['De mai à octobre · Petit-déjeuner, midi et soir', 'De mai à septembre · Midi et soir au bord de l’Aar', 'De novembre à avril · Fondue au fromage au coin du feu', 'Tous les jours de 15.00 à 17.00'],
      anlass: ['Juste comme ça', 'Anniversaire', 'Anniversaire de mariage', 'Repas d’affaires', 'Autre chose'], aria: 'Réserver une table', zu: 'Fermer', titel: 'Où pouvons-nous <em>dresser votre table ?</em>', rest: 'Restaurant', frage: 'Y a-t-il une occasion ?', anlassA: 'Occasion',
      zimmer: 'Une chambre en plus ?', zimmerS: 'Après la table, nous vous montrons les chambres libres pour la nuit.', los: 'Choisir le jour et l’heure',
      hinweis: function (a, t) { return 'À l’étape suivante, vous choisissez le jour, l’heure et le nombre de personnes dans le plan de tables de l’hôtel. ' + (a ? 'Indiquez l’occasion (' + a + ') et votre restaurant lors de la réservation' : 'Indiquez votre restaurant lors de la réservation') + (t ? ' ou par téléphone au ' + t + '.' : '.'); } },
    zh: { orte: ['餐厅 «L’Ambiance»', '露台 «La Belle Rivière»', '餐厅 «La Petite Suisse»', '酒吧 Tea Time'], zeit: ['5 月至 10 月 · 早餐、午餐和晚餐', '5 月至 9 月 · 阿勒河畔的午餐和晚餐', '11 月至 4 月 · 壁炉旁的芝士火锅', '每日 15.00 至 17.00'],
      anlass: ['没有特别原因', '生日', '纪念日', '商务餐', '其他'], aria: '预订餐桌', zu: '关闭', titel: '我们该在哪里<em>为您备桌？</em>', rest: '餐厅', frage: '有特别的场合吗？', anlassA: '场合',
      zimmer: '需要客房吗？', zimmerS: '订好餐桌后，我们会为您显示当晚的空房。', los: '选择日期和时间',
      hinweis: function (a, t) { return '下一步，您将在酒店的订座系统中选择日期、时间和人数。' + (a ? '预订时请注明场合（' + a + '）和您选择的餐厅' : '预订时请注明您选择的餐厅') + (t ? '，或致电 ' + t + '。' : '。'); } },
    ko: { orte: ['레스토랑 «L’Ambiance»', '테라스 «La Belle Rivière»', '레스토랑 «La Petite Suisse»', '바에서 즐기는 Tea Time'], zeit: ['5월~10월 · 조식, 점심, 저녁', '5월~9월 · 아레 강변의 점심과 저녁', '11월~4월 · 벽난로 옆 치즈 퐁뒤', '매일 15.00~17.00'],
      anlass: ['특별한 날 아님', '생일', '기념일', '비즈니스 식사', '기타'], aria: '테이블 예약', zu: '닫기', titel: '어디에 <em>테이블을 준비할까요?</em>', rest: '레스토랑', frage: '특별한 날인가요?', anlassA: '기념일',
      zimmer: '객실도 필요하신가요?', zimmerS: '테이블 예약 후 그날 밤 예약 가능한 객실을 보여 드립니다.', los: '날짜와 시간 선택',
      hinweis: function (a, t) { return '다음 단계에서 호텔 테이블 예약 화면에서 날짜, 시간, 인원을 선택하세요. ' + (a ? '예약하실 때 기념일(' + a + ')과 레스토랑을 함께 알려 주세요' : '예약하실 때 레스토랑을 알려 주세요') + (t ? '. 전화로도 가능합니다: ' + t + '.' : '.'); } },
    ar: { orte: ['مطعم «L’Ambiance»', 'شرفة «La Belle Rivière»', 'مطعم «La Petite Suisse»', 'Tea Time في البار'], zeit: ['من مايو إلى أكتوبر · الفطور والغداء والعشاء', 'من مايو إلى سبتمبر · الغداء والعشاء على ضفاف نهر الآر', 'من نوفمبر إلى أبريل · فوندو الجبن بجانب المدفأة', 'يومياً من 15.00 إلى 17.00'],
      anlass: ['بلا مناسبة', 'عيد ميلاد', 'ذكرى سنوية', 'عشاء عمل', 'شيء آخر'], aria: 'حجز طاولة', zu: 'إغلاق', titel: 'أين نُعِدّ <em>طاولتكم؟</em>', rest: 'المطعم', frage: 'هل هناك مناسبة؟', anlassA: 'المناسبة',
      zimmer: 'هل تحتاجون غرفة أيضاً؟', zimmerS: 'بعد حجز الطاولة نعرض لكم الغرف المتاحة لتلك الليلة.', los: 'اختاروا اليوم والوقت',
      hinweis: function (a, t) { return 'في الخطوة التالية تختارون اليوم والوقت وعدد الأشخاص في نظام حجز الطاولات في الفندق. ' + (a ? 'اذكروا المناسبة (' + a + ') والمطعم عند الحجز' : 'اذكروا المطعم عند الحجز') + (t ? ' أو اتصلوا على \u2066' + t + '\u2069.' : '.'); } }
  }[SP];
  var ORTE = [
    { id: 'ambiance', bild: 'rest-ambiance-2', seite: 'restaurant-lambiance.html' },
    { id: 'terrasse', bild: 'terrasse-schirme', seite: 'terrasse-la-belle-riviere.html' },
    { id: 'suisse', bild: 'rest-suisse-2', seite: 'restaurant-la-petite-suisse.html' },
    { id: 'teatime', bild: 'bar-teatime', seite: 'bar-le-vieux-rivage.html', link: basis + '&skipFirstSteps=true&shifts=Tea+Time' }
  ];
  ORTE.forEach(function (o, i) { o.name = T.orte[i]; o.zeit = T.zeit[i]; });
  var ANLASS = T.anlass;
  var kreuz = $('.buchen .zu') ? $('.buchen .zu').innerHTML : '×';
  var zeichen = (function () { var z = $('.buchen__t svg, svg.emblem'); return z ? z.outerHTML : ''; })();
  var pfeil = (function () { var p = $('.eckknopf svg'); return p ? p.outerHTML : ''; })();
  var hier = (location.pathname.split('/').pop() || 'index.html');
  var start = ORTE.filter(function (o) { return o.seite === hier; })[0] || ORTE[0];

  var d = doc.createElement('dialog'); d.className = 'buchen tisch'; d.setAttribute('aria-label', T.aria);
  d.innerHTML = '<button class="zu" type="button" aria-label="' + T.zu + '">' + kreuz + '</button>' +
    '<div class="buchen__in"><div class="buchen__b">' + ORTE.map(function (o) { return '<img src="' + WURZEL + 'assets/img/' + o.bild + '-m.webp" alt="" loading="lazy" decoding="async" data-ort="' + o.id + '">'; }).join('') + '</div>' +
    '<div class="buchen__t">' + zeichen + '<h2 class="d3">' + T.titel + '</h2>' +
    '<p class="tisch__k mono">' + T.rest + '</p><div class="tisch__orte" role="radiogroup" aria-label="' + T.rest + '">' +
    ORTE.map(function (o) { return '<button type="button" role="radio" aria-checked="false" data-ort="' + o.id + '"><b>' + o.name + '</b><small>' + o.zeit + '</small></button>'; }).join('') + '</div>' +
    '<p class="tisch__k mono">' + T.frage + '</p><div class="tisch__anlass" role="radiogroup" aria-label="' + T.anlassA + '">' +
    ANLASS.map(function (a, i) { return '<button type="button" role="radio" aria-checked="' + (i ? 'false' : 'true') + '">' + a + '</button>'; }).join('') + '</div>' +
    '<label class="tisch__zimmer"><input type="checkbox"><span><b>' + T.zimmer + '</b><small>' + T.zimmerS + '</small></span></label>' +
    '<a class="kn tisch__los" href="' + basis + '" target="_blank" rel="noopener">' + T.los + '<i>' + pfeil + '</i></a>' +
    '<p class="buchen__vorteil tisch__hinweis"></p></div></div>';
  doc.body.appendChild(d);

  var ort = start, anlass = ANLASS[0];
  var los = $('.tisch__los', d), hinweis = $('.tisch__hinweis', d), zimmer = $('.tisch__zimmer input', d);
  function zeige() {
    d.querySelectorAll('.tisch__orte button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.ort === ort.id)); });
    d.querySelectorAll('.buchen__b img').forEach(function (i) { i.classList.toggle('an', i.dataset.ort === ort.id); });
    los.href = ort.link || basis;
    var tel = $('a[href^="tel:"]'), t = tel ? tel.textContent.trim() : '';
    hinweis.textContent = T.hinweis(anlass !== ANLASS[0] ? anlass : '', t);
  }
  d.querySelector('.tisch__orte').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ort = ORTE.filter(function (o) { return o.id === b.dataset.ort; })[0]; zeige(); });
  d.querySelector('.tisch__anlass').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; anlass = b.textContent;
    d.querySelectorAll('.tisch__anlass button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); zeige();
  });
  $('.zu', d).addEventListener('click', function () { d.close(); });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  los.addEventListener('click', function () {
    var mitZimmer = zimmer.checked;
    setTimeout(function () { d.close(); if (mitZimmer) { var b = $('[data-buchen]'); if (b) b.click(); } }, 60);
  });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="' + ALENO + '"]');
    if (!a || d.contains(a) || /shifts=/.test(a.href) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); ort = start; zeige(); d.showModal();
  }, true);
  zeige();
})();
