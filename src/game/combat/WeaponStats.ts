export type WeaponName = "Rusty Knife" | "Butcher Saber" | "Tax Pike" | "Receipt Spitter";

export type WeaponKind = "melee" | "ranged";

export type WeaponStats = {
  kind: WeaponKind;
  damage: number;
  reach: number;
  hitStopMs: number;
  knockback: number;
  projectileSpeed?: number;
  projectileRange?: number;
};

export const weaponStats: Record<WeaponName, WeaponStats> = {
  "Rusty Knife": {
    kind: "melee",
    damage: 1,
    reach: 135,
    hitStopMs: 45,
    knockback: 180,
  },
  "Butcher Saber": {
    kind: "melee",
    damage: 3,
    reach: 205,
    hitStopMs: 85,
    knockback: 290,
  },
  "Tax Pike": {
    kind: "melee",
    damage: 2,
    reach: 310,
    hitStopMs: 65,
    knockback: 420,
  },
  "Receipt Spitter": {
    kind: "ranged",
    damage: 2,
    reach: 780,
    hitStopMs: 55,
    knockback: 220,
    projectileSpeed: 840,
    projectileRange: 880,
  },
};

export function applyTaxPikeReachReward(stats: WeaponStats): WeaponStats {
  return {
    ...stats,
    reach: stats.reach + 55,
    knockback: stats.knockback + 30,
  };
}

export function isRangedWeapon(stats: WeaponStats): boolean {
  return stats.kind === "ranged";
}
