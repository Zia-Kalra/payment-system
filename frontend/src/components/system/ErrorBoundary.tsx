import type { ReactNode } from 'react'
import React from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-16 max-w-xl px-4">
          <div className="glass rounded-3xl p-8 text-left">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Something went wrong
            </div>
            <div className="mt-2 text-2xl font-bold">Please refresh the page.</div>
            <button
              className="btn-primary mt-6 w-full"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

