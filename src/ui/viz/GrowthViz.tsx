import type { Plant } from '../../data/types'
import { PlantGlyph } from '../PlantGlyph'

const LABELS = ['Langsam', 'Mittel', 'Schnell']

/** Three sprouts of increasing vigour; the plant's growth rate is inked in. */
export function GrowthScale({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="growth" role="img" aria-label={`Wachstum: ${LABELS[level - 1]}`}>
      {LABELS.map((label, i) => {
        const h = 14 + i * 9
        const on = i + 1 === level
        return (
          <div key={label} className={on ? 'growth__step is-on' : 'growth__step'}>
            <svg viewBox="0 0 40 44" aria-hidden>
              <path d={`M20 42V${42 - h}`} />
              <path d={`M20 ${42 - h * 0.45}c-5-1-9-4-10-${6 + i * 2}c5 0 9 3 10 ${6 + i * 2}`} />
              <path d={`M20 ${42 - h * 0.7}c5-1 9-4 10-${6 + i * 2}c-5 0-9 3-10 ${6 + i * 2}`} />
              {i === 2 && <path d={`M20 ${42 - h}c-3-2-5-5-5-8c3 1 5 4 5 8`} />}
            </svg>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Plant at its maximum indoor height next to a 170 cm person, to scale. */
export function HeightDiagram({ plant }: { plant: Plant }) {
  const max = plant.dimensions.maxIndoorHeightCm.max
  const domain = Math.max(200, Math.ceil(max / 50) * 50)
  const H = 120
  const y = (cm: number) => H - (cm / domain) * (H - 8)
  // Glyph viewBox is 132 tall with the plant body spanning ~108 units incl. pot.
  const glyphH = (max / domain) * (H - 8) * (132 / 120)
  return (
    <svg viewBox={`0 0 150 ${H + 4}`} className="height-diagram" role="img" aria-label={`Maximale Höhe im Raum ${max} cm, im Vergleich zu einer 170 cm großen Person`}>
      {Array.from({ length: domain / 50 + 1 }, (_, i) => i * 50).map((cm) => (
        <g key={cm}>
          <line x1={34} x2={146} y1={y(cm)} y2={y(cm)} className={cm === 0 ? 'viz-axis' : 'viz-grid'} />
          <text x={28} y={y(cm) + 3.5} textAnchor="end" className="viz-text">
            {cm}
          </text>
        </g>
      ))}
      <g className="height-diagram__person" transform={`translate(52 ${y(170)})`}>
        <circle cx={9} cy={8} r={7} />
        <path d={`M9 16v${(170 / domain) * (H - 8) - 16 - 8}M-1 30l10-8 10 8`} />
        <path d={`M3 ${(170 / domain) * (H - 8) - 2}l6-26 6 26`} />
      </g>
      <PlantGlyph plant={plant} className="height-diagram__plant" x={80} y={H - glyphH} width={glyphH * (108 / 132)} height={glyphH} />
    </svg>
  )
}
