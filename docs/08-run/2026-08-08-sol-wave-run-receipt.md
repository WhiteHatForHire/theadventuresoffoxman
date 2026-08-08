# SOL Wave 22 — Foxman Act 2 Closure Receipt

Run ID: `2026-08-08-sol-wave-22-foxman-act2-closure`
Latest authority: `22-FOXMAN-ACT2-CLOSURE.md` plus `COMMON-EXECUTION-CONTRACT.md`
Decision owner: Marcus Vale
Freeze: `2026-08-08 11:29 WITA`

## Truth Audit

- Repository: `repos/theadventuresoffoxman`
- Baseline branch: `main`
- Baseline HEAD: `f1d141e1888ff286ade99f19c5104a491735e213`
- Baseline status: clean; no pre-existing changes to include or preserve.
- Accepted baseline: V1 browser smoke matrix and the existing Act 1 boss-clear-to-Act-2 handoff.
- Initial reality-gate risk: medium, because automated state can prove mechanics but Marcus still owns experiential acceptance.

## Phase Checklist

- [x] Audit repo truth and run every existing smoke route before editing.
- [x] Add Sump death, explicit restart, and complete actor/UI/input reset.
- [x] Add deterministic `sumpDeath` browser evidence.
- [x] Add readable dash trail and audio cue without changing movement mechanics.
- [x] Exercise desktop and 390px browser surfaces and capture evidence.
- [x] Run broad validation and classify blockers versus polish.
- [x] Confirm no preview/runtime remains and prepare the green local checkpoint.

## Baseline Evidence

- `npm run smoke:all` passed before the first implementation edit.
- Browser matrix passed manual opening, platforming, dash, Sump, combat/reward, second path, boss handoff, and existing death/restart routes.
- The browser smoke-owned Vite and Chrome processes exited cleanly.

## Token and Runtime Ledger

| Local time (WITA) | Phase | Model | Reasoning effort | Exact usage |
| --- | --- | --- | --- | --- |
| 10:43 | Lane start / truth audit | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |
| 10:47 | Baseline smoke matrix green | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |
| 10:56 | Sump death/restart and stale-VFX repair green on narrow route; before broad validation | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |
| 11:01 | Full 23-route browser matrix green | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |
| 11:04 | Final build/tests green; shipping update and closeout | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |
| 11:06 | Final diff/runtime audit and local-checkpoint preparation | Sol Max (directive allocation; exact runtime identifier not exposed) | Max (directive allocation) | exact token count not exposed by this thread runtime |

Run start: `2026-08-08 10:43 WITA`; run end: `2026-08-08 11:06 WITA`; elapsed: approximately 23 minutes by local wall clock. The runtime exposed no trustworthy exact token count at any checkpoint.

## Decisions

- Preserve the Phaser/Vite/TypeScript stack and accepted V1 routes.
- Keep dash mechanics in `PlayerMotor` unchanged; feedback belongs in the player presentation/audio layer.
- Use the existing explicit restart pattern and `ProgressStore` death authority for Sump Warrens.
- Treat the audio-bus cue as the authorized closure scope; a licensed audible dash asset is optional polish.
- Keep 390px proof scoped to viewport containment and existing keyboard/start behavior; do not claim touch support.

## Verified Complete Work

- `SumpWarrensScene` now records a single persistent death, shows an explicit R/Enter restart gate, and restores Foxman, all three enemies and their full health, local kills, combat timers, dash/motor state, active hit VFX, completion/exit state, camera, objective, and UI.
- `/?smokeAuto=1&smoke=sumpDeath` uses the real player-damage/death path and proves both dead and restored states.
- Isolated evidence proves keyboard R; the full matrix uses the existing deterministic restart-hook convention to avoid long-matrix Chrome target-focus flakiness.
- Dash presentation adds three short translucent afterimages and a `dash` audio-bus cue. `PlayerMotor` and movement tuning were not changed.
- The existing Act 1 boss-clear-to-Act-2 handoff and all accepted V1 routes remain green.
- Shared hit feedback now removes live spark/text objects on reset; this repair came from visual inspection of the first restart screenshot.

## Evidence

- Full runtime results: `docs/08-run/evidence/browser-smoke-results.json`
- Isolated keyboard-R results: `docs/08-run/evidence/browser-smoke-sumpDeath-results.json`
- Dash: `docs/08-run/evidence/dash-feedback.png`
- Sump death: `docs/08-run/evidence/sump-death.png`
- Clean restart: `docs/08-run/evidence/sump-restart.png`
- Sump completion: `docs/08-run/evidence/sump-complete.png`
- 390×844 opening: `docs/08-run/evidence/mobile-390-opening.png`

## Checks

| Check | Result |
| --- | --- |
| Pre-edit `npm run smoke:all` | Pass; accepted baseline green before edits |
| `npm test` | Pass; 23/23 tests |
| `npm run build` | Pass; TypeScript and Vite production build |
| `npm run smoke` | Pass; built asset references valid |
| Isolated `sumpDeath` with keyboard R | Pass |
| Full Chrome DevTools matrix | Pass; 23 routes, including manual opening, platforming, combat, second path, Sump, death/restart, boss, and 390px viewport |
| `git diff --check` | Pass before closeout |

## Reality Gate

Surface: local Phaser desktop-web campaign prototype
Audience: Marcus as decision owner and player
Risk: medium
Intended outcome: survive Act 1-to-Act-2 flow, die and restart cleanly, continue without stale state, and read dash feedback.

| Layer | Status | Evidence | Finding |
| --- | --- | --- | --- |
| Truth and scope | Pass | Baseline and this receipt | Existing V1 preserved; no new act, packaging, deployment, or asset-license claim |
| Deterministic | Pass | Tests/build/full JSON results | New and existing routes green |
| Behavioral | Pass | `sumpDeath`, boss handoff, and 390px result objects | Death persists once; restart restores all asserted actors/state; viewport contained |
| Product reality | Technical pass | Five screenshots | Death/restart/completion are coherent; dash trail is visible and restrained |
| Consequential boundary | Pass | Git/runtime checks | Local only; no push, deploy, public claim, or background service |
| Human acceptance | Pending | Marcus | Direct play/feel review has not occurred |

## Decision

`accept_with_conditions`

No deterministic Act 2 closure blocker remains. Release blockers are (1) Marcus's direct play/feel acceptance and (2) Marcus accepting portrait-scale readability before any mobile-readability claim. Optional polish/new scope: dedicated touch controls, an audible dash asset, unique Act 2 art/props, reusable act metadata, the Clog Prior, and later acts.

## Failure And Repair Record

- The first two `sumpDeath` attempts timed out because `PreloadScene` did not register the new route and fell back to `RunScene`; the route registration was repaired and a narrow regression gate added.
- Visual QA found a stale `-2` label after restart; `HitFeedback.reset()` now destroys active VFX objects and the browser asserts zero active objects.
- Keyboard R is green in isolated proof but flaky after many headless tabs. The broad matrix therefore uses the same deterministic restart hook as existing death routes and records the restart method explicitly.
- A global `lastAudioCue` assertion was timing-sensitive because the nearby pickup could legitimately supersede `dash`; player-owned dash cue counting now proves the hook without constraining unrelated audio.

## Pending, Blocked, Superseded, Unauthorized

- Pending: Marcus human acceptance and next-gate choice.
- Blocked: no technical implementation work is blocked.
- Superseded: active hopper items for Sump restart and dash feedback moved to completed truth.
- Unauthorized/not attempted: public deployment, push, packaging, licensed/new art, touch controls, a new boss, or a broader act.

## Open Runtime State And Recovery

- Open runtime state at closeout: none. Port 5173 has no listener, and no Foxman Chrome profile or repo Vite process remains.
- Exact next safe action: Marcus runs the local game, clears the Toll Baron into Sump Warrens, dies, presses R or Enter, continues, and records the human verdict before promoting packaging or more campaign content.
- Prerequisites for public/mobile claims: explicit human review, release checklist, and separate touch-input scope if touch support is desired.
