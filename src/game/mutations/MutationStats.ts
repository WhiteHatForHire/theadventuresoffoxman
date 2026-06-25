import type { WeaponStats } from "../combat/WeaponStats";

export type MutationId = "hangoverHide" | "pettyGrudge";

export type MutationDefinition = {
  id: MutationId;
  title: string;
  description: string;
};

export const mutationDefinitions: Record<MutationId, MutationDefinition> = {
  hangoverHide: {
    id: "hangoverHide",
    title: "Hangover Hide",
    description: "+1 max health because regret has calluses.",
  },
  pettyGrudge: {
    id: "pettyGrudge",
    title: "Petty Grudge",
    description: "+1 weapon damage while Foxman remembers every slight.",
  },
};

export function mutationFromQuery(search: string): MutationId | undefined {
  const mutation = new URLSearchParams(search).get("mutation");

  if (mutation === "hangoverHide" || mutation === "pettyGrudge") {
    return mutation;
  }

  return undefined;
}

export function applyMutationHealthBonus(baseMaxHealth: number, mutation?: MutationId): number {
  return mutation === "hangoverHide" ? baseMaxHealth + 1 : baseMaxHealth;
}

export function applyMutationWeaponBonus(stats: WeaponStats, mutation?: MutationId): WeaponStats {
  if (mutation !== "pettyGrudge") {
    return stats;
  }

  return {
    ...stats,
    damage: stats.damage + 1,
    hitStopMs: stats.hitStopMs + 10,
  };
}
