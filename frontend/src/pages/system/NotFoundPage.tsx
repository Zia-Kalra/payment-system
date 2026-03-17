import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            404
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">
            Page not found
          </div>
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            The page you’re looking for doesn’t exist, or you may not have access.
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link className="btn-primary" to="/">
              Go home
            </Link>
            <Link className="btn-ghost" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

