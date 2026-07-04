var CACHE_NAME = 'gerencion-estoque-v3';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Supabase — sempre rede
  if (e.request.url.includes('supabase.co')) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('{"error":"offline"}', {headers:{'Content-Type':'application/json'}});
    }));
    return;
  }

  // index.html e assets — sempre busca rede primeiro, sem cache
  e.respondWith(
    fetch(e.request).catch(function() {
      // Só usa cache se estiver offline
      return caches.match(e.request);
    })
  );
});
