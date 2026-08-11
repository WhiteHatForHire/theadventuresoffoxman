# LEAF-001 - Deterministic Plan And Separate Mode Shell

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Worker role: bounded builder

Planner decisions: `RR-DEC-001`, `RR-DEC-002`, `RR-DEC-003`, `RR-DEC-004`, `RR-DEC-005`, `RR-DEC-006`, `RR-DEC-007`, `RR-DEC-008`

Dependency: accepted launch commit `6d5b09170a9f9f483284e5c36bb0765cf10e9129`

Risk: medium

Verification tier: deterministic plus real-browser behavior

## Outcome

A player can enter a visibly separate Rotten Run shell from the title or a seeded URL, inspect a deterministic three-stage route plan, and select one of two Stage 1 routes without changing any accepted campaign route.

## Current Truth

- Campaign matrix is green on 23 real-browser routes at the dependency commit.
- No Rotten Run runtime code exists.
- Pure reusable systems include `Player`, `GuardEnemy`, accepted assets, and browser dataset conventions; this leaf does not yet add combat.
- The frozen contract is [`SEEDED_RUN_CONTRACT.md`](SEEDED_RUN_CONTRACT.md).

## Authorized Scope

- Add pure modules only under `src/game/rotten/` for seed normalization, scoped deterministic selection, typed route definitions, and plan construction.
- Add `src/game/scenes/RottenRunScene.ts` as a presentation shell using existing project-local assets.
- Minimally edit `src/game/GameConfig.ts`, `src/game/scenes/PreloadScene.ts`, and `src/game/scenes/TitleScene.ts` to register and reach the separate mode.
- Extend `src/vite-env.d.ts` only for the structured Rotten Run debug snapshot.
- Add focused unit coverage under `tests/unit/rotten-run-contract.test.ts`.
- Extend `tests/smoke/check-browser-routes.mjs` with one new real-key route and evidence capture.
- Write builder evidence only to `docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/builder-evidence/LEAF-001.md` if durable notes are useful.
- Run local commands and managed local browser/server processes.

## Decisions Already Made

- Campaign Enter and campaign smoke URLs keep their current semantics.
- Rotten Run direct entry is `/?mode=rotten&seed=<token>`; the dedicated smoke path may add `smokeAuto=1&smoke=rottenContract`.
- Title visibly presents Campaign and Rotten Run; `Enter` starts Campaign and `R` starts Rotten Run with a newly frozen visible seed.
- A plan contains exactly three stages, two distinct route options per stage, and fixed final boss `commissioner-of-consequences`.
- Stage pools and route copy come exactly from the frozen contract.
- `window.__FOXMAN_ROTTEN__` and `data-rotten-*` fields are new namespaced state; do not repurpose campaign fields.

## Non-Goals

- No player, combat, enemy, reward purchase, economy transition, persistence, audio, pause, boss, or results implementation.
- No edits to `RunScene.ts`, `SecondRunScene.ts`, `MiniBossScene.ts`, `SumpWarrensScene.ts`, campaign data/stats, assets, ops docs, Gauntlet control files, package dependencies, Git history, or remote state.
- No framework extraction or speculative generic scene engine.

## Acceptance Evidence

- Same normalized seed and schema produce deep-equal plans and a stable fixture `planId`.
- Different fixture seeds produce at least one different route pair or ordering.
- Every plan has three stages, two distinct valid stage routes, fixed boss, and no duplicate route within a stage pair.
- Seed normalization handles whitespace, punctuation, empty input, and length safely.
- A real browser at `/?mode=rotten&seed=GAUNTLET-ALPHA` shows the mode mark, normalized seed, plan ID, all three stage headings, and two Stage 1 route cards.
- A real `2` key changes the namespaced phase/selection state and visible selected-route summary.
- Browser route records zero console/network errors and saves a 1366x768 screenshot.
- Campaign `Enter` still starts `RunScene`; all previous browser results remain green.

## Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run smoke:browser`
- `git diff --check`

## Stop Conditions

- Any accepted campaign route requires a semantic change rather than a minimal additive hook.
- A planner decision beyond this contract is required.
- A forbidden file must change.
- A dependency, credential, public action, new asset, or package install is required.
- Determinism depends on runtime time or ambient randomness after the seed token is frozen.

## First Concrete Action

Verify clean `main` at the dependency commit, read the frozen contract and affected entry files, then write the pure seed/plan tests before the scene shell.

## Return Schema

```json
{
  "leafId": "LEAF-001",
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
