import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CreditCard, History } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../state/auth/useAuth'
import * as txService from '../../services/transactionService'
import type { FraudAlert, Transaction } from '../../types/transactions'
import {
  AlertIcon,
  BlockchainBadge,
  FraudScoreBadge,
  StatusDot,
} from '../../components/transactions/Indicators'

export function UserDashboardPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<Transaction[]>([])
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [totals, setTotals] = useState<{ total: number; spent: number } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!user) return
      setLoading(true)
      setErr(null)
      try {
        const [r, a, all] = await Promise.all([
          txService.recentTransactions(user.id),
          txService.fraudAlerts(user.id),
          txService.listTransactions({ userId: user.id, page: 1, pageSize: 1000, sort: 'newest' }),
        ])
        if (cancelled) return
        setRecent(r)
        setAlerts(a)
        const spent = all.items
          .filter((t) => t.status === 'success')
          .reduce((s, t) => s + t.amount, 0)
        setTotals({ total: all.total, spent: Math.round(spent * 100) / 100 })
      } catch (e) {
        if (cancelled) return
        setErr(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  const welcome = useMemo(() => {
    if (!user) return 'Welcome'
    return `Welcome, ${user.name}`
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">{welcome}</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Monitor your transactions, fraud risk, and blockchain verification.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link className="btn-primary" to="/payment">
            <CreditCard size={18} />
            Make Payment
            <ArrowRight size={18} />
          </Link>
          <Link className="btn-ghost" to="/transactions">
            <History size={18} />
            View History
          </Link>
        </div>
      </div>

      {err && (
        <Card className="border-rose-200/40 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-start gap-3 text-left">
            <AlertTriangle className="mt-0.5 text-rose-600 dark:text-rose-300" size={18} />
            <div>
              <div className="text-sm font-extrabold">Dashboard error</div>
              <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {err}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Total transactions" />
          <div className="mt-4 text-3xl font-extrabold">
            {loading ? <Skeleton className="h-10 w-24" /> : totals?.total ?? 0}
          </div>
        </Card>
        <Card>
          <CardHeader title="Total spent" />
          <div className="mt-4 text-3xl font-extrabold">
            {loading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              `₹${(totals?.spent ?? 0).toLocaleString()}`
            )}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Successful transactions only
          </div>
        </Card>
        <Card>
          <CardHeader title="Account status" />
          <div className="mt-4 text-3xl font-extrabold capitalize">
            {loading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              user?.status ?? 'active'
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent transactions" subtitle="Last 5" />
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-6 w-40" />
                    </div>
                  ))
                : recent.map((t) => (
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
                            {new Date(t.createdAt).toLocaleString()} · {t.location}
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
          <CardHeader title="Fraud alerts" subtitle="Latest signals" />
          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : alerts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                No active fraud alerts.
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertIcon severity={a.severity} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold capitalize">
                          {a.severity} severity
                        </div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {a.message}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Tx: {a.transactionId}
                        </div>
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
    </div>
  )
}

