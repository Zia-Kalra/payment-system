export type PaymentMethod = 'Card' | 'UPI' | 'Wallet'
export type DeviceType = 'Mobile' | 'Laptop'

export type TransactionStatus = 'success' | 'failed' | 'pending'

export type Transaction = {
  id: string
  userId: string
  createdAt: string // ISO
  amount: number
  method: PaymentMethod
  device: DeviceType
  location: string
  status: TransactionStatus
  fraudScore: number // 0..100
  fraudSignals?: string[]
  localHash: string
  blockchainHash: string
  blockchainVerified: boolean
  blockchainTimestamp: string // ISO
}

export type FraudAlert = {
  id: string
  transactionId: string
  severity: 'low' | 'medium' | 'high'
  message: string
  createdAt: string
}

