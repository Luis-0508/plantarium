@AGENTS.md

# Claude Code: project board workflow

Development progress is tracked on the GitHub Project
**Plantarium** (https://github.com/users/Luis-0508/projects/7), a board
grouped by `Status`. Keep it accurate as a side effect of normal work, without
the user moving cards.

## IDs (use directly, no lookups needed)

- Project: number `7`, owner `Luis-0508`, id `PVT_kwHOAp5RJ84BnT_A`
- Status field: `PVTSSF_lAHOAp5RJ84BnT_Azhl5L_I`
- Status options: Backlog `d753709e`, Todo `f75ad846`, In Progress
  `47fc9ee4`, In Review `2b71bcf3`, Blocked `2c751a0f`, Done `98236657`

Set a status (item id comes from `item-add` or `item-list`):

```bash
gh project item-edit --project-id PVT_kwHOAp5RJ84BnT_A --id <ITEM_ID> --field-id PVTSSF_lAHOAp5RJ84BnT_Azhl5L_I --single-select-option-id <OPTION_ID>
```

## What GitHub does automatically (do not duplicate)

- Item added to project → `Todo`
- Issue or PR closed / PR merged → `Done`
- Item moved to `Done` → linked issue is closed
- Sub-issues of a tracked issue are added automatically
- A PR body with `Closes #N` closes issue N on merge, which moves it to `Done`

## What Claude does

1. **When to track.** Create an issue only for non-trivial work: a feature,
   bug fix or change spanning several steps or files. Typo fixes, one-line
   tweaks, pure questions and read-only investigations get no issue.
2. **Check first.** Before creating an issue, search open issues
   (`gh issue list --search "<keywords>"`) and reuse a matching one.
3. **Breaking down.** Split a large request into a parent issue plus
   sub-issues that each fit roughly one PR. Each issue has a short goal and a
   checklist of acceptance criteria. Use the existing labels; do not invent new
   ones without need. Create with `gh issue create ... --project "Plantarium"`;
   sub-issues are linked via `gh api` (`addSubIssue`) and join the board
   automatically.
4. **Starting.** When work on an issue begins, set it to `In Progress`. Not yet
   started items stay in `Todo`; ideas without a plan go to `Backlog`.
5. **Milestones and blockers.** Comment on the issue only at meaningful
   milestones (approach decided, partial result, scope change), not per
   commit. When blocked, set `Blocked` and comment what blocks it, what was
   tried and what is needed to continue. Move it back to `In Progress` once
   resolved.
6. **Pull request.** The PR body references the issue (`Closes #N`; for
   partial work `Refs #N`). After opening the PR, add the PR to the project and
   set both the PR and the issue to `In Review`.
7. **Done.** Never set `Done` manually for merged work; the merge does it. Set
   `Done` by hand only for items finished without a PR after verification.
   PRs stay open for the user's review; Claude never merges them unasked.
8. **Economy.** Batch status changes, use the IDs above instead of querying,
   and skip board updates that a built-in automation already handles.
