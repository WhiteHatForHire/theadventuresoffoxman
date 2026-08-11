export type StageOneEnemyRoleId = "bailiff" | "clerk" | "writ-runner";

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
