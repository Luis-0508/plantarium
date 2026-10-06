# Plantarium project guidance

## Language and collaboration

- Treat this repository as a public open-source project with external contributors.
- Use English for documentation, README content, filenames, folder names, code comments, configuration comments, branch names, commit messages, PR titles/descriptions, and issue text.
- Do not force a conversation language. Follow the contributor's or user's language for discussion.
- The app is bilingual where localization already exists. Keep all supported locales complete when changing user-facing text.
- Keep README quality high: concise overview, polished feature presentation, real screenshots/renders, setup, architecture/structure, data-quality status, contribution guidance, and license links. Reuse real repository assets; never fabricate screenshots, sources, or capabilities.

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
- Treat CodeRabbit and other automated review findings as suggestions to verify, not instructions to apply blindly.
