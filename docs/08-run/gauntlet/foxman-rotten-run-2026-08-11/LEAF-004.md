# LEAF-004 - Complete Stage 2 Combat, Carried Build Runtime, And Stage 3 Docket

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded builder

Planner decisions: `RR-DEC-001..018`

Base product head: `7cef4b039c401890ac24fb1a8a27800aa6bb18f7`

Dependency: promoted LEAF-001..003 plus passed INTEGRATION-001

Risk: high gameplay/state/architecture integration

Verification tier: pure deterministic state, real browser behavior, visual
combat review, fresh blind critic

## Outcome

From the accepted Stage 2 docket, a player chooses either seed-planned route,
fights two real waves containing the shield-auditor, sump-scribe, and any
promised elite, receives the displayed graft and elite bounty, makes exactly one
second deterministic reward choice, and reaches the seed-planned Stage 3 docket
with HP, graft, loadout, two route decisions, up to two upgrades, build effects,
and trace intact.

Every upgrade that can be bought after Stage 1 must materially affect Stage 2;
no owned upgrade may remain presentation-only. The scene must reuse one generic
stage path instead of cloning Stage 1 methods.

## Accepted Truth

- `main` and `origin/main` are clean at accepted product commit `7cef4b0` before
  the separate LEAF-004 control commit.
- `GAUNTLET-ALPHA` remains plan `RR1-1C93B57F`, Stage 1
  `unfiled-alley|bailiffs-ramp`, Stage 2
  `seized-goods-lift|late-fee-chapel`, and Stage 3
  `collection-parade|garnish-gallery`.
- Stage 1 has four real weapons, three real skills, three enemy roles, two
  waves, death/retry, a pure one-choice market, and exact Stage 2 carry.
- The integration gate passes 42/42 units, all focused routes, direct manual
  versus authorized smoke isolation, and 28/28 browser routes.
- `RottenRunScene` is 1057 lines. INTEGRATION-001 explicitly forbids adding a
  second copied stage implementation.

## Authorized Scope

- Add or edit browser-independent modules under `src/game/rotten/` for generic
  encounter specs, Stage 2 waves, elite assignments, build-runtime constants,
  state, market transitions, enemy definitions, combat, and hazards.
- Edit `src/game/scenes/RottenRunScene.ts` as the thin phase orchestrator.
- Add Phaser-only helpers under `src/game/scenes/rotten/` for reusable route,
  arena, HUD, tell, or market presentation.
- Edit `src/game/entities/Player.ts`, `src/game/movement/PlayerMotor.ts`, and
  `src/game/combat/Health.ts` only for optional Rotten-supplied movement config,
  exact carried current HP, and bounded healing. Existing constructor/default
  behavior must remain the campaign default.
- Edit `src/vite-env.d.ts` for truthful namespaced debug fields.
- Add/extend Rotten unit tests and `tests/smoke/check-browser-routes.mjs`.
- Write builder evidence only under
  `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-004-builder/`.
- Run local tests, builds, managed loopback servers, browser automation, and
  screenshots.

No other source, campaign scene, asset, package, ops, or Gauntlet-control file
is authorized. Stop and report if another file is genuinely required.

## Required Architecture

1. A browser-independent encounter specification owns route, stage, two wave
   rosters, spawn annotations, elite assignment, arena key, reward, and market
   bias. Stage 1 data remains byte-equivalent; Stage 2 does not live in scene
   conditionals.
2. The Stage 2 Late Fee Chapel elite role and variant derive deterministically
   from named scope `encounter-v1:stage-2:late-fee-chapel:elite`. Do not call
   `Math.random`, time, or mutable global RNG. The accepted plan schema and
   `GAUNTLET-ALPHA` plan ID do not change.
3. One generic market state/reducer handles stages 1 and 2, records one history
   entry and one choice per stage, excludes owned upgrades, applies Graft
   Dividend discounts, and advances Stage 2 only to Stage 3 route choice.
4. One `RottenCombatBuild` or equivalent config is derived from the pure build
   summary and consumed by combat/player boundaries. The scene does not branch
   on individual upgrade IDs.
5. Combat runtime owns enemies, elite visuals/state, shields, projectiles,
   hazards, bombs, dash wakes, feedback, colliders, timers, and teardown.
   Reward, retry, and Stage 3 docket report zero live combat objects.
6. Shared Player/PlayerMotor/Health changes are optional/defaulted. Campaign
   construction receives exactly today's movement, cooldown, HP, and damage
   behavior without campaign call-site edits.
7. Route, arena, market, and Stage 3 presentation reuse helpers. Do not create
   `renderStageTwo*`, `startStageTwo*`, and cloned `handleStageTwo*` families.
8. Keyboard callbacks have explicit scene-shutdown ownership; one physical key
   produces one transition after retry or any scene lifecycle event.
9. Every LEAF-004 smoke fixture requires `smokeAuto=1`; the negative isolation
   route remains unchanged and green.

## Frozen Stage 2 Encounter Specs

### Bile Registry

- Wave 1: `bailiff + sump-scribe`
- Wave 2: `sump-scribe + clerk + bailiff`
- No elite; base reward 5 graft; skill-biased market.

### Seized Goods Lift

- Wave 1: `shield-auditor + clerk`
- Wave 2: `shield-auditor + bailiff + clerk`
- No elite; base reward 5 graft; weapon-biased market.

### Late Fee Chapel

- Wave 1: exactly one deterministic elite on a core role selected from
  `bailiff|clerk|writ-runner`, plus a non-identical mapped support role.
- Variant is deterministically `gilded` or `overdue` from the named scope.
- Wave 2: `shield-auditor + sump-scribe` with no second elite.
- Base reward 6 graft plus one elite bounty; mutation-biased market.

Every Stage 2 route remains two waves. Do not add minibosses, a third wave, or
random roster size.

## New Role Counterplay

### Shield Auditor

- Health 4; deliberate melee pressure with visible `AUDIT!` windup, active,
  and recovery.
- A closed shield blocks frontal weapon damage with visible `BLOCKED` feedback
  and no health loss. A weapon from behind damages normally.
- Any skill hit interrupts and opens the shield for at least 1100ms. A real dash
  through the body opens it for at least 1100ms. Open state is visible and
  weapon-hittable.
- Shield state, blocks, opens, source, and health are exposed in debug truth.

### Sump Scribe

- Health 3; preserves range and shows `BILE MARK!` before committing.
- Active intent marks a clamped floor position near Foxman for 520ms, then
  creates a visible hazard lasting 1800ms. The hazard damages at most once per
  700ms and never becomes an untelegraphed contact wall.
- Bribe Bomb detonation clears overlapping active/telegraph hazards and records
  the clear. Other skills may interrupt the scribe before release but do not
  silently erase distant hazards.
- Hazard telegraph, active, expiry, hit, clear, and teardown counts are exposed.

## Elite Variations

- `gilded`: gold treatment, one visible armor pip that consumes the first valid
  unblocked damage instance, then breaks visibly; recovery is 20% shorter.
- `overdue`: purple-red treatment; below half health it announces `OVERDUE!`
  once, then approach speed rises 25% and recovery becomes 20% shorter. Damage
  remains one HP so the role does not become an unreadable contact wall.
- Elite treatment never hides the base role tell, shield state, hazard marker,
  recovery opening, feet, or body.
- Each defeated elite grants one graft. Graft Dividend grants exactly one
  additional graft per elite.

## Frozen Carried Upgrade Runtime

- `hangover-hide`: the already-computed +2 max/current HP carries exactly into
  the Stage 2 Player; do not refill missing HP.
- `petty-grudge`: actual player damage grants a non-stacking, refreshable
  3000ms `+1` weapon-damage surge with visible HUD/trace state.
- `counterfeit-soles`: Rotten-only dash cooldown is 340ms instead of 520ms;
  each dash creates one readable 1-damage wake that can hit each enemy at most
  once per dash.
- `compound-interest`: successful weapon hits within 900ms build `+1` then `+2`
  bonus damage, capped at `+2`; the stack resets after 900ms without a hit.
- `red-tape-tourniquet`: heal 1 after each cleared combat wave, clamped to max,
  with a visible/traceable heal event.
- `spite-reserve`: active-skill cooldown is 65% of the base value, rounded to an
  integer; skill damage/range do not change.
- `dead-letter`: rapid and heavy melee emit one 120ms delayed echo for
  `max(1, ceil(baseDamage * 0.5))`; Tax Pike pierces one additional aligned
  target; Receipt Spitter projectiles pierce one additional target.
- `graft-dividend`: the existing one-graft later-market discount remains, and
  each defeated elite grants one additional graft.

Petty Grudge and Compound Interest may stack, but total bonus weapon damage is
bounded to their specified `+3`. Echoes, projectiles, wakes, and primary hits
must identify their source in trace/debug state and may not recursively spawn.

## Generic Stage 2 Market And Honest Stage 3 Boundary

- Stage 2 clear retains actual current/max HP, adds the route's displayed base
  graft plus elite bounty, and opens three deterministic eligible offers for the
  selected Stage 2 route.
- Keys `1-3` buy one offer, `4` heals up to 2 HP for 2 graft, and `5` banks.
  Invalid, unaffordable, full-HP, repeated, or late input remains a strict no-op
  except concise feedback.
- One accepted choice appends Stage 2 history, resolves decision count 2, clears
  market/combat objects, and advances to Stage 3 route choice.
- The Stage 3 docket shows the exact planned pair, carried HP/graft/loadout,
  both route histories and market choices, owned upgrades/build summary, and
  elite bounty trace. It accepts no Stage 3 route key and creates no encounter.
- For `GAUNTLET-ALPHA`, Stage 3 is
  `collection-parade|garnish-gallery` in that order.

## Presentation And Readability

- Stage 2 must look materially distinct from Stage 1 using existing
  repository-local art plus code-native tint, platform, sump, shield, hazard,
  armor-pip, and enrage treatments. No new raster asset is required.
- Combat truth remains brighter than scenery. New tells, shields, hazards,
  elite state, HP/graft/build status, and controls are readable at 1366x768 and
  1920x1080 without covering actors.
- Reused atlases preserve frame/body anchoring, feet/floor invariants, offscreen
  reacquisition, and one-canvas containment.

## Required Debug Truth

Extend the namespaced structured snapshot/scalars with the minimum truthful
Stage 2 evidence, including:

- current stage, selected route, current and total waves cleared;
- per-enemy role/state/HP/elite variant/armor/enrage/shield state;
- shield blocks/opens and cause;
- hazard telegraph/active/hit/clear counts;
- current combat-build statuses/counters for grudge, compound, dash wake,
  Dead Letter, wave heal, and elite bonus graft;
- total/current elite counts and defeated variants;
- two market decisions, two route-history entries, Stage 2 offers/prices, and
  exact Stage 3 route options;
- live combat object count, canvas count, and trace digest.

Do not publish opaque test-only claims without corresponding runtime state.

## Test-First And Acceptance Evidence

Before runtime implementation, add failing pure tests for Stage 2 encounter
specs, deterministic elite assignment, all eight build constants/effects,
generic Stage 2 market transition, two-entry history, and retry reset. Preserve
the expected red.

Acceptance requires:

1. Stage 1 unit/browser fixtures, `GAUNTLET-ALPHA` plan ID, first offer fixture,
   smoke isolation, and all 23 campaign routes remain exact.
2. Real keys choose both `GAUNTLET-ALPHA` Stage 2 routes after a real Stage 1
   decision. Each route spawns exactly its frozen waves and can be cleared.
3. Separate deterministic seeds prove Bile Registry and both elite variants.
4. Shield Auditor evidence proves frontal block plus successful flank, skill
   open, and dash-through open without fake health mutation.
5. Sump Scribe evidence proves windup, marked floor, active hazard, legitimate
   player damage, expiry, and Bribe Bomb clear.
6. Gilded evidence proves one armor absorption/break; Overdue evidence proves a
   once-only below-half enrage while retaining the base role tell.
7. Browser-visible mechanic proofs cover all eight carried upgrades. The three
   required build archetypes—Knife/Belch/Compound, Pike/Stamp/Hangover, and
   Spitter/Bomb/Dead Letter—each clear a real Stage 2 route with meaningful HP
   margin. Remaining upgrade effects may be grouped into focused cases.
8. Stage 2 purchase, honest damaged heal, bank, unaffordable/invalid/repeated
   no-op, Graft Dividend discount, elite bonus, and exact Stage 3 carry pass.
9. Death during Stage 2 plus real `R` returns to the same seed/plan loadout with
   stage, HP, graft, upgrades, history, markets, enemies, hazards, elites,
   build counters, and objects reset; one key produces one transition.
10. Reward, retry, and Stage 3 states have zero combat objects and one canvas.
11. A fresh blind critic directly operates shield, hazard, elite, upgrade, and
    Stage 2 market paths on a fresh production artifact at both desktop
    viewports and reports exact seed/route/build.
12. Full browser regression passes all 28 accepted routes plus every promoted
    LEAF-004 route, with no uncaught exception, guarded resource failure,
    missing-texture green, duplicate canvas, campaign drift, or stale object.

## Checks

- focused new pure tests, then full `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run smoke`
- focused existing `rottenIsolation`, `rottenContract`, `rottenEnemyCycle`,
  `rottenEncounter`, and `rottenMarket`
- focused Stage 2 topology/roles/elites/build/market/retry routes
- exactly one unfiltered `npm run smoke:browser` after focused gates are green
- visual inspection at 1366x768 and 1920x1080
- `git diff --check` and exact scope audit

## Retry Policy

- Preserve the first failure of every new deterministic gate.
- One fresh retry is allowed only for a demonstrated browser focus, transport,
  or server startup failure; save the discriminator and do not hide the first.
- A role, shield, hazard, elite, build, market, cleanup, state, or campaign
  assertion failure is deterministic until diagnosed.
- The final unfiltered matrix receives exactly one attempt.
- Do not tune base Stage 1 or campaign timing to make Stage 2 smoke pass.

## Non-Goals

- No Stage 3 combat, third reward transaction, Commissioner boss, results,
  local records, settings/accessibility implementation, audio completion, new
  raster asset, package install, public deployment, campaign refactor, or
  product/dev-story documentation.
- No plan-schema/version/`GAUNTLET-ALPHA` plan-ID change.
- No new weapon, skill, upgrade, enemy role, elite variant, route, stage, wave,
  or boss beyond the frozen contract.
- No campaign scene edit or campaign constructor call-site change.

## Stop Conditions

- Stage 2 requires a plan-ID/schema change or campaign semantic change.
- Shared Player/PlayerMotor/Health defaults cannot remain exactly compatible.
- Pure state cannot own generic market/history or scene code must duplicate
  Stage 1 orchestration.
- A new asset/package/public action or forbidden file is genuinely required.
- A deterministic accepted campaign, Stage 1, isolation, or market regression
  cannot be repaired within the authorized architecture.
- Product tuning cannot meet readability/clearability without a lead decision.

## First Concrete Action

Verify the exact clean accepted/control head, add failing
`tests/unit/rotten-run-stage-two.test.ts` coverage for the pure encounter,
elite, build, and market contracts, run it once to preserve the expected red,
then implement browser-independent specs before touching Phaser runtime.

## Return Schema

```json
{
  "leafId": "LEAF-004",
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
