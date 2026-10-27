# Project state

Narrative snapshot of where Plantarium stands. **The repository is
authoritative:** if git, the code, or GitHub issues disagree
with this file, trust them and correct this file.

- Last updated: 2026-10-16
- Verified against: `main` at `f4f3417`

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
- Development workflow: planned work in GitHub issues and milestones
  (decision 0006), project memory in `docs/`, SessionStart context hook
  (K-1, PR #32) and workflow tests in `scripts/workflow/`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how it fits together and
[DECISIONS/](DECISIONS/README.md) for why.

## Active work

- No issue in progress. K-1 (project memory, session hook) merged via
  PR #32.
- PR #33 (records K-1 as landed in this file and the board) is open.
- Workflow migration to the shared project template on
  `chore/unified-claude-workflow` (contains PR #33's commit); PR open for
  review. Maintenance work, no issue.

## Blockers

- None in code.
- Maintainer action pending: enable the "Auto-add to project" workflow on
  GitHub Project #7 (UI only) so Dependabot and outside issues/PRs land there
  without manual adds.

## Next priorities

This order is the priority. All three are stubs whose specs need refining and
approval before implementation:

1. **#47** Review one species' care and size data against cited sources.
2. **#48** Test the GLB model path end to end with a real asset.
3. **#49** Adaptive rendering quality for lower-end devices.

Routine maintenance (Dependabot PRs #25, #26, #28–#31) is tracked on GitHub
Project #7, not in the development milestones.

## Known limitations

- All plant values are `placeholder`; the source catalog is empty.
- No real GLB asset has been reviewed; GLB models lack root-view glow,
  foliage fading and wind, measured ruler positions and hotspot snapping.
- Requires WebGL 2; low-end device performance is unmeasured.
