import { interpolate, useCurrentFrame } from 'remotion'
import { BrowserWindow } from '../components/BrowserWindow'
import { Caption } from '../components/Caption'
import { Capture } from '../components/Capture'
import { Ground } from '../components/Ground'
import { ease } from '../theme'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** Capture frame where the plant switch is clicked (see scripts/capture.mjs, shot "explore"). */
const SWITCH = 292

/** The browser window lands, the palm grows, then orbit, zoom and a plant switch. */
export function AppReveal() {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [0, 62], [0, 1], { ...clamp, easing: ease })
  // Slow drift of the whole window; zooming inside would crop the app's edge-aligned UI.
  const drift = interpolate(frame, [62, 360], [1, 1.022], clamp)
  const style: React.CSSProperties = {
    opacity: interpolate(frame, [0, 18], [0, 1], clamp),
    transform: `perspective(2200px) translateY(${(1 - t) * 300}px) rotateX(${(1 - t) * 24}deg) scale(${(0.62 + 0.38 * t) * drift})`,
    transformOrigin: '50% 0%',
  }
  return (
    <Ground>
      <BrowserWindow url={frame < SWITCH ? '#pflanze/goldfruchtpalme' : '#pflanze/bergpalme'} style={style}>
        <Capture shot="explore" />
      </BrowserWindow>
      <Caption index="01" label="ORBIT" text="Every plant is a 3D model you can orbit and inspect." start={84} end={238} />
      <Caption index="02" label="GROW" text="Procedurally generated from botanical parameters and a seed." start={248} end={360} />
    </Ground>
  )
}
