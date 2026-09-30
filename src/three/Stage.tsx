import { CameraControls, Environment, Lightformer } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import type { Plant } from '../data/types'
import type { CameraCommand, ViewMode } from '../viewTypes'
import { plantBounds } from './models/registry'
import { Specimen, type SpecimenProps } from './Specimen'

const FOV = 32

/** Frames the specimen for each view, accounting for the viewport aspect. */
function framing(plant: Plant, mode: ViewMode, aspect: number) {
  const { height: potH, radius: potR } = plant.pot
  const bounds = plantBounds(plant)
  const spread = Math.max(potR * 2.4, bounds.radius * 2)
  const box =
    mode === 'roots'
      ? { top: 0.05, bottom: -potH - 0.09, width: potR * 2 + 0.32, x: 0.05, elevation: 0.3, margin: 1.15 }
      : { top: bounds.top, bottom: Math.min(-potH - 0.02, -bounds.radius * 0.1), width: spread, x: 0, elevation: 0.14, margin: mode === 'anatomy' ? 1.08 : 1.16 }

  const h = box.top - box.bottom
  const tan = Math.tan((FOV * Math.PI) / 360)
  const shift = aspect > 1.15 ? 0.09 : 0
  const distance = Math.max(h / 2 / tan, box.width / 2 / (tan * aspect) / (1 - 2 * shift)) * box.margin
  const target: [number, number, number] = [box.x, (box.top + box.bottom) / 2, 0]
  const azimuth = 0.42
  const position: [number, number, number] = [
    target[0] + distance * Math.cos(box.elevation) * Math.sin(azimuth),
    target[1] + distance * Math.sin(box.elevation),
    target[2] + distance * Math.cos(box.elevation) * Math.cos(azimuth),
  ]
  // On wide stages, nudge the specimen right so the title keeps clear air.
  const visibleWidth = 2 * distance * tan * aspect
  const offsetX = visibleWidth * shift
  return { position, target, distance, offsetX }
}

interface RigProps {
  plant: Plant
  mode: ViewMode
  command: CameraCommand | null
  reducedMotion: boolean
}

function CameraRig({ plant, mode, command, reducedMotion }: RigProps) {
  const controls = useRef<CameraControls>(null)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))

  const frame = useCallback(
    (animate: boolean) => {
      const c = controls.current
      if (!c) return
      const { position, target, distance, offsetX } = framing(plant, mode, aspect)
      c.minDistance = distance * 0.22
      c.maxDistance = distance * 2.4
      c.setLookAt(...position, ...target, animate && !reducedMotion)
      c.setFocalOffset(-offsetX, 0, 0, animate && !reducedMotion)
    },
    [plant, mode, aspect, reducedMotion],
  )

  const framed = useRef(false)
  useEffect(() => {
    frame(framed.current)
    framed.current = true
  }, [frame])

  useEffect(() => {
    const c = controls.current
    if (!command || !c) return
    if (command.type === 'reset') frame(true)
    else c.dolly(c.distance * (command.type === 'zoom-in' ? 0.25 : -0.3), !reducedMotion)
  }, [command, frame, reducedMotion])

  return <CameraControls ref={controls} makeDefault smoothTime={0.55} draggingSmoothTime={0.12} dollySpeed={0.6} maxPolarAngle={Math.PI * 0.62} />
}

export interface StageProps extends SpecimenProps {
  command: CameraCommand | null
}

export function Stage({ command, ...specimen }: StageProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: FOV, position: [0.6, 0.6, 2], near: 0.01, far: 40 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => specimen.onSelectRegion(null)}
    >
      <hemisphereLight args={['#f3f6ee', '#5f5a4b', 0.9]} />
      <directionalLight
        position={[1.3, 2.6, 1.7]}
        intensity={2.3}
        color="#fff8ec"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-1.3}
        shadow-camera-right={1.3}
        shadow-camera-top={1.6}
        shadow-camera-bottom={-1}
        shadow-camera-near={0.5}
        shadow-camera-far={6}
      />
      <directionalLight position={[-2, 1.2, -1.6]} intensity={0.7} color="#d9e6ff" />
      <Environment resolution={128}>
        <Lightformer intensity={1.4} position={[0, 3, 2]} scale={[5, 2, 1]} />
        <Lightformer intensity={0.6} position={[-3, 1, -1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#dfe8ff" />
        <Lightformer intensity={0.5} position={[3, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} color="#fff3e0" />
      </Environment>
      <Suspense fallback={null}>
        <Specimen {...specimen} />
      </Suspense>
      <CameraRig plant={specimen.plant} mode={specimen.mode} command={command} reducedMotion={specimen.reducedMotion} />
    </Canvas>
  )
}
