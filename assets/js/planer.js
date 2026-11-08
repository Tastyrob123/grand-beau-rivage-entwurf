/* Grand Beau-Rivage Interlaken, Aufenthaltsplaner «Ihre Tage in Interlaken» und die Zielseiten (Tasty Studios, 14.10.2026).
   Daten: JSON-Insel #pl-daten (inhalt/r_planer.py, planer_daten.py) und der Dienst api/wege (öffentlicher Fahrplan über transport.opendata.ch).
   Der Plan entsteht nach festen Regeln (keine KI): geschlossene Tage fallen weg, ein grosses Ziel am Tag, am Anreisetag nur der späte Nachmittag,
   am Abreisetag nur der Vormittag, was in derselben Gegend liegt, kommt auf denselben Tag. Abfahrt, Weg und Rückkehr stammen aus dem Fahrplan des Tages.
   Nichts wird geschätzt: Kennt der Fahrplan einen Tag noch nicht, stehen nur Fahrzeit und Dauer da, keine Uhrzeit. Bewegung nur über transform. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var SP = (doc.lang || 'de').slice(0, 2).toLowerCase(); if (['de', 'en', 'fr', 'zh', 'ko', 'ar'].indexOf(SP) < 0) SP = 'en';
  var WURZEL = SP === 'de' ? '' : '../';
  var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-u-nu-latn' }[SP];
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var lies = function (id) { try { return JSON.parse(($('#' + id) || {}).textContent || 'null'); } catch (e) { return null; } };
  var chf = function (n) { var r = Math.round(n * 100) / 100, g = Math.floor(r), rest = Math.round((r - g) * 100); return String(g).replace(/\B(?=(\d{3})+(?!\d))/g, '’') + (rest ? '.' + (rest < 10 ? '0' : '') + rest : ''); };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tag = function (s) { var x = s.split('-'); return new Date(+x[0], +x[1] - 1, +x[2], 12); };
  var plus = function (s, n) { var d = tag(s); d.setDate(d.getDate() + n); return iso(d); };
  var hhmm = function (m) { m = Math.max(0, Math.min(1439, Math.round(m))); return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); };
  var minuten = function (isoZeit) { return +isoZeit.slice(11, 13) * 60 + +isoZeit.slice(14, 16); };   // Uhrzeit, wie sie im Fahrplan steht (Schweizer Zeit), egal wo der Gast sitzt
  var lang = function (s, mitJahr) { return tag(s).toLocaleDateString(ORT, mitJahr ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'long' }); };
  var kurz = function (s) { return tag(s).toLocaleDateString(ORT, { day: 'numeric', month: 'long' }); };

  /* Wörter der beweglichen Teile in sechs Sprachen (der feste Text der Seite kommt aus sprachen.py) */
  var WORT = {
    de: { tagN: 'Tag', anreise: 'Anreise', abreise: 'Abreise', raus: 'Aus dem Haus', abf: 'Abfahrt', ank: 'Ankunft', vor: 'vor Ort', rueck: 'Rückfahrt ab', heim: 'Zurück im Haus', direkt: 'direkt', um1: '1 Umstieg', umN: 'Umstiege', std: 'Std.', min: 'Min.', rund: 'rund',
      fahrtHin: 'Fahrt hin', fahrtZur: 'Fahrt zurück', frei: 'Dieser Tag bleibt frei, für das Haus und die Aare.', freiAn: 'Ankommen und das Zimmer beziehen.', freiAb: 'Zeit für das Frühstück und den Weg zum Zug.',
      laden: 'Der Fahrplan wird gelesen.', keinZiel: 'Tippen Sie oben an, was Sie sehen möchten. Der Plan entsteht von selbst.', keinDatum: 'Wählen Sie oben An- und Abreise.',
      alle: 'an allen Ihren Tagen', teils: function (n, m) { return 'an ' + n + ' von ' + m + ' Tagen'; }, nie: 'in Ihrer Zeit keine Fahrt', offen: 'Fahrplan noch nicht veröffentlicht', erreichbar: 'in Ihrer Zeit erreichbar', nichtAlle: 'nicht an allen Tagen',
      geprueft: function (a, b) { return 'Im Fahrplan geprüft für ' + a + ' bis ' + b + '.'; }, offenTage: 'Für Ihre Tage ist der Fahrplan noch nicht veröffentlicht. Der Plan zeigt Fahrzeiten und Dauer, die Abfahrten bestätigt unser Concierge.',
      offenZeile: 'Der Fahrplan für diesen Tag ist noch nicht veröffentlicht. Fahrzeit laut heutigem Fahrplan.', keineFahrt: 'Zu dieser Zeit steht für diesen Tag keine Fahrt mehr im Fahrplan. Legen Sie das Ziel auf einen anderen Tag.', ohneRueck: 'Für die Rückfahrt nennt der Fahrplan um diese Zeit keine Verbindung. Unser Concierge prüft sie für Sie.', fehler: 'Der Fahrplan ist gerade nicht abrufbar. Die Zeiten folgen, sobald er antwortet.',
      restPlatz: 'Kein Platz mehr in Ihren Tagen', restPlatzT: function (n) { return n + ' passt in diesem Tempo nicht mehr hinein. Planen Sie dichter, oder bleiben Sie eine Nacht länger.'; }, restFahrt: 'Passt nicht mehr in Ihre Tage', restFahrtT: function (n) { return n + ': Neben Ihren anderen Ausflügen bleibt an keinem Tag eine Hin- und Rückfahrt. Nehmen Sie ein Ziel heraus, oder fragen Sie unseren Concierge.'; }, letzte: 'letzte Rückfahrt des Tages', naechste: 'früher fährt nichts zurück', zuSpaet: function (n, u) { return 'Die ' + n + ' schliessen um ' + u + '. Wählen Sie eine frühere Abfahrt oder einen anderen Tag.'; }, neuRechnen: 'Ihr Plan wird neu gerechnet.', sonderAb: 'ab Wengen oder Grindelwald', restNie: 'In Ihrer Zeit nicht erreichbar', restNieT: function (n) { return n + ': An keinem Ihrer Tage steht eine Fahrt im Fahrplan.'; },
      dichter: 'Dichter planen', nacht: 'Eine Nacht mehr prüfen', tagWahl: 'Tag', haus: 'Billette vom Concierge besorgen lassen', selbst: 'Selbst buchen bei', weg: 'Entfernen', ab: 'ab', tagespreis: 'Tagespreis', preisOffen: 'Preis noch nicht veröffentlicht', vorOrt: 'Zeit vor Ort', empf: 'empfohlen', abfUm: 'Abfahrt um', eigen: 'Eigene Zeit', sucht: 'Wir suchen noch einen Platz für', tausch: 'tauschen mit', mitTag: 'zusammen mit', passtNicht: 'An diesem Tag passt der Ausflug nicht hinein. Der Plan bleibt, wie er war.', getauscht: function (a, b) { return a + ' und ' + b + ' haben die Tage getauscht.'; }, frueher: 'Früher', spaeter: 'Später', keinFrueher: 'Früher fährt an diesem Tag nichts, das in Ihren Plan passt.', keinSpaeter: 'Später fährt an diesem Tag nichts mehr.', gehtNicht: 'Mit dieser Abfahrt gibt es keine Rückfahrt mehr. Der Plan bleibt, wie er war.', tRuhe: 'Ein Ausflug je ganzem Tag, aus dem Haus ab 9.30 Uhr, zurück bis 18 Uhr.', tMitte: 'Bis zu zwei Ausflüge je ganzem Tag, aus dem Haus ab 9 Uhr, zurück bis 19.30 Uhr.', tAlles: 'Bis zu drei Ausflüge je ganzem Tag, aus dem Haus ab 8 Uhr, zurück bis 20.30 Uhr.', tRand: 'Am Anreisetag ein Ausflug zwischen 15 und 20.30 Uhr, am Abreisetag einer mit Rückkehr bis 12.30 Uhr. Den Harder Kulm planen wir auch am Abend, zurück bis 22.30 Uhr.', abfWahl: 'Abfahrt ändern', halbOffen: 'mit Halbtax beim Anbieter', dichterHin: 'Damit alles Gewählte hineinpasst, sind einzelne Tage dichter geplant, als Sie gewählt haben.', anbieter: 'Preis des Anbieters', gk: 'mit Gästekarte', proP: 'pro Person',
      einzel: 'Einzeln', mind: 'mindestens', summe: 'Summe der Preise, die die Anbieter nennen', hinweisE: 'Wo kein Betrag steht, nennt der Anbieter den Preis beim Kauf.', drin: 'enthalten', halb: 'halber Preis', sonder: '25 % Rabatt', nichtdrin: 'nicht im Pass', zuschlag: 'Anschlussticket', passFuer: 'Pass für', tage: 'Tage', kind: 'Kinder 6–15: CHF 30', best: 'Günstigster Weg', nurPass: 'Passpreis, ohne Zuschläge', keinK: 'Wählen Sie mindestens einen Ausflug.', empfK: 'Unsere Empfehlung für Ihre Tage', einzelfahrt: 'einzelne Fahrten', sparen: 'Sie sparen', empfPass: function (n, t, p) { return n + ' für ' + t + ' Tage, CHF ' + p + '.'; }, empfSpar: function (e, s) { return 'Einzeln wären es CHF ' + e + ', Sie sparen CHF ' + s + '.'; }, empfEinzel: function (e, n, p) { return 'Einzelne Billette, zusammen CHF ' + e + '. Der günstigste Pass käme auf ' + p + ' (' + n + ').'; }, empfOffen: 'Welcher Weg günstiger ist, hängt an Tagespreisen, die der Anbieter erst beim Kauf nennt. Unser Concierge rechnet es für Sie.',
      lHaus: 'Billette vom Concierge', lLunch: 'Lunchpaket', merk: 'Vormerken', gemerkt: 'Vorgemerkt', kopiert: 'Link kopiert', gruss: 'Guten Tag', mailPlan: 'Mein Plan', mailHaus: 'bitte besorgen', mailSelbst: 'buche ich selbst', mailW: 'Dazu', wLunch: 'Lunchpaket für die Ausflugstage', wShuttle: 'Shuttle zum Bahnhof Interlaken Ost', wTisch: 'Tisch am Abend', mailT: 'Vorgemerkt', ende: 'Freundliche Grüsse',
      gleis: 'Gleis', dauer: 'Dauer', inPlan: 'In den Plan', keinTag: 'An diesem Tag steht keine Fahrt im Fahrplan.', offenTag: 'Für diesen Tag ist der Fahrplan noch nicht veröffentlicht.', spaet: 'Zu dieser Zeit fährt an diesem Tag nichts mehr. Wählen Sie eine frühere Zeit.', standW: 'Öffentlicher Fahrplan, Stand', via: 'über', schiff: 'Schiff', bahn: 'Bergbahn', zug: 'Zug', bus: 'Bus' },
    en: { tagN: 'Day', anreise: 'Arrival', abreise: 'Departure', raus: 'Leave the hotel', abf: 'Departure', ank: 'Arrival', vor: 'on site', rueck: 'Return from', heim: 'Back at the hotel', direkt: 'direct', um1: '1 change', umN: 'changes', std: 'h', min: 'min', rund: 'about',
      fahrtHin: 'Journey there', fahrtZur: 'Journey back', frei: 'This day stays free, for the hotel and the Aare.', freiAn: 'Arrive and settle into your room.', freiAb: 'Time for breakfast and the walk to your train.',
      laden: 'Reading the timetable.', keinZiel: 'Tap what you would like to see above. The plan builds itself.', keinDatum: 'Choose your arrival and departure above.',
      alle: 'on all your days', teils: function (n, m) { return 'on ' + n + ' of ' + m + ' days'; }, nie: 'not running during your stay', offen: 'timetable not yet published', erreichbar: 'running during your stay', nichtAlle: 'not on every day',
      geprueft: function (a, b) { return 'Checked in the timetable for ' + a + ' to ' + b + '.'; }, offenTage: 'The timetable for your dates is not yet published. The plan shows journey times and durations; our concierge will confirm the departures.',
      offenZeile: 'The timetable for this day is not yet published. Journey time as in today’s timetable.', keineFahrt: 'The timetable shows no further departure at this time on this day. Move the excursion to another day.', ohneRueck: 'The timetable shows no return connection at this time. Our concierge will check it for you.', fehler: 'The timetable is not available right now. The times will follow as soon as it answers.',
      restPlatz: 'No room left in your days', restPlatzT: function (n) { return n + ' no longer fits at this pace. Plan more densely, or stay one more night.'; }, restFahrt: 'Does not fit into your days', restFahrtT: function (n) { return n + ': alongside your other excursions, no day leaves room for a journey there and back. Remove one excursion, or ask our concierge.'; }, letzte: 'last return of the day', naechste: 'no earlier return', zuSpaet: function (n, u) { return 'The ' + n + ' close at ' + u + '. Choose an earlier departure or another day.'; }, neuRechnen: 'Updating your plan.', sonderAb: 'from Wengen or Grindelwald', restNie: 'Not reachable during your stay', restNieT: function (n) { return n + ': the timetable shows no service on any of your days.'; },
      dichter: 'Plan more densely', nacht: 'Check one more night', tagWahl: 'Day', haus: 'Have the concierge get the tickets', selbst: 'Book yourself with', weg: 'Remove', ab: 'from', tagespreis: 'day rate', preisOffen: 'Price not yet published', vorOrt: 'Time on site', empf: 'recommended', abfUm: 'Departure at', eigen: 'Own time', sucht: 'Still finding a place for', tausch: 'swap with', mitTag: 'together with', passtNicht: 'The excursion does not fit on that day. The plan stays as it was.', getauscht: function (a, b) { return a + ' and ' + b + ' have swapped days.'; }, frueher: 'Earlier', spaeter: 'Later', keinFrueher: 'Nothing earlier on this day fits your plan.', keinSpaeter: 'There is no later departure on this day.', gehtNicht: 'With this departure there is no return left. The plan stays as it was.', tRuhe: 'One excursion per full day, leaving from 9.30 am, back by 6 pm.', tMitte: 'Up to two excursions per full day, leaving from 9 am, back by 7.30 pm.', tAlles: 'Up to three excursions per full day, leaving from 8 am, back by 8.30 pm.', tRand: 'On arrival day one excursion between 3 and 8.30 pm, on departure day one that is back by 12.30 pm. Harder Kulm can also be planned for the evening, back by 10.30 pm.', abfWahl: 'Change departure', halbOffen: 'Half Fare price from the operator', dichterHin: 'To fit everything you chose, some days are planned more densely than you selected.', anbieter: 'operator’s price', gk: 'with guest card', proP: 'per person',
      einzel: 'Single tickets', mind: 'at least', summe: 'Sum of the prices the operators publish', hinweisE: 'Where no amount is shown, the operator states the price at purchase.', drin: 'included', halb: 'half price', sonder: '25 % off', nichtdrin: 'not in the pass', zuschlag: 'add-on ticket', passFuer: 'Pass for', tage: 'days', kind: 'Children 6–15: CHF 30', best: 'Lowest price', nurPass: 'pass price, without add-ons', keinK: 'Choose at least one excursion.', empfK: 'Our recommendation for your days', einzelfahrt: 'single fares', sparen: 'You save', empfPass: function (n, t, p) { return n + ' for ' + t + ' days, CHF ' + p + '.'; }, empfSpar: function (e, s) { return 'Single tickets would come to CHF ' + e + ', you save CHF ' + s + '.'; }, empfEinzel: function (e, n, p) { return 'Single tickets, CHF ' + e + ' in total. The cheapest pass would be ' + p + ' (' + n + ').'; }, empfOffen: 'Which way is cheaper depends on day rates the operator only states at purchase. Our concierge will work it out for you.',
      lHaus: 'Tickets from the concierge', lLunch: 'Packed lunch', merk: 'Save', gemerkt: 'Saved', kopiert: 'Link copied', gruss: 'Good day', mailPlan: 'My plan', mailHaus: 'please arrange', mailSelbst: 'I will book myself', mailW: 'In addition', wLunch: 'Packed lunch for the excursion days', wShuttle: 'Shuttle to Interlaken Ost station', wTisch: 'A table in the evening', mailT: 'Saved events', ende: 'Kind regards',
      gleis: 'Platform', dauer: 'Duration', inPlan: 'Add to plan', keinTag: 'The timetable shows no service on this day.', offenTag: 'The timetable for this day is not yet published.', spaet: 'Nothing runs at this time on this day. Choose an earlier time.', standW: 'Public timetable, as of', via: 'via', schiff: 'Boat', bahn: 'Mountain railway', zug: 'Train', bus: 'Bus' }
,
    fr: { tagN: 'Jour', anreise: 'Arrivée', abreise: 'Départ', raus: 'Départ de l’hôtel', abf: 'Départ', ank: 'Arrivée', vor: 'sur place', rueck: 'Retour depuis', heim: 'De retour à l’hôtel', direkt: 'direct', um1: '1 changement', umN: 'changements', std: 'h', min: 'min', rund: 'environ',
      fahrtHin: 'Trajet aller', fahrtZur: 'Trajet retour', frei: 'Cette journée reste libre, pour la maison et l’Aar.', freiAn: 'Arriver et s’installer.', freiAb: 'Le temps du petit-déjeuner et du chemin vers le train.',
      laden: 'Lecture de l’horaire.', keinZiel: 'Touchez ci-dessus ce que vous aimeriez voir. Le programme se compose de lui-même.', keinDatum: 'Choisissez ci-dessus l’arrivée et le départ.',
      alle: 'tous les jours de votre séjour', teils: function (n, m) { return n + ' jours sur ' + m; }, nie: 'aucune course pendant votre séjour', offen: 'horaire pas encore publié', erreichbar: 'accessible pendant votre séjour', nichtAlle: 'pas tous les jours',
      geprueft: function (a, b) { return 'Vérifié dans l’horaire du ' + a + ' au ' + b + '.'; }, offenTage: 'L’horaire de vos dates n’est pas encore publié. Le programme indique les durées de trajet ; notre concierge confirmera les départs.',
      offenZeile: 'L’horaire de ce jour n’est pas encore publié. Durée du trajet selon l’horaire actuel.', keineFahrt: 'L’horaire n’indique plus de départ à cette heure ce jour-là. Placez l’excursion un autre jour.', ohneRueck: 'L’horaire n’indique pas de retour à cette heure. Notre concierge le vérifie pour vous.', fehler: 'L’horaire n’est pas disponible pour l’instant. Les heures suivront dès qu’il répondra.',
      restPlatz: 'Plus de place dans vos journées', restPlatzT: function (n) { return n + ' ne tient plus à ce rythme. Planifiez plus serré ou restez une nuit de plus.'; }, restFahrt: 'Ne tient plus dans vos journées', restFahrtT: function (n) { return n + ' : à côté de vos autres excursions, aucun jour ne laisse place à un aller-retour. Retirez une excursion ou demandez à notre concierge.'; }, letzte: 'dernier retour de la journée', naechste: 'aucun retour plus tôt', zuSpaet: function (n, u) { return 'Les ' + n + ' ferment à ' + u + '. Choisissez un départ plus tôt ou un autre jour.'; }, neuRechnen: 'Votre programme est recalculé.', sonderAb: 'dès Wengen ou Grindelwald', restNie: 'Pas accessible pendant votre séjour', restNieT: function (n) { return n + ' : l’horaire n’indique aucune course pendant vos journées.'; },
      dichter: 'Planifier plus serré', nacht: 'Vérifier une nuit de plus', tagWahl: 'Jour', haus: 'Billets réservés par le concierge', selbst: 'Réserver soi-même auprès de', weg: 'Retirer', ab: 'dès', tagespreis: 'prix du jour', preisOffen: 'Prix pas encore publié', vorOrt: 'Temps sur place', empf: 'recommandé', abfUm: 'Départ à', eigen: 'Heure choisie', sucht: 'Nous cherchons encore une place pour', tausch: 'échanger avec', mitTag: 'avec', passtNicht: 'L’excursion ne tient pas ce jour-là. Le programme reste tel qu’il était.', getauscht: function (a, b) { return a + ' et ' + b + ' ont échangé leurs jours.'; }, frueher: 'Plus tôt', spaeter: 'Plus tard', keinFrueher: 'Rien de plus tôt ce jour-là ne s’accorde avec votre programme.', keinSpaeter: 'Il n’y a plus de départ plus tard ce jour-là.', gehtNicht: 'Avec ce départ, il n’y a plus de retour. Le programme reste tel qu’il était.', tRuhe: 'Une excursion par journée entière, départ dès 9 h 30, retour avant 18 h.', tMitte: 'Jusqu’à deux excursions par journée entière, départ dès 9 h, retour avant 19 h 30.', tAlles: 'Jusqu’à trois excursions par journée entière, départ dès 8 h, retour avant 20 h 30.', tRand: 'Le jour d’arrivée, une excursion entre 15 h et 20 h 30 ; le jour du départ, une avec retour avant 12 h 30. Le Harder Kulm se prévoit aussi en soirée, retour avant 22 h 30.', abfWahl: 'Changer le départ', halbOffen: 'prix demi-tarif auprès de l’exploitant', dichterHin: 'Pour que tout votre choix trouve place, certains jours sont plus remplis que prévu.', anbieter: 'prix de l’exploitant', gk: 'avec la carte d’hôte', proP: 'par personne',
      einzel: 'Billets à l’unité', mind: 'au moins', summe: 'Somme des prix publiés par les exploitants', hinweisE: 'Là où aucun montant ne figure, l’exploitant indique le prix à l’achat.', drin: 'inclus', halb: 'demi-tarif', sonder: '25 % de rabais', nichtdrin: 'pas dans le pass', zuschlag: 'billet complémentaire', passFuer: 'Pass pour', tage: 'jours', kind: 'Enfants 6–15 : CHF 30', best: 'Le moins cher', nurPass: 'prix du pass, sans suppléments', keinK: 'Choisissez au moins une excursion.', empfK: 'Notre recommandation pour vos journées', einzelfahrt: 'trajets à l’unité', sparen: 'Vous économisez', empfPass: function (n, t, p) { return n + ' pour ' + t + ' jours, CHF ' + p + '.'; }, empfSpar: function (e, s) { return 'À l’unité, ce serait CHF ' + e + ' ; vous économisez CHF ' + s + '.'; }, empfEinzel: function (e, n, p) { return 'Billets à l’unité, CHF ' + e + ' au total. Le pass le moins cher reviendrait à ' + p + ' (' + n + ').'; }, empfOffen: 'Le choix le moins cher dépend des prix du jour, que l’exploitant n’indique qu’à l’achat. Notre concierge fait le calcul pour vous.',
      lHaus: 'Billets par le concierge', lLunch: 'Panier-repas', merk: 'Noter', gemerkt: 'Noté', kopiert: 'Lien copié', gruss: 'Bonjour', mailPlan: 'Mon programme', mailHaus: 'merci de vous en occuper', mailSelbst: 'je réserve moi-même', mailW: 'En plus', wLunch: 'Panier-repas pour les jours d’excursion', wShuttle: 'Navette pour la gare d’Interlaken Ost', wTisch: 'Une table le soir', mailT: 'Événements notés', ende: 'Meilleures salutations',
      gleis: 'Voie', dauer: 'Durée', inPlan: 'Dans le programme', keinTag: 'L’horaire n’indique aucune course ce jour-là.', offenTag: 'L’horaire de ce jour n’est pas encore publié.', spaet: 'Plus rien ne circule à cette heure ce jour-là. Choisissez une heure plus tôt.', standW: 'Horaire public, état', via: 'via', schiff: 'Bateau', bahn: 'Chemin de fer de montagne', zug: 'Train', bus: 'Bus' },
    zh: { tagN: '第', anreise: '入住', abreise: '退房', raus: '从酒店出发', abf: '出发', ank: '到达', vor: '停留', rueck: '返程自', heim: '回到酒店', direkt: '直达', um1: '换乘 1 次', umN: '次换乘', std: '小时', min: '分钟', rund: '约',
      fahrtHin: '去程', fahrtZur: '返程', frei: '这一天留给酒店与阿勒河。', freiAn: '抵达并入住。', freiAb: '留出早餐和前往车站的时间。',
      laden: '正在读取时刻表。', keinZiel: '请在上方点选您想去的地方，行程会自动生成。', keinDatum: '请在上方选择入住和退房日期。',
      alle: '您的每一天都可前往', teils: function (n, m) { return m + ' 天中有 ' + n + ' 天可前往'; }, nie: '您入住期间不运营', offen: '时刻表尚未公布', erreichbar: '您入住期间可前往', nichtAlle: '并非每天运营',
      geprueft: function (a, b) { return '已按时刻表核对：' + a + ' 至 ' + b + '。'; }, offenTage: '您所选日期的时刻表尚未公布。行程显示车程与时长，出发时间由礼宾部为您确认。',
      offenZeile: '当天时刻表尚未公布。车程按当前时刻表计算。', keineFahrt: '当天此时已无班次。请把这一目的地移到另一天。', ohneRueck: '时刻表中此时没有返程班次，礼宾部将为您核实。', fehler: '时刻表暂时无法读取，恢复后将显示时间。',
      restPlatz: '您的行程已排满', restPlatzT: function (n) { return n + ' 按当前节奏已排不下。请安排得更紧凑，或多住一晚。'; }, restFahrt: '您的日程已排不下', restFahrtT: function (n) { return n + '：在其他行程之外，没有一天能安排往返。请去掉一个目的地，或咨询礼宾部。'; }, letzte: '当日末班返程', naechste: '没有更早的返程', zuSpaet: function (n, u) { return n + ' 于 ' + u + ' 关闭。请选择更早的班次或另一天。'; }, neuRechnen: '正在重新计算您的行程。', sonderAb: '自 Wengen 或 Grindelwald 起', restNie: '您入住期间无法前往', restNieT: function (n) { return n + '：时刻表显示您入住期间没有班次。'; },
      dichter: '安排得更紧凑', nacht: '查看多住一晚', tagWahl: '日期', haus: '请礼宾部代购车票', selbst: '自行预订：', weg: '移除', ab: '起', tagespreis: '当日票价', preisOffen: '票价尚未公布', vorOrt: '停留时间', empf: '建议', abfUm: '出发时间', eigen: '自选时间', sucht: '仍在为以下行程安排时间：', tausch: '与此对调：', mitTag: '同日：', passtNicht: '这一天放不下该行程。行程保持不变。', getauscht: function (a, b) { return a + ' 与 ' + b + ' 已对调日期。'; }, frueher: '提前', spaeter: '延后', keinFrueher: '当天没有更早且适合您行程的班次。', keinSpaeter: '当天没有更晚的班次。', gehtNicht: '选择该班次将没有返程。行程保持不变。', tRuhe: '每个整天安排一项行程，9:30 起出发，18:00 前返回。', tMitte: '每个整天最多两项行程，9:00 起出发，19:30 前返回。', tAlles: '每个整天最多三项行程，8:00 起出发，20:30 前返回。', tRand: '抵达当天在 15:00 至 20:30 之间安排一项，离店当天安排一项，12:30 前返回。Harder Kulm 也可安排在傍晚，22:30 前返回。', abfWahl: '更改出发时间', halbOffen: '半价卡票价请向运营商查询', dichterHin: '为了排下您选择的全部行程，部分日期安排得比您所选的更紧凑。', anbieter: '运营商价格', gk: '凭宾客卡', proP: '每人',
      einzel: '单程购票', mind: '至少', summe: '运营商公布价格合计', hinweisE: '未标金额的项目，购票时由运营商给出价格。', drin: '已包含', halb: '半价', sonder: '七五折', nichtdrin: '不含在通票中', zuschlag: '加票', passFuer: '通票', tage: '天', kind: '6–15 岁儿童：CHF 30', best: '最划算', nurPass: '通票价格，不含加票', keinK: '请至少选择一个目的地。', empfK: '我们为您的行程推荐', einzelfahrt: '单程票', sparen: '为您节省', empfPass: function (n, t, p) { return n + '，' + t + ' 天，CHF ' + p + '。'; }, empfSpar: function (e, s) { return '单独购票需 CHF ' + e + '，为您节省 CHF ' + s + '。'; }, empfEinzel: function (e, n, p) { return '单独购票，合计 CHF ' + e + '。最便宜的通票需 ' + p + '（' + n + '）。'; }, empfOffen: '哪种方式更划算取决于运营商仅在购票时公布的当日票价。我们的礼宾部会为您计算。',
      lHaus: '由礼宾部代购车票', lLunch: '午餐便当', merk: '收藏', gemerkt: '已收藏', kopiert: '链接已复制', gruss: '您好', mailPlan: '我的行程', mailHaus: '请代为安排', mailSelbst: '我自行预订', mailW: '另外', wLunch: '出游日的午餐便当', wShuttle: '前往因特拉肯东站的接驳车', wTisch: '晚间餐位', mailT: '已收藏的活动', ende: '谨致问候',
      gleis: '站台', dauer: '车程', inPlan: '加入行程', keinTag: '时刻表显示当天没有班次。', offenTag: '当天的时刻表尚未公布。', spaet: '当天此时已无班次，请选择更早的时间。', standW: '公共交通时刻表，更新于', via: '经', schiff: '游船', bahn: '登山铁路', zug: '火车', bus: '巴士' },
    ko: { tagN: '일차', anreise: '도착', abreise: '출발', raus: '호텔 출발', abf: '출발', ank: '도착', vor: '현지 체류', rueck: '돌아오는 편', heim: '호텔 도착', direkt: '직행', um1: '환승 1회', umN: '회 환승', std: '시간', min: '분', rund: '약',
      fahrtHin: '가는 길', fahrtZur: '오는 길', frei: '이날은 호텔과 아레 강을 위해 비워 둡니다.', freiAn: '도착해 객실에 짐을 풉니다.', freiAb: '아침 식사와 역까지 가는 시간.',
      laden: '시간표를 읽는 중입니다.', keinZiel: '위에서 보고 싶은 곳을 눌러 주세요. 일정이 저절로 만들어집니다.', keinDatum: '위에서 도착일과 출발일을 선택해 주세요.',
      alle: '머무시는 모든 날 운행', teils: function (n, m) { return m + '일 중 ' + n + '일 운행'; }, nie: '머무시는 동안 운행 없음', offen: '시간표 미공개', erreichbar: '머무시는 동안 운행', nichtAlle: '매일 운행하지 않음',
      geprueft: function (a, b) { return a + '부터 ' + b + '까지 시간표로 확인했습니다.'; }, offenTage: '선택하신 날짜의 시간표가 아직 공개되지 않았습니다. 일정에는 이동 시간과 소요 시간만 표시되며, 출발 시각은 컨시어지가 확인해 드립니다.',
      offenZeile: '이날의 시간표는 아직 공개되지 않았습니다. 이동 시간은 현재 시간표 기준입니다.', keineFahrt: '이날 이 시각 이후에는 운행편이 없습니다. 다른 날로 옮겨 주세요.', ohneRueck: '이 시각에는 돌아오는 편이 시간표에 없습니다. 컨시어지가 확인해 드립니다.', fehler: '지금은 시간표를 불러올 수 없습니다. 응답이 오면 시각이 표시됩니다.',
      restPlatz: '일정에 자리가 없습니다', restPlatzT: function (n) { return n + ': 이 속도로는 더 넣을 수 없습니다. 더 촘촘하게 계획하시거나 하루 더 머무세요.'; }, restFahrt: '일정에 더 이상 들어가지 않습니다', restFahrtT: function (n) { return n + ': 다른 일정과 함께 왕복할 수 있는 날이 없습니다. 한 곳을 빼시거나 컨시어지에 문의해 주세요.'; }, letzte: '당일 마지막 돌아오는 편', naechste: '더 이른 돌아오는 편 없음', zuSpaet: function (n, u) { return n + '는 ' + u + '에 문을 닫습니다. 더 이른 출발이나 다른 날을 선택해 주세요.'; }, neuRechnen: '일정을 다시 계산하고 있습니다.', sonderAb: 'Wengen 또는 Grindelwald부터', restNie: '머무시는 동안 갈 수 없음', restNieT: function (n) { return n + ': 머무시는 날에는 시간표에 운행편이 없습니다.'; },
      dichter: '더 촘촘하게 계획', nacht: '하루 더 머물기 확인', tagWahl: '날짜', haus: '컨시어지에게 티켓 준비 맡기기', selbst: '직접 예약:', weg: '삭제', ab: '부터', tagespreis: '당일 요금', preisOffen: '요금 미공개', vorOrt: '머무는 시간', empf: '추천', abfUm: '출발 시각', eigen: '직접 입력', sucht: '아직 자리를 찾고 있습니다:', tausch: '교체:', mitTag: '함께:', passtNicht: '그날에는 이 일정이 들어가지 않습니다. 일정은 그대로 둡니다.', getauscht: function (a, b) { return a + '와(과) ' + b + '의 날짜를 바꿨습니다.'; }, frueher: '더 일찍', spaeter: '더 늦게', keinFrueher: '이날 일정에 맞는 더 이른 출발편이 없습니다.', keinSpaeter: '이날 더 늦은 출발편이 없습니다.', gehtNicht: '이 출발편으로는 돌아오는 편이 없습니다. 일정은 그대로 둡니다.', tRuhe: '온전한 하루에 한 곳, 9시 30분부터 출발해 18시까지 돌아옵니다.', tMitte: '온전한 하루에 최대 두 곳, 9시부터 출발해 19시 30분까지 돌아옵니다.', tAlles: '온전한 하루에 최대 세 곳, 8시부터 출발해 20시 30분까지 돌아옵니다.', tRand: '도착일에는 15시에서 20시 30분 사이에 한 곳, 출발일에는 12시 30분까지 돌아오는 한 곳입니다. Harder Kulm은 저녁에도 계획하며 22시 30분까지 돌아옵니다.', abfWahl: '출발 시간 변경', halbOffen: '반액 카드 요금은 운영사 문의', dichterHin: '선택하신 일정을 모두 넣기 위해 일부 날은 선택하신 것보다 촘촘하게 짰습니다.', anbieter: '운영사 가격', gk: '게스트 카드 이용 시', proP: '1인',
      einzel: '개별 티켓', mind: '최소', summe: '운영사가 공시한 가격 합계', hinweisE: '금액이 없는 항목은 구매 시 운영사가 가격을 알려 드립니다.', drin: '포함', halb: '반값', sonder: '25 % 할인', nichtdrin: '패스에 미포함', zuschlag: '추가 티켓', passFuer: '패스', tage: '일', kind: '6–15세 어린이: CHF 30', best: '가장 저렴한 방법', nurPass: '패스 가격, 추가 요금 제외', keinK: '최소 한 곳을 선택해 주세요.', empfK: '고객님의 일정에 대한 추천', einzelfahrt: '개별 요금', sparen: '절약', empfPass: function (n, t, p) { return n + ' ' + t + '일권, CHF ' + p + '.'; }, empfSpar: function (e, s) { return '개별 티켓은 CHF ' + e + '이며, CHF ' + s + '를 절약하실 수 있습니다.'; }, empfEinzel: function (e, n, p) { return '개별 티켓, 합계 CHF ' + e + '. 가장 저렴한 패스는 ' + p + ' (' + n + ')입니다.'; }, empfOffen: '어느 쪽이 더 저렴한지는 운영사가 구매 시에만 공개하는 당일 요금에 따라 달라집니다. 컨시어지가 계산해 드립니다.',
      lHaus: '컨시어지가 준비하는 티켓', lLunch: '런치 박스', merk: '담기', gemerkt: '담음', kopiert: '링크를 복사했습니다', gruss: '안녕하세요', mailPlan: '나의 일정', mailHaus: '준비 부탁드립니다', mailSelbst: '직접 예약합니다', mailW: '추가 요청', wLunch: '나들이 날의 런치 박스', wShuttle: '인터라켄 오스트 역까지 셔틀', wTisch: '저녁 테이블', mailT: '담아 둔 행사', ende: '감사합니다',
      gleis: '플랫폼', dauer: '소요', inPlan: '일정에 추가', keinTag: '이날은 시간표에 운행편이 없습니다.', offenTag: '이날의 시간표는 아직 공개되지 않았습니다.', spaet: '이날 이 시각 이후에는 운행이 없습니다. 더 이른 시각을 선택해 주세요.', standW: '대중교통 시간표, 기준', via: '경유', schiff: '유람선', bahn: '산악 열차', zug: '기차', bus: '버스' },
    ar: { tagN: 'اليوم', anreise: 'الوصول', abreise: 'المغادرة', raus: 'الخروج من الفندق', abf: 'الانطلاق', ank: 'الوصول', vor: 'في المكان', rueck: 'العودة من', heim: 'العودة إلى الفندق', direkt: 'مباشر', um1: 'تبديل واحد', umN: 'تبديلات', std: 'س', min: 'د', rund: 'نحو',
      fahrtHin: 'رحلة الذهاب', fahrtZur: 'رحلة العودة', frei: 'يبقى هذا اليوم حراً، للفندق ونهر الآر.', freiAn: 'الوصول والاستقرار في الغرفة.', freiAb: 'وقت للفطور وللطريق إلى القطار.',
      laden: 'جارٍ قراءة جدول المواعيد.', keinZiel: 'اختاروا أعلاه ما تودّون رؤيته، وسيتكوّن البرنامج تلقائياً.', keinDatum: 'اختاروا أعلاه تاريخي الوصول والمغادرة.',
      alle: 'في كل أيام إقامتكم', teils: function (n, m) { return n + ' من ' + m + ' أيام'; }, nie: 'لا رحلات خلال إقامتكم', offen: 'الجدول لم يُنشر بعد', erreichbar: 'متاح خلال إقامتكم', nichtAlle: 'ليس في كل الأيام',
      geprueft: function (a, b) { return 'تم التحقق في جدول المواعيد من ' + a + ' إلى ' + b + '.'; }, offenTage: 'لم يُنشر بعد جدول المواعيد لتواريخكم. يعرض البرنامج مدة الرحلات، ويؤكد الكونسيرج مواعيد الانطلاق.',
      offenZeile: 'لم يُنشر بعد جدول هذا اليوم. مدة الرحلة بحسب الجدول الحالي.', keineFahrt: 'لا توجد رحلة أخرى في هذا الوقت من هذا اليوم. انقلوا الرحلة إلى يوم آخر.', ohneRueck: 'لا يذكر الجدول رحلة عودة في هذا الوقت. سيتحقق الكونسيرج منها لكم.', fehler: 'جدول المواعيد غير متاح حالياً. ستظهر الأوقات فور توفره.',
      restPlatz: 'لا متسع في أيامكم', restPlatzT: function (n) { return n + ': لم يعد يتسع له البرنامج بهذه الوتيرة. اجعلوا البرنامج أكثف، أو ابقوا ليلة إضافية.'; }, restFahrt: 'لا يتسع له برنامج أيامكم', restFahrtT: function (n) { return n + ': إلى جانب رحلاتكم الأخرى لا يتسع أي يوم للذهاب والعودة. احذفوا رحلة أو اسألوا الكونسيرج.'; }, letzte: 'آخر عودة في اليوم', naechste: 'لا عودة أبكر', zuSpaet: function (n, u) { return 'تُغلق ' + n + ' عند ' + u + '. اختاروا موعد انطلاق أبكر أو يوماً آخر.'; }, neuRechnen: 'يُعاد حساب برنامجكم.', sonderAb: 'من Wengen أو Grindelwald', restNie: 'غير متاح خلال إقامتكم', restNieT: function (n) { return n + ': لا يذكر الجدول أي رحلة في أيام إقامتكم.'; },
      dichter: 'برنامج أكثف', nacht: 'التحقق من ليلة إضافية', tagWahl: 'اليوم', haus: 'الكونسيرج يحجز التذاكر لكم', selbst: 'الحجز بأنفسكم لدى', weg: 'حذف', ab: 'من', tagespreis: 'سعر اليوم', preisOffen: 'السعر لم يُنشر بعد', vorOrt: 'مدة البقاء', empf: 'موصى به', abfUm: 'الانطلاق في', eigen: 'وقت من اختياركم', sucht: 'ما زلنا نبحث عن مكان لـ', tausch: 'تبديل مع', mitTag: 'مع', passtNicht: 'لا تتسع الرحلة في ذلك اليوم. يبقى البرنامج كما كان.', getauscht: function (a, b) { return 'تم تبديل يومي ' + a + ' و' + b + '.'; }, frueher: 'أبكر', spaeter: 'أبعد', keinFrueher: 'لا توجد رحلة أبكر في هذا اليوم تناسب برنامجكم.', keinSpaeter: 'لا توجد رحلة لاحقة في هذا اليوم.', gehtNicht: 'مع هذه الرحلة لا تبقى رحلة عودة. يبقى البرنامج كما كان.', tRuhe: 'رحلة واحدة في اليوم الكامل، الانطلاق من 9:30 والعودة حتى 18:00.', tMitte: 'رحلتان على الأكثر في اليوم الكامل، الانطلاق من 9:00 والعودة حتى 19:30.', tAlles: 'ثلاث رحلات على الأكثر في اليوم الكامل، الانطلاق من 8:00 والعودة حتى 20:30.', tRand: 'في يوم الوصول رحلة واحدة بين 15:00 و20:30، وفي يوم المغادرة رحلة مع العودة حتى 12:30. يمكن التخطيط لـ Harder Kulm مساءً أيضاً، مع العودة حتى 22:30.', abfWahl: 'تغيير موعد الانطلاق', halbOffen: 'سعر نصف الأجرة لدى المشغّل', dichterHin: 'لكي يتسع البرنامج لكل ما اخترتموه، جُعلت بعض الأيام أكثر ازدحاماً مما اخترتم.', anbieter: 'سعر المشغّل', gk: 'ببطاقة الضيف', proP: 'للشخص',
      einzel: 'تذاكر فردية', mind: 'على الأقل', summe: 'مجموع الأسعار التي ينشرها المشغّلون', hinweisE: 'حيث لا يرد مبلغ، يحدد المشغّل السعر عند الشراء.', drin: 'مشمول', halb: 'نصف السعر', sonder: 'خصم 25 %', nichtdrin: 'غير مشمول', zuschlag: 'تذكرة إضافية', passFuer: 'بطاقة لمدة', tage: 'أيام', kind: 'الأطفال 6–15: CHF 30', best: 'الأقل سعراً', nurPass: 'سعر البطاقة، دون الإضافات', keinK: 'اختاروا رحلة واحدة على الأقل.', empfK: 'توصيتنا لأيامكم', einzelfahrt: 'رحلات مفردة', sparen: 'توفّرون', empfPass: function (n, t, p) { return n + ' لمدة ' + t + ' أيام، CHF ' + p + '.'; }, empfSpar: function (e, s) { return 'التذاكر المفردة تكلّف CHF ' + e + '، فتوفّرون CHF ' + s + '.'; }, empfEinzel: function (e, n, p) { return 'تذاكر مفردة، المجموع CHF ' + e + '. أرخص بطاقة تكلّف ' + p + ' (' + n + ').'; }, empfOffen: 'أيّ الخيارين أرخص يعتمد على أسعار اليوم التي لا يعلنها المشغّل إلا عند الشراء. الكونسيرج لدينا يحسبها لكم.',
      lHaus: 'التذاكر عبر الكونسيرج', lLunch: 'وجبة للرحلة', merk: 'حفظ', gemerkt: 'محفوظ', kopiert: 'تم نسخ الرابط', gruss: 'مرحباً', mailPlan: 'برنامجي', mailHaus: 'يرجى التكفّل بها', mailSelbst: 'سأحجز بنفسي', mailW: 'إضافةً إلى ذلك', wLunch: 'وجبة لأيام الرحلات', wShuttle: 'نقل إلى محطة إنترلاكن أوست', wTisch: 'طاولة في المساء', mailT: 'فعاليات محفوظة', ende: 'مع أطيب التحيات',
      gleis: 'الرصيف', dauer: 'المدة', inPlan: 'إلى البرنامج', keinTag: 'لا يذكر الجدول أي رحلة في هذا اليوم.', offenTag: 'لم يُنشر بعد جدول هذا اليوم.', spaet: 'لا رحلات في هذا الوقت من هذا اليوم. اختاروا وقتاً أبكر.', standW: 'جدول النقل العام، بتاريخ', via: 'عبر', schiff: 'قارب', bahn: 'قطار جبلي', zug: 'قطار', bus: 'حافلة' }
  };
  var W = WORT[SP] || WORT.en;
  var dauer = function (m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + ' ' + W.std + (r ? ' ' + r + ' ' + W.min : '') : m + ' ' + W.min; };
  var umst = function (n) { return n === 0 ? W.direkt : n === 1 ? W.um1 : n + ' ' + W.umN; };

  /* ---------- Fahrplan-Dienst: höchstens drei Abfragen gleichzeitig, jede Antwort wird für die Sitzung gemerkt ---------- */
  var LAGER = {}, WARTEN = [], LAEUFT = 0;
  // Verlässt der Gast die Seite mitten im Rechnen, brechen offene Abfragen still ab (Safari meldet sie sonst als Fehler in der Konsole)
  var ENDE = window.AbortController ? new AbortController() : null, GEHT = false;
  if (ENDE) { window.addEventListener('pagehide', function () { GEHT = true; ENDE.abort(); }); window.addEventListener('pageshow', function (e) { if (e.persisted) { ENDE = new AbortController(); GEHT = false; } }); }   // zurück aus dem Seitenspeicher: wieder abfragen können
  function weiter() { while (LAEUFT < 6 && WARTEN.length) { LAEUFT++; var a = WARTEN.shift(); a(); } }
  function wege(ziel, datum, zeit, zur, n, bis) {
    var k = [ziel, datum, zeit || '09:00', zur ? 1 : 0, n || 2, bis ? 1 : 0].join('|');
    if (LAGER[k]) return LAGER[k];
    try { var g = sessionStorage.getItem('pl|' + k); if (g) return (LAGER[k] = Promise.resolve(JSON.parse(g))); } catch (e) { /* ohne Speicher */ }
    return (LAGER[k] = new Promise(function (ok) {
      WARTEN.push(function () {
        var adr = WURZEL + 'api/wege?ziel=' + ziel + '&datum=' + datum + '&zeit=' + encodeURIComponent(zeit || '09:00') + (zur ? '&zurueck=1' : '') + (bis ? '&bis=1' : '') + '&n=' + (n || 2);
        var hole = function () { return fetch(adr, ENDE ? { signal: ENDE.signal } : undefined).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
        // antwortet der Dienst einmal nicht (502, 503), kommt nach einer Sekunde ein zweiter Versuch, erst dann steht «Fahrplan nicht abrufbar»
        hole().catch(function (e) { if (GEHT) throw e; return new Promise(function (w) { setTimeout(w, 1000); }).then(hole); })
          .then(function (d) { try { sessionStorage.setItem('pl|' + k, JSON.stringify(d)); } catch (e) { /* voll */ } ok(d); })
          .catch(function () { delete LAGER[k]; ok({ stand: 'fehler', fahrten: [] }); })
          .then(function () { LAEUFT--; weiter(); });
      });
      weiter();
    }));
  }

  /* ================================================================ Zielseite: «Ihr Weg ab unserer Tür» ================================================================ */
  $$('[data-pl-weg]').forEach(function (box) {
    var Z = lies('pl-ziel'); if (!Z) return;
    var fo = $('[data-pl-wegform]', box), liste = $('[data-pl-wegliste]', box), stand = $('[data-pl-wegstand]', box);
    var heute = iso(new Date()), start = plus(heute, 1);
    try { var p = JSON.parse(localStorage.getItem('gbr-plan') || 'null'); if (p && p.an && p.an >= heute) start = p.an < p.ab ? plus(p.an, 1) : p.an; } catch (e) { /* ohne Speicher */ }
    fo.elements.tag.min = heute; fo.elements.tag.value = start; fo.elements.tag.dispatchEvent(new Event('change', { bubbles: true }));
    var nr = 0;
    function zeile(f, i, d) {
      var erst = f.teile.filter(function (t) { return t.art !== 'fuss'; })[0] || {}, art = { schiff: W.schiff, bahn: W.bahn, zug: W.zug, bus: W.bus }[erst.art] || '';
      var zw = f.teile.filter(function (t) { return t.art !== 'fuss'; }).slice(0, -1).map(function (t) { return t.nach; }).filter(function (x, j, L) { return L.indexOf(x) === j; }).slice(0, 2).join(', ');
      return '<li style="--i:' + i + '"><a class="ab-z" href="' + WURZEL + (SP === 'de' ? '' : SP + '/') + 'planer.html?ziel=' + Z.id + '&an=' + d + '#wahl"><span class="ab-z__zeit">' + f.ab.slice(11, 16) + '</span>' +
        '<span class="ab-z__ziel"><b>' + esc(Z.name) + ' ' + f.an.slice(11, 16) + '</b><small>' + esc(art) + ' · ' + umst(f.umstiege) + (zw ? ' · ' + W.via + ' ' + esc(zw) : '') + '</small></span>' +
        '<span class="ab-z__gleis"><small>' + W.dauer + '</small><b>' + dauer(f.min) + '</b></span><span class="ab-z__nehmen">' + W.inPlan + '<i>' + PFEIL + '</i></span></a></li>';
    }
    function lade() {
      var d = fo.elements.tag.value, z = fo.elements.zeit.value, n = ++nr; if (!d) return;
      liste.innerHTML = '<li class="ab__leer">' + W.laden + '</li>';
      wege(Z.id, d, z, false, 4).then(function (a) {
        if (n !== nr) return;
        if (a.stand === 'fehler') { liste.innerHTML = '<li class="ab__leer">' + W.fehler + '</li>'; return; }
        var zz = { fahrt: Z.fahrt || 0 }; a = { stand: a.stand, fahrten: a.fahrten.filter(function (f) { return !zz.fahrt || gut(f, zz, d); }) };
        if (!a.fahrten.length) { liste.innerHTML = '<li class="ab__leer">' + (a.stand === 'offen' ? W.offenTag : a.stand === 'spaet' ? W.spaet : W.keinTag) + '</li>'; }
        else { liste.classList.add('neu'); liste.innerHTML = a.fahrten.map(function (f, i) { return zeile(f, i, d); }).join(''); }
        stand.textContent = W.standW + ' ' + new Date().toLocaleTimeString(ORT, { hour: '2-digit', minute: '2-digit' }) + ' · ' + lang(d, true);
      });
    }
    fo.addEventListener('change', lade); fo.addEventListener('submit', function (e) { e.preventDefault(); });
    lade();
  });

  /* ================================================================ Der Planer ================================================================ */
  var P = $('[data-planer]'), D = lies('pl-daten'); if (!P || !D) return;
  var ZIEL = {}; D.ziele.forEach(function (z) { ZIEL[z.id] = z; });
  var fo = $('[data-pl-leiste]', P), tageBox = $('[data-pl-tage]', P), restBox = $('[data-pl-rest]', P), kostenBox = $('[data-pl-kosten]', P), empfBox = $('[data-pl-empf]', P), EMPF = '', wahlStand = $('[data-pl-wahl-stand]', P), tempoSatz = $('[data-pl-tempo]', P);
  var listeBox = $('[data-pl-liste]', P), listeLeer = $('[data-pl-liste-leer]', P), anzahl = $('[data-pl-anzahl]', P), text = $('[data-pl-text]', P), termBox = $('[data-pl-termine]', P), termListe = $('[data-pl-termine-liste]', P);
  var heute = iso(new Date());
  var TEMPO = { ruhe: { von: 570, bis: 1020, max: 1 }, mitte: { von: 540, bis: 1110, max: 2 }, alles: { von: 480, bis: 1170, max: 3 } };
  var S = { an: '', ab: '', t: 'mitte', z: [], fix: {}, zeit: {}, vor: {}, haus: {}, w: {}, ev: {}, halb: '0' };

  /* ---------- Stand: Adresse (zum Teilen), sonst das Gerät des Gastes, sonst ein Beispiel ---------- */
  (function () {
    var q = new URLSearchParams(location.search), ok = function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x || ''); };
    var gemerkt = null; try { gemerkt = JSON.parse(localStorage.getItem('gbr-plan') || 'null'); } catch (e) { /* ohne Speicher */ }
    if (q.get('z')) {
      S.an = ok(q.get('an')) ? q.get('an') : ''; S.ab = ok(q.get('ab')) ? q.get('ab') : ''; S.t = TEMPO[q.get('t')] ? q.get('t') : 'mitte';
      q.get('z').split(',').forEach(function (x) { var p = x.split('.'); if (ZIEL[p[0]] && S.z.indexOf(p[0]) < 0) { S.z.push(p[0]); if (p[1] !== undefined && /^\d+$/.test(p[1])) S.fix[p[0]] = +p[1]; } });
      (q.get('h') || '').split(',').forEach(function (x) { if (ZIEL[x]) S.haus[x] = 1; }); (q.get('u') || '').split(',').forEach(function (x) { var u = x.split('.'); if (ZIEL[u[0]] && /^\d{4}$/.test(u[1] || '')) S.zeit[u[0]] = +u[1].slice(0, 2) * 60 + +u[1].slice(2); });
      (q.get('v') || '').split(',').forEach(function (x) { var v = x.split('.'); if (ZIEL[v[0]] && /^\d{2,3}$/.test(v[1] || '')) S.vor[v[0]] = +v[1]; }); (q.get('w') || '').split(',').forEach(function (x) { if (x) S.w[x] = 1; });
    } else if (gemerkt && gemerkt.z && gemerkt.z.length) {
      ['an', 'ab', 't', 'halb'].forEach(function (k) { if (gemerkt[k]) S[k] = gemerkt[k]; });
      S.z = (gemerkt.z || []).filter(function (x) { return ZIEL[x]; }); S.fix = gemerkt.fix || {}; S.zeit = gemerkt.zeit || {}; S.vor = gemerkt.vor || {}; S.haus = gemerkt.haus || {}; S.w = gemerkt.w || {}; S.ev = gemerkt.ev || {};
    } else {
      S.z = (D.programme[0] || { ziele: [] }).ziele.slice();
    }
    if (ok(q.get('an')) && !q.get('z')) { S.an = q.get('an'); if (!S.ab || S.ab <= S.an) S.ab = plus(S.an, 2); S.fix = {}; }
    if (!S.an || S.an < heute) { S.an = plus(heute, 7); S.ab = ''; S.fix = {}; }
    if (!S.ab || S.ab <= S.an) S.ab = plus(S.an, 3);
    if (!TEMPO[S.t]) S.t = 'mitte';
    var neu = q.get('ziel'); if (neu && ZIEL[neu] && S.z.indexOf(neu) < 0) { S.z.push(neu); }
  })();
  function merke() {
    try { localStorage.setItem('gbr-plan', JSON.stringify(S)); } catch (e) { /* ohne Speicher */ }
    try { history.replaceState(null, '', location.pathname + '?' + adresse() + location.hash); } catch (e) { /* Datei-Ansicht */ }
  }
  function adresse() {
    var q = 'an=' + S.an + '&ab=' + S.ab + '&t=' + S.t + '&z=' + S.z.map(function (x) { return x + (S.fix[x] !== undefined ? '.' + S.fix[x] : ''); }).join(',');
    var h = S.z.filter(function (x) { return S.haus[x]; }).join(','), w = Object.keys(S.w).filter(function (x) { return S.w[x]; }).join(',');
    var u = S.z.filter(function (x) { return S.zeit[x] !== undefined; }).map(function (x) { return x + '.' + hhmm(S.zeit[x]).replace(':', ''); }).join(',');
    var v = S.z.filter(function (x) { return S.vor[x]; }).map(function (x) { return x + '.' + S.vor[x]; }).join(',');
    return q + (h ? '&h=' + h : '') + (w ? '&w=' + w : '') + (u ? '&u=' + u : '') + (v ? '&v=' + v : '');
  }

  /* ---------- Die Tage des Aufenthalts ---------- */
  function tageListe(tempo) {
    var L = [], n = Math.round((tag(S.ab) - tag(S.an)) / 864e5), T = TEMPO[tempo || S.t];
    for (var i = 0; i <= n; i++) {
      var d = plus(S.an, i), art = i === 0 ? 'an' : i === n ? 'ab' : 'mitte';
      L.push({ i: i, d: d, art: art, von: art === 'an' ? 900 : T.von, bis: art === 'an' ? 1170 : art === 'ab' ? 720 : T.bis, max: art === 'mitte' ? T.max : 1, posten: [], zeit: 0 });
    }
    return L;
  }
  var vorVon = function (z) { return S.vor[z.id] || z.vor; };   // Zeit vor Ort: die eigene des Gastes, sonst die Empfehlung
  var bedarf = function (z) { return 2 * z.fahrt + vorVon(z) + 2 * D.orte[z.start].vorlauf + 10; };

  /* ---------- Eingaben ---------- */
  fo.elements.an.min = heute; fo.elements.an.value = S.an; fo.elements.ab.value = S.ab; fo.elements.ab.min = plus(S.an, 1); fo.elements.tempo.value = S.t;
  ['an', 'ab', 'tempo'].forEach(function (k) { fo.elements[k].dispatchEvent(new Event('change', { bubbles: true })); });
  fo.addEventListener('submit', function (e) { e.preventDefault(); });
  fo.addEventListener('change', function () {
    var an = fo.elements.an.value, ab = fo.elements.ab.value, t = fo.elements.tempo.value;
    if (!an || !ab) return;
    if (ab <= an) { ab = plus(an, 1); fo.elements.ab.value = ab; fo.elements.ab.dispatchEvent(new Event('change', { bubbles: true })); return; }
    if ((tag(ab) - tag(an)) / 864e5 > 14) { ab = plus(an, 14); fo.elements.ab.value = ab; fo.elements.ab.dispatchEvent(new Event('change', { bubbles: true })); return; }
    if (an === S.an && ab === S.ab && t === S.t) return;
    if (an !== S.an || ab !== S.ab) { S.fix = {}; S.zeit = {}; }
    S.an = an; S.ab = ab; S.t = t; fo.elements.ab.min = plus(an, 1); rechne();
  });
  $$('[data-ziel]', P).forEach(function (b) {
    var um = function () { var id = b.getAttribute('data-ziel'), i = S.z.indexOf(id); if (i >= 0) { S.z.splice(i, 1); delete S.fix[id]; delete S.zeit[id]; delete S.vor[id]; } else { S.z.push(id); } rechne(); };
    b.addEventListener('click', um);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); um(); } });
  });
  $$('[data-pl-programm]', P).forEach(function (b) {
    b.addEventListener('click', function () { var pr = D.programme.filter(function (x) { return x.id === b.getAttribute('data-pl-programm'); })[0]; if (!pr) return; S.z = pr.ziele.slice(); S.fix = {}; S.zeit = {}; rechne(); });
  });
  $$('[data-wunsch]', P).forEach(function (b) {
    var um = function () { var k = b.getAttribute('data-wunsch'); S.w[k] = S.w[k] ? 0 : 1; b.setAttribute('aria-pressed', String(!!S.w[k])); merke(); liste(); };
    b.setAttribute('aria-pressed', String(!!S.w[b.getAttribute('data-wunsch')]));
    b.addEventListener('click', um); b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); um(); } });
  });
  $$('[data-pl-halb]', P).forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.getAttribute('data-pl-halb') === S.halb));
    b.addEventListener('click', function () { S.halb = b.getAttribute('data-pl-halb'); $$('[data-pl-halb]', P).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); merke(); kosten(); });
  });

  /* ---------- Rechnen: Stand je Ziel und Tag aus dem Fahrplan, dann legen, dann die Zeiten des Tages ---------- */
  var lauf = 0, PLAN = null, STAND = {}, PROBE = null, T0 = 0;
  /* Ändert der Gast etwas, während die vorige Änderung noch geprüft wird, gelten beide zusammen: geht es nicht auf, werden beide zurückgenommen */
  function probe(p) { if (PROBE) { var alt = PROBE, z1 = p.zurueck; p.ids = p.ids.concat(alt.ids); p.zurueck = function () { z1(); alt.zurueck(); }; p.ja = ''; } PROBE = p; }   // T0: Beginn der Rechnung; weitere Versuche nur, solange der Gast nicht zu lange wartet
  function standVon(id, d) { return wege(id, d, '09:00', false, 2).then(function (a) { (STAND[id] = STAND[id] || {})[d] = a.stand; return a.stand; }); }
  function rechne() {
    var n = ++lauf; T0 = Date.now(); merke();
    if (tempoSatz) tempoSatz.textContent = ({ ruhe: W.tRuhe, mitte: W.tMitte, alles: W.tAlles }[S.t] || '') + ' ' + W.tRand;
    $$('[data-ziel]', P).forEach(function (b) { b.setAttribute('aria-pressed', String(S.z.indexOf(b.getAttribute('data-ziel')) >= 0)); });
    $$('[data-pl-programm]', P).forEach(function (b) { var pr = D.programme.filter(function (x) { return x.id === b.getAttribute('data-pl-programm'); })[0]; b.setAttribute('aria-pressed', String(!!pr && pr.ziele.length === S.z.length && pr.ziele.every(function (x) { return S.z.indexOf(x) >= 0; }))); });
    var T = tageListe();
    if (!S.z.length) { PLAN = { tage: T, rest: [], nie: [] }; zeichne(); kosten(); liste(); kacheln(n, T); return; }
    if (!PLAN) tageBox.innerHTML = '<p class="pl-leer">' + W.laden + '</p>';
    else { tageBox.setAttribute('aria-busy', 'true'); if (wahlStand) wahlStand.textContent = W.neuRechnen; }   // der alte Plan bleibt stehen, aber man sieht, dass neu gerechnet wird
    Promise.all(S.z.map(function (id) { return Promise.all(T.map(function (t) { return standVon(id, t.d); })); })).then(function () {
      if (n !== lauf) return;
      var plan = lege(T), stufe = S.t, folge = { ruhe: 'mitte', mitte: 'alles' };
      // Gewählt ist gewählt: passt nicht alles in das gewünschte Tempo, plant die Seite von selbst dichter und sagt es über dem Plan
      while (plan.rest.length && folge[stufe]) { stufe = folge[stufe]; var p2 = lege(tageListe(stufe)); if (p2.rest.length < plan.rest.length) { plan = p2; plan.dichter = stufe; } }
      var gezeigt = false;
      // Erst den Plan des ersten Durchgangs zeigen (nicht nach einer Änderung des Gastes, die noch geprüft wird), dann verfeinern
      var vorab = function (offen) { if (PROBE || n !== lauf) return; gezeigt = true; var neu = !!PLAN; plan.spaet = plan.spaet || []; plan.vorab = offen; plan.dichter = plan.tage.some(function (t) { return t.art === 'mitte' && t.posten.length > TEMPO[S.t].max; }); PLAN = plan; zeichne(neu); kosten(); liste(); };
      return zeiten(plan, n, vorab).then(function () { if (n !== lauf) return; plan.vorab = null;
        if (PROBE) { var pr = PROBE; PROBE = null;
          var drin = pr.ids.every(function (id) { return plan.tage.some(function (t) { return (t.zeilen || []).some(function (e) { return e.id === id && e.modus === 'ok'; }); }); });
          if (!drin) { pr.zurueck(); melde(pr.nein); return rechne(); }
          if (pr.ja) setTimeout(function () { melde(pr.ja); }, 300); }
        var neu = !!PLAN && !gezeigt; plan.dichter = plan.tage.some(function (t) { return t.art === 'mitte' && t.posten.length > TEMPO[S.t].max; }); PLAN = plan; zeichne(neu); kosten(); liste(); kacheln(n, T); });
    });
  }
  function lege(T) {
    var rest = [], nie = [];
    var reihe = S.z.slice().sort(function (a, b) { var fa = S.fix[a] !== undefined ? 1 : 0, fb = S.fix[b] !== undefined ? 1 : 0; return fb - fa || bedarf(ZIEL[b]) - bedarf(ZIEL[a]); });
    reihe.forEach(function (id) {
      var z = ZIEL[id], b = bedarf(z), moeglich = T.filter(function (t) { return (STAND[id] || {})[t.d] !== 'faehrt_nicht'; });
      if (!moeglich.length) { nie.push(id); return; }
      var fest = S.fix[id];
      if (fest !== undefined && T[fest] && moeglich.indexOf(T[fest]) >= 0) { T[fest].posten.push(id); T[fest].zeit += b; return; }
      var beste = null, wert = -1e9;
      moeglich.forEach(function (t) {
        if (t.posten.length >= t.max || t.zeit + b > t.bis - t.von) return;
        var w = 0;
        if (t.posten.some(function (p) { return ZIEL[p].gegend === z.gegend; })) w += 60;
        if (z.abend) w += t.art === 'an' ? 50 : t.posten.length ? 20 : 0; else w += t.art === 'mitte' ? 30 : 0;
        w -= t.posten.length * 15; w -= t.i;                // lieber ein leerer Tag, lieber früh im Aufenthalt
        if (w > wert) { wert = w; beste = t; }
      });
      if (beste) { beste.posten.push(id); beste.zeit += b; } else rest.push(id);
    });
    T.forEach(function (t) { t.posten.sort(function (a, b) { return (ZIEL[a].abend ? 1 : 0) - (ZIEL[b].abend ? 1 : 0) || bedarf(ZIEL[b]) - bedarf(ZIEL[a]); }); });
    return { tage: T, rest: rest, nie: nie };
  }
  /* Ein Ausflug ab einer Uhrzeit: Abfahrt, Ankunft, Rückfahrt aus dem Fahrplan des Tages. Fährt nach der empfohlenen Zeit vor Ort nichts mehr,
     gilt die letzte Rückfahrt des Tages, wenn dann noch mindestens eine Stunde (oder die halbe empfohlene Zeit) bleibt. Sonst passt der Ausflug hier nicht. */
  /* Eine Fahrt zählt nur, wenn sie am selben Tag abfährt und ankommt und nicht viel länger dauert als üblich (Robert 14.10.2026:
     eine Nachtverbindung um 21 Uhr mit elf Stunden Fahrt ist kein Ausflug). Rückkehr ins Haus spätestens eine Stunde nach dem Ende des Tagesfensters (am Abreisetag eine halbe), so wie es der Satz zum Tempo sagt,
     beim Harder Kulm am Abend bis 22.30 Uhr; nach der letzten Rückfahrt des Tages bleiben mindestens drei Viertel der empfohlenen Zeit vor Ort. */
  function gut(f, z, d) { return !!(f && f.ab && f.an && f.ab.slice(0, 10) === d && f.an.slice(0, 10) === d && (f.min || 0) <= Math.round(z.fahrt * 1.6) + 40); }
  function heimSpaet(t, z) { return z.abend && t.art !== 'ab' ? 1350 : t.art === 'ab' ? t.bis + 30 : t.bis + 60; }   // genau die Zeiten, die der Satz zum Tempo nennt (W.tRuhe … W.tRand)
  /* Schliesst am Ziel etwas, das zum Ausflug gehört (Trümmelbachfälle, planer_daten.py «schluss»), um welche Uhrzeit an diesem Tag; null = ohne Grenze */
  function schlussAm(z, d) { if (!z.schluss) return null; var md = d.slice(5), r = null; z.schluss.zeiten.forEach(function (x) { if (md >= x[0] && md <= x[1]) r = x[2]; }); return r; }
  function posten(t, id, uhr, letzter, erster) {
    var z = ZIEL[id], vor = vorVon(z), vl = D.orte[z.start].vorlauf, heimweg = (z.start === 'see' ? D.orte.see.vorlauf : D.orte.ost.vorlauf) - 4, e = { id: id, modus: 'ok' };
    var wunsch = S.zeit[id];
    if (wunsch !== undefined && (erster || wunsch - vl >= uhr)) { uhr = wunsch - vl; e.gewaehlt = true; }
    else if (z.abend && letzter && t.art !== 'ab') uhr = Math.max(uhr, 975);     // der Hausberg zum späten Nachmittag
    return wege(id, t.d, hhmm(uhr + vl), false, 2).then(function (hin) {
      if (hin.stand === 'fehler') { e.modus = 'fehler'; return { e: e, uhr: uhr + bedarf(z) }; }
      if (hin.stand === 'offen' && !hin.fahrten.length) { e.modus = 'offen'; return { e: e, uhr: uhr + bedarf(z) }; }
      var f = hin.fahrten.filter(function (x) { return gut(x, z, t.d); })[0]; if (!f) { e.modus = 'keine'; return { e: e, uhr: uhr }; }
      e.hin = f; e.raus = minuten(f.ab) - vl; e.an = minuten(f.an); e.bleib = vor;
      var sz = schlussAm(z, t.d); if (sz !== null && e.an > sz - z.schluss.besuch) e.zu = sz;   // kommt nach der Besuchszeit vor Schluss an: Hinweis am Billett, zeiten() sucht einen besseren Platz
      var fertig = function (r) { e.zur = r; e.heim = minuten(r.an) + heimweg; if (!e.letzte) e.bleib = minuten(r.ab) - e.an; if (e.heim > heimSpaet(t, z)) { e.modus = 'keine'; return { e: e, uhr: uhr }; } return { e: e, uhr: e.heim + 20 }; };
      return wege(id, t.d, hhmm(e.an + vor), true, 2).then(function (zur) {
        if (zur.stand === 'fehler') { e.modus = 'fehler'; return { e: e, uhr: e.an + vor + z.fahrt + 30 }; }
        var r0 = zur.fahrten.filter(function (x) { return gut(x, z, t.d); })[0]; if (r0) return fertig(r0);
        return wege(id, t.d, '23:30', true, 3, true).then(function (sp) {
          var L = sp.fahrten.filter(function (x) { return gut(x, z, t.d) && minuten(x.ab) >= e.an + Math.max(60, Math.round(vor * .75)); });
          if (!L.length) { e.modus = 'keine'; return { e: e, uhr: uhr }; }
          var r = L[L.length - 1]; e.bleib = minuten(r.ab) - e.an; e.letzte = true; return fertig(r);
        });
      });
    });
  }
  function reihe(t, ids) {
    var uhr = t.von, Z = [], k = Promise.resolve();
    ids.forEach(function (id, i) { k = k.then(function () { return posten(t, id, uhr, i === ids.length - 1, i === 0).then(function (x) { Z.push(x.e); uhr = x.uhr; }); }); });
    return k.then(function () { return Z; });
  }
  var ordnungen = function (L) { if (L.length < 2) return [L.slice()]; if (L.length === 2) return [L.slice(), [L[1], L[0]]]; var a = L[0], b = L[1], c = L[2]; return [[a, b, c], [b, a, c], [a, c, b], [c, a, b], [b, c, a], [c, b, a]]; };
  /* Ein Tag: die Reihenfolge nehmen, in der jeder Ausflug eine Hin- und eine Rückfahrt hat (Schiffe und kleine Bahnen fahren selten).
     Geht es in keiner Reihenfolge, gibt der Tag zurück, was nicht passt. Was der Gast selbst auf diesen Tag gelegt hat, bleibt stehen und sagt es. */
  function rechneTag(t, n) {
    if (!t.posten.length) { t.zeilen = []; return Promise.resolve([]); }
    var O = ordnungen(t.posten.slice(0, 3)), beste = null;
    // alle Reihenfolgen zugleich (die Abfragen laufen nebeneinander), dann die erste, in der am wenigsten ausfällt
    return Promise.all(O.map(function (o) { return reihe(t, o); })).then(function (L) {
      L.forEach(function (Z) { var fehl = Z.filter(function (e) { return e.modus === 'keine'; }).length * 100 + Z.filter(function (e) { return e.zu && e.modus === 'ok'; }).length; if (!beste || fehl < beste.fehl) beste = { Z: Z, fehl: fehl }; });
      if (!beste) return [];
      var raus = beste.Z.filter(function (e) { return e.modus === 'keine' && S.fix[e.id] === undefined; }).map(function (e) { return e.id; });
      t.zeilen = beste.Z.filter(function (e) { return raus.indexOf(e.id) < 0; }); t.posten = t.zeilen.map(function (e) { return e.id; });
      return raus;
    });
  }
  function zeiten(plan, n, vorab) {
    plan.spaet = [];
    return Promise.all(plan.tage.map(function (t) { return rechneTag(t, n).then(function (raus) { return raus.map(function (id) { return { id: id, von: t.i }; }); }); })).then(function (R) {
      if (vorab && n === lauf) vorab([].concat.apply([], R).map(function (w) { return w.id; }));   // der Plan steht schon da, während die weiteren Versuche laufen
      var warte = [].concat.apply([], R);
      /* Zweiter und dritter Versuch, je Ziel alle Möglichkeiten zugleich: ein anderer Tag mit Platz, oder ein Tausch (das Ziel geht auf einen Tag,
         ein Ausflug von dort auf einen Tag mit Platz, z. B. Harder Kulm vom Anreisetag an den Abend eines ganzen Tages). Gerechnet wird auf Kopien der Tage,
         übernommen wird der erste Versuch, bei dem alle betroffenen Tage aufgehen. Höchstens 24 Versuche je Ziel und 25 Sekunden insgesamt. */
      var kopie = function (t, posten) { return { i: t.i, d: t.d, art: t.art, von: t.von, bis: t.bis, max: t.max, zeit: t.zeit, posten: posten.slice() }; };
      var faehrt = function (id, t) { return (STAND[id] || {})[t.d] !== 'faehrt_nicht'; };
      // streng: das Ziel muss dort auch vor Schluss der Öffnungszeit ankommen (sanftLegen); sonst genügt Hin- und Rückfahrt, der Hinweis steht dann am Billett
      var spaetDort = function (A, K) { return A.some(function (a, x) { return a.muss.some(function (id) { return (K[x].zeilen || []).some(function (e) { return e.id === id && e.zu; }); }); }); };
      var probiere = function (A, streng) {
        var K = A.map(function (a) { return kopie(a.t, a.posten); });
        return Promise.all(K.map(function (k) { return rechneTag(k, n); })).then(function (RR) {
          return RR.every(function (r, x) { return !r.length && A[x].muss.every(function (id) { return K[x].posten.indexOf(id) >= 0; }); }) && !(streng && spaetDort(A, K)) ? K : null;
        });
      };
      /* Ein Ziel, das an seinem Tag zu spät für die Öffnungszeit ankommt (Trümmelbachfälle): auf einen anderen Tag legen oder mit einem Ausflug tauschen,
         sodass es dort vor Schluss ankommt. Geht das nicht, bleibt es, wo es ist, und das Billett sagt, wann die Fälle schliessen. */
      var sanftLegen = function (w) {
        if (n !== lauf || Date.now() - T0 > 25000) return;
        var T0t = plan.tage.filter(function (t) { return (t.zeilen || []).some(function (e) { return e.id === w.id && e.zu; }); })[0]; if (!T0t) return;
        var ohne = T0t.posten.filter(function (y) { return y !== w.id; }), V = [];
        plan.tage.forEach(function (t) { if (t !== T0t && t.posten.length < t.max && faehrt(w.id, t)) V.push([{ t: t, posten: t.posten.concat([w.id]), muss: [w.id] }, { t: T0t, posten: ohne, muss: [] }]); });
        plan.tage.forEach(function (t) {
          if (t === T0t || !faehrt(w.id, t)) return;
          t.posten.forEach(function (x) { if (S.fix[x] !== undefined || !faehrt(x, T0t)) return; V.push([{ t: t, posten: t.posten.filter(function (y) { return y !== x; }).concat([w.id]), muss: [w.id] }, { t: T0t, posten: ohne.concat([x]), muss: [x] }]); });
        });
        V = V.slice(0, 24);
        return Promise.all(V.map(function (A) { return probiere(A, true); })).then(function (E) {
          var k = -1; E.some(function (x, y) { if (x) { k = y; return true; } return false; });
          if (k < 0 || n !== lauf) return;
          V[k].forEach(function (a, y) { a.t.posten = E[k][y].posten; a.t.zeilen = E[k][y].zeilen; });
        });
      };
      var kette = Promise.resolve();
      warte.concat(plan.rest.map(function (id) { return { id: id, von: -1 }; })).forEach(function (w) {
        kette = kette.then(function () {
          var weg = function () { if (plan.rest.indexOf(w.id) < 0 && plan.spaet.indexOf(w.id) < 0) plan.spaet.push(w.id); };
          if (n !== lauf || Date.now() - T0 > 25000) return weg();
          var V = [];
          plan.tage.forEach(function (t) { if (t.i !== w.von && t.posten.length < t.max && faehrt(w.id, t)) V.push([{ t: t, posten: t.posten.concat([w.id]), muss: [w.id] }]); });
          plan.tage.forEach(function (t) {
            if (!faehrt(w.id, t)) return;
            t.posten.forEach(function (x) {
              if (S.fix[x] !== undefined) return;
              plan.tage.forEach(function (u) {
                if (u === t || u.posten.length >= u.max || !faehrt(x, u)) return;
                V.push([{ t: t, posten: t.posten.filter(function (y) { return y !== x; }).concat([w.id]), muss: [w.id] }, { t: u, posten: u.posten.concat([x]), muss: [x] }]);
              });
            });
          });
          V = V.slice(0, 24);
          return Promise.all(V.map(function (A) { return probiere(A); })).then(function (E) {
            // lieber ein Platz, an dem das Ziel auch vor Schluss der Öffnungszeit ankommt
            var k = -1; E.some(function (x, y) { if (x && !spaetDort(V[y], x)) { k = y; return true; } return false; });
            if (k < 0) E.some(function (x, y) { if (x) { k = y; return true; } return false; });
            if (k < 0 || n !== lauf) return weg();
            V[k].forEach(function (a, y) { a.t.posten = E[k][y].posten; a.t.zeilen = E[k][y].zeilen; });
            plan.rest = plan.rest.filter(function (y) { return y !== w.id; }); plan.spaet = plan.spaet.filter(function (y) { return y !== w.id; });
          });
        });
      });
      // danach: was zu spät für seine Öffnungszeit ankommt, sucht einen besseren Platz (Stand nach allen anderen Versuchen)
      return kette.then(function () {
        var L = []; plan.tage.forEach(function (t) { (t.zeilen || []).forEach(function (e) { if (e.zu && e.modus === 'ok' && S.fix[e.id] === undefined) L.push({ id: e.id }); }); });
        return L.reduce(function (k, w) { return k.then(function () { return sanftLegen(w); }); }, Promise.resolve());
      });
    });
  }

  /* ---------- Kacheln: Stand in der kleinen Zeile; die übrigen Ziele prüft die Seite danach, ohne den Plan aufzuhalten ---------- */
  function kacheln(n, T) {
    var tageN = T.length;
    function setze(id, L) {
      var el = $('[data-pl-stand="' + id + '"]', P), box = el && el.closest('.pl-z'); if (!el) return;
      var st = L.map(function (t) { return (STAND[id] || {})[t.d]; }), m = L.length, ganz = m === tageN;
      if (st.some(function (x) { return x === undefined; })) return;
      var ja = st.filter(function (x) { return x === 'faehrt'; }).length, nein = st.filter(function (x) { return x === 'faehrt_nicht'; }).length, of = st.filter(function (x) { return x === 'offen'; }).length;
      el.textContent = nein === m ? W.nie : of === m ? W.offen : nein ? (ganz ? W.teils(tageN - nein, tageN) : W.nichtAlle) : ja ? (ganz ? W.alle : W.erreichbar) : ZIEL[id].zeile;
      if (nein === m) box.setAttribute('data-zu', ''); else box.removeAttribute('data-zu');
    }
    S.z.forEach(function (id) { setze(id, T); });
    // Nicht gewählte Ziele: erster, mittlerer und letzter Tag genügen für die Auskunft auf der Kachel (weniger Abfragen an den Fahrplan); wird ein Ziel gewählt, prüft der Plan jeden Tag
    var probe = T.filter(function (t, i) { return i === 0 || i === T.length - 1 || i === Math.floor(T.length / 2); });
    var andere = D.ziele.map(function (z) { return z.id; }).filter(function (id) { return S.z.indexOf(id) < 0; });
    andere.forEach(function (id) { Promise.all(probe.map(function (t) { return standVon(id, t.d); })).then(function () { if (n === lauf) { setze(id, probe); fertig(); } }); });
    function fertig() {
      var alleOffen = T.every(function (t) { return D.ziele.every(function (z) { var s = (STAND[z.id] || {})[t.d]; return s === undefined || s === 'offen'; }); });
      wahlStand.textContent = alleOffen ? W.offenTage : W.geprueft(kurz(S.an), lang(S.ab, true).replace(/^[^,\s]+,?\s/, ''));
    }
    fertig();
  }

  /* ---------- Zeichnen: je Tag ein Kopf, je Ausflug ein Billett ---------- */
  /* Preis des Anbieters für genau diesen Tag (die Bahnen haben Sommer- und Winterpreise); liegt der Tag hinter der Preisliste, steht kein Betrag */
  function preisAm(z, d) { var r = null; (z.preise || []).forEach(function (x) { if (d >= x[0] && d <= x[1]) r = { v: x[2], h: x[3] || 0 }; }); return r; }
  var GOLD = (function () { var b = $('img[src*="zeichen-gold"]'); return b ? '<img src="' + esc(b.getAttribute('src')) + '" width="440" height="436" alt="" aria-hidden="true" loading="lazy" decoding="async">' : ''; })();
  function preisZeile(z, d) {
    var p = preisAm(z, d);
    if (!p) return GOLD + '<em class="pl-preis__offen">' + W.preisOffen + '</em><span>' + W.anbieter + '</span>';
    return GOLD + '<b class="pl-chf">' + chf(p.v) + '</b><small>CHF</small><span>' + W.anbieter + '</span>';
  }
  /* Zeit vor Ort: Auswahl von 30 Minuten bis 8 Stunden, die Empfehlung ist markiert und vorgewählt; nach der letzten Rückfahrt des Tages steht die tatsächliche Zeit dabei */
  function vorWahl(z, e) {
    var jetzt = vorVon(z), L = [];
    for (var m = 30; m <= 480; m += 30) L.push(m);
    if (L.indexOf(z.vor) < 0) L.push(z.vor); if (L.indexOf(jetzt) < 0) L.push(jetzt); L.sort(function (a, b) { return a - b; });
    return '<span class="pl-vor"><label>' + W.vorOrt + '<select data-pl-vor="' + z.id + '" aria-label="' + W.vorOrt + '">' + L.map(function (m) { return '<option value="' + m + '"' + (m === jetzt ? ' selected' : '') + '>' + dauer(m) + (m === z.vor ? ' · ' + W.empf : '') + '</option>'; }).join('') + '</select></label>' +
      (e.letzte ? '<small>' + dauer(e.bleib) + ' ' + W.vor + ' · ' + W.letzte + '</small>' : e.bleib - jetzt >= 30 ? '<small>' + dauer(e.bleib) + ' ' + W.vor + ' · ' + W.naechste + '</small>' : '') + '</span>';
  }
  function billett(t, e, k) {
    var z = ZIEL[e.id], o = D.orte[z.start], Z = '';
    var zl = function (zeit, was, klein, kl, dazu) { return '<div' + (kl ? ' class="' + kl + '"' : '') + '><dt>' + zeit + '</dt><i aria-hidden="true"></i><dd>' + was + (klein ? (klein.indexOf('<details') === 0 ? klein : '<small>' + klein + '</small>') : '') + (dazu || '') + '</dd></div>'; };
    var artW = { schiff: W.schiff, bahn: W.bahn, zug: W.zug, bus: W.bus };
    // Eine Fahrt mit Umstieg klappt auf wie in einer Karten-App: je Teilstrecke Abfahrt, Strecke, Verkehrsmittel, Gleis, Ankunft
    var fahrt = function (f) {
      var kurz = umst(f.umstiege) + ' · ' + dauer(f.min), T = (f.teile || []).filter(function (x) { return x.art !== 'fuss' && x.ab && x.an; });
      if (T.length < 2) return kurz + (T[0] && T[0].gleis ? ' · ' + W.gleis + ' ' + esc(T[0].gleis) : '');
      return '<details class="pl-um"><summary>' + kurz + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6 8 10.5 12.5 6"/></svg></summary><ol>' + T.map(function (x) {
        return '<li><b>' + x.ab.slice(11, 16) + '</b><span>' + esc(x.von) + ' – ' + esc(x.nach) + '<small>' + [(artW[x.art] || '') + (x.linie && x.art === 'zug' ? ' ' + esc(x.linie) : ''), x.gleis ? W.gleis + ' ' + esc(x.gleis) : '', W.ank + ' ' + x.an.slice(11, 16)].filter(Boolean).join(' · ') + '</small></span></li>';
      }).join('') + '</ol></details>';
    };
    var wahl = '<span class="pl-zeit__wahl" role="group" aria-label="' + W.abfWahl + '"><button type="button" data-pl-frueher="' + e.id + '">' + W.frueher + '</button>' +
      '<label class="pl-zeit__uhr"><span class="vh">' + W.abfUm + '</span><input type="time" step="300" value="' + (e.hin ? e.hin.ab.slice(11, 16) : '') + '" data-pl-uhr="' + e.id + '" aria-label="' + W.abfUm + '"></label>' +
      '<button type="button" data-pl-spaeter="' + e.id + '">' + W.spaeter + '</button></span>';
    if (e.modus === 'ok' || e.modus === 'ohneRueck') {
      Z += zl(hhmm(e.raus), W.raus, esc(o.weg)) + zl(e.hin.ab.slice(11, 16), W.abf + ' ' + esc(o.name), fahrt(e.hin), 'pl-zeit--ab', wahl) +
        zl(hhmm(e.an), esc(e.hin.nach), '', 'pl-zeit--ort', vorWahl(z, e));
      if (e.zur) Z += zl(e.zur.ab.slice(11, 16), W.rueck + ' ' + esc(e.zur.von), fahrt(e.zur)) + zl(hhmm(e.heim), W.heim, '');
    } else if (e.modus === 'offen') {
      Z += '<div class="pl-zeit--frei"><dd>' + W.fahrtHin + ' ' + dauer(z.fahrt) + ' · ' + W.rund + ' ' + dauer(vorVon(z)) + ' ' + W.vor + ' · ' + W.fahrtZur + ' ' + dauer(z.fahrt) + '</dd></div>';
    }
    var hinweis = { offen: W.offenZeile, keine: W.keineFahrt, ohneRueck: W.ohneRueck, fehler: W.fehler }[e.modus] || (e.zu && z.schluss ? W.zuSpaet(esc(z.schluss.name), hhmm(e.zu)) : '');
    var tageWahl = PLAN.tage.map(function (x) { var zu = (STAND[e.id] || {})[x.d] === 'faehrt_nicht', dort = x.i === t.i ? [] : x.posten.filter(function (p) { return p !== e.id; });
      var was = dort.length ? ' · ' + (dort.length >= x.max ? W.tausch : W.mitTag) + ' ' + dort.map(function (p) { return ZIEL[p].name; }).join(', ') : '';
      return '<option value="' + x.i + '"' + (x.i === t.i ? ' selected' : '') + (zu ? ' disabled' : '') + '>' + esc(tag(x.d).toLocaleDateString(ORT, { weekday: 'short', day: 'numeric', month: 'short' }) + was) + '</option>'; }).join('');
    return '<div class="pl-po"><div class="rg-tk pl-tk"><div class="rg-tk__haupt"><p class="rg-tk__kopf"><span>Nº 0' + (k + 1) + '</span><span>' + esc(z.zeile) + '</span></p>' +
      '<div class="pl-tk__in"><a class="pl-tk__bb" href="' + esc(z.seite) + '" aria-label="' + esc(z.name) + '"><span class="pl-tk__b pl-tk__b--g"><img src="' + esc(z.bild) + '" alt="" loading="lazy" decoding="async"></span>' +
      (z.klein || []).map(function (b) { return '<span class="pl-tk__b"><img src="' + esc(b) + '" alt="" loading="lazy" decoding="async"></span>'; }).join('') + '</a>' +
      '<div><h4 class="pl-tk__n"><a href="' + esc(z.seite) + '">' + esc(z.name) + '</a></h4>' + (Z ? '<dl class="pl-zeit">' + Z + '</dl>' : '') + (hinweis ? '<p class="pl-tk__hinweis">' + hinweis + '</p>' : '') + '</div></div></div>' +
      '<div class="rg-tk__abriss pl-preis">' + preisZeile(z, t.d) + (z.gk ? '<em>' + esc(z.gk) + ' ' + W.gk + '</em>' : '') + (z.dazu ? '<em class="pl-preis__dazu"><b>+</b> ' + esc(z.dazu).replace(/CHF (\d)/g, 'CHF&nbsp;$1') + '</em>' : '') + '</div></div>' +
      '<div class="pl-tk__wahl"><label>' + W.tagWahl + '<select data-pl-tag="' + e.id + '" aria-label="' + W.tagWahl + '">' + tageWahl + '</select></label>' +
      '<label><input type="checkbox" data-pl-haus="' + e.id + '"' + (S.haus[e.id] ? ' checked' : '') + '>' + W.haus + '</label>' +
      '<a href="' + esc(z.link) + '" target="_blank" rel="noopener">' + W.selbst + ' ' + esc(z.anbieter) + PFEIL + '</a>' +
      '<button type="button" data-pl-raus="' + e.id + '">' + W.weg + '</button></div></div>';
  }
  var neuZeit = 0;
  function zeichne(neu) {
    if (!PLAN) return;
    tageBox.removeAttribute('aria-busy');
    if (!S.z.length) { tageBox.innerHTML = '<p class="pl-leer">' + W.keinZiel + '</p>'; restBox.hidden = true; return; }
    tageBox.innerHTML = PLAN.tage.map(function (t) {
      var art = t.art === 'an' ? ' · ' + W.anreise : t.art === 'ab' ? ' · ' + W.abreise : '';
      var innen = (t.zeilen || []).length ? t.zeilen.map(function (e, k) { return billett(t, e, k); }).join('') : '<p class="pl-frei">' + (t.art === 'an' ? W.freiAn : t.art === 'ab' ? W.freiAb : W.frei) + '</p>';
      return '<article class="pl-tag" style="--n:' + t.i + '"><header class="pl-tag__kopf"><span class="pl-tag__nr">' + W.tagN + ' ' + (t.i + 1) + art + '</span><h3 class="pl-tag__name">' + esc(lang(t.d)) + '</h3></header>' + innen + '</article>';
    }).join('');
    if (PLAN.dichter) tageBox.insertAdjacentHTML('afterbegin', '<p class="pl-dichter">' + W.dichterHin + '</p>');
    if (PLAN.vorab && PLAN.vorab.length) tageBox.insertAdjacentHTML('afterbegin', '<p class="pl-dichter pl-sucht">' + W.sucht + ' ' + esc(PLAN.vorab.map(function (x) { return ZIEL[x].name; }).join(', ')) + '</p>');
    if (neu) { tageBox.classList.remove('pl-neu'); void tageBox.offsetWidth; tageBox.classList.add('pl-neu'); clearTimeout(neuZeit); neuZeit = setTimeout(function () { tageBox.classList.remove('pl-neu'); }, 1400); }
    var R = '';
    if (PLAN.nie.length) R += '<h3>' + W.restNie + '</h3>' + PLAN.nie.map(function (id) { return '<p>' + W.restNieT(esc(ZIEL[id].name)) + '</p>'; }).join('');
    if (PLAN.rest.length) R += '<h3>' + W.restPlatz + '</h3>' + PLAN.rest.map(function (id) { return '<p>' + W.restPlatzT(esc(ZIEL[id].name)) + '</p>'; }).join('') +
      '<div class="kn-reihe">' + (S.t !== 'alles' ? '<button class="kn" type="button" data-pl-dichter>' + W.dichter + '<i>' + PFEIL + '</i></button>' : '') + '<button class="kn kn--linie" type="button" data-pl-nacht>' + W.nacht + '<i>' + PFEIL + '</i></button></div>';
    if ((PLAN.spaet || []).length) R = '<h3>' + W.restFahrt + '</h3>' + PLAN.spaet.map(function (id) { return '<p>' + W.restFahrtT(esc(ZIEL[id].name)) + '</p>'; }).join('') +
      (PLAN.rest.length ? '' : '<div class="kn-reihe"><button class="kn kn--linie" type="button" data-pl-nacht>' + W.nacht + '<i>' + PFEIL + '</i></button></div>') + R;
    restBox.innerHTML = R; restBox.hidden = !R;
  }
  tageBox.addEventListener('change', function (e) {
    var s = e.target.closest('[data-pl-tag]'), h = e.target.closest('[data-pl-haus]');
    if (s && PLAN) {
      var id = s.getAttribute('data-pl-tag'), nach = PLAN.tage[+s.value], von = PLAN.tage.filter(function (t) { return t.posten.indexOf(id) >= 0; })[0];
      var alt = { fix: JSON.parse(JSON.stringify(S.fix)), zeit: JSON.parse(JSON.stringify(S.zeit)) }, dort = nach ? nach.posten.filter(function (x) { return x !== id; }) : [];
      var tausch = !!(von && nach && dort.length && dort.length >= nach.max);
      S.fix[id] = +s.value; delete S.zeit[id];
      if (tausch) dort.forEach(function (x) { S.fix[x] = von.i; delete S.zeit[x]; });
      probe({ ids: [id].concat(tausch ? dort : []), nein: W.passtNicht, zurueck: function () { S.fix = alt.fix; S.zeit = alt.zeit; },
                ja: tausch ? W.getauscht(ZIEL[id].name, dort.map(function (x) { return ZIEL[x].name; }).join(', ')) : '' });
      rechne();
    }
    if (h) { S.haus[h.getAttribute('data-pl-haus')] = h.checked ? 1 : 0; merke(); liste(); }
    var v = e.target.closest('[data-pl-vor]');
    if (v) { var vid = v.getAttribute('data-pl-vor'), altV = S.vor[vid], neuV = +v.value; if (neuV === ZIEL[vid].vor) delete S.vor[vid]; else S.vor[vid] = neuV;
      probe({ ids: [vid], nein: W.passtNicht, zurueck: function () { if (altV === undefined) delete S.vor[vid]; else S.vor[vid] = altV; } }); rechne(); }
    var u = e.target.closest('[data-pl-uhr]');
    if (u && /^\d{2}:\d{2}/.test(u.value)) { var uid = u.getAttribute('data-pl-uhr'), altU = S.zeit[uid];
      probe({ ids: [uid], nein: W.gehtNicht, zurueck: function () { if (altU === undefined) delete S.zeit[uid]; else S.zeit[uid] = altU; } });
      S.zeit[uid] = +u.value.slice(0, 2) * 60 + +u.value.slice(3, 5); rechne(); }
  });
  /* Abfahrt früher oder später: die nächste oder vorige Fahrt des Tages aus dem Fahrplan, danach rechnet der Plan neu */
  tageBox.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-pl-frueher],[data-pl-spaeter]'); if (!b || !PLAN) return;
    var sp = b.hasAttribute('data-pl-spaeter'), id = b.getAttribute(sp ? 'data-pl-spaeter' : 'data-pl-frueher'), t = null, e = null;
    PLAN.tage.forEach(function (x) { (x.zeilen || []).forEach(function (y) { if (y.id === id) { t = x; e = y; } }); });
    if (!t || !e || !e.hin) return;
    var jetzt = minuten(e.hin.ab), vl = D.orte[ZIEL[id].start].vorlauf, unten = (t.art === 'an' ? t.von : 420) + vl, setze = function (m) { var alt = S.zeit[id]; probe({ ids: [id], nein: W.gehtNicht, zurueck: function () { if (alt === undefined) delete S.zeit[id]; else S.zeit[id] = alt; } }); S.zeit[id] = m; rechne(); };
    b.disabled = true;
    if (sp) wege(id, t.d, hhmm(jetzt + 1), false, 2).then(function (a) { var f = a.fahrten.filter(function (x) { return gut(x, ZIEL[id], t.d); })[0]; if (!f || minuten(f.ab) <= jetzt) { b.disabled = false; return melde(W.keinSpaeter); } setze(minuten(f.ab)); });
    else if (jetzt <= unten) { b.disabled = false; melde(W.keinFrueher); }
    else {
      // die Fahrt direkt davor: erst die letzte gute Stunde ansehen (dichte Takte), sonst weiter zurück (Schiffe, kleine Bahnen)
      var davor = function (ab) { return wege(id, t.d, hhmm(Math.max(unten, ab)), false, 8).then(function (a) { var L = a.fahrten.filter(function (f) { return gut(f, ZIEL[id], t.d) && minuten(f.ab) < jetzt && minuten(f.ab) >= unten; }); return L.length ? minuten(L[L.length - 1].ab) : null; }); };
      davor(jetzt - 75).then(function (m) { return m !== null || jetzt - 75 <= unten ? m : davor(jetzt - 300); }).then(function (m) { if (m === null) { b.disabled = false; return melde(W.keinFrueher); } setze(m); });
    }
  });
  tageBox.addEventListener('click', function (e) { var b = e.target.closest('[data-pl-raus]'); if (!b) return; var id = b.getAttribute('data-pl-raus'), i = S.z.indexOf(id); if (i >= 0) S.z.splice(i, 1); delete S.fix[id]; delete S.zeit[id]; rechne(); });
  restBox.addEventListener('click', function (e) {
    if (e.target.closest('[data-pl-dichter]')) { S.t = S.t === 'ruhe' ? 'mitte' : 'alles'; fo.elements.tempo.value = S.t; fo.elements.tempo.dispatchEvent(new Event('change', { bubbles: true })); rechne(); }
    if (e.target.closest('[data-pl-nacht]')) { var dlg = $('dialog.buchen'), f = dlg && $('form', dlg), k = $('.nav__rechts [data-buchen]') || $('[data-buchen]'); if (f) { f.elements.an.value = S.an; f.elements.ab.min = plus(S.an, 1); f.elements.ab.value = plus(S.ab, 1); } if (k) k.click(); }
  });

  /* ---------- Kosten: einzeln, Jungfrau Travel Pass, Berner Oberland Pass (dieselben Daten wie der Pass-Berater) ---------- */
  function kosten() {
    var tagVon = {}; (PLAN ? PLAN.tage : []).forEach(function (t) { t.posten.forEach(function (id) { tagVon[id] = t.d; }); });
    var Zl = S.z.filter(function (id) { return tagVon[id] !== undefined; });   // was nicht in Ihre Tage passt, wird nicht gerechnet (sonst wäre die Ersparnis zu hoch)
    var preisVon = function (id) { return preisAm(ZIEL[id], tagVon[id] || S.an); };
    if (!Zl.length) { kostenBox.innerHTML = '<p class="pb__leer" style="grid-column:1/-1">' + W.keinK + '</p>'; EMPF = ''; if (empfBox) empfBox.hidden = true; return; }
    var h = S.halb === '1', nr = 0, pass = D.pass;
    var spalte = function (name, preis, unter, zeilen, fuss, best) {
      nr++;
      return '<article class="pb-s' + (best ? ' pb-s--best' : '') + '">' + (best ? '<span class="pb-s__stempel">' + W.best + '</span>' : '') +
        '<div class="pb-s__haupt"><p class="pb-s__kopf"><span>Nº 0' + nr + '</span><span>' + esc(pass.kopf) + '</span></p><h3 class="pb-s__name">' + esc(name) + '</h3>' +
        '<p class="pb-s__preis">' + preis + '</p><p class="pb-s__unter">' + unter + '</p></div><div class="pb-s__abriss"><ul class="pb-s__liste">' + zeilen + '</ul><p class="pb-s__fuss">' + fuss + '</p></div></article>';
    };
    // Einzeln: Festpreise und «ab»-Preise der Anbieter; was nur einen Tagespreis hat, zählt nicht in die Summe
    var e = 0, offen = 0, ez = Zl.map(function (id) {
      var z = ZIEL[id], gk = (z.gk ? '<small>' + esc(z.gk) + ' ' + W.gk + '</small>' : '') + (z.dazu ? '<small>' + esc(z.dazu) + '</small>' : ''), p = preisVon(id);
      if (!p) { offen++; return '<li><span>' + esc(z.name) + gk + '</span><i>' + W.preisOffen + '</i></li>'; }
      if (h && !p.h) { offen++; return '<li><span>' + esc(z.name) + '</span><i>' + W.halbOffen + '</i></li>'; }
      var v = h ? p.h : p.v; e += v; return '<li><span>' + esc(z.name) + (h ? (z.dazu ? '<small>' + esc(z.dazu) + '</small>' : '') : gk) + '</span><b>CHF ' + chf(v) + '</b></li>';
    }).join('');
    var ePreis = e ? '<small>' + (offen ? W.mind + ' ' : '') + 'CHF</small>' + chf(e) : '<em>' + W.anbieter + '</em>';
    // Tage mit Pass: vom ersten bis zum letzten Ausflugstag
    var tg = (PLAN ? PLAN.tage : []).filter(function (t) { return t.posten.length; }), spanne = tg.length ? tg[tg.length - 1].i - tg[0].i + 1 : 1;
    var passPreis = function (p) { var ks = Object.keys(p.tage).map(Number).sort(function (a, b) { return a - b; }), d = ks.filter(function (k) { return k >= spanne; })[0] || ks[ks.length - 1]; return { tage: d, chf: p.tage[d][h ? 1 : 0] }; };
    // Was nicht im Pass ist, kostet dazu (Robert 14.10.2026 «wenn nicht im Pass dann + CHF?»): belegter Einzelpreis des Tages als Zuschlag, halber Preis beim Berner Oberland Pass
    // gerechnet. Beim Sonderpreis (25 % ab Wengen oder Grindelwald) zählt nur die belegte Untergrenze aus funktionen.PASS bop.sonder_ab, der Betrag heisst «mindestens».
    // Steht ein Preis nicht fest, heisst der Pass-Betrag «mindestens» und bekommt keinen Stempel.
    var pid = function (id) { return ZIEL[id].pass_id; }, einzelV = function (id) { var p = preisVon(id); if (!p) return null; if (h && !p.h) return null; return h ? p.h : p.v; };
    var zeileZu = function (n, v, klein) { return v === null ? '<li><span>' + n + (klein ? '<small>' + klein + '</small>' : '') + '</span><i>' + W.preisOffen + '</i></li>' : '<li class="halb"><span>' + n + (klein ? '<small>' + klein + '</small>' : '') + '</span><b>+ CHF ' + chf(v) + '</b></li>'; };
    var j = pass.jtp, jp = passPreis(j), jPass = jp.chf, jExtra = 0, jOffen = 0, jochTag = (tg.filter(function (t) { return t.posten.indexOf('joch') >= 0; })[0] || {}).d || S.an;
    var jz = Zl.map(function (id) {
      var p = pid(id), n = esc(ZIEL[id].name);
      if (p === 'joch') { var s = jochTag >= j.joch.von && jochTag <= j.joch.bis ? j.joch.sommer : j.joch.winter; jPass += s; return '<li class="halb"><span>' + n + '<small>' + esc(W.zuschlag) + '</small></span><b>+ CHF ' + chf(s) + '</b></li>'; }
      if (j.frei.indexOf(p) >= 0) return '<li class="frei"><span>' + n + '</span><b>' + W.drin + '</b></li>';
      var v = einzelV(id); if (v === null) jOffen++; else jExtra += v; return zeileZu(n, v, W.nichtdrin);
    }).join('');
    var b = pass.bop, bp = passPreis(b), bExtra = 0, bOffen = 0, bz = Zl.map(function (id) {
      var p = pid(id), n = esc(ZIEL[id].name), v;
      if (b.frei.indexOf(p) >= 0) return '<li class="frei"><span>' + n + '</span><b>' + W.drin + '</b></li>';
      if (b.halb.indexOf(p) >= 0) { v = einzelV(id); if (v === null) bOffen++; else bExtra += v / 2; return zeileZu(n, v === null ? null : v / 2, W.halb); }
      if ((b.sonder || []).indexOf(p) >= 0) { bOffen++; bExtra += ((b.sonder_ab || {})[p] || [0, 0])[h ? 1 : 0]; return '<li class="halb"><span>' + n + '<small>' + esc(W.sonderAb) + '</small></span><b>' + W.sonder + '</b></li>'; }
      v = einzelV(id); if (v === null) bOffen++; else bExtra += v; return zeileZu(n, v, W.nichtdrin);
    }).join('');
    var jTotal = jPass + jExtra, bTotal = bp.chf + bExtra, jGenau = !jOffen, bGenau = !bOffen;
    // Stempel nur, wenn ein Weg sicher der günstigste ist: sein Betrag steht fest und liegt nicht über der Untergrenze der anderen
    var wege3 = [{ k: 'einzel', v: e, genau: !offen && e > 0 }, { k: 'jtp', v: jTotal, genau: jGenau }, { k: 'bop', v: bTotal, genau: bGenau }], best = '';
    wege3.forEach(function (o) { if (!best && o.genau && wege3.every(function (x) { return x === o || x.v >= o.v; })) best = o.k; });
    // Die Antwort in einem Satz (Robert 14.10.2026: der Planer rechnet am Ende selbst und empfiehlt; der Pass-Berater der Regionsseite ist nur noch der Einstieg hierher)
    var passe = [{ n: j.name, v: jTotal, g: jGenau, t: jp.tage }, { n: b.name, v: bTotal, g: bGenau, t: bp.tage }].sort(function (x, y) { return x.v - y.v; })[0];
    var bv = best === 'jtp' ? jTotal : bTotal, bn = best === 'jtp' ? j.name : b.name, bt = best === 'jtp' ? jp.tage : bp.tage;
    if (best === 'jtp' || best === 'bop') EMPF = W.empfPass(bn, bt, chf(bv)) + (!offen && e > bv ? ' ' + W.empfSpar(chf(e), chf(e - bv)) : '');
    else if (best === 'einzel') EMPF = W.empfEinzel(chf(e), passe.n, (passe.g ? '' : W.mind + ' ') + 'CHF ' + chf(passe.v));
    else EMPF = W.empfOffen;
    if (empfBox) {   // Gestalt (Robert 14.10.2026 «edler»): Name in Glanzgold, Betrag gross, darunter zwei Posten: einzeln und Ersparnis
      var posten = function (k, v, ist) { return '<span' + (ist ? ' class="ist"' : '') + '><small>' + esc(k) + '</small><b>' + v + '</b></span>'; };
      var html = '<b>' + esc(W.empfK) + '</b><i class="pl-emp__linie"></i>';
      if (best === 'jtp' || best === 'bop') html += '<strong>' + esc(bn) + '</strong><span class="pl-emp__preis"><small>' + bt + ' ' + esc(W.tage) + ' · CHF</small>' + chf(bv) + '</span>' + (!offen && e > bv ? '<p class="pl-emp__vgl">' + posten(W.einzel, 'CHF ' + chf(e)) + posten(W.sparen, 'CHF ' + chf(e - bv), true) + '</p>' : '');
      else if (best === 'einzel') html += '<strong>' + esc(W.einzel) + '</strong><span class="pl-emp__preis"><small>CHF</small>' + chf(e) + '</span><p class="pl-emp__vgl">' + posten(passe.n, (passe.g ? '' : esc(W.mind) + ' ') + 'CHF ' + chf(passe.v)) + '</p>';
      else html += '<p class="pl-emp__satz">' + esc(EMPF) + '</p>';
      empfBox.innerHTML = html; empfBox.classList.toggle('pl-emp--offen', !best); empfBox.hidden = false; }
    var unterJ = W.passFuer + ' ' + jp.tage + ' ' + W.tage + ' · CHF ' + chf(jp.chf) + (jPass !== jp.chf ? ' + ' + W.zuschlag : '') + (jExtra || jOffen ? ' + ' + W.einzelfahrt : '') + ' · ' + W.kind;
    var unterB = W.passFuer + ' ' + bp.tage + ' ' + W.tage + ' · CHF ' + chf(bp.chf) + (bExtra || bOffen ? ' + ' + W.einzelfahrt : '') + ' · ' + W.kind;
    kostenBox.innerHTML = spalte(W.einzel, ePreis, offen ? W.hinweisE : W.summe, ez, esc(D.lesetag), best === 'einzel') +
      spalte(j.name, '<small>' + (jGenau ? '' : W.mind + ' ') + 'CHF</small>' + chf(jTotal), unterJ, jz, esc(j.quelle) + ' · ' + esc(pass.stand), best === 'jtp') +
      spalte(b.name, '<small>' + (bGenau ? '' : W.mind + ' ') + 'CHF</small>' + chf(bTotal), unterB, bz, esc(b.quelle) + ' · ' + esc(D.lesetag), best === 'bop');
    kostenBox.classList.add('da', 'ruhig');
  }

  /* ---------- Ihre Liste, Termine in Ihren Tagen und der Text an den Concierge ---------- */
  function liste() {
    var L = []; (PLAN ? PLAN.tage : []).forEach(function (t) { t.posten.forEach(function (id) { var e = (t.zeilen || []).filter(function (x) { return x.id === id; })[0] || {}; L.push({ t: t, id: id, e: e }); }); });
    anzahl.textContent = L.length; listeLeer.hidden = L.length > 0;
    listeBox.innerHTML = L.map(function (x) {
      var z = ZIEL[x.id];
      return '<li><figure class="ve-wl__b"><img src="' + esc(z.bild) + '" alt="" loading="lazy" decoding="async"></figure><div><span class="pl-li__tag">' + esc(tag(x.t.d).toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long' })) + '</span><b>' + esc(z.name) + '</b><span>' + (x.e.hin ? x.e.hin.ab.slice(11, 16) + (x.e.heim ? ' – ' + hhmm(x.e.heim) : '') : W.rund + ' ' + dauer(bedarf(z))) + '</span></div>' +
        '<p class="ve-wl__opt"><label><input type="checkbox" data-pl-haus="' + x.id + '"' + (S.haus[x.id] ? ' checked' : '') + '>' + W.lHaus + '</label></p></li>';
    }).join('');
    // Was das Haus dazulegt, steht mit dem Foto seiner Kachel in der Liste
    [['lunch', W.wLunch], ['shuttle', W.wShuttle], ['tisch', W.wTisch]].forEach(function (w) {
      if (!S.w[w[0]]) return; var k = $('[data-wunsch="' + w[0] + '"]', P), src = k ? k.getAttribute('data-wunsch-bild') || '' : '';   // fester Pfad statt currentSrc: die Kachel trägt bis zum Laden einen Platzhalter
      listeBox.insertAdjacentHTML('beforeend', '<li>' + (src ? '<figure class="ve-wl__b"><img src="' + esc(src) + '" alt="" loading="lazy" decoding="async"></figure>' : '') + '<div style="align-self:center;grid-row:1/3"><span class="pl-li__tag">' + esc(W.mailW) + '</span><b>' + esc(w[1]) + '</b></div></li>');
    });
    var T = D.termine.filter(function (t) { return t.bis >= S.an && t.von <= S.ab; });
    termBox.hidden = !T.length;
    termListe.innerHTML = T.map(function (t) {
      return '<li>' + (t.bild ? '<figure class="ve-wl__b"><img src="' + esc(t.bild) + '" alt="" loading="lazy" decoding="async"></figure>' : '') + '<div><b>' + esc(t.name) + '</b><span>' + esc(t.wann) + ' · ' + esc(t.ort) + '</span></div><button type="button" data-pl-merk="' + t.id + '" aria-pressed="' + String(!!S.ev[t.id]) + '">' + (S.ev[t.id] ? W.gemerkt : W.merk) + '</button></li>';
    }).join('');
    var Z = [W.mailPlan + ' ' + kurz(S.an) + ' – ' + lang(S.ab, true).replace(/^[^,\s]+,?\s/, '') + ':', ''];
    L.forEach(function (x) { var z = ZIEL[x.id]; Z.push('– ' + tag(x.t.d).toLocaleDateString(ORT, { weekday: 'short', day: 'numeric', month: 'long' }) + ': ' + z.name + (x.e.hin ? ' (' + x.e.hin.ab.slice(11, 16) + (x.e.heim ? '–' + hhmm(x.e.heim) : '') + ')' : '') + ', ' + (S.haus[x.id] ? W.mailHaus : W.mailSelbst)); });
    if (L.length && EMPF) Z.push('', W.empfK + ': ' + EMPF);
    var ws = []; if (S.w.lunch) ws.push(W.wLunch); if (S.w.shuttle) ws.push(W.wShuttle); if (S.w.tisch) ws.push(W.wTisch);
    if (ws.length) { Z.push('', W.mailW + ':'); ws.forEach(function (x) { Z.push('– ' + x); }); }
    var ev = T.filter(function (t) { return S.ev[t.id]; }); if (ev.length) { Z.push('', W.mailT + ':'); ev.forEach(function (t) { Z.push('– ' + t.name + ' (' + t.wann + ')'); }); }
    if (text) { text.value = L.length || ws.length || ev.length ? Z.join('\n') : ''; text.rows = Math.max(5, Math.min(14, text.value.split('\n').length + 1)); }
    var von = $('[data-pl-von]', P), bis = $('[data-pl-bis]', P);
    [[von, S.an], [bis, S.ab]].forEach(function (p) { if (p[0] && p[0].value !== p[1]) { p[0].value = p[1]; p[0].dispatchEvent(new Event('change', { bubbles: true })); } });
  }
  listeBox.addEventListener('change', function (e) { var h = e.target.closest('[data-pl-haus]'); if (!h) return; S.haus[h.getAttribute('data-pl-haus')] = h.checked ? 1 : 0; merke(); zeichne(); liste(); });
  termListe.addEventListener('click', function (e) { var b = e.target.closest('[data-pl-merk]'); if (!b) return; var id = b.getAttribute('data-pl-merk'); S.ev[id] = S.ev[id] ? 0 : 1; merke(); liste(); });

  /* ---------- Mitnehmen: Blatt, Link, Kalender ---------- */
  var meld = null;
  function melde(t) { if (!meld) { meld = document.createElement('p'); meld.className = 'pl-kopiert'; meld.setAttribute('role', 'status'); document.body.appendChild(meld); } meld.textContent = t; meld.classList.add('an'); clearTimeout(melde.u); melde.u = setTimeout(function () { meld.classList.remove('an'); }, Math.max(2200, t.length * 55)); }   // lange Sätze bleiben länger stehen
  var kPdf = $('[data-pl-pdf]', P), kLink = $('[data-pl-link]', P), kKal = $('[data-pl-kalender]', P);
  if (kPdf) kPdf.addEventListener('click', function () { window.print(); });
  if (kLink) kLink.addEventListener('click', function () {
    var adr = location.origin + location.pathname + '?' + adresse() + '#plan';
    var fertig = function () { melde(W.kopiert); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(adr).then(fertig, function () { prompt('', adr); }); else prompt('', adr);
  });
  if (kKal) kKal.addEventListener('click', function () {
    if (!PLAN) return;
    var z2 = function (n) { return ('0' + n).slice(-2); }, ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grand Beau-Rivage Interlaken//Ihre Tage//DE', 'CALSCALE:GREGORIAN'];
    var st = function (d, m) { return d.replace(/-/g, '') + 'T' + z2(Math.floor(m / 60)) + z2(m % 60) + '00'; };
    PLAN.tage.forEach(function (t) { (t.zeilen || []).forEach(function (e) {
      var z = ZIEL[e.id]; ics.push('BEGIN:VEVENT', 'UID:' + e.id + '-' + t.d + '@grandbeaurivage.ch', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z');
      if (e.hin) ics.push('DTSTART;TZID=Europe/Zurich:' + st(t.d, e.raus), 'DTEND;TZID=Europe/Zurich:' + st(t.d, e.heim || e.an + vorVon(z)));
      else ics.push('DTSTART;VALUE=DATE:' + t.d.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + plus(t.d, 1).replace(/-/g, ''));
      ics.push('SUMMARY:' + z.name, 'LOCATION:' + z.name, 'DESCRIPTION:' + (e.hin ? W.abf + ' ' + D.orte[z.start].name + ' ' + e.hin.ab.slice(11, 16) + (e.zur ? '\\n' + W.rueck + ' ' + e.zur.von + ' ' + e.zur.ab.slice(11, 16) : '') : '') + '\\nGrand Beau-Rivage Interlaken · +41 33 826 70 07', 'END:VEVENT');
    }); });
    ics.push('END:VCALENDAR');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' })); a.download = 'grand-beau-rivage-' + S.an + '.ics';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  });

  rechne();
})();
