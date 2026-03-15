import type { PaymentPort } from '@/domain/ports'
import { api } from './httpClient'

export const paymentAdapter: PaymentPort = {
  initiatePayment: (data) => api.post('/payment/initiate', data),
  getPaymentStatus: (transactionId) => api.get(`/payment/status/${transactionId}`),
  getMyTransactions: () => api.get('/payment/my'),
  hasPurchasedCourse: (courseId) => api.get<boolean>(`/payment/purchased/${courseId}`),
}
