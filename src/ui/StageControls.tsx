import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { AnatomyRegion, Plant } from '../data/types'
import { useI18n } from '../i18n/context'
import type { DayTime, PotOption, SoilOption, ViewMode } from '../viewTypes'
import { CloseIcon, CollapseIcon, ExpandIcon, MinusIcon, PlusIcon, ResetIcon } from './icons'
import { PlantGlyph } from './PlantGlyph'

const MODES: ViewMode[] = ['plant', 'roots', 'anatomy']

/** ARIA radio group: arrow keys move between views, Tab leaves the group. */
export function ModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const { t } = useI18n()
  const index = MODES.indexOf(mode)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + MODES.length) % MODES.length
    onChange(MODES[next])
    buttons.current[next]?.focus()
  }

  return (
    <div className="modes" role="radiogroup" aria-label={t.modes.group} onKeyDown={onKeyDown}>
      <span className="modes__thumb" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden />
      {MODES.map((m, i) => (
        <button
          key={m}
          ref={(el) => {
            buttons.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={mode === m}
          tabIndex={mode === m ? 0 : -1}
          className={mode === m ? 'is-active' : ''}
          onClick={() => onChange(m)}
          title={t.modes.key(t.modes[m].hint, i + 1)}
        >
          {t.modes[m].label}
        </button>
      ))}
    </div>
  )
}

export function PlantSelector({ plants, activeId, onSelect }: { plants: Plant[]; activeId: string; onSelect: (id: string) => void }) {
  const nav = useRef<HTMLElement>(null)
  const { t, l } = useI18n()

  // On narrow screens the strip scrolls; keep the active plant in view.
  useEffect(() => {
    const center = (behavior: ScrollBehavior) => {
      const strip = nav.current
      const item = strip?.querySelector<HTMLElement>('.is-active')
      if (!strip || !item || strip.scrollWidth <= strip.clientWidth) return
      const offset = item.getBoundingClientRect().left - strip.getBoundingClientRect().left
      strip.scrollTo({ left: strip.scrollLeft + offset - (strip.clientWidth - item.offsetWidth) / 2, behavior })
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    center(reduced ? 'auto' : 'smooth')
    // Item widths change once the web fonts arrive; re-centre without animation.
    let live = true
    if (document.fonts.status !== 'loaded') document.fonts.ready.then(() => live && center('auto'))
    return () => {
      live = false
    }
  }, [activeId])

  return (
    <nav ref={nav} className="selector" aria-label={t.selector}>
      {plants.map((p) => (
        <button
          key={p.id}
          type="button"
          className={p.id === activeId ? 'selector__item is-active' : 'selector__item'}
          aria-pressed={p.id === activeId}
          onClick={() => onSelect(p.id)}
        >
          <PlantGlyph plant={p} className="selector__glyph" />
          <span className="selector__names">
            <span className="selector__common">{l(p.commonName)}</span>
            <span className="selector__botanical">{p.botanicalName}</span>
          </span>
        </button>
      ))}
    </nav>
  )
}

interface ToolsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  /** Omitted when the browser cannot put an element into fullscreen (e.g. iOS Safari). */
  onFullscreen?: () => void
  fullscreen: boolean
}

export function CameraTools({ onZoomIn, onZoomOut, onReset, onFullscreen, fullscreen }: ToolsProps) {
  const { camera } = useI18n().t
  const fullscreenLabel = fullscreen ? camera.exitFullscreen : camera.fullscreen
  return (
    <div className="tools" role="toolbar" aria-label={camera.group}>
      <button type="button" onClick={onZoomIn} aria-label={camera.zoomIn} title={camera.zoomIn}>
        <PlusIcon />
      </button>
      <button type="button" onClick={onZoomOut} aria-label={camera.zoomOut} title={camera.zoomOut}>
        <MinusIcon />
      </button>
      <button type="button" onClick={onReset} aria-label={camera.reset} title={camera.resetKey}>
        <ResetIcon />
      </button>
      {onFullscreen && (
        <button type="button" onClick={onFullscreen} aria-label={fullscreenLabel} title={fullscreenLabel}>
          {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      )}
    </div>
  )
}

const NEXT_POT: Record<PotOption, PotOption> = { solid: 'ghost', ghost: 'hidden', hidden: 'solid' }

/** Pot and soil visibility; shown in the plant view only. */
export function VesselToggles({
  pot,
  soil,
  onPot,
  onSoil,
}: {
  pot: PotOption
  soil: SoilOption
  onPot: (p: PotOption) => void
  onSoil: (s: SoilOption) => void
}) {
  const { vessel } = useI18n().t
  const nextSoil: SoilOption = soil === 'solid' ? 'transparent' : 'solid'
  return (
    <div className="vessel" aria-label={vessel.group}>
      <button type="button" onClick={() => onPot(NEXT_POT[pot])}
        aria-label={vessel.switchTo(vessel.pot, vessel.potState[pot], vessel.potState[NEXT_POT[pot]])}>
        {vessel.pot} <em>{vessel.potState[pot]}</em>
      </button>
      <button
        type="button"
        onClick={() => onSoil(nextSoil)}
        aria-label={vessel.switchTo(vessel.soil, vessel.soilState[soil], vessel.soilState[nextSoil])}
      >
        {vessel.soil} <em>{vessel.soilState[soil]}</em>
      </button>
    </div>
  )
}

/** Time of day for plants whose leaves rise at night; the leaves animate to the new pose. */
export function DayToggle({ value, onChange }: { value: DayTime; onChange: (d: DayTime) => void }) {
  const next: DayTime = value === 'morning' ? 'evening' : 'morning'
  const { day, vessel } = useI18n().t
  return (
    <div className="vessel vessel--day">
      <button
        type="button"
        onClick={() => onChange(next)}
        aria-label={vessel.switchTo(day.label, day[value], day[next])}
        title={day.title}
      >
        {day.label} <em>{day[value]}</em>
      </button>
    </div>
  )
}

const REGION_ORDER: AnatomyRegion[] = ['leaf', 'stem', 'crown', 'soil', 'roots']

/** Explanation for the selected region, plus a keyboard-friendly region list. */
export function AnatomyCard({
  plant,
  selected,
  onSelect,
  disabled = false,
}: {
  plant: Plant
  selected: AnatomyRegion | null
  onSelect: (r: AnatomyRegion | null) => void
  disabled?: boolean
}) {
  const mobileSelect = useRef<HTMLSelectElement>(null)
  const { t, l } = useI18n()
  const buttons = useRef<Partial<Record<AnatomyRegion, HTMLButtonElement | null>>>({})
  const previousRegion = useRef(selected)
  useEffect(() => {
    if (previousRegion.current && !selected && document.activeElement === document.body) {
      const select = mobileSelect.current
      if (select?.offsetParent) select.focus()
      else buttons.current[previousRegion.current]?.focus()
    }
    previousRegion.current = selected
  }, [selected])
  const notes = REGION_ORDER.map((r) => plant.anatomy.find((n) => n.region === r)).filter((n) => n !== undefined)
  const note = notes.find((n) => n.region === selected)
  return (
    <div className="anatomy">
      <label className="anatomy__mobile">
        <span className="visually-hidden">{t.anatomy.choose}</span>
        <select ref={mobileSelect} value={selected ?? ''} disabled={disabled}
          onChange={(event) => onSelect(notes.find((n) => n.region === event.target.value)?.region ?? null)}>
          <option value="">{t.anatomy.chooseOption}</option>
          {notes.map((n) => <option key={n.region} value={n.region}>{l(n.title)}</option>)}
        </select>
      </label>
      <ul className="anatomy__regions">
        {notes.map((n) => (
          <li key={n.region}>
            <button type="button" ref={(element) => { buttons.current[n.region] = element }} disabled={disabled}
              aria-pressed={n.region === selected} className={n.region === selected ? 'is-active' : ''} onClick={() => onSelect(n.region === selected ? null : n.region)}>
              {l(n.title)}
            </button>
          </li>
        ))}
      </ul>
      {note ? (
        <article className="anatomy__card" key={note.region} aria-live="polite">
          <header>
            <h3>{l(note.title)}</h3>
            <button type="button" className="anatomy__close" onClick={() => onSelect(null)} aria-label={t.anatomy.close}>
              <CloseIcon size={16} />
            </button>
          </header>
          <p>{l(note.text)}</p>
        </article>
      ) : (
        <p className="anatomy__hint">{t.anatomy.hint}</p>
      )}
    </div>
  )
}
