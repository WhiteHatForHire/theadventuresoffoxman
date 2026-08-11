import { describe, expect, it } from "vitest";
import { STAGE_ONE_ENEMY_ROLES } from "../../src/game/rotten/enemyRoles";
import { ROTTEN_SKILLS, ROTTEN_WEAPONS } from "../../src/game/rotten/loadout";
import { getStageOneOffers, ROTTEN_UPGRADES } from "../../src/game/rotten/upgrades";
import { STAGE_ONE_WAVES } from "../../src/game/rotten/waves";

describe("Rotten Run loadout registry", () => {
  it("locks four materially distinct weapons", () => {
    expect(Object.keys(ROTTEN_WEAPONS)).toEqual([
      "rusty-knife",
      "butcher-saber",
      "tax-pike",
      "receipt-spitter",
    ]);
    expect(new Set(Object.values(ROTTEN_WEAPONS).map((weapon) => weapon.style)).size).toBe(4);
    expect(ROTTEN_WEAPONS["rusty-knife"].cadenceMs).toBeLessThan(
      ROTTEN_WEAPONS["butcher-saber"].cadenceMs,
    );
    expect(ROTTEN_WEAPONS["butcher-saber"].damage).toBeGreaterThan(
      ROTTEN_WEAPONS["tax-pike"].damage,
    );
    expect(ROTTEN_WEAPONS["tax-pike"].reach).toBeGreaterThan(
      ROTTEN_WEAPONS["butcher-saber"].reach,
    );
    expect(ROTTEN_WEAPONS["receipt-spitter"].heatCapacity).toBe(4);
  });

  it("locks three distinct aimed active skills", () => {
    expect(Object.keys(ROTTEN_SKILLS)).toEqual([
      "spite-belch",
      "seized-stamp",
      "bribe-bomb",
    ]);
    expect(new Set(Object.values(ROTTEN_SKILLS).map((skill) => skill.geometry)).size).toBe(3);
    expect(new Set(Object.values(ROTTEN_SKILLS).map((skill) => skill.cooldownMs)).size).toBe(3);
  });
});

describe("Rotten Run Stage 1 encounter registry", () => {
  it("owns the three Stage 1 enemy roles", () => {
    expect(Object.keys(STAGE_ONE_ENEMY_ROLES)).toEqual(["bailiff", "clerk", "writ-runner"]);
    expect(Object.values(STAGE_ONE_ENEMY_ROLES).every((role) => role.windupMs >= 420)).toBe(true);
  });

  it("locks both waves for all three Stage 1 routes", () => {
    expect(Object.keys(STAGE_ONE_WAVES)).toEqual([
      "bailiffs-ramp",
      "bribe-line",
      "unfiled-alley",
    ]);
    expect(STAGE_ONE_WAVES["bailiffs-ramp"]).toEqual([
      ["bailiff", "bailiff"],
      ["bailiff", "writ-runner"],
    ]);
    expect(STAGE_ONE_WAVES["bribe-line"]).toEqual([
      ["bailiff", "clerk"],
      ["clerk", "clerk", "bailiff"],
    ]);
    expect(STAGE_ONE_WAVES["unfiled-alley"]).toEqual([
      ["writ-runner"],
      ["writ-runner", "clerk"],
    ]);
  });
});

describe("Rotten Run deterministic Stage 1 offers", () => {
  it("locks eight unique upgrades with valid offer costs", () => {
    expect(Object.keys(ROTTEN_UPGRADES)).toHaveLength(8);
    expect(new Set(Object.keys(ROTTEN_UPGRADES)).size).toBe(8);
    expect(Object.values(ROTTEN_UPGRADES).every(({ cost }) => cost >= 4 && cost <= 7)).toBe(true);
  });

  it("returns a stable three-offer fixture with at least one affordable offer", () => {
    const first = getStageOneOffers("GAUNTLET-ALPHA", "bailiffs-ramp", 7);
    const second = getStageOneOffers(" gauntlet alpha ", "bailiffs-ramp", 7);

    expect(first).toEqual(second);
    expect(first.map((offer) => offer.id)).toEqual([
      "dead-letter",
      "petty-grudge",
      "spite-reserve",
    ]);
    expect(new Set(first.map((offer) => offer.id)).size).toBe(3);
    expect(first.some((offer) => offer.affordable)).toBe(true);
  });
});
