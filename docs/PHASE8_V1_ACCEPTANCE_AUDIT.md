# Phase 8 V1 Acceptance Audit

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Accepted as V1 candidate

## Decision

The current build is accepted as the V1 extended vertical-slice candidate for `The Adventures of Foxman, a Merciless Bastard`.

This is not a full campaign or full roguelite. It is the V1 proof that Foxman, Rotten Borough, generated art, combat, shop/build choices, death/restart, persistence, boss routing, tone, HUD readability, and smoke testing can live together in one playable slice.

## Requirement Map

| Requirement | Evidence | Result |
|---|---|---|
| One playable biome | Rotten Borough background, props, shop counter, and enemy art are integrated through project-local runtime assets. | Accepted |
| 10-15 minute proof direction | Extended route includes first room, reward/shop, second path, boss door, and Toll Baron boss routes. | Accepted as prototype-scale V1 |
| Foxman movement and combat chain | `RunScene`, `SecondRunScene`, and `MiniBossScene` cover movement, melee, ranged, skill, mutation, and boss combat. | Accepted |
| 1-3 enemy types | Drunken guard, tax clerk, elite auditor variant, and Toll Baron are present. | Accepted |
| One elite variant | Elite auditor variant is implemented and smoke-proven. | Accepted |
| Two melee weapons | Butcher Saber and Tax Pike are implemented. | Accepted |
| One ranged option | Receipt Spitter is implemented and smoke-proven. | Accepted |
| One skill | Spite Belch is implemented in first room, second path, and boss route. | Accepted |
| Two mutations | Hangover Hide and Petty Grudge are implemented and smoke-proven. | Accepted |
| Shop or reward room | Five-choice reward/shop scene is implemented with counter art and icons. | Accepted |
| Mini-boss or boss prototype | Toll Baron mini-boss with stamp behavior is implemented and smoke-proven. | Accepted |
| HUD health display | HUD shows max-health-aware HP, weapon, skill, route, and target state. | Accepted |
| Death and restart loop | Second path and boss death/restart routes are smoke-proven. | Accepted |
| Full path can be completed | Full-slice route from first room to shop to second path to boss completion is smoke-proven. | Accepted |
| Save persists deaths, kills, and unlocks | Smoke verifies deaths and multiple unlocks via `ProgressStore` datasets. | Accepted |
| Generated art replaces critical placeholders | Foxman, enemies, boss, props, background, reward/shop counter, and icons use project-local generated runtime assets. | Accepted for V1 |
| Build passes | `npm run smoke:all` passes. | Accepted |
| No P0/P1 blockers | Browser smoke matrix has no fatal console/network errors and no failing route. Known issues are post-V1 polish. | Accepted |

## Smoke Matrix Evidence

The latest `npm run smoke:all` passed with:

- Production build.
- Dist asset smoke.
- Browser route matrix:
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
  - Second-path death/restart.
  - Connected boss route.
  - Full-slice Petty Grudge boss route.
  - Skill-to-boss route.
  - Standalone mini-boss completion.
  - Boss death/restart.

## Build Evidence

Production output after V1 stabilization:

- App chunk: about `88.96 KB`.
- Phaser vendor chunk: about `1,208.06 KB`.
- No Vite large-chunk warning emitted.
- Runtime art assets are emitted and referenced by `dist/index.html`.

## Accepted Post-V1 Debt

These are not V1 blockers:

- Replace prototype circle/text hit feedback with generated VFX sprites.
- Add controller navigation and explicit selected states for the shop.
- Compress or further split large runtime art before a public demo.
- Add screenshot/pixel regression tests for visual framing.
- Add more build-specific boss reactions as more skills/mutations exist.
- Package release notes and a demo handoff checklist.

## Validation

- `npm run test`
- `npm run smoke:all`

## Result

V1 candidate accepted. Next target: post-V1 polish and packaging triage.
