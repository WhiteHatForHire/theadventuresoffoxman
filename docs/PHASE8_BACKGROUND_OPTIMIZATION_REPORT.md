# Phase 8 Background Optimization Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The Rotten Borough mood background now ships as a runtime-sized WebP instead of the original large concept PNG. The source PNG remains available as art provenance, while the stable `rottenBoroughMood` asset key now resolves to the optimized runtime file.

## What Changed

- Added `scripts/export-runtime-background.py`.
- Added `npm run assets:bg:rotten-borough`.
- Generated `assets/game/backgrounds/rotten_borough/bg_rotten_borough_mood_runtime.webp`.
- Migrated `assetUrls.rottenBoroughMood` to the runtime WebP.
- Updated unit coverage for the background URL.

## Size Result

- Previous production PNG: about `2.27 MB`.
- Local exported runtime WebP: about `116 KB`.
- Production build emitted WebP: about `118 KB`.

The runtime image is exported at `1280x720`, matching the current game canvas size. The source concept remains `1774x887` for future repainting or parallax slicing.

## Validation

- `npm run assets:bg:rotten-borough`
- `npm run typecheck`
- `npm run test`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, reward handoff, second path, audit shield reward, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Consider slicing the background into foreground/midground/far layers during a dedicated parallax art pass.
- Revisit compression quality if later visual QA finds artifacts on very large displays.
