import { useMemo } from 'react'
import type { AnatomyRegion, Plant } from '../data/types'
import { useI18n } from '../i18n/context'
import { anchorRef, hotspotId } from '../three/anchorRegistry'
import { rulerLayout } from '../three/rulerLayout'
import type { ViewMode } from '../viewTypes'

interface Props {
  plant: Plant
  mode: ViewMode
  selected: AnatomyRegion | null
  hovered: AnatomyRegion | null
  onSelect: (region: AnatomyRegion | null) => void
}

/**
 * DOM layer above the canvas. Elements start hidden; the canvas-side
 * ScreenAnchors positions and reveals them once their 3D anchor is live.
 */
export function StageOverlay({ plant, mode, selected, hovered, onSelect }: Props) {
  const ruler = useMemo(() => rulerLayout(plant), [plant])
  const { t, l } = useI18n()

  return (
    <div className="overlay" key={`${plant.id}-${mode}`}>
      {mode === 'anatomy' &&
        plant.anatomy.map((note) => {
          const active = selected === note.region
          return (
            <div key={note.region} ref={anchorRef(hotspotId(note.region))} className="anchor">
              <button
                type="button"
                className={`hotspot${active ? ' is-active' : ''}${hovered === note.region ? ' is-hovered' : ''}`}
                aria-pressed={active}
                aria-label={l(note.title)}
                onClick={() => onSelect(active ? null : note.region)}
              >
                <span className="hotspot__dot" />
                <span className="hotspot__label">{l(note.title)}</span>
              </button>
            </div>
          )
        })}

      {mode === 'roots' &&
        ruler.labels.map((label) => (
          <div key={label.id} ref={anchorRef(label.id)} className="anchor" aria-hidden={label.kind === 'tick'}>
            {label.kind === 'tick' && <span className="ruler-tick">{label.cm}</span>}
            {label.kind === 'depth' && (
              <span className="ruler-note">
                <strong>{plant.roots.depthCm} cm</strong>
                <span>{t.ruler.depth}</span>
              </span>
            )}
            {label.kind === 'spread' && (
              <span className="ruler-note ruler-note--center">
                <strong>Ø {plant.roots.spreadCm * 2} cm</strong>
                <span>{t.ruler.spread}</span>
              </span>
            )}
          </div>
        ))}
    </div>
  )
}
