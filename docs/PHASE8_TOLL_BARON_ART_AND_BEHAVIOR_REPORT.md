# Phase 8 Toll Baron Art And Behavior Report

Date: 2026-06-26

## Summary

This gate replaced the Toll Baron placeholder with project-local generated runtime art and added a first boss-specific move.

The mini-boss now uses its own transparent sprite sheet, measured frame crops, and a visible toll-stamp shockwave behavior. Browser smoke validates that the boss route completes and that the boss performs the special move before death.

## Features Added

- Toll Baron runtime art:
  - Generated a six-pose boss sheet with idle, patrol/stomp, taunt/alert, slam attack, hurt, and dead poses.
  - Copied the raw chroma source into `assets/source/ai_raw/enemy_toll_baron_runtime_sheet_chroma.png`.
  - Removed chroma key into `assets/game/sprites/enemies/enemy_toll_baron_runtime_sheet_alpha.png`.
- Runtime integration:
  - Added `tollBaronRuntime` to `src/game/assets.ts`.
  - Preloaded the boss sheet in `src/game/scenes/PreloadScene.ts`.
  - Added `TollBaronFrames` in `src/game/assetFrames.ts`.
  - Updated the `tollBaron` variant in `src/game/entities/GuardEnemy.ts` to use boss-specific art and frame crops.
- Boss behavior:
  - Added a periodic toll-stamp special in `src/game/scenes/MiniBossScene.ts`.
  - The stamp telegraphs as a gold hitbox/shockwave and shakes the camera on impact.
  - `document.body.dataset.bossSpecialCount` exposes behavior telemetry for smoke tests.
- Browser smoke:
  - `tests/smoke/check-browser-routes.mjs` now requires the boss route to observe at least one special move.

## Asset Cleanup Notes

Chroma cleanup used the imagegen helper with border auto-keying, soft matte, and despill.

- Key color sampled: `#08f909`
- Transparent pixels: `940,482 / 1,572,864`
- Partially transparent pixels: `17,973 / 1,572,864`
- Alpha corners validated transparent.

One small detached mark remains near the collapsed pose, but it sits inside the dead-frame crop and does not affect current runtime use.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 11 tests.
- `npm run smoke:all` passed.

Browser smoke evidence:

- `/?smoke=boss` completed with `bossVariant=tollBaron`.
- `bossSpecialCount=2` before completion.
- `bossComplete=true`.
- `toll_baron_humiliated` unlock persisted.

Build note:

- Vite still warns that the main JS chunk is over `500 kB`.
- The Toll Baron sheet was migrated to an atlas in `docs/PHASE8_ATLAS_PACKING_REPORT.md`; other generated sheets still need the same treatment.

## Known Follow-Ups

- Visible second-path-to-boss transition completed in `docs/PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md`.
- Damaging Toll Baron stamp and restartable death flow completed in `docs/PHASE8_FAIL_STATE_REPORT.md`.
