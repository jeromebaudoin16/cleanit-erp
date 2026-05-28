const CACHE = 'cleanit-v4';
const ASSETS = ['/', '/mobile', '/dashboard'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
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

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────
self.addEventListener('push', e => {
  let data = { title:'CleanIT ERP', body:'Nouvelle notification', url:'/mobile', icon:'/icons/icon-192.png' };
  try { data = e.data?.json() || data; } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
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
