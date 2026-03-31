const CACHE_NAME = 'coursev-v2'
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/descarga.png',
    '/icon-192.png',
    '/icon-512.png',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return
    // Solo interceptar requests http/https; ignorar chrome-extension://, etc.
    const url = new URL(event.request.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            // Solo cachear respuestas válidas (status 200 y tipo basic)
            if (response.ok && response.type === 'basic') {
                const clone = response.clone()
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            }
            return response
        })
        .catch(() => caches.match(event.request))
    )
})