import { expect, it } from 'vitest'
import { parseRoute, routeHash } from '../../src/navigation'
import { plants } from '../../src/data/plants'

it('resolves plant and comparison links and preserves their selected plant', () => {
  for (const plant of plants) {
    for (const page of ['explore', 'compare'] as const) {
      const route = { page, plantId: plant.id }
      expect(parseRoute(routeHash(route))).toEqual(route)
    }
  }
})

it('canonicalizes missing, malformed and unknown IDs predictably', () => {
  for (const hash of ['', '#pflanze', '#pflanze/missing', '#pflanze/%ZZ', '#unknown']) {
    expect(parseRoute(hash)).toEqual({ page: 'explore', plantId: plants[0].id })
  }
  expect(parseRoute('#vergleich')).toEqual({ page: 'compare', plantId: plants[0].id })
  expect(routeHash(parseRoute('#pflanze/bergpalme/extra'))).toBe('#pflanze/bergpalme')
})
