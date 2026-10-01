import { CameraControls, Environment, Lightformer } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Plant } from '../data/types'
import type { CameraCommand, ViewMode } from '../viewTypes'
import { plantBounds } from './models/registry'
import { Specimen, type SpecimenProps } from './Specimen'

const FOV = 32
const TAN = Math.tan((FOV * Math.PI) / 360)
/** Stage widths below this use the stacked mobile layout (see index.css). */
const NARROW = 900

/**
 * Screen areas (px) covered by overlay UI; the specimen is framed into what
 * remains. Desktop: title on the left, selector below. Narrow: title above,
 * mode switch and selector below, tools on the right.
 */
function safeInsets(width: number, mode: ViewMode) {
  if (width < NARROW) return { top: 140, bottom: 140, left: 8, right: 60 }
  // The root view adds a caption under the title, so keep more room on the left.
  const left = mode === 'roots' ? Math.min(width * 0.28, 360) : Math.min(width * 0.2, 300)
  return { top: 84, bottom: 96, left, right: 64 }
}

/** Frames the specimen for each view inside the safe area of the stage. */
function framing(plant: Plant, mode: ViewMode, width: number, height: number) {
  const { height: potH, radius: potR } = plant.pot
  const b = plantBounds(plant)
  // Root view: pot on the left, depth scale and its labels on the right
  // (rulerLayout places the scale at 1.06 R + 3.5 cm).
  const rootLeft = -potR * 1.08
  const rootRight = potR * 1.06 + 0.035 + 0.11
  const box =
    mode === 'roots'
      ? { top: 0.05, bottom: -potH - 0.09, width: rootRight - rootLeft, x: (rootLeft + rootRight) / 2, elevation: 0.3, margin: 1.08 }
      : {
          top: b.top,
          bottom: -potH - 0.02,
          // Frame the body; far tips may run off-screen, more so on narrow stages.
          width: Math.max(potR * 2.4, Math.min(b.reach * 2, b.body * (width < NARROW ? 2 : 2.5))),
          x: 0,
          elevation: 0.14,
          margin: mode === 'anatomy' ? 1.04 : 1.1,
        }

  const inset = safeInsets(width, mode)
  const effW = Math.max(120, width - inset.left - inset.right)
  const effH = Math.max(160, height - inset.top - inset.bottom)
  const aspect = width / Math.max(1, height)
  const fitH = ((box.top - box.bottom) / 2 / TAN) * (height / effH)
  const fitW = (box.width / 2 / (TAN * aspect)) * (width / effW)
  const distance = Math.max(fitH, fitW) * box.margin

  const target: [number, number, number] = [box.x, (box.top + box.bottom) / 2, 0]
  const azimuth = 0.42
  const position: [number, number, number] = [
    target[0] + distance * Math.cos(box.elevation) * Math.sin(azimuth),
    target[1] + distance * Math.sin(box.elevation),
    target[2] + distance * Math.cos(box.elevation) * Math.cos(azimuth),
  ]
  // Shift the view so the specimen centres in the safe area, not the canvas.
  const visibleH = 2 * distance * TAN
  const visibleW = visibleH * aspect
  const offset: [number, number] = [
    -(((inset.left - inset.right) / 2) / width) * visibleW,
    (((inset.top - inset.bottom) / 2) / height) * visibleH,
  ]
  return { position, target, distance, offset }
}

interface RigProps {
  plant: Plant
  mode: ViewMode
  command: CameraCommand | null
  reducedMotion: boolean
}

function CameraRig({ plant, mode, command, reducedMotion }: RigProps) {
  const controls = useRef<CameraControls>(null)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  const frame = useCallback(
    (animate: boolean) => {
      const c = controls.current
      if (!c) return
      const { position, target, distance, offset } = framing(plant, mode, width, height)
      c.minDistance = distance * 0.22
      c.maxDistance = distance * 2.4
      c.setLookAt(...position, ...target, animate && !reducedMotion)
      c.setFocalOffset(offset[0], offset[1], 0, animate && !reducedMotion)
    },
    [plant, mode, width, height, reducedMotion],
  )

  const framed = useRef(false)
  const handledCommand = useRef<CameraCommand | null>(null)
  useEffect(() => {
    frame(framed.current)
    framed.current = true
  }, [frame])

  useEffect(() => {
    const c = controls.current
    if (!command || !c || handledCommand.current === command) return
    handledCommand.current = command
    if (command.type === 'reset') frame(true)
    else c.dolly(c.distance * (command.type === 'zoom-in' ? 0.25 : -0.3), !reducedMotion)
  }, [command, frame, reducedMotion])

  return <CameraControls ref={controls} makeDefault smoothTime={reducedMotion ? 0 : 0.55} draggingSmoothTime={reducedMotion ? 0 : 0.12} dollySpeed={0.6} maxPolarAngle={Math.PI * 0.62} />
}

export interface StageProps extends SpecimenProps {
  command: CameraCommand | null
}

export function Stage({ command, ...specimen }: StageProps) {
  return (
    <Canvas
      // PCFSoftShadowMap is deprecated in current three.js; PCF is what it falls back to anyway.
      shadows={{ type: THREE.PCFShadowMap }}
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
