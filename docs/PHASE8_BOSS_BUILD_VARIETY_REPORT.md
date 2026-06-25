# Phase 8 Boss Build Variety Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The Toll Baron encounter now responds to the skill-oriented shop route. Buying Spite Belch, clearing the second path, and entering the boss room carries the skill into `MiniBossScene`, where Foxman can use it against the boss before finishing the fight with the Tax Pike.

This gives the boss route a second proven build identity alongside the Petty Grudge full-slice route.

## Gameplay Changes

- Added `rewardSkillBoss` as a reward/shop-to-boss smoke route.
- Routed `rewardSkillBoss` through `PreloadScene`, `RewardScene`, `SecondRunScene`, and `MiniBossScene`.
- Updated `SecondRunScene` so `rewardSkillBoss` clears the second path and transitions through the boss door.
- Added carried skill cooldown, hitbox, hit counters, and reset handling to `MiniBossScene`.
- Added boss-scene debug datasets for carried skill state, uses, hits, and cooldown readiness.
- Reused boss completion bookkeeping for both weapon and skill kills.

## Smoke Coverage Added

`/?smoke=rewardSkillBoss -> key 3`

This route verifies:

- The shop can select `spiteBelch`.
- The second path clears and opens the boss route.
- The boss scene receives `currentWeapon=Tax Pike`, `rewardChoice=pikeReach`, and `skillChoice=Spite Belch`.
- Spite Belch is used at least twice in the boss scene.
- Spite Belch lands at least twice in the boss scene.
- Toll Baron is defeated.
- Progress persists `spite_belch`, `tax_clerk_evicted`, `elite_auditor_embarrassed`, `boss_room_found`, and `toll_baron_humiliated`.

## Balance Notes

- The skill-oriented boss route keeps Tax Pike damage at `2` and reach at `520`, while adding two verified Spite Belch hits.
- Petty Grudge remains the stronger weapon-damage route at `3` damage and `520` reach.
- The current Toll Baron health pool still works for both routes, but health, stamp cadence, and arena spacing should be revisited after combat HUD/readability improves.

## Validation

- `npm run typecheck`
- `npm run smoke:browser`
- `npm run smoke:all`

## Follow-Ups

- Add clearer cooldown and hit feedback outside debug text.
- Tune Toll Baron once the player-facing HUD exposes build state more clearly.
- Add more boss reactions as additional shop choices come online.
