import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
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

/* Cyber Guardian accents: graphite mechanics, chrome joints, soft glow */
const G = {
  graphite: '#2e2a45',
  graphite2: '#3b3554',
  chrome: '#ccd0e6',
  seam: '#c9bfe9',
  violet: '#7a6bff',
  cyan: '#4fd9ff',
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
    const dial = new THREE.Vector3().setFromSphericalCoords(1.004, 2.08, 0.88)
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
  skin = 'classic', // 'classic' (summer headphones) | 'guardian' (cyber armor, clean head)
  holdup = false, // raise an open palm: "hold up, under construction"
  onTap,
}) {
  const guardian = skin === 'guardian' && variant !== 'builder'
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
  const clawParts = useGuardianClawParts(guardian)
  const envMap = useStudioEnv(true) // metal parts on both skins need reflections
  const panelTex = usePanelTexture(guardian)
  const energyMats = useRef([]) // guardian: glowing rings and strips
  const coreMat = useRef() // guardian: bottom engine core

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
    const full = { ...state, noPlate: variant === 'builder', bezel: guardian, metal: !guardian }
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

    if (guardian) {
      /* ---- guardian claw arms: damped swings around the shoulder
         pivot - wave lifts the whole claw, "hold up" raises the left
         one with little air-pats. ---- */
      if (mittR.current) {
        const rest = 0.3 + (idle ? Math.sin(t * 1.25 + 0.6) * 0.05 : 0)
        const target = rest + (1.7 + Math.sin(waveE * 9) * 0.26) * waveB
        mittR.current.rotation.z += (target - mittR.current.rotation.z) * Math.min(1, dt * 10)
        mittR.current.rotation.x += (0 - mittR.current.rotation.x) * Math.min(1, dt * 8)
        mittR.current.position.y = -0.02 + (idle ? Math.sin(t * 1.35 - 0.7) * 0.022 : 0)
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
        mittL.current.position.y = -0.02 + (idle ? Math.sin(t * 1.35 + 0.9) * 0.022 : 0)
      }
    } else {
      /* ---- classic bare hands (the original approved animation):
         the wave raises the fist beside the head and rocks it, the
         LEFT palm rises with a springy overshoot for "hold up" and
         hovers with occasional little air-pats. ---- */
      let mittRY = -0.18
      let mittRX = 1.08
      let mittRRotZ = -0.22
      if (a.gesture?.type === 'wave') {
        const e = t - a.gesture.start
        const b = clamp01(e / 0.22) * clamp01((1.7 - e) / 0.28)
        mittRY = -0.18 + 0.85 * b
        mittRX = 1.08 + 0.08 * b
        mittRRotZ = -0.22 - (1.1 + Math.sin(e * 11) * 0.45) * b
      }
      if (mittR.current) {
        mittR.current.position.set(mittRX, mittRY, 0.18)
        mittR.current.rotation.z = mittRRotZ
      }
      if (mittL.current) {
        const restY = -0.18 + (idle ? Math.sin(t * 1.35 + 1.4) * 0.02 : 0)
        if (hb > 0.001) {
          // two quick forward pats every few seconds, tilting with the push
          const cycle = (t + 1.2) % 4.6
          const pat = cycle < 0.7 ? Math.sin((cycle / 0.7) * Math.PI * 2) * 0.05 : 0
          const overshoot = Math.sin(hb * Math.PI) * 0.1
          mittL.current.position.x = -1.08 * (1 - hb) + -1.16 * hb
          mittL.current.position.y = restY * (1 - hb) + (0.46 + overshoot + Math.sin(t * 1.6) * 0.025) * hb
          mittL.current.position.z = 0.14 * (1 - hb) + (0.5 + pat) * hb
          mittL.current.rotation.z = 0.22 * (1 - hb) + 0.1 * hb
          mittL.current.rotation.x = -pat * 3 * hb
        } else {
          mittL.current.position.set(-1.08, restY, 0.14)
          mittL.current.rotation.z = 0.22
          mittL.current.rotation.x = 0
        }
      }
    }

    /* ---- chest LEDs pulse ---- */
    ledMats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2.3 + i * 0.9)
    })

    /* ---- guardian glow breathes: seams, wrists, status lights, core ---- */
    energyMats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = 0.85 + 0.3 * Math.sin(t * 2 + i * 1.1)
    })
    if (coreMat.current) coreMat.current.emissiveIntensity = 1.15 + 0.45 * Math.sin(t * 1.7)

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
            {guardian ? (
              /* glossy white ceramic shell with engraved panel seams */
              <meshPhysicalMaterial
                color="#ffffff"
                map={panelTex}
                bumpMap={panelTex}
                bumpScale={0.35}
                roughness={0.16}
                metalness={0.04}
                clearcoat={1}
                clearcoatRoughness={0.1}
                envMap={envMap}
                envMapIntensity={0.55}
              />
            ) : (
              <meshPhysicalMaterial
                color={C.body}
                roughness={0.34}
                metalness={0.05}
                clearcoat={0.7}
                clearcoatRoughness={0.32}
              />
            )}
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
          ) : guardian ? (
            /* Cyber Guardian, straight from the reference sheet: a slim
               graphite band over the crown, flush glowing sensor ports on
               the sides (flat - NOT ear cups), sprout centred on the band */
            <group position={[0, 0.02, 0]}>
              <mesh>
                <torusGeometry args={[1.005, 0.034, 14, 64, Math.PI]} />
                <meshStandardMaterial color={G.graphite} metalness={0.55} roughness={0.35} envMap={envMap} />
              </mesh>
              {[-1, 1].map((side) => (
                <group key={side} position={[side * 0.975, 0.0, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.19, 0.19, 0.055, 28]} />
                    <meshStandardMaterial color={G.graphite} metalness={0.55} roughness={0.35} envMap={envMap} />
                  </mesh>
                  <mesh position={[side * 0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.115, 0.017, 10, 32]} />
                    <meshStandardMaterial
                      ref={(m) => (energyMats.current[side === 1 ? 0 : 1] = m)}
                      color={G.violet}
                      emissive={G.violet}
                      emissiveIntensity={1}
                    />
                  </mesh>
                  <mesh position={[side * 0.033, 0, 0]} rotation={[0, side * (Math.PI / 2), 0]}>
                    <circleGeometry args={[0.098, 24]} />
                    <meshStandardMaterial color={C.phonePad} metalness={0.3} roughness={0.5} />
                  </mesh>
                </group>
              ))}
              <group ref={leaves} position={[0, 1.0, 0]} scale={1.28}>
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
                    {/* chrome trim ring on the outer face - droid earpiece */}
                    <mesh position={[side * 0.072, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <torusGeometry args={[0.185, 0.015, 10, 32]} />
                      <meshStandardMaterial color="#e8eaf2" metalness={1} roughness={0.16} envMap={envMap} />
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

          {/* shoulder pods the arms plug into (hidden sockets on guardian) */}
          {!guardian &&
            [-1, 1].map((side) => (
              <group key={side} position={[side * 0.94, -0.14, 0.06]}>
                {/* brushed-steel shoulder socket with a chrome collar */}
                <mesh scale={[0.34, 0.42, 0.42]}>
                  <sphereGeometry args={[0.5, 24, 18]} />
                  <meshStandardMaterial color="#ced2dd" metalness={0.85} roughness={0.34} envMap={envMap} envMapIntensity={0.7} />
                </mesh>
                <mesh position={[side * 0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.155, 0.016, 10, 32]} />
                  <meshStandardMaterial color="#e8eaf2" metalness={1} roughness={0.16} envMap={envMap} />
                </mesh>
              </group>
            ))}

          {/* arms.
              classic: the original bare summer hands, wrists plugged
              into the shoulder pods (Palm swaps in for "hold up").
              guardian: three overlapping ceramic armor shells that curl
              outward like the reference, dark joint cores showing in the
              gaps and a glowing ring at every articulation. */}
          {!guardian && (
            <>
              <group ref={mittR} position={[1.08, -0.18, 0.14]} rotation={[0, 0, -0.22]}>
                <Hand />
              </group>
              <group ref={mittL} position={[-1.08, -0.18, 0.14]} rotation={[0, 0, 0.22]}>
                {holdup ? <Palm mirrored /> : <Hand mirrored />}
              </group>
            </>
          )}
          {guardian &&
            [
              [mittR, 1],
              [mittL, -1],
            ].map(([ref, side]) => (
              <group key={side} ref={ref} position={[side * 1.04, -0.02, 0.06]} rotation={[0, 0, side * 0.3]}>
                <group rotation={[0.06, 0, 0]}>
                  {/* rotating shoulder joint against the body */}
                  <mesh position={[0, 0.05, 0]}>
                    <sphereGeometry args={[0.165, 24, 18]} />
                    <meshStandardMaterial color={G.graphite2} metalness={0.75} roughness={0.28} envMap={envMap} />
                  </mesh>
                  <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.145, 0.013, 8, 32]} />
                    <meshStandardMaterial
                      ref={(m) => (energyMats.current[side === 1 ? 2 : 3] = m)}
                      color={G.violet}
                      emissive={G.violet}
                      emissiveIntensity={1}
                    />
                  </mesh>
                  {/* segment 1 */}
                  <group rotation={[0, 0, side * 0.05]}>
                    <mesh geometry={clawParts?.[0]}>
                      <meshPhysicalMaterial
                        color="#f7f5ff"
                        roughness={0.15}
                        metalness={0.05}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        envMap={envMap}
                        envMapIntensity={0.6}
                      />
                    </mesh>
                    {/* segment 2, hinged at the bottom of segment 1 */}
                    <group position={[0, -0.34, 0]} rotation={[0, 0, side * 0.13]}>
                      <mesh position={[0, 0.03, 0]}>
                        <cylinderGeometry args={[0.118, 0.118, 0.12, 24]} />
                        <meshStandardMaterial color={G.graphite2} metalness={0.7} roughness={0.3} />
                      </mesh>
                      <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.13, 0.011, 8, 28]} />
                        <meshStandardMaterial
                          ref={(m) => (energyMats.current[side === 1 ? 4 : 5] = m)}
                          color={G.violet}
                          emissive={G.violet}
                          emissiveIntensity={1}
                        />
                      </mesh>
                      <mesh geometry={clawParts?.[1]}>
                        <meshPhysicalMaterial
                          color="#f7f5ff"
                          roughness={0.15}
                          metalness={0.05}
                          clearcoat={1}
                          clearcoatRoughness={0.1}
                          envMap={envMap}
                          envMapIntensity={0.6}
                        />
                      </mesh>
                      {/* segment 3: the claw tip */}
                      <group position={[0, -0.34, 0]} rotation={[0, 0, side * 0.17]}>
                        <mesh position={[0, 0.03, 0]}>
                          <cylinderGeometry args={[0.09, 0.09, 0.11, 20]} />
                          <meshStandardMaterial color={G.graphite2} metalness={0.7} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
                          <torusGeometry args={[0.1, 0.009, 8, 24]} />
                          <meshStandardMaterial
                            ref={(m) => (energyMats.current[side === 1 ? 6 : 7] = m)}
                            color={G.violet}
                            emissive={G.violet}
                            emissiveIntensity={1}
                          />
                        </mesh>
                        <mesh geometry={clawParts?.[2]}>
                          <meshPhysicalMaterial
                            color="#f7f5ff"
                            roughness={0.15}
                            metalness={0.05}
                            clearcoat={1}
                            clearcoatRoughness={0.1}
                            envMap={envMap}
                            envMapIntensity={0.6}
                          />
                        </mesh>
                      </group>
                    </group>
                  </group>
                </group>
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

          {/* metal mechanisms (Star Wars mode) - classic skin only */}
          {!guardian && (
            <group>
              {/* the dial becomes an embossed mechanical vent, like the
                  round speaker on the original IO render */}
              <group position={dial} onUpdate={(g) => g.lookAt(dial.x * 2, dial.y * 2, dial.z * 2)}>
                <mesh>
                  <circleGeometry args={[0.105, 28]} />
                  <meshStandardMaterial color="#ced2dd" metalness={0.85} roughness={0.34} envMap={envMap} envMapIntensity={0.7} />
                </mesh>
                <mesh position={[0, 0, 0.006]}>
                  <torusGeometry args={[0.098, 0.013, 10, 32]} />
                  <meshStandardMaterial color="#e8eaf2" metalness={1} roughness={0.16} envMap={envMap} />
                </mesh>
                {Array.from({ length: 8 }).map((_, i) => {
                  const ang = (i / 8) * Math.PI * 2
                  return (
                    <mesh
                      key={i}
                      position={[Math.cos(ang) * 0.056, Math.sin(ang) * 0.056, 0.008]}
                      rotation={[0, 0, ang]}
                    >
                      <boxGeometry args={[0.05, 0.013, 0.008]} />
                      <meshStandardMaterial color="#9aa0af" metalness={0.8} roughness={0.4} envMap={envMap} />
                    </mesh>
                  )
                })}
                {/* hex screw in the middle */}
                <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.014, 6]} />
                  <meshStandardMaterial color="#4a4660" metalness={0.7} roughness={0.35} envMap={envMap} />
                </mesh>
              </group>

              {/* chrome trim seam around the undercarriage */}
              <mesh position={[0, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.696, 0.012, 8, 64]} />
                <meshStandardMaterial color="#c9ccd8" metalness={0.9} roughness={0.3} envMap={envMap} />
              </mesh>

              {/* riveted service plates hugging the shell */}
              {[
                [-0.72, -0.42, 0.55],
                [0.62, 0.1, -0.78],
              ].map(([px, py, pz], pi) => (
                <group key={pi} position={[px, py, pz]} onUpdate={(g) => g.lookAt(px * 2, py * 2, pz * 2)}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.022, 28]} />
                    <meshStandardMaterial color="#d3d6e0" metalness={0.85} roughness={0.32} envMap={envMap} envMapIntensity={0.7} />
                  </mesh>
                  {[
                    [0.105, 0.105], [-0.105, 0.105], [0.105, -0.105], [-0.105, -0.105],
                  ].map(([rx, ry], ri) => (
                    <mesh key={ri} position={[rx * 0.72, ry * 0.72, 0.014]}>
                      <sphereGeometry args={[0.014, 10, 8]} />
                      <meshStandardMaterial color="#8f95a5" metalness={0.9} roughness={0.3} envMap={envMap} />
                    </mesh>
                  ))}
                </group>
              ))}

              {/* ventilation grille, low on the left - droid style */}
              <group position={[-0.86, -0.12, 0.48]} onUpdate={(g) => g.lookAt(-1.72, -0.24, 0.96)}>
                <mesh position={[0, 0, -0.004]}>
                  <boxGeometry args={[0.2, 0.13, 0.014]} />
                  <meshStandardMaterial color="#ced2dd" metalness={0.85} roughness={0.34} envMap={envMap} envMapIntensity={0.7} />
                </mesh>
                {[-0.032, 0, 0.032].map((dy) => (
                  <mesh key={dy} position={[0, dy, 0.006]}>
                    <boxGeometry args={[0.15, 0.018, 0.01]} />
                    <meshStandardMaterial color="#3a3550" metalness={0.5} roughness={0.45} />
                  </mesh>
                ))}
              </group>

              {/* little chrome holoprojector dome, R2-style, up on the back */}
              <group position={[-0.62, 0.55, -0.55]} onUpdate={(g) => g.lookAt(-1.24, 1.1, -1.1)}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.075, 0.014, 10, 28]} />
                  <meshStandardMaterial color="#c9ccd8" metalness={0.9} roughness={0.28} envMap={envMap} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <sphereGeometry args={[0.068, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color="#e8eaf2" metalness={1} roughness={0.14} envMap={envMap} />
                </mesh>
              </group>
            </group>
          )}

          {guardian && (
            <group>
              {/* graphite service module on the back, like the sheet's BACK view */}
              <group position={[0, -0.18, -0.94]} rotation={[-0.18, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.34, 0.42, 0.16]} />
                  <meshStandardMaterial color={G.graphite} metalness={0.55} roughness={0.35} envMap={envMap} />
                </mesh>
                <mesh position={[0, 0, -0.083]}>
                  <boxGeometry args={[0.1, 0.28, 0.012]} />
                  <meshStandardMaterial
                    ref={(m) => (energyMats.current[8] = m)}
                    color={G.violet}
                    emissive={G.violet}
                    emissiveIntensity={1}
                  />
                </mesh>
              </group>

              {/* the big engine / energy core underneath */}
              <group position={[0, -0.9, 0]}>
                <mesh position={[0, -0.03, 0]}>
                  <cylinderGeometry args={[0.42, 0.34, 0.2, 40]} />
                  <meshStandardMaterial color={G.graphite} metalness={0.6} roughness={0.3} envMap={envMap} />
                </mesh>
                <mesh position={[0, -0.135, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.345, 0.022, 12, 48]} />
                  <meshStandardMaterial color={G.chrome} metalness={0.9} roughness={0.18} envMap={envMap} />
                </mesh>
                {/* violet rim, visible from the front */}
                <mesh position={[0, -0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.425, 0.013, 8, 56]} />
                  <meshStandardMaterial
                    ref={(m) => (energyMats.current[9] = m)}
                    color={G.violet}
                    emissive={G.violet}
                    emissiveIntensity={1}
                  />
                </mesh>
                {/* bright blue core + soft additive bloom */}
                <mesh position={[0, -0.145, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.325, 40]} />
                  <meshStandardMaterial
                    ref={coreMat}
                    color="#5ab8ff"
                    emissive="#5ab8ff"
                    emissiveIntensity={1.4}
                    metalness={0.1}
                    roughness={0.25}
                  />
                </mesh>
                <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.5, 40]} />
                  <meshBasicMaterial
                    color="#4aa8ff"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            </group>
          )}
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

/* An open palm with splayed fingers - the "hold up, under construction"
   hand (like the ✋ emoji), used while `holdup` is active. */
function Palm({ mirrored = false }) {
  const dir = mirrored ? -1 : 1
  const pearl = { color: C.body, roughness: 0.34, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.32 }
  return (
    <group>
      {/* wrist joint */}
      <mesh position={[dir * -0.16, -0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 20]} />
        <meshPhysicalMaterial color={C.pod} roughness={0.4} clearcoat={0.5} />
      </mesh>
      {/* palm, flat side to the viewer */}
      <mesh position={[0, 0.05, 0.02]} scale={[1.05, 1.2, 0.45]}>
        <sphereGeometry args={[0.185, 24, 18]} />
        <meshPhysicalMaterial {...pearl} />
      </mesh>
      {/* four splayed fingers */}
      {[-0.115, -0.04, 0.04, 0.115].map((x) => (
        <mesh key={x} position={[x, 0.27 - Math.abs(x) * 0.5, 0.02]} rotation={[0, 0, -x * 1.4]}>
          <capsuleGeometry args={[0.047, 0.1, 6, 12]} />
          <meshPhysicalMaterial {...pearl} />
        </mesh>
      ))}
      {/* thumb out to the side */}
      <mesh position={[dir * 0.185, 0.03, 0.03]} rotation={[0, 0, dir * -1.05]}>
        <capsuleGeometry args={[0.05, 0.09, 6, 12]} />
        <meshPhysicalMaterial {...pearl} />
      </mesh>
    </group>
  )
}

/* A bare robot hand (no winter gloves in summer): pearl fist with a
   thumbs-up thumb, its wrist joint plugged into the shoulder pod
   (local -x points at the body). */
function Hand({ mirrored = false }) {
  const dir = mirrored ? -1 : 1
  const pearl = { color: C.body, roughness: 0.34, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.32 }
  return (
    <group>
      {/* wrist joint */}
      <mesh position={[dir * -0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 20]} />
        <meshPhysicalMaterial color={C.pod} roughness={0.4} clearcoat={0.5} />
      </mesh>
      {/* fist */}
      <mesh position={[dir * 0.07, 0, 0.01]} scale={[1.06, 0.92, 0.85]}>
        <sphereGeometry args={[0.215, 28, 20]} />
        <meshPhysicalMaterial {...pearl} />
      </mesh>
      {/* thumb: a small capsule, thumbs-up */}
      <mesh position={[dir * -0.02, 0.17, 0.05]} rotation={[0, 0, dir * -0.32]}>
        <capsuleGeometry args={[0.06, 0.1, 6, 14]} />
        <meshPhysicalMaterial {...pearl} />
      </mesh>
    </group>
  )
}

/* Cyber Guardian claw arm: three tapered ceramic shells that telescope
   like the reference sheet's arms. Each is an open lathe "cup" with a
   rounded lip; the last one closes into a rounded claw tip. */
function useGuardianClawParts(enabled) {
  const parts = useMemo(() => {
    if (!enabled) return null
    const mk = (rTop, rBot, len, tip) => {
      const N = 28
      const pts = []
      for (let i = 0; i <= N; i++) {
        const f = i / N
        let r
        if (f < 0.06) r = rTop * Math.sin((f / 0.06) * (Math.PI / 2)) // rounded lip
        else if (tip && f > 0.72) {
          const g = (f - 0.72) / 0.28
          r = (rTop + (rBot - rTop) * 0.72) * Math.cos(g * (Math.PI / 2)) // rounded point
        } else r = rTop + (rBot - rTop) * f
        pts.push(new THREE.Vector2(Math.max(r, 0.003), -f * len))
      }
      const geo = new THREE.LatheGeometry(pts, 36)
      geo.computeVertexNormals()
      return geo
    }
    return [mk(0.205, 0.16, 0.42, false), mk(0.168, 0.126, 0.42, false), mk(0.135, 0.07, 0.56, true)]
  }, [enabled])
  useEffect(() => () => parts?.forEach((g) => g.dispose()), [parts])
  return parts
}

/* Neutral studio environment so the guardian's ceramic + chrome pick up
   real reflections (per-material envMap - the classic skin is untouched). */
function useStudioEnv(enabled) {
  const gl = useThree((s) => s.gl)
  const tex = useMemo(() => {
    if (!enabled) return null
    const pmrem = new THREE.PMREMGenerator(gl)
    const t = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    return t
  }, [enabled, gl])
  useEffect(() => () => tex?.dispose(), [tex])
  return tex
}

/* Engraved panel-line texture for the guardian shell: long sweeping
   seams with staggered connectors, a few service hatches and rivet dots.
   Doubles as a bump map so the seams read as real grooves. */
function usePanelTexture(enabled) {
  const tex = useMemo(() => {
    if (!enabled) return null
    const W = 1024
    const H = 512
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, W, H)

    const seamLine = (y0, amp, phase) => {
      g.beginPath()
      for (let x = 0; x <= W; x += 8) {
        const y = y0 + Math.sin((x / W) * Math.PI * 2 * 2 + phase) * amp
        if (x === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.stroke()
    }
    const engrave = (width, alpha, draw) => {
      g.lineCap = 'round'
      g.strokeStyle = `rgba(96,86,140,${alpha})`
      g.lineWidth = width
      draw()
      g.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`
      g.lineWidth = width * 0.45
      g.save()
      g.translate(0, width * 0.55)
      draw()
      g.restore()
    }

    // three long panel seams sweeping around the shell
    engrave(7, 0.5, () => seamLine(150, 14, 0.6))
    engrave(7, 0.46, () => seamLine(268, 18, 2.3))
    engrave(6, 0.46, () => seamLine(372, 12, 4.1))

    // staggered vertical connectors between the seams
    const xs = [70, 210, 330, 470, 590, 700, 840, 950]
    xs.forEach((x, i) => {
      const top = i % 2 === 0 ? 150 : 268
      const bot = i % 2 === 0 ? 268 : 372
      engrave(5, 0.4, () => {
        g.beginPath()
        g.moveTo(x, top + 6)
        g.lineTo(x + (i % 3) * 6 - 6, bot - 6)
        g.stroke()
      })
    })

    // service hatches + rivets
    const hatch = (x, y, w, h) => {
      engrave(5, 0.42, () => {
        g.beginPath()
        g.roundRect(x, y, w, h, 8)
        g.stroke()
      })
    }
    hatch(120, 300, 74, 44)
    hatch(560, 176, 88, 52)
    hatch(806, 296, 70, 42)
    g.fillStyle = 'rgba(96,86,140,0.3)'
    ;[
      [260, 190], [420, 320], [660, 340], [900, 200], [80, 220], [520, 400],
    ].forEach(([x, y]) => {
      g.beginPath()
      g.arc(x, y, 3.4, 0, Math.PI * 2)
      g.fill()
    })

    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.anisotropy = 8
    return t
  }, [enabled])
  useEffect(() => () => tex?.dispose(), [tex])
  return tex
}
