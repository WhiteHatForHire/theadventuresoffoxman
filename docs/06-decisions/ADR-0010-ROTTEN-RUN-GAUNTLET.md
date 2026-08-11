# ADR-0010: Rotten Run Gauntlet

Date: 2026-08-11
Status: Accepted for bounded experiment

## Decision

Use the accepted Foxman browser foundation to build a replayable side-scrolling
roguelite mode, provisionally named **Rotten Run**. The mode reuses the current
movement, combat, weapons, skills, mutations, enemies, bosses, asset pipeline,
and browser harness. It does not replace or erase the authored campaign.

The player enters a seeded run, chooses among changing combat routes and
rewards, develops a distinct build, and attempts to defeat a final boss before
the run ends. A complete bounded vertical slice is required before any broader
campaign, metagame, or content expansion.

## Why

The repository already contains the expensive foundations needed to test this
idea. A Gauntlet can spend its effort on replayability, build diversity,
encounter composition, game feel, and reality testing instead of recreating
movement and combat.

## Boundaries

- Preserve the existing campaign and accepted smoke matrix.
- No backend, multiplayer, monetization, procedural world generator, or native
  packaging.
- Randomization must be seeded and testable.
- Existing art may be reused; new art must remain original and provenance
  recorded.
- Public deployment remains outside this run.

