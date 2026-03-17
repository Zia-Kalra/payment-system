import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/Badge'

function toneForScore(score: number) {
  if (score >= 80) return 'danger'
  if (score >= 40) return 'warning'
  return 'success'
}

export function FraudScoreBadge({ score }: { score: number }) {
  const tone = toneForScore(score)
  return <Badge tone={tone}>Fraud {score}</Badge>
}

export function BlockchainBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge tone="success" className="gap-1.5">
      <ShieldCheck size={14} />
      Verified
    </Badge>
  ) : (
    <Badge tone="danger" className="gap-1.5">
      <ShieldX size={14} />
      Tampered
    </Badge>
  )
}

export function StatusDot({ status }: { status: 'success' | 'failed' | 'pending' }) {
  const cls =
    status === 'success'
      ? 'bg-emerald-400'
      : status === 'pending'
        ? 'bg-amber-400'
        : 'bg-rose-400'
  return <span className={cn('inline-flex h-2 w-2 rounded-full', cls)} />
}

export function AlertIcon({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  if (severity === 'high') return <ShieldX className="text-rose-500" size={18} />
  if (severity === 'medium') return <ShieldAlert className="text-amber-500" size={18} />
  return <ShieldAlert className="text-emerald-500" size={18} />
}

