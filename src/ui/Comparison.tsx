import type { Plant } from '../data/types'
import { useI18n } from '../i18n/context'
import type { Messages } from '../i18n/messages'
import { PlantGlyph } from './PlantGlyph'
import { niceAxis, validTrait } from './comparison-scale'

interface Trait {
  label: string
  ends: [string, string]
  /** Normalised 0–1 values for each plant: [min, ideal, max]. */
  value: (p: Plant) => [number, number, number]
  describe: (p: Plant) => string
}

const lvl = (v: number, max = 5) => (v - 1) / (max - 1)

function traitsFor(plants: Plant[], t: Messages['compare'], l: ReturnType<typeof useI18n>['l'], growthLevels: string[]): Trait[] {
  const temperature = niceAxis(Math.min(5, ...plants.map((p) => p.care.temperature.minimum)), Math.max(35, ...plants.map((p) => p.care.temperature.maximum)))
  const rootDepth = niceAxis(0, Math.max(1, ...plants.map((p) => p.roots.depthCm))).max
  return [
  {
    label: t.light,
    ends: [t.shade, t.sun],
    value: (p) => [p.care.light.min, p.care.light.ideal, p.care.light.max],
    describe: (p) => l(p.care.lightNote),
  },
  {
    label: t.water,
    ends: [t.dry, t.wet],
    value: (p) => [p.care.water.min, p.care.water.ideal, p.care.water.max],
    describe: (p) => l(p.care.waterNote),
  },
  {
    label: t.humidity,
    ends: ['0 %', '100 %'],
    value: (p) => {
      const h = p.care.humidity.ideal
      return [h.min / 100, (h.min + h.max) / 200, h.max / 100]
    },
    describe: (p) => t.ideal(`${p.care.humidity.ideal.min}–${p.care.humidity.ideal.max}`, '%'),
  },
  {
    label: t.temperature,
    ends: [`${temperature.min} °C`, `${temperature.max} °C`],
    value: (p) => {
      const t = p.care.temperature
      const n = (v: number) => (v - temperature.min) / (temperature.max - temperature.min)
      return [n(t.minimum), n((t.ideal.min + t.ideal.max) / 2), n(t.maximum)]
    },
    describe: (p) => t.temperatureDetail(`${p.care.temperature.ideal.min}–${p.care.temperature.ideal.max}`, p.care.temperature.minimum),
  },
  {
    label: t.growth,
    ends: [t.slow, t.fast],
    value: (p) => {
      const v = lvl(p.care.growth.level, 3)
      return [v, v, v]
    },
    describe: (p) => t.growthDetail(growthLevels[p.care.growth.level - 1], `${p.care.growth.perYearCm.min}–${p.care.growth.perYearCm.max}`),
  },
  {
    label: t.difficulty,
    ends: [t.low, t.high],
    value: (p) => {
      const v = lvl(p.care.difficulty)
      return [v, v, v]
    },
    describe: (p) => l(p.care.difficultyNote),
  },
  {
    label: t.rootDepth,
    ends: ['0 cm', `${rootDepth} cm`],
    value: (p) => {
      const v = p.roots.depthCm / rootDepth
      return [v, v, v]
    },
    describe: (p) => t.rootDetail(l(p.roots.structureLabel), p.roots.depthCm),
  },
  {
    label: t.waterlogging,
    ends: [t.robust, t.sensitive],
    value: (p) => {
      const v = lvl(p.roots.waterloggingSensitivity)
      return [v, v, v]
    },
    describe: (p) => t.sensitivity(p.roots.waterloggingSensitivity),
  },
]
}

/** Standing figure, 100 units tall, feet at y = 100. */
const PERSON =
  'M50 0a7 7 0 1 1 0 14a7 7 0 1 1 0-14zM41 17h18q6 0 7 7l4 27q.5 3-2.5 3.5t-3.5-2.5l-4-24v74q0 3-3.5 3t-3.5-3v-42h-2v42q0 3-3.5 3t-3.5-3v-74l-4 24q-.5 3-3.5 2.5t-2.5-3.5l4-27q1-7 7-7z'


function Lineup({ plants, onOpen }: { plants: Plant[]; onOpen: (id: string) => void }) {
  const { t, l } = useI18n()
  const { max: domain, ticks } = niceAxis(0, Math.max(170, ...plants.map((p) => p.dimensions.maxIndoorHeightCm.max)))
  const H = 280
  const base = H - 30
  const top = 14
  const px = (cm: number) => (cm / domain) * (base - top)
  const y = (cm: number) => base - px(cm)
  const slot = 170
  const W = 60 + slot * (plants.length + 1)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }} className="lineup" role="group" aria-label={t.compare.lineupLabel}>
      {ticks.map((cm) => (
        <g key={cm}>
          <line x1={46} x2={W - 10} y1={y(cm)} y2={y(cm)} className={cm === 0 ? 'viz-axis' : 'viz-grid'} />
          <text x={38} y={y(cm) + 4} textAnchor="end" className="viz-text">
            {cm}
            {cm === domain ? ' cm' : ''}
          </text>
        </g>
      ))}
      <path d={PERSON} className="lineup__person" transform={`translate(${60 + slot * 0.5} ${y(170)}) scale(${px(170) / 101}) translate(-50 0)`} />
      <text x={60 + slot * 0.5} y={base + 18} textAnchor="middle" className="viz-text">
        {t.compare.person}
      </text>
      {plants.map((p, i) => {
        const { min, max } = p.dimensions.maxIndoorHeightCm
        // Glyph: plant top at viewBox y≈0, pot base at y=122, box spans -8…124.
        const unit = px(max) / 122
        const w = unit * 108
        const cx = 60 + slot * (i + 1.5)
        // Bracket beside the plant body, but never into the neighbouring slot.
        const bx = cx + Math.min(w * 0.42 + 8, slot / 2 - 14)
        return (
          <g key={p.id} className="lineup__plant" style={{ color: p.swatch }} role="button" tabIndex={0}
            aria-label={t.compare.openPlant(l(p.commonName), `${min}–${max}`)} onClick={() => onOpen(p.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(p.id) }
            }}>
            <PlantGlyph plant={p} x={cx - w / 2} y={base - unit * 130} width={w} height={unit * 132} />
            <path d={`M${bx - 4} ${y(max)}h4V${y(min)}h-4`} className="lineup__bracket" />
            <text x={bx} y={y(max) - 8} textAnchor="end" className="viz-text viz-text--strong">
              {min}–{max} cm
            </text>
            <text x={cx} y={base + 18} textAnchor="middle" className="viz-text viz-text--strong">
              {l(p.commonName)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Comparison({ plants, onOpen }: { plants: Plant[]; onOpen: (id: string) => void }) {
  const { t: { compare: t, viz }, l } = useI18n()
  const traits = traitsFor(plants, t, l, viz.growthLevels)
  return (
    <main className="compare">
      <header className="compare__head">
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <ul className="legend">
          {plants.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onOpen(p.id)} style={{ color: p.swatch }}>
                <i />
                <span>
                  {l(p.commonName)} <em>{p.botanicalName}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </header>

      <section className="compare__block">
        <h2>{t.size}</h2>
        <p className="lineup-hint">{t.scrollHint}</p>
        <div className="lineup-scroll" tabIndex={0} role="region" aria-label={t.scrollRegion}>
          <Lineup plants={plants} onOpen={onOpen} />
        </div>
      </section>

      <section className="compare__block">
        <h2>{t.requirements}</h2>
        <div className={`traits${plants.length > 3 ? ' traits--many' : ''}`}>
          {traits.map((trait) => (
            <div className="trait" key={trait.label}>
              <h3>{trait.label}</h3>
              <div className="trait__plot">
                {plants.map((p) => {
                  const [min, ideal, max] = trait.value(p)
                  const name = l(p.commonName)
                  if (!validTrait([min, ideal, max])) return <p key={p.id} className="trait__error">{name}: {t.checkData}</p>
                  return (
                    <div key={p.id} className="trait__lane" style={{ color: p.swatch }} title={`${name}: ${trait.describe(p)}`}>
                      {plants.length > 3 && <span className="trait__name" aria-hidden>{name}</span>}
                      <span className="trait__range" style={{ left: `${min * 100}%`, width: `${Math.max(0, max - min) * 100}%` }} />
                      <span className="trait__dot" style={{ left: `${ideal * 100}%` }} />
                      <span className="visually-hidden">
                        {name}: {trait.describe(p)}
                      </span>
                    </div>
                  )
                })}
                <div className="trait__ends" aria-hidden>
                  <span>{trait.ends[0]}</span>
                  <span>{trait.ends[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
