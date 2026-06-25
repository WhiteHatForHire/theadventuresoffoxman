# Phase 5 Vertical-Slice Room Report

Date: 2026-06-25  
Gate: G5 - Room Playable  
Result: Passed

## What Exists

- One short side-scrolling room route.
- Start position.
- Continuous traversal floor with upper platforms.
- Weapon pickup marker.
- Current weapon state.
- Drunken guard encounter.
- Locked exit marker.
- Exit unlock logic.
- Room completion state.
- HUD health and current weapon text.
- DOM debug attributes for smoke checks.
- `?smoke=room` automated route smoke path.

## Route

```text
Start -> traverse right -> collect Butcher Saber -> kill guard -> exit unlocks -> reach exit -> room complete
```

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
- Unit tests passed: 1 file, 4 tests.
- Production build passed.
- Dist smoke passed.

Build note:

- Vite still warns about large chunks because Phaser and large generated concept PNGs are bundled. This remains a known performance follow-up before demo release.

## Browser Smoke Evidence

Smoke URL:

```text
http://127.0.0.1:5173/?smoke=room
```

Observed dataset timeline:

- `1000ms`: `pickupCollected=false`, `enemyAlive=true`, `exitUnlocked=false`, `roomComplete=false`, `playerX=425`.
- `2400ms`: `pickupCollected=true`, `currentWeapon=Butcher Saber`, `enemyAlive=false`, `enemyHealth=0`, `kills=1`, `exitUnlocked=true`, `roomComplete=false`.
- `4200ms`: player continues toward exit with `playerX=1613`, exit still unlocked.
- `6200ms`: `roomComplete=true`, `playerX=1873`, `playerAlive=true`, `playerHealth=4`.
- `13000ms`: room remains complete and stable.

Browser console errors/warnings: none.

## Fixes During Smoke

- Pickup initially failed because temporary cropped sprite origin did not match player debug/body position. Fixed pickup collection to use body/debug coordinates.
- Route initially snagged on raised platform collision around the encounter. Simplified the direct route to a continuous floor and moved upper platforms out of the main path.
- Exit completion initially used sprite bounds and missed the body coordinate. Fixed exit completion to use the same body/debug coordinate system as smoke evidence.

## Known Follow-Ups

- Replace pickup marker shape with cleaned/generated runtime art.
- Replace guard concept-sheet crop with a transparent runtime sprite.
- Add real room manager data instead of hardcoded scene geometry.
- Add scripted browser smoke outside the in-app browser.
- Add audio stubs and completion feedback.
