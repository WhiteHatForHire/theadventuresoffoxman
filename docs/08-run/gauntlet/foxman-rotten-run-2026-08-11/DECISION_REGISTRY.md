# Foxman Rotten Run Decision Registry

Run: `foxman-rotten-run-gauntlet-2026-08-11`
Project: `The Adventures of Foxman, a Merciless Bastard`
Owner: visible Gauntlet lead
Status: active

## Active Decisions

### RR-DEC-001 - Separate Mode, Preserved Campaign

**Status:** approved
**Owner:** operator via directive and ADR-0010
**Date:** 2026-08-11
**Rationale:** The accepted campaign is valuable regression truth; the experiment must be independently reachable and reversible.
**Affected surfaces:** title/mode entry, new Rotten Run runtime, persistence, browser harness.
**Constraints:** no deletion, replacement, or silent semantic change to existing campaign routes.

### RR-DEC-002 - Seed Is Inspectable Product State

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** Three viable builds and route diversity cannot be proven if random state is opaque or non-repeatable.
**Affected surfaces:** run state, route/reward selection, smoke hooks, results evidence.
**Constraints:** identical seed and input contract must produce identical graph and offers.

### RR-DEC-003 - Sequential Builder / Blind Critic Promotion

**Status:** approved
**Owner:** operator via directive
**Date:** 2026-08-11
**Rationale:** One visible lead retains coherent product decisions while satisfying the wider wave's concurrency envelope.
**Affected surfaces:** every worker brief and promotion receipt.
**Constraints:** at most one active descendant; critics do not edit production files or receive builder rationale.

### RR-DEC-004 - Local-Only Reality Surface

**Status:** approved
**Owner:** operator via directive
**Date:** 2026-08-11
**Rationale:** Browser reality is required, but public deployment is not authorized.
**Affected surfaces:** review URL, product page, captures, handoff.
**Constraints:** local server/build only until Marcus explicitly approves deployment.

### RR-DEC-005 - Largest Gap First

**Status:** approved
**Owner:** lead via protocol
**Date:** 2026-08-11
**Rationale:** The bounded slice finishes by repairing the highest-impact failure, not accumulating unreviewed content.
**Affected surfaces:** critic verdicts, revision briefs, gate promotions.
**Constraints:** one ranked repair brief per failed critic; no new content while a gate-blocking defect remains.

## Open Questions

- None blocking `LEAF-001`.

### RR-DEC-006 - Additive Pure Core And Separate Scene

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** Existing campaign behavior is duplicated across large scenes. Extracting it during the slice would risk accepted routes; a pure Rotten Run core plus an additive scene provides deterministic state without campaign surgery.
**Affected surfaces:** `src/game/rotten/`, `RottenRunScene`, entry registration, Rotten Run tests.
**Constraints:** campaign scenes remain independent and behaviorally unchanged.

### RR-DEC-007 - Fixed Three-Stage Choice Topology

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** Three two-wave stages plus a fixed boss can truthfully target 15-25 minutes while keeping route and reward decisions consequential and bounded.
**Affected surfaces:** plan schema, run flow, encounter pacing, results trace.
**Constraints:** two visible options per stage, three stages only, one fixed final boss.

### RR-DEC-008 - Fixed Content Budget

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** Four weapons, three skills, eight upgrades, five enemy roles, two elites, and one boss meet the promise without opening unlimited content production.
**Affected surfaces:** all Rotten Run registries, offers, combat, proof matrix.
**Constraints:** exact mechanics and cuts are frozen in `SEEDED_RUN_CONTRACT.md`; additions require a recorded replacement decision, not scope accumulation.

### RR-DEC-009 - Preserve The Contract Fixture While Normal Flow Advances

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** LEAF-001's deterministic route shell is useful regression truth, while the actual product must advance through loadout before route choice.
**Affected surfaces:** Rotten Run scene initialization and browser routes.
**Constraints:** `smoke=rottenContract` retains the exact `GAUNTLET-ALPHA` route-choice fixture; normal title/direct entry advances to loadout in LEAF-002 and receives a separately reviewed browser contract.

### RR-DEC-010 - Isolated Stage 1 Combat Runtime

**Status:** approved
**Owner:** lead
**Date:** 2026-08-11
**Rationale:** New enemy roles and weapon/skill behaviors must not widen campaign classes or turn the flow scene into another monolith.
**Affected surfaces:** `src/game/rotten/` runtime/content modules and `RottenRunScene` composition.
**Constraints:** no edits to campaign actors/scenes; pure registries own content, runtime modules own enemy/combat behavior, and the scene owns transitions.

## Promotion Notes

- `LEAF-001` accepted by a fresh blind critic with no largest gap.
- Accepted product commit: `fa94e97`.
- Evidence: `evidence/leaf-001/critic-receipt.md` and the focused/full browser results beside it.
