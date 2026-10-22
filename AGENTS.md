# Plantarium project guidance

Rules for anyone changing this repository: human contributors and coding agents
alike. They are tool-independent; tool-specific workflow lives in separate files
(for example `CLAUDE.md`) and never overrides these rules.

## Language and collaboration

- Treat this repository as a public open-source project with external contributors.
- Use English for documentation, README content, filenames, folder names, code comments, configuration comments, branch names, commit messages, PR titles/descriptions, and issue text.
- Do not force a conversation language. Follow the contributor's or user's language for discussion.
- The app is bilingual where localization already exists. Keep all supported locales complete when changing user-facing text.
- Keep README quality high: concise overview, polished feature presentation, real screenshots/renders, setup, architecture/structure, data-quality status, contribution guidance, and license links. Reuse real repository assets; never fabricate screenshots, sources, or capabilities.

## Project knowledge

The repository is the source of truth. Short documents in `docs/` record what the code alone cannot tell:

| File | Purpose |
|---|---|
| `docs/PROJECT_STATE.md` | What exists, active work, blockers, next priorities. A snapshot that may be stale. |
| `docs/ARCHITECTURE.md` | Modules, boundaries and data flow a maintainer needs to change the code safely. |
| `docs/DECISIONS/` | Numbered decision records: context, decision, consequences. |

- Read `PROJECT_STATE.md` before larger work, and the architecture or decision records only when the task touches that area.
- When a document disagrees with git or the code, trust the repository and correct the document.
- Update `ARCHITECTURE.md` when modules, boundaries or data flow change. Add a decision record when choosing between real alternatives a future maintainer might question (new dependency, architecture boundary, data format, workflow). Do not rewrite accepted records; supersede them with a new one.
- Keep these documents short and factual. Do not document unimplemented features.
- `docs/WORKFLOW.md` explains how these documents, the maintainer's task board (not required for contributors) and the workflow checks fit together.

## Efficiency

- Start with the requested change and adjacent files/tests. Use targeted searches and small file ranges instead of broad repository dumps.
- Do not repeatedly re-read unchanged files or load unrelated documentation.
- Prefer small, focused diffs. Avoid unrelated refactors, formatting churn, duplicate docs, speculative abstractions, and unnecessary dependencies.
- Keep final reports concise: change, checks, and remaining risks or blockers.

## Project rules

- Preserve the existing split between data, Three.js scene/model code, and UI. Avoid per-plant special cases when behavior belongs in data.
- Procedural generators must stay deterministic; use the seeded RNG rather than Math.random() or time-based values.
- Keep plant values marked as placeholder until they are actually reviewed against sources.
- Run lint, build, unit tests, and browser tests for substantial changes.
- Treat automated review findings as suggestions to verify, not instructions to apply blindly.

## Git and pull requests

- Use a focused branch and pull request for every normal change; one concern per pull request.
- Fill in the pull request template: summary, validation actually run, risks and follow-ups. Reference related issues (`Closes #N`).
- Do not force-push or rewrite shared history unless explicitly required. Merging is a maintainer decision.
