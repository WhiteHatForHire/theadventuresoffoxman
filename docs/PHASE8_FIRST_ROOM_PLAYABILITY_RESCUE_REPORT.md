# Phase 8 First-Room Playability Rescue Report

Date: 2026-06-29

## Summary

The first room previously had a false-green quality problem: automated smoke routes could complete while manual play still felt broken, unclear, and hostile. This pass tightened the opening-room layout, made the controls visible, improved keyboard affordances, reduced early guard pressure, and added a browser smoke route that uses real key events from the title screen through the first reward transition.

This does not make Foxman a polished game. It makes the opening route playable enough to be evaluated honestly.

## Problems Addressed

- The playable link did not clearly explain controls.
- Jump support was narrower than expected for a side-scroller.
- Attack required precise taps, which made the first guard feel unresponsive under normal player input.
- The first room was too wide for the tiny amount of content it contained.
- The guard could pressure the player before the saber pickup created a readable combat setup.
- Pickup detection used hidden coordinate bands instead of proximity to visible pickups.
- Smoke coverage did not prove that a human-style keyboard route could complete the room.

## Changes

- Added title-screen controls: movement, jump, attack, skill, and pause.
- Added in-room controls text and objective text.
- Added `W` and `Up` as jump inputs alongside `Space`.
- Made held `J` count as attack input so repeated swings happen on cooldown.
- Shortened the first room and moved the player, saber, guard, secondary pickup, platforms, and exit into a tighter readable route.
- Delayed guard pursuit until after the saber pickup.
- Added a short post-pickup damage grace window.
- Replaced hidden pickup coordinate bands with proximity checks around visible pickup markers.
- Added a browser smoke route that starts at `/`, presses `Enter`, holds `D`, holds `J`, holds `D`, and verifies arrival in `RewardScene`.

## Validation

Commands run:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `FOXMAN_BASE_URL=http://127.0.0.1:5174 npm run smoke:browser`

Browser smoke now includes:

- Manual opening route: `/ -> Enter, hold D/J/D`
- Result: `RewardScene`
- Saber collected: `true`
- Guard alive: `false`
- Guard health: `0`
- Exit unlocked: `true`
- Room complete: `true`
- Current weapon: `Butcher Saber`
- Player health: `5`

## Remaining Reality

The game is still a prototype V1 slice. It needs substantial polish before it can be called good: combat feel, enemy tells, level design, animation timing, camera behavior, feedback, and visual hierarchy all need deeper directed passes. The important change is that the opening loop can now be played and tested without relying on an autorun-only proof.
