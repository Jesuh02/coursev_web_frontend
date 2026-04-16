import { useBillingStore } from '@/stores/billingStore'

const INCAT_LOGO_URL = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/incat.jpg'
const INCAT_INSTITUTION_NAME = 'Politécnico Institucional del Caribe Incat'

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

/**
 * Returns HTML string for the institution header to use in printable reports.
 * If the user does not belong to INCAT, returns a generic header.
 */
export function buildInstitutionHeaderHTML(fallbackName?: string): string {
  if (isIncatInstitution()) {
    return `<div class="inst-header" style="display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:20px;border-bottom:2px solid #8B0000;padding-bottom:16px">
  <img src="${INCAT_LOGO_URL}" alt="Escudo INCAT" style="width:80px;height:auto;object-fit:contain" crossorigin="anonymous" />
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
 */
export function getInstitutionLogoUrl(): string | null {
  return isIncatInstitution() ? INCAT_LOGO_URL : null
}

/**
 * CSS styles to include in printable HTML for the institution header.
 */
export function institutionHeaderCSS(): string {
  return `.inst-header{display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:20px;border-bottom:2px solid #8B0000;padding-bottom:16px}
.inst-header img{width:80px;height:auto;object-fit:contain}`
}
