# AGENTS.md

Project rules for coding agents working on Plantarium. See `README.md` for the
architecture and `CONTRIBUTING.md` for workflows.

## Language

- Code, comments, docs, filenames, commits, branches and PRs: English.
- User-facing app text (UI labels, plant data, `index.html` metadata): German.
  Keep it German; do not translate it.

## Architecture

- Keep the existing split: `src/data` (schema + dataset), `src/three`
  (scene), `src/three/models` (pure geometry generators), `src/ui` (DOM UI),
  `src/ui/viz` (small SVG data graphics). All plant-specific behaviour comes
  from data; avoid per-plant special cases in components.
- New growth forms are new generators in `src/three/models/`, dispatched in
  `registry.ts`, with a matching params type in `src/data/types.ts`.
- Do not overengineer: no new state libraries, frameworks or abstractions
  without a concrete need. No unrelated refactors.

## Procedural geometry

- Generators must stay deterministic: all randomness goes through the seeded
  `Rng` (`models/rng.ts`). Never use `Math.random()` or time-based values.
- Changing a generator changes every plant using it; check all of them.

## Plant data

- Values are `dataQuality: 'placeholder'` until reviewed against sources.
  Never switch an entry to `'reviewed'` without actual review, and never
  present placeholder values as authoritative in UI or docs.

## Finishing work

- Run `npm run lint` and `npm run build`; both must pass.
- Update `README.md` / `CONTRIBUTING.md` when setup, architecture, data schema
  or the GLB contract changes.
- Do not add AI co-author or attribution lines to commits or PRs.
