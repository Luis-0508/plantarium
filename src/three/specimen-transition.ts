/** One animation step. The caller commits the selected plant only at zero size. */
export function specimenTransition(grow: number, changing: boolean, dt: number, reducedMotion: boolean) {
  const step = Math.min(dt, 0.1)
  if (changing) {
    const next = reducedMotion ? 0 : Math.max(0, grow - step * 3.2)
    return { grow: next, swap: next === 0 }
  }
  return { grow: reducedMotion ? 1 : Math.min(1, grow + step / 1.25), swap: false }
}
