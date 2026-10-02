import type { RootProfile } from '../../data/types'
import { useI18n } from '../../i18n/context'
import { rootDiagramLayout } from './chart-layout'

/**
 * Cross-section to scale: recommended pot depth, rooting depth and lateral
 * spread. Large profiles use a smaller uniform scale to keep guides in view.
 */
export function RootDiagram({ roots }: { roots: RootProfile }) {
  const { scale: S, topHalf, bottom, depthY, height } = rootDiagramLayout(roots)
  const { viz } = useI18n().t
  const potTop = 18
  const cx = 100
  const bottomHalf = topHalf * 0.8
  const soil = potTop + 4
  const minY = potTop + roots.recommendedPotDepthCm.min * S
  const pot = `M${cx - topHalf * S} ${potTop}L${cx - bottomHalf * S} ${bottom}H${cx + bottomHalf * S}L${cx + topHalf * S} ${potTop}`
  const width = 200

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="root-diagram" role="img" aria-label={viz.rootLabel(roots.depthCm, roots.spreadCm, roots.recommendedPotDepthCm.min, roots.recommendedPotDepthCm.max)}>
      <defs>
        <pattern id="root-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="5" className="root-diagram__hatch" />
        </pattern>
        <clipPath id="root-pot">
          <path d={`${pot}Z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#root-pot)">
        <rect x={0} y={soil} width={width} height={bottom - soil} className="root-diagram__soil" />
        <ellipse cx={cx} cy={soil} rx={roots.spreadCm * S} ry={(depthY - soil) * 1} className="root-diagram__zone" />
      </g>
      <path d={pot} className="root-diagram__pot" />
      <line x1={cx - topHalf * S - 6} x2={cx + topHalf * S + 6} y1={soil} y2={soil} className="viz-axis" />

      {/* rooting depth */}
      <line x1={cx - roots.spreadCm * S} x2={cx + roots.spreadCm * S} y1={depthY} y2={depthY} className="root-diagram__depth" />
      <text x={cx} y={depthY - 5} textAnchor="middle" className="viz-text viz-text--strong viz-text--halo">
        {viz.rootDepth(roots.depthCm)}
      </text>

      {/* spread */}
      <line x1={cx - roots.spreadCm * S} x2={cx + roots.spreadCm * S} y1={height - 10} y2={height - 10} className="viz-axis" />
      <line x1={cx - roots.spreadCm * S} x2={cx - roots.spreadCm * S} y1={height - 14} y2={height - 6} className="viz-axis" />
      <line x1={cx + roots.spreadCm * S} x2={cx + roots.spreadCm * S} y1={height - 14} y2={height - 6} className="viz-axis" />
      <text x={cx} y={height - 14} textAnchor="middle" className="viz-text">
        Ø {roots.spreadCm * 2} cm
      </text>

      {/* recommended pot depth bracket */}
      <path d={`M${width - 12} ${potTop}h4V${bottom}h-4`} className="viz-axis" />
      <line x1={width - 16} x2={width - 4} y1={minY} y2={minY} className="viz-tick" />
      <text x={width - 14} y={potTop - 6} textAnchor="end" className="viz-text">
        {viz.pot(roots.recommendedPotDepthCm.min, roots.recommendedPotDepthCm.max)}
      </text>
    </svg>
  )
}
