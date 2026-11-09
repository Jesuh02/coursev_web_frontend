import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/composables/useTheme.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1]

function environment({ stored, blocked = false } = {}) {
  const storage = new Map(stored === undefined ? [] : [['coursev-theme', stored]])
  const listeners = new Map()
  const meta = { content: '', setAttribute(key, value) { this[key] = value } }
  const statusBar = { content: '', setAttribute(key, value) { this[key] = value } }
  const root = { dataset: {}, style: {} }
  const context = vm.createContext({
    exports: {}, require,
    document: { documentElement: root, querySelector: (selector) => selector.includes('status-bar') ? statusBar : meta },
    window: {
      // An OS preference must never change the default requested by the user.
      matchMedia: () => ({ matches: true }),
      addEventListener: (type, callback) => listeners.set(type, callback),
    },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage denied'); return storage.get(key) ?? null },
      setItem(key, value) { if (blocked) throw new Error('Storage denied'); storage.set(key, value) },
    },
  })
  vm.runInContext(compiled, context)
  return { api: context.exports, context, root, meta, statusBar, storage, listeners }
}

test('every new session starts light, even with a dark OS preference', () => {
  const env = environment()
  env.api.initTheme()
  assert.equal(env.root.dataset.theme, 'light')
  assert.equal(env.root.style.colorScheme, 'light')
  assert.equal(env.meta.content, '#f7f8fc')
  assert.equal(env.statusBar.content, 'default')
  assert.equal(env.api.useTheme().isDark.value, false)
})

test('Profile and Learning share immediate changes and persist across reloads', () => {
  const env = environment()
  const profile = env.api.useTheme()
  const learning = env.api.useTheme()
  profile.setTheme('dark')
  assert.equal(learning.isDark.value, true)
  assert.equal(env.root.dataset.theme, 'dark')
  assert.equal(env.meta.content, '#000000')
  assert.equal(env.statusBar.content, 'black-translucent')
  const reload = environment({ stored: env.storage.get('coursev-theme') })
  reload.api.initTheme()
  assert.equal(reload.api.useTheme().theme.value, 'dark')
  learning.toggleTheme()
  assert.equal(profile.theme.value, 'light')
  assert.equal(env.storage.get('coursev-theme'), 'light')
})

test('selecting a theme is idempotent', () => {
  const env = environment()
  const theme = env.api.useTheme()
  theme.setTheme('dark')
  theme.setTheme('dark')
  assert.equal(theme.isDark.value, true)
  theme.setTheme('light')
  theme.setTheme('light')
  assert.equal(theme.isDark.value, false)
})

test('blocked browser storage never prevents startup or changing appearance', () => {
  const env = environment({ blocked: true })
  const theme = env.api.useTheme()
  assert.equal(theme.theme.value, 'light')
  assert.doesNotThrow(() => theme.setTheme('dark'))
  assert.equal(env.root.dataset.theme, 'dark')
  env.api.initTheme()
  assert.equal(theme.theme.value, 'dark')
})

test('changes in another tab and cleared preferences update the current view', () => {
  const env = environment()
  const theme = env.api.useTheme()
  env.storage.set('coursev-theme', 'dark')
  env.listeners.get('storage')({ key: 'coursev-theme' })
  assert.equal(theme.isDark.value, true)
  env.storage.clear()
  env.listeners.get('storage')({ key: null })
  assert.equal(theme.isDark.value, false)
})

test('unrelated storage events do not reset a selection', () => {
  const env = environment({ blocked: true })
  const theme = env.api.useTheme()
  theme.setTheme('dark')
  env.listeners.get('storage')({ key: 'auth-token' })
  assert.equal(theme.isDark.value, true)
})

test('head bootstrap and app startup agree, including invalid and denied storage', () => {
  for (const options of [{}, { stored: 'light' }, { stored: 'dark' }, { stored: 'invalid' }, { blocked: true }]) {
    const env = environment(options)
    vm.runInContext(bootstrap, env.context)
    const before = { theme: env.root.dataset.theme, scheme: env.root.style.colorScheme, color: env.meta.content, status: env.statusBar.content }
    env.api.initTheme()
    assert.deepEqual({ theme: env.root.dataset.theme, scheme: env.root.style.colorScheme, color: env.meta.content, status: env.statusBar.content }, before)
    assert.equal(before.theme, options.stored === 'dark' ? 'dark' : 'light')
  }
})
