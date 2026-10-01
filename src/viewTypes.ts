import type { AnatomyRegion } from './data/types'

export type ViewMode = 'plant' | 'roots' | 'anatomy'
export type PotOption = 'solid' | 'ghost' | 'hidden'
export type SoilOption = 'solid' | 'transparent'
/** Time of day for plants whose leaves move (Calathea: flat in the morning, raised in the evening). */
export type DayTime = 'morning' | 'evening'

export type CameraCommand = { type: 'reset' | 'zoom-in' | 'zoom-out'; id: number }

/** Values eased every frame by the stage; scene parts read them in useFrame. */
export interface StageAnim {
  pot: number
  ghost: number
  soil: number
  stipple: number
  reveal: number
  shadow: number
  grow: number
  /** Leaf pose: 0 = morning, 1 = evening. */
  pose: number
  highlight: Record<AnatomyRegion, number>
}
