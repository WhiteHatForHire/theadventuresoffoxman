# Phase 8 Skill Prototype Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

Foxman's first active skill prototype is now playable and smoke-tested. `Spite Belch` is a crude cone burst on the `K` key that uses a visible debug hitbox, damages enemies, applies knockback, has cooldown state, and persists a `spite_belch` unlock in the smoke route.

## What Changed

- Added `src/game/skills/SkillStats.ts`.
- Added `skillPressed` to `InputSnapshot`.
- Mapped the first skill input to `K`.
- Added Spite Belch state to `RunScene`: unlock, cooldown, use count, hit count, and effect timing.
- Added a visible skill hitbox rectangle for prototype readability.
- Added `?smoke=skill` browser coverage.
- Added unit coverage for the skill stat definition.

## Gameplay Behavior

- Input: `K`.
- Damage: `2`.
- Range: `430`.
- Cooldown: `900ms`.
- Effect duration: `170ms`.
- Smoke route result: two skill uses, two hits, guard defeated, `spite_belch` persisted.

## Placeholder Debt

- The skill VFX is currently a debug rectangle.
- The skill unlock is direct through the smoke route, not a real reward/shop path.
- There is no skill icon, cooldown UI, or final animation yet.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, ranged combat, skill combat, reward handoff, second path, audit shield reward, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Upgrade the reward/shop room surface now that mutation prototypes exist.
- Add dedicated VFX/art for Spite Belch.
- Integrate skill selection into a real reward, shop, or route progression path.
