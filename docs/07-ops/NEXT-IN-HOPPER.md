# NEXT-IN-HOPPER.md - Active Build Queue

This document tracks the current active queue for the project.

It is not the full backlog. It is the near-term hopper: the work that should happen next, in order, to keep the project moving toward the current shipping objective.

Update this file whenever a task is completed, superseded, blocked, or moved into active work.

---

# Current Shipping Objective

Create the master initiative plan, then begin a gated vertical-slice build for `The Adventures of Foxman, a Merciless Bastard`.

---

# Rules For This Hopper

- Keep this list small.
- Prefer 5-10 active tasks maximum.
- Each task must have acceptance criteria.
- Move completed work to `COMPLETED.md`.
- Move parked ideas to `FUTURE-TODO.md`.
- If a task changes product direction, update `PROJECT.md` or add an ADR.
- Every meaningful work session should update relevant ops docs.

---

# Active Tasks

## 1. Foxman Case Study Screenshot And Annotation Pass

**Status:** Active  
**Priority:** P1  
**Type:** Docs / Design / Ops

### Goal

Extend the completed case-study Markdown/DOCX package with live gameplay screenshots, annotated failure visuals, and stronger before/after evidence.

### Acceptance Criteria

- Capture and save live screenshots for title, first room, reward shop, second path, boss, death/restart, and fixed playable route.
- Add annotated before/after visuals for the green-wash/debug-scaffold failure and the manual-control smoke-route failure.
- Add the new images to `docs/case-study/FOXMAN_CASE_STUDY.md` and regenerate `docs/case-study/Foxman_Case_Study.docx`.
- Re-render the DOCX and visually inspect representative pages.
- Preserve the central thesis: one-shot generation creates artifacts, while agent orchestration creates production quality.

## 2. Post-V1 Polish And Packaging Triage

**Status:** Active  
**Priority:** P1  
**Type:** App / QA / Ops

### Goal

Prepare the accepted V1 candidate for handoff by triaging polish, packaging, release notes, and any post-V1 asset upgrades.

### Acceptance Criteria

- Produce a post-V1 triage list split into polish, packaging, art/VFX, performance, and content.
- Decide which items are post-V1 polish versus release blockers for a public demo.
- Preserve the accepted V1 smoke matrix.
- Update release/handoff docs.
- `npm run smoke:all` passes.

---

# Blocked / Waiting

None right now.

---

# Recently Moved Out

- Foxman director-model case-study thesis added on 2026-06-26.
- Foxman case-study build-process narrative expansion completed on 2026-06-26.
- Presentation-ready Foxman case-study DOCX created on 2026-06-26.
- Foxman case study structure, asset gallery, and code map created on 2026-06-26.
- Manual play link and smoke autorun split completed on 2026-06-26.
- First-room presentation and visual smoke guard completed on 2026-06-26.
- Phase 8 V1 candidate acceptance audit completed on 2026-06-26.
- Phase 8 V1 stabilization and build-size review completed on 2026-06-26.
- Phase 8 combat VFX and hit feedback pass completed on 2026-06-26.
- Phase 8 combat feedback and HUD readability pass completed on 2026-06-26.
- Phase 8 boss build variety and balance pass completed on 2026-06-26.
- Phase 8 carried skill usability and selection polish completed on 2026-06-26.
- Phase 8 route cohesion and balance pass completed on 2026-06-26.
- Phase 8 reward/shop icon and UI polish completed on 2026-06-26.
- Phase 8 reward/shop presentation art pass completed on 2026-06-26.
- Phase 8 reward/shop choice surface completed on 2026-06-26.
- Phase 8 mutation prototypes completed on 2026-06-26.
- Phase 8 first active skill prototype completed on 2026-06-26.
- Phase 8 ranged combat prototype completed on 2026-06-26.
- Phase 8 Rotten Borough runtime background optimization completed on 2026-06-26.
- Phase 8 Foxman atlas migration completed on 2026-06-26.
- Phase 8 pickup and exit prop atlas migration completed on 2026-06-26.
- Phase 8 drunken guard atlas migration completed on 2026-06-26.
- Phase 8 tax clerk atlas migration completed on 2026-06-26.
- Phase 8 second-path damage and restart loop completed on 2026-06-26.
- Phase 8 visible second-path-to-boss transition completed on 2026-06-26.
- Phase 8 player damage, death, and restart loop completed on 2026-06-26.
- Phase 8 atlas packing and Toll Baron atlas migration completed on 2026-06-26.
- Phase 8 Toll Baron art and boss behavior completed on 2026-06-26.
- Phase 8 mini-boss room completed on 2026-06-26.
- Phase 8 reward choice and elite prototype completed on 2026-06-26.
- Phase 8 tax clerk art and browser smoke harness completed on 2026-06-25.
- Phase 8 second combat/reward path completed on 2026-06-25.
- Phase 8 foundation completed on 2026-06-25.
- Phase 7 vertical-slice polish completed on 2026-06-25.
- Phase 7A polish feedback pass completed on 2026-06-25.
- Phase 6 asset integration pass completed on 2026-06-25.
- Phase 5 first vertical-slice room completed on 2026-06-25.
- Phase 4 combat sandbox completed on 2026-06-25.
- Phase 3 movement sandbox completed on 2026-06-25.
- Phase 2 engine scaffold completed on 2026-06-25.
- Phase 1 style lock and first asset generation completed on 2026-06-25.
