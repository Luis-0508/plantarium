import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ComponentProps, type ComponentRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { Plant } from '../data/types'
import type { StageAnim } from '../viewTypes'
import { rootExtent } from './models/registry'
import { rulerLayout } from './rulerLayout'
import { ScreenAnchors } from './ScreenAnchors'

type LineRef = ComponentRef<typeof Line>

/** drei Line whose opacity follows the root-view reveal. */
function FadeLine({ anim, strength = 1, ...props }: ComponentProps<typeof Line> & { anim: RefObject<StageAnim>; strength?: number }) {
  const ref = useRef<LineRef>(null)
  useFrame(() => {
    const m = ref.current?.material as THREE.Material & { opacity: number }
    if (m) m.opacity = (anim.current?.reveal ?? 0) * strength
  })
  return <Line ref={ref} transparent depthTest={false} renderOrder={10} opacity={0} {...props} />
}

const INK = '#eef3f8'

/**
 * Technical-drawing overlay for the root view: a depth scale that always sits
 * to the right of the pot (it turns with the camera), a root-depth level ring
 * and a spread dimension line under the pot. Labels are DOM (ui/StageOverlay).
 */
export function RootRuler({ plant, anim }: { plant: Plant; anim: RefObject<StageAnim> }) {
  const frame = useRef<THREE.Group>(null)
  const layout = useMemo(() => rulerLayout(plant, rootExtent(plant)), [plant])
  const { H, soilY, depthY, spread, x } = layout

  const ticks = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= layout.tickCount; i++) {
      const y = soilY - i / 100
      const len = i % 5 === 0 ? 0.012 : 0.006
      pts.push([x, y, 0], [x + len, y, 0])
    }
    return pts
  }, [layout, soilY, x])

  const ring = useMemo(
    () =>
      Array.from({ length: 97 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2
        return [Math.cos(a) * layout.depthRingRadius, depthY, Math.sin(a) * layout.depthRingRadius] as [number, number, number]
      }),
    [layout, depthY],
  )

  useFrame(({ camera }) => {
    if (frame.current) frame.current.rotation.y = Math.atan2(camera.position.x, camera.position.z)
  })

  return (
    <group>
      <FadeLine anim={anim} points={ring} color={INK} lineWidth={1} dashed dashSize={0.008} gapSize={0.006} strength={0.7} />
      <group ref={frame}>
        <FadeLine anim={anim} points={[[x, soilY, 0], [x, -H, 0]]} color={INK} lineWidth={1} strength={0.8} />
        <FadeLine anim={anim} points={ticks} segments color={INK} lineWidth={1} strength={0.8} />
        <FadeLine anim={anim} points={[[x - 0.005, soilY, 0], [x - 0.005, depthY, 0]]} color={INK} lineWidth={4} />
        <FadeLine
          anim={anim}
          points={[[x - 0.01, depthY, 0], [-layout.depthRingRadius, depthY, 0]]}
          color={INK}
          lineWidth={1}
          dashed
          dashSize={0.006}
          gapSize={0.005}
          strength={0.8}
        />
        <FadeLine anim={anim} points={[[-spread, -H - 0.035, 0], [spread, -H - 0.035, 0]]} color={INK} lineWidth={1} />
        <FadeLine
          anim={anim}
          segments
          points={[[-spread, -H - 0.028, 0], [-spread, -H - 0.042, 0], [spread, -H - 0.028, 0], [spread, -H - 0.042, 0]]}
          color={INK}
          lineWidth={1}
        />
      </group>
      <ScreenAnchors items={layout.labels} object={frame} />
    </group>
  )
}
