# FOXMANS_INITIATIVE.md

# The Adventures of Foxman, a Merciless Bastard

## Master Initiative Plan

Date: 2026-06-25  
Current phase: Phase 8 - extended vertical-slice content expansion / V1 rescue polish  
Default stack: Vite, TypeScript, Phaser 3  
Target platform for first slice: desktop web browser  
Project path: `/Users/marcusvale/Documents/june25game`

---

# 1. Executive Intent

`The Adventures of Foxman, a Merciless Bastard` is a 2D side-scrolling action platformer with the pace, readability, and combat snap of Dead Cells, wrapped in crude adult fantasy satire.

The player controls Foxman, a fox/man hybrid antihero who is charismatic in the way a thrown bottle is charismatic: fast, sharp, and probably about to become everybody else's problem.

The game should feel:

- Fast.
- Nasty.
- Responsive.
- Visually grimy but readable.
- Funny in short bursts.
- Mean toward corrupt systems, fantasy tropes, cowards, bosses, and Foxman's own selfishness.
- Playable first, theatrical second.

The production philosophy is gate-based:

1. Design the asset and gameplay language first.
2. Create validated assets in controlled batches.
3. Build code skeletons around a playable trunk.
4. Smoke test continuously.
5. Integrate only when the game still boots, plays, and can be manually verified.

This document is the production contract for the initiative. Future agents should not skip it.

---

# 2. Product Pillars

## 2.1 Combat Readability Over Spectacle

Every slash, hit, dodge, projectile, and enemy tell must read at gameplay scale. The game can be loud, dirty, and cartoonishly violent, but no effect should hide the useful truth of the fight.

Rules:

- Player silhouette must be visible against every combat background.
- Enemy attacks need anticipation, active, and recovery poses.
- VFX should sell impact without covering hitboxes for more than a few frames.
- Hit pause and knockback should communicate impact before particles do.
- Debug hitbox views must exist early.

## 2.2 Foxman Is Charming Trash

Foxman is not a noble hero. He is a fox/man hybrid with swagger, grime, and verbal cruelty aimed at the broken world around him.

Design signals:

- Fox ears, snout, tail, and human posture.
- Ragged coat or busted fantasy adventurer gear.
- Sharp grin and expressive face.
- Slightly hunched, springy, predatory stance.
- A silhouette readable at 1x game zoom.

Personality signals:

- Short barks.
- No rambling monologues during active combat.
- Insults that land on fictional institutions, bosses, enemies, bad deals, fake prophecies, bureaucracy, greed, and cowardice.
- The joke is often that Foxman is also terrible.

## 2.3 Filthy Storybook Violence

The world should look like a storybook that fell behind a tavern stove, soaked up tax records, and came back angry.

Visual signals:

- Hand-painted grime.
- Broken medieval props.
- Corrupt municipal fantasy signage.
- Sewer shrines, rotten boroughs, splintered noticeboards.
- Stained parchment UI.
- Cracked metal trim.
- Muted, dirty backgrounds with high-contrast gameplay lanes.

## 2.4 Adult, Crude, Not Explicit

The game should have adult language and gross satirical humor. It should not rely on explicit sexual content, protected-class harassment, real-world slurs, or hate imagery.

Allowed tone:

- Profanity.
- Absurd insults.
- Gross-out fantasy grime.
- Alcohol-coded tavern decay.
- Fake bureaucracy and corrupt authority.
- Comedic violence.
- Humiliation of fictional villains.

Avoid:

- Explicit sexual acts or sexualized visual assets.
- Protected-class slurs or jokes aimed at real protected groups.
- Hate symbols.
- Real-person defamation.
- Cruelty that is not attached to the fictional world, behavior, institutions, or Foxman's own bad choices.

## 2.5 A Playable Trunk At All Times

Every meaningful implementation step should preserve a runnable game. If a branch cannot boot, that is a stop-the-line issue until fixed.

Minimum trunk health:

- `npm run build` passes once scaffold exists.
- Game boots into a scene.
- No missing critical assets.
- No uncaught startup console errors.
- The current playable scene can be reached.
- Smoke checks are updated as systems appear.
- Manual play remains a first-class gate; autorun-only success is not enough to call a route playable.

---

# 3. Scope Strategy

## 3.1 MVP Definition

The MVP is not a full roguelite campaign. It is a vertical slice proving that the player, world, combat, art direction, and tone can live together.

The first vertical slice should include:

- One playable biome.
- One short route of 60-90 seconds for the earliest smoke slice.
- Later extended to a 10-15 minute slice.
- Foxman movement and one combat chain.
- One to three enemy types.
- One combat room.
- One traversal room.
- One pickup.
- One exit gate.
- HUD health display.
- Death and restart loop.
- Generated art replacing placeholders once accepted.

## 3.2 First Biome Direction

Primary biome name options:

- Rotten Borough.
- Municipal Gutworks.
- The Filth Office.

Working first slice name:

`Rotten Borough: Municipal Gutworks`

Biome identity:

- Corrupt civic fantasy.
- Sewer-fed bureaucracy.
- Tavern alleys.
- Tax ledgers, bribe boxes, rotten cobbles, bile pipes.
- Faded heroic murals defaced by reality.

The first slice should not require a huge tile library. A small, disciplined kit is better:

- Ground.
- Wall.
- One-way platform.
- Edge caps.
- Background arches.
- Sewer grates.
- Barrels.
- Lanterns.
- Broken noticeboards.
- Bile pool hazard.

## 3.3 Must / Should / Cut

### Must For First Playable Slice

- Phaser/Vite/TypeScript app boots.
- A player object moves and collides.
- Camera follows the player.
- One tile/platform layout exists.
- Player can attack.
- One enemy can be damaged and defeated.
- Player can take damage and restart.
- HUD shows health.
- Smoke test confirms boot and canvas render.

### Should For First Vertical Slice

- Foxman generated sprite sheet.
- One generated enemy sprite sheet.
- Generated parallax background.
- Hit pause, camera shake, and particles.
- Pause menu.
- Local storage death count.
- One pickup.
- One exit gate.
- One crude but safe comedy bark system.

### Cut Until Later

- Full procedural generation.
- Full boss.
- Full save system.
- Dialogue tree system.
- Shop economy.
- Multiple biomes.
- Weapon inventory grid.
- Native packaging.
- Multiplayer.

---

# 4. Production Phases

## Phase 0 - Initiative Planning

Goal:

Create the operating docs and master initiative plan.

Exit criteria:

- `PROJECT.md` exists.
- `AGENTS.md` exists.
- `docs/FOXMANS_INITIATIVE.md` exists.
- Ops docs exist under `docs/07-ops/`.
- Architecture direction proposed in an ADR.
- Hopper lists next 5-10 tasks.
- User approves moving from planning to run.

## Phase 1 - Style Lock

Goal:

Design the art direction and prove generated assets can be made consistent enough for production.

Deliverables:

- Foxman concept sheet.
- Three Foxman design candidates.
- One selected Foxman direction.
- First biome mood sheet.
- Enemy concept trio.
- UI style board.
- VFX style board.
- Texture samples.
- Prompt book.
- Asset QA checklist.

Exit criteria:

- Foxman silhouette reads at gameplay scale.
- Selected palette works on foreground, background, UI, and VFX.
- First biome has clear visual identity.
- Content boundary review passes.
- Asset file structure is in place.
- At least one generated project asset is saved into workspace.

## Phase 2 - Engine Skeleton

Goal:

Create a runnable game shell.

Deliverables:

- `package.json`.
- Vite config.
- TypeScript config.
- Phaser game config.
- Boot scene.
- Preload scene.
- Run scene.
- UI scene shell.
- Debug overlay stub.
- Build scripts.

Exit criteria:

- `npm install` succeeds.
- `npm run dev` starts.
- `npm run build` passes.
- Browser shows a nonblank Phaser canvas.
- Smoke test is documented.

## Phase 3 - Movement Sandbox

Goal:

Make Foxman feel good before complex combat.

Deliverables:

- Player entity.
- Player motor.
- Movement constants.
- Keyboard input mapper.
- Jump buffer.
- Coyote time.
- Basic platform collision.
- Camera follow.
- Debug overlay for position/velocity.

Exit criteria:

- Player can run, jump, fall, land, and collide.
- Camera follows smoothly.
- No terrain clipping in normal play.
- Restart works.
- Movement manual checklist passes.

## Phase 4 - Combat Sandbox

Goal:

Implement the first readable combat loop.

Deliverables:

- Health component.
- Damage model.
- Hitbox and hurtbox components.
- One player attack.
- One enemy with patrol, alert, attack, hurt, death.
- Hit pause.
- Knockback.
- Invulnerability frames.
- Debug hitbox display.

Exit criteria:

- Player can hit enemy.
- Enemy can hit player.
- Both can die.
- Attack timing is readable.
- Debug hitboxes match visuals.
- Restart clears state cleanly.

## Phase 5 - First Room Pipeline

Goal:

Build the first authored room or small level.

Deliverables:

- Tilemap loader or simple data-driven room layout.
- Terrain layer.
- Spawn points.
- Enemy spawn factory.
- Exit gate.
- Pickup.
- Camera bounds.
- Combat lock trigger.

Exit criteria:

- Player starts in room.
- Player traverses room.
- Enemy encounter starts and ends.
- Exit unlocks after encounter.
- No missing assets or console errors.

## Phase 6 - Asset Integration Pass

Goal:

Replace placeholders with approved generated assets.

Status:

Completed on 2026-06-25. See `docs/PHASE6_ASSET_INTEGRATION_REPORT.md`.

Deliverables:

- Foxman sprite sheet.
- Enemy sprite sheet.
- Tile kit.
- Background layers.
- UI health bar.
- Hit VFX.
- Dust VFX.

Exit criteria:

- Runtime assets are project-local.
- Atlases load reliably.
- Animation frame sizes are consistent.
- No obvious animation jitter.
- Background does not hurt combat readability.

## Phase 7 - Vertical Slice Polish

Goal:

Turn the sandbox into a replayable micro-slice.

Status:

Completed on 2026-06-25. See `docs/PHASE7_VERTICAL_SLICE_POLISH_REPORT.md`.

Deliverables:

- Title screen.
- Start game flow.
- Death/restart.
- Pause.
- Health HUD.
- One pickup.
- Basic SFX placeholders or first audio pass.
- Comedy bark cooldown system.
- Build smoke.

Exit criteria:

- A player can complete or die and restart.
- Full route is playable from title to exit.
- Build passes.
- Smoke test passes.
- Known issues are documented.

## Phase 8 - Extended Vertical Slice

Goal:

Grow the micro-slice into a 10-15 minute proof.

Status:

V1 candidate accepted. Foundation hooks, second combat/reward path, tax clerk runtime art, committed browser smoke harness, reward choices, elite auditor prototype, Toll Baron mini-boss room, Toll Baron runtime art, a first toll-stamp boss behavior, repeatable Foxman, Drunken Guard, Tax Clerk, Toll Baron, pickup/exit prop, and reward/shop icon atlas exports, a runtime Rotten Borough background export, a first ranged weapon prototype, a first active skill prototype, two mutation prototypes, an upgraded reward/shop choice surface, reward/shop counter runtime art, player damage/death/restart, the visible second-path-to-boss transition, second-path damage/restart, route cohesion, build carry-forward into the boss scene, carried Spite Belch use in the second path and boss fight, interactive shop-card affordances, a skill-oriented boss route, combat HUD readability, visible hit feedback VFX, V1 build-size stabilization, V1 acceptance audit, first-room presentation cleanup, and a visual smoke guard against missing-texture green artifacts are complete; the next open target is post-V1 polish and packaging.

Deliverables:

- Hub corner.
- 3 enemy types.
- 1 elite variant.
- 2 melee weapons.
- 1 ranged option.
- 1 skill.
- 2 mutations.
- Shop or reward room.
- Mini-boss or boss prototype.

Exit criteria:

- Full path can be completed.
- Player can die and restart.
- Save persists at least deaths, kills, and one unlock.
- Difficulty is rough but fair.
- QA finds no P0/P1 blockers.

---

# 5. Phase Gates

## G0 - Scope Lock

Exit criteria:

- Core loop defined.
- Target platform defined.
- Content guardrails defined.
- MVP and vertical-slice scope defined.
- Asset list defined.
- Performance targets defined.
- Must/should/cut list exists.

Evidence:

- This initiative doc.
- `PROJECT.md`.
- `docs/07-ops/NEXT-IN-HOPPER.md`.

## G1 - Art Direction Lock

Exit criteria:

- Foxman design selected.
- First biome mood selected.
- Prompt patterns accepted.
- Asset QA checklist active.
- Content safety review passes.

Evidence:

- Concept images in `assets/source/concepts/`.
- Prompts in `assets/source/prompts/`.
- Accepted runtime assets in `assets/game/`.

## G2 - Engine Boot

Exit criteria:

- App scaffold exists.
- Build passes.
- Dev server runs.
- Phaser canvas renders.
- Smoke test confirms boot.

Evidence:

- `npm run build`.
- Browser screenshot or smoke output.
- No critical console errors.

## G3 - Movement Playable

Exit criteria:

- Player movement feels responsive.
- Collision works for normal terrain.
- Camera follow works.
- Restart works.

Evidence:

- Manual movement checklist.
- Smoke test route.

## G4 - Combat Playable

Exit criteria:

- Player can attack.
- Enemy can attack.
- Health, damage, death, restart work.
- Hitboxes are debuggable.

Evidence:

- Combat checklist.
- Smoke test route.

## G5 - Room Playable

Exit criteria:

- One room or short route can be completed.
- Enemy gate unlocks.
- Pickup works.
- Exit works.

Evidence:

- Manual playthrough notes.
- Build and smoke pass.

## G6 - Vertical Slice Ready

Exit criteria:

- Generated art is integrated.
- HUD works.
- Audio stubs or first SFX exist.
- Death/restart loop works.
- No P0/P1 bugs.

Evidence:

- Playable build.
- QA known-issues list.
- Asset QA pass.

## G7 - Release Candidate For Demo

Exit criteria:

- No open P0/P1.
- P2s fixed or explicitly deferred.
- Build reproducible.
- Production preview tested.
- Release notes exist.

Evidence:

- Tagged build or release branch.
- RC checklist.
- Smoke pass on deployment target.

---

# 6. Asset Production Plan

## 6.1 Visual Pillars

### Filthy Storybook Violence

Dark cartoon fantasy with stained textures, splintered props, busted signs, grimy villages, and exaggerated slapstick impact.

### Foxman Is Charming Trash

Fox/man hybrid protagonist with fox ears, snout, tail, ragged coat, human posture, sharp grin, and swaggering silhouette.

### Satirical Low-Fantasy Decay

The world mocks heroic fantasy through corrupt guards, fake prophecy merchandise, tax collectors, taverns, sewer shrines, bureaucracy banners, and scammy civic institutions.

### Readable Mayhem

Adult comedy and grime cannot damage gameplay clarity. Foreground actors, hazards, interactables, and VFX must separate by silhouette, value, and motion.

## 6.2 Asset Folder Structure

Preferred production structure:

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
      characters/
      enemies/
      vfx/
      ui/
    sprites/
      characters/
        foxman/
      enemies/
      npcs/
    tilesets/
      rotten_borough/
    backgrounds/
      rotten_borough/
        far/
        mid/
        near/
    props/
      rotten_borough/
    ui/
      hud/
      menus/
      icons/
    vfx/
    audio_placeholders/
  docs/
    art_direction.md
    palette.md
    animation_specs.md
    import_notes.md
```

Existing workspace folders should be reconciled into this structure during the asset phase.

## 6.3 Naming Conventions

Use lowercase snake case.

Pattern:

```text
[category]_[biome_or_character]_[asset]_[variant]_[state]_[size].[ext]
```

Examples:

```text
char_foxman_base_run_128.png
char_foxman_base.atlas.json
enemy_guard_drunken_attack_128.png
enemy_rat_sewer_idle_96.png
tile_rotten_borough_ground_32.png
bg_rotten_borough_far_1920x1080.webp
vfx_hit_splatter_red_128.png
ui_hud_health_bar_full.png
icon_pickup_coin_64.png
prop_tavern_barrel_breakable_64.png
```

Animation keys:

```text
foxman_idle
foxman_run
foxman_attack_1
guard_drunken_attack
vfx_hit_splatter
```

## 6.4 Global Prompt DNA

Use this base language for art prompts:

```text
adult satirical dark cartoon fantasy, crude irreverent humor, anthropomorphic fox-man antihero, grimy low fantasy village, exaggerated shapes, readable game art, side-scrolling action game, hand-painted texture detail, sharp silhouette, expressive face, stained parchment, broken medieval props, comedic violence, no explicit sexual content, no hate symbols
```

Negative prompt language:

```text
photorealism, realistic gore, explicit sexual content, fetish content, hate symbols, racist caricature, modern guns, unreadable clutter, tiny details, blurry edges, washed out contrast, UI text, watermark, logo, extra limbs, malformed hands
```

## 6.5 Prompt Patterns

### Character Concept

```text
Use case: stylized-concept
Asset type: character concept sheet for a 2D side-scrolling action game
Primary request: character concept sheet for [CHARACTER]
Subject: [CHARACTER DESCRIPTION]
Style/medium: adult satirical dark cartoon fantasy, hand-painted game concept art
Composition/framing: front, side, and back views plus 3 expressive combat poses on a neutral background
Lighting/mood: readable, grimy, theatrical, not photoreal
Color palette: dirty low-fantasy palette with clear gameplay silhouette
Materials/textures: ragged cloth, cracked leather, tarnished metal, matted fur where relevant
Constraints: readable at small sprite size, no embedded text, no explicit sexual content, no hate symbols
Avoid: photorealism, realistic gore, fetish content, protected-class caricature, extra limbs, malformed hands
```

### Background

```text
Use case: stylized-concept
Asset type: 2D side-scrolling parallax background
Primary request: [LOCATION]
Scene/backdrop: dark satirical fantasy, grimy hand-painted cartoon style
Composition/framing: wide side-scrolling layer with clear gameplay foreground space
Lighting/mood: moody but not so dark that silhouettes disappear
Color palette: desaturated background values, foreground actors must pop
Constraints: no characters, no readable text, no logos, no watermarks
Avoid: cluttered focal areas, high-frequency detail behind combat lanes
```

### Texture

```text
Use case: stylized-concept
Asset type: seamless 2D game texture
Primary request: seamless [MATERIAL] texture
Style/medium: grimy satirical fantasy, hand-painted, tileable
Composition/framing: orthographic texture sample, no perspective
Materials/textures: strong surface detail, clear edges
Constraints: tileable, no text, no symbols
Avoid: photorealism, low contrast, hard lighting direction
```

### UI Kit

```text
Use case: ui-mockup
Asset type: 2D game UI kit
Primary request: stained parchment and cracked metal UI elements for an adult satirical fantasy action game
Style/medium: grimy hand-painted UI, clean readable shapes
Composition/framing: buttons, panels, health bar, coin icon, inventory slot, simple icon frames
Lighting/mood: dirty fantasy noticeboard style
Constraints: no embedded text, high contrast, transparent or removable background
Avoid: tiny unreadable filigree, modern sci-fi UI, explicit imagery, hate symbols
```

## 6.6 Sprite Sheet Specs

Base technical rules:

- Produce large source images, then downscale and clean.
- Work at 4x production resolution when possible.
- Export at native gameplay resolution.
- Prefer a high-res pixel-painted hybrid style over strict 16-bit pixel art.
- Use transparent PNGs for sprites, VFX, and UI.
- Use WebP for large non-alpha backgrounds when quality holds.
- Use packed atlases for runtime.
- Document pivots/origins per atlas.

Frame sizes:

| Asset | Frame Size | Notes |
|---|---:|---|
| Foxman player | `128x128` | Enough for snout, ears, and tail readability. |
| Small enemy | `96x96` | Rats, clerks, pests. |
| Medium enemy | `128x128` | Guards and brutes. |
| Mini-boss | `192x192` | Bigger tells and weapon arcs. |
| Pickup | `32x32` or `48x48` | Readable at speed. |
| VFX burst | `128x128` | Hit sparks, splatter, smoke. |
| UI icons | `64x64` source | Display size can vary. |

Foxman animation set:

| Animation | Frames | FPS | Loop |
|---|---:|---:|---|
| idle | 8 | 8 | yes |
| walk | 10 | 12 | yes |
| run | 10 | 16 | yes |
| jump_start | 4 | 12 | no |
| jump_loop | 2 | 8 | yes |
| fall | 2 | 8 | yes |
| land | 4 | 12 | no |
| attack_1 | 6 | 14 | no |
| attack_2 | 6 | 14 | no |
| heavy_attack | 10 | 12 | no |
| hurt | 4 | 12 | no |
| death | 12 | 10 | no |
| dash | 6 | 18 | no |
| interact | 6 | 10 | no |

Enemy animation set:

| Animation | Frames | FPS | Loop |
|---|---:|---:|---|
| idle | 6 | 8 | yes |
| patrol | 8 | 10 | yes |
| alert | 4 | 10 | no |
| attack | 6-10 | 12 | no |
| hurt | 3 | 12 | no |
| death | 8-12 | 10 | no |

Tileset specs:

- Tile size: `32x32`.
- Chunk sheet target: `512x512`.
- Autotile groups: ground, wall, platform edge, optional slope.
- Collision layer separated from decorative layer.
- Props as separate sprites, not baked into collision tiles.
- Runtime format: PNG plus Tiled JSON or project-local room JSON.

## 6.7 First Vertical-Slice Asset Set

### Player

- `char_foxman_base_concept_sheet.png`
- `char_foxman_base_idle_128.png`
- `char_foxman_base_run_128.png`
- `char_foxman_base_jump_128.png`
- `char_foxman_base_attack_1_128.png`
- `char_foxman_base_hurt_128.png`
- `char_foxman_base_death_128.png`
- `char_foxman_base.atlas.json`

### Enemies

- `enemy_guard_drunken_concept_sheet.png`
- `enemy_guard_drunken_idle_128.png`
- `enemy_guard_drunken_patrol_128.png`
- `enemy_guard_drunken_attack_128.png`
- `enemy_guard_drunken_hurt_128.png`
- `enemy_guard_drunken_death_128.png`
- `enemy_rat_sewer_brute_idle_96.png`
- `enemy_rat_sewer_brute_attack_96.png`
- `enemy_rat_sewer_brute_death_96.png`

### Environment

- `tile_rotten_borough_ground_32.png`
- `tile_rotten_borough_wall_32.png`
- `tile_rotten_borough_platform_32.png`
- `tile_rotten_borough_deco_32.png`
- `prop_tavern_barrel_breakable_64.png`
- `prop_noticeboard_corrupt_96.png`
- `prop_lantern_rusty_64.png`
- `hazard_bile_pool_loop_128.png`

### Backgrounds

- `bg_rotten_borough_far_1920x1080.webp`
- `bg_rotten_borough_mid_1920x1080.webp`
- `bg_rotten_borough_near_1920x1080.webp`

### VFX

- `vfx_hit_spark_dirty_128.png`
- `vfx_hit_splatter_red_128.png`
- `vfx_dust_land_128.png`
- `vfx_barrel_break_128.png`
- `vfx_bile_splash_128.png`

### UI

- `ui_hud_health_bar.png`
- `ui_hud_stamina_bar.png`
- `ui_hud_coin_counter.png`
- `ui_button_grimy_default.png`
- `ui_button_grimy_hover.png`
- `ui_button_grimy_pressed.png`
- `icon_weapon_club_64.png`
- `icon_pickup_coin_64.png`
- `icon_pickup_meat_64.png`

### Key Art

- `keyart_vertical_slice_foxman_rotten_borough.png`
- `splash_title_foxman.png`

## 6.8 Asset Acceptance Criteria

Art direction:

- Foxman silhouette reads clearly at 1x gameplay zoom.
- Tone is crude, adult, satirical, and violent without explicit sexual imagery or hate-coded imagery.
- Assets share palette, lighting direction, line weight, and texture density.
- Backgrounds support gameplay readability.

Technical:

- All sprite sheets have transparent backgrounds.
- No embedded text unless intentionally authored and reviewed.
- Frame sizes are consistent per character.
- Pivots/origins are documented.
- Animations do not jitter unless intentional.
- Tiles align to `32x32`.
- Runtime assets fit Phaser without resizing hacks.

Gameplay readability:

- Attack anticipation, active frames, and recovery poses are visually distinct.
- Enemy danger states are identifiable without UI labels.
- Player, enemies, pickups, hazards, and interactables separate by color/value.
- VFX do not obscure combat longer than a few frames.

---

# 7. Gameplay Design

## 7.1 Core Loop

Long-term loop:

```text
Hub -> Biome 1 -> Upgrade Choice -> Biome 2 -> Elite/Boss -> Hub Unlocks -> Repeat
```

First vertical slice loop:

```text
Title -> Short Route -> Combat Gate -> Pickup -> Exit -> Restart Or Continue
```

Player experience:

1. Start annoyed and under-equipped.
2. Traverse a rotten municipal fantasy environment.
3. Fight enemies with fast melee.
4. Earn a pickup.
5. Survive a locked combat room.
6. Exit through a gate.
7. Die and restart cleanly if Foxman gets what he probably deserves.

## 7.2 Controls

Keyboard and gamepad should be first-class, but keyboard can lead the first implementation.

| Action | Keyboard | Gamepad |
|---|---:|---:|
| Move | A/D | Left stick or D-pad |
| Jump | Space | A/Cross |
| Drop platform | S + Jump | Down + A |
| Dodge roll | Shift | B/Circle |
| Primary attack | J | X/Square |
| Secondary attack | K | Y/Triangle |
| Skill 1 | U | LB |
| Skill 2 | I | RB |
| Interact | E | RT |
| Heal | Q | LT |
| Pause | Esc | Start |

Input rules:

- Buffered jump, attack, dodge, and interact.
- Coyote time: 90-120ms.
- Jump buffer: 100-140ms.
- Dodge has fixed duration, invulnerability window, and recovery frames.
- Input abstraction should allow remapping later.

## 7.3 Movement

Required baseline:

- Run.
- Variable-height jump.
- Fall.
- Land.
- Drop through one-way platforms.
- Dodge roll.
- Wall slide and wall jump after baseline movement if scope allows.
- Strong air control for combat correction.

Movement constants should live in config/data, not be scattered through entity code.

## 7.4 Combat

Core feel:

- Fast.
- Sharp.
- Punchy.
- Punishing but readable.
- A little unfair until learned, never random.

First combat systems:

- Primary melee attack.
- Health.
- Damage.
- Knockback.
- Hurt state.
- Invulnerability after hit.
- Enemy death.
- Player death.
- Hit pause.
- Limited camera shake.
- Hit VFX.

Later systems:

- Primary and secondary weapons.
- Skills.
- Status effects.
- Mutations.
- Elite enemy modifiers.
- Boss patterns.
- Parry only if later scope allows.

Status effect candidates:

- Bleed.
- Burn.
- Poison.
- Stun.
- Vulnerable.
- Cursed.

## 7.5 Enemy AI

Use small state machines.

Baseline states:

```text
Idle -> Patrol -> Alert -> Chase -> Attack -> Recover -> Reposition -> Dead
```

First enemy:

- Drunken guard.
- Patrols.
- Sees player in aggro range.
- Winds up.
- Swings.
- Recovers.
- Can be hit.
- Dies with a readable reaction.

Later archetypes:

- Grunt.
- Leaper.
- Shield Bastard.
- Spitter.
- Exploder.
- Elite variant.

AI principles:

- No instant untelegraphed damage.
- Use aggro volumes and line-of-sight where practical.
- Cap simultaneous melee attackers later.
- Offscreen enemies should not attack unless explicitly designed.
- Attack intent should be visible.

## 7.6 Level Architecture

First slice can use simple authored JSON or hardcoded room data if faster. Tiled import should be added when the room pipeline stabilizes.

Room types:

- Entrance room.
- Traversal room.
- Standard combat room.
- Mixed platform/combat room.
- Treasure room.
- Shop/NPC room.
- Elite challenge room.
- Boss room.
- Exit/interstitial upgrade room.

Tilemap layer plan:

- `terrain`
- `oneWay`
- `hazards`
- `decor`
- `collisionMeta`
- `spawns`
- `triggers`

First route:

```text
Start -> Traversal -> Combat Room -> Pickup -> Exit Gate
```

Extended route:

```text
Hub -> Gutworks Entrance -> Traversal Room -> Combat Room -> Treasure/Shop Choice -> Elite Room -> Boss -> Hub Return
```

## 7.7 Camera

Rules:

- Smooth follow.
- Look-ahead based on facing and movement.
- Vertical dead zone to reduce jump nausea.
- Combat arena can lock camera bounds.
- Boss room uses fixed bounds.
- Debug overlay for camera bounds and trigger zones.

Camera must never hide useful information:

- Foxman.
- Nearby threats.
- Platforms.
- Pickups.
- Hazards.
- Exits.

## 7.8 Save And Progression

First slice can start with a small local storage save service.

Initial save type:

```ts
type SaveData = {
  version: number;
  settings: SettingsData;
  meta: {
    deaths: number;
    totalKills: number;
    unlockedWeapons: string[];
  };
};
```

Rules:

- Add versioning immediately.
- Add migration support early.
- Do not write per frame.
- Settings and meta progression must be separate from current run state.

---

# 8. Engineering Plan

## 8.1 Stack

Planned:

- Vite.
- TypeScript.
- Phaser 3.
- Vitest.
- Playwright for browser smoke once app exists.
- ESLint if added during scaffold.

Why:

- Fast iteration.
- Mature 2D primitives.
- Sprite sheets, cameras, particles, and tilemaps are first-class.
- Browser smoke testing is straightforward.
- Web deployment is simple for a demo.

## 8.2 Code Architecture

Preferred structure:

```text
src/
  main.ts
  game/
    GameConfig.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      HubScene.ts
      RunScene.ts
      UIScene.ts
    entities/
      Player.ts
      enemies/
      projectiles/
      pickups/
    combat/
      DamageTypes.ts
      Hitbox.ts
      Hurtbox.ts
      StatusEffects.ts
      WeaponController.ts
    movement/
      PlayerMotor.ts
      PlatformerPhysics.ts
    ai/
      StateMachine.ts
      EnemyBrain.ts
      steering.ts
    levels/
      TilemapLoader.ts
      RoomManager.ts
      SpawnFactory.ts
    progression/
      SaveService.ts
      RunState.ts
      UnlockRegistry.ts
    input/
      InputMapper.ts
      InputBuffer.ts
    camera/
      CameraController.ts
    ui/
      Hud.ts
      HealthBar.ts
      DialogueToast.ts
    audio/
      AudioService.ts
    data/
      weapons.ts
      enemies.ts
      rooms.ts
```

Implementation rules:

- Scenes own lifecycle.
- Entities own behavior.
- Components own cross-cutting gameplay state.
- Combat numbers live in data/config.
- Hitbox/hurtbox systems emit typed combat events.
- Use registry IDs for weapons, enemies, pickups, and rooms.
- Debug flags should be controlled by config or URL query.
- Avoid per-frame allocations in hot paths.

## 8.3 Initial Scripts

Add these scripts during scaffold if practical:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Validation commands:

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

Scripts that do not exist yet should not be treated as failures before the scaffold creates them. After scaffold, missing validation scripts are a task.

## 8.4 Debug Tooling

Add early:

- FPS display.
- Player position and velocity.
- Current player state.
- Hitbox/hurtbox rendering.
- Enemy state labels.
- Camera bounds overlay.
- Collision tile overlay.
- Toggle via query param or keyboard shortcut.

Debug visuals should not ship enabled by default.

## 8.5 Performance Budget

Targets:

- 60 FPS desktop browser.
- 30 FPS acceptable low-end fallback.
- Initial load under 5 seconds on normal broadband.
- Main JS bundle under 2 MB before heavy art/audio.
- Stress target: 25 normal enemies plus 1 elite.
- Projectile stress target: 80 active projectiles.
- Particles capped by pool.

Budgets:

| System | Budget |
|---|---:|
| Frame time | 16.6ms target |
| Physics/update | < 5ms |
| Rendering | < 7ms |
| AI | < 2ms |
| Garbage spikes | none visible |
| Save write | debounce, never per frame |

Rules:

- Pool projectiles, hit sparks, and floating text.
- No per-frame allocation in hot combat paths.
- Disable or reduce AI thinking for inactive far-off enemies.
- Use texture atlases.
- Avoid oversized runtime PNGs.

---

# 9. QA And Smoke Testing

## 9.1 Definition Of Done

A feature is done only when:

- It is implemented and integrated into the game.
- It has been run in the browser.
- It survives restart or scene reload.
- It has no known P0/P1 defects.
- It has relevant automated tests or a documented manual checklist.
- It handles pause/resume if gameplay time is involved.
- It does not tank performance.
- It updates docs when project truth changes.

Gameplay features must consider:

- Keyboard.
- Gamepad path if promised.
- Pause.
- Restart.
- Checkpoint or failure state.
- Audio behavior.
- Performance impact.

Generated assets must include:

- Prompt/source notes.
- Workspace-local file path.
- Naming convention compliance.
- Content boundary review.
- Technical review.
- Runtime import verification if used in game.

## 9.2 Smoke Cadence

| Cadence | Scope | Trigger |
|---|---|---|
| Per implementation slice | Boot, scene load, movement or touched system, build. | Every meaningful code change. |
| Per asset integration | Asset loads, no 404, visual checks, dimensions match. | Every imported asset batch. |
| Daily during run | Start game, clear current route, death/restart, pause, build. | End of workday or long run segment. |
| Gate review | Full gate checklist. | Before moving to next phase. |
| RC | Browser matrix, production preview, deployment smoke. | Release candidate. |

## 9.3 Manual First-Slice Checklist

Core:

- Game boots to a visible canvas.
- Title or run scene can be reached.
- Player can move left/right.
- Player can jump and land.
- Player cannot clip through normal terrain.
- Camera follows player.
- Player can attack.
- Enemy can be hit.
- Enemy can damage player.
- Player death restarts or resets cleanly.
- Pause stops gameplay if pause exists.
- Build output runs.

Combat:

- Player attack active frames match visible swing.
- Enemy windup is readable.
- Knockback direction is correct.
- Invulnerability prevents rapid unfair multi-hit.
- Enemy death removes or disables damage.
- Hit VFX do not obscure next required reaction.

Platforming:

- No blind jumps in first route.
- One-way platform behavior is consistent if present.
- Hazards have readable bounds.
- Checkpoints or restart points are fair.

Content:

- No explicit sexual content.
- No protected-class harassment.
- No hate symbols.
- Crude jokes are intentional, short, and contextual.
- AI-generated text artifacts are absent unless intentionally authored and reviewed.

Performance:

- FPS is stable on a normal desktop browser.
- No major hitch on restart.
- No memory climb over repeated deaths in a short test.

## 9.4 Automated Test Strategy

Use Vitest for pure TypeScript systems:

- Input buffer timing.
- Damage math.
- Health transitions.
- State machine transitions.
- Save migrations.
- Weapon data validation.
- Enemy data validation.
- Spawn factory missing-ID behavior.

Use Playwright for browser smoke:

- Vite dev or preview build boots.
- Canvas appears and is nonblank.
- No fatal console errors.
- Assets load without 404.
- Keyboard input changes player state.
- Pause opens/closes when present.
- Death/restart route works when present.

Add asset manifest validation:

- Referenced files exist.
- Dimensions match expected frame metadata.
- File names follow conventions.
- Runtime folder excludes unapproved raw assets.
- No must-ship asset is orphaned.

## 9.5 Bug Triage

| Priority | Definition | Rule |
|---|---|---|
| P0 | Crash, boot failure, data loss, unbeatable critical path, deploy broken. | Stop the line. |
| P1 | Major gameplay blocker, frequent soft-lock, severe perf, broken save/checkpoint, content policy violation. | Fix before beta or RC. |
| P2 | Noticeable gameplay bug, bad collision, unclear UI, joke/content issue, asset glitch, browser-specific defect. | Fix or explicitly defer before RC. |
| P3 | Polish issue, minor visual/audio mismatch, rare edge case, low-impact typo. | Batch into polish. |
| P4 | Nice-to-have tuning or enhancement. | Backlog only. |

Every bug needs:

- Build hash or commit.
- Browser/OS.
- Repro steps.
- Expected result.
- Actual result.
- Screenshot or video when visual.
- Severity.
- Owner.
- Affected scene/system.
- Regression test requirement if fixed.

---

# 10. Swarm Coordination Model

The user explicitly invited a multi-swarm, goal-based run. Use sub-agents only when there is clear lane separation and a concrete output.

## 10.1 Lanes

### Producer / Integrator

Owns:

- Project truth.
- Gate sequencing.
- Final integration.
- User updates.
- Scope cuts.
- Docs alignment.

### Asset Generation Lane

Owns:

- Prompt book.
- Concept candidates.
- Sprite sheets.
- Backgrounds.
- Tile kits.
- UI/VFX assets.
- Asset QA notes.

Write scope:

- `assets/source/`
- `assets/game/`
- `assets/docs/`
- Asset-related docs.

### Gameplay Lane

Owns:

- Player.
- Movement.
- Combat.
- Enemy AI.
- Camera.
- Level interactions.

Write scope:

- `src/game/entities/`
- `src/game/movement/`
- `src/game/combat/`
- `src/game/ai/`
- `src/game/camera/`
- Related tests.

### Level / World Lane

Owns:

- Tilemap pipeline.
- Room data.
- Spawn data.
- Gate triggers.
- Hazards.

Write scope:

- `src/game/levels/`
- `src/game/data/rooms.ts`
- `assets/game/tilesets/`
- Level test fixtures.

### UI / UX Lane

Owns:

- HUD.
- Menus.
- Pause.
- Dialogue toasts.
- Input prompts.

Write scope:

- `src/game/ui/`
- `src/game/scenes/*Menu*`
- `assets/game/ui/`

### QA / Release Lane

Owns:

- Test plan.
- Smoke scripts.
- Playwright checks.
- Bug reports.
- Gate reports.

Write scope:

- `tests/`
- `playwright.config.*`
- QA docs.
- CI scripts if added.

## 10.2 Swarm Rules

- Do not assign two agents to the same write scope at the same time.
- Every worker must know it is not alone in the codebase.
- Workers must not revert unrelated edits.
- Agents should return changed files, validation results, risks, and follow-ups.
- Integrator reviews outputs before accepting.
- P0/P1 defects interrupt feature work.
- The trunk must stay playable.

## 10.3 Reporting Cadence

During long runs:

- Short status update every meaningful stage or about every 30 seconds.
- Gate report at the end of each phase.
- QA pulse after smoke tests.
- Asset QA summary after each generated batch.
- Shipping update after meaningful work.

Report types:

| Report | Timing | Contents |
|---|---|---|
| Daily QA Pulse | End of long work segment | Build health, smoke result, new P0/P1/P2 count, blockers. |
| Gate Report | Each gate | Exit criteria, pass/fail, risks, approved cuts, next target. |
| Playtest Report | After sessions | Completion rate, deaths, confusion points, funniest beats, bugs. |
| Asset QA Report | During asset phase | Approved/rejected assets, rework reasons, policy flags, size/perf notes. |
| RC Report | Release candidates | Test matrix, unresolved defects, recommendation. |

---

# 11. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Adult comedy crosses line | Rework and release risk | Content boundaries, review gate, no explicit sexual or protected-class harassment. |
| AI asset inconsistency | Visual incoherence | Concept lock, prompt templates, reference images, cleanup pass. |
| Animation jitter | Bad game feel | Fixed frame sizes, pivot docs, onion-skin cleanup, import test early. |
| Background clutter | Combat unreadable | Desaturate backgrounds, strong foreground contrast, QA readability pass. |
| Phaser collision edge cases | Player frustration | Collision test level, debug overlay, manual platforming checklist. |
| Scope creep | Momentum collapse | Must/should/cut list, gate-based cuts. |
| Browser audio quirks | Broken web feel | Early mute/autoplay handling, cross-browser smoke. |
| Performance spikes | Bad action feel | FPS overlay, pools, asset budgets, stress scenes. |
| Weak automated coverage | Late regressions | Vitest pure systems, Playwright smoke, asset validation. |
| Asset storage chaos | Broken references | Workspace-local final assets, naming conventions, manifest validation. |

---

# 12. First Run Plan After Approval

This is the proposed execution order once the user says to run.

## Run 1 - Scaffold And Boot

Owner:

- Main integrator or engineering worker.

Tasks:

- Create Vite + TypeScript + Phaser project.
- Add scripts.
- Add scenes.
- Add empty game canvas.
- Add build validation.
- Add first browser smoke path.

Acceptance:

- `npm install` succeeds.
- `npm run build` succeeds.
- Dev server boots.
- Canvas is nonblank.

## Run 2 - Style Candidates

Owner:

- Asset lane.

Tasks:

- Generate Foxman concept candidates.
- Generate first biome mood candidate.
- Save accepted previews into workspace.
- Log prompts.

Acceptance:

- At least 3 Foxman concepts.
- At least 2 Rotten Borough mood images.
- User or integrator selects direction.

## Run 3 - Movement Sandbox

Owner:

- Gameplay lane.

Tasks:

- Implement player movement.
- Add platform collision.
- Add camera follow.
- Add debug overlay.

Acceptance:

- Player moves, jumps, lands.
- Camera follows.
- Manual movement smoke passes.

## Run 4 - Combat Sandbox

Owner:

- Gameplay lane.

Tasks:

- Add hitboxes/hurtboxes.
- Add player attack.
- Add one enemy.
- Add health/death/restart.

Acceptance:

- Player and enemy can damage each other.
- Death/restart works.
- Debug hitbox view works.

## Run 5 - First Asset Import

Owner:

- Asset lane plus integrator.

Tasks:

- Import first Foxman or placeholder-style generated sprite.
- Import background or tile kit.
- Wire into scene.
- Validate dimensions and readability.

Acceptance:

- Assets are project-local.
- Runtime loads without 404.
- Visuals do not obscure gameplay.

## Run 6 - First Room

Owner:

- Level lane.

Tasks:

- Build short route.
- Add enemy gate.
- Add pickup.
- Add exit.

Acceptance:

- Route can be completed.
- Exit unlocks after enemy defeated.
- Smoke passes.

---

# 13. Immediate Next Task

The next task should be taken from `docs/07-ops/NEXT-IN-HOPPER.md`.

Current next gate: apply the atlas export workflow to more large generated assets so the build payload keeps shrinking as the slice grows.

---

# 14. Approval Checklist

Before running the build phase, confirm:

- [ ] The stack direction is acceptable.
- [ ] The crude adult tone boundaries are acceptable.
- [ ] The first biome direction is acceptable.
- [ ] The first vertical-slice scope is acceptable.
- [ ] The gate sequence is acceptable.
- [ ] Asset generation should begin before or alongside the engine scaffold.
- [ ] The user approves moving from plan to run.
