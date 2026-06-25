# Import Notes

## Runtime Asset Rules

- Runtime assets live under `assets/game/`.
- Raw generated outputs live under `assets/source/ai_raw/`.
- Cleaned accepted images live under `assets/source/cleanup/` or `assets/game/` depending use.
- Prompt files live under `assets/source/prompts/`.
- Do not reference `$CODEX_HOME/generated_images/` or any temp path from code.

## Phaser Import Direction

Likely runtime patterns:

```ts
this.load.image("bg_rotten_borough_far", "assets/game/backgrounds/rotten_borough/far/bg_rotten_borough_far_1920x1080.webp");
this.load.atlas("foxman", "assets/game/atlases/characters/char_foxman_base.png", "assets/game/atlases/characters/char_foxman_base.json");
```

## Atlas Rules

- Character atlases should use stable animation frame names.
- Avoid changing frame keys once code references them.
- Prefer one atlas per major character for early development.
- VFX can share a combat VFX atlas.

## Image Format

- PNG for alpha sprites, VFX, icons, and UI elements.
- WebP for large opaque backgrounds after visual QA.
- Keep source PNGs for generated backgrounds if WebP conversion loses too much detail.

## QA Before Import

For every asset:

- Confirm content boundaries pass.
- Confirm file name follows convention.
- Confirm dimensions are expected.
- Confirm alpha exists if required.
- Confirm no unwanted text, watermark, signature, or logo.
- Confirm it reads at intended gameplay scale.
- Record intended use in the asset log.
