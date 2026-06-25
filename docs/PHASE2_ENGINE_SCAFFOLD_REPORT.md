# Phase 2 Engine Scaffold Report

Date: 2026-06-25  
Gate: G2 - Engine Boot  
Result: Passed

## What Exists

- Vite app scaffold.
- TypeScript config.
- Phaser 3 game boot.
- Boot, preload, run, and UI scenes.
- Asset registry that imports project-local generated assets.
- First generated Rotten Borough background displayed in Phaser.
- First transparent Foxman prototype sheet displayed in Phaser.
- Basic HUD overlay.
- Unit test for asset keys and asset URL registry.
- Production dist smoke script.

## Validation

Commands run:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run smoke
```

Results:

- `npm install`: passed, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run test`: passed, 1 file, 2 tests.
- `npm run build`: passed.
- `npm run smoke`: passed.

Build note:

- Vite warns that a chunk is larger than 500 kB. This is expected at this scaffold stage because Phaser and large concept PNGs are bundled. It is logged as a performance follow-up, not a G2 blocker.

## Browser Smoke

Dev server:

```text
http://127.0.0.1:5173/
```

Desktop viewport:

- Page title: `The Adventures of Foxman, a Merciless Bastard`.
- Canvas count: `1`.
- Canvas internal size: `1280x720`.
- Canvas display size: `1280x720`.
- Console errors/warnings: none after Canvas renderer fix.
- Visual result: Rotten Borough background, Foxman prototype sheet, title text, and HUD render.

Narrow viewport:

- Viewport: `390x844`.
- Canvas count: `1`.
- Canvas internal size: `1280x720`.
- Canvas display size: `390x219`.
- Console errors/warnings: none.
- Visual result: canvas scales down and remains coherent, with letterboxing.

## Fixes During Smoke

- Switched Phaser renderer from `AUTO` to `CANVAS` after the in-app browser crashed on the first visual attempt.
- Moved HUD from upper-left to upper-right after screenshot caught title/HUD overlap.

## Known Follow-Ups

- Slice the Foxman prototype sheet into actual frames instead of displaying the whole sheet.
- Add movement controls and platform collision.
- Add Playwright or equivalent browser smoke automation once the runtime surface stabilizes.
- Compress/convert large runtime art and split Phaser/vendor chunks before any demo release.
