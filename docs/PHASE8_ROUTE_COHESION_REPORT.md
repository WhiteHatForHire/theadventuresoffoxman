# Phase 8 Route Cohesion Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The expanded slice now has a smoke-proven route that starts in the first playable room, reaches the reward/shop gate, selects Petty Grudge, clears the second combat path, enters the Toll Baron room, and completes the mini-boss fight.

This pass also fixed a route cohesion gap: the connected boss transition now carries the selected build into `MiniBossScene` instead of silently reverting the player to the default Butcher Saber setup.

## Gameplay Changes

- Added `fullSlice` smoke mode to `RunScene` so the first room continues through the exit into the reward/shop scene.
- Added `fullSlice` route behavior to `SecondRunScene` so the selected shop build clears the second path and walks through the boss door.
- Passed `weapon`, `reward`, `shopChoice`, `mutation`, and `skill` data from the second path into `MiniBossScene`.
- Updated `MiniBossScene` to apply carried Tax Pike reach rewards and mutation weapon/health bonuses.
- Exposed carried build state in boss-scene debug datasets for smoke verification.

## Smoke Coverage Added

`/?smoke=fullSlice -> key 5`

This route verifies:

- First room can route to the reward/shop surface.
- Petty Grudge remains selectable from the shop.
- The second path receives `shopChoice=pettyGrudge`, `rewardChoice=pikeReach`, and `mutationChoice=pettyGrudge`.
- The Toll Baron scene receives `currentWeapon=Tax Pike`, `weaponReach=520`, and `weaponDamage=3`.
- The boss can be defeated on the carried build.
- Progress persists `reward_room_stub`, `mutation_pettyGrudge`, `tax_clerk_evicted`, `elite_auditor_embarrassed`, `boss_room_found`, and `toll_baron_humiliated`.

## Balance Notes

- Petty Grudge now has a clear full-route identity: a longer Tax Pike with damage `3` and reach `520`.
- Direct boss smoke still uses Butcher Saber, so the standalone mini-boss prototype remains available for comparison.
- The carried build is strong against the current Toll Baron health pool. That is acceptable for this gate because the purpose is route continuity, not final boss tuning.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

## Follow-Ups

- Carry `Spite Belch` into downstream combat as an actual usable skill.
- Add visible selected/hover states for shop cards.
- Review Toll Baron health, stamp cadence, and arena spacing once multiple carried builds are combat-usable.
