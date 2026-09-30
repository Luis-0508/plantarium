import type { NumericRange } from '../../data/types'

const START = -120
const SWEEP = 240
const R = 44
const C = 56

function polar(pct: number, r = R) {
  const a = ((START + (SWEEP * pct) / 100) * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}

function arc(from: number, to: number, r = R) {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  const large = ((to - from) / 100) * SWEEP > 180 ? 1 : 0
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/** Radial gauge: tolerated and ideal relative humidity, with a heated-room reference. */
export function HumidityGauge({ ideal, tolerated }: { ideal: NumericRange; tolerated: NumericRange }) {
  const heated = 35
  const [hx1, hy1] = polar(heated, R - 12)
  const [hx2, hy2] = polar(heated, R + 7)
  return (
    <svg
      viewBox="0 0 112 96"
      className="gauge"
      role="img"
      aria-label={`Luftfeuchte ideal ${ideal.min} bis ${ideal.max} Prozent, toleriert ${tolerated.min} bis ${tolerated.max} Prozent`}
    >
      <path d={arc(0, 100)} className="gauge__track" />
      <path d={arc(tolerated.min, tolerated.max)} className="gauge__soft" />
      <path d={arc(ideal.min, ideal.max)} className="gauge__strong" />
      {[0, 25, 50, 75, 100].map((t) => {
        const [a, b] = polar(t, R - 9)
        const [c, d] = polar(t, R - 5)
        return <line key={t} x1={a} y1={b} x2={c} y2={d} className="viz-tick" />
      })}
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} className="viz-marker-line" />
      <text x={C} y={C + 2} textAnchor="middle" className="gauge__value">
        {ideal.min}–{ideal.max}
      </text>
      <text x={C} y={C + 15} textAnchor="middle" className="viz-text">
        % rel. Feuchte
      </text>
      <text x={polar(0, R + 2)[0]} y={92} textAnchor="middle" className="viz-text">0</text>
      <text x={polar(100, R + 2)[0]} y={92} textAnchor="middle" className="viz-text">100</text>
    </svg>
  )
}
