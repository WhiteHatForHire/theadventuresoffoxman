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
- `src/game/scenes/MiniBossScene.ts`

Integration details:

- Registered `SumpWarrensScene` in Phaser scene config.
- Added direct browser route: `/?smokeAuto=1&smoke=sump`.
- Updated HUD route/target labels for Act 2.
- Updated title controls to mention dash.
- Updated the Toll Baron clear prompt so Enter now advances from Act 1 into `SumpWarrensScene` instead of returning to the title.
- Added Act 1 completion persistence through `act1_cleared` during the boss-to-Act-2 handoff.

## Smoke Coverage

Updated:

- `tests/smoke/check-browser-routes.mjs`

New browser smoke route:

- `/?smokeAuto=1&smoke=sump`
- `/?smokeAuto=1&smoke=boss -> Enter -> Act 2`

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
- Boss-clear handoff starts `SumpWarrensScene`.
- Boss-clear handoff persists `act1_cleared` and `act2_sump_warrens_found`.
- Act 2 starts with its encounter intact after the handoff.

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

Follow-up browser smoke output also proved the player-facing Act 1-to-Act-2 handoff: clearing the Toll Baron and pressing Enter now starts `SumpWarrensScene` instead of returning to the title.

## Remaining Recommendations

- Split Sump Warrens into reusable act/level metadata instead of scene-local layout definitions.
- Add unique Act 2 background/props and reduce reuse of Rotten Borough art.
- Add the planned Act 2 boss: The Clog Prior.

## 2026-08-08 Act 2 Closure Addendum

SOL Wave 22 closed the survivability and feedback gap without expanding the act:

- Added an explicit Sump death screen and R/Enter restart.
- Restart restores Foxman to 6/6 HP, clears motor/dash state, restores all three enemies at full health, resets local kills/completion/exit/camera state, removes active hit VFX, and preserves the single persisted death.
- Added direct `/?smokeAuto=1&smoke=sumpDeath` routing and deterministic death/restart assertions.
- Added a separate isolated keyboard-R receipt plus the stable full-matrix restart hook used by the existing death routes.
- Added a three-image dash trail and `dash` audio-bus cue while leaving `PlayerMotor` values and invulnerability mechanics unchanged.
- Added a 390×844 browser route proving the canvas remains contained, has no horizontal overflow, and accepts the existing start control. This does not claim touch controls.

Evidence lives under `docs/08-run/evidence/`, with the decision packet in `docs/08-run/2026-08-08-sol-wave-run-receipt.md`.

Validation passed:

- `npm test` — 23 tests.
- `npm run build`.
- `npm run smoke`.
- Full Chrome DevTools browser matrix — 23 routes, no fatal console/network errors.

Technical verdict: `accept_with_conditions`. There is no known deterministic Act 2 closure blocker. Marcus's direct play/feel review remains the release gate, and portrait-scale readability must be accepted before making a mobile-readability claim. Dedicated touch controls, an audible dash asset, unique Sump art, reusable act metadata, and the Clog Prior remain optional or future scope rather than closure blockers.
