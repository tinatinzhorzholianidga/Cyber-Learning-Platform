import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { drawFace, faceKey, FACE_SIZE } from './faceTexture.js'

/* Candy Clay palette (mirrors src/styles/global.css) */
const C = {
  body: '#f8f6ff',
  violet: '#6c5ce7',
  violet2: '#8b5cff',
  orange: '#ff8c42',
  white: '#ffffff',
  pod: '#d6cdf3',
  leds: ['#2fbf83', '#ef5d8a', '#ffb020', '#6c5ce7', '#4aa8ff'],
}

/* face cap: a slice of a slightly larger sphere, centred on +z */
const FACE_PHI_LEN = 1.9
const FACE_THETA_LEN = 1.58

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x) => Math.min(1, Math.max(0, x))

/* points on the body sphere for the chest LEDs and the little dial */
function useSurfacePoints() {
  return useMemo(() => {
    const leds = []
    let i = 0
    for (const phi of [2.42, 2.56]) {
      for (const theta of [-0.52, -0.34, -0.16, 0.02, 0.2]) {
        const p = new THREE.Vector3().setFromSphericalCoords(1.006, phi, theta)
        leds.push({ pos: p, color: C.leds[i % C.leds.length] })
        i += 1
      }
    }
    const dial = new THREE.Vector3().setFromSphericalCoords(1.004, 2.08, 1.08)
    return { leds, dial }
  }, [])
}

export default function RobotModel({
  emotion = 'happy',
  gesture = null, // { id, type: 'wave' | 'bounce' | 'spin' }
  talking = false,
  follow = true,
  idle = true,
  reducedMotion = false,
  onTap,
}) {
  const invalidate = useThree((s) => s.invalidate)
  const root = useRef() // bob + squash
  const tilt = useRef() // pointer-follow rotation
  const mittR = useRef()
  const mittL = useRef()
  const shadow = useRef()
  const stars = useRef()
  const ledMats = useRef([])

  const anim = useRef({
    lastGestureId: null,
    gesture: null, // { type, start }
    blinkAt: 2.2,
    blink: 0,
    pupil: { x: 0, y: 0 },
    spring: { s: 1, v: 0 }, // squash & stretch
    overlay: null, // { emotion, until }
    drawnKey: '',
  })

  const { leds, dial } = useSurfacePoints()

  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = FACE_SIZE
    const context = canvas.getContext('2d')
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return { ctx: context, texture: tex }
  }, [])
  useEffect(() => () => texture.dispose(), [texture])

  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const g = canvas.getContext('2d')
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62)
    grad.addColorStop(0, 'rgba(43,35,80,0.34)')
    grad.addColorStop(1, 'rgba(43,35,80,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
  useEffect(() => () => shadowTexture.dispose(), [shadowTexture])

  const paintFace = (state) => {
    const key = faceKey(state)
    if (key === anim.current.drawnKey) return
    anim.current.drawnKey = key
    drawFace(ctx, state)
    texture.needsUpdate = true
  }

  // first paint + repaint when the controlled emotion changes
  // (also covers reduced-motion / demand-frameloop mode)
  useEffect(() => {
    paintFace({ emotion, blink: 0, pupilX: 0, pupilY: 0, mouthOpen: 0 })
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotion, texture])

  useFrame((state, delta) => {
    const a = anim.current
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    // tap reaction (queued from the pointer handler, timed here)
    if (a.pendingTap) {
      a.pendingTap = false
      if (!reducedMotion) {
        a.spring.v = -3.8
        a.overlay = { emotion: 'excited', until: t + 1.8 }
        a.gesture = { type: 'wave', start: t }
      }
    }

    // accept a new gesture
    if (gesture && gesture.id !== a.lastGestureId) {
      a.lastGestureId = gesture.id
      if (!reducedMotion) {
        a.gesture = { type: gesture.type, start: t }
        if (gesture.type === 'bounce') a.spring.v = -3.4
        a.overlay = { emotion: gesture.type === 'spin' ? 'surprised' : 'excited', until: t + 1.9 }
      }
    }
    if (a.overlay && t > a.overlay.until) a.overlay = null
    const effEmotion = a.overlay ? a.overlay.emotion : emotion

    if (reducedMotion) {
      paintFace({ emotion: effEmotion, blink: 0, pupilX: 0, pupilY: 0, mouthOpen: 0 })
      return
    }

    /* ---- blink ---- */
    if (t >= a.blinkAt) {
      const phase = (t - a.blinkAt) / 0.24
      a.blink = phase >= 1 ? 0 : Math.sin(Math.min(phase, 1) * Math.PI)
      if (phase >= 1) a.blinkAt = t + 2.2 + Math.random() * 3.2
    }

    /* ---- pupils: follow the cursor, otherwise wander ---- */
    const p = state.pointer ?? state.mouse
    const wanderX = Math.sin(t * 0.32) * 0.35 + Math.sin(t * 0.13 + 2.1) * 0.2
    const wanderY = Math.sin(t * 0.24 + 1.2) * 0.22
    const targetX = follow ? p.x : idle ? wanderX : 0
    const targetY = follow ? -p.y : idle ? wanderY : 0
    a.pupil.x += (targetX - a.pupil.x) * Math.min(1, dt * 7)
    a.pupil.y += (targetY - a.pupil.y) * Math.min(1, dt * 7)

    /* ---- head/body turns toward the cursor ---- */
    if (tilt.current) {
      const ry = follow ? p.x * 0.38 : idle ? wanderX * 0.22 : 0
      const rx = follow ? -p.y * 0.18 : idle ? wanderY * 0.1 : 0
      tilt.current.rotation.y += (ry - tilt.current.rotation.y) * Math.min(1, dt * 5)
      tilt.current.rotation.x += (rx - tilt.current.rotation.x) * Math.min(1, dt * 5)
      tilt.current.rotation.z += (0 - tilt.current.rotation.z) * Math.min(1, dt * 4)
    }

    /* ---- idle bob ---- */
    const bob = idle ? Math.sin(t * 1.35) * 0.055 : 0
    let y = bob

    /* ---- squash & stretch spring ---- */
    const sp = a.spring
    sp.v += ((1 - sp.s) * 130 - sp.v * 11) * dt
    sp.s += sp.v * dt

    /* ---- gestures ---- */
    let mittRY = 0.02
    let mittRX = 1.17
    let mittRRotZ = -0.15
    if (a.gesture) {
      const e = t - a.gesture.start
      if (a.gesture.type === 'wave') {
        const dur = 1.7
        if (e >= dur) a.gesture = null
        else {
          const b = clamp01(e / 0.22) * clamp01((dur - e) / 0.28)
          mittRY = 0.02 + 0.78 * b
          mittRX = 1.17 + Math.sin(e * 11) * 0.09 * b
          mittRRotZ = -0.15 - (0.55 + Math.sin(e * 11) * 0.45) * b
          if (tilt.current) tilt.current.rotation.z = 0.09 * b
        }
      } else if (a.gesture.type === 'bounce') {
        const dur = 0.85
        if (e >= dur) {
          a.gesture = null
          a.spring.v = -2.2 // landing squash
        } else {
          y += Math.sin((e / dur) * Math.PI) * 0.4
        }
      } else if (a.gesture.type === 'spin') {
        const dur = 0.95
        if (e >= dur) a.gesture = null
        else if (tilt.current) tilt.current.rotation.y += easeInOut(e / dur) * Math.PI * 2
      }
    }

    if (root.current) {
      root.current.position.y = y
      root.current.scale.set(1 + (1 - sp.s) * 0.45, sp.s, 1 + (1 - sp.s) * 0.45)
    }
    if (mittR.current) {
      mittR.current.position.set(mittRX, mittRY, 0.18)
      mittR.current.rotation.z = mittRRotZ
    }
    if (mittL.current) {
      mittL.current.position.y = -0.06 + (idle ? Math.sin(t * 1.35 + 1.4) * 0.02 : 0)
    }

    /* ---- chest LEDs pulse ---- */
    ledMats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2.3 + i * 0.9)
    })

    /* ---- celebration stars ---- */
    if (stars.current) {
      stars.current.visible = effEmotion === 'celebrate' || effEmotion === 'excited'
      if (stars.current.visible) {
        stars.current.children.forEach((star, i) => {
          const ang = t * 1.9 + (i * Math.PI * 2) / 3
          star.position.set(Math.cos(ang) * 1.5, 1.05 + Math.sin(t * 3.1 + i * 2) * 0.16, Math.sin(ang) * 0.55)
          star.rotation.y = t * 3 + i
          star.rotation.z = t * 2
        })
      }
    }

    /* ---- ground shadow follows the bob ---- */
    if (shadow.current) {
      const lift = clamp01((y + 0.06) / 0.7)
      shadow.current.material.opacity = 0.85 - lift * 0.45
      const s = 1 - lift * 0.25
      shadow.current.scale.set(s, s, s)
    }

    /* ---- face ---- */
    const mouthOpen = talking ? 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 11)) : 0
    paintFace({
      emotion: effEmotion,
      blink: a.blink,
      pupilX: a.pupil.x,
      pupilY: a.pupil.y,
      mouthOpen,
    })
  })

  const handleTap = (e) => {
    e.stopPropagation()
    anim.current.pendingTap = true
    onTap?.()
    invalidate()
  }

  return (
    <group position={[0, 0.1, 0]} scale={1.16}>
      <group ref={root}>
        <group
          ref={tilt}
          onPointerDown={handleTap}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          {/* body */}
          <mesh>
            <sphereGeometry args={[1, 64, 48]} />
            <meshPhysicalMaterial
              color={C.body}
              roughness={0.34}
              metalness={0.05}
              clearcoat={0.7}
              clearcoatRoughness={0.32}
            />
          </mesh>

          {/* face screen (curved cap) */}
          <mesh>
            <sphereGeometry
              args={[
                1.015,
                48,
                36,
                Math.PI / 2 - FACE_PHI_LEN / 2,
                FACE_PHI_LEN,
                Math.PI / 2 - FACE_THETA_LEN / 2 - 0.07,
                FACE_THETA_LEN,
              ]}
            />
            <meshBasicMaterial map={texture} transparent toneMapped={false} />
          </mesh>

          {/* beanie hat: brim + dome + pompom, tilted like the brand logo */}
          <group position={[0, 0.74, 0]} rotation={[0.06, 0, -0.13]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.66, 0.17, 20, 48]} />
              <meshPhysicalMaterial color={C.white} roughness={0.5} clearcoat={0.35} />
            </mesh>
            <mesh position={[0, 0.14, 0]} scale={[1, 0.82, 1]}>
              <sphereGeometry args={[0.68, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color={C.violet} roughness={0.45} clearcoat={0.5} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <sphereGeometry args={[0.19, 24, 18]} />
              <meshPhysicalMaterial color={C.orange} roughness={0.55} clearcoat={0.3} />
            </mesh>
          </group>

          {/* ear pods */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.97, 0.02, 0]} scale={[0.34, 0.42, 0.42]}>
              <sphereGeometry args={[0.5, 24, 18]} />
              <meshPhysicalMaterial color={C.pod} roughness={0.4} clearcoat={0.5} />
            </mesh>
          ))}

          {/* mittens (floating, Rayman-style, like the original) */}
          <group ref={mittR} position={[1.17, 0.02, 0.18]} rotation={[0, 0, -0.15]}>
            <Mitten />
          </group>
          <group ref={mittL} position={[-1.17, -0.06, 0.18]} rotation={[0, 0, 0.35]}>
            <Mitten mirrored />
          </group>

          {/* chest LEDs */}
          {leds.map(({ pos, color }, i) => (
            <mesh key={i} position={pos} onUpdate={(m) => m.lookAt(pos.x * 2, pos.y * 2, pos.z * 2)}>
              <circleGeometry args={[0.034, 16]} />
              <meshStandardMaterial
                ref={(mat) => (ledMats.current[i] = mat)}
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}

          {/* little dial, bottom right, a nod to the original */}
          <group position={dial} onUpdate={(g) => g.lookAt(dial.x * 2, dial.y * 2, dial.z * 2)}>
            <mesh>
              <circleGeometry args={[0.1, 24]} />
              <meshPhysicalMaterial color={C.pod} roughness={0.35} clearcoat={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.004]}>
              <ringGeometry args={[0.055, 0.075, 24]} />
              <meshBasicMaterial color={C.violet} />
            </mesh>
          </group>
        </group>

        {/* celebration stars */}
        <group ref={stars} visible={false}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} scale={0.11}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffb020" emissive="#ffb020" emissiveIntensity={1.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* soft ground shadow */}
      <mesh ref={shadow} position={[0, -1.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.2]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Mitten({ mirrored = false }) {
  const dir = mirrored ? -1 : 1
  return (
    <group>
      <mesh scale={[1, 0.86, 0.92]}>
        <sphereGeometry args={[0.27, 28, 20]} />
        <meshPhysicalMaterial color={C.orange} roughness={0.42} clearcoat={0.5} />
      </mesh>
      {/* thumb */}
      <mesh position={[dir * -0.1, 0.16, 0.1]} scale={[0.5, 0.62, 0.5]}>
        <sphereGeometry args={[0.22, 18, 14]} />
        <meshPhysicalMaterial color={C.orange} roughness={0.42} clearcoat={0.5} />
      </mesh>
      {/* white cuff */}
      <mesh position={[dir * -0.2, -0.12, 0]} rotation={[0, 0, dir * 0.8]} scale={[1, 0.55, 1]}>
        <torusGeometry args={[0.16, 0.075, 14, 28]} />
        <meshPhysicalMaterial color={C.white} roughness={0.5} />
      </mesh>
    </group>
  )
}
