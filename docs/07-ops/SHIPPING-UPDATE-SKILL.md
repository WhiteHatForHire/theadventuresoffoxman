# SHIPPING-UPDATE-SKILL.md - Ops Update Skill

Use this skill after meaningful work has been completed.

The goal is to keep project operating docs current so the repo remains a reliable project brain and shipping system.

This skill updates:

- `docs/07-ops/NEXT-IN-HOPPER.md`
- `docs/07-ops/FUTURE-TODO.md`
- `docs/07-ops/COMPLETED.md`
- Optionally `PROJECT.md`, `AGENTS.md`, or ADRs if current truth changed.

---

# When To Run This Skill

Run this skill after:

- New docs are created.
- App scaffolding is added.
- A feature is implemented.
- A design direction changes.
- A task in `NEXT-IN-HOPPER.md` is completed or blocked.
- New future work is discovered.
- Product direction, architecture, privacy, monetization, or brand direction changes.

Do not run this skill for trivial typo fixes unless the typo fix affects task status or project state.

---

# Skill Invocation

Use this prompt:

    Run the Shipping Update Skill.

    Inspect the current repo state, recent changes, and existing ops docs.

    Update project operating docs so they accurately reflect what has been completed, what should happen next, and what belongs in the future backlog.

    Files to review:

    - `PROJECT.md`
    - `AGENTS.md`
    - `docs/FOXMANS_INITIATIVE.md`
    - `docs/07-ops/SKILLS.md`
    - `docs/07-ops/NEXT-IN-HOPPER.md`
    - `docs/07-ops/FUTURE-TODO.md`
    - `docs/07-ops/COMPLETED.md`
    - Any files changed in the current branch or recent work session
    - Relevant ADRs in `docs/06-decisions/`

    Do not invent completed work. Only mark work complete if it is actually present in the repo.

    Do not overfill `NEXT-IN-HOPPER.md`. Keep it focused on the next 5-10 actionable tasks.

    If a task was completed, move or summarize it in `COMPLETED.md`.

    If a task remains active, update its status or acceptance criteria in `NEXT-IN-HOPPER.md`.

    If new work was discovered but should not be done soon, add it to `FUTURE-TODO.md`.

    If product direction or architecture changed, update `PROJECT.md` or create/update an ADR.

    At the end, summarize:
    1. What was completed.
    2. What changed in the ops docs.
    3. What is now next in the hopper.
    4. Any blocked or unclear items.

---

# Update Rules

## 1. Update `COMPLETED.md`

Add a completed entry when work is actually done.

Use the current date.

Keep entries factual.

Do not claim that something shipped if it was only discussed.

## 2. Update `NEXT-IN-HOPPER.md`

This file should only contain active near-term work.

When updating:

- Remove or update completed tasks.
- Mark blocked tasks clearly.
- Add new immediate tasks only if they are truly next.
- Keep the hopper to roughly 5-10 tasks.
- Make acceptance criteria concrete.
- Keep P0/P1 priorities realistic.
- Do not turn it into a giant backlog.

## 3. Update `FUTURE-TODO.md`

Use this file for parked ideas and future work.

Add items here when:

- The idea is good but not next.
- The work is blocked by another milestone.
- The feature belongs after MVP.
- The task is too speculative for the active hopper.

---

# State Classification

## Completed

The file, feature, doc, or decision exists and is usable.

Action:

- Add to `COMPLETED.md`.
- Remove or update matching item in `NEXT-IN-HOPPER.md`.

## Active / Next

The task should be worked on soon and has clear acceptance criteria.

Action:

- Add or keep in `NEXT-IN-HOPPER.md`.

## Future / Parked

The task matters but is not next.

Action:

- Add to `FUTURE-TODO.md`.

## Blocked

The task cannot proceed until another action happens.

Action:

- Keep in `NEXT-IN-HOPPER.md` only if it is still near-term.
- Mark as blocked and state the blocker.
- Otherwise move to `FUTURE-TODO.md`.

## Superseded

The task no longer applies because the decision changed.

Action:

- Remove from active hopper.
- Mention in `COMPLETED.md` or an ADR if the change matters.

---

# Final Response Format

After running this skill, respond with:

    # Shipping Update Complete

    ## Completed Work Logged

    - ...

    ## Hopper Updated

    - ...

    ## Future Todo Updated

    - ...

    ## Current Next Task

    The next best task is: ...

    ## Notes / Blockers

    - ...

If no update was needed, say that clearly and explain why.
