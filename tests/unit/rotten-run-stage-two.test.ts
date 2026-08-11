import { describe, expect, it } from "vitest";
import {
  applyRottenWaveHeal,
  createRottenBuildRuntime,
  deriveRottenCombatBuild,
  getRottenEliteGraft,
  recordRottenPlayerDamage,
  recordRottenWeaponHit,
  resolveRottenWeaponDamage,
  ROTTEN_BUILD_CONSTANTS,
} from "../../src/game/rotten/build";
import {
  deriveStageTwoEliteAssignment,
  getRottenEncounterSpec,
  STAGE_TWO_ELITE_SCOPE,
} from "../../src/game/rotten/encounters";
import { ROTTEN_ENEMY_ROLES } from "../../src/game/rotten/enemyRoles";
import {
  applyRottenRewardInput,
  createRottenRewardMarket,
  createStageOneRewardMarket,
  retryRottenRunSameSeed,
} from "../../src/game/rotten/market";
import { buildRottenRunPlan } from "../../src/game/rotten/plan";
import type { RottenUpgradeId } from "../../src/game/rotten/upgrades";

const alphaPlan = buildRottenRunPlan("GAUNTLET-ALPHA");
const allUpgrades: readonly RottenUpgradeId[] = [
  "hangover-hide",
  "petty-grudge",
  "counterfeit-soles",
  "compound-interest",
  "red-tape-tourniquet",
  "spite-reserve",
  "dead-letter",
  "graft-dividend",
];

describe("Rotten Run generic encounter specifications", () => {
  it("preserves the exact accepted Stage 1 rosters through the generic boundary", () => {
    expect(getRottenEncounterSpec("GAUNTLET-ALPHA", "bailiffs-ramp").waves).toEqual([
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "writ-runner", spawnSlot: "right" },
      ],
    ]);
    expect(getRottenEncounterSpec("GAUNTLET-ALPHA", "bribe-line").waves).toEqual([
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
    ]);
    expect(getRottenEncounterSpec("GAUNTLET-ALPHA", "unfiled-alley").waves).toEqual([
      [{ roleId: "writ-runner", spawnSlot: "center" }],
      [
        { roleId: "writ-runner", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
    ]);
  });

  it("locks all three Stage 2 routes to two frozen annotated waves", () => {
    const bile = getRottenEncounterSpec("BILE-PROOF", "bile-registry");
    expect(bile).toMatchObject({
      stage: 2,
      routeId: "bile-registry",
      arenaKey: "sump-docket:bile-registry",
      baseGraftReward: 5,
      marketBias: "skill",
      eliteCount: 0,
    });
    expect(bile.waves).toEqual([
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "sump-scribe", spawnSlot: "right" },
      ],
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
    ]);

    const lift = getRottenEncounterSpec("GAUNTLET-ALPHA", "seized-goods-lift");
    expect(lift).toMatchObject({
      stage: 2,
      arenaKey: "sump-docket:seized-goods-lift",
      baseGraftReward: 5,
      marketBias: "weapon",
      eliteCount: 0,
    });
    expect(lift.waves).toEqual([
      [
        { roleId: "shield-auditor", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
      [
        { roleId: "shield-auditor", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "center" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
    ]);

    const chapel = getRottenEncounterSpec("GAUNTLET-ALPHA", "late-fee-chapel");
    const assignment = deriveStageTwoEliteAssignment("GAUNTLET-ALPHA");
    expect(chapel).toMatchObject({
      stage: 2,
      arenaKey: "sump-docket:late-fee-chapel",
      baseGraftReward: 6,
      marketBias: "mutation",
      eliteCount: 1,
    });
    expect(chapel.waves).toEqual([
      [
        {
          roleId: assignment.roleId,
          spawnSlot: "left",
          eliteVariant: assignment.variant,
        },
        { roleId: assignment.supportRoleId, spawnSlot: "right" },
      ],
      [
        { roleId: "shield-auditor", spawnSlot: "left" },
        { roleId: "sump-scribe", spawnSlot: "right" },
      ],
    ]);
    expect(assignment.supportRoleId).not.toBe(assignment.roleId);
  });

  it("derives stable gilded and overdue assignments from only the frozen named scope", () => {
    expect(STAGE_TWO_ELITE_SCOPE).toBe("encounter-v1:stage-2:late-fee-chapel:elite");
    expect(deriveStageTwoEliteAssignment("GAUNTLET-ALPHA")).toEqual(
      deriveStageTwoEliteAssignment(" gauntlet alpha "),
    );

    const assignments = [
      deriveStageTwoEliteAssignment("ELITE-GILDED-PROOF"),
      deriveStageTwoEliteAssignment("ELITE-OVERDUE-PROOF"),
    ];
    expect(new Set(assignments.map(({ variant }) => variant))).toEqual(
      new Set(["gilded", "overdue"]),
    );
    expect(assignments.every(({ roleId }) =>
      ["bailiff", "clerk", "writ-runner"].includes(roleId)
    )).toBe(true);
  });

  it("freezes the two new role counterplay timings and health", () => {
    expect(ROTTEN_ENEMY_ROLES["shield-auditor"]).toMatchObject({
      health: 4,
      shieldOpenMs: 1_100,
      weaponFrontBlocked: true,
      skillInterruptOpensShield: true,
      dashThroughOpensShield: true,
    });
    expect(ROTTEN_ENEMY_ROLES["sump-scribe"]).toMatchObject({
      health: 3,
      hazardTelegraphMs: 520,
      hazardDurationMs: 1_800,
      hazardHitCooldownMs: 700,
      bribeBombClearsHazards: true,
    });
  });
});

describe("Rotten Run carried combat build", () => {
  it("derives every frozen runtime constant through one build config", () => {
    expect(ROTTEN_BUILD_CONSTANTS).toEqual({
      pettyGrudgeBonusDamage: 1,
      pettyGrudgeDurationMs: 3_000,
      normalDashCooldownMs: 520,
      counterfeitDashCooldownMs: 340,
      dashWakeDamage: 1,
      compoundWindowMs: 900,
      compoundMaxBonusDamage: 2,
      waveHealAmount: 1,
      spiteReserveCooldownMultiplier: 0.65,
      deadLetterEchoDelayMs: 120,
      deadLetterEchoDamageMultiplier: 0.5,
      baseEliteGraft: 1,
      graftDividendEliteBonus: 1,
    });

    const knife = deriveRottenCombatBuild(allUpgrades, "rusty-knife", "spite-belch");
    expect(knife).toMatchObject({
      maxHealthBonus: 2,
      pettyGrudge: { bonusDamage: 1, durationMs: 3_000 },
      dash: { cooldownMs: 340, wakeDamage: 1 },
      compoundInterest: { windowMs: 900, maxBonusDamage: 2 },
      waveHealAmount: 1,
      skillCooldownMs: 683,
      deadLetter: { kind: "echo", delayMs: 120, damage: 1 },
      eliteBonusGraft: 1,
      marketDiscount: 1,
    });
    expect(deriveRottenCombatBuild(allUpgrades, "butcher-saber", "spite-belch").deadLetter)
      .toEqual({ kind: "echo", delayMs: 120, damage: 2 });
    expect(deriveRottenCombatBuild(allUpgrades, "tax-pike", "seized-stamp").deadLetter)
      .toEqual({ kind: "pierce", additionalTargets: 1 });
    expect(deriveRottenCombatBuild(allUpgrades, "receipt-spitter", "bribe-bomb").deadLetter)
      .toEqual({ kind: "projectile-pierce", additionalTargets: 1 });
    expect(deriveRottenCombatBuild(allUpgrades, "receipt-spitter", "bribe-bomb").skillCooldownMs)
      .toBe(1_333);
  });

  it("keeps campaign-equivalent Rotten defaults when no upgrade is owned", () => {
    expect(deriveRottenCombatBuild([], "tax-pike", "seized-stamp")).toMatchObject({
      maxHealthBonus: 0,
      pettyGrudge: null,
      dash: { cooldownMs: 520, wakeDamage: 0 },
      compoundInterest: null,
      waveHealAmount: 0,
      skillCooldownMs: 1_550,
      deadLetter: null,
      eliteBonusGraft: 0,
      marketDiscount: 0,
    });
  });

  it("applies grudge and compound as a bounded +3 non-recursive weapon bonus", () => {
    const build = deriveRottenCombatBuild(
      ["petty-grudge", "compound-interest"],
      "rusty-knife",
      "spite-belch",
    );
    let runtime = createRottenBuildRuntime();
    runtime = recordRottenPlayerDamage(build, runtime, 1_000);
    expect(resolveRottenWeaponDamage(build, runtime, 1_000)).toMatchObject({
      baseDamage: 1,
      grudgeBonus: 1,
      compoundBonus: 0,
      totalDamage: 2,
    });

    runtime = recordRottenWeaponHit(build, runtime, 1_000);
    runtime = recordRottenWeaponHit(build, runtime, 1_400);
    runtime = recordRottenWeaponHit(build, runtime, 1_800);
    expect(resolveRottenWeaponDamage(build, runtime, 1_800)).toMatchObject({
      grudgeBonus: 1,
      compoundBonus: 2,
      totalBonus: 3,
      totalDamage: 4,
    });
    expect(resolveRottenWeaponDamage(build, runtime, 4_100)).toMatchObject({
      grudgeBonus: 0,
      compoundBonus: 0,
      totalBonus: 0,
      totalDamage: 1,
    });
  });

  it("heals each cleared wave within max and awards the exact elite graft", () => {
    const build = deriveRottenCombatBuild(
      ["red-tape-tourniquet", "graft-dividend"],
      "tax-pike",
      "seized-stamp",
    );
    expect(applyRottenWaveHeal(build, { current: 5, max: 6 })).toEqual({
      health: { current: 6, max: 6 },
      restored: 1,
    });
    expect(applyRottenWaveHeal(build, { current: 6, max: 6 })).toEqual({
      health: { current: 6, max: 6 },
      restored: 0,
    });
    expect(getRottenEliteGraft(build)).toBe(2);
  });
});

describe("Rotten Run generic Stage 2 market and Stage 3 docket boundary", () => {
  function resolvedStageOne() {
    const market = createStageOneRewardMarket({
      plan: alphaPlan,
      routeId: "bailiffs-ramp",
      weapon: "tax-pike",
      skill: "seized-stamp",
      health: { current: 4, max: 6 },
      graft: 7,
      ownedUpgrades: [],
      trace: ["plan:RR1-1C93B57F", "route:1:bailiffs-ramp", "graft:+4"],
    });
    return applyRottenRewardInput(market, 5).state;
  }

  function openStageTwo(overrides: Partial<Parameters<typeof createRottenRewardMarket>[0]> = {}) {
    const carried = resolvedStageOne();
    return createRottenRewardMarket({
      plan: alphaPlan,
      stage: 2,
      routeId: "seized-goods-lift",
      weapon: "tax-pike",
      skill: "seized-stamp",
      health: { current: 3, max: 6 },
      graft: 12,
      ownedUpgrades: carried.upgrades,
      routeHistory: carried.routeHistory,
      trace: [...carried.trace, "route:2:seized-goods-lift", "graft:+5"],
      ...overrides,
    });
  }

  it("opens three eligible deterministic Stage 2 offers and excludes ownership", () => {
    const first = openStageTwo({ ownedUpgrades: ["dead-letter", "graft-dividend"] });
    const second = openStageTwo({ ownedUpgrades: ["dead-letter", "graft-dividend"] });
    expect(first.market?.stage).toBe(2);
    expect(first.market?.offers).toEqual(second.market?.offers);
    expect(first.market?.offers).toHaveLength(3);
    expect(first.market?.offers.some(({ id }) => id === "dead-letter")).toBe(false);
    expect(first.market?.offers.every(({ basePrice, effectivePrice }) =>
      effectivePrice === basePrice - 1
    )).toBe(true);
  });

  it("records exactly two choices and advances only to the exact Stage 3 docket", () => {
    const result = applyRottenRewardInput(openStageTwo(), 5);
    expect(result.accepted).toBe(true);
    expect(result.state).toMatchObject({
      phase: "route-choice",
      stage: 3,
      routeOptions: ["collection-parade", "garnish-gallery"],
    });
    expect(result.state.routeHistory).toHaveLength(2);
    expect(result.state.routeHistory.map(({ stage, routeId, marketChoice }) => ({
      stage,
      routeId,
      kind: marketChoice?.kind,
    }))).toEqual([
      { stage: 1, routeId: "bailiffs-ramp", kind: "bank" },
      { stage: 2, routeId: "seized-goods-lift", kind: "bank" },
    ]);
    expect(result.state.trace.filter((entry) => entry.startsWith("market:"))).toHaveLength(2);
  });

  it("performs honest Stage 2 purchase, damaged heal, bank, and strict no-ops", () => {
    const market = openStageTwo();
    const bought = applyRottenRewardInput(market, 1);
    expect(bought.accepted).toBe(true);
    expect(bought.state.upgrades).toHaveLength(1);

    const healed = applyRottenRewardInput(openStageTwo(), 4);
    expect(healed).toMatchObject({ accepted: true, state: { health: { current: 5, max: 6 } } });

    const banked = applyRottenRewardInput(openStageTwo(), 5);
    expect(banked).toMatchObject({ accepted: true, state: { graft: 12 } });

    const invalid = applyRottenRewardInput(market, 0);
    expect(invalid).toMatchObject({ accepted: false, reason: "invalid-input" });
    expect(invalid.state).toBe(market);

    const poor = openStageTwo({ graft: 0 });
    const unaffordable = applyRottenRewardInput(poor, 1);
    expect(unaffordable).toMatchObject({ accepted: false, reason: "unaffordable" });
    expect(unaffordable.state).toBe(poor);

    const repeated = applyRottenRewardInput(banked.state, 5);
    expect(repeated).toMatchObject({ accepted: false, reason: "already-resolved" });
    expect(repeated.state).toBe(banked.state);
  });

  it("resets Stage 2 history, market, upgrades, build, and trace on same-seed retry", () => {
    const resolved = applyRottenRewardInput(openStageTwo(), 1).state;
    const retried = retryRottenRunSameSeed(resolved);
    expect(retried).toMatchObject({
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      phase: "loadout",
      stage: 1,
      routeOptions: ["unfiled-alley", "bailiffs-ramp"],
      health: null,
      graft: 3,
      upgrades: [],
      routeHistory: [],
      market: null,
      trace: ["plan:RR1-1C93B57F"],
    });
    expect(retried.buildSummary.maxHealthBonus).toBe(0);
  });
});
