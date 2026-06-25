# Phase 8 Combat HUD Readability Report

Date: 2026-06-26  
Phase: Phase 8 - Extended Vertical Slice  
Status: Complete

## Summary

The combat HUD now reflects the expanded slice instead of assuming the first-room prototype state. It displays max-health-aware HP, weapon, skill lock/readiness, route state, and current target health.

This makes reward, mutation, skill, second-path, and boss states legible without relying only on debug text.

## Gameplay / UI Changes

- Reworked `UIScene` into a compact top-right combat panel.
- Health now uses `playerMaxHealth` when present, so Audit Shield and Hangover Hide can show `6/6`.
- Weapon text continues to show the current weapon.
- Skill text now only shows a skill when `skillUnlocked=true`; otherwise it shows `Skill: none`.
- Skill text shows `(ready)` or `(cooling)` from the scene cooldown dataset.
- Route text summarizes first room, audit office, boss door, toll baron, or boss-cleared state.
- Target text summarizes guard, tax clerk / elite auditor, or Toll Baron health.
- HUD text is mirrored into `hudHealthText`, `hudWeaponText`, `hudSkillText`, `hudRouteText`, and `hudTargetText` datasets for smoke QA.

## Smoke Coverage Added

The browser smoke suite now verifies:

- Starting HUD weapon text is `Weapon: Rusty Knife`.
- Ranged route shows `Skill: none`, preventing locked skills from appearing ready.
- Skill route shows Spite Belch and cooldown state.
- Reward/shop skill route shows Spite Belch and `Route: boss door`.
- Audit Shield route shows `HP: 6/6`.
- Connected boss and full-slice boss routes expose target and route HUD state.
- Skill-to-boss route shows Spite Belch, `Route: boss cleared`, and `Target: Toll Baron 0`.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run smoke:browser`
- `npm run smoke:all`

## Follow-Ups

- Add hit VFX and readable impact feedback outside debug hitboxes.
- Add clearer boss pressure warnings for the toll stamp.
- Consider moving debug text behind a dev flag once player-facing HUD coverage is broader.
