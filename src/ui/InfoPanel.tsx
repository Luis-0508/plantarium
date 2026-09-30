import { useEffect, useRef, type ReactNode } from 'react'
import type { Plant } from '../data/types'
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
export function InfoPanel({ plant, mode }: { plant: Plant; mode: ViewMode }) {
  const { care, dimensions, roots } = plant
  const rootsRef = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode === 'roots') rootsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [mode, plant.id])

  const waterDrops = Math.round(care.water.ideal * 5 * 2) / 2
  const safe = !care.toxicity.cats && !care.toxicity.dogs && !care.toxicity.humans

  return (
    <aside className="panel" aria-label={`Steckbrief ${plant.commonName}`}>
      <div className="panel__scroll" ref={scroller} key={plant.id}>
        <section className="sheet sheet--intro">
          <p className="intro__summary">{plant.summary}</p>
          <dl className="facts">
            <div>
              <dt>Max. Höhe im Raum</dt>
              <dd className="num">{range(dimensions.maxIndoorHeightCm.min, dimensions.maxIndoorHeightCm.max, ' cm')}</dd>
            </div>
            <div>
              <dt>Pflegeaufwand</dt>
              <dd>
                <PipMeter value={care.difficulty} label="Pflegeaufwand" render={(on) => <LeafIcon size={15} filled={on} />} />
              </dd>
            </div>
            <div>
              <dt>Haustiere</dt>
              <dd className={safe ? 'tox tox--safe' : 'tox tox--warn'}>
                {safe ? <CheckIcon size={15} /> : <WarnIcon size={15} />}
                {safe ? 'ungiftig' : 'giftig'}
              </dd>
            </div>
          </dl>
          <dl className="meta">
            <div><dt>Familie</dt><dd>{plant.family}</dd></div>
            <div><dt>Herkunft</dt><dd>{plant.origin}</dd></div>
          </dl>
        </section>

        <section className="sheet">
          <h3>Standort</h3>
          <Row title="Licht" note={care.lightNote}>
            <div className="scale-with-icons">
              <ShadeIcon size={18} />
              <SpanScale span={care.light} stops={['Schatten', 'Halbschatten', 'Hell, indirekt', 'Sonne']} label="Lichtbedarf" />
              <SunIcon size={18} />
            </div>
          </Row>
          <Row title="Temperatur" value={`${range(care.temperature.ideal.min, care.temperature.ideal.max)} °C`}>
            <RangeAxis
              ideal={care.temperature.ideal}
              tolerated={{ min: care.temperature.minimum, max: care.temperature.maximum }}
              domain={[5, 35]}
              step={5}
              unit=" °C"
              label={`Temperatur ideal ${care.temperature.ideal.min} bis ${care.temperature.ideal.max} Grad, mindestens ${care.temperature.minimum} Grad`}
              markers={[{ at: care.temperature.minimum, text: `min. ${care.temperature.minimum} °C` }]}
            />
          </Row>
          <Row title="Luftfeuchte" note={`Toleriert ${range(care.humidity.tolerated.min, care.humidity.tolerated.max, ' %')}. Die Marke zeigt typische Heizungsluft im Winter (35 %).`}>
            <HumidityGauge ideal={care.humidity.ideal} tolerated={care.humidity.tolerated} />
          </Row>
        </section>

        <section className="sheet">
          <h3>Pflege</h3>
          <Row title="Wasser" note={care.waterNote}>
            <div className="drops" role="img" aria-label={`Wasserbedarf ${waterDrops} von 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <DropIcon key={i} size={24} level={Math.max(0, Math.min(1, waterDrops - i))} />
              ))}
              <span className="drops__ends">
                <span>trocken</span>
                <span>nass</span>
              </span>
            </div>
          </Row>
          <Row title="Düngen und Umtopfen" value={care.fertilizing.interval} note={`${care.fertilizing.note} Umtopfen ${care.repotting.interval}: ${care.repotting.note}`}>
            <CareCalendar plan={care.schedule} />
          </Row>
          <Row title="Substrat" value={care.soil.description}>
            <SoilMix mix={care.soil.mix} ph={care.soil.ph} />
          </Row>
        </section>

        <section className="sheet">
          <h3>Wuchs</h3>
          <div className="split">
            <Row title="Wachstum" value={`${range(care.growth.perYearCm.min, care.growth.perYearCm.max)} cm pro Jahr`}>
              <GrowthScale level={care.growth.level} />
            </Row>
            <Row title="Größe" value={`bis ${dimensions.maxIndoorHeightCm.max} cm`}>
              <HeightDiagram plant={plant} />
            </Row>
          </div>
          <Row title="Verträglichkeit" note={care.toxicity.note}>
            <ul className="tox-list">
              {(
                [
                  ['Katzen', care.toxicity.cats, CatIcon],
                  ['Hunde', care.toxicity.dogs, DogIcon],
                  ['Menschen', care.toxicity.humans, PersonIcon],
                ] as const
              ).map(([label, toxic, Icon]) => (
                <li key={label} className={toxic ? 'is-toxic' : 'is-safe'}>
                  <Icon size={22} />
                  <span>{label}</span>
                  <small>{toxic ? 'giftig' : 'ungiftig'}</small>
                </li>
              ))}
            </ul>
          </Row>
          <Row title="Pflegeaufwand" note={care.difficultyNote}>
            <PipMeter value={care.difficulty} label="Pflegeaufwand" render={(on) => <LeafIcon size={20} filled={on} />} />
          </Row>
        </section>

        <section className={`sheet sheet--roots${mode === 'roots' ? ' is-focus' : ''}`} ref={rootsRef}>
          <h3>Wurzeln</h3>
          <p className="roots__type">{roots.structureLabel}</p>
          <RootDiagram roots={roots} />
          <p className="row__note">{roots.structureNote}</p>
          <div className="split">
            <Row title="Dichte">
              <StepMeter value={roots.density} label="Wurzeldichte" low="locker" high="dicht" />
            </Row>
            <Row title="Staunässe">
              <StepMeter value={roots.waterloggingSensitivity} label="Empfindlichkeit gegen Staunässe" low="robust" high="empfindlich" />
            </Row>
          </div>
          <dl className="meta meta--roots">
            <div><dt>Wurzeltiefe</dt><dd className="num">ca. {roots.depthCm} cm</dd></div>
            <div><dt>Ausbreitung</dt><dd className="num">Ø ca. {roots.spreadCm * 2} cm</dd></div>
            <div><dt>Topftiefe</dt><dd className="num">{range(roots.recommendedPotDepthCm.min, roots.recommendedPotDepthCm.max, ' cm')}</dd></div>
          </dl>
        </section>
      </div>
    </aside>
  )
}
