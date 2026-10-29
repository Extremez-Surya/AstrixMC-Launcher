import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0d1322] p-8 text-white select-none">
          <div className="max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black text-rose-400">Application Error</h2>
            <p className="mt-2 text-xs text-slate-300">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[10px] text-rose-300/80">
              {this.state.error?.stack}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
            >
              Reload Launcher
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Initialize saved theme (Dark, Light, OLED, System)
try {
  const savedTheme = localStorage.getItem('astrix_app_theme') || 'dark'
  if (savedTheme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
)
