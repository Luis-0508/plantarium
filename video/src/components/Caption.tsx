import { interpolate, useCurrentFrame } from 'remotion'
import { C, F, WINDOW, ease } from '../theme'

/** Lower-third under the browser window: mono index + one sentence. Times in scene frames. */
export function Caption({ index, label, text, start, end }: { index: string; label: string; text: string; start: number; end: number }) {
  const frame = useCurrentFrame()
  const inT = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const outT = interpolate(frame, [end - 12, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  if (frame < start || frame > end) return null
  const top = WINDOW.y + WINDOW.bar + WINDOW.h + 36
  return (
    <div style={{ position: 'absolute', left: WINDOW.x + 4, top, display: 'flex', alignItems: 'baseline', gap: 28, opacity: inT * outT }}>
      <span style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: 2.5, color: C.moss, transform: `translateY(${(1 - inT) * 10}px)`, whiteSpace: 'nowrap' }}>
        {index} / {label}
      </span>
      <span
        style={{
          fontFamily: F.serif,
          fontSize: 34,
          color: C.rootWhite,
          letterSpacing: -0.2,
          transform: `translateY(${(1 - inT) * 14}px)`,
          clipPath: `inset(0 ${(1 - inT) * 100}% 0 0)`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  )
}
