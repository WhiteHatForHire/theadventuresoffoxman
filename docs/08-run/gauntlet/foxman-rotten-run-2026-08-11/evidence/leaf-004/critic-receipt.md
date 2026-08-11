# LEAF-004 Reality Gate Receipt — Recovered Closeout

## Receipt status

This receipt was reconstructed by the Gauntlet lead after the fresh blind recritic completed all validation, froze a provisional `PASS`, cleaned its runtime, and then twice stalled only while formatting the receipt. No validation was rerun and no verdict was reinterpreted.

- Critic task: `/root/leaf_004_recritic`
- Verdict frozen blind: `PASS`
- Candidate repository: `/Users/marcusvale/Documents/coding/marcusbrainhq/repos/theadventuresoffoxman`
- Control HEAD and `origin/main`: `126c986774a6e7a39408ddf7c4afbe33d2ed818d`
- Accepted runtime parent: `7cef4b039c401890ac24fb1a8a27800aa6bb18f7`
- Candidate manifest SHA-256: `17243d0cd3c4d12264dffab699374ef8b60639caff4dc3c1fe7464aca8ac18e3`
- Tracked diff SHA-256: `23a6bdc67e56a1b187f1ccc549fc9f9cb2f15152e33037f0d85f5cdc1d1d8916`
- External pre-install source-tree SHA-256: `ea5f87bac171d38f5871470b46a3d6ad98cdc9b265666aff5eadc3039f5eb5b8`
- External production dist-tree SHA-256: `14dc59dbe8b35a62802001240a9da9a6ceba531af39f1be0cef3f60a23b8dacc`

## Independence and scope

The recritic froze the exact 14-file candidate before reading builder or prior critic evidence. The external artifact byte-matched all 277 tracked files and all 14 dirty candidate files. Scope remained the 11 authorized modified files plus `src/game/rotten/encounters.ts`, `src/game/scenes/rotten/RottenRunPresentation.ts`, and `tests/unit/rotten-run-stage-two.test.ts`. No campaign scene, asset, package, control, or ops file changed.

The harness review confirmed actual target closure, bounded CDP sends/navigation/screenshots, pending-request rejection on transport loss, route/target/last-DOM diagnostics, preserved raw-key transport, strengthened smoke-isolation transitions, and no unfiltered shortcut or weakened product assertion.

## Deterministic gates

All ran once against the frozen external artifact and passed:

- `git diff --check`
- smoke harness syntax
- full unit suite: `54/54`
- typecheck
- production build: 53 modules
- dist smoke

## Target lifecycle gate

`FOXMAN_SMOKE_ONLY=cdpLifecycle` ran exactly once and passed 40/40 unique open/close cycles.

- Baseline: 1 page / 0 test pages
- Every open: 2 pages / 1 test page
- Every close: 1 page / 0 test pages
- Final: 1 page / 0 test pages
- Result SHA-256: `831b11a4ee2ad64cc697799acae7bb0d0d35a9b1ceba5e23f777af60e0141ea4`

## Focused first-attempt ledger

All passed with no retries, and every result returned to 1 baseline page / 0 test pages:

- `cdpLifecycle` — 23.186s
- `rottenIsolation` — 7.193s
- `rottenContract` — 2.970s
- `rottenEnemyCycle` — 11.527s
- `rottenEncounter` — 42.401s
- `rottenMarket` — 40.991s
- `rottenStageTwoTopology` — 42.820s
- `rottenStageTwoRoles` — 57.060s
- `rottenStageTwoElites` — 26.392s
- `rottenStageTwoBuilds` — 121.652s
- `rottenStageTwoMarket` — 62.336s
- `rottenStageTwoRetry` — 20.126s

The isolation control omitted `smokeAuto`; real raw keys `3, 6, Enter, 2` produced the independent loadout → route-choice → encounter ledger, followed by 4.566s with attack, hit, skill-use, and skill-hit maxima all zero.

Focused product proof covered all frozen Stage 2 route rosters; Shield Auditor block/flank/skill and dash openings; Sump Scribe telegraph, activation, hit, expiry, and Bomb clear; gilded armor break; overdue once-only enrage; all eight carried upgrades and all three build archetypes; Stage 2 purchase/heal/bank/rejected paths; exact inert Stage 3; cleanup; and actual Stage 2 death followed by same-seed `R` reset.

## Exactly-one unfiltered matrix

The unfiltered matrix ran exactly once and completed successfully.

- Exit: 0
- `ok`: true
- Results: 34/34
- Elapsed: 496,725ms
- Progress events: 174
- Unique targets opened: 57
- Targets closed: 57
- Every open: 2 pages / 1 test page
- Every close: exact original baseline target at 1 page / 0 test pages
- Timeout/failure events: 0
- Final: exact original baseline target at 1 page / 0 test pages
- Result: `work/leaf-004-recritic/logs/full-matrix/browser-smoke-results.json`
- Result SHA-256: `00c2b42f490cb4bd117d18f98d8d68d9a82b6d7dea9b3330da76372b800fe71b`

## Direct in-app Browser gate

The recritic operated the same frozen external production artifact in the real in-app Browser at 1366×768 and 1920×1080 before the final matrix. Durable screenshots under `work/leaf-004-recritic/screens/` cover:

- campaign title and real Enter handoff;
- no-`smokeAuto` isolation loadout and encounter;
- GAUNTLET-ALPHA loadout, Stage 1 entry, and Stage 1 market;
- carried Stage 2 entry, live Shield Auditor open state, Sump hazard, and elite state;
- Stage 2 market and exact inert Stage 3 docket;
- real Stage 2 death/reset journey.

The critic reported direct product evidence complete with no product, visual, console, resource, texture, canvas, or cleanup blocker. The screenshots show a coherent readable single-canvas artifact at both target viewports.

## Provenance comparison and residual

The blind verdict was frozen before prior evidence comparison. Lead reconciliation found no material candidate, attempt-count, or scope mismatch with the builder and prior critic records.

Largest residual: the generic end-of-run harness assertion explicitly asserts zero test targets and records total page count; exact total-baseline equality is asserted by the dedicated 40-cycle lifecycle gate and was independently verified in the one-shot full-matrix JSON. This is nonblocking.

## Cleanup and repository truth

The external preview, matrix Chrome, in-app Browser audit state, and critic-owned profiles/processes were cleaned before receipt recovery. Read-only lead checks found no remaining recritic preview, Chrome, or matrix process. The repository remained at control HEAD/origin `126c986774a6e7a39408ddf7c4afbe33d2ed818d` with the exact frozen 14-file candidate and clean diff check.

PASS
