import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'cyberhero.progress.v1'

const initial = {
  guardians: {
    // missions: { g1: { done: true, best: 40, total: 60 }, ... }
    missions: {},
    certName: '',
  },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw)
    return {
      ...initial,
      ...parsed,
      guardians: { ...initial.guardians, ...(parsed.guardians || {}) },
    }
  } catch {
    return initial
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      /* private mode — progress just won't persist */
    }
  }, [progress])

  const recordMission = useCallback((missionId, { score, total }) => {
    setProgress((prev) => {
      const existing = prev.guardians.missions[missionId]
      const best = Math.max(existing?.best ?? 0, score)
      return {
        ...prev,
        guardians: {
          ...prev.guardians,
          missions: {
            ...prev.guardians.missions,
            [missionId]: { done: true, best, total },
          },
        },
      }
    })
  }, [])

  const setCertName = useCallback((certName) => {
    setProgress((prev) => ({ ...prev, guardians: { ...prev.guardians, certName } }))
  }, [])

  const resetGuardians = useCallback(() => {
    setProgress((prev) => ({ ...prev, guardians: { ...initial.guardians } }))
  }, [])

  return (
    <ProgressContext.Provider value={{ progress, recordMission, setCertName, resetGuardians }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
