import { createServer } from 'vite'

// Vite loads the same TypeScript modules as the app; no benchmark dependency is needed.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { plants } = await server.ssrLoadModule('/src/data/plants.ts')
  const { buildProceduralGeometry } = await server.ssrLoadModule('/src/three/models/registry.ts')
  const rows = []
  for (const plant of plants.filter((plant) => plant.model.kind === 'procedural')) {
    const times = []
    let triangles = 0
    let bytes = 0
    for (let sample = -2; sample < 5; sample++) {
      global.gc?.()
      const start = performance.now()
      // Fresh immutable input bypasses the production cache for every sample.
      const geometry = buildProceduralGeometry({ ...plant })
      const elapsed = performance.now() - start
      if (sample >= 0) times.push(elapsed)
      triangles = 0
      bytes = 0
      for (const part of Object.values(geometry)) {
        triangles += part.index.count / 3
        bytes += part.index.array.byteLength
        for (const attribute of Object.values(part.attributes)) bytes += attribute.array.byteLength
        part.dispose()
      }
    }
    times.sort((a, b) => a - b)
    rows.push({ plant: plant.id, medianMs: Number(times[2].toFixed(2)), triangles,
      bufferMiB: Number((bytes / 1048576).toFixed(2)) })
  }
  if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 2))
  else console.table(rows)
} finally {
  await server.close()
}
