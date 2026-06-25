# Phase 8 Reward / Shop Surface Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The placeholder reward handoff is now a compact reward/shop choice surface. It presents five build options across weapon, survival, skill, and mutation categories while preserving the original default pike reach route.

## Choices

- `1` / `Enter`: Extend the Tax Pike.
- `2`: Pocket the Audit Shield.
- `3`: Bottle the Spite Belch.
- `4`: Grow Hangover Hide.
- `5`: Nurse a Petty Grudge.

## What Changed

- Added a `shopChoices` registry in `RewardChoice.ts`.
- Reworked `RewardScene` into a five-choice shop surface.
- Preserved the old `rewardChoices` dataset and default Enter behavior.
- Added `shopChoice`, `mutation`, and `skill` handoff data to `SecondRunScene`.
- Added smoke support for digit key presses.
- Added browser smoke coverage that selects `Petty Grudge` from the shop and verifies downstream mutation state.

## Smoke Proof

The new browser route opens `/?smoke=reward`, presses `5`, and verifies:

- `shopChoice=pettyGrudge`
- `rewardChoice=pikeReach`
- `mutationChoice=pettyGrudge`
- `weaponDamage=3`
- `weaponReach=520`
- `mutation_pettyGrudge` persisted

## Placeholder Debt

- The room still uses geometric cards and text rather than dedicated shop art.
- No item icons exist yet.
- Spite Belch can be selected and persisted, but the fuller downstream skill loadout path still needs polish.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, ranged combat, skill combat, reward/shop default handoff, reward/shop Petty Grudge selection, second path, audit shield reward, both direct mutation routes, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Continue into category icons and UI polish now that dedicated counter art exists.
- Add category icons for weapon, survival, skill, and mutation choices.
- Add a clearer skill loadout path after the presentation art pass.
