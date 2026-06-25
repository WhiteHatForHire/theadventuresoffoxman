# Phase 3 Movement Sandbox Report

Date: 2026-06-25  
Gate: G3 - Movement Playable  
Result: Passed

## What Exists

- Keyboard input mapper.
- Player movement motor.
- Player entity using the generated Foxman alpha prototype sheet.
- Arcade Physics collision platforms.
- Camera follow with world bounds and dead zone.
- Debug HUD text.
- DOM debug attributes for smoke checks.
- `?smoke=movement` automated movement smoke path.

## Controls

- Move: `A` / `D` or arrow keys.
- Jump: `Space`.

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

## Browser Smoke Evidence

Smoke URL:

```text
http://127.0.0.1:5173/?smoke=movement
```

Observed dataset timeline:

- `250ms`: `playerState=fall`, `playerVelocityX=360`, `playerX=161`.
- `650ms`: `playerState=jump`, `playerVelocityY=-260`.
- `950ms`: `playerState=run`, `playerGrounded=true`, `playerX=449`.
- `1700ms`: `playerState=run`, `playerX=755`.
- `2400ms`: `playerState=idle`, `playerX=799`.

Browser console errors/warnings: none.

## Known Follow-Ups

- Replace cropped prototype sheet pose with sliced animation frames.
- Add dodge/roll after combat basics stabilize.
- Add one-way platform drop-through.
- Add automated browser smoke outside the in-app browser once the route stabilizes.
