import { Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getPlant, plants } from './data/plants'
import type { AnatomyRegion } from './data/types'
import { Comparison } from './ui/Comparison'
import { InfoPanel } from './ui/InfoPanel'
import { StageOverlay } from './ui/StageOverlay'
import { StageBoundary, StageFailure } from './ui/StageBoundary'
import { useHashNavigation } from './useHashNavigation'
import { AnatomyCard, CameraTools, ModeSwitch, PlantSelector, VesselToggles } from './ui/StageControls'
import type { CameraCommand, PotOption, SoilOption, ViewMode } from './viewTypes'

// three.js + drei are the bulk of the bundle; load the stage separately so
// the specimen sheet and controls paint immediately.
const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })))

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

export default function App() {
  const { route: { page, plantId }, navigate } = useHashNavigation()
  const [shownId, setShownId] = useState(plantId)
  const [previousRoute, setPreviousRoute] = useState({ page, plantId })
  const [mode, setMode] = useState<ViewMode>('plant')
  const [potOption, setPotOption] = useState<PotOption>('solid')
  const [soilOption, setSoilOption] = useState<SoilOption>('solid')
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<AnatomyRegion | null>(null)
  const [command, setCommand] = useState<CameraCommand | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Reset route-specific interaction before the next route can paint with a
  // region selected from the previous plant.
  if (previousRoute.page !== page || previousRoute.plantId !== plantId) {
    setPreviousRoute({ page, plantId })
    setSelectedRegion(null)
    setHoveredRegion(null)
    setCommand(null)
    // There is no mounted specimen to animate while viewing the comparison.
    if (page === 'compare' || previousRoute.page === 'compare') setShownId(plantId)
  }

  const plant = getPlant(shownId)
  const requestedPlant = getPlant(plantId)
  const changingPlant = shownId !== plantId

  const selectPlant = useCallback((id: string) => {
    navigate({ page: 'explore', plantId: id })
    setSelectedRegion(null)
  }, [navigate])

  const changeMode = useCallback((m: ViewMode) => {
    setMode(m)
    setSelectedRegion(null)
    setHoveredRegion(null)
  }, [])

  const camera = useCallback((type: CameraCommand['type']) => setCommand({ type, id: Date.now() }), [])

  const toggleFullscreen = useCallback(() => {
    // Requests can be refused (embedded frames, missing user gesture); the button simply does nothing then.
    const request = document.fullscreenElement ? document.exitFullscreen() : stageRef.current?.requestFullscreen()
    request?.catch(() => {})
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
        <a className="wordmark" href={`#pflanze/${plantId}`} onClick={(event) => {
          if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            event.preventDefault()
            navigate({ page: 'explore', plantId })
          }
        }}>
          Plantarium
        </a>
        <nav className="pages" aria-label="Bereiche">
          <button type="button" aria-current={page === 'explore' ? 'page' : undefined} onClick={() => navigate({ page: 'explore', plantId })}>
            Erkunden
          </button>
          <button type="button" aria-current={page === 'compare' ? 'page' : undefined} onClick={() => navigate({ page: 'compare', plantId })}>
            Vergleichen
          </button>
        </nav>
      </header>

      {page === 'compare' ? (
        <Comparison plants={plants} onOpen={selectPlant} />
      ) : (
        <main className="explorer">
          <div className={`stage stage--${mode}`} ref={stageRef} data-plant-id={plant.id} aria-busy={changingPlant}>
            <div className="stage__backdrop stage__backdrop--studio" aria-hidden />
            <div className="stage__backdrop stage__backdrop--cyan" aria-hidden />
            <div className="stage__canvas">
              <StageBoundary fallback={<StageFailure plantId={plantId} onPlantSwap={setShownId} />}>
                <Suspense fallback={<p className="stage__loading" role="status">Präparat wird vorbereitet …</p>}>
                  <Stage
                    plant={plant}
                    requestedPlant={requestedPlant}
                    onPlantSwap={setShownId}
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
              </StageBoundary>
            </div>

            {!changingPlant && <StageOverlay plant={plant} mode={mode} selected={selectedRegion} hovered={hoveredRegion} onSelect={setSelectedRegion} />}

            <div className="stage__title" key={plant.id}>
              <h1>{plant.commonName}</h1>
              <p className="stage__botanical">{plant.botanicalName}</p>
              <p className="stage__english">{plant.englishName}</p>
              {mode === 'roots' && (
                <p className="stage__caption">Maße gelten für eine Pflanze im empfohlenen Topf.</p>
              )}
            </div>

            <div className="stage__modes">
              <ModeSwitch mode={mode} onChange={changeMode} />
            </div>

            <div className="stage__tools">
              <CameraTools
                onZoomIn={() => camera('zoom-in')}
                onZoomOut={() => camera('zoom-out')}
                onReset={() => camera('reset')}
                onFullscreen={document.fullscreenEnabled ? toggleFullscreen : undefined}
                fullscreen={fullscreen}
              />
            </div>

            {mode === 'anatomy' && (
              <div className="stage__anatomy">
                <AnatomyCard plant={plant} selected={selectedRegion} onSelect={setSelectedRegion} disabled={changingPlant} />
              </div>
            )}


            <div className="stage__footer">
              <PlantSelector plants={plants} activeId={plantId} onSelect={selectPlant} />
            </div>

            {mode === 'plant' && (
              <div className="stage__vessel">
                <VesselToggles pot={potOption} soil={soilOption} onPot={setPotOption} onSoil={setSoilOption} />
              </div>
            )}
          </div>

          <InfoPanel plant={plant} mode={mode} reducedMotion={reducedMotion} />
        </main>
      )}
    </div>
  )
}
