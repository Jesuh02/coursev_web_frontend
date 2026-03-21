import { api } from './httpClient'

export interface WhatsAppStatus {
  isLinked: boolean
  phoneNumber?: string | null
  otpPending?: boolean
  channelAvailable?: boolean
  provider?: {
    name?: string
    provider?: string
    phoneNumber?: string
    phone?: string
    connected?: boolean
  } | null
}

export const whatsappAdapter = {
  getStatus: () => api.get<WhatsAppStatus>('/whatsapp/status'),
  link: (phoneNumber: string) =>
    api.post<{ providerResponse?: unknown }>('/whatsapp/link', { phoneNumber }),
  verify: (code: string) =>
    api.post<{ canUseMCP?: boolean }>('/whatsapp/verify', { code }),
  unlink: () => api.post<unknown>('/whatsapp/unlink', null),
}
