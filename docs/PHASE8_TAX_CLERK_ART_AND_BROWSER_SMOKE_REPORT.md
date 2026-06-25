# Phase 8 Tax Clerk Art And Browser Smoke Report

Date: 2026-06-25

## Summary

This gate replaced the tax clerk tint prototype with a project-local generated runtime sheet and added a committed browser smoke harness.

The tax clerk variant now uses its own transparent sprite sheet in `SecondRunScene`, and browser route checks can be run with `npm run smoke:browser` or as part of `npm run smoke:all`.

## Runtime Asset Added

- `assets/source/ai_raw/enemy_tax_clerk_runtime_sheet_chroma.png`
- `assets/game/sprites/enemies/enemy_tax_clerk_runtime_sheet_alpha.png`

Generation source:

- `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/ig_01e6dfe878572b0a016a3d454baef881918bda7de3a29fc726.png`

Chroma cleanup:

- Key color: `#05f806`
- Transparent pixels: `1,222,359 / 1,573,538`
- Partially transparent pixels: `19,733 / 1,573,538`

## Crop Frames

Runtime crop metadata was added in `src/game/assetFrames.ts` as `TaxClerkFrames`.

Frame set:

- `idle`
- `patrol`
- `alert`
- `attack`
- `hurt`
- `dead`

## Code Integration

- `src/game/assets.ts`: added `taxClerkRuntime`.
- `src/game/scenes/PreloadScene.ts`: preloads the tax clerk runtime sheet.
- `src/game/entities/GuardEnemy.ts`: selects the tax clerk sheet and `TaxClerkFrames` when variant is `taxClerk`.
- `src/game/scenes/SecondRunScene.ts`: continues to use the tax clerk variant, now backed by unique generated art.
- `tests/unit/asset-keys.test.ts`: validates tax clerk asset and crop metadata.

## Browser Smoke Harness

Added `tests/smoke/check-browser-routes.mjs`.

Commands:

- `npm run smoke:browser`
- `npm run smoke:all`

The harness launches or reuses the local Vite server, runs Chrome headless through DevTools, and checks:

- `/`: title/start and pause/resume smoke.
- `/?smoke=room`: first-room pickup, guard kill, exit unlock, completion.
- `/?smoke=reward`: reward-room handoff into `SecondRunScene`.
- `/?smoke=second`: Tax Pike route, tax clerk kill, `tax_clerk_evicted` unlock.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 9 tests.
- `npm run smoke:all` passed.

Build note:

- Vite still warns that the main JS chunk is over `500 kB`. This remains expected while Phaser and full-size generated sprite sheets are bundled directly.

## Known Follow-Ups

- Add a real reward choice before the second path.
- Add a third enemy or elite prototype.
- Pack runtime sheets into atlases or sliced frames to reduce bundle size.
