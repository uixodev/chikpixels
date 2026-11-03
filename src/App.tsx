import { useEffect, useState } from 'react'
import { ExtendHabit } from './components/ExtendHabit'
import { Home } from './components/Home'
import { Wordmark } from './components/Logo'
import { NewHabit } from './components/NewHabit'
import { Tracker } from './components/Tracker'
import { applyLog, loadState, saveState, type AppState } from './lib/habits'

type View = { name: 'home' } | { name: 'new' } | { name: 'habit'; id: string } | { name: 'extend'; id: string }

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => saveState(state), [state])

  const update = (fn: (s: AppState) => AppState) => setState(fn)
  const habit = view.name === 'habit' || view.name === 'extend' ? state.habits.find((h) => h.id === view.id) : undefined

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
          onMoveSticker={(key, pos) => update((s) => ({ ...s, stickers: { ...s.stickers, [key]: pos } }))}
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

      {view.name === 'extend' && habit && (
        <ExtendHabit
          habit={habit}
          habits={state.habits}
          onCancel={() => setView({ name: 'habit', id: habit.id })}
          onExtend={(next) => {
            update((s) => ({ ...s, habits: s.habits.map((h) => (h.id === next.id ? next : h)) }))
            setView({ name: 'habit', id: next.id })
          }}
        />
      )}

      {view.name === 'habit' && habit && (
        <Tracker
          habit={habit}
          onExtend={() => setView({ name: 'extend', id: habit.id })}
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

      {(view.name === 'habit' || view.name === 'extend') && !habit && (
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
