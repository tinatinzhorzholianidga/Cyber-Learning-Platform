import { Component, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import RobotModel from './RobotModel.jsx'

/* Honour the visitor's reduced-motion setting: the model then paints a
   still face and the canvas only renders on demand. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    // Safari < 14: MediaQueryList is not an EventTarget yet
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])
  return reduced
}

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/* if WebGL is missing or the renderer crashes, show a friendly sticker
   instead of a broken canvas */
function Fallback({ size }) {
  return (
    <div className="io-fallback" style={{ width: size, height: size }} aria-hidden="true">
      🤖
    </div>
  )
}

class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* IO's 3D stage. Everything not listed here (emotion, gesture, talking,
   follow, idle, skin, onTap …) is forwarded to the model. */
export default function RobotCanvas({ size = 300, className = '', label, ...robotProps }) {
  const reduced = useReducedMotion()
  const [hasWebgl] = useState(webglAvailable)

  // Track the cursor across the WHOLE window (r3f's own pointer only
  // updates while the cursor is over the small canvas), normalised to
  // the same -1..1 space r3f uses.
  const windowPointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => {
      windowPointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      windowPointer.current.y = 1 - (e.clientY / window.innerHeight) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // keyboard users can "tap" IO too (Enter / Space) when he is clickable
  const { onTap } = robotProps
  const onKeyDown = (e) => {
    if (!onTap || (e.key !== 'Enter' && e.key !== ' ')) return
    e.preventDefault()
    onTap()
  }

  return (
    <div
      className={`io-canvas ${className}`.trim()}
      style={{ width: size, height: size }}
      role={onTap ? 'button' : 'img'}
      tabIndex={onTap ? 0 : undefined}
      onKeyDown={onKeyDown}
      aria-label={label}
    >
      {hasWebgl ? (
        <GLBoundary fallback={<Fallback size={size} />}>
          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            camera={{ fov: 32, position: [0, 0.25, 6.9] }}
            frameloop={reduced ? 'demand' : 'always'}
          >
            <ambientLight color="#f1edff" intensity={1.15} />
            <directionalLight position={[3, 5, 4]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-4, 2, -3]} intensity={14} color="#8b5cff" />
            <pointLight position={[0, -2, 3]} intensity={6} color="#ffd9a1" />
            <RobotModel reducedMotion={reduced} windowPointer={windowPointer} {...robotProps} />
          </Canvas>
        </GLBoundary>
      ) : (
        <Fallback size={size} />
      )}
    </div>
  )
}
