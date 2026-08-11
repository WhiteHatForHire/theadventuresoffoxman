# INTEGRATION-001 Recovery Review Receipt

Run: `foxman-rotten-run-gauntlet-2026-08-11`

Gate: three-leaf integration review after promoted LEAF-001 through LEAF-003

Reviewer mode: fresh-context, read-only, independent artifact and real-browser review

Recovery note: the reviewer completed and froze all independent findings in
`INDEPENDENT_FINDINGS.json`, then stopped making observable progress while
formatting the final receipt. The visible lead interrupted only that stalled
reviewer after two closeout requests and reconstructed this receipt from the
reviewer's immutable raw evidence. No product or repository file was changed by
the reviewer or during recovery.

## Candidate identity

- Control HEAD and `origin/main`: `a4a3451dd174e3a6de532d75bee2014918e66e06`
- Accepted product commit: `23e309e6dce71f039c4eab2508816a584bd53354`
- Accepted product tree: `803bd1f12ce6acc4372963811216ec2bfa44bcde`
- Control tree: `7543e4df77952750cecf420b6d0439fd473b79ae`
- Runtime diff from accepted product to control: empty
- Independent findings SHA-256: `888c1c4756895c43f03fa7a5501e8737cb487d9e47b83e4453de7fe773b03a95`
- Prior leaf receipts or builder rationale consulted before verdict: no

## Independent artifact and deterministic gates

The reviewer exported and built the accepted product outside the repository.
The fresh dist was byte-identical to repository dist with aggregate SHA-256
`2b31a5926bb0c81ee481d702ebd44d63bfc796bfb16516da7a454d9f8dec24f0`.

- Unit tests: PASS, first attempt, 42/42 across four files
- Typecheck: PASS, first attempt
- Production build: PASS, first attempt, 52 Vite modules
- Dist smoke: PASS, first attempt
- Focused dash, Rotten contract, enemy cycle, encounter, and market: PASS
- Unfiltered browser matrix: PASS, exactly one attempt, 27/27 top-level results
- Full-matrix JSON SHA-256: `827b72a8a3365360810bda4993f9ef4e3a1404c2700bfd03a0557385812598b4`

## Connected real-browser evidence

The reviewer operated the independent production artifact in the in-app
Browser at 1366x768 and 1920x1080. It passed Campaign Enter and representative
campaign actions; Rotten loadout, deterministic route selection, Stage-1 combat
and readable tells; explicit death and clean same-seed retry; reward open,
upgrade purchase, bank, invalid and repeated no-ops; exact carried Stage-2
docket; one canvas; and zero combat objects after reward, retry, and Stage-2
handoff. No runtime warnings or errors were recorded.

## Blocking integration finding: SMOKE-AUTO-ISOLATION

Severity: P1

Reproduction URL:
`http://127.0.0.1:4177/?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter`

`smokeAuto` was deliberately absent. On the sole reproduction, the reviewer
pressed only `3`, `6`, `Enter`, and `2` to choose the loadout and route, then
sent no combat input. Roughly 2.9 seconds later the artifact had self-fired:

- phase: `encounter`
- weapon attacks/hits: `1/1`
- skill uses/hits: `1/1`
- living enemies: `1`
- HP: `6/6`

Failure screenshot SHA-256:
`5ef5db16c5820355784afb852b61d017ac3674efc0486f4213e40e10d87b38bc`

Source inspection explains the behavior: `RottenRunScene.ts` reads
`smokeParam()` directly and arms encounter, market, heal, poor-market, and
reacquisition fixtures from it. Campaign scenes instead gate the same parameter
behind `smokeAutoEnabled()`. Therefore a normal direct Rotten URL containing a
known smoke name can silently automate combat or mutate market/reacquisition
state without the explicit automation opt-in. That makes manual-play and smoke
evidence boundaries untrustworthy.

## Ranked repair

Gate every Rotten compatibility, encounter, heal, poor-market, and
reacquisition fixture behind `smokeAutoEnabled()` while preserving ordinary
mode/seed loading. Add focused real-browser regression proving:

1. a known `smoke=` route without `smokeAuto=1` stays manual and leaves
   attacks, skill uses, market fixture state, and reacquisition fixture state
   untouched; and
2. the same authorized routes with `smokeAuto=1` still drive the accepted
   focused gates.

Then run cheap deterministic checks, the relevant focused Rotten gates, one
unfiltered matrix, and one fresh-context read-only re-review. Do not begin
LEAF-004 until that integration re-review passes.

## Non-blocking observations

- The pure seed/plan/routing/build/market boundary and immutable market reducer
  are structurally sound.
- Combat ownership and cleanup were truthful in observed reward/retry/Stage-2
  states.
- `RottenRunScene` is now large and mirrors orchestration fields; Stage-2 should
  extract reusable stage orchestration rather than clone Stage-1 logic.
- Keyboard-handler shutdown ownership should be made explicit when lifecycle
  work next touches the scene.
- The canvas-only UI has no focusable/ARIA semantics; this remains a later
  accessibility/settings completion concern, not the ranked integration repair.
- The hidden 280ms market-entry lock can swallow an exceptionally fast first
  choice without feedback; preserve as a residual unless real play elevates it.

## Cleanup and stop state

- Reviewer-owned preview on port 4177 is stopped.
- Repository remains clean and synchronized at the frozen control commit.
- Reviewer was interrupted only after evidence freeze and repeated closeout
  non-progress; no validation or product process remained active.
- Browser cleanup could not be independently confirmed after interruption and
  must be normalized before the next browser critic.

REVISE
