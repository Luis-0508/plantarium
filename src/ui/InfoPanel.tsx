import { useEffect, useRef, type ReactNode } from 'react'
import type { Plant } from '../data/types'
import { useI18n } from '../i18n/context'
import type { ViewMode } from '../viewTypes'
import { CatIcon, CheckIcon, DogIcon, DropIcon, LeafIcon, PersonIcon, ShadeIcon, SunIcon, WarnIcon } from './icons'
import { CareCalendar } from './viz/CareCalendar'
import { GrowthScale, HeightDiagram } from './viz/GrowthViz'
import { HumidityGauge } from './viz/HumidityGauge'
import { RootDiagram } from './viz/RootDiagram'
import { PipMeter, RangeAxis, SpanScale, StepMeter } from './viz/Scales'
import { SoilMix } from './viz/SoilMix'

const range = (min: number, max: number, unit = '') => (min === max ? `${min}${unit}` : `${min}–${max}${unit}`)

function Row({ title, value, children, note }: { title: string; value?: string; children: ReactNode; note?: string }) {
  return (
    <div className="row">
      <div className="row__head">
        <h4>{title}</h4>
        {value && <span className="row__value">{value}</span>}
      </div>
      {children}
      {note && <p className="row__note">{note}</p>}
    </div>
  )
}

/** Right-hand specimen sheet: care, growth and root data as small graphics. */
export function InfoPanel({ plant, mode, reducedMotion = false }: { plant: Plant; mode: ViewMode; reducedMotion?: boolean }) {
  const { care, dimensions, roots } = plant
  const rootsRef = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const { t, l } = useI18n()
  const p = t.panel

  // Only scroll the panel's own column (desktop). On narrow layouts the page
  // itself scrolls, and moving it would take the 3D stage out of view.
  useEffect(() => {
    const el = scroller.current
    if (!el || el.scrollHeight <= el.clientHeight) return
    el.scrollTo({ top: mode === 'roots' ? (rootsRef.current?.offsetTop ?? 0) : 0, behavior: reducedMotion ? 'instant' : 'smooth' })
  }, [mode, plant.id, reducedMotion])

  const waterDrops = Math.round(care.water.ideal * 5 * 2) / 2
  const safe = !care.toxicity.cats && !care.toxicity.dogs && !care.toxicity.humans

  return (
    <aside className="panel" aria-label={p.label(l(plant.commonName))}>
      <div className="panel__scroll" ref={scroller} key={plant.id}>
        <section className="sheet sheet--intro">
          <p className="intro__summary">{l(plant.summary)}</p>
          <dl className="facts">
            <div>
              <dt>{p.maxHeight}</dt>
              <dd className="num">{range(dimensions.maxIndoorHeightCm.min, dimensions.maxIndoorHeightCm.max, ' cm')}</dd>
            </div>
            <div>
              <dt>{p.difficulty}</dt>
              <dd>
                <PipMeter value={care.difficulty} label={p.difficulty} render={(on) => <LeafIcon size={15} filled={on} />} />
              </dd>
            </div>
            <div>
              <dt>{p.pets}</dt>
              <dd className={safe ? 'tox tox--safe' : 'tox tox--warn'}>
                {safe ? <CheckIcon size={15} /> : <WarnIcon size={15} />}
                {safe ? p.nonToxic : p.toxic}
              </dd>
            </div>
          </dl>
          <dl className="meta">
            <div><dt>{p.family}</dt><dd>{l(plant.family)}</dd></div>
            <div><dt>{p.origin}</dt><dd>{l(plant.origin)}</dd></div>
          </dl>
        </section>

        <section className="sheet">
          <h3>{p.placement}</h3>
          <Row title={p.light} note={l(care.lightNote)}>
            <div className="scale-with-icons">
              <ShadeIcon size={18} />
              <SpanScale span={care.light} stops={p.lightStops} label={p.lightLabel} />
              <SunIcon size={18} />
            </div>
          </Row>
          <Row title={p.temperature} value={`${range(care.temperature.ideal.min, care.temperature.ideal.max)} °C`}>
            <RangeAxis
              ideal={care.temperature.ideal}
              tolerated={{ min: care.temperature.minimum, max: care.temperature.maximum }}
              domain={[5, 35]}
              step={5}
              unit=" °C"
              label={p.temperatureLabel(care.temperature.ideal.min, care.temperature.ideal.max, care.temperature.minimum)}
              markers={[{ at: care.temperature.minimum, text: p.minimum(care.temperature.minimum) }]}
            />
          </Row>
          <Row title={p.humidity} note={p.humidityNote(range(care.humidity.tolerated.min, care.humidity.tolerated.max, ' %'))}>
            <HumidityGauge ideal={care.humidity.ideal} tolerated={care.humidity.tolerated} />
          </Row>
        </section>

        <section className="sheet">
          <h3>{p.care}</h3>
          <Row title={p.water} note={l(care.waterNote)}>
            <div className="drops" role="img" aria-label={p.waterLabel(waterDrops)}>
              {Array.from({ length: 5 }, (_, i) => (
                <DropIcon key={i} size={24} level={Math.max(0, Math.min(1, waterDrops - i))} />
              ))}
              <span className="drops__ends">
                <span>{p.dry}</span>
                <span>{p.wet}</span>
              </span>
            </div>
          </Row>
          <Row title={p.feeding} value={l(care.fertilizing.interval)} note={`${l(care.fertilizing.note)} ${p.repotNote(l(care.repotting.interval), l(care.repotting.note))}`}>
            <CareCalendar plan={care.schedule} />
          </Row>
          <Row title={p.substrate} value={l(care.soil.description)}>
            <SoilMix mix={care.soil.mix} ph={care.soil.ph} />
          </Row>
        </section>

        <section className="sheet">
          <h3>{p.habit}</h3>
          <div className="split">
            <Row title={p.growth} value={p.perYear(range(care.growth.perYearCm.min, care.growth.perYearCm.max))}>
              <GrowthScale level={care.growth.level} />
            </Row>
            <Row title={p.size} value={p.upTo(dimensions.maxIndoorHeightCm.max)}>
              <HeightDiagram plant={plant} />
            </Row>
          </div>
          <Row title={p.toxicity} note={l(care.toxicity.note)}>
            <ul className="tox-list">
              {(
                [
                  [p.cats, care.toxicity.cats, CatIcon],
                  [p.dogs, care.toxicity.dogs, DogIcon],
                  [p.humans, care.toxicity.humans, PersonIcon],
                ] as const
              ).map(([label, toxic, Icon]) => (
                <li key={label} className={toxic ? 'is-toxic' : 'is-safe'}>
                  <Icon size={22} />
                  <span>{label}</span>
                  <small>{toxic ? p.toxic : p.nonToxic}</small>
                </li>
              ))}
            </ul>
          </Row>
          <Row title={p.difficulty} note={l(care.difficultyNote)}>
            <PipMeter value={care.difficulty} label={p.difficulty} render={(on) => <LeafIcon size={20} filled={on} />} />
          </Row>
        </section>

        <section className={`sheet sheet--roots${mode === 'roots' ? ' is-focus' : ''}`} ref={rootsRef}>
          <h3>{p.roots}</h3>
          <p className="roots__type">{l(roots.structureLabel)}</p>
          <RootDiagram roots={roots} />
          <p className="row__note">{l(roots.structureNote)}</p>
          <div className="split">
            <Row title={p.density}>
              <StepMeter value={roots.density} label={p.densityLabel} low={p.loose} high={p.dense} />
            </Row>
            <Row title={p.waterlogging}>
              <StepMeter value={roots.waterloggingSensitivity} label={p.waterloggingLabel} low={p.robust} high={p.sensitive} />
            </Row>
          </div>
          <dl className="meta meta--roots">
            <div><dt>{p.rootDepth}</dt><dd className="num">{p.approx(roots.depthCm)}</dd></div>
            <div><dt>{p.spread}</dt><dd className="num">{p.diameterApprox(roots.spreadCm * 2)}</dd></div>
            <div><dt>{p.potDepth}</dt><dd className="num">{range(roots.recommendedPotDepthCm.min, roots.recommendedPotDepthCm.max, ' cm')}</dd></div>
          </dl>
        </section>

        {plant.dataQuality === 'placeholder' && (
          <p className="panel__note">{p.placeholder}</p>
        )}
      </div>
    </aside>
  )
}
