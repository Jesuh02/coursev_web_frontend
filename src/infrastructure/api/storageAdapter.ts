import type { StoragePort } from '@/domain/ports'
import { api } from './httpClient'

export const storageAdapter: StoragePort = {
  getUploadUrl: (fileName, contentType, folder) => {
    const body: Record<string, unknown> = { fileName, contentType }
    if (folder) body.folder = folder
    return api.post('/storage/upload-url', body)
  },
  getDownloadUrl: (key) => api.get(`/storage/download?key=${encodeURIComponent(key)}`),
  uploadFile: (formData) => api.upload('/storage/upload', formData),
  deleteFile: (key) => api.delete(`/storage?key=${encodeURIComponent(key)}`),
}

/**
 * Sube un archivo directamente a R2 vía URL pre-firmada, sin pasar por el servidor.
 * Esto elimina el doble salto (browser → backend → R2) y reduce el tiempo a la mitad.
 */
export async function uploadFileDirect(
  file: File,
  prefix: 'videos' | 'content' | 'submissions' | 'courses',
  onProgress?: (pct: number) => void,
): Promise<{ key: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${Date.now()}_${safeName}`
  const contentType = file.type || 'application/octet-stream'

  // 1. Obtener URL pre-firmada del backend
  const { uploadUrl, key: fullKey } = await api.post<{ uploadUrl: string; key: string; publicUrl: string }>(
    '/storage/upload-url',
    { key, contentType, prefix },
  )

  // 2. PUT directo a R2 con reporte de progreso
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed: ${xhr.status}`))
    xhr.onerror = () => reject(new Error('Upload network error'))
    xhr.send(file)
  })

  return { key: fullKey }
}
