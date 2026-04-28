import { useBillingStore } from '@/stores/billingStore'

// Local copy of the logo (served from the same origin under /incat.jpg).
// Using a same-origin URL avoids issues where remote images fail to load inside
// `window.open('', '_blank')` documents (about:blank) due to referrer/CSP/CORS
// policies in some browsers.
const INCAT_LOGO_LOCAL_URL = '/incat.jpg'
const INCAT_LOGO_REMOTE_URL = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/incat.jpg'
const INCAT_LOGO_URL = INCAT_LOGO_LOCAL_URL
const INCAT_INSTITUTION_NAME = 'Politécnico Institucional del Caribe Incat'

const INCAT_FOOTER_SLOGAN = 'Politécnico "INCAT", forjando líderes para triunfar!'
const INCAT_FOOTER_ADDRESS = 'SEDE PRINCIPAL CALLE 11ª # 11-85  TEL. 3106357993-3156824740'
const INCAT_FOOTER_EMAIL = 'E-mail: politecnicoincat@gmail.com'
const INCAT_FOOTER_CITY = 'RIOHACHA- LA GUAJIRA'

const INCAT_SIGNATURE_NAME = 'AQUILES AMAYA IGUARAN'
const INCAT_SIGNATURE_TITLE = 'RECTOR'

const INCAT_HEADER_LINES = [
  'POLITECNICO INSTITUCIONAL DEL CARIBE "INCAT"',
  'Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M',
  'Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.',
  'Institución Educativa De Formación para el trabajo y el desarrollo humano',
  'NIT: 900391687-0',
]

export function isIncatInstitution(): boolean {
  const billingStore = useBillingStore()
  const name = (billingStore.institutionName || '').toLowerCase()
  return name.includes('incat') || name.includes('politecnico institucional del caribe') || name.includes('politécnico institucional del caribe')
}

// ── Logo cache: convert remote logo to base64 data URL so it appears reliably
// inside printable windows (window.open + print) where the remote image often
// does not finish loading before window.print() is invoked.
let cachedLogoDataUrl: string | null = null
let cachedLogoPromise: Promise<string | null> | null = null

async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  // Try fetch first (works if CORS allows it — R2 public buckets typically do)
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' })
    if (res.ok) {
      const blob = await res.blob()
      return await new Promise<string>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => resolve(fr.result as string)
        fr.onerror = () => reject(fr.error)
        fr.readAsDataURL(blob)
      })
    }
  } catch { /* fall through to <img>+canvas */ }

  // Fallback: load via Image + canvas (requires CORS header on the server)
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(null); return }
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/jpeg', 0.92))
        } catch { resolve(null) }
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  } catch { return null }
}

/**
 * Preload the institution logo and cache it as a base64 data URL so subsequent
 * calls to buildInstitutionHeaderHTML() embed the image inline. Should be
 * awaited before generating any printable HTML for INCAT users.
 */
export async function ensureInstitutionLogoDataUrl(): Promise<string | null> {
  if (!isIncatInstitution()) return null
  if (cachedLogoDataUrl) return cachedLogoDataUrl
  if (cachedLogoPromise) return cachedLogoPromise
  // Try local first (same-origin, always works), fall back to remote URL.
  cachedLogoPromise = (async () => {
    let dataUrl = await fetchLogoAsDataUrl(INCAT_LOGO_LOCAL_URL)
    if (!dataUrl) dataUrl = await fetchLogoAsDataUrl(INCAT_LOGO_REMOTE_URL)
    cachedLogoDataUrl = dataUrl
    return dataUrl
  })()
  return cachedLogoPromise
}

/** Returns the inlined data URL if cached, otherwise the remote URL. */
function resolveLogoSrc(): string {
  return cachedLogoDataUrl || INCAT_LOGO_URL
}

/**
 * Returns HTML string for the institution header to use in printable reports.
 * If the user does not belong to INCAT, returns a generic header.
 */
export function buildInstitutionHeaderHTML(fallbackName?: string): string {
  if (isIncatInstitution()) {
    const logoSrc = resolveLogoSrc()
    return `<div class="inst-header" style="display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:20px;border-bottom:2px solid #8B0000;padding-bottom:16px">
  <img src="${logoSrc}" alt="Escudo INCAT" style="width:80px;height:auto;object-fit:contain" crossorigin="anonymous" />
  <div style="text-align:center;flex:1">
    <div style="font-size:16px;font-weight:800;color:#8B0000;text-transform:uppercase;letter-spacing:1px">${INCAT_HEADER_LINES[0]}</div>
    <div style="font-size:10px;color:#333;margin-top:3px">${INCAT_HEADER_LINES[1]}</div>
    <div style="font-size:10px;color:#333">${INCAT_HEADER_LINES[2]}</div>
    <div style="font-size:11px;color:#333;margin-top:4px;font-weight:600">${INCAT_HEADER_LINES[3]}</div>
    <div style="font-size:12px;color:#8B0000;font-weight:700;margin-top:2px">${INCAT_HEADER_LINES[4]}</div>
  </div>
</div>`
  }

  const name = fallbackName || 'CourseV'
  return `<div class="header" style="text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px">
  <span class="inst-name" style="font-size:20px;font-weight:700;color:#6A1B9A;display:block">${name}</span>
  <span class="inst-sub" style="font-size:12px;color:#666;display:block;margin-top:2px">Plataforma Educativa</span>
</div>`
}

/**
 * Returns the institution display name for in-app preview (template).
 */
export function getInstitutionDisplayName(): string {
  if (isIncatInstitution()) return INCAT_INSTITUTION_NAME
  const billingStore = useBillingStore()
  return billingStore.institutionName || 'CourseV'
}

/**
 * Returns logo URL if INCAT user, otherwise null.
 * Returns the cached data URL when available so it can be inlined in print HTML.
 */
export function getInstitutionLogoUrl(): string | null {
  return isIncatInstitution() ? resolveLogoSrc() : null
}

/**
 * CSS styles to include in printable HTML for the institution header.
 */
export function institutionHeaderCSS(): string {
  return `.inst-header{display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:20px;border-bottom:2px solid #8B0000;padding-bottom:16px}
.inst-header img{width:80px;height:auto;object-fit:contain}`
}

/**
 * Returns HTML for the INCAT signature block + page footer.
 * Only rendered for INCAT institutions; returns '' otherwise.
 */
export function buildInstitutionSignatureAndFooterHTML(): string {
  if (!isIncatInstitution()) return ''
  return `<div class="signature-area">
  <div class="signature-block">
    <div class="signature-line"></div>
    <p class="signature-name">${INCAT_SIGNATURE_NAME}</p>
    <p class="signature-title">${INCAT_SIGNATURE_TITLE}</p>
  </div>
</div>
<div class="inst-page-footer">
  <p class="inst-footer-slogan"><em>${INCAT_FOOTER_SLOGAN}</em></p>
  <p class="inst-footer-address">${INCAT_FOOTER_ADDRESS}</p>
  <p class="inst-footer-email">${INCAT_FOOTER_EMAIL}</p>
  <p class="inst-footer-city">${INCAT_FOOTER_CITY}</p>
</div>`
}

/**
 * CSS styles for the signature block and page footer.
 */
export function institutionSignatureAndFooterCSS(): string {
  return `.signature-area{margin-top:48px;display:flex;justify-content:flex-start;padding-left:20px}
.signature-block{text-align:center;min-width:200px}
.signature-line{border-top:1px solid #333;margin-bottom:6px;width:100%}
.signature-name{font-size:12px;font-weight:700;text-transform:uppercase;color:#222;margin:0}
.signature-title{font-size:11px;color:#555;margin:2px 0 0}
.inst-page-footer{margin-top:24px;border-top:2px solid #8B0000;padding-top:10px;text-align:center}
.inst-footer-slogan{font-size:12px;font-style:italic;color:#8B0000;margin:0 0 4px}
.inst-footer-address{font-size:11px;font-weight:700;color:#222;margin:2px 0}
.inst-footer-email{font-size:11px;color:#8B0000;margin:2px 0}
.inst-footer-city{font-size:11px;font-weight:700;color:#222;margin:0}
@media print{.inst-page-footer{position:fixed;bottom:0;left:0;right:0;padding:10px 20px;border-top:2px solid #8B0000;background:#fff}body{padding-bottom:80px}}`
}

/**
 * Returns an array of INCAT footer lines for Excel/SpreadsheetML exports.
 * Returns empty array for non-INCAT institutions.
 */
export function getInstitutionFooterLines(): string[] {
  if (!isIncatInstitution()) return []
  return [
    '',
    `${INCAT_SIGNATURE_NAME} — ${INCAT_SIGNATURE_TITLE}`,
    '',
    INCAT_FOOTER_SLOGAN,
    INCAT_FOOTER_ADDRESS,
    INCAT_FOOTER_EMAIL,
    INCAT_FOOTER_CITY,
  ]
}
