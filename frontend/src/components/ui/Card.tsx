import { cn } from '../../lib/cn'
import type { ReactNode } from 'react'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('glass rounded-3xl p-6', className)}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-lg font-extrabold tracking-tight">{title}</div>
        {subtitle && (
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}

