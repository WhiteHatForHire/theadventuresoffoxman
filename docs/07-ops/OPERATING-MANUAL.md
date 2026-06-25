# OPERATING-MANUAL.md - How To Use The Project Brain

This document explains how to use this repo as an agentic project brain and shipping system.

The goal is simple: know what we are building, know what is next, keep agents aligned, and ship without losing context.

---

# 1. The Big Idea

This repo has three jobs:

1. Preserve the product brain.
2. Guide agentic coding.
3. Track shipping progress.

The repo should answer:

- What are we building?
- Why are we building it this way?
- What decisions are already made?
- What should happen next?
- What is parked for later?
- What has already been completed?
- What reusable skills can agents run?

---

# 2. The Core Files

## `PROJECT.md`

Current source of truth.

Use this when asking: what is true right now?

## `AGENTS.md`

Rulebook for agents.

Use this when asking: how should an agent work in this repo?

## `docs/FOXMANS_INITIATIVE.md`

Master initiative doc.

Use this when asking: what are the game vision, gates, milestones, and production plan?

## `docs/06-decisions/`

Architecture Decision Records.

Use this when asking: why did we choose this direction?

## `docs/07-ops/NEXT-IN-HOPPER.md`

Active near-term work queue.

Use this when asking: what should we do next?

## `docs/07-ops/FUTURE-TODO.md`

Parked backlog.

Use this when asking: what should we not do yet, but do not want to lose?

## `docs/07-ops/COMPLETED.md`

Completed work log.

Use this when asking: what has already happened?

## `docs/07-ops/SKILLS.md`

Reusable workflow index.

Use this when asking: what repeatable workflows can I invoke?

## `docs/07-ops/SHIPPING-UPDATE-SKILL.md`

Post-work project-state updater.

Use this when asking: we did work, how do we update the repo brain?

---

# 3. Session Workflow

## Step 1: Orient

Read:

1. `PROJECT.md`
2. `AGENTS.md`
3. `docs/FOXMANS_INITIATIVE.md`
4. `docs/07-ops/SKILLS.md`
5. `docs/07-ops/NEXT-IN-HOPPER.md`
6. Relevant product/design/architecture docs

Prompt:

    Read PROJECT.md, AGENTS.md, docs/FOXMANS_INITIATIVE.md, docs/07-ops/SKILLS.md, and docs/07-ops/NEXT-IN-HOPPER.md. Then tell me the next best task. Do not code yet.

## Step 2: Choose One Gate

Pick one focused task from `NEXT-IN-HOPPER.md`.

Avoid asking agents to do too much at once unless the work has been split into clear, non-overlapping lanes.

## Step 3: Give The Agent The Task

Use a focused prompt with:

- Files to read.
- Exact task.
- Scope.
- Prohibited changes.
- Validation commands.
- Expected return format.

## Step 4: Review The Work

Check:

- Files changed.
- Acceptance criteria.
- Product direction.
- Tests/validation.
- Whether docs need updating.

## Step 5: Run The Shipping Update Skill

Prompt:

    Run the Shipping Update Skill from docs/07-ops/SHIPPING-UPDATE-SKILL.md based on the work just completed.

## Step 6: Repeat

Ask:

    What is now the next task in NEXT-IN-HOPPER.md?

---

# 4. Current Non-Negotiables

- Plan gates before build gates.
- Do not skip asset QA.
- Do not skip smoke tests.
- Do not commit secrets or real user data.
- Keep MVP scope focused on a vertical slice.
- Check ADRs before changing architecture.
- Treat prompts, generated assets, and docs as product code.

---

# 5. The Build Loop

The project build loop is:

1. Think through strategy.
2. Distill into docs.
3. Choose one task from the hopper.
4. Send the agent a focused prompt.
5. Review the work.
6. Run the Shipping Update Skill.
7. Repeat.

In short:

Think -> document -> build -> update state -> choose next.
