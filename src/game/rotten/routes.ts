export type RottenStageNumber = 1 | 2 | 3;
export type RottenMarketBias = "weapon" | "economy" | "skill" | "mutation";
export type RottenEliteRisk = "standard" | "guaranteed" | "double-variation";

export type RottenRouteId =
  | "bailiffs-ramp"
  | "bribe-line"
  | "unfiled-alley"
  | "bile-registry"
  | "seized-goods-lift"
  | "late-fee-chapel"
  | "garnish-gallery"
  | "appeal-furnace"
  | "collection-parade";

export interface RottenRouteDefinition {
  readonly id: RottenRouteId;
  readonly stage: RottenStageNumber;
  readonly name: string;
  readonly encounterSummary: string;
  readonly eliteRisk: RottenEliteRisk;
  readonly graftReward: number;
  readonly marketBias: RottenMarketBias;
}

export const ROTTEN_STAGE_NAMES: Readonly<Record<RottenStageNumber, string>> = {
  1: "Intake Yard",
  2: "Sump Docket",
  3: "Final Filing",
};

const stageOne = [
  {
    id: "bailiffs-ramp",
    stage: 1,
    name: "Bailiffs' Ramp",
    encounterSummary: "Bailiff and writ-runner pressure",
    eliteRisk: "standard",
    graftReward: 4,
    marketBias: "weapon",
  },
  {
    id: "bribe-line",
    stage: 1,
    name: "Bribe Line",
    encounterSummary: "Clerk crossfire and a larger swarm",
    eliteRisk: "standard",
    graftReward: 5,
    marketBias: "economy",
  },
  {
    id: "unfiled-alley",
    stage: 1,
    name: "Unfiled Alley",
    encounterSummary: "Writ-runner mobility test",
    eliteRisk: "standard",
    graftReward: 4,
    marketBias: "skill",
  },
] as const satisfies readonly RottenRouteDefinition[];

const stageTwo = [
  {
    id: "bile-registry",
    stage: 2,
    name: "Bile Registry",
    encounterSummary: "Sump-scribe hazards plus bailiffs",
    eliteRisk: "standard",
    graftReward: 5,
    marketBias: "skill",
  },
  {
    id: "seized-goods-lift",
    stage: 2,
    name: "Seized Goods Lift",
    encounterSummary: "Shield auditors plus a clerk",
    eliteRisk: "standard",
    graftReward: 5,
    marketBias: "weapon",
  },
  {
    id: "late-fee-chapel",
    stage: 2,
    name: "Late Fee Chapel",
    encounterSummary: "One guaranteed elite in a mixed encounter",
    eliteRisk: "guaranteed",
    graftReward: 6,
    marketBias: "mutation",
  },
] as const satisfies readonly RottenRouteDefinition[];

const stageThree = [
  {
    id: "garnish-gallery",
    stage: 3,
    name: "Garnish Gallery",
    encounterSummary: "All-range mixed pressure",
    eliteRisk: "standard",
    graftReward: 6,
    marketBias: "weapon",
  },
  {
    id: "appeal-furnace",
    stage: 3,
    name: "Appeal Furnace",
    encounterSummary: "Projectile and hazard control test",
    eliteRisk: "standard",
    graftReward: 6,
    marketBias: "skill",
  },
  {
    id: "collection-parade",
    stage: 3,
    name: "Collection Parade",
    encounterSummary: "Two elite variations across the waves",
    eliteRisk: "double-variation",
    graftReward: 7,
    marketBias: "mutation",
  },
] as const satisfies readonly RottenRouteDefinition[];

export const ROUTES_BY_STAGE: Readonly<
  Record<RottenStageNumber, readonly RottenRouteDefinition[]>
> = {
  1: stageOne,
  2: stageTwo,
  3: stageThree,
};
