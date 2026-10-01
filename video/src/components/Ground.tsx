import { AbsoluteFill } from 'remotion'
import { C } from '../theme'

/** Cyanotype ground: deep Prussian blue, the app's fine vertical lines, grain and vignette. */
export function Ground({ children }: { children?: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 42%, #133763 0%, ${C.deep} 45%, ${C.night} 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(241,238,221,0.035) 0 1px, transparent 1px 4px)',
        }}
      />
      <AbsoluteFill style={{ opacity: 0.11, mixBlendMode: 'overlay' }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {children}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(4,10,20,0.55) 100%)' }} />
    </AbsoluteFill>
  )
}
