import * as THREE from 'three'
import type { AnatomyRegion, Plant } from '../../data/types'
import { createRng } from './geometry'
import { generatePalm } from './palm'
import { generateRoots } from './roots'
import { generateRosette } from './rosette'
import { soilLevel } from './potShape'

/** Region-separated geometry so each part can be highlighted and picked. */
export interface PlantGeometry {
  leaves: THREE.BufferGeometry
  stems: THREE.BufferGeometry
  crown: THREE.BufferGeometry
  roots: THREE.BufferGeometry
}

const cache = new Map<string, PlantGeometry>()

/**
 * Builds (and caches) the procedural geometry for a plant. To add a new
 * growth form, write a generator returning leaves/stems/crown/rootOrigins
 * and dispatch it here.
 */
export function buildProceduralGeometry(plant: Plant): PlantGeometry {
  const cached = cache.get(plant.id)
  if (cached) return cached
  if (plant.model.kind !== 'procedural') throw new Error(`${plant.id} has no procedural model`)

  const { params, seed } = plant.model
  const rng = createRng(seed)
  const soilY = soilLevel(plant.pot.height)

  const shoot =
    params.type === 'rosette'
      ? generateRosette(rng, params, soilY)
      : generatePalm(rng, params, soilY, plant.pot.radius)

  const roots = generateRoots({
    rng: createRng(seed * 31 + 5),
    potHeight: plant.pot.height,
    potRadius: plant.pot.radius,
    profile: plant.roots,
    origins: shoot.rootOrigins,
  })

  const geometry = { leaves: shoot.leaves, stems: shoot.stems, crown: shoot.crown, roots }
  cache.set(plant.id, geometry)
  return geometry
}

/** Extent of the shoot above the pot, for camera framing. */
export function plantBounds(plant: Plant): { top: number; radius: number } {
  if (plant.model.kind !== 'procedural') {
    return { top: plant.dimensions.specimenHeight, radius: plant.dimensions.maxSpreadCm / 200 }
  }
  const g = buildProceduralGeometry(plant)
  const box = new THREE.Box3()
  for (const geo of [g.leaves, g.stems, g.crown]) {
    geo.computeBoundingBox()
    if (geo.boundingBox) box.union(geo.boundingBox)
  }
  return { top: box.max.y, radius: Math.max(-box.min.x, box.max.x, -box.min.z, box.max.z) }
}

const REGION_GEOMETRY: Partial<Record<AnatomyRegion, keyof PlantGeometry>> = {
  leaf: 'leaves',
  stem: 'stems',
  crown: 'crown',
  roots: 'roots',
}

/**
 * Snaps a hotspot hint from the dataset onto the nearest vertex of its
 * region, so markers sit on the actual surface of the generated plant.
 */
export function snapAnchor(plant: Plant, region: AnatomyRegion, hint: [number, number, number]): [number, number, number] {
  const key = REGION_GEOMETRY[region]
  if (!key || plant.model.kind !== 'procedural') return hint
  const pos = buildProceduralGeometry(plant)[key].getAttribute('position')
  let best = Infinity
  let out = hint
  for (let i = 0; i < pos.count; i++) {
    const dx = pos.getX(i) - hint[0]
    const dy = pos.getY(i) - hint[1]
    const dz = pos.getZ(i) - hint[2]
    const d = dx * dx + dy * dy + dz * dz
    if (d < best) {
      best = d
      out = [pos.getX(i), pos.getY(i), pos.getZ(i)]
    }
  }
  return out
}
