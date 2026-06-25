# Asset Log

This log tracks generated assets that have been copied into the workspace.

## 2026-06-25 - Phase 1 Concept Batch 001

Generation mode: built-in image generation tool  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`

These files are accepted as concept and art-direction references only. They are not runtime-ready sprites because they are RGB concept sheets with backgrounds, shadows, and unsliced poses.

| Asset ID | Workspace Path | Source Generated File | Status | Intended Use |
|---|---|---|---|---|
| `char_foxman_base_concept_sheet` | `assets/source/concepts/char_foxman_base_concept_sheet.png` | `ig_06fa47a028984a68016a3ced56115c819186ddb845e8d9e8e9.png` | Accepted concept | Foxman candidate A, base coat-heavy rogue direction. |
| `char_foxman_candidate_b_concept_sheet` | `assets/source/concepts/char_foxman_candidate_b_concept_sheet.png` | `ig_0512a172103e487c016a3cef3380048191a482938911b3bf20.png` | Recommended base concept | Leaner Foxman candidate, strongest player silhouette. |
| `char_foxman_candidate_c_concept_sheet` | `assets/source/concepts/char_foxman_candidate_c_concept_sheet.png` | `ig_0512a172103e487c016a3cefa8f85c81919820a1dc218d78f4.png` | Accepted reference | Feral combat-pose reference, likely too bulky for base. |
| `enemy_guard_drunken_concept_sheet` | `assets/source/concepts/enemy_guard_drunken_concept_sheet.png` | `ig_06fa47a028984a68016a3ced938b548191bb3ecc2c021be198.png` | Accepted concept | First medium enemy. |
| `enemy_rat_sewer_brute_concept_sheet` | `assets/source/concepts/enemy_rat_sewer_brute_concept_sheet.png` | `ig_0512a172103e487c016a3cf0229dd0819181e3d56b3b95dd1e.png` | Accepted with cleanup note | First small/medium beast enemy. |
| `enemy_tax_clerk_concept_sheet` | `assets/source/concepts/enemy_tax_clerk_concept_sheet.png` | `ig_0512a172103e487c016a3cf06d28dc81919a45b24c0ad31ee0.png` | Accepted concept | Satirical ranged or skirmisher enemy. |
| `bg_rotten_borough_mood` | `assets/source/concepts/bg_rotten_borough_mood.png` | `ig_06fa47a028984a68016a3cedd94f648191896ef9f3730c4025.png` | Accepted concept | Biome mood and parallax composition reference. |
| `bg_rotten_borough_mood_runtime` | `assets/game/backgrounds/rotten_borough/bg_rotten_borough_mood_runtime.webp` | `assets/source/concepts/bg_rotten_borough_mood.png` | Accepted runtime background | Optimized in-game Rotten Borough background used by title, room, second path, and boss scenes. |
| `reward_shop_counter_raw` | `assets/source/ai_raw/reward_shop_counter_raw.png` | `ig_0cfb5b534eed7593016a3d8b7c171c8191b0259023d1062cda.png` | Accepted source art | Reward/shop counter backdrop source for the build-choice room. |
| `reward_shop_counter_runtime` | `assets/game/ui/menus/reward_shop_counter_runtime.webp` | `assets/source/ai_raw/reward_shop_counter_raw.png` | Accepted runtime UI art | Optimized reward/shop counter backdrop used behind the build-choice cards. |
| `reward_shop_icon_board_raw` | `assets/source/ai_raw/reward_shop_icon_board_raw.png` | `ig_05fd2cd18d1797b2016a3d8dc5829481919f755f630f0eddb6.png` | Accepted source art | Four-icon source board for weapon, survival, skill, and mutation shop categories. |
| `reward_shop_icons_atlas` | `assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.png` | `assets/game/atlases/ui/reward_shop_icons/atlas-spec.json` | Accepted runtime UI atlas | Named-frame shop category icon atlas. |
| `tile_rotten_borough_concept_sheet` | `assets/source/concepts/tile_rotten_borough_concept_sheet.png` | `ig_06fa47a028984a68016a3cee37deb08191b912f69f1feaeebb.png` | Accepted concept | Tile and prop visual reference. |
| `ui_vfx_style_board` | `assets/source/concepts/ui_vfx_style_board.png` | `ig_06fa47a028984a68016a3cee800a008191b0171ed423ac745f.png` | Accepted concept | HUD, icon, and combat VFX reference. |
| `texture_rotten_borough_material_board` | `assets/source/concepts/texture_rotten_borough_material_board.png` | `ig_01f039e54f1cf97e016a3cf1f84a648191bc375b0e86e3347b.png` | Accepted concept | Material reference for stone, wood, metal, parchment, cloth, fur, slime, and leather. |
| `char_foxman_candidate_b_prototype_sheet_alpha` | `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png` | `ig_07f1e0a435f1c673016a3cf35131808191ba31f496b5131dbf.png` | Accepted prototype | First transparent runtime bridge sheet for Foxman poses. |

## Current Style-Lock Recommendation

Use `char_foxman_candidate_b_concept_sheet.png` as the base Foxman direction.

Reasons:

- Strongest clean player silhouette.
- Less coat clutter than candidate A.
- More agile than candidate C.
- Ears, snout, scarf, tail, and dagger pose all read well for side-scroller animation.

Borrow from other candidates:

- Candidate A: longer ragged coat and dirtier mercenary attitude.
- Candidate C: more aggressive crouch and attack energy.

## Runtime Follow-Ups

- Create transparent Foxman idle/run/attack sprite prototype from candidate B direction.
- Create transparent drunken guard idle/attack prototype.
- Slice or redraw tile kit into true `32x32` tiles.
- Convert mood background into parallax layers.
- Split UI/VFX board into separate clean PNGs with alpha.
- Use material board to normalize cleanup/detail density across runtime sprites.

Completed in this batch:

- First transparent Foxman prototype sheet: `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png`.

## 2026-06-25 - Phase 6 Runtime Asset Integration

Generation mode: built-in image generation tool plus chroma-key cleanup  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`

| Asset ID | Workspace Path | Source Generated File | Status | Intended Use |
|---|---|---|---|---|
| `enemy_guard_drunken_runtime_sheet_alpha` | `assets/game/sprites/enemies/enemy_guard_drunken_runtime_sheet_alpha.png` | `ig_01060623088d102d016a3d37984858819199eb40d33da3b37c.png` | Accepted runtime prototype | Transparent guard sheet for idle, patrol, alert, attack, hurt, and dead crops. |
| `prop_pickup_exit_runtime_sheet_alpha` | `assets/game/props/rotten_borough/prop_pickup_exit_runtime_sheet_alpha.png` | `ig_01060623088d102d016a3d3810129c81919b4f9a1b4270859d.png` | Accepted runtime prototype | Butcher Saber pickup, pickup ring, locked gate, unlocked gate, lock icon, and exit arrow crops. |

Phase 6 validation:

- Runtime crop metadata added in `src/game/assetFrames.ts`.
- Browser smoke confirmed pickup, guard kill, exit unlock, and room completion.
- Raw drunken guard concept sheet removed from the production asset registry.

## 2026-06-25 - Phase 8 Tax Clerk Runtime Sheet

Generation mode: built-in image generation tool plus chroma-key cleanup  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`

| Asset ID | Workspace Path | Source Generated File | Status | Intended Use |
|---|---|---|---|---|
| `enemy_tax_clerk_runtime_sheet_alpha` | `assets/game/sprites/enemies/enemy_tax_clerk_runtime_sheet_alpha.png` | `ig_01e6dfe878572b0a016a3d454baef881918bda7de3a29fc726.png` | Accepted runtime prototype | Transparent tax clerk sheet for idle, patrol, alert, attack, hurt, and dead crops. |

Chroma cleanup:

- Raw chroma source copied to `assets/source/ai_raw/enemy_tax_clerk_runtime_sheet_chroma.png`.
- Key color: `#05f806`.
- Transparent pixels: `1,222,359 / 1,573,538`.
- Partially transparent pixels: `19,733 / 1,573,538`.

Phase 8 validation:

- Runtime crop metadata added in `src/game/assetFrames.ts` as `TaxClerkFrames`.
- `SecondRunScene` uses tax clerk-specific generated art through the `taxClerk` enemy variant.
- `npm run smoke:all` confirms title/pause, first room, reward handoff, and second path.

## 2026-06-26 - Phase 8 Toll Baron Runtime Sheet

Generation mode: built-in image generation tool plus chroma-key cleanup  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`

| Asset ID | Workspace Path | Source Generated File | Status | Intended Use |
|---|---|---|---|---|
| `enemy_toll_baron_runtime_sheet_alpha` | `assets/game/sprites/enemies/enemy_toll_baron_runtime_sheet_alpha.png` | `ig_0c65bec2eba22021016a3d5d91590481918c4d511c629ba9c1.png` | Accepted runtime prototype | Transparent Toll Baron mini-boss sheet for idle, patrol/stomp, alert/taunt, slam attack, hurt, and dead crops. |

Chroma cleanup:

- Raw chroma source copied to `assets/source/ai_raw/enemy_toll_baron_runtime_sheet_chroma.png`.
- Key color: `#08f909`.
- Transparent pixels: `940,482 / 1,572,864`.
- Partially transparent pixels: `17,973 / 1,572,864`.

Phase 8 validation:

- Runtime crop metadata added in `src/game/assetFrames.ts` as `TollBaronFrames`.
- `MiniBossScene` uses the Toll Baron-specific generated art through the `tollBaron` enemy variant.
- Browser smoke confirms the boss route completes after at least one toll-stamp special.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Toll Baron Atlas Export

Export mode: local atlas export script from accepted alpha sheet  
Source sheet: `assets/game/sprites/enemies/enemy_toll_baron_runtime_sheet_alpha.png`  
Repeatable command: `npm run assets:atlas:toll-baron`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `toll_baron_atlas_png` | `assets/game/atlases/enemies/toll_baron/toll_baron_atlas.png` | `assets/game/atlases/enemies/toll_baron/atlas-spec.json` | Accepted runtime atlas | Compact Phaser atlas image for Toll Baron named frames. |
| `toll_baron_atlas_json` | `assets/game/atlases/enemies/toll_baron/toll_baron_atlas.json` | `assets/game/atlases/enemies/toll_baron/atlas-spec.json` | Accepted runtime atlas metadata | Phaser atlas JSON for `idle`, `patrol`, `alert`, `attack`, `hurt`, and `dead`. |

Size result:

- Full source sheet: about `1.7 MB`.
- Exported atlas image: about `396 KB`.
- Production build emitted atlas image: about `405 KB`.

Phase 8 validation:

- `tollBaronRuntime` keeps its stable asset key but now loads through `this.load.atlas`.
- Browser smoke confirms the mini-boss route still completes with Toll Baron art and boss special telemetry.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Tax Clerk Atlas Export

Export mode: local atlas export script from accepted alpha sheet  
Source sheet: `assets/game/sprites/enemies/enemy_tax_clerk_runtime_sheet_alpha.png`  
Repeatable command: `npm run assets:atlas:tax-clerk`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `tax_clerk_atlas_png` | `assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.png` | `assets/game/atlases/enemies/tax_clerk/atlas-spec.json` | Accepted runtime atlas | Compact Phaser atlas image for Tax Clerk and Elite Auditor named frames. |
| `tax_clerk_atlas_json` | `assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.json` | `assets/game/atlases/enemies/tax_clerk/atlas-spec.json` | Accepted runtime atlas metadata | Phaser atlas JSON for `idle`, `patrol`, `alert`, `attack`, `hurt`, and `dead`. |

Size result:

- Full source sheet: about `1.0 MB`.
- Exported atlas image: about `222 KB`.
- Production build emitted atlas image: about `227 KB`.

Phase 8 validation:

- `taxClerkRuntime` keeps its stable asset key but now loads through `this.load.atlas`.
- `taxClerk` and `eliteAuditor` variants use named atlas frames.
- Browser smoke confirms reward, second path, second-path death/restart, and connected boss routes.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Drunken Guard Atlas Export

Export mode: local atlas export script from accepted alpha sheet  
Source sheet: `assets/game/sprites/enemies/enemy_guard_drunken_runtime_sheet_alpha.png`  
Repeatable command: `npm run assets:atlas:drunken-guard`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `drunken_guard_atlas_png` | `assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.png` | `assets/game/atlases/enemies/drunken_guard/atlas-spec.json` | Accepted runtime atlas | Compact Phaser atlas image for Drunken Guard named frames. |
| `drunken_guard_atlas_json` | `assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.json` | `assets/game/atlases/enemies/drunken_guard/atlas-spec.json` | Accepted runtime atlas metadata | Phaser atlas JSON for `attack`, `idle`, `patrol`, `alert`, `hurt`, and `dead`. |

Size result:

- Full source sheet: about `1.1 MB`.
- Exported atlas image: about `230 KB`.
- Production build emitted atlas image: about `236 KB`.

Phase 8 validation:

- `drunkenGuardRuntime` keeps its stable asset key but now loads through `this.load.atlas`.
- `drunkenGuard` uses named atlas frames.
- Browser smoke confirms title/start, first room, reward, second path, connected boss, boss, and death/restart routes.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Pickup And Exit Prop Atlas Export

Export mode: local atlas export script from accepted alpha sheet  
Source sheet: `assets/game/props/rotten_borough/prop_pickup_exit_runtime_sheet_alpha.png`  
Repeatable command: `npm run assets:atlas:pickup-exit`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `pickup_exit_atlas_png` | `assets/game/atlases/props/rotten_borough/pickup_exit_atlas.png` | `assets/game/atlases/props/rotten_borough/atlas-spec.json` | Accepted runtime atlas | Compact Phaser atlas image for pickups, gates, lock icon, and exit arrow. |
| `pickup_exit_atlas_json` | `assets/game/atlases/props/rotten_borough/pickup_exit_atlas.json` | `assets/game/atlases/props/rotten_borough/atlas-spec.json` | Accepted runtime atlas metadata | Phaser atlas JSON for `lockedGate`, `unlockedGate`, `butcherSaber`, `pickupRing`, `lockIcon`, and `exitArrow`. |

Size result:

- Full source sheet: about `1.1 MB`.
- Exported atlas image: about `211 KB`.
- Production build emitted atlas image: about `217 KB`.

Phase 8 validation:

- `pickupExitRuntime` keeps its stable asset key but now loads through `this.load.atlas`.
- First-room pickups/gate and second-path boss door use named atlas frames.
- Browser smoke confirms first room, reward, second path, connected boss, boss, and death/restart routes.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Foxman Atlas Export

Export mode: local atlas export script from accepted alpha sheet  
Source sheet: `assets/game/sprites/characters/foxman/char_foxman_candidate_b_prototype_sheet_alpha.png`  
Repeatable command: `npm run assets:atlas:foxman`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `foxman_atlas_png` | `assets/game/atlases/characters/foxman/foxman_atlas.png` | `assets/game/atlases/characters/foxman/atlas-spec.json` | Accepted runtime atlas | Compact Phaser atlas image for Foxman's prototype idle, run, jump, attack, hurt, and dash poses. |
| `foxman_atlas_json` | `assets/game/atlases/characters/foxman/foxman_atlas.json` | `assets/game/atlases/characters/foxman/atlas-spec.json` | Accepted runtime atlas metadata | Phaser atlas JSON for named Foxman player pose frames. |

Size result:

- Full source sheet: about `940 KB`.
- Exported atlas image: about `196 KB`.
- Production build emitted atlas image: about `194 KB`.

Phase 8 validation:

- `foxmanPrototype` keeps its stable asset key but now loads through `this.load.atlas`.
- Player pose changes use named atlas frames instead of runtime crop rectangles.
- Browser smoke confirms title/start, first room, reward, second path, connected boss, boss, and death/restart routes.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Rotten Borough Runtime Background Export

Export mode: local runtime background export script from accepted concept PNG  
Source image: `assets/source/concepts/bg_rotten_borough_mood.png`  
Repeatable command: `npm run assets:bg:rotten-borough`

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `bg_rotten_borough_mood_runtime` | `assets/game/backgrounds/rotten_borough/bg_rotten_borough_mood_runtime.webp` | `assets/source/concepts/bg_rotten_borough_mood.png` | Accepted runtime background | Runtime-sized WebP background for current Rotten Borough scenes. |

Size result:

- Full source PNG: about `2.2 MB`.
- Exported runtime WebP: about `116 KB`.
- Production build emitted WebP: about `118 KB`.

Phase 8 validation:

- `rottenBoroughMood` keeps its stable asset key but now points to the optimized runtime WebP.
- Title, first room, second path, and mini-boss scenes continue to load the same key.
- Browser smoke confirms all current routes render and complete.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Reward Shop Counter Runtime Art

Generation mode: built-in image generation tool plus local runtime WebP export  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`

Prompt summary:

- Grimy fantasy tax-office reward/shop counter.
- Empty central choice area for Phaser UI overlays.
- No characters, no readable text, no logos, no watermark.
- Dirty amber candlelight, cool blue shadows, brass, parchment, chipped plaster, rotten borough tone.

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `reward_shop_counter_raw` | `assets/source/ai_raw/reward_shop_counter_raw.png` | `ig_0cfb5b534eed7593016a3d8b7c171c8191b0259023d1062cda.png` | Accepted source art | Source image for reward/shop room presentation. |
| `reward_shop_counter_runtime` | `assets/game/ui/menus/reward_shop_counter_runtime.webp` | `assets/source/ai_raw/reward_shop_counter_raw.png` | Accepted runtime UI art | Optimized WebP backdrop for `RewardScene`. |

Size result:

- Raw generated PNG: about `2.1 MB`.
- Runtime WebP: about `104 KB`.
- Production build emitted WebP: about `104 KB`.

Phase 8 validation:

- `rewardShopCounter` asset key added and preloaded.
- `RewardScene` renders the shop art behind the five build-choice cards.
- Browser smoke confirms default reward handoff and Petty Grudge shop selection.
- `npm run smoke:all` passes.

## 2026-06-26 - Phase 8 Reward Shop Category Icon Atlas

Generation mode: built-in image generation tool plus local atlas export  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`  
Repeatable command: `npm run assets:atlas:reward-shop-icons`

Prompt summary:

- Four square fantasy shop category icons in a precise 2x2 board.
- Weapon: crossed tax pike and butcher saber.
- Survival: battered audit shield and cracked heart.
- Skill: corked bottle and orange belch cloud.
- Mutation: warped fox paw and stamped parchment.
- No text, no numbers, no signs, no watermark.

| Asset ID | Workspace Path | Source | Status | Intended Use |
|---|---|---|---|---|
| `reward_shop_icon_board_raw` | `assets/source/ai_raw/reward_shop_icon_board_raw.png` | `ig_05fd2cd18d1797b2016a3d8dc5829481919f755f630f0eddb6.png` | Accepted source art | Source board for shop category icon crops. |
| `reward_shop_icons_atlas_png` | `assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.png` | `assets/game/atlases/ui/reward_shop_icons/atlas-spec.json` | Accepted runtime UI atlas | Phaser atlas image for `weapon`, `survival`, `skill`, and `mutation` icons. |
| `reward_shop_icons_atlas_json` | `assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.json` | `assets/game/atlases/ui/reward_shop_icons/atlas-spec.json` | Accepted runtime UI atlas metadata | Named frame metadata for reward/shop category icons. |

Size result:

- Raw generated PNG: about `2.5 MB`.
- Runtime atlas PNG: about `452 KB`.
- Production build emitted atlas PNG: about `446 KB`.

Phase 8 validation:

- `rewardShopIcons` asset key added and preloaded as a Phaser atlas.
- `RewardScene` renders category icons for all five build-choice cards.
- Browser smoke confirms default reward handoff and Petty Grudge shop selection.
- `npm run smoke:all` passes.
