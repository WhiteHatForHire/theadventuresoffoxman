# Phase 8 Reward / Shop Art Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The reward/shop room now uses dedicated generated counter art instead of a purely geometric backdrop. The art keeps the center calm for UI cards, frames the scene with Rotten Borough props, and avoids embedded text so Phaser controls all readable labels.

## Asset

- Raw generated source: `assets/source/ai_raw/reward_shop_counter_raw.png`
- Runtime asset: `assets/game/ui/menus/reward_shop_counter_runtime.webp`
- Runtime key: `rewardShopCounter`
- Production emitted size: about `104 KB`

## Prompt Summary

Generated with the built-in image generation tool using a prompt for a grimy fantasy tax-office reward/shop counter, empty central choice area, no characters, no readable text, no logos, dirty amber candlelight, cool blue shadows, brass, parchment, chipped plaster, and Rotten Borough tone.

## Integration

- Added `rewardShopCounter` to the asset registry.
- Preloaded the reward/shop art in `PreloadScene`.
- Rendered it in `RewardScene` behind the five build-choice cards.
- Kept all existing reward/shop handoff behavior unchanged.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

The full browser smoke suite passed across title/start, first room, ranged combat, skill combat, reward/shop default handoff, reward/shop Petty Grudge selection, second path, audit shield reward, both direct mutation routes, second-path death/restart, connected boss route, mini-boss completion, and boss death/restart.

## Follow-Ups

- Continue into route cohesion and balance now that category icons exist.
- Add selected/hover states when the shop becomes mouse/controller navigable.
- Consider a dedicated shopkeeper/NPC later if it does not clutter the choice surface.
