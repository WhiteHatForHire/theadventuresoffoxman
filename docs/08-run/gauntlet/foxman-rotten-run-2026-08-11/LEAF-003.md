# LEAF-003 - Deterministic Reward Market And Stage 2 Docket

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded builder

Planner decisions: `RR-DEC-001..013`

Base head: `0c29d6aa51658e774924efe3714788a9371d76d0`

Dependency: promoted LEAF-002 loadout and real Stage 1 two-wave combat

Risk: high

Verification tier: pure transactions, behavioral browser flow, and fresh real-browser product review

## Outcome

After clearing Stage 1, a player can make exactly one deterministic reward choice—buy one offered upgrade, buy the 2-graft heal, or bank—and arrive at the seed-planned Stage 2 route docket with truthful carried graft, HP, loadout, route history, upgrade ownership, and trace state.

## Current Truth

- Accepted product head `0c29d6a` is clean and matches `origin/main`.
- Stage 1 has four weapons, three skills, two fair waves, three enemy roles, explicit death, same-seed retry, and a visual-only reward docket.
- `GAUNTLET-ALPHA` / Bailiffs' Ramp reaches 7 graft and offers `dead-letter|petty-grudge|spite-reserve`; its Stage 2 pair is `seized-goods-lift|late-fee-chapel`.
- The scene currently hard-codes stage `1`, publishes no owned upgrades or route history, and does not accept reward input.
- The final LEAF-002 critic passed direct play at both desktop viewports and the first full `26/26` matrix, while preserving two non-reproduced focused-harness timing failures as the largest residual gap.

## Authorized Scope

- Add or edit browser-independent economy, build, offer, or state modules under `src/game/rotten/`.
- Edit `src/game/rotten/upgrades.ts` while preserving the fixed eight-upgrade registry and accepted Stage 1 offer fixture.
- Edit `src/game/rotten/state.ts` for truthful stage, build, market, route-history, HP, and decision types.
- Edit `src/game/scenes/RottenRunScene.ts` as the reward/phase presentation orchestrator.
- Edit `src/vite-env.d.ts` only for truthful namespaced Rotten snapshot fields if required.
- Add focused Rotten Run unit tests and extend `tests/smoke/check-browser-routes.mjs` additively.
- Write optional builder evidence only under the assigned LEAF-003 external evidence directory.
- Run local builds, tests, managed loopback previews, browser automation, and screenshots.

## Required Architecture

- A pure reducer/function validates and applies reward choices; Phaser does not own price, eligibility, affordability, HP, graft, or upgrade-transition rules.
- Reward state records current/max HP, graft, owned unique upgrades, route history, market stage/route, offers with effective prices, accepted choice, and trace event.
- Offer generation remains deterministic, excludes owned unique upgrades, preserves the accepted `GAUNTLET-ALPHA` Stage 1 offer fixture, and applies the fixed Graft Dividend one-graft market discount when already owned.
- A pure build summary represents all eight frozen upgrade effects for later runtime consumers. LEAF-003 must apply only immediate market/HP effects; it must not counterfeit post-upgrade combat proof before Stage 2 combat exists.
- `RottenRunScene` renders inputs and transitions, retains the final Stage 1 HP snapshot after controller teardown, and advances to the plan's real Stage 2 route pair only after one accepted transaction.
- Existing Stage 1 combat/controller/enemy ownership remains unchanged unless a stable regression proves an actual defect and the lead explicitly revises scope.

## Fixed Reward Inputs And Rules

- `1`, `2`, or `3`: buy that displayed upgrade at its displayed effective price.
- `4`: spend 2 graft to heal up to 2 HP; disabled when unaffordable or already at maximum HP.
- `5`: bank the purse unchanged.
- Exactly one accepted choice is recorded per market and advances to Stage 2 route choice.
- Unaffordable, disabled, repeated, or invalid input leaves HP, graft, upgrades, route history, stage, and trace unchanged and shows concise in-world feedback.
- Upgrade ownership is unique until an explicit rank contract exists; do not invent ranks.
- `hangover-hide` immediately adds 2 maximum HP and heals 2. `graft-dividend` discounts later markets, not the purchase that grants it. Other upgrades are carried truthfully for later combat integration.

## Honest Stage 2 Boundary

- The accepted choice clears the Stage 1 market and sets current stage to `2`.
- Render `STAGE 2 — SUMP DOCKET`, the plan's exact two route cards, dominant encounter summary, elite risk, graft reward, and market bias.
- Show the carried weapon, skill, HP/max HP, purse, owned upgrades, and Stage 1 route/market choice.
- For `GAUNTLET-ALPHA`, the visible route IDs must be `seized-goods-lift|late-fee-chapel` in that order.
- Stage 2 route selection/combat, shield auditor, sump scribe, elites, and the second reward market are LEAF-004 work. Do not display implementation notes or claim those encounters are playable.

## Harness Stability Requirement

- Harden focused encounter observation so reset fields must remain correct across two animation frames before capture.
- Latch the first valid enemy tell instead of depending on one later transient snapshot.
- Do not alter production timing to make smoke pass unless the stabilized harness or real browser reproduces a gameplay defect.
- After the change, run the focused LEAF-002 encounter route ten consecutive times without a reset/tell observation failure and preserve a compact receipt.

## Non-Goals

- No Stage 2 or Stage 3 combat, new enemy role, elite, boss, post-upgrade combat proof, final results, records, settings, audio overhaul, new asset, package install, public deployment, campaign refactor, or control-file edit.
- Do not edit `Player.ts`, `PlayerMotor.ts`, `Health.ts`, `RottenCombatController.ts`, `RottenEnemy.ts`, `GuardEnemy.ts`, campaign scenes, campaign persistence, assets, project ops docs, or Gauntlet control files.
- Do not change weapon, skill, enemy, damage, cooldown, route, or Stage 1 reward tuning.
- Do not add a fake Stage 2 encounter, debug-only player-facing copy, or a second reward transaction.

## Acceptance Evidence

- Pure tests cover deterministic offers, uniqueness, affordability, Graft Dividend discount timing, purchase, disabled/unaffordable no-op, heal clamp, full-HP heal rejection, bank, Hangover Hide immediate state, one-choice limit, route/choice trace, retry reset, and Stage 2 transition state.
- Normal `GAUNTLET-ALPHA` real keys still reach Stage 1 reward with the accepted plan and offers.
- A focused browser route sends real reward key `1` after real loadout/route input plus actual Stage 1 combat automation; state proves Dead Letter owned, 0 graft, Stage 2, the exact Stage 2 pair, carried HP/loadout/history, changed trace, and one canvas.
- Separate focused real-key evidence proves a damaged Foxman can buy heal with key `4`, and bank key `5` preserves graft; invalid/unaffordable input visibly stays at reward with byte-equivalent run state except feedback telemetry.
- Same-seed death/R retry clears market choice, upgrades, route history, graft, HP modifiers, stage, and offer state back to the accepted loadout baseline.
- A fresh blind critic directly operates purchase and at least one contrasting heal/bank path on a newly built artifact at 1366×768 and 1920×1080.
- Project-local evidence captures reward before choice, accepted purchase feedback, Stage 2 carried-build docket, heal/bank truth, and the stabilized LEAF-002 encounter route.
- Full browser regression remains green for all 23 campaign routes and every accepted Rotten route; no uncaught error, guarded failed resource, duplicate canvas, missing-texture green, or stale combat object.

## Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- focused market browser route
- focused contract, encounter, and enemy-cycle browser routes
- ten consecutive focused encounter passes after harness stabilization
- full `npm run smoke:browser`
- `git diff --check`

## Budget And Retry Policy

- One bounded leaf; the honest boundary is Stage 2 route choice, not Stage 2 combat.
- Retry one transient server/Browser focus failure with fresh evidence.
- Diagnose any deterministic economy/state failure; do not retry it as transient.
- A focused reset/tell failure after stabilization is a real harness gate until discriminated, not a reason to alter product timing automatically.

## Stop Conditions

- A shared Player, combat controller, enemy, campaign, asset, package, or control file must change.
- Pure transaction state cannot remain the sole owner of market rules.
- The accepted Stage 1 offer fixture, combat behavior, or campaign matrix would need semantic change.
- Stage 2 route cards cannot be rendered truthfully without pretending its combat exists.
- A product, authority, privacy, licensing, or public-action decision is missing.

## First Concrete Action

Verify clean `main` at `0c29d6a`, add failing pure reward transaction tests, then implement the smallest browser-independent market state before wiring any scene input.

## Return Schema

```json
{
  "leafId": "LEAF-003",
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
