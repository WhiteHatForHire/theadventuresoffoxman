# Phase 8 Foxman Atlas Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

Foxman's prototype runtime sheet now ships as a compact Phaser atlas instead of a full alpha sheet. The stable `foxmanPrototype` asset key remains in place, but preload now uses `this.load.atlas`, and player pose swaps use named frames.

## What Changed

- Added `assets/game/atlases/characters/foxman/atlas-spec.json`.
- Exported `assets/game/atlases/characters/foxman/foxman_atlas.png`.
- Exported `assets/game/atlases/characters/foxman/foxman_atlas.json`.
- Added `npm run assets:atlas:foxman`.
- Migrated `assetUrls.foxmanPrototype` to the atlas PNG and added `foxmanPrototypeAtlas`.
- Changed `PreloadScene` to load Foxman through the atlas loader.
- Changed `Player` pose updates from crop rectangles to named atlas frames.
- Added unit coverage for the Foxman atlas frame list and URL registry.
- Tightened the boss-death smoke route after the smaller player atlas bounds exposed a non-deterministic stamp-death setup.

## Size Result

- Previous full source sheet: about `940 KB`.
- Local exported atlas image: about `196 KB`.
- Production build emitted atlas image: about `194 KB`.

The old full Foxman sheet remains in the workspace as source material but is no longer emitted in the production build.

## Validation

- `npm run assets:atlas:foxman`
- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, reward handoff, second path, audit shield reward, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Continue into the next playable content gate now that the large generated raster payloads have runtime exports.
- Replace single-pose prototype frames with real animated player sprite strips when the next character animation batch is ready.
