export type RottenWeaponId =
  | "rusty-knife"
  | "butcher-saber"
  | "tax-pike"
  | "receipt-spitter";

export type RottenWeaponStyle = "rapid" | "heavy-cleave" | "spacing" | "ranged-heat";

export interface RottenWeaponDefinition {
  readonly id: RottenWeaponId;
  readonly name: string;
  readonly description: string;
  readonly style: RottenWeaponStyle;
  readonly damage: number;
  readonly cadenceMs: number;
  readonly reach: number;
  readonly knockback: number;
  readonly cleave: boolean;
  readonly projectileSpeed?: number;
  readonly heatCapacity?: number;
  readonly recoveryMs?: number;
}

export const ROTTEN_WEAPONS: Readonly<Record<RottenWeaponId, RottenWeaponDefinition>> = {
  "rusty-knife": {
    id: "rusty-knife",
    name: "Rusty Knife",
    description: "Fastest cadence, shortest reach, single-target pressure.",
    style: "rapid",
    damage: 1,
    cadenceMs: 190,
    reach: 132,
    knockback: 170,
    cleave: false,
  },
  "butcher-saber": {
    id: "butcher-saber",
    name: "Butcher Saber",
    description: "Slow commitment, highest damage, broad aligned cleave.",
    style: "heavy-cleave",
    damage: 3,
    cadenceMs: 620,
    reach: 220,
    knockback: 310,
    cleave: true,
  },
  "tax-pike": {
    id: "tax-pike",
    name: "Tax Pike",
    description: "Longest melee reach with forceful spacing control.",
    style: "spacing",
    damage: 2,
    cadenceMs: 390,
    reach: 335,
    knockback: 490,
    cleave: false,
  },
  "receipt-spitter": {
    id: "receipt-spitter",
    name: "Receipt Spitter",
    description: "Visible ranged shots; four build heat, then recovery locks firing.",
    style: "ranged-heat",
    damage: 1,
    cadenceMs: 170,
    reach: 820,
    knockback: 210,
    cleave: false,
    projectileSpeed: 860,
    heatCapacity: 4,
    recoveryMs: 1_150,
  },
};

export type RottenSkillId = "spite-belch" | "seized-stamp" | "bribe-bomb";
export type RottenSkillGeometry = "forward-cone" | "radial-interrupt" | "delayed-area";

export interface RottenSkillDefinition {
  readonly id: RottenSkillId;
  readonly name: string;
  readonly description: string;
  readonly geometry: RottenSkillGeometry;
  readonly damage: number;
  readonly cooldownMs: number;
  readonly range: number;
  readonly knockback: number;
  readonly interruptMs: number;
  readonly delayMs: number;
}

export const ROTTEN_SKILLS: Readonly<Record<RottenSkillId, RottenSkillDefinition>> = {
  "spite-belch": {
    id: "spite-belch",
    name: "Spite Belch",
    description: "A short forward cone burst with forceful knockback.",
    geometry: "forward-cone",
    damage: 2,
    cooldownMs: 1_050,
    range: 300,
    knockback: 620,
    interruptMs: 180,
    delayMs: 0,
  },
  "seized-stamp": {
    id: "seized-stamp",
    name: "Seized Stamp",
    description: "A radial low-damage interrupt that visibly stuns attackers.",
    geometry: "radial-interrupt",
    damage: 1,
    cooldownMs: 1_550,
    range: 245,
    knockback: 180,
    interruptMs: 900,
    delayMs: 0,
  },
  "bribe-bomb": {
    id: "bribe-bomb",
    name: "Bribe Bomb",
    description: "A delayed aimed area burst placed ahead of Foxman.",
    geometry: "delayed-area",
    damage: 3,
    cooldownMs: 2_050,
    range: 175,
    knockback: 300,
    interruptMs: 260,
    delayMs: 520,
  },
};

export const ROTTEN_WEAPON_ORDER = Object.keys(ROTTEN_WEAPONS) as RottenWeaponId[];
export const ROTTEN_SKILL_ORDER = Object.keys(ROTTEN_SKILLS) as RottenSkillId[];
