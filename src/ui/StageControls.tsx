import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { AnatomyRegion, Plant } from '../data/types'
import type { DayTime, PotOption, SoilOption, ViewMode } from '../viewTypes'
import { CloseIcon, CollapseIcon, ExpandIcon, MinusIcon, PlusIcon, ResetIcon } from './icons'
import { PlantGlyph } from './PlantGlyph'

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'plant', label: 'Pflanze', hint: 'Wuchs und Blätter' },
  { id: 'roots', label: 'Wurzeln', hint: 'Blick unter die Erde' },
  { id: 'anatomy', label: 'Anatomie', hint: 'Teile der Pflanze erklärt' },
]

/** ARIA radio group: arrow keys move between views, Tab leaves the group. */
export function ModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const index = MODES.findIndex((m) => m.id === mode)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + MODES.length) % MODES.length
    onChange(MODES[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <div className="modes" role="radiogroup" aria-label="Ansicht" onKeyDown={onKeyDown}>
      <span className="modes__thumb" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden />
      {MODES.map((m, i) => (
        <button
          key={m.id}
          ref={(el) => {
            buttons.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={mode === m.id}
          tabIndex={mode === m.id ? 0 : -1}
          className={mode === m.id ? 'is-active' : ''}
          onClick={() => onChange(m.id)}
          title={`${m.hint} (Taste ${i + 1})`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export function PlantSelector({ plants, activeId, onSelect }: { plants: Plant[]; activeId: string; onSelect: (id: string) => void }) {
  const nav = useRef<HTMLElement>(null)

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
    <nav ref={nav} className="selector" aria-label="Pflanze wählen">
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
            <span className="selector__common">{p.commonName}</span>
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
  return (
    <div className="tools" role="toolbar" aria-label="Kamera">
      <button type="button" onClick={onZoomIn} aria-label="Heranzoomen" title="Heranzoomen">
        <PlusIcon />
      </button>
      <button type="button" onClick={onZoomOut} aria-label="Herauszoomen" title="Herauszoomen">
        <MinusIcon />
      </button>
      <button type="button" onClick={onReset} aria-label="Kamera zurücksetzen" title="Kamera zurücksetzen (R)">
        <ResetIcon />
      </button>
      {onFullscreen && (
        <button type="button" onClick={onFullscreen} aria-label={fullscreen ? 'Vollbild beenden' : 'Vollbild'} title={fullscreen ? 'Vollbild beenden' : 'Vollbild'}>
          {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      )}
    </div>
  )
}

const POT_LABEL: Record<PotOption, string> = { solid: 'sichtbar', ghost: 'durchsichtig', hidden: 'aus' }
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
  return (
    <div className="vessel" aria-label="Topf und Erde">
      <button type="button" onClick={() => onPot(NEXT_POT[pot])} aria-label={`Topf: ${POT_LABEL[pot]}. Umschalten auf ${POT_LABEL[NEXT_POT[pot]]}`}>
        Topf <em>{POT_LABEL[pot]}</em>
      </button>
      <button
        type="button"
        onClick={() => onSoil(soil === 'solid' ? 'transparent' : 'solid')}
        aria-label={`Erde: ${soil === 'solid' ? 'sichtbar' : 'durchsichtig'}. Umschalten`}
      >
        Erde <em>{soil === 'solid' ? 'sichtbar' : 'durchsichtig'}</em>
      </button>
    </div>
  )
}

/** Time of day for plants whose leaves rise at night; the leaves animate to the new pose. */
export function DayToggle({ value, onChange }: { value: DayTime; onChange: (d: DayTime) => void }) {
  const next: DayTime = value === 'morning' ? 'evening' : 'morning'
  const label = { morning: 'morgens', evening: 'abends' }
  return (
    <div className="vessel vessel--day">
      <button
        type="button"
        onClick={() => onChange(next)}
        aria-label={`Tageszeit: ${label[value]}. Umschalten auf ${label[next]}`}
        title="Morgens liegen die Blätter flach, abends richten sie sich auf."
      >
        Tageszeit <em>{label[value]}</em>
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
}: {
  plant: Plant
  selected: AnatomyRegion | null
  onSelect: (r: AnatomyRegion | null) => void
}) {
  const notes = REGION_ORDER.map((r) => plant.anatomy.find((n) => n.region === r)).filter((n) => n !== undefined)
  const note = notes.find((n) => n.region === selected)
  return (
    <div className="anatomy" aria-live="polite">
      <ul className="anatomy__regions">
        {notes.map((n) => (
          <li key={n.region}>
            <button type="button" className={n.region === selected ? 'is-active' : ''} onClick={() => onSelect(n.region === selected ? null : n.region)}>
              {n.title}
            </button>
          </li>
        ))}
      </ul>
      {note ? (
        <article className="anatomy__card" key={note.region}>
          <header>
            <h3>{note.title}</h3>
            <button type="button" className="anatomy__close" onClick={() => onSelect(null)} aria-label="Erklärung schließen">
              <CloseIcon size={16} />
            </button>
          </header>
          <p>{note.text}</p>
        </article>
      ) : (
        <p className="anatomy__hint">Einen Punkt an der Pflanze wählen oder direkt auf Blatt, Stamm, Erde oder Wurzeln zeigen.</p>
      )}
    </div>
  )
}
