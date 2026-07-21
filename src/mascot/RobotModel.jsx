import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { drawFace, faceKey, FACE_SIZE } from './faceTexture.js'

/* Candy Clay palette (mirrors src/styles/global.css) */
const C = {
  body: '#f8f6ff',
  violet: '#6c5ce7',
  violet2: '#8b5cff',
  violetDeep: '#5546c8',
  white: '#ffffff',
  pod: '#d6cdf3',
  phones: '#2f2a4e',
  phonePad: '#221d3d',
  leafA: '#2fbf83',
  leafB: '#3ecf8e',
  leafKnot: '#1fae70',
  leds: ['#2fbf83', '#ef5d8a', '#ffb020', '#6c5ce7', '#4aa8ff'],
}

/* face cap: a slice of a slightly larger sphere, centred on +z */
const FACE_PHI_LEN = 1.9
const FACE_THETA_LEN = 1.58

/* "DGA" decal for the builder hard hat, drawn once */
function makeHelmetLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 96
  const g = canvas.getContext('2d')
  g.fillStyle = '#ffffff'
  g.font = '800 62px "Noto Sans Georgian Variable", "Arial Black", sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('D G A', 128, 52)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

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
  windowPointer,
  idle = true,
  reducedMotion = false,
  variant = 'default', // 'default' (headphones + sprout) | 'builder' (DGA hard hat)
  holdup = false, // raise an open palm: "hold up, under construction"
  onTap,
}) {
  const invalidate = useThree((s) => s.invalidate)
  const root = useRef() // bob + squash
  const tilt = useRef() // pointer-follow rotation
  const mittR = useRef()
  const mittL = useRef()
  const leaves = useRef() // the sprout on the headphone band
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
    holdBlend: 0, // 0 = arm resting, 1 = palm raised in "hold up"
    drawnKey: '',
  })

  const { leds, dial } = useSurfacePoints()
  const armGeo = useEveArmGeometry()
  useEffect(() => () => armGeo.dispose(), [armGeo])

  const helmetLabel = useMemo(() => (variant === 'builder' ? makeHelmetLabel() : null), [variant])
  useEffect(() => () => helmetLabel?.dispose(), [helmetLabel])

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
    const full = { ...state, noPlate: variant === 'builder' }
    const key = faceKey(full)
    if (key === anim.current.drawnKey) return
    anim.current.drawnKey = key
    drawFace(ctx, full)
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
    const p = windowPointer?.current ?? state.pointer ?? state.mouse
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

    /* ---- gestures (body) ---- */
    let waveB = 0
    let waveE = 0
    if (a.gesture) {
      const e = t - a.gesture.start
      if (a.gesture.type === 'wave') {
        const dur = 1.7
        if (e >= dur) a.gesture = null
        else {
          waveB = clamp01(e / 0.25) * clamp01((dur - e) / 0.3)
          waveE = e
          if (tilt.current) tilt.current.rotation.z = 0.08 * waveB
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

    a.holdBlend += ((holdup ? 1 : 0) - a.holdBlend) * Math.min(1, dt * 3)
    const hb = a.holdBlend

    if (root.current) {
      root.current.position.y = y
      root.current.scale.set(1 + (1 - sp.s) * 0.45, sp.s, 1 + (1 - sp.s) * 0.45)
    }

    /* ---- EVE arms: every motion is a damped swing around the
       shoulder pivot - no position snapping. The hover trails the body
       bob slightly (follow-through), the wave lifts the whole blade and
       rocks it, and "hold up" raises the left blade with little
       air-pats. ---- */
    if (mittR.current) {
      const rest = 0.3 + (idle ? Math.sin(t * 1.25 + 0.6) * 0.05 : 0)
      const target = rest + (1.7 + Math.sin(waveE * 9) * 0.26) * waveB
      mittR.current.rotation.z += (target - mittR.current.rotation.z) * Math.min(1, dt * 10)
      mittR.current.rotation.x += (0 - mittR.current.rotation.x) * Math.min(1, dt * 8)
      mittR.current.position.y = -0.1 + (idle ? Math.sin(t * 1.35 - 0.7) * 0.022 : 0)
    }
    if (mittL.current) {
      let targetZ = -0.3 + (idle ? Math.sin(t * 1.25 + 2.3) * 0.05 : 0)
      let targetX = 0
      if (hb > 0.001) {
        const cycle = (t + 1.2) % 4.6
        const pat = cycle < 0.7 ? Math.sin((cycle / 0.7) * Math.PI * 2) : 0
        targetZ = targetZ * (1 - hb) + -(2.0 + Math.sin(hb * Math.PI) * 0.22) * hb
        targetX = -pat * 0.2 * hb
      }
      mittL.current.rotation.z += (targetZ - mittL.current.rotation.z) * Math.min(1, dt * 6)
      mittL.current.rotation.x += (targetX - mittL.current.rotation.x) * Math.min(1, dt * 8)
      mittL.current.position.y = -0.1 + (idle ? Math.sin(t * 1.35 + 0.9) * 0.022 : 0)
    }

    /* ---- chest LEDs pulse ---- */
    ledMats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2.3 + i * 0.9)
    })

    /* ---- the sprout sways gently ---- */
    if (leaves.current) leaves.current.rotation.z = Math.sin(t * 2.1) * 0.07

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

          {variant === 'builder' ? (
            /* construction hard hat with the DGA decal (coming-soon pages);
               raised + scaled up so it sits loose over his head */
            <group position={[0, 0.09, 0]} scale={1.09}>
              <mesh position={[0, 0.38, 0]} scale={[1, 0.72, 1.05]}>
                <sphereGeometry args={[0.95, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color={C.violet} roughness={0.22} clearcoat={0.85} clearcoatRoughness={0.18} />
              </mesh>
              {/* ridges running front-to-back */}
              {[
                [0, 0.9, 0.05, 0.78],
                [-0.3, 0.82, 0.04, 0.7],
                [0.3, 0.82, 0.04, 0.7],
              ].map(([x, r, tube, squash], i) => (
                <mesh key={i} position={[x, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, squash, 1]}>
                  <torusGeometry args={[r, tube, 12, 40, Math.PI]} />
                  <meshPhysicalMaterial color={C.violet2} roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.2} />
                </mesh>
              ))}
              {/* all-around brim, a little longer front and back */}
              <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.14, 0.32]}>
                <torusGeometry args={[0.97, 0.09, 14, 56]} />
                <meshPhysicalMaterial color={C.violetDeep} roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.25} />
              </mesh>
              {/* DGA decal on the front */}
              <mesh position={[0, 0.66, 0.95]} rotation={[-0.5, 0, 0]}>
                <planeGeometry args={[0.56, 0.21]} />
                <meshBasicMaterial map={helmetLabel} transparent toneMapped={false} depthWrite={false} />
              </mesh>
            </group>
          ) : (
            <>
              {/* summer headphones: band over the head + ear cups */}
              <group position={[0, 0.06, 0]}>
                <mesh>
                  <torusGeometry args={[1.04, 0.075, 16, 56, Math.PI * 1.12]} />
                  <meshPhysicalMaterial color={C.phones} roughness={0.45} clearcoat={0.4} />
                </mesh>
                {[-1, 1].map((side) => (
                  <group key={side} position={[side * 1.0, 0.06, 0]} rotation={[0, 0, side * -0.1]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.22, 0.22, 0.14, 24]} />
                      <meshPhysicalMaterial color={C.phones} roughness={0.42} clearcoat={0.45} />
                    </mesh>
                    <mesh position={[side * -0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.175, 0.175, 0.05, 20]} />
                      <meshPhysicalMaterial color={C.phonePad} roughness={0.65} />
                    </mesh>
                  </group>
                ))}
              </group>

              {/* the little green sprout tied to the band (summer!) */}
              <group ref={leaves} position={[0, 1.14, 0]} scale={1.28}>
                <mesh position={[0, 0.01, 0]}>
                  <sphereGeometry args={[0.08, 16, 12]} />
                  <meshPhysicalMaterial color={C.leafKnot} roughness={0.55} />
                </mesh>
                <mesh position={[-0.2, 0.14, 0]} rotation={[0, 0, -0.7]} scale={[1.5, 0.6, 0.32]}>
                  <sphereGeometry args={[0.16, 20, 14]} />
                  <meshPhysicalMaterial color={C.leafA} roughness={0.5} clearcoat={0.3} />
                </mesh>
                <mesh position={[0.2, 0.14, 0]} rotation={[0, 0, 0.7]} scale={[1.5, 0.6, 0.32]}>
                  <sphereGeometry args={[0.16, 20, 14]} />
                  <meshPhysicalMaterial color={C.leafB} roughness={0.5} clearcoat={0.3} />
                </mesh>
              </group>
            </>
          )}

          {/* shoulder pods the arms plug into */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.94, -0.14, 0.06]} scale={[0.34, 0.42, 0.42]}>
              <sphereGeometry args={[0.5, 24, 18]} />
              <meshPhysicalMaterial color={C.pod} roughness={0.4} clearcoat={0.5} />
            </mesh>
          ))}

          {/* floating arms per the reference: shoulder ball at the pivot,
              long tapered capsule below, glossy white plastic */}
          {[
            [mittR, 1, 0.3],
            [mittL, -1, -0.3],
          ].map(([ref, side, rot]) => (
            <group key={side} ref={ref} position={[side * 1.08, -0.1, 0.14]} rotation={[0, 0, rot]}>
              {/* rounded shoulder socket, peeking at the top */}
              <mesh position={[0, 0.05, -0.03]}>
                <sphereGeometry args={[0.08, 24, 18]} />
                <meshPhysicalMaterial color="#f4f2fb" roughness={0.18} metalness={0.04} clearcoat={1} clearcoatRoughness={0.12} />
              </mesh>
              <mesh geometry={armGeo} position={[0, -0.01, 0]} scale={[1, 1, 0.8]} rotation={[0.05, 0, 0]}>
                <meshPhysicalMaterial color="#f4f2fb" roughness={0.18} metalness={0.04} clearcoat={1} clearcoatRoughness={0.12} />
              </mesh>
            </group>
          ))}

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

/* Arm recreated 1:1 from the reference sheet: a long smooth capsule -
   rounded dome top, near-cylindrical upper section, gentle organic
   taper through the lower half, closing in a soft BLUNT rounded tip
   (never a point). No seams or details. Built as a lathe whose origin
   sits at the shoulder joint, so rotating the group swings it
   naturally like a real arm. */
function useEveArmGeometry() {
  return useMemo(() => {
    const R = 0.14 // shoulder radius
    const L = 0.92 // arm length (long, ~reference proportions)
    const TIP = 0.48 // tip radius as a fraction of R (soft blunt end)
    const N = 40
    const pts = []
    for (let i = 0; i <= N; i++) {
      const f = i / N
      let r
      if (f < 0.15) {
        r = R * Math.sin((f / 0.15) * (Math.PI / 2)) // rounded dome cap
      } else if (f < 0.45) {
        r = R * (1 - 0.05 * ((f - 0.15) / 0.3)) // near-cylindrical
      } else if (f < 0.92) {
        r = R * (0.95 - (0.95 - TIP) * Math.pow((f - 0.45) / 0.47, 1.25)) // gentle taper
      } else {
        r = R * TIP * Math.sqrt(Math.max(0, 1 - Math.pow((f - 0.92) / 0.08, 2))) // hemispherical blunt tip
      }
      pts.push(new THREE.Vector2(Math.max(r, 0.001), -f * L))
    }
    const geo = new THREE.LatheGeometry(pts, 32)
    geo.computeVertexNormals()
    return geo
  }, [])
}
