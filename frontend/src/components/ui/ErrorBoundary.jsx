import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-white/40 text-sm mb-2 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <p className="text-red-400/60 text-xs font-mono mb-6 bg-red-500/5 rounded-lg p-3 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm"
            >
              Refresh Page
            </button>
            <Link to="/" className="btn-ghost text-sm">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
