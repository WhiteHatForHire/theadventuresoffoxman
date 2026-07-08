# Phase 9 Full Game Expansion Report

Date: 2026-07-08

## Scope

This pass started the shift from V1 vertical slice to a full-game campaign structure. It added a new full-game initiative and implemented the first playable post-V1 chapter: Act 2, `The Sump Warrens`.

## Initiative Added

Created:

- `docs/FOXMANS_FULL_GAME_INITIATIVE.md`

The initiative defines:

- Five-act campaign structure.
- Minimum complete campaign target.
- Level roadmap for Acts 1-5.
- Gates for campaign spine, act templates, enemy expansion, reward expansion, and campaign complete.
- Immediate build plan for Act 2.

## Playable Content Added

Created:

- `src/game/scenes/SumpWarrensScene.ts`

The new scene includes:

- Act 2 title and objective surface.
- Two connected level sections:
  - Sump Gate.
  - Ledger Lift.
- Wider level bounds with camera follow.
- Ground and one-way platform layout using the existing Rotten Borough tile atlas.
- Three-enemy mixed encounter:
  - Drunken guard.
  - Tax clerk.
  - Elite auditor.
- Tax Pike starter kit for the Act 2 prototype.
- Locked drain exit that opens after all enemies are defeated.
- Act 2 completion banner.
- Progress unlocks:
  - `act2_sump_warrens_found`
  - `sump_gate_guard_drowned`
  - `sump_ledger_clerk_evicted`
  - `sump_elite_auditor_sunk`
  - `act2_sump_warrens_cleared`

## Integration

Updated:

- `src/game/GameConfig.ts`
- `src/game/scenes/PreloadScene.ts`
- `src/game/scenes/UIScene.ts`
- `src/game/scenes/TitleScene.ts`

Integration details:

- Registered `SumpWarrensScene` in Phaser scene config.
- Added direct browser route: `/?smokeAuto=1&smoke=sump`.
- Updated HUD route/target labels for Act 2.
- Updated title controls to mention dash.

## Smoke Coverage

Updated:

- `tests/smoke/check-browser-routes.mjs`

New browser smoke route:

- `/?smokeAuto=1&smoke=sump`

Assertions:

- Scene is `SumpWarrensScene`.
- All Sump enemies are defeated.
- `sumpComplete=true`.
- Weapon is `Tax Pike`.
- Player survives.
- At least three kills are recorded.
- Hit feedback fires.
- `act2_sump_warrens_cleared` is persisted.
- HUD route displays `sump cleared`.

## Visual QA

Captured:

- `/tmp/foxman-sump-warrens-pass.png`

Visual notes:

- The scene uses the existing Rotten Borough background and tile atlas with a sump tint.
- The completion flash was softened after the first capture read too green at screenshot timing.
- This is a functional campaign-spine expansion, not a final unique Act 2 art pass.

## Validation

Commands run:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `FOXMAN_BASE_URL=http://127.0.0.1:5176 npm run smoke:browser`

Browser smoke output showed the full matrix passing, including the new Sump route, and exited cleanly after the smoke cleanup patch.

## Remaining Recommendations

- Connect Toll Baron completion into Act 2 through a player-facing continue action instead of only direct smoke route access.
- Split Sump Warrens into reusable act/level metadata instead of scene-local layout definitions.
- Add unique Act 2 background/props and reduce reuse of Rotten Borough art.
- Add death/restart coverage inside Sump Warrens.
- Add the planned Act 2 boss: The Clog Prior.
