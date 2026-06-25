# Phase 6 Asset Integration Report

Date: 2026-06-25

## Summary

Phase 6 integrated the first transparent runtime art pass into the playable vertical-slice room.

The game now uses crop-frame metadata for Foxman poses, a transparent drunken guard runtime sheet, and generated pickup/exit prop art. The first room still completes through the browser smoke route after the asset swap.

## Runtime Assets Added

- `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png`
- `assets/game/sprites/enemies/enemy_guard_drunken_runtime_sheet_alpha.png`
- `assets/game/props/rotten_borough/prop_pickup_exit_runtime_sheet_alpha.png`

## Source Assets

- `assets/source/ai_raw/enemy_guard_drunken_runtime_sheet_chroma.png`
- `assets/source/ai_raw/prop_pickup_exit_runtime_sheet_chroma.png`

Chroma cleanup results:

- Guard sheet key: `#0df91c`; transparent pixels: `1,152,896 / 1,572,528`; partial-alpha pixels: `14,547`.
- Prop sheet key: `#06f91f`; transparent pixels: `1,125,688 / 1,573,538`; partial-alpha pixels: `83,066`.

## Code Integration

- Added `src/game/assetFrames.ts` as the central crop-frame registry.
- Updated `src/game/assets.ts` and `src/game/scenes/PreloadScene.ts` to load runtime alpha sheets.
- Updated `src/game/entities/Player.ts` to switch Foxman crops for idle, run, jump, and attack poses.
- Updated `src/game/entities/GuardEnemy.ts` to use the transparent guard runtime sheet and state-specific crops.
- Updated `src/game/scenes/RunScene.ts` to use generated prop crops for the Butcher Saber pickup and locked/unlocked exit gate.
- Removed the raw guard concept sheet from the runtime asset registry so the production bundle no longer ships that concept PNG.

## Gameplay Adjustments

The runtime art changed perceived actor spacing and bounds, so the melee prototype was adjusted:

- Smoke-driver approach logic now moves toward the guard until Foxman is in a deliberate melee pocket.
- The Butcher Saber now deals `3` damage while the starting Rusty Knife remains at `1`.
- The saber uses a broader logical melee range alongside the visible debug hitbox, making the pickup read as a real power spike.
- Enemy position is now exposed in debug telemetry for future smoke tests.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 5 tests.
- `npm run build && npm run smoke` passed.

Browser smoke:

- URL: `http://127.0.0.1:5173/?smoke=room`
- `1000ms`: canvas present, pickup false, enemy alive, exit locked.
- `2800ms`: pickup true, weapon `Butcher Saber`, enemy dead, exit unlocked.
- `7000ms`: room complete true, deaths `0`, browser error log empty.

Build note:

- Vite still warns that the main JS chunk is over `500 kB`. This is expected for the current Phaser prototype and full-size generated PNG imports. Asset packing and code splitting remain follow-up work.

## Known Follow-Ups

- Export true individual frames or a packed atlas instead of relying on large crop sheets.
- Replace the mood background with parallax layers.
- Add hit pause, knockback, invulnerability feedback, and first audio hooks.
- Add an automated browser smoke runner that records the same DOM dataset checkpoints without manual REPL orchestration.
- Tune actor body offsets after the next pose/export pass.
