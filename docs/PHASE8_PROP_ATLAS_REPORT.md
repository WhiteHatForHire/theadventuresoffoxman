# Phase 8 Prop Atlas Report

Date: 2026-06-26

## Summary

This gate expanded the atlas workflow to the pickup and exit prop runtime sheet.

Pickups, gates, the exit arrow, and the reused boss-door marker now use `pickup_exit_atlas.png` plus `pickup_exit_atlas.json` through the existing `pickupExitRuntime` asset key. The original full alpha sheet remains in the workspace as source material.

## Features Added

- Prop atlas export:
  - Added `assets/game/atlases/props/rotten_borough/atlas-spec.json`.
  - Exported `assets/game/atlases/props/rotten_borough/pickup_exit_atlas.png`.
  - Exported `assets/game/atlases/props/rotten_borough/pickup_exit_atlas.json`.
  - Added `npm run assets:atlas:pickup-exit`.
- Runtime migration:
  - `src/game/assets.ts` now points `pickupExitRuntime` at the atlas PNG and exposes `pickupExitRuntimeAtlas`.
  - `src/game/scenes/PreloadScene.ts` loads pickup/exit props through `this.load.atlas`.
  - `RunScene` and `SecondRunScene` now select prop frames with named atlas frames.
- Test coverage:
  - `tests/unit/asset-keys.test.ts` verifies the prop atlas URL, atlas JSON URL, named atlas frames, and compact atlas dimensions.

## Size Result

- Source prop full sheet: `assets/game/props/rotten_borough/prop_pickup_exit_runtime_sheet_alpha.png`, about `1.1 MB`.
- Exported prop atlas: `assets/game/atlases/props/rotten_borough/pickup_exit_atlas.png`, about `211 KB`.
- Production build emitted `dist/assets/pickup_exit_atlas-*.png` at about `217 KB`.

The Vite build no longer emits the full pickup/exit prop sheet. At this gate, the largest remaining PNGs were the Rotten Borough mood background and Foxman sheet.

## Validation

Commands:

- `npm run assets:atlas:pickup-exit` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 15 tests.
- `npm run smoke:all` passed.

Browser smoke coverage after migration:

- `/`
- `/?smoke=room`
- `/?smoke=reward`
- `/?smoke=second&reward=pikeReach`
- `/?smoke=second&reward=auditShield`
- `/?smoke=secondDeath&reward=auditShield`
- `/?smoke=secondBoss&reward=pikeReach`
- `/?smoke=boss`
- `/?smoke=bossDeath`

Build note:

- Vite still warns that the main JS chunk is over `500 kB`.
- Remaining large PNGs need a background/parallax/performance pass.

## Known Follow-Ups

- Split or optimize Rotten Borough background/parallax assets.
- Replace reused gate art with a dedicated boss-door prop in a later asset pass.
