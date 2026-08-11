# Foxman Rotten Run Bounded Context Packet

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`
Freshness: `2026-08-11T04:16:09Z`
Context policy: each leaf receives this shared truth plus only its directly required source files.

## Goal

Produce the bounded, polished, seeded Rotten Run vertical slice defined by the master directive without regressing the authored campaign.

## Current Truth

- Launch controls were accepted and pushed as `6d5b091` from prepared baseline `779f935`.
- Fresh `npm run smoke:all` passes all 23 existing browser routes.
- Current stack is Vite, TypeScript, Phaser 3; no stack change is authorized.
- Campaign scenes already provide movement, dash, melee/ranged combat, one skill, two mutations, enemies, an elite, a boss, death/restart, progress persistence, and a browser state harness.
- Rotten Run runtime implementation does not yet exist.

## Active Decisions

- `RR-DEC-001`: separate mode; preserve campaign.
- `RR-DEC-002`: seed-addressable deterministic state.
- `RR-DEC-003`: one sequential descendant; lead-only promotion.
- `RR-DEC-004`: local review, no public deployment.
- `RR-DEC-005`: largest gap first.
- `RR-DEC-006`: additive pure core and separate scene; no campaign refactor.
- `RR-DEC-007`: fixed three-stage, two-wave, two-route-choice topology plus one boss.
- `RR-DEC-008`: fixed content budget and mechanics in the seeded product contract.

## Required Sources

- [`MASTER_DIRECTIVE.md`](MASTER_DIRECTIVE.md)
- [`DECISION_REGISTRY.md`](DECISION_REGISTRY.md)
- [`SEEDED_RUN_CONTRACT.md`](SEEDED_RUN_CONTRACT.md)
- Repository `AGENTS.md`, `PROJECT.md`, and relevant source/tests for the assigned leaf.

## Constraints And Traps

- Existing smoke query routes are accepted contracts, not disposable test scaffolding.
- Manual play and critic-operated browser evidence are required; autorun alone cannot accept a gameplay gate.
- Comedy stays aimed at fictional corruption, institutions, villains, and Foxman's own failures.
- New generated assets must be original, project-local, provenance-recorded, and runtime-verified.
- Do not mistake the 390px containment check for promised touch support.

## Explicit Exclusions

- Raw chat history, unrelated campaign archives, credentials, secrets, private exports, public deployment authority, full metaprogression, backend, multiplayer, monetization, native packaging, or unlimited procedural content.
