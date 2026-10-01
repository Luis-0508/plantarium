import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Ground } from '../components/Ground'
import { Mark } from '../components/Mark'
import { C, F, REPO, ease } from '../theme'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function GitHubIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={C.rootWhite}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function Outro() {
  const frame = useCurrentFrame()
  const a = (s: number) => interpolate(frame, [s, s + 20], [0, 1], { ...clamp, easing: ease })
  const out = interpolate(frame, [104, 124], [1, 0], clamp)
  return (
    <Ground>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: out }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34, marginTop: -60 }}>
          <Mark frame={frame} size={132} tile speed={1.6} />
          <span
            style={{
              fontFamily: F.serif,
              fontSize: 132,
              color: C.rootWhite,
              letterSpacing: -1.6,
              lineHeight: 1,
              opacity: a(10),
              transform: `translateX(${(1 - a(10)) * -20}px)`,
            }}
          >
            Plantarium
          </span>
        </div>
        <div
          style={{
            marginTop: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 30px',
            border: `1px solid rgba(241,238,221,0.28)`,
            borderRadius: 10,
            background: 'rgba(8,22,41,0.6)',
            opacity: a(30),
            transform: `translateY(${(1 - a(30)) * 14}px)`,
          }}
        >
          <GitHubIcon size={32} />
          <span style={{ fontFamily: F.mono, fontSize: 32, color: C.rootWhite, letterSpacing: 0.4 }}>{REPO}</span>
        </div>
        <div style={{ marginTop: 34, fontFamily: F.mono, fontSize: 18, letterSpacing: 4, color: C.tint, opacity: 0.7 * a(46) }}>
          OPEN SOURCE · MIT LICENSE · CONTRIBUTIONS WELCOME
        </div>
      </AbsoluteFill>
    </Ground>
  )
}
