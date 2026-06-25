# SKILLS.md - Project Skills Index

This file is the master index of reusable project skills.

A skill is a repeatable operating prompt or workflow that can be invoked by a human or agent to keep the project moving cleanly.

Skills are not app features. They are project operating procedures.

---

# How To Use Skills

When invoking a skill, tell the agent:

> Run the skill at `docs/07-ops/<SKILL-FILE>.md`.

The agent should read the skill file, inspect the relevant repo state, make requested updates, and summarize what changed.

---

# Current Skills

## 1. Shipping Update Skill

**File:** `docs/07-ops/SHIPPING-UPDATE-SKILL.md`

**Purpose:**

Updates operating docs after meaningful work is completed.

This skill keeps project state current by updating:

- `docs/07-ops/NEXT-IN-HOPPER.md`
- `docs/07-ops/FUTURE-TODO.md`
- `docs/07-ops/COMPLETED.md`
- Optionally `PROJECT.md`, `AGENTS.md`, or ADRs if project truth changed.

**When to use:**

Use after:

- Completing a PR.
- Creating or updating major docs.
- Adding app scaffolding.
- Implementing a feature.
- Making a design or architecture decision.
- Discovering future work.
- Blocking or unblocking active work.

**Invocation:**

    Run the Shipping Update Skill from `docs/07-ops/SHIPPING-UPDATE-SKILL.md` based on the work just completed.

---

# Planned Skills

## Project Brain Audit Skill

Audits the repo brain for missing docs, stale docs, contradictions, malformed markdown, broken links, and unclear instructions.

## ADR Creation Skill

Creates or updates ADRs for major product, architecture, design, privacy, monetization, or AI decisions.

## Design Foundation Skill

Creates or updates design foundation docs.

## App Scaffold Skill

Creates or updates the app scaffold according to current project decisions.

---

# Skill Rules

- Skills should be repeatable.
- Skills should inspect repo state before editing.
- Skills should not invent completed work.
- Skills should update relevant operating docs.
- Skills should preserve current ADRs unless explicitly instructed otherwise.
- Skills should summarize what changed and what remains open.
