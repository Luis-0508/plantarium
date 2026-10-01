import { Component, useEffect, type ReactNode } from 'react'

export class StageBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('The 3D viewer could not be rendered.', error)
  }

  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function StageFailure({ plantId, onPlantSwap }: { plantId: string; onPlantSwap: (id: string) => void }) {
  // A failed renderer cannot complete a transition. Keep the information panel
  // following navigation even while the 3D experience is unavailable.
  useEffect(() => { onPlantSwap(plantId) }, [plantId, onPlantSwap])
  return (
    <div className="stage__error" role="status">
      <p>Die 3D-Ansicht konnte nicht geladen werden. Der Steckbrief bleibt verfügbar.</p>
      <button type="button" onClick={() => window.location.reload()}>Erneut laden</button>
    </div>
  )
}
