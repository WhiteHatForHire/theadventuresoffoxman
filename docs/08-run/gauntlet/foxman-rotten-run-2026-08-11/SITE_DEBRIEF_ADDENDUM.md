# August Gauntlet Site Debrief Addendum

Public-source status: safe to use as case-study source material. It contains no
private workspace paths, credentials, secrets, raw private exports, or claims
of a public deployment.

Run: `foxman-rotten-run-gauntlet-2026-08-11`

Product: The Adventures of Foxman — Rotten Run

Outcome: substantial accepted vertical-slice progress; controlled wind-down
before the strict definition of done

## Old State Versus New State

| Before the Gauntlet | Accepted state at wind-down |
| --- | --- |
| Authored Campaign was the only playable run and had to remain intact. | Campaign remains intact and retains 23 accepted regression routes. |
| No separate deterministic Rotten Run product loop. | `R`/direct URL opens a separate seed-addressable Rotten mode without replacing Campaign Enter. |
| No three-stage roguelite plan, route history, or run-local economy. | Three deterministic two-wave stages, two planned routes per stage, three market decisions, route/market history, graft, heal, bank, and strict no-ops. |
| No Rotten loadout/build matrix. | Four weapons, three active skills, eight carried upgrades, five enemy roles, and two elite variants share one generic encounter/build runtime. |
| No Rotten death/retry contract. | Actual death through Stage 3 resets the same seed to a clean loadout; a second `R` is inert. |
| No final-boss boundary. | An honest Commissioner dossier carries exact run truth but creates no boss object and fabricates no boss health, phase, victory, or result. |

This is not the completed frozen promise. Commissioner combat, results and
local records, settings/accessibility, audio completion, real-boss build proofs,
final integration, and human acceptance remain.

## What Is Testable Now

From the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run smoke
FOXMAN_SMOKE_ONLY=cdpLifecycle npm run smoke:browser
FOXMAN_SMOKE_ONLY=rottenStageThreeMarket npm run smoke:browser
FOXMAN_SMOKE_ONLY=rottenStageThreeRetry npm run smoke:browser
npm run smoke:browser
```

The final command is the broad production matrix and took about 15 minutes in
the accepted LEAF-005 gate. It should not be used as a casual inner-loop test.

No review server is intentionally retained. To inspect the accepted local
artifact without changing product code:

```bash
npm run build
npm exec vite preview -- --host 127.0.0.1 --port 4177 --strictPort
```

Then review:

- Campaign: `http://127.0.0.1:4177/` and press `Enter`.
- Normal Rotten Run: `http://127.0.0.1:4177/?mode=rotten&seed=GAUNTLET-ALPHA`.

The reviewed seed remains plan `RR1-1C93B57F`. Smoke-labelled routes are test
fixtures; `smokeAuto=1` is required before any fixture may automate combat.

## Accepted Versus Unaccepted Work

Accepted and pushed:

- LEAF-001 through LEAF-005.
- Product commit `d849c4fcd2398716eb22f6ae3605b64fafca8db5`.
- Complete Stage 1–3 combat/reward loop and inert Commissioner dossier.
- Physical numeric release barrier that prevents a rejected market key from
  cascading into the next route docket.
- Preserved authored Campaign and accepted browser matrix.

Preserved but not accepted as final product:

- The older LEAF-005 candidate with tracked diff prefix `379e103...`; its sole
  matrix failed after 38/40 results on an over-specified HP assertion.
- The first LEAF-005 critic verdict, `REVISE`, after a rejected Stage 2 key
  cascaded into Stage 3 route selection.
- The intermediate release-barrier implementation that stopped the cascade but
  incorrectly blocked a later reused `6` key.
- Any Commissioner combat, victory/results, records, or completion claim.

There is no current dirty product candidate and no public deployment.

## Gate And Leaf Timeline

| Gate | Commit | Accepted change | Major decision or gate result |
| --- | --- | --- | --- |
| Prepared baseline | `779f935` | Frozen directive, plan, evidence protocol | Separate Rotten mode; Campaign is protected regression truth. |
| LEAF-001 | `fa94e97` | Deterministic mode shell and planned route docket | Seed-addressable state; one sequential worker and lead-only promotion. |
| LEAF-002 | `0c29d6a` | Complete Stage 1 combat and same-seed retry | Blind critique forced grounded frame anchoring and bounded offscreen reacquisition. |
| LEAF-003 | `23e309e` | First market, build ownership, Stage 2 docket | Pure market reducer; purchase/heal/bank are one-decision transactions. |
| Integration repair | `7cef4b0` | Smoke automation isolation | Scenario names never authorize automation without explicit `smokeAuto=1`. |
| LEAF-004 | `e8a9957` | Complete Stage 2, roles, elites, eight effects | Generic encounter/build pipeline; no stage-specific flow clones. |
| LEAF-005 | `d849c4f` | Complete Stage 3, third market, inert dossier | Finish the pre-boss loop honestly; do not fake an unfinished boss. |
| Wind-down | `5a00b2e` | Schema-valid state and recovery debrief | Human 6% backend-budget report superseded autonomous continuation. |

## Validation Facts And Metrics

| Evidence | Result |
| --- | --- |
| Final unit suite | `61/61` passed |
| Final focused filters | `17/17` passed, each on first and only recritic attempt |
| CDP lifecycle gate | `40/40` page open/close cycles; exact baseline restored |
| Direct product review | In-app Browser at `1366x768` and `1920x1080`; zero console warnings/errors |
| Critical input regression | Exactly `2` down/up then `5` down/up, all non-repeat; docket inert for 22 samples, then fresh `1` entered Collection |
| Final unfiltered matrix | `40/40`, `ok=true`, `899327 ms`, no timeout/failure/retry |
| Final matrix SHA-256 | `13a3d5942ad67f79bd6cf006cea296ab3922e2b6e6f76f188d2d794de0f18fa5` |
| Campaign regression component | 23 authored Campaign routes retained inside the combined matrix |
| Browser target cleanup | Final target ID and `1 page / 0 test pages` matched the start |

The repository-indexed browser matrix grew with the product: 24 top-level
results at LEAF-001, 26 at LEAF-002, 27 at LEAF-003, 28 after integration
repair, 34 at LEAF-004, and 40 at LEAF-005.

## Budget, Crashes, Stalls, And Costly Loops

- Known platform goal telemetry at wind-down: `3,052,620` tokens against the
  original `1,250,000,000` project ceiling.
- Coverage limit: that telemetry is the visible lead/project surface;
  descendant-specific token totals were unavailable. It must not be presented
  as full backend billing or complete model consumption.
- Marcus separately reported approximately 6% backend budget remaining. That
  human signal controlled the stop even though the platform counter was below
  the planned 25M trajectory audit.
- Codex was force-quit around `2026-08-11T08:21:00Z`. Git, preserved evidence,
  and recovery receipts prevented accepted LEAF-001 work from being repeated.
- LEAF-004's first full matrix stalled for more than 15 minutes after reaching
  a clean product state because closing a CDP page closed only the websocket,
  leaking 32+ Chrome targets. The repair added real target close, bounded CDP
  calls, diagnostics, and the 40-cycle lifecycle gate.
- LEAF-003 input diagnosis exposed thousands of spurious CDP events when the
  wrong native key-code fields were sent. Raw `keyDown`/`keyUp` fixed transport;
  held action keys still needed frame-length input in Phaser.
- LEAF-005's old matrix ran through 38/40 results before an exact-HP assertion
  failed. Later, a clean four-event DOM ledger proved a separate route cascade
  was a scene phase-boundary defect, not browser transport noise.
- Final LEAF-005 acceptance alone included a 10/10 focused boundary-stability
  loop and a `899327 ms` broad matrix. Those loops were valuable but expensive.

## Notable Repository Evidence

All paths below are stable repository-relative references suitable for a case
study asset manifest.

| Evidence path | SHA-256 | Caption |
| --- | --- | --- |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-001/title-1920x1080.png` | `b79fd4d0522b2fe99b9f7651abcd4603e08ab7fd46c566ec90ef610ecb4f0728` | Separate Rotten Run entry point while Campaign Enter remains available. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-002/rotten-held-melee-tell-1366x768.png` | `a0883067691c8c71b27187e39b4e865936da06f630ce71f5aeedcc84856cf9a1` | Stage 1 live melee encounter with readable enemy tell and grounded actors. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-003/reward-open-1366x768.png` | `c76b90fed1485bbf21fac5100c3625bd8cec42c44d2bfa38be22f4da8b84be48` | First deterministic reward market before a purchase/heal/bank decision. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-004/screens/stage2-shield-open-1920x1080.png` | `c42d81c34e9ffc5bc86abc3f292fe8562058dd61dcc9554946ab5ee361f261cc` | Shield Auditor counterplay in its readable open state. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-004/screens/stage2-elite-live-1920x1080.png` | `128e37a69a67d563babb8b1c519dc325759382de3a0994349bebfa87b299daf9` | Deterministic elite variant live in Stage 2. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-004/screens/stage3-inert-1920x1080.png` | `8c8f8574f93318be1e938dd14f44d8326b3dcf31cd5db7fd0ea23faa668afb73` | The honest pre-LEAF-005 Stage 3 handoff rather than fabricated combat. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-004/browser-smoke-results.json` | `00c2b42f490cb4bd117d18f98d8d68d9a82b6d7dea9b3330da76372b800fe71b` | Complete LEAF-004 34-result production matrix receipt. |
| `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/evidence/leaf-003/encounter-stability-summary.json` | `adcb3fd445f850b1b48d338f96fe952ac609dabea95b7ff7ba23c2916bd1eb4b` | Ten-pass focused encounter stability summary. |

LEAF-005's accepted Stage 3 screenshots and raw 40-result receipt remain sealed
in the internal evidence archive rather than duplicated into the repository at
wind-down. Their public-safe integrity anchors are the accepted product commit,
the final matrix hash above, and this checkpoint. No private archive location
is required for the site copy.

## Git Truth At Addendum Start

- Branch: `main`.
- Accepted product commit: `d849c4fcd2398716eb22f6ae3605b64fafca8db5`.
- Wind-down control head: `5a00b2edbcbfe0ccfe14cd751812f4fe3c4b5fe3`.
- `HEAD`, `origin/main`, and `origin/HEAD` matched at `5a00b2e`.
- Worktree was clean before this documentation-only addendum.
- No product candidate, review server, public deployment, or Foxman test
  process was retained.

The commit containing this addendum is a control-only descendant. Its final
remote identity should be taken from Git, not inferred from this self-referential
document.

## Unresolved Defects And Exact Next Action

Open product gaps:

1. Commissioner combat and telegraphed boss patterns do not exist yet.
2. Victory/death results and local records do not exist yet.
3. Settings/accessibility and complete original audio coverage remain.
4. Three different-seed real-boss completions and a separate Butcher Saber
   proof remain.
5. Final integrated reality gate, product story, and human acceptance remain.
6. `npm ci` reported two high-severity dependency advisories; dependency
   remediation was outside the accepted leaf scope.

Exact next action:

`Wait for explicit human budget restoration and resume authority. Verify clean main/origin and the accepted d849c4f ancestor, read RUN_STATE.json plus CONTROLLED_WIND_DOWN.md, then frame—but do not immediately launch—the smallest Commissioner combat leaf. Do not repeat LEAF-001 through LEAF-005 or pay for a broad matrix before the boss leaf has a bounded contract.`

## Candid Lessons And Interesting Moments

1. A green test suite did not mean a green game. Blind browser critics found
   enemies under the floor, an offscreen one-HP softlock, hidden smoke
   automation, and a cross-phase key cascade.
2. The funniest useful invariant was also the simplest: a rejected number key
   must not spend itself again on the next screen. Four DOM events and a
   2.2-second hold finally made that truth undeniable.
3. Honest incompleteness paid off. The inert Commissioner dossier was more
   trustworthy—and more reusable—than pretending an unfinished boss existed.
4. Browser lifecycle is product infrastructure for agentic testing. Closing the
   websocket but not the target turned a passing game into a 17-minute stalled
   matrix; a 40-cycle close test prevented recurrence.
5. Deterministic seeds made criticism cumulative. The same plan could be
   replayed across builders, fresh critics, a crash recovery, and two viewports
   without relying on chat memory.
6. The run stopped with a much stronger slice but before the promise was done.
   Recording `budget_exhausted` instead of `complete` is part of the quality bar.
