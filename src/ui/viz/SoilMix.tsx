import type { NumericRange, SoilComponent } from '../../data/types'

const TONES = ['var(--soil-1)', 'var(--soil-2)', 'var(--soil-3)', 'var(--soil-4)']

/** Proportional bar of substrate components plus a small pH scale. */
export function SoilMix({ mix, ph }: { mix: SoilComponent[]; ph: NumericRange }) {
  const px = (v: number) => ((v - 4) / 5) * 100
  return (
    <div className="soil">
      <div className="soil__bar" role="img" aria-label={mix.map((c) => `${Math.round(c.share * 100)} % ${c.name}`).join(', ')}>
        {mix.map((c, i) => (
          <span key={c.name} style={{ flexGrow: c.share, background: TONES[i % TONES.length] }} />
        ))}
      </div>
      <ul className="soil__legend">
        {mix.map((c, i) => (
          <li key={c.name}>
            <i style={{ background: TONES[i % TONES.length] }} />
            <span className="num">{Math.round(c.share * 100)} %</span> {c.name}
          </li>
        ))}
      </ul>
      <div className="ph" aria-label={`pH-Wert ${ph.min} bis ${ph.max}`} role="img">
        <span className="ph__label">pH</span>
        <div className="ph__track">
          <span className="ph__range" style={{ left: `${px(ph.min)}%`, width: `${px(ph.max) - px(ph.min)}%` }} />
          <span className="ph__neutral" style={{ left: `${px(7)}%` }} />
        </div>
        <span className="ph__value num">
          {ph.min.toFixed(1).replace('.', ',')}–{ph.max.toFixed(1).replace('.', ',')}
        </span>
      </div>
    </div>
  )
}
