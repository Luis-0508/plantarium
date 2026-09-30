import * as THREE from 'three'

export { createRng, type Rng } from './rng'

const UP = new THREE.Vector3(0, 1, 0)
const tmp = new THREE.Vector3()

/**
 * Accumulates many small surfaces (leaves, leaflets, tubes) into a single
 * indexed BufferGeometry with vertex colours, keeping draw calls low.
 */
export class MeshBuilder {
  private positions: number[] = []
  private colors: number[] = []
  private indices: number[] = []

  private get vertexCount() {
    return this.positions.length / 3
  }

  private pushVertex(p: THREE.Vector3, c: THREE.Color) {
    this.positions.push(p.x, p.y, p.z)
    this.colors.push(c.r, c.g, c.b)
  }

  /**
   * Leaf-like strip along a spine. `columns` are cross-section offsets in
   * [-1, 1]; `keel` bends the edges up/down to form a channel or V-fold.
   */
  addRibbon(opts: {
    spine: THREE.Vector3[]
    width: (t: number) => number
    columns: number[]
    color: (t: number, s: number) => THREE.Color
    keel?: number
    twist?: number
    sideHint?: THREE.Vector3
  }) {
    const { spine, width, columns, color, keel = 0, twist = 0 } = opts
    const n = spine.length
    const base = this.vertexCount
    const side = new THREE.Vector3()
    const normal = new THREE.Vector3()
    const tangent = new THREE.Vector3()
    const p = new THREE.Vector3()

    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      tangent.subVectors(spine[Math.min(i + 1, n - 1)], spine[Math.max(i - 1, 0)]).normalize()
      if (opts.sideHint) {
        side.copy(opts.sideHint).addScaledVector(tangent, -opts.sideHint.dot(tangent))
      } else {
        side.crossVectors(tangent, UP)
      }
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
      side.normalize()
      if (twist) side.applyAxisAngle(tangent, twist * t)
      normal.crossVectors(side, tangent).normalize()

      const w = width(t)
      for (const s of columns) {
        p.copy(spine[i]).addScaledVector(side, s * w)
        // Channel: edges lift along the leaf normal.
        p.addScaledVector(normal, keel * w * s * s)
        this.pushVertex(p, color(t, s))
      }
    }

    const cols = columns.length
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const a = base + i * cols + j
        const b = a + cols
        this.indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }
  }

  /** Tube with per-point radius, using parallel-transport frames. */
  addTube(opts: {
    points: THREE.Vector3[]
    radius: (t: number) => number
    color: (t: number, angle: number) => THREE.Color
    radial?: number
    capEnd?: boolean
  }) {
    const { points, radius, color, radial = 6 } = opts
    const n = points.length
    if (n < 2) return
    const base = this.vertexCount
    const tangent = new THREE.Vector3()
    const normal = new THREE.Vector3()
    const binormal = new THREE.Vector3()
    const p = new THREE.Vector3()

    tangent.subVectors(points[1], points[0]).normalize()
    normal.set(0, 1, 0)
    if (Math.abs(tangent.dot(normal)) > 0.9) normal.set(1, 0, 0)
    normal.addScaledVector(tangent, -normal.dot(tangent)).normalize()

    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      tangent.subVectors(points[Math.min(i + 1, n - 1)], points[Math.max(i - 1, 0)]).normalize()
      normal.addScaledVector(tangent, -normal.dot(tangent))
      if (normal.lengthSq() < 1e-8) normal.set(1, 0, 0)
      normal.normalize()
      binormal.crossVectors(tangent, normal)
      const r = radius(t)
      for (let k = 0; k <= radial; k++) {
        const a = (k / radial) * Math.PI * 2
        tmp.copy(normal).multiplyScalar(Math.cos(a)).addScaledVector(binormal, Math.sin(a))
        p.copy(points[i]).addScaledVector(tmp, r)
        this.pushVertex(p, color(t, a))
      }
    }

    const ring = radial + 1
    for (let i = 0; i < n - 1; i++) {
      for (let k = 0; k < radial; k++) {
        const a = base + i * ring + k
        const b = a + ring
        this.indices.push(a, b, a + 1, a + 1, b, b + 1)
      }
    }

    if (opts.capEnd) {
      const tip = this.vertexCount
      this.pushVertex(points[n - 1], color(1, 0))
      const last = base + (n - 1) * ring
      for (let k = 0; k < radial; k++) this.indices.push(last + k, tip, last + k + 1)
    }
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3))
    g.setIndex(this.indices)
    g.computeVertexNormals()
    g.computeBoundingSphere()
    return g
  }
}

/** Samples a quadratic arc: launch direction with gravity droop. */
export function arcSpine(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  droop: number,
  segments: number,
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const dir = direction.clone().normalize()
  const step = length / segments
  const p = origin.clone()
  const d = dir.clone()
  pts.push(p.clone())
  for (let i = 1; i <= segments; i++) {
    // Bend the heading progressively downward; stiffer near the base.
    const t = i / segments
    d.y -= droop * (0.35 + t) * (2 / segments)
    d.normalize()
    p.addScaledVector(d, step)
    pts.push(p.clone())
  }
  return pts
}

export const lerpColor = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t)
