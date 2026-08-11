import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { Player } from "../entities/Player";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { InputMapper, type InputSnapshot } from "../input/InputMapper";
import { smokeAutoEnabled, smokeParam } from "../smoke";
import { deriveRottenCombatBuild, type RottenCombatBuild } from "../rotten/build";
import {
  RottenCombatController,
  type RottenCombatAutomationProfile,
  type RottenCombatDebugState,
} from "../rotten/RottenCombatController";
import { hashDeterministicText } from "../rotten/deterministic";
import { getRottenEncounterSpec, type RottenEncounterSpec, type RottenEliteVariant } from "../rotten/encounters";
import {
  ROTTEN_SKILLS,
  ROTTEN_SKILL_ORDER,
  ROTTEN_WEAPONS,
  ROTTEN_WEAPON_ORDER,
  type RottenSkillId,
  type RottenWeaponId,
} from "../rotten/loadout";
import {
  applyRottenRewardInput,
  createRottenRunBaseline,
  createRottenRewardMarket,
  describeRottenMarketChoice,
  retryRottenRunSameSeed,
  ROTTEN_MARKET_HEAL_COST,
  type RottenPureRunState,
  type RottenRewardDecisionResult,
} from "../rotten/market";
import { buildRottenRunPlan, type RottenRunPlan } from "../rotten/plan";
import type { RottenRouteDefinition } from "../rotten/routes";
import type { RottenEnemyRoleId } from "../rotten/enemyRoles";
import type { RottenRunDebugSnapshot, RottenRunPhase } from "../rotten/state";
import { ROTTEN_UPGRADES, type RottenUpgradeOffer } from "../rotten/upgrades";
import {
  createRottenArenaPresentation,
  renderRottenCommissionerDossier,
  renderRottenMarketPresentation,
  renderRottenRoutePresentation,
} from "./rotten/RottenRunPresentation";

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

const ROTTEN_NEUTRAL_INPUT: InputSnapshot = {
  left: false,
  right: false,
  jumpPressed: false,
  jumpHeld: false,
  attackPressed: false,
  skillPressed: false,
  dashPressed: false,
};

export class RottenRunScene extends Phaser.Scene {
  private incomingSeed?: string;
  private plan!: RottenRunPlan;
  private phase: RottenRunPhase = "loadout";
  private compatibilityMode = false;
  private encounterSmoke = false;
  private combatAutomationProfile: RottenCombatAutomationProfile = "clear";
  private marketHealSmoke = false;
  private marketHealAutomationArmed = false;
  private poorMarketSmoke = false;
  private stageTwoDeathSmoke = false;
  private stageThreeDeathSmoke = false;
  private reacquisitionSmoke = false;
  private reacquisitionSmokeStage = 0;
  private selectedWeapon: RottenWeaponId | null = null;
  private selectedSkill: RottenSkillId | null = null;
  private selectedRoute: RottenRouteDefinition | null = null;
  private selectedEncounter?: RottenEncounterSpec;
  private offers: readonly RottenUpgradeOffer[] = [];
  private pureState?: RottenPureRunState;
  private graft = 3;
  private wave: 0 | 1 | 2 = 0;
  private stageWavesCleared = 0;
  private wavesCleared = 0;
  private readonly spawnHistory: string[] = [];
  private readonly trace: string[] = [];
  private phaseObjects: Phaser.GameObjects.GameObject[] = [];
  private inputMapper?: InputMapper;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private encounterPresentationObjects: Phaser.GameObjects.GameObject[] = [];
  private combat?: RottenCombatController;
  private combatBuild?: RottenCombatBuild;
  private lastCombatDebug?: RottenCombatDebugState;
  private encounterStartedAt = 0;
  private elapsedActiveMilliseconds = 0;
  private interwave = false;
  private interwaveText?: Phaser.GameObjects.Text;
  private hudText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  private lastSnapshotAt = 0;
  private inputLockedUntil = 0;
  private rewardFeedback = "";
  private rewardFeedbackReason: "" | RottenRewardDecisionResult["reason"] = "";
  private eliteBountyGraft = 0;
  private readonly defeatedEliteVariants: RottenEliteVariant[] = [];
  private readonly defeatedEliteRoles: RottenEnemyRoleId[] = [];
  private killCount = 0;
  private readonly keyboardBindings: Array<{ event: string; handler: () => void }> = [];
  private numericKeyDownBinding?: (event: KeyboardEvent) => void;
  private numericKeyUpBinding?: (event: KeyboardEvent) => void;
  private readonly heldNumericKeys = new Set<number>();
  private routeDocketAwaitingNumericRelease = false;

  constructor() {
    super("RottenRunScene");
  }

  init(data: RottenRunSceneData): void {
    this.incomingSeed = data.seed;
    this.phase = "loadout";
    this.compatibilityMode = false;
    this.encounterSmoke = false;
    this.combatAutomationProfile = "clear";
    this.marketHealSmoke = false;
    this.marketHealAutomationArmed = false;
    this.poorMarketSmoke = false;
    this.stageTwoDeathSmoke = false;
    this.stageThreeDeathSmoke = false;
    this.reacquisitionSmoke = false;
    this.reacquisitionSmokeStage = 0;
    this.selectedWeapon = null;
    this.selectedSkill = null;
    this.selectedRoute = null;
    this.selectedEncounter = undefined;
    this.offers = [];
    this.pureState = undefined;
    this.graft = 3;
    this.wave = 0;
    this.stageWavesCleared = 0;
    this.wavesCleared = 0;
    this.spawnHistory.length = 0;
    this.trace.length = 0;
    this.phaseObjects = [];
    this.inputMapper = undefined;
    this.platforms = undefined;
    this.encounterPresentationObjects = [];
    this.combat = undefined;
    this.combatBuild = undefined;
    this.lastCombatDebug = undefined;
    this.encounterStartedAt = 0;
    this.elapsedActiveMilliseconds = 0;
    this.interwave = false;
    this.interwaveText = undefined;
    this.hudText = undefined;
    this.waveText = undefined;
    this.lastSnapshotAt = 0;
    this.inputLockedUntil = 0;
    this.rewardFeedback = "";
    this.rewardFeedbackReason = "";
    this.eliteBountyGraft = 0;
    this.defeatedEliteVariants.length = 0;
    this.defeatedEliteRoles.length = 0;
    this.killCount = 0;
    this.keyboardBindings.length = 0;
    this.clearNumericInputState();
  }

  create(): void {
    const query = new URLSearchParams(window.location.search);
    const smoke = smokeAutoEnabled() ? smokeParam() : null;
    this.compatibilityMode = smoke === "rottenContract";
    this.encounterSmoke = smoke === "rottenEncounter"
      || smoke === "rottenMarket"
      || smoke === "rottenMarketHeal"
      || smoke === "rottenMarketPoor"
      || smoke?.startsWith("rottenStageTwo") === true
      || smoke?.startsWith("rottenStageThree") === true;
    this.combatAutomationProfile = smoke === "rottenStageTwoRoles"
      || smoke === "rottenStageThreeRoles"
      ? "role-proof"
      : smoke === "rottenStageTwoBuilds" || smoke === "rottenStageThreeBuilds"
        ? "build-proof"
        : "clear";
    this.marketHealSmoke = smoke === "rottenMarketHeal";
    this.poorMarketSmoke = smoke === "rottenMarketPoor";
    this.stageTwoDeathSmoke = smoke === "rottenStageTwoRetry";
    this.stageThreeDeathSmoke = smoke === "rottenStageThreeRetry";
    this.reacquisitionSmoke = smoke === "rottenReacquire";
    this.plan = buildRottenRunPlan(this.incomingSeed ?? query.get("seed") ?? undefined);
    this.pureState = createRottenRunBaseline(this.plan);
    this.trace.push(`plan:${this.plan.planId}`);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createBackdrop();
    this.createKeyboardBindings();

    if (this.compatibilityMode) {
      this.phase = "route-choice";
      this.renderCurrentRouteDocket(true);
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
      ? (this.stageTwoDeathSmoke && this.selectedEncounter?.stage === 2)
        || (this.stageThreeDeathSmoke && this.selectedEncounter?.stage === 3 && this.wave === 2)
        ? ROTTEN_NEUTRAL_INPUT
        : this.marketHealSmoke && !this.marketHealAutomationArmed
        ? ROTTEN_NEUTRAL_INPUT
        : this.combat.automatedInput(time)
      : this.inputMapper.snapshot();
    this.combat.update(time, input);
    if (this.phase !== "encounter" || !this.combat) {
      return;
    }
    this.lastCombatDebug = this.combat.debugState(time);
    if (
      this.marketHealSmoke
      && !this.marketHealAutomationArmed
      && this.lastCombatDebug.playerHealth < this.lastCombatDebug.playerMaxHealth
    ) {
      this.marketHealAutomationArmed = true;
      this.trace.push("smoke:market-heal-damage-observed");
    }
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
    this.createNumericKeyboardBindings();
    this.bindKeyboard("keydown-ENTER", () => this.confirmLoadout());
    this.bindKeyboard("keyup-R", () => this.retrySameSeed());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownSceneRuntime, this);
  }

  private createNumericKeyboardBindings(): void {
    this.releaseNumericKeyboardBindings();
    this.numericKeyDownBinding = (event) => {
      const number = this.numberFromKeyboardEvent(event);
      if (number !== null) {
        this.handleNumericKeyDown(number, event);
      }
    };
    this.numericKeyUpBinding = (event) => {
      const number = this.numberFromKeyboardEvent(event);
      if (number !== null) {
        this.handleNumericKeyUp(number);
      }
    };
    window.addEventListener("keydown", this.numericKeyDownBinding);
    window.addEventListener("keyup", this.numericKeyUpBinding);
  }

  private numberFromKeyboardEvent(event: KeyboardEvent): number | null {
    const match = /^Digit([1-7])$/.exec(event.code);
    return match ? Number(match[1]) : null;
  }

  private handleNumericKeyDown(number: number, event: KeyboardEvent): void {
    if (event.repeat || this.heldNumericKeys.has(number)) {
      return;
    }
    this.heldNumericKeys.add(number);
    this.handleNumber(number);
  }

  private handleNumericKeyUp(number: number): void {
    this.heldNumericKeys.delete(number);
    if (this.routeDocketAwaitingNumericRelease && this.heldNumericKeys.size === 0) {
      this.routeDocketAwaitingNumericRelease = false;
    }
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

    if (this.phase === "reward-choice") {
      this.handleRewardInput(number);
      return;
    }

    if (
      this.phase === "route-choice"
      && !this.routeDocketAwaitingNumericRelease
      && (this.pureState?.stage ?? 1) <= 3
      && (number === 1 || number === 2)
    ) {
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
    this.renderCurrentRouteDocket(false);
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

  private renderCurrentRouteDocket(compatibility: boolean): void {
    this.clearPhaseUi();
    const stageNumber = this.pureState?.stage ?? 1;
    const stage = this.plan.stages.find((candidate) => candidate.stage === stageNumber);
    if (!stage) {
      throw new Error(`Rotten plan is missing Stage ${stageNumber}.`);
    }
    const operative = stageNumber <= 3;
    const specs = stage.options.map((route) =>
      operative ? getRottenEncounterSpec(this.plan.seed, route.id) : null
    ) as [RottenEncounterSpec | null, RottenEncounterSpec | null];
    const carriedSummary = compatibility
      ? undefined
      : stageNumber === 1
        ? `LOADOUT  ${ROTTEN_WEAPONS[this.selectedWeapon!].name.toUpperCase()} + ${ROTTEN_SKILLS[this.selectedSkill!].name.toUpperCase()}`
        : this.describeCarriedDocket();
    this.phaseObjects.push(...renderRottenRoutePresentation(this, {
      stage,
      specs,
      compatibility,
      operative,
      carriedSummary,
      feedback: stageNumber > 1 ? this.rewardFeedback : undefined,
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
    const stageNumber = this.pureState?.stage ?? 1;
    if (stageNumber > 3) {
      return;
    }
    const stage = this.plan.stages.find((candidate) => candidate.stage === stageNumber);
    if (!stage) {
      throw new Error(`Rotten plan is missing Stage ${stageNumber}.`);
    }
    this.selectedRoute = stage.options[index];
    this.selectedEncounter = getRottenEncounterSpec(this.plan.seed, this.selectedRoute.id);
    this.trace.push(`route:${stageNumber}:${this.selectedRoute.id}`);
    this.startEncounter();
  }

  private startEncounter(): void {
    if (!this.selectedEncounter || !this.selectedWeapon || !this.selectedSkill) {
      return;
    }
    this.phase = "encounter";
    this.marketHealAutomationArmed = false;
    this.clearPhaseUi();
    const arena = createRottenArenaPresentation(this, this.selectedEncounter);
    this.platforms = arena.platforms;
    this.encounterPresentationObjects.push(...arena.objects);

    this.inputMapper = new InputMapper(this);
    const carriedHealth = this.selectedEncounter.stage === 1
      ? { current: 6, max: 6 }
      : this.pureState?.health;
    if (!carriedHealth) {
      throw new Error("A later Rotten encounter requires carried health.");
    }
    this.combatBuild = deriveRottenCombatBuild(
      this.pureState?.upgrades ?? [],
      this.selectedWeapon,
      this.selectedSkill,
    );
    const player = new Player(this, 200, 500, carriedHealth.max, {
      currentHealth: carriedHealth.current,
      movement: { dashCooldownMs: this.combatBuild.dash.cooldownMs },
    }).setDepth(10);
    this.combat = new RottenCombatController(
      this,
      player,
      this.platforms,
      this.combatBuild,
      arena.maxFloorBodyBottom,
      {
        onWaveCleared: () => this.handleWaveCleared(),
        onPlayerDead: () => this.enterDeadState(),
        onEliteDefeated: (variant, graft) => {
          this.eliteBountyGraft += graft;
          this.graft += graft;
          this.defeatedEliteVariants.push(variant);
          const defeatedRole = this.selectedEncounter?.waves
            .flat()
            .find((spawn) => spawn.eliteVariant === variant)?.roleId;
          if (defeatedRole) {
            this.defeatedEliteRoles.push(defeatedRole);
          }
        },
        onTrace: (event) => this.trace.push(event),
      },
      this.combatAutomationProfile,
    );
    this.encounterStartedAt = this.time.now - this.elapsedActiveMilliseconds;
    this.stageWavesCleared = 0;
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
    if (!this.combat || !this.selectedRoute || !this.selectedEncounter) {
      return;
    }
    const spawns = this.selectedEncounter.waves[wave - 1];
    const roles = spawns.map(({ roleId }) => roleId);
    const waveKey = this.selectedEncounter.stage === 1
      ? String(wave)
      : `${this.selectedEncounter.stage}.${wave}`;
    this.spawnHistory.push(`${waveKey}:${roles.join(",")}`);
    this.combat.spawnWave(spawns, wave);
    this.wave = wave;
    this.interwave = false;
    this.publishSnapshot();
  }

  private handleWaveCleared(): void {
    if (this.interwave || this.phase !== "encounter") {
      return;
    }
    this.wavesCleared += 1;
    this.stageWavesCleared += 1;
    this.killCount += this.selectedEncounter?.waves[this.wave - 1].length ?? 0;
    this.lastCombatDebug = this.combat?.debugState(this.time.now);
    this.trace.push(`wave-${this.selectedEncounter?.stage ?? 1}.${this.wave}:cleared`);
    this.interwave = true;
    this.interwaveText = this.track(this.add.text(GAME_WIDTH / 2, 310,
      this.wave === 1
        ? `STAGE ${this.selectedEncounter?.stage ?? 1} WAVE 1 CLEARED\nNEXT DOCKET INCOMING`
        : `STAGE ${this.selectedEncounter?.stage ?? 1} CLEARED\nREWARD DOCKET OPENING`, {
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
      this.lastCombatDebug = this.combat.destroy();
      this.combat = undefined;
    }
    this.destroyEncounterPresentation();
    const clearedStage = this.selectedEncounter?.stage;
    if (clearedStage !== 1 && clearedStage !== 2 && clearedStage !== 3) {
      throw new Error("A Rotten reward requires a completed operative stage.");
    }
    this.graft += this.selectedRoute.graftReward;
    if (this.poorMarketSmoke && clearedStage === 1) {
      this.graft = 4;
    }
    this.trace.push(`graft:stage-${clearedStage}:+${this.selectedRoute.graftReward}`);
    const carriedHealth = this.lastCombatDebug
      ? {
        current: this.lastCombatDebug.playerHealth,
        max: this.lastCombatDebug.playerMaxHealth,
      }
      : null;
    if (!this.selectedWeapon || !this.selectedSkill || !carriedHealth) {
      throw new Error(`Stage ${clearedStage} reward requires carried loadout and health state.`);
    }
    this.pureState = createRottenRewardMarket({
      plan: this.plan,
      stage: clearedStage,
      routeId: this.selectedRoute.id,
      weapon: this.selectedWeapon,
      skill: this.selectedSkill,
      health: carriedHealth,
      graft: this.graft,
      ownedUpgrades: this.pureState?.upgrades ?? [],
      routeHistory: this.pureState?.routeHistory ?? [],
      trace: this.trace,
    });
    this.offers = this.pureState.market?.offers ?? [];
    this.trace.length = 0;
    this.trace.push(...this.pureState.trace);
    this.phase = "reward-choice";
    this.interwave = false;
    this.inputLockedUntil = this.time.now + 280;
    this.rewardFeedback = "";
    this.rewardFeedbackReason = "";
    this.renderRewardChoice();
    this.publishSnapshot();
  }

  private handleRewardInput(number: number): void {
    if (!this.pureState) {
      return;
    }
    const result = applyRottenRewardInput(this.pureState, number);
    this.rewardFeedback = result.feedback;
    this.rewardFeedbackReason = result.reason;
    if (!result.accepted) {
      this.renderRewardChoice();
      this.publishSnapshot();
      return;
    }

    this.pureState = result.state;
    this.phase = result.state.phase;
    this.graft = result.state.graft;
    this.offers = [];
    this.trace.length = 0;
    this.trace.push(...result.state.trace);
    this.selectedRoute = null;
    this.selectedEncounter = undefined;
    this.combatBuild = undefined;
    this.routeDocketAwaitingNumericRelease = this.phase === "route-choice";
    if (this.phase === "boss") {
      this.renderCommissionerDossier();
    } else {
      this.renderCurrentRouteDocket(false);
    }
    this.publishSnapshot();
  }

  private renderRewardChoice(): void {
    this.clearPhaseUi();
    if (!this.pureState?.health || !this.pureState.market || !this.selectedRoute) {
      return;
    }
    this.phaseObjects.push(...renderRottenMarketPresentation(this, {
      stage: this.pureState.market.stage,
      route: this.selectedRoute,
      offers: this.offers,
      health: this.pureState.health,
      graft: this.graft,
      feedback: this.rewardFeedback,
      healCost: ROTTEN_MARKET_HEAL_COST,
    }));
  }

  private describeCarriedDocket(): string {
    if (!this.pureState?.health || !this.pureState.weapon || !this.pureState.skill) {
      return "CARRIED RUN STATE UNAVAILABLE";
    }
    const upgrades = this.pureState.upgrades.length > 0
      ? this.pureState.upgrades.map((id) => ROTTEN_UPGRADES[id].name).join(", ")
      : "None yet";
    const history = this.pureState.routeHistory.map((entry) =>
      `S${entry.stage} ${entry.routeId} / ${describeRottenMarketChoice(entry.marketChoice)}`
    ).join("  •  ");
    const build = this.pureState.buildSummary;
    return `CARRIED  ${ROTTEN_WEAPONS[this.pureState.weapon].name.toUpperCase()} + ${ROTTEN_SKILLS[this.pureState.skill].name.toUpperCase()}`
      + `  •  HP ${this.pureState.health.current}/${this.pureState.health.max}  •  PURSE ${this.pureState.graft}\n`
      + `ROUTES  ${history}\n`
      + `OWNED  ${upgrades}  •  BUILD HP+${build.maxHealthBonus} / HEAL ${build.healPerClearedWave} / DISCOUNT ${build.marketDiscount}`
      + `  •  ELITE BOUNTY ${this.eliteBountyGraft} (${this.defeatedEliteVariants.join(",") || "none"})`;
  }

  private renderCommissionerDossier(): void {
    this.clearPhaseUi();
    const state = this.pureState;
    if (
      !state?.bossDossierReady
      || state.phase !== "boss"
      || !state.bossId
      || !state.health
      || !state.weapon
      || !state.skill
    ) {
      throw new Error("The Commissioner dossier requires a complete carried boss boundary.");
    }
    const routeHistory = state.routeHistory
      .map(({ stage, routeId }) => `S${stage} ${routeId}`)
      .join("  •  ");
    const marketHistory = state.routeHistory
      .map(({ stage, marketChoice }) => `S${stage} ${describeRottenMarketChoice(marketChoice)}`)
      .join("  •  ");
    const upgrades = state.upgrades.length > 0
      ? state.upgrades.map((id) => ROTTEN_UPGRADES[id].name).join(", ")
      : "No upgrades purchased";
    const build = state.buildSummary;
    const buildTruth = `HP+${build.maxHealthBonus}  WAVE HEAL ${build.healPerClearedWave}  `
      + `DISCOUNT ${build.marketDiscount}  PATTERN ${build.weaponPatternRepeatOrPierce ? "MODIFIED" : "BASE"}`;
    const traceDigest = hashDeterministicText(this.trace.join("|"))
      .toString(16)
      .padStart(8, "0")
      .toUpperCase();
    const eliteHistory = this.defeatedEliteVariants.length > 0
      ? this.defeatedEliteVariants.map((variant, index) =>
        `${this.defeatedEliteRoles[index] ?? "unknown"}(${variant})`).join(", ")
      : "none";
    this.phaseObjects.push(...renderRottenCommissionerDossier(this, {
      seed: state.seed,
      planId: state.planId,
      bossName: state.bossId.replaceAll("-", " "),
      activeMilliseconds: this.elapsedActiveMilliseconds,
      health: state.health,
      graft: state.graft,
      loadout: `${ROTTEN_WEAPONS[state.weapon].name} + ${ROTTEN_SKILLS[state.skill].name}`,
      routeHistory,
      marketHistory,
      upgrades,
      build: buildTruth,
      kills: this.killCount,
      eliteHistory,
      eliteBounty: this.eliteBountyGraft,
      traceDigest,
    }));
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
    this.selectedEncounter = undefined;
    this.combatBuild = undefined;
    this.offers = [];
    this.pureState = retryRottenRunSameSeed(
      this.pureState ?? createRottenRunBaseline(this.plan),
    );
    this.graft = this.pureState.graft;
    this.wave = 0;
    this.stageWavesCleared = 0;
    this.wavesCleared = 0;
    this.spawnHistory.length = 0;
    this.trace.length = 0;
    this.trace.push(...this.pureState.trace);
    this.lastCombatDebug = undefined;
    this.encounterStartedAt = 0;
    this.elapsedActiveMilliseconds = 0;
    this.interwave = false;
    this.interwaveText = undefined;
    this.hudText = undefined;
    this.waveText = undefined;
    this.lastSnapshotAt = 0;
    this.marketHealAutomationArmed = false;
    this.inputLockedUntil = this.time.now + 250;
    this.rewardFeedback = "";
    this.rewardFeedbackReason = "";
    this.eliteBountyGraft = 0;
    this.defeatedEliteVariants.length = 0;
    this.defeatedEliteRoles.length = 0;
    this.killCount = 0;
    this.clearNumericInputState();
    this.renderLoadout();
    this.publishSnapshot();
  }

  private updateCombatHud(debug: RottenCombatDebugState): void {
    if (!this.hudText || !this.waveText) {
      return;
    }
    this.waveText.setText(
      `STAGE ${this.selectedEncounter?.stage ?? 1}  •  ${this.selectedRoute!.name.toUpperCase()}  •  WAVE ${this.wave}/2`,
    );
    const weaponStatus = debug.weaponRecovering
      ? `HEAT ${debug.weaponHeat}/4 — RECOVERING`
      : `ATTACKS ${debug.attackCount}  HITS ${debug.attackHitCount}`;
    this.hudText.setText(
      `HP ${debug.playerHealth}/${debug.playerMaxHealth}  •  GRAFT ${this.graft}\n`
      + `${ROTTEN_WEAPONS[this.selectedWeapon!].name}: ${weaponStatus}\n`
      + `${ROTTEN_SKILLS[this.selectedSkill!].name}: USES ${debug.skillUseCount}  HITS ${debug.skillHitCount}  ${debug.skillReady ? "READY" : "COOLING"}\n`
      + `ENEMIES ${debug.livingEnemies}  •  BUILD +${debug.compoundBonusDamage} COMPOUND / ${debug.grudgeRemainingMs}MS GRUDGE\n`
      + `SHIELD B${debug.shieldBlockCount}/O${debug.shieldOpenCount}  •  HAZARD T${debug.hazardTelegraphCount}/A${debug.hazardActivationCount}/H${debug.hazardHitCount}/C${debug.hazardClearCount}`,
    );
  }

  private publishSnapshot(): void {
    const pureState = this.pureState ?? createRottenRunBaseline(this.plan);
    const routeOptions = [...pureState.routeOptions] as [
      RottenRouteDefinition["id"],
      RottenRouteDefinition["id"],
    ];
    const debug = this.combat?.debugState(this.time.now) ?? this.lastCombatDebug;
    const health = debug && (this.phase === "encounter" || this.phase === "dead")
      ? { current: debug.playerHealth, max: debug.playerMaxHealth }
      : pureState.health && (this.phase === "reward-choice" || pureState.stage >= 2)
        ? pureState.health
        : null;
    const activeMarket = this.phase === "reward-choice" && pureState.market?.status === "open"
      ? pureState.market
      : null;
    const marketChoice = describeRottenMarketChoice(pureState.market?.acceptedChoice ?? null);
    const traceDigest = hashDeterministicText(this.trace.join("|")).toString(16).padStart(8, "0").toUpperCase();
    const snapshot: RottenRunDebugSnapshot = {
      scene: "RottenRunScene",
      phase: this.phase,
      schemaVersion: this.plan.schemaVersion,
      seed: this.plan.seed,
      planId: this.plan.planId,
      stage: pureState.stage,
      routeOptions,
      selectedRoute: this.selectedRoute?.id ?? null,
      weapon: pureState.weapon ?? this.selectedWeapon,
      skill: pureState.skill ?? this.selectedSkill,
      upgrades: [...pureState.upgrades],
      buildSummary: pureState.buildSummary,
      graft: this.graft,
      hp: health,
      livingEnemies: this.phase === "reward-choice" || this.phase === "loadout" || this.phase === "route-choice"
        ? 0
        : debug?.livingEnemies ?? 0,
      eliteCount: debug?.eliteCount ?? 0,
      currentEliteCount: debug?.currentEliteCount ?? 0,
      eliteDefeatedCount: debug?.eliteDefeatedCount ?? this.defeatedEliteVariants.length,
      eliteDefeatedVariants: debug?.eliteDefeatedVariants ?? [...this.defeatedEliteVariants],
      eliteDefeatedRoles: [...this.defeatedEliteRoles],
      eliteBountyGraft: this.eliteBountyGraft,
      eliteArmorBreakCount: debug?.eliteArmorBreakCount ?? 0,
      eliteEnrageCount: debug?.eliteEnrageCount ?? 0,
      bossHealth: null,
      bossPhase: null,
      bossId: pureState.bossId,
      bossDossierReady: pureState.bossDossierReady,
      bossObjectCount: 0,
      elapsedActiveMilliseconds: this.elapsedActiveMilliseconds,
      result: null,
      killCount: this.killCount,
      traceDigest,
      wave: this.wave,
      stageWavesCleared: this.stageWavesCleared,
      wavesCleared: this.wavesCleared,
      spawnHistory: [...this.spawnHistory],
      enemyStates: debug?.enemyStates.map(({
        role,
        state,
        health: enemyHealth,
        eliteVariant,
        armorPips,
        enraged,
        shieldState,
      }) => `${role}:${state}:${enemyHealth}:${eliteVariant ?? "none"}:${armorPips}:${enraged ? 1 : 0}:${shieldState}`) ?? [],
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
      skillCooldownMs: debug?.skillCooldownMs ?? this.combatBuild?.skillCooldownMs ?? 0,
      skillReady: debug?.skillReady ?? false,
      grudgeRemainingMs: debug?.grudgeRemainingMs ?? 0,
      maxGrudgeBonusDamage: debug?.maxGrudgeBonusDamage ?? 0,
      compoundBonusDamage: debug?.compoundBonusDamage ?? 0,
      maxCompoundBonusDamage: debug?.maxCompoundBonusDamage ?? 0,
      maxTotalWeaponBonusDamage: debug?.maxTotalWeaponBonusDamage ?? 0,
      compoundExpiresInMs: debug?.compoundExpiresInMs ?? 0,
      dashCooldownMs: debug?.dashCooldownMs ?? this.combatBuild?.dash.cooldownMs ?? 520,
      dashWakeCount: debug?.dashWakeCount ?? 0,
      dashWakeHitCount: debug?.dashWakeHitCount ?? 0,
      deadLetterCount: debug?.deadLetterCount ?? 0,
      deadLetterHitCount: debug?.deadLetterHitCount ?? 0,
      waveHealCount: debug?.waveHealCount ?? 0,
      waveHealRestored: debug?.waveHealRestored ?? 0,
      shieldBlockCount: debug?.shieldBlockCount ?? 0,
      shieldFlankHitCount: debug?.shieldFlankHitCount ?? 0,
      shieldOpenCount: debug?.shieldOpenCount ?? 0,
      shieldOpenSources: debug?.shieldOpenSources ?? [],
      hazardTelegraphCount: debug?.hazardTelegraphCount ?? 0,
      hazardActiveCount: debug?.hazardActiveCount ?? 0,
      hazardActivationCount: debug?.hazardActivationCount ?? 0,
      hazardHitCount: debug?.hazardHitCount ?? 0,
      hazardClearCount: debug?.hazardClearCount ?? 0,
      hazardExpiryCount: debug?.hazardExpiryCount ?? 0,
      hazardTeardownCount: debug?.hazardTeardownCount ?? 0,
      offerIds: activeMarket?.offers.map(({ id }) => id) ?? [],
      offerPrices: activeMarket?.offers.map(({ effectivePrice }) => effectivePrice) ?? [],
      healAvailable: Boolean(
        activeMarket
        && health
        && health.current < health.max
        && this.graft >= ROTTEN_MARKET_HEAL_COST
      ),
      marketStatus: pureState.market?.status ?? "",
      marketStage: pureState.market?.stage ?? null,
      marketRoute: pureState.market?.routeId ?? null,
      marketChoice,
      marketTraceEvent: pureState.market?.traceEvent ?? "",
      routeHistory: pureState.routeHistory.map((entry) =>
        `${entry.stage}:${entry.routeId}:${describeRottenMarketChoice(entry.marketChoice) || "pending"}`
      ),
      rewardFeedback: this.rewardFeedback,
      rewardFeedbackReason: this.rewardFeedbackReason,
      rewardDecisionCount: Math.min(
        3,
        pureState.routeHistory.filter(({ marketChoice: choice }) => Boolean(choice)).length,
      ) as 0 | 1 | 2 | 3,
      combatObjectCount:
        (this.combat ? debug?.combatObjectCount ?? 0 : 0) + this.countEncounterPresentationObjects(),
      canvasCount: document.querySelectorAll("canvas").length,
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
    document.body.dataset.rottenCurrentEliteCount = String(snapshot.currentEliteCount);
    document.body.dataset.rottenEliteDefeatedCount = String(snapshot.eliteDefeatedCount);
    document.body.dataset.rottenEliteDefeatedVariants = snapshot.eliteDefeatedVariants.join("|");
    document.body.dataset.rottenEliteDefeatedRoles = snapshot.eliteDefeatedRoles.join("|");
    document.body.dataset.rottenEliteBountyGraft = String(snapshot.eliteBountyGraft);
    document.body.dataset.rottenEliteArmorBreakCount = String(snapshot.eliteArmorBreakCount);
    document.body.dataset.rottenEliteEnrageCount = String(snapshot.eliteEnrageCount);
    document.body.dataset.rottenBossHealth = snapshot.bossHealth ?? "";
    document.body.dataset.rottenBossPhase = snapshot.bossPhase ?? "";
    document.body.dataset.rottenBossId = snapshot.bossId ?? "";
    document.body.dataset.rottenBossDossierReady = String(snapshot.bossDossierReady);
    document.body.dataset.rottenBossObjectCount = String(snapshot.bossObjectCount);
    document.body.dataset.rottenElapsedActiveMilliseconds = String(snapshot.elapsedActiveMilliseconds);
    document.body.dataset.rottenResult = snapshot.result ?? "";
    document.body.dataset.rottenKillCount = String(snapshot.killCount);
    document.body.dataset.rottenTraceDigest = snapshot.traceDigest;
    document.body.dataset.rottenWave = String(snapshot.wave);
    document.body.dataset.rottenStageWavesCleared = String(snapshot.stageWavesCleared);
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
    document.body.dataset.rottenSkillCooldownMs = String(snapshot.skillCooldownMs);
    document.body.dataset.rottenSkillReady = String(snapshot.skillReady);
    document.body.dataset.rottenGrudgeRemainingMs = String(snapshot.grudgeRemainingMs);
    document.body.dataset.rottenMaxGrudgeBonusDamage = String(snapshot.maxGrudgeBonusDamage);
    document.body.dataset.rottenCompoundBonusDamage = String(snapshot.compoundBonusDamage);
    document.body.dataset.rottenMaxCompoundBonusDamage = String(snapshot.maxCompoundBonusDamage);
    document.body.dataset.rottenMaxTotalWeaponBonusDamage = String(snapshot.maxTotalWeaponBonusDamage);
    document.body.dataset.rottenCompoundExpiresInMs = String(snapshot.compoundExpiresInMs);
    document.body.dataset.rottenDashCooldownMs = String(snapshot.dashCooldownMs);
    document.body.dataset.rottenDashWakeCount = String(snapshot.dashWakeCount);
    document.body.dataset.rottenDashWakeHitCount = String(snapshot.dashWakeHitCount);
    document.body.dataset.rottenDeadLetterCount = String(snapshot.deadLetterCount);
    document.body.dataset.rottenDeadLetterHitCount = String(snapshot.deadLetterHitCount);
    document.body.dataset.rottenWaveHealCount = String(snapshot.waveHealCount);
    document.body.dataset.rottenWaveHealRestored = String(snapshot.waveHealRestored);
    document.body.dataset.rottenShieldBlockCount = String(snapshot.shieldBlockCount);
    document.body.dataset.rottenShieldFlankHitCount = String(snapshot.shieldFlankHitCount);
    document.body.dataset.rottenShieldOpenCount = String(snapshot.shieldOpenCount);
    document.body.dataset.rottenShieldOpenSources = snapshot.shieldOpenSources.join("|");
    document.body.dataset.rottenHazardTelegraphCount = String(snapshot.hazardTelegraphCount);
    document.body.dataset.rottenHazardActiveCount = String(snapshot.hazardActiveCount);
    document.body.dataset.rottenHazardActivationCount = String(snapshot.hazardActivationCount);
    document.body.dataset.rottenHazardHitCount = String(snapshot.hazardHitCount);
    document.body.dataset.rottenHazardClearCount = String(snapshot.hazardClearCount);
    document.body.dataset.rottenHazardExpiryCount = String(snapshot.hazardExpiryCount);
    document.body.dataset.rottenHazardTeardownCount = String(snapshot.hazardTeardownCount);
    document.body.dataset.rottenOfferIds = snapshot.offerIds.join("|");
    document.body.dataset.rottenOfferPrices = snapshot.offerPrices.join("|");
    document.body.dataset.rottenHealAvailable = String(snapshot.healAvailable);
    document.body.dataset.rottenMarketStatus = snapshot.marketStatus;
    document.body.dataset.rottenMarketStage = snapshot.marketStage === null
      ? ""
      : String(snapshot.marketStage);
    document.body.dataset.rottenMarketRoute = snapshot.marketRoute ?? "";
    document.body.dataset.rottenMarketChoice = snapshot.marketChoice;
    document.body.dataset.rottenMarketTraceEvent = snapshot.marketTraceEvent;
    document.body.dataset.rottenRouteHistory = snapshot.routeHistory.join("|");
    document.body.dataset.rottenRewardFeedback = snapshot.rewardFeedback;
    document.body.dataset.rottenRewardFeedbackReason = snapshot.rewardFeedbackReason;
    document.body.dataset.rottenRewardDecisionCount = String(snapshot.rewardDecisionCount);
    document.body.dataset.rottenBuildSummary = JSON.stringify(snapshot.buildSummary);
    document.body.dataset.rottenCombatObjectCount = String(snapshot.combatObjectCount);
    document.body.dataset.rottenCanvasCount = String(snapshot.canvasCount);
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

  private bindKeyboard(event: string, handler: () => void): void {
    this.keyboardBindings.push({ event, handler });
    this.input.keyboard?.on(event, handler);
  }

  private clearNumericInputState(): void {
    this.heldNumericKeys.clear();
    this.routeDocketAwaitingNumericRelease = false;
  }

  private releaseNumericKeyboardBindings(): void {
    if (this.numericKeyDownBinding) {
      window.removeEventListener("keydown", this.numericKeyDownBinding);
      this.numericKeyDownBinding = undefined;
    }
    if (this.numericKeyUpBinding) {
      window.removeEventListener("keyup", this.numericKeyUpBinding);
      this.numericKeyUpBinding = undefined;
    }
  }

  private releaseKeyboardBindings(): void {
    for (const { event, handler } of this.keyboardBindings) {
      this.input.keyboard?.off(event, handler);
    }
    this.keyboardBindings.length = 0;
  }

  private shutdownSceneRuntime(): void {
    this.releaseKeyboardBindings();
    this.releaseNumericKeyboardBindings();
    this.clearNumericInputState();
    this.combat?.destroy();
    this.combat = undefined;
    this.destroyEncounterPresentation();
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
