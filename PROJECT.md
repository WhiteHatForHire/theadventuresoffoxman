# The Adventures of Foxman, a Merciless Bastard

## What This Is

`The Adventures of Foxman, a Merciless Bastard` is a 2D side-scrolling action platformer inspired by the pace, combat readability, and platforming snap of games like Dead Cells, filtered through an adult, crude, satirical comedy voice.

The protagonist is Foxman: a fox/man hybrid with a sharp tongue, worse judgment, and a talent for solving social problems with blades, boots, and spectacularly poor impulse control.

## Current Objective

Run the bounded **Rotten Run** Gauntlet authorized on 2026-08-11: use the
accepted campaign's movement, combat, weapons, skills, mutations, enemies,
bosses, asset pipeline, and browser harness to produce a replayable seeded
side-scrolling roguelite vertical slice while preserving the authored campaign.
The controlling directive is
[`MASTER_DIRECTIVE.md`](docs/08-run/gauntlet/foxman-rotten-run-2026-08-11/MASTER_DIRECTIVE.md).

The existing build remains an expanded campaign prototype with a technically
closed Act 2 chapter. Its pending human play verdict is preserved as a later
campaign decision and does not block the separately authorized Rotten Run
experiment.

## Current Phase

Rotten Run Gauntlet implementation, with the accepted V1 campaign and technically
closed Act 2 retained as regression baselines.

The deterministic Rotten Run plan, separate browser-visible mode shell, bounded
loadout, and real two-wave Stage 1 combat are accepted through `0c29d6a`. A
normalized seed freezes three two-option stages and the Commissioner of
Consequences; the title preserves Campaign on Enter while exposing Rotten Run on
R; four weapons, three skills, three Stage 1 enemy roles, death/retry, and the
reward docket are manually operable. The complete 26-route browser matrix remains
green. The active gate is the deterministic reward transaction and carried-build
transition into the Stage 2 route docket; Stage 2 combat, later enemies/elites,
boss completion, settings, records, and full-run proof remain unimplemented.

The app boots in Phaser, has a title/start flow, renders optimized generated runtime assets, supports movement/dash/combat/ranged combat/active skill/mutations/pause/death/restart, splits Phaser into a production vendor chunk, and has smoke-proven room, platform-traversal, dash, Act 2 Sump Warrens, Sump death/restart, 390px viewport, ranged, skill, reward/shop, reward/shop skill, second-path, mutation, second-path death/restart, connected boss-route, full-slice, skill-to-boss, mini-boss, boss-death, and manual opening routes. Sump restart restores the player, all three enemy actors, input/motor state, completion gate, UI, and active hit VFX. Dash now has a lightweight three-image trail and audio-bus cue without changing movement tuning. Browser evidence and the remaining human gate are recorded in `docs/08-run/2026-08-08-sol-wave-run-receipt.md`.

## Current Technical Direction

Default planned stack:

- Vite
- TypeScript
- Phaser 3
- Generated raster assets for characters, sprites, backgrounds, textures, VFX, and UI
- Browser-based smoke testing

This direction can be changed only through an explicit architecture decision record.

## Tone And Content Boundaries

The game aims for crude, adult, satirical comedy. It can be profane, mean, absurd, and nasty in an intentionally comic way.

Non-goals:

- Explicit sexual content
- Hate, harassment, or slurs targeting protected classes
- Real-person defamation
- Shock content that makes the game less playable or less funny
- Gore that overwhelms combat readability

## Current Non-Priorities

- Multiplayer
- Backend accounts
- Real-money purchases
- Procedural world generation for MVP
- Native desktop/mobile packaging
- Full campaign scope before the first vertical slice

## Primary Planning Docs

- [`FOXMANS_INITIATIVE.md`](docs/FOXMANS_INITIATIVE.md) - master production plan, gates, and build roadmap.
- [`FOXMANS_FULL_GAME_INITIATIVE.md`](docs/FOXMANS_FULL_GAME_INITIATIVE.md) - full-game campaign expansion plan, act roadmap, and gates.
- [`FOXMAN_CASE_STUDY.md`](docs/case-study/FOXMAN_CASE_STUDY.md) - visual case-study structure for the one-shot generation postmortem and business story.
- [`Foxman_Case_Study.docx`](docs/case-study/Foxman_Case_Study.docx) - presentation-ready case-study document with embedded asset plates, token economics, code map, and asset-location guide.
- [`ASSET_GALLERY.md`](docs/case-study/ASSET_GALLERY.md) - visual inventory of source concepts, raw AI outputs, runtime sheets, atlases, backgrounds, props, UI, and prompt docs.
- [`CODE_MAP.md`](docs/case-study/CODE_MAP.md) - full codebase map for scenes, systems, tests, docs, and pipeline scripts.
- [`PHASE2_ENGINE_SCAFFOLD_REPORT.md`](docs/PHASE2_ENGINE_SCAFFOLD_REPORT.md) - validation evidence for the first runnable Phaser scaffold.
- [`PHASE3_MOVEMENT_SANDBOX_REPORT.md`](docs/PHASE3_MOVEMENT_SANDBOX_REPORT.md) - movement sandbox validation evidence.
- [`PHASE4_COMBAT_SANDBOX_REPORT.md`](docs/PHASE4_COMBAT_SANDBOX_REPORT.md) - combat sandbox validation evidence.
- [`PHASE5_VERTICAL_SLICE_ROOM_REPORT.md`](docs/PHASE5_VERTICAL_SLICE_ROOM_REPORT.md) - room route validation evidence.
- [`PHASE6_ASSET_INTEGRATION_REPORT.md`](docs/PHASE6_ASSET_INTEGRATION_REPORT.md) - runtime art integration validation evidence.
- [`PHASE7A_POLISH_FEEDBACK_REPORT.md`](docs/PHASE7A_POLISH_FEEDBACK_REPORT.md) - first polish feedback validation evidence.
- [`PHASE7_VERTICAL_SLICE_POLISH_REPORT.md`](docs/PHASE7_VERTICAL_SLICE_POLISH_REPORT.md) - title, pause, bark, and polish validation evidence.
- [`PHASE8_FOUNDATION_REPORT.md`](docs/PHASE8_FOUNDATION_REPORT.md) - extended-slice foundation validation evidence.
- [`PHASE8_SECOND_PATH_REPORT.md`](docs/PHASE8_SECOND_PATH_REPORT.md) - second combat/reward path validation evidence.
- [`PHASE8_TAX_CLERK_ART_AND_BROWSER_SMOKE_REPORT.md`](docs/PHASE8_TAX_CLERK_ART_AND_BROWSER_SMOKE_REPORT.md) - tax clerk runtime art and committed browser smoke validation evidence.
- [`PHASE8_REWARD_CHOICE_AND_ELITE_REPORT.md`](docs/PHASE8_REWARD_CHOICE_AND_ELITE_REPORT.md) - reward choice and elite prototype validation evidence.
- [`PHASE8_MINIBOSS_ROOM_REPORT.md`](docs/PHASE8_MINIBOSS_ROOM_REPORT.md) - mini-boss room validation evidence.
- [`PHASE8_TOLL_BARON_ART_AND_BEHAVIOR_REPORT.md`](docs/PHASE8_TOLL_BARON_ART_AND_BEHAVIOR_REPORT.md) - Toll Baron runtime art and boss-special validation evidence.
- [`PHASE8_ATLAS_PACKING_REPORT.md`](docs/PHASE8_ATLAS_PACKING_REPORT.md) - first repeatable atlas export and Toll Baron atlas migration validation evidence.
- [`PHASE8_FAIL_STATE_REPORT.md`](docs/PHASE8_FAIL_STATE_REPORT.md) - player damage, boss death, and restart validation evidence.
- [`PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md`](docs/PHASE8_CONNECTED_BOSS_ROUTE_REPORT.md) - visible second-path-to-boss transition validation evidence.
- [`PHASE8_SECOND_PATH_DAMAGE_REPORT.md`](docs/PHASE8_SECOND_PATH_DAMAGE_REPORT.md) - second-path enemy damage and restart validation evidence.
- [`PHASE8_TAX_CLERK_ATLAS_REPORT.md`](docs/PHASE8_TAX_CLERK_ATLAS_REPORT.md) - tax clerk and elite auditor atlas migration validation evidence.
- [`PHASE8_GUARD_ATLAS_REPORT.md`](docs/PHASE8_GUARD_ATLAS_REPORT.md) - drunken guard atlas migration validation evidence.
- [`PHASE8_PROP_ATLAS_REPORT.md`](docs/PHASE8_PROP_ATLAS_REPORT.md) - pickup and exit prop atlas migration validation evidence.
- [`PHASE8_FOXMAN_ATLAS_REPORT.md`](docs/PHASE8_FOXMAN_ATLAS_REPORT.md) - Foxman player atlas migration validation evidence.
- [`PHASE8_BACKGROUND_OPTIMIZATION_REPORT.md`](docs/PHASE8_BACKGROUND_OPTIMIZATION_REPORT.md) - Rotten Borough runtime background optimization validation evidence.
- [`PHASE8_RANGED_COMBAT_REPORT.md`](docs/PHASE8_RANGED_COMBAT_REPORT.md) - first ranged weapon prototype validation evidence.
- [`PHASE8_SKILL_PROTOTYPE_REPORT.md`](docs/PHASE8_SKILL_PROTOTYPE_REPORT.md) - first active skill prototype validation evidence.
- [`PHASE8_MUTATION_PROTOTYPES_REPORT.md`](docs/PHASE8_MUTATION_PROTOTYPES_REPORT.md) - first two mutation prototype validation evidence.
- [`PHASE8_REWARD_SHOP_SURFACE_REPORT.md`](docs/PHASE8_REWARD_SHOP_SURFACE_REPORT.md) - upgraded reward/shop choice surface validation evidence.
- [`PHASE8_REWARD_SHOP_ART_REPORT.md`](docs/PHASE8_REWARD_SHOP_ART_REPORT.md) - reward/shop counter runtime art validation evidence.
- [`PHASE8_REWARD_SHOP_ICON_REPORT.md`](docs/PHASE8_REWARD_SHOP_ICON_REPORT.md) - reward/shop category icon atlas validation evidence.
- [`PHASE8_ROUTE_COHESION_REPORT.md`](docs/PHASE8_ROUTE_COHESION_REPORT.md) - full-slice route cohesion and build carry-forward validation evidence.
- [`PHASE8_CARRIED_SKILL_AND_SELECTION_REPORT.md`](docs/PHASE8_CARRIED_SKILL_AND_SELECTION_REPORT.md) - carried Spite Belch and shop card selection polish validation evidence.
- [`PHASE8_BOSS_BUILD_VARIETY_REPORT.md`](docs/PHASE8_BOSS_BUILD_VARIETY_REPORT.md) - skill-oriented boss route and carried skill boss validation evidence.
- [`PHASE8_COMBAT_HUD_READABILITY_REPORT.md`](docs/PHASE8_COMBAT_HUD_READABILITY_REPORT.md) - combat HUD readability validation evidence.
- [`PHASE8_COMBAT_VFX_HIT_FEEDBACK_REPORT.md`](docs/PHASE8_COMBAT_VFX_HIT_FEEDBACK_REPORT.md) - visible impact feedback validation evidence.
- [`PHASE8_V1_STABILIZATION_REPORT.md`](docs/PHASE8_V1_STABILIZATION_REPORT.md) - V1 build-size and smoke-matrix stabilization evidence.
- [`PHASE8_V1_ACCEPTANCE_AUDIT.md`](docs/PHASE8_V1_ACCEPTANCE_AUDIT.md) - V1 acceptance audit and evidence map.
- [`PHASE8_FIRST_ROOM_PLAYABILITY_RESCUE_REPORT.md`](docs/PHASE8_FIRST_ROOM_PLAYABILITY_RESCUE_REPORT.md) - first-room human-play rescue and manual-key browser smoke validation evidence.
- [`PHASE8_PLAYABILITY_AUDIT_AND_RESCUE_REPORT.md`](docs/PHASE8_PLAYABILITY_AUDIT_AND_RESCUE_REPORT.md) - July 2026 playability audit, platform/combat/boss-endpoint fixes, validation evidence, and remaining recommendations.
- [`PHASE9_FULL_GAME_EXPANSION_REPORT.md`](docs/PHASE9_FULL_GAME_EXPANSION_REPORT.md) - full-game initiative and Act 2 Sump Warrens campaign expansion evidence.

## Current Operating Docs

- [`OPERATING-MANUAL.md`](docs/07-ops/OPERATING-MANUAL.md) - how to use the repo as an agentic project brain and shipping system.
- [`PROMPT-TEMPLATE.md`](docs/07-ops/PROMPT-TEMPLATE.md) - reusable prompt templates for agent runs.
- [`SKILLS.md`](docs/07-ops/SKILLS.md) - master index of reusable project skills.
- [`NEXT-IN-HOPPER.md`](docs/07-ops/NEXT-IN-HOPPER.md) - active near-term build queue.
- [`FUTURE-TODO.md`](docs/07-ops/FUTURE-TODO.md) - parked backlog and future ideas.
- [`COMPLETED.md`](docs/07-ops/COMPLETED.md) - completed work log.
- [`SHIPPING-UPDATE-SKILL.md`](docs/07-ops/SHIPPING-UPDATE-SKILL.md) - reusable skill for updating project state after meaningful work.

## How To Pick Up The Project

1. Read this file.
2. Read [`AGENTS.md`](AGENTS.md).
3. Read [`docs/FOXMANS_INITIATIVE.md`](docs/FOXMANS_INITIATIVE.md).
4. Read [`docs/07-ops/NEXT-IN-HOPPER.md`](docs/07-ops/NEXT-IN-HOPPER.md).
5. Work one gated task at a time.
6. Run the Shipping Update Skill after meaningful work.
