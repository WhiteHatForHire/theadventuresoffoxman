import { ROTTEN_SKILLS, ROTTEN_WEAPONS, type RottenSkillId, type RottenWeaponId } from "./loadout";
import type { RottenUpgradeId } from "./upgrades";

export const ROTTEN_BUILD_CONSTANTS = {
  pettyGrudgeBonusDamage: 1,
  pettyGrudgeDurationMs: 3_000,
  normalDashCooldownMs: 520,
  counterfeitDashCooldownMs: 340,
  dashWakeDamage: 1,
  compoundWindowMs: 900,
  compoundMaxBonusDamage: 2,
  waveHealAmount: 1,
  spiteReserveCooldownMultiplier: 0.65,
  deadLetterEchoDelayMs: 120,
  deadLetterEchoDamageMultiplier: 0.5,
  baseEliteGraft: 1,
  graftDividendEliteBonus: 1,
} as const;

export interface RottenBuildSummary {
  readonly maxHealthBonus: number;
  readonly immediateHealOnAcquire: number;
  readonly weaponDamageSurgeOnDamage: boolean;
  readonly dashCooldownReduced: boolean;
  readonly damagingDashWake: boolean;
  readonly boundedRapidHitDamageBonus: boolean;
  readonly healPerClearedWave: number;
  readonly activeSkillCooldownReduced: boolean;
  readonly weaponPatternRepeatOrPierce: boolean;
  readonly elitesAwardBonusGraft: boolean;
  readonly marketDiscount: number;
}

export type RottenDeadLetterConfig =
  | { readonly kind: "echo"; readonly delayMs: number; readonly damage: number }
  | { readonly kind: "pierce"; readonly additionalTargets: 1 }
  | { readonly kind: "projectile-pierce"; readonly additionalTargets: 1 };

export interface RottenCombatBuild {
  readonly weaponId: RottenWeaponId;
  readonly skillId: RottenSkillId;
  readonly baseWeaponDamage: number;
  readonly maxHealthBonus: number;
  readonly pettyGrudge: {
    readonly bonusDamage: number;
    readonly durationMs: number;
  } | null;
  readonly dash: {
    readonly cooldownMs: number;
    readonly wakeDamage: number;
  };
  readonly compoundInterest: {
    readonly windowMs: number;
    readonly maxBonusDamage: number;
  } | null;
  readonly waveHealAmount: number;
  readonly skillCooldownMs: number;
  readonly deadLetter: RottenDeadLetterConfig | null;
  readonly eliteBonusGraft: number;
  readonly marketDiscount: number;
}

export interface RottenBuildRuntimeState {
  readonly grudgeUntilMs: number;
  readonly compoundHits: number;
  readonly compoundBonusDamage: number;
  readonly compoundExpiresAtMs: number;
}

export interface RottenResolvedWeaponDamage {
  readonly baseDamage: number;
  readonly grudgeBonus: number;
  readonly compoundBonus: number;
  readonly totalBonus: number;
  readonly totalDamage: number;
}

export function summarizeRottenBuild(
  ownedUpgrades: readonly RottenUpgradeId[],
): RottenBuildSummary {
  const owned = new Set(ownedUpgrades);

  return {
    maxHealthBonus: owned.has("hangover-hide") ? 2 : 0,
    immediateHealOnAcquire: owned.has("hangover-hide") ? 2 : 0,
    weaponDamageSurgeOnDamage: owned.has("petty-grudge"),
    dashCooldownReduced: owned.has("counterfeit-soles"),
    damagingDashWake: owned.has("counterfeit-soles"),
    boundedRapidHitDamageBonus: owned.has("compound-interest"),
    healPerClearedWave: owned.has("red-tape-tourniquet") ? 1 : 0,
    activeSkillCooldownReduced: owned.has("spite-reserve"),
    weaponPatternRepeatOrPierce: owned.has("dead-letter"),
    elitesAwardBonusGraft: owned.has("graft-dividend"),
    marketDiscount: owned.has("graft-dividend") ? 1 : 0,
  };
}

export function deriveRottenCombatBuild(
  ownedUpgrades: readonly RottenUpgradeId[],
  weaponId: RottenWeaponId,
  skillId: RottenSkillId,
): RottenCombatBuild {
  const summary = summarizeRottenBuild(ownedUpgrades);
  const weapon = ROTTEN_WEAPONS[weaponId];
  const skill = ROTTEN_SKILLS[skillId];

  return {
    weaponId,
    skillId,
    baseWeaponDamage: weapon.damage,
    maxHealthBonus: summary.maxHealthBonus,
    pettyGrudge: summary.weaponDamageSurgeOnDamage
      ? {
        bonusDamage: ROTTEN_BUILD_CONSTANTS.pettyGrudgeBonusDamage,
        durationMs: ROTTEN_BUILD_CONSTANTS.pettyGrudgeDurationMs,
      }
      : null,
    dash: {
      cooldownMs: summary.dashCooldownReduced
        ? ROTTEN_BUILD_CONSTANTS.counterfeitDashCooldownMs
        : ROTTEN_BUILD_CONSTANTS.normalDashCooldownMs,
      wakeDamage: summary.damagingDashWake ? ROTTEN_BUILD_CONSTANTS.dashWakeDamage : 0,
    },
    compoundInterest: summary.boundedRapidHitDamageBonus
      ? {
        windowMs: ROTTEN_BUILD_CONSTANTS.compoundWindowMs,
        maxBonusDamage: ROTTEN_BUILD_CONSTANTS.compoundMaxBonusDamage,
      }
      : null,
    waveHealAmount: summary.healPerClearedWave,
    skillCooldownMs: summary.activeSkillCooldownReduced
      ? Math.round(skill.cooldownMs * ROTTEN_BUILD_CONSTANTS.spiteReserveCooldownMultiplier)
      : skill.cooldownMs,
    deadLetter: summary.weaponPatternRepeatOrPierce ? deadLetterForWeapon(weaponId) : null,
    eliteBonusGraft: summary.elitesAwardBonusGraft
      ? ROTTEN_BUILD_CONSTANTS.graftDividendEliteBonus
      : 0,
    marketDiscount: summary.marketDiscount,
  };
}

export function createRottenBuildRuntime(): RottenBuildRuntimeState {
  return {
    grudgeUntilMs: 0,
    compoundHits: 0,
    compoundBonusDamage: 0,
    compoundExpiresAtMs: 0,
  };
}

export function recordRottenPlayerDamage(
  build: RottenCombatBuild,
  runtime: RottenBuildRuntimeState,
  nowMs: number,
): RottenBuildRuntimeState {
  if (!build.pettyGrudge) {
    return runtime;
  }
  return {
    ...runtime,
    grudgeUntilMs: nowMs + build.pettyGrudge.durationMs,
  };
}

export function recordRottenWeaponHit(
  build: RottenCombatBuild,
  runtime: RottenBuildRuntimeState,
  nowMs: number,
): RottenBuildRuntimeState {
  if (!build.compoundInterest) {
    return runtime;
  }
  const continued = runtime.compoundExpiresAtMs >= nowMs;
  const compoundHits = continued ? runtime.compoundHits + 1 : 1;
  return {
    ...runtime,
    compoundHits,
    compoundBonusDamage: Math.min(
      build.compoundInterest.maxBonusDamage,
      Math.max(0, compoundHits - 1),
    ),
    compoundExpiresAtMs: nowMs + build.compoundInterest.windowMs,
  };
}

export function resolveRottenWeaponDamage(
  build: RottenCombatBuild,
  runtime: RottenBuildRuntimeState,
  nowMs: number,
): RottenResolvedWeaponDamage {
  const grudgeBonus = build.pettyGrudge && runtime.grudgeUntilMs >= nowMs
    ? build.pettyGrudge.bonusDamage
    : 0;
  const compoundBonus = build.compoundInterest && runtime.compoundExpiresAtMs >= nowMs
    ? Math.min(build.compoundInterest.maxBonusDamage, runtime.compoundBonusDamage)
    : 0;
  const totalBonus = grudgeBonus + compoundBonus;
  return {
    baseDamage: build.baseWeaponDamage,
    grudgeBonus,
    compoundBonus,
    totalBonus,
    totalDamage: build.baseWeaponDamage + totalBonus,
  };
}

export function applyRottenWaveHeal(
  build: RottenCombatBuild,
  health: { readonly current: number; readonly max: number },
): {
  readonly health: { readonly current: number; readonly max: number };
  readonly restored: number;
} {
  const current = Math.min(health.max, health.current + build.waveHealAmount);
  return {
    health: { current, max: health.max },
    restored: current - health.current,
  };
}

export function getRottenEliteGraft(build: RottenCombatBuild): number {
  return ROTTEN_BUILD_CONSTANTS.baseEliteGraft + build.eliteBonusGraft;
}

function deadLetterForWeapon(weaponId: RottenWeaponId): RottenDeadLetterConfig {
  if (weaponId === "tax-pike") {
    return { kind: "pierce", additionalTargets: 1 };
  }
  if (weaponId === "receipt-spitter") {
    return { kind: "projectile-pierce", additionalTargets: 1 };
  }
  const weapon = ROTTEN_WEAPONS[weaponId];
  return {
    kind: "echo",
    delayMs: ROTTEN_BUILD_CONSTANTS.deadLetterEchoDelayMs,
    damage: Math.max(
      1,
      Math.ceil(weapon.damage * ROTTEN_BUILD_CONSTANTS.deadLetterEchoDamageMultiplier),
    ),
  };
}
