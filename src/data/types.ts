/**
 * Plant dataset schema. Adding a plant means adding one `Plant` entry to
 * `plants.ts` and, if needed, a model generator in `three/models/registry.ts`.
 */

export type Level = 1 | 2 | 3 | 4 | 5

/** A normalised 0–1 range on a qualitative scale (e.g. deep shade → full sun). */
export interface Span {
  min: number
  max: number
  /** Ideal point within the range. */
  ideal: number
}

export interface NumericRange {
  min: number
  max: number
}

export type AnatomyRegion = 'leaf' | 'stem' | 'crown' | 'soil' | 'roots'

export interface AnatomyNote {
  region: AnatomyRegion
  title: string
  text: string
  /** Hotspot anchor in model space (metres, pot rim centre = y 0). */
  anchor: [number, number, number]
}

export interface ProceduralModelRef {
  kind: 'procedural'
  generator: 'rosette' | 'palm'
  params: ProceduralParams
  seed: number
}

/**
 * Reference to the 3D representation. `procedural` uses a built-in generator;
 * `gltf` loads a modelled asset from `public/models` (see README) and falls
 * back to `fallback` while loading or if the file cannot be loaded.
 */
export type ModelRef = ProceduralModelRef | { kind: 'gltf'; url: string; rootsUrl?: string; fallback?: ProceduralModelRef }

export type ProceduralParams = RosetteParams | PalmParams

export interface RosetteParams {
  type: 'rosette'
  leafCount: number
  leafLength: number
  leafWidth: number
  /** Share of leaf width taken by the pale central stripe (0 = plain green). */
  variegation: number
  runners: number
}

export interface PalmParams {
  type: 'palm'
  stems: number
  stemHeight: [number, number]
  stemRadius: number
  frondsPerStem: [number, number]
  frondLength: [number, number]
  leafletsPerSide: number
  leafletLength: number
  leafletWidth: number
  /** 0 = upright, 1 = strongly arching. */
  arch: number
  /** Gravity bend of individual leaflets. */
  leafletDroop: number
  /** Vertical distance between successive frond insertions on a cane (m). */
  frondSpacing: number
  /** Short basal shoots emerging from the clump. */
  suckers: number
  /** 0 = regular leaflets, 1 = strongly irregular spacing, length and angle. */
  irregularity: number
  /** Roll of the leaflet plane toward the frond tip (radians). */
  rachisTwist: number
  /** How much older fronds shift toward yellow-green. */
  ageYellowing: number
  stemColor: string
  /** Cane colour toward the crown; defaults to `stemColor`. */
  stemTopColor?: string
  leafColor: string
  rachisColor: string
  /** Visible leaf-scar rings on canes. */
  rings: boolean
}

export interface RootProfile {
  structure: 'tuberous' | 'fibrous' | 'clumping-fibrous'
  structureLabel: string
  structureNote: string
  /** Typical rooting depth in a pot, cm. */
  depthCm: number
  /** Lateral spread in cm (radius from crown). */
  spreadCm: number
  density: Level
  waterloggingSensitivity: Level
  recommendedPotDepthCm: NumericRange
  /** Generator hints for the 3D root system. */
  model: {
    primaryCount: number
    thickness: number
    branching: number
    tubers: boolean
    color: string
  }
}

export interface MonthPlan {
  /** Months 1–12 with fertiliser applications. */
  fertilize: number[]
  /** Preferred repotting months. */
  repot: number[]
}

export interface SoilComponent {
  name: string
  share: number
}

export interface HorticulturalSource {
  id: string
  title: string
  author: string
  url: string
  /** Date consulted, YYYY-MM-DD. A citation alone does not imply review. */
  accessedOn: string
  notes?: string
}

export type SourceSection = 'care' | 'dimensions' | 'roots' | 'anatomy'

export interface Plant {
  id: string
  commonName: string
  englishName: string
  botanicalName: string
  family: string
  origin: string
  summary: string
  /** Identifying colour in comparisons and legends. */
  swatch: string
  /**
   * Provenance of care, size and root values. `placeholder`: typical values
   * compiled from general care guides, not yet reviewed by a botanist.
   */
  dataQuality: 'placeholder' | 'reviewed'

  /** IDs from sources.ts, grouped by subject. Missing references remain unverified. */
  sourceRefs?: Partial<Record<SourceSection, string[]>>

  care: {
    /** 0 = deep shade, 1 = direct sun. */
    light: Span
    lightNote: string
    /** 0 = keep dry, 1 = keep wet. */
    water: Span
    waterNote: string
    temperature: { ideal: NumericRange; minimum: number; maximum: number }
    humidity: { ideal: NumericRange; tolerated: NumericRange }
    growth: { level: 1 | 2 | 3; label: string; perYearCm: NumericRange }
    difficulty: Level
    difficultyNote: string
    toxicity: { cats: boolean; dogs: boolean; humans: boolean; note: string }
    soil: { description: string; mix: SoilComponent[]; ph: NumericRange }
    fertilizing: { interval: string; note: string }
    repotting: { interval: string; years: NumericRange; note: string }
    schedule: MonthPlan
  }

  dimensions: {
    maxIndoorHeightCm: NumericRange
    maxSpreadCm: number
    /** Height of the 3D specimen above the pot rim, metres. */
    specimenHeight: number
  }

  pot: {
    /** Pot inner depth / top radius used by the 3D stage, metres. */
    height: number
    radius: number
    color: string
  }

  roots: RootProfile
  anatomy: AnatomyNote[]
  model: ModelRef
}
