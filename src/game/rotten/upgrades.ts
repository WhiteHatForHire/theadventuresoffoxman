import { scopedDeterministicOrder } from "./deterministic";
import type { RottenRouteId, RottenStageNumber } from "./routes";
import type { StageOneRouteId } from "./waves";
import { normalizeRottenSeed } from "./seed";

export type RottenUpgradeId =
  | "hangover-hide"
  | "petty-grudge"
  | "counterfeit-soles"
  | "compound-interest"
  | "red-tape-tourniquet"
  | "spite-reserve"
  | "dead-letter"
  | "graft-dividend";

export interface RottenUpgradeDefinition {
  readonly id: RottenUpgradeId;
  readonly name: string;
  readonly effect: string;
  readonly cost: number;
}

export interface RottenUpgradeOffer extends RottenUpgradeDefinition {
  readonly basePrice: number;
  readonly effectivePrice: number;
  readonly affordable: boolean;
}

export interface RottenUpgradeOfferRequest {
  readonly seed: unknown;
  readonly stage: RottenStageNumber;
  readonly routeId: RottenRouteId;
  readonly graft: number;
  readonly ownedUpgrades: readonly RottenUpgradeId[];
}

export const ROTTEN_UPGRADES: Readonly<Record<RottenUpgradeId, RottenUpgradeDefinition>> = {
  "hangover-hide": {
    id: "hangover-hide",
    name: "Hangover Hide",
    effect: "+2 maximum health and heal 2 immediately.",
    cost: 5,
  },
  "petty-grudge": {
    id: "petty-grudge",
    name: "Petty Grudge",
    effect: "Taking damage grants a temporary weapon-damage surge.",
    cost: 5,
  },
  "counterfeit-soles": {
    id: "counterfeit-soles",
    name: "Counterfeit Soles",
    effect: "Shorter dash cooldown and a damaging dash wake.",
    cost: 4,
  },
  "compound-interest": {
    id: "compound-interest",
    name: "Compound Interest",
    effect: "Rapid consecutive hits stack a bounded damage bonus.",
    cost: 6,
  },
  "red-tape-tourniquet": {
    id: "red-tape-tourniquet",
    name: "Red-Tape Tourniquet",
    effect: "Heal 1 after each cleared combat wave.",
    cost: 4,
  },
  "spite-reserve": {
    id: "spite-reserve",
    name: "Spite Reserve",
    effect: "Materially shorter active-skill cooldown.",
    cost: 5,
  },
  "dead-letter": {
    id: "dead-letter",
    name: "Dead Letter",
    effect: "Weapon patterns gain an archetype-appropriate repeat or pierce.",
    cost: 7,
  },
  "graft-dividend": {
    id: "graft-dividend",
    name: "Graft Dividend",
    effect: "Elites award bonus graft and market prices fall by one.",
    cost: 6,
  },
};

export function getRottenUpgradeOffers({
  seed: seedInput,
  stage,
  routeId,
  graft,
  ownedUpgrades,
}: RottenUpgradeOfferRequest): readonly [
  RottenUpgradeOffer,
  RottenUpgradeOffer,
  RottenUpgradeOffer,
] {
  const seed = normalizeRottenSeed(seedInput);
  const owned = new Set(ownedUpgrades);
  const marketDiscount = owned.has("graft-dividend") ? 1 : 0;
  const ordered = scopedDeterministicOrder(
    Object.values(ROTTEN_UPGRADES).filter(({ id }) => !owned.has(id)),
    seed,
    `offers:stage-${stage}:${routeId}`,
  );
  const offers = ordered.slice(0, 3).map((upgrade) => ({
    ...upgrade,
    basePrice: upgrade.cost,
    effectivePrice: Math.max(0, upgrade.cost - marketDiscount),
    affordable: graft >= Math.max(0, upgrade.cost - marketDiscount),
  }));

  if (offers.length !== 3) {
    throw new Error("Rotten markets require three eligible unique upgrades.");
  }

  return offers as [RottenUpgradeOffer, RottenUpgradeOffer, RottenUpgradeOffer];
}

export function getStageOneOffers(
  seedInput: unknown,
  routeId: StageOneRouteId,
  graft: number,
): readonly [RottenUpgradeOffer, RottenUpgradeOffer, RottenUpgradeOffer] {
  return getRottenUpgradeOffers({
    seed: seedInput,
    stage: 1,
    routeId,
    graft,
    ownedUpgrades: [],
  });
}
