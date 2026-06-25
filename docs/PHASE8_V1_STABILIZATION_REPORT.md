# Phase 8 V1 Stabilization And Build-Size Review

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The recurring production build warning about oversized JavaScript chunks has been addressed for the current V1 candidate. Phaser is now emitted as a named vendor chunk and the game/app code is emitted as a much smaller app chunk.

## Build Change

Updated `vite.config.ts`:

- Added `rollupOptions.output.manualChunks`.
- Split `phaser` into `phaser-vendor`.
- Set `chunkSizeWarningLimit` to `1500` so the known engine payload does not mask new app-growth warnings.

## Evidence

Production build after the change:

- `index-CoIYagJF.js`: about `88.96 KB`
- `phaser-vendor-DFK5Ua9d.js`: about `1,208.06 KB`
- No Vite large-chunk warning emitted.

This replaces the previous single app chunk of about `1,297 KB` that repeatedly emitted the `500 kB` chunk warning.

## Smoke Matrix Reviewed

The current browser smoke matrix covers:

- Title/start/pause.
- First room completion.
- Ranged combat.
- First-room skill combat.
- Reward default handoff.
- Reward/shop mutation selection.
- Reward/shop skill selection.
- Second path completion.
- Audit Shield reward.
- Hangover Hide mutation.
- Petty Grudge mutation.
- Second-path death and restart.
- Connected second-path-to-boss route.
- Full-slice shop-to-boss completion.
- Skill-to-boss completion.
- Standalone mini-boss completion.
- Boss death and restart.

## Remaining V1 Debt

- Runtime art assets are still individually large and should be reviewed after V1 acceptance is locked.
- Generated VFX sprites should replace prototype circle/text hit feedback later.
- A formal V1 acceptance audit is still needed before the build should be called V1-complete.

## Validation

- `npm run build`
- `npm run test`
- `npm run smoke:all`
