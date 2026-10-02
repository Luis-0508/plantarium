import * as THREE from 'three'
import type { CalatheaParams } from '../../data/types'
import { MeshBuilder, arcSpine, type Rng } from './geometry'

const GOLDEN_ANGLE = 2.39996
const UP = new THREE.Vector3(0, 1, 0)
const MIDRIB = new THREE.Color('#e4e9c4')
const SHEATH = new THREE.Color('#b7b98a')
const PULVINUS = new THREE.Color('#8a7a3e')

/**
 * Cross-section columns, dense enough to resolve the diagonal feather stripes.
 * Listed from +1 to −1 so the face winding puts the geometric normal on the
 * upper side; the shadow normal bias then samples above the broad blade
 * instead of below it, which would leave the upper side in its own shadow.
 */
const COLUMNS = [1, 0.95, 0.89, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34, 0.26, 0.18, 0.1, 0.04, 0]
COLUMNS.push(...COLUMNS.slice(0, -1).map((s) => -s).reverse())

/** Lateral veins run from the midrib toward margin and tip at a shallow angle. */
const VEIN_SLANT = 0.3

/**
 * Calathea (Goeppertia makoyana) clump: a dense bush of oval blades held at
 * every height on thin reddish petioles, each ending in a pulvinus joint that
 * lowers the blade in the morning and raises it in the evening. The blade is
 * two layers: a patterned green upper side and a wine-red underside. Young
 * leaves emerge rolled like a cigar.
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
   * Peacock pattern: dark feather stripes follow the lateral veins from the
   * midrib toward the margin, long and short ones alternating, inside a dark
   * margin band. Returns 0 (pale ground) … 1 (dark green).
   */
  const pattern = (t: number, s: number) => {
    const a = Math.abs(s)
    if (a > 0.84) return 0.9
    const u = t - a * VEIN_SLANT
    const step = 0.86 / p.patches
    let m = 0
    for (let k = 0; k < p.patches; k++) {
      const long = k % 2 === 0
      const reach = long ? 0.86 : 0.56
      if (a > reach) continue
      const taper = Math.sin(Math.PI * Math.min(1, (a + 0.06) / (reach + 0.06))) ** 0.6
      const half = step * (long ? 0.4 : 0.3) * taper + 1e-4
      const d = Math.abs(u - (0.02 + step * (k + 0.5) - 0.15)) / half
      m = Math.max(m, 1 - THREE.MathUtils.smoothstep(d, 0.55, 1.1))
    }
    // A thin pale zone hugs the midrib.
    return m * THREE.MathUtils.smoothstep(a, 0.03, 0.1)
  }

  // Rounded base, widest just below the middle, acuminate tip.
  const bladeWidth = (w: number) => (t: number) => {
    const f = Math.sin(Math.PI * t ** 0.85) ** 0.6
    return w * (t < 0.5 ? Math.max(0.16, f) : f)
  }

  /**
   * Blade from the pulvinus at `origin`. In the evening (`uPose` = 1) the
   * blade turns about the pulvinus by `rise` radians and stands upright,
   * showing its wine-red underside; in the morning it lies flat again.
   */
  const addBlade = (origin: THREE.Vector3, dir: THREE.Vector3, length: number, width: number, droop: number, rise: number) => {
    // Retain the dense cross-section for feather patches; 48 length segments
    // resolve the smooth blade curve without oversampling it.
    const spine = arcSpine(origin, dir, length, droop, 48)
    const twist = rng.range(-0.3, 0.3)
    const tint = rng.range(-0.03, 0.03)
    const shape = { spine, columns: COLUMNS, keel: 0.1, twist, width: bladeWidth(width) }
    const axis = new THREE.Vector3(dir.x, 0, dir.z).cross(UP).normalize()
    leaves.setMotion({ pivot: origin, axis, angle: rise })
    leaves.addRibbon({
      ...shape,
      color: (t, s) => {
        if (s === 0) return MIDRIB.clone().lerp(ground, t * 0.3)
        return ground.clone().offsetHSL(0, 0, tint).lerp(patch, pattern(t, s))
      },
    })
    leaves.addRibbon({ ...shape, offset: -0.0007, glow: 0.3, color: (t, s) => under.clone().lerp(underPatch, pattern(t, s) * 0.7) })
    leaves.setMotion(null)
  }

  // Leaves are stacked at every height: short petioles splay out over the
  // rim, long ones stand nearly upright.
  const clump = potRadius * 0.38
  for (let i = 0; i < p.leafCount; i++) {
    const h = THREE.MathUtils.clamp((i + rng.range(0, 1)) / p.leafCount, 0, 1) // 0 = low, 1 = top of the bush
    const az = i * GOLDEN_ANGLE + rng.range(-0.3, 0.3)
    const r = clump * Math.sqrt(rng.range(0.05, 1))
    const origin = new THREE.Vector3(Math.cos(az) * r, soilY - 0.005, Math.sin(az) * r)

    const elev = THREE.MathUtils.lerp(0.8, 1.38, h) + rng.range(-0.08, 0.08)
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev))
    const len = THREE.MathUtils.lerp(p.petioleLength[0], p.petioleLength[1], h) * rng.range(0.88, 1.08)
    const stalk = arcSpine(origin, dir, len, 0.06, 16)
    stems.addTube({
      points: stalk,
      // Clasping sheath at the base, swollen pulvinus below the blade.
      radius: (t) => 0.0021 * (1 - 0.25 * t) * (1 + 1.1 * Math.max(0, 1 - t / 0.15)) * (t > 0.93 ? 1.35 : 1),
      color: (t) => (t > 0.93 ? PULVINUS : petiole.clone().lerp(SHEATH, Math.max(0, 1 - t / 0.15) * 0.6)),
      radial: 6,
    })

    // Morning: the pulvinus holds the blade about level, upper side to the
    // light, the upper ones tilted higher. Evening: nearly upright.
    const baz = az + rng.range(-0.35, 0.35)
    const belev = THREE.MathUtils.lerp(0.08, 0.45, h) + rng.range(-0.1, 0.1)
    const evening = rng.range(1.25, 1.5)
    const bdir = new THREE.Vector3(Math.cos(baz) * Math.cos(belev), Math.sin(belev), Math.sin(baz) * Math.cos(belev))
    const size = THREE.MathUtils.lerp(0.85, 1, Math.sin(Math.PI * h)) * rng.range(0.88, 1.08)
    addBlade(stalk[stalk.length - 1], bdir, p.bladeLength * size, p.bladeWidth * size, rng.range(0.25, 0.4), evening - belev)
  }

  // Young leaves unfurl from the centre still rolled, showing their red underside.
  for (let k = 0; k < 2; k++) {
    const az = rng.range(0, Math.PI * 2)
    const base = new THREE.Vector3(Math.cos(az) * 0.01, soilY, Math.sin(az) * 0.01)
    const lean = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(rng.range(0.02, 0.05))
    const stalkLen = p.petioleLength[1] * rng.range(0.6, 0.85)
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
