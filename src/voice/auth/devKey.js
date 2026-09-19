/* Where the Gemini key comes from in Track D (docs/io-voice-plan.md §5.4).

   Two sources, in this order:
   1. the dev key: `IO_GEMINI_KEY` from .env.local, injected by
      vite.config.js as the global `__IO_DEV_GEMINI_KEY__` during
      `npm run dev` only (builds define it as ''), and honoured only on
      localhost - never on a LAN-exposed dev server or a deployed page;
   2. the runtime key: pasted by the presenter into the dock and kept in
      this browser's localStorage (the io-chat-gemini pattern). A deployed
      preview never contains a key; the presenter supplies one.

   Nothing here reads import.meta.env, so Node scripts can import it too. */

export const RUNTIME_KEY = 'io.gemini.key'

/* True only inside `vite` dev serves (a build defines the flag as false). */
export function isDevServe() {
  return typeof __IO_DEV_SERVE__ !== 'undefined' && __IO_DEV_SERVE__ === true
}

export function isLocalhost() {
  try {
    const h = globalThis.location?.hostname
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
  } catch {
    return false
  }
}

/* The dev key, or '' anywhere it must not be used. */
export function devKey() {
  if (!isDevServe() || !isLocalhost()) return ''
  return (typeof __IO_DEV_GEMINI_KEY__ !== 'undefined' && __IO_DEV_GEMINI_KEY__) || ''
}

export function runtimeKey() {
  try {
    return globalThis.localStorage?.getItem(RUNTIME_KEY) || ''
  } catch {
    return ''
  }
}

export function setRuntimeKey(key) {
  try {
    const k = (key || '').trim()
    if (k) globalThis.localStorage?.setItem(RUNTIME_KEY, k)
    else globalThis.localStorage?.removeItem(RUNTIME_KEY)
  } catch {
    /* private mode: the key just will not persist */
  }
}

/* The key the chat/TTS paths use: dev key first, then the pasted one. */
export function resolveKey() {
  return devKey() || runtimeKey()
}

/* 'dev' | 'runtime' | 'none' - for the dev badge and the dock's key field. */
export function keySource() {
  if (devKey()) return 'dev'
  if (runtimeKey()) return 'runtime'
  return 'none'
}
