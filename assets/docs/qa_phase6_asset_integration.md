# QA Phase 6 Asset Integration

Date: 2026-06-25

## Accepted Runtime Sheets

| Asset | Runtime Path | QA Result |
|---|---|---|
| Foxman prototype sheet | `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png` | Accepted for crop-based idle/run/jump/attack prototype. |
| Drunken guard runtime sheet | `assets/game/sprites/enemies/enemy_guard_drunken_runtime_sheet_alpha.png` | Accepted for patrol/chase/attack/hurt/dead prototype crops. |
| Pickup/exit prop sheet | `assets/game/props/rotten_borough/prop_pickup_exit_runtime_sheet_alpha.png` | Accepted for Butcher Saber pickup and locked/unlocked gate crops. |

## Crop Registry

Runtime crop metadata is centralized in `src/game/assetFrames.ts`.

Covered frame sets:

- `FoxmanFrames`: idle, run, jump, attack, hurt, dash.
- `GuardFrames`: idle, patrol, alert, attack, hurt, dead.
- `PropFrames`: locked gate, unlocked gate, butcher saber, pickup ring, lock icon, exit arrow.

## Validation Notes

- Browser smoke confirmed one Phaser canvas renders.
- Browser smoke confirmed the room route completes after the asset swap.
- Console error log was empty during final room smoke.
- Production build no longer bundles the raw drunken guard concept sheet.

## Follow-Ups

- Replace crop-sheet prototyping with packed atlas exports.
- Add visual screenshot comparison after screenshot capture is stable for the canvas route.
- Tighten body offsets after the next animation export pass.
