import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Pagination } from '../../components/ui/Pagination'
import { useAuth } from '../../state/auth/useAuth'
import * as txService from '../../services/transactionService'
import type { Transaction } from '../../types/transactions'
import { BlockchainBadge, FraudScoreBadge, StatusDot } from '../../components/transactions/Indicators'

function dateToIsoStart(d: string) {
  if (!d) return undefined
  const dt = new Date(`${d}T00:00:00`)
  return dt.toISOString()
}
function dateToIsoEnd(d: string) {
  if (!d) return undefined
  const dt = new Date(`${d}T23:59:59`)
  return dt.toISOString()
}

export function TransactionHistoryPage() {
  const { user } = useAuth()

  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc' | 'fraud_desc'>('newest')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)

  const query = useMemo(
    () => ({
      userId: user?.id ?? '',
      q,
      from: dateToIsoStart(from),
      to: dateToIsoEnd(to),
      sort,
      page,
      pageSize,
    }),
    [user?.id, q, from, to, sort, page, pageSize],
  )

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    const id = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await txService.listTransactions(query)
          if (cancelled) return
          setItems(res.items)
          setTotal(res.total)
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Failed to load transactions')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [user, query])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Transaction history" subtitle="Search, filter, sort, and paginate." />

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Search
            </label>
            <input
              className="input mt-2"
              value={q}
              onChange={(e) => {
                setPage(1)
                setQ(e.target.value)
              }}
              placeholder="Transaction ID, method, location, status…"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              From
            </label>
            <input
              className="input mt-2"
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1)
                setFrom(e.target.value)
              }}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              To
            </label>
            <input
              className="input mt-2"
              type="date"
              value={to}
              onChange={(e) => {
                setPage(1)
                setTo(e.target.value)
              }}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Sort
            </label>
            <select
              className="input mt-2"
              value={sort}
              onChange={(e) => {
                setPage(1)
                setSort(e.target.value as typeof sort)
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount_desc">Amount ↓</option>
              <option value="amount_asc">Amount ↑</option>
              <option value="fraud_desc">Fraud score ↓</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <Skeleton className="h-6 w-44" />
                  </div>
                ))
              : items.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={t.status} />
                      <div>
                        <div className="text-sm font-extrabold">
                          ₹{t.amount.toLocaleString()} · {t.method}{' '}
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            · {t.device}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(t.createdAt).toLocaleString()} · {t.location} ·{' '}
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

        <div className="mt-6">
          <Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} />
        </div>
      </Card>
    </div>
  )
}

