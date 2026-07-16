import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* Hero (გმირა) - the hooded guardian, matched to the character sheet:
   teardrop face opening with glowing eyes, smooth tapering hood antenna,
   dark ink body with stubby arms and legs, a breathing shield-padlock
   emblem, a big double-mesh cape (violet outside, lighter lining) with
   per-frame cloth simulation, and a soft glow aura behind him.
   Gestures: wave, bounce, spin and the signature FLY pose. Rare idle
   antics (peek at the emblem, hop, yawn, wiggle) keep him alive. */

const C = {
  cloak: '#7c63f0',
  cloakLip: '#9d84ff',
  capeOut: '#8b74f5',
  capeIn: '#b7a6ff',
  ink: '#2b2350',
  inkSoft: '#38305e',
  eye: '#ffffff',
}

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const damp = (cur, target, lambda, dt) => cur + (target - cur) * Math.min(1, lambda * dt)

/* arm pivot rotation targets [x, z] per emotion; x < 0 raises the arm
   forward/up, z swings it away from the body (mirrored for the right) */
const POSES = {
  happy: { L: [-0.15, 0.45], R: [-0.15, 0.45], sit: 0, mouth: 0, lean: 0 },
  excited: { L: [-2.25, 0.4], R: [-2.25, 0.4], sit: 0, mouth: 1, lean: -0.04 },
  funny: { L: [-1.55, 0.55], R: [-0.5, 0.1], sit: 0, mouth: 1, lean: 0.08 },
  wink: { L: [-0.15, 0.45], R: [-2.5, 0.35], sit: 0, mouth: 0.6, lean: 0 },
  thinking: { L: [-0.2, 0.25], R: [-2.35, -0.12], sit: 0, mouth: 0, lean: 0.05 },
  celebrate: { L: [-2.85, 0.5], R: [-2.85, 0.5], sit: 0, mouth: 1, lean: -0.05 },
  surprised: { L: [-1.7, 0.7], R: [-1.7, 0.7], sit: 0, mouth: 0.8, lean: -0.03 },
  sleepy: { L: [-0.5, 0.2], R: [-0.5, 0.2], sit: 1, mouth: 0, lean: 0.1 },
  sad: { L: [0.15, 0.1], R: [0.15, 0.1], sit: 0, mouth: 0, lean: 0.12 },
}

const ANTICS = ['peek', 'hop', 'yawn', 'wiggle']
const ANTIC_DUR = 1.9

function makeTextTexture(text, { size = 96, color = '#2b2350', rotate = 0 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const g = canvas.getContext('2d')
  g.translate(128, 128)
  g.rotate(rotate)
  g.fillStyle = color
  g.font = `800 ${size}px "Noto Sans Georgian Variable", "Arial Black", sans-serif`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const lines = text.split('\n')
  lines.forEach((line, i) => g.fillText(line, 0, (i - (lines.length - 1) / 2) * size * 1.05))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* glowing shield + padlock chest emblem, drawn once */
function makeEmblemTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const g = canvas.getContext('2d')
  const shield = () => {
    g.beginPath()
    g.moveTo(128, 26)
    g.quadraticCurveTo(180, 52, 216, 56)
    g.quadraticCurveTo(216, 160, 128, 230)
    g.quadraticCurveTo(40, 160, 40, 56)
    g.quadraticCurveTo(76, 52, 128, 26)
    g.closePath()
  }
  g.shadowColor = '#b9a6ff'
  g.shadowBlur = 26
  g.fillStyle = 'rgba(139, 108, 255, 0.6)'
  shield()
  g.fill()
  g.shadowBlur = 18
  g.strokeStyle = '#e9e2ff'
  g.lineWidth = 12
  shield()
  g.stroke()
  // padlock
  g.shadowBlur = 14
  g.strokeStyle = '#ffffff'
  g.lineWidth = 11
  g.beginPath()
  g.arc(128, 108, 26, Math.PI, 0)
  g.stroke()
  g.fillStyle = '#ffffff'
  const r = 12
  g.beginPath()
  g.moveTo(88 + r, 104)
  g.arcTo(168, 104, 168, 168, r)
  g.arcTo(168, 168, 88, 168, r)
  g.arcTo(88, 168, 88, 104, r)
  g.arcTo(88, 104, 168, 104, r)
  g.closePath()
  g.fill()
  g.shadowBlur = 0
  g.fillStyle = '#4a3ca8'
  g.beginPath()
  g.arc(128, 130, 8, 0, Math.PI * 2)
  g.fill()
  g.fillRect(124, 130, 8, 18)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* soft radial aura, like the glow ring behind him on the sheet */
function makeAuraTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const g = canvas.getContext('2d')
  const grad = g.createRadialGradient(128, 128, 20, 128, 128, 126)
  grad.addColorStop(0, 'rgba(139, 92, 255, 0.5)')
  grad.addColorStop(0.55, 'rgba(139, 92, 255, 0.24)')
  grad.addColorStop(1, 'rgba(139, 92, 255, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

/* teardrop face: a bulged dark plate + a tube lip along its outline */
function useTeardropFace() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0.56)
    shape.bezierCurveTo(0.13, 0.47, 0.3, 0.28, 0.34, 0.04)
    shape.bezierCurveTo(0.37, -0.22, 0.22, -0.42, 0, -0.44)
    shape.bezierCurveTo(-0.22, -0.42, -0.37, -0.22, -0.34, 0.04)
    shape.bezierCurveTo(-0.3, 0.28, -0.13, 0.47, 0, 0.56)

    const bulge = (x, y) => {
      const r2 = (x / 0.4) ** 2 + ((y - 0.04) / 0.55) ** 2
      return 0.2 * Math.pow(Math.max(0, 1 - r2), 0.7)
    }

    const plate = new THREE.ShapeGeometry(shape, 24)
    const pos = plate.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, bulge(pos.getX(i), pos.getY(i)))
    plate.computeVertexNormals()

    const outline = shape
      .getPoints(72)
      .map((p) => new THREE.Vector3(p.x, p.y, bulge(p.x, p.y)))
    const curve = new THREE.CatmullRomCurve3(outline, true)
    const lip = new THREE.TubeGeometry(curve, 110, 0.055, 12, true)
    return { plate, lip }
  }, [])
}

/* smooth tapering hood antenna with a curl */
function useAntenna() {
  return useMemo(() => {
    const v = (x, y, z) => new THREE.Vector3(x, y, z)
    const curve = new THREE.CatmullRomCurve3([
      v(0, -0.04, 0),
      v(0.02, 0.14, -0.01),
      v(0.1, 0.28, -0.03),
      v(0.26, 0.34, -0.06),
      v(0.41, 0.28, -0.09),
      v(0.49, 0.15, -0.1),
    ])
    const RADIAL = 10
    const TUBULAR = 48
    const geo = new THREE.TubeGeometry(curve, TUBULAR, 0.08, RADIAL, false)
    const pos = geo.attributes.position
    const center = new THREE.Vector3()
    for (let i = 0; i <= TUBULAR; i++) {
      const t = i / TUBULAR
      curve.getPointAt(t, center)
      const f = 1 - 0.82 * t
      for (let j = 0; j <= RADIAL; j++) {
        const idx = i * (RADIAL + 1) + j
        pos.setXYZ(
          idx,
          center.x + (pos.getX(idx) - center.x) * f,
          center.y + (pos.getY(idx) - center.y) * f,
          center.z + (pos.getZ(idx) - center.z) * f,
        )
      }
    }
    geo.computeVertexNormals()
    const tipPoint = curve.getPointAt(1)
    return { geo, tipPoint }
  }, [])
}

/* cape: swallow-tailed plane, narrow at the shoulders, wide at the hem */
function useCape() {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1.7, 24, 20)
    const pos = geo.attributes.position
    const base = new Float32Array(pos.count * 3)
    const vs = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const v = clamp01((0.85 - y) / 1.7) // 0 shoulders → 1 hem
      const xn = x * 2 // -1..1
      const nx = x * (0.5 + 1.6 * v)
      const ny = y - 0.3 * Math.pow(Math.abs(xn), 1.6) * v // swallow tail
      pos.setX(i, nx)
      pos.setY(i, ny)
      base[i * 3] = nx
      base[i * 3 + 1] = ny
      base[i * 3 + 2] = 0
      vs[i] = v
    }
    return { geo, base, vs }
  }, [])
}

export default function HeroModel({
  emotion = 'happy',
  gesture = null, // { id, type: 'wave' | 'bounce' | 'spin' | 'fly' }
  talking = false,
  follow = true,
  idle = true,
  reducedMotion = false,
  onTap,
}) {
  const invalidate = useThree((s) => s.invalidate)
  const root = useRef()
  const tilt = useRef()
  const capeMesh = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const arcL = useRef()
  const arcR = useRef()
  const eyesGroup = useRef()
  const mouth = useRef()
  const tip = useRef()
  const armL = useRef()
  const armR = useRef()
  const legL = useRef()
  const legR = useRef()
  const marks = useRef()
  const stars = useRef()
  const shadow = useRef()
  const emblem = useRef()
  const emblemMat = useRef()
  const auraMat = useRef()

  const { plate, lip } = useTeardropFace()
  const { geo: antennaGeo, tipPoint } = useAntenna()
  const { geo: capeGeo, base: capeBase, vs: capeVs } = useCape()
  useEffect(
    () => () => {
      plate.dispose()
      lip.dispose()
      antennaGeo.dispose()
      capeGeo.dispose()
    },
    [plate, lip, antennaGeo, capeGeo],
  )

  const emblemTexture = useMemo(makeEmblemTexture, [])
  const auraTexture = useMemo(makeAuraTexture, [])
  const markTextures = useMemo(
    () => ({
      thinking: makeTextTexture('?', { size: 150, color: '#6c5ce7', rotate: 0.12 }),
      sleepy: makeTextTexture('z z', { size: 80, color: '#6c5ce7', rotate: -0.1 }),
      funny: makeTextTexture('HA\nHA', { size: 76, color: '#6c5ce7', rotate: 0.14 }),
    }),
    [],
  )
  useEffect(
    () => () => {
      emblemTexture.dispose()
      auraTexture.dispose()
      Object.values(markTextures).forEach((t) => t.dispose())
    },
    [emblemTexture, auraTexture, markTextures],
  )

  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const g = canvas.getContext('2d')
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62)
    grad.addColorStop(0, 'rgba(43,35,80,0.32)')
    grad.addColorStop(1, 'rgba(43,35,80,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])
  useEffect(() => () => shadowTexture.dispose(), [shadowTexture])

  const anim = useRef({
    lastGestureId: null,
    gesture: null,
    pendingTap: false,
    blinkAt: 2.4,
    blink: 0,
    pupil: { x: 0, y: 0 },
    spring: { s: 1, v: 0 },
    overlay: null,
    sit: 0,
    antic: null, // { type, start, hopped }
    nextAnticAt: 13,
    anticSeed: 0,
  })

  useEffect(() => {
    invalidate()
  }, [emotion, invalidate])

  useFrame((state, delta) => {
    const a = anim.current
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    if (a.pendingTap) {
      a.pendingTap = false
      if (!reducedMotion) {
        a.spring.v = -3.6
        a.overlay = { emotion: 'excited', until: t + 1.8 }
        a.gesture = { type: 'wave', start: t }
        a.antic = null
      }
    }
    if (gesture && gesture.id !== a.lastGestureId) {
      a.lastGestureId = gesture.id
      if (!reducedMotion) {
        a.gesture = { type: gesture.type, start: t }
        a.antic = null
        if (gesture.type === 'bounce') a.spring.v = -3.2
        a.overlay = {
          emotion:
            gesture.type === 'spin'
              ? 'surprised'
              : gesture.type === 'bounce'
                ? 'celebrate'
                : 'excited',
          until: t + (gesture.type === 'fly' ? 2.9 : 1.9),
        }
      }
    }
    if (a.overlay && t > a.overlay.until) a.overlay = null
    const emo = a.overlay ? a.overlay.emotion : emotion
    const pose = POSES[emo] ?? POSES.happy
    const sleepy = emo === 'sleepy'
    const arcs = emo === 'celebrate' || emo === 'funny'

    /* ---- rare idle antics: peek / hop / yawn / wiggle ---- */
    if (
      !reducedMotion &&
      idle &&
      !a.gesture &&
      !a.overlay &&
      !a.antic &&
      emotion === 'happy' &&
      t >= a.nextAnticAt
    ) {
      a.antic = { type: ANTICS[a.anticSeed % ANTICS.length], start: t, hopped: false }
      a.anticSeed += 1
      a.nextAnticAt = t + 13 + Math.random() * 9
    }
    let antic = null
    let anticB = 0
    if (a.antic) {
      const e = t - a.antic.start
      if (e >= ANTIC_DUR || a.gesture) a.antic = null
      else {
        antic = a.antic
        anticB = clamp01(e / 0.3) * clamp01((ANTIC_DUR - e) / 0.4)
      }
    }

    /* ---- sit down / stand up ---- */
    a.sit = damp(a.sit, reducedMotion ? 0 : pose.sit, 3.5, dt)
    const sit = a.sit

    /* ---- blink ---- */
    if (!reducedMotion && t >= a.blinkAt) {
      const phase = (t - a.blinkAt) / 0.22
      a.blink = phase >= 1 ? 0 : Math.sin(Math.min(phase, 1) * Math.PI)
      if (phase >= 1) a.blinkAt = t + 2.6 + Math.random() * 3.4
    }
    let blinkScale = 1 - a.blink * 0.9
    if (antic?.type === 'yawn') blinkScale = Math.min(blinkScale, 1 - anticB * 0.7)

    /* ---- gaze ---- */
    const p = state.pointer ?? state.mouse
    const wanderX = Math.sin(t * 0.35) * 0.3 + Math.sin(t * 0.14 + 1.8) * 0.18
    const wanderY = Math.sin(t * 0.26 + 0.9) * 0.2
    let gx = reducedMotion ? 0 : follow ? p.x : idle ? wanderX : 0
    let gy = reducedMotion ? 0 : follow ? -p.y : idle ? wanderY : 0
    if (antic?.type === 'peek') {
      gx = 0
      gy = -0.95 // look down at the emblem
    }
    a.pupil.x = damp(a.pupil.x, gx, 7, dt)
    a.pupil.y = damp(a.pupil.y, gy, 7, dt)

    /* ---- eyes ---- */
    const eyeTargets = {
      scaleY: sleepy ? 0.14 : 1,
      scaleX: emo === 'surprised' || emo === 'excited' ? 1.25 : 1,
      rotZ: emo === 'sad' ? 0.3 : 0,
      offY: emo === 'thinking' ? 0.07 : emo === 'sad' ? -0.04 : 0,
      offX: emo === 'thinking' ? -0.06 : 0,
    }
    for (const [ref, side] of [
      [eyeL, -1],
      [eyeR, 1],
    ]) {
      const e = ref.current
      if (!e) continue
      const winkShut = emo === 'wink' && side === 1
      const sy = (winkShut ? 0.12 : eyeTargets.scaleY) * blinkScale
      e.scale.y = damp(e.scale.y, Math.max(0.08, sy), 12, dt)
      e.scale.x = damp(e.scale.x, eyeTargets.scaleX, 12, dt)
      e.rotation.z = damp(e.rotation.z, eyeTargets.rotZ * -side, 10, dt)
      e.visible = !arcs
    }
    if (arcL.current) arcL.current.visible = arcs
    if (arcR.current) arcR.current.visible = arcs
    if (eyesGroup.current) {
      eyesGroup.current.position.x = damp(eyesGroup.current.position.x, eyeTargets.offX + a.pupil.x * 0.05, 8, dt)
      eyesGroup.current.position.y = damp(eyesGroup.current.position.y, eyeTargets.offY + a.pupil.y * 0.04, 8, dt)
    }

    /* ---- mouth ---- */
    if (mouth.current) {
      const talkOpen = talking ? 0.55 + 0.45 * Math.sin(t * 10) : 0
      const yawnOpen = antic?.type === 'yawn' ? anticB * 1.1 : 0
      const open = Math.max(pose.mouth, talkOpen, yawnOpen)
      const s = damp(mouth.current.scale.x, open, 10, dt)
      mouth.current.scale.set(s, s * (talking ? 0.7 + 0.3 * Math.sin(t * 10 + 1) : 1), s)
      mouth.current.visible = s > 0.05
    }

    /* ---- floating marks (?, zzz, HA HA) ---- */
    if (marks.current) {
      marks.current.children.forEach((m) => {
        const on = m.userData.emo === emo
        m.visible = on
        if (on) {
          m.material.opacity = damp(m.material.opacity, 0.95, 6, dt)
          if (emo === 'sleepy') {
            m.position.y = m.userData.baseY + ((t * 0.22) % 0.5)
            m.material.opacity = 0.95 - (((t * 0.22) % 0.5) / 0.5) * 0.6
          } else {
            m.position.y = m.userData.baseY + Math.sin(t * 2) * 0.03
            m.rotation.z = Math.sin(t * 2.6) * 0.08
          }
        } else {
          m.material.opacity = 0
        }
      })
    }

    /* ---- sparkle stars ---- */
    if (stars.current) {
      const flying = a.gesture?.type === 'fly'
      stars.current.visible = emo === 'celebrate' || emo === 'excited' || flying
      if (stars.current.visible) {
        stars.current.children.forEach((star, i) => {
          const ang = t * 1.8 + (i * Math.PI * 2) / 3
          star.position.set(Math.cos(ang) * 1.15, 0.85 + Math.sin(t * 3 + i * 2) * 0.14, Math.sin(ang) * 0.45)
          star.rotation.y = t * 3 + i
          star.rotation.z = t * 2
        })
      }
    }

    /* ---- gestures: arms/legs/motion overrides ---- */
    let armLTarget = pose.L
    let armRTarget = pose.R
    let waveWiggle = 0
    let hop = 0
    let flyB = 0
    let flyDriftX = 0
    if (!reducedMotion && a.gesture) {
      const e = t - a.gesture.start
      if (a.gesture.type === 'wave') {
        const dur = 1.7
        if (e >= dur) a.gesture = null
        else {
          const b = clamp01(e / 0.2) * clamp01((dur - e) / 0.25)
          armRTarget = [-2.35, 0.75]
          waveWiggle = Math.sin(e * 10) * 0.55 * b
        }
      } else if (a.gesture.type === 'bounce') {
        const dur = 0.85
        if (e >= dur) {
          a.gesture = null
          a.spring.v = -2
        } else {
          hop = Math.sin((e / dur) * Math.PI) * 0.42
        }
      } else if (a.gesture.type === 'spin') {
        const dur = 0.95
        if (e >= dur) a.gesture = null
      } else if (a.gesture.type === 'fly') {
        // the signature pose: fist forward-up, legs trailing, cape streaming
        const dur = 2.8
        if (e >= dur) a.gesture = null
        else {
          flyB = clamp01(e / 0.35) * clamp01((dur - e) / 0.45)
          flyDriftX = Math.sin(e * 2.1) * 0.24 * flyB
          armRTarget = [-2.9, 0.12]
          armLTarget = [0.9, 0.3]
        }
      }
    }

    /* ---- antic arm overrides ---- */
    if (antic?.type === 'peek') {
      armRTarget = [-1.75, -0.18] // hand toward the emblem
    } else if (antic?.type === 'yawn') {
      armLTarget = [-2.5, 0.7]
      armRTarget = [-2.5, 0.7]
    } else if (antic?.type === 'hop' && !antic.hopped) {
      antic.hopped = true
      a.spring.v = -2.6
    }

    const swing = idle && !reducedMotion ? Math.sin(t * 1.3) * 0.05 : 0
    if (armL.current) {
      armL.current.rotation.x = damp(armL.current.rotation.x, armLTarget[0], 8, dt)
      armL.current.rotation.z = damp(armL.current.rotation.z, armLTarget[1] + swing, 8, dt)
    }
    if (armR.current) {
      armR.current.rotation.x = damp(armR.current.rotation.x, armRTarget[0], 8, dt)
      armR.current.rotation.z = damp(armR.current.rotation.z, -(armRTarget[1] + swing) + waveWiggle, 10, dt)
    }

    /* ---- legs: dangle floating, fold when sitting, trail when flying ---- */
    const dangle = idle && !reducedMotion ? Math.sin(t * 1.6) * 0.12 * (1 - sit) : 0
    const legBase = -1.35 * sit + 0.85 * flyB
    if (legL.current) legL.current.rotation.x = damp(legL.current.rotation.x, legBase + dangle, 6, dt)
    if (legR.current) legR.current.rotation.x = damp(legR.current.rotation.x, legBase - dangle, 6, dt)

    /* ---- breathing emblem + aura pulse (also in reduced motion: static) ---- */
    if (emblemMat.current) emblemMat.current.opacity = reducedMotion ? 1 : 0.75 + 0.25 * Math.sin(t * 1.7)
    if (emblem.current) {
      const es = reducedMotion ? 1 : 1 + 0.025 * Math.sin(t * 1.7)
      emblem.current.scale.set(es, es, 1)
    }
    if (auraMat.current) auraMat.current.opacity = reducedMotion ? 0.5 : 0.44 + 0.1 * Math.sin(t * 0.9)

    if (reducedMotion) return

    /* ---- hover float / sit / fly ---- */
    const pace = sleepy ? 0.55 : emo === 'excited' || emo === 'celebrate' ? 2 : 1.1
    const floatY = idle ? Math.sin(t * pace) * 0.07 : 0
    let anticHopY = 0
    if (antic?.type === 'hop') {
      const e = t - antic.start
      if (e < 0.55) anticHopY = Math.sin((e / 0.55) * Math.PI) * 0.22
    }
    const y = (floatY + hop + anticHopY) * (1 - sit) - 0.38 * sit + 0.5 * flyB

    const sp = a.spring
    sp.v += ((1 - sp.s) * 120 - sp.v * 10) * dt
    sp.s += sp.v * dt

    if (root.current) {
      root.current.position.y = y
      root.current.position.x = flyDriftX
      const talkPulse = talking ? 1 + Math.sin(t * 9) * 0.01 : 1
      root.current.scale.set((1 + (1 - sp.s) * 0.4) * talkPulse, sp.s * talkPulse, (1 + (1 - sp.s) * 0.4) * talkPulse)
    }
    if (tilt.current) {
      const ry = follow ? p.x * 0.38 : idle ? wanderX * 0.22 : 0
      let rx = (follow ? -p.y * 0.14 : idle ? wanderY * 0.08 : 0) + pose.lean + 0.15 * sit
      rx += -0.1 * flyB // slight lean while flying (fist/legs/cape sell the pose)
      if (antic?.type === 'peek') rx += 0.28 * anticB
      tilt.current.rotation.y = damp(tilt.current.rotation.y, ry, 5, dt)
      tilt.current.rotation.x = damp(tilt.current.rotation.x, rx, 5, dt)
      let sway = idle ? Math.sin(t * pace * 0.8) * 0.04 : 0
      if (a.gesture?.type === 'spin') {
        const e = t - a.gesture.start
        tilt.current.rotation.y += easeInOut(Math.min(e / 0.95, 1)) * Math.PI * 2
      }
      if (a.gesture?.type === 'wave') sway += Math.sin(t * 10) * 0.02
      if (antic?.type === 'wiggle') sway += Math.sin(t * 10) * 0.08 * anticB
      tilt.current.rotation.z = damp(tilt.current.rotation.z, sway, 6, dt)
    }
    if (tip.current) {
      let flick = Math.sin(t * (sleepy ? 0.8 : 2)) * 0.14
      if (antic?.type === 'wiggle') flick += Math.sin(t * 11) * 0.3 * anticB
      flick += 0.3 * flyB
      tip.current.rotation.z = flick
    }

    /* ---- cape flow (streams harder while flying) ---- */
    if (capeMesh.current) {
      const speed = (sleepy ? 1 : 2.2) * (1 + 0.8 * flyB)
      const amp = (sleepy ? 0.5 : 1) * (1 - 0.55 * sit) * (1 + 1.4 * flyB)
      const pos = capeMesh.current.geometry.attributes.position
      const arr = pos.array
      for (let i = 0; i < pos.count; i++) {
        const v = capeVs[i]
        if (v === 0) continue
        const bx = capeBase[i * 3]
        const by = capeBase[i * 3 + 1]
        arr[i * 3] = bx + Math.sin(t * 1.8 + v * 3) * 0.05 * v * amp
        arr[i * 3 + 1] = by
        arr[i * 3 + 2] =
          (Math.sin(bx * 2.4 + t * speed) * 0.15 + Math.sin(v * 3.8 - t * speed * 1.3) * 0.09) * v * amp -
          0.16 * v * v +
          0.5 * v * flyB
      }
      pos.needsUpdate = true
      capeMesh.current.geometry.computeVertexNormals()
    }

    /* ---- ground shadow ---- */
    if (shadow.current) {
      const lift = clamp01((y + 0.65) / 0.9)
      shadow.current.material.opacity = 0.45 + (1 - lift) * 0.35
      const s = 0.85 + (1 - lift) * 0.25
      shadow.current.scale.set(s, s, s)
    }
  })

  const handleTap = (e) => {
    e.stopPropagation()
    anim.current.pendingTap = true
    onTap?.()
    invalidate()
  }

  const inkMat = { color: C.ink, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 }
  const cloakMat = { color: C.cloak, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.35 }

  return (
    <group position={[0, 0.1, 0]} scale={1.22}>
      {/* rim light from behind so his dark body pops */}
      <pointLight position={[0, 1.6, -2.4]} intensity={10} color="#b9a6ff" />

      {/* soft glow aura behind him */}
      <mesh position={[0, 0.1, -1.1]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial ref={auraMat} map={auraTexture} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <group ref={root}>
        <group
          ref={tilt}
          onPointerDown={handleTap}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          {/* torso */}
          <mesh position={[0, -0.32, 0]} scale={[1, 1.08, 0.85]}>
            <sphereGeometry args={[0.42, 40, 30]} />
            <meshPhysicalMaterial {...inkMat} />
          </mesh>

          {/* chest emblem: glowing shield + padlock, breathing */}
          <mesh ref={emblem} position={[0, -0.27, 0.39]} rotation={[-0.06, 0, 0]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial ref={emblemMat} map={emblemTexture} transparent toneMapped={false} depthWrite={false} />
          </mesh>

          {/* hood shell */}
          <mesh position={[0, 0.45, 0]} scale={[1, 1.04, 1]}>
            <sphereGeometry args={[0.6, 48, 36]} />
            <meshPhysicalMaterial {...cloakMat} />
          </mesh>

          {/* dark backing inside the hood */}
          <mesh position={[0, 0.44, 0.18]}>
            <sphereGeometry args={[0.42, 40, 28]} />
            <meshPhysicalMaterial color={C.ink} roughness={0.55} clearcoat={0.25} />
          </mesh>

          {/* teardrop face plate + lip around the opening */}
          <group position={[0, 0.4, 0.44]} scale={0.85}>
            <mesh geometry={plate}>
              <meshPhysicalMaterial color={C.ink} roughness={0.55} clearcoat={0.25} />
            </mesh>
            <mesh geometry={lip}>
              <meshPhysicalMaterial color={C.cloakLip} roughness={0.4} clearcoat={0.5} />
            </mesh>
          </group>

          {/* glowing eyes */}
          <group ref={eyesGroup}>
            <group ref={eyeL} position={[-0.13, 0.48, 0.61]}>
              <mesh>
                <capsuleGeometry args={[0.072, 0.078, 6, 14]} />
                <meshBasicMaterial color={C.eye} toneMapped={false} />
              </mesh>
            </group>
            <group ref={eyeR} position={[0.13, 0.48, 0.61]}>
              <mesh>
                <capsuleGeometry args={[0.072, 0.078, 6, 14]} />
                <meshBasicMaterial color={C.eye} toneMapped={false} />
              </mesh>
            </group>
            <mesh ref={arcL} position={[-0.13, 0.48, 0.61]} visible={false}>
              <torusGeometry args={[0.072, 0.027, 10, 20, Math.PI]} />
              <meshBasicMaterial color={C.eye} toneMapped={false} />
            </mesh>
            <mesh ref={arcR} position={[0.13, 0.48, 0.61]} visible={false}>
              <torusGeometry args={[0.072, 0.027, 10, 20, Math.PI]} />
              <meshBasicMaterial color={C.eye} toneMapped={false} />
            </mesh>
            {/* open laughing mouth */}
            <mesh ref={mouth} position={[0, 0.31, 0.6]} visible={false} scale={0}>
              <sphereGeometry args={[0.08, 20, 14]} />
              <meshBasicMaterial color={C.eye} toneMapped={false} />
            </mesh>
          </group>

          {/* smooth tapering antenna with a tip bead */}
          <group ref={tip} position={[0, 1.02, -0.03]}>
            <mesh geometry={antennaGeo}>
              <meshPhysicalMaterial {...cloakMat} />
            </mesh>
            <mesh position={tipPoint}>
              <sphereGeometry args={[0.035, 12, 10]} />
              <meshPhysicalMaterial {...cloakMat} />
            </mesh>
          </group>

          {/* arms: shoulder pivots, stubby limbs, fist hands */}
          <group ref={armL} position={[-0.4, -0.12, 0.02]}>
            <mesh position={[-0.04, -0.14, 0]} rotation={[0, 0, 0.25]}>
              <capsuleGeometry args={[0.08, 0.2, 6, 14]} />
              <meshPhysicalMaterial {...inkMat} />
            </mesh>
            <mesh position={[-0.09, -0.3, 0]}>
              <sphereGeometry args={[0.115, 20, 16]} />
              <meshPhysicalMaterial color={C.inkSoft} roughness={0.45} clearcoat={0.4} />
            </mesh>
          </group>
          <group ref={armR} position={[0.4, -0.12, 0.02]}>
            <mesh position={[0.04, -0.14, 0]} rotation={[0, 0, -0.25]}>
              <capsuleGeometry args={[0.08, 0.2, 6, 14]} />
              <meshPhysicalMaterial {...inkMat} />
            </mesh>
            <mesh position={[0.09, -0.3, 0]}>
              <sphereGeometry args={[0.115, 20, 16]} />
              <meshPhysicalMaterial color={C.inkSoft} roughness={0.45} clearcoat={0.4} />
            </mesh>
          </group>

          {/* legs: hip pivots + rounded feet */}
          <group ref={legL} position={[-0.16, -0.68, 0]}>
            <mesh position={[0, -0.1, 0]}>
              <capsuleGeometry args={[0.09, 0.12, 6, 14]} />
              <meshPhysicalMaterial {...inkMat} />
            </mesh>
            <mesh position={[0, -0.2, 0.05]} scale={[1, 0.8, 1.25]}>
              <sphereGeometry args={[0.105, 20, 16]} />
              <meshPhysicalMaterial color={C.inkSoft} roughness={0.45} clearcoat={0.4} />
            </mesh>
          </group>
          <group ref={legR} position={[0.16, -0.68, 0]}>
            <mesh position={[0, -0.1, 0]}>
              <capsuleGeometry args={[0.09, 0.12, 6, 14]} />
              <meshPhysicalMaterial {...inkMat} />
            </mesh>
            <mesh position={[0, -0.2, 0.05]} scale={[1, 0.8, 1.25]}>
              <sphereGeometry args={[0.105, 20, 16]} />
              <meshPhysicalMaterial color={C.inkSoft} roughness={0.45} clearcoat={0.4} />
            </mesh>
          </group>

          {/* cape: violet outside + lighter lining, pinned at the shoulders */}
          <group position={[0, -0.05, -0.3]} rotation={[0.2, 0, 0]}>
            <mesh ref={capeMesh} geometry={capeGeo}>
              <meshPhysicalMaterial color={C.capeOut} roughness={0.42} clearcoat={0.55} clearcoatRoughness={0.35} />
            </mesh>
            <mesh geometry={capeGeo}>
              <meshPhysicalMaterial color={C.capeIn} roughness={0.5} side={THREE.BackSide} />
            </mesh>
          </group>
        </group>

        {/* floating marks: ? (thinking), z z (resting), HA HA (funny) */}
        <group ref={marks}>
          <mesh position={[0.52, 1.05, 0.25]} userData={{ emo: 'thinking', baseY: 1.05 }} visible={false}>
            <planeGeometry args={[0.42, 0.42]} />
            <meshBasicMaterial map={markTextures.thinking} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh position={[0.55, 0.95, 0.25]} userData={{ emo: 'sleepy', baseY: 0.95 }} visible={false}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial map={markTextures.sleepy} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh position={[0.72, 0.35, 0.25]} userData={{ emo: 'funny', baseY: 0.35 }} visible={false}>
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial map={markTextures.funny} transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        {/* sparkles */}
        <group ref={stars} visible={false}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} scale={0.09}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffb020" emissive="#ffb020" emissiveIntensity={1.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* soft ground shadow */}
      <mesh ref={shadow} position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.9]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  )
}
