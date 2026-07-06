const CACHE_NAME = 'cleanit-v7';
const API_CACHE = 'cleanit-api-v1';

const STATIC_ASSETS = [
  '/', '/mobile', '/dashboard', '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png', '/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME && k !== API_CACHE)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Laisser passer : blob:, data:, chrome-extension:, non-HTTP
  if (!url.protocol.startsWith('http')) return;

  // Laisser passer les requêtes non-GET (POST upload photo, PUT, DELETE)
  if (e.request.method !== 'GET') return;

  // API backend → Network First avec fallback cache (GET uniquement)
  if (url.hostname.includes('backend-cleanit-erp.vercel.app') ||
      url.hostname.includes('backend-one-kappa-96.vercel.app')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if (resp.ok) {
            caches.open(API_CACHE).then(c => c.put(e.request, resp.clone()));
          }
          return resp;
        })
        .catch(() => caches.match(e.request).then(cached => cached || new Response('{"offline":true}', {
          status: 503,
          headers: {'Content-Type': 'application/json'}
        })))
    );
    return;
  }

  // Assets statiques → Network First avec fallback intelligent
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;

        // Pour les images manquantes → 404 propre (pas de substitution HTML)
        const dest = e.request.destination;
        if (dest === 'image' || dest === 'font') {
          return new Response('', { status: 404, statusText: 'Not Found' });
        }

        // Pour les scripts/styles → 404 propre
        if (dest === 'script' || dest === 'style') {
          return new Response('', { status: 404, statusText: 'Not Found' });
        }

        // Pour les navigations (pages HTML) → page principale en cache
        if (dest === 'document' || e.request.mode === 'navigate') {
          return caches.match('/') || new Response('Offline', { status: 503 });
        }

        return new Response('', { status: 404 });
      })
  );
});

self.addEventListener('push', e => {
  let data = { title: 'CleanIT ERP', body: 'Nouvelle notification', url: '/mobile' };
  try { data = e.data?.json() || data; } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/mobile' },
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'close', title: 'Fermer' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'close') return;
  const url = e.notification.data?.url || '/mobile';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      const win = wins.find(w => w.url.includes(url));
      if (win) return win.focus();
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('sync', e => {
  if (e.tag === 'sync-posts') {
    e.waitUntil(Promise.resolve());
  }
});
