# 0001. Deterministic procedural geometry behind a generator registry

- Status: Accepted
- Date: 2026-09-30 (recorded 2026-10-16 from code and history)

## Context

Plantarium needs several plant species with recognisable growth forms, a root
system inside the pot and anatomy regions that can be highlighted and picked.
Hand-modelled assets would need sourcing, licensing and per-asset rigging for
roots and regions; none were available.

## Decision

Plants are grown in code. Each growth form is a pure generator in
`src/three/models/` (`rosette`, `palm`, `calathea`, `dracaena`) that returns
region-separated geometry (`leaves`, `stems`, `crown`) and root origins;
`roots.ts` grows the roots. `registry.ts` dispatches on `params.type` and
caches the result per plant object.

All randomness goes through a seeded PRNG (`rng.ts`, mulberry32). The same
`seed` and parameters always produce the same plant.

## Consequences

- Reproducible output makes geometry unit-testable and screenshots stable.
- One generator serves several species through parameters (both palms).
- Changing a generator changes every plant using it, so every user must be
  checked.
- `Math.random()` and time-based values are forbidden in generators.
- GLB assets remain possible as an alternative model kind, but lose effects
  that depend on knowing the procedural structure (snapping, root glow).
