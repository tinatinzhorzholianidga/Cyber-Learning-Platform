import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/* Companion brain for IO. Mission rounds report what just happened and
   the floating widget performs it:
   - 'wrong'        → thinking face, the round's explanation moves into
                      IO's speech bubble (payload.text = {en,ka})
   - 'correct'      → a random move (wave/bounce/spin) + a random mood
                      (excited/funny/wink) + a short praise line
   - 'missionDone'  → celebrate + fireworks overlay
   - 'clear'        → back to idle tips
   While the widget is closed or not yet loaded, `companionActive` is
   false and the rounds fall back to showing explanations inline. */
const MascotContext = createContext(null)

const CORRECT_MOODS = ['excited', 'funny', 'wink']
const CORRECT_MOVES = ['bounce', 'wave', 'spin']

export function MascotProvider({ children }) {
  const [companion, setCompanion] = useState(null)
  const [fireworksAt, setFireworksAt] = useState(0)
  const [dockMounted, setDockMounted] = useState(false)
  const [dockOpen, setDockOpen] = useState(true)
  const idRef = useRef(0)

  const react = useCallback((event, payload) => {
    idRef.current += 1
    const id = idRef.current
    if (event === 'wrong') {
      setCompanion({ id, mode: 'wrong', mood: 'thinking', gesture: null, text: payload?.text || null })
    } else if (event === 'correct') {
      setCompanion({
        id,
        mode: 'correct',
        mood: CORRECT_MOODS[id % CORRECT_MOODS.length],
        gesture: { id, type: CORRECT_MOVES[id % CORRECT_MOVES.length] },
        text: null,
      })
    } else if (event === 'missionDone') {
      setCompanion({ id, mode: 'celebrate', mood: 'celebrate', gesture: { id, type: 'bounce' }, text: null })
      if (payload?.passed !== false) setFireworksAt(Date.now())
    } else {
      setCompanion(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      companion,
      react,
      fireworksAt,
      companionActive: dockMounted && dockOpen,
      setDockMounted,
      setDockOpen,
    }),
    [companion, react, fireworksAt, dockMounted, dockOpen],
  )

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>
}

export function useMascot() {
  const ctx = useContext(MascotContext)
  // Pages render fine without the provider (tests, isolation) - no-op stub.
  return (
    ctx || {
      companion: null,
      react: () => {},
      fireworksAt: 0,
      companionActive: false,
      setDockMounted: () => {},
      setDockOpen: () => {},
    }
  )
}
