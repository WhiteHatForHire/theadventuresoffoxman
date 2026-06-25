# Phase 8 Tax Clerk Atlas Report

Date: 2026-06-26

## Summary

This gate expanded the atlas workflow to the tax clerk runtime sheet.

The tax clerk and elite auditor now use `tax_clerk_atlas.png` plus `tax_clerk_atlas.json` through the existing `taxClerkRuntime` asset key. The original full alpha sheet remains in the workspace as source material.

## Features Added

- Tax clerk atlas export:
  - Added `assets/game/atlases/enemies/tax_clerk/atlas-spec.json`.
  - Exported `assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.png`.
  - Exported `assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.json`.
  - Added `npm run assets:atlas:tax-clerk`.
- Runtime migration:
  - `src/game/assets.ts` now points `taxClerkRuntime` at the atlas PNG and exposes `taxClerkRuntimeAtlas`.
  - `src/game/scenes/PreloadScene.ts` loads the tax clerk art through `this.load.atlas`.
  - `src/game/entities/GuardEnemy.ts` uses named atlas frames for `taxClerk` and `eliteAuditor`.
- Test coverage:
  - `tests/unit/asset-keys.test.ts` verifies the tax clerk atlas URL, atlas JSON URL, named atlas frames, and compact atlas dimensions.

## Size Result

- Source tax clerk full sheet: `assets/game/sprites/enemies/enemy_tax_clerk_runtime_sheet_alpha.png`, about `1.0 MB`.
- Exported tax clerk atlas: `assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.png`, about `222 KB`.
- Production build emitted `dist/assets/tax_clerk_atlas-*.png` at about `227 KB`.

The Vite build no longer emits the full tax clerk runtime sheet. The next largest runtime sheets are the Rotten Borough mood background, drunken guard, prop sheet, and Foxman sheet.

## Validation

Commands:

- `npm run assets:atlas:tax-clerk` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 13 tests.
- `npm run smoke:all` passed.

Browser smoke coverage after migration:

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

- Apply atlas export to drunken guard, props, Foxman, and Rotten Borough background/parallax assets.
- Replace reused gate art with a dedicated boss-door prop in a later asset pass.
- Add richer enemy attack tells for tax clerk and elite auditor beyond contact pressure.
