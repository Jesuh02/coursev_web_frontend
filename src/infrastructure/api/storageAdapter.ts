import type { StoragePort } from '@/domain/ports'
import { api, tokenStorage, getApiV1 } from './httpClient'

type StoragePrefix = 'videos' | 'thumbnails' | 'content' | 'submissions' | 'courses' | 'images'


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
 * Si el PUT directo a R2 falla (CORS en móviles), sube vía backend como fallback.
 */
export async function uploadFileDirect(
  file: File,
  prefix: StoragePrefix,
  onProgress?: (pct: number) => void,
): Promise<{ key: string; publicUrl: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${Date.now()}_${safeName}`
  const contentType = file.type || 'application/octet-stream'

  // 1. Obtener URL pre-firmada del backend
  let uploadUrl: string
  let fullKey: string
  let publicUrl: string
  try {
    const resp = await api.post<{ uploadUrl: string; key: string; publicUrl: string }>(
      '/storage/upload-url',
      { key, contentType, prefix },
    )
    uploadUrl = resp.uploadUrl
    fullKey = resp.key
    publicUrl = resp.publicUrl
  } catch {
    // Si ni siquiera podemos obtener la URL pre-firmada, subimos directo por backend
    return uploadViaBackend(file, prefix, onProgress)
  }

  // 2. PUT directo a R2 con progreso (XHR)
  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.timeout = 120_000
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
      xhr.onerror = () => reject(new Error('XHR network error'))
      xhr.ontimeout = () => reject(new Error('XHR timeout'))
      xhr.send(file)
    })
    return { key: fullKey, publicUrl }
  } catch {
    // XHR falló (probablemente CORS en móvil) — intentar con fetch
  }

  // 3. Fallback: fetch PUT directo a R2
  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })
    if (res.ok) {
      onProgress?.(100)
      return { key: fullKey, publicUrl }
    }
  } catch {
    // fetch también falló — subir a través del backend
  }

  // 4. Último recurso: subir vía backend (evita CORS de R2 por completo)
  return uploadViaBackend(file, prefix, onProgress)
}

/**
 * Sube un archivo a través del backend (POST multipart) usando XHR.
 * Más lento pero funciona siempre, sin depender de CORS de R2.
 * Usa XMLHttpRequest en vez de fetch para máxima compatibilidad en móviles.
 */
async function uploadViaBackend(
  file: File,
  prefix: StoragePrefix,
  onProgress?: (pct: number) => void,
): Promise<{ key: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('prefix', prefix)

  return new Promise<{ key: string; publicUrl: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.timeout = 180_000 // 3 min para archivos grandes en redes móviles lentas
    xhr.open('POST', `${getApiV1()}/storage/upload`)

    // Headers de autenticación
    if (tokenStorage.token) xhr.setRequestHeader('Authorization', `Bearer ${tokenStorage.token}`)
    const tenantId = localStorage.getItem('selected_tenant_id')
    if (tenantId) xhr.setRequestHeader('X-Tenant-ID', tenantId)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
    }

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && json.success !== false) {
          onProgress?.(100)
          const data = json.data ?? json
          resolve({ key: data.key, publicUrl: data.publicUrl })
        } else {
          reject(new Error(json?.error?.message ?? `Upload failed: ${xhr.status}`))
        }
      } catch {
        reject(new Error(`Invalid response: ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Error de red al subir archivo al servidor'))
    xhr.ontimeout = () => reject(new Error('Timeout al subir archivo al servidor'))
    xhr.send(formData)
  })
}
