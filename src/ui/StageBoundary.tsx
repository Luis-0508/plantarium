import { Component, useEffect, type ReactNode } from 'react'
import { useI18n } from '../i18n/context'

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
  const { failure } = useI18n().t
  return (
    <div className="stage__error" role="status">
      <p>{failure.message}</p>
      <button type="button" onClick={() => window.location.reload()}>{failure.reload}</button>
    </div>
  )
}
