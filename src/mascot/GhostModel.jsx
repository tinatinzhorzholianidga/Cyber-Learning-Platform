import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* Cipher (შიფრი) - the hooded guardian ghost, Candy Clay edition.
   Same silhouette as the reference sketch (hood, dark opening, glowing
   eyes, curled tip, flowing hem) in the platform palette, with an amber
   padlock clasp for the cyber-security context. All geometry is
   procedural; the hem ripples like cloth every frame. */

const C = {
  cloak: '#7c63f0',
  cloakLip: '#9d84ff',
  ink: '#2b2350',
  eye: '#ffffff',
  lock: '#ffb020',
  wisp: '#a78bfa',
}

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const damp = (cur, target, lambda, dt) => cur + (target - cur) * Math.min(1, lambda * dt)

/* cloak: lathe profile from hood top down to the hem */
function useCloak() {
  return useMemo(() => {
    const profile = [
      [0.03, 1.02],
      [0.28, 0.9],
      [0.56, 0.72],
      [0.76, 0.44],
      [0.84, 0.12],
      [0.78, -0.2],
      [0.7, -0.46],
      [0.78, -0.72],
      [0.88, -0.98],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const geo = new THREE.LatheGeometry(profile, 56)
    const pos = geo.attributes.position
    const base = pos.array.slice()
    const count = pos.count
    const angles = new Float32Array(count)
    const weights = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = base[i * 3]
      const y = base[i * 3 + 1]
      const z = base[i * 3 + 2]
      angles[i] = Math.atan2(z, x)
      // only the lower half of the cloak ripples, more toward the hem
      weights[i] = Math.pow(clamp01((0.15 - y) / 1.1), 1.4)
    }
    return { geo, base, angles, weights }
  }, [])
}

export default function GhostModel({
  emotion = 'happy',
  gesture = null, // { id, type: 'wave' | 'bounce' | 'spin' }
  talking = false,
  follow = true,
  idle = true,
  reducedMotion = false,
  onTap,
}) {
  const invalidate = useThree((s) => s.invalidate)
  const root = useRef()
  const tilt = useRef()
  const cloakMesh = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const arcL = useRef()
  const arcR = useRef()
  const eyesGroup = useRef()
  const tip = useRef()
  const wisps = useRef()
  const dots = useRef()
  const stars = useRef()
  const shadow = useRef()

  const { geo, base, angles, weights } = useCloak()
  useEffect(() => () => geo.dispose(), [geo])

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
  })

  // static pose for reduced motion / demand frameloop
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
      }
    }
    if (gesture && gesture.id !== a.lastGestureId) {
      a.lastGestureId = gesture.id
      if (!reducedMotion) {
        a.gesture = { type: gesture.type, start: t }
        if (gesture.type === 'bounce') a.spring.v = -3.2
        a.overlay = { emotion: gesture.type === 'spin' ? 'surprised' : 'excited', until: t + 1.9 }
      }
    }
    if (a.overlay && t > a.overlay.until) a.overlay = null
    const emo = a.overlay ? a.overlay.emotion : emotion

    /* ---- eye pose by emotion (everything lerped = smooth) ---- */
    const sleepy = emo === 'sleepy'
    const arcs = emo === 'celebrate'
    const eyeTargets = {
      scaleY: sleepy ? 0.16 : emo === 'wink' ? 1 : emo === 'surprised' ? 1.05 : 1,
      scaleX: emo === 'surprised' ? 1.5 : emo === 'excited' ? 1.2 : 1,
      rotZ: emo === 'sad' ? 0.32 : 0,
      offY: emo === 'thinking' ? 0.09 : emo === 'sad' ? -0.06 : 0,
      offX: emo === 'thinking' ? -0.09 : 0,
    }

    /* ---- blink ---- */
    if (!reducedMotion && t >= a.blinkAt) {
      const phase = (t - a.blinkAt) / 0.22
      a.blink = phase >= 1 ? 0 : Math.sin(Math.min(phase, 1) * Math.PI)
      if (phase >= 1) a.blinkAt = t + 2.6 + Math.random() * 3.4
    }
    const blinkScale = 1 - a.blink * 0.9

    /* ---- pupils / gaze ---- */
    const p = state.pointer ?? state.mouse
    const wanderX = Math.sin(t * 0.35) * 0.3 + Math.sin(t * 0.14 + 1.8) * 0.18
    const wanderY = Math.sin(t * 0.26 + 0.9) * 0.2
    const gx = reducedMotion ? 0 : follow ? p.x : idle ? wanderX : 0
    const gy = reducedMotion ? 0 : follow ? -p.y : idle ? wanderY : 0
    a.pupil.x = damp(a.pupil.x, gx, 7, dt)
    a.pupil.y = damp(a.pupil.y, gy, 7, dt)

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
      eyesGroup.current.position.x = damp(
        eyesGroup.current.position.x,
        eyeTargets.offX + a.pupil.x * 0.07,
        8,
        dt,
      )
      eyesGroup.current.position.y = damp(
        eyesGroup.current.position.y,
        eyeTargets.offY + a.pupil.y * 0.05,
        8,
        dt,
      )
    }

    /* ---- thought dots / stars ---- */
    if (dots.current) {
      dots.current.visible = emo === 'thinking'
      if (dots.current.visible) {
        dots.current.children.forEach((d, i) => {
          d.material.opacity = 0.5 + 0.5 * clamp01(Math.sin(t * 2.6 - i * 0.9))
          d.position.y = 1.2 + i * 0.2 + Math.sin(t * 1.4 + i) * 0.02
        })
      }
    }
    if (stars.current) {
      stars.current.visible = emo === 'celebrate' || emo === 'excited'
      if (stars.current.visible) {
        stars.current.children.forEach((star, i) => {
          const ang = t * 1.8 + (i * Math.PI * 2) / 3
          star.position.set(Math.cos(ang) * 1.35, 0.95 + Math.sin(t * 3 + i * 2) * 0.15, Math.sin(ang) * 0.5)
          star.rotation.y = t * 3 + i
          star.rotation.z = t * 2
        })
      }
    }

    if (reducedMotion) return

    /* ---- float: ghosts hover; pace depends on mood ---- */
    const pace = sleepy ? 0.55 : emo === 'excited' || emo === 'celebrate' ? 2.1 : 1.1
    const amp = sleepy ? 0.11 : 0.08
    let y = idle ? Math.sin(t * pace) * amp : 0
    let sway = idle ? Math.sin(t * pace * 0.8) * 0.05 : 0
    let drift = idle && (emo === 'excited' || emo === 'celebrate') ? Math.sin(t * 1.4) * 0.08 : 0

    /* ---- squash spring ---- */
    const sp = a.spring
    sp.v += ((1 - sp.s) * 120 - sp.v * 10) * dt
    sp.s += sp.v * dt

    /* ---- gestures ---- */
    let tipFlick = 0
    if (a.gesture) {
      const e = t - a.gesture.start
      if (a.gesture.type === 'wave') {
        // full-body wag + hood-tip flick (he has no hands to wave)
        const dur = 1.6
        if (e >= dur) a.gesture = null
        else {
          const b = clamp01(e / 0.2) * clamp01((dur - e) / 0.25)
          sway += Math.sin(e * 9) * 0.22 * b
          tipFlick = Math.sin(e * 9 + 1.2) * 0.55 * b
        }
      } else if (a.gesture.type === 'bounce') {
        const dur = 0.85
        if (e >= dur) {
          a.gesture = null
          a.spring.v = -2
        } else {
          y += Math.sin((e / dur) * Math.PI) * 0.42
        }
      } else if (a.gesture.type === 'spin') {
        const dur = 0.95
        if (e >= dur) a.gesture = null
        else if (tilt.current) tilt.current.rotation.y += easeInOut(e / dur) * Math.PI * 2
      }
    }

    if (root.current) {
      root.current.position.y = y
      root.current.position.x = drift
      const talkPulse = talking ? 1 + Math.sin(t * 9) * 0.015 : 1
      root.current.scale.set((1 + (1 - sp.s) * 0.4) * talkPulse, sp.s * talkPulse, (1 + (1 - sp.s) * 0.4) * talkPulse)
    }
    if (tilt.current) {
      const ry = follow ? p.x * 0.4 : idle ? wanderX * 0.25 : 0
      const rx = follow ? -p.y * 0.16 : idle ? wanderY * 0.1 : 0
      tilt.current.rotation.y = damp(tilt.current.rotation.y, ry, 5, dt)
      tilt.current.rotation.x = damp(tilt.current.rotation.x, rx, 5, dt)
      tilt.current.rotation.z = damp(tilt.current.rotation.z, sway, 6, dt)
    }
    if (tip.current) {
      tip.current.rotation.z = Math.sin(t * (sleepy ? 0.8 : 2)) * 0.12 + tipFlick
    }

    /* ---- cloth ripple on the hem ---- */
    if (cloakMesh.current) {
      const speed = sleepy ? 0.9 : 2.3
      const pos = cloakMesh.current.geometry.attributes.position
      const arr = pos.array
      for (let i = 0; i < pos.count; i++) {
        const w = weights[i]
        if (w === 0) continue
        const ang = angles[i]
        const rip = 1 + (Math.sin(ang * 3 + t * speed) * 0.055 + Math.sin(ang * 5 - t * speed * 1.35) * 0.03) * w
        arr[i * 3] = base[i * 3] * rip
        arr[i * 3 + 2] = base[i * 3 + 2] * rip
        arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(ang * 4 + t * speed * 1.15) * 0.05 * w
      }
      pos.needsUpdate = true
      cloakMesh.current.geometry.computeVertexNormals()
    }

    /* ---- tail wisps trail behind ---- */
    if (wisps.current) {
      wisps.current.children.forEach((wisp, i) => {
        wisp.position.x = 0.84 + i * 0.24 + Math.sin(t * 2.2 + i * 1.3) * 0.05
        wisp.position.y = -0.5 - i * 0.1 + Math.sin(t * 2.8 + i * 0.9) * 0.06
      })
    }

    /* ---- shadow follows the hover ---- */
    if (shadow.current) {
      const lift = clamp01((y + 0.1) / 0.6)
      shadow.current.material.opacity = 0.8 - lift * 0.4
      const s = 1 - lift * 0.2
      shadow.current.scale.set(s, s, s)
    }
  })

  const handleTap = (e) => {
    e.stopPropagation()
    anim.current.pendingTap = true
    onTap?.()
    invalidate()
  }

  return (
    <group position={[0, 0.12, 0]} scale={1.12}>
      <group ref={root}>
        <group
          ref={tilt}
          onPointerDown={handleTap}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          {/* cloak */}
          <mesh ref={cloakMesh} geometry={geo}>
            <meshPhysicalMaterial
              color={C.cloak}
              roughness={0.42}
              metalness={0.02}
              clearcoat={0.55}
              clearcoatRoughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* dark face inside the hood */}
          <mesh position={[0, 0.3, 0.44]}>
            <sphereGeometry args={[0.5, 48, 32]} />
            <meshPhysicalMaterial color={C.ink} roughness={0.55} clearcoat={0.25} />
          </mesh>

          {/* hood lip around the opening */}
          <mesh position={[0, 0.32, 0.74]} rotation={[-0.3, 0, 0]} scale={[1, 1.14, 0.55]}>
            <torusGeometry args={[0.47, 0.07, 18, 40]} />
            <meshPhysicalMaterial color={C.cloakLip} roughness={0.4} clearcoat={0.5} />
          </mesh>

          {/* glowing eyes */}
          <group ref={eyesGroup}>
            <group ref={eyeL} position={[-0.17, 0.35, 0.95]}>
              <mesh>
                <capsuleGeometry args={[0.085, 0.09, 6, 14]} />
                <meshBasicMaterial color={C.eye} toneMapped={false} />
              </mesh>
            </group>
            <group ref={eyeR} position={[0.17, 0.35, 0.95]}>
              <mesh>
                <capsuleGeometry args={[0.085, 0.09, 6, 14]} />
                <meshBasicMaterial color={C.eye} toneMapped={false} />
              </mesh>
            </group>
            {/* happy ∩ arcs (celebrating) */}
            <mesh ref={arcL} position={[-0.17, 0.35, 0.95]} visible={false}>
              <torusGeometry args={[0.09, 0.032, 10, 20, Math.PI]} />
              <meshBasicMaterial color={C.eye} toneMapped={false} />
            </mesh>
            <mesh ref={arcR} position={[0.17, 0.35, 0.95]} visible={false}>
              <torusGeometry args={[0.09, 0.032, 10, 20, Math.PI]} />
              <meshBasicMaterial color={C.eye} toneMapped={false} />
            </mesh>
          </group>

          {/* curled hood tip */}
          <group ref={tip} position={[0, 0.98, -0.02]}>
            {[
              [0.08, 0.1, 0, 0.13],
              [0.22, 0.17, -0.03, 0.1],
              [0.35, 0.15, -0.07, 0.075],
              [0.44, 0.07, -0.1, 0.05],
            ].map(([x, y, z, r], i) => (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[r, 18, 14]} />
                <meshPhysicalMaterial color={C.cloak} roughness={0.42} clearcoat={0.55} />
              </mesh>
            ))}
          </group>

          {/* amber padlock clasp - he guards things */}
          <group position={[0, -0.18, 0.78]} scale={1.15}>
            <mesh scale={[1, 0.85, 0.45]}>
              <sphereGeometry args={[0.13, 20, 16]} />
              <meshPhysicalMaterial color={C.lock} roughness={0.35} clearcoat={0.6} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <torusGeometry args={[0.075, 0.026, 10, 20, Math.PI]} />
              <meshPhysicalMaterial color={C.lock} roughness={0.35} clearcoat={0.6} />
            </mesh>
            <mesh position={[0, -0.005, 0.06]}>
              <circleGeometry args={[0.028, 12]} />
              <meshBasicMaterial color={C.ink} />
            </mesh>
          </group>
        </group>

        {/* tail wisps */}
        <group ref={wisps}>
          {[0.13, 0.09, 0.055].map((r, i) => (
            <mesh key={i} position={[0.84 + i * 0.24, -0.5 - i * 0.1, -0.12]}>
              <sphereGeometry args={[r, 16, 12]} />
              <meshPhysicalMaterial color={C.wisp} roughness={0.45} transparent opacity={0.85 - i * 0.22} />
            </mesh>
          ))}
        </group>

        {/* thinking dots (ink so they read on the light background) */}
        <group ref={dots} visible={false}>
          {[0.055, 0.075, 0.1].map((r, i) => (
            <mesh key={i} position={[0.52 + i * 0.16, 1.2 + i * 0.2, 0.2]}>
              <sphereGeometry args={[r, 14, 10]} />
              <meshBasicMaterial color="#2b2350" transparent opacity={0.85} />
            </mesh>
          ))}
        </group>

        {/* celebration stars */}
        <group ref={stars} visible={false}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} scale={0.1}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffb020" emissive="#ffb020" emissiveIntensity={1.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* soft ground shadow */}
      <mesh ref={shadow} position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2.1]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  )
}
