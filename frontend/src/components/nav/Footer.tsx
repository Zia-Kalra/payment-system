export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 py-8 dark:border-slate-800/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
        <div>© {new Date().getFullYear()} Payment System</div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80" />
          Demo-ready frontend (mock API by default)
        </div>
      </div>
    </footer>
  )
}

