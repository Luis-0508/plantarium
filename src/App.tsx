import { Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getPlant, plants } from './data/plants'
import type { AnatomyRegion } from './data/types'
import { Comparison } from './ui/Comparison'
import { InfoPanel } from './ui/InfoPanel'
import { StageOverlay } from './ui/StageOverlay'
import { AnatomyCard, CameraTools, ModeSwitch, PlantSelector, VesselToggles } from './ui/StageControls'
import type { CameraCommand, PotOption, SoilOption, ViewMode } from './viewTypes'

// three.js + drei are the bulk of the bundle; load the stage separately so
// the specimen sheet and controls paint immediately.
const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })))

type Page = 'explore' | 'compare'

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
  )
}

function readHash() {
  const [page, id] = window.location.hash.replace('#', '').split('/')
  return { page: (page === 'vergleich' ? 'compare' : 'explore') as Page, id: id || plants[0].id }
}

export default function App() {
  const initial = readHash()
  const [page, setPage] = useState<Page>(initial.page)
  const [plantId, setPlantId] = useState(getPlant(initial.id).id)
  const [mode, setMode] = useState<ViewMode>('plant')
  const [potOption, setPotOption] = useState<PotOption>('solid')
  const [soilOption, setSoilOption] = useState<SoilOption>('solid')
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<AnatomyRegion | null>(null)
  const [command, setCommand] = useState<CameraCommand | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const plant = getPlant(plantId)

  useEffect(() => {
    const hash = page === 'compare' ? '#vergleich' : `#pflanze/${plantId}`
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
  }, [page, plantId])

  const selectPlant = useCallback((id: string) => {
    setPlantId(id)
    setSelectedRegion(null)
    setPage('explore')
  }, [])

  const changeMode = useCallback((m: ViewMode) => {
    setMode(m)
    setSelectedRegion(null)
    setHoveredRegion(null)
  }, [])

  const camera = useCallback((type: CameraCommand['type']) => setCommand({ type, id: Date.now() }), [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else stageRef.current?.requestFullscreen?.()
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (page !== 'explore') return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const modes: Record<string, ViewMode> = { '1': 'plant', '2': 'roots', '3': 'anatomy' }
      if (modes[e.key]) changeMode(modes[e.key])
      else if (e.key === 'r' || e.key === 'R') camera('reset')
      else if (e.key === '+') camera('zoom-in')
      else if (e.key === '-') camera('zoom-out')
      else if (e.key === 'Escape') setSelectedRegion(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, changeMode, camera])

  return (
    <div className={`app app--${page}`}>
      <header className="masthead">
        <a className="wordmark" href="#pflanze" onClick={() => setPage('explore')}>
          Plantview
        </a>
        <nav className="pages" aria-label="Bereiche">
          <button type="button" aria-current={page === 'explore'} onClick={() => setPage('explore')}>
            Erkunden
          </button>
          <button type="button" aria-current={page === 'compare'} onClick={() => setPage('compare')}>
            Vergleichen
          </button>
        </nav>
      </header>

      {page === 'compare' ? (
        <Comparison plants={plants} onOpen={selectPlant} />
      ) : (
        <main className="explorer">
          <div className={`stage stage--${mode}`} ref={stageRef}>
            <div className="stage__backdrop stage__backdrop--studio" aria-hidden />
            <div className="stage__backdrop stage__backdrop--cyan" aria-hidden />
            <div className="stage__canvas">
              <Suspense fallback={<p className="stage__loading">Präparat wird vorbereitet …</p>}>
                <Stage
                  plant={plant}
                  mode={mode}
                  potOption={potOption}
                  soilOption={soilOption}
                  selectedRegion={selectedRegion}
                  hoveredRegion={hoveredRegion}
                  onHoverRegion={setHoveredRegion}
                  onSelectRegion={setSelectedRegion}
                  reducedMotion={reducedMotion}
                  command={command}
                />
              </Suspense>
            </div>

            <StageOverlay plant={plant} mode={mode} selected={selectedRegion} hovered={hoveredRegion} onSelect={setSelectedRegion} />

            <div className="stage__title" key={plant.id}>
              <h1>{plant.commonName}</h1>
              <p className="stage__botanical">{plant.botanicalName}</p>
              <p className="stage__english">{plant.englishName}</p>
            </div>

            <div className="stage__modes">
              <ModeSwitch mode={mode} onChange={changeMode} />
            </div>

            <div className="stage__tools">
              <CameraTools
                onZoomIn={() => camera('zoom-in')}
                onZoomOut={() => camera('zoom-out')}
                onReset={() => camera('reset')}
                onFullscreen={toggleFullscreen}
                fullscreen={fullscreen}
              />
            </div>

            {mode === 'anatomy' && (
              <div className="stage__anatomy">
                <AnatomyCard plant={plant} selected={selectedRegion} onSelect={setSelectedRegion} />
              </div>
            )}

            {mode === 'roots' && (
              <p className="stage__caption">
                Topf und Substrat sind ausgeblendet. Maße gelten für eine Pflanze im empfohlenen Topf.
              </p>
            )}

            <div className="stage__footer">
              <PlantSelector plants={plants} activeId={plant.id} onSelect={selectPlant} />
              {mode === 'plant' && (
                <VesselToggles pot={potOption} soil={soilOption} onPot={setPotOption} onSoil={setSoilOption} disabled={mode !== 'plant'} />
              )}
            </div>
          </div>

          <InfoPanel plant={plant} mode={mode} />
        </main>
      )}
    </div>
  )
}
