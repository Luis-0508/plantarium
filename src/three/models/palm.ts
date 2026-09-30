import * as THREE from 'three'
import type { PalmParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Clustering pinnate palm (Dypsis / Chamaedorea): several canes, each ending
 * in a crown of arching fronds with V-folded leaflets along the rachis.
 */
export function generatePalm(rng: Rng, p: PalmParams, soilY: number, potRadius: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const leafColor = new THREE.Color(p.leafColor)
  const leafLight = leafColor.clone().lerp(new THREE.Color('#d8e08a'), 0.22)
  const stemColor = new THREE.Color(p.stemColor)
  const ringColor = stemColor.clone().multiplyScalar(0.62)
  const rachisColor = new THREE.Color(p.rachisColor)
  const sheathColor = stemColor.clone().lerp(new THREE.Color('#e7dfb2'), 0.35)
  const rootOrigins: THREE.Vector3[] = []

  const clump = potRadius * 0.32
  for (let s = 0; s < p.stems; s++) {
    const f = p.stems > 1 ? s / (p.stems - 1) : 0
    const az = s * 2.39996 + rng.range(-0.3, 0.3)
    const r = clump * Math.sqrt((s + 0.5) / p.stems)
    const base = new THREE.Vector3(Math.cos(az) * r, soilY - 0.01, Math.sin(az) * r)
    rootOrigins.push(base.clone().setY(soilY))

    // Taller canes toward the clump centre; outer ones lean out.
    const height = THREE.MathUtils.lerp(p.stemHeight[1], p.stemHeight[0], f) * rng.range(0.85, 1.1)
    const lean = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(height * rng.range(0.08, 0.2) * (0.4 + f))
    const stemPts: THREE.Vector3[] = []
    const segs = Math.max(24, Math.ceil(height / 0.004)) // dense enough to resolve leaf-scar rings
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      stemPts.push(base.clone().add(new THREE.Vector3(lean.x * t * t, height * t, lean.z * t * t)))
    }
    const top = stemPts[segs]
    const radius = p.stemRadius * rng.range(0.8, 1.15)
    const ringEvery = 0.028
    stems.addTube({
      points: stemPts,
      radius: (t) => {
        const y = t * height
        const ring = p.rings ? Math.exp(-((((y % ringEvery) - 0.002) / 0.0025) ** 2)) : 0
        return radius * (1.15 - 0.3 * t) * (1 + ring * 0.08)
      },
      color: (t) => {
        const y = t * height
        const ring = p.rings ? Math.exp(-((((y % ringEvery) - 0.002) / 0.003) ** 2)) : 0
        return stemColor.clone().lerp(ringColor, ring * 0.8).lerp(new THREE.Color('#8c7d52'), (1 - t) ** 6 * 0.5)
      },
      radial: 10,
    })

    // Crown shaft / sheaths where fronds emerge.
    const sheathTop = top.clone().add(new THREE.Vector3(0, 0.05, 0))
    crown.addTube({
      points: [top.clone().add(new THREE.Vector3(0, -0.04, 0)), top, sheathTop],
      radius: (t) => radius * (1.35 - 0.6 * t),
      color: () => sheathColor,
      radial: 10,
      capEnd: true,
    })

    const fronds = rng.int(p.frondsPerStem[0], p.frondsPerStem[1])
    for (let k = 0; k < fronds; k++) {
      const age = fronds > 1 ? k / (fronds - 1) : 0.5 // 0 = oldest
      const faz = az + k * 2.39996 + rng.range(-0.3, 0.3)
      const elev = THREE.MathUtils.lerp(0.55, 1.3, age) * (1.1 - p.arch * 0.25) + rng.range(-0.1, 0.1)
      const dir = new THREE.Vector3(Math.cos(faz) * Math.cos(elev), Math.sin(elev), Math.sin(faz) * Math.cos(elev))
      const length = rng.range(p.frondLength[0], p.frondLength[1]) * THREE.MathUtils.lerp(1, 0.75, age)
      const rachis = arcSpine(top.clone().add(new THREE.Vector3(0, 0.02, 0)), dir, length, p.arch * THREE.MathUtils.lerp(1.1, 0.5, age), 18)
      stems.addTube({ points: rachis, radius: (t) => radius * 0.42 * (1 - 0.8 * t), color: () => rachisColor, radial: 5 })

      const tangent = new THREE.Vector3()
      const side = new THREE.Vector3()
      for (let i = 0; i < p.leafletsPerSide; i++) {
        const t = 0.12 + (0.86 * i) / (p.leafletsPerSide - 1)
        const fi = t * (rachis.length - 1)
        const i0 = Math.floor(fi)
        const i1 = Math.min(i0 + 1, rachis.length - 1)
        const at = rachis[i0].clone().lerp(rachis[i1], fi - i0)
        tangent.subVectors(rachis[i1], rachis[Math.max(i0 - 1, 0)]).normalize()
        side.crossVectors(tangent, UP).normalize()
        const profile = Math.sin(Math.PI * (0.18 + 0.82 * t)) ** 0.55 * (1 - 0.35 * t)
        const len = p.leafletLength * profile * rng.range(0.88, 1.08)
        for (const sgn of [-1, 1]) {
          const forward = rng.range(0.55, 0.8)
          const ldir = side
            .clone()
            .multiplyScalar(sgn * Math.cos(forward))
            .addScaledVector(tangent, Math.sin(forward))
            .addScaledVector(UP, 0.28)
            .normalize()
          const spine = arcSpine(at, ldir, len, p.arch * 0.95 + 0.1, 8)
          const tint = rng.range(0, 1)
          const w = p.leafletWidth * (0.7 + 0.3 * profile)
          leaves.addRibbon({
            spine,
            columns: [-1, 0, 1],
            keel: 0.45,
            sideHint: tangent,
            width: (u) => w * Math.sin(Math.PI * Math.min(1, 0.08 + u)) ** 0.7,
            color: (u, s) =>
              leafColor
                .clone()
                .lerp(leafLight, (1 - u) * 0.25 + tint * 0.15)
                .multiplyScalar(s === 0 ? 1.08 : 1),
          })
        }
      }
    }
  }

  return { leaves: leaves.build(), stems: stems.build(), crown: crown.build(), rootOrigins }
}
