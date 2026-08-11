# LEAF-004 Builder Receipt

Generated: 2026-08-11T16:14:16Z

## Outcome

Builder validation: PASSED.

Self-acceptance: NO. Promotion remains pending the required fresh blind critic.
Blocker: none.

LEAF-004 now provides pure generic Stage 1/2 encounter specs; every frozen
Stage 2 route and two-wave roster; Shield Auditor and Sump Scribe; gilded and
overdue elites; all eight carried upgrades through one RottenCombatBuild; one
generic Stage 1/2 market and two-entry history; real Stage 2 purchase, heal, and
bank; clean same-seed retry; and an honest non-operative Stage 3 docket.

## Identity and hashes

- Repository: /Users/marcusvale/Documents/coding/marcusbrainhq/repos/theadventuresoffoxman
- Accepted runtime parent: 7cef4b039c401890ac24fb1a8a27800aa6bb18f7
- Control HEAD before/after: 126c986774a6e7a39408ddf7c4afbe33d2ed818d
- origin/main: 126c986774a6e7a39408ddf7c4afbe33d2ed818d
- The range 7cef4b0..126c986 is control/docs only; no runtime product change.
- Tracked binary-diff SHA-256: d6483f470c96ee464c730d51ee20ebe088f9c633367b21d4e37c6f69389130fc
- Authorized 14-file content aggregate SHA-256:
  16da759c6f1c89d6b988ade79b1cf8e3ab446c631748586e63f16a3511df1085
- Final unfiltered JSON SHA-256:
  7050b57b2221818e75e89590e8bd1d5d77916f0279ee4c8728c3da6cf7195ab6
- Exact per-file and evidence hashes are in BUILDER_RECEIPT.json.

GAUNTLET-ALPHA remains RR1-1C93B57F with Stage 1
unfiled-alley|bailiffs-ramp, Stage 2
seized-goods-lift|late-fee-chapel, and Stage 3
collection-parade|garnish-gallery. Plan ID/schema and Stage 1 seed behavior did
not change.

## Architecture

- src/game/rotten/encounters.ts owns pure stage/route/two-wave/spawn/elite/
  reward/market-bias data.
- src/game/rotten/build.ts derives the one reusable RottenCombatBuild.
- src/game/rotten/market.ts is the generic Stage 1/2 reducer with accepted
  Stage 1 compatibility.
- RottenCombatController and RottenEnemy own enemies, roles, elites, hazards,
  projectiles, wakes, counters, feedback, timers, colliders, and teardown.
- RottenRunPresentation is the reusable Phaser presentation helper.
- RottenRunScene remains generic at 1064 lines, net seven over the accepted
  1057; it has no renderStageTwo/startStageTwo/handleStageTwo method family.
- Health, Player, and PlayerMotor additions are optional/defaulted. No campaign
  call site or campaign scene changed.

## Runtime proof

- Lift: shield-auditor+clerk, then shield-auditor+bailiff+clerk.
- Chapel: deterministic elite core+mapped support, then
  shield-auditor+sump-scribe.
- Bile Registry: bailiff+sump-scribe, then sump-scribe+clerk+bailiff.
- Every route cleared exactly two Stage 2 waves to reward with zero combat
  objects and one canvas.
- Shield proof: blocks 2; real behind hit 1; opens 4; sources
  skill|dash-through; closed/open visible; AUDIT! visible.
- Scribe/Stamp: telegraphs 2; activations 2; peak active 1; real hazard hit 1;
  natural expiry 1; teardown 1; BILE MARK! visible.
- Scribe/Bomb: telegraphs 3; activations 3; overlapping clears 1; real hazard
  hits 2; skill hits 2; teardown 2.
- Gilded seed ELITE-OVERDUE-PROOF / RR1-43C9A578: one pip and one armor break,
  base tell retained, bounty 1.
- Overdue seed ELITE-GILDED-PROOF / RR1-D3B6650A: once-only alive enrage below
  half HP, base tell retained, bounty 1.

Carried build browser matrix:

- Compound Interest: capped +2; Knife/Belch clear at 3/6.
- Hangover Hide: carried 8/8; Pike/Stamp clear at 8/8.
- Dead Letter: 7 emissions and 5 real hits; Spitter/Bomb clear at 4/6.
- Petty Grudge: real player damage activated +1; clear at 3/6.
- Counterfeit Soles: 340ms dash, 4 wakes, 2 wake hits; clear at 4/6.
- Red Tape Tourniquet: 2 wave events, 1 HP restored; clear at 6/6.
- Spite Reserve: Stamp cooldown 1008ms; clear at 4/6.
- Graft Dividend: bounty 2 and discount 1; Chapel clear at 5/6.

Pure tests additionally cover exact windows/constants, missing-HP carry,
non-stacking refresh, bounded combined +3, per-target wakes, repeat/pierce,
source tagging/no recursion, generic history, no-ops, and retry reset.

Market/Stage 3:

- Dividend Chapel purchase: 9 to 5 graft; Spite cost 4; two histories and two
  decisions; bounty 2 carried.
- Honest GA heal: 5/6 to 6/6 and 12 to 10 graft.
- Bank preserved HP/graft/loadout/upgrades/history.
- Invalid, unaffordable, full-health, repeated, and late inputs were no-ops.
- GA Stage 3 pair was exact; route keys were inert; no encounter was created;
  combat objects 0 and canvas count 1.
- Actual Stage 2 death reached 0/6 with 38 objects. One real R restored the
  exact initial seed/plan/trace and reset all state/objects; second R was inert.

## Attempt ledger

1. Mandatory pre-runtime pure gate: one expected red, missing the not-yet-built
   encounters module. It was captured before Phaser edits.
2. Pure gates: 12/12 new, 31/31 focused, 54/54 full. Typecheck first exposed
   Stage-1-only marketStage typing; widening only to 1|2|null made it pass.
3. Topology passed first focused attempt.
4. Roles: nine deterministic failures were preserved and diagnosed in order:
   missing ordered block; timeout; second-wave death; dash dead zone; facing
   race; Stage-1 latch; unexercised real hazard hit; Bomb timeout; post-proof
   hazard death. Attempt 10 passed. One later live-frame evidence run passed.
   Production corrections were truthful flank/cumulative/final-teardown debug;
   input ordering, latches, hazard entry, Bomb aim, and evasion were harness.
5. Elites passed first focused attempt.
6. Builds: five deterministic failures isolated Compound target transition,
   Stage 1 entry, ranged/Bomb geometry, and wake targeting. Attempt 6 passed.
   Corrections were harness geometry/targeting; frozen constants were unchanged.
7. Market/Stage 3 and retry each passed first focused attempt.
8. Legacy market initially used late key 1, now legitimately a Stage 2 route.
   A trial 280ms production lock failed and was fully reverted. The legacy
   market-only no-op now uses key 3; final regression passed.
9. Final unfiltered matrix received exactly one attempt after every focused
   gate was green: ok=true, 34/34 routes. No retry or parallel replacement.

Preserved failures are in focused-stage-two-roles, focused-stage-two-builds, and
regressions/rottenMarket.

## Check matrix

- Mandatory expected red: preserved, one attempt.
- Focused new unit: 12/12 pass.
- Focused Rotten pure regression: 31/31 pass.
- npm test: 54/54 pass.
- npm run typecheck: pass.
- npm run build: pass.
- npm run smoke: pass, including all 23 campaign routes.
- Focused rottenIsolation, rottenContract, rottenEnemyCycle, rottenEncounter,
  and rottenMarket: pass.
- Focused topology, roles, elites, builds, market, and retry: pass.
- Visual inspection at 1366x768 and 1920x1080: pass; readable combat truth,
  one canvas, no missing-texture green.
- Final unfiltered npm run smoke:browser: one attempt, 34/34 pass.
- git diff --check and exact scope audit: pass.

## Evidence

Root:
/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-004-builder

Machine evidence:

- expected-red.txt
- pure-gates.txt
- focused-stage-two-topology/browser-smoke-rottenStageTwoTopology-results.json
- focused-stage-two-roles/browser-smoke-rottenStageTwoRoles-results.json
- focused-stage-two-elites/browser-smoke-rottenStageTwoElites-results.json
- focused-stage-two-builds/browser-smoke-rottenStageTwoBuilds-results.json
- focused-stage-two-market/browser-smoke-rottenStageTwoMarket-results.json
- focused-stage-two-retry/browser-smoke-rottenStageTwoRetry-results.json
- final-unfiltered/browser-smoke-results.json

Representative inspected visuals:

- final-unfiltered/rotten-stage-two-lift-1366x768.png
- final-unfiltered/rotten-stage-two-chapel-1920x1080.png
- final-unfiltered/rotten-stage-two-bile-registry-1366x768.png
- final-unfiltered/rotten-stage-two-shield-open-live-1366x768.png
- final-unfiltered/rotten-stage-two-sump-hazard-live-1920x1080.png
- final-unfiltered/rotten-stage-two-bomb-hazard-live-1366x768.png
- final-unfiltered/rotten-stage-two-gilded-armor-1366x768.png
- final-unfiltered/rotten-stage-two-overdue-live-enrage-1920x1080.png
- all eight final-unfiltered/rotten-stage-two-build-*.png frames
- Stage 3 purchase/heal/bank and Stage 2 death/retry frames

## Scope and cleanup

Exactly 14 authorized files changed/untracked: 11 tracked modifications plus
encounters.ts, RottenRunPresentation.ts, and the Stage 2 unit test. Including
new files: 3988 insertions, 406 deletions. No forbidden, campaign, asset,
package, plan/schema, control/ops, or vite-env file changed.

No commit, push, PR, deployment, package install, or public action occurred.
No Foxman preview, smoke, or browser process remains. Port 43139 was verified by
cwd as an unrelated carpet-front task and left untouched. Evidence is external,
approximately 69 MiB.

## Fresh blind critic route

Use a fresh npm run build artifact, real keys, both 1366x768 and 1920x1080, and
record exact seed/plan/route/build:

1. GAUNTLET-ALPHA, Pike 3, Stamp 6, Stage 1 route 2, bank 5, Lift 1: personally
   prove block, behind hit, skill open, dash-through open, and both waves.
2. BILE-PROOF, Pike 3/Stamp 6, Stage 1 route 1, bank 5, Registry 2: observe
   tell, marker, real hit, expiry. Repeat Spitter 4/Bomb 7 and clear a marker.
3. ELITE-OVERDUE-PROOF Chapel key 2 for gilded; ELITE-GILDED-PROOF Chapel key 1
   for overdue. Confirm base tells remain readable.
4. Independently spot-check all eight effects, especially BUILD-PROOF-1
   Knife/Belch/Compound, BUILD-PROOF-2 Pike/Stamp/Hangover, and BUILD-PROOF-0
   Spitter/Bomb/Dead Letter real clears.
5. DIVIDEND-CHAPEL-1 for bounty/discount/purchase; GAUNTLET-ALPHA separately
   for damaged heal, bank, exact Stage 3 carry, zero objects, and inert keys.
6. Die in Stage 2; press one real R; confirm exact baseline and clean objects;
   verify a second R is inert.

The critic must decide acceptance independently; this builder does not.
