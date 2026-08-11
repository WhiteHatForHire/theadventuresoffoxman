# LEAF-005 - Complete Stage 3 Combat, Third Market, And Commissioner Docket

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded builder

Planner decisions: `RR-DEC-001..021`

Base product head: `e8a99579d11fbd36dea07967814164e39c27e673`

Dependency: promoted LEAF-001..004 and passed LEAF-004 blind re-review

Risk: medium-high state, encounter, economy, and regression integration

Verification tier: pure deterministic state, real browser behavior, visual
combat review, fresh blind critic

## Outcome

From the accepted Stage 3 docket, a player chooses either seed-planned route,
fights two real waves, receives the displayed graft and elite bounties, makes
exactly one third deterministic reward decision, and reaches an honest
Commissioner of Consequences dossier with HP, graft, loadout, three route
decisions, up to three upgrades, build state, elite history, and trace intact.

All three frozen Stage 3 routes become operative across deterministic seeds.
The final boss itself remains deliberately non-operative in this leaf: the
dossier uses the real `boss` phase and final boss ID, accepts no start input,
creates no boss or combat objects, and makes no completion claim.

## Accepted Truth

- `main` and `origin/main` are clean at accepted product commit `e8a9957`
  before the separate LEAF-005 control commit.
- `GAUNTLET-ALPHA` remains plan `RR1-1C93B57F`; its Stage 3 pair is
  `collection-parade|garnish-gallery` in that order.
- Stage 1 and Stage 2 share one encounter specification, one generic scene
  orchestration path, one combat-build runtime, and one market reducer.
- Stage 2 has all five roles, both elite variants, all eight build effects,
  exact death/retry cleanup, and a second market ending at the Stage 3 docket.
- The accepted candidate passes `54/54` units, all focused gates, direct browser
  review at both desktop viewports, a 40-cycle target lifecycle probe, and one
  `34/34` unfiltered campaign-plus-Rotten matrix.
- `RottenRunScene` is 1064 lines. Stage 3 must reuse the generic path rather
  than create stage-numbered scene methods.

## Authorized Scope

- Edit browser-independent modules under `src/game/rotten/` for Stage 3
  encounter specs, deterministic double-elite assignments, stage-generic
  market/history state, boss-docket state, and trace/debug definitions.
- Edit `src/game/scenes/RottenRunScene.ts` only as the generic phase
  orchestrator.
- Edit or add Phaser-only helpers under `src/game/scenes/rotten/` for reusable
  Stage 3 arena, route, market, and Commissioner-dossier presentation.
- Edit `src/game/rotten/RottenCombatController.ts` and
  `src/game/rotten/RottenEnemy.ts` only if a proven generic Stage 3 cleanup or
  elite-composition defect cannot be solved in encounter data.
- Edit `src/vite-env.d.ts` for truthful namespaced debug fields if required.
- Add/extend Rotten unit tests and `tests/smoke/check-browser-routes.mjs`.
- Write builder evidence only under
  `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-005-builder/`.
- Run local tests, builds, managed loopback servers, browser automation, and
  screenshots.

No Player, PlayerMotor, Health, campaign scene, asset, package, ops, or
Gauntlet-control file is authorized. Stop and report if another file is
genuinely required.

## Required Architecture

1. Extend the existing browser-independent encounter registry with Stage 3;
   do not add Stage 3 roster conditionals to the scene or clone stage methods.
2. Extend the existing market/history reducer from stages `1|2` to `1|2|3`.
   One accepted Stage 3 choice enters `phase: boss` with the fixed boss ID and
   no route choice or combat start.
3. Preserve one `RottenCombatBuild`; Stage 3 consumes the carried configuration
   without adding upgrade checks to the scene or route data.
4. The Collection Parade double-elite assignment is pure, seed-scoped, and
   guarantees one gilded and one overdue variant on different core roles.
   No `Math.random`, clock, browser entropy, or mutable RNG is allowed.
5. Stage 3 reuses existing combat ownership and teardown. Reward, retry, and
   boss-dossier endpoints report zero living combat objects and one canvas.
6. The dossier is explicit product state, not a fake victory or placeholder
   encounter. It may present the fixed boss identity, carried build, full route
   and market history, and next-leaf boundary; it cannot create the boss,
   accept an attack/start key, write records, or show results.
7. Keyboard callbacks retain explicit scene-shutdown ownership. One physical
   key produces one route or market transition after every stage and retry.
8. Every new smoke fixture requires `smokeAuto=1`; the negative isolation and
   40-cycle lifecycle routes remain exact.

## Frozen Stage 3 Encounter Specs

### Garnish Gallery

- Wave 1: `clerk + writ-runner`.
- Wave 2: `clerk + sump-scribe + shield-auditor`.
- No elite; base reward 6 graft; weapon-biased market.
- The route proves mixed ranged, lane-charge, hazard, and shield pressure
  without adding a new role.

### Appeal Furnace

- Wave 1: `sump-scribe + bailiff`.
- Wave 2: `sump-scribe + clerk + shield-auditor`.
- No elite; base reward 6 graft; skill-biased market.
- Bribe Bomb hazard clearing, skill interruption, movement, and target priority
  remain the intended counterplay; no new hazard behavior is authorized.

### Collection Parade

- Wave 1: one elite core role plus its existing non-identical mapped support
  role and one `shield-auditor`.
- Wave 2: a different elite core role plus its existing non-identical mapped
  support role and one `sump-scribe`.
- The two elite variants are exactly one `gilded` and one `overdue`; their wave
  order derives from named deterministic scope
  `encounter-v1:stage-3:collection-parade:variant-order`.
- Elite core roles derive without replacement from named deterministic scope
  `encounter-v1:stage-3:collection-parade:elite-roles`.
- Base reward 7 graft plus both elite bounties; mutation-biased market.

Every route is exactly two waves. Do not add a miniboss, third wave, new role,
new elite variation, or new combat mechanic.

## Generic Third Market And Honest Boss Boundary

- Stage 3 clear retains actual current/max HP, adds the route's displayed base
  graft plus elite bounties, and opens three deterministic eligible offers.
- Keys `1-3` buy one offer, `4` heals up to 2 HP for 2 graft, and `5` banks.
  Invalid, unaffordable, full-HP, repeated, or late input remains a strict no-op
  except concise feedback.
- One accepted choice resolves decision count 3, appends the third route and
  market history, preserves unique upgrades and build summary, and enters the
  real `boss` phase for `commissioner-of-consequences`.
- The boss dossier shows seed, plan ID, active time, HP/graft/loadout, three
  routes, three market choices, upgrades/build, kills, elites/variants, bounty,
  and trace digest. It accepts no boss-start or combat input in this leaf.
- Dossier, reward, and retry states have zero combat objects and one canvas.

## Presentation And Readability

- Stage 3 must look materially distinct from Stages 1 and 2 using only
  repository-local art plus code-native Final Filing treatments. No new raster
  asset is required.
- Collection Parade must keep both simultaneous elite treatments and their
  base tells readable. Garnish and Appeal must keep projectile, hazard, shield,
  and recovery truth visible against the background.
- Stage 3 HUD, third market, and Commissioner dossier must remain readable at
  1366x768 and 1920x1080 without covering required actors or controls.
- Existing feet/floor, offscreen reacquisition, one-canvas, reduced-noise, and
  missing-texture-green invariants remain intact.

## Required Debug Truth

Extend the structured snapshot/scalars with the minimum truthful evidence:

- Stage 3 route/wave truth and cumulative six-wave completion;
- per-enemy role/state/HP/elite variant plus existing shield/hazard state;
- both Collection Parade elite variants, roles, defeats, and bounty;
- three route-history entries and three market choices;
- Stage 3 offer IDs/prices, accepted choice, HP/graft/upgrades/build carry;
- phase `boss`, boss ID `commissioner-of-consequences`, dossier-ready state,
  boss health/phase still null, and zero boss/combat objects;
- canvas count and trace digest.

Do not publish opaque smoke-only claims without matching runtime state.

## Test-First And Acceptance Evidence

Before runtime implementation, add failing pure tests for all three exact
Stage 3 encounter specs, deterministic double-elite assignment, stage-3 market
opening, third decision/history, boss-dossier transition, and retry reset.
Preserve the expected red.

Acceptance requires:

1. Stage 1/2 unit/browser fixtures, `GAUNTLET-ALPHA` plan ID and route pairs,
   smoke isolation/lifecycle, and all 23 campaign routes remain exact.
2. Real keys choose both `GAUNTLET-ALPHA` Stage 3 routes after two real prior
   market decisions; each exact two-wave roster spawns and can be cleared.
3. A separate deterministic seed selects Appeal Furnace and clears it.
4. Collection Parade proves two different elite core roles, exactly one
   gilded and one overdue in the deterministic order, both base tells, both
   defeats, both bounties, and Graft Dividend's exact extra bounty behavior.
5. Garnish proves mixed-range role cycles, ground/visibility continuity, and
   real weapon/skill hits; Appeal proves hazard activation/expiry plus Bribe
   Bomb clear or skill interruption under the accepted mechanics.
6. Knife/Belch/Compound, Pike/Stamp/Hangover, and Spitter/Bomb/Dead Letter each
   clear a real Stage 3 route alive with their carried effect still material.
7. Stage 3 purchase, honest damaged heal, bank, unaffordable/invalid/repeated
   no-op, Graft Dividend discount, and exact third history/decision pass.
8. The Commissioner dossier carries exact run truth, stays inert under route,
   market, Enter, weapon, and skill keys, has null boss health/phase, zero live
   objects, and one canvas.
9. Death during Stage 3 plus real `R` returns to the same seed/plan loadout with
   all route, market, build, elite, hazard, wave, boss, and object state reset;
   a second `R` at loadout is inert.
10. A fresh blind critic directly operates Stage 3 route, double-elite,
    third-market, dossier, and Stage 3 death/reset paths on a fresh production
    artifact at both desktop viewports.
11. The full browser regression passes every accepted route plus the Stage 3
    routes with no exception, timeout, target leak, guarded resource failure,
    missing-texture green, duplicate canvas, campaign drift, or stale object.

## Checks

- focused new pure tests, then full `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run smoke`
- focused `cdpLifecycle`, `rottenIsolation`, `rottenContract`,
  `rottenEnemyCycle`, `rottenEncounter`, `rottenMarket`, and all accepted
  Stage 2 routes
- focused Stage 3 topology, roles/double-elite, builds, third market/dossier,
  and Stage 3 retry routes
- exactly one unfiltered `npm run smoke:browser` after focused gates are green
- visual inspection at 1366x768 and 1920x1080
- `git diff --check` and exact scope audit

## Retry Policy

- Preserve the first failure of every new deterministic gate.
- One fresh retry is allowed only for a demonstrated browser focus, transport,
  or server-startup failure; save the discriminator and do not hide the first.
- A roster, elite, market, dossier, reset, cleanup, state, or campaign failure
  is deterministic until diagnosed.
- The final unfiltered matrix receives exactly one attempt.
- Do not tune Stage 1/2 or campaign timing to make Stage 3 smoke pass.

## Non-Goals

- No Commissioner combat, boss actor/patterns/summon, victory, results, local
  records, settings/accessibility implementation, audio completion, new raster
  asset, package install, public deployment, or campaign refactor.
- No plan-schema/version/`GAUNTLET-ALPHA` plan-ID change.
- No new weapon, skill, upgrade, enemy role, elite variant, route, stage, wave,
  or boss beyond the frozen contract.
- No campaign scene edit or shared Player/PlayerMotor/Health change.

## Stop Conditions

- Stage 3 requires a plan-ID/schema or campaign semantic change.
- Existing generic encounter/market/build ownership cannot represent Stage 3
  without stage-numbered scene clones or scattered upgrade checks.
- A new asset/package/public action or forbidden file is genuinely required.
- A deterministic accepted campaign, Stage 1/2, isolation, lifecycle, market,
  or cleanup regression cannot be repaired inside the authorized architecture.
- Product tuning cannot meet readability/clearability without a lead decision.

## First Concrete Action

Verify the exact clean accepted/control head, add failing pure Stage 3 coverage
for encounter specs, double-elite assignment, third market/history, inert boss
dossier, and retry reset, run it once to preserve the expected red, then extend
browser-independent specs before touching Phaser runtime.

## Return Schema

```json
{
  "leafId": "LEAF-005",
  "status": "passed | needs_revision | blocked",
  "decisionIdsFollowed": [],
  "filesChanged": [],
  "checksRun": [],
  "evidencePaths": [],
  "budgetUsed": {},
  "blocker": null,
  "recommendedNextAction": ""
}
```
