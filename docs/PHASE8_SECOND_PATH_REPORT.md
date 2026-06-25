# Phase 8 Second Combat / Reward Path Report

Date: 2026-06-25

## Summary

Phase 8 now has a second playable combat path instead of only foundation hooks.

The reward room routes into a new audit-office arena, Foxman enters with the Tax Pike, the tax clerk variant participates in a real encounter, and clearing the path persists the `tax_clerk_evicted` unlock.

## Features Added

- `SecondRunScene`: second playable arena reached from `RewardScene` or directly through `?smoke=second`.
- `WeaponStats`: explicit combat stats for Rusty Knife, Butcher Saber, and Tax Pike.
- Tax Pike behavior:
  - Lower damage than the Butcher Saber.
  - Longer reach.
  - Higher knockback.
- Tax clerk encounter:
  - Uses the existing transparent guard sheet as a tinted prototype variant.
  - Has lower health than the drunken guard.
  - Can be killed through the second-path smoke route.
- Reward handoff:
  - `RewardScene` Enter key now starts `SecondRunScene`.
- Progression:
  - Clearing the second path persists `tax_clerk_evicted`.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 9 tests.
- `npm run build && npm run smoke` passed.

Browser second-path smoke:

- URL: `http://127.0.0.1:5173/?smoke=second`
- `1000ms`: `SecondRunScene`, weapon `Tax Pike`, tax clerk alive, variant `taxClerk`, reach `430`, damage `2`.
- `3600ms`: tax clerk dead, `secondPathComplete=true`, `tax_clerk_evicted` persisted.
- `6600ms`: second path remains complete, browser error log empty.

Browser reward handoff smoke:

- URL: `http://127.0.0.1:5173/?smoke=reward`
- Before Enter: `RewardScene`, `rewardStub=true`.
- After Enter: `SecondRunScene`, weapon `Tax Pike`, variant `taxClerk`.
- Browser error log empty.

First-room regression smoke:

- URL: `http://127.0.0.1:5173/?smoke=room`
- `1000ms`: first room active, guard alive, exit locked.
- `3200ms`: Butcher Saber collected, guard dead, exit unlocked.
- `8000ms`: room complete true, browser error log empty.

## Known Follow-Ups

- Tax clerk runtime art and browser smoke harness completed in `docs/PHASE8_TAX_CLERK_ART_AND_BROWSER_SMOKE_REPORT.md`.
- Add a real reward choice before entering the second path.
- Add a third enemy or elite variant.
