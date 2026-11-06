import { computed, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'coursev-theme'
const theme = ref<Theme>('light')
const isDark = computed(() => theme.value === 'dark')
let initialized = false

function readPreference(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function applyTheme(value: Theme) {
  theme.value = value
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content', value === 'dark' ? '#000000' : '#f7f8fc',
  )
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute(
    'content', value === 'dark' ? 'black-translucent' : 'default',
  )
}

/** Initialize before mounting, including direct visits to any route. */
export function initTheme() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  applyTheme(readPreference())
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) applyTheme(readPreference())
  })
}

function setTheme(value: Theme) {
  applyTheme(value)
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Still apply the selection for this session if storage is unavailable.
  }
}

function toggleTheme() {
  setTheme(isDark.value ? 'light' : 'dark')
}

/** One preference shared by Profile, Learning, and every other interface. */
export function useTheme() {
  initTheme()
  return { theme: readonly(theme), isDark, setTheme, toggleTheme }
}
