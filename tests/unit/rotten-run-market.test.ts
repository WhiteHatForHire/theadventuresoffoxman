import { describe, expect, it } from "vitest";
import { summarizeRottenBuild } from "../../src/game/rotten/build";
import {
  applyStageOneRewardInput,
  createStageOneRewardMarket,
  retryRottenRunSameSeed,
} from "../../src/game/rotten/market";
import { buildRottenRunPlan } from "../../src/game/rotten/plan";
import {
  getRottenUpgradeOffers,
  ROTTEN_UPGRADES,
  type RottenUpgradeId,
} from "../../src/game/rotten/upgrades";

const alphaPlan = buildRottenRunPlan("GAUNTLET-ALPHA");

function openAlphaMarket(overrides: Partial<Parameters<typeof createStageOneRewardMarket>[0]> = {}) {
  return createStageOneRewardMarket({
    plan: alphaPlan,
    routeId: "bailiffs-ramp",
    weapon: "tax-pike",
    skill: "seized-stamp",
    health: { current: 4, max: 6 },
    graft: 7,
    ownedUpgrades: [],
    trace: ["plan:RR1-1C93B57F", "route:bailiffs-ramp", "graft:+4"],
    ...overrides,
  });
}

describe("Rotten Run deterministic reward offers", () => {
  it("preserves the accepted fixture and excludes owned unique upgrades", () => {
    const fixture = getRottenUpgradeOffers({
      seed: " gauntlet alpha ",
      stage: 1,
      routeId: "bailiffs-ramp",
      graft: 7,
      ownedUpgrades: [],
    });
    const repeated = getRottenUpgradeOffers({
      seed: "GAUNTLET-ALPHA",
      stage: 1,
      routeId: "bailiffs-ramp",
      graft: 7,
      ownedUpgrades: [],
    });

    expect(fixture).toEqual(repeated);
    expect(fixture.map(({ id }) => id)).toEqual([
      "dead-letter",
      "petty-grudge",
      "spite-reserve",
    ]);
    expect(new Set(fixture.map(({ id }) => id)).size).toBe(3);

    const excludingDeadLetter = getRottenUpgradeOffers({
      seed: "GAUNTLET-ALPHA",
      stage: 1,
      routeId: "bailiffs-ramp",
      graft: 7,
      ownedUpgrades: ["dead-letter"],
    });
    expect(excludingDeadLetter).toHaveLength(3);
    expect(excludingDeadLetter.some(({ id }) => id === "dead-letter")).toBe(false);
  });

  it("applies Graft Dividend only to later markets, never its own purchase", () => {
    const dividendMarket = createStageOneRewardMarket({
      plan: buildRottenRunPlan("GAUNTLET-BETA"),
      routeId: "bribe-line",
      weapon: "rusty-knife",
      skill: "spite-belch",
      health: { current: 6, max: 6 },
      graft: 8,
      ownedUpgrades: [],
      trace: [],
    });
    expect(dividendMarket.market?.offers[0]).toMatchObject({
      id: "graft-dividend",
      basePrice: 6,
      effectivePrice: 6,
    });

    const bought = applyStageOneRewardInput(dividendMarket, 1);
    expect(bought.accepted).toBe(true);
    expect(bought.state.graft).toBe(2);

    const laterOffers = getRottenUpgradeOffers({
      seed: "GAUNTLET-BETA",
      stage: 2,
      routeId: "seized-goods-lift",
      graft: 10,
      ownedUpgrades: bought.state.upgrades,
    });
    expect(laterOffers.some(({ id }) => id === "graft-dividend")).toBe(false);
    expect(laterOffers.every(({ basePrice, effectivePrice }) => effectivePrice === basePrice - 1))
      .toBe(true);
  });
});

describe("Rotten Run pure Stage 1 reward transaction", () => {
  it("buys one displayed upgrade and advances with carried route and trace truth", () => {
    const before = openAlphaMarket();
    const result = applyStageOneRewardInput(before, 1);

    expect(result.accepted).toBe(true);
    expect(result.reason).toBe("accepted");
    expect(result.state.phase).toBe("route-choice");
    expect(result.state.stage).toBe(2);
    expect(result.state.routeOptions).toEqual(["seized-goods-lift", "late-fee-chapel"]);
    expect(result.state.weapon).toBe("tax-pike");
    expect(result.state.skill).toBe("seized-stamp");
    expect(result.state.health).toEqual({ current: 4, max: 6 });
    expect(result.state.graft).toBe(0);
    expect(result.state.upgrades).toEqual(["dead-letter"]);
    expect(result.state.market).toMatchObject({
      status: "resolved",
      stage: 1,
      routeId: "bailiffs-ramp",
      acceptedChoice: {
        input: 1,
        kind: "upgrade",
        upgradeId: "dead-letter",
        graftSpent: 7,
      },
    });
    expect(result.state.routeHistory).toEqual([
      {
        stage: 1,
        routeId: "bailiffs-ramp",
        marketChoice: result.state.market?.acceptedChoice,
      },
    ]);
    expect(result.state.market?.traceEvent).toBe(
      "market:1:bailiffs-ramp:upgrade:dead-letter:spent-7",
    );
    expect(result.state.trace.at(-1)).toBe(result.state.market?.traceEvent);
  });

  it("rejects invalid, unaffordable, and repeated input without mutating run truth", () => {
    const poor = openAlphaMarket({ graft: 4 });
    const unaffordable = applyStageOneRewardInput(poor, 1);
    expect(unaffordable).toMatchObject({ accepted: false, reason: "unaffordable" });
    expect(unaffordable.state).toBe(poor);

    const invalid = applyStageOneRewardInput(poor, 9);
    expect(invalid).toMatchObject({ accepted: false, reason: "invalid-input" });
    expect(invalid.state).toBe(poor);

    const accepted = applyStageOneRewardInput(openAlphaMarket(), 5);
    const repeated = applyStageOneRewardInput(accepted.state, 1);
    expect(repeated).toMatchObject({ accepted: false, reason: "already-resolved" });
    expect(repeated.state).toBe(accepted.state);
  });

  it("spends 2 graft to heal up to 2 HP and rejects disabled healing", () => {
    const clamped = applyStageOneRewardInput(
      openAlphaMarket({ health: { current: 5, max: 6 } }),
      4,
    );
    expect(clamped.accepted).toBe(true);
    expect(clamped.state.health).toEqual({ current: 6, max: 6 });
    expect(clamped.state.graft).toBe(5);
    expect(clamped.state.market?.acceptedChoice).toMatchObject({
      input: 4,
      kind: "heal",
      graftSpent: 2,
      healthRestored: 1,
    });

    const full = openAlphaMarket({ health: { current: 6, max: 6 } });
    const fullRejected = applyStageOneRewardInput(full, 4);
    expect(fullRejected).toMatchObject({ accepted: false, reason: "full-health" });
    expect(fullRejected.state).toBe(full);

    const poor = openAlphaMarket({ graft: 1 });
    const poorRejected = applyStageOneRewardInput(poor, 4);
    expect(poorRejected).toMatchObject({ accepted: false, reason: "unaffordable" });
    expect(poorRejected.state).toBe(poor);
  });

  it("banks without changing HP, graft, or upgrades", () => {
    const before = openAlphaMarket();
    const result = applyStageOneRewardInput(before, 5);

    expect(result.accepted).toBe(true);
    expect(result.state.health).toEqual(before.health);
    expect(result.state.graft).toBe(before.graft);
    expect(result.state.upgrades).toEqual(before.upgrades);
    expect(result.state.market?.acceptedChoice).toMatchObject({
      input: 5,
      kind: "bank",
      graftSpent: 0,
    });
  });

  it("applies Hangover Hide's immediate max-HP and heal effect exactly once", () => {
    const market = createStageOneRewardMarket({
      plan: buildRottenRunPlan("GAUNTLET-BETA"),
      routeId: "unfiled-alley",
      weapon: "receipt-spitter",
      skill: "bribe-bomb",
      health: { current: 3, max: 6 },
      graft: 7,
      ownedUpgrades: [],
      trace: [],
    });
    expect(market.market?.offers[1].id).toBe("hangover-hide");

    const result = applyStageOneRewardInput(market, 2);
    expect(result.accepted).toBe(true);
    expect(result.state.health).toEqual({ current: 5, max: 8 });
    expect(result.state.graft).toBe(2);
    expect(result.state.upgrades).toEqual(["hangover-hide"]);
    expect(result.state.buildSummary.maxHealthBonus).toBe(2);
  });

  it("resets every carried market/build field for a same-seed retry", () => {
    const advanced = applyStageOneRewardInput(openAlphaMarket(), 1).state;
    const retried = retryRottenRunSameSeed(advanced);

    expect(retried).toMatchObject({
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      phase: "loadout",
      stage: 1,
      routeOptions: ["unfiled-alley", "bailiffs-ramp"],
      weapon: null,
      skill: null,
      health: null,
      graft: 3,
      upgrades: [],
      routeHistory: [],
      market: null,
      trace: ["plan:RR1-1C93B57F"],
    });
    expect(retried.buildSummary).toEqual(summarizeRottenBuild([]));
  });
});

describe("Rotten Run carried build summary", () => {
  it("represents every frozen upgrade effect without claiming combat proof", () => {
    const allUpgradeIds = Object.keys(ROTTEN_UPGRADES) as RottenUpgradeId[];
    const summary = summarizeRottenBuild(allUpgradeIds);

    expect(summary).toEqual({
      maxHealthBonus: 2,
      immediateHealOnAcquire: 2,
      weaponDamageSurgeOnDamage: true,
      dashCooldownReduced: true,
      damagingDashWake: true,
      boundedRapidHitDamageBonus: true,
      healPerClearedWave: 1,
      activeSkillCooldownReduced: true,
      weaponPatternRepeatOrPierce: true,
      elitesAwardBonusGraft: true,
      marketDiscount: 1,
    });
  });
});
