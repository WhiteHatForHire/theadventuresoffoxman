import { describe, expect, it } from "vitest";
import { summarizeRottenBuild } from "../../src/game/rotten/build";
import {
  deriveCollectionParadeEliteAssignments,
  getRottenEncounterSpec,
  STAGE_THREE_COLLECTION_ROLE_SCOPE,
  STAGE_THREE_COLLECTION_VARIANT_SCOPE,
} from "../../src/game/rotten/encounters";
import {
  applyRottenRewardInput,
  createRottenRewardMarket,
  createStageOneRewardMarket,
  retryRottenRunSameSeed,
} from "../../src/game/rotten/market";
import { buildRottenRunPlan, ROTTEN_FINAL_BOSS_ID } from "../../src/game/rotten/plan";

const alphaPlan = buildRottenRunPlan("GAUNTLET-ALPHA");

function resolvedStageOne() {
  const market = createStageOneRewardMarket({
    plan: alphaPlan,
    routeId: "bailiffs-ramp",
    weapon: "tax-pike",
    skill: "seized-stamp",
    health: { current: 4, max: 6 },
    graft: 20,
    ownedUpgrades: [],
    trace: ["plan:RR1-1C93B57F", "route:1:bailiffs-ramp", "graft:+4"],
  });
  return applyRottenRewardInput(market, 1).state;
}

function resolvedStageTwo() {
  const carried = resolvedStageOne();
  const market = createRottenRewardMarket({
    plan: alphaPlan,
    stage: 2,
    routeId: "seized-goods-lift",
    weapon: "tax-pike",
    skill: "seized-stamp",
    health: carried.health!,
    graft: carried.graft + 5,
    ownedUpgrades: carried.upgrades,
    routeHistory: carried.routeHistory,
    trace: [...carried.trace, "route:2:seized-goods-lift", "graft:+5"],
  });
  return applyRottenRewardInput(market, 1).state;
}

function openStageThree(
  overrides: Partial<Parameters<typeof createRottenRewardMarket>[0]> = {},
) {
  const carried = resolvedStageTwo();
  return createRottenRewardMarket({
    plan: alphaPlan,
    stage: 3,
    routeId: "collection-parade",
    weapon: "tax-pike",
    skill: "seized-stamp",
    health: { current: 3, max: carried.health!.max },
    graft: carried.graft + 9,
    ownedUpgrades: carried.upgrades,
    routeHistory: carried.routeHistory,
    trace: [
      ...carried.trace,
      "route:3:collection-parade",
      "graft:+7",
      "elite-bounty:+2",
    ],
    ...overrides,
  });
}

describe("Rotten Run Stage 3 encounter specifications", () => {
  it("locks Garnish Gallery to the exact two-wave mixed-range roster", () => {
    const spec = getRottenEncounterSpec("GAUNTLET-ALPHA", "garnish-gallery");
    expect(spec).toMatchObject({
      stage: 3,
      routeId: "garnish-gallery",
      arenaKey: "final-filing:garnish-gallery",
      baseGraftReward: 6,
      marketBias: "weapon",
      eliteCount: 0,
    });
    expect(spec.waves).toEqual([
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "writ-runner", spawnSlot: "right" },
      ],
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "sump-scribe", spawnSlot: "center" },
        { roleId: "shield-auditor", spawnSlot: "right" },
      ],
    ]);
  });

  it("locks Appeal Furnace to the exact two-wave hazard-control roster", () => {
    const spec = getRottenEncounterSpec("APPEAL-PROOF", "appeal-furnace");
    expect(spec).toMatchObject({
      stage: 3,
      routeId: "appeal-furnace",
      arenaKey: "final-filing:appeal-furnace",
      baseGraftReward: 6,
      marketBias: "skill",
      eliteCount: 0,
    });
    expect(spec.waves).toEqual([
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "shield-auditor", spawnSlot: "right" },
      ],
    ]);
  });

  it("derives Collection Parade's two roles and two variants without replacement", () => {
    expect(STAGE_THREE_COLLECTION_ROLE_SCOPE).toBe(
      "encounter-v1:stage-3:collection-parade:elite-roles",
    );
    expect(STAGE_THREE_COLLECTION_VARIANT_SCOPE).toBe(
      "encounter-v1:stage-3:collection-parade:variant-order",
    );

    const assignments = deriveCollectionParadeEliteAssignments("GAUNTLET-ALPHA");
    expect(assignments).toEqual(
      deriveCollectionParadeEliteAssignments(" gauntlet alpha "),
    );
    expect(assignments).toHaveLength(2);
    expect(new Set(assignments.map(({ roleId }) => roleId)).size).toBe(2);
    expect(new Set(assignments.map(({ variant }) => variant))).toEqual(
      new Set(["gilded", "overdue"]),
    );
    expect(assignments.every(({ roleId, supportRoleId }) => roleId !== supportRoleId)).toBe(true);

    const spec = getRottenEncounterSpec("GAUNTLET-ALPHA", "collection-parade");
    expect(spec).toMatchObject({
      stage: 3,
      routeId: "collection-parade",
      arenaKey: "final-filing:collection-parade",
      baseGraftReward: 7,
      marketBias: "mutation",
      eliteCount: 2,
    });
    expect(spec.waves).toEqual([
      [
        {
          roleId: assignments[0].roleId,
          spawnSlot: "left",
          eliteVariant: assignments[0].variant,
        },
        { roleId: assignments[0].supportRoleId, spawnSlot: "center" },
        { roleId: "shield-auditor", spawnSlot: "right" },
      ],
      [
        {
          roleId: assignments[1].roleId,
          spawnSlot: "left",
          eliteVariant: assignments[1].variant,
        },
        { roleId: assignments[1].supportRoleId, spawnSlot: "center" },
        { roleId: "sump-scribe", spawnSlot: "right" },
      ],
    ]);
  });
});

describe("Rotten Run third market and inert Commissioner dossier", () => {
  it("opens a deterministic Stage 3 market with carried health, graft, history, and build", () => {
    const first = openStageThree();
    const second = openStageThree();
    expect(first).toMatchObject({
      phase: "reward-choice",
      stage: 3,
      routeOptions: ["collection-parade", "garnish-gallery"],
      weapon: "tax-pike",
      skill: "seized-stamp",
      health: { current: 3, max: 6 },
      market: { status: "open", stage: 3, routeId: "collection-parade" },
    });
    expect(first.market?.offers).toEqual(second.market?.offers);
    expect(first.market?.offers).toHaveLength(3);
    expect(first.routeHistory).toHaveLength(3);
    expect(first.routeHistory.at(-1)).toEqual({
      stage: 3,
      routeId: "collection-parade",
      marketChoice: null,
    });
    expect(first.buildSummary).toEqual(summarizeRottenBuild(first.upgrades));
  });

  it("records the exact third decision and enters only a truthful inert boss phase", () => {
    const result = applyRottenRewardInput(openStageThree(), 1);
    expect(result.accepted).toBe(true);
    expect(result.state).toMatchObject({
      phase: "boss",
      stage: 3,
      bossId: ROTTEN_FINAL_BOSS_ID,
      bossDossierReady: true,
      market: {
        status: "resolved",
        stage: 3,
        routeId: "collection-parade",
        acceptedChoice: { input: 1, kind: "upgrade" },
      },
    });
    expect(result.state.routeHistory).toHaveLength(3);
    expect(result.state.routeHistory.map(({ stage }) => stage)).toEqual([1, 2, 3]);
    expect(result.state.routeHistory.every(({ marketChoice }) => marketChoice !== null)).toBe(true);
    expect(result.state.trace.filter((entry) => entry.startsWith("market:"))).toHaveLength(3);
    expect(result.state.upgrades).toHaveLength(3);
    expect(result.state.buildSummary).toEqual(summarizeRottenBuild(result.state.upgrades));

    const lateInput = applyRottenRewardInput(result.state, 5);
    expect(lateInput).toMatchObject({ accepted: false, reason: "already-resolved" });
    expect(lateInput.state).toBe(result.state);
  });

  it("keeps invalid, unaffordable, and full-health Stage 3 decisions strict no-ops", () => {
    const market = openStageThree({ graft: 0 });
    const invalid = applyRottenRewardInput(market, 7);
    expect(invalid).toMatchObject({ accepted: false, reason: "invalid-input" });
    expect(invalid.state).toBe(market);

    const unaffordable = applyRottenRewardInput(market, 1);
    expect(unaffordable).toMatchObject({ accepted: false, reason: "unaffordable" });
    expect(unaffordable.state).toBe(market);

    const full = openStageThree({ health: { current: 6, max: 6 } });
    const fullHealth = applyRottenRewardInput(full, 4);
    expect(fullHealth).toMatchObject({ accepted: false, reason: "full-health" });
    expect(fullHealth.state).toBe(full);
  });

  it("resets the dossier, third history, build, and boss boundary on same-seed retry", () => {
    const dossier = applyRottenRewardInput(openStageThree(), 5).state;
    const retried = retryRottenRunSameSeed(dossier);
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
      bossId: null,
      bossDossierReady: false,
      trace: ["plan:RR1-1C93B57F"],
    });
    expect(retried.buildSummary).toEqual(summarizeRottenBuild([]));
  });
});
