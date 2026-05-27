/**
 * useTheme — lightweight singleton for the Learning section's dark/light toggle.
 * Reads the stored preference from localStorage, falls back to the OS preference,
 * and syncs to `document.documentElement`'s `data-theme` attribute so that the
 * CSS custom-property overrides in apple-tokens.css take effect everywhere.
 */
import { ref } from 'vue'

const STORAGE_KEY = 'apple-learning-theme'
const isDark = ref(false)
let initialized = false

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function init() {
  if (initialized) return
  initialized = true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') {
    isDark.value = true
  } else if (stored === 'light') {
    isDark.value = false
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  applyTheme()
}

export function useTheme() {
  init()
  return { isDark, toggleTheme }
}
