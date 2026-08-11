import { scopedDeterministicOrder } from "./deterministic";
import type { RottenEnemyRoleId, StageOneEnemyRoleId } from "./enemyRoles";
import {
  ROUTES_BY_STAGE,
  type RottenMarketBias,
  type RottenRouteId,
  type RottenStageNumber,
} from "./routes";
import { normalizeRottenSeed } from "./seed";

export type RottenEliteVariant = "gilded" | "overdue";
export type RottenSpawnSlot = "left" | "center" | "right";

export interface RottenEncounterSpawnSpec {
  readonly roleId: RottenEnemyRoleId;
  readonly spawnSlot: RottenSpawnSlot;
  readonly eliteVariant?: RottenEliteVariant;
}

export type RottenEncounterWave = readonly RottenEncounterSpawnSpec[];
export type RottenEncounterWavePair = readonly [RottenEncounterWave, RottenEncounterWave];

export interface RottenEncounterSpec {
  readonly stage: RottenStageNumber;
  readonly routeId: RottenRouteId;
  readonly arenaKey: string;
  readonly waves: RottenEncounterWavePair;
  readonly baseGraftReward: number;
  readonly marketBias: RottenMarketBias;
  readonly eliteCount: number;
}

export interface RottenEliteAssignment {
  readonly roleId: StageOneEnemyRoleId;
  readonly supportRoleId: StageOneEnemyRoleId;
  readonly variant: RottenEliteVariant;
}

export interface RottenEliteVariantDefinition {
  readonly id: RottenEliteVariant;
  readonly recoveryMultiplier: number;
  readonly armorPips: 0 | 1;
  readonly belowHalfSpeedMultiplier: number;
  readonly announceBelowHalf: boolean;
}

export const STAGE_TWO_ELITE_SCOPE =
  "encounter-v1:stage-2:late-fee-chapel:elite" as const;

export const STAGE_THREE_COLLECTION_ROLE_SCOPE =
  "encounter-v1:stage-3:collection-parade:elite-roles" as const;
export const STAGE_THREE_COLLECTION_VARIANT_SCOPE =
  "encounter-v1:stage-3:collection-parade:variant-order" as const;

export const ROTTEN_ELITE_VARIANTS: Readonly<
  Record<RottenEliteVariant, RottenEliteVariantDefinition>
> = {
  gilded: {
    id: "gilded",
    recoveryMultiplier: 0.8,
    armorPips: 1,
    belowHalfSpeedMultiplier: 1,
    announceBelowHalf: false,
  },
  overdue: {
    id: "overdue",
    recoveryMultiplier: 0.8,
    armorPips: 0,
    belowHalfSpeedMultiplier: 1.25,
    announceBelowHalf: true,
  },
};

const SUPPORT_ROLE_BY_ELITE: Readonly<Record<StageOneEnemyRoleId, StageOneEnemyRoleId>> = {
  bailiff: "clerk",
  clerk: "writ-runner",
  "writ-runner": "bailiff",
};

const ELITE_ASSIGNMENTS: readonly Pick<RottenEliteAssignment, "roleId" | "variant">[] = [
  { roleId: "bailiff", variant: "gilded" },
  { roleId: "clerk", variant: "overdue" },
  { roleId: "writ-runner", variant: "gilded" },
  { roleId: "bailiff", variant: "overdue" },
  { roleId: "clerk", variant: "gilded" },
  { roleId: "writ-runner", variant: "overdue" },
];

const STAGE_ONE_SPECS: Readonly<Record<
  Extract<RottenRouteId, "bailiffs-ramp" | "bribe-line" | "unfiled-alley">,
  RottenEncounterSpec
>> = {
  "bailiffs-ramp": {
    stage: 1,
    routeId: "bailiffs-ramp",
    arenaKey: "intake-yard:bailiffs-ramp",
    waves: [
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "writ-runner", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 4,
    marketBias: "weapon",
    eliteCount: 0,
  },
  "bribe-line": {
    stage: 1,
    routeId: "bribe-line",
    arenaKey: "intake-yard:bribe-line",
    waves: [
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 5,
    marketBias: "economy",
    eliteCount: 0,
  },
  "unfiled-alley": {
    stage: 1,
    routeId: "unfiled-alley",
    arenaKey: "intake-yard:unfiled-alley",
    waves: [
      [{ roleId: "writ-runner", spawnSlot: "center" }],
      [
        { roleId: "writ-runner", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 4,
    marketBias: "skill",
    eliteCount: 0,
  },
};

const STAGE_TWO_STATIC_SPECS: Readonly<Record<
  Extract<RottenRouteId, "bile-registry" | "seized-goods-lift">,
  RottenEncounterSpec
>> = {
  "bile-registry": {
    stage: 2,
    routeId: "bile-registry",
    arenaKey: "sump-docket:bile-registry",
    waves: [
      [
        { roleId: "bailiff", spawnSlot: "left" },
        { roleId: "sump-scribe", spawnSlot: "right" },
      ],
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 5,
    marketBias: "skill",
    eliteCount: 0,
  },
  "seized-goods-lift": {
    stage: 2,
    routeId: "seized-goods-lift",
    arenaKey: "sump-docket:seized-goods-lift",
    waves: [
      [
        { roleId: "shield-auditor", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
      [
        { roleId: "shield-auditor", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "center" },
        { roleId: "clerk", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 5,
    marketBias: "weapon",
    eliteCount: 0,
  },
};

const STAGE_THREE_STATIC_SPECS: Readonly<Record<
  Extract<RottenRouteId, "garnish-gallery" | "appeal-furnace">,
  RottenEncounterSpec
>> = {
  "garnish-gallery": {
    stage: 3,
    routeId: "garnish-gallery",
    arenaKey: "final-filing:garnish-gallery",
    waves: [
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "writ-runner", spawnSlot: "right" },
      ],
      [
        { roleId: "clerk", spawnSlot: "left" },
        { roleId: "sump-scribe", spawnSlot: "center" },
        { roleId: "shield-auditor", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 6,
    marketBias: "weapon",
    eliteCount: 0,
  },
  "appeal-furnace": {
    stage: 3,
    routeId: "appeal-furnace",
    arenaKey: "final-filing:appeal-furnace",
    waves: [
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "bailiff", spawnSlot: "right" },
      ],
      [
        { roleId: "sump-scribe", spawnSlot: "left" },
        { roleId: "clerk", spawnSlot: "center" },
        { roleId: "shield-auditor", spawnSlot: "right" },
      ],
    ],
    baseGraftReward: 6,
    marketBias: "skill",
    eliteCount: 0,
  },
};

export function deriveStageTwoEliteAssignment(seedInput: unknown): RottenEliteAssignment {
  const seed = normalizeRottenSeed(seedInput);
  const selected = scopedDeterministicOrder(
    ELITE_ASSIGNMENTS,
    seed,
    STAGE_TWO_ELITE_SCOPE,
  )[0];

  return {
    roleId: selected.roleId,
    supportRoleId: SUPPORT_ROLE_BY_ELITE[selected.roleId],
    variant: selected.variant,
  };
}

export function deriveCollectionParadeEliteAssignments(
  seedInput: unknown,
): readonly [RottenEliteAssignment, RottenEliteAssignment] {
  const seed = normalizeRottenSeed(seedInput);
  const roles = scopedDeterministicOrder<StageOneEnemyRoleId>(
    ["bailiff", "clerk", "writ-runner"],
    seed,
    STAGE_THREE_COLLECTION_ROLE_SCOPE,
  ).slice(0, 2);
  const variants = scopedDeterministicOrder<RottenEliteVariant>(
    ["gilded", "overdue"],
    seed,
    STAGE_THREE_COLLECTION_VARIANT_SCOPE,
  );

  return roles.map((roleId, index) => ({
    roleId,
    supportRoleId: SUPPORT_ROLE_BY_ELITE[roleId],
    variant: variants[index],
  })) as [RottenEliteAssignment, RottenEliteAssignment];
}

export function getRottenEncounterSpec(
  seedInput: unknown,
  routeId: RottenRouteId,
): RottenEncounterSpec {
  if (routeId in STAGE_ONE_SPECS) {
    return STAGE_ONE_SPECS[routeId as keyof typeof STAGE_ONE_SPECS];
  }
  if (routeId in STAGE_TWO_STATIC_SPECS) {
    return STAGE_TWO_STATIC_SPECS[routeId as keyof typeof STAGE_TWO_STATIC_SPECS];
  }
  if (routeId === "late-fee-chapel") {
    const assignment = deriveStageTwoEliteAssignment(seedInput);
    return {
      stage: 2,
      routeId,
      arenaKey: "sump-docket:late-fee-chapel",
      waves: [
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
      ],
      baseGraftReward: 6,
      marketBias: "mutation",
      eliteCount: 1,
    };
  }
  if (routeId in STAGE_THREE_STATIC_SPECS) {
    return STAGE_THREE_STATIC_SPECS[routeId as keyof typeof STAGE_THREE_STATIC_SPECS];
  }
  if (routeId === "collection-parade") {
    const assignments = deriveCollectionParadeEliteAssignments(seedInput);
    return {
      stage: 3,
      routeId,
      arenaKey: "final-filing:collection-parade",
      waves: [
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
      ],
      baseGraftReward: 7,
      marketBias: "mutation",
      eliteCount: 2,
    };
  }

  const route = Object.values(ROUTES_BY_STAGE)
    .flat()
    .find((candidate) => candidate.id === routeId);
  if (!route) {
    throw new Error(`Unknown Rotten route: ${routeId}.`);
  }
  throw new Error(`Stage ${route.stage} encounter ${routeId} is not operative yet.`);
}
