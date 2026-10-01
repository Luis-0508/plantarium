import { Sequence, interpolate, useCurrentFrame } from 'remotion'
import { BrowserWindow } from '../components/BrowserWindow'
import { Caption } from '../components/Caption'
import { Capture } from '../components/Capture'
import { Ground } from '../components/Ground'
import { easeInOut } from '../theme'

export const ROOTS_LEN = 125
const WIPE = 16

/** Roots view on the parlor palm, then a wipe into the spider plant's anatomy view. */
export function RootsAnatomy() {
  const frame = useCurrentFrame()
  const wipe = interpolate(frame, [ROOTS_LEN - WIPE, ROOTS_LEN], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  })
  const drift = interpolate(frame, [0, 250], [1, 1.022])
  return (
    <Ground>
      <BrowserWindow
        url={frame < ROOTS_LEN - WIPE / 2 ? '#pflanze/bergpalme' : '#pflanze/gruenlilie'}
        style={{ transform: `scale(${drift})`, transformOrigin: '50% 0%' }}
      >
        <Sequence durationInFrames={ROOTS_LEN} layout="none">
          <Capture shot="roots" from={8} />
        </Sequence>
        <Sequence from={ROOTS_LEN - WIPE} layout="none">
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${wipe}%)` }}>
            <Capture shot="anatomy" from={40 - WIPE} />
          </div>
        </Sequence>
      </BrowserWindow>
      <Caption index="03" label="ROOTS" text="Roots grow as constrained random walks inside the pot." start={6} end={ROOTS_LEN - 4} />
      <Caption index="04" label="ANATOMY" text="Pick leaves, stems, crown and roots on the model itself." start={ROOTS_LEN + 4} end={260} />
    </Ground>
  )
}
