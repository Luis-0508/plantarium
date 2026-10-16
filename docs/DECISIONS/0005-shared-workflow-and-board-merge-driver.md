# 0005. Shared project-template workflow and ID-based board merges

- Status: Accepted
- Date: 2026-10-16

## Context

Decision 0004 introduced the local board and said to resolve conflicts in
`.kanban/board.json` by keeping the newer board. Board changes ride along with
whatever branch is checked out in the main working tree, so parallel branches
regularly carry different versions of the file, and keeping one whole side
silently drops the other side's tickets and notes. The maintainer's other
projects adopt the same Claude Code workflow from a shared (private) project
template, which
solves this with a merge driver and maintains the session hook and its tests
in one place.

## Decision

- Adopt the template's workflow files: the session hook moves from
  `scripts/session-context.mjs` to `.claude/hooks/session-context.mjs` and now
  also injects `docs/PROJECT_STATE.md`; `scripts/workflow/` holds the board
  merge driver and the workflow tests, run in CI by
  `.github/workflows/workflow-checks.yml`.
- `.gitattributes` routes `.kanban/board.json` to
  `scripts/workflow/kanban-merge-driver.mjs`, which merges by ticket and epic
  ID and flags genuine conflicts. Each clone enables it once with
  `git config` (see `docs/WORKFLOW.md`).
- This supersedes the "keep the newer board" rule in 0004. Everything else in
  0004 (local board, Project #7 for maintenance, no `/kanban:work`,
  auto-merge and auto-review off) stays.

## Alternatives considered

- Keep resolving by hand or by keeping the newer file: loses tickets and
  notes without notice.
- Line-based `merge=union`: produces invalid JSON on overlapping edits.

## Consequences

- Board conflicts resolve by ID during local `git merge` and `git rebase`.
  GitHub's web merge does not run custom drivers; rebase locally when a pull
  request shows a conflict in `board.json`.
- Clones without the `git config` fall back to a normal text merge; the
  session hook warns about it.
- Workflow changes from the template are ported deliberately, not copied over
  Plantarium-specific rules.
