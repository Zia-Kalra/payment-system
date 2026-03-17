import { cn } from '../../lib/cn'

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (next: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < pages

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Page <span className="font-extrabold text-slate-700 dark:text-slate-200">{page}</span>{' '}
        of{' '}
        <span className="font-extrabold text-slate-700 dark:text-slate-200">
          {pages}
        </span>{' '}
        · {total} items
      </div>
      <div className="flex items-center gap-2">
        <button
          className={cn('btn-ghost h-10 px-3', !canPrev && 'opacity-50')}
          disabled={!canPrev}
          onClick={() => onPage(page - 1)}
          type="button"
        >
          Prev
        </button>
        <button
          className={cn('btn-ghost h-10 px-3', !canNext && 'opacity-50')}
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}

