import { env } from './env'
import { apiClient } from './apiClient'
import type { DeviceType, PaymentMethod, Transaction } from '../types/transactions'
import {
  mockAdminAnalytics,
  mockCreatePayment,
  mockFraudAlerts,
  mockListTransactions,
  mockRecentTransactions,
  mockVerifyTransaction,
  type ListTransactionsInput,
} from './mock/mockTransactions'

export async function listTransactions(input: ListTransactionsInput) {
  if (env.apiMock) return mockListTransactions(input)
  const { from, ...rest } = input
  const res = await apiClient.get('/transactions', {
    params: { ...rest, ...(from ? { from_: from } : {}) },
  })
  return res.data as Awaited<ReturnType<typeof mockListTransactions>>
}

export async function recentTransactions(userId: string) {
  if (env.apiMock) return mockRecentTransactions(userId)
  const res = await apiClient.get(`/users/${userId}/transactions/recent`)
  return res.data as Transaction[]
}

export async function fraudAlerts(userId: string) {
  if (env.apiMock) return mockFraudAlerts(userId)
  const res = await apiClient.get(`/users/${userId}/fraud-alerts`)
  return res.data as Awaited<ReturnType<typeof mockFraudAlerts>>
}

export async function createPayment(input: {
  userId: string
  amount: number
  method: PaymentMethod
  device: DeviceType
  location: string
}) {
  if (env.apiMock) return mockCreatePayment(input)
  const res = await apiClient.post('/payments', input)
  return res.data as Transaction
}

export async function verifyTransaction(transactionId: string) {
  if (env.apiMock) return mockVerifyTransaction(transactionId)
  const res = await apiClient.post('/blockchain/verify', { transactionId })
  return res.data as Awaited<ReturnType<typeof mockVerifyTransaction>>
}

export async function adminAnalytics() {
  if (env.apiMock) return mockAdminAnalytics()
  const res = await apiClient.get('/admin/analytics')
  return res.data as Awaited<ReturnType<typeof mockAdminAnalytics>>
}

