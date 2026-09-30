import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AnatomyRegion, Plant } from '../data/types'
import type { PotOption, SoilOption, StageAnim, ViewMode } from '../viewTypes'
import { Hotspots } from './Hotspots'
import { windUniforms } from './materials'
import { soilLevel } from './models/potShape'
import { PlantModel } from './PlantModel'
import { RootRuler } from './RootRuler'
import { Vessel } from './Vessel'

export interface SpecimenProps {
  plant: Plant
  mode: ViewMode
  potOption: PotOption
  soilOption: SoilOption
  selectedRegion: AnatomyRegion | null
  hoveredRegion: AnatomyRegion | null
  onHoverRegion: (region: AnatomyRegion | null) => void
  onSelectRegion: (region: AnatomyRegion | null) => void
  reducedMotion: boolean
}

const REGIONS: AnatomyRegion[] = ['leaf', 'stem', 'crown', 'soil', 'roots']

/** What each view asks of pot, soil and roots. */
function targetsFor(mode: ViewMode, pot: PotOption, soil: SoilOption) {
  if (mode === 'roots') return { pot: 0, ghost: 1, soil: 0.05, stipple: 0.75, reveal: 1, shadow: 0 }
  if (mode === 'anatomy') {
    return { pot: 0, ghost: pot === 'hidden' ? 0 : 0.7, soil: 0.42, stipple: 0.3, reveal: 0, shadow: 0.7 }
  }
  return {
    pot: pot === 'solid' ? 1 : 0,
    ghost: pot === 'ghost' ? 0.75 : 0,
    soil: soil === 'solid' ? 1 : 0.22,
    stipple: soil === 'solid' ? 0 : 0.45,
    reveal: 0,
    shadow: pot === 'hidden' ? 0.6 : 1,
  }
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * The specimen on the stage: pot, soil, plant and roots. Handles the
 * shrink-and-regrow transition between plants and eases every view change.
 */
export function Specimen(props: SpecimenProps) {
  const { plant, mode, potOption, soilOption, selectedRegion, hoveredRegion, reducedMotion } = props
  const [shown, setShown] = useState(plant)
  const growGroup = useRef<THREE.Group>(null)
  const modelSpace = useRef<THREE.Group>(null)
  const phase = useRef<'in' | 'out'>('in')
  const anim = useRef<StageAnim>({
    ...targetsFor(mode, potOption, soilOption),
    grow: reducedMotion ? 1 : 0,
    highlight: { leaf: 0, stem: 0, crown: 0, soil: 0, roots: 0 },
  })

  useEffect(() => {
    if (plant.id !== shown.id) phase.current = 'out'
  }, [plant, shown.id])

  useEffect(() => {
    windUniforms.uWind.value = reducedMotion ? 0 : 1
  }, [reducedMotion])

  useFrame((state, dt) => {
    const a = anim.current
    // Clamp only large hitches (tab switches); slow devices still animate in real time.
    const step = Math.min(dt, 0.1)
    windUniforms.uTime.value = state.clock.elapsedTime

    const t = targetsFor(mode, potOption, soilOption)
    const k = reducedMotion ? 1 : 1 - Math.exp(-step * 3.2)
    a.pot += (t.pot - a.pot) * k
    a.ghost += (t.ghost - a.ghost) * k
    a.soil += (t.soil - a.soil) * k
    a.stipple += (t.stipple - a.stipple) * k
    a.reveal += (t.reveal - a.reveal) * k
    a.shadow += (t.shadow - a.shadow) * k

    const focus = selectedRegion ?? hoveredRegion
    for (const r of REGIONS) {
      const target = mode === 'anatomy' && focus === r ? 1 : 0
      a.highlight[r] += (target - a.highlight[r]) * (1 - Math.exp(-step * 10))
    }

    // Plant switch: wilt back into the soil, swap, then regrow.
    if (phase.current === 'out') {
      a.grow = reducedMotion ? 0 : Math.max(0, a.grow - step * 3.2)
      if (a.grow <= 0) {
        phase.current = 'in'
        setShown(plant)
      }
    } else if (a.grow < 1) {
      a.grow = reducedMotion ? 1 : Math.min(1, a.grow + step / 1.25)
    }

    if (growGroup.current) {
      const s = Math.max(0.0001, easeOut(a.grow))
      growGroup.current.scale.set(s, s ** 0.85, s)
      growGroup.current.rotation.y = (1 - s) * 0.9
    }
  })

  const soilY = soilLevel(shown.pot.height)
  const interactive = mode === 'anatomy'

  // Pick the most meaningful region under the pointer. Soil is translucent in
  // this view, so rays through its sides resolve to the roots behind it.
  const regionFrom = (e: ThreeEvent<PointerEvent | MouseEvent>): AnatomyRegion | null => {
    const hits = e.intersections.filter((i) => i.object.userData.region)
    if (!hits.length) return null
    const first = hits[0]
    const region = first.object.userData.region as AnatomyRegion
    if (region === 'soil') {
      const onTop = (first.face?.normal.y ?? 0) > 0.5
      if (!onTop && hits.some((h) => h.object.userData.region === 'roots')) return 'roots'
    }
    return region
  }

  return (
    <group
      onPointerMove={
        interactive
          ? (e) => {
              e.stopPropagation()
              const region = regionFrom(e)
              if (region !== hoveredRegion) props.onHoverRegion(region)
              document.body.style.cursor = region ? 'pointer' : ''
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              props.onHoverRegion(null)
              document.body.style.cursor = ''
            }
          : undefined
      }
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation()
              props.onSelectRegion(regionFrom(e))
            }
          : undefined
      }
    >
      <Vessel radius={plant.pot.radius} height={plant.pot.height} color={plant.pot.color} anim={anim} />

      <group position={[0, soilY, 0]}>
        <group ref={growGroup}>
          <group position={[0, -soilY, 0]} ref={modelSpace}>
            <PlantModel plant={shown} anim={anim} />
          </group>
        </group>
      </group>

      {mode === 'roots' && shown.id === plant.id && <RootRuler plant={shown} anim={anim} />}
      {mode === 'anatomy' && shown.id === plant.id && (
        <Hotspots plant={shown} space={modelSpace} />
      )}
    </group>
  )
}
