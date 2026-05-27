import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
