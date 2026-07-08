# Foxman Full Game Initiative

Date: 2026-07-08  
Project: `The Adventures of Foxman, a Merciless Bastard`  
Current build base: accepted V1 extended vertical slice  
Target: full desktop-web campaign prototype, then public demo hardening

---

# 1. Intent

The V1 slice proves that Foxman can move, fight, loot, pick rewards, clear a second path, and beat a mini-boss. The next initiative is to stop treating that as a standalone demo and grow it into a full game structure: acts, level chains, escalating enemy mixes, bosses, rewards, persistent progression, and a finish state.

The game should become a compact but complete 2D side-scrolling action campaign:

- Act-based campaign progression.
- Multiple connected levels per act.
- A reward/shop beat between combat clusters.
- At least one boss per act.
- A final boss and ending state.
- Repeatable smoke coverage for every critical route.
- Manual-play sanity checks for traversal and combat feel.

This is still gate-based. The point is not to generate a giant hollow shell. The point is to expand one playable, tested trunk into a full structure without losing the controls, readability, or art direction.

---

# 2. Full Game Shape

## 2.1 Campaign Structure

The first complete campaign should contain five acts:

1. **Rotten Borough: Municipal Gutworks**  
   Existing V1 spine. Teaches movement, melee, ranged pickup, shop/reward, second path, and Toll Baron.

2. **The Sump Warrens**  
   Post-boss sewer traversal and mixed-enemy gauntlet. Teaches dash under pressure, vertical room routing, and multi-wave combat.

3. **Ledger Cathedral**  
   A bureaucratic cathedral with tax clerks, elite auditors, paper hazards, locked doors, and branching reward rooms.

4. **The Mayor's Feast Works**  
   A grim banquet-machine biome with heavier enemy mixes, moving platforms, food-waste hazards, and mid-boss ambushes.

5. **Crown Office of Regrettable Consequences**  
   Final act. Combines all verbs and enemies, then ends with a two-phase boss and campaign-complete screen.

## 2.2 Minimum Complete Campaign

The smallest truthful "full game" build is:

- 10 playable levels total.
- 5 bosses or boss-like encounters.
- 4 reward/shop beats.
- 3 enemy families with at least 2 variants each.
- 5 weapon or skill choices.
- 6 mutations.
- Death/restart coverage in every act.
- Campaign-complete state and credits/end card.
- Browser smoke route for each act.

## 2.3 Current Expansion Target

The first full-game expansion target is **Act 2: The Sump Warrens**.

Act 2 should prove the campaign can extend beyond the V1 boss without copying the exact same room:

- Multi-room scene.
- Platform traversal plus ground combat.
- Mixed enemies.
- Dash-relevant spacing.
- Completion gate.
- Progress unlock.
- Browser smoke route.

---

# 3. Level Roadmap

## Act 1 - Rotten Borough: Municipal Gutworks

Existing:

- Opening shakedown room.
- Reward/shop.
- Audit office back room.
- Toll Baron mini-boss.

Needed later:

- Add optional side room.
- Add dash VFX polish.
- Add stronger end-of-act transition into Act 2.

## Act 2 - The Sump Warrens

Planned levels:

- **Sump Gate**: horizontal entry with two guards, dash gap, and raised platform pickup.
- **Ledger Lift**: vertical-ish platform room with tax clerk and elite auditor pressure.
- **Drain Choir Ambush**: small arena with mixed enemies and clear wave-complete gate.
- **Boss: The Clog Prior**: heavy sewer-priest boss with slam and bile-line attack.

Initial implemented slice:

- `SumpWarrensScene`, containing Sump Gate and Ledger Lift as connected sections.

## Act 3 - Ledger Cathedral

Planned levels:

- Receipt Nave.
- Stamp Gallery.
- Confession Queue.
- Boss: Grand Auditor Vellum.

## Act 4 - The Mayor's Feast Works

Planned levels:

- Grease Kitchen.
- Banquet Conveyor.
- Refuse Chapel.
- Boss: The Mayor's Butcher.

## Act 5 - Crown Office of Regrettable Consequences

Planned levels:

- Petition Furnace.
- Crown Ledger.
- Final Office.
- Boss: The Civic Saint of Fees.
- Ending: Foxman wins badly.

---

# 4. Gates

## Gate A - Campaign Spine

Exit criteria:

- Act 1 routes to Act 2.
- Act 2 has at least one playable multi-section scene.
- Browser smoke can start Act 2 directly.
- Existing V1 smoke matrix still passes.

## Gate B - Act Template

Exit criteria:

- Shared level metadata exists for act name, room name, objective, and unlock id.
- A new act can reuse scene scaffolding without copy-pasting all combat logic.
- At least one act-specific report exists.

## Gate C - Enemy Expansion

Exit criteria:

- One new enemy family concept and runtime behavior.
- Existing enemies remain readable.
- Combat smoke includes mixed enemy encounters.

## Gate D - Reward Expansion

Exit criteria:

- At least two more weapons or skills.
- At least four more mutations.
- Rewards carry across acts.

## Gate E - Campaign Complete

Exit criteria:

- Final boss clear state.
- End card.
- Campaign-complete unlock.
- Smoke route proves title-to-ending path.

---

# 5. Non-Negotiables

- The playable trunk must keep booting.
- Every new scene needs browser smoke coverage.
- Manual play remains a gate.
- Generated or derived assets must be stored project-local.
- Combat readability beats spectacle.
- The writing can be crude, but it must stay aimed at fictional institutions, corruption, cowards, bosses, and Foxman's own rotten behavior.

---

# 6. Immediate Build Plan

1. Add `SumpWarrensScene`.
2. Add direct smoke route: `/?smokeAuto=1&smoke=sump`.
3. Add a multi-section Sump Warrens level:
   - Sump Gate section.
   - Ledger Lift section.
   - Mixed enemies.
   - Completion gate.
4. Add browser smoke assertions for Act 2 completion.
5. Update ops docs and reports.
6. Keep `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, and browser smoke passing.
