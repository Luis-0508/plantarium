import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Ground } from '../components/Ground'
import { C, F, ease } from '../theme'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

const PILLARS = [
  { n: '01', title: 'Procedural shoots', sub: 'grown from botanical parameters' },
  { n: '02', title: 'Root systems', sub: 'measured inside the pot' },
  { n: '03', title: 'Care data as graphics', sub: 'light · water · humidity · calendar' },
]

function Words({ text, start, frame, style }: { text: string; start: number; frame: number; style: React.CSSProperties }) {
  return (
    <span style={style}>
      {text.split(' ').map((w, i) => {
        const t = interpolate(frame, [start + i * 3, start + i * 3 + 20], [0, 1], { ...clamp, easing: ease })
        return (
          <span key={i} style={{ display: 'inline-block', marginRight: '0.24em', opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
            {w}
          </span>
        )
      })}
    </span>
  )
}

export function Premise() {
  const frame = useCurrentFrame()
  const drift = interpolate(frame, [0, 135], [0, -18])
  return (
    <Ground>
      <AbsoluteFill style={{ padding: '0 200px', justifyContent: 'center', transform: `translateY(${drift}px)` }}>
        <p style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: 4, color: C.moss, margin: '0 0 34px', opacity: interpolate(frame, [0, 16], [0, 1], clamp) }}>
          WHAT IT IS
        </p>
        <h2 style={{ margin: 0, fontFamily: F.serif, fontWeight: 400, fontSize: 92, lineHeight: 1.08, letterSpacing: -1.2, color: C.rootWhite }}>
          <Words text="Every houseplant as a living specimen," start={4} frame={frame} style={{}} />
          <br />
          <Words text="from leaf to root." start={26} frame={frame} style={{ fontStyle: 'italic', color: C.tint }} />
        </h2>
        <div style={{ display: 'flex', marginTop: 90, borderTop: `1px solid ${C.line}` }}>
          {PILLARS.map((p, i) => {
            const t = interpolate(frame, [52 + i * 8, 76 + i * 8], [0, 1], { ...clamp, easing: ease })
            return (
              <div
                key={p.n}
                style={{
                  flex: 1,
                  padding: '30px 34px 0',
                  borderLeft: i ? `1px solid ${C.line}` : 'none',
                  paddingLeft: i ? 34 : 0,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 20}px)`,
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: 2, color: C.moss }}>{p.n}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 34, color: C.rootWhite, marginTop: 12 }}>{p.title}</div>
                <div style={{ fontFamily: F.sans, fontSize: 22, color: C.tint, opacity: 0.75, marginTop: 6 }}>{p.sub}</div>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
    </Ground>
  )
}
