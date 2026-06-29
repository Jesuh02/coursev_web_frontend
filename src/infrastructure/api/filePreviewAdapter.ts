import { api } from './httpClient'

export interface FilePreviewRequest {
  fileUri: string
  fileName: string
  targetFormat: 'pdf'
}

export interface FilePreviewResponse {
  previewUrl: string
  status?: 'ready' | 'processing'
}

export const filePreviewAdapter = {
  getPdfPreview: (data: FilePreviewRequest) =>
    api.post<FilePreviewResponse>('/files/preview', data),
}
