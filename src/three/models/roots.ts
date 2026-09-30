import * as THREE from 'three'
import type { RootProfile } from '../../data/types'
import { MeshBuilder, type Rng } from './geometry'
import { innerRadiusAt, potFloor, soilLevel } from './potShape'

interface RootContext {
  rng: Rng
  potHeight: number
  potRadius: number
  profile: RootProfile
  /** Points on the soil surface where roots emerge (crown / stem bases). */
  origins: THREE.Vector3[]
}

/**
 * Grows a root system as constrained random walks: gravitropism pulls roots
 * down, the pot wall deflects them into circling paths, the floor flattens them.
 */
export function generateRoots(ctx: RootContext): THREE.BufferGeometry {
  const { rng, potHeight: H, potRadius: R, profile, origins } = ctx
  const m = profile.model
  const builder = new MeshBuilder()
  const soilY = soilLevel(H)
  const floorY = potFloor(H) + 0.004
  const maxDepthY = Math.max(floorY, soilY - profile.depthCm / 100)
  const spread = profile.spreadCm / 100

  const base = new THREE.Color(m.color)
  const tip = base.clone().lerp(new THREE.Color('#fbf8ee'), 0.55)
  const dark = base.clone().multiplyScalar(0.72)

  const walk = (start: THREE.Vector3, dir: THREE.Vector3, length: number, steps: number, depthY: number, margin: number) => {
    const pts = [start.clone()]
    const p = start.clone()
    const d = dir.clone().normalize()
    const step = length / steps
    const jitter = new THREE.Vector3()
    for (let s = 0; s < steps; s++) {
      d.y -= 0.06
      jitter.set(rng.range(-1, 1), rng.range(-0.6, 0.6), rng.range(-1, 1)).multiplyScalar(0.28)
      d.add(jitter).normalize()
      p.addScaledVector(d, step)

      if (p.y > soilY - margin) {
        p.y = soilY - margin
        d.y = -Math.abs(d.y) - 0.2
      }
      if (p.y < depthY + margin) {
        p.y = depthY + margin + rng.range(0, 0.004)
        d.y = Math.abs(d.y) * 0.05
      }
      const limit = Math.min(innerRadiusAt(p.y, H, R) - margin, spread + rng.range(-0.01, 0.015))
      const r = Math.hypot(p.x, p.z)
      if (r > limit) {
        const k = limit / r
        p.x *= k
        p.z *= k
        // Deflect along the wall: roots in pots circle and descend.
        const tangentX = -p.z / limit
        const tangentZ = p.x / limit
        const turn = d.x * tangentX + d.z * tangentZ >= 0 ? 1 : -1
        d.set(tangentX * turn, d.y - 0.25, tangentZ * turn).normalize()
      }
      pts.push(p.clone())
    }
    return pts
  }

  const colorAlong = (t: number) => base.clone().lerp(t > 0.8 ? tip : dark, t > 0.8 ? (t - 0.8) * 5 : (1 - t) * 0.25)

  for (let i = 0; i < m.primaryCount; i++) {
    const origin = origins[i % origins.length].clone()
    origin.x += rng.range(-0.012, 0.012)
    origin.z += rng.range(-0.012, 0.012)
    origin.y = soilY - rng.range(0.006, 0.02)

    const az = rng.range(0, Math.PI * 2)
    const dip = rng.range(0.35, 1.35)
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(dip), -Math.sin(dip), Math.sin(az) * Math.cos(dip))
    const depthY = Math.max(floorY, soilY - (soilY - maxDepthY) * rng.range(0.75, 1.02))
    const length = (soilY - depthY) * rng.range(1.3, 2.2)
    const bulges = m.tubers
      ? Array.from({ length: rng.int(1, 2) }, () => ({ at: rng.range(0.35, 0.85), size: rng.range(0.7, 1.4), w: rng.range(0.06, 0.11) }))
      : []
    const thickness = m.thickness * rng.range(0.75, 1.2)
    // Keep the whole tube, including tuber swellings, inside the pot wall.
    const maxRadius = thickness * (1 + Math.max(0, ...bulges.map((b) => b.size)))
    const primary = walk(origin, dir, length, 22, depthY, maxRadius + 0.002)

    builder.addTube({
      points: primary,
      radius: (t) => {
        let r = thickness * (1 - 0.6 * t)
        for (const b of bulges) r *= 1 + b.size * Math.exp(-(((t - b.at) / b.w) ** 2))
        return r
      },
      color: (t) => colorAlong(t),
      radial: 7,
      capEnd: true,
    })

    const laterals = Math.round(m.branching * rng.range(3, 8))
    for (let l = 0; l < laterals; l++) {
      const idx = rng.int(3, primary.length - 4)
      const start = primary[idx]
      const lDir = new THREE.Vector3(rng.range(-1, 1), rng.range(-0.8, 0.1), rng.range(-1, 1))
      const lLen = length * rng.range(0.18, 0.4)
      const lateral = walk(start, lDir, lLen, 10, depthY, m.thickness * 0.6)
      const lr = thickness * rng.range(0.3, 0.45)
      builder.addTube({ points: lateral, radius: (t) => lr * (1 - 0.7 * t), color: (t) => colorAlong(0.3 + t * 0.7), radial: 5 })

      if (m.branching > 0.6) {
        const rootlets = rng.int(1, 4)
        for (let k = 0; k < rootlets; k++) {
          const s = lateral[rng.int(2, lateral.length - 2)]
          const rl = walk(s, new THREE.Vector3(rng.range(-1, 1), rng.range(-1, 0.2), rng.range(-1, 1)), lLen * rng.range(0.2, 0.4), 5, depthY, 0.002)
          builder.addTube({ points: rl, radius: (t) => lr * 0.45 * (1 - 0.6 * t), color: () => tip, radial: 3 })
        }
      }
    }
  }

  return builder.build()
}
