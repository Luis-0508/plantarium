/**
 * Shared pot proportions. The pot is modelled at unit size and scaled per
 * plant, so root and plant generators use these helpers to stay inside it.
 */
export const POT_TAPER = 0.78 // bottom radius / top radius
export const POT_WALL = 0.07 // wall thickness relative to radius
export const POT_BASE = 0.07 // base thickness relative to height
export const SOIL_DROP = 0.06 // soil surface below rim, relative to height

export const soilLevel = (height: number) => -SOIL_DROP * height
export const potFloor = (height: number) => -height * (1 - POT_BASE)

/** Inner wall radius at depth `y` (y ≤ 0, rim at 0). */
export function innerRadiusAt(y: number, height: number, radius: number) {
  const f = Math.min(1, Math.max(0, -y / height))
  return radius * (1 - POT_WALL) * (1 - (1 - POT_TAPER) * f)
}
