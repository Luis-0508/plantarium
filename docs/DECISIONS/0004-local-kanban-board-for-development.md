# 0004. Local Kanban board for development; GitHub Project for maintenance

- Status: Superseded by [0006](0006-github-issues-for-planned-work.md) (Kanban board parts)
- Date: 2026-10-16

## Context

Development is done largely in Claude Code sessions. Each session starts
without memory, and the maintainer needs to see what is planned, in progress
and finished. GitHub Project #7 ended up tracking mostly pull requests
(Dependabot bumps included) rather than development work, and keeping it in
sync costs API calls in every session.

## Decision

- Development tasks live on a local board managed by the
  [claude-kanban](https://github.com/CjS77/claude-kanban) plugin:
  `.kanban/board.json`, committed with the code. Columns are To do, Doing,
  Review and Done; a ticket's `status` (`draft`, `stub`, `review`, `ready`)
  says how well-defined it is.
- The plugin is installed per user (not declared in project settings), pinned
  to a release tag, and its binary is verified with
  `gh attestation verify` against the tag's commit. Auto-merge, auto-review
  and minesweeper delegation stay off. The `/kanban:work` loop and its own
  worktrees are not used; sessions use the MCP tools on their normal branch
  and land work through pull requests.
- GitHub Project #7 stays for maintenance and external contributions
  (Dependabot, outside issues and PRs). When an outside issue is accepted as
  development work, it gets a board ticket referencing `GH #N`; from then on
  the ticket is the source of truth and the PR closes the issue.
- `docs/PROJECT_STATE.md`, `docs/ARCHITECTURE.md` and these records hold the
  narrative memory. A `SessionStart` hook prints live git and board state.

## Consequences

- The board is readable without network access and reviewable in diffs.
- Done means "landed in local `main`": after a squash merge on GitHub, the
  card moves once `main` is pulled (detected through the PR poll).
- `board.json` changes ride along with whatever branch is checked out in the
  main working tree; parallel PRs can conflict in that file. Resolve by keeping
  the newer board.
- External contributors do not need the plugin; the board is plain JSON.
- The plugin has a single maintainer and no LICENSE file in its repository
  (the README states MIT OR Apache-2.0). Upgrades must be deliberate: re-pin,
  re-verify the binary, review the changelog. If it is abandoned, the JSON and
  the docs remain usable.
- PreCompact hooks were rejected: they cannot add content to the compacted
  context, while `SessionStart` with the `compact` matcher re-injects state
  after compaction.
