/* The voice layer's root component, mounted by App.jsx in talk mode next
   to IoHost. It runs the state machine, renders the dock (and, on narrow
   viewports, the transcript sheet), IO's board, and hands IoHost what it
   needs through `onTalk` (docs/io-voice-plan.md §5.1). Discrete changes
   only travel that way; streaming captions re-render the transcript alone. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIoVoice } from './useIoVoice.js'
import { useStore } from './store.js'
import VoiceDock from './VoiceDock.jsx'
import TranscriptPanel from './TranscriptPanel.jsx'
import BoardPanel from './BoardPanel.jsx'
import { VOICE } from './i18n.js'
import { isDevServe } from './auth/devKey.js'
import './voice.css'

function useMedia(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [query])
  return matches
}

export default function IoVoice({ lang, kind, audioContext, embed = false, typedOnly = false, page, onTalk, onExit, onNavigate }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const narrow = useMedia('(max-width: 900px)')
  const exited = useRef(false)
  const leave = useCallback(
    (nav = null) => {
      if (exited.current) return
      exited.current = true
      if (nav) onNavigate?.(nav)
      else onExit()
    },
    [onExit, onNavigate],
  )
  const voice = useIoVoice({ lang, kind, audioContext, page, reduced, onNavigate: (nav) => leave(nav), onEnded: () => leave(null) })
  const face = useStore(voice.store, (s) => s.face)
  const t = VOICE[lang] || VOICE.ka
  // narrow viewports move the full transcript into the sheet; the bubble
  // keeps one compact line so IO still visibly "says" something
  const sheet = narrow || embed
  const transcriptInSheet = narrow && !embed

  const panel = useMemo(
    () => <TranscriptPanel store={voice.store} lang={lang} variant={transcriptInSheet ? 'compact' : 'bubble'} />,
    [voice.store, lang, transcriptInSheet],
  )

  useEffect(() => {
    onTalk({
      emotion: face.emotion,
      gesture: face.gesture,
      listening: face.listening,
      talking: face.talking,
      mouthLevel: voice.mouthLevel,
      label: t.ioLabelTalk,
      panel,
      onInterrupt: voice.interrupt,
    })
  }, [face, panel, t.ioLabelTalk, voice, onTalk])

  // dev serves expose the store and the mouth level for the acceptance scripts
  useEffect(() => {
    if (!isDevServe()) return undefined
    window.__ioVoice = { store: voice.store, mouth: () => voice.mouthLevel.current, api: voice }
    return () => {
      delete window.__ioVoice
    }
  }, [voice])

  const exit = async () => {
    await voice.end()
    leave(null)
  }

  return (
    <VoiceDock
      voice={voice}
      lang={lang}
      sheet={sheet}
      reduced={reduced}
      typedOnly={typedOnly}
      transcript={transcriptInSheet ? <TranscriptPanel store={voice.store} lang={lang} variant="sheet" /> : null}
      board={<BoardPanel store={voice.store} lang={lang} onAnswer={voice.answerQuiz} onClose={voice.clearBoard} />}
      onExit={exit}
    />
  )
}
