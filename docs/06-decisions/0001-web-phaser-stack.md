# ADR 0001: Web Phaser Stack For First Vertical Slice

## Status

Proposed

## Date

2026-06-25

## Context

The project needs a fast path to a playable 2D side-scrolling action platformer with generated raster assets, animation support, browser smoke testing, and rapid iteration.

## Decision

Use Vite, TypeScript, and Phaser 3 for the first vertical slice.

## Consequences

Benefits:

- Fast local development.
- Browser-native playtesting.
- Mature 2D game primitives.
- Good fit for sprite sheets, tile maps, particles, cameras, and arcade-style collision.
- Straightforward smoke testing through browser automation.

Costs:

- Not a native engine pipeline.
- Advanced animation tooling will need discipline.
- Long-term console/native distribution would need a future packaging decision.

## Review Trigger

Revisit this ADR only if the vertical slice exposes a hard blocker in Phaser, browser performance, asset pipeline compatibility, or required platform targets.
