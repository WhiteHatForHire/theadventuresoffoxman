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
    reach: 185,
    hitStopMs: 45,
    knockback: 180,
  },
  "Butcher Saber": {
    kind: "melee",
    damage: 3,
    reach: 330,
    hitStopMs: 85,
    knockback: 290,
  },
  "Tax Pike": {
    kind: "melee",
    damage: 2,
    reach: 430,
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
    reach: stats.reach + 90,
    knockback: stats.knockback + 40,
  };
}

export function isRangedWeapon(stats: WeaponStats): boolean {
  return stats.kind === "ranged";
}
