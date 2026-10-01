import type { ReactNode } from 'react'
import type { NumericRange, Span } from '../../data/types'
import { useI18n } from '../../i18n/context'

const W = 320
const PAD = 10
const x = (v: number) => PAD + v * (W - PAD * 2)

/**
 * Qualitative scale with a tolerated band and an ideal marker, e.g.
 * shade ─────●───── sun.
 */
export function SpanScale({ span, stops, label }: { span: Span; stops: string[]; label: string }) {
  const segments = stops.length
  return (
    <div className="scale">
      <svg viewBox={`0 0 ${W} 28`} className="scale__svg" role="img" aria-label={label}>
        <line x1={PAD} x2={W - PAD} y1={14} y2={14} className="viz-axis" />
        {Array.from({ length: segments + 1 }, (_, i) => (
          <line key={i} x1={x(i / segments)} x2={x(i / segments)} y1={9} y2={19} className="viz-tick" />
        ))}
        <rect x={x(span.min)} y={9} width={x(span.max) - x(span.min)} height={10} rx={5} className="viz-band" />
        <circle cx={x(span.ideal)} cy={14} r={7.5} className="viz-marker" />
        <circle cx={x(span.ideal)} cy={14} r={2.6} className="viz-marker-core" />
      </svg>
      <div className="scale__stops" style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }}>
        {stops.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  )
}

/** Numeric range on a fixed axis: tolerated span, ideal span, ticks. */
export function RangeAxis({
  ideal,
  tolerated,
  domain,
  step,
  unit,
  label,
  markers = [],
}: {
  ideal: NumericRange
  tolerated: NumericRange
  domain: [number, number]
  step: number
  unit: string
  label: string
  markers?: { at: number; text: string }[]
}) {
  const sx = (v: number) => x((v - domain[0]) / (domain[1] - domain[0]))
  const ticks: number[] = []
  for (let v = domain[0]; v <= domain[1]; v += step) ticks.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${markers.length ? 58 : 44}`} className="scale__svg" role="img" aria-label={label}>
      <rect x={sx(tolerated.min)} y={10} width={sx(tolerated.max) - sx(tolerated.min)} height={12} className="viz-band viz-band--soft" />
      <rect x={sx(ideal.min)} y={10} width={sx(ideal.max) - sx(ideal.min)} height={12} className="viz-band viz-band--strong" />
      <line x1={PAD} x2={W - PAD} y1={22} y2={22} className="viz-axis" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={22} y2={26} className="viz-tick" />
          <text x={sx(t)} y={38} className="viz-text" textAnchor="middle">
            {t}
            {t === domain[1] ? unit : ''}
          </text>
        </g>
      ))}
      {markers.map((m) => (
        <g key={m.text}>
          <line x1={sx(m.at)} x2={sx(m.at)} y1={4} y2={26} className="viz-marker-line" />
          <text x={sx(m.at)} y={54} className="viz-text viz-text--note" textAnchor="middle">
            {m.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Discrete meter made of repeated glyphs, e.g. five leaves for difficulty. */
export function PipMeter({ value, max = 5, label, render }: { value: number; max?: number; label: string; render: (on: boolean, i: number) => ReactNode }) {
  const { viz } = useI18n().t
  return (
    <span className="pips" role="img" aria-label={viz.of(label, value, max)}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'pip is-on' : 'pip'}>
          {render(i < value, i)}
        </span>
      ))}
    </span>
  )
}

/** Five-step bar meter for root density or sensitivity. */
export function StepMeter({ value, label, low, high }: { value: number; label: string; low: string; high: string }) {
  const { viz } = useI18n().t
  return (
    <div className="step-meter">
      <div className="step-meter__bars" role="img" aria-label={viz.of(label, value, 5)}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < value ? 'is-on' : ''} style={{ height: `${40 + i * 15}%` }} />
        ))}
      </div>
      <div className="step-meter__ends">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}
