# Phase 8 Carried Skill And Selection Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The shop's Spite Belch choice now matters after purchase. Selecting it from the reward/shop surface carries the skill into the second combat path, where Foxman can use the cone attack against the tax clerk and elite auditor before finishing the route with the Tax Pike.

The reward/shop cards also gained pointer hover and click affordances, while the existing keyboard selection flow remains unchanged.

## Gameplay Changes

- Added a `rewardSkill` smoke route that starts at the reward/shop surface.
- Loaded `rewardSkill` through `PreloadScene` into `RewardScene`.
- Added Spite Belch cooldown, active hitbox, hit counters, and visual reset handling to `SecondRunScene`.
- Reused second-path defeat bookkeeping for both weapon and skill kills so progress unlocks remain consistent.
- Updated second-path smoke behavior to prefer skill hits when a carried skill is present.
- Made reward/shop cards interactive with hover highlighting, hand cursor behavior, click selection, and a `hoveredShopChoice` debug dataset.

## Smoke Coverage Added

`/?smoke=rewardSkill -> key 3`

This route verifies:

- The shop can select `spiteBelch`.
- The second path receives `skillChoice=Spite Belch`.
- The skill unlock state is true.
- Spite Belch is used at least twice.
- Spite Belch lands at least twice.
- The tax clerk and elite auditor both die.
- The second path completes and persists `spite_belch`.

## Balance Notes

- Spite Belch currently deals `2` damage with `430` range and a `900ms` cooldown.
- In the second path, the skill kills the tax clerk in one hit and softens the elite auditor before the Tax Pike closes the route.
- The skill is now usable in the Toll Baron scene as of the follow-up boss build-variety pass.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

## Follow-Ups

- Add controller navigation and an explicit selected-card state.
- Revisit skill cooldown and damage once downstream enemy variety increases.
