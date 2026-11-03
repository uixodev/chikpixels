import { ArrowLeft } from './components/ArrowLeft'
import { useEffect, useState } from 'react'
import { Home } from './components/Home'
import { Wordmark } from './components/Logo'
import { NewHabit } from './components/NewHabit'
import { Tracker } from './components/Tracker'
import { findArt } from './lib/art'
import { applyLog, loadState, saveState, type AppState } from './lib/habits'

type View = { name: 'home' } | { name: 'new' } | { name: 'habit'; id: string }

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => saveState(state), [state])

  const update = (fn: (s: AppState) => AppState) => setState(fn)
  const habit = view.name === 'habit' ? state.habits.find((h) => h.id === view.id) : undefined
  const art = habit ? findArt(habit.artId) : undefined

  return (
    <div className="app">
      <header>
        <button className="logo-btn" onClick={() => setView({ name: 'home' })} aria-label="chikpixels home">
          <Wordmark />
        </button>
      </header>

      {view.name === 'home' && (
        <Home
          state={state}
          onOpen={(id) => setView({ name: 'habit', id })}
          onNew={() => setView({ name: 'new' })}
          onThreshold={(threshold) => update((s) => ({ ...s, threshold }))}
        />
      )}

      {view.name === 'new' && (
        <NewHabit
          habits={state.habits}
          onCancel={() => setView({ name: 'home' })}
          onCreate={(h) => {
            update((s) => ({ ...s, habits: [...s.habits, h] }))
            setView({ name: 'habit', id: h.id })
          }}
        />
      )}

      {view.name === 'habit' && habit && art && (
        <Tracker
          habit={habit}
          art={art}
          threshold={state.threshold}
          onBack={() => setView({ name: 'home' })}
          onLog={(day, value) =>
            update((s) => ({ ...s, habits: s.habits.map((h) => (h.id === habit.id ? applyLog(h, day, value, s.threshold) : h)) }))
          }
          onDelete={() => {
            update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== habit.id) }))
            setView({ name: 'home' })
          }}
        />
      )}

      {view.name === 'habit' && habit && !art && (
        <main>
          <button className="btn ghost back" onClick={() => setView({ name: 'home' })}>
            <ArrowLeft /> My habits
          </button>
          <p className="callout small">
            <span>This habit's picture is not in the library on this device, so it cannot be shown here.</span>
          </p>
        </main>
      )}

      {view.name === 'habit' && !habit && (
        <main>
          <p className="muted">That habit no longer exists.</p>
          <button className="btn" onClick={() => setView({ name: 'home' })}>
            Back
          </button>
        </main>
      )}
    </div>
  )
}
