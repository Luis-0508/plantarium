import * as THREE from 'three'
import type { PalmParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const UP = new THREE.Vector3(0, 1, 0)
const GOLDEN_ANGLE = 2.39996
const BASE_BROWN = new THREE.Color('#8c7d52')
const LEAF_LIGHT = new THREE.Color('#d8e08a')
const AGE_YELLOW = new THREE.Color('#a9ad4c')
const SHEATH_PALE = new THREE.Color('#e7dfb2')

/** Point and tangent at parameter t (0–1) along a polyline. */
function sample(points: THREE.Vector3[], t: number, outPoint: THREE.Vector3, outTangent: THREE.Vector3) {
  const f = THREE.MathUtils.clamp(t, 0, 1) * (points.length - 1)
  const i0 = Math.floor(f)
  const i1 = Math.min(i0 + 1, points.length - 1)
  outPoint.copy(points[i0]).lerp(points[i1], f - i0)
  outTangent.subVectors(points[i1], points[Math.max(i0 - 1, 0)]).normalize()
}

/**
 * Clustering pinnate palm (Dypsis / Chamaedorea). Each cane carries fronds at
 * staggered heights (older ones lower and more arching), so the crown is not
 * a single radial fan. Leaflets vary in spacing, length, angle and droop.
 */
export function generatePalm(rng: Rng, p: PalmParams, soilY: number, potRadius: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const leafColor = new THREE.Color(p.leafColor)
  const leafLight = leafColor.clone().lerp(LEAF_LIGHT, 0.22)
  const stemColor = new THREE.Color(p.stemColor)
  const stemTop = new THREE.Color(p.stemTopColor ?? p.stemColor)
  const rachisColor = new THREE.Color(p.rachisColor)
  const sheathColor = stemTop.clone().lerp(SHEATH_PALE, 0.3)
  const irr = p.irregularity
  const rootOrigins: THREE.Vector3[] = []

  const at = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const side = new THREE.Vector3()
  const lateral = new THREE.Vector3()

  const addFrond = (origin: THREE.Vector3, azimuth: number, age: number, lengthScale: number, stemRadius: number) => {
    // age: 0 = oldest (low, spreading), 1 = youngest (upright spear leaf)
    const elev = THREE.MathUtils.lerp(0.5, 1.32, age) * (1.1 - p.arch * 0.25) + rng.range(-0.12, 0.12)
    const dir = new THREE.Vector3(Math.cos(azimuth) * Math.cos(elev), Math.sin(elev), Math.sin(azimuth) * Math.cos(elev))
    const length = rng.range(p.frondLength[0], p.frondLength[1]) * THREE.MathUtils.lerp(1, 0.72, age) * lengthScale
    const rachis = arcSpine(origin, dir, length, p.arch * THREE.MathUtils.lerp(1.15, 0.45, age) * rng.range(0.85, 1.15), 20)

    // Slight sideways sweep so fronds are not perfectly planar.
    lateral.set(-Math.sin(azimuth), 0, Math.cos(azimuth)).multiplyScalar(length * rng.range(-0.12, 0.12) * (0.3 + irr))
    rachis.forEach((pt, i) => pt.addScaledVector(lateral, (i / (rachis.length - 1)) ** 2))

    stems.addTube({ points: rachis, radius: (t) => stemRadius * 0.42 * (1 - 0.8 * t), color: () => rachisColor, radial: 5 })

    const twistSign = rng.sign()
    const frondTint = rng.range(0, 1)
    const aged = (1 - age) * p.ageYellowing
    const n = p.leafletsPerSide
    const start = rng.range(0.1, 0.16) // bare petiole
    for (let i = 0; i < n; i++) {
      const t = start + ((0.97 - start) * (i + rng.range(-0.4, 0.4) * irr)) / (n - 1)
      sample(rachis, t, at, tangent)
      side.crossVectors(tangent, UP).normalize()
      // The leaflet plane rolls along the rachis, strongest near the tip.
      side.applyAxisAngle(tangent, twistSign * p.rachisTwist * t * t)

      const profile = Math.sin(Math.PI * (0.18 + 0.82 * t)) ** 0.55 * (1 - 0.35 * t)
      for (const sgn of [-1, 1]) {
        if (rng.next() < 0.035 * irr) continue // the odd missing or broken leaflet
        const len = p.leafletLength * profile * rng.range(1 - 0.28 * irr, 1 + 0.1 * irr)
        const forward = rng.range(0.5, 0.8) + rng.range(-0.15, 0.15) * irr
        const ldir = side
          .clone()
          .multiplyScalar(sgn * Math.cos(forward))
          .addScaledVector(tangent, Math.sin(forward))
          .addScaledVector(UP, 0.28 + rng.range(-0.12, 0.12) * irr)
          .normalize()
        const spine = arcSpine(at, ldir, len, p.leafletDroop * rng.range(1 - 0.35 * irr, 1 + 0.3 * irr), 8)
        const tint = rng.range(0, 1)
        const w = p.leafletWidth * (0.7 + 0.3 * profile) * rng.range(0.9, 1.1)
        leaves.addRibbon({
          spine,
          columns: [-1, 0, 1],
          keel: 0.45,
          sideHint: tangent,
          width: (u) => w * Math.sin(Math.PI * Math.min(1, 0.08 + u)) ** 0.7,
          color: (u, s) =>
            leafColor
              .clone()
              .lerp(leafLight, (1 - u) * 0.25 + tint * 0.12 + frondTint * 0.06)
              .lerp(AGE_YELLOW, aged * (0.6 + 0.4 * u))
              .multiplyScalar(s === 0 ? 1.08 : 1),
        })
      }
    }
  }

  const clump = potRadius * 0.34
  const shoots = p.stems + p.suckers
  for (let s = 0; s < shoots; s++) {
    const sucker = s >= p.stems
    const f = p.stems > 1 ? Math.min(s, p.stems - 1) / (p.stems - 1) : 0
    const az = s * GOLDEN_ANGLE + rng.range(-0.45, 0.45)
    const r = sucker ? clump * rng.range(0.7, 1.05) : clump * Math.sqrt((s + 0.5) / p.stems) * rng.range(0.8, 1.1)
    const base = new THREE.Vector3(Math.cos(az) * r, soilY - 0.01, Math.sin(az) * r)
    rootOrigins.push(base.clone().setY(soilY))

    // Taller canes toward the clump centre; outer ones shorter and leaning out.
    const height = sucker
      ? rng.range(0.02, 0.07)
      : THREE.MathUtils.lerp(p.stemHeight[1], p.stemHeight[0], f) * rng.range(0.78, 1.12)
    const outward = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
    const lean = outward.clone().multiplyScalar(height * rng.range(0.06, 0.2) * (0.4 + f))
    const sway = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az)).multiplyScalar(height * rng.range(-0.05, 0.05))
    const segs = Math.max(12, Math.ceil(height / 0.004)) // dense enough to resolve leaf-scar rings
    const stemPts: THREE.Vector3[] = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      stemPts.push(
        base
          .clone()
          .addScaledVector(lean, t * t)
          .addScaledVector(sway, Math.sin(Math.PI * t))
          .setY(base.y + height * t),
      )
    }
    const top = stemPts[segs]
    const radius = p.stemRadius * (sucker ? 0.7 : rng.range(0.75, 1.25))
    const ringEvery = rng.range(0.022, 0.034)
    const ringAt = (y: number) => (p.rings ? Math.exp(-((((y % ringEvery) - 0.002) / 0.0028) ** 2)) : 0)
    stems.addTube({
      points: stemPts,
      radius: (t) => radius * (1.15 - 0.3 * t) * (1 + ringAt(t * height) * 0.07),
      color: (t) =>
        stemColor
          .clone()
          .lerp(stemTop, t)
          .multiplyScalar(1 - ringAt(t * height) * 0.35 * (1 - t * 0.6))
          .lerp(BASE_BROWN, (1 - t) ** 6 * 0.5),
      radial: 10,
    })

    // Fronds sheathe the upper cane at staggered heights: oldest lowest.
    const fronds = sucker ? 1 : rng.int(p.frondsPerStem[0], p.frondsPerStem[1])
    const span = (fronds - 1) * p.frondSpacing
    const sheathBase = top.clone().add(new THREE.Vector3(0, -span - 0.03, 0))
    crown.addTube({
      points: [sheathBase, top.clone().add(new THREE.Vector3(0, 0.02, 0)), top.clone().add(new THREE.Vector3(0, 0.05, 0))],
      radius: (t) => radius * (1.3 - 0.55 * t),
      color: (t) => sheathColor.clone().lerp(rachisColor, t * 0.5),
      radial: 10,
      capEnd: true,
    })

    // Outer canes throw fronds outward; central ones in any direction.
    const spread = r < clump * 0.4 ? Math.PI : 1.9
    for (let k = 0; k < fronds; k++) {
      const age = fronds > 1 ? k / (fronds - 1) : 0.6
      const y = top.y - (fronds - 1 - k) * p.frondSpacing * rng.range(0.8, 1.2)
      const origin = new THREE.Vector3(top.x, y + 0.02, top.z)
      const faz = az + (k * GOLDEN_ANGLE) % (2 * spread) - spread + rng.range(-0.3, 0.3)
      addFrond(origin, faz, sucker ? 1 : age, sucker ? rng.range(0.35, 0.5) : 1, radius)
    }
  }

  return { leaves: leaves.build(), stems: stems.build(), crown: crown.build(), rootOrigins }
}
