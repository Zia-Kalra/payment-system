import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Badge } from '../../components/ui/Badge'
import { BlockchainBadge, FraudScoreBadge, StatusDot } from '../../components/transactions/Indicators'
import * as txService from '../../services/transactionService'
import * as adminService from '../../services/adminService'
import type { Transaction } from '../../types/transactions'
import type { AuthUser } from '../../state/auth/types'

type Analytics = Awaited<ReturnType<typeof txService.adminAnalytics>>

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<AuthUser[]>([])
  const [confirm, setConfirm] = useState<{
    open: boolean
    user?: AuthUser
    status?: AuthUser['status']
  }>({ open: false })

  const highRisk = analytics?.highRiskTransactions ?? []
  const alerts = analytics?.realTimeAlerts ?? []

  const summaryCards = useMemo(() => {
    const s = analytics?.summary
    return [
      { label: 'Total transactions', value: s ? s.totalTransactions : 0 },
      { label: 'Total fraud cases', value: s ? s.totalFraudCases : 0 },
      { label: 'Fraud percentage', value: s ? `${s.fraudPercentage}%` : '0%' },
      { label: 'Average amount', value: s ? `₹${s.averageAmount.toLocaleString()}` : '₹0' },
    ]
  }, [analytics])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [a, u] = await Promise.all([txService.adminAnalytics(), adminService.listUsers()])
      setAnalytics(a)
      setUsers(u)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => void refresh(), 15_000)
    return () => window.clearInterval(id)
  }, [refresh])

  async function doUpdateUserStatus(userId: string, status: AuthUser['status']) {
    try {
      const updated = await adminService.updateUserStatus({ userId, status })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success('User updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Admin dashboard</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Analytics, high-risk transactions, user management, and real-time fraud alerts.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <Card key={c.label}>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {c.label}
            </div>
            <div className="mt-3 text-3xl font-extrabold">
              {loading ? <Skeleton className="h-10 w-28" /> : c.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Daily transaction volume" subtitle="Last 14 days" />
          <div className="mt-6 h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyVolume ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Bars represent transaction count per day.
          </div>
        </Card>

        <Card>
          <CardHeader title="Fraud statistics" subtitle="Distribution by risk band" />
          <div className="mt-6 space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <Badge tone="success">Low</Badge>
                  <div className="text-sm font-extrabold">
                    {analytics?.fraudStats.low ?? 0}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <Badge tone="warning">Medium</Badge>
                  <div className="text-sm font-extrabold">
                    {analytics?.fraudStats.medium ?? 0}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <Badge tone="danger">High</Badge>
                  <div className="text-sm font-extrabold">
                    {analytics?.fraudStats.high ?? 0}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="High-risk transactions" subtitle="Highest fraud scores" />
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-4">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  ))
                : highRisk.map((t: Transaction) => (
                    <div
                      key={t.id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <StatusDot status={t.status} />
                        <div>
                          <div className="text-sm font-extrabold">
                            ₹{t.amount.toLocaleString()} · {t.method}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(t.createdAt).toLocaleString()} ·{' '}
                            <span className="font-mono">{t.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <FraudScoreBadge score={t.fraudScore} />
                        <BlockchainBadge verified={t.blockchainVerified} />
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Real-time fraud alerts" subtitle="Auto-refreshes every 15s" />
          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : alerts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                No alerts right now.
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold">
                        <span className="capitalize">{a.severity}</span> risk alert{' '}
                        <Badge tone={a.severity === 'high' ? 'danger' : a.severity === 'medium' ? 'warning' : 'success'}>
                          {a.transactionId}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {a.message}
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(a.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="User management" subtitle="Update account status" />
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-4">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-10 w-44" />
                  </div>
                ))
              : users.map((u) => (
                  <div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-extrabold">
                        {u.name}{' '}
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          · {u.role}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {u.email} · <span className="font-mono">{u.id}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          u.status === 'active'
                            ? 'success'
                            : u.status === 'restricted'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {u.status}
                      </Badge>
                      <select
                        className="input h-11 w-44"
                        value={u.status}
                        onChange={(e) => {
                          const next = e.target.value as AuthUser['status']
                          setConfirm({ open: true, user: u, status: next })
                        }}
                      >
                        <option value="active">active</option>
                        <option value="restricted">restricted</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </Card>

      <ConfirmModal
        open={confirm.open}
        title="Confirm user update"
        description={
          confirm.user && confirm.status
            ? `Set ${confirm.user.email} to status "${confirm.status}"?`
            : undefined
        }
        tone={confirm.status === 'suspended' ? 'danger' : 'primary'}
        confirmText="Update"
        onConfirm={() => {
          if (!confirm.user || !confirm.status) return
          void doUpdateUserStatus(confirm.user.id, confirm.status)
        }}
        onClose={() => setConfirm({ open: false })}
      />
    </div>
  )
}

