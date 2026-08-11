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

- Exact seeded state schema and mode entry: lead resolves after architecture audit, before `LEAF-001`.
- Encounter/content reuse versus new runtime data: lead resolves using the smallest coherent extension of existing systems.
