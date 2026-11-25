import { chromium } from 'playwright'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1600, height: 820 } })
page.on('console', (m) => console.log('[page]', m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 })
// Dar tiempo al render de Vue/animaciones
await page.waitForTimeout(2500)
await page.screenshot({ path: 'scripts/login-shot.png' })
console.log('shot ok, url =', page.url())
await browser.close()
