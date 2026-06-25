# AGENTS.md

This repo is the working project brain for `The Adventures of Foxman, a Merciless Bastard`.

## Required Agent Behavior

When starting meaningful work:

1. Read `PROJECT.md`.
2. Read this file.
3. Read `docs/FOXMANS_INITIATIVE.md`.
4. Check `docs/07-ops/SKILLS.md`.
5. Check `docs/07-ops/NEXT-IN-HOPPER.md`.
6. Read relevant product, design, architecture, prompt, or ADR docs.
7. Make the smallest useful change that advances the active gate.
8. Update docs or ADRs if product truth changes.
9. Run the Shipping Update Skill after completed meaningful work.
10. Summarize completed work, validation, and open follow-ups.

## Game-Specific Rules

- Do not skip gates in `docs/FOXMANS_INITIATIVE.md`.
- Asset work must be saved into the workspace, not left in generated-image temp storage.
- Any code that references an asset must reference a project-local asset file.
- Smoke test after each meaningful implementation slice.
- Keep combat readability above visual noise.
- Keep crude humor pointed at the fictional world, corrupt institutions, cowardice, arrogance, and Foxman's own bad behavior.
- Avoid explicit sexual content, protected-class slurs, real-person defamation, or humor that depends on harassing real groups.

## Technical Direction

The default planned stack is Vite, TypeScript, and Phaser 3. Do not replace the stack without an ADR in `docs/06-decisions/`.

## Skills And Operating Docs

Agents should check:

- `docs/07-ops/SKILLS.md`

The main operating docs are:

- `docs/07-ops/OPERATING-MANUAL.md` - how to use the repo as an agentic project brain and shipping system.
- `docs/07-ops/PROMPT-TEMPLATE.md` - reusable prompt templates for common agent runs.
- `docs/07-ops/NEXT-IN-HOPPER.md` - active near-term build queue.
- `docs/07-ops/FUTURE-TODO.md` - parked backlog and future ideas.
- `docs/07-ops/COMPLETED.md` - completed work log.
- `docs/07-ops/SHIPPING-UPDATE-SKILL.md` - reusable skill for updating project state after meaningful work.

Every meaningful PR or work session should update one of:

- `docs/07-ops/NEXT-IN-HOPPER.md`
- `docs/07-ops/FUTURE-TODO.md`
- `docs/07-ops/COMPLETED.md`

Do not let completed work remain as active work in the hopper.

## Collaboration Safety

- You may be sharing the worktree with a human or other agents.
- Do not revert changes you did not make unless explicitly asked.
- Do not commit secrets, credentials, private data, or real user data.
- Keep changes focused and reviewable.
- Prefer project-local patterns over new abstractions.
