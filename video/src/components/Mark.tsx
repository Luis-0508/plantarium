import { evolvePath } from '@remotion/paths'
import { interpolate } from 'remotion'
import { C, ease } from '../theme'

// Same drawing as public/brand/plantarium-mark.svg (64×64 grid).
const SOIL = 'M13 35.5H51'
const SHOOT = 'M32 35V15'
const LEAVES = [
  'M32 27C25.5 26.5 20.5 22 19.5 14.5C26 14.5 31 18.5 32 24.5Z',
  'M32 22.5C37.5 22 41.5 18.5 42.5 12.5C37 12.5 32.8 15.8 32 20.5Z',
]
const ROOTS = ['M32 36C32.4 41 31.4 46 30.2 52', 'M31.8 38.5C28 40 24.5 42.5 21.5 47', 'M32.2 39.5C36 41 39.5 43.5 42.5 48.5']
const FINE = [
  'M30.8 46C28.6 47.6 27.2 49.6 26.2 52.5',
  'M31.2 45C33.8 46.6 35.4 48.8 36.4 52',
  'M24.6 43.2C22.4 43.6 20.2 44.6 18.2 46.2',
  'M39.6 44.6C42 44.8 44.4 45.6 46.4 47.2',
]

const span = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })

function Stroke({ d, p, width, opacity = 1 }: { d: string; p: number; width: number; opacity?: number }) {
  if (p <= 0) return null
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d)
  return <path d={d} strokeWidth={width} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} opacity={opacity} />
}

/**
 * The Plantarium mark drawing itself: soil line, shoot, leaves, then the root
 * system growing downwards. `frame` is relative to the start of the drawing.
 */
export function Mark({ frame, size, tile = false, speed = 1 }: { frame: number; size: number; tile?: boolean; speed?: number }) {
  const f = frame * speed
  const leaf = span(f, 26, 46)
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: 'visible' }}>
      {tile && <rect width="64" height="64" rx="13" fill="#173a66" opacity={span(f, 0, 14)} />}
      <g fill="none" stroke={C.rootWhite} strokeLinecap="round" strokeLinejoin="round">
        <Stroke d={SOIL} p={span(f, 0, 22)} width={2.2} />
        <Stroke d={SHOOT} p={span(f, 12, 34)} width={2.6} />
        {LEAVES.map((d, i) => (
          <g key={d}>
            <Stroke d={d} p={span(f, 26 + i * 6, 46 + i * 6)} width={1.6} />
            <path d={d} fill={C.rootWhite} stroke="none" opacity={span(f, 40 + i * 6, 56 + i * 6) * leaf} />
          </g>
        ))}
        {ROOTS.map((d, i) => (
          <Stroke key={d} d={d} p={span(f, 30 + i * 5, 62 + i * 5)} width={1.7} />
        ))}
        {FINE.map((d, i) => (
          <Stroke key={d} d={d} p={span(f, 50 + i * 4, 76 + i * 4)} width={1.2} opacity={0.8} />
        ))}
      </g>
    </svg>
  )
}
