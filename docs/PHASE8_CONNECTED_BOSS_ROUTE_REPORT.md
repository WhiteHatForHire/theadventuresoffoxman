# Phase 8 Connected Boss Route Report

Date: 2026-06-26

## Summary

This gate made the second combat path visibly lead into the Toll Baron mini-boss room.

After the tax clerk and elite auditor are defeated, the audit office now reveals a boss-room gate, arrow, and `BOSS TOLL` prompt. The player can run into the transition marker and enter the Toll Baron room without relying on the direct `?smoke=boss` route.

## Features Added

- Visible transition:
  - Added boss gate art in `SecondRunScene` using the existing prop runtime sheet.
  - Gate starts dim/locked and becomes an unlocked boss-door marker after second-path completion.
  - Added a gold exit arrow and `BOSS TOLL` prompt after completion.
- Connected routing:
  - `?smoke=secondBoss` starts the second path and continues through the boss door after completion.
  - Normal play can still enter the boss room by moving to the visible marker after the second path is cleared.
  - Direct `?smoke=boss` remains intact for focused boss smoke.
- Telemetry:
  - `bossDoorVisible` reports when the visible marker is revealed.
  - `bossTransitionReady` reports when Foxman is close to the gate.
  - `boss_room_found` persists when the connected transition fires.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 12 tests.
- `npm run smoke:all` passed.

Browser smoke evidence:

- `/?smoke=secondBoss&reward=pikeReach`:
  - Started in `SecondRunScene`.
  - Reached `secondPathComplete=true`.
  - Revealed `bossDoorVisible=true`.
  - Transitioned to `MiniBossScene`.
  - Spawned `bossVariant=tollBaron` with `bossAlive=true`.
  - Persisted `boss_room_found`.
- Existing direct routes still pass:
  - `/?smoke=second&reward=pikeReach`
  - `/?smoke=second&reward=auditShield`
  - `/?smoke=boss`
  - `/?smoke=bossDeath`

## Known Follow-Ups

- Apply player damage/death/restart rules to the second path enemies.
- Continue atlas packing for Foxman, guard, tax clerk, props, and Rotten Borough background/parallax assets.
- Replace the reused gate art with a dedicated boss-door prop in a later asset pass.
