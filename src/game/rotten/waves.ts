import type { StageOneEnemyRoleId } from "./enemyRoles";

export type StageOneRouteId = "bailiffs-ramp" | "bribe-line" | "unfiled-alley";
export type StageOneWave = readonly StageOneEnemyRoleId[];
export type StageOneWavePair = readonly [StageOneWave, StageOneWave];

export const STAGE_ONE_ARENA_LAYOUT = {
  floorCenterY: 650,
  floorHeight: 140,
  maxFloorBodyBottom: 580,
} as const;

export const STAGE_ONE_WAVES: Readonly<Record<StageOneRouteId, StageOneWavePair>> = {
  "bailiffs-ramp": [
    ["bailiff", "bailiff"],
    ["bailiff", "writ-runner"],
  ],
  "bribe-line": [
    ["bailiff", "clerk"],
    ["clerk", "clerk", "bailiff"],
  ],
  "unfiled-alley": [
    ["writ-runner"],
    ["writ-runner", "clerk"],
  ],
};
