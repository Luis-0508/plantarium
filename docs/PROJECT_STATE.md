# Project state

Narrative snapshot of where Plantarium stands. **The repository is
authoritative:** if git, the code, `.kanban/board.json` or GitHub disagree
with this file, trust them and correct this file.

- Last updated: 2026-10-16
- Verified against: `main` at `dde4ae4` plus branch `chore/project-board-workflow`

## What exists

- Interactive 3D explorer for five houseplants (spider plant, areca palm,
  parlor palm, peacock plant, Madagascar dragon tree) with plant, root and
  anatomy views, pot/soil toggles, day/evening pose and camera tools.
- Four procedural growth forms (rosette, palm, calathea, dracaena) plus
  procedural roots; deterministic per seed.
- Specimen sheet with SVG care graphics and a comparison page.
- English/German UI and plant texts, English default.
- GLB model path with procedural fallback (synthetic files only).
- Test suite: Vitest unit tests, Playwright dev and production browser tests,
  all in CI. TypeScript strict mode.
- Remotion showcase video in `video/` (separate npm project).
- Repository automation: CI, PR labeler, daily Dependabot.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how it fits together and
[DECISIONS/](DECISIONS/README.md) for why.

## Active work

- **K-1** Set up Kanban board, project memory and session context hook —
  in Review: branch `chore/project-board-workflow`, PR #32 open for the
  maintainer. Moves to Done once merged and pulled into local `main`.

## Blockers

- None in code.
- Maintainer action pending: enable the "Auto-add to project" workflow on
  GitHub Project #7 (UI only) so Dependabot and outside issues/PRs land there
  without manual adds.

## Next priorities

Order on the board (To do, top first) is the priority; the maintainer
reorders by dragging. All three are `stub`s whose specs need refining and
approval before implementation:

1. **K-2** Review one species' care and size data against cited sources.
2. **K-3** Test the GLB model path end to end with a real asset.
3. **K-4** Adaptive rendering quality for lower-end devices.

Routine maintenance (Dependabot PRs #25, #26, #28–#31) is tracked on GitHub
Project #7, not on the development board.

## Known limitations

- All plant values are `placeholder`; the source catalog is empty.
- No real GLB asset has been reviewed; GLB models lack root-view glow,
  foliage fading and wind, measured ruler positions and hotspot snapping.
- Requires WebGL 2; low-end device performance is unmeasured.
- Board "Done" detection after a GitHub squash merge needs `main` pulled
  locally and the board's PR poll to have seen the merge.
