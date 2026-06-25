# Phase 8 Combat VFX And Hit Feedback Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

Combat now has visible impact feedback beyond debug hitboxes. Weapon hits, ranged projectile hits, Spite Belch hits, incoming player damage, and Toll Baron stamp pressure spawn floating damage text with a small impact spark.

The feedback is intentionally lightweight and code-native for this gate. It proves timing, positioning, and smoke-verifiable event coverage before a later generated VFX asset pass.

## Implementation

- Added `src/game/feedback/HitFeedback.ts`.
- Wired hit feedback into `RunScene` for:
  - Butcher Saber hits.
  - Receipt Spitter projectile hits.
  - Spite Belch hits.
  - Guard damage to the player.
- Wired hit feedback into `SecondRunScene` for:
  - Tax Pike hits.
  - Carried Spite Belch hits.
  - Tax clerk / elite auditor damage to the player.
- Wired hit feedback into `MiniBossScene` for:
  - Butcher Saber and carried Tax Pike hits.
  - Carried Spite Belch hits.
  - Toll Baron stamp damage to the player.
- Added `hitFeedbackCount` debug datasets to combat scenes.
- Reset feedback counters on combat restarts.

## Smoke Coverage

Browser smoke now verifies hit feedback counts for:

- Ranged combat.
- First-room skill combat.
- Reward/shop skill route.
- Second-path Tax Pike route.
- Full-slice Petty Grudge boss route.
- Skill-to-boss route.
- Standalone mini-boss route.
- Boss death route.

The smoke helper now rejects missing or non-numeric feedback counters instead of allowing `NaN` comparisons to pass.

## Validation

- `npm run typecheck`
- `npm run smoke:browser`
- `npm run smoke:all`

## Follow-Ups

- Replace prototype circles/text with generated VFX sprites or atlas frames.
- Add boss telegraph-specific warning VFX for the toll stamp.
- Review build-size warning and chunking before V1 stabilization is accepted.
