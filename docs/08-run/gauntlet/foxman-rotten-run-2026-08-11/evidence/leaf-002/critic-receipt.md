# LEAF-002 Reality Gate Receipt

## Decision record

- **Surface reviewed:** Foxman Rotten Run Stage 1 two-wave combat slice, plus the preserved campaign entry path.
- **Decision time:** 2026-08-11T17:06:18+08:00.
- **Reviewer:** independent fresh-context LEAF-002 reality critic.
- **Risk level:** high for gameplay acceptance; low for external consequences because the candidate remains uncommitted and undeployed.
- **Control identity:** `HEAD`, `main`, and `origin/main` all resolved to `260de89d992836182fb436abdff8801e26239e46` before the gate. The reviewed candidate was the shared worktree's intentional uncommitted change set on that control commit.
- **Critic authority:** read-only in the repository. I made no repository edit, stage, commit, reset, stash, clean, push, deployment, or external write.
- **Fresh artifact:** Vite production output built directly from the current candidate into `/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/dist` and served only for this review at `http://127.0.0.1:61068/`. The server and critic-owned Browser tab are now stopped. Reproduction command: `python3 -m http.server 61068 --bind 127.0.0.1 --directory /Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/dist`.

## Verification ladder

### 1. Surface and artifact identity

The in-app Browser connector was healthy before interaction, so no Chrome fallback was used. I opened a new tab against the newly built artifact rather than an existing server, build, or tab. The main bundle reviewed was `assets/index-DrVtTT8V.js` with SHA-256 `82f0106faec6bb36e6defa876563c7e9cdfb5837ed3c5c3861abc98a48fb891b`.

Both required output viewports were directly inspected:

| Actual viewport | Canvas evidence | Framing result |
| --- | --- | --- |
| 1366×768 | one 1280×720 internal canvas, displayed about 1365.3×768 | readable, no scroll, no duplicate canvas, no missing-texture green |
| 1920×1080 | one 1280×720 internal canvas, displayed 1920×1080 | readable, no scroll, no duplicate canvas, no missing-texture green |

Representative direct-browser captures: [title-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/title-1366x768.png), [rotten-loadout-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-loadout-1366x768.png), and [rotten-loadout-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-loadout-1920x1080.png).

### 2. Deterministic truth

- `npm run typecheck` completed with exit 0.
- `npm test -- --reporter=json --outputFile=.../vitest-results.json` completed with 33/33 tests and 18/18 suites passed. Evidence: [vitest-results.json](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/vitest-results.json).
- `npm run build -- --outDir .../dist --emptyOutDir` completed with exit 0 using Vite 7.3.6; the external output contains 13 files. Running `tests/smoke/check-dist.mjs` against that output passed.
- `git diff --check` completed with exit 0.
- Focused contract regression passed 1/1: [browser-smoke-rottenContract-results.json](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/browser-smoke-rottenContract-results.json).
- Focused enemy-cycle regression passed 1/1: [browser-smoke-rottenEnemyCycle-results.json](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/browser-smoke-rottenEnemyCycle-results.json). It traversed approach, windup, active, and recovery for bailiff, clerk, and writ-runner; maximum feet Y was 583.7, maximum body bottom was 580, reacquisition completed twice in 217–567 ms, and the reacquired runner was hit by the next weapon attack.
- Focused encounter support ultimately passed 2/2 routes: [browser-smoke-rottenEncounter-results.json](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/browser-smoke-rottenEncounter-results.json). Its successful exact-key path recorded Tax Pike 6 attacks/6 hits and Seized Stamp 2 uses/2 hits; the contrasting Receipt Spitter/Bribe Bomb path recorded a weapon hit and four skill hits, with zero combat objects at reward.
- The full accepted regression passed 26/26 routes on its single first full-matrix attempt, without a hang or runtime error: [browser-smoke-results.json](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/browser-smoke-results.json).

The focused encounter command was not perfectly repeatable and that evidence is intentionally preserved. Attempt 1 failed after retry because the immediate snapshot observed `butcher-saber` instead of an empty weapon slot. A bounded repeat did not reproduce that state: attempt 2 reached the clean retry but missed a short-lived enemy-tell snapshot; attempt 3 passed the whole focused route. The independent manual retry and the one full-matrix run both showed an empty weapon, empty skill, wave 0, zero clears, and zero combat objects. This makes the failures most consistent with headless harness key/snapshot timing, not a stable gameplay reset defect, but it remains the gate's largest residual gap.

### 3. Behavioral evidence from the real in-app Browser

No smoke hook or page-evaluation mutation was used to clear the manually reviewed encounters.

- At 1366×768, `/` followed by a real Enter key reached the existing `RunScene` campaign with Rusty Knife and one canvas. Evidence: [campaign-enter-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/campaign-enter-1366x768.png).
- At `/?mode=rotten&seed=GAUNTLET-ALPHA`, the visible seed was `GAUNTLET-ALPHA`, plan `RR1-1C93B57F`, and route pair `unfiled-alley|bailiffs-ramp`. All four weapons and all three skills were readable. Real keys 3, 6, Enter, 2 selected Tax Pike, Seized Stamp, and Bailiffs Ramp. Evidence: [rotten-route-choice-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-route-choice-1366x768.png).
- Incoming enemy damage caused explicit death at 0/6. A real R returned the same seed and plan to a clean loadout with empty selections, wave 0, zero clears, zero living enemies, zero combat objects, and one canvas. Evidence: [rotten-retry-clean-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-retry-clean-1366x768.png).
- The manually operated melee run cleared both waves. Tax Pike recorded 25 attacks/8 hits; Seized Stamp was used seven times but did not connect in this live run because the pike spacing kept targets outside the stamp area. The reward docket nevertheless arrived alive at 6/6 with 7 graft, deterministic offers `dead-letter|petty-grudge|spite-reserve`, zero living enemies, zero stale combat objects, and one canvas. The focused exact-key regression independently proves Seized Stamp hits rather than inferring them. Evidence: [rotten-held-melee-tell-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-held-melee-tell-1366x768.png), [rotten-held-melee-wave2-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-held-melee-wave2-1366x768.png), and [rotten-held-melee-final-1366x768.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-held-melee-final-1366x768.png).
- At 1920×1080, real keys 4, 7, Enter, 2 selected Receipt Spitter, Bribe Bomb, and Bailiffs Ramp. Bribe Bomb displayed an armed telegraph, then incremented skill hits only after its delay. Evidence: [rotten-bribe-bomb-live-telegraph-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-bribe-bomb-live-telegraph-1920x1080.png) and [rotten-bribe-bomb-live-resolved-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-bribe-bomb-live-resolved-1920x1080.png).
- Receipt Spitter visibly rose to heat 4/4, entered recovery, rejected attacks during the lock, cooled to 0, and fired again. Evidence: [rotten-spitter-live-recovery-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-spitter-live-recovery-1920x1080.png).
- The manually operated ranged run cleared both waves with 12 attacks/9 hits and 3 skill uses/1 delayed skill hit. It reached reward at 6/6 with zero living enemies, zero combat objects, and one canvas. Bailiff and writ-runner remained visibly grounded and hittable in wave 2. Evidence: [rotten-ranged-wave2-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-ranged-wave2-1920x1080.png) and [rotten-ranged-final-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-ranged-final-1920x1080.png).
- Seed `CYCLE-4`, route `bribe-line`, exposed a distinct Tax Clerk silhouette and visible `RECEIPT!` ranged tell. A stationary live attempt then died to incoming damage while the clerk remained alive, confirming that the ranged threat was consequential rather than decorative. Evidence: [rotten-clerk-receipt-tell-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-clerk-receipt-tell-1920x1080.png) and [rotten-clerk-route-final-1920x1080.png](/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/leaf-002-recritic3/rotten-clerk-route-final-1920x1080.png).

The in-app Browser's atomic tap gesture can place J/K down and up between Phaser polling frames. For combat, I therefore sustained J/K across multiple real Browser CUA key events. Menu, route, retry, and campaign keys were ordinary single key actions. This was a connector measurement constraint; it did not use CDP, headless automation, page evaluation, or the candidate's smoke-only hooks to alter live state.

### 4. Product and presentation quality

The slice is credible and readable rather than merely test-shaped. The build screen explains four weapons and three skills, route cards expose both wave compositions and rewards before commitment, and combat HUD state communicates HP, attacks/hits, skill use/hits, cooldown, and Receipt Spitter heat. Bailiff, Tax Clerk, and Writ Runner have distinct silhouettes, colors, tells, and state cycles. The Bailiff's `SWING!`, Clerk's `RECEIPT!`, and runner's `LANE CHARGE!` were legible in motion. Interwave and reward boundaries were visually explicit. I saw no duplicate/stale actors, missing-texture green, cropped critical text, or second canvas at either required viewport.

Browser diagnostics on the reviewed manual pages returned zero console errors and zero warnings. All game scripts, styles, atlases, and runtime images returned 200/304. The only failed request was the conventional absent `/favicon.ico` (404); no gameplay resource failed.

### 5. Architecture, scope, and consequence review

- The new `loadout.ts`, `enemyRoles.ts`, `waves.ts`, and `upgrades.ts` registries are pure data/types and contain no Phaser import.
- `RottenEnemy` owns role-specific movement, windup/active/recovery behavior, tells, grounding, and reacquisition state.
- `RottenCombatController` owns the player, collisions, attacks, projectiles, bombs, skills, enemy collection, and cleanup. Its destroy path removes colliders, actors, projectiles, bomb markers, and visuals.
- `RottenRunScene` orchestrates loadout, route choice, wave sequencing, interwave/reward/death presentation, snapshots, retry, and controller lifecycle.
- `rottenContract`, `rottenEncounter`, and `rottenReacquire` behavior is explicitly gated by query smoke parameters; normal Rotten play does not activate it.
- The candidate touches only Rotten state/scene/runtime/registry files plus Rotten unit and browser regression tests. The existing campaign scene/progression sources are absent from both the tracked diff and untracked list, and direct `/` + Enter behavior plus the full campaign regression remained intact.
- The critic changed no repository or delivery surface. The external artifact is disposable and the review server/tab were cleaned up, so the gate decision is reversible.

### 6. Human acceptance

An independent operator-style acceptance pass was completed through the real in-app Browser on the exact production artifact. Repository-owner sign-off remains outside this critic's authority, but there is no technical or evidentiary blocker to that sign-off.

## Largest gap and narrow next move

The single largest gap is the focused encounter harness's transient key/snapshot nondeterminism: two bounded attempts failed at different short-lived observations before the focused route and the full 26-route matrix passed. The narrow next move is to harden only the harness by requiring post-retry reset fields to remain stable across two animation frames and by latching the first observed tell before taking the later snapshot, then run that focused route ten times. Do not change gameplay reset logic unless the weapon persistence reproduces in the real in-app Browser or under a stable harness condition.

## Gate rationale

The exact production artifact is readable and manually operable at both required viewports; direct Browser play proved campaign preservation, deterministic choices, melee and ranged weapon hits, a delayed skill hit, Receipt Spitter recovery, enemy threat/death, same-seed cleanup, wave transition, reward cleanup, and one-canvas integrity. The accepted full regression, unit/type/build checks, architecture review, and clean runtime/resource diagnostics corroborate that live evidence. The focused harness timing gap should be repaired, but it does not outweigh the direct product evidence or reproduce as a release-blocking gameplay fault.

PASS
