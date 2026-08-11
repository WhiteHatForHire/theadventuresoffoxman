# LEAF-004 Revision-01 Builder Receipt

Recorded: 2026-08-12T01:59:48+0800

## Disposition

Builder validation passed for the bounded harness-only repair. The product candidate was not changed. This is not an acceptance decision: `selfAccepted` is false, and promotion remains with a fresh blind critic and the lead.

- Control HEAD and `origin/main`: `126c986774a6e7a39408ddf7c4afbe33d2ed818d`
- Accepted runtime product parent: `7cef4b039c401890ac24fb1a8a27800aa6bb18f7`
- Revision: `LEAF-004-REVISION-01`
- Blocker: none
- Authorized and changed repo file: `tests/smoke/check-browser-routes.mjs`
- Product/runtime/unit/control/ops files changed by this revision: none
- Commits, pushes, deploys, packages, subagents: none

All 13 non-harness candidate files compare byte-for-byte with the blind critic's frozen source snapshot. The frozen critic had independently passed product behavior and requested this repair because its unfiltered run leaked Chrome page targets and stalled.

## Patch identity and architecture

- Frozen before-file SHA-256: `d1e5539b6098580aea800a18f8cf9dd3ce2fd2590cb2e1bd6659dce684c04bd0`
- After-file SHA-256: `7ca1ca8e3bf14e4d9235470e48e1e928181d49e6156dc6c8e1340b331bb0ab3f`
- Revision diff: `+562/-40`
- Canonical revision unified-diff SHA-256: `9b8c9b3337c697cdc77fba1bafc01739e1ccedbf118ff21773a78a67f44d520c` (`diff -u --label before/tests/smoke/check-browser-routes.mjs --label after/tests/smoke/check-browser-routes.mjs`)
- Full HEAD-to-current harness patch SHA-256: `edd5aa32420d1236575868e3f0fed6e46498250041d46d5f021f411dfd01bf87`

`CdpPage.close()` is now idempotent and closes the actual target with bounded `Target.closeTarget`, verifies the target disappears, and has a bounded HTTP-close fallback. WebSocket close/error rejects and clears every pending CDP call. Every CDP send is bounded: default 12,000 ms, navigation 15,000 ms, screenshots 15,000 ms, target close 5,000 ms, and DevTools HTTP 5,000 ms. Errors identify the method, target id, requested/current URL, and last-known DOM/phase context. Route/target progress is emitted before open, after open, after close, on run completion, and on failure. Raw `keyDown`/`keyUp` transport and all product routes/assertions remain unchanged.

Smoke isolation retains the literal phase assertion and direct no-`smokeAuto` combat-maxima proof, plus a genuinely independent pre/post-key ledger:

1. `3`: `loadout -> loadout`, weapon selected.
2. `6`: `loadout -> loadout`, skill selected.
3. `Enter`: `loadout -> route-choice`.
4. `2`: `route-choice -> encounter`.

Observed no-auto maxima remained attacks `0`, hits `0`, skills `0`, skill hits `0`.

## Lifecycle discriminators

Before patch, one lightweight six-cycle probe proved the expected red: baseline page-target count `1`; successive websocket-only closes left counts `2,3,4,5,6,7`; all six closed target ids remained; final growth `+6`.

- Evidence: `lifecycle-expected-red.json`
- SHA-256: `5b792e3e9841015283502895438c57571c146df142e5ef232ee706f6f0889195`

After patch, the single lifecycle probe opened and closed 40 targets. Every open produced exactly two page targets (one baseline plus one test page), every close returned to exactly one, every cycle had zero leaked test pages, and the final test-page count was zero. Elapsed: `24,431 ms`; progress records: `123`.

- Evidence: `lifecycle-after/browser-smoke-cdpLifecycle-results.json`
- SHA-256: `cd260d72ae9bbced96dd44b504a64e94d12f8fb5fd5aeefb661c8bdfdafa6b15`

## Attempt ledger

Validation ran in the required order. Every focused browser route below passed on its first attempt, ended at one baseline page target and zero test targets, and produced no timeout:

| Gate | Attempt | Result | Elapsed | Result SHA-256 |
| --- | ---: | --- | ---: | --- |
| `node --check tests/smoke/check-browser-routes.mjs` | 1 | PASS | n/a | n/a |
| `git diff --check` | 1 | PASS | n/a | n/a |
| `cdpLifecycle` (40 cycles) | 1 | PASS | 24,431 ms | `cd260d72ae9bbced96dd44b504a64e94d12f8fb5fd5aeefb661c8bdfdafa6b15` |
| `rottenIsolation` | 1 | PASS | 7,732 ms | `94a3f54259840c4e48d3be264af9970db1e4c5a48e050144ddf95b92135dc550` |
| `rottenContract` | 1 | PASS | 3,378 ms | `336a00937aa71202f0f2776a27a1f074ed4da83eeab9fe6248a1cd6ade4d5f68` |
| `rottenEnemyCycle` | 1 | PASS | 11,867 ms | `1d1de62814b67aa4fc1f33a71b2bdae1fd2dc94b5ad3837832e637102de0f14f` |
| `rottenEncounter` | 1 | PASS | 42,838 ms | `6ddefca00f1ffa315fd1c20ec4b6764454b00d7e6e6916449fd28be51a26108f` |
| `rottenStageTwoRoles` | 1 | PASS | 57,463 ms | `c66cc8be924d3fc04f617ce260dbe15bcfa1330edf6b85abecc85289f2fb2042` |
| `npm test` | 1 | PASS, 54/54 in 5 files | n/a | n/a |
| `npm run typecheck` | 1 | PASS | n/a | n/a |
| `npm run build` | 1 | PASS, 53 modules | n/a | n/a |
| `npm run smoke` | 1 | PASS, dist | n/a | n/a |

Post-fix deterministic failures: none. A timeout was not forced; the bounded diagnostic paths were implemented, while all real validation completed without triggering one.

## Sole unfiltered matrix attempt

Exactly one unfiltered `npm run smoke:browser` attempt was made after all focused gates passed. It was not retried.

- Result: PASS (`ok: true`), `34/34` result routes
- Elapsed: `500,037 ms` (8m20.037s)
- Progress: `174` records; 57 opens, 57 ready events, 57 verified closes, plus baseline/start/complete
- Every open target count: `2`; every verified close target count: `1`
- Final target count: one baseline page, zero test pages
- Result: `final-unfiltered/browser-smoke-results.json`
- Result SHA-256: `3c43f992fcbdcb6ecd0bf72852b025fe6a58c39e485e31a57b65df8de2660790`
- Visuals: 52 final-matrix PNGs; sorted content-manifest SHA-256 `63d18a309f9bbca0d761def0e9e15062962859ab1357330bd2b752f4b3a3097c`
- Focused visuals: 20 PNGs; sorted content-manifest SHA-256 `e2cb3e91efab77d4da955ed14b18362dbf8d0835af8edb09a0d1201f2362f36c`

The repaired run progressed beyond the critic's frozen stall point and terminated normally with its result JSON.

## Cleanup and next route

No Foxman preview, harness, or test Chrome process remains. The two exact-owned temporary Chrome profiles (`foxman-chrome-NMZgyR` and `foxman-chrome-jKbbpw`) were deleted after their ownership timestamps were matched to the focused runs; these temporary deletions are not recoverable. No unrelated process or profile was touched.

Recommended fresh blind critic route: inspect the one-file revision diff and lifecycle before/after evidence, verify the independent isolation transition ledger, then audit the sole unfiltered JSON/progress/visual evidence and decide acceptance. Do not treat this builder receipt as self-acceptance, and do not rerun the builder's one-attempt matrix merely to manufacture another green result.
