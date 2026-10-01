import * as THREE from 'three'
import type { CalatheaParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const GOLDEN_ANGLE = 2.39996
const MIDRIB = new THREE.Color('#e4e9c4')
const SHEATH = new THREE.Color('#b7b98a')
const PULVINUS = new THREE.Color('#8a7a3e')

/**
 * Cross-section columns, dense enough to resolve the feather patches. Listed
 * from +1 to −1 so the face winding puts the geometric normal on the upper
 * side; the shadow normal bias then samples above the broad blade instead of
 * below it, which would leave the upper side in its own shadow.
 */
const COLUMNS = [1, 0.93, 0.84, 0.72, 0.58, 0.44, 0.3, 0.17, 0.07, 0, -0.07, -0.17, -0.3, -0.44, -0.58, -0.72, -0.84, -0.93, -1]

/**
 * Calathea (Goeppertia) clump: long thin petioles end in a pulvinus joint
 * that holds a broad, oval blade. The blade is two layers: a patterned upper
 * side and a wine-red underside. Young leaves emerge rolled like a cigar.
 */
export function generateCalathea(rng: Rng, p: CalatheaParams, soilY: number, potRadius: number) {
  const leaves = new MeshBuilder()
  const stems = new MeshBuilder()
  const crown = new MeshBuilder()

  const ground = new THREE.Color(p.groundColor)
  const patch = new THREE.Color(p.patchColor)
  const under = new THREE.Color(p.undersideColor)
  const underPatch = under.clone().multiplyScalar(0.55)
  const petiole = new THREE.Color(p.petioleColor)

  /**
   * Peacock pattern: alternating large and small dark ovals that sweep from
   * the midrib toward the margin along the lateral veins, a dark margin band
   * and a pale midrib. Returns 0 (ground) … 1 (patch).
   */
  const pattern = (t: number, s: number) => {
    const a = Math.abs(s)
    if (a > 0.9) return 0.75
    let m = 0
    const step = 0.82 / p.patches
    for (let k = 0; k < p.patches; k++) {
      const big = k % 2 === 0
      const tc = 0.09 + step * (k + 0.5) + a * 0.07
      const dt = (t - tc) / (step * (big ? 0.42 : 0.26))
      const ds = a / (big ? 0.78 : 0.45)
      m = Math.max(m, 1 - THREE.MathUtils.smoothstep(dt * dt + ds * ds, 0.55, 1.05))
    }
    return m
  }

  // Rounded base, widest just below the middle, short acuminate tip.
  const bladeWidth = (w: number) => (t: number) => {
    const f = Math.sin(Math.PI * t ** 0.82) ** 0.55
    return w * (t < 0.5 ? Math.max(0.14, f) : f)
  }

  const addBlade = (origin: THREE.Vector3, dir: THREE.Vector3, length: number, width: number, droop: number) => {
    const spine = arcSpine(origin, dir, length, droop, 44)
    const twist = rng.range(-0.35, 0.35)
    const tint = rng.range(-0.04, 0.04)
    const shape = { spine, columns: COLUMNS, keel: 0.08, twist, width: bladeWidth(width) }
    leaves.addRibbon({
      ...shape,
      color: (t, s) => {
        if (s === 0) return MIDRIB.clone().lerp(ground, t * 0.4)
        return ground
          .clone()
          .offsetHSL(0, 0, tint)
          .lerp(patch, pattern(t, s))
      },
    })
    leaves.addRibbon({ ...shape, offset: -0.0007, color: (t, s) => under.clone().lerp(underPatch, pattern(t, s) * 0.8) })
  }

  const clump = potRadius * 0.28
  for (let i = 0; i < p.leafCount; i++) {
    const f = p.leafCount > 1 ? i / (p.leafCount - 1) : 0.5 // 0 = outer and older, 1 = inner and younger
    const az = i * GOLDEN_ANGLE + rng.range(-0.25, 0.25)
    const r = clump * Math.sqrt(rng.next())
    const origin = new THREE.Vector3(Math.cos(az) * r, soilY - 0.005, Math.sin(az) * r)

    const elev = THREE.MathUtils.lerp(0.9, 1.38, f) + rng.range(-0.08, 0.08)
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev))
    const len = THREE.MathUtils.lerp(p.petioleLength[1], p.petioleLength[0], f) * rng.range(0.85, 1.1)
    const stalk = arcSpine(origin, dir, len, THREE.MathUtils.lerp(0.28, 0.08, f), 16)
    stems.addTube({
      points: stalk,
      // Clasping sheath at the base, swollen pulvinus below the blade.
      radius: (t) => 0.0021 * (1 - 0.25 * t) * (1 + 1.3 * Math.max(0, 1 - t / 0.22)) * (t > 0.92 ? 1.4 : 1),
      color: (t) => (t > 0.92 ? PULVINUS : petiole.clone().lerp(SHEATH, Math.max(0, 1 - t / 0.22) * 0.7)),
      radial: 6,
    })

    const baz = az + rng.range(-0.3, 0.3)
    // The pulvinus turns the blade's upper side toward the light.
    const belev = THREE.MathUtils.lerp(-0.15, 0.4, f) + rng.range(-0.12, 0.12)
    const bdir = new THREE.Vector3(Math.cos(baz) * Math.cos(belev), Math.sin(belev), Math.sin(baz) * Math.cos(belev))
    const size = THREE.MathUtils.lerp(1, 0.68, f) * rng.range(0.88, 1.08)
    addBlade(stalk[stalk.length - 1], bdir, p.bladeLength * size, p.bladeWidth * size, THREE.MathUtils.lerp(0.32, 0.12, f))
  }

  // Young leaves unfurl from the centre still rolled, showing their red underside.
  for (let k = 0; k < 2; k++) {
    const az = rng.range(0, Math.PI * 2)
    const base = new THREE.Vector3(Math.cos(az) * 0.01, soilY, Math.sin(az) * 0.01)
    const lean = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(rng.range(0.02, 0.05))
    const stalkLen = p.petioleLength[0] * rng.range(0.55, 0.8)
    const top = base.clone().add(lean).setY(soilY + stalkLen)
    stems.addTube({ points: [base, base.clone().lerp(top, 0.5), top], radius: () => 0.0019, color: () => petiole, radial: 6 })
    const rollLen = p.bladeLength * rng.range(0.5, 0.75)
    const tip = top.clone().add(lean.clone().multiplyScalar(0.6)).setY(top.y + rollLen)
    crown.addTube({
      points: [top, top.clone().lerp(tip, 0.5), tip],
      radius: (t) => 0.0055 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)) ** 0.6,
      color: (t) => under.clone().lerp(ground, 0.35 + t * 0.2),
      radial: 8,
      capEnd: true,
    })
  }

  // Clasping leaf sheaths where the clump meets the soil.
  crown.addTube({
    points: [new THREE.Vector3(0, soilY - 0.012, 0), new THREE.Vector3(0, soilY + 0.012, 0), new THREE.Vector3(0, soilY + 0.028, 0)],
    radius: (t) => clump * 0.8 * (1 - 0.6 * t) + 0.006,
    color: (t) => SHEATH.clone().lerp(petiole, t * 0.6),
    radial: 14,
    capEnd: true,
  })

  const rootOrigins = [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * clump * 0.6, soilY, Math.sin(a) * clump * 0.6)
  })

  return { leaves: leaves.build(), stems: stems.build(), crown: crown.build(), rootOrigins }
}
