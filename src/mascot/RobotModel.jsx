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

/* Metal droid palette: two-tone steel + gunmetal with chrome trim,
   so the metal version reads unmistakably metallic next to the pearl
   original. Amber for the little caution light. */
const M = {
  steel: '#b9bfce',
  gunmetal: '#565b6e',
  dark: '#31343f',
  chrome: '#e6e9f2',
  bolt: '#9aa0af',
  amber: '#ffb020',
}

/* shared material props */
const STEEL = { color: '#c6cbd8', metalness: 0.95, roughness: 0.32 }
const GUNMETAL = { color: M.gunmetal, metalness: 0.92, roughness: 0.26 }
const DARKMETAL = { color: M.dark, metalness: 0.85, roughness: 0.3 }
const CHROME = { color: M.chrome, metalness: 1, roughness: 0.14 }

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

/* points on the body sphere for the chest LEDs and the dials.
   The LEDs always live on the body shell - on the metal skin the
   armor shield has a notch cut out of its lower band so they stay
   fully visible. */
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
    const dial = new THREE.Vector3().setFromSphericalCoords(1.004, 2.08, 1.08) // classic: original spot
    const vent = new THREE.Vector3().setFromSphericalCoords(1.004, 2.08, 0.88) // metal: visible from the front
    return { leds, dial, vent }
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
  variant = 'default', // 'default' | 'builder' (DGA hard hat)
  skin = 'classic', // 'classic' (headphones + sprout) | 'metal' (droid armor, no headgear)
  holdup = false, // raise an open palm: "hold up, under construction"
  onTap,
}) {
  const metal = skin === 'metal' && variant !== 'builder'
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

  const { leds, dial, vent } = useSurfacePoints()
  const envMap = useStudioEnv(metal)
  const panelTex = useBrushedPanelTexture(metal)
  const armorFrame = useArmorFrameGeometry(metal)
  const finGeo = useHelmetFinGeometry(metal)

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
    const full = { ...state, noPlate: variant === 'builder', metal }
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
  }, [emotion, texture, metal])

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
    if (a.gesture) {
      const e = t - a.gesture.start
      if (a.gesture.type === 'wave') {
        const dur = 1.7
        if (e >= dur) a.gesture = null
        else {
          waveB = clamp01(e / 0.25) * clamp01((dur - e) / 0.3)
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

    /* ---- hands (same approved rig on both skins): the wave raises
       the fist beside the head and rocks it, the LEFT palm rises with
       a springy overshoot for "hold up" and hovers with little
       air-pats. ---- */
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

  /* helper: place a hex bolt standing on the sphere surface */
  const Bolt = ({ at, r = 0.034, envMap: env }) => (
    <group position={at} onUpdate={(g) => g.lookAt(at[0] * 2, at[1] * 2, at[2] * 2)}>
      <mesh rotation={[Math.PI / 2, 0, 0.4]}>
        <cylinderGeometry args={[r, r * 1.12, 0.03, 6]} />
        <meshStandardMaterial color={M.bolt} metalness={0.9} roughness={0.28} envMap={env} />
      </mesh>
    </group>
  )

  const sph = (rad, phi, theta) => {
    const v = new THREE.Vector3().setFromSphericalCoords(rad, phi, theta)
    return [v.x, v.y, v.z]
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
            {metal ? (
              /* brushed steel shell with engraved panel seams */
              <meshStandardMaterial
                color="#ffffff"
                map={panelTex}
                bumpMap={panelTex}
                bumpScale={0.85}
                metalness={0.92}
                roughness={0.44}
                envMap={envMap}
                envMapIntensity={0.72}
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
          ) : metal ? (
            /* METAL DROID HEAD, Big Hero 6 style: a clean faceted helmet
               dome with a chrome edge ring, a raised hex plate on the
               forehead like Baymax's armor, and two swept angular fins
               rising from the upper sides of the head */
            <group>
              <mesh>
                <sphereGeometry args={[1.014, 48, 20, 0, Math.PI * 2, 0, 0.62]} />
                <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
              </mesh>
              <mesh position={[0, Math.cos(0.62) * 1.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[Math.sin(0.62) * 1.014, 0.02, 10, 56]} />
                <meshStandardMaterial {...CHROME} envMap={envMap} />
              </mesh>

              {/* swept helmet fins, rising up and out - the Baymax ears */}
              {[-1, 1].map((side) => (
                <group
                  key={side}
                  position={[side * 0.54, 0.76, -0.06]}
                  rotation={[-0.12, 0, side * -0.06]}
                  scale={[side * 0.92, 0.92, 0.92]}
                >
                  <mesh geometry={finGeo}>
                    <meshStandardMaterial {...GUNMETAL} envMap={envMap} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              ))}

              {/* mechanical ear discs */}
              {[-1, 1].map((side) => (
                <group key={side} position={[side * 0.99, 0.06, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.21, 0.23, 0.06, 28]} />
                    <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
                  </mesh>
                  <mesh position={[side * 0.033, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.155, 0.016, 10, 32]} />
                    <meshStandardMaterial {...CHROME} envMap={envMap} />
                  </mesh>
                  {[-0.05, 0, 0.05].map((dy) => (
                    <mesh key={dy} position={[side * 0.037, dy, 0]} rotation={[0, side * (Math.PI / 2), 0]}>
                      <boxGeometry args={[0.17, 0.024, 0.012]} />
                      <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.4} />
                    </mesh>
                  ))}
                </group>
              ))}
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
              {metal ? (
                <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
              ) : (
                <meshPhysicalMaterial color={C.pod} roughness={0.4} clearcoat={0.5} />
              )}
            </mesh>
          ))}

          {/* bare hands, wrists plugged into the shoulder pods
              (same approved shapes + animation on both skins - the
              metal skin just casts them in steel) */}
          <group ref={mittR} position={[1.08, -0.18, 0.14]} rotation={[0, 0, -0.22]}>
            <Hand metal={metal} envMap={envMap} />
          </group>
          <group ref={mittL} position={[-1.08, -0.18, 0.14]} rotation={[0, 0, 0.22]}>
            {holdup ? <Palm mirrored metal={metal} envMap={envMap} /> : <Hand mirrored metal={metal} envMap={envMap} />}
          </group>

          {/* chest LEDs - always on the body shell */}
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

          {!metal && (
            /* little dial, bottom right, a nod to the original */
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
          )}

          {metal && (
            <group>
              {/* THE ARMOR: thick beveled gunmetal shield bent around the
                  face - dark against the steel shell so it clearly reads */}
              <mesh geometry={armorFrame}>
                <meshStandardMaterial color="#464b5c" metalness={0.9} roughness={0.3} envMap={envMap} envMapIntensity={0.9} />
              </mesh>
              {/* chunky bolts standing off the armor plate */}
              {[
                [1.0, 0.05],
                [-1.0, 0.05],
                [0.86, 0.88],
                [-0.86, 0.88],
                [0.88, -0.78],
                [-0.88, -0.78],
              ].map(([aa, bb], i) => {
                const r = 1.072
                const px = r * Math.sin(aa) * Math.cos(bb)
                const py = r * Math.sin(bb)
                const pz = r * Math.cos(aa) * Math.cos(bb)
                return <Bolt key={i} at={[px, py, pz]} envMap={envMap} />
              })}

              {/* embossed mechanical vent, front right - the droid speaker */}
              <group position={vent} onUpdate={(g) => g.lookAt(vent.x * 2, vent.y * 2, vent.z * 2)}>
                <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.115, 0.13, 0.05, 28]} />
                  <meshStandardMaterial {...DARKMETAL} envMap={envMap} />
                </mesh>
                <mesh position={[0, 0, 0.035]}>
                  <circleGeometry args={[0.105, 28]} />
                  <meshStandardMaterial {...STEEL} envMap={envMap} />
                </mesh>
                <mesh position={[0, 0, 0.041]}>
                  <torusGeometry args={[0.098, 0.013, 10, 32]} />
                  <meshStandardMaterial {...CHROME} envMap={envMap} />
                </mesh>
                {Array.from({ length: 8 }).map((_, i) => {
                  const ang = (i / 8) * Math.PI * 2
                  return (
                    <mesh
                      key={i}
                      position={[Math.cos(ang) * 0.056, Math.sin(ang) * 0.056, 0.043]}
                      rotation={[0, 0, ang]}
                    >
                      <boxGeometry args={[0.05, 0.013, 0.01]} />
                      <meshStandardMaterial color={M.dark} metalness={0.8} roughness={0.35} envMap={envMap} />
                    </mesh>
                  )
                })}
                <mesh position={[0, 0, 0.048]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.016, 6]} />
                  <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.35} envMap={envMap} />
                </mesh>
              </group>

              {/* riveted service plates hugging the shell */}
              {[
                [-0.72, -0.42, 0.55],
                [0.62, 0.1, -0.78],
                [-0.6, 0.35, -0.72],
              ].map(([px, py, pz], pi) => (
                <group key={pi} position={[px, py, pz]} onUpdate={(g) => g.lookAt(px * 2, py * 2, pz * 2)}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.165, 0.055, 28]} />
                    <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
                  </mesh>
                  {[
                    [0.1, 0.1], [-0.1, 0.1], [0.1, -0.1], [-0.1, -0.1],
                  ].map(([rx, ry], ri) => (
                    <mesh key={ri} position={[rx * 0.72, ry * 0.72, 0.03]} rotation={[Math.PI / 2, 0, 0.3]}>
                      <cylinderGeometry args={[0.016, 0.019, 0.02, 6]} />
                      <meshStandardMaterial color={M.bolt} metalness={0.9} roughness={0.3} envMap={envMap} />
                    </mesh>
                  ))}
                </group>
              ))}

              {/* ventilation grille, low on the left */}
              <group position={[-0.86, -0.12, 0.48]} onUpdate={(g) => g.lookAt(-1.72, -0.24, 0.96)}>
                <mesh position={[0, 0, 0.004]}>
                  <boxGeometry args={[0.21, 0.14, 0.05]} />
                  <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
                </mesh>
                {[-0.034, 0, 0.034].map((dy) => (
                  <mesh key={dy} position={[0, dy, 0.032]}>
                    <boxGeometry args={[0.16, 0.02, 0.012]} />
                    <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.4} />
                  </mesh>
                ))}
              </group>

              {/* dark undercarriage plate with chrome rim, low enough to
                  keep clear of the chest LEDs */}
              <mesh>
                <sphereGeometry args={[1.012, 48, 16, 0, Math.PI * 2, 2.66, Math.PI - 2.66]} />
                <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
              </mesh>
              <mesh position={[0, Math.cos(2.66) * 1.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[Math.sin(2.66) * 1.012, 0.02, 10, 56]} />
                <meshStandardMaterial {...CHROME} envMap={envMap} />
              </mesh>
              {[0.9, 2.0, 3.1, 4.2, 5.3].map((ang) => (
                <Bolt key={ang} at={sph(1.026, 2.78, ang)} envMap={envMap} />
              ))}

              {/* little chrome holoprojector dome on the back */}
              <group position={[-0.62, 0.55, -0.55]} onUpdate={(g) => g.lookAt(-1.24, 1.1, -1.1)}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.075, 0.014, 10, 28]} />
                  <meshStandardMaterial {...GUNMETAL} envMap={envMap} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <sphereGeometry args={[0.068, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial {...CHROME} envMap={envMap} />
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
function Palm({ mirrored = false, metal = false, envMap = null }) {
  const dir = mirrored ? -1 : 1
  const skinMat = metal
    ? { color: '#c6cbd8', metalness: 0.92, roughness: 0.4, envMap, envMapIntensity: 0.8 }
    : { color: C.body, roughness: 0.34, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.32 }
  const wristMat = metal
    ? { color: M.gunmetal, metalness: 0.92, roughness: 0.26, envMap }
    : { color: C.pod, roughness: 0.4, clearcoat: 0.5 }
  const Mat = metal ? 'meshStandardMaterial' : 'meshPhysicalMaterial'
  return (
    <group>
      {/* wrist joint */}
      <mesh position={[dir * -0.16, -0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 20]} />
        <Mat {...wristMat} />
      </mesh>
      {/* palm, flat side to the viewer */}
      <mesh position={[0, 0.05, 0.02]} scale={[1.05, 1.2, 0.45]}>
        <sphereGeometry args={[0.185, 24, 18]} />
        <Mat {...skinMat} />
      </mesh>
      {/* four splayed fingers */}
      {[-0.115, -0.04, 0.04, 0.115].map((x) => (
        <mesh key={x} position={[x, 0.27 - Math.abs(x) * 0.5, 0.02]} rotation={[0, 0, -x * 1.4]}>
          <capsuleGeometry args={[0.047, 0.1, 6, 12]} />
          <Mat {...skinMat} />
        </mesh>
      ))}
      {/* thumb out to the side */}
      <mesh position={[dir * 0.185, 0.03, 0.03]} rotation={[0, 0, dir * -1.05]}>
        <capsuleGeometry args={[0.05, 0.09, 6, 12]} />
        <Mat {...skinMat} />
      </mesh>
    </group>
  )
}

/* A bare robot hand: pearl fist with a thumbs-up thumb on the classic
   skin, cast in brushed steel with a gunmetal wrist on the metal skin.
   The wrist joint plugs into the shoulder pod (local -x points at the
   body). */
function Hand({ mirrored = false, metal = false, envMap = null }) {
  const dir = mirrored ? -1 : 1
  const skinMat = metal
    ? { color: '#c6cbd8', metalness: 0.92, roughness: 0.4, envMap, envMapIntensity: 0.8 }
    : { color: C.body, roughness: 0.34, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.32 }
  const wristMat = metal
    ? { color: M.gunmetal, metalness: 0.92, roughness: 0.26, envMap }
    : { color: C.pod, roughness: 0.4, clearcoat: 0.5 }
  const Mat = metal ? 'meshStandardMaterial' : 'meshPhysicalMaterial'
  return (
    <group>
      {/* wrist joint */}
      <mesh position={[dir * -0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 20]} />
        <Mat {...wristMat} />
      </mesh>
      {/* fist */}
      <mesh position={[dir * 0.07, 0, 0.01]} scale={[1.06, 0.92, 0.85]}>
        <sphereGeometry args={[0.215, 28, 20]} />
        <Mat {...skinMat} />
      </mesh>
      {/* thumb: a small capsule, thumbs-up */}
      <mesh position={[dir * -0.02, 0.17, 0.05]} rotation={[0, 0, dir * -0.32]}>
        <capsuleGeometry args={[0.06, 0.1, 6, 14]} />
        <Mat {...skinMat} />
      </mesh>
    </group>
  )
}

/* The armor plate around the face: a rounded-rectangle ring drawn in
   angular space (x = horizontal angle, y = vertical angle), extruded
   with a bevel for real thickness, then every vertex is bent onto the
   body sphere. A thick curved shield that hugs the shell and frames
   the recessed screen. */
function useArmorFrameGeometry(enabled) {
  const geo = useMemo(() => {
    if (!enabled) return null
    const rr = (ctx, x, y, w, h, r) => {
      ctx.moveTo(x, y + r)
      ctx.lineTo(x, y + h - r)
      ctx.quadraticCurveTo(x, y + h, x + r, y + h)
      ctx.lineTo(x + w - r, y + h)
      ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
      ctx.lineTo(x + w, y + r)
      ctx.quadraticCurveTo(x + w, y, x + w - r, y)
      ctx.lineTo(x + r, y)
      ctx.quadraticCurveTo(x, y, x, y + r)
    }
    /* outer edge of the shield - same rounded rectangle as before, but
       with a notch cut upward out of the bottom edge where the chest
       LEDs sit on the body, so the armor never covers them */
    const L = -1.13
    const R = 1.13
    const B = -0.98
    const T = 1.05
    const CR = 0.42
    const NL = -0.66 // notch left
    const NR = 0.34 // notch right
    const NT = -0.74 // notch top
    const NC = 0.07 // notch corner radius
    const shape = new THREE.Shape()
    shape.moveTo(L, B + CR)
    shape.lineTo(L, T - CR)
    shape.quadraticCurveTo(L, T, L + CR, T)
    shape.lineTo(R - CR, T)
    shape.quadraticCurveTo(R, T, R, T - CR)
    shape.lineTo(R, B + CR)
    shape.quadraticCurveTo(R, B, R - CR, B)
    // bottom edge (right to left) with the LED notch
    shape.lineTo(NR, B)
    shape.lineTo(NR, NT - NC)
    shape.quadraticCurveTo(NR, NT, NR - NC, NT)
    shape.lineTo(NL + NC, NT)
    shape.quadraticCurveTo(NL, NT, NL, NT - NC)
    shape.lineTo(NL, B)
    shape.lineTo(L + CR, B)
    shape.quadraticCurveTo(L, B, L, B + CR)
    const hole = new THREE.Path()
    rr(hole, -0.92, -0.69, 1.84, 1.52, 0.3) // window the screen sits in
    shape.holes.push(hole)
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 20,
    })
    const pos = g.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const rad = 1.012 + v.z
      pos.setXYZ(i, rad * Math.sin(v.x) * Math.cos(v.y), rad * Math.sin(v.y), rad * Math.cos(v.x) * Math.cos(v.y))
    }
    g.computeVertexNormals()
    return g
  }, [enabled])
  useEffect(() => () => geo?.dispose(), [geo])
  return geo
}

/* Swept helmet fin, Big Hero 6 style: a flat angular blade, wide at
   the base, sweeping up and out to a pointed tip. Drawn in the xy
   plane (x = outward, y = up) and extruded thin in z. The right fin
   uses the geometry as-is; the left is mirrored with scale x -1. */
function useHelmetFinGeometry(enabled) {
  const geo = useMemo(() => {
    if (!enabled) return null
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(0.28, -0.1)
    s.lineTo(0.44, 0.24)
    s.lineTo(0.26, 0.58)
    s.lineTo(0.06, 0.3)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.016,
      bevelSegments: 2,
    })
    g.translate(0, 0, -0.025)
    g.computeVertexNormals()
    return g
  }, [enabled])
  useEffect(() => () => geo?.dispose(), [geo])
  return geo
}

/* Neutral studio environment so steel + chrome pick up real
   reflections (per-material envMap - the classic skin is untouched). */
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

/* Brushed-steel panel texture for the metal shell: silver base with
   horizontal brush streaks, bold dark panel seams with staggered
   connectors, service hatches and rivets. Doubles as a bump map so
   the seams read as real grooves. */
function useBrushedPanelTexture(enabled) {
  const tex = useMemo(() => {
    if (!enabled) return null
    const W = 1024
    const H = 512
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')

    // silver base with a soft vertical sheen
    const base = g.createLinearGradient(0, 0, 0, H)
    base.addColorStop(0, '#cdd1dd')
    base.addColorStop(0.45, '#c2c7d4')
    base.addColorStop(0.55, '#cfd3df')
    base.addColorStop(1, '#bcc1cf')
    g.fillStyle = base
    g.fillRect(0, 0, W, H)

    // horizontal brushed-metal streaks
    for (let i = 0; i < 260; i++) {
      const y = (i * 37) % H
      const on = (i * 811) % 200
      g.strokeStyle = i % 3 === 0 ? 'rgba(255,255,255,0.10)' : 'rgba(64,68,84,0.08)'
      g.lineWidth = 1 + (i % 2)
      g.beginPath()
      g.moveTo(on, y + (i % 5))
      g.lineTo(on + 320 + ((i * 137) % 500), y + (i % 5))
      g.stroke()
    }

    const seamLine = (y0, amp, phase) => {
      g.beginPath()
      for (let x = 0; x <= W; x += 8) {
        const y = y0 + Math.sin((x / W) * Math.PI * 4 + phase) * amp
        if (x === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.stroke()
    }
    const engrave = (width, alpha, draw) => {
      g.lineCap = 'round'
      g.strokeStyle = `rgba(38,41,52,${alpha})`
      g.lineWidth = width
      draw()
      g.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`
      g.lineWidth = width * 0.4
      g.save()
      g.translate(0, width * 0.6)
      draw()
      g.restore()
    }

    // bold panel seams sweeping around the shell
    engrave(8, 0.8, () => seamLine(146, 12, 0.6))
    engrave(8, 0.75, () => seamLine(262, 16, 2.3))
    engrave(7, 0.75, () => seamLine(368, 11, 4.1))

    // staggered vertical connectors between the seams
    const xs = [70, 210, 330, 470, 590, 700, 840, 950]
    xs.forEach((x, i) => {
      const top = i % 2 === 0 ? 146 : 262
      const bot = i % 2 === 0 ? 262 : 368
      engrave(6, 0.6, () => {
        g.beginPath()
        g.moveTo(x, top + 6)
        g.lineTo(x + (i % 3) * 6 - 6, bot - 6)
        g.stroke()
      })
    })

    // service hatches + rivets
    const hatch = (x, y, w, h) => {
      engrave(6, 0.65, () => {
        g.beginPath()
        g.roundRect(x, y, w, h, 8)
        g.stroke()
      })
    }
    hatch(120, 296, 74, 46)
    hatch(560, 172, 88, 54)
    hatch(806, 292, 70, 44)
    ;[
      [260, 186], [420, 316], [660, 336], [900, 196], [80, 216], [520, 396], [340, 200], [740, 240],
    ].forEach(([x, y]) => {
      g.fillStyle = 'rgba(38,41,52,0.65)'
      g.beginPath()
      g.arc(x, y, 4.2, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = 'rgba(255,255,255,0.5)'
      g.beginPath()
      g.arc(x - 1.2, y - 1.2, 1.6, 0, Math.PI * 2)
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
