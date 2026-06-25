# Phase 4 Combat Sandbox Report

Date: 2026-06-25  
Gate: G4 - Combat Playable  
Result: Passed for first sandbox

## What Exists

- Health component.
- Drunken guard enemy entity using the generated guard concept sheet as prototype art.
- Enemy AI states: patrol, chase, attack, dead.
- Player attack input on `J`.
- Player attack debug hitbox.
- Enemy attack debug hitbox.
- Enemy damage and death.
- Player damage.
- Player death/restart loop.
- DOM debug attributes for smoke checks.
- `?smoke=combat` and `?smoke=death` smoke paths.

## Controls

- Move: `A` / `D` or arrow keys.
- Jump: `Space`.
- Attack: `J`.

## Validation

Commands run:

```bash
npm run typecheck
npm run test
npm run build
npm run smoke
```

Results:

- Typecheck passed.
- Unit tests passed: 1 file, 3 tests.
- Production build passed.
- Dist smoke passed.

Build note:

- The build still warns about large chunks because Phaser and large concept-art PNGs are bundled. This remains a known performance follow-up.

## Combat Smoke Evidence

Smoke URL:

```text
http://127.0.0.1:5173/?smoke=combat
```

Observed dataset timeline:

- `900ms`: guard chases, player runs.
- `1400ms`: `enemyHealth=1`, `playerHealth=4`.
- `1900ms`: `enemyAlive=false`, `enemyHealth=0`, `enemyState=dead`, `kills=1`.

Browser console errors/warnings: none.

## Death/Restart Smoke Evidence

Smoke URL:

```text
http://127.0.0.1:5173/?smoke=death
```

Observed dataset timeline:

- `3000ms`: `playerHealth=4`.
- `5200ms`: `playerHealth=2`.
- `7600ms`: `deaths=1`, `playerHealth=5`.
- `9000ms`: `deaths=1`, `playerAlive=true`.

Browser console errors/warnings: none.

## Fixes During Smoke

- Added a death smoke path after combat smoke proved enemy death but not player restart.
- Fixed a repeated-death loop by resetting enemy position, player position, velocities, and attack cooldowns after death.

## Known Follow-Ups

- Replace guard concept-sheet crop with a transparent sprite prototype.
- Tune attack reach and enemy timing after sprite slicing.
- Add hit pause, knockback, and invulnerability frames.
- Add combat SFX and particles.
- Add browser smoke automation as a proper script.
