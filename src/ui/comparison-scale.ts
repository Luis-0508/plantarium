/** Rounded axes with about five intervals, including the requested bounds. */
export function niceAxis(min: number, max: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) throw new Error('Invalid comparison domain')
  const raw = (max - min || 1) / 5
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].find((n) => n * power >= raw)! * power
  const lower = Math.floor(min / step) * step
  const upper = Math.ceil((max === min ? max + step : max) / step) * step
  const ticks = Array.from({ length: Math.round((upper - lower) / step) + 1 }, (_, i) => Number((lower + i * step).toPrecision(12)))
  return { min: lower, max: upper, ticks }
}

/** Invalid source data must remain visible as an error, rather than clipped. */
export function validTrait(values: [number, number, number]) {
  const [min, ideal, max] = values
  return values.every((v) => Number.isFinite(v) && v >= 0 && v <= 1) && min <= ideal && ideal <= max
}
