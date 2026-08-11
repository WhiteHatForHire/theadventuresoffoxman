import { summarizeRottenBuild, type RottenBuildSummary } from "./build";
import type { RottenSkillId, RottenWeaponId } from "./loadout";
import type { RottenRunPlan } from "./plan";
import type { RottenRouteId } from "./routes";
import type { RottenRunPhase } from "./state";
import {
  getRottenUpgradeOffers,
  type RottenUpgradeId,
  type RottenUpgradeOffer,
} from "./upgrades";
import type { StageOneRouteId } from "./waves";

export const ROTTEN_STARTING_GRAFT = 3;
export const ROTTEN_MARKET_HEAL_COST = 2;
export const ROTTEN_MARKET_HEAL_AMOUNT = 2;

export interface RottenHealthState {
  readonly current: number;
  readonly max: number;
}

export interface RottenUpgradeMarketChoice {
  readonly input: 1 | 2 | 3;
  readonly kind: "upgrade";
  readonly upgradeId: RottenUpgradeId;
  readonly graftSpent: number;
}

export interface RottenHealMarketChoice {
  readonly input: 4;
  readonly kind: "heal";
  readonly graftSpent: typeof ROTTEN_MARKET_HEAL_COST;
  readonly healthRestored: number;
}

export interface RottenBankMarketChoice {
  readonly input: 5;
  readonly kind: "bank";
  readonly graftSpent: 0;
}

export type RottenMarketChoice =
  | RottenUpgradeMarketChoice
  | RottenHealMarketChoice
  | RottenBankMarketChoice;

export interface RottenRouteHistoryEntry {
  readonly stage: 1;
  readonly routeId: StageOneRouteId;
  readonly marketChoice: RottenMarketChoice | null;
}

export interface RottenStageOneMarketState {
  readonly status: "open" | "resolved";
  readonly stage: 1;
  readonly routeId: StageOneRouteId;
  readonly offers: readonly [RottenUpgradeOffer, RottenUpgradeOffer, RottenUpgradeOffer];
  readonly acceptedChoice: RottenMarketChoice | null;
  readonly traceEvent: string | null;
}

export interface RottenPureRunState {
  readonly plan: RottenRunPlan;
  readonly seed: string;
  readonly planId: string;
  readonly phase: RottenRunPhase;
  readonly stage: 1 | 2;
  readonly routeOptions: readonly [RottenRouteId, RottenRouteId];
  readonly weapon: RottenWeaponId | null;
  readonly skill: RottenSkillId | null;
  readonly health: RottenHealthState | null;
  readonly graft: number;
  readonly upgrades: readonly RottenUpgradeId[];
  readonly buildSummary: RottenBuildSummary;
  readonly routeHistory: readonly RottenRouteHistoryEntry[];
  readonly market: RottenStageOneMarketState | null;
  readonly trace: readonly string[];
}

export interface CreateStageOneRewardMarketInput {
  readonly plan: RottenRunPlan;
  readonly routeId: StageOneRouteId;
  readonly weapon: RottenWeaponId;
  readonly skill: RottenSkillId;
  readonly health: RottenHealthState;
  readonly graft: number;
  readonly ownedUpgrades: readonly RottenUpgradeId[];
  readonly trace: readonly string[];
}

export type RottenRewardRejectionReason =
  | "invalid-input"
  | "unaffordable"
  | "full-health"
  | "already-resolved";

export type RottenRewardDecisionResult =
  | {
    readonly accepted: true;
    readonly reason: "accepted";
    readonly feedback: string;
    readonly state: RottenPureRunState;
  }
  | {
    readonly accepted: false;
    readonly reason: RottenRewardRejectionReason;
    readonly feedback: string;
    readonly state: RottenPureRunState;
  };

export function createRottenRunBaseline(plan: RottenRunPlan): RottenPureRunState {
  return {
    plan,
    seed: plan.seed,
    planId: plan.planId,
    phase: "loadout",
    stage: 1,
    routeOptions: routeIdsForStage(plan, 1),
    weapon: null,
    skill: null,
    health: null,
    graft: ROTTEN_STARTING_GRAFT,
    upgrades: [],
    buildSummary: summarizeRottenBuild([]),
    routeHistory: [],
    market: null,
    trace: [`plan:${plan.planId}`],
  };
}

export function createStageOneRewardMarket({
  plan,
  routeId,
  weapon,
  skill,
  health,
  graft,
  ownedUpgrades,
  trace,
}: CreateStageOneRewardMarketInput): RottenPureRunState {
  validateRewardOpening(plan, routeId, health, graft, ownedUpgrades);
  const offers = getRottenUpgradeOffers({
    seed: plan.seed,
    stage: 1,
    routeId,
    graft,
    ownedUpgrades,
  });

  return {
    plan,
    seed: plan.seed,
    planId: plan.planId,
    phase: "reward-choice",
    stage: 1,
    routeOptions: routeIdsForStage(plan, 1),
    weapon,
    skill,
    health: { ...health },
    graft,
    upgrades: [...ownedUpgrades],
    buildSummary: summarizeRottenBuild(ownedUpgrades),
    routeHistory: [{ stage: 1, routeId, marketChoice: null }],
    market: {
      status: "open",
      stage: 1,
      routeId,
      offers,
      acceptedChoice: null,
      traceEvent: null,
    },
    trace: [...trace, `offers:${offers.map(({ id }) => id).join(",")}`],
  };
}

export function applyStageOneRewardInput(
  state: RottenPureRunState,
  input: number,
): RottenRewardDecisionResult {
  if (state.phase !== "reward-choice" || !state.market || state.market.status !== "open") {
    return reject(state, "already-resolved", "ONE STAMP PER DOCKET. MOVE ALONG.");
  }
  if (!Number.isInteger(input) || input < 1 || input > 5) {
    return reject(state, "invalid-input", "THAT NUMBER ISN'T ON THE DOCKET.");
  }
  if (!state.health) {
    throw new Error("An open Rotten market requires carried health.");
  }

  if (input >= 1 && input <= 3) {
    const offer = state.market.offers[input - 1];
    if (state.graft < offer.effectivePrice) {
      return reject(state, "unaffordable", "THE PURSE CAME UP SHORT.");
    }
    if (state.upgrades.includes(offer.id)) {
      return reject(state, "already-resolved", "FOXMAN ALREADY OWNS THAT BAD IDEA.");
    }

    const choice: RottenUpgradeMarketChoice = {
      input: input as 1 | 2 | 3,
      kind: "upgrade",
      upgradeId: offer.id,
      graftSpent: offer.effectivePrice,
    };
    const upgrades = [...state.upgrades, offer.id];
    const health = offer.id === "hangover-hide"
      ? {
        current: Math.min(state.health.max + 2, state.health.current + 2),
        max: state.health.max + 2,
      }
      : state.health;
    return accept(
      state,
      choice,
      health,
      state.graft - offer.effectivePrice,
      upgrades,
      `${offer.name.toUpperCase()} BOUGHT. THE DOCKET REMEMBERS.`,
    );
  }

  if (input === 4) {
    if (state.health.current >= state.health.max) {
      return reject(state, "full-health", "FOXMAN IS ALREADY AS WHOLE AS HE GETS.");
    }
    if (state.graft < ROTTEN_MARKET_HEAL_COST) {
      return reject(state, "unaffordable", "THE PURSE CAME UP SHORT.");
    }
    const healedCurrent = Math.min(
      state.health.max,
      state.health.current + ROTTEN_MARKET_HEAL_AMOUNT,
    );
    const choice: RottenHealMarketChoice = {
      input: 4,
      kind: "heal",
      graftSpent: ROTTEN_MARKET_HEAL_COST,
      healthRestored: healedCurrent - state.health.current,
    };
    return accept(
      state,
      choice,
      { current: healedCurrent, max: state.health.max },
      state.graft - ROTTEN_MARKET_HEAL_COST,
      state.upgrades,
      `PATCHED ${choice.healthRestored} HP. THE CLERK KEPT THE CHANGE.`,
    );
  }

  const choice: RottenBankMarketChoice = {
    input: 5,
    kind: "bank",
    graftSpent: 0,
  };
  return accept(
    state,
    choice,
    state.health,
    state.graft,
    state.upgrades,
    "PURSE BANKED. FOXMAN TRUSTS HIMSELF WITH MONEY.",
  );
}

export function retryRottenRunSameSeed(state: RottenPureRunState): RottenPureRunState {
  return createRottenRunBaseline(state.plan);
}

export function describeRottenMarketChoice(choice: RottenMarketChoice | null): string {
  if (!choice) {
    return "";
  }
  if (choice.kind === "upgrade") {
    return `upgrade:${choice.upgradeId}`;
  }
  if (choice.kind === "heal") {
    return `heal:${choice.healthRestored}`;
  }
  return "bank";
}

function accept(
  state: RottenPureRunState,
  choice: RottenMarketChoice,
  health: RottenHealthState,
  graft: number,
  upgrades: readonly RottenUpgradeId[],
  feedback: string,
): RottenRewardDecisionResult {
  const traceEvent = traceEventForChoice(state.market!, choice);
  const market: RottenStageOneMarketState = {
    ...state.market!,
    status: "resolved",
    acceptedChoice: choice,
    traceEvent,
  };
  const routeHistory = state.routeHistory.map((entry) =>
    entry.stage === market.stage && entry.routeId === market.routeId
      ? { ...entry, marketChoice: choice }
      : entry
  );

  return {
    accepted: true,
    reason: "accepted",
    feedback,
    state: {
      ...state,
      phase: "route-choice",
      stage: 2,
      routeOptions: routeIdsForStage(state.plan, 2),
      health,
      graft,
      upgrades: [...upgrades],
      buildSummary: summarizeRottenBuild(upgrades),
      routeHistory,
      market,
      trace: [...state.trace, traceEvent],
    },
  };
}

function reject(
  state: RottenPureRunState,
  reason: RottenRewardRejectionReason,
  feedback: string,
): RottenRewardDecisionResult {
  return { accepted: false, reason, feedback, state };
}

function traceEventForChoice(
  market: RottenStageOneMarketState,
  choice: RottenMarketChoice,
): string {
  const prefix = `market:${market.stage}:${market.routeId}`;
  if (choice.kind === "upgrade") {
    return `${prefix}:upgrade:${choice.upgradeId}:spent-${choice.graftSpent}`;
  }
  if (choice.kind === "heal") {
    return `${prefix}:heal:${choice.healthRestored}:spent-${choice.graftSpent}`;
  }
  return `${prefix}:bank:spent-0`;
}

function routeIdsForStage(
  plan: RottenRunPlan,
  stage: 1 | 2,
): readonly [RottenRouteId, RottenRouteId] {
  const planned = plan.stages.find((candidate) => candidate.stage === stage);
  if (!planned) {
    throw new Error(`Rotten plan is missing Stage ${stage}.`);
  }
  return [planned.options[0].id, planned.options[1].id];
}

function validateRewardOpening(
  plan: RottenRunPlan,
  routeId: StageOneRouteId,
  health: RottenHealthState,
  graft: number,
  ownedUpgrades: readonly RottenUpgradeId[],
): void {
  const validRoute = plan.stages[0]?.options.some((route) => route.id === routeId);
  if (!validRoute) {
    throw new Error(`Stage 1 route ${routeId} is not in the deterministic plan.`);
  }
  if (
    !Number.isInteger(health.current)
    || !Number.isInteger(health.max)
    || health.max <= 0
    || health.current < 0
    || health.current > health.max
  ) {
    throw new Error("Rotten reward health must be integral and within max health.");
  }
  if (!Number.isInteger(graft) || graft < 0) {
    throw new Error("Rotten reward graft must be a non-negative integer.");
  }
  if (new Set(ownedUpgrades).size !== ownedUpgrades.length) {
    throw new Error("Rotten upgrade ownership is unique until ranks exist.");
  }
}
