# Phase 8 Guard Atlas Report

Date: 2026-06-26

## Summary

This gate expanded the atlas workflow to the drunken guard runtime sheet.

The first-room guard now uses `drunken_guard_atlas.png` plus `drunken_guard_atlas.json` through the existing `drunkenGuardRuntime` asset key. The original full alpha sheet remains in the workspace as source material.

## Features Added

- Guard atlas export:
  - Added `assets/game/atlases/enemies/drunken_guard/atlas-spec.json`.
  - Exported `assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.png`.
  - Exported `assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.json`.
  - Added `npm run assets:atlas:drunken-guard`.
- Runtime migration:
  - `src/game/assets.ts` now points `drunkenGuardRuntime` at the atlas PNG and exposes `drunkenGuardRuntimeAtlas`.
  - `src/game/scenes/PreloadScene.ts` loads drunken guard art through `this.load.atlas`.
  - `src/game/entities/GuardEnemy.ts` uses named atlas frames for `drunkenGuard`.
- Test coverage:
  - `tests/unit/asset-keys.test.ts` verifies the drunken guard atlas URL, atlas JSON URL, named atlas frames, and compact atlas dimensions.

## Size Result

- Source drunken guard full sheet: `assets/game/sprites/enemies/enemy_guard_drunken_runtime_sheet_alpha.png`, about `1.1 MB`.
- Exported drunken guard atlas: `assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.png`, about `230 KB`.
- Production build emitted `dist/assets/drunken_guard_atlas-*.png` at about `236 KB`.

The Vite build no longer emits the full drunken guard runtime sheet. At this gate, the largest remaining PNGs were the Rotten Borough mood background, pickup/exit prop sheet, and Foxman sheet.

## Validation

Commands:

- `npm run assets:atlas:drunken-guard` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 14 tests.
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
- Remaining large PNGs still need future packing or slicing.

## Known Follow-Ups

- Apply atlas export to pickup/exit props.
- Continue atlas packing for Foxman and Rotten Borough background/parallax assets.
- Replace reused gate art with a dedicated boss-door prop in a later asset pass.
