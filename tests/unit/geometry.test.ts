import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { plants } from '../../src/data/plants'
import { generatePalm } from '../../src/three/models/palm'
import { generateRosette } from '../../src/three/models/rosette'
import { generateRoots } from '../../src/three/models/roots'
import { createRng } from '../../src/three/models/rng'
import { innerRadiusAt, potFloor, soilLevel } from '../../src/three/models/potShape'
import { buildProceduralGeometry, plantBounds, rootExtent } from '../../src/three/models/registry'
import type { Plant } from '../../src/data/types'

const bytes = (array: ArrayBufferView) => Buffer.from(array.buffer, array.byteOffset, array.byteLength)

function generate(plant: Plant) {
  if (plant.model.kind !== 'procedural') throw new Error('Expected procedural fixture')
  const { params, seed } = plant.model
  const shoot = params.type === 'rosette'
    ? generateRosette(createRng(seed), params, soilLevel(plant.pot.height))
    : generatePalm(createRng(seed), params, soilLevel(plant.pot.height), plant.pot.radius)
  expect(shoot.rootOrigins.length).toBeGreaterThan(0)
  const roots = generateRoots({ rng: createRng(seed * 31 + 5), potHeight: plant.pot.height,
    potRadius: plant.pot.radius, profile: plant.roots, origins: shoot.rootOrigins })
  return { leaves: shoot.leaves, stems: shoot.stems, crown: shoot.crown, roots }
}

describe('procedural geometry', () => {
  for (const plant of plants.filter((p) => p.model.kind === 'procedural')) {
    it(`${plant.id}: builds finite, nonempty and deterministic geometry`, () => {
      const first = generate(plant)
      const second = generate(plant)
      try {
        for (const part of ['leaves', 'stems', 'crown', 'roots'] as const) {
          const g = first[part]
          for (const attribute of ['position', 'normal', 'color']) {
            const a = g.getAttribute(attribute)
            expect(a.count).toBeGreaterThan(0)
            expect(Array.from(a.array).every(Number.isFinite)).toBe(true)
            expect(bytes(a.array).equals(bytes(second[part].getAttribute(attribute).array))).toBe(true)
          }
          expect(g.index?.count).toBeGreaterThan(0)
          expect(bytes(g.index!.array).equals(bytes(second[part].index!.array))).toBe(true)
          expect(Array.from(g.index!.array).every((i) => i < g.getAttribute('position').count)).toBe(true)
          g.computeBoundingBox()
          expect([...g.boundingBox!.min.toArray(), ...g.boundingBox!.max.toArray(),
            ...g.boundingSphere!.center.toArray(), g.boundingSphere!.radius].every(Number.isFinite)).toBe(true)
        }
        expect(Object.values(plantBounds(plant)).every(Number.isFinite)).toBe(true)
        expect(Object.values(rootExtent(plant)!).every(Number.isFinite)).toBe(true)
      } finally {
        for (const geometry of [...Object.values(first), ...Object.values(second)]) geometry.dispose()
      }
    })

    it(`${plant.id}: keeps complete root tubes within the pot, depth and spread`, () => {
      const g = buildProceduralGeometry(plant).roots
      const pos = g.getAttribute('position')
      const soilY = soilLevel(plant.pot.height)
      const floor = Math.max(potFloor(plant.pot.height), soilY - plant.roots.depthCm / 100)
      const tolerance = 1e-6
      let maxWallOverflow = 0
      let maxSpread = 0
      let lowest = Infinity
      let highest = -Infinity
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i)
        const radius = Math.hypot(pos.getX(i), pos.getZ(i))
        maxWallOverflow = Math.max(maxWallOverflow, radius - innerRadiusAt(y, plant.pot.height, plant.pot.radius))
        maxSpread = Math.max(maxSpread, radius)
        lowest = Math.min(lowest, y)
        highest = Math.max(highest, y)
      }
      expect(maxWallOverflow).toBeLessThanOrEqual(tolerance)
      expect(lowest).toBeGreaterThanOrEqual(floor - tolerance)
      expect(highest).toBeLessThanOrEqual(soilY + tolerance)
      expect(maxSpread).toBeLessThanOrEqual(plant.roots.spreadCm / 100 + tolerance)
    })
  }

  it('rejects an empty root-origin list with a useful error', () => {
    expect(() => generateRoots({ rng: createRng(1), potHeight: 0.2, potRadius: 0.1,
      profile: plants[0].roots, origins: [] })).toThrow(/origin/i)
  })

  it('does not reuse stale geometry or bounds when a plant object is replaced', () => {
    const original = plants[0]
    if (original.model.kind !== 'procedural' || original.model.params.type !== 'rosette') throw new Error('Expected rosette')
    const changed: Plant = { ...original, model: { ...original.model,
      params: { ...original.model.params, leafLength: original.model.params.leafLength * 1.5 } } }
    expect(buildProceduralGeometry(original)).toBe(buildProceduralGeometry(original))
    expect(buildProceduralGeometry(changed)).not.toBe(buildProceduralGeometry(original))
    expect(plantBounds(changed).top).not.toBe(plantBounds(original).top)
  })

  it('accepts a single valid root origin', () => {
    const geometry = generateRoots({ rng: createRng(1), potHeight: plants[0].pot.height,
      potRadius: plants[0].pot.radius, profile: plants[0].roots, origins: [new THREE.Vector3(0, -0.01, 0)] })
    expect(Array.from(geometry.getAttribute('position').array).every(Number.isFinite)).toBe(true)
    geometry.dispose()
  })
})
