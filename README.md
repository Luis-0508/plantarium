# Plantarium

An interactive 3D explorer for houseplants: inspect a plant in its pot, switch
to a cyanotype-style root view, open an anatomy mode with hotspots, read care
requirements as small graphics, and compare species side by side.

Stack: Vite, React 19, TypeScript, three.js via React Three Fiber and drei.

## Getting started

```bash
npm install
npm run dev
```

`npm run build` type-checks and creates a production bundle in `dist/`.

## Features

- **Plant view**: orbit, zoom, reset, fullscreen; pot can be shown, made
  transparent or hidden, soil can be made transparent.
- **Root view**: pot turns into a glass outline, soil into stipple, foliage
  fades and the scene switches to a Prussian-blue cyanotype ground. A depth
  scale, root-depth ring and spread dimension are drawn in 3D.
- **Anatomy view**: hover or click leaf, stem, crown, soil and roots directly on
  the model or via hotspots; an explanation card appears.
- **Specimen sheet**: light, temperature, humidity, water, feeding calendar,
  substrate mix, growth, size, toxicity, difficulty and root profile.
- **Comparison**: to-scale height lineup and shared-axis trait plots.
- Keyboard: `1` `2` `3` switch views, `R` resets the camera, `+`/`-` zoom,
  `Esc` closes the anatomy card. Honors `prefers-reduced-motion`.

## Structure

```
src/
  data/
    types.ts        Plant schema (metadata, care, dimensions, roots, anatomy, model ref)
    plants.ts       The dataset
  three/
    Stage.tsx       Canvas, lights, camera framing per view
    Specimen.tsx    Pot + plant + roots, view transitions, plant switching, picking
    PlantModel.tsx  Procedural or GLTF plant, region materials
    Vessel.tsx      Pot, soil, stipple, ground shadow (unit-size, eased per plant)
    RootRuler.tsx   Root-view measuring overlay
    Hotspots.tsx, ScreenAnchors.tsx, anchorRegistry.ts
                    Projects 3D anchors onto DOM labels (ui/StageOverlay.tsx)
    models/
      registry.ts   Builds and caches geometry per plant, bounds, hotspot snapping
      rosette.ts    Rosette generator (Chlorophytum)
      palm.ts       Clustering pinnate palm generator (Dypsis, Chamaedorea)
      calathea.ts   Petiolate leaf clump with patterned two-sided blades (Goeppertia)
      dracaena.ts   Woody canes with terminal leaf tufts (Dracaena marginata)
      roots.ts      Root growth as constrained random walks inside the pot
      geometry.ts   Mesh builder for ribbons and tubes
  ui/               Panel, controls, comparison, glyphs, small data graphics
```

## Adding a plant

1. Add a `Plant` entry to `src/data/plants.ts`. All UI reads from this entry.
   Set `dataQuality: 'placeholder'` until the values have been reviewed; the
   specimen sheet then shows a short note.
2. Choose a model:
   - **Procedural**: set `model.kind: 'procedural'` with `generator: 'rosette'`,
     `'palm'`, `'calathea'` or `'dracaena'` and tune `params`. For a new growth form, add a generator in
     `src/three/models/` that returns `leaves`, `stems`, `crown` and
     `rootOrigins`, and dispatch it in `registry.ts`.
   - **GLB/GLTF**: see below.
3. Anatomy `anchor` values are hints; for procedural models they snap to the
   nearest vertex of the matching region.

## GLB models (prepared, not yet exercised)

The loading path exists but has not been tested with a real asset.

- Files: `public/models/<plant-id>.glb` for the shoot and optionally
  `public/models/<plant-id>-roots.glb` for the roots.
- Data: `model: { kind: 'gltf', url: '/models/<plant-id>.glb', rootsUrl: '/models/<plant-id>-roots.glb', fallback: { kind: 'procedural', ... } }`.
  The optional `fallback` is shown while the file loads and if it fails to
  load (an error boundary catches the failure and logs a warning).
- Scale and origin: metres, Y up, pot rim centre at the origin, soil surface
  just below `y = 0`. The pot and soil are drawn by the app; do not include them.
- Mesh names map to anatomy regions: `leaf_*`/`frond_*`, `stem_*`/`cane_*`,
  `crown_*`/`sheath_*`, `root_*`.
- Not yet supported for GLB: root-view glow, foliage fading and wind, measured
  ruler positions and hotspot snapping (hotspots use the raw anchors, framing
  uses `dimensions`).

## Data status

Care, size and root values are typical indoor recommendations compiled from
general horticultural references. They have not been reviewed and are marked
`dataQuality: 'placeholder'`.
