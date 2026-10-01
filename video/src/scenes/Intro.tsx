import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Ground } from '../components/Ground'
import { Mark } from '../components/Mark'
import { C, F, ease } from '../theme'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function Corner({ children, style, frame }: { children: React.ReactNode; style: React.CSSProperties; frame: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: F.mono,
        fontSize: 15,
        letterSpacing: 3,
        color: C.tint,
        opacity: 0.45 * interpolate(frame, [70, 100], [0, 1], clamp),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Intro() {
  const frame = useCurrentFrame()
  const word = 'Plantarium'
  const push = interpolate(frame, [0, 135], [1, 1.05])
  const rule = interpolate(frame, [62, 100], [0, 1], { ...clamp, easing: ease })
  const tag = interpolate(frame, [78, 104], [0, 1], { ...clamp, easing: ease })

  return (
    <Ground>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40 }}>
          <Mark frame={frame} size={210} />
          <h1
            style={{
              margin: '18px 0 0',
              fontFamily: F.serif,
              fontWeight: 400,
              fontSize: 168,
              letterSpacing: -2,
              color: C.rootWhite,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {word.split('').map((ch, i) => {
              const t = interpolate(frame, [44 + i * 2.5, 70 + i * 2.5], [0, 1], { ...clamp, easing: ease })
              return (
                <span key={i} style={{ opacity: t, transform: `translateY(${(1 - t) * 40}px)`, filter: `blur(${(1 - t) * 8}px)` }}>
                  {ch}
                </span>
              )
            })}
          </h1>
          <div style={{ width: 640 * rule, height: 1, background: C.line, margin: '34px 0 26px' }} />
          <p
            style={{
              margin: 0,
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: 7,
              color: C.tint,
              opacity: tag,
              transform: `translateY(${(1 - tag) * 12}px)`,
            }}
          >
            AN INTERACTIVE 3D HERBARIUM
          </p>
        </div>
      </AbsoluteFill>
      <Corner frame={frame} style={{ left: 64, top: 52 }}>FIG. 01 — SPECIMEN</Corner>
      <Corner frame={frame} style={{ right: 64, top: 52 }}>REACT · THREE.JS</Corner>
      <Corner frame={frame} style={{ left: 64, bottom: 52 }}>LEAF → ROOT</Corner>
      <Corner frame={frame} style={{ right: 64, bottom: 52 }}>OPEN SOURCE</Corner>
    </Ground>
  )
}
