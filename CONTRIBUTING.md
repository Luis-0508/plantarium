# Contributing to Plantarium

Thanks for your interest. This guide covers the workflow and the parts of the
codebase that need extra care. For an overview of features and architecture,
see the [README](README.md).

## Setup

Prerequisites: [Node.js](https://nodejs.org/) 24 LTS (or newer) with npm, and a
browser with WebGL 2.

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:5173
npm run lint       # oxlint
npm run build      # type-check (tsc -b) and production build into dist/
npm test           # deterministic data and geometry tests (Vitest)
npx playwright install chromium # install the browser once
npm run test:browser # Chromium checks at desktop, tablet and mobile sizes
npm run preview    # serve the production build locally
```

CI runs `npm ci`, lint, the type-checked build, unit tests and browser tests on
every push to `main` and every pull request, including dependent PR branches.
Use `npm run test:watch` while developing. Browser tests use a dedicated Vite
server on port 4173 and Chromium software rendering; no external fonts are
required. Test artifacts are written to ignored `test-results/`.

## Language

Code, comments, documentation and Git metadata are written in English. The
application's user-facing text and plant data are German and stay German.

## Branches, commits and pull requests

- Branch from `main` with a short, descriptive name:
  `feat/fern-generator`, `fix/root-ruler-offset`, `docs/glb-contract`,
  `chore/update-deps`.
- Write commits in the imperative mood and keep them focused, e.g.
  `feat: add fern generator` or `fix: clamp root depth to pot floor`.
  A few coherent commits are better than one commit per file.
- Open a pull request against `main` and fill in the template. Include
  screenshots for anything visible, and check desktop and narrow viewports
  when the UI changes.
- Keep pull requests focused; avoid unrelated refactors or formatting changes.
- Update the README or this guide when you change setup, architecture, the data
  schema or the GLB contract.

## Adding a plant

1. Add a `Plant` entry to [`src/data/plants.ts`](src/data/plants.ts). The schema
   lives in [`src/data/types.ts`](src/data/types.ts); every panel, chart and the
   comparison page read from this entry.
2. Give it a stable `id` (used in the URL, e.g. `#pflanze/<id>`), a distinct
   `swatch` colour and German texts consistent with the existing entries.
3. Choose a model: an existing procedural generator (`rosette`, `palm`) with
   tuned `params` and a `seed`, a new generator (below), or a GLB asset (below).
4. Add `anatomy` notes. Their `anchor` positions are hints; for procedural
   models they snap to the nearest vertex of the matching region.
5. Check the plant in all three views and on the comparison page, on desktop
   and on a narrow viewport.

## Adding a procedural growth form

1. Add a params interface to `src/data/types.ts` with a `type` discriminator
   and extend `ProceduralParams` and the `generator` union.
2. Write a generator in `src/three/models/<form>.ts`. Follow `rosette.ts` and
   `palm.ts`: build meshes with `MeshBuilder` from `geometry.ts` and return
   `leaves`, `stems`, `crown` and `rootOrigins` (points on the soil surface
   where roots emerge). Roots are generated separately by `roots.ts`.
3. Dispatch it in `buildProceduralGeometry` in `src/three/models/registry.ts`.
4. Keep it deterministic: draw every random value from the `Rng` passed in,
   never from `Math.random()` or the clock. The same seed must always produce
   the same plant, because camera framing, hotspot snapping and root-view
   measurements are derived from the generated geometry.
5. Use metres, Y up, with the pot rim centre at the origin.

When changing an existing generator, check every plant that uses it.

## GLB assets

The GLB path has a small synthetic GLTF regression fixture for loading and
failure recovery. It has not yet been tested with a real horticultural asset;
treat it as experimental and include screenshots when you exercise it.

- Files: `public/models/<plant-id>.glb` for the shoot and optionally
  `public/models/<plant-id>-roots.glb` for the roots.
- Units and origin: metres, Y up, pot rim centre at the origin, soil surface
  just below `y = 0`. Do not include the pot or soil; the app draws them.
- Mesh names map to anatomy regions: `leaf_*`/`frond_*`, `stem_*`/`cane_*`,
  `crown_*`/`sheath_*`, `root_*`.
- Provide a procedural `fallback` in the model reference; it is shown while the
  file loads and if loading fails.
- Only add assets you are allowed to redistribute, and state their source and
  license in the pull request.

## Data quality

Care, size and root values currently come from general horticultural care
guides and are marked `dataQuality: 'placeholder'`; the specimen sheet shows a
note for these entries.

- New or changed values stay `placeholder` unless they have actually been
  reviewed against reliable sources.
- Only set `dataQuality: 'reviewed'` together with the sources used, listed in
  the pull request.
- Do not describe placeholder values as verified in the UI or documentation.

### Source references

Add consulted sources to `src/data/sources.ts` with a stable `id`, `title`,
`author` (person or organization), `url`, `accessedOn` (YYYY-MM-DD) and optional
`notes`. Reference their IDs from a plant's optional `sourceRefs`, grouped by
`care`, `dimensions`, `roots` and `anatomy`. One source can support several
sections or plants. Do not invent sources or treat a citation as verification.
Unreferenced sections remain unverified; keep the whole entry `placeholder`
until all sections have been checked. Dataset tests enforce valid references
and require references for every section of an entry marked `reviewed`.

Treat plant records as immutable inputs. To change model parameters, replace
the plant object (including changed nested values). Geometry and bounds use
weak caches keyed by object identity, so a replacement with the same ID gets
fresh geometry. The single mounted procedural specimen releases its GPU
buffers on unmount; cached CPU arrays can be uploaded again on later visits.

Generator tests check complete root surfaces, including tuber swellings,
against the pot wall, soil surface, declared depth and spread. Do not loosen
these limits to conceal a geometry regression.

### Performance checks

Before changing DPR, shadows or model detail, profile all three plants in the
three modes on a real mobile device and desktop. Record frame time and GPU
memory during orbiting, plant switches and repeated explorer/comparison visits.
The continuous loop is currently needed for foliage and transitions; no device
quality heuristics are applied without measurements.
