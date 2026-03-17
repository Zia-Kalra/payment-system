import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Role } from '../../state/auth/types'
import { useAuth } from '../../state/auth/useAuth'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: Role[]
}) {
  const { isAuthenticated, user } = useAuth()
  const loc = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

