import { Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '../shell/RootLayout'
import { AuthLayout } from '../shell/AuthLayout'
import { ProtectedRoute } from '../../components/routing/ProtectedRoute'
import { LoginPage } from '../../pages/auth/LoginPage'
import { RegisterPage } from '../../pages/auth/RegisterPage'
import { UserDashboardPage } from '../../pages/user/UserDashboardPage'
import { PaymentPage } from '../../pages/user/PaymentPage'
import { TransactionHistoryPage } from '../../pages/user/TransactionHistoryPage'
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage'
import { BlockchainVerificationPage } from '../../pages/blockchain/BlockchainVerificationPage'
import { NotFoundPage } from '../../pages/system/NotFoundPage'
import { useAuth } from '../../state/auth/useAuth'

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          index
          element={
            isAuthenticated ? (
              user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['user', 'admin']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute roles={['user', 'admin']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute roles={['user', 'admin']}>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blockchain"
          element={
            <ProtectedRoute roles={['user', 'admin']}>
              <BlockchainVerificationPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

