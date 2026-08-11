export type StageOneEnemyRoleId = "bailiff" | "clerk" | "writ-runner";
export type StageTwoEnemyRoleId = "shield-auditor" | "sump-scribe";
export type RottenEnemyRoleId = StageOneEnemyRoleId | StageTwoEnemyRoleId;

export interface StageOneEnemyRoleDefinition {
  readonly id: StageOneEnemyRoleId;
  readonly name: string;
  readonly description: string;
  readonly health: number;
  readonly approachSpeed: number;
  readonly windupMs: number;
  readonly activeMs: number;
  readonly recoveryMs: number;
  readonly attackRange: number;
}

export interface ShieldAuditorRoleDefinition
  extends Omit<StageOneEnemyRoleDefinition, "id"> {
  readonly id: "shield-auditor";
  readonly shieldOpenMs: number;
  readonly weaponFrontBlocked: true;
  readonly skillInterruptOpensShield: true;
  readonly dashThroughOpensShield: true;
}

export interface SumpScribeRoleDefinition
  extends Omit<StageOneEnemyRoleDefinition, "id"> {
  readonly id: "sump-scribe";
  readonly hazardTelegraphMs: number;
  readonly hazardDurationMs: number;
  readonly hazardHitCooldownMs: number;
  readonly bribeBombClearsHazards: true;
}

export type RottenEnemyRoleDefinition =
  | StageOneEnemyRoleDefinition
  | ShieldAuditorRoleDefinition
  | SumpScribeRoleDefinition;

export const STAGE_ONE_ENEMY_ROLES: Readonly<
  Record<StageOneEnemyRoleId, StageOneEnemyRoleDefinition>
> = {
  bailiff: {
    id: "bailiff",
    name: "Bailiff",
    description: "Readable approach, swing windup, active strike, and recovery.",
    health: 3,
    approachSpeed: 112,
    windupMs: 480,
    activeMs: 210,
    recoveryMs: 620,
    attackRange: 190,
  },
  clerk: {
    id: "clerk",
    name: "Clerk",
    description: "Preserves range, shows a firing tell, then launches a receipt.",
    health: 2,
    approachSpeed: 68,
    windupMs: 620,
    activeMs: 180,
    recoveryMs: 760,
    attackRange: 760,
  },
  "writ-runner": {
    id: "writ-runner",
    name: "Writ Runner",
    description: "Shows a lane tell, commits to a charge, then recovers vulnerably.",
    health: 3,
    approachSpeed: 94,
    windupMs: 700,
    activeMs: 520,
    recoveryMs: 820,
    attackRange: 560,
  },
};

export const STAGE_TWO_ENEMY_ROLES: Readonly<{
  "shield-auditor": ShieldAuditorRoleDefinition;
  "sump-scribe": SumpScribeRoleDefinition;
}> = {
  "shield-auditor": {
    id: "shield-auditor",
    name: "Shield Auditor",
    description: "Blocks frontal weapons until flanked, skill-opened, or dashed through.",
    health: 4,
    approachSpeed: 82,
    windupMs: 640,
    activeMs: 260,
    recoveryMs: 760,
    attackRange: 205,
    shieldOpenMs: 1_100,
    weaponFrontBlocked: true,
    skillInterruptOpensShield: true,
    dashThroughOpensShield: true,
  },
  "sump-scribe": {
    id: "sump-scribe",
    name: "Sump Scribe",
    description: "Preserves range, marks the floor, then leaves a temporary bile hazard.",
    health: 3,
    approachSpeed: 58,
    windupMs: 620,
    activeMs: 180,
    recoveryMs: 860,
    attackRange: 720,
    hazardTelegraphMs: 520,
    hazardDurationMs: 1_800,
    hazardHitCooldownMs: 700,
    bribeBombClearsHazards: true,
  },
};

export const ROTTEN_ENEMY_ROLES: Readonly<
  Record<RottenEnemyRoleId, RottenEnemyRoleDefinition>
> = {
  ...STAGE_ONE_ENEMY_ROLES,
  ...STAGE_TWO_ENEMY_ROLES,
};
