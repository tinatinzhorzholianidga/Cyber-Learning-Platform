import { Component, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroModel from './HeroModel.jsx'
import RobotModel from './RobotModel.jsx'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
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
    <div className="mascot-fallback" style={{ width: size, height: size }} aria-hidden="true">
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

export default function RobotCanvas({ size = 300, className = '', label, character = 'robot', ...robotProps }) {
  const reduced = useReducedMotion()
  const [hasWebgl] = useState(webglAvailable)
  const Model = character === 'hero' ? HeroModel : RobotModel

  return (
    <div
      className={`mascot-canvas ${className}`.trim()}
      style={{ width: size, height: size }}
      role="img"
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
            <Model reducedMotion={reduced} {...robotProps} />
          </Canvas>
        </GLBoundary>
      ) : (
        <Fallback size={size} />
      )}
    </div>
  )
}
