import { describe, expect, it } from 'vitest'
import { plants } from '../../src/data/plants'
import { sources } from '../../src/data/sources'
import type { NumericRange, ProceduralModelRef } from '../../src/data/types'

const regions = ['leaf', 'stem', 'crown', 'soil', 'roots']
const sections = ['care', 'dimensions', 'roots', 'anatomy']
const positive = (value: number) => {
  expect(Number.isFinite(value)).toBe(true)
  expect(value).toBeGreaterThan(0)
}
const normalized = (value: number) => {
  expect(Number.isFinite(value)).toBe(true)
  expect(value).toBeGreaterThanOrEqual(0)
  expect(value).toBeLessThanOrEqual(1)
}
const integer = (value: number, min: number, max = Infinity) => {
  expect(Number.isInteger(value)).toBe(true)
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}
const range = ({ min, max }: NumericRange) => {
  expect(Number.isFinite(min) && Number.isFinite(max)).toBe(true)
  expect(min).toBeLessThanOrEqual(max)
}
const tuple = ([min, max]: [number, number], integers = false) => {
  range({ min, max })
  positive(min)
  if (integers) { integer(min, 1); integer(max, 1) }
}

function model(ref: ProceduralModelRef) {
  integer(ref.seed, 0, 0xffffffff)
  expect(ref.generator).toBe(ref.params.type)
  const p = ref.params
  if (p.type === 'rosette') {
    integer(p.leafCount, 2)
    integer(p.runners, 0)
    positive(p.leafLength)
    positive(p.leafWidth)
    normalized(p.variegation)
    expect(p.variegation).toBeLessThanOrEqual(0.96)
  } else if (p.type === 'calathea') {
    integer(p.leafCount, 2)
    integer(p.patches, 1)
    tuple(p.petioleLength)
    positive(p.bladeLength)
    positive(p.bladeWidth)
    expect(p.bladeWidth).toBeLessThan(p.bladeLength)
  } else if (p.type === 'dracaena') {
    expect(p.canes.length).toBeGreaterThan(0)
    for (const h of p.canes) positive(h)
    tuple(p.branches, true)
    integer(p.leavesPerHead, 2)
    for (const v of [p.caneRadius, p.branchLength, p.headLength, p.leafLength, p.leafWidth]) positive(v)
    expect(p.headLength).toBeLessThan(p.branchLength)
  } else {
    integer(p.stems, 1)
    integer(p.suckers, 0)
    integer(p.leafletsPerSide, 2)
    tuple(p.stemHeight)
    tuple(p.frondsPerStem, true)
    tuple(p.frondLength)
    for (const v of [p.stemRadius, p.leafletLength, p.leafletWidth, p.frondSpacing]) positive(v)
    for (const v of [p.arch, p.irregularity, p.ageYellowing]) normalized(v)
    for (const v of [p.leafletDroop, p.rachisTwist]) {
      expect(Number.isFinite(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
    }
  }
}

describe('plant dataset', () => {
  it('has unique, nonempty URL-safe IDs', () => {
    expect(plants.length).toBeGreaterThan(0)
    expect(new Set(plants.map((p) => p.id)).size).toBe(plants.length)
    for (const p of plants) expect(p.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  for (const p of plants) {
    it(`${p.id}: care, dimensions, anatomy and model satisfy their contracts`, () => {
      const c = p.care
      for (const span of [c.light, c.water]) {
        range(span)
        for (const value of [span.min, span.ideal, span.max]) normalized(value)
        expect(span.ideal).toBeGreaterThanOrEqual(span.min)
        expect(span.ideal).toBeLessThanOrEqual(span.max)
      }
      for (const r of [c.temperature.ideal, c.humidity.ideal, c.humidity.tolerated, c.growth.perYearCm,
        c.soil.ph, c.repotting.years, p.dimensions.maxIndoorHeightCm, p.roots.recommendedPotDepthCm]) range(r)
      expect(c.temperature.minimum).toBeLessThanOrEqual(c.temperature.ideal.min)
      expect(c.temperature.maximum).toBeGreaterThanOrEqual(c.temperature.ideal.max)
      expect(c.humidity.tolerated.min).toBeLessThanOrEqual(c.humidity.ideal.min)
      expect(c.humidity.tolerated.max).toBeGreaterThanOrEqual(c.humidity.ideal.max)
      for (const v of Object.values(c.humidity).flatMap((r) => [r.min, r.max])) normalized(v / 100)
      expect(c.soil.ph.min).toBeGreaterThanOrEqual(0)
      expect(c.soil.ph.max).toBeLessThanOrEqual(14)
      positive(c.repotting.years.min)
      expect(c.growth.perYearCm.min).toBeGreaterThanOrEqual(0)
      integer(c.growth.level, 1, 3)
      for (const v of [c.difficulty, p.roots.density, p.roots.waterloggingSensitivity]) integer(v, 1, 5)
      for (const months of Object.values(c.schedule)) {
        expect(new Set(months).size).toBe(months.length)
        for (const month of months) integer(month, 1, 12)
      }
      expect(c.soil.mix.length).toBeGreaterThan(0)
      for (const part of c.soil.mix) { positive(part.share); normalized(part.share); expect(part.name.trim()).not.toBe('') }
      expect(c.soil.mix.reduce((sum, part) => sum + part.share, 0)).toBeCloseTo(1, 6)
      for (const v of [p.pot.height, p.pot.radius, p.dimensions.specimenHeight, p.dimensions.maxSpreadCm,
        p.dimensions.maxIndoorHeightCm.min, p.roots.depthCm, p.roots.spreadCm, p.roots.recommendedPotDepthCm.min]) positive(v)
      expect(p.roots.depthCm / 100).toBeLessThan(p.pot.height)
      expect(p.roots.spreadCm / 100).toBeLessThan(p.pot.radius)
      integer(p.roots.model.primaryCount, 1)
      positive(p.roots.model.thickness)
      expect(p.roots.model.thickness).toBeLessThan(Math.min(p.pot.radius, p.pot.height) / 10)
      normalized(p.roots.model.branching)
      expect(p.anatomy.map((n) => n.region).sort()).toEqual([...regions].sort())
      for (const note of p.anatomy) {
        expect(note.title.trim()).not.toBe('')
        expect(note.text.trim()).not.toBe('')
        expect(note.anchor).toHaveLength(3)
        expect(note.anchor.every(Number.isFinite)).toBe(true)
      }
      if (p.model.kind === 'procedural') model(p.model)
      else {
        expect(p.model.url.trim()).not.toBe('')
        if (p.model.fallback) model(p.model.fallback)
      }
    })
  }
})

describe('source provenance', () => {
  it('uses real, resolvable references and keeps unreferenced data unverified', () => {
    const ids = sources.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const source of sources) {
      expect(source.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(source.title.trim()).not.toBe('')
      expect(source.author.trim()).not.toBe('')
      expect(new URL(source.url).protocol).toMatch(/^https?:$/)
      expect(source.accessedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(source.accessedOn).toISOString().slice(0, 10)).toBe(source.accessedOn)
    }
    for (const plant of plants) {
      for (const [section, refs] of Object.entries(plant.sourceRefs ?? {})) {
        expect(sections).toContain(section)
        expect(new Set(refs).size).toBe(refs.length)
        for (const id of refs) expect(ids).toContain(id)
      }
      if (plant.dataQuality === 'reviewed') {
        for (const section of sections) expect(plant.sourceRefs?.[section as keyof typeof plant.sourceRefs]?.length).toBeGreaterThan(0)
      } else expect(plant.dataQuality).toBe('placeholder')
    }
  })
})
