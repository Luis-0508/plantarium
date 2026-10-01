import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import compare from '../../public/captures/compare.json'
import explore from '../../public/captures/explore.json'
import mobile from '../../public/captures/mobile.json'
import roots from '../../public/captures/roots.json'
import sheet from '../../public/captures/sheet.json'
import anatomy from '../../public/captures/anatomy.json'
import vessel from '../../public/captures/vessel.json'
import { C, easeInOut } from '../theme'

interface CursorSample {
  x: number
  y: number
  down: boolean
  click: boolean
}
interface Meta {
  frames: number
  viewport: { width: number; height: number }
  cursor: CursorSample[] | null
}

const META: Record<string, Meta> = { explore, roots, anatomy, sheet, vessel, compare, mobile }
export type ShotName = keyof typeof META

/** Camera move inside the shot: scale about a focal point (viewport CSS px). */
export type Framing = [scale: number, x: number, y: number]

interface Props {
  shot: ShotName
  /** Capture frame shown at the first frame of the sequence. */
  from?: number
  speed?: number
  /** Eased camera move over `frames` frames of the sequence. */
  camera?: { from: Framing; to: Framing; frames: number }
}

/** Plays a captured frame sequence at viewport size, with the recorded cursor redrawn on top. */
export function Capture({ shot, from = 0, speed = 1, camera }: Props) {
  const frame = useCurrentFrame()
  const meta = META[shot]
  const index = Math.max(0, Math.min(meta.frames - 1, Math.round(from + frame * speed)))
  const { width, height } = meta.viewport

  let transform = 'none'
  if (camera) {
    const t = interpolate(frame, [0, camera.frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut })
    const [s, fx, fy] = camera.from.map((v, i) => v + (camera.to[i] - v) * t)
    transform = `translate(${fx * (1 - s)}px, ${fy * (1 - s)}px) scale(${s})`
  }

  return (
    <div style={{ position: 'absolute', inset: 0, width, height, overflow: 'hidden', background: C.paper }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform }}>
        <Img src={staticFile(`captures/${shot}/${String(index).padStart(4, '0')}.jpg`)} style={{ width, height, display: 'block' }} />
        {meta.cursor && <Cursor samples={meta.cursor} index={index} />}
      </div>
    </div>
  )
}

function Cursor({ samples, index }: { samples: CursorSample[]; index: number }) {
  const p = samples[index]
  // Click ripple: find the latest click within the last 14 capture frames.
  let since = -1
  for (let i = index; i >= Math.max(0, index - 14); i--) {
    if (samples[i].click) {
      since = index - i
      break
    }
  }
  const ripple = since >= 0 ? since / 14 : 1
  const press = p.down ? 0.86 : 1
  return (
    <>
      {since >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: p.x - 30,
            top: p.y - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: `2px solid ${C.prussian}`,
            opacity: 0.7 * (1 - ripple),
            transform: `scale(${0.3 + ripple * 0.9})`,
          }}
        />
      )}
      <svg
        width={26}
        height={30}
        viewBox="0 0 26 30"
        style={{ position: 'absolute', left: p.x - 3, top: p.y - 2, transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
      >
        <path d="M3 2 L3 24 L9 18.5 L13 27 L17 25.2 L13 16.8 L21 16.8 Z" fill={C.ink} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </>
  )
}
