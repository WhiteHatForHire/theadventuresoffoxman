import Phaser from "phaser";
import { GAME_WIDTH } from "../../GameConfig";
import { addPaintedPlatform } from "../../levels/PaintedPlatform";
import type { RottenEncounterSpec } from "../../rotten/encounters";
import type { RottenHealthState } from "../../rotten/market";
import type { RottenRunPlanStage } from "../../rotten/plan";
import type { RottenRouteDefinition, RottenStageNumber } from "../../rotten/routes";
import type { RottenUpgradeOffer } from "../../rotten/upgrades";

const palette = {
  ink: 0x161315,
  rust: 0xb85f3f,
  gold: 0xb88a3b,
  bile: 0xa6d34a,
  blue: 0x9cc7ff,
};

export interface RottenArenaPresentation {
  readonly platforms: Phaser.Physics.Arcade.StaticGroup;
  readonly objects: Phaser.GameObjects.GameObject[];
  readonly maxFloorBodyBottom: number;
}

export function createRottenArenaPresentation(
  scene: Phaser.Scene,
  spec: RottenEncounterSpec,
): RottenArenaPresentation {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const platforms = scene.physics.add.staticGroup();
  objects.push(
    scene.add.rectangle(
      GAME_WIDTH / 2,
      646,
      GAME_WIDTH,
      148,
      spec.stage === 2 ? 0x10200d : 0x09080a,
      spec.stage === 2 ? 0.58 : 0.44,
    ).setDepth(0.4),
  );

  addTrackedPlatform(scene, platforms, objects, GAME_WIDTH / 2, 650, GAME_WIDTH, 140, {
    accent: spec.stage === 2 ? "ember" : "brass",
  });
  if (spec.stage === 1) {
    addTrackedPlatform(scene, platforms, objects, 690, 490, 300, 32, {
      accent: "audit",
      oneWay: true,
    });
  } else {
    addTrackedPlatform(scene, platforms, objects, 410, 466, 248, 30, {
      accent: "ember",
      oneWay: true,
    });
    addTrackedPlatform(scene, platforms, objects, 985, 430, 290, 30, {
      accent: "audit",
      oneWay: true,
    });
    objects.push(
      scene.add.rectangle(648, 565, 230, 20, 0x6f8b2d, 0.42)
        .setStrokeStyle(3, 0xa6d34a, 0.72)
        .setDepth(2),
      scene.add.circle(92, 210, 78, 0x7fa52f, 0.1)
        .setStrokeStyle(8, 0x7fa52f, 0.38)
        .setDepth(1.4),
      scene.add.circle(1_190, 250, 64, 0xb85f3f, 0.1)
        .setStrokeStyle(7, 0xb85f3f, 0.34)
        .setDepth(1.4),
      scene.add.text(1_036, 166, "SUMP DOCKET\nSEIZED / OVERDUE", {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "13px",
        color: "#a6d34a",
        align: "center",
        backgroundColor: "#161315aa",
        padding: { x: 8, y: 5 },
      }).setDepth(3),
    );
  }

  return { platforms, objects, maxFloorBodyBottom: 580 };
}

export interface RottenRoutePresentationInput {
  readonly stage: RottenRunPlanStage;
  readonly specs: readonly [RottenEncounterSpec | null, RottenEncounterSpec | null];
  readonly compatibility?: boolean;
  readonly operative: boolean;
  readonly carriedSummary?: string;
  readonly feedback?: string;
}

export function renderRottenRoutePresentation(
  scene: Phaser.Scene,
  input: RottenRoutePresentationInput,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const stageNumber = input.stage.stage;
  const accent = stageNumber === 1 ? palette.gold : stageNumber === 2 ? palette.bile : palette.rust;
  const subtitle = input.feedback
    || (input.compatibility
      ? "Compatibility docket: choose either frozen route with 1 or 2."
      : input.operative
        ? `${input.carriedSummary ?? "CHOOSE A ROUTE"}  •  CHOOSE 1 OR 2`
        : "DOCKET ONLY — STAGE 3 ROUTE KEYS ARE INTENTIONALLY INERT.");
  objects.push(scene.add.text(48, 104, `STAGE ${stageNumber} — ${input.stage.name.toUpperCase()}`, {
    fontFamily: "Georgia, serif",
    fontSize: "31px",
    color: "#f2e7bc",
    stroke: "#161315",
    strokeThickness: 6,
  }).setDepth(42));
  objects.push(scene.add.text(48, 148, subtitle, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "14px",
      color: input.operative ? "#d4b879" : "#d59776",
    }).setDepth(42));

  if (input.carriedSummary) {
    objects.push(scene.add.rectangle(48, 180, 1_184, 96, 0x171719, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(2, accent, 0.72)
      .setDepth(35));
    objects.push(scene.add.text(68, 196, input.carriedSummary, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#e4d6a2",
      lineSpacing: 6,
      wordWrap: { width: 1_135 },
    }).setDepth(42));
  }

  const cardY = input.carriedSummary ? 304 : 196;
  input.stage.options.forEach((route, index) => {
    const x = 48 + index * 608;
    const spec = input.specs[index];
    objects.push(scene.add.rectangle(x, cardY, 576, 270, 0x251d1c, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(3, index === 0 ? accent : palette.rust, 0.92)
      .setDepth(35));
    objects.push(scene.add.text(
      x + 20,
      cardY + 20,
      `${input.operative ? `[${index + 1}] ` : ""}${route.name.toUpperCase()}`,
      {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#f2e7bc",
      },
    ).setDepth(42));
    const waves = spec
      ? `W1 ${spec.waves[0].map(({ roleId, eliteVariant }) =>
        `${roleId}${eliteVariant ? `(${eliteVariant})` : ""}`).join(" + ")}\n`
        + `W2 ${spec.waves[1].map(({ roleId }) => roleId).join(" + ")}\n`
      : "ENCOUNTER NOT OPERATIVE IN THIS LEAF\n";
    objects.push(scene.add.text(x + 20, cardY + 66,
      `${route.encounterSummary}\n\n${waves}`
      + `ELITE RISK  ${route.eliteRisk.toUpperCase()}  •  ${route.graftReward} GRAFT\n`
      + `MARKET  ${route.marketBias.toUpperCase()}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "13px",
        color: "#d8c89b",
        lineSpacing: 6,
        wordWrap: { width: 530 },
      }).setDepth(42));
  });
  objects.push(scene.add.text(48, cardY + 300,
    input.operative
      ? "TWO WAVES. ONE REWARD STAMP. THE NEXT DOCKET REMEMBERS EVERYTHING."
      : "STAGE 3 COMBAT IS NOT CLAIMED HERE. LOADOUT, HP, GRAFT, ROUTES, MARKETS, AND BUILD ARE CARRIED TRUTH.", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: input.operative ? "#a6d34a" : "#d59776",
    }).setDepth(42));
  return objects;
}

export interface RottenMarketPresentationInput {
  readonly stage: 1 | 2;
  readonly route: RottenRouteDefinition;
  readonly offers: readonly RottenUpgradeOffer[];
  readonly health: RottenHealthState;
  readonly graft: number;
  readonly feedback: string;
  readonly healCost: number;
}

export function renderRottenMarketPresentation(
  scene: Phaser.Scene,
  input: RottenMarketPresentationInput,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.rectangle(GAME_WIDTH / 2, 398, 1_190, 540, 0x171719, 0.94)
    .setStrokeStyle(3, palette.gold, 0.8)
    .setDepth(35));
  objects.push(scene.add.text(70, 116, `STAGE ${input.stage} CLEARED — REWARD DOCKET`, {
    fontFamily: "Georgia, serif",
    fontSize: "29px",
    color: "#a6d34a",
    stroke: "#161315",
    strokeThickness: 6,
  }).setDepth(42));
  objects.push(scene.add.text(70, 160,
    `${input.route.name.toUpperCase()} PAID ${input.route.graftReward} BASE GRAFT  •  PURSE ${input.graft}`, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "15px",
      color: "#f0c66f",
    }).setDepth(42));

  input.offers.forEach((offer, index) => {
    const x = 70 + index * 390;
    objects.push(scene.add.rectangle(x, 215, 360, 260, offer.affordable ? 0x24301d : 0x2a2020, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(3, offer.affordable ? palette.bile : palette.rust, 0.9)
      .setDepth(40));
    objects.push(scene.add.text(x + 18, 235, `[${index + 1}] ${offer.name.toUpperCase()}`, {
      fontFamily: "Georgia, serif",
      fontSize: "21px",
      color: "#f2e7bc",
      wordWrap: { width: 324 },
    }).setDepth(42));
    objects.push(scene.add.text(x + 18, 292, offer.effect, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#d8c89b",
      wordWrap: { width: 324 },
      lineSpacing: 4,
    }).setDepth(42));
    objects.push(scene.add.text(x + 18, 422,
      `${offer.effectivePrice} GRAFT  •  ${offer.affordable ? "AFFORDABLE" : "BANK MORE"}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "14px",
        color: offer.affordable ? "#a6d34a" : "#d59776",
      }).setDepth(42));
  });

  const healAvailable = input.health.current < input.health.max && input.graft >= input.healCost;
  objects.push(scene.add.text(70, 520,
    `[4] HEAL 2 HP — ${input.healCost} GRAFT  •  ${healAvailable ? "AVAILABLE" : "UNAVAILABLE"}`, {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: healAvailable ? "#9cc7ff" : "#8b7773",
    }).setDepth(42));
  objects.push(scene.add.text(610, 520, "[5] BANK GRAFT — KEEP THE PURSE", {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "#e4d6a2",
  }).setDepth(42));
  objects.push(scene.add.text(70, 580,
    input.feedback || "CHOOSE ONE RECEIPT. THE NEXT DOCKET OPENS AFTER THE STAMP.", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: input.feedback ? "#f0c66f" : "#d59776",
    }).setDepth(42));
  return objects;
}

function addTrackedPlatform(
  scene: Phaser.Scene,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  objects: Phaser.GameObjects.GameObject[],
  x: number,
  y: number,
  width: number,
  height: number,
  options: Parameters<typeof addPaintedPlatform>[6],
): void {
  const existingObjects = new Set(scene.children.list);
  addPaintedPlatform(scene, platforms, x, y, width, height, options);
  const platformBodies = new Set(platforms.getChildren());
  for (const object of scene.children.list) {
    if (!existingObjects.has(object) && !platformBodies.has(object)) {
      objects.push(object);
    }
  }
}

export function stageLabel(stage: RottenStageNumber): string {
  return `STAGE ${stage}`;
}
