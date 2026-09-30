import { useMemo, type RefObject } from 'react'
import type * as THREE from 'three'
import type { Plant } from '../data/types'
import { hotspotId } from './anchorRegistry'
import { snapAnchor } from './models/registry'
import { ScreenAnchors } from './ScreenAnchors'

/** Projects each anatomy note, snapped onto the plant's surface, to its DOM marker. */
export function Hotspots({ plant, space }: { plant: Plant; space: RefObject<THREE.Object3D | null> }) {
  const items = useMemo(
    () => plant.anatomy.map((n) => ({ id: hotspotId(n.region), position: snapAnchor(plant, n.region, n.anchor) })),
    [plant],
  )
  return <ScreenAnchors items={items} object={space} />
}
