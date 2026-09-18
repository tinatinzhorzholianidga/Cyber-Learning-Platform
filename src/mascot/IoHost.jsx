import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'
import RobotCanvas, { useReducedMotion } from './RobotCanvas.jsx'
import { createHost } from './hostBrain.js'

/* IO as the welcome host: the 3D character plus his speech bubble.

   - on mount he waves and greets (time of day), then introduces himself
   - clicking him walks through his orientation lines
   - the page tells him when a path card is hovered/focused (`hover`) or
     chosen (`farewell`) via the ref
   - lines type out letter by letter unless the visitor prefers reduced
     motion, in which case they appear at once */
const IoHost = forwardRef(function IoHost({ lang = 'ka', size = 340, skin = 'classic', hintLabel = '' }, ref) {
  const reduced = useReducedMotion()
  const host = useMemo(() => createHost({ seed: new Date().getMinutes() }), [])
  const [said, setSaid] = useState(null) // { key, line, mood }
  const [emotion, setEmotion] = useState('happy')
  const [gesture, setGesture] = useState(null)
  const gestureId = useRef(0)
  const timers = useRef([])
  const hovering = useRef(null)
  const lastCycled = useRef(null)

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
    if (!pick) return
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
      if (!hovering.current) {
        const intro = host.intro()
        lastCycled.current = intro
        say(intro)
      }
    }, 6500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTap = () => {
    const pick = host.next()
    lastCycled.current = pick
    say(pick) // the model already waves on tap
  }

  useImperativeHandle(ref, () => ({
    hover(card) {
      hovering.current = card
      say(host.hover(card), { gestureType: card === 'kids' ? 'bounce' : null })
    },
    unhover() {
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
      say(host.farewell(), { gestureType: 'bounce' })
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
    let i = 0
    const iv = setInterval(() => {
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(iv)
    }, 22)
    return () => clearInterval(iv)
  }, [text, reduced])

  const talking = Boolean(text) && shown.length < text.length

  return (
    <div className="io-host">
      <div className="io-bubble" role="status" aria-live="polite" aria-atomic="true" data-empty={!text || undefined}>
        <p>{shown || ' '}</p>
      </div>
      <RobotCanvas
        size={size}
        skin={skin}
        label={hintLabel}
        emotion={emotion}
        gesture={gesture}
        talking={talking}
        follow
        idle
        onTap={onTap}
      />
    </div>
  )
})

export default IoHost
