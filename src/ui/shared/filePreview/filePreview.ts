import type { ContentItem, TaskSubmission, TaskSubmissionFile } from '@/domain/models'
import { buildProxyFileUrl, tokenStorage } from '@/infrastructure/api'

export type PreviewKind = 'pdf' | 'text' | 'image' | 'office' | 'spreadsheet' | 'video' | 'unsupported'
export type PreviewSource = 'content-item' | 'submission' | 'submission-file' | 'raw'

export interface PreviewFile {
  id: string
  name: string
  url: string
  originalUri: string
  extension: string
  kind: PreviewKind
  source: PreviewSource
  original: unknown
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv', 'json', 'log'])
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'ppt', 'pptx', 'xls'])
const SPREADSHEET_EXTENSIONS = new Set(['xlsx'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv'])

export function resolvePreviewFileUrl(uri: string | null | undefined): string {
  if (!uri || uri.startsWith('file:///')) return ''
  if (/^https?:\/\//i.test(uri)) return uri
  return buildProxyFileUrl(uri)
}

function extensionFrom(name: string, url: string): string {
  const cleanName = name.split('?')[0].split('#')[0]
  const cleanUrl = url.split('?')[0].split('#')[0]
  const source = cleanName.includes('.') ? cleanName : cleanUrl
  const match = source.match(/\.([a-z0-9]+)$/i)
  return match?.[1]?.toLowerCase() ?? ''
}

function kindFrom(extension: string, contentType?: string | null): PreviewKind {
  if (contentType === 'image' || IMAGE_EXTENSIONS.has(extension)) return 'image'
  if (contentType === 'video' || VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (extension === 'pdf') return 'pdf'
  if (TEXT_EXTENSIONS.has(extension)) return 'text'
  if (SPREADSHEET_EXTENSIONS.has(extension)) return 'spreadsheet'
  if (OFFICE_EXTENSIONS.has(extension)) return 'office'
  return 'unsupported'
}

export function previewFileFromContentItem(item: ContentItem): PreviewFile | null {
  const name = item.fileName || item.content || `archivo-${item.id}`
  const originalUri = item.fileUri || item.content || ''
  const url = resolvePreviewFileUrl(originalUri)
  if (!url) return null
  const extension = extensionFrom(name, url)
  return {
    id: `content-item-${item.id}`,
    name,
    url,
    originalUri,
    extension,
    kind: kindFrom(extension, item.contentType),
    source: 'content-item',
    original: item,
  }
}

export function previewFileFromSubmission(submission: TaskSubmission): PreviewFile | null {
  const name = submission.file_name || `entrega-${submission.id}`
  const originalUri = submission.file_uri || ''
  const url = resolvePreviewFileUrl(originalUri)
  if (!url) return null
  const extension = extensionFrom(name, url)
  return {
    id: `submission-${submission.id}`,
    name,
    url,
    originalUri,
    extension,
    kind: kindFrom(extension),
    source: 'submission',
    original: submission,
  }
}

export function previewFileFromSubmissionFile(file: TaskSubmissionFile, index: number, ownerId: string | number): PreviewFile | null {
  const name = file.fileName || `archivo-${index + 1}`
  const originalUri = file.fileUri || ''
  const url = resolvePreviewFileUrl(originalUri)
  if (!url) return null
  const extension = extensionFrom(name, url)
  return {
    id: `submission-file-${ownerId}-${index}`,
    name,
    url,
    originalUri,
    extension,
    kind: kindFrom(extension),
    source: 'submission-file',
    original: file,
  }
}

export async function fetchPreviewBlob(file: PreviewFile, options: { auth?: boolean } = {}): Promise<Blob> {
  const useAuth = options.auth ?? true
  const headers: Record<string, string> = {}
  const token = tokenStorage.token
  const selectedTenantId = localStorage.getItem('selected_tenant_id')
  if (useAuth && token) headers.Authorization = `Bearer ${token}`
  if (useAuth && selectedTenantId) headers['X-Tenant-ID'] = selectedTenantId

  const response = await fetch(file.url, {
    credentials: useAuth ? 'include' : 'omit',
    cache: 'no-store',
    headers,
  })
  if (!response.ok) throw new Error(`No se pudo cargar el archivo (${response.status})`)
  return response.blob()
}

export async function downloadPreviewFile(file: PreviewFile): Promise<void> {
  const blob = await fetchPreviewBlob(file)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = file.name || 'archivo'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
