# Foxman Rotten Run Seeded Product Contract

Status: frozen for the bounded Gauntlet

Owner: visible Gauntlet lead

Decision IDs: `RR-DEC-001`, `RR-DEC-002`, `RR-DEC-006`, `RR-DEC-007`, `RR-DEC-008`

## Outcome

A player chooses a weapon and active skill, crosses three seed-planned stages with a consequential route choice at each stage, buys one of several build-changing rewards after each clear, and either dies or defeats the Commissioner of Consequences in a 15-25 minute browser run. The same seed reproduces the same route and offer plan; the player's choices and execution determine the trace and result.

## Fixed Run Topology

```text
Title / direct seed URL
  -> loadout (1 of 4 weapons, 1 of 3 skills)
  -> stage 1 route choice (2 visible options) -> 2-wave encounter -> reward market
  -> stage 2 route choice (2 visible options) -> 2-wave encounter -> reward market
  -> stage 3 route choice (2 visible options) -> 2-wave encounter -> reward market
  -> Commissioner of Consequences
  -> win or death results
  -> retry same seed, start a new seed, or return to title
```

- Exactly three pre-boss stages ship in the slice.
- Each stage draws two distinct routes from a fixed three-route stage pool.
- The final boss is fixed so seeds and builds compare against one stable reckoning.
- A stage clear is two combat waves. Content expansion after this topology proves the promise is out of scope.

## Seed Contract

- A seed is a normalized, visible, shareable ASCII token of 1-32 characters.
- Normalization trims whitespace, uppercases letters, replaces unsupported runs with `-`, trims edge dashes, and falls back to `ROTTEN-DEFAULT`.
- All route pairs, elite assignments, reward offers, and boss variation order derive from named deterministic seed scopes.
- No core planner or offer generator calls `Math.random`, wall-clock time, browser entropy, or mutable global RNG state.
- The same normalized seed and schema version produce a byte-equivalent plan.
- A choice may change the played trace but cannot retroactively reroll unchosen or later plan data.
- A stable `planId` and schema version are exposed in tests, browser state, results, and records.
- Title-started new runs may create a seed from the current timestamp, but that token is frozen before plan generation and shown to the player.

## Pure State Boundary

`src/game/rotten/` owns browser-independent definitions and transitions:

- seed normalization, hashing, scoped deterministic selection, and plan construction;
- route, loadout, skill, upgrade, enemy-role, elite, and boss registries;
- run phase, decisions, economy, build, trace, and result types;
- local-record schema and migration helpers.

Phaser scenes render and operate this state. Campaign scenes are not extracted, rewritten, or made dependent on Rotten Run state during the bounded slice.

## Run Phases

`loadout`, `route-choice`, `encounter`, `reward-choice`, `boss`, `dead`, and `results` are explicit phases. Invalid transitions fail in pure code and have unit coverage. Pause suspends active time and combat without changing phase.

## Route Pools

### Stage 1 - Intake Yard

- `bailiffs-ramp`: bailiff and writ-runner pressure; weapon-biased market; 4 graft.
- `bribe-line`: clerk crossfire and a larger swarm; economy-biased market; 5 graft.
- `unfiled-alley`: writ-runner mobility test; skill-biased market; 4 graft.

### Stage 2 - Sump Docket

- `bile-registry`: sump-scribe hazards plus bailiffs; skill-biased market; 5 graft.
- `seized-goods-lift`: shield auditors plus a clerk; weapon-biased market; 5 graft.
- `late-fee-chapel`: one guaranteed elite in a mixed encounter; mutation-biased market; 6 graft.

### Stage 3 - Final Filing

- `garnish-gallery`: all-range mixed pressure; weapon-biased market; 6 graft.
- `appeal-furnace`: projectile and hazard control test; skill-biased market; 6 graft.
- `collection-parade`: two elite variations across the waves; mutation-biased market; 7 graft.

Route cards expose dominant roles, elite risk, graft reward, and market bias before selection.

## Four Weapon Approaches

- `rusty-knife`: fastest cadence, shortest reach, stacking close-range pressure.
- `butcher-saber`: slow heavy cleave, high impact, and multi-target commitment.
- `tax-pike`: long reach, spacing control, and strong knockback.
- `receipt-spitter`: ranged kiting, lower impact, and a heat/recovery constraint.

All four are selectable at run start. None is a cosmetic reskin of another.

## Three Active-Skill Approaches

- `spite-belch`: short cone burst and forceful knockback.
- `seized-stamp`: radial interrupt that opens shielded enemies.
- `bribe-bomb`: delayed aimed area burst for crowd and hazard control.

All three are selectable at run start, have distinct cooldowns, and remain useful against the final boss.

## Eight Upgrades

- `hangover-hide`: +2 maximum health and heal 2 immediately.
- `petty-grudge`: taking damage grants a temporary weapon-damage surge.
- `counterfeit-soles`: shorter dash cooldown and a damaging dash wake.
- `compound-interest`: rapid consecutive hits stack a bounded damage bonus.
- `red-tape-tourniquet`: heal 1 after each cleared combat wave.
- `spite-reserve`: materially shorter active-skill cooldown.
- `dead-letter`: each weapon pattern gains one repeat or pierce behavior appropriate to its archetype.
- `graft-dividend`: elites award bonus graft and market prices fall by one.

Offer eligibility cannot present a no-op. Duplicate upgrades improve the same mechanic only when an explicit second rank exists; otherwise offers are unique.

## Five Enemy Roles And Two Elites

- `bailiff`: closes distance and performs a readable melee swing.
- `clerk`: preserves range and fires a visible receipt projectile.
- `writ-runner`: telegraphs and commits to a lane charge.
- `shield-auditor`: blocks frontal weapon damage until flanked, dashed through, or interrupted by a skill.
- `sump-scribe`: telegraphs and lobs a temporary floor hazard.

Elite variations modify a role without erasing it:

- `gilded`: one readable armor pip, gold treatment, and faster recovery.
- `overdue`: purple-red treatment and an announced below-half-health enrage.

Enemy anticipation, active, recovery, and vulnerable states remain distinguishable at gameplay scale.

## Final Boss

`commissioner-of-consequences` is a fixed three-pattern boss using original Foxman presentation. Its repertoire combines a stamp shockwave, receipt volley, and committed charge, adds one elite summon only at the phase boundary, and changes cadence below 60 and 30 percent health. It never relies on an untelegraphed contact-damage wall.

## Economy And Rewards

- Run-local currency is `graft`; it never writes to campaign progression.
- A run starts with 3 graft. Stage routes award the displayed 4-7 graft on clear; elites may add graft.
- Each market shows three deterministic, eligible offers costing 4-7 graft plus a 2-graft heal option.
- The player may buy one offer, buy the heal, or bank graft. The choice is recorded.
- Every normal stage reward state guarantees at least one affordable build-changing offer before `graft-dividend` discounts.

## Death, Results, And Local Records

- Death ends the run; it does not silently revive mid-stage.
- Results show seed, plan ID, outcome, active time, route decisions, loadout, upgrades, kills, elites, damage taken, and boss result.
- `retry same seed` resets all run-local state and reproduces the plan.
- Records use a separate versioned key, `foxman.rottenRun.records.v1`, and never mutate `foxman.progress.v1`.
- Records retain aggregate wins/deaths, fastest win, and the latest 20 result summaries. Corrupt storage fails closed to a valid empty record.

## Browser Evidence Contract

- Rotten Run exposes a structured `window.__FOXMAN_ROTTEN__` snapshot and `data-rotten-*` scalar fields.
- Minimum scalars: scene, phase, seed, plan ID, stage, route options, selected route, weapon, skill, upgrades, graft, HP, living enemies, elite count, boss health/phase, elapsed active milliseconds, result, and trace digest.
- Existing campaign datasets and all 23 accepted routes remain intact.
- Deterministic automation may accelerate a representative run, but at least one critic per playable gate uses real keyboard/browser interaction and reports the exact seed and viewport.

## Presentation, Audio, And Settings

- Reuse accepted project-local Foxman art where coherent; new assets remain original and provenance-recorded.
- Combat truth stays brighter and sharper than backgrounds and decorative grime.
- Original code-synthesized or project-local audio must provide distinct movement, weapon, skill, enemy-tell, hit, reward, death, and boss cues by completion.
- Required local settings: master mute, reduced motion, screen-shake toggle, and high-contrast combat tells. They are available from pause and persist separately from run records.
- Desktop Chrome at 1366x768 and 1920x1080 is the acceptance target. The existing 390px containment regression remains green but does not promise touch controls.

## Three Required Viable Build Proofs

- Close pressure: Rusty Knife + Spite Belch + Compound Interest.
- Control/survival: Tax Pike + Seized Stamp + Hangover Hide.
- Ranged/area: Receipt Spitter + Bribe Bomb + Dead Letter.

Each proof uses a different recorded seed, completes the real boss, retains meaningful health or recovery margin, and includes a browser state trace. The Butcher Saber receives its own deterministic combat proof even though only three full build completions are required.

## Explicit Cuts

- No campaign refactor, campaign deletion, full metaprogression, accounts, backend, multiplayer, monetization, native packaging, public deployment, unlimited procedural generation, fourth stage, second boss, additional weapons/skills/upgrades after the fixed registries pass, or copied reference expression.
