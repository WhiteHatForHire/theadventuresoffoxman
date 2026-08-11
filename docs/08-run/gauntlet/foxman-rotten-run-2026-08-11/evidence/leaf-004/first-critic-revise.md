# LEAF-004 Reality Gate Receipt

- Audit completed: 2026-08-12T01:22:47+0800
- Auditor: `/root/leaf_004_critic`, sole fresh-context blind critic
- Repository: `/Users/marcusvale/Documents/coding/marcusbrainhq/repos/theadventuresoffoxman`
- Contract: `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/LEAF-004.md`
- Production artifact: `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-004-critic/source-snapshot/dist`
- Production URL used: `http://127.0.0.1:4175/`
- Builder receipt/evidence/prior critic artifacts: not consulted before or after the independent verdict
- Candidate product assessment: PASS on all completed deterministic, focused, architectural, and direct in-app Browser checks
- Release reality-gate verdict: **REVISE**, because the one permitted unfiltered full-matrix attempt stalled without a result receipt and was not retried

## Frozen provenance

- `HEAD`: `126c986774a6e7a39408ddf7c4afbe33d2ed818d`
- `origin/main`: `126c986774a6e7a39408ddf7c4afbe33d2ed818d`
- Accepted runtime parent: `7cef4b039c401890ac24fb1a8a27800aa6bb18f7`
- Ordered 14-file SHA-256 aggregate: `f4d066c727bd9fa9747141822156cc4721e86c38bcb9f347a1744ae59fac3986`
- External production-dist SHA-256 aggregate: `fdc42196bdb5e53529669997eabc03884d63fed3dc774735c4d57855a0559ff8`
- Snapshot byte comparison: all 14 source files matched the frozen candidate before install/build/testing.

| Candidate file | SHA-256 |
|---|---|
| `src/game/combat/Health.ts` | `a17163dac3e8c9e8d7bf8f94e07696678b12bc7bb3c7e61386cd96236c041abd` |
| `src/game/entities/Player.ts` | `fc347b1e9a5eadcdfb2b2d8f7453c2766121e0c36fddd5dac6d0d2b2a633184a` |
| `src/game/movement/PlayerMotor.ts` | `684c98737d35dbae21f26b15ac25f57d27c20ab4c8c13bb478f5589c84978b7a` |
| `src/game/rotten/RottenCombatController.ts` | `4889714f08890398a58c916faa20625a72b559ee48e9000ee2780ae4e743b095` |
| `src/game/rotten/RottenEnemy.ts` | `86399a7759e43f71d67c1cdf3411b6353cc26f9915337f1fbf6fe14bdfe9d426` |
| `src/game/rotten/build.ts` | `dcbc7908632ac2d71893f8d600d405848a04e538b97b02e1badbde01b7578c7e` |
| `src/game/rotten/enemyRoles.ts` | `ca6936e27e84e28622d4ce2451ba79a42281b6f8f88f8a25ba2238c1797525a4` |
| `src/game/rotten/market.ts` | `844dd8e31579b69ba38bb7106966b2ecc351d1b56ca40c65026dac7b18bf8f9a` |
| `src/game/rotten/state.ts` | `2cf52071533aeb1c2230adcde2a0deffadf04a865156edf7b4a6b394e7342bfa` |
| `src/game/scenes/RottenRunScene.ts` | `d1c6c0d684dc6602b5a896e87e8cdd9fc8b594214bd7e9a9a879009d95e7ae66` |
| `tests/smoke/check-browser-routes.mjs` | `d1e5539b6098580aea800a18f8cf9dd3ce2fd2590cb2e1bd6659dce684c04bd0` |
| `src/game/rotten/encounters.ts` | `6f7a8ec3f16cafcd87e8d4af43c8d635c73d89b79d5e02fb033ce8f4d1b49626` |
| `src/game/scenes/rotten/RottenRunPresentation.ts` | `4bcd3a09a0f1d8350297f2f01513653ff6ce958793440a9c6a2c40a00e8c06c2` |
| `tests/unit/rotten-run-stage-two.test.ts` | `6ea7fbbb254ebd16970fc0ef345d78f64e761f45456d1267bf4d9a516b961493` |

| Dist file | SHA-256 |
|---|---|
| `dist/index.html` | `dcc4262ec086da1c1742133d6b113af1b3d73096710c5e50b1d8623e2c79dc8c` |
| `dist/assets/index-D6CK1d2R.js` | `732625d73e4f2e04bccb36b81a6e81ab14faae4e10c3b68b8e34cd3db137c892` |
| `dist/assets/phaser-vendor-DFK5Ua9d.js` | `f9025c1a29bc3ae097dd886ce07717b297466da1ce8f032c8294252ce6cf5cdb` |
| `dist/assets/index-BXaDcDRc.css` | `0d51badf00cdafbf5d148d0fbec9512c60edb583c672d34f16e88064efe849c9` |
| `dist/assets/bg_rotten_borough_mood_runtime-BZTO3j5s.webp` | `304618d21cd1973809844b4297e0c5dcd0cb383a17097629dc93d0a71c45897d` |
| `dist/assets/drunken_guard_atlas-Dq9ZjCjg.png` | `22562e81ae95d99512dad4f2f58a84d515380f530f05a9cc59231ef0fb5525a7` |
| `dist/assets/foxman_atlas-DgAgREoh.png` | `08534adc6fe3eda4159c42ab33958102dc053b409347a0e9147daf8bb8a840a7` |
| `dist/assets/pickup_exit_atlas-D2L0B9BG.png` | `ba9d8a4f03c042eb34ec2cc64b02b6c29d78d6cd4d5c26ca5cbdf63a1c98db99` |
| `dist/assets/reward_shop_counter_runtime-BsxiV52P.webp` | `e432675233253d07ccdaa283d4388c08177ac79e4c1505a03169e7e8e5a1a535` |
| `dist/assets/reward_shop_icons_atlas-Bt6AxAs8.png` | `9c911ad655b1f8a4e8c44c3d7d0c02ea6533c148d80b02149bef16c0c4ea6a5a` |
| `dist/assets/rotten_borough_tiles_atlas-DkmeSx4V.png` | `b77615e5b4621b8140b366252b4db8cddd508c80b874294af7960bc6c143171f` |
| `dist/assets/tax_clerk_atlas-C3V2a7j7.png` | `a39f554cdec9fd329e1c052068dd169e06a85c9b865342bb2684f3b6f9d0e543` |
| `dist/assets/toll_baron_atlas-Jsbga7vf.png` | `902e5cfe51e10c0551fdbf5fcd9b59b49466bfd7b0ae4c975c093a9d57dc5f3c` |

## Attempt ledger

All commands below ran from the external snapshot. No candidate file was edited.

| Check | Attempt | Result |
|---|---:|---|
| `npm ci` | 1 | PASS |
| `npx vitest run tests/unit/rotten-run-stage-two.test.ts` | 1 | PASS, 12/12 |
| `npm test` | 1 | PASS, 54/54 across 5 files |
| `npm run typecheck` | 1 | PASS |
| `npm run build` | 1 | PASS, 53 modules; frozen dist above |
| `npm run smoke` | 1 | PASS |
| `git diff --check` | 1 | PASS |
| Preview on `127.0.0.1:4174` | 1 | Infrastructure collision: `Error: Port 4174 is already in use` |
| Preview on `127.0.0.1:4175` | 1 | PASS; exact external dist served |
| Focused `rottenIsolation` | 1 | PASS |
| Focused `rottenContract` | 1 | PASS |
| Focused `rottenEnemyCycle` | 1 | PASS |
| Focused `rottenEncounter` | 1 | PASS |
| Focused `rottenMarket` | 1 | PASS |
| Focused `rottenStageTwoTopology` | 1 | PASS |
| Focused `rottenStageTwoRoles` | 1 | PASS |
| Focused `rottenStageTwoElites` | 1 | PASS |
| Focused `rottenStageTwoBuilds` | 1 | PASS |
| Focused `rottenStageTwoMarket` | 1 | PASS |
| Focused `rottenStageTwoRetry` | 1 | PASS |
| Unfiltered full browser matrix, with no `FOXMAN_SMOKE_ONLY` | **1, exactly** | **STALLED; exit 130 after critic stop; not retried** |

Focused result JSON and screenshots are under `focused/<gate>/`. Each focused gate was a first product attempt.

## One-shot full-matrix failure, preserved

Command:

```text
FOXMAN_BASE_URL=http://127.0.0.1:4175 FOXMAN_EVIDENCE_DIR=/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-004-critic/full-matrix npm run smoke:browser
```

- Attempt count: exactly 1; no retry and no selective filter.
- It produced 14 partial screenshots but no results JSON.
- Last evidence write: `full-matrix/rotten-encounter-readable-tell-1366x768.png`, `2026-08-12T00:41:54+0800`.
- At approximately 17:17 elapsed, Node and Chrome were sleeping at 0% CPU; no evidence file had changed for more than 15 minutes.
- Two CDP observations about 94 seconds apart were identical.
- Exact current URL: `http://127.0.0.1:4175/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenEncounter`.
- Exact last product telemetry: `phase=reward-choice`, `stage=1`, `route=bailiffs-ramp`, `wave=2`, `waves=2`, `living=0`, `hp=6/6`, `attacks/hits=6/6`, `skills/hits=2/2`, `objects=0`, `canvas=1`, `trace=436F9F05`.
- `/json/list` exposed 32 page targets.
- No exception text was emitted. The literal terminal stop was `^C`; process exit was 130.
- Stop classification: repeated no-progress harness stall. This is not an observed product defect; the product state was complete and clean.
- Source evidence: `CdpPage.close()` only calls `this.ws.close()` at frozen `tests/smoke/check-browser-routes.mjs:3710`, while `send()` at line 3714 has no timeout. The stall after a healthy state and before the next evidence write is consistent with a leaked-target/unbounded-CDP wait. This causal statement is an inference from the observations and source.

Other critic-harness timing records, with no product restart: `condition timeout: {...}` was emitted after a correct Stage 1 reward state, and a too-early market key produced `timeout rottenStage expected 2 got 1`; continuing from those unchanged DOM states completed both scenarios. No product failure was converted to green by retry.

## Independent architecture result

- `encounters.ts` is a pure generic encounter registry; Stage 2 is added through specs, not cloned Stage 1 scene families.
- Stage 1 fixture rosters remain frozen; the deterministic elite scope is `encounter-v1:stage-2:late-fee-chapel:elite`.
- `build.ts` owns one derived combat configuration for the eight effects; combat consumers use that shared configuration.
- `market.ts` is a stage-generic reducer with deterministic offers, discounts, heal/bank/purchase/no-op handling, and route history.
- `RottenRunScene.ts` retains generic stage entry/wave/market methods and delegates presentation to `RottenRunPresentation.ts`; no Stage 1 cloning was found.
- Shared `Health`, `Player`, and `PlayerMotor` hooks are optional/default-compatible. Direct Campaign `Enter` still reached `RunScene` with `Weapon: Rusty Knife`.
- Scene shutdown owns enemy, projectile, hazard, and keyboard teardown. Reward/reset endpoints reported zero combat objects and one canvas.
- Seed/plan schema remained scalar and deterministic; no plan/schema drift or unauthorized candidate paths were found.
- Harness hardening gap: one isolation phase assertion compares the phase list to itself, making that individual assertion vacuous. Direct no-`smokeAuto` observation independently proved isolation, but this assertion should still be repaired.

## Direct in-app Browser truth

The real Codex in-app Browser was used, not a headless substitute. All loadout, route, market, Campaign, and reset decisions below were real Browser key events. `smokeAuto=1` was used only for authorized combat smoke scenarios. A control URL containing `smoke=rottenStageTwoRoles` without `smokeAuto` remained at Stage 1 wave 1 with `attacks=0`, `hits=0`, `skills=0`, `skillHits=0` after 4.5 seconds.

| Surface | URL / viewport / real inputs | Observed truth |
|---|---|---|
| Campaign compatibility | `/`, 1366x768, `Enter` | `RunScene`, default Rusty Knife HUD, one canvas |
| GAUNTLET plan | `/?mode=rotten&seed=GAUNTLET-ALPHA`, 1366x768, `3,6,Enter,2` | plan `RR1-1C93B57F`; frozen routes; real Stage 1 entry; no automation |
| Shield/route/market/Stage 3 | `GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoRoles`, 1366x768, `3,6,Enter,2,5,1` plus market keys | blocks 2, flanks 1, opens 4, sources `skill|dash-through`; invalid/unaffordable strict no-ops; purchase/heal/bank work; exact inert `collection-parade|garnish-gallery` carry |
| Sump Scribe | `BILE-PROOF&smokeAuto=1&smoke=rottenStageTwoRoles`, 1920x1080, `3,6,Enter,1,5,2` | telegraphs 2, activations 2, active max 1, legitimate hits 1, expiry 1, teardown 1; `BILE MARK!`, `ACTIVE`, `OPEN`; reward objects 0 |
| Bomb clear | same Scribe URL, 1920x1080, `4,7,Enter,1,5,2` | hazard clear 1, teardown 2, skill hits 2; reward objects 0 |
| Gilded elite | `ELITE-OVERDUE-PROOF&smokeAuto=1&smoke=rottenStageTwoElites`, 1366x768 | plan `RR1-43C9A578`; armor pip 1, break 1, enrage 0, bounty 1, graft 14 |
| Overdue elite | `ELITE-GILDED-PROOF&smokeAuto=1&smoke=rottenStageTwoElites`, 1920x1080 | plan `RR1-D3B6650A`; live enrage visible, enrage 1, armor break 0, bounty 1, graft 14 |
| Stage 2 death/reset | `GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoRetry`, 1366x768, `3,6,Enter,2,1,2,r,r` | actual Stage 2 death `0/6`, owned objects 38; first `r` restored same seed/plan/trace and pristine Stage 1 loadout with objects 0/canvas 1; second `r` inert |

All eight carried effects were materially observed through the in-app Browser:

| Upgrade / archetype | Viewport | Material result |
|---|---|---|
| Compound Interest / Knife-Belch | 1366x768 | capped compound and total weapon bonus 2 |
| Hangover Hide / Pike-Stamp | 1920x1080 | 8/8 HP entering and leaving Stage 2 |
| Dead Letter / Spitter-Bomb | 1366x768 | 7 emissions, 5 extra hits |
| Petty Grudge / Pike-Stamp | 1366x768 | max grudge and total weapon bonus 1 |
| Counterfeit Soles / Pike-Stamp | 1920x1080 | dash cooldown 340 ms, wakes 4, wake hits 2 |
| Red Tape Tourniquet / Pike-Stamp | 1366x768 | heal events 2, actual restored HP 1 |
| Spite Reserve / Pike-Stamp | 1366x768 | skill cooldown 1008 ms |
| Graft Dividend / Pike-Stamp | 1920x1080 | elite bounty 2, graft 9, later prices `4|4|5` |

Stage 2 market direct evidence also covered purchase, heal `5/6 -> 6/6` for two graft, bank, invalid input, unaffordable input, full carry, repeated/late no-ops, and exact two-entry route history. Reward/docket/reset endpoints had one canvas and zero combat objects. Direct Browser console collection returned no warnings or errors. All 13 frozen dist resources returned HTTP 200. Focused missing-texture-green checks passed at both viewports, and direct visual inspection found no missing textures, broken assets, overlap, or unreadable required tells.

## Screenshot index

Direct Browser evidence is under `direct-browser/`. Key files:

- `01-title-campaign-default-1366x768.png`
- `02-campaign-enter-default-1366x768.png`
- `03-gauntlet-alpha-loadout-manual-1366x768.png`
- `05-smoke-name-no-auto-1366x768.png`
- `06-stage1-reward-real-market-key-1366x768.png`
- `07-stage2-docket-carried-1366x768.png`
- `08-shield-auditor-audit-tell-1366x768.png`
- `09-shield-auditor-open-1366x768.png`
- `10-stage3-exact-inert-carry-1366x768.png`
- `12-sump-scribe-hazard-live-1920x1080.png`
- `13-sump-scribe-reward-clean-1920x1080.png`
- `14-bribe-bomb-before-clear-1920x1080.png`
- `15-bribe-bomb-cleared-reward-1920x1080.png`
- `16-gilded-entry-1366x768.png`
- `17-gilded-reward-1366x768.png`
- `18-overdue-entry-1920x1080.png`
- `19-overdue-live-enrage-1920x1080.png`
- `20-overdue-reward-1920x1080.png`
- `build-compound-interest-1366x768.png`
- `build-hangover-hide-1920x1080.png`
- `build-dead-letter-1366x768.png`
- `build-petty-grudge-1366x768.png`
- `build-counterfeit-soles-1920x1080.png`
- `build-red-tape-tourniquet-1366x768.png`
- `build-spite-reserve-1366x768.png`
- `build-graft-dividend-1920x1080.png`
- `29-stage2-actual-death-1366x768.png`
- `30-stage2-same-seed-reset-1366x768.png`

Focused gate evidence and JSON are under `focused/`; the preserved incomplete matrix evidence is under `full-matrix/`.

## Biggest remaining gap and ranked repair

Biggest gap: there is no trustworthy completed unfiltered full-matrix result for this exact candidate. Passing focused and direct product evidence cannot substitute for that explicit one-shot acceptance obligation.

1. Repair the smoke harness only: make page close actually close the Chrome target (for example, carry the Browser port and use `/json/close/<targetId>` or an awaited `Target.closeTarget`), then close the websocket; bound every CDP `send`, navigation, and screenshot with a timeout that rejects pending calls and prints method, URL, route, target count, and last DOM telemetry.
2. After that repair lands, assign a fresh independent critic exactly one new unfiltered full-matrix attempt against a newly frozen production artifact. Require a result JSON, zero leaked targets, and cleanup before PASS.
3. Correct the vacuous isolation phase assertion so it compares observed phase order to the expected order. Keep the direct no-`smokeAuto` control.

No candidate product repair is ranked because no product defect was observed.

## Cleanup and repository integrity

- In-app Browser viewport override reset and all tabs opened by this audit finalized.
- Final in-app Browser warning/error collection: empty.
- External preview stopped; port 4175 has zero listeners.
- No audit Chrome process remains. Three audit-owned stale `foxman-chrome-*` profile remnants were removed by exact path; older pre-existing profiles were not touched.
- Repository was not edited. Final `HEAD`/`origin/main` remain `126c986774a6e7a39408ddf7c4afbe33d2ed818d`.
- Final candidate aggregate remains `f4d066c727bd9fa9747141822156cc4721e86c38bcb9f347a1744ae59fac3986`.
- Final `git status --short` remains the exact frozen 14-file candidate scope; `git diff --check` remains clean.

REVISE
