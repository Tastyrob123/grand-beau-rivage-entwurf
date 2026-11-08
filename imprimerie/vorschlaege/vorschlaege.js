/* Media Printing Studio · dreissig Startseiten als professionelles Werkzeug (Runde 2, Robert 12.10.2026: «soll aussehen wie ein professionelles Tool, das zum Hotel passt»).
   Jede Ansicht ist 1440 × 900 gebaut und wird verkleinert gezeigt. Runde 1 liegt in _runde1/. */
(function(){
const F = k => `../haeuser/gbr/mini/${k}.webp`;
const Z = (s, farbe='', st='') => `<svg class="z" viewBox="0 0 1464 1452" style="width:${s}px;height:${s}px;${farbe?'color:'+farbe+';':''}${st}"><use href="#zch"/></svg>`;
const A = (x, y, html, st='') => `<div class="a" style="left:${x}px;top:${y}px;${st}">${html}</div>`;
const IC = {
 home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', files:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
 layout:'M4 4h16v16H4zM4 9h16M9 9v11', image:'M4 5h16v14H4zM4 16l5-5 4 4 2.5-2.5L20 17M15.5 8.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6',
 palette:'M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.6 0-1.3-1-1.6-1-2.6 0-.8.7-1.3 1.5-1.3H16a5 5 0 0 0 5-5c0-4-4-7.5-9-7.5zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
 shield:'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM9 12l2 2 4-4', check:'M20 6 9 17l-5-5', trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
 search:'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM16 16l4 4', plus:'M12 5v14M5 12h14', bell:'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0',
 help:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 17.2v.1', grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
 list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', sort:'M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3', filter:'M4 5h16l-6 8v6l-4-2v-4z',
 sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z', chev:'m6 9 6 6 6-6', chevr:'m9 6 6 6-6 6', chevl:'m15 6-6 6 6 6',
 folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', upload:'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
 star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
 users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6', cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
 printer:'M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z', more:'M5 12h.01M12 12h.01M19 12h.01',
 arrow:'M5 12h14m-6-6 6 6-6 6', x:'M6 6l12 12M18 6 6 18', send:'M4 12 20 4l-6 16-3-7z', download:'M12 4v12M7 11l5 5 5-5M4 20h16',
 inbox:'M4 13l3-8h10l3 8v6H4zM4 13h5l1 2h4l1-2h5', kanban:'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z', copy:'M8 8h12v12H8zM4 16V4h12',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'
};
const ic = (n, s=17, st='') => `<svg class="ic" viewBox="0 0 24 24" style="width:${s}px;height:${s}px;${n==='more'?'stroke-width:3;':''}${st}"><path d="${IC[n]}"/></svg>`;

/* Beispiel-Ablage */
const LIB = [
  {k:'einl', n:'Einladung Beste Freunde treffen', art:'Einladung', fo:'Quadrat', se:'1 Seite', t:'gerade eben', img:'ev-veuve', st:'Entwurf'},
  {k:'gut', n:'Gutschein La Petite Suisse', art:'Gutschein', fo:'DL quer', se:'1 Seite', t:'vor 40 Min.', st:'Druckfertig'},
  {k:'flyer', n:'Tea Time im Advent', art:'Flyer', fo:'A5 hoch', se:'2 Seiten', t:'gestern', img:'bar-teatime-2', st:'Entwurf'},
  {k:'karte', n:'Speisekarte La Petite Suisse', art:'Speisekarte', fo:'A4 hoch', se:'2 Seiten', t:'vor 2 Tagen', st:'Druckfertig'},
  {k:'plakat', n:'Silvester im Ballsaal', art:'Plakat', fo:'A3 hoch', se:'1 Seite', t:'vor 3 Tagen', img:'ev-silvester', st:'Hinweis'},
  {k:'post', n:'Ansichtskarte Interlaken', art:'Ansichtskarte', fo:'A6 quer', se:'2 Seiten', t:'vor 4 Tagen', img:'haus-winter', st:'Druckfertig'},
  {k:'insta', n:'Cocktail des Monats', art:'Instagram', fo:'4 : 5', se:'1 Bild', t:'vor 5 Tagen', img:'g-manhattan', st:'Entwurf'},
  {k:'flyer', n:'Fondue am Kamin', art:'Flyer', fo:'A5 hoch', se:'1 Seite', t:'vor 6 Tagen', img:'fondue', st:'Entwurf', ti:'Fondue am Kamin', zl:'La Petite Suisse'},
];
const RAT = {gut:.471, einl:1, flyer:1.414, karte:1.414, plakat:1.414, post:.709, insta:1.25, leer:1.414};

function P(k, w, o={}){
  const h = Math.round(w*(RAT[k]||1.414)), fs = (w/10).toFixed(2);
  const st = `width:${w}px;height:${h}px;font-size:${fs}px;${o.rot?`transform:rotate(${o.rot}deg);`:''}${o.st||''}`;
  const img = o.img; let inn = '', cls = '';
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
const FIT = (k, bw, bh, o={}) => P(k, Math.round(Math.min(bw*(o.fw||.62), bh*(o.fh||.74)/(RAT[k]||1.414))), o);
const FITL = (i, bw, bh, o={}) => { const L = LIB[i]; return FIT(L.k, bw, bh, {img:L.img, ti:L.ti, zl:L.zl, ...o}); };
const STX = s => s==='Druckfertig' ? `<span class="stx ok">Druckfertig</span>` : s==='Hinweis' ? `<span class="stx warn">1 Hinweis</span>` : `<span class="stx">${s}</span>`;

/* ---------- Bausteine des Werkzeugs ---------- */
const MARKE = (sub='Media Printing Studio') => `<div class="sb-marke">${Z(32)}<div><b>Grand Beau-Rivage</b><small>${sub}</small></div></div>`;
const KB = (t, v='pri', o={}) => `<span class="bt ${v} knauf ${o.gross?'gross':''}" style="${o.st||''}">${t}<i>${ic(o.i||'arrow',14)}</i></span>`;
const BT = (t, v='', i='', st='') => `<span class="bt ${v}" style="${st}">${i?ic(i,16):''}${t}</span>`;
const SEL = (t, st='') => `<span class="sel" style="${st}">${t}${ic('chev',14)}</span>`;
const SEG = (arr, an=0, st='') => `<span class="seg" style="${st}">${arr.map((t,i)=>`<span class="${i===an?'an':''}">${t}</span>`).join('')}</span>`;
function SB(o={}){
  const n = o.leer ? ['0','12','319'] : ['8','12','319'];
  const items = [['home','Start'],['files','Meine Medien',n[0]],['layout','Vorlagen',n[1]],['image','Fotos des Hauses',n[2]],['palette','Marke'],['shield','Druckprüfung']];
  const akt = o.akt || 'Start';
  const nav = [...items, ...(o.mehr||[])].map(([i,t,c])=>`<a class="${t===akt?'an':''}">${ic(i)}<span>${t}</span>${c?`<em>${c}</em>`:''}</a>`).join('');
  const bet = `<div class="sb-h">Betriebe</div><div class="nav">${['L’Ambiance','La Petite Suisse','La Belle Rivière','Le Vieux Rivage','La Vallée SPA','La Belle Epoque'].map(b=>`<a>${ic('folder',16)}<span>${b}</span></a>`).join('')}</div>`;
  return `<aside class="sb">${MARKE()}${o.neu===false?'':`<span class="bt pri" style="width:100%;margin-bottom:14px">${ic('plus',16)} Neu erstellen</span>`}<div class="nav">${nav}</div>${bet}
    <div class="sb-fuss"><span class="av">MK</span><div style="flex:1"><div style="font-size:13px">Marketing</div><div class="klein sub">Grand Beau-Rivage</div></div>${ic('help',18,'color:var(--sub)')}</div></aside>`;
}
function TB(x, o={}){
  return `<div class="tb" style="left:${x}px;${o.st||''}"><div class="such" style="width:${o.sw||420}px">${ic('search',16)}<span>${o.q?`<span style="color:var(--tx)">${o.q}</span><span class="caret" style="background:var(--tx)"></span>`:'Medien, Vorlagen und Fotos durchsuchen'}</span><kbd>⌘ K</kbd></div><div style="flex:1"></div><span class="ibt">${ic('help',18)}</span><span class="ibt">${ic('bell',18)}</span>${o.neu?KB('Neu erstellen'):''}<span class="av">MK</span></div>`;
}
function PK(o={}){
  return `<div class="pk" style="width:${o.w||640}px;${o.st||''}"><div class="ein">${o.ph||'Beschreiben Sie, was entstehen soll, zum Beispiel: Plakat für das Winterchalet im Garten'}</div>
   <div class="leiste">${o.sels===false?'':`${SEL('Format: automatisch')}${SEL('Betrieb: ganzes Haus')}<span class="ibt">${ic('image',17)}</span>`}<div style="flex:1"></div>${KB(o.knopf||'Fünf Entwürfe', o.v||'pri')}</div></div>`;
}
function FC(i, w, h, o={}){
  const L = LIB[i];
  return `<div class="fc ${o.sel?'gew':''}" style="width:${w}px"><div class="th" style="height:${h}px">${FITL(i, w, h)}</div><div class="nm">${L.n}</div><div class="mt"><span>${L.fo} · ${L.t}</span>${o.st?STX(L.st):''}</div></div>`;
}
const GRID = (ids, cols, w, h, gx=20, gy=26, o={}) => `<div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:${gy}px ${gx}px">${ids.map(i=>FC(i,w,h,{...o, sel:o.sel===i})).join('')}</div>`;
const FORMATE = [['Plakat','A3 hoch',297,420],['Flyer','A5 hoch',148,210],['Speisekarte','A4 hoch',210,297],['Einladung','Quadrat',150,150],['Gutschein','DL quer',210,99],['Ansichtskarte','A6 quer',148,105],['Instagram','Beitrag 4 : 5',108,135],['Tischaufsteller','A6 hoch',105,148]];
const RF = (w, h, box, st='') => { const s = box/Math.max(w,h); return `<span class="rf" style="display:block;width:${Math.round(w*s)}px;height:${Math.round(h*s)}px;${st}"></span>`; };
const FMTS = (w=128, gap=12, box=44) => `<div class="zeile" style="gap:${gap}px">${FORMATE.map(([n,f,a,b])=>`<div class="fmt" style="width:${w}px"><div style="height:${box+4}px;display:grid;place-items:center">${RF(a,b,box)}</div><b>${n}</b><small>${f}</small></div>`).join('')}</div>`;
const KOPF = (titel, rechts='', sub='') => `<div class="zeile" style="justify-content:space-between;width:100%"><div><h1 class="h1">${titel}</h1>${sub?`<div class="sub" style="margin-top:6px">${sub}</div>`:''}</div><div class="zeile" style="gap:10px">${rechts}</div></div>`;
const H3 = (t, rechts='') => `<div class="zeile" style="justify-content:space-between;width:100%;margin-bottom:14px"><h3 class="h3">${t}</h3>${rechts}</div>`;
const ALLE = t => `<span class="lnk">${t} ${ic('chevr',14)}</span>`;
const RAIL = (akt=0) => `<div class="a" style="left:0;top:0;bottom:0;width:64px;background:#1b2033 var(--td) 0 0/340px;border-right:1px solid rgba(210,191,152,.2);display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:16px">${Z(30,'#e2c78c','margin-bottom:18px')}${['home','files','layout','image','palette','shield'].map((n,i)=>`<span class="ibt" style="color:${i===akt?'#f0e3c2':'rgba(240,227,194,.55)'};${i===akt?'background:rgba(255,255,255,.08)':''}">${ic(n,19)}</span>`).join('')}<div style="flex:1"></div><span class="ibt" style="color:rgba(240,227,194,.55)">${ic('help',19)}</span><span class="av" style="margin:10px 0 16px">MK</span></div>`;
const DUNKELBT = 'background:rgba(255,255,255,.06);color:#f7f0e3;border-color:rgba(210,191,152,.25)';
const ZEILEBILD = (i, s=44) => `<span style="width:${s}px;height:${s}px;display:grid;place-items:center;background:var(--thumb);border-radius:8px;flex:none">${FITL(i,s-4,s-4,{fw:.9,fh:.9})}</span>`;

/* ---------------------------------------------------------------- die dreissig */
const V = [];
const add = (name, idee, html) => V.push({name, idee, html});

function START(th){
  return `<div class="sc ${th}">${SB()}${TB(248)}
   ${A(288,92,`<div class="ban" style="width:1112px;height:236px">
     ${A(36,32,`<h1 class="h1" style="font-size:38px;color:#f7f0e3">Was soll heute entstehen?</h1><div style="margin-top:8px;font-size:14px;color:rgba(247,240,227,.7)">Ein Satz genügt. Das Studio entwirft fünf Varianten im Stil des Hauses.</div>`)}
     ${A(36,118,PK({w:660, ph:'Zum Beispiel: Plakat für das Winterchalet im Garten'}))}
     ${A(830,40,PL(4,118,{rot:-6}))}${A(950,22,PL(2,104,{rot:5}))}${A(905,132,PL(1,170,{rot:-2}))}</div>`)}
   ${A(288,356,`<div style="width:1112px">${H3('Schnell anlegen', ALLE('Alle Formate'))}${FMTS(128,12)}</div>`)}
   ${A(288,540,`<div style="width:1112px">${H3('Zuletzt bearbeitet', ALLE('Alle 8 ansehen'))}${GRID([0,1,2,3,4],5,208,170,18,26,{st:1})}</div>`)}
  </div>`;
}
add('Startseite hell', 'Klassischer Aufbau wie bei Canva oder Adobe Express: Seitenleiste mit Bereichen und Betrieben, oben die Suche, darunter ein Feld zum Beschreiben, Formate zum schnellen Anlegen und die zuletzt bearbeiteten Medien mit Stand.', START('hell'));
add('Startseite dunkel', 'Derselbe Aufbau im dunklen Register des Hauses: Marine mit Tapete als Raum, helle Schrift, Gold nur für Zeichen und Hauptknopf.', START('dunkel'));

add('Leiste und Ordner', 'Aufbau wie Figma: schmale Leiste mit Symbolen, daneben die Ordner nach Betrieben und Anlässen, rechts die Medien mit Ansicht, Sortierung und Filter.',
 `<div class="sc hell">${RAIL(1)}
  <div class="a" style="left:64px;top:0;bottom:0;width:240px;background:#fbf7ef;border-right:1px solid var(--li);padding:20px 12px">
   <div style="padding:2px 10px 16px"><b class="caps" style="font-size:11px">Grand Beau-Rivage</b><div class="klein sub" style="margin-top:4px">Media Printing Studio</div></div>
   <div class="nav">${[['files','Alle Medien','8',1],['clock','Zuletzt'],['star','Favoriten','2'],['trash','Papierkorb']].map(([i,t,c,a])=>`<a class="${a?'an':''}">${ic(i)}<span>${t}</span>${c?`<em>${c}</em>`:''}</a>`).join('')}</div>
   <div class="sb-h">Betriebe</div><div class="nav">${[['L’Ambiance','0'],['La Petite Suisse','3'],['La Belle Rivière','1'],['Le Vieux Rivage','2'],['La Vallée SPA','0'],['La Belle Epoque','1']].map(([t,c])=>`<a>${ic('folder',16)}<span>${t}</span><em>${c}</em></a>`).join('')}</div>
   <div class="sb-h">Anlässe</div><div class="nav">${['Advent & Silvester','Hochzeiten','Tagungen'].map(t=>`<a>${ic('folder',16)}<span>${t}</span></a>`).join('')}</div></div>
  ${TB(304)}
  ${A(336,96,`<div style="width:1072px">${KOPF('Alle Medien', SEG([ic('grid',15),ic('list',15)])+SEL('Zuletzt geändert')+SEL('Alle Formate')+KB('Neu erstellen'))}</div>`)}
  ${A(336,176,GRID([0,1,2,3,4,5,6,7],4,254,180,18,28,{st:1}))}
 </div>`);

add('Oben navigiert', 'Ohne Seitenleiste: Hauptbereiche als Reiter oben, in der Mitte die grosse Frage mit Feld und Einstellungen, darunter Formate und die letzten Medien. Ruhig und offen.',
 `<div class="sc hell"><div class="a zeile" style="left:0;right:0;top:0;height:66px;padding:0 32px;gap:34px;border-bottom:1px solid var(--li);background:#fbf7ef">
   <div class="zeile" style="gap:11px">${Z(30,'var(--gl)')}<div><b class="caps" style="font-size:11px;display:block">Grand Beau-Rivage</b><small class="sub" style="font-size:11px">Media Printing Studio</small></div></div>
   <div class="zeile" style="gap:28px;margin-left:40px;height:66px">${['Start','Meine Medien','Vorlagen','Fotos','Marke','Druckprüfung'].map((t,i)=>`<span style="height:66px;display:flex;align-items:center;font-size:14px;${i===0?'box-shadow:inset 0 -2px 0 var(--akz)':'color:var(--sub)'}">${t}</span>`).join('')}</div>
   <div style="flex:1"></div><span class="ibt">${ic('search',18)}</span><span class="ibt">${ic('help',18)}</span>${KB('Neu erstellen')}<span class="av">MK</span></div>
  <div class="a mitte" style="left:0;right:0;top:122px"><h1 class="h1" style="font-size:52px">Was möchten Sie gestalten?</h1><div class="sub" style="margin-top:12px;font-size:15px">Beschreiben Sie es oder wählen Sie ein Format.</div>${PK({w:820, st:'margin-top:30px;text-align:left'})}</div>
  <div class="a zeile" style="left:0;right:0;top:420px;justify-content:center">${FMTS(122,12,40)}</div>
  ${A(150,590,`<div style="width:1140px">${H3('Zuletzt bearbeitet', ALLE('Alle ansehen'))}${GRID([0,1,2,3,4,5],6,175,140,18,26)}</div>`)}
 </div>`);

add('Übersicht mit Zahlen', 'Startet wie ein Cockpit: wie viele Medien, was druckfertig ist, was noch einen Hinweis hat. Darunter Weitermachen und Neu anlegen nebeneinander.',
 `<div class="sc hell">${SB()}${TB(248)}
  ${A(288,96,KOPF('Guten Morgen','','Montag, 12. Oktober 2026'))}
  ${A(288,186,`<div class="zeile" style="gap:20px">${[['8','Medien im Studio','files'],['3','druckfertig','check'],['1','mit Hinweis in der Druckprüfung','shield'],['319','Fotos des Hauses','image']].map(([z,t,i])=>`<div class="panel" style="width:263px;padding:20px 22px"><div class="zeile" style="justify-content:space-between"><span class="h1" style="font-size:40px">${z}</span>${ic(i,20,'color:var(--sub)')}</div><div class="sub" style="margin-top:6px">${t}</div></div>`).join('')}</div>`)}
  ${A(288,340,`<div class="panel" style="width:690px;height:430px;padding:24px">${H3('Weitermachen')}<div class="zeile" style="gap:28px;align-items:flex-start"><div style="width:320px;height:320px;border-radius:12px;background:var(--thumb);display:grid;place-items:center">${PL(0,220)}</div><div><div class="sub klein">Einladung · gerade eben</div><h2 class="h2" style="font-size:30px;margin-top:8px">Beste Freunde treffen</h2><div class="sub" style="margin-top:10px;line-height:1.7">Quadrat 150 × 150 mm<br>1 Seite · Grund Papier</div><div style="margin-top:16px">${STX('Entwurf')}</div><div class="zeile" style="gap:10px;margin-top:30px">${KB('Öffnen')}${BT('PDF','','download')}</div></div></div></div>`)}
  ${A(998,340,`<div class="panel" style="width:402px;height:430px;padding:24px">${H3('Neu anlegen')}<div style="border:1px solid var(--li2);border-radius:12px;padding:14px;color:var(--sub);height:96px">Beschreiben Sie, was entstehen soll …</div><div style="margin-top:12px">${KB('Fünf Entwürfe','pri',{st:'width:100%;justify-content:space-between'})}</div><div class="sub klein" style="margin:22px 0 6px">Oder ein Format</div>${FORMATE.slice(1,5).map(([n,f,a,b])=>`<div class="zeile" style="gap:14px;height:44px;border-bottom:1px solid var(--li)"><span style="width:26px;display:grid;place-items:center">${RF(a,b,22)}</span><span style="flex:1">${n}</span><span class="sub klein">${f}</span>${ic('chevr',14,'color:var(--sub)')}</div>`).join('')}</div>`)}
 </div>`);

add('Nach Betrieben', 'Die Medien sind nach den Teilen des Hauses geordnet: jedes Restaurant, die Bar, das Spa, der Ballsaal als eigene Mappe mit Foto und den neuesten Stücken.',
 `<div class="sc hell">${SB({akt:'Meine Medien'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Nach Betrieben', SEG(['Betriebe','Anlässe','Alle'])+KB('Neu erstellen'))}</div>`)}
  <div class="a" style="left:288px;top:170px;display:grid;grid-template-columns:repeat(3,357px);gap:20px">${[['rest-ambiance-6','Restaurant «L’Ambiance»','Mai bis Oktober',[]],['rest-suisse-2','Restaurant «La Petite Suisse»','November bis April',[3,1,7]],['terrasse-lounge','Terrasse «La Belle Rivière»','Lounge & Bar an der Aare',[0]],['bar','Bar «Le Vieux Rivage»','täglich 17.00 – 24.00 Uhr',[2,6]],['spa-pool','La Vallée SPA','Schwimmbad, Sauna, Beauty',[]],['saal','Ballsaal «La Belle Epoque»','Feste und Tagungen',[4]]].map(([b,n,z,ids])=>`<div class="panel" style="overflow:hidden"><div class="foto" style="height:120px;background-image:url(${F(b)})"></div><div style="padding:16px 18px"><div class="zeile" style="justify-content:space-between"><h2 class="h2" style="font-size:19px">${n}</h2>${ic('more',18,'color:var(--sub)')}</div><div class="sub klein" style="margin-top:4px">${z}</div><div class="zeile" style="gap:10px;margin-top:14px;height:58px;align-items:flex-end">${ids.length?ids.map(i=>FITL(i,70,56,{fw:1,fh:1})).join(''):'<span class="sub klein">Noch keine Medien</span>'}<span style="margin-left:auto" class="sub klein">${ids.length} Medien</span></div></div></div>`).join('')}</div>
 </div>`);

add('Liste wie im Finder', 'Für alle, die viele Medien verwalten: eine Liste mit Art, Format, Seiten, Stand und Datum. Mehrere auswählen und gemeinsam als PDF speichern oder kopieren.',
 `<div class="sc hell">${SB({akt:'Meine Medien'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Meine Medien', SEG([ic('grid',15),ic('list',15)],1)+SEL('Alle Arten')+SEL('Zuletzt geändert')+KB('Neu erstellen'))}</div>`)}
  ${A(288,172,`<table class="tbl" style="width:1112px"><tr><th style="width:40px"><span class="kst"></span></th><th>Name</th><th>Art</th><th>Format</th><th>Seiten</th><th>Stand</th><th>Geändert</th><th></th></tr>${LIB.map((L,i)=>`<tr class="${i===1||i===3?'an':''}"><td><span class="kst ${i===1||i===3?'an':''}"></span></td><td><div class="zeile" style="gap:14px">${ZEILEBILD(i)}${L.n}</div></td><td class="sub">${L.art}</td><td class="sub">${L.fo}</td><td class="sub">${L.se}</td><td>${STX(L.st)}</td><td class="sub">${L.t}</td><td>${ic('more',18,'color:var(--sub)')}</td></tr>`).join('')}</table>`)}
  ${A(560,816,`<div class="zeile" style="gap:12px;padding:8px 8px 8px 18px;border-radius:14px;background:#1b2033;color:#f7f0e3;box-shadow:0 20px 40px -16px rgba(0,0,0,.5)"><span style="margin-right:10px">2 ausgewählt</span>${BT('PDF für die Druckerei','gold','download')}${BT('Kopieren','','copy',DUNKELBT)}${BT('Löschen','','trash',DUNKELBT)}</div>`)}
 </div>`);

add('Auftrag links, Medien rechts', 'Links liegt immer das Formular für ein neues Medium: Beschreibung, Format, Betrieb, Grund und Fotos. Rechts die eigenen Medien. Kein Suchen nach dem Anfang.',
 `<div class="sc hell">${SB({neu:false})}
  <div class="a" style="left:248px;top:0;bottom:0;width:440px;background:#fffdf8;border-right:1px solid var(--li);padding:30px 32px">
   <h2 class="h2" style="font-size:28px">Neues Medium</h2><div class="sub" style="margin-top:6px">Das Studio entwirft fünf Varianten.</div>
   <div class="klein sub" style="margin:26px 0 8px">Beschreibung</div><div style="height:120px;border:1px solid var(--li2);border-radius:12px;padding:14px;font-size:15px;line-height:1.5">Flyer für die Tea Time im Advent, vorne die Etagere, hinten die Zeiten<span class="caret" style="background:var(--tx)"></span></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px"><div><div class="klein sub" style="margin-bottom:8px">Format</div>${SEL('Flyer A5 hoch','width:100%;justify-content:space-between')}</div><div><div class="klein sub" style="margin-bottom:8px">Betrieb</div>${SEL('Le Vieux Rivage','width:100%;justify-content:space-between')}</div></div>
   <div class="klein sub" style="margin:20px 0 8px">Grund</div><div class="zeile" style="gap:12px">${[['Marine','#1b2033 var(--td) 0 0/120px',1],['Papier','#f7f0e3'],['Creme','#efe4cf var(--th) 0 0/120px']].map(([n,b,a])=>`<div style="text-align:center"><div style="width:80px;height:54px;border-radius:9px;background:${b};box-shadow:0 0 0 1px var(--li2)${a?',0 0 0 3px #fffdf8,0 0 0 4.5px #1b2033':''}"></div><div class="klein" style="margin-top:6px">${n}</div></div>`).join('')}</div>
   <div class="klein sub" style="margin:20px 0 8px">Fotos <span style="float:right">aus 319</span></div><div class="zeile" style="gap:8px">${['bar-teatime-2','bar','g-heisse-schokolade'].map(f=>`<div class="foto" style="width:80px;height:60px;border-radius:8px;background-image:url(${F(f)})"></div>`).join('')}<div style="width:80px;height:60px;border-radius:8px;border:1px dashed var(--li2);display:grid;place-items:center;color:var(--sub)">${ic('plus',18)}</div></div>
   ${A(32,800,KB('Fünf Entwürfe anlegen','pri',{gross:1,st:'width:376px;justify-content:space-between'}))}</div>
  ${TB(688,{sw:360})}
  ${A(720,96,`<div style="width:680px">${H3('Zuletzt bearbeitet', SEL('Zuletzt geändert'))}${GRID([0,1,2,3,4,5],3,214,170,19,26,{st:1})}</div>`)}
 </div>`);

add('Befehlszeile', 'Für schnelles Arbeiten: ein einziges Feld zum Beschreiben, Suchen und Öffnen. Tasten statt Klicks, die Ergebnisse sortiert nach Weitermachen, Neu, Vorlagen und Fotos.',
 `<div class="sc dunkel">${A(36,28,MARKE())}
  <div class="a zeile" style="left:0;right:0;top:640px;justify-content:center;gap:40px;opacity:.18">${PL(1,280)}${PL(0,190)}${PL(4,170)}${PL(5,240)}</div>
  <div class="a" style="left:360px;top:130px;width:720px;border-radius:18px;background:#fdfaf4;color:#1a1d28;box-shadow:0 0 0 1px rgba(210,191,152,.4),0 40px 80px -30px rgba(0,0,0,.8);--sub:rgba(26,29,40,.55);--li:rgba(26,29,40,.08);--li2:rgba(26,29,40,.15);--fl:#fdfaf4;--tx:#1a1d28">
   <div class="zeile" style="gap:14px;height:68px;padding:0 22px;border-bottom:1px solid var(--li)">${ic('search',20,'color:var(--sub)')}<span style="flex:1;font-size:19px">Tea<span class="caret" style="background:#1a1d28"></span></span><kbd>esc</kbd></div>
   ${[['Weitermachen',[[2,'Tea Time im Advent','Flyer A5 · gestern',1],[0,'Beste Freunde treffen','Einladung · gerade eben']]],['Neu',[['s','Fünf Entwürfe zu «Tea …»','Eingabe']]],['Vorlagen',[['f','Flyer mit Foto','A5 hoch'],['f','Aushang','A4 hoch']]],['Fotos',[['p','Tea Time: Etagere mit Canapés','Bar & Getränke']]]].map(([g,rows])=>`<div style="font:10px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--sub);padding:14px 22px 6px">${g}</div>${rows.map(([i,t,z,an])=>`<div class="zeile" style="gap:14px;height:52px;margin:0 8px;padding:0 14px;border-radius:10px;${an?'background:#1b2033;color:#f7f0e3':''}"><span style="width:34px;height:34px;display:grid;place-items:center">${typeof i==='number'?FITL(i,32,32,{fw:.8,fh:.9}):i==='s'?`<span class="av kl" style="width:28px;height:28px">${ic('sparkle',14)}</span>`:i==='p'?`<span class="foto" style="width:32px;height:32px;border-radius:6px;background-image:url(${F('bar-teatime-2')})"></span>`:RF(148,210,26)}</span><span style="flex:1;font-size:15px">${t}</span><span style="font-size:12px;${an?'color:#d2bf98':'color:var(--sub)'}">${z}</span></div>`).join('')}`).join('')}
   <div class="zeile" style="gap:18px;padding:14px 22px;margin-top:8px;border-top:1px solid var(--li);font-size:12px;color:var(--sub)"><span><kbd>↑</kbd> <kbd>↓</kbd> wählen</span><span><kbd>↵</kbd> öffnen</span><span><kbd>⌘</kbd> <kbd>N</kbd> neu</span></div></div>
 </div>`);

add('Stand der Medien', 'Die Medien als Tafel nach Stand: Entwurf, Druckprüfung, freigegeben, bei der Druckerei. So sieht man auf einen Blick, was als Nächstes zu tun ist.',
 `<div class="sc hell">${SB({mehr:[['kanban','Stand']], akt:'Stand'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Stand der Medien', SEL('Alle Betriebe')+KB('Neu erstellen'))}</div>`)}
  <div class="a zeile" style="left:288px;top:172px;gap:20px;align-items:flex-start">${[['Entwurf',[7,6,2,0]],['Druckprüfung',[4]],['Freigegeben',[3]],['Bei der Druckerei',[1,5]]].map(([t,ids])=>`<div style="width:263px;border-radius:14px;background:var(--fl2);padding:12px"><div class="zeile" style="justify-content:space-between;padding:4px 6px 12px"><span class="h3">${t}</span><span class="sub klein">${ids.length}</span></div>${ids.map(i=>`<div style="background:#fffdf8;border-radius:10px;border:1px solid var(--li);padding:10px;margin-bottom:10px;display:flex;gap:12px;align-items:center">${ZEILEBILD(i,52)}<div style="min-width:0"><div style="font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${LIB[i].n}</div><div class="sub klein" style="margin-top:3px">${LIB[i].fo} · ${LIB[i].t}</div>${i===4?'<div style="margin-top:6px"><span class="stx warn">Text 3 mm vom Rand</span></div>':''}</div></div>`).join('')}<div class="sub klein zeile" style="gap:6px;padding:6px">${ic('plus',14)} Hinzufügen</div></div>`).join('')}</div>
 </div>`);

const OKT = (() => { const t=[]; for(let d=28; d<=30; d++) t.push([d,0]); for(let d=1; d<=31; d++) t.push([d,1]); t.push([1,0]); return t; })();
add('Planung im Kalender', 'Die Medien hängen an ihrem Datum: wann die Einladung raus muss, wann die Karte gewechselt wird. Rechts stehen die Medien ohne Termin.',
 `<div class="sc hell">${SB({mehr:[['cal','Planung']], akt:'Planung'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Oktober 2026', `<span class="ibt r">${ic('chevl',16)}</span><span class="ibt r">${ic('chevr',16)}</span>`+SEG(['Woche','Monat'],1)+KB('Neu erstellen'))}</div>`)}
  <div class="a" style="left:288px;top:170px;width:850px;border:1px solid var(--li);border-radius:14px;overflow:hidden;background:#fffdf8">
   <div style="display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--li)">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(t=>`<div class="sub klein" style="padding:10px 12px">${t}</div>`).join('')}</div>
   <div style="display:grid;grid-template-columns:repeat(7,1fr)">${OKT.map(([d,m],i)=>{const ev={12:0,16:6,24:1,30:3}[m?d:-1];return `<div style="height:122px;border-right:${i%7<6?'1px solid var(--li)':'0'};border-bottom:1px solid var(--li);padding:8px;${m?'':'background:var(--fl2)'}"><span style="font-size:12px;${m&&d===12?'display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#1b2033;color:#f0e3c2':m?'':'color:var(--sub)'}">${d}</span>${ev!==undefined?`<div style="margin-top:8px;display:flex;gap:7px;align-items:center;background:var(--hov);border-radius:7px;padding:5px">${FITL(ev,26,26,{fw:.9,fh:.9})}<span style="font-size:11px;line-height:1.2;overflow:hidden;max-height:28px">${LIB[ev].n}</span></div>`:''}</div>`}).join('')}</div></div>
  ${A(1160,170,`<div class="panel" style="width:240px;padding:18px">${H3('Ohne Termin')}${[2,4,5,7].map(i=>`<div class="zeile" style="gap:12px;height:56px;border-bottom:1px solid var(--li)">${FITL(i,36,40,{fw:.9,fh:.9})}<span style="font-size:13px;line-height:1.25">${LIB[i].n}</span></div>`).join('')}<div class="sub klein" style="margin-top:12px">Auf einen Tag ziehen, um zu planen.</div></div>`)}
 </div>`);

add('Vorlagen des Hauses', 'Startet in der Vorlagen-Galerie, links nach Art und Format gefiltert. Jede Vorlage ist schon im Stil des Hauses gesetzt und wird nur noch angepasst.',
 `<div class="sc hell">${SB({akt:'Vorlagen'})}${TB(248)}
  ${A(288,96,`<div style="width:200px"><h3 class="h3" style="margin-bottom:10px">Arten</h3>${[['Alle',12,1],['Karten & Menüs',3],['Aushänge & Plakate',3],['Anlässe & Geschenke',4],['Digital',2]].map(([t,c,a])=>`<div class="zeile" style="justify-content:space-between;height:34px;padding:0 10px;border-radius:8px;${a?'background:var(--hov)':''}"><span>${t}</span><span class="sub klein">${c}</span></div>`).join('')}<h3 class="h3" style="margin:26px 0 10px">Formate</h3>${['A3 hoch','A4 hoch','A5 hoch','A6 quer','DL quer','Quadrat','Instagram'].map((t,i)=>`<div class="zeile" style="gap:10px;height:30px"><span class="kst ${i===2?'an':''}"></span><span class="${i===2?'':'sub'}">${t}</span></div>`).join('')}</div>`)}
  ${A(520,96,`<div style="width:880px">${KOPF('Vorlagen', SEG(['Vom Haus','Eigene']))}</div>`)}
  <div class="a" style="left:520px;top:170px;display:grid;grid-template-columns:repeat(4,205px);gap:26px 20px">${[['karte','Speisekarte klassisch','A4 hoch',{}],['flyer','Flyer mit Foto','A5 hoch',{img:'bar-teatime-2'}],['einl','Einladung Quadrat','Quadrat',{img:'hochzeit-tafel',ti:'Wir heiraten'}],['gut','Gutschein','DL quer',{}],['plakat','Plakat dunkel','A3 hoch',{img:'ev-silvester',ti:'Ein Abend im Ballsaal'}],['post','Ansichtskarte','A6 quer',{img:'haus-sommer-berge'}],['insta','Instagram-Beitrag','4 : 5',{img:'bar-ananas',ti:'Heute an der Bar'}],['flyer','Aushang mit Zeiten','A4 hoch',{img:'spa-pool',ti:'Ruhige Stunden',zl:'La Vallée SPA'}]].map(([k,n,f,o])=>`<div class="fc"><div class="th" style="height:200px">${FIT(k,205,200,o)}</div><div class="nm">${n}</div><div class="mt">${f}</div></div>`).join('')}</div>
 </div>`);

add('Die Marke als Ausgang', 'Die Startseite zeigt, was das Studio über das Haus weiss: Farben, Schriften, Zeichen, Tapete und Fotos. Daraus wird gestaltet, deshalb sieht es jeder sofort.',
 `<div class="sc hell">${SB({akt:'Marke'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Die Marke des Hauses', KB('Mit der Marke gestalten'), 'Jedes Medium entsteht aus diesen Farben, Schriften, Zeichen und Fotos.')}</div>`)}
  ${A(288,196,`<div class="panel" style="width:546px;height:250px;padding:22px">${H3('Farben')}<div class="zeile" style="gap:12px">${[['Marine','#1b2033'],['Papier','#f7f0e3'],['Creme','#efe4cf'],['Sand','#e2d2b5'],['Gold','#d2bf98'],['Messing','#b7a27a'],['Bar-Rot','#7a1f2b']].map(([n,c])=>`<div style="width:62px"><div style="height:62px;border-radius:10px;background:${c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"></div><div style="font-size:12px;margin-top:8px">${n}</div><div class="sub" style="font-size:10.5px">${c}</div></div>`).join('')}</div></div>`)}
  ${A(854,196,`<div class="panel" style="width:546px;height:250px;padding:22px">${H3('Schriften')}${[['Cormorant Garamond','var(--serif)','Titel und Namen'],['Cinzel','var(--caps)','Wortmarke'],['Instrument Sans','var(--sans)','Fliesstext'],['DM Mono','var(--mono)','Zeiten und Preise']].map(([n,f,w])=>`<div class="zeile" style="gap:16px;height:44px;border-bottom:1px solid var(--li)"><span style="font:500 24px ${f};width:44px">Aa</span><span style="flex:1">${n}</span><span class="sub klein">${w}</span></div>`).join('')}</div>`)}
  ${A(288,466,`<div class="panel" style="width:263px;height:300px;padding:22px">${H3('Zeichen')}<div style="height:200px;border-radius:12px;background:#1b2033 var(--td) 0 0/200px;display:grid;place-items:center">${Z(110,'#e2c78c')}</div></div>`)}
  ${A(571,466,`<div class="panel" style="width:263px;height:300px;padding:22px">${H3('Tapete')}<div class="zeile" style="height:200px;border-radius:12px;overflow:hidden"><div style="flex:1;height:100%;background:#1b2033 var(--td) 0 0/200px"></div><div style="flex:1;height:100%;background:#efe4cf var(--th) 0 0/200px"></div></div></div>`)}
  ${A(854,466,`<div class="panel" style="width:546px;height:300px;padding:22px">${H3('Fotos', ALLE('Alle 319'))}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${['haus-aare','halle-2','bar','spa-pool','rest-suisse-2','saal'].map(f=>`<div class="foto" style="height:96px;border-radius:8px;background-image:url(${F(f)})"></div>`).join('')}</div></div>`)}
 </div>`);

add('Assistent an der Seite', 'Rechts arbeitet ein Assistent mit, wie ein Gespräch: man schreibt, er antwortet mit fünf Entwürfen und Hinweisen. Links bleiben die eigenen Medien.',
 `<div class="sc hell">${SB()}${TB(248,{st:'right:360px',sw:360})}
  ${A(288,96,`<div style="width:720px">${H3('Zuletzt bearbeitet', SEL('Zuletzt geändert'))}${GRID([0,1,2,3,4,5],3,226,180,21,26,{st:1})}</div>`)}
  <div class="a" style="right:0;top:0;bottom:0;width:360px;border-left:1px solid var(--li);background:#fffdf8;display:flex;flex-direction:column">
   <div class="zeile" style="gap:10px;height:62px;padding:0 20px;border-bottom:1px solid var(--li)"><span class="av kl">${ic('sparkle',12)}</span><span class="h3">Assistent</span><div style="flex:1"></div>${ic('more',18,'color:var(--sub)')}</div>
   <div style="flex:1;padding:20px;display:flex;flex-direction:column;gap:14px">
    <div style="align-self:flex-end;max-width:260px;background:#1b2033;color:#f7f0e3;border-radius:14px 14px 4px 14px;padding:11px 14px">Plakat für das Winterchalet im Garten, dunkel, mit dem Haus im Schnee</div>
    <div style="max-width:300px;background:var(--fl2);border-radius:14px 14px 14px 4px;padding:12px 14px">Fünf Entwürfe sind fertig. Die Öffnungszeiten des Chalets fehlen noch, ich habe «[Zeiten]» eingesetzt.</div>
    <div class="zeile" style="gap:8px;align-items:flex-end">${[['plakat',{img:'haus-winter',ti:'Das Winterchalet'}],['plakat',{img:'food-winter',ti:'Winterchalet'}],['flyer',{img:'haus-winter',ti:'Im Garten'}],['post',{img:'haus-winter',ti:'Winterchalet'}],['karte',{ti:'Winterchalet'}]].map(([k,o],i)=>`<div style="${i===0?'outline:2px solid #1b2033;outline-offset:3px;border-radius:2px':''}">${FIT(k,56,70,{...o,fw:1,fh:1})}</div>`).join('')}</div>
    <div class="zeile" style="gap:8px;margin-top:6px">${BT('Ersten öffnen','pri')}${BT('Fünf neue')}</div></div>
   <div style="padding:16px;border-top:1px solid var(--li)"><div class="zeile" style="gap:10px;border:1px solid var(--li2);border-radius:12px;padding:8px 8px 8px 14px"><span class="sub" style="flex:1">Nachricht an den Assistenten …</span><span class="ibt" style="background:#1b2033;color:#f0e3c2">${ic('send',16)}</span></div></div></div>
 </div>`);

add('Erster Besuch', 'Wenn noch nichts angelegt ist, erklärt die Startseite in drei Schritten, wie das Studio arbeitet, und bietet gleich das Feld und die Vorlagen an.',
 `<div class="sc hell">${SB({leer:1})}${TB(248)}
  <div class="a mitte" style="left:248px;right:0;top:110px">
   <div style="position:relative;width:260px;height:150px">${A(40,20,RF(148,210,120,'background:#fffdf8;transform:rotate(-8deg)'))}${A(100,6,RF(210,297,136,'background:#fffdf8'))}${A(160,30,RF(150,150,96,'background:#fffdf8;transform:rotate(7deg)'))}</div>
   <h1 class="h1" style="font-size:44px;margin-top:20px">Willkommen im Media Printing Studio</h1><div class="sub" style="margin-top:10px;font-size:15px">Speisekarten, Plakate, Gutscheine und Beiträge im Stil des Grand Beau-Rivage, druckfertig in wenigen Schritten.</div>
   ${PK({w:720, st:'margin-top:30px;text-align:left'})}
   <div class="zeile" style="gap:20px;margin-top:36px;text-align:left">${[['sparkle','Beschreiben','In einem Satz sagen, was entstehen soll.'],['grid','Auswählen','Aus fünf Entwürfen den besten nehmen und anpassen.'],['printer','Drucken','Als PDF mit Beschnitt an die Druckerei.']].map(([i,t,x])=>`<div class="panel" style="width:226px;padding:18px">${ic(i,20,'color:var(--gl)')}<div class="h3" style="margin-top:12px">${t}</div><div class="sub klein" style="margin-top:4px;line-height:1.5">${x}</div></div>`).join('')}</div>
   <div class="lnk" style="margin-top:24px">Oder mit einer Vorlage beginnen ${ic('chevr',14)}</div></div>
 </div>`);

const FMTGROSS = [...FORMATE, ['Story','9 : 16',108,192],['Eigenes Format','Masse eingeben',0,0]];
add('Format zuerst', 'Wie beim Anlegen in InDesign: zuerst das Format in echten Proportionen wählen, dann beschreiben oder leer beginnen. Für alle, die wissen, was sie brauchen.',
 `<div class="sc hell">${SB()}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Neues Medium', SEL('Alle Arten'), 'Format wählen, dann beschreiben oder leer beginnen.')}</div>`)}
  <div class="a" style="left:288px;top:190px;display:grid;grid-template-columns:repeat(5,207px);gap:20px 19px">${FMTGROSS.map(([n,f,a,b],i)=>`<div class="panel" style="height:262px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:18px;${i===1?'box-shadow:0 0 0 2px #1b2033':''}"><div style="flex:1;display:grid;place-items:center">${a?RF(a,b,130,'background:#fdfaf4;box-shadow:0 10px 20px -12px rgba(0,0,0,.35)'):`<span style="width:90px;height:120px;border:1.5px dashed var(--li2);border-radius:4px;display:grid;place-items:center;color:var(--sub)">${ic('plus',22)}</span>`}</div><div class="h3" style="margin-top:14px">${n}</div><div class="sub klein">${f}${a?` · ${a} × ${b} mm`:''}</div></div>`).join('')}</div>
  ${A(288,812,`<div class="zeile" style="gap:12px;width:1112px;padding:10px 10px 10px 22px;border-radius:14px;background:#1b2033;color:#f7f0e3"><span>Flyer A5 hoch gewählt</span><div style="flex:1"></div>${BT('Leer beginnen','','',DUNKELBT)}${KB('Beschreiben und fünf Entwürfe','gold')}</div>`)}
 </div>`);

add('Fenster «Neues Medium»', 'Ein Klick auf Neu öffnet ein Fenster wie in den Programmen von Adobe: links die Vorgaben des Hauses, rechts Vorschau mit Beschnitt und die Masse. Darunter leer anlegen oder entwerfen lassen.',
 `<div class="sc hell">${SB()}${TB(248)}${A(288,96,GRID([0,1,2,3,4],5,208,170,18,26))}
  <div class="a" style="inset:0;background:rgba(20,24,39,.42)"></div>
  <div class="a" style="left:250px;top:150px;width:940px;height:600px;border-radius:18px;background:#fffdf8;box-shadow:0 50px 100px -30px rgba(0,0,0,.6);overflow:hidden;display:flex">
   <div style="width:290px;background:var(--fl2);padding:24px 14px;border-right:1px solid var(--li)"><div class="h3" style="padding:0 10px 12px">Vorgaben des Hauses</div>${FORMATE.map(([n,f,a,b],i)=>`<div class="zeile" style="gap:14px;height:52px;padding:0 10px;border-radius:9px;${i===1?'background:#1b2033;color:#f7f0e3':''}"><span style="width:28px;display:grid;place-items:center">${RF(a,b,24,i===1?'border-color:#d2bf98;background:transparent':'')}</span><span style="flex:1">${n}</span><span style="font-size:11.5px;${i===1?'color:#d2bf98':'color:var(--sub)'}">${f}</span></div>`).join('')}</div>
   <div style="flex:1;padding:28px 32px;display:flex;flex-direction:column"><div class="zeile" style="justify-content:space-between"><h2 class="h2" style="font-size:26px">Flyer A5 hoch</h2>${ic('x',20,'color:var(--sub)')}</div>
    <div class="zeile" style="gap:34px;margin-top:22px;align-items:flex-start"><div style="width:240px;height:320px;border-radius:12px;background:var(--thumb);display:grid;place-items:center"><div style="padding:7px;outline:1px dashed rgba(122,31,43,.5)">${RF(148,210,240,'background:#fdfaf4;border:1px solid var(--li2)')}</div></div>
     <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px 14px">${[['Breite','148 mm'],['Höhe','210 mm'],['Seiten','2'],['Beschnitt','3 mm']].map(([l,v])=>`<div><div class="klein sub" style="margin-bottom:7px">${l}</div><div style="height:38px;border:1px solid var(--li2);border-radius:8px;padding:0 12px;display:flex;align-items:center">${v}</div></div>`).join('')}<div style="grid-column:span 2"><div class="klein sub" style="margin-bottom:7px">Ausrichtung</div>${SEG(['Hoch','Quer'])}</div><div style="grid-column:span 2"><div class="klein sub" style="margin-bottom:7px">Grund</div>${SEL('Marine mit Tapete','width:100%;justify-content:space-between')}</div></div></div>
    <div style="flex:1"></div><div class="zeile" style="gap:10px;justify-content:flex-end;border-top:1px solid var(--li);padding-top:18px">${BT('Abbrechen','ghost')}${BT('Leer anlegen')}${KB('Fünf Entwürfe')}</div></div></div>
 </div>`);

add('Mit Detail-Spalte', 'Ein Klick auf ein Medium zeigt rechts alles dazu: Vorschau, Format, Stand der Druckprüfung und die Knöpfe zum Öffnen, Speichern und Kopieren, ohne die Übersicht zu verlassen.',
 `<div class="sc hell">${SB({akt:'Meine Medien'})}${TB(248,{st:'right:340px',sw:340})}
  ${A(288,96,`<div style="width:772px">${KOPF('Meine Medien', SEG([ic('grid',15),ic('list',15)])+SEL('Zuletzt geändert'))}</div>`)}
  ${A(288,172,GRID([0,1,2,3,4,5],3,244,180,20,28,{sel:4,st:1}))}
  <div class="a" style="right:0;top:0;bottom:0;width:340px;border-left:1px solid var(--li);background:#fffdf8;padding:22px">
   <div class="zeile" style="justify-content:space-between"><span class="sub klein">Plakat</span>${ic('x',18,'color:var(--sub)')}</div>
   <div style="height:290px;border-radius:12px;background:var(--thumb);display:grid;place-items:center;margin-top:12px">${PL(4,160)}</div>
   <h2 class="h2" style="margin-top:18px;font-size:24px">Silvester im Ballsaal</h2>
   ${[['Format','A3 hoch · 297 × 420 mm'],['Seiten','1'],['Grund','Marine mit Tapete'],['Betrieb','La Belle Epoque'],['Geändert','vor 3 Tagen']].map(([l,v])=>`<div class="zeile" style="justify-content:space-between;height:32px;border-bottom:1px solid var(--li);font-size:13px"><span class="sub">${l}</span><span>${v}</span></div>`).join('')}
   <div class="zeile" style="gap:10px;margin-top:16px;padding:12px;border-radius:10px;background:rgba(180,120,40,.08);font-size:12.5px;color:#8a5a1c">${ic('shield',18)} Text liegt 3 mm vom Rand, empfohlen sind 4 mm.</div>
   <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">${KB('Öffnen','pri',{st:'justify-content:space-between'})}<div class="zeile" style="gap:8px">${BT('PDF','','download','flex:1')}${BT('Kopie','','copy','flex:1')}</div></div></div>
 </div>`);

add('Mit Freigabe', 'Für Häuser mit mehreren Händen: wer ein Medium anlegt, schickt es zur Freigabe an die Direktion. Die Startseite zeigt, was wartet und was freigegeben ist.',
 `<div class="sc hell">${SB({mehr:[['users','Freigaben','2']], akt:'Freigaben'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Freigaben', SEG(['Alle','Wartet auf Freigabe · 2','Freigegeben'],1))}</div>`)}
  ${A(288,176,`<div style="width:1112px;display:flex;flex-direction:column;gap:14px">${[[4,'Rezeption','vor 2 Std.',0],[2,'Bar','gestern',0],[3,'Küche','vor 2 Tagen',1],[1,'Rezeption','vor 3 Tagen',1]].map(([i,von,wann,ok])=>`<div class="panel zeile" style="gap:20px;padding:14px 20px 14px 14px">${ZEILEBILD(i,96)}<div style="flex:1"><div class="h3" style="font-size:16px">${LIB[i].n}</div><div class="sub klein" style="margin-top:4px">${LIB[i].art} · ${LIB[i].fo} · ${LIB[i].se}</div><div class="zeile" style="gap:8px;margin-top:12px;font-size:12.5px"><span class="av kl">${von.slice(0,2).toUpperCase()}</span><span class="sub">Angelegt von ${von} · ${wann}</span></div></div>${ok?`<span class="stx ok">Freigegeben von der Direktion</span>`:`<div class="zeile" style="gap:8px">${BT('Ansehen','','eye')}${BT('Anmerkung')}${KB('Freigeben','pri',{i:'check'})}</div>`}</div>`).join('')}</div>`)}
 </div>`);

add('Druckaufträge', 'Das Studio endet nicht beim PDF: die Startseite führt die Aufträge an die Druckerei mit Auflage, Papier und Stand. Ein Blick genügt, um zu wissen, was geliefert ist.',
 `<div class="sc hell">${SB({mehr:[['printer','Druckaufträge','4']], akt:'Druckaufträge'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Druckaufträge', SEL('Alle Stände')+KB('Neuer Druckauftrag'))}</div>`)}
  ${A(288,172,`<table class="tbl" style="width:1112px"><tr><th>Medium</th><th>Auflage</th><th>Papier</th><th>Druckerei</th><th>Stand</th><th>Liefertermin</th><th></th></tr>${[[3,'60','300 g, matt','Hausdruckerei','Im Druck','16. Oktober'],[4,'12','170 g, Bilderdruck','extern','Angefragt','offen'],[1,'200','350 g, Naturpapier','extern','Geliefert','8. Oktober'],[5,'500','300 g, matt','extern','Geliefert','2. Oktober']].map(([i,a,p,d,s,l])=>`<tr><td><div class="zeile" style="gap:14px">${ZEILEBILD(i)}${LIB[i].n}</div></td><td>${a} Stück</td><td class="sub">${p}</td><td class="sub">${d}</td><td>${s==='Geliefert'?'<span class="stx ok">Geliefert</span>':s==='Im Druck'?'<span class="stx warn">Im Druck</span>':'<span class="stx">Angefragt</span>'}</td><td class="sub">${l}</td><td>${ic('more',18,'color:var(--sub)')}</td></tr>`).join('')}</table>`)}
  ${A(288,520,`<div class="panel zeile" style="width:1112px;gap:20px;padding:20px 24px">${ic('printer',26,'color:var(--gl)')}<div style="flex:1"><div class="h3">Druckfertig und noch nicht bestellt</div><div class="sub klein" style="margin-top:4px">Ansichtskarte Interlaken, Rückseite neu · Gutschein La Petite Suisse, zweite Auflage</div></div>${BT('Auftrag anlegen')}</div>`)}
 </div>`);

add('Haus im Banner', 'Wie die helle Startseite, aber oben steht das Haus an der Aare als breites Bild. Das Feld liegt im Bild, darunter Formate und die letzten Medien.',
 `<div class="sc hell">${SB()}${TB(248)}
  ${A(288,92,`<div class="ban" style="width:1112px;height:290px;background:url(${F('haus-aare')}) center 60%/cover"><div class="a" style="inset:0;background:linear-gradient(90deg,rgba(20,24,39,.82),rgba(20,24,39,.35) 60%,rgba(20,24,39,.1))"></div>${A(40,44,`<h1 class="h1" style="font-size:40px;color:#f7f0e3">Was soll heute entstehen?</h1><div style="margin-top:8px;color:rgba(247,240,227,.75);font-size:14px">Fünf Entwürfe im Stil des Hauses, aus einem Satz.</div>`)}${A(40,150,PK({w:640}))}</div>`)}
  ${A(288,410,`<div style="width:1112px">${H3('Schnell anlegen')}${FMTS(128,12,40)}</div>`)}
  ${A(288,590,`<div style="width:1112px">${H3('Zuletzt bearbeitet', ALLE('Alle 8 ansehen'))}${GRID([0,1,2,3,4],5,208,140,18,26,{st:1})}</div>`)}
 </div>`);

add('Weitermachen im Vordergrund', 'Die Startseite holt das zuletzt bearbeitete Medium gross nach vorn, mit Vorschau, Angaben und den wichtigsten Knöpfen. Alles andere steht darunter.',
 `<div class="sc hell">${SB()}${TB(248)}
  ${A(288,92,`<div class="panel zeile" style="width:1112px;height:470px;padding:0;overflow:hidden;align-items:stretch"><div style="width:620px;background:var(--thumb);display:grid;place-items:center">${PL(0,330)}</div><div style="flex:1;padding:44px"><span class="stx">Zuletzt bearbeitet · gerade eben</span><h1 class="h1" style="font-size:46px;margin-top:18px">Beste Freunde treffen</h1><div class="sub" style="margin-top:14px;line-height:1.8">Einladung · Quadrat 150 × 150 mm · 1 Seite<br>Grund Papier · 1 Foto des Hauses</div><div class="zeile" style="gap:8px;margin-top:18px">${ic('shield',18,'color:#3f6b4a')}<span style="color:#3f6b4a;font-size:13px">Druckprüfung ohne Hinweise</span></div><div style="display:flex;flex-direction:column;gap:10px;margin-top:34px;width:300px">${KB('Weiter bearbeiten','pri',{gross:1,st:'justify-content:space-between'})}<div class="zeile" style="gap:10px">${BT('PDF','','download','flex:1')}${BT('Kopie','','copy','flex:1')}</div></div></div></div>`)}
  ${A(288,596,`<div style="width:1112px">${H3('Weitere Medien', ALLE('Alle ansehen'))}${GRID([1,2,3,4,5,6],6,170,130,18,26)}</div>`)}
 </div>`);

add('Fotos zuerst', 'Die Startseite ist die Mediathek des Hauses: 319 Fotos nach Bereichen. Man wählt ein Bild, und das Studio baut das Medium darum herum.',
 `<div class="sc hell">${SB({akt:'Fotos des Hauses'})}${TB(248)}
  ${A(288,96,`<div style="width:1112px">${KOPF('Fotos des Hauses', BT('Eigene hochladen','','upload'), '319 Fotos, nach Bereichen sortiert')}</div>`)}
  ${A(288,180,SEG(['Alle','Haus & Garten','Zimmer & Suiten','Restaurants','Bar & Getränke','Spa','Feiern & Tagen','Region']))}
  <div class="a" style="left:288px;top:236px;display:grid;grid-template-columns:repeat(5,207px);gap:12px 19px">${['haus-aare','halle-2','bar','spa-pool','rest-suisse-2','saal','terrasse-neu','z-jsfc','bar-teatime-2','fondue','haus-winter','hochzeit-tafel','decke','g-manhattan','aus-sphinx'].map((f,i)=>`<div class="foto" style="position:relative;height:${i<10?150:110}px;border-radius:10px;background-image:url(${F(f)});${i===8?'box-shadow:0 0 0 2.5px #1b2033':''}">${i===8?`<div class="a" style="left:8px;right:8px;bottom:8px">${KB('Daraus gestalten','gold',{st:'width:100%;justify-content:space-between;height:34px'})}</div>`:''}</div>`).join('')}</div>
 </div>`);

add('Die nächsten Wochen', 'Oben stehen die anstehenden Anlässe des Hauses mit dem passenden Medium und einem Knopf zum Anlegen. Darunter die eigenen Medien wie gewohnt.',
 `<div class="sc hell">${SB()}${TB(248,{neu:1})}
  ${A(288,96,`<div style="width:1112px">${H3('Die nächsten Wochen', ALLE('Ganzes Jahr'))}<div class="zeile" style="gap:20px">${[['rest-suisse-2','ab November','La Petite Suisse öffnet','Speisekarte und Aushang'],['bar-teatime-2','im Advent','Tea Time im Advent','Flyer und Instagram'],['ev-silvester','31. Dezember','Silvester im Ballsaal','Plakat und Einladung'],['fondue','Januar','Fondue am Kamin','Tischaufsteller']].map(([f,d,t,x])=>`<div class="panel" style="width:263px;overflow:hidden"><div class="foto" style="height:110px;background-image:url(${F(f)})"></div><div style="padding:14px 16px"><div class="sub klein">${d}</div><div class="h3" style="font-size:16px;margin-top:4px">${t}</div><div class="sub klein" style="margin-top:2px">${x}</div><div style="margin-top:12px">${BT('Anlegen','','plus','height:32px')}</div></div></div>`).join('')}</div></div>`)}
  ${A(288,450,`<div style="width:1112px">${H3('Zuletzt bearbeitet', ALLE('Alle 8 ansehen'))}${GRID([0,1,2,3,4],5,208,170,18,26,{st:1})}</div>`)}
 </div>`);

add('Auswahl wie bei Pages', 'Ohne Seitenleiste, ganz ruhig: oben die Arten zum Umschalten, darunter grosse Vorschauen der Medien des Hauses. Unten Abbrechen oder Erstellen, wie bei Apple.',
 `<div class="sc hell">${A(32,24,MARKE())}
  <div class="a mitte" style="left:0;right:0;top:60px"><h1 class="h1" style="font-size:40px">Wählen Sie ein Medium</h1>${SEG(['Alle','Karten & Menüs','Aushänge & Plakate','Anlässe & Geschenke','Digital','Meine Medien'],0,'margin-top:22px')}</div>
  <div class="a" style="left:114px;top:196px;display:grid;grid-template-columns:repeat(5,220px);gap:20px 28px">${[['leer','Leeres Blatt',{}],['karte','Speisekarte',{}],['flyer','Flyer',{}],['einl','Einladung',{img:'hochzeit-tafel',ti:'Wir heiraten'}],['gut','Gutschein',{}],['plakat','Plakat',{}],['post','Ansichtskarte',{img:'haus-sommer-berge'}],['insta','Instagram',{img:'bar-ananas',ti:'Heute an der Bar'}],['flyer','Aushang',{img:'spa-pool',ti:'Ruhige Stunden',zl:'La Vallée SPA'}],['karte','Getränkekarte',{ti:'Le Vieux Rivage'}]].map(([k,n,o],i)=>`<div class="mitte"><div style="width:220px;height:240px;border-radius:12px;display:grid;place-items:center;${i===2?'background:var(--fl2);box-shadow:0 0 0 2px #1b2033':''}">${FIT(k,220,240,o)}</div><div style="font-size:14px;margin-top:8px">${n}</div></div>`).join('')}</div>
  <div class="a zeile" style="left:0;right:0;bottom:0;height:72px;padding:0 32px;gap:10px;border-top:1px solid var(--li);background:#fbf7ef"><span class="lnk">${ic('upload',15)} Arbeitsdatei öffnen</span><div style="flex:1"></div>${BT('Abbrechen')}${KB('Erstellen')}</div>
 </div>`);

add('Dicht und dunkel', 'Für Profis, die täglich darin arbeiten: kleine Schrift, viele Medien auf einen Blick, Ordner links, Werkzeugleiste oben, Statuszeile unten. Wie ein Schnittprogramm.',
 `<div class="sc dunkel" style="font-size:12.5px">${RAIL(1)}
  <div class="a" style="left:64px;top:0;bottom:28px;width:220px;border-right:1px solid var(--li);padding:16px 10px;background:rgba(10,13,24,.25)"><div class="sb-h" style="padding-top:4px">Medien</div><div class="nav">${[['files','Alle','8',1],['clock','Zuletzt'],['star','Favoriten','2']].map(([i,t,c,a])=>`<a class="${a?'an':''}" style="height:30px">${ic(i,15)}<span>${t}</span>${c?`<em>${c}</em>`:''}</a>`).join('')}</div><div class="sb-h">Betriebe</div><div class="nav">${['L’Ambiance','La Petite Suisse','La Belle Rivière','Le Vieux Rivage','La Vallée SPA','La Belle Epoque'].map(t=>`<a style="height:30px">${ic('folder',15)}<span>${t}</span></a>`).join('')}</div><div class="sb-h">Stand</div><div class="nav">${[['Entwurf','4'],['Druckfertig','3'],['Mit Hinweis','1']].map(([t,c])=>`<a style="height:30px">${ic('shield',15)}<span>${t}</span><em>${c}</em></a>`).join('')}</div></div>
  <div class="a zeile" style="left:284px;right:0;top:0;height:52px;padding:0 20px;gap:8px;border-bottom:1px solid var(--li)"><div class="such" style="width:300px;height:32px">${ic('search',14)}<span>Suchen</span><kbd>⌘ K</kbd></div><div style="flex:1"></div>${SEG([ic('grid',14),ic('list',14)])}${SEL('Geändert')}${SEL('Alle Formate')}<span class="bt gold knauf" style="height:32px">Neu<i style="width:24px;height:24px">${ic('plus',12)}</i></span></div>
  ${A(304,72,GRID([0,1,2,3,4,5,6,7,1,3],5,207,140,15,20,{st:1}))}
  <div class="a zeile" style="left:64px;right:0;bottom:0;height:28px;padding:0 16px;gap:24px;border-top:1px solid var(--li);font-size:11px;color:var(--sub);background:rgba(10,13,24,.35)"><span>8 Medien</span><span>3 druckfertig</span><span>1 mit Hinweis</span><div style="flex:1"></div><span>Marke: Grand Beau-Rivage</span><span>Gespeichert</span></div>
 </div>`);

add('Ruhig wie ein Notizbuch', 'Eine schmale Mittelspalte mit wenig Rahmen, wie in Notion: Neu als eine Zeile, darunter die letzten Medien als Liste und eine kleine Reihe Vorlagen.',
 `<div class="sc hell" style="background:#fdfaf4">
  <div class="a" style="left:0;top:0;bottom:0;width:230px;background:#f6f1e7;padding:18px 10px;border-right:1px solid var(--li)"><div class="zeile" style="gap:9px;padding:4px 10px 18px">${Z(22,'var(--gl)')}<span style="font-size:13px">Media Printing Studio</span></div><div class="nav">${[['search','Suchen'],['home','Start',1],['files','Meine Medien'],['layout','Vorlagen'],['image','Fotos'],['palette','Marke']].map(([i,t,a])=>`<a class="${a?'an':''}" style="height:30px">${ic(i,16)}<span>${t}</span></a>`).join('')}</div></div>
  <div class="a" style="left:470px;top:64px;width:700px">
   <div class="sub klein">Grand Beau-Rivage / Start</div><h1 class="h1" style="font-size:48px;margin-top:18px">Start</h1>
   <div class="zeile" style="gap:12px;margin-top:26px;padding:10px 10px 10px 16px;border-radius:12px;border:1px solid var(--li2);background:#fff">${ic('sparkle',18,'color:var(--gl)')}<span class="sub" style="flex:1;font-size:15px">Neues Medium beschreiben …</span>${KB('Fünf Entwürfe')}</div>
   <div class="h3" style="margin:36px 0 8px">Zuletzt</div>${[0,1,2,3,4,5].map(i=>`<div class="zeile" style="gap:14px;height:46px;border-bottom:1px solid var(--li)"><span style="width:30px;display:grid;place-items:center">${FITL(i,28,30,{fw:1,fh:1})}</span><span style="flex:1;font-size:14.5px">${LIB[i].n}</span><span class="sub klein">${LIB[i].art}</span><span class="sub klein" style="width:90px;text-align:right">${LIB[i].t}</span></div>`).join('')}
   <div class="h3" style="margin:32px 0 12px">Vorlagen des Hauses</div><div class="zeile" style="gap:14px">${[['karte','Speisekarte'],['flyer','Flyer'],['einl','Einladung'],['gut','Gutschein'],['post','Ansichtskarte']].map(([k,n])=>`<div class="fc" style="width:128px"><div class="th" style="height:100px">${FIT(k,128,100)}</div><div class="nm" style="font-size:13px">${n}</div></div>`).join('')}</div></div>
 </div>`);

add('Suchen und filtern', 'Die Suche ist der Anfang: ein Wort, und links lassen sich die Treffer nach Art, Format, Betrieb und Stand eingrenzen. Treffer kommen aus Medien, Vorlagen und Fotos.',
 `<div class="sc hell">${SB({akt:'Meine Medien'})}${TB(248,{q:'Gutschein', sw:560})}
  ${A(288,96,`<div style="width:210px">${[['Art',[['Gutschein',3,1],['Einladung',0],['Flyer',0]]],['Format',[['DL quer',3,1],['A6 quer',0]]],['Betrieb',[['La Petite Suisse',1],['La Vallée SPA',1],['Le Vieux Rivage',1]]],['Stand',[['Druckfertig',1],['Entwurf',2]]]].map(([h,rs])=>`<div class="h3" style="margin:0 0 8px">${h}</div>${rs.map(([t,c,a])=>`<div class="zeile" style="gap:10px;height:30px"><span class="kst ${a?'an':''}"></span><span style="flex:1;${a?'':'color:var(--sub)'}">${t}</span><span class="sub klein">${c}</span></div>`).join('')}<div style="height:22px"></div>`).join('')}</div>`)}
  ${A(530,96,`<div style="width:870px"><h1 class="h1" style="font-size:30px">3 Medien zu «Gutschein»</h1><div style="display:grid;grid-template-columns:repeat(3,276px);gap:20px;margin-top:22px">${[['Gutschein','Restaurant La Petite Suisse','La Petite Suisse','Druckfertig · vor 40 Min.'],['Gutschein Spa','La Vallée SPA','La Vallée SPA','Entwurf · vor 5 Tagen'],['Gutschein Bar','Bar Le Vieux Rivage','Le Vieux Rivage','Entwurf · vor 6 Tagen']].map(([t,z,b,m])=>`<div class="fc"><div class="th" style="height:170px">${FIT('gut',276,170,{ti:t,zl:z,fw:.78})}</div><div class="nm">${t} · ${b}</div><div class="mt">${m}</div></div>`).join('')}</div>
   <div class="h3" style="margin:32px 0 12px">Vorlagen</div><div class="zeile" style="gap:14px">${['Gutschein quer','Gutschein mit Foto','Gutschein Klappkarte'].map(n=>`<div class="fc" style="width:180px"><div class="th" style="height:100px">${FIT('gut',180,100,{fw:.8})}</div><div class="nm" style="font-size:13px">${n}</div></div>`).join('')}</div>
   <div class="h3" style="margin:28px 0 12px">Fotos</div><div class="zeile" style="gap:10px">${['spa-massage','rest-suisse-2','bar-glas','spa-ruhe','fondue'].map(f=>`<div class="foto" style="width:120px;height:80px;border-radius:8px;background-image:url(${F(f)})"></div>`).join('')}</div></div>`)}
 </div>`);

add('Anfragen aus dem Haus', 'Abteilungen melden ihren Bedarf im Studio: Küche, Spa, Bankett. Die Startseite ist ein Eingang wie ein Postfach, jede Anfrage lässt sich direkt entwerfen.',
 `<div class="sc hell">${SB({mehr:[['inbox','Anfragen','3']], akt:'Anfragen'})}${TB(248)}
  <div class="a" style="left:248px;top:62px;bottom:0;width:420px;border-right:1px solid var(--li);background:#fbf7ef;padding:20px 14px">
   <div class="zeile" style="justify-content:space-between;padding:0 8px 14px"><h2 class="h2" style="font-size:24px">Anfragen</h2>${SEG(['Offen','Erledigt'])}</div>
   ${[['KÜ','Küche','Wintermenü La Petite Suisse','Die neue Karte gilt ab Mitte November, sechs Gänge, Weinbegleitung …','09:12',1],['SP','La Vallée SPA','Gutschein zu Weihnachten','Massage und Spa-Tag als Geschenk, quer zum Einstecken …','gestern'],['BK','Bankett','Tischkarten für eine Hochzeit','80 Gäste, die Namen kommen als Liste …','Fr.'],['RZ','Rezeption','Aushang Sauna-Zeiten','Ab November geänderte Zeiten im Spa …','Do.']].map(([a,von,t,x,z,an])=>`<div style="display:flex;gap:12px;padding:14px 12px;border-radius:12px;${an?'background:#fffdf8;box-shadow:0 0 0 1px var(--li2)':''}"><span class="av">${a}</span><div style="flex:1;min-width:0"><div class="zeile" style="justify-content:space-between"><span style="font-size:13px">${von}</span><span class="sub klein">${z}</span></div><div class="h3" style="margin-top:3px">${t}</div><div class="sub klein" style="margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x}</div></div></div>`).join('')}</div>
  <div class="a" style="left:700px;top:96px;width:700px">
   <div class="zeile" style="gap:12px"><span class="av">KÜ</span><div><div style="font-size:13.5px">Küche</div><div class="sub klein">heute, 09:12</div></div></div>
   <h1 class="h1" style="font-size:34px;margin-top:22px">Wintermenü La Petite Suisse</h1>
   <p style="font-size:15px;line-height:1.65;margin-top:16px">Die neue Karte gilt ab Mitte November. Sechs Gänge, dazu die Weinbegleitung. Bitte im Stil der bisherigen Karte, A4 hoch, zwei Seiten. Die Gerichte stehen im Anhang.</p>
   <div class="zeile" style="gap:10px;margin-top:14px"><div class="zeile" style="gap:10px;height:80px;padding:0 18px;border-radius:8px;border:1px solid var(--li2)">${ic('files',20,'color:var(--sub)')}<span>Wintermenü.docx</span></div><div class="foto" style="width:120px;height:80px;border-radius:8px;background-image:url(${F('g-berner-maritsuppe')})"></div></div>
   <div class="panel" style="margin-top:30px;padding:20px"><div class="zeile" style="justify-content:space-between"><div><div class="h3">Daraus entwerfen</div><div class="sub klein" style="margin-top:4px">Speisekarte · A4 hoch · 2 Seiten · Papier</div></div>${KB('Fünf Entwürfe')}</div></div></div>
 </div>`);

add('Arbeitsfläche', 'Die Startseite ist schon die Arbeitsfläche: ein leeres Blatt liegt bereit, links die letzten Medien, rechts Format und Grund. Wer gleich anfangen will, muss nichts wählen.',
 `<div class="sc hell">
  <div class="a zeile" style="left:0;right:0;top:0;height:58px;padding:0 18px;gap:14px;border-bottom:1px solid var(--li);background:#fbf7ef">${Z(28,'var(--gl)')}<span class="caps" style="font-size:11px">Grand Beau-Rivage</span><span class="sub">/</span><span>Unbenannt</span><div style="flex:1"></div><span class="ibt">${ic('help',18)}</span>${KB('Druckfertig speichern','gold',{i:'download'})}</div>
  <div class="a" style="left:0;top:58px;bottom:0;width:280px;border-right:1px solid var(--li);background:#fbf7ef;padding:18px 12px"><div class="such" style="height:34px">${ic('search',14)}<span>Suchen</span></div><div class="h3" style="margin:20px 8px 8px">Zuletzt</div>${LIB.slice(0,7).map((L,i)=>`<div class="zeile" style="gap:12px;height:50px;padding:0 8px;border-radius:8px"><span style="width:34px;display:grid;place-items:center">${FITL(i,32,36,{fw:1,fh:1})}</span><div style="min-width:0"><div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${L.n}</div><div class="sub" style="font-size:11px">${L.t}</div></div></div>`).join('')}</div>
  <div class="a" style="left:280px;top:58px;right:300px;bottom:0;background:#e9e1d1;display:grid;place-items:center">
   <div class="mitte"><div style="padding:9px;outline:1px dashed rgba(122,31,43,.4)"><div style="width:360px;height:509px;background:#fdfaf4;box-shadow:0 30px 60px -30px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center">${Z(54,'var(--messing)')}<div class="h2" style="margin-top:18px;font-size:26px">Leeres Blatt A5</div><div class="sub" style="margin-top:8px;font-size:13px">Beschreiben Sie, was hier entstehen soll, oder ziehen Sie ein Foto hierher.</div></div></div>
   ${PK({w:560, st:'margin-top:22px', sels:false, ph:'Was soll auf dieses Blatt?'})}</div></div>
  <div class="a" style="right:0;top:58px;bottom:0;width:300px;border-left:1px solid var(--li);background:#fbf7ef;padding:20px">
   <div class="h3">Format</div><div style="margin-top:10px">${FORMATE.slice(0,6).map(([n,f,a,b],i)=>`<div class="zeile" style="gap:12px;height:40px;padding:0 10px;border-radius:8px;${i===1?'background:var(--hov)':''}"><span style="width:22px;display:grid;place-items:center">${RF(a,b,18)}</span><span style="flex:1">${n}</span><span class="sub klein">${f}</span></div>`).join('')}</div>
   <div class="h3" style="margin-top:22px">Grund</div><div class="zeile" style="gap:10px;margin-top:10px">${['#1b2033 var(--td) 0 0/120px','#f7f0e3','#efe4cf var(--th) 0 0/120px'].map((b,i)=>`<span style="width:72px;height:50px;border-radius:8px;background:${b};box-shadow:0 0 0 1px var(--li2)${i===1?',0 0 0 3px #fbf7ef,0 0 0 4.5px #1b2033':''}"></span>`).join('')}</div>
   <div class="h3" style="margin-top:22px">Seiten</div><div style="margin-top:10px">${SEG(['1','2','4'],1)}</div></div>
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
const ladeZeichen = () => fetch('../haeuser/gbr/marke.json').then(r=>r.json()).then(m=>{
  const p = document.getElementById('zchP'), s = document.getElementById('zch');
  if(p){ p.setAttribute('d', m.zeichen.pfade.join(' ')); if(m.zeichen.vb) s.setAttribute('viewBox', m.zeichen.vb.join(' ')); }
}).catch(()=>{});
const einzeln = new URLSearchParams(location.search).get('nr');
if(einzeln){
  document.body.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs><symbol id="zch" viewBox="0 0 1464 1452"><path id="zchP"/></symbol></defs></svg><div style="position:relative;width:1440px;height:900px">${V[+einzeln-1].html}</div>`;
  document.querySelector('.sc').style.setProperty('--s',1); ladeZeichen();
} else {
  raster.addEventListener('click', e => { const b = e.target.closest('.b-bild'); if(b) oeffne(+b.dataset.i); });
  document.getElementById('grossZu').onclick = () => gross.hidden = true;
  document.getElementById('grossVor').onclick = () => oeffne(jetzt+1);
  document.getElementById('grossZurueck').onclick = () => oeffne(jetzt-1);
  addEventListener('keydown', e => { if(gross.hidden) return; if(e.key==='Escape') gross.hidden = true; if(e.key==='ArrowRight') oeffne(jetzt+1); if(e.key==='ArrowLeft') oeffne(jetzt-1); });
  addEventListener('resize', () => { if(!gross.hidden) oeffne(jetzt); });
  ladeZeichen(); zeigen();
}
})();
