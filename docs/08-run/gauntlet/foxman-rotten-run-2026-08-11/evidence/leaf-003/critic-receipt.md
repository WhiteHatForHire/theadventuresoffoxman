# LEAF-003 Revision 02 — Fresh Blind Reality Gate Receipt

Run: foxman-rotten-run-gauntlet-2026-08-11
Leaf: LEAF-003, revision 02
Surface: Foxman production build, Campaign entry, Rotten Run Stage 1 reward market, and honest Stage 2 docket
Audience: desktop-browser player and visible Gauntlet lead
Risk: high
Reviewer: sole fresh-context blind critic, read-only
Reviewed: 2026-08-11T12:26:20Z
Decision owner after this receipt: visible Gauntlet lead
Verdict: PASS

## Gate Frame

The gate asks whether the seven-file candidate makes the Stage 1 reward docket
transactional, carries truthful run state into the exact seed-planned Stage 2
docket, preserves the accepted campaign, and stops honestly before Stage 2
selection or combat.

Observable acceptance required:

- Campaign remains the Enter action from the title.
- GAUNTLET-ALPHA reaches the fixed Stage 1 market after real loadout and route
  keys plus actual Stage 1 combat automation.
- Real key 1 buys Dead Letter once and carries HP, loadout, purse, upgrade,
  route history, trace, and the exact Stage 2 pair.
- A contrasting damaged-heal or bank path is truthful.
- Invalid, unaffordable, repeated, and reset behavior preserve run truth.
- Dash, contract, enemy-cycle, encounter, market, build, unit, type, dist, and
  all accepted browser routes remain green.
- The real product is visually readable at 1366x768 and 1920x1080 with one
  canvas, no error/warning logs, no guarded failed resources, and no
  missing-texture green.

The supported decision is promotion or bounded repair. No deployment, commit,
push, control-doc mutation, or production-file edit was performed.

## Blindness And Frozen Scope

No builder receipt, prior critic receipt, or prior leaf evidence was read before
forming the verdict. None was needed afterward.

Repository read-only truth at initial freeze and final recheck:

- HEAD: 99b5a49477572f1bd6e8cbe789ed33431c86a904
- origin/main: 99b5a49477572f1bd6e8cbe789ed33431c86a904
- Branch: main, +0/-0 relative to origin/main
- Candidate scope: exactly seven authorized files; four modified and three
  untracked; no other dirty path
- Tracked binary-diff SHA-256:
  ceae0489076f1532414830db3b8d5cd70ba36b26b79b51a90866618e005e3dd6
- git diff --check: exit 0, no output

| Candidate file | State | Diff / lines | SHA-256 |
| --- | --- | ---: | --- |
| src/game/rotten/state.ts | modified | +15 / -2 | 330f00d3706f80683d9523e3784da7651a902e455c36521019bb09b114e982e3 |
| src/game/rotten/upgrades.ts | modified | +49 / -10 | 6cffbb7546299c093a3962cb1deffabf311aac0fd048f8b683af1567f3cc0d02 |
| src/game/scenes/RottenRunScene.ts | modified | +257 / -29 | 5593d0e3030e73df91ccbe01b4de964d45c2cdb62d7f7b8a0773dfd73c426147 |
| tests/smoke/check-browser-routes.mjs | modified | +631 / -18 | 5b15e0a4fe957d9dfe6aa6698394ff1d9b720bb66a3f582e7d23863238fc5a96 |
| src/game/rotten/build.ts | untracked | 35 lines | be4b3a91fb3f7614360e86320bad7db5f94db203e803544c116540d3ac0abfc1 |
| src/game/rotten/market.ts | untracked | 381 lines | 8880a8a0467452876f9f86abf18ef9c174e2b7a3db52dd1f8256883e2baf0cd5 |
| tests/unit/rotten-run-market.test.ts | untracked | 260 lines | e5a78259af36f82fed05f7fb3a719c62287ee779617010ff96650aed9ac81523 |

The initial and final seven SHA-256 values are identical.

## Fresh Artifact

The artifact was assembled outside the repository by archiving baseline HEAD and
overlaying only the seven frozen candidate files:

    /Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/source

Fresh production output:

    /Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/source/dist

- 13 files
- 3.3 MiB on disk
- Sorted dist-file manifest SHA-256:
  93e8c020e5cd627073c719c72a1589370da4040968b152c961b2e36428ed6209
- Vite transformed 52 modules.
- Main application chunk: 167.74 kB, 39.38 kB gzip.
- Phaser vendor chunk: 1,208.06 kB, 330.08 kB gzip.

## Architecture And Honest Boundary

Architecture passes:

- src/game/rotten/market.ts is browser-independent and owns offer opening,
  eligibility, affordability, one-choice enforcement, payment, heal clamp,
  Hangover Hide immediate HP behavior, carried route history, trace events,
  retry baseline, and Stage 2 transition state.
- src/game/rotten/build.ts summarizes all eight frozen upgrade effects without
  applying unproven Stage 2 combat behavior.
- src/game/rotten/upgrades.ts keeps the eight-item registry, preserves the
  GAUNTLET-ALPHA Stage 1 fixture, excludes owned unique upgrades, and applies
  Graft Dividend only when it was already owned at market-open time.
- RottenRunScene remains the presentation/input orchestrator. Its UI mirrors
  availability, while the pure transaction is authoritative.
- Stage 2 number input is deliberately non-operative because route selection is
  guarded to Stage 1. Direct repeated key 1 after purchase produced an identical
  truth snapshot.
- The Stage 2 canvas says that the run waits here, renders the exact two real
  route cards and carried state, and contains no fake combat, placeholder enemy,
  implementation note, or claim that Stage 2 is playable.

The exact GAUNTLET-ALPHA Stage 2 order is:

    seized-goods-lift|late-fee-chapel

One-off diagnostic branches named rottenKeyRelease and rottenJ are absent.
The smoke transport pairs CDP rawKeyDown with keyUp. This is acceptable here:
focused market latches observed no stale reward-phase keys, every real-key
route passed, and independent in-app Browser keypresses reproduced purchase,
heal, bank, and no-op behavior.

## Exact Deterministic Commands And Results

All npm commands ran from the frozen out-of-repo source directory.

1. Dependency realization:

       npm ci

   Exit 0; 55 packages added. npm reported two high-severity dependency audit
   advisories. This is an install advisory on the frozen dependency graph, not a
   candidate regression; no audit-fix mutation was authorized or attempted.

2. Unit suite:

       npm test

   Exit 0; 4/4 test files and 42/42 tests passed. The new market suite passed
   9/9 tests.

3. Type gate:

       npm run typecheck

   Exit 0.

4. Production build:

       npm run build

   Exit 0; fresh dist generated outside the repository.

5. Dist integrity:

       npm run smoke

   Exit 0; dist/index.html references built assets.

6. Focused dash:

       FOXMAN_SMOKE_ONLY=dash FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

   Exit 0 on the first run. The coherent wait-resolve snapshot proved playerX
   273, peak absolute velocity 620, dash count 1, trail count 3, cue count 1,
   and one canvas. These satisfy playerX >=260 and peak >=500.

7. Focused Rotten contract:

       FOXMAN_SMOKE_ONLY=rottenContract FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

   Exit 0 on the first run; title R entry, RR seed, GAUNTLET-ALPHA plan
   RR1-1C93B57F, Stage 1 pair, and real route key all passed.

8. Focused enemy cycle:

       FOXMAN_SMOKE_ONLY=rottenEnemyCycle FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

   Exit 0 on the first run. Bailiff, clerk, and writ-runner each traversed
   windup, active, and recovery. Maximum body bottom was 580. Reacquisition
   count was 2, last reacquisition was 550 ms, and the reacquired runner was hit
   on the first attack.

9. One focused encounter:

       FOXMAN_SMOKE_ONLY=rottenEncounter FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

   Exit 0 on the first run. The two-frame retry snapshot showed Stage 1,
   loadout, graft 3, empty upgrades/history/market/offers/HP, and zero combat
   objects. The latched tell was bailiff:windup:SWING!. Tax Pike/Seized Stamp
   reached reward with 6 attacks/6 hits and 2 skill uses/2 hits; the contrasting
   Receipt Spitter/Bribe Bomb path reached reward with real hits.

   The prior ten-run series was intentionally not repeated. This revision gate
   ran exactly one focused encounter command, as requested.

10. Focused market:

        FOXMAN_SMOKE_ONLY=rottenMarket FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

    Exit 0 on the first run. Purchase, damaged heal, bank, unaffordable, invalid,
    repeated-input, two-frame market arming, trace, cleanup, and one-canvas
    assertions passed.

11. Exactly one unfiltered full browser matrix:

        FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/automated npm run smoke:browser

    Exit 0 on the first and only unfiltered run: 27/27 top-level results. This is
    all 23 accepted campaign routes plus four Rotten results: same-seed retry,
    contract, encounter, and market. The full-matrix dash coherent snapshot was
    playerX 264, peak 620, count 1, trail 3, cue 1.

Focused result JSON:

- automated/browser-smoke-dash-results.json
- automated/browser-smoke-rottenContract-results.json
- automated/browser-smoke-rottenEnemyCycle-results.json
- automated/browser-smoke-rottenEncounter-results.json
- automated/browser-smoke-rottenMarket-results.json
- automated/browser-smoke-results.json

Every JSON packet has ok: true.

## Direct In-App Browser Reality

Browser: Codex In-app Browser
Artifact URL during review: http://127.0.0.1:4193/
State packet:

    /Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-003-recritic2/IAB_BROWSER_EVIDENCE.json

### 1366x768

- Title rendered at innerWidth 1366 / innerHeight 768 with one canvas.
- Real Enter opened Campaign RunScene with Foxman alive and Rusty Knife.
- Real keys 3, 6, Enter, 2 opened the GAUNTLET-ALPHA reward after Stage 1
  automation.
- Open market truth: 7 graft, HP 6/6, offers
  dead-letter|petty-grudge|spite-reserve, prices 7|5|5, open status, pending
  Bailiffs' Ramp history, zero combat objects, one canvas.
- Real key 1 bought Dead Letter. Stage became 2; graft became 0; HP remained
  6/6; Tax Pike and Seized Stamp remained carried; market resolved exactly
  once; trace event was
  market:1:bailiffs-ramp:upgrade:dead-letter:spent-7; route history was
  1:bailiffs-ramp:upgrade:dead-letter.
- Real repeated key 1 was byte-equivalent across the selected truth fields.
- Reload returned a clean Stage 1 loadout: graft 3, empty HP, upgrade, history,
  market, choice, loadout, and zero combat objects.

### 1920x1080

- Browser state proved innerWidth 1920 / innerHeight 1080 and a 1920x1080 canvas.
- Real Enter again opened Campaign with Foxman alive and Rusty Knife.
- Damaged market path reached HP 5/6 with heal available. Real key 4 restored
  HP to 6/6, spent exactly 2 graft, recorded heal:1, and opened the same exact
  Stage 2 pair.
- Separate Receipt Spitter/Bribe Bomb path reached the market. Real key 5
  preserved graft 7 and HP 6/6, recorded bank and spent-0, and opened the same
  exact Stage 2 pair.

### Visual, Canvas, Error, And Resource Judgment

- Reward cards, prices, availability, seed/plan, carried build, route history,
  feedback, route summaries, elite risk, reward, and market bias are legible at
  both target viewports.
- The two Stage 2 cards are visually distinct and presentation-coherent with
  Foxman's filthy municipal-fantasy style.
- Campaign entry remains visually coherent and unchanged in function.
- No clipping, obscured critical text, duplicate canvas, stale combat object,
  obvious layout collision, or missing-texture green was observed.
- Every inspected state had exactly one canvas.
- Error/warning log count was 0.
- Failed DOM-image count was 0.
- Page asset inventory observed 12 production resources: 2 scripts, 1
  stylesheet, and 9 images.
- The in-app Browser screenshot service encoded the 1920x1080 viewport captures
  at 1873x1080 because of its approximately two-megapixel output cap. The
  browser and canvas measurements in IAB_BROWSER_EVIDENCE.json prove the actual
  1920x1080 review viewport.

Direct screenshots:

| Evidence | SHA-256 | Encoded pixels |
| --- | --- | ---: |
| iab-title-1366x768.png | a78494ef4eca9d16b7f2644a226a7691e010f0c780ffc8920d1a07d21696351a | 1366x768 |
| iab-campaign-enter-1366x768.png | 180b830d1e36ada86934bb7b482696df24563e65fe8cdfdbba7a737f1a784b95 | 1366x768 |
| iab-reward-open-1366x768.png | c76b90fed1485bbf21fac5100c3625bd8cec42c44d2bfa38be22f4da8b84be48 | 1366x768 |
| iab-stage2-purchase-1366x768.png | 63cca489ee59a4731f11992995294209a55678cd80db2b943082a4f9f87b1ab8 | 1366x768 |
| iab-campaign-enter-1920x1080.png | a9349121641539082c46304f39f5a1a2598c44db757b2c219a66e925eee6eb90 | 1873x1080 |
| iab-heal-open-1920x1080.png | 330e778b1d44d3dbfdc6206bf36456ab19539ab9bf59cee8cc1a786f779e93eb | 1873x1080 |
| iab-stage2-heal-1920x1080.png | 2d87cb0f582f3bbe3ba744fcfe427594c72628c3b7aa53e6bdadc5bdc2f0eb60 | 1873x1080 |
| iab-stage2-bank-1920x1080.png | e1ac003be1595f6c64a095d71ccef7f97558ce36161b9f594f66609900940162 | 1873x1080 |

## Preserved First Failures And Advisories

No deterministic product, unit, build, focused browser, or full-matrix failure
occurred, so no deterministic command was retried.

Preserved non-product events:

1. The first preview start at port 4173 exited 1 because another Node process
   already owned that port. A read-only lsof check showed 4193 free; the one
   allowed transient retry started the same frozen dist on 4193.
2. The in-app Browser backend rejected waitForLoadState(networkidle) as an
   unsupported helper despite documenting the state. The same tab was retained
   and product readiness was checked through explicit body datasets and bounded
   waits.
3. Two initial read-only inspection expressions failed before state collection:
   one malformed wrapper and one unavailable performance timing object in the
   restricted page scope. They caused no input or product-state change. The
   corrected probes, page-asset inventory, screenshots, and accumulated logs
   supplied the required evidence.
4. npm ci reported two high-severity audit advisories on the frozen dependency
   graph. No package change was authorized; this leaf neither introduces nor
   resolves them.

## Verification Ladder

| Layer | Status | Evidence | Finding |
| --- | --- | --- | --- |
| Truth and scope | pass | baseline/hash freeze above | Exact required baseline and seven authorized files only; unchanged after review. |
| Deterministic | pass | 42/42 tests, typecheck, build, dist, focused JSON | Pure market/build rules and artifact integrity are green. |
| Behavioral | pass | focused JSON plus IAB_BROWSER_EVIDENCE.json | Purchase, heal, bank, rejection, no-op, reset, encounter, dash, and carried state behave truthfully. |
| Product reality | pass | eight direct screenshots | Reward and Stage 2 docket are readable, coherent, and visually clean at both target viewports. |
| Consequential boundary | pass | source review and direct Stage 2 no-op | Local-only; Stage 2 selection/combat remains honestly absent; no external action occurred. |
| Human acceptance | pending | Marcus | This fresh blind critic gate passes; final accountable human acceptance remains a separate project-level decision. |

## Decision

The candidate has no serious acceptance, architecture, regression, interaction,
visual, resource, error, canvas, or honesty gap. LEAF-003 revision 02 is suitable
for lead promotion. The intentionally non-operative Stage 2 route cards are the
correct boundary for this leaf; their selection and combat remain LEAF-004 work.

Browser viewport override was reset, the audit tab was finalized to the original
empty tab state, the preview server was stopped, and the repository remained
untouched.

PASS
