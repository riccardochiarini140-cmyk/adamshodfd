/* FILE: sw.js
   VERSIONE: 1.1.0 (Incrementa questo numero ogni volta che modifichi il sito)
*/

const CACHE_NAME = 'global-finds-cache-v10';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/site.webmanifest.json'
];

// 1. INSTALLAZIONE: Scarica i file essenziali
self.addEventListener('install', event => {
    console.log('SW: Installazione nuova versione...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Forza il Service Worker a diventare attivo immediatamente
    self.skipWaiting();
});

// 2. ATTIVAZIONE: Pulizia automatica delle vecchie cache
self.addEventListener('activate', event => {
    console.log('SW: Attivazione e pulizia vecchie cache...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prende il controllo immediato delle pagine
    );
});

// 3. GESTIONE RICHIESTE (FETCH): Strategia Network-First
self.addEventListener('fetch', event => {
    // Escludiamo il video dalla cache per evitare blocchi o errori di memoria
    if (event.request.url.includes('videoapp.mp4')) {
        return; 
    }

    event.respondWith(
        // Prova a prendere il contenuto aggiornato dal server
        fetch(event.request, { cache: 'no-store' }) 
            .then(networkResponse => {
                // Se la rete risponde (siamo online), aggiorna la cache e restituisci il file
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Se la rete fallisce (siamo offline), prova a restituire il file dalla cache
                return caches.match(event.request);
            })
    );
});