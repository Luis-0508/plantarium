import type { AnatomyRegion, Plant } from '../data/types'
import type { PotOption, SoilOption, ViewMode } from '../viewTypes'
import { CloseIcon, CollapseIcon, ExpandIcon, MinusIcon, PlusIcon, ResetIcon } from './icons'
import { PlantGlyph } from './PlantGlyph'

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'plant', label: 'Pflanze', hint: 'Wuchs und Blätter' },
  { id: 'roots', label: 'Wurzeln', hint: 'Blick unter die Erde' },
  { id: 'anatomy', label: 'Anatomie', hint: 'Teile der Pflanze erklärt' },
]

export function ModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const index = MODES.findIndex((m) => m.id === mode)
  return (
    <div className="modes" role="radiogroup" aria-label="Ansicht">
      <span className="modes__thumb" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden />
      {MODES.map((m, i) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={mode === m.id}
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
  return (
    <nav className="selector" aria-label="Pflanze wählen">
      {plants.map((p) => (
        <button
          key={p.id}
          type="button"
          className={p.id === activeId ? 'selector__item is-active' : 'selector__item'}
          aria-current={p.id === activeId}
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
  onFullscreen: () => void
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
      <button type="button" onClick={onFullscreen} aria-label={fullscreen ? 'Vollbild beenden' : 'Vollbild'} title={fullscreen ? 'Vollbild beenden' : 'Vollbild'}>
        {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
      </button>
    </div>
  )
}

const POT_LABEL: Record<PotOption, string> = { solid: 'sichtbar', ghost: 'durchsichtig', hidden: 'aus' }
const NEXT_POT: Record<PotOption, PotOption> = { solid: 'ghost', ghost: 'hidden', hidden: 'solid' }

/** Pot and soil visibility; only meaningful in the plant view. */
export function VesselToggles({
  pot,
  soil,
  onPot,
  onSoil,
  disabled,
}: {
  pot: PotOption
  soil: SoilOption
  onPot: (p: PotOption) => void
  onSoil: (s: SoilOption) => void
  disabled: boolean
}) {
  return (
    <div className="vessel" aria-label="Topf und Erde">
      <button type="button" disabled={disabled} onClick={() => onPot(NEXT_POT[pot])}>
        Topf <em>{POT_LABEL[pot]}</em>
      </button>
      <button type="button" disabled={disabled} onClick={() => onSoil(soil === 'solid' ? 'transparent' : 'solid')}>
        Erde <em>{soil === 'solid' ? 'sichtbar' : 'durchsichtig'}</em>
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
