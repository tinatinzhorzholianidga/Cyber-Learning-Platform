/* A tiny external store for the voice layer: useIoVoice writes, the dock
   and the transcript subscribe to slices with useSyncExternalStore, so a
   streaming caption re-renders the transcript alone - never App or the
   3D canvas. */
import { useSyncExternalStore } from 'react'

export function createStore(initial) {
  let state = initial
  const subs = new Set()
  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : { ...state, ...patch }
      if (next === state) return
      state = next
      subs.forEach((cb) => cb())
    },
    subscribe(cb) {
      subs.add(cb)
      return () => subs.delete(cb)
    },
  }
}

/* Select a slice; return stable references for unchanged slices. */
export function useStore(store, selector) {
  const read = () => selector(store.get())
  return useSyncExternalStore(store.subscribe, read, read)
}
