/* Le Livre · Grand Beau-Rivage. Die Marke des Hauses zum Arbeiten (Robert 12.10.2026): Bildarchiv mit fertigen Grössen, Dateien (Zeichen, Logo,
   Wortmarke, Tapete, Farben), Markenprüfung für Entwürfe, das Markenbuch als Kapitel (buch/). Daten: livre.json (gebaut von _werkbank/livre_bau.py),
   Downloads und Prüfung über den Server-Teil livre.py (serve.py, /marke/api/…). Oberfläche in sechs Sprachen. Gespeichert wird nichts, ausser
   «Ergebnis sichern» legt auf Wunsch eine Datei auf diesem Rechner ab. Stil und Bausteine aus Le Bureau (studio.css). */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
/* L’Imprimerie: lokal neben Le Livre auf :8963, online unter eigener Adresse (UEBERGABE.md der Imprimerie, «Online-Weg») */
const IMPRIMERIE = '../imprimerie/';   // immer relativ, nie nach Port (F18, 16.10.2026); lokal führt imprimerie/index.html weiter, online liegt sie unter derselben Adresse
const PU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/></svg>';
const PO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12V3M3.8 7 8 2.8 12.2 7M3 14h10"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const KOPIE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.6"/><path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5H10.5"/></svg>';
const BUCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>';
const HAUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.2 8 2.8l5.5 4.4V13.5h-11z"/><path d="M6.4 13.5V9.6h3.2v3.9"/></svg>';
const WELT = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/></svg>';
const PFEIL = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg>';
const ZEICHEN = '<svg viewBox="0 0 1464 1452" aria-hidden="true"><use href="#br"/></svg>';

/* ---------------------------------------------------------------- Sprachen der Oberfläche */
const SPRACHEN = [['de', 'DE', 'Deutsch'], ['en', 'EN', 'English'], ['fr', 'FR', 'Français'], ['zh', '中文', '中文'], ['ko', '한국어', '한국어'], ['ar', 'عربي', 'العربية']];
const T = {
de: {
  unter: 'Marke · Grand Beau-Rivage', start: 'Übersicht', arbeiten: 'Arbeiten', nachschlagen: 'Nachschlagen', bilder: 'Bildarchiv', dateien: 'Logo & Dateien', pruefung: 'Markenprüfung', buch: 'Markenbuch',
  anleitung: 'Anleitung', maison: 'La Maison', website: 'Website ansehen', sprache: 'Sprache',
  morgen: 'Guten Morgen.', tag: 'Guten Tag.', abend: 'Guten Abend.', frage: 'Was brauchen Sie heute?',
  start_satz: 'Le Livre ist die Marke des Hauses zum Arbeiten: alle Fotos in fertigen Grössen für Instagram, Website und Druck, Zeichen, Logo, Tapete und Farben als Dateien, und eine Prüfung für Entwürfe von Agenturen und aus dem Haus.',
  k_bilder: 'Alle Fotos des Hauses, nach Bereich, Saison und Format. Jedes Foto als Beitrag, Story, für die Website oder den Druck.',
  k_dateien: 'Zeichen, Logo und Wortmarke für helle und dunkle Flächen, die Tapete und die Farbwerte zum Kopieren.',
  k_pruefung: 'Ein Entwurf als Bild oder PDF. Le Livre sagt, was zum Haus passt und was nicht, Punkt für Punkt.',
  k_buch: 'Zeichen, Farben und ihre Herkunft, Schriften, Tapete und die Regeln, nach denen alles gestaltet ist.',
  oeffnen: 'Öffnen', lesen: 'Lesen',
  z_haus: 'Fotos des Hauses', z_frei: 'frei lizenziert', z_ki: 'mit KI erzeugt', z_dateien: 'Dateien',
  stand: '{0} Fotos · {1} Dateien',
  recht_t: 'Bildrechte', recht: 'Die Fotos gehören dem Grand Beau-Rivage Interlaken und seinen Fotografen. Frei lizenzierte Fotos nur mit dem genannten Namen und der Lizenz. Mit KI erzeugte Bilder sind gekennzeichnet und zeigen keine echten Gerichte des Hauses.',
  alles_zip: 'Alle Dateien (ZIP)',
  b_titel: 'Bildarchiv', b_satz: 'Ein Klick auf ein Foto öffnet es. Dort laden Sie es in der Grösse, die Sie brauchen, und wählen bei Beitrag und Story den Ausschnitt.',
  suchen: 'Suchen, zum Beispiel «Terrasse» oder «Suite»', bereich: 'Bereich', saison: 'Saison', format: 'Format', herkunft: 'Herkunft', alle: 'Alle',
  b_zimmer: 'Zimmer', b_restaurants: 'Restaurants', b_bar: 'Bar', b_spa: 'Spa', b_saal: 'Saal', b_haus: 'Haus', b_region: 'Region',
  s_sommer: 'Sommer', s_winter: 'Winter', s_jahr: 'Ganzjährig', f_hoch: 'Hochformat', f_quer: 'Querformat', f_quadrat: 'Quadrat',
  h_haus: 'Fotos des Hauses', h_frei: 'Frei lizenziert', h_ki: 'Mit KI erzeugt',
  im_titel: 'In L’Imprimerie gestalten', im_beitrag: 'Als Instagram-Beitrag', im_story: 'Als Story', im_satz: 'Öffnet L’Imprimerie mit diesem Foto und Ihrem Ausschnitt, fünf Entwürfe zur Wahl.',
  treffer: '{0} von {1} Fotos', keine: 'Kein Foto passt. Ein Filter weniger hilft.', mehr: 'Mehr zeigen', zuruecksetzen: 'Filter zurücksetzen',
  ki: 'KI', ki_lang: 'Mit KI erzeugt', ki_satz: 'Dieses Bild ist mit KI erzeugt und zeigt kein echtes Gericht oder Getränk des Hauses. Für Werbung nur mit diesem Hinweis oder nach einem echten Foto.',
  ue_satz: 'Licht und Schärfe sind mit KI überarbeitet, der Inhalt ist das echte Foto.', archiv: 'Aus dem Archiv. Nicht einfärben, nicht überarbeiten.',
  quelle: 'Quelle', original: 'Original', laden: 'Laden', grossen: 'Grössen', ausschnitt: 'Ausschnitt: das Feld im Bild ziehen.',
  g_instagram: 'Instagram-Beitrag', g_story: 'Story', g_web: 'Website', g_druck: 'Druck',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'längste Seite 2000 px, JPG', i_druck: 'volle Auflösung, {0} × {1}, JPG',
  ohne_server: 'Fertige Grössen brauchen den Server-Teil von Le Livre (serve.py). Ohne ihn lädt der Knopf das Foto in Website-Grösse.',
  d_titel: 'Logo & Dateien', d_satz: 'Alles, was eine Agentur oder eine Druckerei braucht. SVG bleibt in jeder Grösse scharf, PNG hat einen durchsichtigen Grund.',
  d_logo: 'Logo', d_logo_s: 'Das Zeichen über dem Namen. Die Hauptform, mit Schutzraum rundum.', d_quer: 'Querform', d_quer_s: 'Für Leisten, Briefköpfe und Fusszeilen.',
  d_zeichen: 'Zeichen', d_zeichen_s: 'Das Medaillon allein: Siegel, Stempel, Profilbild. In Gold, Taupe, Tinte oder Weiss.',
  d_wort: 'Wortmarke', d_wort_s: 'Der Name in Cinzel, ohne Zeichen.', d_tapete: 'Tapete', d_tapete_s: 'Der Rapport als Kachel. Am Bildschirm 340 px, im Druck 36 mm.',
  d_farben: 'Farben', d_farben_s: 'Ein Klick kopiert den Wert. Gold zeichnet und schreibt nie den Lesetext, das Rot gehört der Bar. Im Kopf der Startseite und in den Goldbändern glänzt das Gold als Verlauf, wie im Logo.', verlauf: 'Verlauf, wie im Logo', d_schriften: 'Schriften',
  d_schriften_s: 'Vier Schriften, frei lizenziert. Für die Website als WOFF2.',
  hell: 'für helle Flächen', dunkel: 'für dunkle Flächen', kopiert: 'Kopiert', regeln: 'Regeln im Markenbuch',
  r_schrift: { a: 'Grosse Zeilen, Titel', c: 'Kapitelzeilen, Versalien', s: 'Lesetext', m: 'Zeiten, Preise, Knöpfe' },
  p_titel: 'Markenprüfung', p_satz: 'Laden Sie einen Entwurf hoch, etwa ein Plakat, einen Beitrag oder den Flyer einer Agentur. Die Farben werden gemessen, Bild, Schrift, Zeichen und Ton beurteilt Claude.',
  p_feld: 'Entwurf hierher ziehen', p_feld2: 'oder wählen · Bild oder PDF, bis 30 MB', p_waehlen: 'Datei wählen', p_pruefen: 'Prüfen', p_beispiel: 'Beispiel ansehen', p_beispiel_h: 'Beispiel: Dieser Entwurf ist eigens gebaut, so wie ihn eine Agentur schicken könnte. Die Rückmeldung stammt unverändert von der Prüfung.',
  p_privat: 'Nichts wird gespeichert. Der Entwurf geht nur für die Prüfung an den Server und an Claude und ist danach weg.',
  p_schritt1: 'Farben messen', p_schritt2: 'Entwurf ansehen', p_schritt3: 'Rückmeldung schreiben', p_dauer: 'Das dauert meist eine halbe Minute.',
  p_gesamt: 'Insgesamt', p_punkte: 'Punkt für Punkt', p_farben: 'Gemessene Farben', p_farben_s: 'Ohne KI gemessen, gegen die Palette des Hauses. Fotos im Entwurf zählen mit.',
  p_rahmen: '{0} % der Fläche in den Farben des Hauses', p_ton: 'Im Ton des Hauses', p_neu: 'Neuen Entwurf prüfen', p_sichern: 'Ergebnis sichern', p_kopie: 'Als Text kopieren',
  p_gleich: 'gleich', p_nah: 'nah', p_fremd: 'fremd', p_naechste: 'nächste Hausfarbe', p_schwarz: 'Reines Schwarz auf {0} % der Fläche. Geschrieben wird in Tinte #1A1D28.',
  p_tuerkis: 'Türkis auf {0} % der Fläche. Das Türkis der Aare bleibt im Foto und ist keine Farbe der Marke.', p_rot: 'Bar-Rot auf {0} % der Fläche. Es gehört allein der Bar «Le Vieux Rivage».',
  u_passt: 'passt', u_achten: 'achten', u_passt_nicht: 'passt nicht',
  ber: { farben: 'Farben', schrift: 'Schrift', zeichen: 'Zeichen', abstand: 'Abstand', bild: 'Bild', ton: 'Ton' },
  p_ki_fehler: 'Die Beurteilung durch Claude war gerade nicht möglich ({0}). Die Messung der Farben steht unten.', p_fehler: 'Die Prüfung ging nicht durch',
  p_seiten: '{0} Seiten, geprüft die ersten {1}', p_text: 'Gelesener Text', fehler_verb: 'Der Server-Teil von Le Livre antwortet nicht. Läuft serve.py?',
  schliessen: 'Schliessen'
},
en: {
  unter: 'Brand · Grand Beau-Rivage', start: 'Overview', arbeiten: 'Work', nachschlagen: 'Reference', bilder: 'Photo archive', dateien: 'Logo & files', pruefung: 'Brand check', buch: 'Brand book',
  anleitung: 'Guide', maison: 'La Maison', website: 'View website', sprache: 'Language',
  morgen: 'Good morning.', tag: 'Good afternoon.', abend: 'Good evening.', frage: 'What do you need today?',
  start_satz: 'Le Livre is the hotel’s brand to work with: every photo in ready-made sizes for Instagram, the website and print, emblem, logo, wallpaper and colours as files, and a check for drafts from agencies and from within the hotel.',
  k_bilder: 'All photos of the hotel, by area, season and format. Every photo as a post, a story, for the website or for print.',
  k_dateien: 'Emblem, logo and wordmark for light and dark surfaces, the wallpaper and the colour values to copy.',
  k_pruefung: 'A draft as an image or PDF. Le Livre says what suits the hotel and what does not, point by point.',
  k_buch: 'Emblem, colours and where they come from, typefaces, wallpaper and the rules behind every design.',
  oeffnen: 'Open', lesen: 'Read',
  z_haus: 'photos of the hotel', z_frei: 'freely licensed', z_ki: 'created with AI', z_dateien: 'files',
  stand: '{0} photos · {1} files',
  recht_t: 'Image rights', recht: 'The photos belong to the Grand Beau-Rivage Interlaken and its photographers. Freely licensed photos only with the stated name and licence. Images created with AI are marked and do not show real dishes of the hotel.',
  alles_zip: 'All files (ZIP)',
  b_titel: 'Photo archive', b_satz: 'Click a photo to open it. There you download it in the size you need and, for posts and stories, choose the crop.',
  suchen: 'Search, for example «terrace» or «suite»', bereich: 'Area', saison: 'Season', format: 'Format', herkunft: 'Source', alle: 'All',
  b_zimmer: 'Rooms', b_restaurants: 'Restaurants', b_bar: 'Bar', b_spa: 'Spa', b_saal: 'Ballroom', b_haus: 'Hotel', b_region: 'Region',
  s_sommer: 'Summer', s_winter: 'Winter', s_jahr: 'All year', f_hoch: 'Portrait', f_quer: 'Landscape', f_quadrat: 'Square',
  h_haus: 'Photos of the hotel', h_frei: 'Freely licensed', h_ki: 'Created with AI',
  im_titel: 'Design in L’Imprimerie', im_beitrag: 'As Instagram post', im_story: 'As story', im_satz: 'Opens L’Imprimerie with this photo and your crop, five drafts to choose from.',
  treffer: '{0} of {1} photos', keine: 'No photo matches. Try one filter less.', mehr: 'Show more', zuruecksetzen: 'Reset filters',
  ki: 'AI', ki_lang: 'Created with AI', ki_satz: 'This image was created with AI and does not show a real dish or drink of the hotel. Use it in advertising only with this note, or replace it with a real photo.',
  ue_satz: 'Light and sharpness were retouched with AI; the content is the real photo.', archiv: 'From the archive. Do not colour or retouch.',
  quelle: 'Source', original: 'Original', laden: 'Download', grossen: 'Sizes', ausschnitt: 'Crop: drag the frame in the picture.',
  g_instagram: 'Instagram post', g_story: 'Story', g_web: 'Website', g_druck: 'Print',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'longest side 2000 px, JPG', i_druck: 'full resolution, {0} × {1}, JPG',
  ohne_server: 'Ready-made sizes need the server part of Le Livre (serve.py). Without it the button downloads the photo in website size.',
  d_titel: 'Logo & files', d_satz: 'Everything an agency or a printer needs. SVG stays sharp at any size, PNG has a transparent background.',
  d_logo: 'Logo', d_logo_s: 'The emblem above the name. The main form, with clear space all round.', d_quer: 'Horizontal form', d_quer_s: 'For bars, letterheads and footers.',
  d_zeichen: 'Emblem', d_zeichen_s: 'The medallion on its own: seal, stamp, profile picture. In gold, taupe, ink or white.',
  d_wort: 'Wordmark', d_wort_s: 'The name in Cinzel, without the emblem.', d_tapete: 'Wallpaper', d_tapete_s: 'The repeat as a tile. On screen 340 px, in print 36 mm.',
  d_farben: 'Colours', d_farben_s: 'Click to copy the value. Gold draws and never writes body text; the red belongs to the bar. At the top of the home page and in the gold bands, the gold shines as a gradient, as in the logo.', verlauf: 'Gradient, as in the logo', d_schriften: 'Typefaces',
  d_schriften_s: 'Four typefaces, freely licensed. For the website as WOFF2.',
  hell: 'for light surfaces', dunkel: 'for dark surfaces', kopiert: 'Copied', regeln: 'Rules in the brand book',
  r_schrift: { a: 'Large lines, titles', c: 'Chapter lines, capitals', s: 'Body text', m: 'Times, prices, buttons' },
  p_titel: 'Brand check', p_satz: 'Upload a draft, such as a poster, a post or an agency flyer. The colours are measured; Claude assesses image, type, emblem and tone.',
  p_feld: 'Drag a draft here', p_feld2: 'or choose · image or PDF, up to 30 MB', p_waehlen: 'Choose file', p_pruefen: 'Check', p_beispiel: 'See an example', p_beispiel_h: 'Example: this draft was made on purpose, the way an agency might send it. The feedback is the unchanged result of the check, in German.',
  p_privat: 'Nothing is stored. The draft goes to the server and to Claude only for the check and is gone afterwards.',
  p_schritt1: 'Measuring colours', p_schritt2: 'Looking at the draft', p_schritt3: 'Writing feedback', p_dauer: 'This usually takes about half a minute.',
  p_gesamt: 'Overall', p_punkte: 'Point by point', p_farben: 'Measured colours', p_farben_s: 'Measured without AI, against the hotel’s palette. Photos in the draft count too.',
  p_rahmen: '{0} % of the surface in the hotel’s colours', p_ton: 'In the hotel’s tone', p_neu: 'Check a new draft', p_sichern: 'Save result', p_kopie: 'Copy as text',
  p_gleich: 'same', p_nah: 'close', p_fremd: 'foreign', p_naechste: 'nearest house colour', p_schwarz: 'Pure black on {0} % of the surface. Text is set in ink #1A1D28.',
  p_tuerkis: 'Turquoise on {0} % of the surface. The turquoise of the Aare stays in the photo and is not a brand colour.', p_rot: 'Bar red on {0} % of the surface. It belongs to the bar «Le Vieux Rivage» alone.',
  u_passt: 'fits', u_achten: 'check', u_passt_nicht: 'does not fit',
  ber: { farben: 'Colours', schrift: 'Type', zeichen: 'Emblem', abstand: 'Spacing', bild: 'Image', ton: 'Tone' },
  p_ki_fehler: 'Claude’s assessment was not possible just now ({0}). The colour measurement is below.', p_fehler: 'The check did not go through',
  p_seiten: '{0} pages, the first {1} checked', p_text: 'Text read', fehler_verb: 'The server part of Le Livre is not answering. Is serve.py running?',
  schliessen: 'Close'
},
fr: {
  unter: 'Marque · Grand Beau-Rivage', start: 'Aperçu', arbeiten: 'Travailler', nachschlagen: 'Consulter', bilder: 'Photothèque', dateien: 'Logo & fichiers', pruefung: 'Contrôle de marque', buch: 'Charte',
  anleitung: 'Guide', maison: 'La Maison', website: 'Voir le site', sprache: 'Langue',
  morgen: 'Bonjour.', tag: 'Bonjour.', abend: 'Bonsoir.', frage: 'De quoi avez-vous besoin aujourd’hui ?',
  start_satz: 'Le Livre est la marque de l’hôtel pour travailler : toutes les photos en formats prêts pour Instagram, le site et l’impression, l’emblème, le logo, la tapisserie et les couleurs en fichiers, et un contrôle des projets d’agences et de l’hôtel.',
  k_bilder: 'Toutes les photos de l’hôtel, par espace, saison et format. Chaque photo en publication, en story, pour le site ou l’impression.',
  k_dateien: 'Emblème, logo et logotype pour fonds clairs et foncés, la tapisserie et les valeurs de couleur à copier.',
  k_pruefung: 'Un projet en image ou en PDF. Le Livre indique ce qui convient à l’hôtel et ce qui ne convient pas, point par point.',
  k_buch: 'Emblème, couleurs et leur origine, typographies, tapisserie et les règles de toute création.',
  oeffnen: 'Ouvrir', lesen: 'Lire',
  z_haus: 'photos de l’hôtel', z_frei: 'sous licence libre', z_ki: 'créées par IA', z_dateien: 'fichiers',
  stand: '{0} photos · {1} fichiers',
  recht_t: 'Droits des images', recht: 'Les photos appartiennent au Grand Beau-Rivage Interlaken et à ses photographes. Photos sous licence libre uniquement avec le nom et la licence indiqués. Les images créées par IA sont signalées et ne montrent pas de vrais plats de l’hôtel.',
  alles_zip: 'Tous les fichiers (ZIP)',
  b_titel: 'Photothèque', b_satz: 'Un clic sur une photo l’ouvre. Vous la téléchargez dans le format voulu et choisissez le cadrage pour les publications et les stories.',
  suchen: 'Rechercher, par exemple «terrasse» ou «suite»', bereich: 'Espace', saison: 'Saison', format: 'Format', herkunft: 'Origine', alle: 'Toutes',
  b_zimmer: 'Chambres', b_restaurants: 'Restaurants', b_bar: 'Bar', b_spa: 'Spa', b_saal: 'Salle de bal', b_haus: 'Hôtel', b_region: 'Région',
  s_sommer: 'Été', s_winter: 'Hiver', s_jahr: 'Toute l’année', f_hoch: 'Portrait', f_quer: 'Paysage', f_quadrat: 'Carré',
  h_haus: 'Photos de l’hôtel', h_frei: 'Licence libre', h_ki: 'Créées par IA',
  im_titel: 'Mettre en forme dans L’Imprimerie', im_beitrag: 'En publication Instagram', im_story: 'En story', im_satz: 'Ouvre L’Imprimerie avec cette photo et votre cadrage, cinq projets au choix.',
  treffer: '{0} sur {1} photos', keine: 'Aucune photo ne correspond. Un filtre de moins aidera.', mehr: 'Afficher plus', zuruecksetzen: 'Réinitialiser les filtres',
  ki: 'IA', ki_lang: 'Créée par IA', ki_satz: 'Cette image a été créée par IA et ne montre pas un vrai plat ou une vraie boisson de l’hôtel. En publicité, seulement avec cette mention ou remplacée par une vraie photo.',
  ue_satz: 'Lumière et netteté retouchées par IA ; le contenu est la vraie photo.', archiv: 'Archives. Ne pas coloriser, ne pas retoucher.',
  quelle: 'Source', original: 'Original', laden: 'Télécharger', grossen: 'Formats', ausschnitt: 'Cadrage : faites glisser le cadre dans l’image.',
  g_instagram: 'Publication Instagram', g_story: 'Story', g_web: 'Site web', g_druck: 'Impression',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'plus grand côté 2000 px, JPG', i_druck: 'pleine résolution, {0} × {1}, JPG',
  ohne_server: 'Les formats prêts nécessitent la partie serveur du Livre (serve.py). Sans elle, le bouton télécharge la photo au format du site.',
  d_titel: 'Logo & fichiers', d_satz: 'Tout ce dont une agence ou un imprimeur a besoin. Le SVG reste net à toute taille, le PNG a un fond transparent.',
  d_logo: 'Logo', d_logo_s: 'L’emblème au-dessus du nom. La forme principale, avec sa zone de protection.', d_quer: 'Forme horizontale', d_quer_s: 'Pour bandeaux, en-têtes et pieds de page.',
  d_zeichen: 'Emblème', d_zeichen_s: 'Le médaillon seul : sceau, tampon, photo de profil. En or, taupe, encre ou blanc.',
  d_wort: 'Logotype', d_wort_s: 'Le nom en Cinzel, sans l’emblème.', d_tapete: 'Tapisserie', d_tapete_s: 'Le motif en carreau. À l’écran 340 px, à l’impression 36 mm.',
  d_farben: 'Couleurs', d_farben_s: 'Un clic copie la valeur. L’or dessine et n’écrit jamais le texte courant ; le rouge appartient au bar. En tête de la page d’accueil et dans les bandeaux dorés, l’or brille en dégradé, comme dans le logo.', verlauf: 'Dégradé, comme dans le logo', d_schriften: 'Typographies',
  d_schriften_s: 'Quatre typographies sous licence libre. Pour le site en WOFF2.',
  hell: 'pour fonds clairs', dunkel: 'pour fonds foncés', kopiert: 'Copié', regeln: 'Règles dans la charte',
  r_schrift: { a: 'Grandes lignes, titres', c: 'Lignes de chapitre, capitales', s: 'Texte courant', m: 'Horaires, prix, boutons' },
  p_titel: 'Contrôle de marque', p_satz: 'Téléchargez un projet, par exemple une affiche, une publication ou le flyer d’une agence. Les couleurs sont mesurées ; Claude évalue l’image, la typographie, l’emblème et le ton.',
  p_feld: 'Glissez un projet ici', p_feld2: 'ou choisissez · image ou PDF, jusqu’à 30 Mo', p_waehlen: 'Choisir un fichier', p_pruefen: 'Contrôler', p_beispiel: 'Voir un exemple', p_beispiel_h: 'Exemple : ce projet a été conçu exprès, tel qu’une agence pourrait l’envoyer. Le retour est le résultat inchangé du contrôle, en allemand.',
  p_privat: 'Rien n’est enregistré. Le projet va au serveur et à Claude uniquement pour le contrôle, puis il disparaît.',
  p_schritt1: 'Mesure des couleurs', p_schritt2: 'Lecture du projet', p_schritt3: 'Rédaction du retour', p_dauer: 'Cela prend en général une demi-minute.',
  p_gesamt: 'Dans l’ensemble', p_punkte: 'Point par point', p_farben: 'Couleurs mesurées', p_farben_s: 'Mesurées sans IA, par rapport à la palette de l’hôtel. Les photos du projet comptent aussi.',
  p_rahmen: '{0} % de la surface dans les couleurs de l’hôtel', p_ton: 'Dans le ton de l’hôtel', p_neu: 'Contrôler un nouveau projet', p_sichern: 'Enregistrer le résultat', p_kopie: 'Copier en texte',
  p_gleich: 'identique', p_nah: 'proche', p_fremd: 'étrangère', p_naechste: 'couleur la plus proche', p_schwarz: 'Noir pur sur {0} % de la surface. Le texte s’écrit en encre #1A1D28.',
  p_tuerkis: 'Turquoise sur {0} % de la surface. Le turquoise de l’Aar reste dans la photo et n’est pas une couleur de la marque.', p_rot: 'Rouge du bar sur {0} % de la surface. Il appartient au seul bar «Le Vieux Rivage».',
  u_passt: 'convient', u_achten: 'à revoir', u_passt_nicht: 'ne convient pas',
  ber: { farben: 'Couleurs', schrift: 'Typographie', zeichen: 'Emblème', abstand: 'Espacement', bild: 'Image', ton: 'Ton' },
  p_ki_fehler: 'L’évaluation par Claude n’a pas été possible ({0}). La mesure des couleurs figure ci-dessous.', p_fehler: 'Le contrôle n’a pas abouti',
  p_seiten: '{0} pages, les {1} premières contrôlées', p_text: 'Texte lu', fehler_verb: 'La partie serveur du Livre ne répond pas. serve.py est-il lancé ?',
  schliessen: 'Fermer'
},
zh: {
  unter: '品牌 · Grand Beau-Rivage', start: '概览', arbeiten: '工作', nachschlagen: '查阅', bilder: '图片库', dateien: '标志与文件', pruefung: '品牌检查', buch: '品牌手册',
  anleitung: '使用说明', maison: 'La Maison', website: '查看网站', sprache: '语言',
  morgen: '早上好。', tag: '您好。', abend: '晚上好。', frage: '今天需要什么？',
  start_satz: 'Le Livre 是酒店可直接使用的品牌工具：所有照片都有适用于 Instagram、网站和印刷的现成尺寸，徽章、标志、墙纸和色彩都有文件可下载，还能检查广告公司和酒店内部的设计稿。',
  k_bilder: '酒店的全部照片，可按区域、季节和画幅筛选。每张照片都可下载为帖子、快拍、网站或印刷尺寸。',
  k_dateien: '适用于浅色和深色背景的徽章、标志与文字标识，墙纸以及可复制的色值。',
  k_pruefung: '上传图片或 PDF 设计稿。Le Livre 会逐条指出哪些符合酒店品牌，哪些不符合。',
  k_buch: '徽章、色彩及其来源、字体、墙纸，以及所有设计遵循的规则。',
  oeffnen: '打开', lesen: '阅读',
  z_haus: '张酒店照片', z_frei: '张自由授权', z_ki: '张由 AI 生成', z_dateien: '个文件',
  stand: '{0} 张照片 · {1} 个文件',
  recht_t: '图片版权', recht: '照片归因特拉肯 Grand Beau-Rivage 及其摄影师所有。自由授权的照片须注明作者与授权。由 AI 生成的图片均有标注，并非酒店的真实菜品。',
  alles_zip: '全部文件（ZIP）',
  b_titel: '图片库', b_satz: '点击照片即可打开，按需下载所需尺寸；帖子和快拍可选择裁切范围。',
  suchen: '搜索，例如「露台」或「套房」', bereich: '区域', saison: '季节', format: '画幅', herkunft: '来源', alle: '全部',
  b_zimmer: '客房', b_restaurants: '餐厅', b_bar: '酒吧', b_spa: '水疗', b_saal: '宴会厅', b_haus: '酒店', b_region: '周边',
  s_sommer: '夏季', s_winter: '冬季', s_jahr: '全年', f_hoch: '竖幅', f_quer: '横幅', f_quadrat: '方形',
  h_haus: '酒店照片', h_frei: '自由授权', h_ki: '由 AI 生成',
  im_titel: '在 L’Imprimerie 中设计', im_beitrag: '作为 Instagram 帖子', im_story: '作为快拍', im_satz: '用这张照片和您的裁切打开 L’Imprimerie，五个草稿供选择。',
  treffer: '{1} 张中的 {0} 张', keine: '没有符合的照片，减少一个筛选条件试试。', mehr: '显示更多', zuruecksetzen: '重置筛选',
  ki: 'AI', ki_lang: '由 AI 生成', ki_satz: '此图片由 AI 生成，并非酒店真实的菜品或饮品。用于宣传时须保留此说明，或换成真实照片。',
  ue_satz: '光线与清晰度经 AI 处理，内容为真实照片。', archiv: '档案图片，请勿上色或修改。',
  quelle: '来源', original: '原图', laden: '下载', grossen: '尺寸', ausschnitt: '裁切：在图中拖动选框。',
  g_instagram: 'Instagram 帖子', g_story: '快拍', g_web: '网站', g_druck: '印刷',
  i_instagram: '1080 × 1350，JPG', i_story: '1080 × 1920，JPG', i_web: '长边 2000 px，JPG', i_druck: '完整分辨率，{0} × {1}，JPG',
  ohne_server: '现成尺寸需要 Le Livre 的服务器部分（serve.py）。没有它时，按钮下载网站尺寸的照片。',
  d_titel: '标志与文件', d_satz: '广告公司或印刷厂所需的一切。SVG 在任何尺寸下都清晰，PNG 为透明背景。',
  d_logo: '标志', d_logo_s: '名称上方配徽章，主要形式，四周留出保护空间。', d_quer: '横版', d_quer_s: '用于横条、信头和页脚。',
  d_zeichen: '徽章', d_zeichen_s: '单独的圆章：印章、图章、头像。金色、灰褐、墨色或白色。',
  d_wort: '文字标识', d_wort_s: 'Cinzel 字体的名称，不含徽章。', d_tapete: '墙纸', d_tapete_s: '图案单元。屏幕上 340 px，印刷 36 mm。',
  d_farben: '色彩', d_farben_s: '点击即可复制色值。金色用于点缀，从不用于正文；红色专属酒吧。在首页顶部和金色横条中，金色以渐变呈现光泽，如同标志。', verlauf: '渐变，如同标志', d_schriften: '字体',
  d_schriften_s: '四种自由授权字体，网站使用 WOFF2 格式。',
  hell: '用于浅色背景', dunkel: '用于深色背景', kopiert: '已复制', regeln: '品牌手册中的规则',
  r_schrift: { a: '大标题', c: '章节行，大写', s: '正文', m: '时间、价格、按钮' },
  p_titel: '品牌检查', p_satz: '上传设计稿，例如海报、帖子或广告公司的传单。色彩由程序测量，图片、字体、徽章和语气由 Claude 评估。',
  p_feld: '将设计稿拖到这里', p_feld2: '或选择文件 · 图片或 PDF，最大 30 MB', p_waehlen: '选择文件', p_pruefen: '检查', p_beispiel: '查看示例', p_beispiel_h: '示例：这份设计稿是特意制作的，模拟代理公司可能发来的稿件。下方反馈为检查的原始结果（德语）。',
  p_privat: '不会保存任何内容。设计稿仅为检查发送到服务器和 Claude，之后即删除。',
  p_schritt1: '测量色彩', p_schritt2: '查看设计稿', p_schritt3: '撰写反馈', p_dauer: '通常需要半分钟左右。',
  p_gesamt: '总体', p_punkte: '逐条反馈', p_farben: '测得的色彩', p_farben_s: '不经 AI，按酒店色板测量。设计稿中的照片也计算在内。',
  p_rahmen: '{0}% 的面积使用酒店色彩', p_ton: '酒店语气的写法', p_neu: '检查新的设计稿', p_sichern: '保存结果', p_kopie: '复制为文字',
  p_gleich: '一致', p_nah: '接近', p_fremd: '不符', p_naechste: '最接近的酒店色', p_schwarz: '{0}% 的面积为纯黑。文字应使用墨色 #1A1D28。',
  p_tuerkis: '{0}% 的面积为青绿色。阿勒河的青绿只留在照片里，不是品牌色。', p_rot: '{0}% 的面积为酒吧红，它专属 «Le Vieux Rivage» 酒吧。',
  u_passt: '符合', u_achten: '注意', u_passt_nicht: '不符合',
  ber: { farben: '色彩', schrift: '字体', zeichen: '徽章', abstand: '间距', bild: '图片', ton: '语气' },
  p_ki_fehler: 'Claude 暂时无法评估（{0}）。色彩测量见下方。', p_fehler: '检查未完成',
  p_seiten: '共 {0} 页，检查了前 {1} 页', p_text: '识别的文字', fehler_verb: 'Le Livre 的服务器部分没有响应。serve.py 是否在运行？',
  schliessen: '关闭'
},
ko: {
  unter: '브랜드 · Grand Beau-Rivage', start: '개요', arbeiten: '작업', nachschlagen: '참고', bilder: '사진 보관함', dateien: '로고 & 파일', pruefung: '브랜드 점검', buch: '브랜드 북',
  anleitung: '안내서', maison: 'La Maison', website: '웹사이트 보기', sprache: '언어',
  morgen: '좋은 아침입니다.', tag: '안녕하세요.', abend: '좋은 저녁입니다.', frage: '오늘은 무엇이 필요하신가요?',
  start_satz: 'Le Livre는 바로 쓰는 호텔의 브랜드입니다. 모든 사진을 인스타그램, 웹사이트, 인쇄용 크기로 받을 수 있고, 엠블럼, 로고, 벽지, 색상을 파일로 제공하며, 에이전시와 호텔 내부의 시안을 점검합니다.',
  k_bilder: '호텔의 모든 사진을 구역, 계절, 방향별로. 사진마다 게시물, 스토리, 웹사이트, 인쇄용으로.',
  k_dateien: '밝은 면과 어두운 면에 맞춘 엠블럼, 로고, 워드마크, 벽지, 복사할 수 있는 색상 값.',
  k_pruefung: '이미지나 PDF 시안을 올리면 Le Livre가 호텔에 맞는 점과 맞지 않는 점을 하나씩 알려 드립니다.',
  k_buch: '엠블럼, 색상과 그 유래, 서체, 벽지, 모든 디자인의 원칙.',
  oeffnen: '열기', lesen: '읽기',
  z_haus: '호텔 사진', z_frei: '자유 라이선스', z_ki: 'AI로 생성', z_dateien: '파일',
  stand: '사진 {0}장 · 파일 {1}개',
  recht_t: '이미지 권리', recht: '사진의 권리는 Grand Beau-Rivage Interlaken과 사진가에게 있습니다. 자유 라이선스 사진은 표기된 이름과 라이선스를 함께 밝혀야 합니다. AI로 생성한 이미지는 표시되어 있으며 호텔의 실제 요리가 아닙니다.',
  alles_zip: '전체 파일 (ZIP)',
  b_titel: '사진 보관함', b_satz: '사진을 클릭하면 열립니다. 필요한 크기로 받고, 게시물과 스토리는 잘라낼 범위를 고르세요.',
  suchen: '검색, 예: «테라스», «스위트»', bereich: '구역', saison: '계절', format: '방향', herkunft: '출처', alle: '전체',
  b_zimmer: '객실', b_restaurants: '레스토랑', b_bar: '바', b_spa: '스파', b_saal: '볼룸', b_haus: '호텔', b_region: '주변 지역',
  s_sommer: '여름', s_winter: '겨울', s_jahr: '연중', f_hoch: '세로', f_quer: '가로', f_quadrat: '정사각형',
  h_haus: '호텔 사진', h_frei: '자유 라이선스', h_ki: 'AI로 생성',
  im_titel: 'L’Imprimerie에서 디자인', im_beitrag: 'Instagram 게시물로', im_story: '스토리로', im_satz: '이 사진과 선택한 범위로 L’Imprimerie를 열고, 다섯 가지 초안 중에서 고릅니다.',
  treffer: '{1}장 중 {0}장', keine: '맞는 사진이 없습니다. 필터를 하나 줄여 보세요.', mehr: '더 보기', zuruecksetzen: '필터 초기화',
  ki: 'AI', ki_lang: 'AI로 생성', ki_satz: '이 이미지는 AI로 생성했으며 호텔의 실제 요리나 음료가 아닙니다. 광고에는 이 안내를 붙이거나 실제 사진으로 바꿔 쓰세요.',
  ue_satz: '빛과 선명도만 AI로 보정했으며 내용은 실제 사진입니다.', archiv: '아카이브 자료입니다. 색을 입히거나 보정하지 마세요.',
  quelle: '출처', original: '원본', laden: '받기', grossen: '크기', ausschnitt: '자르기: 사진 속 틀을 끌어 옮기세요.',
  g_instagram: '인스타그램 게시물', g_story: '스토리', g_web: '웹사이트', g_druck: '인쇄',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: '긴 변 2000 px, JPG', i_druck: '원본 해상도, {0} × {1}, JPG',
  ohne_server: '정해진 크기는 Le Livre의 서버 부분(serve.py)이 필요합니다. 없으면 버튼이 웹사이트 크기의 사진을 받습니다.',
  d_titel: '로고 & 파일', d_satz: '에이전시나 인쇄소에 필요한 모든 것. SVG는 어떤 크기에서도 선명하고, PNG는 배경이 투명합니다.',
  d_logo: '로고', d_logo_s: '이름 위에 엠블럼. 기본형이며 둘레에 여백을 둡니다.', d_quer: '가로형', d_quer_s: '띠, 레터헤드, 하단용.',
  d_zeichen: '엠블럼', d_zeichen_s: '메달리온 단독: 인장, 스탬프, 프로필 사진. 금색, 토프, 잉크, 흰색.',
  d_wort: '워드마크', d_wort_s: 'Cinzel 서체의 이름, 엠블럼 없이.', d_tapete: '벽지', d_tapete_s: '반복 무늬 한 칸. 화면 340 px, 인쇄 36 mm.',
  d_farben: '색상', d_farben_s: '클릭하면 값이 복사됩니다. 금색은 장식에만 쓰고 본문에는 쓰지 않으며, 빨강은 바 전용입니다. 홈페이지 상단과 금색 띠에서는 로고처럼 그라데이션으로 빛납니다.', verlauf: '그라데이션, 로고처럼', d_schriften: '서체',
  d_schriften_s: '자유 라이선스 서체 네 가지. 웹사이트용 WOFF2.',
  hell: '밝은 면용', dunkel: '어두운 면용', kopiert: '복사됨', regeln: '브랜드 북의 규칙',
  r_schrift: { a: '큰 제목', c: '장 제목, 대문자', s: '본문', m: '시간, 가격, 버튼' },
  p_titel: '브랜드 점검', p_satz: '포스터, 게시물, 에이전시 전단 같은 시안을 올리세요. 색상은 측정하고, 이미지, 서체, 엠블럼, 어조는 Claude가 평가합니다.',
  p_feld: '시안을 여기로 끌어 오세요', p_feld2: '또는 선택 · 이미지 또는 PDF, 최대 30 MB', p_waehlen: '파일 선택', p_pruefen: '점검', p_beispiel: '예시 보기', p_beispiel_h: '예시: 이 시안은 대행사가 보낼 법한 형태로 일부러 만든 것입니다. 아래 피드백은 점검 결과 그대로이며 독일어로 되어 있습니다.',
  p_privat: '아무것도 저장하지 않습니다. 시안은 점검을 위해서만 서버와 Claude로 가고 그 뒤 사라집니다.',
  p_schritt1: '색상 측정', p_schritt2: '시안 보기', p_schritt3: '피드백 작성', p_dauer: '보통 30초 정도 걸립니다.',
  p_gesamt: '전체', p_punkte: '항목별', p_farben: '측정한 색상', p_farben_s: 'AI 없이 호텔 팔레트와 비교해 측정했습니다. 시안 속 사진도 포함됩니다.',
  p_rahmen: '면적의 {0}%가 호텔 색상', p_ton: '호텔의 어조로', p_neu: '새 시안 점검', p_sichern: '결과 저장', p_kopie: '텍스트로 복사',
  p_gleich: '같음', p_nah: '가까움', p_fremd: '다름', p_naechste: '가장 가까운 호텔 색상', p_schwarz: '면적의 {0}%가 순수한 검정입니다. 글자는 잉크색 #1A1D28로 씁니다.',
  p_tuerkis: '면적의 {0}%가 청록색입니다. 아레강의 청록은 사진에만 있고 브랜드 색상이 아닙니다.', p_rot: '면적의 {0}%가 바 레드입니다. «Le Vieux Rivage» 바 전용입니다.',
  u_passt: '맞음', u_achten: '주의', u_passt_nicht: '맞지 않음',
  ber: { farben: '색상', schrift: '서체', zeichen: '엠블럼', abstand: '여백', bild: '이미지', ton: '어조' },
  p_ki_fehler: '지금은 Claude의 평가가 불가능했습니다({0}). 색상 측정은 아래에 있습니다.', p_fehler: '점검이 완료되지 않았습니다',
  p_seiten: '전체 {0}쪽, 앞 {1}쪽 점검', p_text: '읽은 텍스트', fehler_verb: 'Le Livre의 서버 부분이 응답하지 않습니다. serve.py가 실행 중인가요?',
  schliessen: '닫기'
},
ar: {
  unter: 'العلامة · Grand Beau-Rivage', start: 'نظرة عامة', arbeiten: 'العمل', nachschlagen: 'مرجع', bilder: 'أرشيف الصور', dateien: 'الشعار والملفات', pruefung: 'فحص العلامة', buch: 'دليل العلامة',
  anleitung: 'الدليل', maison: 'La Maison', website: 'عرض الموقع', sprache: 'اللغة',
  morgen: 'صباح الخير.', tag: 'مرحباً.', abend: 'مساء الخير.', frage: 'ماذا تحتاجون اليوم؟',
  start_satz: 'Le Livre هو علامة الفندق جاهزة للعمل: كل الصور بمقاسات جاهزة لإنستغرام والموقع والطباعة، والشعار والرمز وورق الجدران والألوان كملفات، وفحص للتصاميم من الوكالات ومن داخل الفندق.',
  k_bilder: 'كل صور الفندق حسب القسم والموسم والاتجاه. كل صورة كمنشور أو قصة أو للموقع أو للطباعة.',
  k_dateien: 'الرمز والشعار والاسم للمساحات الفاتحة والداكنة، وورق الجدران وقيم الألوان للنسخ.',
  k_pruefung: 'تصميم كصورة أو PDF. يبيّن Le Livre ما يناسب الفندق وما لا يناسبه، نقطة بنقطة.',
  k_buch: 'الرمز والألوان وأصلها والخطوط وورق الجدران وقواعد كل تصميم.',
  oeffnen: 'فتح', lesen: 'قراءة',
  z_haus: 'صورة للفندق', z_frei: 'برخصة حرة', z_ki: 'مولّدة بالذكاء الاصطناعي', z_dateien: 'ملفاً',
  stand: '{0} صورة · {1} ملفاً',
  recht_t: 'حقوق الصور', recht: 'الصور ملك لفندق Grand Beau-Rivage Interlaken ولمصوّريه. الصور ذات الرخصة الحرة لا تُستخدم إلا مع الاسم والرخصة المذكورين. الصور المولّدة بالذكاء الاصطناعي مُعلَّمة ولا تُظهر أطباقاً حقيقية من الفندق.',
  alles_zip: 'كل الملفات (ZIP)',
  b_titel: 'أرشيف الصور', b_satz: 'انقروا على صورة لفتحها، ثم نزّلوها بالمقاس المطلوب واختاروا القصّ للمنشورات والقصص.',
  suchen: 'بحث، مثلاً «شرفة» أو «جناح»', bereich: 'القسم', saison: 'الموسم', format: 'الاتجاه', herkunft: 'المصدر', alle: 'الكل',
  b_zimmer: 'الغرف', b_restaurants: 'المطاعم', b_bar: 'البار', b_spa: 'السبا', b_saal: 'القاعة', b_haus: 'الفندق', b_region: 'المنطقة',
  s_sommer: 'صيف', s_winter: 'شتاء', s_jahr: 'طوال العام', f_hoch: 'عمودي', f_quer: 'أفقي', f_quadrat: 'مربع',
  h_haus: 'صور الفندق', h_frei: 'رخصة حرة', h_ki: 'مولّدة بالذكاء الاصطناعي',
  im_titel: 'التصميم في L’Imprimerie', im_beitrag: 'كمنشور على Instagram', im_story: 'كقصة', im_satz: 'يفتح L’Imprimerie بهذه الصورة والقصّ الذي اخترتموه، مع خمس مسودات للاختيار.',
  treffer: '{0} من {1} صورة', keine: 'لا توجد صورة مطابقة. جرّبوا مرشحاً أقل.', mehr: 'عرض المزيد', zuruecksetzen: 'إعادة ضبط المرشحات',
  ki: 'ذكاء اصطناعي', ki_lang: 'مولّدة بالذكاء الاصطناعي', ki_satz: 'هذه الصورة مولّدة بالذكاء الاصطناعي ولا تُظهر طبقاً أو مشروباً حقيقياً من الفندق. في الإعلانات فقط مع هذه الملاحظة أو استبدلوها بصورة حقيقية.',
  ue_satz: 'تم تحسين الضوء والحدة بالذكاء الاصطناعي، والمحتوى هو الصورة الحقيقية.', archiv: 'من الأرشيف. لا تُلوَّن ولا تُعدَّل.',
  quelle: 'المصدر', original: 'الأصل', laden: 'تنزيل', grossen: 'المقاسات', ausschnitt: 'القصّ: اسحبوا الإطار داخل الصورة.',
  g_instagram: 'منشور إنستغرام', g_story: 'قصة', g_web: 'الموقع', g_druck: 'طباعة',
  i_instagram: '1080 × 1350، JPG', i_story: '1080 × 1920، JPG', i_web: 'الضلع الأطول 2000 بكسل، JPG', i_druck: 'الدقة الكاملة، {0} × {1}، JPG',
  ohne_server: 'المقاسات الجاهزة تحتاج إلى جزء الخادم في Le Livre (serve.py). بدونه ينزّل الزر الصورة بمقاس الموقع.',
  d_titel: 'الشعار والملفات', d_satz: 'كل ما تحتاجه وكالة أو مطبعة. يبقى SVG حاداً بأي مقاس، وخلفية PNG شفافة.',
  d_logo: 'الشعار', d_logo_s: 'الرمز فوق الاسم. الشكل الأساسي، مع مساحة حماية من كل الجهات.', d_quer: 'الشكل الأفقي', d_quer_s: 'للأشرطة وترويسات الرسائل والتذييلات.',
  d_zeichen: 'الرمز', d_zeichen_s: 'الميدالية وحدها: ختم أو طابع أو صورة حساب. بالذهبي أو الرمادي البني أو الحبري أو الأبيض.',
  d_wort: 'الاسم', d_wort_s: 'الاسم بخط Cinzel، بلا رمز.', d_tapete: 'ورق الجدران', d_tapete_s: 'الوحدة المتكررة كبلاطة. على الشاشة 340 بكسل، وفي الطباعة 36 مم.',
  d_farben: 'الألوان', d_farben_s: 'نقرة تنسخ القيمة. الذهبي للزخرفة ولا يُكتب به النص، والأحمر للبار وحده. في أعلى الصفحة الرئيسية وفي الأشرطة الذهبية يلمع الذهبي بتدرّج كما في الشعار.', verlauf: 'تدرّج كما في الشعار', d_schriften: 'الخطوط',
  d_schriften_s: 'أربعة خطوط برخصة حرة. للموقع بصيغة WOFF2.',
  hell: 'للمساحات الفاتحة', dunkel: 'للمساحات الداكنة', kopiert: 'تم النسخ', regeln: 'القواعد في دليل العلامة',
  r_schrift: { a: 'العناوين الكبيرة', c: 'أسطر الفصول، بأحرف كبيرة', s: 'النص', m: 'المواعيد والأسعار والأزرار' },
  p_titel: 'فحص العلامة', p_satz: 'ارفعوا تصميماً، مثل ملصق أو منشور أو نشرة من وكالة. تُقاس الألوان، ويقيّم Claude الصورة والخط والرمز والأسلوب.',
  p_feld: 'اسحبوا التصميم إلى هنا', p_feld2: 'أو اختاروا · صورة أو PDF، حتى 30 ميغابايت', p_waehlen: 'اختيار ملف', p_pruefen: 'فحص', p_beispiel: 'عرض مثال', p_beispiel_h: 'مثال: صُمّم هذا التصميم عمدًا كما قد ترسله وكالة. الملاحظات هي نتيجة الفحص كما هي، بالألمانية.',
  p_privat: 'لا يُحفظ شيء. يذهب التصميم إلى الخادم وإلى Claude للفحص فقط ثم يُحذف.',
  p_schritt1: 'قياس الألوان', p_schritt2: 'قراءة التصميم', p_schritt3: 'كتابة الملاحظات', p_dauer: 'يستغرق ذلك عادة نصف دقيقة.',
  p_gesamt: 'إجمالاً', p_punkte: 'نقطة بنقطة', p_farben: 'الألوان المقيسة', p_farben_s: 'مقيسة دون ذكاء اصطناعي، مقارنة بألوان الفندق. الصور في التصميم محسوبة أيضاً.',
  p_rahmen: '{0}% من المساحة بألوان الفندق', p_ton: 'بأسلوب الفندق', p_neu: 'فحص تصميم جديد', p_sichern: 'حفظ النتيجة', p_kopie: 'نسخ كنص',
  p_gleich: 'مطابق', p_nah: 'قريب', p_fremd: 'غريب', p_naechste: 'أقرب لون للفندق', p_schwarz: 'أسود خالص على {0}% من المساحة. يُكتب النص بالحبري ‎#1A1D28‎.',
  p_tuerkis: 'فيروزي على {0}% من المساحة. فيروزي نهر الآر يبقى في الصورة وليس من ألوان العلامة.', p_rot: 'أحمر البار على {0}% من المساحة. هو لبار «Le Vieux Rivage» وحده.',
  u_passt: 'مناسب', u_achten: 'انتبهوا', u_passt_nicht: 'غير مناسب',
  ber: { farben: 'الألوان', schrift: 'الخط', zeichen: 'الرمز', abstand: 'المسافات', bild: 'الصورة', ton: 'الأسلوب' },
  p_ki_fehler: 'تعذّر تقييم Claude الآن ({0}). قياس الألوان أدناه.', p_fehler: 'لم يكتمل الفحص',
  p_seiten: '{0} صفحات، فُحصت أول {1}', p_text: 'النص المقروء', fehler_verb: 'جزء الخادم في Le Livre لا يستجيب. هل serve.py يعمل؟',
  schliessen: 'إغلاق'
}};
let SP = (() => { try { const q = new URLSearchParams(location.search).get('sprache'); if (q && T[q]) return q; const m = localStorage.getItem('livre-sprache'); return m && T[m] ? m : 'de'; } catch (e) { return 'de'; } })();
const t = (k, ...a) => { let s = (T[SP] && T[SP][k] != null ? T[SP][k] : T.de[k]); if (typeof s === 'string') a.forEach((x, i) => { s = s.split('{' + i + '}').join(x); }); return s; };
const zahl = n => Number(n).toLocaleString(SP === 'de' ? 'de-CH' : SP);

/* ---------------------------------------------------------------- Zustand */
const S = { d: null, server: null, ansicht: 'start', f: { q: '', b: 'alle', s: 'alle', f: 'alle', h: 'alle' }, n: 48, datei: null, lauf: null, ergebnis: null };
const BEREICHE = ['zimmer', 'restaurants', 'bar', 'spa', 'saal', 'haus', 'region'];
const FORMATE = { instagram: [1080, 1350], story: [1080, 1920] };

/* ---------------------------------------------------------------- Grundgerüst */
function kopf() {
  const titel = { start: t('start'), bilder: t('bilder'), dateien: t('dateien'), pruefung: t('pruefung') }[S.ansicht];
  const st = S.d ? t('stand', zahl(S.d.stand.fotos), zahl(S.d.stand.dateien)) : '';
  const akt = SPRACHEN.find(x => x[0] === SP);
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="${esc(t('start'))}"><span class="li-z">${ZEICHEN}</span><span><b>Le Livre</b><small>${esc(t('unter'))}</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(titel)}</div><div class="kopf__stand">${esc(st)}</div></div>
    <div class="kopf__werk">
      <div class="li-sp"><button class="li-sp__k" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(t('sprache'))}">${esc(akt[1])}<i>${PFEIL}</i></button>
        <ul role="listbox">${SPRACHEN.map(([k, kurz, name]) => `<li><button type="button" role="option" data-sp="${k}" ${k === SP ? 'aria-selected="true"' : ''}><span>${esc(name)}</span><small>${esc(kurz)}</small></button></li>`).join('')}</ul></div>
      <a class="rund" href="../werkbank/anleitung/livre/" target="_blank" rel="noopener" data-tip="${esc(t('anleitung'))}" aria-label="${esc(t('anleitung'))}">${BUCH}</a>
      <a class="rund" href="../maison/" data-tip="${esc(t('maison'))}" aria-label="${esc(t('maison'))}">${HAUS}</a>
      <span class="kopf__trenn"></span>
      <a class="kn kn--klein" href="buch/">${esc(t('buch'))}<i>${PF}</i></a>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
  const sp = $('.li-sp'), k = $('.li-sp__k');
  k.onclick = e => { e.stopPropagation(); const o = sp.classList.toggle('offen'); k.setAttribute('aria-expanded', o); };
  $$('[data-sp]', sp).forEach(b => b.onclick = () => wechsle(b.dataset.sp));
}
document.addEventListener('click', () => { const sp = $('.li-sp'); if (sp) { sp.classList.remove('offen'); $('.li-sp__k').setAttribute('aria-expanded', false); } });

function rand() {
  const nw = (key, name, zahl = '') => `<button class="nw" type="button" data-gehe="${key}" ${S.ansicht === key ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<em>${esc(zahl)}</em>` : ''}</button>`;
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="false">Le Livre<i></i></button>
    <nav class="nav" aria-label="Le Livre">
      ${nw('start', t('start'))}
      <p>${esc(t('arbeiten'))}</p>
      ${nw('bilder', t('bilder'), S.d ? zahl(S.d.stand.fotos) : '')}${nw('dateien', t('dateien'), S.d ? zahl(S.d.stand.dateien) : '')}${nw('pruefung', t('pruefung'))}
      <p>${esc(t('nachschlagen'))}</p>
      <a class="nw" href="buch/"><span>${esc(t('buch'))}</span><em>${PF}</em></a>
    </nav>
    <div class="wege">
      <a href="../maison/">${esc(t('maison'))}${PF}</a>
      <a href="../index.html" target="_blank" rel="noopener">${esc(t('website'))}${PF}</a>
      <a href="../werkbank/anleitung/livre/" target="_blank" rel="noopener">${esc(t('anleitung'))}${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => { gehe(b.dataset.gehe); $('#rand').classList.remove('auf'); });
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
}

function leiste() {
  $('#leiste').innerHTML = `<span class="li-recht__z">${ZEICHEN}</span><div class="leiste__t"><b>${esc(t('recht_t'))}</b><span>${esc(t('recht'))}</span></div>
    <a class="kn kn--klein kn--gold" href="dateien/grand-beau-rivage-marke.zip" download>${esc(t('alles_zip'))}<i>${PU}</i></a>`;
}

function gehe(a) {
  S.ansicht = a;
  try { localStorage.setItem('livre-ansicht', a); } catch (e) { /* privat */ }
  history.replaceState(null, '', '#' + a);
  kopf(); rand(); zeichne();
  scrollTo({ top: 0 });
}
function wechsle(sp) {
  SP = sp;
  try { localStorage.setItem('livre-sprache', sp); } catch (e) { /* privat */ }
  document.documentElement.lang = sp === 'de' ? 'de-CH' : sp;
  document.documentElement.dir = sp === 'ar' ? 'rtl' : 'ltr';
  kopf(); rand(); leiste(); zeichne(true);
}

function titel(mono, h1, satz, kn = '') {
  return `<header class="titel" data-r><span class="zier"><i></i>${ZEICHEN}<span>${esc(mono)}</span><i></i></span><h1>${h1}</h1>${satz ? `<p class="satz">${esc(satz)}</p>` : ''}${kn ? `<div class="titel__kn">${kn}</div>` : ''}</header>`;
}
function zwei(s) { const i = s.lastIndexOf(' '); return i > 0 && SP !== 'zh' ? `${esc(s.slice(0, i))} <em>${esc(s.slice(i + 1))}</em>` : esc(s); }

function zeichne(still = false) {
  const el = $('#ansicht');
  const a = S.ansicht;
  el.innerHTML = a === 'bilder' ? bilder() : a === 'dateien' ? dateien() : a === 'pruefung' ? pruefung() : start();
  if (a === 'bilder') bilderLeben(); else if (a === 'dateien') dateienLeben(); else if (a === 'pruefung') pruefungLeben(); else startLeben();
  auftritte(el, still);
}

/* Auftritte: federnd hereinschweben, sobald im Bild (nur transform und opacity) */
let IO = null, IO2 = null;
function auftritte(r, still) {
  const alle = $$('[data-r]', r).filter(x => !x.classList.contains('da'));   // schon Eingeblendetes bleibt stehen
  if (still || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { alle.forEach(x => x.classList.add('da')); return; }
  if (!IO) IO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('da'); IO.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .01 });
  /* Kacheln des Bildarchivs: schon ein Stück vor dem Bild einblenden, damit beim Scrollen keine leeren Flächen stehen (Robert 12.10.2026) */
  if (!IO2) IO2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('da'); IO2.unobserve(e.target); } }), { rootMargin: '0px 0px 320px 0px', threshold: 0 });
  alle.forEach(x => (x.classList.contains('li-f') ? IO2 : IO).observe(x));
}

/* ---------------------------------------------------------------- Übersicht */
function start() {
  const h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? t('morgen') : h >= 11 && h < 18 ? t('tag') : t('abend');
  const st = S.d.stand;
  const f = S.d.fotos;
  const bild = k => `../assets/img/${k}-m.webp`;
  const karte = (ziel, mono, name, satz, inhalt, i) => `<button class="li-k" type="button" data-gehe="${ziel}" data-r style="--i:${i}">
      <span class="li-k__b">${inhalt}</span>
      <span class="li-k__n"><small>${esc(mono)}</small><b>${esc(name)}</b><span>${esc(satz)}</span><i class="li-k__p">${PF}</i></span></button>`;
  return `${titel('Le Livre · Grand Beau-Rivage', `${esc(gruss)} <em>${esc(t('frage'))}</em>`, t('start_satz'))}
    <div class="li-karten">
      ${karte('bilder', zahl(st.fotos), t('bilder'), t('k_bilder'), `<span class="li-stapel"><img src="${bild('haus-fluss-berge')}" alt="" decoding="async"><img src="${bild('terrasse-neu')}" alt="" decoding="async"><img src="${bild('z-pyramid')}" alt="" decoding="async"></span>`, 0)}
      ${karte('dateien', zahl(st.dateien), t('dateien'), t('k_dateien'), `<span class="li-logo tapete-d"><img src="dateien/logo-dunkel.svg" alt="" decoding="async"></span>`, 1)}
      ${karte('pruefung', 'ΔE · Claude', t('pruefung'), t('k_pruefung'), `<span class="li-pr-bild"><span class="li-pr-f">${S.d.farben.filter(x => x.g !== 'rot').slice(0, 8).map(x => `<i style="background:${x.h}"></i>`).join('')}</span><span class="li-pr-de"><b>ΔE</b><small>2000</small></span></span>`, 2)}
    </div>
    <div class="platte li-zahlen" data-r>
      <div><b>${zahl(st.haus)}</b><span>${esc(t('z_haus'))}</span></div>
      <div><b>${zahl(st.frei)}</b><span>${esc(t('z_frei'))}</span></div>
      <div><b>${zahl(st.ki)}</b><span>${esc(t('z_ki'))}</span></div>
      <div><b>${zahl(st.dateien)}</b><span>${esc(t('z_dateien'))}</span></div>
    </div>
    <a class="platte li-buch" href="buch/" data-r>
      <span class="li-buch__b"><img src="${bild('decke')}" alt="" loading="lazy" decoding="async"></span>
      <span class="li-buch__t"><small class="mono">${esc(t('nachschlagen'))}</small><b>${esc(t('buch'))}</b><span>${esc(t('k_buch'))}</span></span>
      <span class="kn">${esc(t('lesen'))}<i>${PF}</i></span>
    </a>`;
}
function startLeben() { $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe)); }

/* ---------------------------------------------------------------- Bildarchiv */
function titelVon(f) { return (f.t && (f.t[SP] || f.t.de)) || f.k; }
function gefiltert() {
  const F = S.f, q = F.q.trim().toLowerCase();
  return S.d.fotos.filter(f => (F.b === 'alle' || f.b === F.b) && (F.s === 'alle' || f.s === F.s) && (F.f === 'alle' || f.f === F.f || (F.f === 'quer' && f.f === 'quadrat'))
    && (F.h === 'alle' || f.art === F.h) && (!q || Object.values(f.t).join(' ').toLowerCase().includes(q) || f.k.includes(q) || t('b_' + f.b).toLowerCase().includes(q)));
}
function wahl(key, werte) {
  return `<div class="li-wahl"><span class="mono">${esc(t(key === 'b' ? 'bereich' : key === 's' ? 'saison' : key === 'f' ? 'format' : 'herkunft'))}</span><div class="wahl2" role="group">
    ${[['alle', t('alle')], ...werte].map(([w, n]) => `<button type="button" data-f="${key}" data-w="${w}" aria-pressed="${S.f[key] === w}">${esc(n)}</button>`).join('')}</div></div>`;
}
function bilder() {
  return `${titel(t('bilder'), zwei(t('b_titel')), t('b_satz'))}
    <div class="platte li-filter" data-r>
      <label class="suche li-suche">${LUPE}<input type="search" id="li-q" value="${esc(S.f.q)}" placeholder="${esc(t('suchen'))}" autocomplete="off"></label>
      ${wahl('b', BEREICHE.map(b => [b, t('b_' + b)]))}
      <div class="li-wahl-reihe">${wahl('s', [['sommer', t('s_sommer')], ['winter', t('s_winter')], ['jahr', t('s_jahr')]])}${wahl('f', [['hoch', t('f_hoch')], ['quer', t('f_quer')]])}</div>
      ${wahl('h', [['haus', t('h_haus')], ['frei', t('h_frei')], ['ki', t('h_ki')]])}
      <p class="li-treffer"><span id="li-n"></span><button class="link" type="button" id="li-reset">${esc(t('zuruecksetzen'))}</button></p>
    </div>
    <div class="li-raster" id="li-raster"></div>
    <div class="li-mehr" id="li-mehr"></div>`;
}
function kachel(f, i) {
  return `<button class="li-f li-f--${f.f}" type="button" data-k="${f.k}" data-r style="--i:${i % 6}" aria-label="${esc(titelVon(f))}">
    <img src="../assets/img/${f.k}-s.webp" alt="" loading="lazy" decoding="async">
    ${f.ki ? `<span class="li-ki" title="${esc(t('ki_lang'))}">${esc(t('ki'))}</span>` : ''}
    <span class="li-f__n">${esc(titelVon(f))}</span></button>`;
}
function raster(neu = false, mehr = false) {
  const L = gefiltert();
  if (neu) S.n = 48;
  $('#li-n').textContent = t('treffer', zahl(L.length), zahl(S.d.fotos.length));
  const r = $('#li-raster');
  /* Nachladen hängt nur die nächsten Kacheln an (Robert 12.10.2026: beim Scrollen verschwanden alle Bilder kurz, weil das ganze Raster neu gesetzt
     und neu eingeblendet wurde); nur bei Filter oder Suche wird das Raster neu aufgebaut. */
  const vor = mehr && !r.querySelector('.li-leer') ? r.children.length : 0;
  if (vor) r.insertAdjacentHTML('beforeend', L.slice(vor, S.n).map((f, i) => kachel(f, vor + i)).join(''));
  else r.innerHTML = L.length ? L.slice(0, S.n).map(kachel).join('') : `<p class="li-leer">${esc(t('keine'))}</p>`;
  $('#li-mehr').innerHTML = L.length > S.n ? `<button class="kn kn--linie" type="button" id="li-mehr-k">${esc(t('mehr'))}<i>${PF}</i></button>` : '';
  if ($('#li-mehr-k')) $('#li-mehr-k').onclick = () => { S.n += 48; raster(false, true); };
  [].slice.call(r.children, vor).forEach(b => { if (b.dataset.k) b.onclick = () => detail(b.dataset.k); });
  auftritte(r);
  if (S.mehrIO) S.mehrIO.disconnect();
  if ($('#li-mehr-k') && 'IntersectionObserver' in window) { S.mehrIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { S.n += 48; raster(false, true); } }, { rootMargin: '600px' }); S.mehrIO.observe($('#li-mehr-k')); }
}
function bilderLeben() {
  raster(true);
  let uhr;
  $('#li-q').oninput = e => { clearTimeout(uhr); uhr = setTimeout(() => { S.f.q = e.target.value; raster(true); }, 160); };
  $$('[data-f]').forEach(b => b.onclick = () => {
    S.f[b.dataset.f] = b.dataset.w;
    $$(`[data-f="${b.dataset.f}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    raster(true);
  });
  $('#li-reset').onclick = () => { S.f = { q: '', b: 'alle', s: 'alle', f: 'alle', h: 'alle' }; zeichne(true); };
}

/* Detail: grosses Bild, Herkunft, Grössen, Ausschnitt für Beitrag und Story */
function detail(k) {
  const f = S.d.fotos.find(x => x.k === k); if (!f) return;
  const fx = { instagram: { x: .5, y: .5 }, story: { x: .5, y: .5 } };
  let aktiv = 'instagram';
  const imp = g => `${IMPRIMERIE}?foto=${encodeURIComponent(k)}&art=${g === 'story' ? 'story' : 'insta'}&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}`;
  const link = g => S.server ? `api/bild?k=${encodeURIComponent(k)}&f=${g}${fx[g] ? `&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}` : ''}` : `../assets/img/${k}-l.webp`;
  const zeile = g => `<li class="li-gr" data-g="${g}"><span><b>${esc(t('g_' + g))}</b><small>${esc(g === 'druck' ? t('i_druck', zahl(f.w), zahl(f.h)) : t('i_' + g))}</small></span>
    <a class="kn kn--klein" href="${link(g)}" download data-laden="${g}">${esc(t('laden'))}<i>${PU}</i></a></li>`;
  const art = f.art === 'ki' ? `<p class="li-hinweis li-hinweis--ki"><b>${esc(t('ki_lang'))}</b>${esc(t('ki_satz'))}</p>` : f.alt ? `<p class="li-hinweis">${esc(t('archiv'))}</p>` : f.ue ? `<p class="li-hinweis li-hinweis--leise">${esc(t('ue_satz'))}</p>` : '';
  fenster(`<div class="li-det">
    <div class="li-det__b"><div class="li-det__bild" id="li-bild"><img src="../assets/img/${k}-l.webp" alt="${esc(titelVon(f))}" decoding="async"><span class="li-rahmen" id="li-rahmen" hidden></span></div>
      <p class="leise li-det__hilfe">${esc(t('ausschnitt'))}</p></div>
    <div class="li-det__t">
      <p class="mono">${esc(t('b_' + f.b))} · ${esc(t('s_' + f.s))} · ${esc(t('f_' + f.f))}</p>
      <h2>${esc(titelVon(f))}</h2>
      ${art}
      <dl class="li-meta"><dt>${esc(t('quelle'))}</dt><dd>${esc(f.q)}</dd><dt>${esc(t('original'))}</dt><dd>${zahl(f.w)} × ${zahl(f.h)} px</dd></dl>
      <p class="mono li-det__gr">${esc(t('grossen'))}</p>
      <ul class="li-grl">${['instagram', 'story', 'web', 'druck'].map(zeile).join('')}</ul>
      ${S.server ? '' : `<p class="leise">${esc(t('ohne_server'))}</p>`}
      <div class="li-imp"><p class="mono li-det__gr">${esc(t('im_titel'))}</p>
        <div class="li-imp__k"><a class="kn kn--klein" data-imp="instagram" href="${imp('instagram')}" target="_blank" rel="noopener">${esc(t('im_beitrag'))}<i>${PF}</i></a><a class="kn kn--klein kn--linie" data-imp="story" href="${imp('story')}" target="_blank" rel="noopener">${esc(t('im_story'))}<i>${PF}</i></a></div>
        <p class="leise">${esc(t('im_satz'))}</p></div>
    </div></div>`);
  const bildEl = $('#li-bild'), rahmen = $('#li-rahmen'), img = $('img', bildEl);
  function setze() {
    const g = FORMATE[aktiv];
    if (!img.naturalWidth) { rahmen.hidden = true; return; }
    /* Website und Druck haben keinen Ausschnitt: der Rahmen zeigt das ganze Bild (Robert 12.10.2026: alle vier Grössen wählbar) */
    const W = bildEl.clientWidth, H = bildEl.clientHeight, ziel = g ? g[0] / g[1] : W / H;
    let w = W, h = H;
    if (W / H > ziel) w = H * ziel; else h = W / ziel;
    const p = fx[aktiv] || { x: .5, y: .5 };
    rahmen.classList.toggle('li-rahmen--ganz', !g);
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    rahmen.style.transform = `translate(${(W - w) * p.x}px,${(H - h) * p.y}px)`;
    /* Jede Grösse sichtbar machen, nicht nur die Story (Robert 15.10.2026: «nur wenn ich über Story gehe, wird mir die Grösse angezeigt»):
       Masse im Schild, Rahmen leicht nach innen, wenn er fast das ganze Bild deckt, und ein kurzes Aufleuchten bei jedem Wechsel */
    const lang = 2000, sk = Math.min(1, lang / Math.max(f.w, f.h)), masse = g ? `${g[0]} × ${g[1]}` : aktiv === 'web' ? `${Math.round(f.w * sk)} × ${Math.round(f.h * sk)}` : `${zahl(f.w)} × ${zahl(f.h)}`;
    if (w > W - 6 && h > H - 6) { w -= 12; h -= 12; rahmen.style.transform = `translate(6px,6px)`; }
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    rahmen.dataset.g = t('g_' + aktiv) + ' · ' + masse + ' px' + (g ? '' : aktiv === 'web' ? ' · ganzes Bild, kleiner gerechnet' : ' · ganzes Bild, volle Auflösung');   // Website und Druck: gleiche Fläche, nur andere Pixelzahl (Robert 15.10.2026)
    rahmen.classList.remove('blitz'); void rahmen.offsetWidth; rahmen.classList.add('blitz');
    rahmen.hidden = false;
    $$('[data-laden]').forEach(a => a.href = link(a.dataset.laden));
    $$('[data-imp]').forEach(a => a.href = imp(a.dataset.imp));
  }
  img.complete ? setze() : img.addEventListener('load', setze);
  $$('.li-gr').forEach(li => {
    const an = () => { aktiv = li.dataset.g; $$('.li-gr').forEach(x => x.classList.toggle('an', x === li)); setze(); };
    li.addEventListener('mouseenter', an); li.addEventListener('focusin', an);
  });
  $('.li-gr').classList.add('an');
  // Rahmen ziehen
  let zug = null;
  rahmen.addEventListener('pointerdown', e => { zug = { x: e.clientX, y: e.clientY, p: { ...fx[aktiv] } }; rahmen.setPointerCapture(e.pointerId); rahmen.classList.add('zieht'); });
  rahmen.addEventListener('pointermove', e => {
    if (!zug) return;
    const W = bildEl.clientWidth, H = bildEl.clientHeight, w = rahmen.offsetWidth, h = rahmen.offsetHeight;
    fx[aktiv] = { x: W - w > 1 ? Math.min(1, Math.max(0, zug.p.x + (e.clientX - zug.x) / (W - w))) : .5, y: H - h > 1 ? Math.min(1, Math.max(0, zug.p.y + (e.clientY - zug.y) / (H - h))) : .5 };
    setze();
  });
  const los = () => { zug = null; rahmen.classList.remove('zieht'); };
  rahmen.addEventListener('pointerup', los); rahmen.addEventListener('pointercancel', los);
  addEventListener('resize', setze, { once: true });
}

/* ---------------------------------------------------------------- Dateien */
function dateien() {
  const D = Object.fromEntries(S.d.dateien.map(x => [x.k, x]));
  const gr = n => { const b = S.d.groessen[n]; return b ? (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB') : ''; };
  const knoepfe = liste => liste.map(n => `<a class="kn kn--klein ${n.endsWith('.png') || n.endsWith('.webp') || n.endsWith('.json') ? 'kn--linie' : ''}" href="dateien/${n}" download title="${esc(n)} · ${gr(n)}">${esc(n.split('.').pop().toUpperCase())}<i>${PU}</i></a>`).join('');
  const block = (k, titel, satz, inhalt, i) => `<section class="li-d" data-r style="--i:${i % 2}"><header><h2 class="li-d__t">${zwei(titel)}</h2><p class="leise">${esc(satz)}</p></header>${inhalt}</section>`;
  const tafeln = (e, breit) => `<div class="li-tafeln ${breit ? 'li-tafeln--breit' : ''}">${e.var.map(v => `<figure class="li-tafel li-tafel--${v.grund}">
      <div class="li-tafel__f"><img src="dateien/${v.dateien[0]}" alt="" loading="lazy" decoding="async"></div>
      <figcaption><span><b>${esc(t(v.grund))}</b><small>${esc(v.dateien[0].replace('.svg', ''))}</small></span><span class="li-kn">${knoepfe(v.dateien)}</span></figcaption></figure>`).join('')}</div>`;
  const farben = S.d.farben.concat(S.d.glanz || []).map((f, i) => f.v ? `<button class="li-farbe li-farbe--glanz" type="button" data-kopie="${esc(f.v)}" style="--c:${esc(f.v)};--i:${i % 6}" data-r>
      <span class="li-farbe__f"><span class="li-farbe__ok">${esc(t('kopiert'))}</span></span>
      <span class="li-farbe__n"><b>${esc(f.n)}</b><small>${esc(f.r)}</small></span>
      <span class="li-farbe__w"><span data-kopie-w="${esc(f.v)}">${f.s[0]} → ${f.s[f.s.length - 1]}</span><span>${esc(t('verlauf'))}</span></span></button>` : `<button class="li-farbe" type="button" data-kopie="${f.h}" style="--c:${f.h};--i:${i % 6}" data-r>
      <span class="li-farbe__f"><span class="li-farbe__ok">${esc(t('kopiert'))}</span></span>
      <span class="li-farbe__n"><b>${esc(f.n)}</b><small>${esc(f.r)}</small></span>
      <span class="li-farbe__w"><span data-kopie-w="${f.h}">${f.h}</span><span data-kopie-w="rgb(${f.rgb.join(', ')})">RGB ${f.rgb.join(' · ')}</span></span></button>`).join('');
  const SCHRIFTEN = [['a', 'Cormorant Garamond', 'Medium 500', 'cormorant-garamond-500-latin.woff2', 'Das Haus am Fluss'], ['c', 'Cinzel', 'Regular 400', 'Cinzel-latin.woff2', 'INTERLAKEN · SEIT 1874'],
    ['s', 'Instrument Sans', '400–600', 'InstrumentSans-normal-400_600.woff2', 'Zimmer mit Blick auf die Aare'], ['m', 'DM Mono', 'Regular 400', 'DMMono-normal-400.woff2', 'HÖHEWEG 211 · 3800 INTERLAKEN']];
  const schriften = SCHRIFTEN.map(([c, n, s, d, p]) => `<li class="li-schrift"><span class="li-schrift__p f-${c}">${esc(p)}</span><span><b>${esc(n)}</b><small>${esc(s)} · ${esc(t('r_schrift')[c])}</small></span>
      <a class="kn kn--klein kn--linie" href="../assets/fonts/${d}" download>WOFF2<i>${PU}</i></a></li>`).join('');
  return `${titel(t('dateien'), zwei(t('d_titel')), t('d_satz'), `<a class="kn kn--gold" href="dateien/grand-beau-rivage-marke.zip" download>${esc(t('alles_zip'))}<i>${PU}</i></a><a class="kn kn--linie" href="buch/#zeichen">${esc(t('regeln'))}<i>${PF}</i></a>`)}
    ${block('logo', t('d_logo'), t('d_logo_s'), tafeln(D.logo), 0)}
    ${block('quer', t('d_quer'), t('d_quer_s'), tafeln(D.quer, true), 1)}
    ${block('zeichen', t('d_zeichen'), t('d_zeichen_s'), tafeln(D.zeichen), 0)}
    ${block('wort', t('d_wort'), t('d_wort_s'), tafeln(D.wortmarke, true), 1)}
    ${block('tapete', t('d_tapete'), t('d_tapete_s'), `<div class="li-tafeln">${D.tapete.var.map(v => `<figure class="li-tafel li-tafel--${v.grund}"><div class="li-tafel__f li-tapete" style="background-image:url(dateien/${v.dateien[1]})"></div>
      <figcaption><span><b>${esc(t(v.grund))}</b><small>${v.px[0]} × ${v.px[1]} px</small></span><span class="li-kn">${knoepfe(v.dateien)}</span></figcaption></figure>`).join('')}</div>`, 0)}
    ${block('farben', t('d_farben'), t('d_farben_s'), `<div class="li-farben">${farben}</div><div class="li-kn li-kn--mitte">${knoepfe(D.farben.dateien)}</div>`, 1)}
    ${block('schriften', t('d_schriften'), t('d_schriften_s'), `<ul class="li-schriften">${schriften}</ul>`, 0)}`;
}
function kopiere(w, el) {
  const ok = () => { if (el) { el.classList.add('kopiert'); setTimeout(() => el.classList.remove('kopiert'), 1400); } melde(t('kopiert') + ' · ' + w); };
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(w).then(ok, () => alt());
  else alt();
  function alt() { const x = document.createElement('textarea'); x.value = w; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* nichts */ } x.remove(); }
}
function dateienLeben() {
  $$('[data-kopie]').forEach(b => b.onclick = e => { const w = e.target.closest('[data-kopie-w]'); kopiere(w ? w.dataset.kopieW : b.dataset.kopie, b); });
}

/* ---------------------------------------------------------------- Markenprüfung */
function pruefung() {
  return `${titel(t('pruefung'), zwei(t('p_titel')), t('p_satz'))}<div id="li-pr"></div><div id="li-bsp-erg"></div>`;
}
function pruefungLeben() { S.ergebnis ? ergebnis(S.ergebnis) : feld(); if (!S.ergebnis && /[?&]beispiel=1/.test(location.search)) beispielPruefung(); }
/* Beispiel (14.10.2026, Robert: «eine Livre Markenprüfung auch»): ein eigens gebauter Entwurf (_qa/registre/beispiel-entwurf-winterchalet.html (seit 15.10.2026; vorher Tea Time, Sicherung _sicherung/livre-beispiel-pruefung-teatime-2026-10-14.json)) und die unveränderte
   Rückmeldung der echten Prüfung dazu, als Datei beispiel/pruefung.json. Überall als Beispiel beschriftet; ?beispiel=1#pruefung öffnet es gleich. */
async function beispielPruefung() {
  try {
    const r = await fetch('beispiel/pruefung.json', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
    const j = await r.json(); j.beispiel = true;
    S.ergebnis = j; if (S.ansicht === 'pruefung') ergebnis(j);
  } catch (e) { melde(t('p_fehler'), true); }
}
function feld() {
  const d = S.datei;
  $('#li-pr').innerHTML = `<div class="platte li-feld" id="li-feld" data-r>
      <input type="file" id="li-datei" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
      <div class="li-feld__in">
        ${d ? `<div class="li-feld__vor">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}</div><p class="li-feld__name"><b>${esc(d.name)}</b><small>${(d.groesse / 1e6).toFixed(1)} MB</small></p>`
          : `<span class="li-feld__z">${ZEICHEN}</span><p class="li-feld__t">${esc(t('p_feld'))}</p><p class="leise">${esc(t('p_feld2'))}</p>`}
        <div class="li-feld__kn"><button class="kn ${d ? 'kn--linie' : ''}" type="button" id="li-waehle">${esc(t('p_waehlen'))}<i>${PO}</i></button>${d ? `<button class="kn kn--gold" type="button" id="li-los">${esc(t('p_pruefen'))}<i>${PF}</i></button>` : ''}</div>
        ${d ? '' : `<p class="li-bsp"><button class="link" type="button" id="li-bsp">${esc(t('p_beispiel'))}</button></p>`}
      </div>
      <p class="li-privat">${esc(t('p_privat'))}</p>
    </div>`;
  const inp = $('#li-datei'), fl = $('#li-feld');
  $('#li-waehle').onclick = () => inp.click();
  inp.onchange = () => inp.files[0] && nimm(inp.files[0]);
  ['dragenter', 'dragover'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.add('ueber'); }));
  ['dragleave', 'drop'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.remove('ueber'); }));
  fl.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) nimm(f); });
  if ($('#li-los')) $('#li-los').onclick = pruefe;
  if ($('#li-bsp')) $('#li-bsp').onclick = () => { const u = $('#li-bsp-erg'); if (u && u.firstChild) u.scrollIntoView({ behavior: 'smooth', block: 'start' }); else beispielPruefung(); };
  auftritte($('#li-pr'), true);
  beispielUnten(!d);
}
/* Unter dem leeren Feld steht immer eine fertige Beispiel-Prüfung (Robert 16.10.2026: «überall, wo Dummy-Sachen sein können, bitte welche»), deutlich als Beispiel beschriftet */
async function beispielUnten(an) {
  const u = $('#li-bsp-erg'); if (!u) return;
  if (!an) { u.innerHTML = ''; return; }
  try {
    if (!S.bspJ) { const r = await fetch('beispiel/pruefung.json'); if (!r.ok) throw new Error(r.status); S.bspJ = await r.json(); S.bspJ.beispiel = true; }
    if (S.datei || S.ergebnis || S.ansicht !== 'pruefung' || !$('#li-bsp-erg')) return;
    $('#li-bsp-erg').innerHTML = '<div class="li-bsp-unten"></div>'; ergebnis(S.bspJ, $('#li-bsp-erg .li-bsp-unten'));
  } catch (e) { /* ohne Beispiel bleibt das Feld */ }
}
function nimm(f) {
  if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) { melde(t('p_feld2'), true); return; }
  if (f.size > 30 * 1024 * 1024) { melde(t('p_feld2'), true); return; }
  const r = new FileReader();
  r.onload = () => { S.datei = { name: f.name, typ: f.type, groesse: f.size, daten: r.result, bild: f.type === 'application/pdf' ? '' : r.result }; feld(); };
  r.readAsDataURL(f);
}
async function pruefe() {
  const d = S.datei; if (!d) return;
  const schritte = [t('p_schritt1'), t('p_schritt2'), t('p_schritt3')];
  $('#li-pr').innerHTML = `<div class="platte li-lauf" data-r><div class="li-lauf__b">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}<span class="li-scan"></span></div>
    <div><ol class="li-schritte">${schritte.map((s, i) => `<li data-i="${i}"><i></i><span>${esc(s)}</span></li>`).join('')}</ol><p class="leise">${esc(t('p_dauer'))}</p></div></div>`;
  auftritte($('#li-pr'), true);
  const li = $$('.li-schritte li');
  let n = 0; li[0].classList.add('an');
  const uhr = setInterval(() => { if (n < 2) { li[n].classList.replace('an', 'fertig'); n++; li[n].classList.add('an'); } }, n === 0 ? 1600 : 9000);
  try {
    const r = await fetch('api/pruefen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, typ: d.typ, daten: d.daten, sprache: SP }) });
    let j = {}; try { j = await r.json(); } catch (e) { /* leer */ }
    if (!r.ok) throw new Error(String(j.fehler || r.status).replace(/^[A-ZÄÖÜ]+ · /, ''));
    clearInterval(uhr); li.forEach(x => { x.classList.remove('an'); x.classList.add('fertig'); });
    S.ergebnis = j;
    setTimeout(() => ergebnis(j), 380);
  } catch (e) {
    clearInterval(uhr);
    melde(t('p_fehler') + ': ' + (e.message === 'Failed to fetch' ? t('fehler_verb') : e.message), true);
    feld();
  }
}
function ergebnis(j, ziel) {
  const Z = ziel || $('#li-pr');
  const m = j.messung, k = j.ki || {};
  const pr = x => Math.round(x * 100);
  const toene = m.toene.map((x, i) => `<li class="li-ton li-ton--${x.urteil}" style="--i:${i}">
      <span class="li-ton__f" style="background:${x.hex}"></span>
      <span class="li-ton__a"><i style="width:${Math.max(2, pr(x.anteil))}%"></i><b>${x.anteil < .01 ? '&lt;1' : pr(x.anteil)} %</b></span>
      <span class="li-ton__n"><b>${x.hex.toUpperCase()}</b><small>${esc(t('p_naechste'))}: <i style="background:${x.palette}"></i>${esc(x.name)} · ΔE ${String(x.de).replace('.', SP === 'de' || SP === 'fr' ? ',' : '.')}</small></span>
      <em>${esc(t('p_' + x.urteil))}</em></li>`).join('');
  const sonder = [m.schwarz > .01 ? t('p_schwarz', pr(m.schwarz)) : '', m.tuerkis > .01 ? t('p_tuerkis', pr(m.tuerkis)) : '', m.rot > .02 ? t('p_rot', pr(m.rot)) : ''].filter(Boolean);
  const reihe = { passt_nicht: 0, achten: 1, passt: 2 };
  const punkte = (k.punkte || []).slice().sort((a, b) => (reihe[a.urteil] ?? 1) - (reihe[b.urteil] ?? 1)).map((p, i) => `<li class="li-pk li-pk--${esc(p.urteil)}" data-r style="--i:${i}">
      <span class="li-pk__m"><em>${esc(t('u_' + p.urteil) || p.urteil)}</em><small>${esc((t('ber')[p.bereich]) || p.bereich)}</small></span>
      <span class="li-pk__t"><b>${esc(p.titel)}</b><span>${esc(p.text)}</span></span></li>`).join('');
  const ton = (k.ton || []).filter(x => x.stelle && x.vorschlag).map(x => `<li><s>${esc(x.stelle)}</s><span>${esc(x.vorschlag)}</span></li>`).join('');
  if (!ziel) { const u = $('#li-bsp-erg'); if (u) u.innerHTML = ''; }
  Z.innerHTML = `<div class="li-erg">
    <aside class="li-erg__l">
      <figure class="platte li-erg__bild" data-r><img src="${j.vorschau}" alt="${esc(j.name)}"><figcaption><b>${esc(j.name)}</b>${j.seiten > 1 ? `<small>${esc(t('p_seiten', j.seiten, Math.min(j.seiten, 3)))}</small>` : ''}</figcaption></figure>
      <section class="platte li-erg__farben" data-r><h3>${esc(t('p_farben'))}</h3><p class="leise">${esc(t('p_farben_s'))}</p>
        <p class="li-rahmen-z"><span class="li-rahmen-z__b"><i style="width:${pr(m.im_rahmen)}%"></i></span>${esc(t('p_rahmen', pr(m.im_rahmen)))}</p>
        <ol class="li-toene">${toene}</ol>${sonder.length ? `<ul class="li-sonder">${sonder.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</section>
    </aside>
    <div class="li-erg__r">
      ${j.beispiel ? `<p class="platte li-hinweis li-hinweis--bsp" data-r>${esc(t('p_beispiel_h'))}</p>` : ''}
      ${j.ki_fehler ? `<p class="platte li-hinweis li-hinweis--ki" data-r>${esc(t('p_ki_fehler', j.ki_fehler))}</p>` : `
      <section class="platte li-gesamt" data-r><p class="mono">${esc(t('p_gesamt'))}${k.art ? ' · ' + esc(k.art) : ''}</p><p class="li-gesamt__s">${esc(k.gesamt || '')}</p></section>
      <h3 class="li-erg__h">${esc(t('p_punkte'))}</h3><ol class="li-punkte">${punkte}</ol>
      ${ton ? `<section class="platte li-tonvor" data-r><h3>${esc(t('p_ton'))}</h3><ul>${ton}</ul></section>` : ''}
      ${k.text ? `<details class="li-gelesen"><summary class="mono">${esc(t('p_text'))}</summary><p>${esc(k.text)}</p></details>` : ''}`}
      <div class="li-erg__kn"><button class="kn" type="button" id="li-neu">${esc(t('p_neu'))}<i>${PU}</i></button><button class="kn kn--linie" type="button" id="li-kopie">${esc(t('p_kopie'))}<i>${KOPIE}</i></button><button class="kn kn--linie" type="button" id="li-sichern">${esc(t('p_sichern'))}<i>${PU}</i></button></div>
    </div></div>`;
  auftritte(Z);
  const kn = x => Z.querySelector(x);
  kn('#li-neu').onclick = () => { S.ergebnis = null; S.datei = null; feld(); scrollTo({ top: 0, behavior: 'smooth' }); };
  kn('#li-kopie').onclick = () => kopiere(alsText(j));
  kn('#li-sichern').onclick = () => sichere(j);
}
function alsText(j) {
  const m = j.messung, k = j.ki || {};
  const z = [`Le Livre · ${t('pruefung')} · ${j.name}`, ''];
  if (k.gesamt) z.push(k.gesamt, '');
  (k.punkte || []).forEach(p => z.push(`· ${(t('ber')[p.bereich]) || p.bereich} – ${t('u_' + p.urteil) || p.urteil}: ${p.titel}. ${p.text}`));
  z.push('', t('p_farben') + ':');
  m.toene.forEach(x => z.push(`  ${x.hex.toUpperCase()} ${Math.round(x.anteil * 100)} % → ${x.name} ${x.palette.toUpperCase()}, ΔE ${x.de} (${t('p_' + x.urteil)})`));
  (k.ton || []).forEach(x => z.push('', `«${x.stelle}» → «${x.vorschlag}»`));
  return z.join('\n');
}
function sichere(j) {
  // nur auf ausdrücklichen Wunsch: eine Datei auf diesem Rechner, nichts auf dem Server
  const html = `<!doctype html><meta charset="utf-8"><title>Le Livre · ${esc(j.name)}</title><body style="font:15px/1.6 system-ui;max-width:820px;margin:40px auto;color:#1a1d28;background:#f7f0e3;padding:0 20px">
    <h1 style="font:500 34px Georgia,serif">${esc(t('pruefung'))}: ${esc(j.name)}</h1><img src="${j.vorschau}" style="max-width:360px;border-radius:12px"><pre style="white-space:pre-wrap;font:14px/1.6 system-ui">${esc(alsText(j))}</pre>
    <p style="color:#7d6a4f;font-size:12px">Le Livre · Grand Beau-Rivage Interlaken · ${new Date().toLocaleString(SP === 'de' ? 'de-CH' : SP)}</p></body>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = 'le-livre-pruefung-' + j.name.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9äöü_-]+/gi, '-').toLowerCase() + '.html';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------------------------------------------------------------- Fenster, Meldung */
function fenster(html) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k li-fk" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="${esc(t('schliessen'))}">${ZU}</button>${html}</div>`;
  f.hidden = false; document.body.classList.add('li-zu');
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
}
function fensterZu() { $('#fenster').hidden = true; $('#fenster').innerHTML = ''; document.body.classList.remove('li-zu'); }
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu(); });
function melde(text, fehl = false) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(text)}</b></div>`;
  $('#meldung').appendChild(q);
  setTimeout(() => q.remove(), fehl ? 7000 : 2600);
}

/* ---------------------------------------------------------------- Start */
(async function () {
  document.documentElement.lang = SP === 'de' ? 'de-CH' : SP;
  document.documentElement.dir = SP === 'ar' ? 'rtl' : 'ltr';
  const vorgeladen = document.querySelector('link[rel="preload"][as="fetch"]');   // dieselbe Adresse wie der Vorlader im Kopf, sonst lädt der Browser die Datei zweimal (14.10.2026)
  try { S.d = await (await fetch(vorgeladen ? vorgeladen.getAttribute('href') : 'livre.json', vorgeladen ? {} : { cache: 'no-store' })).json(); }
  catch (e) { $('#ansicht').innerHTML = `<p class="li-leer">livre.json fehlt.</p>`; window.__werkzeugBereit = true; if (window.werkzeugTuer) window.werkzeugTuer('Die Daten von Le Livre (livre.json) liessen sich nicht laden.'); return; }
  const h = location.hash.slice(1);
  try { S.ansicht = ['start', 'bilder', 'dateien', 'pruefung'].includes(h) ? h : ((/\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload')) ? (localStorage.removeItem('livre-ansicht'), 'start') : localStorage.getItem('livre-ansicht') || 'start'); }   /* Aus La Maison geöffnet: immer auf der Übersicht anfangen (Robert 16.10.2026), beim Neuladen bleibt die letzte Ansicht */ catch (e) { S.ansicht = 'start'; }
  kopf(); rand(); leiste(); zeichne();
  window.__werkzeugBereit = true;   /* R04: Startfehler-Tür nicht zeigen (17.10.2026) */
  addEventListener('hashchange', () => { const a = location.hash.slice(1); if (['start', 'bilder', 'dateien', 'pruefung'].includes(a) && a !== S.ansicht) gehe(a); });
  fetch('api/stand', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(() => { S.server = true; }).catch(() => { S.server = false; });
})();
