# Phase 8 Mini-Boss Room Report

Date: 2026-06-26

## Summary

This gate added the next combat beat after the reward and audit-office path: a mini-boss prototype.

The new `MiniBossScene` is a third combat room with a Toll Baron mini-boss placeholder. It is directly smokeable through `?smoke=boss` and records the `toll_baron_humiliated` unlock when cleared.

## Features Added

- `MiniBossScene`:
  - New third combat room.
  - Reachable from the scene registry and direct smoke route.
  - Uses the Rotten Borough background with warmer boss-room tint.
  - Uses Butcher Saber combat for a heavier, shorter-range boss fight than the Tax Pike route.
- Toll Baron prototype:
  - `tollBaron` enemy variant.
  - Uses the drunken guard runtime sheet as a documented placeholder.
  - Larger scale, warm tint, higher health.
  - Unlocks `toll_baron_humiliated` when defeated.
- Route integration:
  - `PreloadScene` supports `?smoke=boss`.
  - `SecondRunScene` can route to `MiniBossScene` after completion if the player advances far enough.
- Browser smoke:
  - `tests/smoke/check-browser-routes.mjs` now validates the boss route.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 11 tests.
- `npm run smoke:all` passed.

Browser smoke coverage now includes:

- `/`: title/start and pause/resume.
- `/?smoke=room`: first room complete.
- `/?smoke=reward`: reward handoff.
- `/?smoke=second&reward=pikeReach`: second path with pike reach reward.
- `/?smoke=second&reward=auditShield`: second path with audit shield reward.
- `/?smoke=boss`: Toll Baron defeated, `bossComplete=true`, `toll_baron_humiliated` unlock persisted.

Build note:

- Vite still warns that the main JS chunk is over `500 kB` because Phaser and full-size generated sheets are bundled directly.
- Toll Baron atlas migration later reduced the boss art payload; see `docs/PHASE8_ATLAS_PACKING_REPORT.md`.

## Known Follow-Ups

- Unique Toll Baron mini-boss runtime art completed in `docs/PHASE8_TOLL_BARON_ART_AND_BEHAVIOR_REPORT.md`.
- Visible second-path-to-boss transition completed in `docs/PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md`.
- First boss-specific toll-stamp behavior completed in `docs/PHASE8_TOLL_BARON_ART_AND_BEHAVIOR_REPORT.md`.
- First atlas packing pass completed in `docs/PHASE8_ATLAS_PACKING_REPORT.md`.
