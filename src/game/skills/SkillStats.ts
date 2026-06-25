export type SkillName = "Spite Belch";

export type SkillStats = {
  cooldownMs: number;
  damage: number;
  durationMs: number;
  knockback: number;
  range: number;
};

export const activeSkillStats: Record<SkillName, SkillStats> = {
  "Spite Belch": {
    cooldownMs: 900,
    damage: 2,
    durationMs: 170,
    knockback: 520,
    range: 430,
  },
};
