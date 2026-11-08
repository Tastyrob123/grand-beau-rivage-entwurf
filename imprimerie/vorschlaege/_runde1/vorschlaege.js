/* Dreissig Startseiten für das Drucksachen-Studio. Jede Ansicht ist ein Stück HTML in 1440 × 900, gebaut aus den Bausteinen des Hauses. */
(function(){
const F = k => `../haeuser/gbr/mini/${k}.webp`;
const Z = (s, farbe='', st='') => `<svg class="z" viewBox="0 0 1464 1452" style="width:${s}px;height:${s}px;${farbe?'color:'+farbe+';':''}${st}"><use href="#zch"/></svg>`;
const PF = '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const FUNKE = '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.2 2.2M15.3 15.3l2.2 2.2M6.5 17.5l2.2-2.2M15.3 8.7l2.2-2.2"/></svg>';
const LUPE = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>';
const KN = (t, v='', o={}) => `<span class="kn ${v} ${o.klein?'klein mitk':''}" style="${o.st||''}">${t}${o.ohne?'':'<i>'+PF+'</i>'}</span>`;
const FELD = (ph, w, o={}) => `<div class="feld ${o.cls||''}" style="width:${w}px;${o.st||''}">${o.lupe?LUPE:FUNKE}<span class="ph">${ph}</span>${o.knopf===false?'':KN(o.knopf||'Fünf Entwürfe', o.v||'')}</div>`;
const HDR = (h='') => `<div class="hdr ${h}">${Z(42)}<div><b>Grand Beau-Rivage</b><small>Drucksachen-Studio</small></div></div>`;
const A = (x, y, html, st='') => `<div class="a" style="left:${x}px;top:${y}px;${st}">${html}</div>`;

/* Beispiel-Ablage (wie im Studio heute): acht Drucksachen */
const LIB = [
  {k:'einl', n:'Einladung Beste Freunde treffen', s:'Beste Freunde treffen', f:'Quadrat · 1 Seite', t:'gerade eben', img:'ev-veuve', d:'12.10.'},
  {k:'gut', n:'Gutschein La Petite Suisse', s:'Gutschein', f:'DL quer · 1 Seite', t:'vor 40 Min.', d:'12.10.'},
  {k:'flyer', n:'Tea Time im Advent', s:'Tea Time im Advent', f:'A5 hoch · 2 Seiten', t:'gestern', img:'bar-teatime-2', d:'11.10.'},
  {k:'karte', n:'Speisekarte La Petite Suisse', s:'Speisekarte', f:'A4 hoch · 2 Seiten', t:'vor 2 Tagen', d:'10.10.'},
  {k:'plakat', n:'Silvester im Ballsaal', s:'Silvester', f:'A3 hoch · 1 Seite', t:'vor 3 Tagen', img:'ev-silvester', d:'09.10.'},
  {k:'post', n:'Ansichtskarte Interlaken', s:'Ansichtskarte', f:'A6 quer · 2 Seiten', t:'vor 4 Tagen', img:'haus-winter', d:'08.10.'},
  {k:'insta', n:'Cocktail des Monats', s:'Cocktail des Monats', f:'Instagram · 1 Bild', t:'vor 5 Tagen', img:'g-manhattan', d:'07.10.'},
  {k:'flyer', n:'Fondue am Kamin', s:'Fondue am Kamin', f:'A5 hoch · 1 Seite', t:'vor 6 Tagen', img:'fondue', d:'06.10.', ti:'Fondue am Kamin', zl:'La Petite Suisse'},
];
const RAT = {gut:.471, einl:1, flyer:1.414, karte:1.414, plakat:1.414, post:.709, insta:1.25, leer:1.414};

/* Ein Papierstück: Breite in px, Inhalte in em (1em = Breite / 10) */
function P(k, w, o={}){
  const h = Math.round(w*(RAT[k]||1.414)), fs = (w/10).toFixed(2);
  const st = `width:${w}px;height:${h}px;font-size:${fs}px;${o.rot?`transform:rotate(${o.rot}deg);`:''}${o.st||''}`;
  const img = o.img;
  let inn = '', cls = '';
  if(k==='gut'){ cls='mar'; inn = `<div style="display:flex;align-items:center;gap:.7em;height:100%;padding:0 .8em">${Z(0,'var(--goldtief)','width:2.4em;height:2.4em;flex:none')}<div style="flex:1;border-left:.02em solid rgba(210,191,152,.5);padding-left:.7em"><b style="font-size:1.05em">${o.ti||'Gutschein'}</b><span class="m gold" style="font-size:.26em;margin-top:.7em">${o.zl||'Restaurant La Petite Suisse'}</span><b style="font-size:.55em;margin-top:.5em;color:var(--gold)">CHF 100</b></div></div>`; }
  else if(k==='einl'){ inn = `<div style="height:46%;padding:.65em .7em"><span class="m taupe" style="font-size:.24em">Einladung</span><b style="font-size:.95em;margin-top:.25em">${o.ti||'Beste Freunde treffen'}</b><div style="width:1.4em;height:.03em;background:var(--taupe);margin-top:.35em"></div></div><div class="ft" style="height:54%;background-image:url(${F(img||'ev-veuve')})"></div>`; }
  else if(k==='flyer'){ inn = `<div class="ft" style="height:58%;background-image:url(${F(img||'bar-teatime-2')})"></div><div style="padding:.55em .6em"><span class="m taupe" style="font-size:.24em">${o.zl||'Bar Le Vieux Rivage'}</span><b style="font-size:1em;margin-top:.25em">${o.ti||'Tea Time im Advent'}</b></div>`; }
  else if(k==='karte'){ inn = `<div class="mitte" style="padding-top:.7em">${Z(0,'var(--messing)','width:1.5em;height:1.5em')}<span class="caps" style="font-size:.4em;margin-top:.6em;color:var(--navy)">${o.ti||'La Petite Suisse'}</span><span class="m taupe" style="font-size:.22em;margin-top:.4em">November bis April</span><div style="width:1.2em;height:.02em;background:var(--taupe);margin:.6em 0 .5em"></div>${['Berner Märitsuppe','Nüssler Salat','Käsefondue','Kalbsgeschnetzeltes','Spiegelei Rösti','Karamell Köpfli'].map(x=>`<span style="font:500 .36em/1.9 var(--serif);color:var(--tinte)">${x}</span>`).join('')}</div>`; }
  else if(k==='plakat'){ cls='mar'; inn = `<div class="mitte" style="height:100%;padding:.7em .7em">${Z(0,'var(--goldtief)','width:1.1em;height:1.1em')}<b style="font-size:1.15em;margin-top:.45em;color:var(--papier)">${o.ti||'Silvester im Ballsaal'}</b><div class="ft" style="flex:1;width:100%;margin:.55em 0;background-image:url(${F(img||'ev-silvester')});box-shadow:0 0 0 .02em var(--gold)"></div><span class="m gold" style="font-size:.22em">Grand Beau-Rivage · Interlaken</span></div>`; }
  else if(k==='post'){ inn = `<div class="ft" style="position:absolute;inset:0;background-image:url(${F(img||'haus-winter')})"></div><span class="caps" style="position:absolute;left:.6em;bottom:.5em;font-size:.62em;color:#fff;text-shadow:0 .03em .1em rgba(0,0,0,.6)">${o.ti||'Interlaken'}</span>`; }
  else if(k==='insta'){ inn = `<div class="ft" style="height:80%;background-image:url(${F(img||'g-manhattan')})"></div><div style="height:20%;display:flex;align-items:center;padding:0 .6em;justify-content:space-between"><b style="font-size:.62em">${o.ti||'Cocktail des Monats'}</b>${Z(0,'var(--messing)','width:.8em;height:.8em')}</div>`; }
  else { inn = `<div class="mitte" style="height:100%;justify-content:center;color:var(--taupe)"><svg viewBox="0 0 24 24" style="width:1.4em;height:1.4em;stroke-width:1"><path d="M12 5v14M5 12h14"/></svg></div>`; }
  return `<div class="pp ${cls}" style="${st}">${inn}</div>`;
}
const PL = (i, w, o={}) => { const L = LIB[i]; return P(L.k, w, {img:L.img, ti:L.ti, zl:L.zl, ...o}); };
const STUECK = (i, w, o={}) => { const L = LIB[i]; return `<div class="mitte" style="width:${o.bw||w}px">${PL(i,w,o)}<div class="pp-name" style="${o.ns||''}">${o.kurz?L.s:L.n}</div><div class="pp-info">${L.f} · ${L.t}</div></div>`; };

/* ---------------------------------------------------------------- die dreissig */
const V = [];
const add = (name, idee, html) => V.push({name, idee, html});

add('Ein Satz, sonst nichts',
 'Nur das Zeichen, eine Frage und das Feld. Die eigenen Drucksachen schauen unten aus dem Bildrand und kommen erst beim Herunterscrollen ganz herein.',
 `<div class="sc marine">${HDR()}
  <div class="a mitte" style="left:0;right:0;top:170px">${Z(96,'var(--goldtief)','filter:drop-shadow(0 2px 0 rgba(61,42,16,.8))')}
   <h1 class="ser pap" style="font-size:112px;margin-top:40px">Was soll entstehen?</h1>
   ${FELD('Ein Plakat für das Winterchalet im Garten', 880, {st:'margin-top:54px'})}</div>
  <div class="a mitte" style="left:0;right:0;top:700px"><span class="mono gold">Meine Drucksachen · 8</span><svg viewBox="0 0 24 24" style="width:20px;height:20px;color:var(--gold);margin-top:6px"><path d="m6 9 6 6 6-6"/></svg></div>
  <div class="a zeile" style="left:0;right:0;top:790px;justify-content:center;gap:56px;align-items:flex-start">${PL(1,300)}${PL(0,220)}${PL(4,210)}${PL(2,190)}${PL(5,260)}</div>
 </div>`);

add('Der Brief',
 'Die Seite ist ein Briefbogen des Hauses. Man schreibt dem Studio, was man braucht, und unterschreibt mit dem Knopf. Die letzten Stücke liegen gestapelt daneben.',
 `<div class="sc creme">${HDR('h')}
  <div class="a pp" style="left:330px;top:64px;width:640px;height:900px;padding:64px 74px;font-size:16px">
   <div class="mitte">${Z(58,'var(--messing)')}<span class="caps navy" style="font-size:15px;margin-top:16px">Grand Beau-Rivage</span><span class="mono taupe" style="margin-top:8px;font-size:10px">Interlaken · seit 1874</span></div>
   <div class="mono taupe" style="text-align:right;margin-top:54px;font-size:10.5px">Interlaken, 12. Oktober 2026</div>
   <p class="ser navy" style="font-size:36px;margin-top:30px">Liebes Studio,</p>
   <div style="margin-top:14px;background:repeating-linear-gradient(180deg,transparent 0 55px,rgba(159,137,111,.35) 55px 56px);font:italic 500 31px/56px var(--serif);color:var(--tinte);height:280px">ich brauche ein Plakat für das Winterchalet im Garten, dunkel, mit dem Foto vom Haus im Schnee.<span class="caret"></span></div>
   <div class="zeile" style="justify-content:space-between;margin-top:34px"><span class="ser kur taupe" style="font-size:24px">Mit herzlichen Grüssen</span>${KN('Fünf Entwürfe')}</div>
  </div>
  ${A(1060,170,`<span class="mono taupe">Zuletzt geschrieben</span>`)}
  ${A(1080,240,PL(4,190,{rot:-7}))}${A(1150,260,PL(2,180,{rot:5}))}${A(1100,330,PL(0,200,{rot:-1}))}
  ${A(1060,580,`<div class="pp-name" style="margin:0">Beste Freunde treffen</div><div class="pp-info">und sieben weitere</div><div style="margin-top:22px">${KN('Alle öffnen','hell',{klein:1})}</div>`)}
 </div>`);

add('Die Rezeption',
 'Das Studio empfängt wie die Rezeption: ein Gruss, eine Frage, eine Glocke. Wer läutet, bekommt fünf Entwürfe. Links die Halle des Hauses im Bogenfenster.',
 `<div class="sc marine">${HDR()}
  <div class="a foto" style="left:96px;top:130px;width:500px;height:690px;border-radius:250px 250px 6px 6px;background-image:url(${F('halle-2')});box-shadow:0 0 0 1px rgba(210,191,152,.7),0 0 0 10px rgba(27,32,51,.9),0 0 0 11px rgba(210,191,152,.35),0 40px 70px -30px rgba(0,0,0,.8)"></div>
  ${A(720,190,`<h1 class="ser pap" style="font-size:104px">Guten Abend.</h1><p class="ser cre" style="font-size:42px;margin-top:22px;opacity:.85">Was dürfen wir für Sie drucken?</p>
   <div class="linie" style="width:600px;margin-top:56px;font:italic 500 30px var(--serif);color:rgba(240,227,194,.55)">Die Weinkarte für den Herbst, zweiseitig<span class="caret" style="background:var(--gold)"></span></div>
   <div class="zeile" style="gap:26px;margin-top:46px"><span style="width:96px;height:96px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 40% 30%,#fbf0cf,#d9bd80 45%,#8f6f38);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -4px 0 rgba(92,66,24,.5),0 20px 30px -12px rgba(0,0,0,.7);color:var(--navy)"><svg viewBox="0 0 24 24" style="width:42px;height:42px;stroke-width:1.4"><path d="M4 18h16M5.5 18a6.5 6.5 0 0 1 13 0M12 11.5V9.5M10.5 9.5h3"/></svg></span><div><div class="mono gold" style="font-size:12px">Läuten</div><div class="ser cre" style="font-size:24px;margin-top:6px">und fünf Entwürfe kommen</div></div></div>`)}
  ${A(720,720,`<div class="haar" style="width:620px"></div><div class="zeile" style="gap:22px;margin-top:22px">${PL(0,64)}<div><div class="mono gold" style="font-size:10px">Zuletzt</div><div class="ser pap" style="font-size:24px;margin-top:4px">Beste Freunde treffen</div></div><span style="margin-left:auto">${KN('Alle 8','hell',{klein:1})}</span></div>`,'width:620px')}
 </div>`);

add('Der Schreibtisch',
 'Von oben auf den Schreibtisch des Hauses: die eigenen Drucksachen liegen verstreut wie echte Papiere, in der Mitte der Block, auf dem man den Auftrag notiert.',
 `<div class="sc marine" style="background-color:#171c2d">${HDR()}
  ${A(110,150,PL(1,330,{rot:-9}))}${A(1040,110,PL(0,250,{rot:7}))}${A(1130,420,PL(3,230,{rot:-5}))}${A(130,560,PL(5,280,{rot:6}))}${A(1000,640,PL(6,190,{rot:11}))}${A(330,330,PL(2,150,{rot:-14}))}
  <div class="a pp" style="left:470px;top:110px;width:500px;height:700px;transform:rotate(-1.5deg)">
   <div style="height:54px;background:var(--navy) var(--td) 0 0/170px;border-bottom:2px solid var(--gold);display:flex;align-items:center;justify-content:center">${Z(28,'var(--goldtief)')}</div>
   <div style="padding:44px 48px"><span class="mono taupe">Notiz für das Studio</span><p class="ser navy" style="font-size:46px;margin-top:14px">Was soll entstehen?</p>
   <div style="margin-top:22px;background:repeating-linear-gradient(180deg,transparent 0 47px,rgba(159,137,111,.35) 47px 48px);height:300px;font:italic 500 27px/48px var(--serif)">Gutschein für die Massage im Spa, quer, zum Verschenken<span class="caret"></span></div>
   <div style="margin-top:20px">${KN('Fünf Entwürfe')}</div></div></div>
  <div class="a" style="left:990px;top:300px;width:16px;height:300px;border-radius:8px;transform:rotate(18deg);background:linear-gradient(90deg,#0d0f18,#3a3f55 40%,#0d0f18);box-shadow:0 20px 20px -10px rgba(0,0,0,.6)"><div style="height:60px;border-radius:8px 8px 0 0;background:linear-gradient(90deg,#8f6f38,#f3e3b6 45%,#8f6f38)"></div></div>
 </div>`);

add('Die Mappe',
 'Eine Ledermappe mit Goldecken liegt aufgeschlagen. Links prägt das Zeichen und darunter beschreibt man das Neue, rechts stecken die eigenen Drucksachen in der Tasche.',
 `<div class="sc creme">${HDR('h')}
  <div class="a marine" style="left:100px;top:110px;width:1240px;height:720px;border-radius:14px;box-shadow:0 0 0 1px rgba(0,0,0,.4),0 50px 80px -30px rgba(26,29,40,.75)">
   <div class="a" style="inset:18px;border:1px solid rgba(210,191,152,.45);border-radius:6px"></div>
   <div class="a" style="left:610px;top:0;width:20px;height:100%;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.45),rgba(0,0,0,0))"></div>
   ${['left:0;top:0;border-radius:14px 0 0 0;clip-path:polygon(0 0,100% 0,0 100%)','right:0;top:0;border-radius:0 14px 0 0;clip-path:polygon(0 0,100% 0,100% 100%)','left:0;bottom:0;border-radius:0 0 0 14px;clip-path:polygon(0 0,100% 100%,0 100%)','right:0;bottom:0;border-radius:0 0 14px 0;clip-path:polygon(100% 0,100% 100%,0 100%)'].map(s=>`<div class="a" style="${s};width:64px;height:64px;background:linear-gradient(135deg,#f3e3b6,#b8975a 60%,#8f6f38)"></div>`).join('')}
   <div class="a mitte" style="left:60px;top:90px;width:500px">${Z(120,'#c9ab6c','filter:drop-shadow(0 -1px 0 rgba(0,0,0,.6)) drop-shadow(0 1px 0 rgba(255,240,200,.25))')}<span class="caps" style="font-size:15px;margin-top:20px;color:var(--goldhell)">Grand Beau-Rivage</span>
    <p class="ser pap" style="font-size:52px;margin-top:50px">Was soll entstehen?</p>${FELD('Speisekarte für den Herbst', 500, {cls:'klein', knopf:'Fünf', st:'margin-top:30px'})}</div>
   <div class="a" style="left:700px;top:90px">${PL(3,200,{rot:-4})}</div><div class="a" style="left:880px;top:70px">${PL(4,200,{rot:3})}</div><div class="a" style="left:1040px;top:120px">${PL(0,150,{rot:-2})}</div>
   <div class="a" style="left:650px;top:360px;width:560px;height:330px;border-radius:4px 4px 6px 6px;background:linear-gradient(180deg,#262d48,#1b2033) ;box-shadow:0 -10px 20px -8px rgba(0,0,0,.6),inset 0 1px 0 rgba(210,191,152,.6)"><div class="mitte" style="padding-top:70px"><span class="mono gold">Meine Drucksachen</span><span class="ser pap" style="font-size:64px;margin-top:10px">Acht</span><div style="margin-top:26px">${KN('Herausnehmen','gold',{klein:1})}</div></div></div>
  </div>
 </div>`);

add('Unter der Glocke',
 'Room Service für Drucksachen: man gibt den Auftrag auf, die Messingglocke wird gehoben und darunter liegen fünf Entwürfe. Leise Ironie, sofort verstanden.',
 `<div class="sc marine">${HDR()}
  <div class="a mitte" style="left:0;right:0;top:90px"><h1 class="ser pap" style="font-size:84px">Ihr Auftrag, bitte.</h1></div>
  <svg class="a" viewBox="0 0 600 330" style="left:420px;top:230px;width:600px;height:330px;stroke:none">
   <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#7d6234"/><stop offset=".35" stop-color="#f3e3b6"/><stop offset=".55" stop-color="#d2b67a"/><stop offset="1" stop-color="#6e5428"/></linearGradient>
   <linearGradient id="gt" x1="0" x2="1"><stop offset="0" stop-color="#6e5428"/><stop offset=".5" stop-color="#e9d39f"/><stop offset="1" stop-color="#6e5428"/></linearGradient></defs>
   <ellipse cx="300" cy="300" rx="290" ry="26" fill="url(#gt)"/><ellipse cx="300" cy="296" rx="270" ry="18" fill="#1b2033" opacity=".25"/>
   <path d="M60 292 C 60 140, 540 140, 540 292 Z" fill="url(#gl)"/><path d="M110 250 C 140 175, 230 150, 300 150" stroke="rgba(255,255,255,.55)" stroke-width="6" fill="none" stroke-linecap="round"/>
   <rect x="282" y="160" width="36" height="24" rx="8" fill="url(#gl)"/><circle cx="300" cy="152" r="20" fill="url(#gl)"/></svg>
  <div class="a mitte" style="left:0;right:0;top:620px">${FELD('Tischaufsteller für den Sonntagsbrunch', 880, {knopf:'Servieren', v:'gold'})}<span class="mono gold" style="margin-top:26px">Unter der Glocke liegen danach fünf Entwürfe</span></div>
  ${A(1190,40,KN('Meine Drucksachen · 8','hell',{klein:1}))}
 </div>`);

add('Die Salonwand',
 'Alle eigenen Drucksachen hängen dicht an dicht in Petersburger Hängung auf der Tapete, gross und klein gemischt. Links die Frage, was als Nächstes an die Wand kommt.',
 `<div class="sc marine">${HDR()}
  ${A(70,250,`<h1 class="ser pap" style="font-size:70px;width:430px">Was kommt als Nächstes an die Wand?</h1><p class="cre" style="font-size:17px;margin-top:24px;width:400px;opacity:.8">Ein Satz genügt. Das Studio setzt fünf Entwürfe im Stil des Hauses.</p>${FELD('Beschreiben …', 430, {cls:'klein', knopf:'Fünf', st:'margin-top:40px'})}<div class="mono gold" style="margin-top:28px">8 Stücke hängen hier</div>`)}
  ${A(600,70,PL(4,220))}${A(850,90,PL(1,300))}${A(1180,70,PL(6,200))}${A(850,260,PL(0,210))}${A(1090,330,PL(3,170))}${A(600,420,PL(5,220))}${A(1290,350,PL(2,120))}${A(860,500,PL(7,170))}${A(1060,600,PL(1,240,{ti:'Gutschein Spa', zl:'La Vallée SPA'}))}${A(600,620,PL(0,190,{img:'hochzeit-tafel', ti:'Unsere Hochzeit'}))}
 </div>`);

add('Das Fenster zur Aare',
 'Oben gross das Haus am Fluss, die Frage steht im Bild. Das Feld sitzt auf der Kante zwischen Foto und Papier, darunter die eigenen Drucksachen in einer ruhigen Reihe.',
 `<div class="sc papier"><div class="a foto" style="left:0;top:0;width:1440px;height:480px;background-image:url(${F('haus-aare')})"></div><div class="a" style="left:0;top:0;width:1440px;height:480px;background:linear-gradient(180deg,rgba(20,24,39,.55),rgba(20,24,39,.1) 40%,rgba(20,24,39,.55))"></div>${HDR()}
  ${A(110,250,`<h1 class="ser pap" style="font-size:104px;text-shadow:0 2px 20px rgba(0,0,0,.35)">Was soll entstehen?</h1>`)}
  <div class="a" style="left:110px;top:436px">${FELD('Ansichtskarte vom Haus im Sommer', 1000)}</div>
  <div class="a zeile" style="left:110px;top:580px;gap:58px;align-items:flex-end">${STUECK(0,150)}${STUECK(1,260,{kurz:1})}${STUECK(2,130,{kurz:1})}${STUECK(4,130,{kurz:1})}${STUECK(5,200,{kurz:1})}</div>
 </div>`);

add('Halb Haus, halb Papier',
 'Links das Haus in voller Höhe mit der Wortmarke, rechts ein ruhiges Papier zum Arbeiten: Feld oben, darunter die Drucksachen als Liste mit Vorschau, Format und Datum.',
 `<div class="sc papier"><div class="a foto" style="left:0;top:0;width:600px;height:900px;background-image:url(${F('haus-sommer-berge')})"></div><div class="a" style="left:0;top:0;width:600px;height:900px;background:linear-gradient(180deg,rgba(20,24,39,0) 50%,rgba(20,24,39,.75))"></div>
  ${A(60,740,`<div class="zeile" style="gap:16px">${Z(56,'var(--goldtief)')}<div><div class="caps pap" style="font-size:20px">Grand Beau-Rivage</div><div class="mono gold" style="margin-top:8px">Drucksachen-Studio</div></div></div>`)}
  ${A(690,90,`<div class="mono taupe">Montag, 12. Oktober</div><h1 class="ser navy" style="font-size:72px;margin-top:14px">Was soll entstehen?</h1>${FELD('Beschreiben Sie es in einem Satz', 660, {cls:'kuhle klein', st:'margin-top:30px'})}
   <div class="zeile" style="gap:36px;margin-top:54px"><span class="ser navy" style="font-size:30px;border-bottom:2px solid var(--navy);padding-bottom:6px">Meine Drucksachen <span class="mono taupe">8</span></span><span class="ser taupe" style="font-size:30px;padding-bottom:6px">Neu erstellen</span></div>
   <div class="haar-h" style="width:660px"></div>
   ${[0,1,2,3,4].map(i=>`<div class="zeile" style="gap:22px;width:660px;height:78px;border-bottom:1px solid rgba(159,137,111,.22)"><div style="width:62px;display:grid;place-items:center">${PL(i, LIB[i].k==='gut'?62:40)}</div><span class="ser navy" style="font-size:24px;flex:1">${LIB[i].n}</span><span class="mono taupe" style="font-size:10px">${LIB[i].f.split(' · ')[0]}</span><span class="mono taupe" style="font-size:10px;width:110px;text-align:right">${LIB[i].t}</span></div>`).join('')}`)}
 </div>`);

add('Weitermachen zuerst',
 'Das Studio weiss, woran man zuletzt sass, und legt genau dieses Stück gross hin. Ein Knopf führt zurück hinein, das Neue kommt an zweiter Stelle, die übrigen sieben klein darunter.',
 `<div class="sc marine">${HDR()}
  ${A(170,200,PL(0,470,{rot:-2.5}))}
  ${A(790,170,`<div class="mono gold">Zuletzt bearbeitet · gerade eben</div><h1 class="ser pap" style="font-size:84px;margin-top:20px">Beste Freunde treffen</h1><p class="cre" style="font-size:18px;margin-top:16px;opacity:.8">Einladung · Quadrat · 1 Seite</p><div style="margin-top:36px">${KN('Weitermachen','gold')}</div>
   <div class="haar" style="width:540px;margin:58px 0 34px"></div><p class="ser pap" style="font-size:32px">Oder etwas Neues</p>${FELD('Beschreiben …', 540, {cls:'klein', knopf:'Fünf', st:'margin-top:20px'})}`)}
  <div class="a zeile" style="left:790px;top:770px;gap:22px;align-items:flex-end">${[1,2,3,4,5,6,7].map(i=>PL(i, LIB[i].k==='gut'||LIB[i].k==='post'?100:58)).join('')}</div>
 </div>`);

add('Die Bühne',
 'Eine Drucksache steht gross auf der Bühne wie ein Produkt im Schaufenster, darunter die Reihe aller Miniaturen zum Durchblättern. Das Feld für Neues sitzt schmal oben.',
 `<div class="sc creme">${HDR('h')}
  <div class="a" style="left:400px;top:30px">${FELD('Neu beschreiben …', 640, {cls:'klein', knopf:'Fünf'})}</div>
  <div class="a" style="left:520px;top:600px;width:400px;height:40px;border-radius:50%;background:radial-gradient(closest-side,rgba(26,29,40,.35),rgba(26,29,40,0))"></div>
  ${A(560,140,PL(4,320))}
  <div class="a b-rund" style="left:400px;top:340px;width:56px;height:56px"><svg viewBox="0 0 24 24" style="width:22px"><path d="m15 6-6 6 6 6"/></svg></div><div class="a b-rund" style="left:984px;top:340px;width:56px;height:56px"><svg viewBox="0 0 24 24" style="width:22px"><path d="m9 6 6 6-6 6"/></svg></div>
  ${A(0,660,`<div class="mitte" style="width:1440px"><h2 class="ser navy" style="font-size:44px">Silvester im Ballsaal</h2><div class="pp-info">A3 hoch · 1 Seite · vor 3 Tagen</div></div>`)}
  <div class="a zeile" style="left:0;right:0;top:790px;justify-content:center;gap:26px;align-items:flex-end">${[0,1,2,3,4,5,6,7].map(i=>`<div style="${i===4?'outline:1.5px solid var(--navy);outline-offset:6px;border-radius:2px':''}">${PL(i, LIB[i].k==='gut'||LIB[i].k==='post'?110:54)}</div>`).join('')}</div>
 </div>`);

add('Der Stapel',
 'Alle Drucksachen liegen als ein lockerer Stapel in der Mitte, obenauf die zuletzt bearbeitete. Antippen fächert ihn auf. Links die Zahl, rechts das Neue.',
 `<div class="sc marine">${HDR()}
  ${[7,6,5,3,2,1,4,0].map((i,n)=>A(560+(n%3)*14-20, 210+n*6, PL(i, 300, {rot:[-14,10,-7,6,-3,12,-9,-1.5][n]}))).join('')}
  ${A(90,300,`<div class="ser gold" style="font-size:150px;line-height:.9">8</div><div class="ser pap" style="font-size:40px;margin-top:6px">Drucksachen</div><div class="mono gold" style="margin-top:14px">obenauf die zuletzt bearbeitete</div><div style="margin-top:34px">${KN('Auffächern','hell',{klein:1})}</div>`)}
  ${A(1040,300,`<p class="ser pap" style="font-size:44px">Etwas Neues?</p><div class="feld klein" style="width:330px;margin-top:24px;height:auto;flex-direction:column;align-items:stretch;border-radius:28px;padding:20px">${'<span class="ph" style="font:italic 500 22px/1.4 var(--serif);color:rgba(26,29,40,.42);white-space:normal">Ein Aushang für die Sauna, ruhige Zeiten am Abend</span>'}<div style="margin-top:18px">${KN('Fünf Entwürfe')}</div></div>`)}
 </div>`);

add('Das Gästebuch',
 'Die eigenen Drucksachen stehen eingetragen wie im Gästebuch des Hauses: Datum, Name, Format, kleine Vorschau. Die oberste Zeile ist frei für den nächsten Eintrag.',
 `<div class="sc marine">${HDR()}
  <div class="a pp" style="left:140px;top:110px;width:1160px;height:760px;padding:54px 70px">
   <div class="zeile" style="justify-content:space-between"><h1 class="ser navy" style="font-size:58px">Meine Drucksachen</h1>${Z(52,'var(--messing)')}</div>
   <div class="mono taupe" style="margin-top:10px">Eingetragen seit Oktober 2026</div>
   <div class="zeile" style="margin-top:34px;height:74px;gap:24px;border-top:1.5px solid var(--navy);border-bottom:1.5px solid var(--navy)"><span class="mono navy" style="width:90px">Neu</span><span style="flex:1;font:italic 500 28px var(--serif);color:rgba(26,29,40,.45)">Was soll entstehen?<span class="caret"></span></span>${KN('Fünf Entwürfe','',{klein:1})}</div>
   ${[0,1,2,3,4,5].map(i=>`<div class="zeile" style="height:72px;gap:24px;border-bottom:1px solid rgba(159,137,111,.3)"><span class="mono taupe" style="width:90px">${LIB[i].d}</span><span class="ser navy" style="flex:1;font-size:27px">${LIB[i].n}</span><span class="taupe" style="width:200px;font-size:14px">${LIB[i].f}</span><div style="width:80px;display:grid;place-items:center">${PL(i, LIB[i].k==='gut'||LIB[i].k==='post'?78:40)}</div></div>`).join('')}
  </div>
 </div>`);

add('Das Register',
 'Die zwölf Arten stehen als grosse Wörter da, wie ein Register in einem Buch. Wer über ein Wort fährt, sieht die Drucksache daneben. Freies Beschreiben geht unten.',
 `<div class="sc marine">${HDR()}${A(1170,36,KN('Meine Drucksachen · 8','hell',{klein:1}))}
  ${A(110,150,`<div style="columns:2;column-gap:90px;width:760px">${['Plakat','Flyer','Speisekarte','Getränkekarte','Einladung','Gutschein','Ansichtskarte','Aushang','Programm','Tischaufsteller','Instagram','Leeres Blatt'].map(w=>`<div class="ser" style="font-size:52px;line-height:1.3;${w==='Einladung'?'color:var(--goldtief)':'color:rgba(247,240,227,.82)'}">${w}${w==='Einladung'?' <span style="font-size:30px">→</span>':''}</div>`).join('')}</div>`)}
  ${A(1000,160,PL(0,330,{rot:3,img:'hochzeit-tafel',ti:'Wir heiraten'}))}${A(1010,540,`<div class="mono gold">Einladung</div><div class="cre" style="font-size:15px;margin-top:8px;width:320px;opacity:.8">Quadrat oder Klappkarte, mit Couvert. Für Hochzeit, Geburtstag, Firmenanlass.</div>`)}
  <div class="a" style="left:110px;top:760px">${FELD('oder einfach beschreiben, was entstehen soll', 1220, {cls:'klein'})}</div>
 </div>`);

add('Der Satzbaukasten',
 'Ein einziger Satz mit Lücken: jede Lücke ist eine Auswahlliste im Hausstil. So entsteht der Auftrag, ohne dass man ein leeres Feld anstarrt.',
 `<div class="sc hellt">${HDR('h')}
  ${A(150,190,`<p class="ser navy" style="font-size:66px;line-height:1.55;width:1140px">Ich brauche ${['ein Plakat','das Winterchalet','im Dezember','dunkel','dem Haus im Schnee'].reduce((s,w,i)=>s.replace('§'+i,`<span style="color:var(--messing);border-bottom:2px solid var(--gold);padding-bottom:2px;white-space:nowrap">${w}<svg viewBox="0 0 24 24" style="width:26px;height:26px;margin-left:6px;vertical-align:middle"><path d="m6 9 6 6 6-6"/></svg></span>`),'§0 für §1 §2, §3 mit §4.')}</p>`)}
  ${A(150,560,KN('Fünf Entwürfe'))}
  ${A(150,720,`<div class="haar-h" style="width:1140px"></div><div class="zeile" style="gap:30px;margin-top:22px"><span class="mono taupe">Meine Drucksachen · 8</span>${[0,1,2,4,5].map(i=>`<span class="ser navy" style="font-size:20px">${LIB[i].s}</span>`).join('<span class="taupe">·</span>')}</div>`)}
 </div>`);

add('Der Druckbogen',
 'Die Startseite ist ein Druckbogen mit Schnittmarken, Passkreuzen und Farbleiste in den Farben des Hauses. Die eigenen Stücke sind darauf ausgeschossen, der Auftrag steht am Bogenrand.',
 `<div class="sc marine">
  <div class="a" style="left:70px;top:60px;width:1300px;height:790px;background:#fbf8f2;box-shadow:0 40px 70px -30px rgba(0,0,0,.8)">
   ${[[18,18],[1282,18],[18,772],[1282,772]].map(([x,y])=>`<svg class="a" viewBox="0 0 40 40" style="left:${x-20}px;top:${y-20}px;width:40px;height:40px;color:var(--tinte);stroke-width:.8"><path d="M0 20h14M26 20h14M20 0v14M20 26v14"/></svg>`).join('')}
   ${[[650,22],[650,768]].map(([x,y])=>`<svg class="a" viewBox="0 0 30 30" style="left:${x-15}px;top:${y-15}px;width:30px;height:30px;stroke-width:.8;color:var(--tinte)"><circle cx="15" cy="15" r="8"/><path d="M0 15h30M15 0v30"/></svg>`).join('')}
   <div class="a zeile" style="right:60px;top:12px;gap:0">${['#1b2033','#2c334d','#1a1d28','#f7f0e3','#efe4cf','#e2d2b5','#d2bf98','#b7a27a','#9f896f','#7a1f2b'].map(c=>`<span style="width:22px;height:14px;background:${c};box-shadow:inset 0 0 0 .5px rgba(0,0,0,.2)"></span>`).join('')}<span class="mono" style="font-size:9px;margin-left:12px;color:var(--taupe)">GBR · Bogen 1</span></div>
   ${A(54,70,`<div class="zeile" style="gap:14px">${Z(36,'var(--messing)')}<span class="caps navy" style="font-size:13px">Grand Beau-Rivage · Drucksachen</span></div>`)}
   <div class="a zeile" style="left:60px;top:150px;gap:30px;align-items:flex-start">${[[1,240],[0,180],[4,150],[3,150],[6,160]].map(([i,w])=>`<div style="position:relative;padding:14px;outline:1px dashed rgba(26,29,40,.25)">${PL(i,w)}</div>`).join('')}</div>
   <div class="a zeile" style="left:60px;bottom:50px;width:1180px;gap:22px;border-top:1px solid var(--tinte);padding-top:22px"><span class="mono navy">Auftrag</span><span style="flex:1;font:italic 500 30px var(--serif);color:rgba(26,29,40,.45);border-bottom:1px solid rgba(26,29,40,.3);padding-bottom:8px">Programm für die Hochzeit im Ballsaal, vier Seiten<span class="caret"></span></span>${KN('Fünf Entwürfe')}</div>
  </div>
 </div>`);

add('Das Jahr des Hauses',
 'Die Startseite denkt in Jahreszeiten: was kommt in den nächsten Monaten, welche Drucksache gehört dazu. Ein Klick legt die passende an, das freie Feld bleibt darunter.',
 `<div class="sc hellt">${HDR('h')}
  ${A(0,100,`<div class="mitte" style="width:1440px"><h1 class="ser navy" style="font-size:66px">Was steht als Nächstes an?</h1></div>`)}
  <div class="a zeile" style="left:70px;top:240px;gap:0;align-items:stretch">${[
   ['Oktober','Letzte Wochen auf der Terrasse',P('post',170,{img:'terrasse-neu',ti:'Interlaken'}),1],
   ['November','La Petite Suisse öffnet',P('karte',120)],
   ['Dezember','Tea Time im Advent · Silvester',P('flyer',120)],
   ['Januar','Fondue am Kamin',P('insta',130,{img:'g-kasefondue',ti:'Fondue-Abend'})],
   ['Februar','Valentinstag in der Bar',P('einl',130,{img:'ev-love',ti:'Zu zweit'})],
   ['März','Frühling an der Aare',P('post',170,{img:'aare-wasser',ti:'Aare'})]
  ].map(([m,t,p,an])=>`<div class="mitte" style="width:217px;padding:26px 14px 30px;border-left:1px solid rgba(159,137,111,.3);${an?'background:rgba(27,32,51,.06);box-shadow:inset 0 0 0 1.5px var(--navy);border-radius:18px':''}"><div class="ser navy" style="font-size:34px">${m}</div><div class="taupe" style="font-size:14px;margin:10px 0 26px;min-height:42px">${t}</div><div style="height:200px;display:grid;place-items:center">${p}</div></div>`).join('')}</div>
  <div class="a" style="left:270px;top:760px">${FELD('oder etwas ganz anderes beschreiben', 900, {cls:'kuhle klein'})}</div>
 </div>`);

add('Die Häuser im Haus',
 'Zuerst wählt man den Teil des Hauses: Restaurant, Terrasse, Bar, Spa, Ballsaal. Das Studio kennt dort Fotos, Zeiten und Ton und schlägt die passenden Drucksachen vor.',
 `<div class="sc marine">${HDR()}
  ${A(110,110,`<h1 class="ser pap" style="font-size:62px">Für welchen Teil des Hauses?</h1>`)}${A(1000,108,FELD('Oder beschreiben …', 340, {cls:'klein', knopf:false}))}
  <div class="a zeile" style="left:0;top:250px;gap:0">${[
   ['rest-ambiance-6','Restaurant «L’Ambiance»','Mai bis Oktober'],['rest-suisse-2','Restaurant «La Petite Suisse»','November bis April'],['terrasse-lounge','Terrasse «La Belle Rivière»','Lounge & Bar an der Aare'],['bar','Bar «Le Vieux Rivage»','täglich 17.00 – 24.00 Uhr',1],['spa-pool','La Vallée SPA','Schwimmbad, Sauna, Beauty'],['saal','Ballsaal «La Belle Epoque»','Feste und Tagungen']
  ].map(([b,n,z,an])=>`<div class="foto" style="position:relative;width:240px;height:650px;background-image:url(${F(b)})"><div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,24,39,.1) 40%,rgba(20,24,39,.9))"></div>${an?'<div class="a" style="inset:12px;box-shadow:inset 0 0 0 1.5px var(--gold)"></div>':''}<div class="a" style="left:24px;right:20px;bottom:40px"><div class="ser pap" style="font-size:30px;line-height:1.1">${n}</div><div class="mono gold" style="margin-top:12px;font-size:10px">${z}</div></div></div>`).join('')}</div>
 </div>`);

add('Der Lageplan',
 'Ein gezeichneter Plan des Hauses an der Aare, fein wie ein alter Stich. Man tippt auf einen Ort, und das Studio weiss, wofür gedruckt wird.',
 `<div class="sc hellt">${HDR('h')}
  <svg class="a" viewBox="0 0 900 760" style="left:40px;top:110px;width:900px;height:760px;color:var(--taupe);stroke-width:1.2">
   <path d="M0 640 C 200 600, 300 700, 520 650 S 820 560, 900 600" /><path d="M0 690 C 200 650, 300 750, 520 700 S 820 610, 900 650"/>
   ${Array.from({length:40},(_,i)=>`<path d="M${i*23} ${660+Math.sin(i)*10} l12 6" opacity=".5"/>`).join('')}
   <rect x="250" y="250" width="420" height="190" /><rect x="250" y="250" width="420" height="190" fill="rgba(159,137,111,.08)"/><rect x="200" y="300" width="50" height="110"/><rect x="670" y="300" width="60" height="110"/>
   <rect x="330" y="140" width="160" height="110" fill="#1b2033" stroke="#1b2033"/>
   <path d="M300 440 v60 h320 v-60" /><path d="M330 500 C 330 560, 590 560, 590 500" />
   ${[[120,180],[160,120],[90,320],[780,180],[820,120],[760,330],[110,460],[800,460]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="26"/><circle cx="${x}" cy="${y}" r="10" opacity=".5"/>`).join('')}
   <path d="M0 60 H900" opacity=".5"/><path d="M0 70 H900" opacity=".5"/>
  </svg>
  ${[[370,190,'Bar «Le Vieux Rivage»',1],[250,320,'Rezeption'],[560,330,'L’Ambiance'],[380,620,'Terrasse an der Aare'],[700,430,'Ballsaal'],[120,520,'Garten'],[80,155,'Höheweg'],[620,780,'Die Aare']].map(([x,y,t,an])=>A(x+40,y+110,`<span class="${an?'mono':'mono'}" style="font-size:10.5px;padding:6px 10px;border-radius:999px;${an?'background:var(--navy);color:var(--goldhell)':'background:rgba(253,249,241,.85);color:var(--navy)'}">${t}</span>`)).join('')}
  ${A(990,190,`<div class="mono taupe">Bar «Le Vieux Rivage»</div><h1 class="ser navy" style="font-size:56px;margin-top:14px">Wo wird es gebraucht?</h1><p style="font-size:16px;color:rgba(26,29,40,.7);margin-top:18px;width:380px">Tippen Sie auf einen Ort. Das Studio kennt die Fotos, Zeiten und den Ton dort.</p>
   <div class="ser navy" style="font-size:24px;margin-top:34px;line-height:1.7">Cocktailkarte<br>Aushang Happy Hour<br>Tischaufsteller<br>Instagram</div><div style="margin-top:34px">${KN('Fünf Entwürfe')}</div>`)}
 </div>`);

add('Der Lift',
 'Oben die Messing-Etagenanzeige eines alten Grandhotel-Lifts. Der Zeiger steht auf der Etage, in der man gerade ist: Neu, Meine Drucksachen, Vorlagen, Fotos.',
 `<div class="sc marine">${HDR()}
  <svg class="a" viewBox="0 0 640 300" style="left:400px;top:90px;width:640px;height:300px">
   <defs><linearGradient id="lb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3e3b6"/><stop offset=".5" stop-color="#c9ab6c"/><stop offset="1" stop-color="#7d6234"/></linearGradient></defs>
   <path d="M40 280 A 280 280 0 0 1 600 280" stroke="url(#lb)" stroke-width="14" fill="none"/>
   <path d="M80 280 A 240 240 0 0 1 560 280" stroke="rgba(210,191,152,.4)" stroke-width="1"/>
   ${Array.from({length:21},(_,i)=>{const a=Math.PI*(1-i/20),x1=320+250*Math.cos(a),y1=280-250*Math.sin(a),r=i%5===0?225:238,x2=320+r*Math.cos(a),y2=280-r*Math.sin(a);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d2bf98" stroke-width="${i%5===0?2:1}"/>`}).join('')}
   <line x1="320" y1="280" x2="${320+200*Math.cos(Math.PI*.62)}" y2="${280-200*Math.sin(Math.PI*.62)}" stroke="url(#lb)" stroke-width="5" stroke-linecap="round"/>
   <circle cx="320" cy="280" r="20" fill="url(#lb)" stroke="none"/></svg>
  ${[['Neu',.95],['Meine Drucksachen',.62],['Vorlagen',.38],['Fotos',.08]].map(([t,f])=>{const a=Math.PI*f,x=720+345*Math.cos(a),y=370-345*Math.sin(a);return A(x-110,y-14,`<div style="width:220px;text-align:center" class="${f===.62?'ser':'mono'}"><span style="${f===.62?'font-size:28px;color:var(--goldhell)':'color:rgba(240,227,194,.6);font-size:11px'}">${t}</span></div>`)}).join('')}
  <div class="a haar" style="left:120px;right:120px;top:420px"></div>
  <div class="a zeile" style="left:0;right:0;top:470px;justify-content:center;gap:64px;align-items:flex-end">${STUECK(0,180,{kurz:1})}${STUECK(1,300,{kurz:1})}${STUECK(4,170,{kurz:1})}${STUECK(5,250,{kurz:1})}</div>
  <div class="a" style="right:50px;top:420px;display:flex;flex-direction:column;gap:16px">${['▲','▼'].map(s=>`<span style="width:64px;height:64px;border-radius:50%;display:grid;place-items:center;color:var(--navy);font-size:18px;background:radial-gradient(circle at 40% 30%,#fbf0cf,#d9bd80 45%,#8f6f38);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(92,66,24,.5),0 14px 20px -10px rgba(0,0,0,.7)">${s}</span>`).join('')}</div>
 </div>`);

add('Die Hauszeitung',
 'Die Startseite ist die Titelseite einer Hauszeitung: Kopf in Kapitalen, Datum, die grosse Schlagzeile ist das Feld. Die eigenen Drucksachen stehen als Meldungen darunter.',
 `<div class="sc papier">
  <div class="a mitte" style="left:0;right:0;top:34px"><div class="caps navy" style="font-size:66px;letter-spacing:.12em">Grand Beau-Rivage</div></div>
  <div class="a" style="left:70px;right:70px;top:128px;border-top:3px double var(--navy);border-bottom:1px solid var(--navy);padding:9px 0;display:flex;justify-content:space-between" ><span class="mono navy" style="font-size:10.5px">Interlaken · seit 1874</span><span class="mono navy" style="font-size:10.5px">Montag, 12. Oktober 2026</span><span class="mono navy" style="font-size:10.5px">Ausgabe Drucksachen</span></div>
  ${A(70,200,`<h1 class="ser navy" style="font-size:78px;width:840px;line-height:1">Was soll heute gedruckt werden?</h1>${FELD('Menü für das Weihnachtsessen, sechs Gänge', 840, {cls:'kuhle klein', st:'margin-top:30px'})}`,'')}
  <div class="a" style="left:960px;top:200px;width:410px;border-left:1px solid var(--navy);padding-left:30px"><div class="mono navy">In dieser Ausgabe</div>${LIB.map(L=>`<div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(26,29,40,.15);padding:8px 0"><span class="ser navy" style="font-size:19px">${L.n}</span></div>`).join('')}</div>
  <div class="a zeile" style="left:70px;top:520px;width:840px;gap:30px;align-items:flex-start;border-top:1px solid var(--navy);padding-top:24px">${[[4,'Silvester im Ballsaal','Plakat A3, dunkel, mit Foto der Gläser. Zuletzt geändert vor drei Tagen.'],[2,'Tea Time im Advent','Flyer A5, zwei Seiten. Vorne die Etagere, hinten die Zeiten.'],[0,'Beste Freunde treffen','Einladung im Quadrat, mit Foto vom Apéro im Garten.']].map(([i,t,x])=>`<div style="width:260px"><div class="foto" style="height:150px;background-image:url(${F(LIB[i].img)})"></div><div class="ser navy" style="font-size:26px;margin-top:12px">${t}</div><p style="font-size:13.5px;color:rgba(26,29,40,.7);margin:6px 0 0">${x}</p></div>`).join('')}</div>
 </div>`);

add('Die Postkarte',
 'Eine grosse Postkarte, Rückseite nach oben: links schreibt man den Auftrag in die Zeilen, rechts klebt die Marke mit dem Zeichen, gestempelt in Interlaken. Vorne lugt das Haus im Schnee hervor.',
 `<div class="sc marine">${HDR()}
  <div class="a pp foto" style="left:130px;top:210px;width:1000px;height:640px;transform:rotate(-6deg);background:url(${F('haus-winter')}) center/cover"></div>
  <div class="a pp" style="left:230px;top:110px;width:1040px;height:660px;padding:56px 60px;display:flex;gap:50px">
   <div style="flex:1"><div class="mono taupe">Ihr Auftrag</div><div style="margin-top:20px;background:repeating-linear-gradient(180deg,transparent 0 55px,rgba(159,137,111,.4) 55px 56px);height:390px;font:italic 500 32px/56px var(--serif);color:var(--tinte)">Bitte eine Ansichtskarte vom Haus im Winter, hinten Platz für einen Gruss.<span class="caret"></span></div></div>
   <div style="width:1px;background:rgba(159,137,111,.5)"></div>
   <div style="width:380px;position:relative"><div style="margin-left:auto;width:140px;height:170px;padding:9px;background:var(--papier);box-shadow:0 0 0 1px rgba(159,137,111,.4);outline:3px dotted rgba(159,137,111,.6);outline-offset:-3px"><div class="marine" style="height:100%;display:grid;place-items:center">${Z(70,'var(--goldtief)')}</div></div>
    <div class="a mitte" style="right:90px;top:80px;width:150px;height:150px;border-radius:50%;border:1.5px solid rgba(122,31,43,.55);justify-content:center;transform:rotate(-14deg);color:rgba(122,31,43,.7)"><span class="mono" style="font-size:11px;color:inherit">Interlaken</span><span class="ser" style="font-size:24px;margin-top:4px">12.10.26</span></div>
    ${[0,1,2].map(i=>`<div style="height:1px;background:rgba(159,137,111,.5);margin-top:${i?54:120}px"></div>`).join('')}<div class="ser navy" style="font-size:22px;margin-top:-118px">An das Studio</div>
    <div class="a" style="right:0;bottom:0">${KN('Fünf Entwürfe')}</div></div>
  </div>
  ${A(1230,40,KN('Meine Drucksachen · 8','hell',{klein:1}))}
 </div>`);

add('Die Couverts',
 'Jede eigene Drucksache steckt in ihrem Couvert, beschriftet von Hand, das Papier schaut oben heraus. Das erste Couvert ist neu und mit Wachs versiegelt: dort beginnt man.',
 `<div class="sc creme">${HDR('h')}
  ${A(110,110,`<h1 class="ser navy" style="font-size:62px">Ihre Drucksachen</h1>`)}${A(780,110,FELD('Neue beschreiben …', 560, {cls:'kuhle klein', knopf:'Fünf'}))}
  <div class="a" style="left:110px;top:290px;display:grid;grid-template-columns:repeat(4,280px);gap:70px 40px">
   <div style="position:relative;height:200px;margin-top:40px"><div class="marine" style="position:absolute;inset:0;background-size:170px;box-shadow:0 20px 30px -16px rgba(0,0,0,.55)"></div><svg class="a" viewBox="0 0 280 160" preserveAspectRatio="none" style="left:0;top:0;width:280px;height:160px;color:rgba(210,191,152,.6)"><path d="M0 0 L140 90 L280 0"/></svg><div class="a mitte" style="left:105px;top:60px;width:70px;height:70px;border-radius:50%;justify-content:center;background:radial-gradient(circle at 40% 35%,#c2453f,#7a1f2b 70%);box-shadow:0 4px 8px rgba(0,0,0,.5)">${Z(40,'rgba(255,220,200,.75)')}</div><div class="a ser pap" style="left:0;right:0;bottom:-58px;text-align:center;font-size:26px;color:var(--navy)">Neue Drucksache</div></div>
   ${[0,1,2,4,3,5,6].map(i=>`<div style="position:relative;height:240px"><div class="a" style="left:50%;top:0;transform:translateX(-50%)">${PL(i, LIB[i].k==='gut'||LIB[i].k==='post'?220:150)}</div><div class="a" style="left:0;right:0;top:80px;height:160px;background:linear-gradient(180deg,#fdf9f1,#f1e7d4);box-shadow:0 0 0 .5px rgba(80,60,30,.2),0 20px 30px -16px rgba(26,29,40,.45)"><svg viewBox="0 0 280 160" preserveAspectRatio="none" style="width:100%;height:100%;color:rgba(159,137,111,.45);stroke-width:1"><path d="M0 160 L140 70 L280 160"/></svg></div><div class="a ser kur navy" style="left:20px;right:20px;top:190px;text-align:center;font-size:21px">${LIB[i].n}</div></div>`).join('')}
  </div>
 </div>`);

add('Das helle Atelier',
 'Der heutige Aufbau, aber im hellen Register des Hauses: Papier mit der hellen Tapete, Marine nur für Knöpfe und Schrift. Wirkt wie ein Atelier bei Tageslicht.',
 `<div class="sc hellt">${HDR('h')}${A(1230,36,KN('Hilfe','hell',{klein:1,ohne:1}))}
  <div class="a mitte" style="left:0;right:0;top:120px"><h1 class="ser navy" style="font-size:96px">Was möchten Sie erstellen?</h1><p style="font-size:19px;color:rgba(26,29,40,.7);margin-top:18px">Ein Satz genügt, das Studio legt fünf Entwürfe an.</p>${FELD('Zum Beispiel: ein Plakat für das Winterchalet im Garten', 1020, {cls:'kuhle', st:'margin-top:36px'})}</div>
  <div class="a zeile" style="left:0;right:0;top:560px;justify-content:center;gap:70px;align-items:flex-end">${STUECK(0,190,{kurz:1})}${STUECK(1,300,{kurz:1})}${STUECK(2,170,{kurz:1})}${STUECK(5,250,{kurz:1})}</div>
 </div>`);

add('Am Kamin',
 'Das Studio öffnet im Licht des Kaminfeuers aus La Petite Suisse. Warmes Licht im Dunkeln, ein Gruss, das Feld. Die Drucksachen liegen unten wie auf dem Tisch.',
 `<div class="sc"><div class="a foto" style="inset:0;background-image:url(${F('rest-suisse-2')})"></div><div class="a" style="inset:0;background:rgba(18,16,20,.6)"></div>${HDR()}
  <div class="a mitte" style="left:0;right:0;top:170px"><h1 class="ser pap" style="font-size:118px">Guten Abend.</h1><p class="ser cre" style="font-size:38px;margin-top:16px;opacity:.9">Was soll heute entstehen?</p>${FELD('Glühwein-Abend an der Bar, Aushang A4', 900, {v:'gold', st:'margin-top:44px'})}</div>
  <div class="a zeile" style="left:0;right:0;top:690px;justify-content:center;gap:60px;align-items:flex-start">${PL(3,170,{rot:-4})}${PL(1,320,{rot:2})}${PL(7,170,{rot:-1})}${PL(0,220,{rot:4})}</div>
 </div>`);

add('Das Musterbuch',
 'Links ein Fächer aus den Papieren des Hauses: Marine mit Tapete, Papier, Creme, Sand, Foto. Man wählt zuerst den Grund und sagt dann, was darauf soll.',
 `<div class="sc marine">${HDR()}
  ${[['marine','Marine mit Tapete',-34],['p','Papier',-22],['c','Creme mit Tapete',-10],['s','Sand',2],['f','Foto des Hauses',14]].map(([t,n,r],i)=>`<div class="a" style="left:120px;top:600px;width:520px;height:110px;transform-origin:30px 55px;transform:rotate(${r}deg);border-radius:6px;overflow:hidden;box-shadow:0 1px 1px rgba(0,0,0,.3),0 16px 30px -12px rgba(0,0,0,.6);${t==='marine'?'background:var(--navy) var(--td) 0 0/170px;box-shadow:0 0 0 2px var(--gold),0 16px 30px -12px rgba(0,0,0,.6)':t==='p'?'background:var(--papier)':t==='c'?'background:var(--creme) var(--th) 0 0/170px':t==='s'?'background:var(--sand)':`background:url(${F('haus-fluss-berge')}) center/cover`}"><span class="mono" style="position:absolute;right:20px;top:46px;color:${t==='marine'||t==='f'?'var(--goldhell)':'var(--navy)'}">${n}</span></div>`).join('')}
  <div class="a" style="left:138px;top:643px;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 40% 30%,#fbf0cf,#b8975a 60%,#7d6234);box-shadow:0 3px 6px rgba(0,0,0,.6)"></div>
  ${A(820,230,`<div class="mono gold">Gewählt: Marine mit Tapete</div><h1 class="ser pap" style="font-size:68px;margin-top:16px">Auf welchem Papier?</h1><p class="cre" style="font-size:17px;margin-top:18px;width:480px;opacity:.8">Erst den Grund, dann den Satz. Das Studio bleibt beim gewählten Papier und baut fünf Entwürfe darauf.</p>${FELD('Gutschein für die Bar', 520, {cls:'klein', knopf:'Fünf', st:'margin-top:40px'})}`)}
  ${A(1170,40,KN('Meine Drucksachen · 8','hell',{klein:1}))}
 </div>`);

add('La Carte',
 'Die Startseite ist eine Speisekarte: als Vorspeise etwas Neues, als Hauptgang die eigenen Drucksachen mit Format statt Preis, zum Dessert die Vorlagen des Hauses.',
 `<div class="sc marine">${HDR()}
  <div class="a pp" style="left:360px;top:40px;width:720px;height:900px;padding:50px 70px;box-shadow:var(--karte-s)">
   <div class="mitte">${Z(52,'var(--messing)')}<div class="caps navy" style="font-size:26px;margin-top:16px">La Carte du Studio</div><div class="mono taupe" style="margin-top:8px;font-size:10px">Montag, 12. Oktober 2026</div></div>
   <div class="ser kur taupe" style="font-size:26px;margin-top:40px;text-align:center">Pour commencer</div>
   <div class="zeile" style="margin-top:14px;gap:16px;border-bottom:1px solid rgba(159,137,111,.5);padding-bottom:10px"><span style="flex:1;font:italic 500 26px var(--serif);color:rgba(26,29,40,.45)">Etwas Neues, in einem Satz<span class="caret"></span></span>${KN('Bestellen','',{klein:1})}</div>
   <div class="ser kur taupe" style="font-size:26px;margin-top:38px;text-align:center">Plats du jour</div>
   ${[0,1,2,3,4].map(i=>`<div class="zeile" style="justify-content:space-between;margin-top:12px"><span class="ser navy" style="font-size:25px">${LIB[i].n}</span><span class="mono taupe" style="font-size:10px">${LIB[i].f.split(' · ')[0]}</span></div>`).join('')}
   <div class="ser kur taupe" style="font-size:26px;margin-top:38px;text-align:center">Les classiques</div>
   <div class="ser navy" style="font-size:21px;text-align:center;margin-top:12px;line-height:1.6">Speisekarte · Einladung · Gutschein · Ansichtskarte<br>Plakat · Aushang · Programm · Tischaufsteller</div>
  </div>
 </div>`);

add('Das Inhaltsverzeichnis',
 'Ein aufgeschlagenes Buch des Hauses: links das Inhaltsverzeichnis mit den echten Zahlen, rechts das geöffnete Kapitel. So sieht man auf einen Blick, was es alles gibt.',
 `<div class="sc creme">${HDR('h')}
  <div class="a" style="left:90px;top:100px;width:1260px;height:760px;display:flex;filter:drop-shadow(0 30px 40px rgba(26,29,40,.35))">
   <div class="pp" style="width:630px;height:760px;padding:70px 70px;box-shadow:none;background:linear-gradient(90deg,#fdf9f1 85%,#e9dfca)"><div class="caps navy" style="font-size:18px">Inhalt</div><div class="haar-h" style="margin:22px 0 10px"></div>
    ${[['I','Etwas Neues','',0],['II','Meine Drucksachen','8',1],['III','Vorlagen des Hauses','12',0],['IV','Fotos des Hauses','319',0],['V','Hilfe und Führung','',0]].map(([r,t,n,an])=>`<div class="zeile" style="gap:22px;height:82px;border-bottom:1px solid rgba(159,137,111,.25)"><span class="caps taupe" style="width:40px;font-size:15px">${r}</span><span class="ser" style="flex:1;font-size:34px;color:${an?'var(--messing)':'var(--navy)'}">${t}</span><span class="mono taupe">${n}</span></div>`).join('')}
    <div style="margin-top:44px">${FELD('Kapitel I: beschreiben …', 490, {cls:'kuhle klein', knopf:'Fünf'})}</div></div>
   <div class="pp" style="width:630px;height:760px;padding:70px 64px;box-shadow:none;background:linear-gradient(90deg,#e9dfca,#fdf9f1 15%)"><div class="caps taupe" style="font-size:14px">Kapitel II</div><div class="ser navy" style="font-size:46px;margin-top:10px">Meine Drucksachen</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:34px 30px;margin-top:40px;justify-items:center">${[0,1,4,2].map(i=>`<div class="mitte">${PL(i, LIB[i].k==='gut'?230:130)}<div class="ser navy" style="font-size:20px;margin-top:14px">${LIB[i].s}</div></div>`).join('')}</div></div>
  </div>
 </div>`);

add('Die Befehlszeile',
 'Ruhig und schnell für Leute, die oft drucken: ein einziges Feld in der Mitte für Beschreiben, Suchen und Öffnen. Darunter sofort Weitermachen, Neues und die Arten.',
 `<div class="sc marine">${HDR()}
  <div class="a zeile" style="left:0;right:0;top:620px;justify-content:center;gap:60px;opacity:.22">${PL(1,300)}${PL(0,200)}${PL(4,180)}${PL(5,260)}</div>
  <div class="a" style="left:340px;top:130px;width:760px;padding:12px;border-radius:26px;background:linear-gradient(180deg,#fdf9f1,#f4ecdc);box-shadow:var(--karte-s)">
   <div class="zeile" style="gap:16px;height:72px;padding:0 18px;border-bottom:1px solid rgba(159,137,111,.3)">${LUPE.replace('<svg','<svg style="width:24px;height:24px;color:var(--messing)"')}<span style="flex:1;font:500 28px var(--serif);color:var(--navy)">Tea<span class="caret"></span></span><span class="mono taupe" style="font-size:10px">⌘ K</span></div>
   ${[['Weitermachen',[[2,'Tea Time im Advent','gestern',1],[0,'Beste Freunde treffen','gerade eben']]],['Neu',[[null,'Fünf Entwürfe zu «Tea»','Eingabe']]],['Arten',[[null,'Flyer','A5 · A6'],[null,'Aushang','A4 · A3']]]].map(([g,rows])=>`<div class="mono taupe" style="font-size:9.5px;padding:16px 18px 6px">${g}</div>${rows.map(([i,t,z,an])=>`<div class="zeile" style="gap:16px;height:60px;padding:0 18px;border-radius:14px;${an?'background:var(--navy);color:var(--papier)':''}"><div style="width:40px;display:grid;place-items:center">${i!==null?PL(i,30):`<span style="width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#3e4870,#12162a);color:var(--goldhell)">${FUNKE.replace('<svg','<svg style="width:14px"')}</span>`}</div><span class="ser" style="flex:1;font-size:22px;${an?'':'color:var(--navy)'}">${t}</span><span class="mono" style="font-size:9.5px;${an?'color:var(--gold)':'color:var(--taupe)'}">${z}</span></div>`).join('')}`).join('')}
  </div>
 </div>`);

add('Fünf Ideen zur Begrüssung',
 'Beim Öffnen liegen schon fünf Ideen für die nächsten Wochen bereit, abgeleitet aus Saison und Betrieben des Hauses. Übernehmen öffnet sie, das freie Feld bleibt darunter.',
 `<div class="sc marine">${HDR()}${A(1170,36,KN('Meine Drucksachen · 8','hell',{klein:1}))}
  <div class="a mitte" style="left:0;right:0;top:110px"><h1 class="ser pap" style="font-size:76px">Guten Abend.</h1><p class="ser cre" style="font-size:32px;margin-top:12px;opacity:.85">Für die nächsten Wochen liegen fünf Ideen bereit.</p></div>
  <div class="a zeile" style="left:0;right:0;top:330px;justify-content:center;gap:56px;align-items:flex-end">${[
   [P('flyer',150,{img:'bar-teatime-2'}),'Tea Time im Advent','Flyer A5'],
   [P('karte',150,{ti:'La Petite Suisse'}),'Wintermenü','Speisekarte A4'],
   [P('plakat',150,{img:'ev-silvester'}),'Silvester','Plakat A3'],
   [P('post',220,{img:'haus-winter',ti:'Interlaken'}),'Winterkarte','Ansichtskarte A6'],
   [P('insta',160,{img:'food-winter',ti:'Glühwein'}),'Glühwein an der Bar','Instagram']
  ].map(([p,n,f])=>`<div class="mitte" style="width:220px">${p}<div class="pp-name" style="font-size:24px">${n}</div><div class="pp-info">${f}</div><div class="mono gold" style="margin-top:14px;font-size:10px">Übernehmen →</div></div>`).join('')}</div>
  <div class="a mitte" style="left:0;right:0;top:770px">${FELD('Oder etwas anderes beschreiben', 880, {cls:'klein'})}</div>
 </div>`);

/* ---------------------------------------------------------------- Darstellung */
const raster = document.getElementById('raster');
function zeigen(){
  raster.innerHTML = V.map((v,i)=>`<article class="b-karte" style="animation-delay:${Math.min(i,6)*.07}s"><div class="b-bild" data-i="${i}">${v.html}</div><div class="b-text"><span class="b-nr">${String(i+1).padStart(2,'0')}</span><div><h2>${v.name}</h2><p>${v.idee}</p></div></div></article>`).join('');
  const ro = new ResizeObserver(es => es.forEach(e => e.target.firstElementChild.style.setProperty('--s', e.contentRect.width/1440)));
  raster.querySelectorAll('.b-bild').forEach(b => ro.observe(b));
}
let jetzt = 0;
const gross = document.getElementById('gross'), rahmen = document.getElementById('grossRahmen');
function oeffne(i){
  jetzt = (i+V.length)%V.length;
  const s = Math.min((document.documentElement.clientWidth-32)/1440, (innerHeight-110)/900);
  rahmen.style.width = 1440*s+'px'; rahmen.style.height = 900*s+'px';
  rahmen.innerHTML = V[jetzt].html; rahmen.firstElementChild.style.setProperty('--s', s);
  document.getElementById('grossName').textContent = `${String(jetzt+1).padStart(2,'0')} · ${V[jetzt].name}`;
  gross.hidden = false;
}
raster.addEventListener('click', e => { const b = e.target.closest('.b-bild'); if(b) oeffne(+b.dataset.i); });
document.getElementById('grossZu').onclick = () => gross.hidden = true;
document.getElementById('grossVor').onclick = () => oeffne(jetzt+1);
document.getElementById('grossZurueck').onclick = () => oeffne(jetzt-1);
addEventListener('keydown', e => { if(gross.hidden) return; if(e.key==='Escape') gross.hidden = true; if(e.key==='ArrowRight') oeffne(jetzt+1); if(e.key==='ArrowLeft') oeffne(jetzt-1); });
addEventListener('resize', () => { if(!gross.hidden) oeffne(jetzt); });

fetch('../haeuser/gbr/marke.json').then(r=>r.json()).then(m=>{
  document.getElementById('zchP').setAttribute('d', m.zeichen.pfade.join(' '));
  const vb = m.zeichen.vb; if(vb) document.getElementById('zch').setAttribute('viewBox', vb.join(' '));
}).catch(()=>{});
const einzeln = new URLSearchParams(location.search).get('nr');
if(einzeln){ document.body.innerHTML = `<div style="position:relative;width:1440px;height:900px">${V[+einzeln-1].html}</div>`; document.querySelector('.sc').style.setProperty('--s',1); fetch('../haeuser/gbr/marke.json').then(r=>r.json()).then(m=>{ const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('style','position:absolute;width:0;height:0'); s.innerHTML=`<symbol id="zch" viewBox="${m.zeichen.vb.join(' ')}"><path d="${m.zeichen.pfade.join(' ')}"/></symbol>`; document.body.prepend(s); }); }
else zeigen();
})();
