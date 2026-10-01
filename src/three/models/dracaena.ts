import * as THREE from 'three'
import type { DracaenaParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const GOLDEN_ANGLE = 2.39996
const UP = new THREE.Vector3(0, 1, 0)
const SCAR = new THREE.Color('#c9bfa6')
const BASE_DARK = new THREE.Color('#5a4c3a')
const YOUNG_BARK = new THREE.Color('#7f8a52')
const LEAF_BASE = new THREE.Color('#c7cf98')
const SENESCENT = new THREE.Color('#b59a4a')

/**
 * Dracaena marginata: slender, sinuous woody canes of staggered height, each
 * topped by a dense tuft of narrow, red-edged leaves. Fallen leaves leave
 * close-set scar rings on the bark; the oldest leaves at the bottom of a tuft
 * hang down and yellow before they drop.
 */
export function generateDracaena(rng: Rng, p: DracaenaParams, soilY: number, potRadius: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const leafColor = new THREE.Color(p.leafColor)
  const margin = new THREE.Color(p.marginColor)
  const bark = new THREE.Color(p.barkColor)
  const rootOrigins: THREE.Vector3[] = []

  const addCane = (points: THREE.Vector3[], radius: number) => {
    const length = points.reduce((sum, pt, i) => (i ? sum + pt.distanceTo(points[i - 1]) : 0), 0)
    const spacing = rng.range(0.006, 0.009)
    stems.addTube({
      points,
      radius: (t) => radius * (1.15 - 0.35 * t),
      color: (t, angle) => {
        // Leaf scars spiral up the cane as staggered pale crescents.
        const phase = ((t * length) / spacing + angle / Math.PI) % 1
        const scar = Math.exp(-(((phase - 0.5) / 0.13) ** 2))
        return bark
          .clone()
          .lerp(YOUNG_BARK, THREE.MathUtils.smoothstep(t, 0.75, 1))
          .lerp(SCAR, scar * 0.55 * (1 - t * 0.5))
          .lerp(BASE_DARK, (1 - t) ** 8 * 0.6)
      },
      radial: 10,
    })
  }

  const addHead = (top: THREE.Vector3, axis: THREE.Vector3, radius: number, scale: number) => {
    const n = Math.round(p.leavesPerHead * scale)
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1) // 0 = oldest, lowest leaf; 1 = youngest at the tip
      const az = i * GOLDEN_ANGLE + rng.range(-0.15, 0.15)
      const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
      const origin = top
        .clone()
        .addScaledVector(axis, -(1 - f) * 0.05)
        .addScaledVector(out, radius * 0.8)
      const elev = THREE.MathUtils.lerp(-0.3, 1.42, f ** 0.75) + rng.range(-0.12, 0.12)
      const dir = out.multiplyScalar(Math.cos(elev)).addScaledVector(UP, Math.sin(elev)).addScaledVector(axis, 0.25).normalize()
      const length = p.leafLength * THREE.MathUtils.lerp(1, 0.45, f) * rng.range(0.85, 1.1) * scale ** 0.3
      const droop = THREE.MathUtils.lerp(1.15, 0.2, f) * rng.range(0.8, 1.2)
      const aged = i < 2 ? rng.range(0.4, 0.8) : 0
      const w = p.leafWidth * rng.range(0.85, 1.1)
      leaves.addRibbon({
        spine: arcSpine(origin, dir, length, droop, 18),
        columns: [-1, -0.86, -0.45, 0, 0.45, 0.86, 1],
        keel: 0.3,
        twist: rng.range(-0.6, 0.6),
        // Linear strap with a clasping base and a long, fine point.
        width: (t) => w * (0.6 + 0.4 * Math.min(1, t * 6)) * (t < 0.7 ? 1 : 1 - ((t - 0.7) / 0.3) ** 1.3),
        color: (t, s) => {
          const c = Math.abs(s) === 1 ? margin.clone() : leafColor.clone().multiplyScalar(s === 0 ? 1.12 : 1)
          c.lerp(LEAF_BASE, Math.max(0, 1 - t / 0.08) * 0.8)
          return aged ? c.lerp(SENESCENT, aged * (0.4 + 0.6 * t)) : c
        },
      })
    }
    // Terminal bud: the overlapping bases of the youngest leaves.
    crown.addTube({
      points: [top.clone().addScaledVector(axis, -0.05), top.clone(), top.clone().addScaledVector(axis, 0.02)],
      radius: (t) => radius * (1.3 - 0.7 * t),
      color: (t) => LEAF_BASE.clone().lerp(leafColor, t * 0.5),
      radial: 10,
      capEnd: true,
    })
  }

  const count = p.canes.length
  for (let c = 0; c < count; c++) {
    const height = p.canes[c]
    const az = c * GOLDEN_ANGLE + rng.range(-0.3, 0.3)
    const r = count > 1 ? potRadius * 0.24 * Math.sqrt((c + 0.5) / count) : 0
    const base = new THREE.Vector3(Math.cos(az) * r, soilY - 0.01, Math.sin(az) * r)
    rootOrigins.push(base.clone().setY(soilY))

    // Leans out, then turns back toward the light: slope fades near the top.
    const outward = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
    const lean = outward.multiplyScalar(height * rng.range(0.1, 0.22))
    const sway = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az)).multiplyScalar(height * rng.range(-0.09, 0.09))
    const segs = Math.max(16, Math.ceil(height / 0.006))
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      pts.push(
        base
          .clone()
          .addScaledVector(lean, 1 - (1 - t) ** 2)
          .addScaledVector(sway, Math.sin(Math.PI * 1.5 * t))
          .setY(base.y + height * t),
      )
    }
    const radius = p.caneRadius * rng.range(0.85, 1.1) * (0.75 + 0.25 * (height / Math.max(...p.canes)))
    addCane(pts, radius)
    const axis = pts[segs].clone().sub(pts[segs - 2]).normalize()
    addHead(pts[segs], axis, radius * 0.65, 1)

    // Forked canes split below the head into a second, shorter tuft.
    if (c < p.forks) {
      const at = pts[Math.round(segs * 0.72)]
      const bdir = new THREE.Vector3(-Math.cos(az), 0, -Math.sin(az)).multiplyScalar(0.5).add(UP).normalize()
      const blen = height * rng.range(0.22, 0.3)
      const branch = arcSpine(at, bdir, blen, -0.4, 12)
      addCane(branch, radius * 0.7)
      const top = branch[branch.length - 1]
      addHead(top, top.clone().sub(branch[branch.length - 3]).normalize(), radius * 0.5, 0.75)
    }
  }

  return { leaves: leaves.build(), stems: stems.build(), crown: crown.build(), rootOrigins }
}
