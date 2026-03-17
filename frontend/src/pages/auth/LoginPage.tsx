import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { isValidEmail } from '../../lib/validation'
import { useAuth } from '../../state/auth/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  const redirectTo = useMemo(() => {
    const state = loc.state as { from?: string } | null
    return state?.from || '/dashboard'
  }, [loc.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const emailOk = isValidEmail(email)
  const passwordOk = password.length >= 8
  const canSubmit = emailOk && passwordOk && !submitting

  return (
    <Card className="animate-fade-in">
      <div className="bg-app-gradient -m-6 mb-6 rounded-3xl p-6 text-left text-white">
        <div className="text-xs font-semibold opacity-90">Welcome back</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight">
          Sign in to continue
        </div>
        <div className="mt-2 text-xs opacity-80">
          Demo users: <span className="font-semibold">user@payments.local</span>{' '}
          / <span className="font-semibold">User@1234</span> —{' '}
          <span className="font-semibold">admin@payments.local</span> /{' '}
          <span className="font-semibold">Admin@1234</span>
        </div>
      </div>

      <form
        className="space-y-4 text-left"
        onSubmit={async (e) => {
          e.preventDefault()
          setTouched(true)
          if (!canSubmit) return
          setSubmitting(true)
          try {
            await login({ email, password, remember })
            nav(redirectTo, { replace: true })
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Login failed')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Email
          </label>
          <input
            className="input mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            inputMode="email"
          />
          {touched && !emailOk && (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              Enter a valid email address.
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Password
          </label>
          <input
            className="input mt-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {touched && !passwordOk && (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              Password must be at least 8 characters.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            Remember me
          </label>
          <Link
            to="/register"
            className="text-sm font-bold text-orange-700 hover:underline dark:text-orange-300"
          >
            Create account
          </Link>
        </div>

        <button className="btn-primary w-full" disabled={!canSubmit} type="submit">
          {submitting ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </Card>
  )
}

