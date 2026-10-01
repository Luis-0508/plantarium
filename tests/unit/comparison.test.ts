import { expect, it } from 'vitest'
import { niceAxis, validTrait } from '../../src/ui/comparison-scale'

it('provides rounded domains for small, current and tall specimens', () => {
  expect(niceAxis(0, 170).max).toBe(200)
  expect(niceAxis(0, 250).ticks).toEqual([0, 50, 100, 150, 200, 250])
  expect(niceAxis(0, 480).max).toBe(500)
  for (const [min, max] of [[0, 0], [0, 0.8], [-12, 42], [0, 1250]]) {
    const axis = niceAxis(min, max)
    expect(axis.min).toBeLessThanOrEqual(min)
    expect(axis.max).toBeGreaterThanOrEqual(max)
    expect(axis.max).toBeGreaterThan(axis.min)
    expect(axis.ticks.length).toBeGreaterThanOrEqual(2)
    expect(axis.ticks.length).toBeLessThanOrEqual(8)
  }
})

it('rejects corrupt domains and traits rather than silently clamping data', () => {
  expect(() => niceAxis(NaN, 10)).toThrow()
  expect(() => niceAxis(10, 5)).toThrow()
  expect(validTrait([0, 0.5, 1])).toBe(true)
  for (const values of [[-0.1, 0.5, 1], [0, 0.5, 1.2], [0, NaN, 1], [0.8, 0.2, 1]]) {
    expect(validTrait(values as [number, number, number])).toBe(false)
  }
})
