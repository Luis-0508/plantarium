import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Ground } from '../components/Ground'
import { C, F, ease } from '../theme'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

const BOX = { w: 340, h: 150 }
type Pt = [number, number]

// Mirrors the "How it works" flowchart in README.md.
const NODES = [
  { id: 'data', at: [330, 450], path: 'src/data', title: 'Plant data', sub: 'care · pot · roots · anatomy', t: 8 },
  { id: 'params', at: [750, 450], path: 'models/registry.ts', title: 'Parameters + seed', sub: 'seeded PRNG, cached per plant', t: 30 },
  { id: 'geo', at: [1170, 450], path: 'src/three/models', title: 'Procedural geometry', sub: 'rosette · palm · roots', t: 52 },
  { id: 'scene', at: [1590, 450], path: 'src/three', title: 'React Three Fiber', sub: 'lights · camera · views', t: 74 },
  { id: 'interaction', at: [1590, 735], path: 'picking · hotspots', title: 'Interaction', sub: '3D anchors → DOM labels', t: 96 },
  { id: 'ui', at: [750, 735], path: 'src/ui', title: 'Specimen sheet', sub: 'SVG visualizations', t: 118 },
] as const

const EDGES: { pts: Pt[]; t: number }[] = [
  { pts: [[500, 450], [580, 450]], t: 22 },
  { pts: [[920, 450], [1000, 450]], t: 44 },
  { pts: [[1340, 450], [1420, 450]], t: 66 },
  { pts: [[1590, 525], [1590, 660]], t: 86 },
  { pts: [[1420, 735], [920, 735]], t: 108 },
  { pts: [[330, 525], [330, 735], [580, 735]], t: 100 },
]

const TECH = ['React 19', 'TypeScript', 'three.js', 'React Three Fiber', 'drei', 'Vite']

function polyLength(pts: Pt[]) {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return l
}

function pointAt(pts: Pt[], d: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (d <= seg) {
      const k = d / seg
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]
    }
    d -= seg
  }
  return pts[pts.length - 1]
}

export function Architecture() {
  const frame = useCurrentFrame()
  const head = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: ease })
  const drift = interpolate(frame, [0, 180], [1, 1.035])

  return (
    <Ground>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(211,221,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(211,221,233,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundPosition: '0 30px',
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <div style={{ position: 'absolute', left: 160, top: 112, opacity: head, transform: `translateY(${(1 - head) * 16}px)` }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: 4, color: C.moss }}>05 / ARCHITECTURE</div>
          <div style={{ fontFamily: F.serif, fontSize: 64, color: C.rootWhite, marginTop: 14, letterSpacing: -0.8 }}>
            One typed entry. <span style={{ fontStyle: 'italic', color: C.tint }}>Everything else is derived.</span>
          </div>
        </div>

        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={C.tint} />
            </marker>
          </defs>
          {EDGES.map((e, i) => {
            const len = polyLength(e.pts)
            const p = interpolate(frame, [e.t, e.t + 16], [0, 1], { ...clamp, easing: ease })
            const d = 'M' + e.pts.map((q) => q.join(' ')).join(' L')
            const dots = p >= 1 ? [0, 0.5].map((o) => pointAt(e.pts, (((frame - e.t) / 34 + o) % 1) * len)) : []
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={C.tint}
                  strokeOpacity={0.55}
                  strokeWidth={1.6}
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - p)}
                  markerEnd={p > 0.95 ? 'url(#arrow)' : undefined}
                />
                {dots.map(([x, y], j) => (
                  <circle key={j} cx={x} cy={y} r={3.6} fill={C.moss} />
                ))}
              </g>
            )
          })}
        </svg>

        {NODES.map((n) => {
          const t = interpolate(frame, [n.t, n.t + 18], [0, 1], { ...clamp, easing: ease })
          return (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                left: n.at[0] - BOX.w / 2,
                top: n.at[1] - BOX.h / 2,
                width: BOX.w,
                height: BOX.h,
                padding: '22px 26px',
                boxSizing: 'border-box',
                border: `1px solid rgba(241,238,221,${0.12 + 0.18 * t})`,
                borderRadius: 6,
                background: 'rgba(8, 22, 41, 0.72)',
                opacity: t,
                transform: `translateY(${(1 - t) * 18}px)`,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 15, color: C.moss, letterSpacing: 0.5 }}>{n.path}</div>
              <div style={{ fontFamily: F.serif, fontSize: 36, color: C.rootWhite, marginTop: 8, letterSpacing: -0.3 }}>{n.title}</div>
              <div style={{ fontFamily: F.sans, fontSize: 18, color: C.tint, opacity: 0.75, marginTop: 4 }}>{n.sub}</div>
            </div>
          )
        })}

        <div style={{ position: 'absolute', left: 160, right: 160, top: 900, display: 'flex', gap: 14, alignItems: 'center' }}>
          {TECH.map((name, i) => {
            const t = interpolate(frame, [124 + i * 4, 140 + i * 4], [0, 1], { ...clamp, easing: ease })
            return (
              <span
                key={name}
                style={{
                  fontFamily: F.mono,
                  fontSize: 18,
                  color: C.rootWhite,
                  padding: '10px 18px',
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 10}px)`,
                }}
              >
                {name}
              </span>
            )
          })}
        </div>
      </AbsoluteFill>
    </Ground>
  )
}
