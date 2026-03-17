import { Outlet } from 'react-router-dom'
import { NavBar } from '../../components/nav/NavBar'
import { Footer } from '../../components/nav/Footer'

export function RootLayout() {
  return (
    <div className="min-h-full">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-slate-950/10 blur-3xl dark:bg-white/5" />
        </div>

        <NavBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

