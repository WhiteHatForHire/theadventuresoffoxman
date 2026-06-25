# Phase 8 Mutation Prototypes Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The first two mutation prototypes are implemented and smoke-tested. Mutations are currently query-selectable route hooks on the second path so their gameplay effects can be validated before a fuller reward/shop UI exists.

## Mutations

- `Hangover Hide`: +1 max health because regret has calluses.
- `Petty Grudge`: +1 weapon damage while Foxman remembers every slight.

## What Changed

- Added `src/game/mutations/MutationStats.ts`.
- Added mutation query parsing for `hangoverHide` and `pettyGrudge`.
- Added mutation health and weapon-stat effect helpers.
- Integrated mutation state into `SecondRunScene`.
- Exposed `mutationChoice`, `playerMaxHealth`, `weaponDamage`, and existing progress unlocks through smoke output.
- Added browser smoke routes for both mutation prototypes.
- Added unit coverage for mutation definitions, query parsing, and stat effects.

## Validation Results

- `?smoke=second&reward=pikeReach&mutation=hangoverHide`
  - `mutationChoice=hangoverHide`
  - `playerHealth=6`
  - `playerMaxHealth=6`
  - `weaponDamage=2`
  - `mutation_hangoverHide` persisted

- `?smoke=second&reward=pikeReach&mutation=pettyGrudge`
  - `mutationChoice=pettyGrudge`
  - `playerMaxHealth=5`
  - `weaponDamage=3`
  - `weaponReach=520`
  - `mutation_pettyGrudge` persisted

## Placeholder Debt

- Mutations are route/query-selected, not presented in a real reward or shop UI yet.
- No mutation icons, card art, or selection animation exists.
- Mutation effects are intentionally blunt prototype passives.

## Commands

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, ranged combat, skill combat, reward handoff, second path, audit shield reward, both mutation routes, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Move mutation selection into the reward/shop room surface.
- Add mutation cards/icons and stronger visual feedback.
- Add mutation interaction with ranged and skill systems after the reward surface is upgraded.
