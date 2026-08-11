import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { hashDeterministicText } from "../rotten/deterministic";
import { buildRottenRunPlan, type RottenRunPlan } from "../rotten/plan";
import type { RottenRouteDefinition } from "../rotten/routes";
import type { RottenRunDebugSnapshot, RottenRunShellPhase } from "../rotten/state";

interface RottenRunSceneData {
  seed?: string;
}

const palette = {
  ink: 0x161315,
  parchment: 0xe4d6a2,
  rust: 0xb85f3f,
  gold: 0xb88a3b,
  bile: 0xa6d34a,
};

export class RottenRunScene extends Phaser.Scene {
  private incomingSeed?: string;
  private plan!: RottenRunPlan;
  private phase: RottenRunShellPhase = "route-choice";
  private selectedRoute: RottenRouteDefinition | null = null;
  private selectedSummary!: Phaser.GameObjects.Text;

  constructor() {
    super("RottenRunScene");
  }

  init(data: RottenRunSceneData): void {
    this.incomingSeed = data.seed;
    this.phase = "route-choice";
    this.selectedRoute = null;
  }

  create(): void {
    const querySeed = new URLSearchParams(window.location.search).get("seed");
    this.plan = buildRottenRunPlan(this.incomingSeed ?? querySeed ?? undefined);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.36);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, palette.ink, 0.72);
    this.add.rectangle(GAME_WIDTH / 2, 55, GAME_WIDTH - 56, 82, 0x241a18, 0.94)
      .setStrokeStyle(2, palette.rust, 0.95);

    this.add.text(52, 28, "ROTTEN RUN", {
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      color: "#f0c66f",
      stroke: "#161315",
      strokeThickness: 6,
    });
    this.add.text(300, 33, "A THREE-STAGE BUREAUCRATIC RECKONING", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "15px",
      color: "#d59776",
      stroke: "#161315",
      strokeThickness: 4,
    });
    this.add.text(860, 27, `SEED  ${this.plan.seed}\nPLAN  ${this.plan.planId}`, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "15px",
      color: "#e4d6a2",
      align: "right",
      lineSpacing: 4,
    }).setOrigin(0, 0);

    const firstStage = this.plan.stages[0];
    this.add.text(52, 118, `STAGE 1 — ${firstStage.name.toUpperCase()}`, {
      fontFamily: "Georgia, serif",
      fontSize: "25px",
      color: "#f2e7bc",
      stroke: "#161315",
      strokeThickness: 5,
    });
    this.add.text(52, 154, "Choose the first filing disaster. The unchosen route stays frozen in the plan.", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#c7b98e",
    });

    firstStage.options.forEach((route, index) => {
      this.createRouteCard(route, index, 52, 205 + index * 168);
    });

    this.add.rectangle(966, 369, 544, 392, 0x171719, 0.9)
      .setStrokeStyle(2, palette.gold, 0.62);
    this.add.text(720, 190, "FROZEN ROUTE PLAN", {
      fontFamily: "Georgia, serif",
      fontSize: "23px",
      color: "#e4d6a2",
    });

    for (const stage of this.plan.stages.slice(1)) {
      const y = stage.stage === 2 ? 244 : 386;
      this.add.text(720, y, `STAGE ${stage.stage} — ${stage.name.toUpperCase()}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "16px",
        color: stage.stage === 2 ? "#d59776" : "#a6d34a",
      });
      this.add.text(720, y + 35, stage.options.map((route, index) => `${index + 1}. ${route.name}`).join("\n"), {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
        color: "#f2e7bc",
        lineSpacing: 10,
      });
    }

    this.add.text(720, 505, "FINAL BOSS", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "14px",
      color: "#d59776",
    });
    this.add.text(720, 529, "Commissioner of Consequences", {
      fontFamily: "Georgia, serif",
      fontSize: "21px",
      color: "#f0c66f",
    });

    this.selectedSummary = this.add.text(52, 594, "AWAITING ROUTE: press 1 or 2", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 4,
      wordWrap: { width: 1170 },
    });

    this.input.keyboard?.on("keydown-ONE", () => this.selectRoute(0));
    this.input.keyboard?.on("keydown-TWO", () => this.selectRoute(1));

    this.publishSnapshot();
  }

  private createRouteCard(route: RottenRouteDefinition, index: number, x: number, y: number): void {
    this.add.rectangle(x, y, 610, 140, 0x261d1c, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(2, index === 0 ? palette.gold : palette.rust, 0.9);
    this.add.text(x + 20, y + 16, `[${index + 1}]  ${route.name.toUpperCase()}`, {
      fontFamily: "Georgia, serif",
      fontSize: "23px",
      color: "#f2e7bc",
    });
    this.add.text(x + 20, y + 55, route.encounterSummary, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "17px",
      color: "#d8c89b",
    });
    this.add.text(
      x + 20,
      y + 94,
      `${route.graftReward} GRAFT  •  ${route.marketBias.toUpperCase()} MARKET  •  ELITE: ${route.eliteRisk.toUpperCase()}`,
      {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "14px",
        color: "#d59776",
      },
    );
  }

  private selectRoute(index: 0 | 1): void {
    this.selectedRoute = this.plan.stages[0].options[index];
    this.phase = "encounter";
    this.selectedSummary.setText(
      `SELECTED: ${this.selectedRoute.name.toUpperCase()} — ${this.selectedRoute.encounterSummary}. `
      + "Encounter implementation follows in the next Rotten Run gate.",
    );
    this.publishSnapshot();
  }

  private publishSnapshot(): void {
    const routeOptions = this.plan.stages[0].options.map((route) => route.id) as [
      RottenRouteDefinition["id"],
      RottenRouteDefinition["id"],
    ];
    const traceSource = `${this.plan.planId}|${this.phase}|${this.selectedRoute?.id ?? "unselected"}`;
    const traceDigest = hashDeterministicText(traceSource).toString(16).padStart(8, "0").toUpperCase();
    const snapshot: RottenRunDebugSnapshot = {
      scene: "RottenRunScene",
      phase: this.phase,
      schemaVersion: this.plan.schemaVersion,
      seed: this.plan.seed,
      planId: this.plan.planId,
      stage: 1,
      routeOptions,
      selectedRoute: this.selectedRoute?.id ?? null,
      weapon: null,
      skill: null,
      upgrades: [],
      graft: 3,
      hp: null,
      livingEnemies: 0,
      eliteCount: 0,
      bossHealth: null,
      bossPhase: null,
      elapsedActiveMilliseconds: 0,
      result: null,
      traceDigest,
    };

    window.__FOXMAN_ROTTEN__ = snapshot;
    document.body.dataset.scene = snapshot.scene;
    document.body.dataset.rottenScene = snapshot.scene;
    document.body.dataset.rottenPhase = snapshot.phase;
    document.body.dataset.rottenSeed = snapshot.seed;
    document.body.dataset.rottenPlanId = snapshot.planId;
    document.body.dataset.rottenStage = String(snapshot.stage);
    document.body.dataset.rottenRouteOptions = snapshot.routeOptions.join("|");
    document.body.dataset.rottenSelectedRoute = snapshot.selectedRoute ?? "";
    document.body.dataset.rottenWeapon = snapshot.weapon ?? "";
    document.body.dataset.rottenSkill = snapshot.skill ?? "";
    document.body.dataset.rottenUpgrades = snapshot.upgrades.join("|");
    document.body.dataset.rottenGraft = String(snapshot.graft);
    document.body.dataset.rottenHp = snapshot.hp ?? "";
    document.body.dataset.rottenLivingEnemies = String(snapshot.livingEnemies);
    document.body.dataset.rottenEliteCount = String(snapshot.eliteCount);
    document.body.dataset.rottenBossHealth = snapshot.bossHealth ?? "";
    document.body.dataset.rottenBossPhase = snapshot.bossPhase ?? "";
    document.body.dataset.rottenElapsedActiveMilliseconds = String(snapshot.elapsedActiveMilliseconds);
    document.body.dataset.rottenResult = snapshot.result ?? "";
    document.body.dataset.rottenTraceDigest = snapshot.traceDigest;
  }
}
