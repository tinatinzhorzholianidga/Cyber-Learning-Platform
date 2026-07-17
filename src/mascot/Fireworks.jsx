import { useEffect, useRef, useState } from 'react'
import { useMascot } from './MascotProvider.jsx'

/* Canvas-2D fireworks for mission completions. No dependencies, cheap
   (a few hundred particles for ~3.5s), pointer-events none, and under
   prefers-reduced-motion it becomes a single static burst emoji. */
export default function Fireworks() {
  const { fireworksAt } = useMascot()
  const canvasRef = useRef(null)
  const [mode, setMode] = useState(null) // null | 'anim' | 'static'

  useEffect(() => {
    if (!fireworksAt) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setMode(reduced ? 'static' : 'anim')
    const timer = setTimeout(() => setMode(null), reduced ? 1800 : 3800)
    return () => clearTimeout(timer)
  }, [fireworksAt])

  useEffect(() => {
    if (mode !== 'anim') return undefined
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)
    const W = window.innerWidth
    const H = window.innerHeight

    const HUES = [258, 288, 330, 28, 160, 210]
    const rockets = []
    const sparks = []
    let launched = 0
    let raf

    const launch = () => {
      launched += 1
      rockets.push({
        x: W * (0.15 + Math.random() * 0.7),
        y: H + 10,
        vy: -(H * 0.011 + Math.random() * H * 0.004),
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        burstY: H * (0.18 + Math.random() * 0.3),
      })
    }

    const explode = (rocket) => {
      const count = 42 + Math.floor(Math.random() * 22)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
        const speed = 1.4 + Math.random() * 3.4
        sparks.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          hue: rocket.hue + Math.random() * 24 - 12,
        })
      }
    }

    launch()
    const launcher = setInterval(() => {
      if (launched < 6) launch()
      else clearInterval(launcher)
    }, 480)

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y += r.vy
        r.vy += 0.06
        ctx.fillStyle = `hsl(${r.hue} 90% 65%)`
        ctx.fillRect(r.x - 1.5, r.y, 3, 9)
        if (r.y <= r.burstY || r.vy > -1) {
          explode(r)
          rockets.splice(i, 1)
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.045
        s.vx *= 0.985
        s.life -= s.decay
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.globalAlpha = Math.max(s.life, 0)
        ctx.fillStyle = `hsl(${s.hue} 92% ${55 + s.life * 25}%)`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.6 + s.life * 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(launcher)
    }
  }, [mode])

  if (!mode) return null
  return mode === 'anim' ? (
    <canvas ref={canvasRef} className="fireworks-overlay" aria-hidden="true" />
  ) : (
    <div className="fireworks-overlay fireworks-static" aria-hidden="true">
      🎆
    </div>
  )
}
