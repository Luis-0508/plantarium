import type { Plant, NumericRange, RootProfile } from '../../data/types'

/** Preserve the familiar temperature axis, expanding in rounded steps when needed. */
export function temperatureAxis(temperature: Plant['care']['temperature']) {
  const min = Math.min(5, temperature.minimum)
  const max = Math.max(35, temperature.maximum)
  const step = Math.max(5, Math.ceil((max - min) / 30) * 5)
  return { domain: [Math.floor(min / step) * step, Math.ceil(max / step) * step] as [number, number], step }
}

/** Whole pH units keep small decimal changes from shifting the display range. */
export function phDomain(ph: NumericRange): [number, number] {
  return [Math.min(4, Math.floor(ph.min)), Math.max(9, Math.ceil(ph.max))]
}

/** Scale both root dimensions uniformly; leave room for guides and labels. */
export function rootDiagramLayout(roots: RootProfile) {
  const topHalf = Math.max(roots.spreadCm + 4, roots.recommendedPotDepthCm.max * 0.55)
  const scale = Math.min(3, 82 / topHalf)
  const bottom = 18 + roots.recommendedPotDepthCm.max * scale
  const depthY = 22 + roots.depthCm * scale
  return { topHalf, scale, bottom, depthY, height: Math.max(bottom, depthY) + 26 }
}
