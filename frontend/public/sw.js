const CACHE_NAME = 'cleanit-v5';
const API_CACHE = 'cleanit-api-v1';

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/', '/mobile', '/dashboard', '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

// Installation - cache les assets statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS).catch(()=>{}))
      .then(() => self.skipWaiting())
  );
});

// Activation - nettoyer anciens caches
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

// Stratégie fetch: Network First pour API, Cache First pour assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls -> Network First avec fallback cache
  if(url.hostname === 'backend-cleanit-erp.vercel.app') {
    if(e.request.method !== 'GET') return; // POST/PUT/DELETE: laisser passer
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if(resp.ok) {
            const clone = resp.clone();
            caches.open(API_CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets statiques -> Cache First
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(resp => {
        if(resp.ok && !url.pathname.startsWith('/api/')) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/'));
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  let data = { title:'CleanIT ERP', body:'Nouvelle notification', url:'/mobile' };
  try { data = e.data?.json() || data; } catch(err) {}
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

// Clic notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'close') return;
  const url = e.notification.data?.url || '/mobile';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(wins => {
      const win = wins.find(w => w.url.includes(url));
      if(win) return win.focus();
      return clients.openWindow(url);
    })
  );
});

// Background Sync - synchroniser les actions en attente
self.addEventListener('sync', e => {
  if(e.tag === 'sync-posts') {
    e.waitUntil(syncPendingPosts());
  }
});

async function syncPendingPosts() {
  // Synchroniser les posts créés hors ligne
  console.log('Background sync: posts en attente');
}
