# INTEGRATION-001-REVISION-001 Builder Receipt

Run: `foxman-rotten-run-gauntlet-2026-08-11`

Task: `INTEGRATION-001-REVISION-001`

Role: sole bounded repair builder

Completed: `2026-08-11T21:28:57+08:00`

Builder verdict: `passed`

## Identity And Authority

- Repository: `/Users/marcusvale/Documents/coding/marcusbrainhq/repos/theadventuresoffoxman`
- Authoritative clean control head: `e7d3e397289a178719520856c03935e9104df364`
- `origin/main` at start and finish: `e7d3e397289a178719520856c03935e9104df364`
- Accepted pre-receipt runtime product parent: `a4a3451dd174e3a6de532d75bee2014918e66e06`
- The contract header's `a4a3451` identifies that runtime parent. The task assignment's `e7d3e397` is the authoritative control head and adds only control/evidence/contract material; `a4a3451..e7d3e397` has no diff under `src/`, `tests/`, or `package.json`.
- Worktree was clean before the test edit. No commit, push, deployment, package change, or Gauntlet-control edit was made.
- Decisions followed: `RR-DEC-001..015`, especially `RR-DEC-015`.

## Test-First Expected Red

The negative route was added before the product edit. It opened:

`/?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter`

The route deliberately omitted `smokeAuto`, installed a DOM `keydown` ledger, and used only real selection keys `3`, `6`, `Enter`, `2`. It then sent no combat-action keys and sampled phase, HP, weapon/skill counts and hits, trace digest, living enemies, owned combat objects, and canvas count for more than 4.5 seconds.

The first harness-construction run reached the full observation window but stopped on an over-strict DOM phase expectation. Window listeners see Phaser's state transition before recording the event, so the observed phases were `loadout`, `loadout`, `route-choice`, `encounter`. That first failure and screenshot are preserved. Only that test expectation was corrected; the product was still untouched.

The next run was the first to reach the product-isolation assertion and reproduced the frozen defect. It was preserved as the required expected red and was not retried against the broken product:

- observation: `4568ms` final sample / `4570ms` window
- DOM keydowns: exactly `3`, `6`, `Enter`, `2`
- combat inputs after encounter entry: none
- selected build/route: `tax-pike`, `seized-stamp`, `bailiffs-ramp`
- phase and HP: `encounter`, `6/6`
- first nonzero automation sample: about `1288ms`
- final weapon attacks/hits: `6/6`
- final skill uses/hits: `2/2`
- canvas count: `1`

Evidence:

- `expected-red/command-transcript.txt` — preserved harness-ordering first failure
- `expected-red/harness-ordering-first-failure-1366x768.png`
- `expected-red/product-red-command-transcript.txt` — deterministic product red, SHA-256 `a5c5b8a80bf66d92adbe45f4e39d2d73d81de271057fd8cca7b761feed1008ff`
- `expected-red/rotten-smoke-isolation-1366x768.png`

## Repair Shape

The product repair is the existing permission helper applied once at fixture initialization:

- `RottenRunScene.ts` imports `smokeAutoEnabled` beside `smokeParam`.
- The effective scenario is now `smokeAutoEnabled() ? smokeParam() : null`.
- Compatibility, encounter, market-heal, poor-market, and reacquisition booleans continue to derive from that one effective scenario.
- Ordinary `mode=rotten&seed=...` and player input remain unchanged.
- The enemy-cycle and reacquisition focused fixture URLs now explicitly carry `smokeAuto=1`.
- No combat automation, timing, enemy, player, market, topology, copy, presentation, campaign, or asset logic changed.

Changed repository files and final SHA-256:

- `src/game/scenes/RottenRunScene.ts` — `89f8b26296ce85e454435d5a223ca4ef69fbfe951b09eb9e3a1ef2ce897976f2`
- `tests/smoke/check-browser-routes.mjs` — `2ba97d0c4239c0ed79904820303d4ebbc0cde248965d404a394f0d16bd210e6e`

Final diff summary: two authorized files only, `125` insertions and `4` deletions (`RottenRunScene.ts` `2+/2-`; browser harness `123+/2-`).

## Validation Ledger

| Gate | Attempt | Verdict | Evidence |
| --- | ---: | --- | --- |
| Negative isolation against broken runtime | first run reaching product assertion | expected RED | `expected-red/product-red-command-transcript.txt` |
| Repaired negative isolation | 1 | PASS | `focused-isolation-green/browser-smoke-rottenIsolation-results.json` |
| Focused `rottenContract` with `smokeAuto=1` | 1 | PASS | `focused-rotten-contract/browser-smoke-rottenContract-results.json` |
| Focused `rottenEnemyCycle` with `smokeAuto=1` | 1 | PASS | `focused-rotten-enemy-cycle/browser-smoke-rottenEnemyCycle-results.json` |
| Focused `rottenEncounter` with `smokeAuto=1` | 1 | PASS | `focused-rotten-encounter/browser-smoke-rottenEncounter-results.json` |
| Focused `rottenMarket` with `smokeAuto=1` | 1 | PASS | `focused-rotten-market/browser-smoke-rottenMarket-results.json` |
| `npm test` | 1 | PASS, 42/42 in 4 files | `deterministic/unit-tests-transcript.txt` |
| `npm run typecheck` | 1 | PASS | `deterministic/typecheck-transcript.txt` |
| `npm run build` | 1 | PASS, 52 Vite modules | `deterministic/build-transcript.txt` |
| `npm run smoke` | 1 | PASS | `deterministic/dist-smoke-transcript.txt` |
| `git diff --check` | 1 | PASS | `deterministic/diff-check-transcript.txt` |
| Unfiltered `npm run smoke:browser` | exactly 1 | PASS, 28/28 top-level results | `full-matrix/browser-smoke-results.json` |

The repaired focused isolation result observed `4588ms` in `encounter`, HP `6/6`, two living enemies, one canvas, exact DOM keys `3`, `6`, `Enter`, `2`, and maximum weapon attack/hit and skill use/hit counts all `0`. SHA-256: `01271159a8d98be510b0e37f450350d41ea6741d949547745db2692e46fa6278`.

The sole full matrix contains 23 accepted campaign routes, four existing Rotten top-level routes, and the new isolation regression: `28/28`. Its isolation observation remained `0/0` weapon attack/hit and `0/0` skill use/hit for `4545ms`. Full JSON SHA-256: `6b61e3ff32df75e015a28ae98868027e7d789954d7ef1f59e9f6e6352cf02021`.

The authorized focused routes also preserved compatibility entry, enemy attack-state cycles, two reacquisitions, death/retry cleanup, two combat builds, purchase, damaged heal, bank, unaffordable rejection, invalid-input rejection, exact Stage 2 carry, zero stale combat objects at the required boundaries, and one canvas.

## Attempts, Retries, And Cleanup

- One pre-product harness expectation was corrected and preserved before the expected product red. It was not a focus, transport, or server retry and did not change the product.
- The deterministic nonzero product red was never retried against the broken runtime.
- All post-patch focused gates passed on their first attempts.
- The unfiltered matrix ran exactly once and passed; no full-matrix retry occurred.
- No gameplay or timing value was tuned.
- No loopback server remained listening on port `5173` after validation.

## Scope And Stop Audit

- Repository changes are exactly `src/game/scenes/RottenRunScene.ts` and `tests/smoke/check-browser-routes.mjs`.
- Evidence exists only under `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/integration-001-revision-001-builder/`.
- No forbidden source, package, asset, ops, or Gauntlet-control file changed.
- No deterministic regression or stop condition appeared.
- Blocker: none.
- Token accounting: no per-worker platform token telemetry was exposed to this builder.

## Recommended Next Action

Send this uncommitted two-file repair and external receipt to one fresh, read-only INTEGRATION-001 reviewer. The builder does not accept or promote its own work.
