/* Begleiter der Werkbank (Tasty Studios 12.10.2026): ein Knopf unten rechts auf der Werkbank und ihren Beigaben, dahinter ein Fenster,
   das dem Haus Fragen zum Entwurf beantwortet (Funktion /api/begleiter, Regeln und Wissen in api/begleiter.py).
   Eine Datei für alle Seiten: Aussehen und Verhalten stecken hier, im eigenen Schattenbaum, damit keine Seite hineinregiert.
   Das Gespräch wandert von Seite zu Seite mit (im Browser gemerkt, zwölf Stunden), beim Haus oder bei Tasty Studios wird nichts gespeichert.
   Der Knopf erscheint nur, wenn die Funktion antworten kann (GET /api/begleiter → bereit). Ohne Schlüssel oder Guthaben bleibt die Seite, wie sie war.
   Er erscheint nicht: eingebettet (Laptop und Handy der Werkbank), neben der Rezeption im Chat, im Druck und in unsichtbaren Prüf-Browsern
   (dort nur mit ?begleiter=1). Bewegt wird nur transform und opacity. Eingetragen wird das Tag von begleiter_seiten.py. */
(function () {
  if (window.top !== window.self) return;
  if (document.querySelector('script[src*="assets/js/gast.js"]')) return;
  var PROBE = /[?&]begleiter=1\b/.test(location.search);
  if (navigator.webdriver && !PROBE) return;
  if (document.getElementById('gbr-begleiter')) return;

  var tag = document.currentScript || document.querySelector('script[src*="assets/js/begleiter.js"]');
  var BASIS = ((tag && tag.src) || '').replace(/assets\/js\/begleiter\.js.*$/, '');
  if (!BASIS) return;
  var SPRACHEN = ['de', 'en', 'fr', 'zh', 'ko', 'ar'];
  var SP = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  if (SPRACHEN.indexOf(SP) < 0) SP = 'en';
  var MAIL = 'robert@tasty-studios.de';
  var V = ((tag && tag.src) || '').split('v=')[1] || '';
  /* Zeichen von Tasty Studios (geprägt, weisser Ring auf Blau) und die Bilder der vier Startkarten. Pfade ausgeschrieben, sonst nimmt online.py sie nicht mit */
  var LOGO = BASIS + 'assets/img/begleiter-logo.webp?v=' + V;
  var BILDER = [BASIS + 'assets/img/haus-vorfahrt-s.webp', BASIS + 'assets/img/begleiter-instrumente.webp?v=' + V, BASIS + 'assets/img/rest-terrasse-aare-s.webp', BASIS + 'assets/img/haus-fluss-berge-s.webp'];
  var T = {
    de: { knopf: 'Fragen zum Entwurf', rolle: 'Tasty Studios', neu: 'Neues Gespräch', zu: 'Schliessen', frage: 'Ihre Frage', feld: 'Ihre Frage zum Entwurf', senden: 'Senden',
      fuss: 'KI-Assistent von Tasty Studios. Verbindlich ist, was Robert Reff Ihnen schreibt.', start1: 'Was möchten Sie<br>wissen?', start2: 'Fragen zum Entwurf, zu den Instrumenten und dazu, wie es weitergeht.',
      mail: 'Robert schreiben', keine: 'Ich bin gerade nicht erreichbar. Robert antwortet Ihnen gern direkt: ' + MAIL, hallo: 'Guten Tag. Was möchten Sie zum Entwurf wissen?',
      karten: [['Der Überblick', 'Was Ihr Haus bekommt', 'Was hat Robert für unser Haus alles gebaut?'], ['Selbst pflegen', 'Die Instrumente für Ihr Team', 'Wie pflegt unser Team die Website und die Karten selbst?'],
        ['Buchung und Tisch', 'Was bleibt, wie es ist', 'Was ändert sich an SimpleBooking, aleno und e-guma?'], ['Wie es weitergeht', 'Preis und nächster Schritt', 'Was kostet das und wie geht es weiter?']] },
    en: { knopf: 'Questions about the draft', rolle: 'Tasty Studios', neu: 'New conversation', zu: 'Close', frage: 'Your question', feld: 'Your question about the draft', senden: 'Send',
      fuss: 'AI assistant of Tasty Studios. What Robert Reff writes to you is binding.', start1: 'What would you<br>like to know?', start2: 'Questions about the draft, the instruments and what happens next.',
      mail: 'Write to Robert', keine: 'I am not available right now. Robert is happy to answer directly: ' + MAIL, hallo: 'Hello. What would you like to know about the draft?',
      karten: [['The overview', 'What your hotel receives', 'What has Robert built for our hotel?'], ['Maintaining it yourself', 'The instruments for your team', 'How does our team maintain the website and the menus itself?'],
        ['Booking and table', 'What stays as it is', 'What changes with SimpleBooking, aleno and e-guma?'], ['What happens next', 'Price and next step', 'What does it cost and what happens next?']] },
    fr: { knopf: 'Questions sur le projet', rolle: 'Tasty Studios', neu: 'Nouvelle conversation', zu: 'Fermer', frage: 'Votre question', feld: 'Votre question sur le projet', senden: 'Envoyer',
      fuss: 'Assistant IA de Tasty Studios. Seul ce que Robert Reff vous écrit fait foi.', start1: 'Que souhaitez-vous<br>savoir ?', start2: 'Questions sur le projet, les instruments et la suite.',
      mail: 'Écrire à Robert', keine: 'Je ne suis pas disponible pour le moment. Robert vous répond volontiers directement : ' + MAIL, hallo: 'Bonjour. Que souhaitez-vous savoir sur le projet ?',
      karten: [['Vue d’ensemble', 'Ce que reçoit votre maison', 'Qu’est-ce que Robert a construit pour notre maison ?'], ['Gérer soi-même', 'Les instruments pour votre équipe', 'Comment notre équipe met-elle à jour le site et les cartes elle-même ?'],
        ['Réservation et table', 'Ce qui ne change pas', 'Qu’est-ce qui change pour SimpleBooking, aleno et e-guma ?'], ['La suite', 'Prix et prochaine étape', 'Combien cela coûte-t-il et quelle est la suite ?']] },
    zh: { knopf: '关于方案的问题', rolle: 'Tasty Studios', neu: '新对话', zu: '关闭', frage: '您的问题', feld: '关于方案，请提问', senden: '发送',
      fuss: 'Tasty Studios 的 AI 助手。以 Robert Reff 给您的书面答复为准。', start1: '您想了解<br>什么？', start2: '关于方案、各项工具以及后续步骤的问题。',
      mail: '写信给 Robert', keine: '我暂时无法回答。Robert 很乐意直接答复您：' + MAIL, hallo: '您好。关于方案，您想了解什么？',
      karten: [['总览', '贵酒店将获得什么', 'Robert 为我们酒店都做了什么？'], ['自行维护', '为团队准备的工具', '我们的团队如何自己维护网站和菜单？'],
        ['订房与订位', '保持不变的部分', 'SimpleBooking、aleno 和 e-guma 会有什么变化？'], ['后续步骤', '价格与下一步', '费用是多少，接下来怎么进行？']] },
    ko: { knopf: '시안에 대한 질문', rolle: 'Tasty Studios', neu: '새 대화', zu: '닫기', frage: '질문', feld: '시안에 대해 물어보세요', senden: '보내기',
      fuss: 'Tasty Studios의 AI 어시스턴트입니다. Robert Reff가 직접 드리는 답변이 기준입니다.', start1: '무엇이<br>궁금하신가요?', start2: '시안, 도구, 그리고 앞으로의 진행에 대해 물어보세요.',
      mail: 'Robert에게 메일 쓰기', keine: '지금은 답변드릴 수 없습니다. Robert가 직접 답변드립니다: ' + MAIL, hallo: '안녕하세요. 시안에 대해 무엇이 궁금하신가요?',
      karten: [['전체 보기', '호텔이 받게 되는 것', 'Robert가 우리 호텔을 위해 무엇을 만들었나요?'], ['직접 관리', '팀을 위한 도구', '우리 팀이 웹사이트와 메뉴를 직접 어떻게 관리하나요?'],
        ['예약과 테이블', '그대로 유지되는 것', 'SimpleBooking, aleno, e-guma는 무엇이 달라지나요?'], ['다음 단계', '가격과 진행', '비용은 얼마이고 앞으로 어떻게 진행되나요?']] },
    ar: { knopf: 'أسئلة حول المشروع', rolle: 'Tasty Studios', neu: 'محادثة جديدة', zu: 'إغلاق', frage: 'سؤالكم', feld: 'سؤالكم حول المشروع', senden: 'إرسال',
      fuss: 'مساعد بالذكاء الاصطناعي من Tasty Studios. المرجع الملزم هو ما يكتبه لكم Robert Reff.', start1: 'ماذا تودّون<br>أن تعرفوا؟', start2: 'أسئلة حول المشروع والأدوات والخطوات القادمة.',
      mail: 'اكتبوا إلى Robert', keine: 'لا أستطيع الإجابة الآن. يسعد Robert أن يجيبكم مباشرة: ' + MAIL, hallo: 'مرحباً. ماذا تودّون أن تعرفوا عن المشروع؟',
      karten: [['نظرة عامة', 'ما يحصل عليه فندقكم', 'ماذا أنجز Robert لفندقنا؟'], ['الإدارة الذاتية', 'أدوات لفريقكم', 'كيف يحدّث فريقنا الموقع وقوائم الطعام بنفسه؟'],
        ['الحجز والطاولة', 'ما يبقى كما هو', 'ما الذي يتغيّر في SimpleBooking وaleno وe-guma؟'], ['الخطوات القادمة', 'السعر والخطوة التالية', 'كم التكلفة وما الخطوات القادمة؟']] }
  }[SP];

  /* ---- Wo die Person gerade ist (für «Was ist das hier?») ---- */
  var hier = location.href.split(/[?#]/)[0];
  var pfad = hier.indexOf(BASIS) === 0 ? hier.slice(BASIS.length) : '';
  var SEITE = /^werkbank\/(?:[a-z]{2}\/)?geprueft\//.test(pfad) ? 'geprueft' : /^werkbank\/anleitung\//.test(pfad) ? 'anleitung' : (pfad.split('/')[0] || '');
  var IN_WERKBANK = /^werkbank\/(?:(?:en|fr|zh|ko|ar)\/)?(?:index\.html)?$/.test(pfad);
  function abschnitt() {
    if (!IN_WERKBANK) return '';
    var mitte = innerHeight / 2, alle = document.querySelectorAll('section[id]'), id = '';
    for (var i = 0; i < alle.length; i++) { var r = alle[i].getBoundingClientRect(); if (r.top <= mitte && r.bottom > mitte && /^[a-z0-9-]+$/.test(alle[i].id)) id = alle[i].id; }
    return id;
  }

  /* ---- Gemerktes Gespräch: wandert von Seite zu Seite mit ---- */
  var SCHL = 'gbr-begleiter', DAUER = 12 * 3600e3;
  function lies() {
    try { var d = JSON.parse(localStorage.getItem(SCHL) || 'null'); return d && d.v === 1 && Date.now() - d.zeit < DAUER && Array.isArray(d.lauf) ? d : null; } catch (e) { return null; }
  }
  function merke() { try { localStorage.setItem(SCHL, JSON.stringify({ v: 1, zeit: Date.now(), lauf: stand.slice(-40), offen: offen })); } catch (e) {} }
  var alt = lies();
  var stand = alt ? alt.lauf : [];   // [{w:'ich'|'er', t:'…', wege:[…], mail:{…}}]

  /* ---- Bereit? Erst fragen, wenn die Seite ruht; ein Ja gilt zehn Minuten ---- */
  function bereit(dann) {
    try { var b = JSON.parse(sessionStorage.getItem(SCHL + '-da') || 'null'); if (b && Date.now() - b < 600e3) return dann(); } catch (e) {}
    fetch(BASIS + 'api/begleiter', { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (a) { if (a && a.bereit) { try { sessionStorage.setItem(SCHL + '-da', String(Date.now())); } catch (e) {} dann(); } })
      .catch(function () {});
  }
  function ruhig(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2500 }); else setTimeout(fn, 900); }
  if (document.readyState === 'complete') ruhig(function () { bereit(bau); }); else addEventListener('load', function () { ruhig(function () { bereit(bau); }); });

  var offen = false, bau_fertig = false;

  function bau() {
    if (bau_fertig) return; bau_fertig = true;
    /* Schriften des Hauses, falls die Seite sie nicht selbst lädt (Mails, Feed, Markenbuch) */
    var schrift = document.createElement('style');
    schrift.textContent =
      '@font-face{font-family:"BG Serif";font-style:normal;font-weight:400 700;font-display:swap;src:local("Cormorant Garamond Medium"),url("' + BASIS + 'assets/fonts/cormorant-garamond-500-latin.woff2") format("woff2")}' +
      '@font-face{font-family:"BG Sans";font-style:normal;font-weight:400 600;font-display:swap;src:local("Instrument Sans"),url("' + BASIS + 'assets/fonts/InstrumentSans-normal-400_600.woff2") format("woff2")}' +
      '@font-face{font-family:"BG Mono";font-style:normal;font-weight:400;font-display:swap;src:local("DM Mono"),url("' + BASIS + 'assets/fonts/DMMono-normal-400.woff2") format("woff2")}' +
      '#gbr-begleiter{all:initial!important;position:fixed!important;z-index:72!important;right:0!important;bottom:0!important;width:0!important;height:0!important;display:block!important}' +
      '@media print{#gbr-begleiter{display:none!important}}';
    document.head.appendChild(schrift);

    var wirt = document.createElement('div');
    wirt.id = 'gbr-begleiter'; wirt.setAttribute('lang', SP);
    var baum = wirt.attachShadow({ mode: 'open' });
    var KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
    var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
    var HOCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4"/></svg>';
    var NEU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>';
    var BLASE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7.2h-6L4.6 13v-2.3H2.5z"/></svg>';
    var BRIEF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12v8.5H2zM2.3 4.3 8 9l5.7-4.7"/></svg>';
    baum.innerHTML =
      '<style>' +
      ':host{--gold:#d2bf98;--navy:#1b2033;--papier:#11141f;--weiss:#1b2033;--tinte:#efe4cf;--taupe:#a8977e;--hell:#fdf9f1;--linie:rgba(210,191,152,.2);' +
      '--e1:cubic-bezier(.16,1,.3,1);--e2:cubic-bezier(.32,.72,0,1);--rand:clamp(20px,4.6vw,76px);--serif:"Cormorant Garamond","BG Serif",Georgia,"Times New Roman","Songti SC","AppleMyungjo","Geeza Pro",serif;' +
      '--sans:"Instrument Sans","BG Sans",system-ui,-apple-system,"Segoe UI","PingFang SC","Apple SD Gothic Neo","Geeza Pro",sans-serif;--mono:"DM Mono","BG Mono",ui-monospace,"SF Mono",Menlo,monospace;direction:ltr}' +
      '*{box-sizing:border-box;margin:0;padding:0}button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
      /* Der Knopf: Geschwister des «Zur Werkbank»-Knopfs, Knauf rechts */
      '.knopf{position:fixed;z-index:3;right:clamp(14px,2vw,32px);bottom:clamp(14px,2vw,32px);overflow:hidden;isolation:isolate;display:inline-flex;align-items:center;gap:11px;height:44px;padding:0 5px 0 20px;border-radius:999px;' +
      'font:400 11.5px/1 var(--mono);letter-spacing:.13em;text-transform:uppercase;white-space:nowrap;color:#121c3c;background:linear-gradient(180deg,#fdf9f1 0%,#f1e6d1 46%,#dccaa6 100%);' +
      'box-shadow:inset 0 1px 0 #fff,inset 0 -3px 0 rgba(130,108,53,.32),inset 0 0 0 1px rgba(176,147,79,.62),0 0 0 1px rgba(9,17,39,.28),0 12px 22px -12px rgba(9,17,39,.6);' +
      'opacity:0;transform:translateY(18px);transition:transform .55s var(--e2),opacity .4s ease}' +
      '.da .knopf{opacity:1;transform:none}' +
      '.knopf::after{content:"";position:absolute;z-index:-1;top:-20%;bottom:-20%;left:0;width:38%;background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,.85) 50%,transparent 100%);transform:translateX(-180%) skewX(-18deg);transition:transform 0s}' +
      '.knopf i{position:relative;flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#34478a,#0a1230);color:#f7efdd;' +
      'box-shadow:inset 0 1px 0 rgba(190,206,255,.4),inset 0 -2px 0 rgba(0,0,0,.4),0 0 0 1px rgba(230,210,162,.45);transition:transform .6s var(--e2)}' +
      '.knopf i svg{grid-area:1/1;width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .5s var(--e2),opacity .3s}' +
      '.knopf i svg+svg{opacity:0;transform:rotate(-90deg) scale(.6)}' +
      '.auf .knopf i svg:first-child{opacity:0;transform:rotate(90deg) scale(.6)}.auf .knopf i svg+svg{opacity:1;transform:none}' +
      '.knopf span{display:block;padding-top:1px}' +
      ':host([lang="zh"]) .knopf,:host([lang="ko"]) .knopf,:host([lang="ar"]) .knopf{letter-spacing:.04em;font-size:13px;text-transform:none}' +
      ':host([lang="ar"]) .knopf{font-family:var(--sans);letter-spacing:0;font-weight:500;font-size:14px}' +
      '@media (hover:hover){.da .knopf:hover{transform:translateY(-2px)}.knopf:hover i{transform:scale(1.05)}.knopf:hover::after{transform:translateX(360%) skewX(-18deg);transition:transform 1s var(--e1)}}' +
      '.da .knopf:active{transform:translateY(1px) scale(.985)}' +
      '.knopf:focus-visible,.fen button:focus-visible,.fen a:focus-visible{outline:2px solid #E6D2A2;outline-offset:3px}' +
      /* Abdunklung und Fenster: wie die Rezeption im Chat, feste Flächen ohne Weichzeichner */
      '.dunkel{position:fixed;z-index:1;inset:0;background:#0d1019;opacity:0;pointer-events:none;transition:opacity .45s var(--e1)}' +
      '.auf .dunkel{opacity:.55;pointer-events:auto}' +
      '.auf.frei .dunkel{opacity:0;pointer-events:none}' +   /* nach einem Weg-Knopf und nach einem Seitenwechsel: die Seite bleibt hell, das Fenster begleitet */
      '.fen{position:fixed;z-index:2;right:clamp(14px,2vw,32px);bottom:calc(clamp(14px,2vw,32px) + 60px);width:min(420px,calc(100vw - 28px));height:min(700px,calc(100vh - 110px));height:min(700px,calc(100svh - 110px));' +
      'display:flex;flex-direction:column;overflow:hidden;border-radius:26px;background:var(--papier);color:var(--tinte);font:500 15px/1.6 var(--sans);' +
      'box-shadow:0 0 0 1px rgba(210,191,152,.35),0 40px 80px -24px rgba(0,0,0,.75),0 12px 24px -12px rgba(0,0,0,.5);' +
      'opacity:0;transform:translateY(14px) scale(.97);transform-origin:100% 100%;pointer-events:none;visibility:hidden;transition:opacity .3s,transform .55s var(--e1),visibility 0s .55s}' +
      '.auf .fen{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .25s,transform .55s var(--e1),visibility 0s}' +
      '.kopf{display:flex;align-items:center;gap:12px;padding:16px 12px 14px 20px;border-bottom:1px solid var(--linie);flex:none}' +
      '.zeichen{flex:none;width:46px;height:46px;border-radius:50%;overflow:hidden;background:#232a45;box-shadow:0 0 0 1px rgba(210,191,152,.35),0 6px 14px -8px rgba(0,0,0,.8)}' +
      '.zeichen img{display:block;width:100%;height:100%;object-fit:cover}' +
      '.kopf div{flex:1;min-width:0;line-height:1.3}' +
      '.kopf b{display:block;font-family:var(--serif);font-weight:500;font-size:19px;color:var(--hell)}' +
      '.kopf div span{font-size:13.5px;color:rgba(239,228,207,.88)}' +
      '.rund{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#b9bcc4;transition:background .3s}' +
      '.rund:hover{background:rgba(255,255,255,.07)}' +
      '.rund svg{width:15px;height:15px;stroke:currentColor;stroke-width:1.3;fill:none;stroke-linecap:round;stroke-linejoin:round}' +
      '.lauf{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:22px 22px 10px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:rgba(210,191,152,.3) transparent}' +
      '.b{max-width:100%;font-size:15px;line-height:1.62}' +
      '.b--ich{align-self:flex-end;max-width:82%;padding:11px 17px;border-radius:22px;line-height:1.45;background:#3f4767;color:var(--hell)}' +
      '.b--er{align-self:stretch}' +
      '.b--denkt{display:flex;gap:5px;padding:6px 0}' +
      '.b--denkt i{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:denkt 1s infinite}' +
      '.b--denkt i:nth-child(2){animation-delay:.15s}.b--denkt i:nth-child(3){animation-delay:.3s}' +
      '@keyframes denkt{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}' +
      '.b ul{list-style:none;margin:10px 0 2px;display:grid;gap:7px}' +
      '.b li{position:relative;padding:8px 12px 8px 28px;border-radius:12px;background:rgba(255,255,255,.045);line-height:1.45}' +
      '.b li::before{content:"";position:absolute;left:12px;top:1.05em;width:6px;height:6px;border-radius:50%;background:var(--gold)}' +
      ':host([lang="ar"]) .b li{padding:8px 28px 8px 12px}:host([lang="ar"]) .b li::before{left:auto;right:12px}' +
      '.b li b{font-weight:600;color:var(--hell)}' +
      '.b p+p,.b ul+p,.b p+ul{margin-top:10px}' +
      /* Wege und Mail unter einer Antwort */
      '.wege{display:flex;flex-direction:column;gap:7px;margin-top:12px}' +
      '.wege a{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-radius:14px;font-size:14.5px;line-height:1.3;color:var(--tinte);text-decoration:none;' +
      'box-shadow:inset 0 0 0 1px rgba(210,191,152,.32);transition:background .3s}' +
      '.wege a:hover{background:var(--weiss)}' +
      '.wege a.post{background:var(--gold);color:#151927;box-shadow:none;font-weight:600}.wege a.post:hover{background:#dccaa6}' +
      '.wege svg{flex:none;width:14px;height:14px;stroke:var(--gold);stroke-width:1.3;fill:none;stroke-linecap:round;stroke-linejoin:round}.wege a.post svg{stroke:#151927}' +
      /* Start im leeren Fenster */
      '.start{margin:auto 0;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 0 4px}' +
      '.start h3{font-family:var(--serif);font-weight:500;font-size:26px;line-height:1.14;color:var(--hell);margin-bottom:6px}' +
      '.start p{font-size:13.5px;line-height:1.45;color:rgba(239,228,207,.82);margin-bottom:16px;max-width:34ch}' +
      '.karten{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}' +
      '.karten button{position:relative;display:flex;flex-direction:column;text-align:center;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.035);transition:transform .5s var(--e2)}' +
      '.karten button::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px var(--linie);pointer-events:none;transition:box-shadow .35s}' +
      '@media (hover:hover){.karten button:hover{transform:translateY(-2px)}.karten button:hover::after{box-shadow:inset 0 0 0 1px rgba(210,191,152,.6)}}' +
      '.k-bild{display:block;width:100%;aspect-ratio:16/9;overflow:hidden;background:#232a45}' +
      '.k-bild img{display:block;width:100%;height:100%;object-fit:cover}' +
      '.k-text{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:10px 8px 12px;flex:1}' +
      '.karten b{font-family:var(--serif);font-weight:500;font-size:18.5px;line-height:1.2;color:var(--hell)}' +
      '.karten .k-text span{font-size:13px;line-height:1.35;color:rgba(239,228,207,.9)}' +
      /* Eingabe */
      '.feld{flex:none;display:flex;align-items:flex-end;gap:8px;margin:8px 14px 0;padding:12px 10px 10px 20px;border-radius:26px;background:var(--weiss);box-shadow:0 0 0 1px rgba(210,191,152,.28)}' +
      '.feld label{flex:1;min-width:0}' +
      '.feld textarea{display:block;width:100%;height:calc(1.4em + 10px);max-height:132px;border:0;background:none;font:500 16px/1.4 var(--sans);color:var(--hell);padding:0 0 10px;outline:none;resize:none;overflow-y:auto;scrollbar-width:none}' +
      '.feld textarea::-webkit-scrollbar{display:none}.feld textarea::placeholder{color:#8692ab}' +
      '.send{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#11141f;transition:transform .4s var(--e2)}' +
      '.send:hover{transform:translateY(-1px)}' +
      '.send svg{width:16px;height:16px;stroke:currentColor;stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round}' +
      '.fuss{flex:none;padding:9px 18px 13px;text-align:center;font-size:12.5px;line-height:1.5;color:#b7bfd0}' +
      ':host([lang="ar"]) .fen{direction:rtl}:host([lang="ar"]) .b--ich{align-self:flex-start}:host([lang="ar"]) .wege svg{transform:scaleX(-1)}' +
      '@media (max-width:560px){.knopf{height:40px;gap:9px;padding:0 4px 0 16px;font-size:10.5px}.knopf i{width:32px;height:32px}' +
      ':host([lang="zh"]) .knopf,:host([lang="ko"]) .knopf,:host([lang="ar"]) .knopf{font-size:12px}' +
      '.fen{right:8px;left:8px;width:auto;bottom:68px;top:max(14px,env(safe-area-inset-top));height:auto}.kopf b{font-size:17px}.kopf{padding-left:16px}.karten b{font-size:17px}.karten .k-text span{font-size:12.5px}}' +
      '@media (prefers-reduced-motion:reduce){.knopf,.knopf i,.knopf::after,.fen,.dunkel{transition:none!important}.b--denkt i{animation:none}}' +
      '</style>' +
      '<div class="dunkel" aria-hidden="true"></div>' +
      '<section class="fen" role="dialog" aria-label="' + T.knopf + '">' +
      '<header class="kopf"><span class="zeichen" aria-hidden="true"><img src="' + LOGO + '" alt="" width="240" height="240" decoding="async"></span><div><b>' + T.knopf + '</b><span>' + T.rolle + '</span></div>' +
      '<button type="button" class="rund neu" aria-label="' + T.neu + '" title="' + T.neu + '">' + NEU + '</button>' +
      '<button type="button" class="rund zu" aria-label="' + T.zu + '">' + KREUZ + '</button></header>' +
      '<div class="lauf" aria-live="polite"></div>' +
      '<form class="feld"><label><span class="sr">' + T.frage + '</span><textarea rows="1" autocomplete="off" enterkeyhint="send" maxlength="700" placeholder="' + T.feld + '"></textarea></label>' +
      '<button type="submit" class="send" aria-label="' + T.senden + '">' + HOCH + '</button></form>' +
      '<p class="fuss">' + T.fuss + '</p></section>' +
      '<button type="button" class="knopf" aria-expanded="false" aria-label="' + T.knopf + '"><span>' + T.knopf + '</span><i aria-hidden="true">' + BLASE + KREUZ + '</i></button>';
    document.body.appendChild(wirt);

    var huelle = document.createElement('div');   // trägt die Zustände .da und .auf für alles im Schattenbaum
    while (baum.childNodes.length > 1) huelle.appendChild(baum.childNodes[1]);
    baum.appendChild(huelle);
    var knopf = huelle.querySelector('.knopf'), fen = huelle.querySelector('.fen'), lauf = huelle.querySelector('.lauf'),
      feld = huelle.querySelector('textarea'), form = huelle.querySelector('form'), dunkel = huelle.querySelector('.dunkel');
    var beschaeftigt = false, begruesst = false;
    void knopf.offsetWidth; setTimeout(function () { huelle.classList.add('da'); }, 60);
    var vorab = false;
    function vorladen() { if (vorab) return; vorab = true; [LOGO].concat(BILDER).forEach(function (src) { var i = new Image(); i.decoding = 'async'; i.src = src; if (i.decode) i.decode().catch(function () {}); }); }
    setTimeout(vorladen, 1500); knopf.addEventListener('pointerenter', vorladen); knopf.addEventListener('focus', vorladen);   // kein rAF: in einem Reiter im Hintergrund käme der Knopf sonst nie

    function auf(an, frei) {
      offen = an;
      huelle.classList.toggle('auf', an);
      huelle.classList.toggle('frei', !!frei);
      knopf.setAttribute('aria-expanded', String(an));
      if (an) {
        if (!begruesst) { begruesst = true; if (stand.length) zeichne(); else start(); }
        if (stand.length) runter(); else lauf.scrollTop = 0;
        if (window.matchMedia('(hover:hover)').matches) setTimeout(function () { feld.focus({ preventScroll: true }); }, 350);
      }
      merke();
    }
    knopf.addEventListener('click', function () { auf(!offen, false); });
    huelle.querySelector('.zu').addEventListener('click', function () { auf(false); knopf.focus(); });
    dunkel.addEventListener('click', function () { auf(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) auf(false); });

    function runter() { lauf.scrollTop = lauf.scrollHeight; }
    function blase(wer, text) {
      var b = document.createElement('div');
      b.className = 'b b--' + wer;
      b.setAttribute('dir', 'auto');
      if (text) b.textContent = text;
      lauf.appendChild(b); runter();
      return b;
    }
    /* Antwort in Absätze und Listen: jede Zeile mit «- » wird ein Punkt, «Stichwort: Angabe» hebt das Stichwort hervor */
    function absaetze(b, text) {
      var ul = null, p = null;
      text.replace(/\*\*/g, '').split('\n').forEach(function (z) {
        z = z.trim();
        if (!z) { ul = null; p = null; return; }
        var punkt = /^[-•*]\s+/.test(z), inhalt = z.replace(/^[-•*]\s+/, ''), el;
        if (punkt) {
          if (!ul) { ul = document.createElement('ul'); b.appendChild(ul); }
          p = null; el = document.createElement('li'); ul.appendChild(el);
        } else {
          ul = null;
          if (!p) { p = document.createElement('p'); b.appendChild(p); } else p.appendChild(document.createTextNode(' '));
          el = p;
        }
        var m = punkt && inhalt.match(/^([^:：]{2,34})[:：]\s*(.+)$/);
        if (m) { var st = document.createElement('b'); st.textContent = m[1]; el.appendChild(st); el.appendChild(document.createTextNode(' ' + m[2])); }
        else el.appendChild(document.createTextNode(inhalt));
      });
    }
    function tippe(b, text, fertig) {
      var w = text.split(' '), i = 0;
      (function weiter() {
        i = Math.min(w.length, i + 2);
        b.innerHTML = ''; absaetze(b, w.slice(0, i).join(' ')); runter();
        if (i < w.length) return setTimeout(weiter, 22 + Math.random() * 24);
        fertig && fertig();
      })();
    }
    function denkt() { var b = blase('er'); b.classList.add('b--denkt'); b.innerHTML = '<i></i><i></i><i></i>'; return b; }

    /* Wege (Knöpfe zu einer Stelle der Werkbank) und der vorbereitete Brief an Robert */
    function adresse(pfad) {
      var u = BASIS + pfad.replace('{sp}', SP === 'de' ? '' : SP + '/');
      if (IN_WERKBANK && !/^werkbank\/[^#]*#/.test(pfad)) {       // hinaus aus der Werkbank: Herkunft mitgeben, damit dort «Zur Werkbank» steht
        var ab = abschnitt();
        u += (u.indexOf('?') < 0 ? '?' : '&') + 'wb=' + SP + (ab ? '.' + ab : '');
      }
      return u;
    }
    function anhang(b, wege, mail) {
      if (!(wege && wege.length) && !mail) return;
      var w = document.createElement('div'); w.className = 'wege';
      (wege || []).forEach(function (x) {
        if (!x || !x.pfad || !/^[a-z0-9\-\/{}#._]+$/i.test(x.pfad)) return;
        var a = document.createElement('a');
        a.href = adresse(x.pfad);
        a.innerHTML = '<span></span>' + PFEIL; a.firstChild.textContent = x.titel || x.pfad;
        a.addEventListener('click', function () { if (innerWidth <= 700) { offen = false; huelle.classList.remove('auf'); knopf.setAttribute('aria-expanded', 'false'); } else huelle.classList.add('frei'); merke(); });
        w.appendChild(a);
      });
      if (mail) {
        var m = document.createElement('a'); m.className = 'post';
        m.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(mail.betreff || 'Grand Beau-Rivage · Werkbank') + (mail.text ? '&body=' + encodeURIComponent(mail.text + '\n\n') : '');
        m.innerHTML = '<span></span>' + BRIEF; m.firstChild.textContent = T.mail;
        w.appendChild(m);
      }
      if (w.childNodes.length) { b.appendChild(w); runter(); }
    }

    function start() {
      var st = document.createElement('div'); st.className = 'start';
      st.innerHTML = '<h3>' + T.start1.replace('<br>', ' ') + '</h3><p>' + T.start2 + '</p><div class="karten"></div>';
      T.karten.forEach(function (k, i) {
        var b = document.createElement('button'); b.type = 'button';
        b.innerHTML = '<span class="k-bild"><img src="' + BILDER[i] + '" alt="" decoding="async"></span><span class="k-text"><b></b><span></span></span>';
        b.querySelector('b').textContent = k[0]; b.querySelector('.k-text span').textContent = k[1]; b.setAttribute('aria-label', k[2]);
        b.addEventListener('click', function () { frage(k[2]); });
        st.lastChild.appendChild(b);
      });
      lauf.appendChild(st);
    }
    function zeichne() {   // das gemerkte Gespräch, ohne Tippen
      lauf.innerHTML = '';
      stand.forEach(function (e) {
        if (e.w === 'ich') return blase('ich', e.t);
        var b = blase('er'); absaetze(b, e.t); anhang(b, e.wege, e.mail);
      });
    }

    function frage(f) {
      f = (f || '').trim();
      if (beschaeftigt || !f) return;
      var st = lauf.querySelector('.start'); if (st) st.remove();
      blase('ich', f);
      stand.push({ w: 'ich', t: f }); merke();
      beschaeftigt = true;
      var b = denkt();
      function zeige(text, wege, mail) {
        b.classList.remove('b--denkt'); b.innerHTML = '';
        stand.push({ w: 'er', t: text, wege: wege || [], mail: mail || null }); merke();
        tippe(b, text, function () { beschaeftigt = false; anhang(b, wege, mail); });
      }
      if (/^\s*(hallo|hi|hey|grüezi|gruezi|guten (tag|morgen|abend)|hello|bonjour)[\s!.]*$/i.test(f)) return setTimeout(function () { zeige(T.hallo); }, 450);
      var verlauf = stand.slice(-14).map(function (e) { return { role: e.w === 'ich' ? 'user' : 'assistant', content: e.t }; });
      fetch(BASIS + 'api/begleiter', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: verlauf, sprache: SP, ort: { seite: SEITE, abschnitt: abschnitt() } }) })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (a) { if (!a || !a.text) throw 0; zeige(a.text, a.wege, a.mail); })
        .catch(function () { try { sessionStorage.removeItem(SCHL + '-da'); } catch (e) {} zeige(T.keine, [], { betreff: '', text: f }); });
    }
    huelle.querySelector('.neu').addEventListener('click', function () {
      if (beschaeftigt) return;
      stand = []; lauf.innerHTML = ''; start(); merke(); feld.focus({ preventScroll: true });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); var f = feld.value; feld.value = ''; hoehe(); frage(f); });
    function hoehe() { feld.style.height = 'auto'; if (feld.value) feld.style.height = Math.min(feld.scrollHeight, 132) + 'px'; else feld.style.height = ''; }
    feld.addEventListener('input', hoehe);
    feld.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
    /* Tastatur und Mausrad bleiben im Fenster, solange es offen ist */
    fen.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') auf(false); });

    /* War das Fenster auf der letzten Seite offen, steht es am Rechner auch hier offen: das Gespräch läuft weiter */
    if (alt && alt.offen && stand.length && innerWidth > 700) auf(true, true);
  }
})();
