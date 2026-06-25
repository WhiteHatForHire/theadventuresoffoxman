export type RewardChoiceId = "pikeReach" | "auditShield";
import type { MutationId } from "../mutations/MutationStats";
import type { SkillName } from "../skills/SkillStats";

export type RewardChoice = {
  id: RewardChoiceId;
  title: string;
  description: string;
};

export type ShopChoiceId =
  | "pikeReach"
  | "auditShield"
  | "spiteBelch"
  | "hangoverHide"
  | "pettyGrudge";

export type ShopChoice = {
  id: ShopChoiceId;
  title: string;
  description: string;
  category: "weapon" | "survival" | "skill" | "mutation";
  reward: RewardChoiceId;
  mutation?: MutationId;
  skill?: SkillName;
};

export const rewardChoices: Record<RewardChoiceId, RewardChoice> = {
  pikeReach: {
    id: "pikeReach",
    title: "Extend the Tax Pike",
    description: "+90 reach in the audit office.",
  },
  auditShield: {
    id: "auditShield",
    title: "Pocket the Audit Shield",
    description: "Start the audit office with one extra hit.",
  },
};

export const shopChoices: Record<ShopChoiceId, ShopChoice> = {
  pikeReach: {
    id: "pikeReach",
    title: rewardChoices.pikeReach.title,
    description: rewardChoices.pikeReach.description,
    category: "weapon",
    reward: "pikeReach",
  },
  auditShield: {
    id: "auditShield",
    title: rewardChoices.auditShield.title,
    description: rewardChoices.auditShield.description,
    category: "survival",
    reward: "auditShield",
  },
  spiteBelch: {
    id: "spiteBelch",
    title: "Bottle the Spite Belch",
    description: "Unlock Foxman's active cone of weaponized indigestion.",
    category: "skill",
    reward: "pikeReach",
    skill: "Spite Belch",
  },
  hangoverHide: {
    id: "hangoverHide",
    title: "Grow Hangover Hide",
    description: "+1 max health on the audit route.",
    category: "mutation",
    reward: "pikeReach",
    mutation: "hangoverHide",
  },
  pettyGrudge: {
    id: "pettyGrudge",
    title: "Nurse a Petty Grudge",
    description: "+1 weapon damage on the audit route.",
    category: "mutation",
    reward: "pikeReach",
    mutation: "pettyGrudge",
  },
};

export function rewardFromQuery(search: string): RewardChoiceId {
  const reward = new URLSearchParams(search).get("reward");
  return reward === "auditShield" ? "auditShield" : "pikeReach";
}
