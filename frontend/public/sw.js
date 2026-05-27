const CACHE = 'cleanit-v3';
const ASSETS = ['/', '/mobile'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data?.json() || {title:'CleanIT',body:'Nouvelle notification'};
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: data.data || {},
    actions: [
      {action:'open', title:'Ouvrir'},
      {action:'close', title:'Fermer'}
    ]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'open' || !e.action) {
    e.waitUntil(clients.openWindow('/mobile'));
  }
});
