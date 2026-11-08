/* Aus dem Chat des Carlton-Europe übernommen von «_Rezeption im Chat/zwei.py». Nicht hier ändern, sondern in der Vorlage. */
/* Rezeption im Chat — Fenster unten rechts (und als Zimmermappe ganzseitig auf mappe.html).
   Fragt die Funktion /api/gast (Claude mit dem Wissen der Website, siehe _gast/gast.py); fällt sie aus, sucht das Fenster
   die passende Stelle aus «Gut zu wissen» (Hotelinformation A-Z). Die Buchungsmaske kommt, wenn die Funktion sie anfordert,
   und übergibt mit Daten und Gästen an «Zimmer buchen» (SimpleBooking), die Zahlung bleibt dort.
   Wissen und Zimmerkategorien schreibt gast.py hinein, nie von Hand ändern. Bewegung nur über transform und opacity. */
(function () {
  var WISSEN = /*WISSEN*/[]/*ENDE*/;
  var ZIMMER = /*ZIMMER*/[]/*ENDEZ*/;
  /* Das Haus: Name, Kontakt, Gesicht der Rezeption, Buchung, Startkarten. Schreibt gast.py hinein (für jedes Haus der Familie eigen). */
  var HAUS = /*HAUS*/{"zeichen": "<span class=\"gast__emblem\" aria-hidden=\"true\"></span>", "datenschutz": "rechtliches.html#ki-assistent", "name": "Grand Beau-Rivage Interlaken", "tel": "+41 33 826 70 07", "mail": "info@grandbeaurivage.ch", "person": {"de": "Ihre Gastgeberin", "en": "Your host", "fr": "Votre hôtesse", "zh": "您的东道主", "ko": "여러분의 호스트", "ar": "مضيفتكم"}, "foto": "assets/img/gast-person.webp", "rolle": null, "buchung": "https://www.simplebooking.it/ibe2/hotel/9477", "art": "simplebooking", "einbetten": true, "bilder": ["assets/img/spa-pool-s.webp", "assets/img/rest-ambiance-s.webp", "assets/img/haus-vorfahrt-s.webp", "assets/img/reg-jungfraujoch-s.webp"], "karten": {"de": [["Das Spa", "Pool, Sauna, Massage", "Was bietet das Spa und wann ist es offen?"], ["Restaurants", "Drei Küchen im Haus", "Welche Restaurants gibt es im Haus?"], ["Anreise", "Vom Bahnhof zum Haus", "Wie komme ich vom Bahnhof zum Hotel?"], ["Ausflüge", "Jungfrau und Seen", "Was kann ich heute in Interlaken unternehmen?"]]}, "vorM": null, "hund": null}/*ENDEH*/;
  var TEL = HAUS.tel;
  var MAPPE = !!document.querySelector('[data-mappe]');
  /* Sprache: die der Seite (de/en/fr). In der Zimmermappe die des Handys, weil der Gast dort direkt vom QR-Code kommt. */
  var SP = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  var SPRACHEN_CHAT = ['de', 'en', 'fr', 'zh', 'ko', 'ar'];   // seit 11.10.2026 auch Chinesisch, Koreanisch, Arabisch (Grand Beau-Rivage)
  if (MAPPE) { var hl = (navigator.language || 'de').slice(0, 2).toLowerCase(); SP = SPRACHEN_CHAT.indexOf(hl) >= 0 ? hl : 'en'; }
  if (SPRACHEN_CHAT.indexOf(SP) < 0) SP = 'en';
  // Wurzel der Website aus der Adresse dieses Skripts: stimmt auf Seiten in Unterordnern (en/, fr/, rezeption/) ebenso
  var BASIS = ((document.querySelector('script[src*="assets/js/gast.js"]') || {}).src || '').replace(/assets\/js\/gast\.js.*$/, '');
  var T = {
    de: { fragen: 'Fragen an die Rezeption', rolle: 'Rezeption · antwortet sofort', neu: 'Neues Gespräch', zu: 'Schliessen', frage: 'Ihre Frage', feld: 'Fragen Sie die Rezeption', feldM: 'Was brauchen Sie?',
      buchen: 'Zimmer buchen', senden: 'Senden', fuss: 'KI-Assistent der Rezeption. Verbindlich sind Buchung und Rezeption.', datenschutz: 'Datenschutz', start1: 'Wie dürfen wir<br>Ihnen helfen?', start2: 'Fragen Sie alles rund um Ihren Aufenthalt.',
      karten: [['Frühstück', 'Zeiten und Box', 'Bis wann gibt es Frühstück?'], ['Mit Hund', 'Was im Haus gilt', 'Kann ich mit meinem Hund kommen?'], ['Parkplatz', 'Aussen oder Garage', 'Was kostet ein Parkplatz?'], ['Spät ankommen', 'Eingang nach 23 Uhr', 'Wie komme ich nach 23 Uhr ins Haus?']],
      vorM: ['Sauna heizen lassen', 'Zimmerservice bestellen', 'Bis wann gibt es Frühstück?', 'Was unternehme ich heute bei diesem Wetter?', 'Wäsche abgeben', 'Taxi bestellen'],
      grussM: 'Grüezi und herzlich willkommen im ' + HAUS.name + '. Ich bin für Sie da, solange Sie bei uns sind: Sauna, Zimmerservice, Frühstück, Wäsche, Taxi, Ausflüge. Fragen Sie einfach.',
      hallo: 'Grüezi. Womit kann ich Ihnen helfen?', gerne: 'Gerne. Wählen Sie Daten und Zimmer, die Buchung übernimmt den Rest.',
      mKopf: 'Ihre Buchung', mText: 'Daten und Zimmer wählen, die Buchung übernimmt den Rest.', an: 'Anreise', ab: 'Abreise', gaeste: 'Gäste', person: ' Person', personen: ' Personen', hund: 'Mit Hund', kat: 'Zimmerkategorie',
      nacht: ' Nacht', naechte: ' Nächte', bis: ' bis ', mitHund: ' · mit Hund', los: 'Zur Buchung', mFuss: 'Verfügbarkeit und Tagespreis zeigt die Buchungsseite des Hauses, dort zahlen Sie auch.',
      mHund: (HAUS.hund || {}).de || '',
      offen: 'Die Buchungsseite ist in einem neuen Fenster offen.', offenHund: ' Bitte geben Sie dort im Feld für Bemerkungen an, dass Ihr Hund mitkommt, dann bereiten wir alles vor.', offenEnde: ' Wenn ich sonst noch helfen kann, bin ich hier.',
      keine: 'Dazu habe ich gerade keine gesicherte Auskunft. Die Rezeption hilft Ihnen gerne weiter: ' + TEL + ' oder ' + HAUS.mail + '.', quelle: 'Aus der Hotelinformation A–Z · ', ort: 'de-CH', lang: 'DE', bTitel: 'Buchung', bZurueck: 'Zurück zum Gespräch', bFenster: 'In neuem Fenster öffnen', bHinweis: 'Sichere Buchung über das Buchungssystem des Hauses (SimpleBooking).' },
    en: { fragen: 'Ask reception', rolle: 'Reception · replies instantly', neu: 'New conversation', zu: 'Close', frage: 'Your question', feld: 'Ask reception', feldM: 'What do you need?',
      buchen: 'Book a room', senden: 'Send', fuss: 'AI assistant of the reception. Booking and reception are binding.', datenschutz: 'Privacy', start1: 'How may we<br>help you?', start2: 'Ask anything about your stay.',
      karten: [['Breakfast', 'Times and box', 'Until when is breakfast served?'], ['With a dog', 'House rules', 'Can I bring my dog?'], ['Parking', 'Outdoor or garage', 'How much is parking?'], ['Late arrival', 'Entrance after 11 pm', 'How do I get in after 11 pm?']],
      vorM: ['Have the sauna heated', 'Order room service', 'Until when is breakfast served?', 'What can I do today in this weather?', 'Hand in laundry', 'Order a taxi'],
      grussM: 'Welcome to the ' + HAUS.name + '. I am here for you throughout your stay: sauna, room service, breakfast, laundry, taxi, excursions. Just ask.',
      hallo: 'Hello. How can I help you?', gerne: 'Of course. Choose your dates and room, the booking page does the rest.',
      mKopf: 'Your booking', mText: 'Choose dates and room, the booking page does the rest.', an: 'Arrival', ab: 'Departure', gaeste: 'Guests', person: ' guest', personen: ' guests', hund: 'With dog', kat: 'Room category',
      nacht: ' night', naechte: ' nights', bis: ' to ', mitHund: ' · with dog', los: 'Continue to booking', mFuss: 'Availability and the rate of the day are shown on the hotel’s booking page, where you also pay.',
      mHund: (HAUS.hund || {}).en || '',
      offen: 'The booking page has opened in a new window.', offenHund: ' Please mention in the remarks that your dog is coming, so we can prepare everything.', offenEnde: ' If I can help with anything else, I am here.',
      keine: 'I have no confirmed information on that right now. Reception will gladly help: ' + TEL + ' or ' + HAUS.mail + '.', quelle: 'From the hotel information A–Z · ', ort: 'en-GB', lang: 'EN', bTitel: 'Booking', bZurueck: 'Back to the conversation', bFenster: 'Open in a new window', bHinweis: 'Secure booking through the hotel’s booking system (SimpleBooking).' },
    fr: { fragen: 'Questions à la réception', rolle: 'Réception · répond tout de suite', neu: 'Nouvelle conversation', zu: 'Fermer', frage: 'Votre question', feld: 'Posez votre question', feldM: 'De quoi avez-vous besoin ?',
      buchen: 'Réserver une chambre', senden: 'Envoyer', fuss: 'Assistant IA de la réception. Seules la réservation et la réception font foi.', datenschutz: 'Confidentialité', start1: 'Comment pouvons-nous<br>vous aider ?', start2: 'Posez toutes vos questions sur votre séjour.',
      karten: [['Petit-déjeuner', 'Horaires et box', 'Jusqu’à quelle heure le petit-déjeuner est-il servi ?'], ['Avec un chien', 'Règles de la maison', 'Puis-je venir avec mon chien ?'], ['Parking', 'Extérieur ou garage', 'Combien coûte une place de parc ?'], ['Arrivée tardive', 'Entrée après 23 h', 'Comment entrer après 23 h ?']],
      vorM: ['Faire chauffer le sauna', 'Commander le service en chambre', 'Jusqu’à quelle heure le petit-déjeuner est-il servi ?', 'Que faire aujourd’hui avec ce temps ?', 'Donner du linge à laver', 'Commander un taxi'],
      grussM: 'Bienvenue au ' + HAUS.name + '. Je suis là pour vous pendant tout votre séjour : sauna, service en chambre, petit-déjeuner, linge, taxi, excursions. Demandez simplement.',
      hallo: 'Bonjour. Comment puis-je vous aider ?', gerne: 'Volontiers. Choisissez vos dates et votre chambre, la réservation fait le reste.',
      mKopf: 'Votre réservation', mText: 'Choisissez dates et chambre, la réservation fait le reste.', an: 'Arrivée', ab: 'Départ', gaeste: 'Personnes', person: ' personne', personen: ' personnes', hund: 'Avec chien', kat: 'Catégorie de chambre',
      nacht: ' nuit', naechte: ' nuits', bis: ' au ', mitHund: ' · avec chien', los: 'Vers la réservation', mFuss: 'Disponibilités et tarif du jour figurent sur la page de réservation de l’hôtel, où vous payez aussi.',
      mHund: (HAUS.hund || {}).fr || '',
      offen: 'La page de réservation s’est ouverte dans une nouvelle fenêtre.', offenHund: ' Merci d’indiquer dans les remarques que votre chien vous accompagne, nous préparerons tout.', offenEnde: ' Si je peux encore vous aider, je suis là.',
      keine: 'Je n’ai pas d’information confirmée à ce sujet. La réception vous aide volontiers : ' + TEL + ' ou ' + HAUS.mail + '.', quelle: 'Selon l’information hôtelière A–Z · ', ort: 'fr-CH', lang: 'FR', bTitel: 'Réservation', bZurueck: 'Retour à la conversation', bFenster: 'Ouvrir dans une nouvelle fenêtre', bHinweis: 'Réservation sécurisée via le système de réservation de l’hôtel (SimpleBooking).' },
    zh: { fragen: '咨询前台', rolle: '前台 · 即时回复', neu: '新对话', zu: '关闭', frage: '您的问题', feld: '向前台提问', feldM: '您需要什么？',
      buchen: '预订客房', senden: '发送', fuss: '前台 AI 助手。以预订系统和前台的信息为准。', datenschutz: '隐私', start1: '我们能为您<br>做些什么？', start2: '关于您的住宿，随时提问。',
      karten: [['早餐', '时间与早餐盒', '早餐供应到几点？'], ['携带宠物', '酒店规定', '我可以带狗入住吗？'], ['停车', '室外或车库', '停车费多少？'], ['深夜到达', '23 点后入口', '23 点后如何进入酒店？']],
      vorM: ['预热桑拿', '点客房送餐', '早餐供应到几点？', '今天这种天气可以做什么？', '送洗衣物', '叫出租车'],
      grussM: '欢迎光临' + HAUS.name + '。在您入住期间，我随时为您服务：桑拿、客房送餐、早餐、洗衣、出租车、游览。请随时提问。',
      hallo: '您好，有什么可以帮您？', gerne: '当然。请选择日期和客房，预订页面会完成其余步骤。',
      mKopf: '您的预订', mText: '选择日期和客房，预订页面会完成其余步骤。', an: '入住', ab: '退房', gaeste: '人数', person: ' 位', personen: ' 位', hund: '携带狗', kat: '房型',
      nacht: ' 晚', naechte: ' 晚', bis: ' 至 ', mitHund: ' · 携带狗', los: '前往预订', mFuss: '空房与当日价格显示在酒店的预订页面，付款也在那里完成。',
      mHund: (HAUS.hund || {}).zh || '',
      offen: '预订页面已在新窗口打开。', offenHund: ' 请在备注中注明您携带狗，我们会提前准备。', offenEnde: ' 如还有其他需要，我在这里。',
      keine: '关于这一点我目前没有确认的信息。前台很乐意为您提供帮助：' + TEL + ' 或 ' + HAUS.mail + '。', quelle: '来自酒店信息 A–Z · ', ort: 'zh-CN', lang: 'EN', bTitel: '预订', bZurueck: '返回对话', bFenster: '在新窗口打开', bHinweis: '通过酒店预订系统（SimpleBooking）安全预订。' },
    ko: { fragen: '리셉션에 문의', rolle: '리셉션 · 즉시 답변', neu: '새 대화', zu: '닫기', frage: '질문', feld: '리셉션에 물어보세요', feldM: '무엇이 필요하세요?',
      buchen: '객실 예약', senden: '보내기', fuss: '리셉션 AI 어시스턴트. 예약 시스템과 리셉션의 안내가 기준입니다.', datenschutz: '개인정보', start1: '무엇을<br>도와드릴까요?', start2: '숙박에 관한 모든 것을 물어보세요.',
      karten: [['조식', '시간과 조식 박스', '조식은 몇 시까지인가요?'], ['반려견 동반', '호텔 규정', '반려견과 함께 묵을 수 있나요?'], ['주차', '야외 또는 차고', '주차 요금은 얼마인가요?'], ['늦은 도착', '23시 이후 입구', '23시 이후에는 어떻게 들어가나요?']],
      vorM: ['사우나 예열 요청', '룸서비스 주문', '조식은 몇 시까지인가요?', '오늘 이런 날씨에 무엇을 할 수 있나요?', '세탁물 맡기기', '택시 부르기'],
      grussM: HAUS.name + '에 오신 것을 환영합니다. 머무시는 동안 사우나, 룸서비스, 조식, 세탁, 택시, 관광까지 언제든 도와드립니다. 편하게 물어보세요.',
      hallo: '안녕하세요. 무엇을 도와드릴까요?', gerne: '물론입니다. 날짜와 객실을 선택하시면 예약 페이지가 나머지를 처리합니다.',
      mKopf: '예약', mText: '날짜와 객실을 선택하세요. 나머지는 예약 페이지가 처리합니다.', an: '체크인', ab: '체크아웃', gaeste: '인원', person: '명', personen: '명', hund: '반려견 동반', kat: '객실 유형',
      nacht: '박', naechte: '박', bis: ' ~ ', mitHund: ' · 반려견 동반', los: '예약으로 이동', mFuss: '예약 가능 여부와 당일 요금은 호텔 예약 페이지에 표시되며 결제도 그곳에서 진행됩니다.',
      mHund: (HAUS.hund || {}).ko || '',
      offen: '예약 페이지가 새 창에서 열렸습니다.', offenHund: ' 비고란에 반려견 동반을 적어 주시면 미리 준비해 두겠습니다.', offenEnde: ' 더 도울 일이 있으면 말씀해 주세요.',
      keine: '그 부분은 지금 확인된 정보가 없습니다. 리셉션이 기꺼이 도와드립니다: ' + TEL + ' 또는 ' + HAUS.mail + '.', quelle: '호텔 안내 A–Z 기준 · ', ort: 'ko-KR', lang: 'EN', bTitel: '예약', bZurueck: '대화로 돌아가기', bFenster: '새 창에서 열기', bHinweis: '호텔 예약 시스템(SimpleBooking)을 통한 안전한 예약.' },
    ar: { fragen: 'اسألوا الاستقبال', rolle: 'الاستقبال · يجيب فوراً', neu: 'محادثة جديدة', zu: 'إغلاق', frage: 'سؤالكم', feld: 'اسألوا الاستقبال', feldM: 'ماذا تحتاجون؟',
      buchen: 'حجز غرفة', senden: 'إرسال', fuss: 'مساعد الاستقبال بالذكاء الاصطناعي. الحجز والاستقبال هما المرجع الملزم.', datenschutz: 'الخصوصية', start1: 'كيف يمكننا<br>مساعدتكم؟', start2: 'اسألوا عن أي شيء يتعلق بإقامتكم.',
      karten: [['الفطور', 'الأوقات وصندوق الفطور', 'حتى أي ساعة يُقدَّم الفطور؟'], ['مع كلب', 'قواعد الفندق', 'هل يمكنني القدوم مع كلبي؟'], ['موقف السيارات', 'في الخارج أو المرآب', 'كم تكلفة موقف السيارة؟'], ['الوصول المتأخر', 'المدخل بعد الساعة 23', 'كيف أدخل الفندق بعد الساعة 23؟']],
      vorM: ['تسخين الساونا', 'طلب خدمة الغرف', 'حتى أي ساعة يُقدَّم الفطور؟', 'ماذا أفعل اليوم في هذا الطقس؟', 'تسليم الغسيل', 'طلب سيارة أجرة'],
      grussM: 'أهلاً وسهلاً بكم في ' + HAUS.name + '. أنا في خدمتكم طوال إقامتكم: الساونا، خدمة الغرف، الفطور، الغسيل، سيارة الأجرة، الرحلات. اسألوا فقط.',
      hallo: 'مرحباً. كيف يمكنني مساعدتكم؟', gerne: 'بكل سرور. اختاروا التواريخ والغرفة، وصفحة الحجز تتولى الباقي.',
      mKopf: 'حجزكم', mText: 'اختاروا التواريخ والغرفة، وصفحة الحجز تتولى الباقي.', an: 'الوصول', ab: 'المغادرة', gaeste: 'الضيوف', person: ' شخص', personen: ' أشخاص', hund: 'مع كلب', kat: 'فئة الغرفة',
      nacht: ' ليلة', naechte: ' ليالٍ', bis: ' إلى ', mitHund: ' · مع كلب', los: 'إلى الحجز', mFuss: 'التوفر وسعر اليوم تعرضهما صفحة حجز الفندق، وهناك يتم الدفع أيضاً.',
      mHund: (HAUS.hund || {}).ar || '',
      offen: 'فُتحت صفحة الحجز في نافذة جديدة.', offenHund: ' يرجى ذكر قدوم كلبكم في خانة الملاحظات لنجهّز كل شيء.', offenEnde: ' إن احتجتم إلى أي شيء آخر، فأنا هنا.',
      keine: 'لا تتوفر لديّ معلومة مؤكدة حول ذلك الآن. يسعد الاستقبال بمساعدتكم: ' + TEL + ' أو ' + HAUS.mail + '.', quelle: 'من معلومات الفندق من أ إلى ي · ', ort: 'ar-u-nu-latn', lang: 'EN', bTitel: 'الحجز', bZurueck: 'العودة إلى المحادثة', bFenster: 'فتح في نافذة جديدة', bHinweis: 'حجز آمن عبر نظام حجز الفندق (SimpleBooking).' }
  }[SP];
  if (HAUS.karten && HAUS.karten[SP]) T.karten = HAUS.karten[SP];
  var PERSON = HAUS.person && typeof HAUS.person === 'object' ? (HAUS.person[SP] || HAUS.person.de || '') : (HAUS.person || '');   /* «Ihre Gastgeberin» in der Sprache der Seite (12.10.2026; vorher in allen Sprachen deutsch) */
  if (HAUS.vorM && HAUS.vorM[SP]) T.vorM = HAUS.vorM[SP];
  var VORSCHLAG = MAPPE ? T.vorM : [T.karten[0][2], T.karten[1][2], T.buchen];
  var V = ((document.querySelector('script[src*="gast.js"]') || { src: '' }).src.split('v=')[1] || '');
  var BUCHUNG = document.documentElement.getAttribute('data-buchung') || HAUS.buchung;
  var ZI = (ZIMMER && ZIMMER[SP]) || (ZIMMER && ZIMMER.de) || ZIMMER;

  /* ---- Antwortbuch des Hauses (Tasty Studios 19.10.2026): feste Antworten aus den Angaben der Website, wenn die Funktion nicht antwortet
     (5xx, Zeitüberschreitung). Quelle assets/js/gast-buch.json, dieselbe Datei und dieselbe Zuordnung wie im Server (_gast/gast.py). ---- */
  var BUCH = null, BUCH_LADEN = null, BUCH_SP = ['de', 'en', 'fr'].indexOf(SP) > -1 ? SP : 'en';
  function buchHolen() {
    if (!BUCH_LADEN) BUCH_LADEN = fetch(BASIS + 'assets/js/gast-buch.json?v=' + V).then(function (r) { return r.ok ? r.json() : null; }).then(function (b) { BUCH = b && b.themen ? b : null; return BUCH; }).catch(function () { return null; });
    return BUCH_LADEN;
  }
  function bNorm(s) {
    s = String(s || '').toLowerCase().replace(/ß/g, 'ss');
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return s.replace(/[^a-z0-9]+/g, ' ').replace(/^ +| +$/g, '');
  }
  var B_WORTE = {
    en: 'the is are do does can we you there what how when where our my have bring serve i it your with for until open please much any get from to',
    fr: 'le la les est vous nous avez quel quelle quels pour peut comment ou je une des un du il et votre dans quand heure puis combien avec sont ce qu y au aux faire proposez',
    de: 'der die das ist gibt es ich wir haben habt kann wie wo wann und mit ein eine einen ihr sie im am bis fur zum zur was kostet noch bitte hat sind um nach von auch mein meinem unser uhr man offen welche viel' };
  function bSprache(f) {
    var w = bNorm(f).split(' '), beste = 0, sp = BUCH_SP, doppelt = false;
    Object.keys(B_WORTE).forEach(function (s) {
      var liste = ' ' + B_WORTE[s] + ' ', n = 0;
      w.forEach(function (x) { if (x && liste.indexOf(' ' + x + ' ') > -1) n++; });
      if (n > beste) { beste = n; sp = s; doppelt = false; } else if (n === beste && n > 0) doppelt = true;
    });
    return beste === 0 || doppelt ? BUCH_SP : sp;
  }
  function buchAntwort(f) {
    if (!BUCH) return null;
    var sp = bSprache(f), n = ' ' + bNorm(f) + ' ', best = null, punkte = 0;
    BUCH.themen.forEach(function (t) {
      var p = 0;
      (t.s || []).forEach(function (k) {
        var c = bNorm(k); if (!c) return;
        if (n.indexOf((k.charAt(0) === ' ' ? ' ' : '') + c + (k.charAt(k.length - 1) === ' ' ? ' ' : '')) > -1) p += c.length;
      });
      Object.keys(t.frage || {}).forEach(function (s) { if (bNorm(t.frage[s]) === n.trim()) p += 100; });
      if (p > punkte) { punkte = p; best = t; }
    });
    function knoepfe(liste) {
      return (liste || []).map(function (k) { var t = BUCH.themen.filter(function (x) { return x.k === k; })[0]; return t && t.frage ? (t.frage[sp] || t.frage.de) : ''; }).filter(Boolean);
    }
    if (!best) return { text: (BUCH.ohne || {})[sp] || (BUCH.ohne || {}).de || T.keine, maske: null, knoepfe: knoepfe(BUCH.knoepfe) };
    return { text: best.a[sp] || best.a.de, maske: best.maske ? {} : null, knoepfe: [] };
  }

  var css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = BASIS + 'assets/css/gast.css?v=' + V;
  document.head.appendChild(css);

  var CE = HAUS.zeichen || '<svg viewBox="87 0 112 68" aria-hidden="true" fill="currentColor"><use href="#ce"/></svg>';   // Zeichen des Hauses
  var KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var HOCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4"/></svg>';
  var PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
  var NEU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>';
  /* Start im leeren Fenster: vier Karten, jede stellt eine Frage */
  // Startkacheln: echte Fotos des Hauses, Titel, Zeile, Frage an die Rezeption. Bildpfade ausgeschrieben, sonst nimmt online.py sie nicht mit
  var BILDER = HAUS.bilder;
  var KARTEN = T.karten.map(function (k, i) { return [k[0], k[1], k[2], BASIS + BILDER[i]]; });

  var knopf = null;
  if (!MAPPE) {
    knopf = document.createElement('button');
    knopf.className = 'gast-knopf'; knopf.type = 'button';
    knopf.setAttribute('aria-label', T.fragen); knopf.setAttribute('aria-expanded', 'false');
    knopf.innerHTML = '<span class="gast-knopf__ce">' + CE + '</span><span class="gast-knopf__x">' + KREUZ + '</span>';
  }

  var fen = document.createElement('section');
  fen.className = 'gast' + (MAPPE ? ' gast--seite' : '');
  fen.setAttribute('role', MAPPE ? 'region' : 'dialog'); fen.setAttribute('aria-label', T.fragen);
  fen.innerHTML =
    '<header class="gast__kopf"><span class="gast__foto"><img src="' + BASIS + HAUS.foto + '" alt="" width="240" height="240" decoding="async"><i aria-hidden="true"></i></span><div><b>' + PERSON + '</b><span>' + ((HAUS.rolle && HAUS.rolle[SP]) || T.rolle) + '</span></div>' +
    '<button type="button" class="gast__neu" aria-label="' + T.neu + '" title="' + T.neu + '">' + NEU + '</button>' +
    (MAPPE ? '' : '<button type="button" class="gast__zu" aria-label="' + T.zu + '">' + KREUZ + '</button>') + '</header>' +
    '<div class="gast__lauf" aria-live="polite"></div>' +
    '<form class="gast__feld"><label><span class="sr">' + T.frage + '</span><textarea rows="1" autocomplete="off" enterkeyhint="send" placeholder="' + (MAPPE ? T.feldM : T.feld) + '"></textarea></label>' +
    '<div class="gast__leiste"><button type="button" class="gast__plus" aria-label="' + T.buchen + '" title="' + T.buchen + '">' + PLUS + '</button>' +
    '<button type="submit" class="gast__send" aria-label="' + T.senden + '">' + HOCH + '</button></div></form>' +
    '<p class="gast__fuss">' + T.fuss + ' <a href="' + BASIS + (HAUS.datenschutz || 'datenschutz.html#ki-assistent') + '">' + T.datenschutz + '</a></p>';

  (document.querySelector('[data-mappe]') || document.body).appendChild(fen);
  if (knopf) {
    var dunkel = document.createElement('div');
    dunkel.className = 'gast-dunkel'; dunkel.setAttribute('aria-hidden', 'true');
    dunkel.addEventListener('click', function () { auf(false); });
    document.body.appendChild(dunkel);
    document.body.appendChild(knopf);
  }
  /* Nichts zeigen, bevor der Stil da ist: gast.css kommt erst mit diesem Skript, das Fenster blitzte sonst beim Seitenaufbau
     ungestylt auf (Robert 10.10.2026). Rückfall nach 4 s, falls das Laden des Stils scheitert. */
  var teile = [fen, knopf, typeof dunkel !== 'undefined' ? dunkel : null].filter(Boolean);
  /* Ohne Stil hat die dunkle Fläche Deckkraft 1; kommt gast.css erst nach dem ersten Bild, würde sie sonst mit ihrem Übergang
     von 1 auf 0 ausblenden: ein dunkles Aufflackern über der ganzen Seite bei jedem Seitenwechsel (Robert 10.10.2026, online gemessen). */
  teile.forEach(function (el) { el.style.visibility = 'hidden'; el.style.transition = 'none'; });
  var dunkelEl = typeof dunkel !== 'undefined' ? dunkel : null;
  if (dunkelEl) dunkelEl.style.opacity = '0';
  var stilDa = false;
  function zeigen() {
    if (stilDa) return; stilDa = true;
    teile.forEach(function (el) { el.style.visibility = ''; void el.offsetWidth; });
    if (dunkelEl) dunkelEl.style.opacity = '';
    teile.forEach(function (el) { void el.offsetWidth; el.style.transition = ''; });
  }
  css.addEventListener('load', zeigen); css.addEventListener('error', zeigen); setTimeout(zeigen, 4000);
  if (css.sheet) zeigen();
  /* Bilder der Startkacheln und das Gesicht vorab holen und entpacken, sobald die Seite ruht (und sofort, wenn die Maus zum Knopf
     kommt): sonst luden sie erst beim Öffnen des Chats (Robert 10.10.2026). */
  var vorab = false;
  function vorladen() {
    if (vorab) return; vorab = true;
    [BASIS + HAUS.foto].concat(KARTEN.map(function (k) { return k[3] + '?v=' + V; })).forEach(function (src) {
      var i = new Image(); i.decoding = 'async'; i.src = src; if (i.decode) i.decode().catch(function () {});
    });
  }
  if (document.readyState === 'complete') setTimeout(vorladen, 800); else addEventListener('load', function () { setTimeout(vorladen, 800); });
  if (knopf) { knopf.addEventListener('pointerenter', vorladen); knopf.addEventListener('focus', vorladen); }
  var lauf = fen.querySelector('.gast__lauf'), feld = fen.querySelector('.gast__feld textarea'), form = fen.querySelector('form');
  var offen = false, begruesst = false, beschaeftigt = false, verlauf = [];

  function auf(an) {
    offen = an;
    document.documentElement.classList.toggle('gast-offen', an);
    if (knopf) knopf.setAttribute('aria-expanded', String(an));
    if (an) {
      if (!begruesst) { begruesst = true; gruss(); }
      if (window.matchMedia('(hover:hover)').matches) setTimeout(function () { feld.focus({ preventScroll: true }); }, 350);
    }
  }
  if (knopf) {
    knopf.addEventListener('click', function () { auf(!offen); });
    fen.querySelector('.gast__zu').addEventListener('click', function () { auf(false); knopf.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) auf(false); });
  } else {
    auf(true);
  }

  function runter() { lauf.scrollTop = lauf.scrollHeight; }
  function blase(wer, text) {
    var b = document.createElement('div');
    b.className = 'gast__b gast__b--' + wer;
    if (text) b.textContent = text;
    lauf.appendChild(b); runter();
    return b;
  }
  function absaetze(b, text) {
    // Antwort in Absätze und Listen: jede Zeile mit «- » wird ein Punkt, aufeinanderfolgende Punkte eine Liste.
    // «Stichwort: Angabe» am Zeilenanfang wird als Stichwort hervorgehoben. Fettdruck-Sterne und Zwischentitel-Sterne fallen weg.
    var ul = null, p = null;
    text.replace(/\*\*/g, '').split('\n').forEach(function (z) {
      z = z.trim();
      if (!z) { ul = null; p = null; return; }
      var punkt = /^[-•*]\s+/.test(z);
      var inhalt = z.replace(/^[-•*]\s+/, '');
      var el;
      if (punkt) {
        if (!ul) { ul = document.createElement('ul'); b.appendChild(ul); }
        p = null; el = document.createElement('li'); ul.appendChild(el);
      } else {
        ul = null;
        if (!p) { p = document.createElement('p'); b.appendChild(p); } else p.appendChild(document.createTextNode(' '));
        el = p;
      }
      var m = punkt && inhalt.match(/^([^:]{2,32}):\s+(.+)$/);
      if (m) { var st = document.createElement('b'); st.textContent = m[1]; el.appendChild(st); el.appendChild(document.createTextNode(' ' + m[2])); }
      else el.appendChild(document.createTextNode(inhalt));
    });
  }
  function tippe(b, text, quelle, fertig) {
    // Wort für Wort, aber gleich in der fertigen Form (Absätze, Punkte, Stichworte): vorher lief erst Fliesstext durch
    // und sprang am Ende in die Liste um (Robert 10.10.2026)
    var w = text.split(' '), i = 0;
    (function weiter() {
      i++;
      b.innerHTML = ''; absaetze(b, w.slice(0, i).join(' ')); runter();
      if (i < w.length) return setTimeout(weiter, 14 + Math.random() * 20);
      if (quelle) { var q = document.createElement('small'); q.textContent = quelle; b.appendChild(q); }
      runter(); fertig && fertig();
    })();
  }
  function denkt() {
    var b = blase('haus'); b.classList.add('gast__b--denkt'); b.innerHTML = '<i></i><i></i><i></i>'; return b;
  }
  function vorschlaege(liste) {
    var v = document.createElement('div'); v.className = 'gast__vor';
    liste.forEach(function (f) {
      var k = document.createElement('button'); k.type = 'button';
      k.innerHTML = '<span></span>' + PFEIL; k.firstChild.textContent = f;
      k.addEventListener('click', function () { v.remove(); frage(f); });
      v.appendChild(k);
    });
    lauf.appendChild(v); runter();
  }
  function start() {
    var st = document.createElement('div'); st.className = 'gast__start';
    st.innerHTML = '<span class="gast__start-ce">' + CE + '</span><h3>' + T.start1 + '</h3><p>' + T.start2 + '</p><div class="gast__karten"></div>';
    KARTEN.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span class="gast__k-bild"><img src="' + k[3] + '?v=' + V + '" alt="" decoding="async"></span><span class="gast__k-text"><b></b><span></span></span>';
      b.querySelector('b').textContent = k[0]; b.querySelector('.gast__k-text span').textContent = k[1]; b.setAttribute('aria-label', k[0] + ': ' + k[1]);
      b.addEventListener('click', function () { frage(k[2]); });
      st.lastChild.appendChild(b);
    });
    lauf.appendChild(st);
  }
  function gruss() {
    if (!MAPPE) return start();
    beschaeftigt = true;
    var b = denkt();
    setTimeout(function () {
      b.classList.remove('gast__b--denkt'); b.innerHTML = '';
      var t = T.grussM;
      tippe(b, t, '', function () { beschaeftigt = false; vorschlaege(VORSCHLAG); });
    }, 500);
  }

  /* ---- Rückfall ohne Funktion: die passende Stelle aus «Gut zu wissen» ---- */
  function norm(s) { return s.toLowerCase().replace(/[^a-zäöüéèà0-9\- ]/g, ' '); }
  function finde(f) {
    var n = ' ' + norm(f) + ' ', best = null, punkte = 0;
    WISSEN.forEach(function (w) {
      var p = 0;
      w.s.forEach(function (s) { if (n.indexOf(s) > -1) p += s.length > 4 ? 2 : 1; });
      if (n.indexOf(norm(w.t)) > -1) p += 3;
      if (p > punkte) { punkte = p; best = w; }
    });
    return best;
  }

  /* ---- Buchungsmaske im Gespräch ---- */
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function schoen(s) { var d = new Date(s + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString(T.ort, { weekday: 'short', day: 'numeric', month: 'long' }); }
  function maske(m) {
    m = m || {};
    var heute = new Date(), morgen = new Date(heute.getTime() + 864e5);
    var an = m.anreise || iso(morgen), ab = m.abreise || iso(new Date(new Date(an + 'T12:00:00').getTime() + 2 * 864e5));
    if (ab <= an) ab = iso(new Date(new Date(an + 'T12:00:00').getTime() + 864e5));
    var g = Math.min(4, Math.max(1, +m.gaeste || 2)), hund = !!m.hund, kat = m.kategorie || '';
    var k = document.createElement('div'); k.className = 'gast__maske';
    k.innerHTML =
      '<div class="gast__m-kopf"><b>' + T.mKopf + '</b><span>' + T.mText + '</span></div>' +
      '<div class="gast__m-zeile">' +
        '<label><span>' + T.an + '</span><input type="date" name="an" min="' + iso(heute) + '" value="' + an + '"></label>' +
        '<label><span>' + T.ab + '</span><input type="date" name="ab" min="' + iso(morgen) + '" value="' + ab + '"></label>' +
        '<label><span>' + T.gaeste + '</span><select name="g">' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (n === g ? ' selected' : '') + '>' + n + (n === 1 ? T.person : T.personen) + '</option>'; }).join('') + '</select></label>' +
        '<label class="gast__m-hund"><input type="checkbox" name="hund"' + (hund ? ' checked' : '') + '><span>' + T.hund + '</span></label>' +
      '</div>' +
      '<div class="gast__m-zimmer" role="group" aria-label="' + T.kat + '">' +
        ZI.map(function (z) {
          return '<button type="button" class="gast__m-z" data-k="' + z.k + '" aria-pressed="' + (z.k === kat) + '">' +
            '<img src="' + BASIS + 'assets/img/' + z.bild + '-s.webp" alt="' + z.alt.replace(/"/g, '&quot;') + '" decoding="async">' +
            '<span><b>' + z.name + '</b><i>' + z.klein + '</i><em>' + z.text + '</em>' + (z.preis ? '<u>' + z.preis + '</u>' : '') + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="gast__m-fuss"><span class="gast__m-summe"></span><button type="button" class="kn gast__m-los">' + T.los + '<i>' + PFEIL + '</i></button></div>' +
      '<small>' + T.mFuss + ' ' + (hund ? T.mHund : '') + '</small>';
    lauf.appendChild(k);
    var fan = k.querySelector('[name=an]'), fab = k.querySelector('[name=ab]'), fg = k.querySelector('[name=g]'), fh = k.querySelector('[name=hund]'), summe = k.querySelector('.gast__m-summe');
    var zs = Array.prototype.slice.call(k.querySelectorAll('.gast__m-z'));
    function gewaehlt() { var z = zs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0]; return z ? z.getAttribute('data-k') : ''; }
    function zeige() {
      var n = Math.round((new Date(fab.value) - new Date(fan.value)) / 864e5);
      var z = ZI.filter(function (x) { return x.k === gewaehlt(); })[0];
      summe.textContent = (n > 0 ? n + (n === 1 ? T.nacht : T.naechte) + ' · ' : '') + schoen(fan.value) + T.bis + schoen(fab.value) + ' · ' + fg.value + (fg.value === '1' ? T.person : T.personen) + (fh.checked ? T.mitHund : '') + (z ? ' · ' + z.name : '');
    }
    fan.addEventListener('change', function () { var t = new Date(fan.value); if (isNaN(t)) return; var n = iso(new Date(t.getTime() + 864e5)); fab.min = n; if (fab.value <= fan.value) fab.value = n; zeige(); });
    [fab, fg, fh].forEach(function (x) { x.addEventListener('change', zeige); });
    zs.forEach(function (b) { b.addEventListener('click', function () { var war = b.getAttribute('aria-pressed') === 'true'; zs.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); if (!war) b.setAttribute('aria-pressed', 'true'); zeige(); }); });
    k.querySelector('.gast__m-los').addEventListener('click', function () {
      var z = ZI.filter(function (x) { return x.k === gewaehlt(); })[0];
      var gl = []; for (var i = 0; i < +fg.value; i++) gl.push('A');
      var ziel = (z && z.ziel) || BUCHUNG;
      var adr = HAUS.art === 'booking'
        ? ziel + '?checkin=' + fan.value + '&checkout=' + fab.value + '&group_adults=' + fg.value + '&group_children=0&no_rooms=1&lang=' + T.lang.toLowerCase()
        : ziel + '?lang=' + T.lang + '&cur=CHF&in=' + fan.value + '&out=' + fab.value + '&guests=' + encodeURIComponent(gl.join(','));
      var t;
      if (HAUS.einbetten === false) {   // dieses Buchungssystem lässt sich nicht einbetten: neues Fenster
        window.open(adr, '_blank', 'noopener');
        t = T.offen + (fh.checked ? T.offenHund : '') + T.offenEnde;
      } else {
        buchung(adr);
        t = (fh.checked ? T.offenHund.trim() + ' ' : '') + T.offenEnde.trim();
      }
      verlauf.push({ role: 'assistant', content: t });
      var b = blase('haus'); absaetze(b, t); runter();
    });
    zeige();
    fen.classList.add('gast--breit');
    // Die Maske kommt oben ins Bild, nicht ihr Ende: der Lauf fährt auf ihren Anfang
    setTimeout(function () { lauf.scrollTo({ top: Math.max(0, lauf.scrollTop + k.getBoundingClientRect().top - lauf.getBoundingClientRect().top - 12), behavior: 'smooth' }); }, 60);
  }

  /* ---- Buchung im grossen Fenster: das Buchungssystem des Hauses (SimpleBooking) mit Daten und Gästen, ohne die Seite zu verlassen.
     Bleibt es leer (Browser sperrt eingebettete Seiten), steht oben der Weg in ein neues Fenster. */
  var bf = null;
  function buchung(adr) {
    if (!bf) {
      bf = document.createElement('div');
      bf.className = 'gast-buchung'; bf.setAttribute('role', 'dialog'); bf.setAttribute('aria-label', T.bTitel);
      bf.innerHTML = '<div class="gast-buchung__rahmen"><header class="gast-buchung__kopf"><span class="gast__foto"><img src="' + BASIS + HAUS.foto + '" alt="" width="240" height="240"><i aria-hidden="true"></i></span>' +
        '<div><b>' + T.bTitel + '</b><span>' + T.bHinweis + '</span></div>' +
        '<a class="gast-buchung__neu" target="_blank" rel="noopener">' + T.bFenster + '</a><button type="button" class="kn kn--klein gast-buchung__zu">' + T.bZurueck + '</button></header>' +
        '<div class="gast-buchung__buehne"><div class="gast-buchung__lade"><i></i><i></i><i></i></div><iframe title="' + T.bTitel + '" allow="payment"></iframe></div></div>';
      document.body.appendChild(bf);
      bf.querySelector('.gast-buchung__zu').addEventListener('click', function () { zu(); });
      bf.addEventListener('click', function (e) { if (e.target === bf) zu(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('gast-bucht')) zu(); });
      bf.querySelector('iframe').addEventListener('load', function () { bf.classList.add('geladen'); });
    }
    function zu() { document.documentElement.classList.remove('gast-bucht'); setTimeout(function () { feld.focus({ preventScroll: true }); }, 300); }
    bf.classList.remove('geladen');
    bf.querySelector('.gast-buchung__neu').href = adr;
    bf.querySelector('iframe').src = adr;
    requestAnimationFrame(function () { document.documentElement.classList.add('gast-bucht'); });
  }

  function frage(f) {
    if (beschaeftigt || !f.trim()) return;
    var alt = lauf.querySelector('.gast__vor'); if (alt) alt.remove();
    var st = lauf.querySelector('.gast__start'); if (st) st.remove();
    blase('gast', f.trim());
    if (/^\s*(hallo|hi|hey|grüezi|gruezi|guten (tag|morgen|abend)|servus)[\s!.]*$/i.test(f)) {
      beschaeftigt = true; var b0 = denkt();
      return setTimeout(function () { b0.classList.remove('gast__b--denkt'); b0.innerHTML = ''; tippe(b0, T.hallo, '', function () { beschaeftigt = false; }); }, 500);
    }
    verlauf.push({ role: 'user', content: f.trim() });
    beschaeftigt = true;
    var b = denkt();
    function zeige(text, quelle, m, knoepfe) {
      b.classList.remove('gast__b--denkt'); b.innerHTML = '';
      tippe(b, text, quelle, function () { beschaeftigt = false; if (m) maske(m); if (knoepfe && knoepfe.length) vorschlaege(knoepfe); });
    }
    buchHolen();   // das Antwortbuch lädt neben der Anfrage, damit der Rückfall ohne Wartezeit antwortet (19.10.2026)
    var abbruch = typeof AbortController === 'function' ? new AbortController() : null;
    var uhr = abbruch ? setTimeout(function () { abbruch.abort(); }, 25000) : 0;   // Zeitüberschreitung: nach 25 s antwortet das Antwortbuch
    fetch(BASIS + 'api/gast', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: verlauf.slice(-12), mappe: MAPPE, sprache: SP, heute: iso(new Date()) }), signal: abbruch ? abbruch.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (a) {
        clearTimeout(uhr);
        if (!a || !a.text) throw 0;
        verlauf.push({ role: 'assistant', content: a.text });
        zeige(a.text, '', a.maske, a.knoepfe);
      })
      .catch(function () {
        clearTimeout(uhr);
        buchHolen().then(function () {
          var ba = buchAntwort(f);   // zuerst das Antwortbuch des Hauses (19.10.2026)
          if (ba) {
            verlauf.push({ role: 'assistant', content: ba.text });
            return zeige(ba.text, '', ba.maske, ba.knoepfe);
          }
          if (/(buchen|reservier|frei|verfügbar|book|reserv|availab|libre|disponib)/i.test(f) && !/park|garage|tisch|table/i.test(f)) {
            var t0 = T.gerne;
            verlauf.push({ role: 'assistant', content: t0 });
            return zeige(t0, '', {});
          }
          var w = finde(f);
          if (SP !== 'de') w = null;   // der Rückfall kennt nur den deutschen Wortlaut
          var t = w ? w.a : T.keine;
          verlauf.push({ role: 'assistant', content: t });
          zeige(t, w ? T.quelle + w.t : '');
        });
      });
  }
  fen.querySelector('.gast__neu').addEventListener('click', function () {
    if (beschaeftigt) return;
    verlauf = []; lauf.innerHTML = ''; fen.classList.remove('gast--breit'); gruss(); feld.focus({ preventScroll: true });
  });
  fen.querySelector('.gast__plus').addEventListener('click', function () {
    if (beschaeftigt) return;
    var st = lauf.querySelector('.gast__start'); if (st) st.remove();
    var alt = lauf.querySelector('.gast__vor'); if (alt) alt.remove();
    var t = T.gerne;
    verlauf.push({ role: 'assistant', content: t });
    var b = blase('haus'); absaetze(b, t); maske({});
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = feld.value; feld.value = ''; hoehe();
    frage(f);
  });
  /* Das Feld ist ein Chatfeld (Robert 12.10.2026): am rechten Rand bricht die Zeile um und das Feld wächst mit, bis fünf Zeilen.
     Enter sendet, Umschalt+Enter macht eine neue Zeile. */
  function hoehe() { feld.style.height = 'auto'; if (feld.value) feld.style.height = Math.min(feld.scrollHeight, 132) + 'px'; else feld.style.height = ''; }
  feld.addEventListener('input', hoehe);
  feld.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
  });
})();
