import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'
import RobotCanvas, { useReducedMotion } from './RobotCanvas.jsx'
import { createHost } from './hostBrain.js'

/* IO as the welcome host: the 3D character plus his speech bubble.

   - on mount he waves and greets (time of day), then introduces himself
   - clicking him walks through his orientation lines
   - the page tells him when a path card is hovered/focused (`hover`) or
     chosen (`farewell`) via the ref
   - lines type out letter by letter unless the visitor prefers reduced
     motion, in which case they appear at once

   Talk mode (docs/io-voice-plan.md §5.1): with `mode="talk"` the voice
   layer drives him through the `talk` bundle { emotion, gesture,
   mouthLevel, talking, listening, label, panel, onInterrupt }: the bubble
   keeps its element (no re-mount, no replayed rise) and shows `panel`
   (the transcript) at a fixed height, a click on IO interrupts him
   instead of cycling lines, and the host timers stay quiet. Leaving talk
   mode resumes the host exactly where the drift-back rule would. */
const IoHost = forwardRef(function IoHost(
  { lang = 'ka', size = 340, skin = 'classic', hintLabel = '', mode = 'host', talk = null },
  ref,
) {
  const reduced = useReducedMotion()
  const host = useMemo(() => createHost({ seed: new Date().getMinutes() }), [])
  const [said, setSaid] = useState(null) // { key, line, mood }
  const [emotion, setEmotion] = useState('happy')
  const [gesture, setGesture] = useState(null)
  const gestureId = useRef(0)
  const timers = useRef([])
  const hovering = useRef(null) // the card IO is reacting to right now
  const hoverSources = useRef(new Map()) // 'mouse' | 'focus' -> the card that input is on
  const lastCycled = useRef(null)
  const inTalk = mode === 'talk'
  const modeRef = useRef(mode) // timer callbacks read the current mode
  modeRef.current = mode
  const talkRef = useRef(talk)
  talkRef.current = talk

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }
  const clearLater = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearLater, [])

  const fireGesture = (type) => {
    gestureId.current += 1
    setGesture({ id: gestureId.current, type })
  }

  const say = (pick, { gestureType } = {}) => {
    if (!pick || modeRef.current === 'talk') return
    setSaid(pick)
    setEmotion(pick.mood)
    if (gestureType && !reduced) fireGesture(gestureType)
    // a sleepy evening hello wakes up after a moment (unless something
    // else already changed his mood, e.g. a hovered card)
    if (pick.mood === 'sleepy') later(() => setEmotion((e) => (e === 'sleepy' ? 'happy' : e)), 2600)
  }

  // entrance: wave, greet, then introduce himself
  useEffect(() => {
    later(() => say(host.greet(), { gestureType: 'wave' }), reduced ? 0 : 500)
    later(() => {
      // skip if a card is being hovered, or IO already moved on (a click
      // or an early drift-back has set his current line)
      if (hovering.current || lastCycled.current) return
      const intro = host.intro()
      lastCycled.current = intro
      say(intro)
    }, 6500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // mode transitions: entering talk mode silences the host (pending
  // timers, gesture, hover bookkeeping); leaving it applies the drift-back
  // rule - the line he was on, or his intro if the visitor came before it
  const prevMode = useRef(mode)
  useEffect(() => {
    if (prevMode.current === mode) return
    prevMode.current = mode
    setGesture(null)
    if (mode === 'talk') {
      clearLater()
      hovering.current = null
      hoverSources.current.clear()
    } else {
      if (!lastCycled.current) lastCycled.current = host.intro()
      say(lastCycled.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const onTap = () => {
    if (modeRef.current === 'talk') {
      talkRef.current?.onInterrupt?.()
      return
    }
    const pick = host.next()
    lastCycled.current = pick
    // a pointer tap already waves inside the model; firing the same wave
    // here gives keyboard taps (Enter / Space) the reaction too
    say(pick, { gestureType: 'wave' })
  }

  const reactTo = (card) => {
    if (hovering.current === card) return // already on it via the other input - keep the line
    hovering.current = card
    say(host.hover(card), { gestureType: card === 'kids' ? 'bounce' : null })
  }

  useImperativeHandle(ref, () => ({
    /* `source` is 'mouse' or 'focus' - both can rest on a card at once
       (a click focuses the link first), so IO only reacts to a change of
       card, not to every input event */
    hover(card, source = 'mouse') {
      if (modeRef.current === 'talk') return
      hoverSources.current.set(source, card)
      reactTo(card)
    },
    unhover(source = 'mouse') {
      if (modeRef.current === 'talk') return
      hoverSources.current.delete(source)
      const still = [...hoverSources.current.values()][0]
      if (still) {
        reactTo(still) // the other input is still on a card
        return
      }
      hovering.current = null
      // drift back to what he was saying before the visitor peeked; if
      // the peek came before his intro, introduce himself now
      later(() => {
        if (hovering.current) return
        if (!lastCycled.current) lastCycled.current = host.intro()
        say(lastCycled.current)
      }, 1400)
    },
    farewell() {
      const bye = host.farewell()
      lastCycled.current = bye // so a later drift-back keeps the goodbye
      say(bye, { gestureType: 'bounce' })
    },
  }))

  // typewriter for the bubble
  const text = said ? said.line[lang] : ''
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!text) {
      setShown('')
      return undefined
    }
    if (reduced) {
      setShown(text)
      return undefined
    }
    setShown('')
    const chars = Array.from(text) // code points, so an emoji is never cut in half
    let i = 0
    const iv = setInterval(() => {
      i += 2
      setShown(chars.slice(0, i).join(''))
      if (i >= chars.length) clearInterval(iv)
    }, 22)
    return () => clearInterval(iv)
  }, [text, reduced])

  const talking = Boolean(text) && shown.length < text.length

  return (
    <div className="io-host" data-mode={inTalk ? 'talk' : undefined}>
      <div className="io-bubble" data-empty={(!inTalk && !text) || undefined}>
        {inTalk ? (
          talk?.panel ?? null
        ) : (
          <>
            {/* the typed text is for the eyes; screen readers get the whole
                line once, from the hidden live region */}
            <p aria-hidden="true">{shown || ' '}</p>
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {text}
            </span>
          </>
        )}
      </div>
      <RobotCanvas
        size={size}
        skin={skin}
        label={inTalk ? talk?.label || hintLabel : hintLabel}
        emotion={inTalk ? talk?.emotion || 'happy' : emotion}
        gesture={inTalk ? talk?.gesture || null : gesture}
        talking={inTalk ? Boolean(talk?.talking) : talking}
        mouthLevel={inTalk ? talk?.mouthLevel || null : null}
        listening={inTalk && Boolean(talk?.listening)}
        tapReaction={!inTalk}
        follow
        idle
        onTap={onTap}
      />
    </div>
  )
})

export default IoHost
