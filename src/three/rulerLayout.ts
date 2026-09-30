import type { Plant } from '../data/types'
import { innerRadiusAt, soilLevel } from './models/potShape'

export type RulerLabel =
  | { id: string; kind: 'tick'; position: [number, number, number]; cm: number }
  | { id: string; kind: 'depth' | 'spread'; position: [number, number, number] }

/**
 * Geometry of the root-view measuring overlay, in the camera-facing frame
 * centred on the pot axis. Shared by the 3D lines and the DOM labels.
 * `measured` (metres, from the rendered roots) positions the guides so they
 * match the geometry; labels always show the documented values.
 */
export function rulerLayout(plant: Plant, measured?: { depth: number; spread: number }) {
  const { radius: R, height: H } = plant.pot
  const soilY = soilLevel(H)
  const depthY = soilY - (measured?.depth ?? plant.roots.depthCm / 100)
  const spread = measured?.spread ?? plant.roots.spreadCm / 100
  const x = R * 1.06 + 0.035
  const tickCount = Math.floor((soilY + H) * 100)

  const labels: RulerLabel[] = []
  for (let cm = 0; cm <= tickCount; cm += 5) {
    labels.push({ id: `ruler-${cm}`, kind: 'tick', position: [x + 0.016, soilY - cm / 100, 0], cm })
  }
  labels.push({ id: 'ruler-depth', kind: 'depth', position: [x + 0.045, depthY, 0] })
  labels.push({ id: 'ruler-spread', kind: 'spread', position: [0, -H - 0.05, 0] })

  return { R, H, soilY, depthY, spread, x, tickCount, depthRingRadius: innerRadiusAt(depthY, H, R) * 0.97, labels }
}
