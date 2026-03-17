import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { cn } from '../../lib/cn'
import { isValidEmail, passwordRequirements, passwordScore } from '../../lib/validation'
import { useAuth } from '../../state/auth/useAuth'

function StrengthBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 5) * 100))
  const tone =
    score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/60">
        <div
          className={cn('h-2 rounded-full transition-all', tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        Strength:{' '}
        <span className="font-extrabold">
          {score >= 4 ? 'Strong' : score >= 3 ? 'Good' : 'Weak'}
        </span>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const emailOk = isValidEmail(email)
  const pwReq = useMemo(() => passwordRequirements(password), [password])
  const pwOk = pwReq.minLength && pwReq.upper && pwReq.lower && pwReq.number
  const matchOk = password === confirm && confirm.length > 0
  const nameOk = name.trim().length >= 2
  const score = passwordScore(password)

  const canSubmit = nameOk && emailOk && pwOk && matchOk && terms && !submitting

  return (
    <Card className="animate-fade-in">
      <div className="bg-app-gradient -m-6 mb-6 rounded-3xl p-6 text-left text-white">
        <div className="text-xs font-semibold opacity-90">Create account</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight">
          Start with secure payments
        </div>
        <div className="mt-2 text-xs opacity-80">
          Password must include upper, lower, number, and be 8+ chars.
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
            await register({ name, email, password })
            nav('/dashboard', { replace: true })
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Registration failed')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Full name
          </label>
          <input
            className="input mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          {touched && !nameOk && (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              Name is required.
            </div>
          )}
        </div>

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
            autoComplete="new-password"
          />
          <StrengthBar score={score} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className={cn(pwReq.minLength ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>
              8+ characters
            </div>
            <div className={cn(pwReq.upper ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>
              Uppercase
            </div>
            <div className={cn(pwReq.lower ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>
              Lowercase
            </div>
            <div className={cn(pwReq.number ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>
              Number
            </div>
          </div>
          {touched && !pwOk && (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              Password does not meet minimum requirements.
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Confirm password
          </label>
          <input
            className="input mt-2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {touched && !matchOk && (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              Passwords must match.
            </div>
          )}
        </div>

        <label className="inline-flex cursor-pointer items-start gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
          <span>
            I agree to the{' '}
            <span className="font-extrabold text-orange-700 dark:text-orange-300">
              Terms and Conditions
            </span>
            .
          </span>
        </label>
        {touched && !terms && (
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-300">
            Please accept the terms.
          </div>
        )}

        <button className="btn-primary w-full" disabled={!canSubmit} type="submit">
          {submitting ? (
            <>
              <Spinner />
              Creating account…
            </>
          ) : (
            'Register'
          )}
        </button>

        <div className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-extrabold text-orange-700 hover:underline dark:text-orange-300"
          >
            Login
          </Link>
        </div>
      </form>
    </Card>
  )
}

