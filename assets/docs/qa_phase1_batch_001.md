# QA Report: Phase 1 Concept Batch 001

Date: 2026-06-25  
Scope: first generated concept batch for style lock  
Result: accepted for concept/reference use; one Foxman sheet accepted as a runtime bridge prototype

## Summary

The batch successfully establishes the core visual direction:

- Foxman has three usable design candidates.
- Candidate B is the recommended base direction.
- Enemy trio has clear silhouette variety.
- Rotten Borough mood reads as a side-scrolling level space.
- Tile kit and UI/VFX boards are useful production references.
- Material texture board closes the first style-reference set.
- One transparent Foxman prototype sheet proves the chroma-key cleanup path.

## Content Boundary Review

Pass:

- No explicit sexual content observed.
- No hate symbols observed.
- No real-person likeness dependency observed.
- No protected-class harassment in visual design.
- Violence is stylized and cartoon/fantasy-coded.

Notes:

- `ui_vfx_style_board` includes red impact splatter. It is acceptable as stylized combat VFX reference, but runtime VFX should stay brief and non-realistic.
- `enemy_rat_sewer_brute_concept_sheet` includes generated pose labels at the bottom. It is acceptable for concept reference only and must not be used as runtime art without cleanup.

## Technical Review

Pass for concept use:

- Files are saved in workspace under `assets/source/concepts/`.
- Raw copies are saved under `assets/source/ai_raw/`.
- Names follow lowercase snake case.
- Images are high enough resolution for concept reference.

Not runtime-ready:

- Images are RGB with backgrounds, not alpha-cut sprites.
- Sheets are not sliced into animation frames.
- Pivots/origins are not defined.
- Tile kit is not normalized into exact `32x32` tiles.
- UI/VFX board is not separated into individual transparent assets.

Runtime prototype exception:

- `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png` is RGBA and has transparent corners.
- Alpha validation: min alpha `0`, max alpha `255`.
- It is suitable for early engine import experiments, but still needs slicing, frame metadata, and alignment before final animation.

## Readability Review

### Foxman Candidate A

Strengths:

- Strong mercenary coat attitude.
- Good fox/man read.
- Good combat pose variety.

Concerns:

- Longer coat and detail density may clutter runtime frames.

### Foxman Candidate B

Strengths:

- Best side-scroller silhouette.
- Agile knife-fighter read.
- Strong scarf, tail, ear, and snout shapes.
- Most animation-friendly base.

Concerns:

- Needs a little more "merciless bastard" grime from candidate A.

Decision:

- Recommended base.

### Foxman Candidate C

Strengths:

- Strong aggression and combat energy.
- Useful crouch and lunge references.

Concerns:

- Bulkier, more monstrous, and less charming than desired for base player.

Decision:

- Keep as combat-pose reference.

### Drunken Guard

Strengths:

- Clear bulky contrast against Foxman.
- Club windup reads well.
- Corrupt civic badge and helmet support the biome.

Concerns:

- Face detail may need simplification at 128x128.

### Sewer Rat Brute

Strengths:

- Distinct crouched creature shape.
- Cleaver and leap/bite poses read.
- Good sewer-green material cues.

Concerns:

- Generated text labels must be removed.
- May need size reduction to avoid competing with guard.

### Tax Clerk

Strengths:

- Excellent satire target.
- Ledger silhouette is unique.
- Paper-swipe attack has readable VFX potential.

Concerns:

- Thin limbs and accessories may need simplification at 96x96.

### Rotten Borough Mood

Strengths:

- Strong side-scroller lane.
- Good warm/cool lighting.
- Clear parallax depth.
- Civic decay reads without needing text.

Concerns:

- Needs layer separation before runtime use.

### Tile Kit

Strengths:

- Bold collision edges.
- Useful stone, sewer grate, wood platform, and prop language.

Concerns:

- Must be redrawn or normalized into exact `32x32` tiles.

### UI/VFX Board

Strengths:

- HUD style is clear.
- Icons are readable.
- VFX language is punchy.

Concerns:

- Needs separation into individual alpha PNGs.
- Runtime red splatter should be limited for clarity and tone.

### Material Texture Board

Strengths:

- Provides consistent grime, stone, wood, metal, parchment, cloth, fur, slime, and leather references.
- Useful for normalizing cleanup detail density.

Concerns:

- Concept sheet only, not tileable runtime texture output.

## Gate Result

Phase 1 is partially satisfied:

- Art direction docs: complete.
- Prompt book: first-pass complete.
- Foxman candidates: complete.
- Enemy concept trio: complete.
- Biome mood concept: complete.
- Tile/UI/VFX concepts: complete.

Remaining before full style lock:

- Slice the Foxman prototype into frame metadata during engine scaffold or asset cleanup.
- Create a transparent drunken guard prototype during the combat-sandbox asset pass.
