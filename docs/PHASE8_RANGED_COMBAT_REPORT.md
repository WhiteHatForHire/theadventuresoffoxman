# Phase 8 Ranged Combat Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The first ranged combat option is now playable and smoke-tested. Foxman's new `Receipt Spitter` is a crude prototype ranged weapon that uses the existing attack input, fires readable debug receipt bolts, damages enemies at range, and persists a `receipt_spitter` unlock.

## What Changed

- Added `Receipt Spitter` to `weaponStats` as the first `ranged` weapon kind.
- Added projectile speed and range fields to weapon stats.
- Added ranged projectile spawning, movement, hit detection, damage, knockback, hit-stop, and cleanup to `RunScene`.
- Converted the first-room secondary pickup from a Tax Pike placeholder into the Receipt Spitter hook.
- Added debug/smoke dataset fields for `weaponKind`, active projectiles, projectiles fired, and projectile hits.
- Added `?smoke=ranged` browser coverage.
- Added unit coverage for the Receipt Spitter's ranged stat shape.

## Gameplay Behavior

- Input: existing attack button (`J`) while Receipt Spitter is equipped.
- Damage: `2` per projectile.
- Projectile speed: `840`.
- Projectile range: `880`.
- Smoke route result: three projectiles fired, two projectile hits, guard defeated, `receipt_spitter` persisted.

## Placeholder Debt

- The projectile is currently a stroked rectangle, not final art.
- The pickup reuses existing prop atlas pieces with tinting.
- There is no ammo, reload, heat, or ranged-specific animation yet.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, ranged combat, reward handoff, second path, audit shield reward, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Replace the debug projectile and pickup presentation with dedicated AI-generated ranged art.
- Continue into reward/shop room presentation now that skill and mutation prototypes exist.
- Consider ranged tuning once skills and mutations can modify cooldown, damage, or projectile behavior.
