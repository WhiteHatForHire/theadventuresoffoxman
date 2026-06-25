# Phase 8 Second Path Damage Report

Date: 2026-06-26

## Summary

This gate made the audit-office path dangerous before the Toll Baron room.

The tax clerk and elite auditor can now damage Foxman in `SecondRunScene`, the second path has visible death and restart behavior, and browser smoke verifies that the `auditShield` reward still preserves its health bonus after restart.

## Features Added

- Second-path enemy damage:
  - Tax clerk and elite auditor contact can damage Foxman.
  - Contact damage uses the shared `Player.damage` health/invulnerability flow.
  - Enemy contact damage is active in normal play and the dedicated death smoke route.
- Second-path death and restart:
  - Added `FOXMAN GOT AUDITED` death banner.
  - Added R/Enter restart prompt.
  - Added `window.__FOXMAN_RESTART_SECOND__` for deterministic smoke restart.
  - Restart resets Foxman, tax clerk, elite auditor, combat timers, completion banner, and boss-door state.
- Reward preservation:
  - `auditShield` now creates the player with 6 max HP.
  - Restart preserves `auditShield` max HP and the normal Tax Pike reach of 430.
  - Existing pike-reach reward behavior remains intact in happy-path smoke.
- Browser smoke:
  - Added `/?smoke=secondDeath&reward=auditShield`.
  - Happy-path second path and connected boss route still pass.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 12 tests.
- `npm run smoke:all` passed.

Browser smoke evidence:

- `/?smoke=secondDeath&reward=auditShield`:
  - Dead state: `playerAlive=false`, `playerHealth=0`, `playerMaxHealth=6`, `deathBanner=true`, `progressDeaths=1`, `secondPathComplete=false`.
  - Restarted state: `playerAlive=true`, `playerHealth=6`, `playerMaxHealth=6`, `taxClerkHealth=2`, `eliteHealth=4`, `weaponReach=430`, `secondPathComplete=false`.
- Existing happy routes still pass:
  - `/?smoke=second&reward=pikeReach`
  - `/?smoke=second&reward=auditShield`
  - `/?smoke=secondBoss&reward=pikeReach`
  - `/?smoke=boss`
  - `/?smoke=bossDeath`

## Known Follow-Ups

- Continue atlas packing for Foxman, guard, tax clerk, props, and Rotten Borough background/parallax assets.
- Replace reused gate art with a dedicated boss-door prop in a later asset pass.
- Add richer enemy attack tells for tax clerk and elite auditor beyond contact pressure.
