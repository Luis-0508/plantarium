import { expect, it } from 'vitest'
import { specimenTransition } from '../../src/three/specimen-transition'

it('commits at zero size and then regrows the new specimen', () => {
  let grow = 1
  let swap = false
  for (let i = 0; i < 20; i++) {
    const next = specimenTransition(grow, true, 1 / 60, false)
    if (next.swap) { expect(next.grow).toBe(0); swap = true; break }
    expect(next.grow).toBeLessThan(grow)
    grow = next.grow
  }
  expect(swap).toBe(true)
  expect(specimenTransition(0, false, 0.1, false).grow).toBeGreaterThan(0)
  expect(specimenTransition(0.99, false, 0.1, false)).toEqual({ grow: 1, swap: false })
})

it('can cancel a pending change and handles rapid retargeting without a stale swap', () => {
  const shrinking = specimenTransition(1, true, 0.1, false)
  const cancelled = specimenTransition(shrinking.grow, false, 0.1, false)
  expect(cancelled.swap).toBe(false)
  expect(cancelled.grow).toBeGreaterThan(shrinking.grow)
  expect(specimenTransition(0.1, true, 0.1, false)).toEqual({ grow: 0, swap: true })
})

it('applies reduced motion immediately and limits background-tab hitches', () => {
  expect(specimenTransition(1, true, 0, true)).toEqual({ grow: 0, swap: true })
  expect(specimenTransition(0, false, 0, true)).toEqual({ grow: 1, swap: false })
  expect(specimenTransition(1, true, 10, false)).toEqual(specimenTransition(1, true, 0.1, false))
})
