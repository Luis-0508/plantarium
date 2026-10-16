# Decision records

Short records of significant technical decisions: what was decided, why, and
what it costs. They are written when a decision is made (or, for the first
entries, reconstructed from the code and history) and are not rewritten later;
a changed decision gets a new record that supersedes the old one.

| # | Decision | Status |
|---|---|---|
| [0001](0001-deterministic-procedural-geometry.md) | Deterministic procedural geometry behind a generator registry | Accepted |
| [0002](0002-data-driven-plants-with-quality-flag.md) | One typed data entry per plant, with an explicit data-quality flag | Accepted |
| [0003](0003-dom-labels-projected-from-3d-anchors.md) | DOM labels projected from 3D anchors instead of WebGL text | Accepted |
| [0004](0004-local-kanban-board-for-development.md) | Local Kanban board for development; GitHub Project for maintenance | Accepted; board-conflict rule superseded by 0005 |
| [0005](0005-shared-workflow-and-board-merge-driver.md) | Shared project-template workflow and ID-based board merges | Accepted |

## Template

```markdown
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context
What problem or force made a decision necessary.

## Decision
What we do.

## Alternatives considered
The real options that were rejected, and why.

## Consequences
What becomes easier, what becomes harder, what to watch.
```
