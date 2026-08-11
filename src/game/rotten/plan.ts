import { hashDeterministicText, scopedDeterministicOrder } from "./deterministic";
import {
  ROUTES_BY_STAGE,
  ROTTEN_STAGE_NAMES,
  type RottenRouteDefinition,
  type RottenStageNumber,
} from "./routes";
import { normalizeRottenSeed } from "./seed";

export const ROTTEN_PLAN_SCHEMA_VERSION = 1;
export const ROTTEN_FINAL_BOSS_ID = "commissioner-of-consequences" as const;

export interface RottenRunPlanStage {
  readonly stage: RottenStageNumber;
  readonly name: string;
  readonly options: readonly [RottenRouteDefinition, RottenRouteDefinition];
}

export interface RottenRunPlan {
  readonly schemaVersion: typeof ROTTEN_PLAN_SCHEMA_VERSION;
  readonly seed: string;
  readonly planId: string;
  readonly stages: readonly RottenRunPlanStage[];
  readonly finalBossId: typeof ROTTEN_FINAL_BOSS_ID;
}

function selectStageOptions(
  seed: string,
  stage: RottenStageNumber,
): readonly [RottenRouteDefinition, RottenRouteDefinition] {
  const [first, second] = scopedDeterministicOrder(
    ROUTES_BY_STAGE[stage],
    seed,
    `plan-v${ROTTEN_PLAN_SCHEMA_VERSION}:stage-${stage}:routes`,
  );

  return [first, second];
}

function createPlanId(seed: string, stages: readonly RottenRunPlanStage[]): string {
  const stagePlan = stages
    .map(({ stage, options }) => `${stage}:${options.map((route) => route.id).join(",")}`)
    .join("|");
  const canonical = [ROTTEN_PLAN_SCHEMA_VERSION, seed, stagePlan, ROTTEN_FINAL_BOSS_ID].join("|");
  const digest = hashDeterministicText(canonical).toString(16).padStart(8, "0").toUpperCase();

  return `RR${ROTTEN_PLAN_SCHEMA_VERSION}-${digest}`;
}

export function buildRottenRunPlan(seedInput: unknown): RottenRunPlan {
  const seed = normalizeRottenSeed(seedInput);
  const stageNumbers: readonly RottenStageNumber[] = [1, 2, 3];
  const stages = stageNumbers.map((stage) => ({
    stage,
    name: ROTTEN_STAGE_NAMES[stage],
    options: selectStageOptions(seed, stage),
  }));

  return {
    schemaVersion: ROTTEN_PLAN_SCHEMA_VERSION,
    seed,
    planId: createPlanId(seed, stages),
    stages,
    finalBossId: ROTTEN_FINAL_BOSS_ID,
  };
}
