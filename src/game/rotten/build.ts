import type { RottenUpgradeId } from "./upgrades";

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
