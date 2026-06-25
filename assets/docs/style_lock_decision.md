# Style Lock Decision

Date: 2026-06-25  
Decision: use `char_foxman_candidate_b_concept_sheet.png` as the base Foxman design.

## Selected Base

`assets/source/concepts/char_foxman_candidate_b_concept_sheet.png`

## Why

- Clearest side-scroller silhouette.
- Best balance of fox identity, human posture, and antihero attitude.
- Lean enough for fast movement and dodge-heavy combat.
- Tail, scarf, ears, and knife poses provide strong animation anchors.
- Less cluttered than candidate A and less bulky than candidate C.

## Borrowed Details

From candidate A:

- Dirtier mercenary coat texture.
- Slightly more ragged lower hem.

From candidate C:

- Aggressive crouch/lunge energy.
- More feral attack expression when needed.

## Runtime Prototype

First alpha prototype:

`assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png`

Validation:

- Source created with flat chroma-key background.
- Background removed locally.
- Output is `1774x887` RGBA PNG.
- Transparent corner pixels confirmed.
- Alpha range confirmed as `0..255`.

## Next Art Tasks

- Slice prototype poses into rough frames for Phaser import.
- Generate or clean a drunken guard transparent prototype.
- Convert tile concept into a minimal runtime tile strip.
- Split UI/VFX board into first HUD and hit-VFX runtime assets.
