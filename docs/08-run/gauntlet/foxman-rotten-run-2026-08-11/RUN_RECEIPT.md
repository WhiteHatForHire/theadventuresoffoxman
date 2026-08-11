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
