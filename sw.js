const cacheName = 'birthday-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// Instalar service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          // Se os arquivos não existirem, apenas continue
          console.log('Alguns arquivos não puderam ser cacheados');
        });
      })
  );
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== 'birthday-app-v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar do cache se encontrar
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Não cache respostas que não são válidas
          if (!response || response.status !== 200 || response.type === 'basic') {
            return response;
          }
          
          // Guardar no cache
          const responseToCache = response.clone();
          caches.open(cacheName)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Retornar um fallback se offline
          return caches.match('./index.html');
        });
      })
  );
});
