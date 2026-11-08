// Die Weiche der Website (Vercel Routing Middleware, Tasty Studios 12.10.2026). Liegt online im Wurzelverzeichnis, werkzeuge_online.py setzt die Kennung ein.
// Was das Haus online veröffentlicht hat (Le Bureau: Seiten, La Carte: PDF und Stand, hochgeladene Fotos), liegt im öffentlichen Blob unter
// live/<kennung>/…; die Karte live/<kennung>/_karte.json sagt, welche Wege von dort kommen. Für alle anderen Wege läuft die Anfrage wie gewohnt
// zur ausgelieferten Datei. Die Karte wird je Instanz 20 Sekunden gemerkt (eine Blob-Abfrage, nicht eine je Besucher).
// Neue Auslieferung = neue Kennung = leere Karte: die Website zeigt wieder den gebauten Stand, bis das Haus einmal neu veröffentlicht.
import { next } from '@vercel/functions';

const KENNUNG = '53d2456e7d36';
const STORE = (process.env.BLOB_PUBLIC_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3] || '';   // öffentlicher Speicher, falls getrennt
const PRIVAT_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';   // 15.10.2026: die Karte wird aus dem privaten Speicher gelesen (?cache=0, ohne Zwischenspeicher);
const PRIVAT_STORE = PRIVAT_TOKEN.split('_')[3] || '';          // die öffentliche Kopie liefert nach einem Schreiben bis 60 s die alte Fassung
const LOKAL = process.env.BLOB_LOKAL || '';
const MERKEN_MS = 5000;   // 15.10.2026: 20 s waren zu lang, direkt nach «Veröffentlichen» oder einem hochgeladenen Foto kam noch die alte Fassung; eine Blob-Abfrage je 5 s je Instanz
let gemerkt = { zeit: 0, seiten: {} };

export const config = {
  matcher: ['/', '/:seite([a-z0-9-]+\\.html)', '/:sp(en|fr|zh|ko|ar)', '/:sp(en|fr|zh|ko|ar)/', '/:sp(en|fr|zh|ko|ar)/:seite([a-z0-9-]+\\.html)',
    '/unterlagen/pdf/:z.pdf', '/_karten/stand/:z.json', '/assets/img/:datei(u-[^/]+)'],
};

// In der Probe (vercel dev, BLOB_LOKAL) liegt der «Blob» als Ordner blob/ im Projekt und wird als statische Datei unter /blob/… ausgeliefert.
async function karte(origin) {
  if (Date.now() - gemerkt.zeit < MERKEN_MS) return gemerkt.seiten;
  let seiten = {};
  try {
    const adresse = (LOKAL && !STORE) ? `${origin}/blob/public/live/${KENNUNG}/_karte.json` : (STORE ? `https://${STORE}.public.blob.vercel-storage.com/live/${KENNUNG}/_karte.json` : '');
    if (PRIVAT_TOKEN && PRIVAT_STORE && !LOKAL) {
      const r = await fetch(`https://${PRIVAT_STORE}.private.blob.vercel-storage.com/karte/${KENNUNG}.json?cache=0`, { cache: 'no-store', headers: { authorization: 'Bearer ' + PRIVAT_TOKEN, 'x-api-version': '12', 'x-vercel-blob-store-id': PRIVAT_STORE } });
      if (r.ok) seiten = (await r.json()).seiten || {};
      else if (r.status !== 404) throw new Error('privat ' + r.status);
    } else if (adresse) {
      const r = await fetch(adresse, { cache: 'no-store' });
      if (r.ok) seiten = (await r.json()).seiten || {};
    }
  } catch (e) { seiten = gemerkt.seiten; }
  gemerkt = { zeit: Date.now(), seiten };
  return seiten;
}

export default async function weiche(request) {
  const url = new URL(request.url);
  let p = url.pathname;
  if (p === '/' || /^\/(en|fr|zh|ko|ar)\/?$/.test(p)) p = p.replace(/\/?$/, '/index.html');
  let seiten = await karte(url.origin);
  let ziel = seiten[p];
  if (!ziel && /^\/assets\/img\/u-/.test(p)) { gemerkt.zeit = 0; seiten = await karte(url.origin); ziel = seiten[p]; }   // frisch hochgeladenes Foto: Karte sofort neu lesen statt 404 (15.10.2026)
  if (!ziel) return next();
  try {
    const r = await fetch(ziel.startsWith('/') ? url.origin + ziel : ziel, { cache: 'no-store' });
    if (!r.ok) return next();
    return new Response(r.body, { status: 200, headers: { 'content-type': r.headers.get('content-type') || 'application/octet-stream',
      'cache-control': 'public, max-age=0, must-revalidate', 'x-robots-tag': 'noindex, nofollow', 'x-gbr-quelle': 'speicher' } });
  } catch (e) { return next(); }
}
