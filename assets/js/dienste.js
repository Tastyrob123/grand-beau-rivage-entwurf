/* Grand Beau-Rivage Interlaken — Gäste-Funktionen (Tasty Studios, 10.10.2026, Vorlage Carlton-Europe und die Häuser der Familie Maeder)
   Zimmer-Finder mit Tagespreis aus dem Buchungssystem des Hauses (SimpleBooking 9477, nur gelesen, gebucht wird dort), Wetter für die gewählten Tage,
   Tagungsrechner aus den Pauschalen des Hauses, Vor Ihrer Anreise. Der Preisvergleich zeigt Beispielwerte, bis das Haus ihn im Buchungssystem freischaltet.
   Nichts geschätzt, was als Preis des Hauses erscheint. Fällt ein Dienst aus, bleibt der bisherige Weg (Buchungssystem, Rezeption). */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var ZIM = DATEN.zimmer || {};
  /* Wörter der Fenster in sechs Sprachen (Robert 12.10.2026: die Website fertig übersetzen). Der feste Text der Seite kommt aus sprachen.py,
     Zimmernamen und Beschreibungen aus der Datenkarte der Seite. Das Buchungssystem liefert die Zimmernamen deutsch, sie werden über die Kennung ersetzt. */
  var SP = (doc.lang || 'de').slice(0, 2).toLowerCase(); if (['de', 'en', 'fr', 'zh', 'ko', 'ar'].indexOf(SP) < 0) SP = 'en';
  var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-u-nu-latn' }[SP];   /* Arabisch mit lateinischen Ziffern wie der Rest der Seite (12.10.2026) */
  var LTR = function (s) { return SP === 'ar' ? '⁦' + s + '⁩' : s; };   /* Telefonnummern bleiben in der arabischen Zeile links nach rechts */
  var T = {
    de: { mitWem: 'Mit wem reisen Sie?', gruppe: ['Allein', 'Zu zweit', 'Zu dritt', 'Zu viert', 'Zu fünft', 'Zu sechst'], zeigen: 'Zimmer und Preise zeigen', titel: 'Ihr <em>Zimmer.</em>', moment: 'Einen Moment, wir fragen die freien Zimmer ab.',
      naechte: function (n) { return n === 1 ? 'eine Nacht' : n + ' Nächte'; }, pers: function (n) { return n === 1 ? '1 Person' : n + ' Personen'; }, andere: 'Andere Daten',
      hp: 'mit Halbpension', nr: 'nicht erstattbar', flex: 'flexibel, mit Frühstück', essenF: 'Übernachtung und Frühstück', essenH: 'Halbpension', passt: 'Passt am besten',
      fuer: function (n) { return 'für ' + (n === 1 ? 'eine Nacht' : n + ' Nächte') + ', alle Personen, exkl. Kurtaxe'; }, buchen: 'Buchen',
      keinZimmer: 'Für diese Daten zeigt das Buchungssystem kein freies Zimmer. Versuchen Sie andere Daten oder rufen Sie die Rezeption an: ',
      weniger: ['', ' günstiger'], direkt: 'Direkt bei uns', pvKopf: 'Preisvergleich für Ihre Daten', beispiel: 'Beispielwerte',
      pvSatz: 'Die Portalpreise sind erfundene Beispielwerte. Den echten Vergleich liefert das Buchungssystem des Hauses, sobald die Funktion dort eingeschaltet ist.',
      mehr: 'Ebenfalls frei', bspPreise: 'Beispielpreise in dieser Vorschau. Den Preis des Tages zeigt das Buchungssystem.', keineAntwort: 'Das Buchungssystem antwortet gerade nicht. Den Preis für Ihre Daten zeigt es Ihnen direkt.', preisBuchen: 'Preis und buchen',
      zusatz: { kb: 'mit Klimaanlage und Balkon', k: 'mit Klimaanlage', b: 'mit Balkon' },
      ganz: 'Ganztagespauschale', halb: 'Halbtagespauschale', tage: function (n) { return n === 1 ? 'Tag' : 'Tage'; }, leute: function (n) { return n + ' Personen'; },
      raum: function (r, n) { return 'Passender Raum: <b>' + r + '</b>, bis ' + n + ' Personen.'; }, keinRaum: function (n) { return 'Für ' + n + ' Personen fasst kein einzelner Raum. Das Event-Team findet eine Lösung.'; },
      offen: 'noch offen', entwurf: 'Erster Entwurf <em>Ihre Tagung</em>', stand: 'Stand', datum: 'Datum', richt: 'Richtpreis', richtE: 'Richtpreis (erster Entwurf)',
      druckSatz: 'Erster Entwurf nach den Tagungspauschalen des Hauses, keine Offerte und keine Bestätigung. Zimmer, Abendessen, Technik über die Pauschale hinaus und Ihre Wünsche kommen dazu. Die verbindliche Offerte schreibt Ihnen das Event-Team.',
      tagung: 'Tagung', personen: 'Personen', tageW: 'Tage', raumW: 'Raum', name: 'Name', wunsch: 'Wünsche', mBetreff: function (n) { return 'Tagung im Grand Beau-Rivage, ' + n + ' Personen'; }, gruss: 'Guten Tag', ende: 'Freundliche Grüsse',
      ankunft: 'Ankunft', shuttle: function (z) { return 'Shuttle ab Interlaken Ost, Zug kommt an um ' + z; }, offen2: 'offen',
      park: function (t, p, s) { return 'Parkplatz am Haus, ' + t + (t === 1 ? ' Tag' : ' Tage') + ' × CHF ' + p + ': CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA: ' + b.gruppe + ', ' + b.name + ' (' + b.dauer + '), gewünscht am ' + (tag || 'Tag offen') + ' um ' + zeit + ': CHF ' + p; },
      tisch: function (z, p) { return 'Tisch am ersten Abend um ' + z + ' für ' + p; }, anlass: 'Anlass', allergien: 'Allergien und Unverträglichkeiten', keineB: 'Keine Behandlung',
      nr2: 'Buchungsnummer', an: 'Anreise', ab: 'Abreise', extras: 'Extras laut Preisliste', aBetreff: 'Vor der Anreise' },
    en: { mitWem: 'Who are you travelling with?', gruppe: ['On my own', 'Two of us', 'Three of us', 'Four of us', 'Five of us', 'Six of us'], zeigen: 'Show rooms and rates', titel: 'Your <em>room.</em>', moment: 'One moment, we are checking which rooms are free.',
      naechte: function (n) { return n === 1 ? 'one night' : n + ' nights'; }, pers: function (n) { return n === 1 ? '1 guest' : n + ' guests'; }, andere: 'Other dates',
      hp: 'with half board', nr: 'non-refundable', flex: 'flexible, with breakfast', essenF: 'Room and breakfast', essenH: 'Half board', passt: 'Best match',
      fuer: function (n) { return 'for ' + (n === 1 ? 'one night' : n + ' nights') + ', all guests, excl. tourist tax'; }, buchen: 'Book',
      keinZimmer: 'The booking system shows no free room for these dates. Try other dates or call reception: ',
      weniger: ['', ' less'], direkt: 'Direct with us', pvKopf: 'Price comparison for your dates', beispiel: 'Sample values',
      pvSatz: 'The portal prices are invented sample values. The real comparison will come from the hotel’s booking system as soon as the feature is switched on there.',
      mehr: 'Also available', bspPreise: 'Sample rates in this preview. The booking system shows the rate of the day.', keineAntwort: 'The booking system is not responding right now. It will show you the rate for your dates directly.', preisBuchen: 'Rate and booking',
      zusatz: { kb: 'with air conditioning and balcony', k: 'with air conditioning', b: 'with balcony' },
      ganz: 'Full-day package', halb: 'Half-day package', tage: function (n) { return n === 1 ? 'day' : 'days'; }, leute: function (n) { return n + ' people'; },
      raum: function (r, n) { return 'Suitable room: <b>' + r + '</b>, up to ' + n + ' people.'; }, keinRaum: function (n) { return 'No single room holds ' + n + ' people. The events team will find a solution.'; },
      offen: 'to be confirmed', entwurf: 'A first draft <em>of your meeting</em>', stand: 'As of', datum: 'Date', richt: 'Guide price', richtE: 'Guide price (first draft)',
      druckSatz: 'A first draft based on the hotel’s meeting packages, not a quote and not a confirmation. Rooms, dinner, technology beyond the package and your wishes come on top. The events team will send you the binding quote.',
      tagung: 'Meeting', personen: 'People', tageW: 'Days', raumW: 'Room', name: 'Name', wunsch: 'Requests', mBetreff: function (n) { return 'Meeting at the Grand Beau-Rivage, ' + n + ' people'; }, gruss: 'Good day', ende: 'Kind regards',
      ankunft: 'Arrival', shuttle: function (z) { return 'Shuttle from Interlaken Ost, train arrives at ' + z; }, offen2: 'open',
      park: function (t, p, s) { return 'Parking at the hotel, ' + t + (t === 1 ? ' day' : ' days') + ' × CHF ' + p + ': CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA: ' + b.gruppe + ', ' + b.name + ' (' + b.dauer + '), requested for ' + (tag || 'a day to be confirmed') + ' at ' + zeit + ': CHF ' + p; },
      tisch: function (z, p) { return 'Table on the first evening at ' + z + ' for ' + p; }, anlass: 'Occasion', allergien: 'Allergies and intolerances', keineB: 'No treatment',
      nr2: 'Booking number', an: 'Arrival', ab: 'Departure', extras: 'Extras per price list', aBetreff: 'Before arrival' },
    fr: { mitWem: 'Avec qui voyagez-vous ?', gruppe: ['Seul(e)', 'À deux', 'À trois', 'À quatre', 'À cinq', 'À six'], zeigen: 'Voir chambres et tarifs', titel: 'Votre <em>chambre.</em>', moment: 'Un instant, nous vérifions les chambres libres.',
      naechte: function (n) { return n === 1 ? 'une nuit' : n + ' nuits'; }, pers: function (n) { return n === 1 ? '1 personne' : n + ' personnes'; }, andere: 'Autres dates',
      hp: 'en demi-pension', nr: 'non remboursable', flex: 'flexible, avec petit-déjeuner', essenF: 'Nuit et petit-déjeuner', essenH: 'Demi-pension', passt: 'Le meilleur choix',
      fuer: function (n) { return 'pour ' + (n === 1 ? 'une nuit' : n + ' nuits') + ', toutes personnes, hors taxe de séjour'; }, buchen: 'Réserver',
      keinZimmer: 'Le système de réservation n’indique aucune chambre libre à ces dates. Essayez d’autres dates ou appelez la réception : ',
      weniger: ['', ' de moins'], direkt: 'En direct chez nous', pvKopf: 'Comparaison des prix pour vos dates', beispiel: 'Valeurs d’exemple',
      pvSatz: 'Les prix des portails sont des valeurs d’exemple inventées. La vraie comparaison viendra du système de réservation de l’hôtel dès que la fonction y sera activée.',
      mehr: 'Également libres', bspPreise: 'Tarifs d’exemple dans cet aperçu. Le système de réservation indique le prix du jour.', keineAntwort: 'Le système de réservation ne répond pas pour le moment. Il vous indiquera directement le prix pour vos dates.', preisBuchen: 'Prix et réservation',
      zusatz: { kb: 'avec climatisation et balcon', k: 'avec climatisation', b: 'avec balcon' },
      ganz: 'Forfait journée', halb: 'Forfait demi-journée', tage: function (n) { return n === 1 ? 'jour' : 'jours'; }, leute: function (n) { return n + ' personnes'; },
      raum: function (r, n) { return 'Salle adaptée : <b>' + r + '</b>, jusqu’à ' + n + ' personnes.'; }, keinRaum: function (n) { return 'Aucune salle seule n’accueille ' + n + ' personnes. L’équipe événementielle trouvera une solution.'; },
      offen: 'à définir', entwurf: 'Première ébauche <em>de votre séminaire</em>', stand: 'État au', datum: 'Date', richt: 'Prix indicatif', richtE: 'Prix indicatif (première ébauche)',
      druckSatz: 'Première ébauche selon les forfaits séminaires de l’hôtel, ni offre ni confirmation. Chambres, dîner, technique au-delà du forfait et vos souhaits s’y ajoutent. L’équipe événementielle vous adressera l’offre ferme.',
      tagung: 'Séminaire', personen: 'Personnes', tageW: 'Jours', raumW: 'Salle', name: 'Nom', wunsch: 'Souhaits', mBetreff: function (n) { return 'Séminaire au Grand Beau-Rivage, ' + n + ' personnes'; }, gruss: 'Bonjour', ende: 'Meilleures salutations',
      ankunft: 'Arrivée', shuttle: function (z) { return 'Navette depuis Interlaken Ost, le train arrive à ' + z; }, offen2: 'à définir',
      park: function (t, p, s) { return 'Parking à l’hôtel, ' + t + (t === 1 ? ' jour' : ' jours') + ' × CHF ' + p + ' : CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA : ' + b.gruppe + ', ' + b.name + ' (' + b.dauer + '), souhaité ' + (tag ? 'le ' + tag : 'un jour à définir') + ' à ' + zeit + ' : CHF ' + p; },
      tisch: function (z, p) { return 'Table le premier soir à ' + z + ' pour ' + p; }, anlass: 'Occasion', allergien: 'Allergies et intolérances', keineB: 'Aucun soin',
      nr2: 'Numéro de réservation', an: 'Arrivée', ab: 'Départ', extras: 'Suppléments selon la liste de prix', aBetreff: 'Avant l’arrivée' },
    zh: { mitWem: '您与谁同行？', gruppe: ['独自一人', '两人', '三人', '四人', '五人', '六人'], zeigen: '查看客房与价格', titel: '您的<em>客房。</em>', moment: '请稍候，我们正在查询空房。',
      naechte: function (n) { return n + ' 晚'; }, pers: function (n) { return n + ' 位客人'; }, andere: '更改日期',
      hp: '含半膳', nr: '不可退款', flex: '可灵活取消，含早餐', essenF: '住宿含早餐', essenH: '半膳', passt: '最适合您',
      fuer: function (n) { return '共 ' + n + ' 晚，含所有客人，不含旅游税'; }, buchen: '预订',
      keinZimmer: '预订系统显示这些日期没有空房。请尝试其他日期，或致电前台：',
      weniger: ['便宜 ', ''], direkt: '直接向我们预订', pvKopf: '您所选日期的价格比较', beispiel: '示例数值',
      pvSatz: '各平台价格为虚构的示例数值。酒店预订系统开启该功能后，将提供真实的比较。',
      mehr: '其他空房', bspPreise: '此预览中为示例价格。当日价格以预订系统为准。', keineAntwort: '预订系统暂时没有响应。您所选日期的价格将直接在预订系统中显示。', preisBuchen: '查看价格并预订',
      zusatz: { kb: '带空调和阳台', k: '带空调', b: '带阳台' },
      ganz: '全天会议套餐', halb: '半天会议套餐', tage: function () { return '天'; }, leute: function (n) { return n + ' 人'; },
      raum: function (r, n) { return '合适的会议室：<b>' + r + '</b>，最多 ' + n + ' 人。'; }, keinRaum: function (n) { return '没有单个会议室可容纳 ' + n + ' 人。活动团队会为您找到解决方案。'; },
      offen: '待定', entwurf: '您的会议<em>初步方案</em>', stand: '编制日期', datum: '日期', richt: '参考价格', richtE: '参考价格（初步方案）',
      druckSatz: '根据酒店会议套餐编制的初步方案，并非报价，也不是确认。客房、晚餐、套餐以外的设备以及您的其他需求另计。正式报价由活动团队发送给您。',
      tagung: '会议', personen: '人数', tageW: '天数', raumW: '会议室', name: '姓名', wunsch: '其他需求', mBetreff: function (n) { return 'Grand Beau-Rivage 会议，' + n + ' 人'; }, gruss: '您好', ende: '谨致问候',
      ankunft: '抵达时间', shuttle: function (z) { return '因特拉肯东站接驳，列车抵达时间 ' + z; }, offen2: '待定',
      park: function (t, p, s) { return '酒店停车位，' + t + ' 天 × CHF ' + p + '：CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA：' + b.gruppe + '，' + b.name + '（' + b.dauer + '），希望时间 ' + (tag || '日期待定') + ' ' + zeit + '：CHF ' + p; },
      tisch: function (z, p) { return '第一晚 ' + z + ' 订座，' + p; }, anlass: '场合', allergien: '过敏与不耐受', keineB: '不需要护理',
      nr2: '预订编号', an: '入住日期', ab: '退房日期', extras: '按价目表的额外费用', aBetreff: '抵达前' },
    ko: { mitWem: '누구와 함께 여행하시나요?', gruppe: ['혼자', '두 명', '세 명', '네 명', '다섯 명', '여섯 명'], zeigen: '객실과 요금 보기', titel: '고객님의 <em>객실.</em>', moment: '잠시만 기다려 주세요. 빈 객실을 확인하고 있습니다.',
      naechte: function (n) { return n + '박'; }, pers: function (n) { return n + '명'; }, andere: '다른 날짜',
      hp: '하프보드 포함', nr: '환불 불가', flex: '변경 가능, 조식 포함', essenF: '숙박 및 조식', essenH: '하프보드', passt: '가장 잘 맞는 객실',
      fuer: function (n) { return n + '박, 전체 인원 기준, 관광세 별도'; }, buchen: '예약하기',
      keinZimmer: '예약 시스템에 해당 날짜의 빈 객실이 없습니다. 다른 날짜를 선택하시거나 리셉션으로 전화해 주세요: ',
      weniger: ['', ' 저렴'], direkt: '호텔 직접 예약', pvKopf: '선택하신 날짜의 가격 비교', beispiel: '예시 값',
      pvSatz: '플랫폼 가격은 임의로 만든 예시 값입니다. 호텔 예약 시스템에서 이 기능이 켜지면 실제 비교가 표시됩니다.',
      mehr: '예약 가능한 다른 객실', bspPreise: '이 미리보기의 요금은 예시입니다. 당일 요금은 예약 시스템에서 확인하실 수 있습니다.', keineAntwort: '예약 시스템이 지금 응답하지 않습니다. 선택하신 날짜의 요금은 예약 시스템에서 바로 확인하실 수 있습니다.', preisBuchen: '요금 확인 및 예약',
      zusatz: { kb: '에어컨, 발코니', k: '에어컨', b: '발코니' },
      ganz: '종일 회의 패키지', halb: '반일 회의 패키지', tage: function () { return '일'; }, leute: function (n) { return n + '명'; },
      raum: function (r, n) { return '알맞은 공간: <b>' + r + '</b>, 최대 ' + n + '명.'; }, keinRaum: function (n) { return n + '명을 수용할 수 있는 단일 공간은 없습니다. 이벤트 팀이 방법을 찾아 드립니다.'; },
      offen: '미정', entwurf: '회의 <em>초안</em>', stand: '작성일', datum: '날짜', richt: '예상 금액', richtE: '예상 금액(초안)',
      druckSatz: '호텔 회의 패키지를 기준으로 한 초안이며, 견적서나 확정이 아닙니다. 객실, 저녁 식사, 패키지 외 장비 및 요청 사항은 별도입니다. 확정 견적은 이벤트 팀이 보내 드립니다.',
      tagung: '회의', personen: '인원', tageW: '일수', raumW: '공간', name: '이름', wunsch: '요청 사항', mBetreff: function (n) { return 'Grand Beau-Rivage 회의, ' + n + '명'; }, gruss: '안녕하세요', ende: '감사합니다',
      ankunft: '도착 시간', shuttle: function (z) { return '인터라켄 동역 셔틀, 열차 도착 ' + z; }, offen2: '미정',
      park: function (t, p, s) { return '호텔 주차, ' + t + '일 × CHF ' + p + ': CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA: ' + b.gruppe + ', ' + b.name + ' (' + b.dauer + '), 희망 일시 ' + (tag || '날짜 미정') + ' ' + zeit + ': CHF ' + p; },
      tisch: function (z, p) { return '첫날 저녁 ' + z + ' 테이블, ' + p; }, anlass: '기념일', allergien: '알레르기 및 불내증', keineB: '트리트먼트 없음',
      nr2: '예약 번호', an: '도착일', ab: '출발일', extras: '요금표 기준 추가 비용', aBetreff: '도착 전' },
    ar: { mitWem: 'مع من تسافرون؟', gruppe: ['بمفردي', 'شخصان', 'ثلاثة أشخاص', 'أربعة أشخاص', 'خمسة أشخاص', 'ستة أشخاص'], zeigen: 'عرض الغرف والأسعار', titel: '<em>غرفتكم.</em>', moment: 'لحظة من فضلكم، نتحقق من الغرف المتاحة.',
      naechte: function (n) { return n === 1 ? 'ليلة واحدة' : n === 2 ? 'ليلتان' : n <= 10 ? n + ' ليالٍ' : n + ' ليلة'; }, pers: function (n) { return n === 1 ? 'شخص واحد' : n === 2 ? 'شخصان' : n <= 10 ? n + ' أشخاص' : n + ' شخصاً'; }, andere: 'تواريخ أخرى',
      hp: 'مع نصف إقامة', nr: 'غير قابل للاسترداد', flex: 'مرن، مع الإفطار', essenF: 'مبيت وإفطار', essenH: 'نصف إقامة', passt: 'الأنسب لكم',
      fuer: function (n) { return 'عن ' + (n === 1 ? 'ليلة واحدة' : n === 2 ? 'ليلتين' : n <= 10 ? n + ' ليالٍ' : n + ' ليلة') + '، لجميع الأشخاص، دون ضريبة السياحة'; }, buchen: 'احجزوا',
      keinZimmer: 'لا يُظهر نظام الحجز أي غرفة متاحة في هذه التواريخ. جرّبوا تواريخ أخرى أو اتصلوا بالاستقبال: ',
      weniger: ['أقل بـ ', ''], direkt: 'مباشرة لدينا', pvKopf: 'مقارنة الأسعار لتواريخكم', beispiel: 'قيم توضيحية',
      pvSatz: 'أسعار المنصات قيم توضيحية مختلقة. تأتي المقارنة الحقيقية من نظام حجز الفندق فور تفعيل هذه الخاصية فيه.',
      mehr: 'متاح أيضاً', bspPreise: 'أسعار تجريبية في هذه المعاينة. سعر اليوم يعرضه نظام الحجز.', keineAntwort: 'نظام الحجز لا يستجيب حالياً. سيعرض لكم سعر تواريخكم مباشرة.', preisBuchen: 'السعر والحجز',
      zusatz: { kb: 'مع تكييف وشرفة', k: 'مع تكييف', b: 'مع شرفة' },
      ganz: 'باقة اليوم الكامل', halb: 'باقة نصف اليوم', tage: function (n) { return n === 1 ? 'يوم' : 'أيام'; }, leute: function (n) { return n + ' أشخاص'; },
      raum: function (r, n) { return 'القاعة المناسبة: <b>' + r + '</b>، حتى ' + n + ' شخصاً.'; }, keinRaum: function (n) { return 'لا توجد قاعة واحدة تتسع لـ ' + n + ' شخصاً. سيجد فريق الفعاليات حلاً.'; },
      offen: 'لم يحدد بعد', entwurf: 'مسودة أولى <em>لاجتماعكم</em>', stand: 'بتاريخ', datum: 'التاريخ', richt: 'السعر الإرشادي', richtE: 'السعر الإرشادي (مسودة أولى)',
      druckSatz: 'مسودة أولى وفق باقات الاجتماعات في الفندق، وليست عرض سعر ولا تأكيداً. تُضاف الغرف والعشاء والتجهيزات التقنية خارج الباقة ورغباتكم. يرسل لكم فريق الفعاليات العرض الملزم.',
      tagung: 'اجتماع', personen: 'عدد الأشخاص', tageW: 'عدد الأيام', raumW: 'القاعة', name: 'الاسم', wunsch: 'طلبات', mBetreff: function (n) { return 'اجتماع في Grand Beau-Rivage، ' + n + ' أشخاص'; }, gruss: 'مرحباً', ende: 'مع أطيب التحيات',
      ankunft: 'وقت الوصول', shuttle: function (z) { return 'نقل مكوكي من محطة إنترلاكن الشرقية، يصل القطار في ' + z; }, offen2: 'لم يحدد بعد',
      park: function (t, p, s) { return 'موقف سيارة عند الفندق، ' + t + (t === 1 ? ' يوم' : ' أيام') + ' × CHF ' + p + ': CHF ' + s; },
      spa: function (b, tag, zeit, p) { return 'La Vallée SPA: ' + b.gruppe + '، ' + b.name + ' (' + b.dauer + ')، مطلوب في ' + (tag || 'يوم لم يحدد بعد') + ' الساعة ' + zeit + ': CHF ' + p; },
      tisch: function (z, p) { return 'طاولة في المساء الأول الساعة ' + z + ' لـ ' + p; }, anlass: 'المناسبة', allergien: 'الحساسية وعدم التحمل', keineB: 'بدون علاج',
      nr2: 'رقم الحجز', an: 'الوصول', ab: 'المغادرة', extras: 'الإضافات حسب قائمة الأسعار', aBetreff: 'قبل الوصول' }
  }[SP];
  /* Deutsche Grundnamen des Buchungssystems je Kennung, damit auch Zimmer ohne Kennung (z. B. «Doppelzimmer King size») ihr Bild und ihren Namen finden */
  var DP = SP === 'fr' ? ' : ' : SP === 'zh' ? '：' : ': ';   /* Doppelpunkt nach Landesart */
  var DE_NAMEN = { einzel: 'Einzelzimmer', queen: 'Doppelzimmer Queen Size', king: 'Doppelzimmer King Size', comfort: 'Doppelzimmer Comfort', fluss: 'Doppelzimmer Flussblick', first: 'Doppelzimmer First Class', familie: 'Familienzimmer', junior: 'Junior Suite', spa: 'SPA Junior Suite', jsfc: 'Junior Suite First Class', interlaken: 'Interlaken Suite', pyramid: 'Pyramid Suite', royal: 'Royal Suite' };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chf = function (n, nachkomma) {
    var neg = n < 0; n = Math.abs(n);
    var r = Math.round(n * 100) / 100, ganz = Math.floor(r), rest = Math.round((r - ganz) * 100);
    var t = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return (neg ? '-' : '') + ((nachkomma || rest) ? t + '.' + (rest < 10 ? '0' : '') + rest : t);
  };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tageZw = function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); };
  var TAGE_L = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var EMBLEM = function (kl) { var z = $('svg.emblem, .buchen__t svg'); return z ? z.outerHTML.replace(/class="[^"]*"/, 'class="' + kl + '"') : ''; };
  var schalter = function (wurzel, attr, wenn) {
    var w = 0;
    $$('[' + attr + ']', wurzel).forEach(function (b) { b.addEventListener('click', function () { w = +b.getAttribute(attr); $$('[' + attr + ']', wurzel).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); if (wenn) wenn(w); }); });
    return function () { return w; };
  };
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.tagName === 'SELECT' && t.closest('.dn-karte-dunkel, .dn-rechner, dialog.buchen')) t.blur(); });

  /* ---------- Wetter-Zeichen und Auftritt ---------- */
  var WMO = ['klar', 'heiter', 'teils bewölkt', 'bedeckt', 'Nebel', 'Niesel', 'Regen', 'Schnee', 'Schauer', 'Schneeschauer', 'Gewitter'];
  var wmo = function (c) { var w = WMO; return c === 0 ? w[0] : c === 1 ? w[1] : c === 2 ? w[2] : c === 3 ? w[3] : c < 50 ? w[4] : c < 60 ? w[5] : c < 70 ? w[6] : c < 80 ? w[7] : c < 83 ? w[8] : c < 90 ? w[9] : w[10]; };
  var icon = function (c, tag) {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true">';
    if (c <= 1) s += tag === 0 ? '<path d="M20 6a10 10 0 1 0 6 16A12 12 0 0 1 20 6Z"/>' : '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';
    else if (c <= 3 || (c >= 45 && c < 50)) s += (c === 2 ? '<circle cx="12" cy="11" r="4.5"/>' : '') + '<path d="M9 25h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 25Z"/>';
    else if ((c >= 71 && c < 80) || c === 85 || c === 86) s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="M11 24v4M16 23v4M21 24v4"/>';
    else s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="m11 23-1.5 4M16 23l-1.5 4M21 23l-1.5 4"/>';
    return s + '</svg>';
  };
  function belebe(wurzel) {
    $$('[data-anim]', wurzel).forEach(function (el) {
      if (RUHIG) { el.classList.add('dn-los', 'dn-ruhig'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); });
      $$('[data-hoch]', el).forEach(function (z) {
        var ziel = +z.getAttribute('data-hoch'), zeile = z.closest('[style*="--i"]'), i = zeile ? +zeile.style.getPropertyValue('--i') || 0 : 0, start = null;
        var schritt = function (t) { if (start === null) start = t; var p = Math.min(1, Math.max(0, (t - start - 250 - i * 140) / 1100)), e = 1 - Math.pow(1 - p, 3); z.firstChild.nodeValue = p < 1 ? chf(Math.round(ziel * e)) : chf(ziel); if (p < 1) requestAnimationFrame(schritt); };   /* nur den Text tauschen, nicht den Knoten (Messung 11.10.2026) */
        z.textContent = chf(0); requestAnimationFrame(schritt);
      });
    });
  }
  var WETTER = null;
  var holeWetter = function () { if (!WETTER) WETTER = fetch('/api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); return WETTER; };
  function reiseWetter(an, ab, ziel) {
    if (!ziel || !an || !ab || !window.fetch) return;
    ziel.innerHTML = '';
    fetch('/api/dienste?was=reisewetter&an=' + an + '&ab=' + ab).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var L = w.tage.filter(function (t) { return t.max != null; });
      if (!L.length) return;
      var vh = L.some(function (t) { return t.art === 'vorhersage'; }), mi = L.some(function (t) { return t.art === 'mittel'; });
      var karten = L.map(function (t, i) {
        var d = new Date(t.datum + 'T12:00'), mittel = t.art === 'mittel';
        return '<div class="dn-rw__tag" style="--i:' + i + '"><span class="dn-rw__wt">' + TAGE_L[d.getDay()] + '</span><span class="dn-rw__dt">' + d.getDate() + '.' + (d.getMonth() + 1) + '.</span>' +
          '<span class="dn-rw__ic">' + (mittel ? '<i class="dn-rw__oe">Ø</i>' : icon(t.code, 1)) + '</span>' +
          '<b class="dn-rw__max"><span data-hoch="' + Math.round(t.max) + '">' + Math.round(t.max) + '</span>°</b><span class="dn-rw__min">' + Math.round(t.min) + '°</span>' +
          (t.regen != null ? '<span class="dn-rw__nass"><i style="--h:' + Math.max(.04, t.regen / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em>' : '') + '</div>';
      }).join('');
      var fuss = (vh ? 'Mit Zeichen: Vorhersage.' : '') + (vh && mi ? ' ' : '') + (mi ? 'Mit Ø: gemessenes Mittel dieser Tage ' + w.jahre + ', ' + (w.klima || 'MeteoSchweiz') + ', keine Vorhersage.' : '');
      ziel.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Wetter in Interlaken für Ihre Tage</span></div><div class="dn-rw__reihe">' + karten + '</div><p class="dn-edel__satz">' + fuss + '</p></div>';
      var wv = ziel.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', L.length);
      belebe(ziel);
    }).catch(function () {});
  }

  /* ---------- Preisvergleich: Beispielwerte, bis das Haus den Vergleich im Buchungssystem freischaltet ---------- */
  function vergleichHTML(o) {
    var alle = [o.wir].concat(o.portale.map(function (p) { return p.chf; })), hoechst = Math.max.apply(null, alle), spar = hoechst - o.wir;
    var zeile = function (name, klein, v, i, wir) {
      var weniger = wir && spar > 0 ? '<span class="dn-pv__weniger">' + T.weniger[0] + 'CHF <span data-hoch="' + Math.round(spar) + '">' + chf(Math.round(spar)) + '</span>' + T.weniger[1] + '</span>' : '';
      return '<li class="dn-pv__z' + (wir ? ' dn-pv__z--wir' : '') + '" style="--i:' + i + '"><span class="dn-pv__n">' + esc(name) + (klein ? '<small>' + esc(klein) + '</small>' : '') + '</span>' +
        '<span class="dn-pv__spur"><i style="--w:' + Math.max(.08, v / hoechst).toFixed(3) + '"></i></span><span class="dn-pv__preis"><b>CHF <span data-hoch="' + Math.round(v) + '">' + chf(Math.round(v)) + '</span></b>' + weniger + '</span></li>';
    };
    return '<div class="dn-pv dn-pv--beispiel" data-anim><div class="dn-edel__kopf"><span class="mono">' + T.pvKopf + '</span><em>' + T.beispiel + '</em></div>' +
      '<ul class="dn-pv__liste">' + zeile(T.direkt, o.klein, o.wir, 0, true) + o.portale.map(function (p, i) { return zeile(p.name, '', p.chf, i + 1, false); }).join('') + '</ul>' +
      '<p class="dn-edel__satz">' + T.pvSatz + '</p></div>';
  }

  /* ---------- Zimmer-Finder im Buchen-Fenster und über die Leiste auf der Startseite ---------- */
  var dlg = $('dialog.buchen'), f = dlg && $('form', dlg);
  if (f) (function () {
    var g = f.elements.gaeste, t = $('.buchen__t', dlg), vorteil = $('.buchen__vorteil', dlg), titelH = $('h2', dlg), titelAlt = titelH ? titelH.innerHTML : '';
    var lbl = g.closest('label'); if (lbl) $('span', lbl).textContent = T.mitWem;
    T.gruppe.forEach(function (x, i) { if (g.options[i]) g.options[i].textContent = x; });
    var knopf = $('button[type=submit]', f); if (knopf && knopf.firstChild) knopf.firstChild.nodeValue = T.zeigen;
    var raum = document.createElement('div'); raum.className = 'dn-treffer'; raum.hidden = true; t.appendChild(raum);
    function zurueck() { raum.hidden = true; raum.innerHTML = ''; f.hidden = false; if (vorteil) vorteil.hidden = false; if (titelH) titelH.innerHTML = titelAlt; dlg.classList.remove('dn-breit', 'dn-laedt'); }
    $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', zurueck); });
    var link = function (an, ab, gz) { var gl = []; for (var i = 0; i < gz; i++) gl.push('A'); return (doc.getAttribute('data-buchung') || DATEN.buchung) + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an + '&out=' + ab + '&guests=' + encodeURIComponent(gl.join(',')); };
    var kopfZeile = function (an, ab, n, gz) {
      return '<p class="dn-treffer__kopf"><span>' + new Date(an + 'T12:00').toLocaleDateString(ORT, { day: 'numeric', month: 'short' }) + ' – ' + new Date(ab + 'T12:00').toLocaleDateString(ORT, { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + T.naechte(n) + ' · ' + T.pers(gz) + '</span><button type="button" class="dn-zurueck" data-zurueck>' + T.andere + '</button></p>';
    };
    var rateName = function (r) { return /Halfboard|Halbpension/i.test(r.rate + r.essen) ? T.hp : /Non Refundable/i.test(r.rate) ? T.nr : T.flex; };
    var essenName = function (e) { return /Halbpension/i.test(e) ? T.essenH : /Frühstück/i.test(e) ? T.essenF : e; };
    /* Zimmer, die das Buchungssystem unter einer anderen Kennung führt (z. B. «Doppelzimmer King size»), über den Namen finden */
    function zimNachName(n) {
      var a = String(n || '').toLowerCase(), treffer = null, lang = 0;
      for (var k in ZIM) [DE_NAMEN[k], ZIM[k].name].forEach(function (x) { var b = String(x || '').toLowerCase(); if (b && b.length > lang && (a === b || a.indexOf(b + ' ') === 0)) { treffer = ZIM[k]; lang = b.length; } });
      return treffer;
    }
    /* Name in der Sprache der Seite: Grundname aus der Datenkarte, Zusatz («mit Balkon» usw.) übersetzt; was nicht passt, bleibt beim Namen des Buchungssystems */
    function zimName(z, info) {
      if (SP === 'de' || !info || !info.name) return z.name;
      var m = String(z.name).match(/\bmit (Klimaanlage und Balkon|Klimaanlage|Balkon)\s*$/i);
      if (!m) return info.name;
      var zu = T.zusatz[/und/i.test(m[1]) ? 'kb' : /Klima/i.test(m[1]) ? 'k' : 'b'];
      return SP === 'zh' ? info.name + '（' + zu + '）' : SP === 'ko' ? info.name + ' (' + zu + ')' : info.name + ' ' + zu;
    }
    function karte(z, d, oben) {
      var info = ZIM[z.id] || zimNachName(z.name) || { name: z.name }, flex = z.raten.filter(function (r) { return /Standard/i.test(r.rate); })[0], nr = z.raten.filter(function (r) { return /Non Refundable/i.test(r.rate); })[0], hp = z.raten.filter(function (r) { return /Halfboard/i.test(r.rate); })[0];
      var raten = [flex, nr, hp].filter(Boolean).map(function (r) { return '<span class="dn-rate"><i>' + rateName(r) + '</i><b>CHF ' + chf(r.chf) + '</b></span>'; }).join('');
      if (!raten) raten = z.raten.slice(0, 2).map(function (r) { return '<span class="dn-rate"><i>' + esc(essenName(r.essen)) + '</i><b>CHF ' + chf(r.chf) + '</b></span>'; }).join('');
      var mini = !oben && info.bild ? String(info.bild).replace(/-(l|m|s)\.webp(\?|$)/, '-mini.webp$2') : '';   /* Miniatur je weiterem Zimmer (Robert 11.10.2026: «dass man sich Schmackofatz macht») */
      return '<article class="dn-zi' + (oben ? ' dn-zi--oben' + (info.bild ? '' : ' dn-zi--ohne') : '') + (mini ? ' dn-zi--mini' : '') + '">' + (oben && info.bild ? '<span class="dn-zi__b"><img src="' + esc(info.bild) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        (mini ? '<span class="dn-zi__mini"><img src="' + esc(mini) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        '<div class="dn-zi__t">' + (oben ? '<span class="mono">' + T.passt + '</span>' : '') + '<h3>' + esc(zimName(z, info)) + '</h3>' + (info.satz ? '<p>' + esc(info.satz) + '</p>' : '') +
        '<div class="dn-zi__raten">' + raten + '</div><small>' + T.fuer(d.naechte) + '</small></div>' +
        '<a class="kn' + (oben ? '' : ' kn--klein kn--linie') + '" href="' + esc(link(d.an, d.ab, d.gaeste)) + '" target="_blank" rel="noopener">' + T.buchen + '<i>' + PFEIL + '</i></a></article>';
    }
    function zeige(d) {
      dlg.classList.remove('dn-laedt'); dlg.classList.add('dn-breit');
      var L = d.zimmer.slice();
      if (!L.length) { raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + '<p class="dn-hinweis">' + T.keinZimmer + esc(LTR(DATEN.tel || '')) + (SP === 'zh' ? '。' : '.') + '</p>'; return; }
      var best = L[0], rest = L.slice(1), vg = '';
      var wir = (best.raten.filter(function (r) { return /Standard/i.test(r.rate); })[0] || best.raten[0]).chf;
      vg = vergleichHTML({ wir: wir, klein: zimName(best, ZIM[best.id] || zimNachName(best.name)), portale: [{ name: 'Booking.com', chf: Math.round(wir * 1.12) }, { name: 'Expedia', chf: Math.round(wir * 1.09) }, { name: 'Hotels.com', chf: Math.round(wir * 1.07) }] });
      raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + karte(best, d, true) + vg +
        (rest.length ? '<p class="mono dn-treffer__mehr">' + T.mehr + '</p>' + rest.map(function (z) { return karte(z, d, false); }).join('') : '') +
        (d.beispiel ? '<p class="dn-hinweis dn-hinweis--bsp">' + T.bspPreise + '</p>' : '');
      belebe(raum);
    }
    function ohnePreis(an, ab, gz) {
      dlg.classList.remove('dn-laedt');
      var n = Math.max(1, tageZw(an, ab)), ids = Object.keys(ZIM);
      dlg.classList.add('dn-breit');
      raum.innerHTML = kopfZeile(an, ab, n, gz) + '<p class="dn-hinweis">' + T.keineAntwort + '</p>' +
        ids.map(function (k, i) { var z = ZIM[k]; return '<article class="dn-zi' + (i ? '' : ' dn-zi--oben') + '">' + (i ? '' : '<span class="dn-zi__b"><img src="' + esc(z.bild) + '" alt="" loading="lazy"></span>') + '<div class="dn-zi__t"><h3>' + esc(z.name) + '</h3>' + (i ? '' : '<p>' + esc(z.satz) + '</p>') + '<small>' + esc(z.g ? z.g + ' · ' : '') + esc(z.bel) + '</small></div><a class="kn' + (i ? ' kn--klein kn--linie' : '') + '" href="' + esc(link(an, ab, gz)) + '" target="_blank" rel="noopener">' + T.preisBuchen + '<i>' + PFEIL + '</i></a></article>'; }).join('');
    }
    /* Beispielpreise für die Vorschau (Robert 12.10.2026: «Fantasiezahlen, damit sie einen Eindruck bekommen»): Das Buchungssystem weist Anfragen
       vom Online-Server ab. Antwortet der Dienst nicht, rechnet die Seite Preise je Nacht aus festen Beispielwerten (Saison, Gäste, Nächte)
       und zeigt sie im selben Aufbau wie die echte Antwort, mit einem Hinweis darunter. Antwortet der Dienst, gilt immer seine Antwort. */
    var BSP = { queen: 295, einzel: 215, first: 340, fluss: 365, king: 415, familie: 395, comfort: 465, junior: 420, jsfc: 548, pyramid: 608, spa: 715, royal: 1033, interlaken: 1315 };
    function beispiel(an, ab, gz) {
      var n = Math.max(1, tageZw(an, ab)), m = +String(an).slice(5, 7), t = +String(an).slice(8, 10);
      var saison = (m >= 6 && m <= 9) ? 1.22 : ((m === 12 && t >= 20) || (m === 1 && t <= 5)) ? 1.3 : (m === 5 || m === 10) ? 1.08 : 1;
      var L = [];
      Object.keys(ZIM).forEach(function (k, i) {
        if (!BSP[k]) return;
        var platz = k === 'einzel' ? 1 : +((String(ZIM[k].bel || '').match(/\d+/g) || ['2']).pop());
        if (gz > platz) return;
        var nacht = BSP[k] * saison * (gz === 1 && platz > 1 ? .86 : gz === 3 ? 1.24 : gz >= 4 ? 1.42 : 1);
        var std = Math.round(nacht * n / 5) * 5, nr = Math.round(std * .855 * 10) / 10, hp = std + 52 * gz * n;
        L.push({ id: k, name: DE_NAMEN[k] || ZIM[k].name, ab: nr, flexibel: null, raten: [
          { chf: nr, rate: 'Non Refundable Rate', essen: 'Übernachtung Frühstück', frei: 1 + (i * 7 + t) % 5 },
          { chf: std, rate: 'Standard Rate', essen: 'Übernachtung Frühstück', frei: 1 + (i * 7 + t) % 5 },
          { chf: hp, rate: 'Halfboard Rate', essen: 'Halbpension', frei: 1 + (i * 7 + t) % 5 }] });
      });
      L.sort(function (a, b) { return a.ab - b.ab; });
      return { an: an, ab: ab, naechte: n, gaeste: gz, waehrung: 'CHF', zimmer: L, beispiel: true };
    }
    raum.addEventListener('click', function (e) { if (e.target.closest('[data-zurueck]')) zurueck(); });
    /* Preise vorab holen (Robert 11.10.2026: «dauert lange bis es lädt»): das Buchungssystem braucht einige Sekunden. Gefragt wird schon beim
       Laden der Seite für die angezeigten Daten und bei jeder Änderung der Felder; beim Klick auf «Verfügbarkeit prüfen» liegt die Antwort meist schon da. */
    var VORAB = {};
    function holePreis(an, ab, gz) {
      var k = an + '|' + ab + '|' + gz;
      if (!VORAB[k]) {
        VORAB[k] = fetch('/api/dienste?was=preise&an=' + an + '&ab=' + ab + '&g=' + gz).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
        VORAB[k].catch(function () { delete VORAB[k]; });
      }
      return VORAB[k];
    }
    function vorab(q) {
      var el = q && q.elements; if (!el || !el.an || !el.ab || !el.gaeste) return;
      var an = el.an.value, ab = el.ab.value, gz = +el.gaeste.value || 2;
      if (/^\d{4}-\d{2}-\d{2}$/.test(an) && /^\d{4}-\d{2}-\d{2}$/.test(ab) && ab > an) holePreis(an, ab, gz).catch(function () {});
    }
    var vorabAlle = function () { vorab(f); $$('form[data-leiste]').forEach(vorab); };
    setTimeout(vorabAlle, 1200);
    document.addEventListener('change', function (e) { var q = e.target.form; if (q && (q === f || (q.matches && q.matches('form[data-leiste]')))) setTimeout(function () { vorab(q); }, 50); }, true);
    function suche(an, ab, gz) {
      f.hidden = true; if (vorteil) vorteil.hidden = true; raum.hidden = false; if (titelH) titelH.innerHTML = T.titel;
      dlg.classList.add('dn-laedt');   /* Warten: das Zeichen gross in der Mitte, darunter «Ihr Zimmer.» (Robert 11.10.2026) */
      raum.innerHTML = '<div class="dn-lader" role="status"><span class="dn-lader__z">' + EMBLEM('dn-lader__a') + EMBLEM('dn-lader__b') + '</span><h2 class="d3 dn-lader__t">' + T.titel + '</h2><p class="dn-hinweis">' + T.moment + '</p><span class="dn-lader__l"><i></i></span></div>';   /* das Zeichen füllt sich mit Gold, solange das Buchungssystem antwortet (Robert 11.10.2026) */
      var hole = function () { return holePreis(an, ab, gz); };
      hole().catch(function () { return new Promise(function (ok) { setTimeout(ok, 1200); }).then(hole); }).then(zeige).catch(function () { var d = beispiel(an, ab, gz); if (d.zimmer.length) zeige(d); else ohnePreis(an, ab, gz); });
    }
    document.addEventListener('submit', function (e) {
      var q = e.target;
      if (!window.fetch || !q.matches || !(q === f || q.matches('form[data-leiste]'))) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var an = q.elements.an.value, ab = q.elements.ab.value, gz = +q.elements.gaeste.value;
      if (q !== f) { f.elements.an.value = an; f.elements.ab.value = ab; g.value = String(gz); [f.elements.an, f.elements.ab, g].forEach(function (x) { x.dispatchEvent(new Event('change', { bubbles: true })); }); var b = $('[data-buchen]'); if (b) b.click(); }   /* change: die Knöpfe im Fenster zeigen die Werte (Kalender im Hausstil) */
      suche(an, ab, gz);
    }, true);
  })();

  /* ---------- Drucken ---------- */
  function drucke(html, bogen) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    /* bogen: ganzes Blatt im Stil des Hauses, ohne Seitenrand (Tagungs-Entwurf, Robert 12.10.2026) */
    var rand = bogen ? document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '@page{size:A4;margin:0}' })) : null;
    if (bogen) doc.classList.add('dn-druckt--bogen');
    var weg = function () { doc.classList.remove('dn-druckt', 'dn-druckt--bogen'); if (rand && rand.parentNode) rand.parentNode.removeChild(rand); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    /* erst drucken, wenn die Bilder des Blatts da sind (höchstens 1,2 s warten) */
    var los = function () { if (los.war) return; los.war = 1; window.print(); setTimeout(weg, 1500); };
    var offen = $$('img', d).filter(function (i) { return !i.complete; });
    if (!offen.length) return setTimeout(los, 60);
    var n = offen.length; offen.forEach(function (i) { var f = function () { if (!--n) setTimeout(los, 30); }; i.addEventListener('load', f); i.addEventListener('error', f); });
    setTimeout(los, 1200);
  }
  var BASIS = (function () { var q = $('script[src*="assets/js/dienste.js"]'); return q ? q.getAttribute('src').split('assets/js/')[0] : ''; })();   /* '' oder '../' auf den Sprachseiten */
  var MARKE = function () { return '<p class="dn-d-marke">' + EMBLEM('dn-d-zeichen') + '<b>Grand Beau-Rivage</b></p>'; };
  var ADRESSE = 'Grand Beau-Rivage · Höheweg 211 · 3800 Interlaken · ' + (DATEN.tel || '') + ' · ' + (DATEN.mail || '');

  /* ---------- Tagungsrechner: Personen, Tage, Pauschale → Raum und Richtpreis ---------- */
  $$('form[data-tagung]').forEach(function (box) {
    var D = DATEN.tagung || {}, el = box.elements, stand = null, art = 'ganz';
    var n = function (k) { return Math.max(0, parseInt(el[k].value, 10) || 0); };
    function rechne() {
      var ps = Math.max(1, n('pers')), tg = Math.max(1, n('tage')), preis = art === 'ganz' ? D.ganz : D.halb, zeilen = [], summe = ps * tg * preis;
      zeilen.push([(art === 'ganz' ? T.ganz : T.halb) + (SP === 'zh' ? '，' : ', ') + ps + ' × ' + tg + ' ' + T.tage(tg) + ' × CHF ' + chf(preis), summe]);
      var raum = (D.raeume || []).filter(function (r) { return r.max && r.max >= ps; }).sort(function (a, b) { return a.max - b.max; })[0];
      var satz = raum ? T.raum(esc(raum.name), raum.max) : T.keinRaum(ps);
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).innerHTML = satz;
      stand = { zeilen: zeilen, summe: summe, raum: raum ? raum.name : '', pers: ps, tage: tg, satz: satz.replace(/<[^>]+>/g, ''), art: art, preis: preis };
    }
    $$('[data-pauschale]', box).forEach(function (b) { b.addEventListener('click', function () { art = b.getAttribute('data-pauschale'); $$('[data-pauschale]', box).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); rechne(); }); });
    box.addEventListener('input', rechne); box.addEventListener('change', rechne);
    $('[data-offerte]', box).addEventListener('click', function () {
      /* Entwurf als PDF: ein Blatt im Stil der Drucksachen des Hauses (Robert 12.10.2026: «richtig schön designen in unserem Stil»).
         Kopf in Marine mit Tapete und Zeichen, die Angaben gross gesetzt, der passende Raum mit Foto, die Rechnung mit Goldlinien. Gestalt: dienste.css «.dn-tg». */
      var lang = { day: 'numeric', month: 'long', year: 'numeric' };
      var datum = el.datum.value ? new Date(el.datum.value + 'T12:00').toLocaleDateString(ORT, lang) : T.offen;
      var zR = $('[data-trraum]', box), zL = $('[data-trlage]', box), bild = $('.tr__f.ist img', box);
      var raumT = zR ? zR.textContent : stand.raum, lage = zL ? zL.textContent : stand.satz;
      var foto = bild ? (bild.getAttribute('data-src') || bild.currentSrc || bild.src) : '';   /* data-src: vom Lader noch gehaltenes Bild */
      var zahl = function (wert, wort, kl) { return '<div' + (kl ? ' class="' + kl + '"' : '') + '><b>' + wert + '</b><span>' + esc(wort) + '</span></div>'; };
      drucke('<article class="dn-tg">' +
        '<header class="dn-tg__kopf"><svg class="dn-tg__grund" viewBox="0 0 210 80" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="dn-tg-t" x="82" y="-8" width="46" height="52.76" patternUnits="userSpaceOnUse"><image href="' + BASIS + 'assets/img/tapete-dunkel.webp" width="46" height="52.76"/></pattern></defs>' +
        '<rect width="210" height="80" fill="#1b2033"/><rect width="210" height="80" fill="url(#dn-tg-t)"/><rect x="5" y="5" width="200" height="70" fill="none" stroke="#E6D2A2" stroke-opacity=".5" stroke-width=".2"/></svg>' +
        '<div class="dn-tg__in">' + EMBLEM('dn-tg__z') + '<p class="dn-tg__marke">Grand Beau-Rivage</p><p class="dn-tg__ort">Interlaken</p><i class="dn-tg__strich"></i><h1>' + T.entwurf.replace('<em>', '<br><em>') + '</h1></div></header>' +
        '<div class="dn-tg__zahlen">' + zahl(stand.pers, T.personen) + zahl(stand.tage, T.tageW) + zahl(esc(datum), T.datum, 'dn-tg__wort') + zahl('<small>CHF</small> ' + chf(stand.preis), stand.art === 'ganz' ? T.ganz : T.halb) + '</div>' +
        '<div class="dn-tg__raum' + (foto ? '' : ' dn-tg__raum--ohne') + '">' + (foto ? '<img class="dn-tg__foto" src="' + esc(foto) + '" alt="">' : '') +
        '<div><p class="dn-tg__kl">' + esc(T.raumW) + '</p><h2>' + esc(raumT) + '</h2><p class="dn-tg__lage">' + esc(lage) + '</p></div></div>' +
        '<div class="dn-tg__rechnung">' + stand.zeilen.map(function (z) { return '<p class="dn-tg__zeile"><span>' + esc(z[0]) + '</span><b>CHF ' + chf(z[1], true) + '</b></p>'; }).join('') +
        '<p class="dn-tg__summe"><span class="dn-tg__kl">' + esc(T.richt) + '</span><b><small>CHF</small> ' + chf(stand.summe, true) + '</b></p></div>' +
        '<p class="dn-tg__hin">' + T.druckSatz + '</p>' +
        '<footer class="dn-tg__fuss"><p>' + esc(ADRESSE) + '</p><p>' + esc(D.mail || '') + ' · ' + T.stand + ' ' + new Date().toLocaleDateString(ORT, lang) + '</p></footer></article>', true);
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [T.tagung, T.datum + DP + (el.datum.value || T.offen2), T.personen + DP + stand.pers, T.tageW + DP + stand.tage, T.raumW + DP + (stand.raum || T.offen2)].concat(stand.zeilen.map(function (x) { return x[0] + DP + 'CHF ' + chf(x[1], true); }));
      z.push(T.richtE + DP + 'CHF ' + chf(stand.summe, true)); if (el.name.value) z.push(T.name + DP + el.name.value); if (el.wunsch.value) z.push(T.wunsch + DP + el.wunsch.value);
      /* in den Eingang von La Réception statt ins Mailprogramm (16.10.2026), Baustein anfrage.js fragt nach Name und Kontakt */
      if (window.GBRAnfrage) GBRAnfrage.schicke({ art: 'tagung', betreff: T.mBetreff(stand.pers), name: el.name.value, personen: stand.pers, datum: el.datum.value || '',
        zeilen: z.filter(function (x) { return x.indexOf(DP) > 0; }).map(function (x) { var i = x.indexOf(DP); return [x.slice(0, i), x.slice(i + DP.length)]; }) });
    });
    rechne();
  });

  /* ---------- Vorschlag aus dem Haus: Jungfraujoch klar → hinauf; Interlaken klar → Harder Kulm; sonst → La Vallée SPA ---------- */
  var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && (t.regen == null || t.regen < 40); };
  var knA = function (t, h, linie, ext) { return '<a class="kn kn--klein' + (linie ? ' kn--linie' : '') + '" href="' + h + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '<i>' + PFEIL + '</i></a>'; };
  function vorschlag(box, titel, satz, knoepfe) {
    if (!box) return;
    box.innerHTML = '<span class="dn-vorschlag__z" aria-hidden="true">' + EMBLEM('') + '</span><div><h3 class="d3">' + titel[0] + ' <em>' + titel[1] + '</em></h3><p>' + satz + '</p><div class="knoepfe">' + knoepfe + '</div></div>';
    box.hidden = false;
  }
  function vorschlagFuer(box, tageJ, tageI) {
    var jk = (tageJ || []).filter(istKlar)[0], ik = (tageI || []).filter(istKlar)[0];
    var wann = function (t) { var d = new Date(t.datum + 'T12:00'); return t.datum === iso(new Date()) ? 'Heute' : 'Am ' + TAGE_L[d.getDay()]; };
    if (jk) vorschlag(box, [wann(jk) + ' klar', 'auf dem Jungfraujoch.'], 'Ein Tag für Top of Europe, 3’454 Meter. Die Bahn fährt ab Interlaken Ost, der Concierge reserviert Ihnen die Plätze.', knA('Jungfraujoch', 'region.html', false) + knA('Concierge fragen', (DATEN.mail ? 'mailto:' + DATEN.mail : '#') + '?subject=Jungfraujoch', true));
    else if (ik) vorschlag(box, [wann(ik) + ' klar', 'in Interlaken.'], 'Ein Tag für den Harder Kulm, die Talstation liegt in wenigen Gehminuten. Am Abend wartet Ihr Tisch an der Aare.', knA('Harder Kulm', 'region.html', false) + knA('Tisch reservieren', DATEN.tisch || '#', true, true));
    else vorschlag(box, ['Ein Tag', 'im La Vallée SPA.'], 'Draussen ist es nass. Schwimmbad, Sauna und Dampfbad sind täglich von 7.30 bis 21.00 Uhr geöffnet, Behandlungen von 9.00 bis 19.00 Uhr.', knA('La Vallée SPA', 'spa.html', false) + knA('Behandlungen', 'spa.html#rituale', true));
  }

  /* ---------- Heute in Interlaken (Startseite, Ausflüge) ---------- */
  $$('[data-wetter-heute]').forEach(function (feld) {
    if (!window.fetch) return;
    holeWetter().then(function (w) {
      var orte = ['interlaken', 'jungfraujoch'].map(function (k) { return w[k]; }).filter(Boolean);
      feld.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Jetzt und heute</span></div><div class="dn-rw__reihe">' + orte.map(function (o, i) {
        var t = o.tage[0];
        return '<div class="dn-rw__tag dn-rw__tag--ort" style="--i:' + i + '"><span class="dn-rw__wt">' + esc(o.name) + '</span><span class="dn-rw__dt">' + esc(wmo(o.jetzt.code)) + '</span><span class="dn-rw__ic">' + icon(o.jetzt.code, o.jetzt.tag) + '</span><b class="dn-rw__max"><span data-hoch="' + Math.round(o.jetzt.temp) + '">' + Math.round(o.jetzt.temp) + '</span>°</b><span class="dn-rw__min">heute ' + Math.round(t.min) + '° bis ' + Math.round(t.max) + '°</span><span class="dn-rw__nass"><i style="--h:' + Math.max(.04, (t.regen || 0) / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em></div>';
      }).join('') + '</div></div>';
      var wv = feld.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', orte.length);
      belebe(feld);
      vorschlagFuer($('[data-vorschlag]', feld.parentNode), w.jungfraujoch ? [w.jungfraujoch.tage[0]] : [], w.interlaken ? [w.interlaken.tage[0]] : []);
    }).catch(function () { feld.innerHTML = '<p class="dn-hinweis">Das Wetter ist gerade nicht abrufbar. Aktuelle Werte bei <a href="https://www.meteoschweiz.admin.ch/" target="_blank" rel="noopener">MeteoSchweiz</a>.</p>'; });
  });

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('form[data-anreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), shuttle = schalter(fo, 'data-shuttle', function () { neu(); }), park = schalter(fo, 'data-park', function () { neu(); }), tisch = schalter(fo, 'data-tisch', function () { neu(); });
    el.an.min = iso(new Date());
    ['an', 'ab'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(k) || '')) el[k].value = q.get(k); });
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var wf = $('[data-anreise-wetter]', fo), vs = $('[data-vorschlag]', fo), stand = { z: [], extras: 0 };
    /* Behandlung wählen: eigene Liste nach Gruppen */
    var wk = $('[data-wahl-knopf]', fo), wl = $('[data-wahl-liste]', fo), B = DATEN.behandlungen || [], gruppen = [];
    B.forEach(function (m, i) { var g = gruppen.filter(function (x) { return x.n === m.gruppe; })[0]; if (!g) gruppen.push(g = { n: m.gruppe, l: [] }); g.l.push(i); });
    if (wk && wl) {
      wl.innerHTML = '<div class="dn-wahl__gruppe"><button type="button" role="option" class="dn-wahl__z" data-i="-1"><b>' + T.keineB + '</b><i></i><em></em></button></div>' + gruppen.map(function (g) { return '<div class="dn-wahl__gruppe"><span class="mono">' + esc(g.n) + '</span>' + g.l.map(function (i) { var m = B[i]; return '<button type="button" role="option" class="dn-wahl__z" data-i="' + i + '"><b>' + esc(m.name) + '</b><i>' + esc(m.dauer) + '</i><em>CHF ' + chf(m.preis) + '</em></button>'; }).join('') + '</div>'; }).join('');
      var zeigeWahl = function () { var i = +el.behandlung.value, m = B[i]; wk.innerHTML = (m ? '<span><small>' + esc(m.gruppe) + '</small><b>' + esc(m.name) + '</b></span><i>' + esc(m.dauer) + '</i><em>CHF ' + chf(m.preis) + '</em>' : '<span><small>La Vallée SPA</small><b>' + T.keineB + '</b></span><i></i><em></em>') + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>'; $$('.dn-wahl__z', wl).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.i === el.behandlung.value)); }); };
      var auf = function (ja) { wl.hidden = !ja; wk.setAttribute('aria-expanded', String(ja)); };
      wk.addEventListener('click', function () { auf(wl.hidden); });
      wl.addEventListener('click', function (e) { var b = e.target.closest('.dn-wahl__z'); if (!b) return; el.behandlung.value = b.dataset.i; zeigeWahl(); auf(false); neu(); });
      document.addEventListener('click', function (e) { if (!wl.hidden && !e.target.closest('.dn-wahl')) auf(false); });
      zeigeWahl();
    }
    function wetter() {
      if (!wf) return;   // Wetter-Abschnitt entfernt (Robert 10.10.2026)
      if (!(el.an.value && el.ab.value && el.ab.value > el.an.value)) { wf.innerHTML = '<p class="dn-hinweis">Mit Anreise und Abreise steht hier das Wetter für Ihre Tage.</p>'; vs.hidden = true; var wv = wf.closest('[data-wv]'); if (wv) wv.removeAttribute('data-tage'); return; }
      reiseWetter(el.an.value, el.ab.value, wf);
      holeWetter().then(function (w) {
        var drin = function (o) { return (o ? o.tage : []).filter(function (t) { return t.datum >= el.an.value && t.datum <= el.ab.value; }); };
        var j = drin(w.jungfraujoch), i = drin(w.interlaken);
        if (j.length || i.length) vorschlagFuer(vs, j, i); else vs.hidden = true;
      }).catch(function () { vs.hidden = true; });
    }
    function neu() {
      var z = [], extras = 0, naechte = el.an.value && el.ab.value ? Math.max(0, tageZw(el.an.value, el.ab.value)) : 0;
      z.push(T.ankunft + DP + el.ankunft.value);
      $$('[data-nur-shuttle]', fo).forEach(function (t) { t.hidden = !shuttle(); });
      if (shuttle()) z.push(T.shuttle(el.zug.value || T.offen2));
      if (park()) { var tage = Math.max(1, naechte), p = DATEN.parkplatz || 0; z.push(T.park(tage, p, chf(tage * p))); extras += tage * p; }
      var b = B[+el.behandlung.value]; if (b) { z.push(T.spa(b, el.spatag.value ? new Date(el.spatag.value + 'T12:00').toLocaleDateString(ORT, { weekday: 'short', day: 'numeric', month: 'short' }) : '', el.spazeit.value, chf(b.preis))); extras += b.preis; }
      $$('[data-nur-tisch]', fo).forEach(function (t) { t.hidden = !tisch(); });
      if (tisch()) z.push(T.tisch(el.tischzeit.value || T.offen2, el.tischpers.value));
      if (el.anlass && el.anlass.value) z.push(T.anlass + DP + el.anlass.value);
      if (el.allergien && el.allergien.value) z.push(T.allergien + DP + el.allergien.value);
      if (el.wunsch.value) z.push(T.wunsch + DP + el.wunsch.value);
      $('[data-extras]', fo).textContent = chf(extras);
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = { z: z, extras: extras };
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', function (e) { neu(); if (e.target === el.an || e.target === el.ab) wetter(); }); neu(); wetter();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [T.name + DP + el.name.value, T.nr2 + DP + (el.nr.value || '-'), T.an + DP + el.an.value, T.ab + DP + el.ab.value].concat(stand.z, [T.extras + DP + 'CHF ' + chf(stand.extras, true)]);
      /* in den Eingang von La Réception statt ins Mailprogramm (16.10.2026); die Anreise kennt keinen Kontakt, das Fenster fragt danach */
      if (window.GBRAnfrage) GBRAnfrage.schicke({ art: 'aufenthalt', betreff: T.aBetreff, name: el.name.value, datum: el.an.value + (el.ab.value ? ' – ' + el.ab.value : ''),
        zeilen: z.slice(1).filter(function (x) { return !(stand.extras === 0 && x.indexOf(T.extras) === 0); }).map(function (x) { var i = x.indexOf(DP); return i > 0 ? [x.slice(0, i), x.slice(i + DP.length)] : ['', x]; }) });
    });
  });
})();
