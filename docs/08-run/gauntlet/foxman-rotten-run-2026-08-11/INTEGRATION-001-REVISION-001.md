# INTEGRATION-001-REVISION-001 - Explicit Rotten Smoke-Automation Opt-In

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded repair builder

Planner decisions: `RR-DEC-001..015`

Base head: `a4a3451dd174e3a6de532d75bee2014918e66e06`

Dependency: preserved INTEGRATION-001 `REVISE` receipt and raw finding `SMOKE-AUTO-ISOLATION`

Risk: medium integration/evidence-boundary repair; no gameplay redesign

## Outcome

A Rotten Run URL may contain a known `smoke=` scenario name without granting
automation authority. Every Rotten compatibility, encounter, market-heal,
poor-market, and reacquisition fixture remains inert unless
`smokeAutoEnabled()` is true; authorized harness URLs with `smokeAuto=1`
continue to provide the accepted deterministic evidence.

## Frozen Failure

On the accepted artifact, the independent reviewer opened
`?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter` with no `smokeAuto`,
used real keys only to choose Tax Pike, Seized Stamp, and Bailiffs' Ramp, then
sent no combat input. After about 2.9 seconds, state reported weapon
attacks/hits `1/1` and skill uses/hits `1/1`. `RottenRunScene.create()` arms its
fixtures from `smokeParam()` alone; campaign scenes already use the correct
`smokeAutoEnabled() ? smokeParam() : null` boundary.

Canonical evidence:
`evidence/integration-001/revise-01/critic-receipt.md` and
`independent-findings.json`.

## Authorized Scope

- Edit `src/game/scenes/RottenRunScene.ts` only to apply the existing explicit
  smoke-automation permission gate to every Rotten fixture.
- Extend `tests/smoke/check-browser-routes.mjs` additively with one focused
  negative isolation route and the minimum result telemetry needed to prove it.
- Write builder receipts/screenshots only under
  `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/integration-001-revision-001-builder/`.
- Run local tests, builds, managed loopback previews, and browser automation.

No other source, test, asset, package, ops, or Gauntlet-control file is
authorized. Stop and report if another file is genuinely required.

## Required Implementation

- Import and use the existing `smokeAutoEnabled()` helper in
  `RottenRunScene`; do not create another query parser or permission flag.
- Compute the effective Rotten smoke scenario only when automation is
  explicitly enabled, then derive compatibility, encounter, heal, poor-market,
  and reacquisition fixture booleans from that effective value.
- Preserve normal `mode=rotten&seed=...` loading and all player-driven input.
- Preserve the existing authorized `smokeAuto=1` fixture behavior and evidence
  data. Do not change combat automation, enemy timing, player timing, market
  rules, route planning, or presentation.
- Do not treat `smoke=` as sensitive or remove it from URLs; only separate the
  scenario name from authority to automate.

## Test-First Evidence

Before the product edit, add and run the focused negative browser route against
the accepted baseline. It must reproduce the frozen failure and be preserved as
the expected red. The route must:

- open `mode=rotten` with a deterministic seed and a known Rotten `smoke=` name
  while omitting `smokeAuto`;
- use real loadout/route keys;
- send no combat action keys after encounter entry;
- observe long enough to cover the accepted artifact's delayed automation;
- require weapon attack count and skill-use count to remain zero; and
- report phase/HP/counts/trace/canvas plus DOM key-event evidence so a manual
  no-input pass is distinguishable from a missed route selection.

After the repair, run that focused route once from a fresh page and preserve its
green evidence. Death from legitimate enemy behavior is allowed; self-issued
weapon or skill input is not.

## Acceptance Evidence

- The negative smoke-isolation route passes with zero weapon attacks and zero
  skill uses after real loadout/route selection and no combat input.
- Focused `rottenContract`, `rottenEnemyCycle`, `rottenEncounter`, and
  `rottenMarket` routes still pass with `smokeAuto=1`, proving compatibility,
  encounter, heal, poor-market, and reacquisition fixtures remain authorized.
- Unit tests remain `42/42`; typecheck, production build, dist smoke, and
  `git diff --check` pass.
- Exactly one unfiltered browser-matrix attempt passes all 23 accepted campaign
  routes plus the existing Rotten routes and the new isolation regression.
- No runtime exception, failed guarded resource, duplicate canvas, stale combat
  object, or campaign semantic change is introduced.
- Diff is exactly the scene guard and additive browser regression.

## Retry Policy

- One transient browser focus/transport/server retry is permitted only with the
  first failure and discriminator preserved.
- A nonzero attack or skill count on the negative route is deterministic and
  must not be retried to green.
- The unfiltered matrix receives exactly one attempt after focused gates pass.
- Do not tune product or combat timing to satisfy evidence.

## Non-Goals

- No Stage 2 combat, enemy, elite, upgrade-runtime, Stage 3, boss, results,
  records, settings, accessibility implementation, audio, asset, or product copy.
- No edits to PreloadScene, campaign scenes, Player, combat controller, enemies,
  pure Rotten state/market/plan modules, packages, project ops, or control docs.
- No commit, push, branch rewrite, public deployment, or deletion of accepted
  evidence.

## Stop Conditions

- The repair cannot be expressed with the existing smoke permission helper.
- A gameplay/runtime tuning change appears necessary.
- The negative route cannot distinguish no automation from failed real route
  selection.
- Any forbidden file or public/external authority is required.
- A deterministic focused or campaign regression appears.

## First Concrete Action

Verify clean `a4a3451`, add the focused negative smoke-isolation route, run it
once against the accepted baseline to preserve the expected red, then make the
single scene-guard edit.

## Return Schema

```json
{
  "taskId": "INTEGRATION-001-REVISION-001",
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
