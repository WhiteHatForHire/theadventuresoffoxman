# Phase 8 Atlas Packing Report

Date: 2026-06-26

## Summary

This gate added the first repeatable atlas export workflow and migrated the Toll Baron mini-boss from a full generated runtime sheet to a Phaser atlas.

The original full alpha sheet remains in the workspace as the editable/source runtime sheet. The browser build now consumes `toll_baron_atlas.png` plus `toll_baron_atlas.json`, keeping the `tollBaronRuntime` asset key stable while switching the render path to named atlas frames.

## Features Added

- Atlas exporter:
  - Added `scripts/export-frame-atlas.py`.
  - Reads a JSON atlas spec with source sheet, output paths, crop rectangles, max width, padding, and optional palette quantization.
  - Emits Phaser-compatible atlas JSON with named frames.
- Toll Baron atlas:
  - Added `assets/game/atlases/enemies/toll_baron/atlas-spec.json`.
  - Exported `assets/game/atlases/enemies/toll_baron/toll_baron_atlas.png`.
  - Exported `assets/game/atlases/enemies/toll_baron/toll_baron_atlas.json`.
  - Added `npm run assets:atlas:toll-baron` as the repeatable command.
- Runtime migration:
  - `src/game/assets.ts` now points `tollBaronRuntime` at the atlas PNG and exposes `tollBaronRuntimeAtlas`.
  - `src/game/scenes/PreloadScene.ts` loads the Toll Baron through `this.load.atlas`.
  - `src/game/entities/GuardEnemy.ts` switches the `tollBaron` variant by atlas frame name while older enemies keep crop-based sheet rendering.
- Test coverage:
  - `tests/unit/asset-keys.test.ts` now verifies the Toll Baron atlas URL, atlas JSON URL, named atlas frames, and compact atlas dimensions.

## Size Result

- Source Toll Baron full sheet: `assets/game/sprites/enemies/enemy_toll_baron_runtime_sheet_alpha.png`, about `1.7 MB`.
- Exported Toll Baron atlas: `assets/game/atlases/enemies/toll_baron/toll_baron_atlas.png`, about `396 KB`.
- Production build emitted `dist/assets/toll_baron_atlas-*.png` at about `405 KB`.

The Vite build no longer emits the full Toll Baron runtime sheet. Other large generated sheets and the mood background still need the same treatment.

## Validation

Commands:

- `npm run assets:atlas:toll-baron` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 12 tests.
- `npm run smoke:all` passed.

Browser smoke evidence:

- `/?smoke=boss` completed with `bossVariant=tollBaron`.
- `bossSpecialCount=2` before completion.
- `bossComplete=true`.
- `toll_baron_humiliated` unlock persisted.

Build note:

- Vite still warns that the main JS chunk is over `500 kB`, mainly because Phaser is bundled in the app chunk.
- Remaining large PNGs are now the Rotten Borough mood background, drunken guard, prop sheet, tax clerk sheet, and Foxman sheet.

## Known Follow-Ups

- Apply the atlas workflow to Foxman, guard, tax clerk, props, and the Rotten Borough background/parallax path.
- Add player damage, death, and restart rules so boss specials can become real threats.
- Visible second-path-to-boss transition completed in `docs/PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md`.
