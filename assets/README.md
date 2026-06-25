# Assets

This folder holds generated, cleaned, and runtime game assets for `The Adventures of Foxman, a Merciless Bastard`.

## Rules

- Save project-bound generated images into this workspace.
- Do not leave runtime assets only under external generated-image folders.
- Keep raw AI outputs separate from cleaned runtime assets.
- Log prompts for accepted generated assets.
- Use lowercase snake_case file names.
- Keep runtime assets under `assets/game/`.
- Keep source prompts, concepts, raw generations, and cleanup files under `assets/source/`.
- Review every accepted asset for content boundaries, technical quality, and gameplay readability.

## Planned Structure

```text
assets/
  source/
    prompts/
    concepts/
    layered/
    ai_raw/
    cleanup/
  game/
    atlases/
    sprites/
    tilesets/
    backgrounds/
    props/
    ui/
    vfx/
    audio_placeholders/
  docs/
```

The full asset production plan lives in [`../docs/FOXMANS_INITIATIVE.md`](../docs/FOXMANS_INITIATIVE.md).
