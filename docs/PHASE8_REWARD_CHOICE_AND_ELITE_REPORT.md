# Phase 8 Reward Choice And Elite Prototype Report

Date: 2026-06-26

## Summary

This gate made the reward room meaningful and introduced the next combat escalation.

The reward room now presents two choices, each changes the second path, and `SecondRunScene` now includes an elite auditor prototype after the tax clerk. The browser smoke harness validates both reward branches and the elite clear.

## Features Added

- `RewardChoice` model:
  - `pikeReach`: extends Tax Pike reach and knockback.
  - `auditShield`: starts the second path with one extra hit point.
- Reward room UI:
  - Shows both choices.
  - Enter or `1` selects `pikeReach`.
  - `2` selects `auditShield`.
- `SecondRunScene` reward handling:
  - Reads scene data or `?reward=...` query string.
  - Applies reward-specific weapon or health behavior.
- Elite auditor prototype:
  - Uses the tax clerk runtime sheet as a documented placeholder.
  - Larger, gold-tinted, higher-health `eliteAuditor` variant.
  - Must be defeated after the tax clerk for `secondPathComplete=true`.
- Progression:
  - Persists `elite_auditor_embarrassed`.
  - Persists `reward_pikeReach` or `reward_auditShield`.

## Validation

Commands:

- `npm run typecheck` passed.
- `npm run test` passed: 11 tests.
- `npm run smoke:all` passed.

Browser smoke coverage:

- `/`: title/start and pause/resume.
- `/?smoke=room`: first room completes.
- `/?smoke=reward`: reward room lists `pikeReach,auditShield` and Enter routes to `SecondRunScene` with `pikeReach`.
- `/?smoke=second&reward=pikeReach`: Tax Pike reach is `520`, tax clerk and elite auditor die, second path completes, reward unlock persists.
- `/?smoke=second&reward=auditShield`: player health is `6`, Tax Pike reach remains `430`, second path completes, reward unlock persists.

Build note:

- Vite still warns that the main JS chunk is over `500 kB` because Phaser and full-size generated sheets are bundled directly.

## Known Follow-Ups

- Generate unique elite auditor runtime art.
- Add actual reward-room selection with mouse/click affordances.
- Add a third combat room or mini-boss prototype.
- Start slicing large sprite sheets into packed atlases.
