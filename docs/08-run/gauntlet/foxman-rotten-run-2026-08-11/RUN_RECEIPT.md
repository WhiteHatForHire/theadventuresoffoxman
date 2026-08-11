# Foxman Rotten Run Gauntlet Receipt

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`
Goal: Finish the bounded Foxman Rotten Run side-scrolling roguelite vertical slice through the Gauntlet Loop
Authority: [`MASTER_DIRECTIVE.md`](MASTER_DIRECTIVE.md) and Gauntlet Loop Protocol v0.1
Checkpoint: `1 - launch baseline accepted`
Updated: `2026-08-11T04:09:00Z`

## Baseline

| Repository | Branch | Head | Preserved changes | Evidence |
| --- | --- | --- | --- | --- |
| `WhiteHatForHire/theadventuresoffoxman` | `main` | `779f93571b22f4b7606328d82626719220e31ac9` | None; worktree clean | `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/main` |

- Prepared baseline commit and `origin/main` matched exactly.
- The authored campaign, its pending human verdict, and its accepted smoke matrix remain preserved regression truth.
- No runtime server or descendant was open at launch.

## Decisions

- `RR-DEC-001`: Rotten Run is a separate mode; campaign scenes and accepted routes cannot be deleted or silently repurposed.
- `RR-DEC-002`: All run variability must be seed-addressable and deterministically inspectable.
- `RR-DEC-003`: One descendant maximum; builders write bounded leaves, critics are fresh-context and read-only, and only the lead promotes.
- `RR-DEC-004`: Local builds and repository pushes are authorized; public deployment and other consequential external actions remain human-gated.

## Verified Complete

- Exact platform goal created with the `1250000000` token ceiling before implementation.
- Repository rules, product initiatives, accepted campaign receipt, directive, state, manifest, ADR, and canonical protocol read.
- Prepared baseline verified clean at `779f935`; local and remote-tracking heads matched.
- `npm run smoke:all` passed: TypeScript, Vite production build, dist asset references, and all 23 real-Chrome campaign routes.
- Generated browser result at `docs/08-run/evidence/browser-smoke-results.json` reports `ok: true` with 23 results.

## Checks And Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-001` | root | lead | Create exact goal and ceiling | Pass | `<1m` | platform telemetry starts at 0 | platform goal state |
| `RR-STEP-002` | `RR-STEP-001` | lead | Read authority, protocol, rules, skills, and prior receipt | Pass | `~2m` | included below | cited canonical files |
| `RR-STEP-003` | `RR-STEP-002` | lead | Reconcile Git baseline | Pass | `<1m` | included below | clean `main`; HEAD = origin/main = `779f935` |
| `RR-STEP-004` | `RR-STEP-003` | lead | Run accepted campaign matrix | Pass | `~76s` | included below | `npm run smoke:all`; 23 browser results |
| `RR-STEP-005` | `RR-STEP-004` | lead | Record launch controls and recovery state | Pass | checkpoint | `76883 / 1250000000` exact visible-lead tokens | this receipt and `RUN_STATE.json` |

## Token And Runtime Ledger

| UTC | Phase | Exact known project tokens | Coverage | Decision |
| --- | --- | ---: | --- | --- |
| `2026-08-11T04:09:00Z` | Launch baseline | `76883` | Visible lead platform telemetry; no descendant launched | Continue; far below first `25M` trajectory audit |

## External Actions

- No public deployment, purchase, send, credential change, destructive operation, or campaign deletion occurred.
- Browser smoke used only a managed local server and Chrome process; the command exited successfully.

## Pending / Blocked / Superseded

- Pending: architecture audit and deterministic seeded-run contract.
- Pending human-only: Marcus's earlier campaign feel verdict; it does not block this separately authorized mode.
- Blocked: none.
- Superseded: prepared launch state; the run is now active.

## Open Runtime State

- No descendant is active.
- No managed development server is intentionally left open.

## Next Safe Action

`Audit current scenes, systems, smoke hooks, and local persistence; then freeze the smallest deterministic Rotten Run state contract and LEAF-001 brief.`

Prerequisites: campaign smoke remains green and no unfamiliar worktree changes appear.

---

Future checkpoints append below this line; prior entries are not rewritten.

## Checkpoint 2 - Seeded Contract Frozen

Updated: `2026-08-11T04:16:09Z`

### Verified Complete

- Audited entry, scene, actor, movement, combat-stat, persistence, UI, and browser-harness ownership from accepted commit `6d5b091`.
- Found reusable lower-level systems but campaign-specific flow duplicated across large scenes; chose an additive pure core and separate scene instead of a campaign refactor.
- Froze the exact three-stage topology, seed rules, content budget, economy, state trace, records, settings, and three-build proof in `SEEDED_RUN_CONTRACT.md`.
- Framed `LEAF-001` with explicit authority, forbidden surfaces, real-browser acceptance, checks, and stop conditions.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-006` | `RR-STEP-005` | lead | Promote and push launch controls | Pass | `<2m` | included below | commit `6d5b091`, `origin/main` matched |
| `RR-STEP-007` | `RR-STEP-006` | lead | Audit implementation seams | Pass | `~5m` | included below | source and browser-harness inspection |
| `RR-STEP-008` | `RR-STEP-007` | lead | Freeze seeded product contract and leaf brief | Pass | checkpoint | `178739 / 1250000000` exact visible-lead tokens | `SEEDED_RUN_CONTRACT.md`, `LEAF-001.md`, decisions `RR-DEC-006..008` |

### Token Decision

Continue. Exact visible-lead usage is `178739`, far below the first `25000000` autonomous trajectory audit. No descendant usage exists yet.

### Next Safe Action

`Commit and push the frozen contract, verify a clean accepted head, then launch exactly one LEAF-001 builder with bounded context and no commit/push authority.`

Prerequisites: staged diff passes JSON and whitespace validation; campaign implementation remains untouched.

## Checkpoint 3 - LEAF-001 Promoted

Updated: `2026-08-11T04:47:15Z`

### Builder And Critic Verdicts

- Builder: passed all scoped checks; no control-file, campaign-scene, package, commit, or push authority used.
- Lead deterministic review: scoped diff, `npm test` 27/27, `npm run typecheck`, evidence JSON integrity, and visual capture inspection passed.
- Fresh blind critic: `pass`; largest gap `none` after live browser use at 1366×768 and 1920×1080.
- Real keys verified: Enter -> Campaign, R -> Rotten Run, 1 -> `unfiled-alley`, 2 -> `bailiffs-ramp`.
- Fixed seed verified: `GAUNTLET-ALPHA` -> `RR1-1C93B57F`.
- Full browser result: 24/24 routes, including all 23 accepted campaign routes; zero guarded console/network errors.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-009` | `RR-STEP-008` | builder | Implement pure deterministic plan and separate shell | Pass | bounded turn | per-descendant exact unavailable | scoped source/tests |
| `RR-STEP-010` | `RR-STEP-009` | lead | Run cheap checks and inspect captures/diff | Pass | `~3m` | platform total below | unit/type checks and candidate diff |
| `RR-STEP-011` | `RR-STEP-010` | blind critic | Operate both desktop viewports and full regression | Pass | `~10m` | per-descendant exact unavailable | `evidence/leaf-001/critic-receipt.md` |
| `RR-STEP-012` | `RR-STEP-011` | lead | Promote implementation and push | Pass | `<2m` | `281467 / 1250000000` platform goal telemetry | commit `fa94e97`, origin push |

### Token Decision

Continue. Platform goal telemetry reports `281467` tokens, far below the first `25000000` autonomous trajectory audit. Per-descendant token breakdown is not exposed.

### External Actions

- Pushed accepted commit `fa94e97` to `origin/main`.
- No public deployment, domain, paid service, credential change, destructive history action, or campaign deletion occurred.

### Next Safe Action

`Promote the control-state checkpoint, then launch LEAF-002 for the bounded loadout and real Stage 1 two-wave combat loop.`

Prerequisites: clean `main` and `origin/main`, one active descendant maximum, campaign matrix preserved.

## Checkpoint 4 - Crash Recovery At LEAF-002 Final Blind Gate

Updated: `2026-08-11T08:29:50Z`

### Recovered Repository Truth

- Codex was force-quit around `2026-08-11T08:21:00Z`; the durable state still described the pre-builder LEAF-002 gate and was stale.
- `main`, `HEAD`, and `origin/main` all resolve to accepted control head `206a0879acb0d737b6052940f99b2fd599542fbb`; LEAF-001 remains promoted and is not being repeated.
- Exactly one Foxman worktree exists. No Foxman-owned preview, browser harness, or descendant process survived recovery. PID `62255` was inspected and deliberately left alone because its cwd is an unrelated Carpet Front worktree.
- The only Foxman dirt is the preserved LEAF-002 candidate: three tracked Rotten/smoke modifications and seven untracked Rotten/unit additions. `git diff --check` passes; no campaign scene, control directive, asset, or package surface is part of that candidate.
- Candidate and review artifacts remain intact under `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-*`; none was deleted, overwritten, or relabeled as accepted.

### LEAF-002 Review Ledger

| Review | Context and artifact | Verdict | Largest gap | Disposition |
| --- | --- | --- | --- | --- |
| Initial blind critic | Fresh production artifact; real in-app Browser at 1366×768 and 1920×1080 | `REVISE` | Bailiff, clerk, and writ-runner frames could sink below the visible combat floor | Preserved; builder centralized frame/body anchoring and added role-state floor assertions. |
| Fresh blind re-critic | New production artifact; real in-app Browser at both viewports | `REVISE` | A damaged living writ-runner could remain offscreen and weapon-unhittable indefinitely | Preserved; builder added bounded inward reacquisition, offscreen attack/tell suppression, floor invariants, and a two-edge post-return hit regression. |
| Interrupted final re-critic | Fresh external artifact and focused automated enemy-cycle run | No verdict | In-app Browser and Chrome connectors both returned `Transport closed` before manual interaction; a later focused encounter harness hung; Codex was then force-quit | Preserve as support only. It cannot satisfy the required real-browser blind gate. |

### Post-Repair Candidate Evidence

- Builder final checks: TypeScript, production build, dist smoke, `33/33` unit tests, focused contract, focused encounter, focused enemy-cycle/reacquisition, `git diff --check`, and the full `26/26` browser matrix all passed.
- Final builder encounter evidence records death/retry cleanup `30 -> 0` combat objects; every role traversing approach/windup/active/recovery with maximum body bottom `580`; two writ-runner edge reacquisitions in `218 ms` and `568 ms`; and a same-weapon post-return Receipt Spitter hit `0/0 -> 1/1`.
- The same evidence reaches the reward boundary with Tax Pike/Seized Stamp (`6/6` weapon hits, `2` skill hits) and Receipt Spitter/Bribe Bomb (`1/1` weapon hit, `2` uses and `4` skill hits), with reward cleanup at zero.
- The interrupted fresh critic independently reproduced the focused enemy-cycle pass from a newly built artifact: body bottom `580`, two-edge reacquisition in `217 ms` and `549 ms`, and post-return Spitter hit `0 -> 1`.
- Evidence integrity at recovery: full matrix SHA-256 `c2fc831a1925780c7905950f2523cc5972ce0033a1b855ba56413d4032c5bff7`; final encounter `b7e8bc18cd6c97d542566bb6477cbb28b7bbe071d1261d13a09fdacdd2e96e0b`; interrupted-critic enemy cycle `acd2d4052241e9c89e068a206677dcc6ec403f9a8f4bf108cbf24193e0f4ef6a`.

### Recovery Decision And Boundary

`resume`

The implementation does not need another builder pass on present evidence, but it is not accepted. Resume only the unfinished final blind acceptance gate with one fresh-context critic and a new evidence directory. The critic must operate a fresh production browser artifact, manually exercise the repaired real-key paths, preserve the accepted campaign matrix, and issue `PASS` or `REVISE`. Do not promote on automated evidence alone.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-013` | `RR-STEP-012` | builder + two blind critics | Build Stage 1 combat; repair grounded frame anchoring; repair offscreen reacquisition | Candidate green, final verdict pending | bounded turns | descendant exact unavailable | preserved `work/leaf-002-*` artifacts and receipts |
| `RR-STEP-014` | `RR-STEP-013` | interrupted blind critic | Build fresh artifact and replay focused enemy-cycle proof | Automated support passed; no manual verdict | interrupted | descendant exact unavailable | `work/leaf-002-recritic2/captures/` |
| `RR-STEP-015` | `RR-STEP-014` | lead | Reconcile Git, worktrees, processes, evidence, reviews, and platform goal after force-quit | Pass | `~9m` | `781748 / 1250000000` platform goal telemetry | this checkpoint and `RECOVERY_AUDIT.md` |

### Token Decision

Continue. Platform telemetry reports `781748` tokens, far below the first autonomous trajectory audit at `25000000`; no trajectory audit is due.

### Next Safe Action

`Commit and push only the recovery-control files, then launch exactly one fresh-context LEAF-002 blind critic using a new leaf-002-recritic3 evidence directory.`

Prerequisites: stage only canonical recovery files; leave the candidate byte-for-byte intact; verify no other descendant exists.

## Checkpoint 5 - LEAF-002 Promoted And LEAF-003 Frozen

Updated: `2026-08-11T09:16:10Z`

### Final LEAF-002 Verdict

- A replacement fresh-context critic built a new external production artifact from the recovered candidate and operated it through the real in-app Browser at 1366×768 and 1920×1080.
- Verdict: `PASS`. Campaign Enter, deterministic loadout/routes, grounded and reacquiring enemies, melee and ranged clears, delayed Bribe Bomb damage, Receipt Spitter heat/recovery, death, clean same-seed R retry, two-wave reward, zero stale combat objects, and one canvas were directly observed.
- The critic's first full browser regression passed `26/26` routes. Typecheck, production build/dist, and `33/33` unit tests passed.
- Largest residual gap: focused encounter observation produced two different transient failures before a pass. Manual retry and the first full matrix did not reproduce gameplay-state persistence; LEAF-003 must stabilize two-frame reset truth and tell latching, then run ten focused repeats without changing product timing absent a stable reproduction.
- Project-local evidence is preserved at `evidence/leaf-002/`, including the verbatim critic receipt, focused/full JSON, and representative direct-browser frames.

### Lead Promotion

- Independently inspected the receipt, raw route counts, candidate hashes, grounded/tell/Bomb/heat/reward/reacquisition frames, stopped critic runtime, and clean critic scope.
- Re-ran `npm test -- --run` (`33/33`), `npm run typecheck`, `npm run build`, `npm run smoke`, and `git diff --check`; all passed.
- Staged only authorized Rotten source, scene, unit/browser tests, and compact critic evidence.
- Committed and pushed accepted product baseline `0c29d6aa51658e774924efe3714788a9371d76d0`; local `main` and `origin/main` match and the worktree is clean.

### LEAF-003 Product Boundary

- `RR-DEC-011`: one pure deterministic reward transaction; keys 1-3 offer, 4 heal, 5 bank.
- `RR-DEC-012`: the leaf ends honestly at the real Stage 2 route docket, with no fake Stage 2 combat or new enemies.
- `RR-DEC-013`: stabilize harness observation rather than tuning unreproduced gameplay.
- The task contract is frozen in `LEAF-003.md`; shared Player/combat/enemy/campaign files, Stage 2 combat, elites, boss, records, settings, assets, and packages are explicit non-goals.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-016` | `RR-STEP-015` | fresh blind critic | Build and manually review post-repair LEAF-002 at both viewports | `PASS` | bounded turn | descendant exact unavailable | `evidence/leaf-002/critic-receipt.md` |
| `RR-STEP-017` | `RR-STEP-016` | lead | Verify raw evidence, rerun cheap checks, promote and push LEAF-002 | Pass | `~8m` | included below | commit `0c29d6a`, origin matched |
| `RR-STEP-018` | `RR-STEP-017` | lead | Run shipping update and freeze reward/Stage 2 boundary | Pass | checkpoint | `961573 / 1250000000` platform goal telemetry | ops docs, decisions `RR-DEC-011..013`, `LEAF-003.md` |

### Token Decision

Continue. Platform goal telemetry reports `961573` tokens, far below the first autonomous trajectory audit at `25000000`; no trajectory audit is due.

### External Actions

- Pushed accepted product commit `0c29d6a` to `origin/main`.
- No public deployment, domain, paid service, credential change, destructive history action, or campaign deletion occurred.

### Next Safe Action

`Commit and push this promotion/control checkpoint, verify clean main, then launch exactly one bounded LEAF-003 builder from the accepted head.`

Prerequisites: staged control/ops diff passes JSON and whitespace checks; builder receives no commit, push, ops, or Gauntlet-control authority.

## Checkpoint 6 - LEAF-003 Promoted; Three-Leaf Integration Review Required

Updated: `2026-08-11T12:32:36Z`

### Accepted Product Truth

- Stage 1 now ends in one pure deterministic reward transaction: keys `1-3` buy a displayed upgrade, `4` buys the bounded heal, and `5` banks. Invalid, unaffordable, disabled, and repeated choices do not mutate durable run truth.
- HP, graft, loadout, owned upgrades, route history, market choice, build summary, and trace carry into the seed-planned Stage 2 docket. `GAUNTLET-ALPHA` resolves to `seized-goods-lift|late-fee-chapel` in order.
- The Stage 2 docket is an honest stopping boundary: it renders the real route summaries and carried build but accepts no Stage 2 selection and creates no fake encounter, elite, enemy, or completion claim.
- The browser-independent market owns prices, eligibility, affordability, payment, heal clamp, Hangover Hide immediate HP, Graft Dividend later-market discount, one-choice enforcement, retry baseline, trace, and Stage 2 transition. Phaser remains the input/presentation orchestrator.
- The accepted campaign remains reachable through Enter and all 23 campaign routes remain regression truth.

### Builder And Stability Evidence

- Test-first implementation added pure market/build modules, nine focused market tests, scene wiring, truthful debug state, and the Stage 2 docket within exactly seven authorized files.
- Unit/type/build/dist gates passed: `42/42` tests, clean TypeScript, 52-module production build, and built-asset smoke.
- Focused encounter stability passed `10/10` consecutively with no retries after two-frame reset/tell latching and a frame-held real `J` proof. Every pass preserved clean retry truth, role cycles, two-edge reacquisition, both accepted loadout clears, deterministic offers, and zero stale combat objects.
- Builder's first full browser matrix passed `27/27` before blind review.

### Blind Review And Revision Ledger

| Review | Verdict | Preserved largest gap | Bounded disposition |
| --- | --- | --- | --- |
| Initial fresh blind critic | `REVISE` | Product market passed directly, but the accepted campaign dash smoke sampled velocity too late (`30` despite independent peak `620`), and an unrequested key-release diagnostic could die during its live-combat wait | Removed both one-off diagnostic branches and latched the real dash peak without changing product timing or the `>=500` bar. |
| Fresh revision-01 recritic | `REVISE` | Product market again passed directly; the dash wait could resolve at player X `254` before immediately asserting X `>=260` | Added X `>=260` to the same coherent wait predicate; no sleep, threshold reduction, or product edit. |
| Final fresh revision-02 critic | `PASS` | None | Promoted after exact candidate/hash verification. |

- The final critic built a frozen external artifact, passed `42/42` units, typecheck, build, dist, focused dash/contract/enemy-cycle/encounter/market, and its first and only full matrix `27/27`.
- Final dash evidence resolved coherently at X `264`, peak `620`, dash count `1`, trail count `3`, cue count `1`.
- Direct in-app Browser play at 1366x768 and 1920x1080 proved Campaign Enter, open deterministic reward, Dead Letter purchase (`7 -> 0` graft), repeated-input no-op, reload reset, honest damage/heal (`5/6 -> 6/6` for 2 graft), bank (`7 -> 7`), exact Stage 2 carry, one canvas, 12 observed resources, and zero warning/error logs or visual-green artifacts.
- Two earlier critic turns stalled only during receipt/connector cleanup after delivering their `REVISE` verdicts. The lead preserved all evidence, stopped exact critic servers, and wrote explicit external recovery receipts before each repair; neither red was overwritten or retried to green.

### Lead Promotion

- Re-read the final receipt, verified the frozen candidate diff SHA-256 `ceae0489076f1532414830db3b8d5cd70ba36b26b79b51a90866618e005e3dd6`, confirmed the final full result SHA-256 `3145eb2ad4a468df9d2c7d8211c7bae7adc75d0693891b9771eff467d0bab2b4`, and imported compact project-local evidence under `evidence/leaf-003/`.
- Re-ran `npm test` (`42/42`), `npm run typecheck`, `npm run build`, `npm run smoke`, JSON result validation, receipt terminator validation, and `git diff --check`; all passed.
- Staged only the seven authorized candidate files and LEAF-003 evidence.
- Committed and pushed accepted product baseline `23e309e6dce71f039c4eab2508816a584bd53354`; local `main` and `origin/main` matched at push.

### Integration Boundary

- `LEAF-001`, `LEAF-002`, and `LEAF-003` are now promoted.
- Gauntlet Loop protocol requires an integration review after every three promoted leaves or gate boundary.
- `RR-DEC-014` freezes the next action as one fresh read-only integration review of the accepted connected flow. `LEAF-004` Stage 2 combat cannot start until that review passes.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-019` | `RR-STEP-018` | builder | Implement deterministic market, carried build, Stage 2 docket, and stabilized evidence | Pass | bounded turn | descendant exact unavailable | source/tests plus builder external receipt |
| `RR-STEP-020` | `RR-STEP-019` | fresh blind critic | Review real artifact and required matrix | `REVISE` | bounded turn | descendant exact unavailable | preserved external critic recovery receipt |
| `RR-STEP-021` | `RR-STEP-020` | builder | Repair dash peak observation and remove broken diagnostics | Pass | bounded turn | descendant exact unavailable | revision-01 receipt and first-attempt matrix |
| `RR-STEP-022` | `RR-STEP-021` | fresh blind recritic | Review revision 01 | `REVISE` | bounded turn | descendant exact unavailable | preserved external recritic recovery receipt |
| `RR-STEP-023` | `RR-STEP-022` | builder | Make dash displacement and peak wait coherent | Pass | bounded turn | descendant exact unavailable | revision-02 receipt and first-attempt matrix |
| `RR-STEP-024` | `RR-STEP-023` | final fresh blind critic | Review frozen revision-02 artifact at both viewports | `PASS` | bounded turn | descendant exact unavailable | `evidence/leaf-003/critic-receipt.md` |
| `RR-STEP-025` | `RR-STEP-024` | lead | Verify, import evidence, commit, and push LEAF-003 | Pass | `~6m` | included below | commit `23e309e`, origin matched |
| `RR-STEP-026` | `RR-STEP-025` | lead | Run Shipping Update and freeze integration gate | Pass | checkpoint | `1507324 / 1250000000` platform goal telemetry | state, ops, and `RR-DEC-014` |

### Token Decision

Continue. Platform goal telemetry reports `1507324` tokens, far below the first autonomous trajectory audit at `25000000`; no trajectory audit is due.

### External Actions

- Pushed accepted product commit `23e309e` to `origin/main`.
- No public deployment, domain, paid service, credential change, destructive history action, or campaign deletion occurred.

### Next Safe Action

`Commit and push this promotion/control checkpoint, verify clean main, then launch exactly one fresh read-only integration reviewer on the accepted 23e309e product baseline.`

Prerequisites: JSON and whitespace checks pass; `main` equals `origin/main`; no builder or product edit starts before the integration verdict.

## Checkpoint 7 - INTEGRATION-001 Revises Smoke-Automation Isolation

Updated: `2026-08-11T13:10:42Z`

### Independent Review Result

- A fresh read-only reviewer exported the accepted product outside the repository and froze control HEAD `a4a3451`, product commit `23e309e`, and byte-identical dist aggregate SHA-256 `2b31a5926bb0c81ee481d702ebd44d63bfc796bfb16516da7a454d9f8dec24f0`.
- First-attempt deterministic gates passed: `42/42` unit tests, typecheck, 52-module production build, dist smoke, focused dash/contract/enemy-cycle/encounter/market, and exactly one unfiltered `27/27` browser matrix.
- Direct in-app Browser play at both target viewports passed Campaign Enter/actions, Rotten loadout and route choice, Stage 1 tells/combat, death and clean same-seed retry, reward open, purchase, bank, invalid/repeated no-op, exact Stage 2 carry, one canvas, and zero stale combat objects.
- The reviewer did not consult prior leaf receipts or builder rationale before freezing its verdict.

### Preserved Blocking Finding

- Verdict: `REVISE` for `SMOKE-AUTO-ISOLATION`.
- On `?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter` with `smokeAuto` absent, the reviewer pressed only `3`, `6`, `Enter`, and `2`, then sent no combat input. The artifact self-fired one weapon attack and one skill use, both with hits.
- Source inspection confirms `RottenRunScene` reads `smokeParam()` unconditionally and arms all Rotten compatibility/encounter/market/heal/poor/reacquisition fixtures, while campaign scenes correctly gate the parameter with `smokeAutoEnabled()`.
- Independent findings SHA-256: `888c1c4756895c43f03fa7a5501e8737cb487d9e47b83e4453de7fe773b03a95`; failure screenshot SHA-256: `5ef5db16c5820355784afb852b61d017ac3674efc0486f4213e40e10d87b38bc`.
- Evidence is imported under `evidence/integration-001/revise-01/`.

### Reviewer Recovery

- After freezing all findings, the reviewer stopped making observable progress during receipt formatting. Two explicit closeout requests produced no response.
- The lead interrupted only that stalled reviewer, verified its preview was stopped and the repository untouched, and reconstructed the required receipt from `INDEPENDENT_FINDINGS.json` plus hashed raw artifacts.
- The interrupted reviewer is not being relabeled as a PASS. Its exact verdict remains `REVISE`.

### Ranked Repair And Boundary

- `RR-DEC-015` requires every Rotten smoke fixture to use the explicit `smokeAutoEnabled()` permission gate.
- Add one negative real-browser proof that a known `smoke=` route without `smokeAuto=1` stays manual, while all authorized `smokeAuto=1` routes remain green.
- Limit the builder to `RottenRunScene.ts`, additive browser coverage, and external evidence. No combat, timing, content, campaign, package, asset, or control-file change is authorized.
- Run one fresh integration re-review after the repair. `LEAF-004` remains blocked until PASS.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-027` | `RR-STEP-026` | fresh integration reviewer | Independently build, test, operate, and inspect promoted LEAF-001..003 | `REVISE` | bounded turn | descendant exact unavailable | `evidence/integration-001/revise-01/` |
| `RR-STEP-028` | `RR-STEP-027` | lead recovery | Preserve frozen review after receipt-formatting stall; stop only reviewer | Pass | `~10m` | included below | reconstructed critic receipt plus source/process audit |
| `RR-STEP-029` | `RR-STEP-028` | lead | Rank one repair and freeze its builder contract | Pass | checkpoint | `1588289 / 1250000000` platform telemetry | `RR-DEC-015`, `INTEGRATION-001-REVISION-001.md` |

### Token Decision

Continue. Platform goal telemetry reports `1588289` tokens, far below the first autonomous trajectory audit at `25000000`; no trajectory audit is due.

### Next Safe Action

`Commit and push this REVISE/control checkpoint, verify clean main, then launch exactly one bounded smoke-isolation repair builder. Do not start Stage 2 combat.`

Prerequisites: validate JSON, receipt terminator, evidence hashes, and whitespace; builder receives no commit, push, ops, or control-file authority.

## Checkpoint 8 - INTEGRATION-001 Passed; LEAF-004 Frozen

Updated: `2026-08-11T14:11:03Z`

### Repair And Fresh Re-review

- The bounded repair changed exactly `RottenRunScene.ts` and the browser harness. A new negative route first reproduced the accepted defect with six weapon attacks and two skill uses despite no combat keys, then passed after one existing `smokeAutoEnabled()` gate made the effective Rotten smoke scenario null without explicit opt-in.
- Builder validation passed `42/42` units, typecheck, build, dist smoke, every authorized focused route, and one `28/28` matrix.
- A fresh read-only recritic froze the exact two-file diff SHA-256 `7c518775453f51387f6748d512438acaf1d102c5c8a9b47930c1baa2d51f08e2` before seeing builder evidence and built a separate production artifact.
- Direct 1366x768 play without `smokeAuto` used only real `3`, `6`, `Enter`, `2`, observed `5121 ms`, issued zero attacks/skills, and ended only through legitimate enemy damage. The contrasting authorized URL self-operated to reward. Campaign Enter, normal Rotten loadout, and exact Stage 2 carry passed at the two target viewports.
- All five focused gates passed first attempt; the sole unfiltered matrix passed `28/28`; no serious integration gap remained. Critic receipt SHA-256: `e6bf777d294c1431f56b6b3de74c9038defa76321fd770a2ab8fd48440bbb2e9`.

### Lead Promotion

- Re-read the independent receipt and raw browser evidence, verified scope/hashes/cleanup, and re-ran `42/42` units, typecheck, production build, dist smoke, whitespace, and the focused isolation route (`0/0` over `4589 ms`).
- Imported compact builder, expected-red, critic, full/focused, and direct-browser evidence under `evidence/integration-001/pass-01/`.
- Committed and pushed accepted repair baseline `7cef4b039c401890ac24fb1a8a27800aa6bb18f7`; local `main` and `origin/main` matched and the worktree was clean.

### LEAF-004 Boundary

- `RR-DEC-016` requires a complete Stage 2 loop ending at an honest Stage 3 docket.
- `RR-DEC-017` makes all eight carried upgrade effects real through one reusable combat-build configuration.
- `RR-DEC-018` prohibits cloning Stage 1 orchestration into the 1057-line scene; pure stage/market ownership and Phaser presentation helpers must be generalized.
- Stage 3 combat, third reward, boss, results/records, settings/accessibility, audio completion, and final viable-build proofs remain later leaves.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-030` | `RR-STEP-029` | bounded repair builder | Add expected-red isolation test and explicit Rotten smoke permission gate | Pass | bounded turn | descendant exact unavailable | `evidence/integration-001/pass-01/builder-receipt.md` |
| `RR-STEP-031` | `RR-STEP-030` | fresh integration recritic | Build and directly compare manual versus authorized artifact behavior | `PASS` | bounded turn | descendant exact unavailable | `evidence/integration-001/pass-01/critic-receipt.md` |
| `RR-STEP-032` | `RR-STEP-031` | lead | Reverify, import evidence, commit, and push integration repair | Pass | `~8m` | included below | commit `7cef4b0` |
| `RR-STEP-033` | `RR-STEP-032` | lead | Run shipping update and freeze complete Stage 2 leaf | Pass | checkpoint | `1856992 / 1250000000` platform telemetry | `RR-DEC-016..018`, `LEAF-004.md` |

### Token Decision

Continue. Platform telemetry reports `1856992` tokens, far below the first autonomous trajectory audit at `25000000`; no trajectory audit is due.

### External Actions

- Pushed accepted repair commit `7cef4b0` to `origin/main`.
- No public deployment, domain, paid service, credential change, destructive history action, or campaign deletion occurred.

### Next Safe Action

`Commit and push this integration-promotion/control checkpoint, verify clean main, then launch exactly one bounded LEAF-004 builder from the frozen contract.`

Prerequisites: JSON and whitespace checks pass; builder receives no commit, push, ops, control, public-action, or product-scope authority.

## Checkpoint 9 - LEAF-004 Promoted; Complete Stage 3 Leaf Frozen

Updated: `2026-08-11T19:23:13Z`

### Accepted Product Truth

- Stage 2 is now a complete route/combat/reward loop. `Bile Registry`,
  `Seized Goods Lift`, and `Late Fee Chapel` each have two real waves and feed
  one generic second market before the exact Stage 3 docket.
- Shield Auditor frontal block/flank/skill/dash counterplay, Sump Scribe
  telegraph/hazard/expiry/Bomb clear, gilded armor, overdue enrage, both elite
  bounties, and all eight carried upgrade effects are materially operative.
- Knife/Belch/Compound, Pike/Stamp/Hangover, and Spitter/Bomb/Dead Letter each
  clear real Stage 2 routes. The remaining five upgrades have browser-visible
  mechanic proofs through the same `RottenCombatBuild` boundary.
- Stage 2 purchase, honest damaged heal, bank, no-op handling, two-entry
  history, exact Stage 3 carry, real Stage 2 death, same-seed `R` reset, zero
  stale combat objects, and one-canvas containment are accepted.
- Stage ownership remains generic: `RottenRunScene` is 1064 lines after the
  full Stage 2 addition, with pure encounter/market/build modules and a Phaser
  presentation helper instead of copied stage flows.

### Blind Review And Harness Revision Ledger

| Review | Verdict | Preserved largest gap | Bounded disposition |
| --- | --- | --- | --- |
| Initial fresh blind critic | `REVISE` overall; product behavior `PASS` | Its sole unfiltered matrix leaked 32 Chrome page targets and stalled after reaching a clean Stage 1 reward state because page close only closed the websocket and CDP calls were unbounded | Preserved the full REVISE receipt and direct product evidence; authorized only a browser-harness lifecycle repair. |
| Bounded revision builder | builder pass, not self-acceptance | Six expected-red close cycles grew page targets from 1 to 7 | Added actual `Target.closeTarget` plus bounded fallback, CDP/navigation/screenshot/close timeouts, pending-call rejection, progress diagnostics, and a 40-cycle lifecycle gate; no product file changed. |
| Fresh blind recritic | `PASS` | No serious product gap; one generic footer records rather than directly asserts total page equality | Dedicated lifecycle and the one-shot matrix independently prove exact baseline restoration, so the residual is nonblocking. |

- The recritic froze the 14-file candidate before reading prior evidence, built
  outside the repository, and passed `54/54` units, typecheck, 53-module build,
  dist smoke, every focused route, and direct in-app Browser review at
  1366x768 and 1920x1080.
- Its exact-once lifecycle run passed 40/40 unique targets: baseline `1/0`,
  every open `2/1`, every close `1/0`, final exact baseline.
- Its first and only unfiltered matrix passed `34/34` in `496725 ms`, opened
  and closed 57 unique targets, emitted 174 progress events, and ended at the
  exact original baseline with no timeout or failure event.
- The recritic froze `PASS` before provenance comparison, cleaned its runtime,
  then twice stalled only while formatting the receipt. The lead reconstructed
  a clearly labeled recovery receipt from its frozen hashes and durable raw
  evidence without rerunning validation or reinterpreting the verdict.

### Lead Promotion

- Verified all 14 candidate file hashes against the frozen critic snapshot,
  inspected representative Stage 2 shield, hazard, elite, market, Stage 3,
  and death frames, validated receipts/JSON, and confirmed no Foxman runtime or
  descendant remained.
- Lead deterministic checks passed before promotion: `54/54` units, typecheck,
  build, dist smoke, smoke-harness syntax, whitespace, a fresh 40-cycle target
  lifecycle route, and a fresh negative no-`smokeAuto` isolation route. The
  full matrix was not repeated by the lead.
- Imported compact builder, first-critic, revision, final-critic, lifecycle,
  full-matrix, and representative browser evidence under `evidence/leaf-004/`.
- Committed and pushed accepted product baseline
  `e8a99579d11fbd36dea07967814164e39c27e673`; local `main` and `origin/main`
  matched and the worktree was clean.

### LEAF-005 Boundary

- `RR-DEC-019` requires the complete Stage 3 route/combat/third-market loop,
  ending at an honest inert Commissioner dossier.
- `RR-DEC-020` freezes exact Stage 3 compositions using only existing roles,
  one generic encounter/build runtime, and deterministic double-elite scopes.
- `RR-DEC-021` makes the third accepted market choice enter the real `boss`
  phase while leaving boss health/phase null and creating no boss object.
- Commissioner combat, victory/results, records, settings/accessibility, audio
  completion, new raster assets, and final three-build boss proofs remain later
  bounded work.

### Trace

| Step | Parent | Role | Action | Result | Elapsed | Budget | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RR-STEP-034` | `RR-STEP-033` | bounded builder | Implement complete Stage 2, carried build runtime, second market, and Stage 3 docket | Pass | bounded turn | descendant exact unavailable | product candidate plus external builder receipt |
| `RR-STEP-035` | `RR-STEP-034` | fresh blind critic | Review frozen Stage 2 product and one-shot matrix | `REVISE` overall; product pass | bounded turn | descendant exact unavailable | `evidence/leaf-004/first-critic-revise.md` |
| `RR-STEP-036` | `RR-STEP-035` | bounded revision builder | Repair browser target lifecycle and bound CDP operations only | Pass | bounded turn | descendant exact unavailable | `evidence/leaf-004/revision-builder-receipt.md` |
| `RR-STEP-037` | `RR-STEP-036` | fresh blind recritic | Rebuild, directly operate, lifecycle-test, and run exactly one full matrix | `PASS` | bounded turn | descendant exact unavailable | `evidence/leaf-004/critic-receipt.md` |
| `RR-STEP-038` | `RR-STEP-037` | lead | Recover stalled receipt formatting, verify, import evidence, commit, and push LEAF-004 | Pass | bounded recovery | included below | commit `e8a9957`, origin matched |
| `RR-STEP-039` | `RR-STEP-038` | lead | Run Shipping Update and freeze complete Stage 3 leaf | Pass | checkpoint | `2611578 / 1250000000` platform telemetry | state, ops, `RR-DEC-019..021`, `LEAF-005.md` |

### Token Decision

Continue. Platform goal telemetry reports `2611578` tokens, far below the first
autonomous trajectory audit at `25000000`; no trajectory audit is due.

### External Actions

- Pushed accepted product commit `e8a9957` to `origin/main`.
- No public deployment, domain, paid service, credential change, destructive
  history action, campaign deletion, or unrelated process cleanup occurred.

### Next Safe Action

`Commit and push this LEAF-004 promotion/LEAF-005 control checkpoint, verify clean main, then launch exactly one bounded LEAF-005 builder from the frozen contract.`

Prerequisites: JSON, field-guide line budget, and whitespace checks pass; the
builder receives no commit, push, ops, control, public-action, or product-scope
authority.
