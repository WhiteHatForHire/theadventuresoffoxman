# Toll Baron Runtime Sheet Prompt

Date: 2026-06-26  
Generation mode: built-in image generation tool  
Generated source folder: `/Users/marcusvale/.codex/generated_images/019efded-55a7-70b2-b1cc-a74407c414c9/`  
Accepted source file: `ig_0c65bec2eba22021016a3d5d91590481918c4d511c629ba9c1.png`

## Prompt

Use case: stylized-concept  
Asset type: 2D side-scrolling action game enemy runtime sprite sheet, project asset for transparent-background extraction  
Primary request: Create a boss sprite sheet for The Adventures of Foxman, a Merciless Bastard.

Subject: A grotesque corrupt Toll Baron mini-boss, a fox-world aristocratic gatekeeper and tax lord: obese but dangerous silhouette, powdered wig fragments, cracked brass toll booth armor, coin sacks, ledger straps, heavy boots, and a brutal toll-stamp hammer/mace. He should feel bawdy, nasty, darkly comic, and readable at small in-game scale without explicit sexual imagery.

Composition/framing: One clean 3 by 2 sprite sheet on a perfectly flat solid `#00ff00` chroma-key background. Six full-body side-view poses with generous padding, evenly spaced: idle bracing with hammer, stomp/walk, command/taunt pointing at player, heavy stamp/hammer slam attack, hurt recoil, dead/collapsed. All poses face right. Keep each pose separated, no overlap.

Style/medium: Hand-painted 2D game art, grimy satirical fantasy, chunky side-scroller readability, crisp silhouette, painterly texture, high contrast edges.

Lighting/mood: Moody amber rim light baked into character only; background stays perfectly flat chroma key.

Color palette: Rusted brass, burgundy cloth, dirty ivory wig, coin gold, bruised red skin tones; do not use `#00ff00` anywhere in the subject.

Materials/textures: Tarnished metal, greasy fabric, scratched leather, dirty paper ledger, stamped wax seals.

Constraints: Background must be one uniform `#00ff00` color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. No cast shadow, no contact shadow, no text, no watermark. Keep the subject fully separated from the background with crisp edges and generous padding. Runtime sprite sheet should be a single image, not separate panels, with no grid lines.

## Accepted Output

- Raw chroma source: `assets/source/ai_raw/enemy_toll_baron_runtime_sheet_chroma.png`
- Runtime alpha sheet: `assets/game/sprites/enemies/enemy_toll_baron_runtime_sheet_alpha.png`
- Frame metadata: `src/game/assetFrames.ts` as `TollBaronFrames`
