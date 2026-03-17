import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
      <div className="hidden lg:block">
        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-slate-900/35 to-orange-500/25 dark:from-slate-950/40 dark:via-slate-900/30 dark:to-orange-500/20" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              Payment System
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] text-emerald-50">
                Fraud + Blockchain
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
              Secure payments with real-time fraud detection.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Beautiful UX, JWT authentication, analytics dashboards, and
              tamper-evident blockchain verification.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="glass rounded-2xl p-4 text-white/90">
                <div className="text-xs text-white/70">Fraud scoring</div>
                <div className="mt-2 text-lg font-semibold">Green → Red</div>
              </div>
              <div className="glass rounded-2xl p-4 text-white/90">
                <div className="text-xs text-white/70">Verification</div>
                <div className="mt-2 text-lg font-semibold">On-chain hash</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

