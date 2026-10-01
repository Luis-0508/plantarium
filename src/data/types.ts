/**
 * Plant dataset schema. Adding a plant means adding one `Plant` entry to
 * `plants.ts` and, if needed, a model generator in `three/models/registry.ts`.
 */

export type Level = 1 | 2 | 3 | 4 | 5

/** Languages of the interface and of all user-facing plant text. */
export type Locale = 'en' | 'de'

/** User-facing text in every supported language. */
export type Localized = Record<Locale, string>

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
  title: Localized
  text: Localized
  /** Hotspot anchor in model space (metres, pot rim centre = y 0). */
  anchor: [number, number, number]
}

export interface ProceduralModelRef {
  kind: 'procedural'
  generator: 'rosette' | 'palm' | 'calathea' | 'dracaena'
  params: ProceduralParams
  seed: number
}

/**
 * Reference to the 3D representation. `procedural` uses a built-in generator;
 * `gltf` loads a modelled asset from `public/models` (see README) and falls
 * back to `fallback` while loading or if the file cannot be loaded.
 */
export type ModelRef = ProceduralModelRef | { kind: 'gltf'; url: string; rootsUrl?: string; fallback?: ProceduralModelRef }

export type ProceduralParams = RosetteParams | PalmParams | CalatheaParams | DracaenaParams

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

export interface CalatheaParams {
  type: 'calathea'
  leafCount: number
  petioleLength: [number, number]
  bladeLength: number
  /** Half-width of the blade at its widest point (m). */
  bladeWidth: number
  /** Dark feather-shaped patches per side of the midrib. */
  patches: number
  groundColor: string
  patchColor: string
  /** Wine-red underside, drawn as a second layer below the blade. */
  undersideColor: string
  petioleColor: string
}

export interface DracaenaParams {
  type: 'dracaena'
  /** Height of each trunk above the soil up to its fork (m). */
  canes: number[]
  caneRadius: number
  /** Branches per trunk fork [min, max]; each carries a leaf head. */
  branches: [number, number]
  /** Length of a branch from the fork to its tip (m). */
  branchLength: number
  leavesPerHead: number
  /** Length of the leafy upper part of a branch (m). */
  headLength: number
  leafLength: number
  /** Half-width of the strap leaf (m). */
  leafWidth: number
  leafColor: string
  marginColor: string
  /** Pale stripe inside the red margin (cultivars such as 'Tricolor'). */
  stripeColor: string
  barkColor: string
}

export interface RootProfile {
  structure: 'tuberous' | 'fibrous' | 'clumping-fibrous' | 'rhizomatous'
  structureLabel: Localized
  structureNote: Localized
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
  name: Localized
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
  commonName: Localized
  botanicalName: string
  family: Localized
  origin: Localized
  summary: Localized
  /** Identifying colour in comparisons and legends. */
  swatch: string
  /**
   * Provenance of care, size and root values. `placeholder`: typical values
   * compiled from general care guides, not yet reviewed by a botanist.
   */
  dataQuality: 'placeholder' | 'reviewed'
  /**
   * Leaves rise in the evening and lower in the morning (nyctinasty). The
   * stage then offers a time-of-day switch; the model encodes the motion.
   */
  nyctinasty?: boolean

  /** IDs from sources.ts, grouped by subject. Missing references remain unverified. */
  sourceRefs?: Partial<Record<SourceSection, string[]>>

  care: {
    /** 0 = deep shade, 1 = direct sun. */
    light: Span
    lightNote: Localized
    /** 0 = keep dry, 1 = keep wet. */
    water: Span
    waterNote: Localized
    temperature: { ideal: NumericRange; minimum: number; maximum: number }
    humidity: { ideal: NumericRange; tolerated: NumericRange }
    growth: { level: 1 | 2 | 3; perYearCm: NumericRange }
    difficulty: Level
    difficultyNote: Localized
    toxicity: { cats: boolean; dogs: boolean; humans: boolean; note: Localized }
    soil: { description: Localized; mix: SoilComponent[]; ph: NumericRange }
    fertilizing: { interval: Localized; note: Localized }
    repotting: { interval: Localized; years: NumericRange; note: Localized }
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
