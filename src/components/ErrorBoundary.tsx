import { Component } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEY } from '../lib/habits'

interface State {
  error: Error | null
}

/** If something goes wrong, say so (and offer a way out) instead of leaving a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* nothing to clear */
    }
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="app">
        <main>
          <h1>Something went wrong</h1>
          <p className="callout small">
            <span>chikpixels could not open. Reloading usually fixes it. If it keeps happening, clearing the saved data on this device will, but that removes your habits.</span>
          </p>
          <p className="muted">{this.state.error.message}</p>
          <div className="actions">
            <button className="btn primary" onClick={() => location.reload()}>
              Reload
            </button>
            <button className="btn danger" onClick={this.reset}>
              Clear saved data
            </button>
          </div>
        </main>
      </div>
    )
  }
}
