# INTEGRATION-001 - Promoted LEAF-001 Through LEAF-003

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Reviewer role: fresh-context, read-only integration reviewer

Accepted product head: `23e309e6dce71f039c4eab2508816a584bd53354`

Dependencies: promoted `LEAF-001`, `LEAF-002`, and `LEAF-003`

Risk: high

## Outcome

Decide whether the connected Rotten Run shell, Stage 1 combat, reward
transaction, and honest Stage 2 handoff form one coherent, regression-safe
product baseline that is ready for a bounded Stage 2 combat leaf.

## Current Truth

- Campaign remains the accepted Enter path and contributes 23 browser routes.
- Rotten Run is a separate R/direct mode with deterministic seeded planning.
- Four weapons, three skills, three enemy roles, two Stage 1 waves, death,
  same-seed retry, reward purchase/heal/bank, and the Stage 2 docket are accepted.
- `GAUNTLET-ALPHA` maps to plan `RR1-1C93B57F`, Stage 1 routes
  `unfiled-alley|bailiffs-ramp`, offers
  `dead-letter|petty-grudge|spite-reserve`, and Stage 2 routes
  `seized-goods-lift|late-fee-chapel`.
- The accepted deterministic suite has 42 unit tests and the browser matrix has
  27 top-level results: 23 campaign plus four Rotten routes.
- Stage 2 selection/combat, later roles/elites, Stage 3, boss, results, settings,
  records, and three-build completion proof do not exist yet. Their absence is
  an honest boundary, not an integration failure.

## Review Authority

- Read the repository, accepted history, canonical run docs, source, tests, and
  project-local evidence.
- Build a fresh artifact outside the repository and serve it locally.
- Operate the real in-app Browser at 1366x768 and 1920x1080.
- Run deterministic, build, focused, full-browser, performance, and read-only
  diagnostic checks.
- Write evidence only in the assigned external review directory.
- Return `PASS` or `REVISE` with one ranked largest gap.

## Prohibited Actions

- Do not edit repository files, commit, push, deploy, install or upgrade
  packages, alter public/external state, or mutate canonical control docs.
- Do not redefine the product promise, expand scope, or begin LEAF-004.
- Do not treat missing future-stage content as a defect.
- Do not read builder rationale before independent artifact/source inspection.

## Integration Questions

### Product And Controls

- Do Campaign Enter and Rotten Run R/direct entry remain distinct and truthful?
- Can one coherent player journey select a build, inspect routes, clear both
  Stage 1 waves, understand enemy tells, survive or retry, make exactly one
  reward decision, and understand the Stage 2 stopping boundary?
- Are controls, feedback, affordability, HP, graft, route, seed, and carried
  build readable at both target viewports without misleading affordances?

### State And Architecture

- Do pure plan, loadout, market, build, route-history, trace, and retry rules
  remain authoritative outside Phaser presentation?
- Are scene-local mirrors synchronized at every transition, including death,
  retry, reward rejection, accepted choice, repeat input, and reload?
- Do controller, enemy, platform, feedback, and scene presentation ownership
  clean up to zero without stale objects, duplicate listeners, or canvases?
- Is the current separation maintainable enough for Stage 2 to reuse rather
  than duplicate Stage 1 rules?

### Regression, Performance, And Accessibility

- Does the first full accepted 27-route matrix pass without retry?
- Do 42/42 units, typecheck, production build, and dist smoke pass?
- Are bundle/runtime behavior, frame cadence, resource loading, and console
  state acceptable for the intended desktop browser slice?
- Are keyboard instructions, tells, color contrast, text sizing, and focus
  behavior sufficient for the current promise? Record future polish separately
  from gate-blocking defects.

### Provenance And Product Truth

- Do accepted commits, project-local receipts, route counts, screenshots, and
  hashes agree with the real artifact?
- Does the Stage 2 docket avoid claiming selection or combat is playable?
- Is any smoke-only fixture leaking into normal player behavior or evidence?

## Required Behavioral Paths

- Campaign: real Enter from title and one representative accepted gameplay path.
- Rotten purchase: `GAUNTLET-ALPHA`, real loadout/route keys, Stage 1 clear,
  reward open, key `1`, Dead Letter, graft `7 -> 0`, exact Stage 2 pair.
- Contrasting economy: honest damaged heal or bank on a fresh run.
- Failure/reset: explicit death then same-seed `R` retry with empty market,
  build, history, HP, combat objects, and one canvas.
- No-op: invalid or unaffordable reward input plus repeated Stage 2 key.

## Required Checks

- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run smoke`
- focused dash, contract, enemy-cycle, encounter, and market browser routes
- exactly one unfiltered `npm run smoke:browser`
- `git diff --check`
- source-boundary and evidence-provenance audit
- real in-app Browser review at both target viewports

## Acceptance

Return `PASS` only when:

- no serious cross-leaf product, architecture, state, cleanup, control,
  performance, accessibility, regression, provenance, or honesty gap remains;
- the exact accepted artifact passes the full matrix on its first attempt; and
- the baseline is suitable for a separately bounded Stage 2 implementation.

Return `REVISE` for one evidence-backed largest gap and prescribe the narrowest
repair. Do not include a feature wishlist in the gate verdict.

## Evidence And Return Schema

Write a self-contained `INTEGRATION_REVIEW_RECEIPT.md` plus compact JSON and
screenshots in the assigned external directory. The receipt must end with
exactly `PASS` or `REVISE` and include:

- accepted head and artifact hashes;
- exact commands, attempt counts, and results;
- direct browser paths and viewport measurements;
- architecture/state/cleanup findings;
- performance/accessibility/provenance findings;
- preserved first failures and residuals;
- one verdict and, for `REVISE`, one ranked repair.

## Next Route

- `PASS`: lead promotes the integration receipt, then frames `LEAF-004` Stage 2
  combat from the accepted baseline.
- `REVISE`: lead frames one bounded repair and sends the repaired baseline to a
  fresh integration reviewer.
