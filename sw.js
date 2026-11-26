/* sw.js — cache-first Service Worker for offline use.
 * Bump CACHE_NAME whenever any cached file is added, renamed or changed so installed PWAs update.
 * All URLs are relative: the site is served from /tarot-trainer-pwa/ on GitHub Pages.
 */
const CACHE_NAME = 'tarot-training-v75';

const CARD_IMAGES = ["maj00", "maj01", "maj02", "maj03", "maj04", "maj05", "maj06", "maj07", "maj08", "maj09", "maj10", "maj11", "maj12", "maj13", "maj14", "maj15", "maj16", "maj17", "maj18", "maj19", "maj20", "maj21", "wands01", "wands02", "wands03", "wands04", "wands05", "wands06", "wands07", "wands08", "wands09", "wands10", "wands11", "wands12", "wands13", "wands14", "cups01", "cups02", "cups03", "cups04", "cups05", "cups06", "cups07", "cups08", "cups09", "cups10", "cups11", "cups12", "cups13", "cups14", "swords01", "swords02", "swords03", "swords04", "swords05", "swords06", "swords07", "swords08", "swords09", "swords10", "swords11", "swords12", "swords13", "swords14", "pentacles01", "pentacles02", "pentacles03", "pentacles04", "pentacles05", "pentacles06", "pentacles07", "pentacles08", "pentacles09", "pentacles10", "pentacles11", "pentacles12", "pentacles13", "pentacles14"].map((id) => 'img/cards/' + id + '.webp');

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'bigshot.woff2',
  'wordmark.png',
  'caprasimo.woff2',
    'img/stars.jpg',
  'app.js',
  'engine.js',
  'i18n.js',
  'manifest.json',
  'data/cards.js',
  'data/cards.ja.js',
  'data/spreads.js',
  'icons/menu-guide.webp',
  'icons/menu-quiz.webp',
  'icons/menu-spread.webp',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
].concat(CARD_IMAGES);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});
