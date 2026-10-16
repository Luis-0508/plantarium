# 0002. One typed data entry per plant, with an explicit data-quality flag

- Status: Accepted
- Date: 2026-10-01 (recorded 2026-10-16 from code and history)

## Context

Every view (3D stage, specimen sheet, comparison) shows the same plant facts.
The care and size values were compiled from general guides and have not been
checked against horticultural sources yet, but the app presents them in a
polished, authoritative-looking way.

## Decision

Each plant is a single typed `Plant` entry in `src/data/plants.ts`; all views
derive from it and no component special-cases a plant. User-facing texts are
`Localized` (`{ en, de }`). Each entry carries
`dataQuality: 'placeholder' | 'reviewed'`, and reusable sources live in
`src/data/sources.ts`, referenced per subject via `sourceRefs`.

## Consequences

- Adding a plant is a data change plus, at most, a new generator.
- The UI can and does label placeholder values; comparison keeps that
  provenance (#13).
- An entry may only become `reviewed` after real source review; tests and
  review must keep placeholder values from being presented as authoritative.
- The source catalog is empty today, so all plants are placeholder.
