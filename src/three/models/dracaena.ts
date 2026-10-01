import * as THREE from 'three'
import type { DracaenaParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const GOLDEN_ANGLE = 2.39996
const UP = new THREE.Vector3(0, 1, 0)
const SCAR = new THREE.Color('#cdc6b6')
const BASE_DARK = new THREE.Color('#5a4c3a')
const LEAF_BASE = new THREE.Color('#d6d3a8')

/**
 * Tricolour cross-section: red edge, cream stripe, green with a faint inner
 * stripe. Listed from +1 to −1 so the geometric normal faces the upper side
 * and the shadow normal bias does not shade the leaf by itself.
 */
const COLUMNS = [1, 0.9, 0.74, 0.5, 0.24, 0, -0.24, -0.5, -0.74, -0.9, -1]

/**
 * Dracaena marginata: straight, ringed woody trunks of staggered height, each
 * forking at a knobbly node into two or three short branches. The upper part
 * of each branch is densely set with narrow leaves that form a fountain: the
 * lowest spread outward and arch slightly, the youngest stand upright.
 */
export function generateDracaena(rng: Rng, p: DracaenaParams, soilY: number, potRadius: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const leafColor = new THREE.Color(p.leafColor)
  const margin = new THREE.Color(p.marginColor)
  const stripe = new THREE.Color(p.stripeColor)
  const bark = new THREE.Color(p.barkColor)
  const rootOrigins: THREE.Vector3[] = []

  const leafTint = (s: number) => {
    const a = Math.abs(s)
    if (a === 1) return margin.clone()
    if (a >= 0.9) return stripe.clone().lerp(margin, 0.25)
    if (a === 0.5) return leafColor.clone().lerp(stripe, 0.35)
    return leafColor.clone().multiplyScalar(a === 0 ? 1.06 : 1)
  }

  const addCane = (points: THREE.Vector3[], radius: number, knob: number) => {
    const length = points.reduce((sum, pt, i) => (i ? sum + pt.distanceTo(points[i - 1]) : 0), 0)
    const spacing = rng.range(0.007, 0.01)
    const ringAt = (t: number) => Math.exp(-((((((t * length) / spacing) % 1) - 0.5) / 0.16) ** 2))
    stems.addTube({
      points,
      // Knobbly swelling at the top of a trunk, where it was cut back and
      // resprouted into several branches.
      radius: (t) => radius * (1.12 - 0.22 * t) * (1 + ringAt(t) * 0.05) * (1 + knob * Math.exp(-(((t - 1) / 0.07) ** 2))),
      color: (t, angle) =>
        bark
          .clone()
          .lerp(SCAR, ringAt(t) * 0.6 * (0.75 + 0.25 * Math.sin(angle * 3 + t * 40)))
          .lerp(BASE_DARK, (1 - t) ** 10 * 0.6),
      radial: 12,
    })
  }

  const addHead = (cane: THREE.Vector3[], radius: number, scale: number) => {
    const top = cane[cane.length - 1]
    const n = Math.round(p.leavesPerHead * scale)
    const span = p.headLength * scale
    const at = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1) // 0 = oldest, lowest leaf; 1 = youngest at the tip
      const az = i * GOLDEN_ANGLE + rng.range(-0.15, 0.15)
      const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
      // Insertion point on the cane, below the tip by up to `span`.
      const y = top.y - (1 - f) ** 1.3 * span
      const k = cane.findIndex((pt) => pt.y >= y)
      at.copy(cane[Math.max(0, k)]).setY(y)
      const origin = at.clone().addScaledVector(out, radius * 0.9)

      const elev = THREE.MathUtils.lerp(0.8, 1.48, f ** 0.8) + rng.range(-0.12, 0.1)
      const dir = out.multiplyScalar(Math.cos(elev)).addScaledVector(UP, Math.sin(elev)).normalize()
      const length = p.leafLength * THREE.MathUtils.lerp(1, 0.55, f ** 1.5) * rng.range(0.85, 1.1) * scale ** 0.25
      const droop = THREE.MathUtils.lerp(0.2, 0.02, f) * rng.range(0.7, 1.3)
      const w = p.leafWidth * rng.range(0.85, 1.1)
      leaves.addRibbon({
        spine: arcSpine(origin, dir, length, droop, 18),
        columns: COLUMNS,
        keel: 0.25,
        twist: rng.range(-0.5, 0.5),
        // Linear strap with a clasping base and a long, fine point.
        width: (t) => w * (0.6 + 0.4 * Math.min(1, t * 6)) * (t < 0.65 ? 1 : 1 - ((t - 0.65) / 0.35) ** 1.2),
        color: (t, s) => leafTint(s).lerp(LEAF_BASE, Math.max(0, 1 - t / 0.06) * 0.8),
      })
    }
    // Terminal bud: the overlapping bases of the youngest leaves.
    crown.addTube({
      points: [top.clone().setY(top.y - 0.04), top.clone(), top.clone().setY(top.y + 0.025)],
      radius: (t) => radius * (1.25 - 0.75 * t),
      color: (t) => LEAF_BASE.clone().lerp(leafColor, t * 0.5),
      radial: 10,
      capEnd: true,
    })
  }

  const count = p.canes.length
  const tallest = Math.max(...p.canes)
  for (let c = 0; c < count; c++) {
    const height = p.canes[c]
    const az = c * GOLDEN_ANGLE + rng.range(-0.3, 0.3)
    const r = count > 1 ? potRadius * 0.22 * Math.sqrt((c + 0.5) / count) : 0
    const base = new THREE.Vector3(Math.cos(az) * r, soilY - 0.01, Math.sin(az) * r)
    rootOrigins.push(base.clone().setY(soilY))

    // Trunk: nearly straight, leaning slightly outward.
    const outward = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
    const lean = outward.clone().multiplyScalar(height * rng.range(0.04, 0.1))
    const segs = Math.max(24, Math.ceil(height / 0.004))
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      pts.push(
        base
          .clone()
          .addScaledVector(lean, 1 - (1 - t) ** 2)
          .setY(base.y + height * t),
      )
    }
    const radius = p.caneRadius * rng.range(0.9, 1.08) * (0.75 + 0.25 * (height / tallest))
    addCane(pts, radius, 0.35)

    // The trunk forks into two or three short branches, each with its own
    // leaf head; they splay apart in a V and turn upright again.
    const knob = pts[segs].clone().setY(pts[segs].y - radius * 0.8)
    const n = rng.int(p.branches[0], p.branches[1])
    const turn = rng.range(0, Math.PI * 2)
    for (let b = 0; b < n; b++) {
      const baz = turn + (b / n) * Math.PI * 2 + rng.range(-0.35, 0.35)
      const tilt = rng.range(0.35, 0.6)
      const bdir = new THREE.Vector3(Math.cos(baz) * Math.sin(tilt), Math.cos(tilt), Math.sin(baz) * Math.sin(tilt))
      const branch = arcSpine(knob, bdir, p.branchLength * rng.range(0.75, 1.2), -0.35, 14)
      const bradius = radius * rng.range(0.55, 0.68)
      addCane(branch, bradius, 0)
      addHead(branch, bradius * 0.8, rng.range(0.85, 1))
    }
  }

  return { leaves: leaves.build(), stems: stems.build(), crown: crown.build(), rootOrigins }
}
