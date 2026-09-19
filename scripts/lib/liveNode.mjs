/* A Live API session in Node for the smoke test and the bake-off
   (docs/io-voice-plan.md §2.3, §2.4). Wraps @google/genai's
   `ai.live.connect()` with a timeout - js-genai #1257: connect() may never
   settle when the socket closes before `open` - and turns the callbacks
   into an awaitable message queue. */
import { GoogleGenAI } from '@google/genai'
import { withTimeout } from './env.mjs'

export async function connectLive({ apiKey, model, config, connectTimeoutMs = 10000 }) {
  const ai = new GoogleGenAI({ apiKey })
  const queue = []
  const waiters = []
  const state = { open: false, setupComplete: false, closed: null, error: null }
  const push = (item) => {
    const w = waiters.shift()
    if (w) w(item)
    else queue.push(item)
  }
  const callbacks = {
    onopen: () => {
      state.open = true
    },
    onmessage: (m) => {
      if (m?.setupComplete) state.setupComplete = true
      push({ type: 'message', message: m })
    },
    onerror: (e) => {
      state.error = e?.message || String(e)
      push({ type: 'error', error: state.error })
    },
    onclose: (e) => {
      state.closed = { code: e?.code, reason: e?.reason || '' }
      push({ type: 'close', ...state.closed })
    },
  }
  let session
  try {
    session = await withTimeout(
      ai.live.connect({ model, config, callbacks }),
      connectTimeoutMs,
      `live.connect(${model}) did not complete within ${connectTimeoutMs} ms`,
    )
  } catch (err) {
    err.state = state
    throw err
  }
  return {
    session,
    state,
    /* Next queued item: { type: 'message', message } | { type: 'close', code, reason } | { type: 'error', error } */
    next(ms = 15000) {
      return withTimeout(
        new Promise((resolve) => {
          if (queue.length) resolve(queue.shift())
          else waiters.push(resolve)
        }),
        ms,
        `no server message within ${ms} ms`,
      )
    },
    close() {
      try {
        session.close()
      } catch {
        /* already closed */
      }
    },
  }
}

/* Audio parts of a server message → Uint8Array[] (base64-decoded). */
export function audioChunks(message) {
  const out = []
  for (const part of message?.serverContent?.modelTurn?.parts || []) {
    const data = part.inlineData?.data
    if (data) out.push(new Uint8Array(Buffer.from(data, 'base64')))
  }
  return out
}
