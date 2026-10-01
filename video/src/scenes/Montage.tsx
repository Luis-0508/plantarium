import { Sequence, interpolate, useCurrentFrame } from 'remotion'
import { BrowserWindow } from '../components/BrowserWindow'
import { Caption } from '../components/Caption'
import { Capture } from '../components/Capture'
import { Ground } from '../components/Ground'
import { C, F, ease } from '../theme'

export const SHOT = 38
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** Short settle on every cut: fade up and a slight scale down. */
function Cut({ children }: { children: React.ReactNode }) {
  const f = useCurrentFrame()
  const t = interpolate(f, [0, 7], [0, 1], { ...clamp, easing: ease })
  return <div style={{ position: 'absolute', inset: 0, opacity: t, transform: `scale(${1.025 - 0.025 * t})` }}>{children}</div>
}

function Phone() {
  const f = useCurrentFrame()
  const W = 390
  const H = 844
  const lift = interpolate(f, [0, SHOT], [16, -8])
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 - W / 2 - 14,
        top: 70 + lift,
        width: W + 28,
        height: H + 28,
        padding: 14,
        boxSizing: 'border-box',
        borderRadius: 58,
        background: '#050d18',
        boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(241,238,221,0.18)',
      }}
    >
      <div style={{ position: 'relative', width: W, height: H, borderRadius: 44, overflow: 'hidden' }}>
        <Capture shot="mobile" from={6} />
      </div>
    </div>
  )
}

function Spec({ lines }: { lines: string[] }) {
  const f = useCurrentFrame()
  const t = interpolate(f, [4, 18], [0, 1], { ...clamp, easing: ease })
  return (
    <div style={{ position: 'absolute', left: 300, top: 420, fontFamily: F.mono, fontSize: 18, lineHeight: 2, letterSpacing: 2, color: C.tint, opacity: 0.7 * t }}>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  )
}

/** Fast cuts through the rest of the app: sheet, vessel toggles, comparison, phone layout. */
export function Montage() {
  return (
    <Ground>
      <Sequence durationInFrames={SHOT} layout="none">
        <Cut>
          <BrowserWindow url="#pflanze/goldfruchtpalme">
            <Capture shot="sheet" from={8} speed={1.7} camera={{ from: [1.42, 1600, 420], to: [1.52, 1600, 420], frames: SHOT }} />
          </BrowserWindow>
        </Cut>
        <Caption index="06" label="SHEET" text="Care requirements as small, purpose-built graphics." start={0} end={SHOT + 1} />
      </Sequence>
      <Sequence from={SHOT} durationInFrames={SHOT} layout="none">
        <Cut>
          <BrowserWindow url="#pflanze/gruenlilie">
            <Capture shot="vessel" from={12} speed={2} camera={{ from: [1.34, 620, 640], to: [1.44, 620, 640], frames: SHOT }} />
          </BrowserWindow>
        </Cut>
        <Caption index="07" label="VESSEL" text="Pot and soil turn transparent to show what is inside." start={0} end={SHOT + 1} />
      </Sequence>
      <Sequence from={SHOT * 2} durationInFrames={SHOT} layout="none">
        <Cut>
          <BrowserWindow url="#vergleich">
            <Capture shot="compare" from={0} speed={1.8} camera={{ from: [1, 800, 900], to: [1.08, 800, 900], frames: SHOT }} />
          </BrowserWindow>
        </Cut>
        <Caption index="08" label="COMPARE" text="All plants side by side, to scale." start={0} end={SHOT + 1} />
      </Sequence>
      <Sequence from={SHOT * 3} layout="none">
        <Cut>
          <Phone />
          <Spec lines={['390 × 844', 'STACKED LAYOUT', '< 900 PX']} />
        </Cut>
        <Caption index="09" label="MOBILE" text="The stage and sheet stack on phones and tablets." start={0} end={SHOT + 30} />
      </Sequence>
    </Ground>
  )
}
