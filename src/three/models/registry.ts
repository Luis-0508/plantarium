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

export interface ShootBounds {
  /** Height reached by all but the highest 0.5 % of shoot vertices. */
  top: number
  /** Horizontal radius containing 85 % of shoot vertices: the visual body. */
  body: number
  /** Outermost leaf tip or runner. */
  reach: number
}

const boundsCache = new Map<string, ShootBounds>()

/**
 * Robust shoot extent for camera framing. Percentiles keep a single long
 * runner or frond tip from forcing the camera far away.
 */
export function plantBounds(plant: Plant): ShootBounds {
  const cached = boundsCache.get(plant.id)
  if (cached) return cached
  let bounds: ShootBounds
  if (plant.model.kind !== 'procedural') {
    const r = plant.dimensions.maxSpreadCm / 200
    bounds = { top: plant.dimensions.specimenHeight, body: r * 0.75, reach: r }
  } else {
    const g = buildProceduralGeometry(plant)
    const heights: number[] = []
    const radii: number[] = []
    for (const geo of [g.leaves, g.stems, g.crown]) {
      const pos = geo.getAttribute('position')
      for (let i = 0; i < pos.count; i += 2) {
        heights.push(pos.getY(i))
        radii.push(Math.hypot(pos.getX(i), pos.getZ(i)))
      }
    }
    heights.sort((a, b) => a - b)
    radii.sort((a, b) => a - b)
    const pct = (arr: number[], q: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))]
    bounds = { top: pct(heights, 0.995), body: pct(radii, 0.85), reach: radii[radii.length - 1] }
  }
  boundsCache.set(plant.id, bounds)
  return bounds
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

/**
 * Measured rooting depth below the soil surface and maximum lateral spread of
 * the rendered roots (metres). Undefined for non-procedural models.
 */
export function rootExtent(plant: Plant): { depth: number; spread: number } | undefined {
  if (plant.model.kind !== 'procedural') return undefined
  const pos = buildProceduralGeometry(plant).roots.getAttribute('position')
  let minY = Infinity
  let spread = 0
  for (let i = 0; i < pos.count; i++) {
    minY = Math.min(minY, pos.getY(i))
    spread = Math.max(spread, Math.hypot(pos.getX(i), pos.getZ(i)))
  }
  return { depth: soilLevel(plant.pot.height) - minY, spread }
}
