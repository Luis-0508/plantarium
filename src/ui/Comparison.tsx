import type { Plant } from '../data/types'
import { PlantGlyph } from './PlantGlyph'

interface Trait {
  label: string
  ends: [string, string]
  /** Normalised 0–1 values for each plant: [min, ideal, max]. */
  value: (p: Plant) => [number, number, number]
  describe: (p: Plant) => string
}

const lvl = (v: number, max = 5) => (v - 1) / (max - 1)

const TRAITS: Trait[] = [
  {
    label: 'Licht',
    ends: ['Schatten', 'Sonne'],
    value: (p) => [p.care.light.min, p.care.light.ideal, p.care.light.max],
    describe: (p) => p.care.lightNote,
  },
  {
    label: 'Wasser',
    ends: ['trocken', 'nass'],
    value: (p) => [p.care.water.min, p.care.water.ideal, p.care.water.max],
    describe: (p) => p.care.waterNote,
  },
  {
    label: 'Luftfeuchte',
    ends: ['0 %', '100 %'],
    value: (p) => {
      const h = p.care.humidity.ideal
      return [h.min / 100, (h.min + h.max) / 200, h.max / 100]
    },
    describe: (p) => `ideal ${p.care.humidity.ideal.min}–${p.care.humidity.ideal.max} %`,
  },
  {
    label: 'Temperatur',
    ends: ['5 °C', '35 °C'],
    value: (p) => {
      const t = p.care.temperature
      const n = (v: number) => (v - 5) / 30
      return [n(t.minimum), n((t.ideal.min + t.ideal.max) / 2), n(t.maximum)]
    },
    describe: (p) => `ideal ${p.care.temperature.ideal.min}–${p.care.temperature.ideal.max} °C, min. ${p.care.temperature.minimum} °C`,
  },
  {
    label: 'Wachstum',
    ends: ['langsam', 'schnell'],
    value: (p) => {
      const v = lvl(p.care.growth.level, 3)
      return [v, v, v]
    },
    describe: (p) => `${p.care.growth.label}, ${p.care.growth.perYearCm.min}–${p.care.growth.perYearCm.max} cm pro Jahr`,
  },
  {
    label: 'Pflegeaufwand',
    ends: ['gering', 'hoch'],
    value: (p) => {
      const v = lvl(p.care.difficulty)
      return [v, v, v]
    },
    describe: (p) => p.care.difficultyNote,
  },
  {
    label: 'Wurzeltiefe',
    ends: ['0 cm', '40 cm'],
    value: (p) => {
      const v = p.roots.depthCm / 40
      return [v, v, v]
    },
    describe: (p) => `${p.roots.structureLabel}, ca. ${p.roots.depthCm} cm tief`,
  },
  {
    label: 'Staunässe',
    ends: ['robust', 'empfindlich'],
    value: (p) => {
      const v = lvl(p.roots.waterloggingSensitivity)
      return [v, v, v]
    },
    describe: (p) => `Empfindlichkeit ${p.roots.waterloggingSensitivity} von 5`,
  },
]

/** Standing figure, 100 units tall, feet at y = 100. */
const PERSON =
  'M50 0a7 7 0 1 1 0 14a7 7 0 1 1 0-14zM41 17h18q6 0 7 7l4 27q.5 3-2.5 3.5t-3.5-2.5l-4-24v74q0 3-3.5 3t-3.5-3v-42h-2v42q0 3-3.5 3t-3.5-3v-74l-4 24q-.5 3-3.5 2.5t-2.5-3.5l4-27q1-7 7-7z'

const COUNT_WORDS: Record<number, string> = { 2: 'Zwei', 3: 'Drei', 4: 'Vier', 5: 'Fünf', 6: 'Sechs', 7: 'Sieben', 8: 'Acht', 9: 'Neun', 10: 'Zehn' }

function Lineup({ plants, onOpen }: { plants: Plant[]; onOpen: (id: string) => void }) {
  // Axis reaches the tallest plant, rounded up to the next 50 cm gridline.
  const domain = Math.ceil(Math.max(170, ...plants.map((p) => p.dimensions.maxIndoorHeightCm.max)) / 50) * 50
  const H = 280
  const base = H - 30
  const top = 14
  const px = (cm: number) => (cm / domain) * (base - top)
  const y = (cm: number) => base - px(cm)
  const slot = 170
  const W = 60 + slot * (plants.length + 1)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lineup" role="img" aria-label="Maximale Höhe im Raum, maßstäblich neben einer 170 cm großen Person">
      {Array.from({ length: domain / 50 + 1 }, (_, k) => k * 50).map((cm) => (
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
        Person, 170 cm
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
          <g key={p.id} className="lineup__plant" style={{ color: p.swatch }} onClick={() => onOpen(p.id)}>
            <PlantGlyph plant={p} x={cx - w / 2} y={base - unit * 130} width={w} height={unit * 132} />
            <path d={`M${bx - 4} ${y(max)}h4V${y(min)}h-4`} className="lineup__bracket" />
            <text x={bx} y={y(max) - 8} textAnchor="end" className="viz-text viz-text--strong">
              {min}–{max} cm
            </text>
            <text x={cx} y={base + 18} textAnchor="middle" className="viz-text viz-text--strong">
              {p.commonName}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Comparison({ plants, onOpen }: { plants: Plant[]; onOpen: (id: string) => void }) {
  return (
    <main className="compare">
      <header className="compare__head">
        <h1>{COUNT_WORDS[plants.length] ?? plants.length} Arten im Vergleich</h1>
        <p>
          Balken zeigen, was eine Pflanze toleriert, der Punkt ihren Idealwert. Ein Klick auf einen Namen öffnet die Pflanze im 3D-Modell.
        </p>
        <ul className="legend">
          {plants.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onOpen(p.id)} style={{ color: p.swatch }}>
                <i />
                <span>
                  {p.commonName} <em>{p.botanicalName}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </header>

      <section className="compare__block">
        <h2>Größe im Raum</h2>
        <Lineup plants={plants} onOpen={onOpen} />
      </section>

      <section className="compare__block">
        <h2>Ansprüche</h2>
        <div className="traits">
          {TRAITS.map((t) => (
            <div className="trait" key={t.label}>
              <h3>{t.label}</h3>
              <div className="trait__plot">
                {plants.map((p) => {
                  const [min, ideal, max] = t.value(p)
                  return (
                    <div key={p.id} className="trait__lane" style={{ color: p.swatch }} title={`${p.commonName}: ${t.describe(p)}`}>
                      <span className="trait__range" style={{ left: `${min * 100}%`, width: `${Math.max(0, max - min) * 100}%` }} />
                      <span className="trait__dot" style={{ left: `${ideal * 100}%` }} />
                      <span className="visually-hidden">
                        {p.commonName}: {t.describe(p)}
                      </span>
                    </div>
                  )
                })}
                <div className="trait__ends" aria-hidden>
                  <span>{t.ends[0]}</span>
                  <span>{t.ends[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
