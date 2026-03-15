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
