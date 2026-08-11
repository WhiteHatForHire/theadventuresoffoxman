# LEAF-002 - Loadout And Playable Stage 1 Combat

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded builder

Planner decisions: `RR-DEC-001..010`

Base head: `fa94e97`

Dependency: promoted `LEAF-001` deterministic plan and separate mode shell

Risk: high

Verification tier: deterministic, behavioral, and real-browser product review

## Outcome

A player can choose any of four materially distinct weapons and three distinct active skills, choose either offered Stage 1 route, clear that route's two fair combat waves against its seeded enemy roles, and arrive at a deterministic reward-choice surface without affecting the campaign.

## Current Truth

- Normal Rotten Run and the compatibility contract shell are separate from campaign scenes.
- `GAUNTLET-ALPHA` resolves to plan `RR1-1C93B57F`.
- Promoted evidence proves title R, direct seed entry, route keys 1/2, both desktop viewports, and all 24 current browser routes.
- Existing `Player`, `InputMapper`, project-local atlases, hit feedback, and painted platforms may be reused without modifying their campaign behavior.

## Authorized Scope

- Add or edit pure and runtime modules only under `src/game/rotten/`.
- Edit `src/game/scenes/RottenRunScene.ts` as the flow orchestrator.
- Edit `src/vite-env.d.ts` for truthful namespaced state only.
- Add or edit focused Rotten Run unit tests.
- Extend `tests/smoke/check-browser-routes.mjs` additively.
- Write optional builder evidence only under the LEAF-002 builder-evidence path.
- Run managed local servers, Chrome, tests, builds, and screenshots.

## Required Architecture

- Pure registries own loadout, enemy-role, Stage 1 wave, and upgrade-offer data.
- A Rotten Run runtime enemy module owns role behavior and tells; do not modify `GuardEnemy`.
- A bounded combat/controller module owns attacks, projectiles, skills, wave completion, and cleanup.
- `RottenRunScene` owns phase transitions and presentation composition, not every combat calculation.
- Reuse accepted assets by import; do not copy or regenerate them.
- No campaign scene or campaign persistence depends on Rotten Run modules.

## Fixed Input And Flow

Normal entry:

```text
loadout -> route-choice -> encounter wave 1 -> encounter wave 2 -> reward-choice
```

- Loadout keys: `1-4` choose weapon, `5-7` choose skill, `Enter` confirms only when both exist.
- Route keys remain `1-2`.
- Combat remains `A/D` or arrows, jump, `Shift/L` dash, `J` weapon, `K` skill.
- If Foxman dies, enter explicit `dead` state; `R` retries the same seed from loadout with a clean run-local reset. Full results and records remain later scope.
- `smoke=rottenContract` preserves LEAF-001 route-choice fixture behavior and plan ID.
- New `smoke=rottenEncounter` begins at loadout and may automate movement/combat only after the browser sends real loadout and route keys.

## Four Weapon Mechanics

- `rusty-knife`: fastest cadence, shortest reach, single-target pressure, visible rapid-hit cadence.
- `butcher-saber`: slow commitment, highest base damage, broad cleave that can hit multiple aligned enemies.
- `tax-pike`: medium cadence, longest melee reach, strongest knockback and spacing control.
- `receipt-spitter`: visible ranged projectile; four quick shots build heat, then an announced recovery lock before firing resumes.

All four use the production J input and publish attack count, hit count, style, cooldown/heat state, and current weapon.

## Three Skill Mechanics

- `spite-belch`: forward cone damage and strong knockback.
- `seized-stamp`: radial low damage plus a visible interrupt/stun.
- `bribe-bomb`: delayed visible area burst placed forward of Foxman.

All three use production K input, have distinct cooldowns and geometry, remain player-aimable through facing, and publish use/hit/readiness state.

## Stage 1 Role And Wave Contract

- `bailiff`: uses Drunken Guard art; readable approach, windup, active swing, and recovery.
- `clerk`: uses Tax Clerk art; preserves range, shows a firing tell, then launches a visible receipt projectile.
- `writ-runner`: uses tinted Drunken Guard art; shows a lane tell, commits to a charge, then has a vulnerable recovery.

Route waves:

- `bailiffs-ramp`: wave 1 = two bailiffs; wave 2 = one bailiff plus one writ-runner.
- `bribe-line`: wave 1 = one bailiff plus one clerk; wave 2 = two clerks plus one bailiff.
- `unfiled-alley`: wave 1 = one writ-runner; wave 2 = one writ-runner plus one clerk.

Enemies damage Foxman only during readable active attack/projectile/charge windows. Offscreen enemies do not attack. Wave 2 begins only after wave 1 is defeated and a visible short inter-wave beat completes.

## Reward-Choice Boundary

On Stage 1 clear:

- award the selected route's displayed graft;
- enter `reward-choice`;
- render three deterministic upgrade offers from the fixed eight-upgrade registry with title, effect, cost, and affordability;
- render the 2-graft heal/bank alternatives;
- publish offer IDs and trace state.

Purchasing, healing, banking, Stage 2 transition, and upgrade effects are LEAF-003 non-goals. The surface must read as a completed stage reward docket, not implementation commentary.

## Non-Goals

- No Stage 2/3 combat, shield auditor, sump scribe, elites, boss, reward purchase/effects, records, complete results, settings, pause redesign, new audio system, new assets, product page, campaign refactor, package install, commit, push, or control-file edit.
- Do not edit `RunScene.ts`, `SecondRunScene.ts`, `MiniBossScene.ts`, `SumpWarrensScene.ts`, `GuardEnemy.ts`, `Player.ts`, `InputMapper.ts`, campaign stats/data, assets, ops docs, or Gauntlet control files.

## Acceptance Evidence

- Pure tests lock exact counts: 4 weapons, 3 skills, 8 upgrades, 3 Stage 1 routes, required two-wave compositions, valid offer costs, and deterministic offer fixtures.
- Normal title R reaches `loadout`; compatibility `rottenContract` remains stable.
- A real-key `3`, `6`, `Enter`, `2` path selects Tax Pike + Seized Stamp + Bailiffs' Ramp, clears both waves through real combat systems, awards 4 graft on top of the starting 3, and reaches `reward-choice`.
- Browser state proves two waves, expected role spawns, real weapon and skill hits, zero living enemies, route graft, three deterministic offers, and a changed trace digest.
- Focused browser evidence captures loadout, active combat with readable enemy tell, and reward-choice at 1366x768.
- Manual critic can operate at least two contrasting builds, including Receipt Spitter + Bribe Bomb, without an autorun-only dependency.
- Existing LEAF-001 contract route and all 23 campaign routes remain green; broad matrix becomes at least 25 routes.
- Zero uncaught browser errors, failed network responses, missing-texture green, or stale combat objects after same-seed retry.
- No P0/P1 defect; no attack without a readable tell; no accepted campaign semantic change.

## Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- focused `FOXMAN_SMOKE_ONLY=rottenEncounter npm run smoke:browser`
- `npm run smoke:browser`
- `git diff --check`

## Budget And Retry Policy

- One bounded leaf; no content beyond the fixed Stage 1 contract.
- Retry one transient server/Chrome focus failure with fresh evidence.
- Diagnose and repair deterministic, gameplay, or cleanup failure; do not retry it as transient.

## Stop Conditions

- A forbidden shared file must change.
- The scene cannot stay an orchestrator without a new planner decision.
- Existing campaign behavior must change to make the mode work.
- A role, weapon, or skill requires a new asset or package.
- The worker cannot produce readable manual combat without expanding into later stages.
- A product, authority, privacy, licensing, or public-action decision is missing.

## First Concrete Action

Verify clean `main` at `fa94e97`, write failing pure registry/wave/offer tests, then implement the minimum runtime modules before integrating the scene.

## Return Schema

```json
{
  "leafId": "LEAF-002",
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
