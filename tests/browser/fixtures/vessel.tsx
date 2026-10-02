import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import type { BufferGeometry, Mesh } from 'three'
import { Vessel } from '../../../src/three/Vessel'
import type { StageAnim } from '../../../src/viewTypes'

/** Observe real disposal events, excluding R3F-owned declarative shadow geometry. */
function Probe() {
  const observed = useRef(new Map<BufferGeometry, () => void>())
  const disposed = useRef(0)
  useEffect(() => {
    const geometries = observed.current
    return () => { for (const [geometry, listener] of geometries) geometry.removeEventListener('dispose', listener) }
  }, [])
  useFrame(({ scene }) => {
    scene.traverse((object) => {
      const geometry = (object as Mesh).geometry
      if (!geometry || geometry.type === 'PlaneGeometry' || observed.current.has(geometry)) return
      const listener = () => { disposed.current++ }
      geometry.addEventListener('dispose', listener)
      observed.current.set(geometry, listener)
    })
    document.getElementById('created')!.textContent = String(observed.current.size)
    document.getElementById('disposed')!.textContent = String(disposed.current)
  })
  return null
}

export function Fixture() {
  const [mounted, setMounted] = useState(true)
  const anim = useRef<StageAnim>({ grow: 1, pose: 0, pot: 1, ghost: 0, soil: 1, stipple: 0.5, reveal: 0, shadow: 1,
    highlight: { leaf: 0, stem: 0, crown: 0, soil: 0, roots: 0 } })
  return <>
    <button onClick={() => setMounted((value) => !value)}>Toggle vessel</button>
    <output id="created">0</output><output id="disposed">0</output>
    <div style={{ width: 280, height: 240 }}>
      <Canvas camera={{ position: [0.4, 0.3, 0.5] }}>
        <ambientLight intensity={2} />
        {mounted && <Vessel radius={0.1} height={0.18} color="#887766" anim={anim} />}
        <Probe />
      </Canvas>
    </div>
  </>
}

createRoot(document.getElementById('root')!).render(<StrictMode><Fixture /></StrictMode>)
