@AGENTS.md

# Claude Code workflow for Plantarium

`AGENTS.md` (imported above) holds the project rules and wins over anything
here. This file adds how Claude Code sessions keep continuity: what has been
built, what is in progress, what comes next and why.

## Sources of truth

| What | Where | Authority |
|---|---|---|
| Code, history, branches | git | Highest. Always wins. |
| Development tasks and their state | `.kanban/board.json` (claude-kanban) | Live task state |
| Narrative state, blockers, priorities | `docs/PROJECT_STATE.md` | Snapshot; may be stale |
| Code structure and data flow | `docs/ARCHITECTURE.md` | Explanation |
| Why things are the way they are | `docs/DECISIONS/` | Decision records |
| Dependabot, outside issues and PRs | GitHub Project #7 | Maintenance only |

Notes are never authoritative over the repository. When they disagree, verify
against git and GitHub, act on the facts, and correct the note.

## Session start

A `SessionStart` hook (`scripts/session-context.mjs`) prints branch, sync
state, uncommitted files, recent commits, a staleness hint for
`PROJECT_STATE.md` and the board's Doing / Review / top To do tickets. Then:

1. Read `docs/PROJECT_STATE.md`. Read `docs/ARCHITECTURE.md` and decision
   records only when the task touches that area.
2. Reconcile: tickets in Doing or Review must match real branches and PRs
   (`gh pr list --state all --limit 10` when the hook output raises doubts).
   Fix the board or the state file if they are wrong, and say so.
3. Continue the ticket in Doing if the user's request is about it; otherwise
   handle the request, and when asked "what next", take the top unblocked
   ticket in To do.

If the board tools (`kanban_*`) are unavailable, the plugin is not installed
in this environment: work normally, read `.kanban/board.json` directly, and do
not hand-edit it.

## Task workflow (non-trivial work only)

Trivial changes (typos, one-line fixes, questions, read-only investigation)
get no ticket. For everything else:

1. **Check first.** `kanban_board` (and `include_done=true` if needed); reuse a
   matching ticket instead of creating a duplicate.
2. **Ticket.** `kanban_create_ticket` with a clear title and a body containing
   the goal and a checklist of acceptance criteria. Put it in an epic when it
   belongs to a larger feature. Use `status: "ready"` when the spec is agreed,
   `"stub"` when it still needs refining.
3. **Break down** large features into tickets that each fit roughly one PR,
   linked with `depends_on`. Create only what is planned now; no speculative
   tickets to fill the board.
4. **Prioritise** by position in To do (top = next). The maintainer reorders
   by dragging; propose an order, do not silently reshuffle theirs.
5. **Start.** `kanban_claim` moves the ticket to Doing. Work on a normal git
   branch (or the Desktop session's worktree). Do not use `/kanban:work`,
   `kanban_worktree_start`, auto-merge or `auto_review`.
6. **Milestones and blockers.** `kanban_note` at meaningful points (approach
   chosen, partial result, scope change), not per commit. When blocked, note
   what blocks it, what was tried and what is needed, then `kanban_release`
   it, and record the blocker in `PROJECT_STATE.md`.
7. **Review.** After the PR is opened, `kanban_move` the ticket to `review`
   with `branch: "<branch name>"` and note the PR URL. The PR body references
   the ticket id (`K-N`) and any GitHub issue (`Closes #N`).
8. **Done.** Never move a ticket to Done by hand. The board moves it once the
   PR's merge reaches local `main` (pull after merging). Work abandoned for
   good is discarded by the maintainer.

Board writes change `.kanban/board.json`; commit it together with the work on
the current branch. In a merge conflict on that file, keep the newer board.

## Project memory upkeep

Update `docs/PROJECT_STATE.md` (and its "Last updated" / "Verified against"
lines):

- after a meaningful milestone (feature merged, ticket finished),
- before ending substantial work, including what is left unfinished,
- when blockers or priorities change.

Write a decision record in `docs/DECISIONS/` when choosing between real
alternatives that a future maintainer might question (new dependency,
architecture boundary, data format, workflow). Update `docs/ARCHITECTURE.md`
when modules, boundaries or data flow change. Keep all of it in English and
short; record facts that the code cannot tell.

## Explaining changes

After substantial changes, give the maintainer a concise explanation in the
conversation language covering: what changed; how it works technically; which
files and modules matter; why this approach; how to test or inspect it; and
remaining trade-offs or limitations. Explanations worth keeping go into
`ARCHITECTURE.md` or a decision record.

## GitHub Project #7

Maintenance and external contributions only (Dependabot, outside issues and
PRs). Do not add development PRs or tickets to it. When an outside issue is
accepted as development work, create a board ticket mentioning `GH #N` and
close the issue through the PR (`Closes #N`); its built-in workflows move it to
Done on merge.

## Pull requests

Follow the repository's PR template. PRs stay open for the maintainer's
review; never merge or enable auto-merge without explicit approval.
