import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/fonts.css'
import './styles/global.css'
import './styles/apple-tokens.css'
import { restoreSelectedTenant } from '@/config/tenants'

// Restore the previously selected tenant server URL before any API calls
restoreSelectedTenant()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

if ('serviceWorker' in navigator) {
  // Auto-update: the SW caches hashed JS/CSS cache-first, so an installed PWA keeps
  // running the bundle it first cached. Without an update check, deployed fixes never
  // reach users who already have the app open/installed. Detect a new SW, and once it
  // has installed while a controller already exists (i.e. this is an UPDATE, not the
  // first install), reload once to swap in the fresh bundle.
  let reloadedForUpdate = false
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const promoteUpdate = (worker: ServiceWorker | null) => {
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (
            worker.state === 'installed' &&
            navigator.serviceWorker.controller &&
            !reloadedForUpdate
          ) {
            reloadedForUpdate = true
            window.location.reload()
          }
        })
      }
      // A new worker may already be waiting/installing when we register.
      promoteUpdate(reg.installing || reg.waiting)
      reg.addEventListener('updatefound', () => promoteUpdate(reg.installing))
      // Check for a new version now and hourly while the app stays open.
      reg.update().catch(() => {})
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
    } catch { /* SW registration failed — app still works without it */ }
  })
}
