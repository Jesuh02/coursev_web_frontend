// Captura un fotograma de la escena 3D de Spline original y lo guarda como
// src/assets/hero.png, para usarlo como fondo estático del login (sin WebGL en vivo).
//
// Requiere Playwright (no está en las dependencias del proyecto para no inflarlo):
//   npm i -D playwright     (usa el Chrome del sistema vía channel: 'chrome')
//
// Uso:  node scripts/capture-spline-hero.mjs
//
// Nota: la marca de agua "Built with Spline" se dibuja DENTRO del canvas WebGL,
// así que tras capturar hay que taparla (esquina inferior derecha) — ver README/commit.
//
// Levanta un servidor estático temporal sobre public/, abre public/spline-capture.html
// en Chrome (vía Playwright), espera a que la escena cargue y se estabilice, y toma
// un screenshot del canvas WebGL.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const OUT_PATH = join(ROOT, 'src', 'assets', 'hero.png')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
        const safePath = urlPath.replace(/\.\.(\/|\\)/g, '')
        const filePath = join(PUBLIC_DIR, safePath === '/' ? 'index.html' : safePath)
        const data = await readFile(filePath)
        res.writeHead(200, {
          'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end('not found')
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

const VIEWPORT = { width: 1600, height: 1200 }

async function main() {
  const server = await startServer()
  const { port } = server.address()
  const url = `http://127.0.0.1:${port}/spline-capture.html`
  console.log('Servidor temporal en', url)

  const browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 })

  page.on('console', (msg) => console.log('  [page]', msg.text()))

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

  console.log('Esperando a que la escena de Spline cargue…')
  await page.waitForFunction(
    () => window.__splineReady === true || window.__splineError !== null,
    { timeout: 60000 },
  )

  const err = await page.evaluate(() => window.__splineError)
  if (err) {
    console.error('✗ Error cargando la escena de Spline:', err)
    await browser.close()
    server.close()
    process.exit(1)
  }

  // Dar tiempo a que la animación de entrada se asiente en una pose agradable.
  console.log('Escena lista. Estabilizando render…')
  await page.waitForTimeout(3500)

  // Ocultar cualquier marca de agua "Built with Spline" que el runtime inyecte en el DOM.
  const hidden = await page.evaluate(() => {
    const kill = []
    document.querySelectorAll('a, div').forEach((el) => {
      const t = (el.textContent || '').toLowerCase()
      const href = (el.getAttribute && el.getAttribute('href')) || ''
      if (t.includes('spline') || href.includes('spline.design')) {
        el.style.setProperty('display', 'none', 'important')
        el.style.setProperty('visibility', 'hidden', 'important')
        kill.push(t.slice(0, 40) || href)
      }
    })
    return kill
  })
  console.log('Elementos de marca de agua ocultados:', hidden.length ? hidden : '(ninguno en DOM)')
  await page.waitForTimeout(300)

  const canvas = page.locator('#canvas')
  await canvas.screenshot({ path: OUT_PATH })
  console.log('✓ Imagen guardada en', OUT_PATH)

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
