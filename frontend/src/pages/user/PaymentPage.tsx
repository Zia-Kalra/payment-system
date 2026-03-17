import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { useAuth } from '../../state/auth/useAuth'
import * as txService from '../../services/transactionService'
import type { DeviceType, PaymentMethod, Transaction } from '../../types/transactions'
import { BlockchainBadge, FraudScoreBadge } from '../../components/transactions/Indicators'

export function PaymentPage() {
  const { user } = useAuth()

  const [amount, setAmount] = useState<string>('500')
  const [method, setMethod] = useState<PaymentMethod>('Card')
  const [device, setDevice] = useState<DeviceType>('Mobile')
  const [location, setLocation] = useState('Bengaluru, IN')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState<Transaction | null>(null)

  const amountNum = useMemo(() => Number(amount), [amount])
  const amountOk = Number.isFinite(amountNum) && amountNum > 0

  async function submit() {
    if (!user) return
    if (!amountOk) {
      toast.error('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      const tx = await txService.createPayment({
        userId: user.id,
        amount: amountNum,
        method,
        device,
        location,
      })
      setResult(tx)
      if (tx.status === 'success') toast.success('Payment processed')
      else toast.error('Payment failed (policy)')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader
          title="Make a payment"
          subtitle="Fraud scoring + blockchain verification are shown after processing."
        />

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setConfirmOpen(true)
          }}
        >
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Amount
            </label>
            <input
              className="input mt-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
            />
            {!amountOk && (
              <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
                Amount must be a positive number.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Payment method
              </label>
              <select
                className="input mt-2"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Device type
              </label>
              <select
                className="input mt-2"
                value={device}
                onChange={(e) => setDevice(e.target.value as DeviceType)}
              >
                <option value="Mobile">Mobile</option>
                <option value="Laptop">Laptop</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Location
            </label>
            <input
              className="input mt-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
            <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tip: type “VPN” to simulate a higher risk score.
            </div>
          </div>

          <button className="btn-primary w-full" disabled={!amountOk || submitting} type="submit">
            {submitting ? (
              <>
                <Spinner />
                Processing…
              </>
            ) : (
              'Submit payment'
            )}
          </button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Result" subtitle="Fraud + blockchain status" />

        <div className="mt-6">
          {!result ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
              Submit a payment to see fraud score and verification.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Transaction ID
                </div>
                <div className="mt-1 break-all text-sm font-extrabold">
                  {result.id}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FraudScoreBadge score={result.fraudScore} />
                  <BlockchainBadge verified={result.blockchainVerified} />
                </div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {result.fraudSignals?.length ? (
                    <>
                      Signals:{' '}
                      <span className="font-semibold">
                        {result.fraudSignals.join(', ')}
                      </span>
                    </>
                  ) : (
                    'No fraud signals.'
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Blockchain verification
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  Local hash: <span className="font-mono">{result.localHash}</span>
                </div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  On-chain hash:{' '}
                  <span className="font-mono">{result.blockchainHash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm payment"
        description={`Submit payment of ₹${amountOk ? amountNum.toLocaleString() : amount} via ${method}?`}
        confirmText="Confirm"
        onConfirm={() => void submit()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}

