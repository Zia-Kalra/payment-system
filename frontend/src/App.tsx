import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes/AppRoutes'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import { AuthProvider } from './state/auth/AuthProvider'
import { ThemeProvider } from './state/theme/ThemeProvider'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.12)',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
