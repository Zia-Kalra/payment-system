import { useState } from 'react'
import toast from 'react-hot-toast'
import { Copy, ShieldCheck, ShieldX } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { cn } from '../../lib/cn'
import * as txService from '../../services/transactionService'

type Result = {
  transactionId: string
  localHash: string
  blockchainHash: string
  valid: boolean
  timestamp: string
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  toast.success('Copied')
}

export function BlockchainVerificationPage() {
  const [txId, setTxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader
          title="Blockchain verification"
          subtitle="Compare local vs on-chain hashes to detect tampering."
        />

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const v = txId.trim()
            if (!v) {
              toast.error('Enter a transaction ID')
              return
            }
            setLoading(true)
            try {
              const res = await txService.verifyTransaction(v)
              setResult(res)
              toast.success(res.valid ? 'Valid' : 'Tampered')
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Verification failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Transaction ID
            </label>
            <input
              className="input mt-2 font-mono"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="tx_..."
            />
            <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tip: copy an ID from Transaction History.
            </div>
          </div>

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? (
              <>
                <Spinner />
                Verifying…
              </>
            ) : (
              'Verify'
            )}
          </button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Result" subtitle="Hash comparison" />
        <div className="mt-6">
          {!result ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
              Run a verification to see results.
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={cn(
                  'rounded-2xl border p-4',
                  result.valid
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20',
                )}
              >
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  {result.valid ? (
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-300" size={18} />
                  ) : (
                    <ShieldX className="text-rose-600 dark:text-rose-300" size={18} />
                  )}
                  {result.valid ? 'Valid' : 'Tampered'}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Timestamp: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Local transaction hash
                  </div>
                  <button
                    className="btn-ghost h-9 px-3"
                    type="button"
                    onClick={() => void copy(result.localHash)}
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <div className="mt-2 break-all font-mono text-sm">
                  {result.localHash}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Blockchain stored hash
                  </div>
                  <button
                    className="btn-ghost h-9 px-3"
                    type="button"
                    onClick={() => void copy(result.blockchainHash)}
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <div className="mt-2 break-all font-mono text-sm">
                  {result.blockchainHash}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

