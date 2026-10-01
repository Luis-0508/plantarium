import { useMemo } from 'react'
import type { Plant } from '../data/types'
import { createRng } from '../three/models/rng'

/**
 * Line-drawn silhouette derived from the same model parameters as the 3D
 * specimen, so new plants get a matching glyph without extra artwork.
 * Units: the drawing is 100 wide; plant height (without pot) is 100 tall.
 */
function glyphPaths(plant: Plant) {
  const model = plant.model
  const rng = createRng(model.kind === 'procedural' ? model.seed : 1)
  const paths: { d: string; w: number }[] = []
  const baseY = 100
  const x0 = 50

  if (model.kind === 'procedural' && model.params.type === 'rosette') {
    const n = 15
    for (let i = 0; i < n; i++) {
      const a = ((i / (n - 1)) * 2 - 1) * 1.45 + rng.range(-0.08, 0.08)
      const L = 58 * (1 - Math.abs(a) * 0.12) * rng.range(0.9, 1.08)
      const s = Math.sin(a)
      const cx = x0 + s * L * 0.42
      const cy = baseY - L * (1.05 - Math.abs(s) * 0.3)
      const ex = x0 + s * L * 0.95
      const ey = baseY - L * (0.9 - Math.abs(s) * 1.05)
      paths.push({ d: `M${x0} ${baseY}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w: 2.2 })
    }
    for (const side of [-1, 1]) {
      const ex = x0 + side * 46
      paths.push({ d: `M${x0} ${baseY - 4}C${x0 + side * 12} ${baseY - 62} ${x0 + side * 38} ${baseY - 58} ${ex} ${baseY + 6}`, w: 1 })
      for (let k = 0; k < 5; k++) {
        const a = ((k / 4) * 2 - 1) * 1.2
        paths.push({ d: `M${ex} ${baseY + 6}l${(Math.sin(a) * 9).toFixed(1)} ${(-Math.cos(a) * 7 + 2).toFixed(1)}`, w: 1.4 })
      }
    }
  } else if (model.kind === 'procedural' && model.params.type === 'palm') {
    const p = model.params
    const heightScale = 100 / (p.stemHeight[1] + p.frondLength[1] * 0.75)
    const stems = Math.min(p.stems, 5)
    for (let s = 0; s < stems; s++) {
      const f = stems > 1 ? s / (stems - 1) : 0.5
      const bx = x0 + (f - 0.5) * 12
      const h = (p.stemHeight[0] + (p.stemHeight[1] - p.stemHeight[0]) * (1 - Math.abs(f - 0.5) * 2)) * heightScale * rng.range(0.85, 1)
      const tx = bx + (f - 0.5) * 16
      const ty = baseY - h
      paths.push({ d: `M${bx.toFixed(1)} ${baseY}Q${bx.toFixed(1)} ${(baseY - h * 0.6).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`, w: 1.6 })
      // Fronds at staggered heights along the upper cane, varied in length
      // and direction, like the 3D model; arching palms hang their leaflets.
      const fronds = p.frondSpacing > 0.04 ? 3 : 2
      const hanging = p.leafletDroop > 0.8
      for (let k = 0; k < fronds; k++) {
        const oy = ty + k * h * 0.14
        const ox = tx - (tx - bx) * k * 0.14
        const dir = (k + s) % 2 === 0 ? (f < 0.5 ? -1 : 1) : f < 0.5 ? 1 : -1
        const L = p.frondLength[1] * heightScale * rng.range(0.62, 0.95) * (1 - k * 0.1)
        const lift = L * (0.85 - p.arch * 0.45) * (1 - k * 0.25) * rng.range(0.8, 1.15)
        const ex = ox + dir * L * (0.38 + p.arch * 0.22) * rng.range(0.85, 1.1) * (hanging ? 0.78 : 1)
        const ey = oy - lift + L * p.arch * 0.55 * (1 + k * 0.2)
        const cx = ox + dir * L * 0.3
        const cy = oy - lift * 1.1
        paths.push({ d: `M${ox.toFixed(1)} ${oy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w: 1.2 })
        const leaflets = Math.max(5, Math.round(p.leafletsPerSide / 3))
        for (let i = 1; i <= leaflets; i++) {
          const t = (i + rng.range(-0.3, 0.3) * p.irregularity) / (leaflets + 1)
          const qx = (1 - t) ** 2 * ox + 2 * (1 - t) * t * cx + t * t * ex
          const qy = (1 - t) ** 2 * oy + 2 * (1 - t) * t * cy + t * t * ey
          const len = p.leafletLength * heightScale * 0.4 * Math.sin(Math.PI * (0.2 + 0.8 * t)) * rng.range(0.8, 1.1)
          if (hanging) {
            paths.push({ d: `M${qx.toFixed(1)} ${qy.toFixed(1)}l${(dir * len * 0.35).toFixed(1)} ${(len * 0.95).toFixed(1)}`, w: 1 })
            paths.push({ d: `M${qx.toFixed(1)} ${qy.toFixed(1)}l${(-dir * len * 0.1).toFixed(1)} ${(len * 0.8).toFixed(1)}`, w: 1 })
          } else {
            paths.push({ d: `M${qx.toFixed(1)} ${qy.toFixed(1)}l${(dir * len * 0.45).toFixed(1)} ${(len * (0.5 + p.arch * 0.6)).toFixed(1)}`, w: 1.1 })
            paths.push({ d: `M${qx.toFixed(1)} ${qy.toFixed(1)}l${(dir * len * 0.2).toFixed(1)} ${(-len * (0.7 - p.arch * 0.3)).toFixed(1)}`, w: 1.1 })
          }
        }
      }
    }
  } else if (model.kind === 'procedural' && model.params.type === 'calathea') {
    // Fan of long petioles, each holding an oval blade with its midrib.
    const n = 7
    for (let i = 0; i < n; i++) {
      const a = ((i / (n - 1)) * 2 - 1) * 0.75 + rng.range(-0.06, 0.06)
      const L = 52 * (1 - Math.abs(a) * 0.3) * rng.range(0.9, 1.05)
      const tx = x0 + Math.sin(a) * L * 0.75
      const ty = baseY - Math.cos(a) * L
      paths.push({ d: `M${x0} ${baseY}Q${(x0 + Math.sin(a) * L * 0.2).toFixed(1)} ${(baseY - L * 0.6).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`, w: 1.1 })
      const b = a * 1.7
      const len = 36 * rng.range(0.9, 1.05)
      const ex = tx + Math.sin(b) * len
      const ey = ty - Math.cos(b) * len
      const nx = Math.cos(b) * 13
      const ny = Math.sin(b) * 13
      const mx = (tx + ex) / 2
      const my = (ty + ey) / 2
      const pt = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`
      paths.push({ d: `M${pt(tx, ty)}Q${pt(mx + nx, my + ny)} ${pt(ex, ey)}Q${pt(mx - nx, my - ny)} ${pt(tx, ty)}`, w: 1.3 })
      paths.push({ d: `M${pt(tx, ty)}L${pt(ex, ey)}`, w: 0.7 })
    }
  } else if (model.kind === 'procedural' && model.params.type === 'dracaena') {
    // Slender canes of staggered height, each crowned by a starburst tuft.
    const p = model.params
    const heightScale = 100 / (Math.max(...p.canes) + p.leafLength * 0.85)
    p.canes.forEach((h, c) => {
      const f = p.canes.length > 1 ? c / (p.canes.length - 1) : 0.5
      const bx = x0 + (f - 0.5) * 8
      const tx = bx + (c % 2 === 0 ? -1 : 1) * (6 + c * 4)
      const ty = baseY - h * heightScale
      paths.push({ d: `M${bx.toFixed(1)} ${baseY}Q${(bx + (tx - bx) * 1.4).toFixed(1)} ${(baseY - h * heightScale * 0.55).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`, w: 1.7 })
      // Upright fountain: leaves spread up to ~75° from vertical, outer ones arch slightly.
      const leaves = 15
      for (let i = 0; i < leaves; i++) {
        const a = ((i / (leaves - 1)) * 2 - 1) * 1.3 + rng.range(-0.08, 0.08)
        const L = p.leafLength * heightScale * (1 - Math.abs(a) * 0.15) * rng.range(0.85, 1.05)
        const droop = Math.abs(a) > 0.9 ? L * 0.12 : 0
        const ex = tx + Math.sin(a) * L
        const ey = ty - Math.cos(a) * L + droop
        const cx = tx + Math.sin(a) * L * 0.6
        const cy = ty - Math.cos(a) * L * 0.6 - L * 0.12
        paths.push({ d: `M${tx.toFixed(1)} ${ty.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w: 1 })
      }
    })
  }
  return paths
}

/** Topmost y reached by paths built from M, L, l, Q and C commands. */
function topOf(paths: { d: string }[]) {
  let top = Infinity
  for (const { d } of paths) {
    const tokens = d.match(/[MLlQC]|-?\d*\.?\d+/g) ?? []
    let y = 0
    for (let i = 0; i < tokens.length; ) {
      const cmd = tokens[i++]
      const n = (k: number) => tokens.slice(i, i + k).map(Number)
      if (cmd === 'M' || cmd === 'L') {
        y = n(2)[1]
        i += 2
      } else if (cmd === 'l') {
        y += n(2)[1]
        i += 2
      } else if (cmd === 'Q' || cmd === 'C') {
        const k = cmd === 'Q' ? 4 : 6
        const v = n(k)
        const ys = [y, ...v.filter((_, j) => j % 2 === 1)]
        for (let t = 0; t <= 1; t += 0.05) {
          const yt =
            cmd === 'Q'
              ? (1 - t) ** 2 * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2]
              : (1 - t) ** 3 * ys[0] + 3 * (1 - t) ** 2 * t * ys[1] + 3 * (1 - t) * t * t * ys[2] + t ** 3 * ys[3]
          top = Math.min(top, yt)
        }
        y = v[k - 1]
        i += k
      }
      top = Math.min(top, y)
    }
  }
  return top
}

interface Props {
  plant: Plant
  className?: string
  /** Draw the pot beneath the plant. */
  withPot?: boolean
  title?: string
  /** Placement when nested inside another SVG. */
  x?: number
  y?: number
  width?: number
  height?: number
}

export function PlantGlyph({ plant, className, withPot = true, title, ...placement }: Props) {
  const { paths, scale } = useMemo(() => {
    const p = glyphPaths(plant)
    // Scale uniformly about the base so the tallest point sits at y = 0.
    return { paths: p, scale: 100 / Math.max(1, 100 - topOf(p)) }
  }, [plant])
  return (
    <svg {...placement} className={className} viewBox={`-4 -8 108 ${withPot ? 132 : 112}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <g transform={`translate(50 100) scale(${scale.toFixed(3)}) translate(-50 -100)`}>
          {paths.map((p, i) => (
            <path key={i} d={p.d} strokeWidth={p.w / scale} />
          ))}
        </g>
        {withPot && <path d="M36 100h28l-3 22H39z" strokeWidth={1.4} />}
      </g>
    </svg>
  )
}
