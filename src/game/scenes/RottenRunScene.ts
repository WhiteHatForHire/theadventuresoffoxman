import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { Player } from "../entities/Player";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { InputMapper } from "../input/InputMapper";
import { addPaintedPlatform } from "../levels/PaintedPlatform";
import { smokeParam } from "../smoke";
import {
  RottenCombatController,
  type RottenCombatDebugState,
} from "../rotten/RottenCombatController";
import { hashDeterministicText } from "../rotten/deterministic";
import {
  ROTTEN_SKILLS,
  ROTTEN_SKILL_ORDER,
  ROTTEN_WEAPONS,
  ROTTEN_WEAPON_ORDER,
  type RottenSkillId,
  type RottenWeaponId,
} from "../rotten/loadout";
import { buildRottenRunPlan, type RottenRunPlan } from "../rotten/plan";
import type { RottenRouteDefinition } from "../rotten/routes";
import type { RottenRunDebugSnapshot, RottenRunPhase } from "../rotten/state";
import { getStageOneOffers, type RottenUpgradeOffer } from "../rotten/upgrades";
import { STAGE_ONE_ARENA_LAYOUT, STAGE_ONE_WAVES, type StageOneRouteId } from "../rotten/waves";

interface RottenRunSceneData {
  seed?: string;
}

const palette = {
  ink: 0x161315,
  rust: 0xb85f3f,
  gold: 0xb88a3b,
  bile: 0xa6d34a,
  blue: 0x9cc7ff,
};

export class RottenRunScene extends Phaser.Scene {
  private incomingSeed?: string;
  private plan!: RottenRunPlan;
  private phase: RottenRunPhase = "loadout";
  private compatibilityMode = false;
  private encounterSmoke = false;
  private reacquisitionSmoke = false;
  private reacquisitionSmokeStage = 0;
  private selectedWeapon: RottenWeaponId | null = null;
  private selectedSkill: RottenSkillId | null = null;
  private selectedRoute: RottenRouteDefinition | null = null;
  private offers: readonly RottenUpgradeOffer[] = [];
  private graft = 3;
  private wave: 0 | 1 | 2 = 0;
  private wavesCleared = 0;
  private readonly spawnHistory: string[] = [];
  private readonly trace: string[] = [];
  private phaseObjects: Phaser.GameObjects.GameObject[] = [];
  private inputMapper?: InputMapper;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private encounterPresentationObjects: Phaser.GameObjects.GameObject[] = [];
  private combat?: RottenCombatController;
  private lastCombatDebug?: RottenCombatDebugState;
  private encounterStartedAt = 0;
  private elapsedActiveMilliseconds = 0;
  private interwave = false;
  private interwaveText?: Phaser.GameObjects.Text;
  private hudText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  private lastSnapshotAt = 0;
  private inputLockedUntil = 0;

  constructor() {
    super("RottenRunScene");
  }

  init(data: RottenRunSceneData): void {
    this.incomingSeed = data.seed;
    this.phase = "loadout";
    this.compatibilityMode = false;
    this.encounterSmoke = false;
    this.reacquisitionSmoke = false;
    this.reacquisitionSmokeStage = 0;
    this.selectedWeapon = null;
    this.selectedSkill = null;
    this.selectedRoute = null;
    this.offers = [];
    this.graft = 3;
    this.wave = 0;
    this.wavesCleared = 0;
    this.spawnHistory.length = 0;
    this.trace.length = 0;
    this.phaseObjects = [];
    this.inputMapper = undefined;
    this.platforms = undefined;
    this.encounterPresentationObjects = [];
    this.combat = undefined;
    this.lastCombatDebug = undefined;
    this.encounterStartedAt = 0;
    this.elapsedActiveMilliseconds = 0;
    this.interwave = false;
    this.interwaveText = undefined;
    this.hudText = undefined;
    this.waveText = undefined;
    this.lastSnapshotAt = 0;
    this.inputLockedUntil = 0;
  }

  create(): void {
    const query = new URLSearchParams(window.location.search);
    this.compatibilityMode = smokeParam() === "rottenContract";
    this.encounterSmoke = smokeParam() === "rottenEncounter";
    this.reacquisitionSmoke = smokeParam() === "rottenReacquire";
    this.plan = buildRottenRunPlan(this.incomingSeed ?? query.get("seed") ?? undefined);
    this.trace.push(`plan:${this.plan.planId}`);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createBackdrop();
    this.createKeyboardBindings();

    if (this.compatibilityMode) {
      this.phase = "route-choice";
      this.renderRouteChoice(true);
    } else {
      this.renderLoadout();
    }
    this.publishSnapshot();
  }

  update(time: number): void {
    if (this.phase !== "encounter" || !this.combat || !this.inputMapper || this.interwave) {
      return;
    }

    const input = this.encounterSmoke
      ? this.combat.automatedInput(time)
      : this.inputMapper.snapshot();
    this.combat.update(time, input);
    if (this.phase !== "encounter" || !this.combat) {
      return;
    }
    this.lastCombatDebug = this.combat.debugState(time);
    this.advanceReacquisitionSmoke(this.lastCombatDebug);
    this.elapsedActiveMilliseconds = Math.max(0, Math.round(time - this.encounterStartedAt));
    this.updateCombatHud(this.lastCombatDebug);

    if (time - this.lastSnapshotAt >= 50) {
      this.lastSnapshotAt = time;
      this.publishSnapshot();
    }
  }

  private createBackdrop(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.46);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, palette.ink, 0.57);
    this.add.rectangle(GAME_WIDTH / 2, 49, GAME_WIDTH - 44, 72, 0x241a18, 0.95)
      .setStrokeStyle(2, palette.rust, 0.95)
      .setDepth(40);
    this.add.text(42, 22, "ROTTEN RUN", {
      fontFamily: "Georgia, serif",
      fontSize: "30px",
      color: "#f0c66f",
      stroke: "#161315",
      strokeThickness: 6,
    }).setDepth(41);
    this.add.text(875, 21, `SEED  ${this.plan.seed}\nPLAN  ${this.plan.planId}`, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "14px",
      color: "#e4d6a2",
      lineSpacing: 3,
    }).setDepth(41);
  }

  private createKeyboardBindings(): void {
    const keyNames = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"];
    keyNames.forEach((keyName, index) => {
      this.input.keyboard?.on(`keydown-${keyName}`, () => this.handleNumber(index + 1));
    });
    this.input.keyboard?.on("keydown-ENTER", () => this.confirmLoadout());
    this.input.keyboard?.on("keyup-R", () => this.retrySameSeed());
  }

  private handleNumber(number: number): void {
    if (this.time.now < this.inputLockedUntil) {
      return;
    }
    if (this.phase === "loadout") {
      if (number >= 1 && number <= 4) {
        this.selectedWeapon = ROTTEN_WEAPON_ORDER[number - 1];
        this.trace.push(`weapon:${this.selectedWeapon}`);
        this.renderLoadout();
      } else if (number >= 5 && number <= 7) {
        this.selectedSkill = ROTTEN_SKILL_ORDER[number - 5];
        this.trace.push(`skill:${this.selectedSkill}`);
        this.renderLoadout();
      }
      this.publishSnapshot();
      return;
    }

    if (this.phase === "route-choice" && (number === 1 || number === 2)) {
      if (this.compatibilityMode) {
        this.selectCompatibilityRoute(number - 1);
      } else {
        this.selectCombatRoute(number - 1);
      }
    }
  }

  private confirmLoadout(): void {
    if (this.phase !== "loadout" || !this.selectedWeapon || !this.selectedSkill) {
      return;
    }
    this.trace.push("loadout:confirmed");
    this.phase = "route-choice";
    this.renderRouteChoice(false);
    this.publishSnapshot();
  }

  private renderLoadout(): void {
    this.phase = "loadout";
    this.clearPhaseUi();
    this.track(this.add.text(48, 108, "BUILD YOUR BAD DECISION", {
      fontFamily: "Georgia, serif",
      fontSize: "29px",
      color: "#f2e7bc",
      stroke: "#161315",
      strokeThickness: 5,
    }));
    this.track(this.add.text(48, 148, "Choose one weapon [1–4] and one active skill [5–7]. Enter confirms both.", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#d4b879",
    }));

    ROTTEN_WEAPON_ORDER.forEach((id, index) => {
      const weapon = ROTTEN_WEAPONS[id];
      const y = 195 + index * 102;
      const selected = id === this.selectedWeapon;
      this.track(this.add.rectangle(48, y, 560, 86, selected ? 0x2b311d : 0x211a1a, 0.94)
        .setOrigin(0, 0)
        .setStrokeStyle(selected ? 4 : 2, selected ? palette.bile : palette.gold, 0.9));
      this.track(this.add.text(66, y + 11, `[${index + 1}] ${weapon.name.toUpperCase()}`, {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: selected ? "#cfff71" : "#f2e7bc",
      }));
      this.track(this.add.text(66, y + 43, `${weapon.description}\nSTYLE ${weapon.style.toUpperCase()}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "12px",
        color: "#d8c89b",
        lineSpacing: 2,
      }));
    });

    ROTTEN_SKILL_ORDER.forEach((id, index) => {
      const skill = ROTTEN_SKILLS[id];
      const y = 195 + index * 124;
      const selected = id === this.selectedSkill;
      this.track(this.add.rectangle(638, y, 594, 108, selected ? 0x1d2d32 : 0x191c22, 0.94)
        .setOrigin(0, 0)
        .setStrokeStyle(selected ? 4 : 2, selected ? palette.blue : palette.rust, 0.9));
      this.track(this.add.text(658, y + 13, `[${index + 5}] ${skill.name.toUpperCase()}`, {
        fontFamily: "Georgia, serif",
        fontSize: "21px",
        color: selected ? "#bde7ff" : "#f2e7bc",
      }));
      this.track(this.add.text(658, y + 48, `${skill.description}\n${skill.geometry.toUpperCase()}  •  ${skill.cooldownMs}MS`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "12px",
        color: "#c9bed2",
        wordWrap: { width: 540 },
        lineSpacing: 4,
      }));
    });

    const ready = Boolean(this.selectedWeapon && this.selectedSkill);
    this.track(this.add.text(640, 590, ready
      ? `READY: ${ROTTEN_WEAPONS[this.selectedWeapon!].name} + ${ROTTEN_SKILLS[this.selectedSkill!].name}\nPRESS ENTER TO INSPECT STAGE 1 ROUTES`
      : "INCOMPLETE LOADOUT — choose one card from each docket.", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "16px",
      color: ready ? "#a6d34a" : "#d59776",
      lineSpacing: 7,
    }));
  }

  private renderRouteChoice(compatibility: boolean): void {
    this.clearPhaseUi();
    const firstStage = this.plan.stages[0];
    this.track(this.add.text(48, 110, `STAGE 1 — ${firstStage.name.toUpperCase()}`, {
      fontFamily: "Georgia, serif",
      fontSize: "28px",
      color: "#f2e7bc",
      stroke: "#161315",
      strokeThickness: 5,
    }));
    this.track(this.add.text(48, 150, compatibility
      ? "Compatibility docket: choose either frozen route with 1 or 2."
      : `LOADOUT  ${ROTTEN_WEAPONS[this.selectedWeapon!].name.toUpperCase()} + ${ROTTEN_SKILLS[this.selectedSkill!].name.toUpperCase()}  •  CHOOSE 1 OR 2`, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "15px",
      color: "#d4b879",
    }));

    firstStage.options.forEach((route, index) => {
      const y = 195 + index * 166;
      this.track(this.add.rectangle(48, y, 622, 140, 0x251d1c, 0.95)
        .setOrigin(0, 0)
        .setStrokeStyle(3, index === 0 ? palette.gold : palette.rust, 0.9));
      this.track(this.add.text(68, y + 16, `[${index + 1}] ${route.name.toUpperCase()}`, {
        fontFamily: "Georgia, serif",
        fontSize: "23px",
        color: "#f2e7bc",
      }));
      const waves = STAGE_ONE_WAVES[route.id as StageOneRouteId];
      this.track(this.add.text(68, y + 52,
        `${route.encounterSummary}\nW1 ${waves[0].join(" + ")}  •  W2 ${waves[1].join(" + ")}\n${route.graftReward} GRAFT  •  ${route.marketBias.toUpperCase()} MARKET`, {
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "13px",
          color: "#d8c89b",
          lineSpacing: 5,
        }));
    });

    this.track(this.add.rectangle(950, 377, 526, 378, 0x171719, 0.91)
      .setStrokeStyle(2, palette.gold, 0.62));
    this.track(this.add.text(714, 204, "FROZEN ROUTE PLAN", {
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      color: "#e4d6a2",
    }));
    this.plan.stages.slice(1).forEach((stage, index) => {
      const y = 250 + index * 128;
      this.track(this.add.text(714, y, `STAGE ${stage.stage} — ${stage.name.toUpperCase()}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "15px",
        color: index === 0 ? "#d59776" : "#a6d34a",
      }));
      this.track(this.add.text(714, y + 31, stage.options.map((route) => `• ${route.name}`).join("\n"), {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "17px",
        color: "#f2e7bc",
        lineSpacing: 7,
      }));
    });
    this.track(this.add.text(714, 510, "FINAL BOSS\nCommissioner of Consequences", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      color: "#f0c66f",
      lineSpacing: 6,
    }));
  }

  private selectCompatibilityRoute(index: number): void {
    this.selectedRoute = this.plan.stages[0].options[index];
    this.phase = "encounter";
    this.trace.push(`contract-route:${this.selectedRoute.id}`);
    this.track(this.add.text(48, 608, `SELECTED: ${this.selectedRoute.name.toUpperCase()}`, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 4,
    }));
    this.publishSnapshot();
  }

  private selectCombatRoute(index: number): void {
    if (!this.selectedWeapon || !this.selectedSkill) {
      return;
    }
    this.selectedRoute = this.plan.stages[0].options[index];
    this.trace.push(`route:${this.selectedRoute.id}`);
    this.startEncounter();
  }

  private startEncounter(): void {
    this.phase = "encounter";
    this.clearPhaseUi();
    this.encounterPresentationObjects.push(
      this.add.rectangle(GAME_WIDTH / 2, 646, GAME_WIDTH, 148, 0x09080a, 0.44).setDepth(0.4),
    );
    this.platforms = this.physics.add.staticGroup();
    this.addEncounterPlatform(
      GAME_WIDTH / 2,
      STAGE_ONE_ARENA_LAYOUT.floorCenterY,
      GAME_WIDTH,
      STAGE_ONE_ARENA_LAYOUT.floorHeight,
      { accent: "brass" },
    );
    this.addEncounterPlatform(690, 490, 300, 32, { accent: "audit", oneWay: true });

    this.inputMapper = new InputMapper(this);
    const player = new Player(this, 200, 500, 6).setDepth(10);
    this.combat = new RottenCombatController(
      this,
      player,
      this.platforms,
      this.selectedWeapon!,
      this.selectedSkill!,
      STAGE_ONE_ARENA_LAYOUT.maxFloorBodyBottom,
      {
        onWaveCleared: () => this.handleWaveCleared(),
        onPlayerDead: () => this.enterDeadState(),
        onTrace: (event) => this.trace.push(event),
      },
    );
    this.encounterStartedAt = this.time.now;
    this.wave = 1;
    this.spawnWave(1);
    if (this.reacquisitionSmoke && this.selectedRoute?.id === "unfiled-alley") {
      this.time.delayedCall(450, () => {
        if (this.phase === "encounter" && this.wave === 1 && this.combat?.displaceLivingWritRunnerBeyondView("right")) {
          this.reacquisitionSmokeStage = 1;
        }
      });
    }

    this.waveText = this.track(this.add.text(GAME_WIDTH / 2, 112, "", {
      fontFamily: "Georgia, serif",
      fontSize: "28px",
      color: "#f2e7bc",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0).setDepth(42));
    this.hudText = this.track(this.add.text(32, 104, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "14px",
      color: "#e4d6a2",
      backgroundColor: "#161315cc",
      padding: { x: 9, y: 7 },
      lineSpacing: 4,
    }).setDepth(42));
    this.track(this.add.text(32, GAME_HEIGHT - 45,
      "A/D MOVE  •  SPACE JUMP  •  SHIFT/L DASH  •  J WEAPON  •  K SKILL", {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "13px",
        color: "#f2e7bc",
        backgroundColor: "#161315cc",
        padding: { x: 8, y: 6 },
      }).setDepth(42));
    this.lastCombatDebug = this.combat.debugState(this.time.now);
    this.updateCombatHud(this.lastCombatDebug);
    this.publishSnapshot();
  }

  private spawnWave(wave: 1 | 2): void {
    if (!this.combat || !this.selectedRoute) {
      return;
    }
    const roles = STAGE_ONE_WAVES[this.selectedRoute.id as StageOneRouteId][wave - 1];
    this.spawnHistory.push(`${wave}:${roles.join(",")}`);
    this.combat.spawnWave(roles, wave);
    this.wave = wave;
    this.interwave = false;
    this.publishSnapshot();
  }

  private handleWaveCleared(): void {
    if (this.interwave || this.phase !== "encounter") {
      return;
    }
    this.wavesCleared += 1;
    this.trace.push(`wave-${this.wave}:cleared`);
    this.interwave = true;
    this.interwaveText = this.track(this.add.text(GAME_WIDTH / 2, 310,
      this.wave === 1 ? "WAVE 1 CLEARED\nNEXT DOCKET INCOMING" : "STAGE 1 CLEARED\nREWARD DOCKET OPENING", {
        fontFamily: "Georgia, serif",
        fontSize: "34px",
        color: "#a6d34a",
        align: "center",
        stroke: "#161315",
        strokeThickness: 7,
        lineSpacing: 8,
      }).setOrigin(0.5).setDepth(50));
    this.publishSnapshot();

    if (this.wave === 1) {
      this.time.delayedCall(1_150, () => {
        if (this.phase !== "encounter") {
          return;
        }
        this.interwaveText?.setVisible(false);
        this.spawnWave(2);
      });
    } else {
      this.time.delayedCall(650, () => this.enterRewardChoice());
    }
  }

  private enterRewardChoice(): void {
    if (this.phase !== "encounter" || !this.selectedRoute) {
      return;
    }
    if (this.combat) {
      this.lastCombatDebug = this.combat.debugState(this.time.now);
      this.combat.destroy();
      this.combat = undefined;
    }
    this.destroyEncounterPresentation();
    this.graft += this.selectedRoute.graftReward;
    this.offers = getStageOneOffers(
      this.plan.seed,
      this.selectedRoute.id as StageOneRouteId,
      this.graft,
    );
    this.trace.push(`graft:+${this.selectedRoute.graftReward}`);
    this.trace.push(`offers:${this.offers.map(({ id }) => id).join(",")}`);
    this.phase = "reward-choice";
    this.interwave = false;
    this.renderRewardChoice();
    this.publishSnapshot();
  }

  private renderRewardChoice(): void {
    this.clearPhaseUi();
    this.track(this.add.rectangle(GAME_WIDTH / 2, 398, 1_190, 540, 0x171719, 0.94)
      .setStrokeStyle(3, palette.gold, 0.8)
      .setDepth(35));
    this.track(this.add.text(70, 116, "STAGE 1 CLEARED — REWARD DOCKET", {
      fontFamily: "Georgia, serif",
      fontSize: "29px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 6,
    }).setDepth(42));
    this.track(this.add.text(70, 160,
      `${this.selectedRoute!.name.toUpperCase()} PAID ${this.selectedRoute!.graftReward} GRAFT  •  PURSE ${this.graft}`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "15px",
        color: "#f0c66f",
      }).setDepth(42));

    this.offers.forEach((offer, index) => {
      const x = 70 + index * 390;
      this.track(this.add.rectangle(x, 215, 360, 260, offer.affordable ? 0x24301d : 0x2a2020, 0.98)
        .setOrigin(0, 0)
        .setStrokeStyle(3, offer.affordable ? palette.bile : palette.rust, 0.9)
        .setDepth(40));
      this.track(this.add.text(x + 18, 235, offer.name.toUpperCase(), {
        fontFamily: "Georgia, serif",
        fontSize: "21px",
        color: "#f2e7bc",
        wordWrap: { width: 324 },
      }).setDepth(42));
      this.track(this.add.text(x + 18, 292, offer.effect, {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "16px",
        color: "#d8c89b",
        wordWrap: { width: 324 },
        lineSpacing: 4,
      }).setDepth(42));
      this.track(this.add.text(x + 18, 422,
        `${offer.cost} GRAFT  •  ${offer.affordable ? "AFFORDABLE" : "BANK MORE"}`, {
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "14px",
          color: offer.affordable ? "#a6d34a" : "#d59776",
        }).setDepth(42));
    });

    this.track(this.add.text(70, 520, "HEAL 2 HP — 2 GRAFT", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: "#9cc7ff",
    }).setDepth(42));
    this.track(this.add.text(420, 520, "BANK GRAFT — KEEP THE WHOLE FILTHY PURSE", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: "#e4d6a2",
    }).setDepth(42));
    this.track(this.add.text(70, 580,
      "PURCHASES, HEALING, BANKING, AND STAGE 2 OPEN IN THE NEXT DOCKET.", {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "13px",
        color: "#d59776",
      }).setDepth(42));
  }

  private enterDeadState(): void {
    if (this.phase !== "encounter") {
      return;
    }
    this.lastCombatDebug = this.combat?.debugState(this.time.now);
    this.phase = "dead";
    this.elapsedActiveMilliseconds = Math.max(0, Math.round(this.time.now - this.encounterStartedAt));
    this.clearPhaseUi();
    this.track(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 310, 0x120d0e, 0.96)
      .setStrokeStyle(4, palette.rust, 0.94)
      .setDepth(60));
    this.track(this.add.text(GAME_WIDTH / 2, 245, "FOXMAN GOT FILED", {
      fontFamily: "Georgia, serif",
      fontSize: "42px",
      color: "#ff8a68",
      stroke: "#161315",
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(61));
    this.track(this.add.text(GAME_WIDTH / 2, 330,
      `SEED ${this.plan.seed}  •  PLAN ${this.plan.planId}\nPRESS R TO RETRY THIS SEED FROM LOADOUT`, {
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: "17px",
        color: "#f2e7bc",
        align: "center",
        lineSpacing: 10,
      }).setOrigin(0.5).setDepth(61));
    this.publishSnapshot();
  }

  private retrySameSeed(): void {
    if (this.phase !== "dead") {
      return;
    }
    this.combat?.destroy();
    this.combat = undefined;
    this.destroyEncounterPresentation();
    this.inputMapper = undefined;
    this.selectedWeapon = null;
    this.selectedSkill = null;
    this.selectedRoute = null;
    this.offers = [];
    this.graft = 3;
    this.wave = 0;
    this.wavesCleared = 0;
    this.spawnHistory.length = 0;
    this.trace.length = 0;
    this.trace.push(`plan:${this.plan.planId}`);
    this.lastCombatDebug = undefined;
    this.encounterStartedAt = 0;
    this.elapsedActiveMilliseconds = 0;
    this.interwave = false;
    this.interwaveText = undefined;
    this.hudText = undefined;
    this.waveText = undefined;
    this.lastSnapshotAt = 0;
    this.inputLockedUntil = this.time.now + 250;
    this.renderLoadout();
    this.publishSnapshot();
  }

  private updateCombatHud(debug: RottenCombatDebugState): void {
    if (!this.hudText || !this.waveText) {
      return;
    }
    this.waveText.setText(`${this.selectedRoute!.name.toUpperCase()}  •  WAVE ${this.wave}/2`);
    const weaponStatus = debug.weaponRecovering
      ? `HEAT ${debug.weaponHeat}/4 — RECOVERING`
      : `ATTACKS ${debug.attackCount}  HITS ${debug.attackHitCount}`;
    this.hudText.setText(
      `HP ${debug.playerHealth}/${debug.playerMaxHealth}  •  GRAFT ${this.graft}\n`
      + `${ROTTEN_WEAPONS[this.selectedWeapon!].name}: ${weaponStatus}\n`
      + `${ROTTEN_SKILLS[this.selectedSkill!].name}: USES ${debug.skillUseCount}  HITS ${debug.skillHitCount}  ${debug.skillReady ? "READY" : "COOLING"}\n`
      + `ENEMIES ${debug.livingEnemies}`,
    );
  }

  private publishSnapshot(): void {
    const routeOptions = this.plan.stages[0].options.map((route) => route.id) as [
      RottenRouteDefinition["id"],
      RottenRouteDefinition["id"],
    ];
    const debug = this.combat?.debugState(this.time.now) ?? this.lastCombatDebug;
    const traceDigest = hashDeterministicText(this.trace.join("|")).toString(16).padStart(8, "0").toUpperCase();
    const snapshot: RottenRunDebugSnapshot = {
      scene: "RottenRunScene",
      phase: this.phase,
      schemaVersion: this.plan.schemaVersion,
      seed: this.plan.seed,
      planId: this.plan.planId,
      stage: 1,
      routeOptions,
      selectedRoute: this.selectedRoute?.id ?? null,
      weapon: this.selectedWeapon,
      skill: this.selectedSkill,
      upgrades: [],
      graft: this.graft,
      hp: debug ? { current: debug.playerHealth, max: debug.playerMaxHealth } : null,
      livingEnemies: this.phase === "reward-choice" || this.phase === "loadout" || this.phase === "route-choice"
        ? 0
        : debug?.livingEnemies ?? 0,
      eliteCount: 0,
      bossHealth: null,
      bossPhase: null,
      elapsedActiveMilliseconds: this.elapsedActiveMilliseconds,
      result: null,
      traceDigest,
      wave: this.wave,
      wavesCleared: this.wavesCleared,
      spawnHistory: [...this.spawnHistory],
      enemyStates: debug?.enemyStates.map(({ role, state, health }) => `${role}:${state}:${health}`) ?? [],
      enemyGeometry: debug?.enemyStates.map(({ role, state, alive, feetY, bodyBottom }) =>
        `${role}:${state}:${alive ? 1 : 0}:${feetY}:${bodyBottom}`) ?? [],
      enemyReacquisition: debug?.enemyStates.map(({
        role,
        state,
        alive,
        onscreen,
        reacquiring,
        reacquisitionCount,
        lastReacquisitionMs,
        offscreenForMs,
        bodyLeft,
        bodyRight,
        velocityX,
        reacquisitionDirection,
      }) => `${role}:${state}:${alive ? 1 : 0}:${onscreen ? 1 : 0}:${reacquiring ? 1 : 0}:`
        + `${reacquisitionCount}:${lastReacquisitionMs}:${offscreenForMs}:${bodyLeft}:${bodyRight}:`
        + `${velocityX}:${reacquisitionDirection}`) ?? [],
      enemyTell: debug?.enemyTell ?? "",
      attackCount: debug?.attackCount ?? 0,
      attackHitCount: debug?.attackHitCount ?? 0,
      weaponStyle: debug?.weaponStyle ?? "",
      weaponCooldownMs: debug?.weaponCooldownMs ?? 0,
      weaponHeat: debug?.weaponHeat ?? 0,
      weaponRecovering: debug?.weaponRecovering ?? false,
      skillUseCount: debug?.skillUseCount ?? 0,
      skillHitCount: debug?.skillHitCount ?? 0,
      skillReady: debug?.skillReady ?? false,
      offerIds: this.offers.map(({ id }) => id),
      combatObjectCount:
        (this.combat ? debug?.combatObjectCount ?? 0 : 0) + this.countEncounterPresentationObjects(),
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
    document.body.dataset.rottenHp = snapshot.hp ? `${snapshot.hp.current}/${snapshot.hp.max}` : "";
    document.body.dataset.rottenLivingEnemies = String(snapshot.livingEnemies);
    document.body.dataset.rottenEliteCount = String(snapshot.eliteCount);
    document.body.dataset.rottenBossHealth = snapshot.bossHealth ?? "";
    document.body.dataset.rottenBossPhase = snapshot.bossPhase ?? "";
    document.body.dataset.rottenElapsedActiveMilliseconds = String(snapshot.elapsedActiveMilliseconds);
    document.body.dataset.rottenResult = snapshot.result ?? "";
    document.body.dataset.rottenTraceDigest = snapshot.traceDigest;
    document.body.dataset.rottenWave = String(snapshot.wave);
    document.body.dataset.rottenWavesCleared = String(snapshot.wavesCleared);
    document.body.dataset.rottenSpawnHistory = snapshot.spawnHistory.join("|");
    document.body.dataset.rottenEnemyStates = snapshot.enemyStates.join("|");
    document.body.dataset.rottenEnemyGeometry = snapshot.enemyGeometry.join("|");
    document.body.dataset.rottenEnemyReacquisition = snapshot.enemyReacquisition.join("|");
    document.body.dataset.rottenEnemyTell = snapshot.enemyTell;
    document.body.dataset.rottenAttackCount = String(snapshot.attackCount);
    document.body.dataset.rottenAttackHitCount = String(snapshot.attackHitCount);
    document.body.dataset.rottenWeaponStyle = snapshot.weaponStyle;
    document.body.dataset.rottenWeaponCooldownMs = String(snapshot.weaponCooldownMs);
    document.body.dataset.rottenWeaponHeat = String(snapshot.weaponHeat);
    document.body.dataset.rottenWeaponRecovering = String(snapshot.weaponRecovering);
    document.body.dataset.rottenSkillUseCount = String(snapshot.skillUseCount);
    document.body.dataset.rottenSkillHitCount = String(snapshot.skillHitCount);
    document.body.dataset.rottenSkillReady = String(snapshot.skillReady);
    document.body.dataset.rottenOfferIds = snapshot.offerIds.join("|");
    document.body.dataset.rottenCombatObjectCount = String(snapshot.combatObjectCount);
  }

  private clearPhaseUi(): void {
    for (const object of this.phaseObjects) {
      object.destroy();
    }
    this.phaseObjects = [];
  }

  private advanceReacquisitionSmoke(debug: RottenCombatDebugState): void {
    if (!this.reacquisitionSmoke || !this.combat || this.wave !== 1) {
      return;
    }
    const runner = debug.enemyStates.find(({ role, alive }) => role === "writ-runner" && alive);
    if (!runner || !runner.onscreen) {
      return;
    }
    if (this.reacquisitionSmokeStage === 1 && runner.reacquisitionCount >= 1) {
      if (this.combat.displaceLivingWritRunnerBeyondView("left")) {
        this.reacquisitionSmokeStage = 2;
      }
    } else if (this.reacquisitionSmokeStage === 2 && runner.reacquisitionCount >= 2) {
      if (this.combat.prepareLivingWritRunnerHitProof()) {
        this.reacquisitionSmokeStage = 3;
      }
    }
  }

  private addEncounterPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
    options: Parameters<typeof addPaintedPlatform>[6],
  ): void {
    if (!this.platforms) {
      return;
    }
    const existingObjects = new Set(this.children.list);
    addPaintedPlatform(this, this.platforms, x, y, width, height, options);
    const platformBodies = new Set(this.platforms.getChildren());
    for (const object of this.children.list) {
      if (!existingObjects.has(object) && !platformBodies.has(object)) {
        this.encounterPresentationObjects.push(object);
      }
    }
  }

  private destroyEncounterPresentation(): void {
    for (const object of this.encounterPresentationObjects) {
      object.destroy();
    }
    this.encounterPresentationObjects = [];
    this.platforms?.destroy(true);
    this.platforms = undefined;
  }

  private countEncounterPresentationObjects(): number {
    const visibleObjects = this.encounterPresentationObjects.filter(({ active }) => active).length;
    const platformObjects = this.platforms?.getChildren().filter(({ active }) => active).length ?? 0;
    return visibleObjects + platformObjects + (this.platforms ? 1 : 0);
  }

  private track<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.phaseObjects.push(object);
    return object;
  }
}
