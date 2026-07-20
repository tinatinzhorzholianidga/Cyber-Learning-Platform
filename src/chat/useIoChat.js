import { useCallback, useRef, useState } from 'react'
import { buildSystemPrompt } from '../mascot/ioBrain.js'
import { streamGemini } from './llmClient.js'

/* Chat state for IO: builds a fresh RAG-grounded system prompt per
   question (ioBrain), streams the answer from Gemini (llmClient), and
   keeps a rolling window of recent turns so replies stay coherent. */
export function useIoChat(model) {
  const [messages, setMessages] = useState([]) // {role, content, sources?}
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const genRef = useRef(0)
  const abortRef = useRef(null)

  const send = useCallback(
    async (rawText) => {
      const text = (rawText || '').trim()
      if (!text || busy) return
      setBusy(true)
      setError(null)
      const gen = ++genRef.current

      const { prompt, sources } = buildSystemPrompt(text)
      const history = [...messages, { role: 'user', content: text }]
      setMessages([...history, { role: 'assistant', content: '', sources }])

      const controller = new AbortController()
      abortRef.current = controller

      try {
        let acc = ''
        for await (const chunk of streamGemini({
          model,
          system: prompt,
          history: history.slice(-8), // rolling window
          signal: controller.signal,
        })) {
          if (genRef.current !== gen) return // superseded by reset / new send
          acc += chunk
          setMessages([...history, { role: 'assistant', content: acc, sources }])
        }
        if (!acc && genRef.current === gen) {
          setMessages([...history, { role: 'assistant', content: '…', sources }])
          setError('EMPTY')
        }
      } catch (err) {
        if (genRef.current !== gen) return
        setError(String(err?.message || err))
        setMessages(history) // drop the empty assistant bubble, keep the question
      } finally {
        if (genRef.current === gen) setBusy(false)
      }
    },
    [messages, busy, model],
  )

  const reset = useCallback(() => {
    genRef.current += 1
    abortRef.current?.abort()
    setMessages([])
    setBusy(false)
    setError(null)
  }, [])

  return { messages, busy, error, send, reset }
}
