# Phase 8 Playability Audit And Rescue Report

Date: 2026-07-06

## Scope

This pass audited the current playable vertical slice after manual complaints surfaced around traversal, platform presentation, combat readability, attack range, and boss completion. The goal was not to make the project a finished game. The goal was to remove the most obvious broken-feeling blockers and add regression coverage for the new expectations.

## Audit Findings

- First-room upper platforms were not arranged as a reachable traversal route for Foxman's actual jump arc.
- Platform art still read as obvious programmer rectangles instead of in-world Rotten Borough surfaces.
- The first-room exit prop sat too low, visually sunk into the floor.
- Melee reach values were tuned for smoke-test convenience, not human combat feel.
- Debug hitbox rectangles still leaked into second-path and boss play.
- Beating Toll Baron ended in a banner-only dead end with no clear V1 completion state or next action.
- Browser smoke coverage proved route completion, but did not assert the boss-clear endpoint or return-to-title action.

## Changes Made

- Added `src/game/levels/PaintedPlatform.ts`, a shared painted-platform renderer that keeps physics bodies invisible while drawing stone caps, seams, shadows, grime, and accent colors.
- Reworked first-room platforms into a lower, stepped, one-way route that Foxman can actually jump onto.
- Raised the first-room exit gate so it sits on the floor instead of below it.
- Replaced second-path and boss visible platform rectangles with the shared painted-platform treatment.
- Hid second-path melee/skill debug rectangles and boss melee/skill/stamp debug rectangles during normal play.
- Reduced melee reach values:
  - Rusty Knife: `185 -> 135`
  - Butcher Saber: `330 -> 205`
  - Tax Pike: `430 -> 310`
  - Pike reach reward: `+90 -> +55`
- Updated smoke route logic and test expectations for the shorter ranges.
- Added a visible boss-clear endpoint: `V1 SLICE CLEARED - Press Enter to run it back`.
- Added boss completion input handling so pressing `Enter` after Toll Baron dies returns to the title.
- Added browser smoke assertions for `v1SliceComplete=true` and direct boss completion returning to `TitleScene`.

## Visual QA

Captured representative browser screenshots:

- `/tmp/foxman-audit-room-complete.png`
- `/tmp/foxman-audit-boss-clear.png`

Visual status:

- Exit placement is improved.
- Debug hitboxes are no longer visible in the inspected routes.
- Boss completion now has a visible endpoint prompt.
- Platform presentation is improved from raw debug rectangles, but still should be replaced by generated tile/platform art before any public demo.

## Validation

Commands run:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `FOXMAN_BASE_URL=http://127.0.0.1:5175 npm run smoke:browser`

Browser smoke now verifies:

- Manual opening route reaches reward room.
- First room, ranged, skill, reward/shop, second path, mutation, death/restart, connected boss, full-slice, skill-boss, mini-boss, and boss-death routes still pass.
- Full slice and skill-boss routes expose `v1SliceComplete=true` after Toll Baron dies.
- Direct boss route exposes `v1SliceComplete=true`, then `Enter` returns to `TitleScene`.

## Remaining Recommendations

- Replace code-painted platforms with generated tile/platform assets and proper nine-slice or atlas-based rendering.
- Add a manual traversal smoke route that specifically climbs the first-room platform staircase.
- Add a debug-hitbox toggle instead of hard-hiding combat rectangles forever.
- Add clearer boss reward/end-card presentation beyond the current V1 completion prompt.
- Continue tuning enemy tells, hit windows, camera framing, and room layouts through manual play sessions.
