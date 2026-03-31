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

// ── Push Notifications (FCM Web Push) ─────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return
    let payload = {}
    try { payload = event.data.json() } catch { payload = { title: event.data.text() } }

    const title = payload.notification?.title ?? payload.title ?? 'Nueva notificación'
    const body = payload.notification?.body ?? payload.body ?? ''
    const data = { ...(payload.data ?? {}), ...(payload.notification ?? {}) }
    const icon = data.thumbnailUrl || data.thumbnail_url || '/icon-192.png'

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            badge: '/icon-192.png',
            data,
            tag: data.notificationId ? `notif-${data.notificationId}` : undefined,
        })
    )
})

// ── Notification click → navigate ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const data = event.notification.data ?? {}
    const url = resolveNotificationUrl(data)

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.postMessage({ type: 'NAVIGATE', url })
                    return client.focus()
                }
            }
            if (clients.openWindow) return clients.openWindow(self.location.origin + url)
        })
    )
})

function resolveNotificationUrl(data) {
    const type = String(data.type ?? data.notifType ?? '')
    const meta = _parseMeta(data.metadata)
    const courseId = data.courseId ?? data.course_id ?? meta?.courseId ?? meta?.course_id
    const taskId = data.taskId ?? data.task_id ?? meta?.taskId ?? meta?.task_id
    const videoId = data.videoId ?? data.video_id ?? meta?.videoId ?? meta?.video_id
    const relatedId = data.relatedId ?? data.related_id

    switch (type) {
        case 'new_course':
        case 'enrollment_approved':
        case 'collaborator_added':
        case 'course_invitation':
            if (courseId) return `/subjects/${courseId}`
            if (relatedId) return `/subjects/${relatedId}`
            break
        case 'new_task':
        case 'task_submission':
        case 'task_graded':
            if (taskId) return `/task-submission/${taskId}`
            if (relatedId) return `/task-submission/${relatedId}`
            break
        case 'new_video':
            if (courseId) return `/subjects/${courseId}`
            if (videoId) return `/video/${videoId}`
            if (relatedId) return `/video/${relatedId}`
            break
        case 'video_like':
        case 'comment':
        case 'like':
        case 'video_comment':
        case 'comment_reply':
        case 'comment_like':
            if (videoId) return `/video/${videoId}`
            if (relatedId) return `/video?openComments=${relatedId}`
            return '/video'
        case 'enrollment_request':
            return '/admin?tab=enrollment&subtab=pre'
        case 'chat_response':
            return '/chatbot'
    }
    return '/'
}

function _parseMeta(metadata) {
    if (!metadata) return null
    if (typeof metadata === 'object') return metadata
    if (typeof metadata === 'string') {
        try {
            let s = metadata.trim()
            if (s.startsWith('"') && s.endsWith('"')) {
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
            }
            return s.startsWith('{') ? JSON.parse(s) : null
        } catch { return null }
    }
    return null
}