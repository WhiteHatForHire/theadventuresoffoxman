# PROMPT-TEMPLATE.md - Agent Task Prompt Template

Use this template when creating focused prompts for agents.

The goal is to make each agent run clear, bounded, reviewable, and easy to update in project state.

---

# Standard Task Prompt

```txt
You are working in `/Users/marcusvale/Documents/june25game`.

Complete only: `[task name]`.

Read first:

- `PROJECT.md`
- `AGENTS.md`
- `docs/FOXMANS_INITIATIVE.md`
- `docs/07-ops/NEXT-IN-HOPPER.md`
- [relevant docs]
- [relevant source files]

Scope:

- Work only in `[allowed paths]`.
- Do not edit `[forbidden paths]`.
- Do not commit or push unless explicitly asked.

Goal:

[Describe the intended outcome.]

Requirements:

- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Rules:

- Do not add secrets, real user data, or credentials.
- Do not create production infrastructure unless explicitly requested.
- Do not change product direction unless required.
- Preserve existing architecture decisions.
- Keep changes focused.
- Smoke test after meaningful implementation work.

Validation:

- `[command 1]`
- `[command 2]`
- `[command 3]`

Return:

- Changed files.
- What changed.
- Validation results.
- Risks or follow-ups.
```

---

# Prompt Checklist

Before sending a prompt, confirm it includes:

- [ ] Repo path.
- [ ] Exact task name.
- [ ] Files to read first.
- [ ] Allowed write scope.
- [ ] Forbidden changes.
- [ ] Clear goal.
- [ ] Acceptance criteria.
- [ ] Validation commands.
- [ ] Return format.
- [ ] Whether to commit/push or not.

---

# Common Follow-Up Runs

## Review Work Locally

```txt
Review the recent changes locally.

Read the task prompt, changed files, PROJECT.md, AGENTS.md, docs/FOXMANS_INITIATIVE.md, and relevant docs.

Do not edit unless you find a small clear bug.

Return:
- Pass/fail summary.
- Findings ordered by severity.
- Files reviewed.
- Validation results.
- Recommended next steps.
```

## Run Shipping Update

```txt
Run the Shipping Update Skill from docs/07-ops/SHIPPING-UPDATE-SKILL.md based on the work just completed.
```

## Commit And Push

```txt
Review git status.

Commit all intended changes with this message:

"[commit message]"

Do not include unrelated dirty files.

Push to main/current branch.

Return:
- Files committed.
- Commit hash.
- Push result.
```
