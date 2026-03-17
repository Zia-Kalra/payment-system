import type { DeviceType, PaymentMethod, Transaction, FraudAlert } from '../../types/transactions'

const TX_KEY = 'ps_mock_transactions'
const ALERT_KEY = 'ps_mock_fraud_alerts'

function randHex(bytes: number) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function nowIso() {
  return new Date().toISOString()
}

function readAllTx(): Transaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    const parsed = raw ? (JSON.parse(raw) as Transaction[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAllTx(tx: Transaction[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(tx))
}

function readAlerts(): FraudAlert[] {
  try {
    const raw = localStorage.getItem(ALERT_KEY)
    const parsed = raw ? (JSON.parse(raw) as FraudAlert[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAlerts(a: FraudAlert[]) {
  localStorage.setItem(ALERT_KEY, JSON.stringify(a))
}

function seedIfEmpty(userId: string) {
  const all = readAllTx()
  if (all.some((t) => t.userId === userId)) return

  const methods: PaymentMethod[] = ['Card', 'UPI', 'Wallet']
  const devices: DeviceType[] = ['Mobile', 'Laptop']
  const locations = ['Bengaluru, IN', 'Mumbai, IN', 'Delhi, IN', 'Pune, IN', 'Hyderabad, IN']

  const seeded: Transaction[] = Array.from({ length: 18 }).map((_, i) => {
    const amount = Math.round((Math.random() * 5000 + 150) * 100) / 100
    const fraudScore = Math.floor(Math.random() * 100)
    const verified = fraudScore < 85
    const localHash = randHex(16)
    const blockchainHash = verified ? localHash : randHex(16)
    const createdAt = new Date(Date.now() - i * 86_400_000 * 0.6).toISOString()
    return {
      id: `tx_${randHex(8)}`,
      userId,
      createdAt,
      amount,
      method: methods[i % methods.length]!,
      device: devices[i % devices.length]!,
      location: locations[i % locations.length]!,
      status: fraudScore > 92 ? 'failed' : 'success',
      fraudScore,
      fraudSignals: fraudScore > 80 ? ['anomaly:amount', 'velocity'] : ['baseline'],
      localHash,
      blockchainHash,
      blockchainVerified: verified,
      blockchainTimestamp: createdAt,
    }
  })

  writeAllTx([...seeded, ...all])
}

function fraudFromInputs(amount: number, method: PaymentMethod, device: DeviceType, location: string) {
  let score = 18
  const signals: string[] = []

  if (amount > 5000) {
    score += 35
    signals.push('anomaly:high_amount')
  } else if (amount > 1500) {
    score += 18
    signals.push('amount:moderate')
  }

  if (method === 'Wallet') {
    score += 8
    signals.push('method:wallet')
  }

  if (device === 'Laptop') {
    score += 6
    signals.push('device:laptop')
  }

  if (!location.trim()) {
    score += 10
    signals.push('missing:location')
  } else if (/unknown|vpn/i.test(location)) {
    score += 22
    signals.push('location:high_risk')
  }

  score += Math.floor(Math.random() * 20)
  score = Math.max(0, Math.min(100, score))

  return { score, signals }
}

export type ListTransactionsInput = {
  userId: string
  q?: string
  from?: string
  to?: string
  sort?: 'newest' | 'oldest' | 'amount_desc' | 'amount_asc' | 'fraud_desc'
  page?: number
  pageSize?: number
}

export async function mockListTransactions(input: ListTransactionsInput) {
  seedIfEmpty(input.userId)
  await new Promise((r) => setTimeout(r, 450))

  const page = input.page ?? 1
  const pageSize = input.pageSize ?? 10

  let items = readAllTx().filter((t) => t.userId === input.userId)

  const q = input.q?.trim().toLowerCase()
  if (q) {
    items = items.filter((t) => {
      return (
        t.id.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      )
    })
  }

  if (input.from) items = items.filter((t) => t.createdAt >= input.from!)
  if (input.to) items = items.filter((t) => t.createdAt <= input.to!)

  switch (input.sort) {
    case 'oldest':
      items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      break
    case 'amount_asc':
      items.sort((a, b) => a.amount - b.amount)
      break
    case 'amount_desc':
      items.sort((a, b) => b.amount - a.amount)
      break
    case 'fraud_desc':
      items.sort((a, b) => b.fraudScore - a.fraudScore)
      break
    case 'newest':
    default:
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
  }

  const total = items.length
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return { items: paged, total, page, pageSize }
}

export type CreatePaymentInput = {
  userId: string
  amount: number
  method: PaymentMethod
  device: DeviceType
  location: string
}

export async function mockCreatePayment(input: CreatePaymentInput) {
  await new Promise((r) => setTimeout(r, 900))
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('Invalid amount')

  const { score, signals } = fraudFromInputs(
    input.amount,
    input.method,
    input.device,
    input.location,
  )

  const createdAt = nowIso()
  const localHash = randHex(16)
  const blockchainVerified = score < 90
  const blockchainHash = blockchainVerified ? localHash : randHex(16)
  const status: Transaction['status'] = score > 95 ? 'failed' : 'success'

  const tx: Transaction = {
    id: `tx_${randHex(8)}`,
    userId: input.userId,
    createdAt,
    amount: Math.round(input.amount * 100) / 100,
    method: input.method,
    device: input.device,
    location: input.location.trim() || 'Unknown',
    status,
    fraudScore: score,
    fraudSignals: signals,
    localHash,
    blockchainHash,
    blockchainVerified,
    blockchainTimestamp: createdAt,
  }

  const all = readAllTx()
  writeAllTx([tx, ...all])

  if (score >= 80) {
    const severity: FraudAlert['severity'] = score >= 92 ? 'high' : score >= 86 ? 'medium' : 'low'
    const alerts = readAlerts()
    alerts.unshift({
      id: `fa_${randHex(8)}`,
      transactionId: tx.id,
      severity,
      message:
        severity === 'high'
          ? 'High-risk transaction blocked by policy.'
          : 'Suspicious behavior detected. Manual review recommended.',
      createdAt,
    })
    writeAlerts(alerts.slice(0, 50))
  }

  return tx
}

export async function mockRecentTransactions(userId: string, take = 5) {
  seedIfEmpty(userId)
  await new Promise((r) => setTimeout(r, 350))
  return readAllTx()
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, take)
}

export async function mockFraudAlerts(userId: string) {
  seedIfEmpty(userId)
  await new Promise((r) => setTimeout(r, 300))
  const txIds = new Set(readAllTx().filter((t) => t.userId === userId).map((t) => t.id))
  return readAlerts().filter((a) => txIds.has(a.transactionId)).slice(0, 8)
}

export async function mockVerifyTransaction(transactionId: string) {
  await new Promise((r) => setTimeout(r, 650))
  const tx = readAllTx().find((t) => t.id === transactionId)
  if (!tx) throw new Error('Transaction not found')
  const valid = tx.localHash === tx.blockchainHash
  return {
    transactionId,
    localHash: tx.localHash,
    blockchainHash: tx.blockchainHash,
    valid,
    timestamp: tx.blockchainTimestamp,
  }
}

export async function mockAdminAnalytics() {
  await new Promise((r) => setTimeout(r, 650))
  const all = readAllTx()
  const total = all.length
  const fraudCases = all.filter((t) => t.fraudScore >= 80).length
  const fraudPct = total ? Math.round((fraudCases / total) * 1000) / 10 : 0
  const avg = total ? all.reduce((s, t) => s + t.amount, 0) / total : 0

  const byDay: Record<string, { date: string; count: number; amount: number }> = {}
  for (const t of all) {
    const date = t.createdAt.slice(0, 10)
    byDay[date] = byDay[date] ?? { date, count: 0, amount: 0 }
    byDay[date]!.count += 1
    byDay[date]!.amount += t.amount
  }
  const daily = Object.values(byDay)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((d) => ({ ...d, amount: Math.round(d.amount * 100) / 100 }))

  const highRisk = [...all]
    .sort((a, b) => b.fraudScore - a.fraudScore)
    .slice(0, 8)

  const stats = {
    low: all.filter((t) => t.fraudScore < 40).length,
    medium: all.filter((t) => t.fraudScore >= 40 && t.fraudScore < 80).length,
    high: all.filter((t) => t.fraudScore >= 80).length,
  }

  return {
    summary: {
      totalTransactions: total,
      totalFraudCases: fraudCases,
      fraudPercentage: fraudPct,
      averageAmount: Math.round(avg * 100) / 100,
    },
    dailyVolume: daily,
    highRiskTransactions: highRisk,
    fraudStats: stats,
    realTimeAlerts: readAlerts().slice(0, 10),
  }
}

