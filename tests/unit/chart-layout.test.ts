import { expect, it } from 'vitest'
import { plants } from '../../src/data/plants'
import { phDomain, rootDiagramLayout, temperatureAxis } from '../../src/ui/viz/chart-layout'

it('preserves existing specimen chart domains and root scale', () => {
  for (const plant of plants) {
    expect(temperatureAxis(plant.care.temperature)).toEqual({ domain: [5, 35], step: 5 })
    expect(phDomain(plant.care.soil.ph)).toEqual([4, 9])
    expect(rootDiagramLayout(plant.roots).scale).toBe(3)
  }
})

it('covers cold and hot specimens with a readable number of temperature ticks', () => {
  for (const [minimum, maximum] of [[-12, 42], [-60, 100], [5, 35]]) {
    const { domain, step } = temperatureAxis({ minimum, maximum, ideal: { min: 18, max: 24 } })
    expect(domain[0]).toBeLessThanOrEqual(minimum)
    expect(domain[1]).toBeGreaterThanOrEqual(maximum)
    expect((domain[1] - domain[0]) / step).toBeLessThanOrEqual(8)
  }
  expect(temperatureAxis({ minimum: -11.9, maximum: 41.9, ideal: { min: 18, max: 24 } }))
    .toEqual(temperatureAxis({ minimum: -12, maximum: 42, ideal: { min: 18, max: 24 } }))
})

it('keeps valid acidic and alkaline pH values and neutral pH inside the track', () => {
  for (const ph of [{ min: 0, max: 14 }, { min: 2.2, max: 3.8 }, { min: 10.2, max: 12.4 }]) {
    const [min, max] = phDomain(ph)
    expect(min).toBeLessThanOrEqual(ph.min)
    expect(max).toBeGreaterThanOrEqual(ph.max)
    expect(min).toBeLessThan(7)
    expect(max).toBeGreaterThan(7)
  }
  expect(phDomain({ min: 2.21, max: 12.41 })).toEqual(phDomain({ min: 2.2, max: 12.4 }))
})

it('keeps wide and deep root profiles and measurement guides inside the diagram', () => {
  for (const [spreadCm, depthCm, potDepth] of [[80, 75, 100], [8, 150, 200], [100, 10, 20]]) {
    const roots = { ...plants[0].roots, spreadCm, depthCm, recommendedPotDepthCm: { min: potDepth / 2, max: potDepth } }
    const layout = rootDiagramLayout(roots)
    expect(layout.topHalf * layout.scale + 6).toBeLessThanOrEqual(88)
    expect(spreadCm * layout.scale).toBeLessThan(100)
    expect(layout.depthY).toBeLessThan(layout.height - 14)
    expect(layout.bottom).toBeLessThan(layout.height - 14)
    expect(Object.values(layout).every(Number.isFinite)).toBe(true)
  }
})
