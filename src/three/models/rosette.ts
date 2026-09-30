import * as THREE from 'three'
import type { RosetteParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const GREEN = new THREE.Color('#5a9a34')
const GREEN_EDGE = new THREE.Color('#467d28')
const STRIPE = new THREE.Color('#eef0d2')
const STRIPE_BASE = new THREE.Color('#d6e3b0')
const TIP_BROWN = new THREE.Color('#a88f5c')
const RUNNER = new THREE.Color('#c2c483')

/**
 * Chlorophytum-style rosette: channelled strap leaves in a phyllotactic spiral
 * with an optional pale central stripe, plus arching runners with plantlets.
 */
export function generateRosette(rng: Rng, p: RosetteParams, soilY: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const v = p.variegation
  const columns = v > 0 ? [-1, -v - 0.04, -v, 0, v, v + 0.04, 1] : [-1, -0.5, 0, 0.5, 1]

  const addLeaf = (origin: THREE.Vector3, az: number, elevation: number, length: number, width: number, droop: number, brownTip: boolean) => {
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(elevation), Math.sin(elevation), Math.sin(az) * Math.cos(elevation))
    const spine = arcSpine(origin, dir, length, droop, 16)
    leaves.addRibbon({
      spine,
      columns,
      keel: 0.35,
      twist: rng.range(-0.5, 0.5),
      // Strap-shaped: narrow petiole-like base, parallel sides, long taper.
      width: (t) => width * (0.45 + 0.55 * Math.min(1, t * 5)) * (t < 0.6 ? 1 : 1 - ((t - 0.6) / 0.4) ** 1.5),
      color: (t, s) => {
        const inStripe = Math.abs(s) <= v + 0.001
        const c = inStripe ? STRIPE_BASE.clone().lerp(STRIPE, Math.min(1, t * 3)) : GREEN.clone().lerp(GREEN_EDGE, Math.abs(s) ** 2)
        if (brownTip && t > 0.93) c.lerp(TIP_BROWN, (t - 0.93) / 0.07)
        return c
      },
    })
  }

  // Main rosette: outer leaves are older, longer and droop more.
  for (let i = 0; i < p.leafCount; i++) {
    const f = i / (p.leafCount - 1) // 0 = outer, 1 = innermost
    const az = i * 2.39996 + rng.range(-0.2, 0.2)
    const origin = new THREE.Vector3(Math.cos(az) * 0.008 * (1 - f), soilY + 0.004 + f * 0.02, Math.sin(az) * 0.008 * (1 - f))
    const elevation = THREE.MathUtils.lerp(0.7, 1.38, f) + rng.range(-0.1, 0.1)
    const length = p.leafLength * THREE.MathUtils.lerp(1, 0.45, f) * rng.range(0.85, 1.1)
    const droop = THREE.MathUtils.lerp(1.7, 0.75, f) * rng.range(0.85, 1.15)
    addLeaf(origin, az, elevation, length, p.leafWidth * rng.range(0.85, 1.1), droop, rng.next() < 0.3 && f < 0.6)
  }

  // Crown: sheathing leaf bases.
  crown.addTube({
    points: [new THREE.Vector3(0, soilY - 0.012, 0), new THREE.Vector3(0, soilY + 0.012, 0), new THREE.Vector3(0, soilY + 0.03, 0)],
    radius: (t) => 0.022 * (1 - 0.55 * t),
    color: (t) => STRIPE_BASE.clone().lerp(GREEN, t * 0.6),
    radial: 14,
    capEnd: true,
  })

  // Runners (stolons) with plantlets.
  const plantletOrigins: THREE.Vector3[] = []
  for (let r = 0; r < p.runners; r++) {
    const az = (r / p.runners) * Math.PI * 2 + rng.range(-0.4, 0.4)
    const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
    const reach = rng.range(0.26, 0.34)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, soilY + 0.02, 0),
      out.clone().multiplyScalar(0.07).setY(0.15),
      out.clone().multiplyScalar(reach * 0.6).setY(0.16),
      out.clone().multiplyScalar(reach * 0.92).setY(0.04),
      out.clone().multiplyScalar(reach).setY(-0.09),
    ])
    const pts = curve.getPoints(40)
    stems.addTube({ points: pts, radius: (t) => 0.0024 * (1 - 0.3 * t), color: () => RUNNER, radial: 5 })
    plantletOrigins.push(pts[pts.length - 1])
  }

  for (const o of plantletOrigins) {
    const count = rng.int(8, 11)
    for (let i = 0; i < count; i++) {
      const f = i / (count - 1)
      const az = i * 2.39996
      addLeaf(o, az, THREE.MathUtils.lerp(0.4, 1.2, f), p.leafLength * rng.range(0.18, 0.26), p.leafWidth * 0.7, 0.7, false)
    }
    // Aerial root nubs below each plantlet.
    for (let k = 0; k < 4; k++) {
      const a = rng.range(0, Math.PI * 2)
      stems.addTube({
        points: [o.clone(), o.clone().add(new THREE.Vector3(Math.cos(a) * 0.006, -0.018, Math.sin(a) * 0.006))],
        radius: (t) => 0.0018 * (1 - 0.5 * t),
        color: () => STRIPE,
        radial: 4,
        capEnd: true,
      })
    }
  }

  return {
    leaves: leaves.build(),
    stems: stems.build(),
    crown: crown.build(),
    rootOrigins: [new THREE.Vector3(0, soilY, 0)],
  }
}
