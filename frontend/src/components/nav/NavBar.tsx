import { Fragment, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import {
  LayoutDashboard,
  ShieldCheck,
  Receipt,
  CreditCard,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAuth } from '../../state/auth/useAuth'
import { useTheme } from '../../state/theme/useTheme'

function NavItem({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-orange-500 text-slate-950'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
        )
      }
    >
      <span className="opacity-90">{icon}</span>
      <span className="hidden sm:block">{label}</span>
    </NavLink>
  )
}

export function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1"
        >
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-500 shadow-sm" />
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Payment System
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Fraud + Blockchain
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated && (
            <>
              <NavItem
                to="/dashboard"
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
              />
              <NavItem
                to="/payment"
                icon={<CreditCard size={18} />}
                label="Payment"
              />
              <NavItem
                to="/transactions"
                icon={<Receipt size={18} />}
                label="History"
              />
              <NavItem
                to="/blockchain"
                icon={<ShieldCheck size={18} />}
                label="Verify"
              />
              {user?.role === 'admin' && (
                <NavItem
                  to="/admin"
                  icon={<LayoutDashboard size={18} />}
                  label="Admin"
                />
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost h-11 w-11 p-0"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link className="btn-ghost h-11" to="/login">
                Login
              </Link>
              <Link className="btn-primary h-11" to="/register">
                Create account
              </Link>
            </div>
          ) : (
            <Menu as="div" className="relative">
              <Menu.Button className="btn-ghost h-11 gap-2">
                <UserIcon size={18} />
                <span className="hidden sm:block">{user?.name ?? 'Account'}</span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="px-3 py-2">
                    <div className="text-sm font-bold">{user?.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                      Status: {user?.status ?? 'active'}
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          user?.status === 'active'
                            ? 'bg-emerald-400'
                            : user?.status === 'restricted'
                              ? 'bg-amber-400'
                              : 'bg-rose-400',
                        )}
                      />
                    </div>
                  </div>

                  <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold',
                          active
                            ? 'bg-slate-100 dark:bg-slate-900/60'
                            : 'bg-transparent',
                        )}
                        onClick={() => {
                          logout()
                          navigate('/login')
                        }}
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="border-t border-slate-200/70 px-4 py-2 md:hidden dark:border-slate-800/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold',
                  isActive
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/payment"
              className={({ isActive }) =>
                cn(
                  'flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold',
                  isActive
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
                )
              }
            >
              Pay
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                cn(
                  'flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold',
                  isActive
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
                )
              }
            >
              History
            </NavLink>
            <NavLink
              to="/blockchain"
              className={({ isActive }) =>
                cn(
                  'flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold',
                  isActive
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
                )
              }
            >
              Verify
            </NavLink>
          </div>
        </div>
      )}
    </header>
  )
}

