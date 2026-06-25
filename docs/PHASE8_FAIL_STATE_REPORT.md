# Phase 8 Fail-State Report

Date: 2026-06-26

## Summary

This gate added a shared player damage/death surface and made the Toll Baron stamp a real hazard.

Foxman can now die in the boss route, the death is visible, the death count persists, and the current boss route can restart cleanly. Browser smoke covers the new fail-state route while preserving the existing happy paths.

## Features Added

- Player survival:
  - `src/game/entities/Player.ts` now owns `Health`.
  - Added `damage`, `resetSurvival`, `isVulnerable`, and survival fields in `debugState`.
  - Player hit feedback and invulnerability flicker moved into the player entity.
- First room damage cleanup:
  - `RunScene` now uses `Player.damage` and `Player.resetSurvival` instead of a scene-local health object.
  - The existing first-room damage/reset route remains intact.
  - Happy-path room smoke avoids pre-pickup guard damage so the scripted route stays deterministic.
- Boss fail state:
  - Toll Baron stamp now damages Foxman when the shockwave intersects the player.
  - Added visible death banner and restart prompt in `MiniBossScene`.
  - Boss route persists deaths through `ProgressStore.addDeath`.
  - Added `window.__FOXMAN_RESTART_BOSS__` for deterministic smoke restart while keeping R/Enter restart for play.
- Browser smoke:
  - Added `/?smoke=bossDeath`.
  - Smoke waits for Toll Baron stamp damage to kill Foxman.
  - Smoke verifies `deathBanner=true`, `playerHealth=0`, local death count, persisted death count, and stamp count.
  - Smoke restarts the boss route and verifies player health, boss health, and stamp count reset.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 12 tests.
- `npm run smoke:all` passed.

Browser smoke evidence:

- Existing happy routes still pass:
  - `/`
  - `/?smoke=room`
  - `/?smoke=reward`
  - `/?smoke=second&reward=pikeReach`
  - `/?smoke=second&reward=auditShield`
  - `/?smoke=boss`
- New fail-state route:
  - `/?smoke=bossDeath` killed Foxman with Toll Baron stamp damage.
  - Dead state: `playerAlive=false`, `playerHealth=0`, `deathBanner=true`, `progressDeaths=1`, `bossSpecialCount=3`.
  - Restarted state: `playerAlive=true`, `playerHealth=5`, `bossAlive=true`, `bossHealth=7`, `bossSpecialCount=0`.

Build note:

- Vite still warns that the main JS chunk is over `500 kB`.
- Large generated sheets beyond the Toll Baron atlas still need future packing.

## Known Follow-Ups

- Visible second-path-to-boss transition completed in `docs/PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md`.
- Apply damage/death rules to the second path enemies.
- Continue atlas packing for Foxman, guard, tax clerk, props, and Rotten Borough background/parallax assets.
